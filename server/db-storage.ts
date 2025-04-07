import { db } from "./db";
import { eq } from "drizzle-orm";
import { 
  users, 
  clients, 
  hypervisors, 
  plans, 
  virtualMachines,
  User,
  InsertUser,
  Client,
  InsertClient,
  Plan,
  InsertPlan,
  VirtualMachine,
  InsertVirtualMachine,
  Hypervisor,
  InsertHypervisor
} from "@shared/schema";
import { IStorage } from "./storage";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

// Create a session store that uses the Postgres database
const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  
  constructor() {
    // Create session store with the pool connection
    this.sessionStore = new PostgresSessionStore({ 
      pool,
      createTableIfMissing: true,
      tableName: 'sessions'
    });
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({
        ...userData,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
    
    return updatedUser;
  }
  
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }
  
  async deleteUser(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }
  
  // Client methods
  async getClient(id: number): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client;
  }
  
  async getClientByName(name: string): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.name, name));
    return client;
  }
  
  async createClient(client: InsertClient): Promise<Client> {
    const [newClient] = await db.insert(clients).values(client).returning();
    return newClient;
  }
  
  async updateClient(id: number, clientData: Partial<InsertClient>): Promise<Client> {
    const [updatedClient] = await db
      .update(clients)
      .set(clientData)
      .where(eq(clients.id, id))
      .returning();
    
    return updatedClient;
  }
  
  async getAllClients(): Promise<Client[]> {
    return await db.select().from(clients);
  }
  
  async deleteClient(id: number): Promise<void> {
    await db.delete(clients).where(eq(clients.id, id));
  }
  
  // Plan methods
  async getPlans(): Promise<Plan[]> {
    return await db.select().from(plans);
  }
  
  async getPlan(id: number): Promise<Plan | undefined> {
    const [plan] = await db.select().from(plans).where(eq(plans.id, id));
    return plan;
  }
  
  async createPlan(plan: InsertPlan): Promise<Plan> {
    const [newPlan] = await db.insert(plans).values(plan).returning();
    return newPlan;
  }
  
  async updatePlan(id: number, planData: Partial<InsertPlan>): Promise<Plan> {
    const [updatedPlan] = await db
      .update(plans)
      .set(planData)
      .where(eq(plans.id, id))
      .returning();
    
    return updatedPlan;
  }
  
  async deletePlan(id: number): Promise<void> {
    await db.delete(plans).where(eq(plans.id, id));
  }
  
  // Virtual Machine methods
  async getVirtualMachines(): Promise<VirtualMachine[]> {
    return await db.select().from(virtualMachines);
  }
  
  async getVirtualMachinesByClient(clientId: number): Promise<VirtualMachine[]> {
    return await db
      .select()
      .from(virtualMachines)
      .where(eq(virtualMachines.clientId, clientId));
  }
  
  async getVirtualMachinesByUser(userId: number): Promise<VirtualMachine[]> {
    return await db
      .select()
      .from(virtualMachines)
      .where(eq(virtualMachines.userId, userId));
  }
  
  async getVirtualMachine(id: number): Promise<VirtualMachine | undefined> {
    const [vm] = await db
      .select()
      .from(virtualMachines)
      .where(eq(virtualMachines.id, id));
    
    return vm;
  }
  
  async createVirtualMachine(vm: InsertVirtualMachine, userId: number): Promise<VirtualMachine> {
    const [newVm] = await db
      .insert(virtualMachines)
      .values({
        ...vm,
        userId,
        status: "creating"
      })
      .returning();
    
    return newVm;
  }
  
  async updateVirtualMachine(id: number, vmData: Partial<InsertVirtualMachine>): Promise<VirtualMachine> {
    const [updatedVm] = await db
      .update(virtualMachines)
      .set(vmData)
      .where(eq(virtualMachines.id, id))
      .returning();
    
    return updatedVm;
  }
  
  async updateVirtualMachineStatus(id: number, status: string): Promise<VirtualMachine> {
    const [updatedVm] = await db
      .update(virtualMachines)
      .set({ status })
      .where(eq(virtualMachines.id, id))
      .returning();
    
    return updatedVm;
  }
  
  async deleteVirtualMachine(id: number): Promise<void> {
    await db.delete(virtualMachines).where(eq(virtualMachines.id, id));
  }
  
  // Hypervisor methods
  async getHypervisors(): Promise<Hypervisor[]> {
    return await db.select().from(hypervisors);
  }
  
  async getHypervisor(id: number): Promise<Hypervisor | undefined> {
    const [hypervisor] = await db
      .select()
      .from(hypervisors)
      .where(eq(hypervisors.id, id));
    
    return hypervisor;
  }
  
  async getHypervisorByType(type: string): Promise<Hypervisor | undefined> {
    const [hypervisor] = await db
      .select()
      .from(hypervisors)
      .where(eq(hypervisors.type, type))
      .where(eq(hypervisors.active, true));
    
    return hypervisor;
  }
  
  async createHypervisor(hypervisor: InsertHypervisor): Promise<Hypervisor> {
    const [newHypervisor] = await db
      .insert(hypervisors)
      .values(hypervisor)
      .returning();
    
    return newHypervisor;
  }
  
  async updateHypervisor(id: number, hypervisorData: Partial<InsertHypervisor>): Promise<Hypervisor> {
    const [updatedHypervisor] = await db
      .update(hypervisors)
      .set({
        ...hypervisorData,
        updatedAt: new Date()
      })
      .where(eq(hypervisors.id, id))
      .returning();
    
    return updatedHypervisor;
  }
  
  async deleteHypervisor(id: number): Promise<void> {
    await db.delete(hypervisors).where(eq(hypervisors.id, id));
  }
}