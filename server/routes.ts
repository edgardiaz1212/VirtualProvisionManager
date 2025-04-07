import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertVirtualMachineSchema, insertClientSchema, InsertUser, insertHypervisorSchema } from "@shared/schema";
import { createVmOnProxmox } from "./lib/proxmox";
import { createVmOnVcenter } from "./lib/vcenter";
import { setupAuth } from "./auth";
import bcrypt from "bcrypt";

// Authentication middleware
function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Authentication required" });
}

// Role-based middleware
function hasRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    const user = req.user as Express.User;
    if (!roles.includes(user.role)) {
      return res.status(403).json({ error: `Required role: ${roles.join(' or ')}` });
    }
    
    next();
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);
  
  // API routes with authentication (these routes require authentication)
  app.get("/api/plans", isAuthenticated, async (req, res) => {
    try {
      const plans = await storage.getPlans();
      res.json(plans);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch plans" });
    }
  });

  app.get("/api/virtual-machines", isAuthenticated, async (req, res) => {
    try {
      const vms = await storage.getVirtualMachines();
      res.json(vms);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch virtual machines" });
    }
  });

  app.get("/api/virtual-machines/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      const vm = await storage.getVirtualMachine(id);
      if (!vm) {
        return res.status(404).json({ message: "Virtual machine not found" });
      }
      
      res.json(vm);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch virtual machine" });
    }
  });

  app.post("/api/virtual-machines", isAuthenticated, async (req, res) => {
    try {
      // Validate request body
      const validationResult = insertVirtualMachineSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid request data", 
          errors: validationResult.error.errors 
        });
      }

      const vmData = validationResult.data;
      
      // Set current timestamp
      const timestamp = new Date().toISOString();
      
      // Create VM in storage with authenticated user
      const userId = (req.user as Express.User).id;
      
      // Note: status is handled by default in the database schema
      const createdVm = await storage.createVirtualMachine(vmData, userId);
      
      // Based on hypervisor type, create VM on the appropriate system
      let hypervisorResponse;
      if (vmData.hypervisorType === "proxmox") {
        hypervisorResponse = await createVmOnProxmox(vmData);
      } else if (vmData.hypervisorType === "vcenter") {
        hypervisorResponse = await createVmOnVcenter(vmData);
      } else {
        throw new Error(`Unsupported hypervisor type: ${vmData.hypervisorType}`);
      }
      
      // Update VM status based on hypervisor response
      const updatedVm = await storage.updateVirtualMachineStatus(
        createdVm.id, 
        hypervisorResponse.success ? "running" : "error"
      );
      
      res.status(201).json({
        id: updatedVm.id,
        name: updatedVm.name,
        status: updatedVm.status,
        message: hypervisorResponse.message
      });
    } catch (error) {
      console.error("VM creation error:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to create virtual machine" 
      });
    }
  });

  // Admin routes for user management
  app.get("/api/admin/users", hasRole(["admin"]), async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      
      // Remove passwords from response
      const usersWithoutPasswords = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      res.json(usersWithoutPasswords);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.post("/api/admin/users", hasRole(["admin"]), async (req, res) => {
    try {
      const { username, password, fullName, email, role } = req.body;
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }
      
      // Hash password with bcrypt
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Create user
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        fullName: fullName || null,
        email: email || null,
        role: role || "operator"
      });
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  app.put("/api/admin/users/:id", hasRole(["admin"]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }
      
      // Check if user exists
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const { username, password, fullName, email, role } = req.body;
      
      // If username is being changed, check if new username already exists
      if (username && username !== user.username) {
        const existingUser = await storage.getUserByUsername(username);
        if (existingUser) {
          return res.status(400).json({ error: "Username already exists" });
        }
      }
      
      // Update user data
      const userData: Partial<InsertUser> = {};
      
      if (username) userData.username = username;
      if (fullName !== undefined) userData.fullName = fullName;
      if (email !== undefined) userData.email = email;
      if (role) userData.role = role;
      
      // Hash password if provided
      if (password) {
        const salt = await bcrypt.genSalt(10);
        userData.password = await bcrypt.hash(password, salt);
      }
      
      const updatedUser = await storage.updateUser(id, userData);
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = updatedUser;
      
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  app.delete("/api/admin/users/:id", hasRole(["admin"]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }
      
      // Check if user exists
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Prevent deleting the current user
      if (id === (req.user as Express.User).id) {
        return res.status(400).json({ error: "Cannot delete your own account" });
      }
      
      await storage.deleteUser(id);
      
      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ error: "Failed to delete user" });
    }
  });
  
  // Client management routes
  app.get("/api/clients", isAuthenticated, async (req, res) => {
    try {
      const clients = await storage.getAllClients();
      res.json(clients);
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.status(500).json({ error: "Failed to fetch clients" });
    }
  });

  app.get("/api/clients/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }
      
      const client = await storage.getClient(id);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }
      
      res.json(client);
    } catch (error) {
      console.error("Error fetching client:", error);
      res.status(500).json({ error: "Failed to fetch client" });
    }
  });

  app.post("/api/clients", hasRole(["admin", "operator"]), async (req, res) => {
    try {
      // Validate request body
      const validationResult = insertClientSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid client data", 
          details: validationResult.error.errors 
        });
      }

      const clientData = validationResult.data;
      
      // Check if client with same name already exists
      const existingClient = await storage.getClientByName(clientData.name);
      if (existingClient) {
        return res.status(400).json({ error: "Client with this name already exists" });
      }
      
      const client = await storage.createClient(clientData);
      
      res.status(201).json(client);
    } catch (error) {
      console.error("Error creating client:", error);
      res.status(500).json({ error: "Failed to create client" });
    }
  });

  app.put("/api/clients/:id", hasRole(["admin", "operator"]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }
      
      // Check if client exists
      const client = await storage.getClient(id);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }
      
      // Validate request body
      const validationResult = insertClientSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid client data", 
          details: validationResult.error.errors 
        });
      }
      
      const clientData = validationResult.data;
      
      // If name is being changed, check if new name already exists
      if (clientData.name && clientData.name !== client.name) {
        const existingClient = await storage.getClientByName(clientData.name);
        if (existingClient) {
          return res.status(400).json({ error: "Client with this name already exists" });
        }
      }
      
      const updatedClient = await storage.updateClient(id, clientData);
      
      res.json(updatedClient);
    } catch (error) {
      console.error("Error updating client:", error);
      res.status(500).json({ error: "Failed to update client" });
    }
  });

  app.delete("/api/clients/:id", hasRole(["admin"]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }
      
      // Check if client exists
      const client = await storage.getClient(id);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }
      
      // Check if client has virtual machines
      const vms = await storage.getVirtualMachinesByClient(id);
      if (vms.length > 0) {
        return res.status(400).json({ 
          error: "Cannot delete client with associated virtual machines",
          count: vms.length
        });
      }
      
      await storage.deleteClient(id);
      
      res.status(200).json({ message: "Client deleted successfully" });
    } catch (error) {
      console.error("Error deleting client:", error);
      res.status(500).json({ error: "Failed to delete client" });
    }
  });
  
  // Hypervisor management routes
  app.get("/api/hypervisors", isAuthenticated, async (req, res) => {
    try {
      const hypervisors = await storage.getHypervisors();
      
      // Remove sensitive information
      const sanitizedHypervisors = hypervisors.map(h => {
        const { password, apiToken, ...rest } = h;
        return {
          ...rest,
          hasPassword: !!password,
          hasToken: !!apiToken
        };
      });
      
      res.json(sanitizedHypervisors);
    } catch (error) {
      console.error("Error fetching hypervisors:", error);
      res.status(500).json({ error: "Failed to fetch hypervisors" });
    }
  });
  
  app.get("/api/hypervisors/:id", hasRole(["admin", "operator"]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }
      
      const hypervisor = await storage.getHypervisor(id);
      if (!hypervisor) {
        return res.status(404).json({ error: "Hypervisor not found" });
      }
      
      // Remove sensitive information
      const { password, apiToken, ...sanitizedHypervisor } = hypervisor;
      
      res.json({
        ...sanitizedHypervisor,
        hasPassword: !!password,
        hasToken: !!apiToken
      });
    } catch (error) {
      console.error("Error fetching hypervisor:", error);
      res.status(500).json({ error: "Failed to fetch hypervisor" });
    }
  });
  
  app.post("/api/hypervisors", hasRole(["admin"]), async (req, res) => {
    try {
      // Validate request body
      const validationResult = insertHypervisorSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid hypervisor data", 
          details: validationResult.error.errors 
        });
      }
      
      const hypervisorData = validationResult.data;
      
      // Create hypervisor
      const hypervisor = await storage.createHypervisor(hypervisorData);
      
      // Remove sensitive information
      const { password, apiToken, ...sanitizedHypervisor } = hypervisor;
      
      res.status(201).json({
        ...sanitizedHypervisor,
        hasPassword: !!password,
        hasToken: !!apiToken
      });
    } catch (error) {
      console.error("Error creating hypervisor:", error);
      res.status(500).json({ error: "Failed to create hypervisor" });
    }
  });
  
  app.put("/api/hypervisors/:id", hasRole(["admin"]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }
      
      // Check if hypervisor exists
      const hypervisor = await storage.getHypervisor(id);
      if (!hypervisor) {
        return res.status(404).json({ error: "Hypervisor not found" });
      }
      
      // Validate request body
      const validationResult = insertHypervisorSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid hypervisor data", 
          details: validationResult.error.errors 
        });
      }
      
      const hypervisorData = validationResult.data;
      
      // Update hypervisor
      const updatedHypervisor = await storage.updateHypervisor(id, hypervisorData);
      
      // Remove sensitive information
      const { password, apiToken, ...sanitizedHypervisor } = updatedHypervisor;
      
      res.json({
        ...sanitizedHypervisor,
        hasPassword: !!password,
        hasToken: !!apiToken
      });
    } catch (error) {
      console.error("Error updating hypervisor:", error);
      res.status(500).json({ error: "Failed to update hypervisor" });
    }
  });
  
  app.delete("/api/hypervisors/:id", hasRole(["admin"]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }
      
      // Check if hypervisor exists
      const hypervisor = await storage.getHypervisor(id);
      if (!hypervisor) {
        return res.status(404).json({ error: "Hypervisor not found" });
      }
      
      // Check if hypervisor has virtual machines
      const vms = await storage.getVirtualMachines();
      const hypervisorVms = vms.filter(vm => vm.hypervisorId === id);
      
      if (hypervisorVms.length > 0) {
        return res.status(400).json({ 
          error: "Cannot delete hypervisor with associated virtual machines",
          count: hypervisorVms.length
        });
      }
      
      await storage.deleteHypervisor(id);
      
      res.status(200).json({ message: "Hypervisor deleted successfully" });
    } catch (error) {
      console.error("Error deleting hypervisor:", error);
      res.status(500).json({ error: "Failed to delete hypervisor" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
