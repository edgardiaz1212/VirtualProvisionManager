import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// VM Plan Configuration
export const plans = pgTable("plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  ram: text("ram").notNull(),
  cpuCores: text("cpu_cores").notNull(),
  diskSize: text("disk_size").notNull(),
});

export const insertPlanSchema = createInsertSchema(plans);
export type InsertPlan = z.infer<typeof insertPlanSchema>;
export type Plan = typeof plans.$inferSelect;

// Hypervisors
export const hypervisors = pgTable("hypervisors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // "proxmox" or "vcenter"
  apiUrl: text("api_url").notNull(),
  username: text("username").notNull(),
  password: text("password").notNull(),
  version: text("version"), // For vCenter version (6 or 7)
});

export const insertHypervisorSchema = createInsertSchema(hypervisors);
export type InsertHypervisor = z.infer<typeof insertHypervisorSchema>;
export type Hypervisor = typeof hypervisors.$inferSelect;

// Virtual Machines
export const virtualMachines = pgTable("virtual_machines", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  hypervisorType: text("hypervisor_type").notNull(), // "proxmox" or "vcenter"
  planType: text("plan_type").notNull(), // "cataloged" or "custom"
  planId: integer("plan_id"), // null if custom
  ram: text("ram").notNull(),
  cpuCores: text("cpu_cores").notNull(),
  diskSize: text("disk_size").notNull(),
  diskType: text("disk_type").notNull(),
  operatingSystem: text("operating_system").notNull(),
  networkInterface: text("network_interface").notNull(),
  ipAddress: text("ip_address"),
  gateway: text("gateway"),
  dns: text("dns"),
  
  // Storage-related fields
  datastore: text("datastore"),
  
  // Proxmox-specific fields
  hostGroup: text("host_group"), // For Proxmox node
  vncAccess: boolean("vnc_access"),
  
  // vCenter-specific fields
  cluster: text("cluster"),
  resourcePool: text("resource_pool"),
  folder: text("folder"),
  snapshot: boolean("snapshot"),
  
  // Common options
  backup: boolean("backup"),
  
  // Status
  status: text("status").notNull(), // "creating", "running", "error"
  createdAt: text("created_at").notNull(),
});

export const insertVirtualMachineSchema = createInsertSchema(virtualMachines).omit({
  id: true,
  createdAt: true,
  status: true,
});

export type InsertVirtualMachine = z.infer<typeof insertVirtualMachineSchema>;
export type VirtualMachine = typeof virtualMachines.$inferSelect;

// Additional schemas for API operations
export const hypervisorSelectionSchema = z.object({
  hypervisorType: z.enum(["proxmox", "vcenter"]),
});

export const vmCreationResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  status: z.string(),
  message: z.string().optional(),
});

// Form validation schema
export const vmFormSchema = insertVirtualMachineSchema.extend({
  name: z.string().min(1, "VM name is required"),
  operatingSystem: z.string().min(1, "Operating system is required"),
  networkInterface: z.string().min(1, "Network interface is required"),
  planType: z.enum(["cataloged", "custom"]),
  hypervisorType: z.enum(["proxmox", "vcenter"]),
});

// Predefined plans
export const predefinedPlans: Plan[] = [
  { 
    id: 1, 
    name: "S", 
    description: "Small workloads", 
    ram: "2 GB", 
    cpuCores: "1", 
    diskSize: "20 GB" 
  },
  { 
    id: 2, 
    name: "M", 
    description: "Medium workloads", 
    ram: "4 GB", 
    cpuCores: "2", 
    diskSize: "40 GB" 
  },
  { 
    id: 3, 
    name: "L", 
    description: "Large workloads", 
    ram: "8 GB", 
    cpuCores: "4", 
    diskSize: "80 GB" 
  },
  { 
    id: 4, 
    name: "XL", 
    description: "Extra large workloads", 
    ram: "16 GB", 
    cpuCores: "8", 
    diskSize: "160 GB" 
  },
  { 
    id: 5, 
    name: "XXL", 
    description: "Heavy workloads", 
    ram: "32 GB", 
    cpuCores: "16", 
    diskSize: "320 GB" 
  },
  { 
    id: 6, 
    name: "XXXL", 
    description: "Enterprise workloads", 
    ram: "64 GB", 
    cpuCores: "32", 
    diskSize: "640 GB" 
  }
];

// Re-export the users schema since it was already defined
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
