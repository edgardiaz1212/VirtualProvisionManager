import { 
  User,
  InsertUser, 
  VirtualMachine,
  Plan, 
  Hypervisor,
  predefinedPlans
} from "@shared/schema";

// Storage interface
export interface IStorage {
  // User methods (from original schema)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // VM-related methods
  getPlans(): Promise<Plan[]>;
  getPlan(id: number): Promise<Plan | undefined>;
  getVirtualMachines(): Promise<VirtualMachine[]>;
  getVirtualMachine(id: number): Promise<VirtualMachine | undefined>;
  createVirtualMachine(vm: Omit<VirtualMachine, "id">): Promise<VirtualMachine>;
  updateVirtualMachineStatus(id: number, status: string): Promise<VirtualMachine>;
  
  // Hypervisor methods
  getHypervisors(): Promise<Hypervisor[]>;
  getHypervisor(id: number): Promise<Hypervisor | undefined>;
  getHypervisorByType(type: string): Promise<Hypervisor | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private virtualMachines: Map<number, VirtualMachine>;
  private plans: Map<number, Plan>;
  private hypervisors: Map<number, Hypervisor>;
  private userIdCounter: number;
  private vmIdCounter: number;
  private hypervisorIdCounter: number;

  constructor() {
    this.users = new Map();
    this.virtualMachines = new Map();
    this.plans = new Map();
    this.hypervisors = new Map();
    
    this.userIdCounter = 1;
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
    });
    
    this.hypervisors.set(2, {
      id: 2,
      name: "vCenter 6.7",
      type: "vcenter",
      apiUrl: "https://vcenter.example.com/api",
      username: "administrator@vsphere.local",
      password: "password",
      version: "6.7"
    });
    
    this.hypervisors.set(3, {
      id: 3,
      name: "vCenter 7.0",
      type: "vcenter",
      apiUrl: "https://vcenter7.example.com/api",
      username: "administrator@vsphere.local",
      password: "password",
      version: "7.0"
    });
  }

  // User methods (from original storage)
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
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Plan methods
  async getPlans(): Promise<Plan[]> {
    return Array.from(this.plans.values());
  }
  
  async getPlan(id: number): Promise<Plan | undefined> {
    return this.plans.get(id);
  }
  
  // VM methods
  async getVirtualMachines(): Promise<VirtualMachine[]> {
    return Array.from(this.virtualMachines.values());
  }
  
  async getVirtualMachine(id: number): Promise<VirtualMachine | undefined> {
    return this.virtualMachines.get(id);
  }
  
  async createVirtualMachine(vm: Omit<VirtualMachine, "id">): Promise<VirtualMachine> {
    const id = this.vmIdCounter++;
    const newVm: VirtualMachine = { ...vm, id };
    this.virtualMachines.set(id, newVm);
    return newVm;
  }
  
  async updateVirtualMachineStatus(id: number, status: string): Promise<VirtualMachine> {
    const vm = this.virtualMachines.get(id);
    if (!vm) {
      throw new Error(`Virtual machine with ID ${id} not found`);
    }
    
    const updatedVm = { ...vm, status };
    this.virtualMachines.set(id, updatedVm);
    return updatedVm;
  }
  
  // Hypervisor methods
  async getHypervisors(): Promise<Hypervisor[]> {
    return Array.from(this.hypervisors.values());
  }
  
  async getHypervisor(id: number): Promise<Hypervisor | undefined> {
    return this.hypervisors.get(id);
  }
  
  async getHypervisorByType(type: string): Promise<Hypervisor | undefined> {
    return Array.from(this.hypervisors.values()).find(
      (hypervisor) => hypervisor.type === type
    );
  }
}

export const storage = new MemStorage();
