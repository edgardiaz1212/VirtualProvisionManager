import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertVirtualMachineSchema } from "@shared/schema";
import { createVmOnProxmox } from "./lib/proxmox";
import { createVmOnVcenter } from "./lib/vcenter";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for VM creation
  app.get("/api/plans", async (req, res) => {
    try {
      const plans = await storage.getPlans();
      res.json(plans);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch plans" });
    }
  });

  app.get("/api/virtual-machines", async (req, res) => {
    try {
      const vms = await storage.getVirtualMachines();
      res.json(vms);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch virtual machines" });
    }
  });

  app.get("/api/virtual-machines/:id", async (req, res) => {
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

  app.post("/api/virtual-machines", async (req, res) => {
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
      
      // Create VM in storage first with "creating" status
      const createdVm = await storage.createVirtualMachine({
        ...vmData,
        status: "creating",
        createdAt: timestamp
      });
      
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

  const httpServer = createServer(app);
  return httpServer;
}
