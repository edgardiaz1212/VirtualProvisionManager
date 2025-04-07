import { pgTable, text, serial, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User Roles Enum
export const userRolesEnum = pgEnum('user_role', ['admin', 'operator', 'viewer']);

// Clients
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  contactName: text("contact_name"),
  email: text("email"),
  phone: text("phone"),
  department: text("department"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertClientSchema = createInsertSchema(clients, {
  name: z.string().min(1, "Client name is required"),
  email: z.string().email("Invalid email").optional().nullable(),
  phone: z.string().optional().nullable(),
}).omit({ 
  id: true,
  createdAt: true,
});

export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clients.$inferSelect;

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

// Users with roles
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  email: text("email"),
  role: userRolesEnum("role").default("operator").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users, {
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email("Invalid email format").optional().nullable(),
  role: z.enum(["admin", "operator", "viewer"]),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Hypervisors
export const hypervisors = pgTable("hypervisors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // "proxmox" or "vcenter"
  apiUrl: text("api_url").notNull(),
  
  // Authentication - either username/password or API token
  authType: text("auth_type").notNull().default("credentials"), // "credentials" or "token"
  username: text("username"),
  password: text("password"),
  apiToken: text("api_token"), 
  
  version: text("version"), // For vCenter version (6 or 7)
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertHypervisorSchema = createInsertSchema(hypervisors, {
  name: z.string().min(1, "Hypervisor name is required"),
  type: z.enum(["proxmox", "vcenter"]),
  apiUrl: z.string().url("Please enter a valid URL"),
  authType: z.enum(["credentials", "token"]),
}).omit({
  id: true,
  active: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertHypervisor = z.infer<typeof insertHypervisorSchema>;
export type Hypervisor = typeof hypervisors.$inferSelect;

// Virtual Machines
export const virtualMachines = pgTable("virtual_machines", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  
  // Client and report data
  clientId: integer("client_id").references(() => clients.id),
  reportNumber: text("report_number"),
  
  // Hypervisor configuration
  hypervisorType: text("hypervisor_type").notNull(), // "proxmox" or "vcenter"
  hypervisorId: integer("hypervisor_id").references(() => hypervisors.id),
  
  // Resource configuration
  planType: text("plan_type").notNull(), // "cataloged" or "custom"
  planId: integer("plan_id"), // null if custom
  ram: text("ram").notNull(),
  cpuCores: text("cpu_cores").notNull(),
  diskSize: text("disk_size").notNull(),
  diskType: text("disk_type").notNull(),
  
  // Network configuration
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
  
  // Status and tracking
  status: text("status").notNull().default("creating"), // "creating", "running", "error", "stopped"
  createdAt: timestamp("created_at").defaultNow().notNull(),
  userId: integer("user_id").references(() => users.id), // Track which user created the VM
});

// Relations
export const clientsRelations = relations(clients, ({ many }) => ({
  virtualMachines: many(virtualMachines),
}));

export const usersRelations = relations(users, ({ many }) => ({
  virtualMachines: many(virtualMachines),
}));

export const hypervisorsRelations = relations(hypervisors, ({ many }) => ({
  virtualMachines: many(virtualMachines),
}));

export const virtualMachinesRelations = relations(virtualMachines, ({ one }) => ({
  client: one(clients, {
    fields: [virtualMachines.clientId],
    references: [clients.id],
  }),
  hypervisor: one(hypervisors, {
    fields: [virtualMachines.hypervisorId],
    references: [hypervisors.id],
  }),
  user: one(users, {
    fields: [virtualMachines.userId],
    references: [users.id],
  }),
}));

export const insertVirtualMachineSchema = createInsertSchema(virtualMachines, {
  clientId: z.number().min(1, "Client is required"),
  reportNumber: z.string().min(1, "Report number is required"),
}).omit({
  id: true,
  createdAt: true,
  status: true,
  userId: true,
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
