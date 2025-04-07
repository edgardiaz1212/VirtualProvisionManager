import { 
  User,
  InsertUser, 
  VirtualMachine,
  InsertVirtualMachine,
  Plan, 
  InsertPlan,
  Hypervisor,
  InsertHypervisor,
  Client,
  InsertClient,
  predefinedPlans
} from "@shared/schema";
import session from "express-session";
import MemoryStore from "memorystore";

// Storage interface
export interface IStorage {
  // Session store for authentication
  sessionStore: session.Store;
  
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<InsertUser>): Promise<User>;
  getAllUsers(): Promise<User[]>;
  deleteUser(id: number): Promise<void>;
  
  // Client methods
  getClient(id: number): Promise<Client | undefined>;
  getClientByName(name: string): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, clientData: Partial<InsertClient>): Promise<Client>;
  getAllClients(): Promise<Client[]>;
  deleteClient(id: number): Promise<void>;
  
  // VM-related methods
  getPlans(): Promise<Plan[]>;
  getPlan(id: number): Promise<Plan | undefined>;
  createPlan(plan: InsertPlan): Promise<Plan>;
  updatePlan(id: number, planData: Partial<InsertPlan>): Promise<Plan>;
  deletePlan(id: number): Promise<void>;
  
  // Virtual Machine methods
  getVirtualMachines(): Promise<VirtualMachine[]>;
  getVirtualMachinesByClient(clientId: number): Promise<VirtualMachine[]>;
  getVirtualMachinesByUser(userId: number): Promise<VirtualMachine[]>;
  getVirtualMachine(id: number): Promise<VirtualMachine | undefined>;
  createVirtualMachine(vm: InsertVirtualMachine, userId: number): Promise<VirtualMachine>;
  updateVirtualMachine(id: number, vmData: Partial<InsertVirtualMachine>): Promise<VirtualMachine>;
  updateVirtualMachineStatus(id: number, status: string): Promise<VirtualMachine>;
  deleteVirtualMachine(id: number): Promise<void>;
  
  // Hypervisor methods
  getHypervisors(): Promise<Hypervisor[]>;
  getHypervisor(id: number): Promise<Hypervisor | undefined>;
  getHypervisorByType(type: string): Promise<Hypervisor | undefined>;
  createHypervisor(hypervisor: InsertHypervisor): Promise<Hypervisor>;
  updateHypervisor(id: number, hypervisorData: Partial<InsertHypervisor>): Promise<Hypervisor>;
  deleteHypervisor(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private clients: Map<number, Client>;
  private virtualMachines: Map<number, VirtualMachine>;
  private plans: Map<number, Plan>;
  private hypervisors: Map<number, Hypervisor>;
  private userIdCounter: number;
  private clientIdCounter: number;
  private vmIdCounter: number;
  private hypervisorIdCounter: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.clients = new Map();
    this.virtualMachines = new Map();
    this.plans = new Map();
    this.hypervisors = new Map();
    
    this.userIdCounter = 1;
    this.clientIdCounter = 1;
    this.vmIdCounter = 1;
    this.hypervisorIdCounter = 1;
    
    // Initialize with predefined plans
    predefinedPlans.forEach(plan => {
      this.plans.set(plan.id, plan);
    });
    
    // Add sample hypervisors
    this.hypervisors.set(1, {
      id: 1,
      name: "Proxmox Cluster",
      type: "proxmox",
      apiUrl: "https://proxmox.example.com/api",
      username: "root",
      password: "password",
      authType: "credentials",
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Hypervisor);
    
    this.hypervisors.set(2, {
      id: 2,
      name: "vCenter 6.7",
      type: "vcenter",
      apiUrl: "https://vcenter.example.com/api",
      username: "administrator@vsphere.local",
      password: "password",
      version: "6.7",
      authType: "credentials",
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Hypervisor);
    
    // Initialize session store
    const MemStore = MemoryStore(session);
    this.sessionStore = new MemStore({
      checkPeriod: 86400000 // prune expired sessions daily
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: now,
      updatedAt: now,
      role: insertUser.role || "operator",
      fullName: insertUser.fullName || null,
      email: insertUser.email || null
    };
    this.users.set(id, user);
    return user;
  }
  
  // Add new user methods
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }
    
    const updatedUser = { 
      ...user, 
      ...userData,
      updatedAt: new Date()
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  async deleteUser(id: number): Promise<void> {
    this.users.delete(id);
  }
  
  // Client methods
  async getClient(id: number): Promise<Client | undefined> {
    return this.clients.get(id);
  }
  
  async getClientByName(name: string): Promise<Client | undefined> {
    return Array.from(this.clients.values()).find(
      (client) => client.name === name
    );
  }
  
  async createClient(client: InsertClient): Promise<Client> {
    const id = this.clientIdCounter++;
    const now = new Date();
    const newClient: Client = {
      ...client,
      id,
      createdAt: now,
      email: client.email || null,
      contactName: client.contactName || null,
      phone: client.phone || null,
      department: client.department || null,
      notes: client.notes || null
    };
    this.clients.set(id, newClient);
    return newClient;
  }
  
  async updateClient(id: number, clientData: Partial<InsertClient>): Promise<Client> {
    const client = await this.getClient(id);
    if (!client) {
      throw new Error(`Client with ID ${id} not found`);
    }
    
    const updatedClient = { ...client, ...clientData };
    this.clients.set(id, updatedClient);
    return updatedClient;
  }
  
  async getAllClients(): Promise<Client[]> {
    return Array.from(this.clients.values());
  }
  
  async deleteClient(id: number): Promise<void> {
    this.clients.delete(id);
  }
  
  // Plan methods
  async getPlans(): Promise<Plan[]> {
    return Array.from(this.plans.values());
  }
  
  async getPlan(id: number): Promise<Plan | undefined> {
    return this.plans.get(id);
  }
  
  async createPlan(plan: InsertPlan): Promise<Plan> {
    const id = Math.max(...[0, ...Array.from(this.plans.keys())]) + 1;
    const newPlan: Plan = { ...plan, id };
    this.plans.set(id, newPlan);
    return newPlan;
  }
  
  async updatePlan(id: number, planData: Partial<InsertPlan>): Promise<Plan> {
    const plan = await this.getPlan(id);
    if (!plan) {
      throw new Error(`Plan with ID ${id} not found`);
    }
    
    const updatedPlan = { ...plan, ...planData };
    this.plans.set(id, updatedPlan);
    return updatedPlan;
  }
  
  async deletePlan(id: number): Promise<void> {
    this.plans.delete(id);
  }
  
  // VM methods
  async getVirtualMachines(): Promise<VirtualMachine[]> {
    return Array.from(this.virtualMachines.values());
  }
  
  async getVirtualMachinesByClient(clientId: number): Promise<VirtualMachine[]> {
    return Array.from(this.virtualMachines.values()).filter(
      vm => vm.clientId === clientId
    );
  }
  
  async getVirtualMachinesByUser(userId: number): Promise<VirtualMachine[]> {
    return Array.from(this.virtualMachines.values()).filter(
      vm => vm.userId === userId
    );
  }
  
  async getVirtualMachine(id: number): Promise<VirtualMachine | undefined> {
    return this.virtualMachines.get(id);
  }
  
  async createVirtualMachine(vm: InsertVirtualMachine, userId: number): Promise<VirtualMachine> {
    const id = this.vmIdCounter++;
    const now = new Date();
    
    // Create base VM object
    const baseVm = {
      ...vm,
      id,
      status: "creating",
      createdAt: now,
      userId,
    };
    
    // Add nullable fields with proper defaults
    const defaults = {
      description: null,
      clientId: null,
      reportNumber: null,
      planId: null,
      hypervisorId: null,
      ipAddress: null,
      gateway: null,
      dns: null,
      datastore: null,
      hostGroup: null,
      cluster: null,
      resourcePool: null,
      folder: null,
      vncAccess: false,
      snapshot: false,
      backup: false,
    };
    
    // Combine the base VM with defaults, overriding defaults with any values from vm
    const newVm = {
      ...defaults,
      ...baseVm,
    } as VirtualMachine;
    
    this.virtualMachines.set(id, newVm);
    return newVm;
  }
  
  async updateVirtualMachine(id: number, vmData: Partial<InsertVirtualMachine>): Promise<VirtualMachine> {
    const vm = await this.getVirtualMachine(id);
    if (!vm) {
      throw new Error(`Virtual machine with ID ${id} not found`);
    }
    
    const updatedVm = { ...vm, ...vmData };
    this.virtualMachines.set(id, updatedVm);
    return updatedVm;
  }
  
  async updateVirtualMachineStatus(id: number, status: string): Promise<VirtualMachine> {
    const vm = await this.getVirtualMachine(id);
    if (!vm) {
      throw new Error(`Virtual machine with ID ${id} not found`);
    }
    
    const updatedVm = { ...vm, status };
    this.virtualMachines.set(id, updatedVm);
    return updatedVm;
  }
  
  async deleteVirtualMachine(id: number): Promise<void> {
    this.virtualMachines.delete(id);
  }
  
  // Hypervisor methods
  async getHypervisors(): Promise<Hypervisor[]> {
    return Array.from(this.hypervisors.values()).filter(h => h.active);
  }
  
  async getHypervisor(id: number): Promise<Hypervisor | undefined> {
    return this.hypervisors.get(id);
  }
  
  async getHypervisorByType(type: string): Promise<Hypervisor | undefined> {
    return Array.from(this.hypervisors.values()).find(
      (hypervisor) => hypervisor.type === type && hypervisor.active
    );
  }
  
  async createHypervisor(hypervisor: InsertHypervisor): Promise<Hypervisor> {
    const id = this.hypervisorIdCounter++;
    const now = new Date();
    const newHypervisor: Hypervisor = {
      ...hypervisor,
      id,
      active: true,
      createdAt: now,
      updatedAt: now,
      // Ensure nullable fields have values
      username: hypervisor.username || null,
      password: hypervisor.password || null,
      apiToken: hypervisor.apiToken || null,
      version: hypervisor.version || null
    };
    this.hypervisors.set(id, newHypervisor);
    return newHypervisor;
  }
  
  async updateHypervisor(id: number, hypervisorData: Partial<InsertHypervisor>): Promise<Hypervisor> {
    const hypervisor = await this.getHypervisor(id);
    if (!hypervisor) {
      throw new Error(`Hypervisor with ID ${id} not found`);
    }
    
    const updatedHypervisor = { 
      ...hypervisor, 
      ...hypervisorData,
      updatedAt: new Date()
    };
    this.hypervisors.set(id, updatedHypervisor);
    return updatedHypervisor;
  }
  
  async deleteHypervisor(id: number): Promise<void> {
    const hypervisor = await this.getHypervisor(id);
    if (hypervisor) {
      this.hypervisors.set(id, { ...hypervisor, active: false });
    }
  }
}

// Import database storage implementation
import { DatabaseStorage } from "./db-storage";

// Choose storage implementation based on environment
export const storage = process.env.DATABASE_URL 
  ? new DatabaseStorage() 
  : new MemStorage();
