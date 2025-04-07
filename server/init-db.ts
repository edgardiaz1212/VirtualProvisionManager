/**
 * Database initialization script
 * This file contains functions to initialize the database with default data
 */

import { db } from "./db";
import { 
  users, 
  clients, 
  hypervisors, 
  plans,
  predefinedPlans
} from "@shared/schema";
import bcrypt from "bcrypt";
import { log } from "./vite";
import { eq } from "drizzle-orm";

/**
 * Initialize the database with default data
 */
export async function initializeDatabase() {
  try {
    log("Initializing database...", "db-init");
    
    // Check if default data already exists
    const existingAdmin = await db.select().from(users).where(eq(users.username, "admin")).limit(1);
    
    if (existingAdmin.length > 0) {
      log("Database already initialized, skipping...", "db-init");
      return;
    }
    
    // Start a transaction for all operations
    await db.transaction(async (tx) => {
      log("Creating default admin user...", "db-init");
      
      // Hash the default password
      const hashedPassword = await bcrypt.hash("admin123", 10);
      
      // Create admin user
      await tx.insert(users).values({
        username: "admin",
        password: hashedPassword,
        fullName: "Administrator",
        email: "admin@example.com",
        role: "admin"
      });
      
      // Create sample client
      log("Creating sample client...", "db-init");
      await tx.insert(clients).values({
        name: "Sample Client",
        contactName: "John Doe",
        email: "contact@sample.com",
        phone: "123-456-7890"
      });
      
      // Create sample hypervisors
      log("Creating sample hypervisors...", "db-init");
      await tx.insert(hypervisors).values([
        {
          name: "Proxmox Cluster 1",
          type: "proxmox",
          apiUrl: "https://proxmox1.example.com:8006/api2/json",
          authType: "credentials",
          username: "root",
          password: "encrypted-password", // In production, use encrypted credentials
          apiToken: null,
          version: null,
          active: true
        },
        {
          name: "vCenter Server",
          type: "vcenter",
          apiUrl: "https://vcenter.example.com/sdk",
          authType: "credentials",
          username: "administrator@vsphere.local",
          password: "encrypted-password", // In production, use encrypted credentials
          apiToken: null,
          version: "7.0",
          active: true
        }
      ]);
      
      // Insert predefined plans
      log("Creating predefined VM plans...", "db-init");
      
      // Use predefined plans from shared schema
      await tx.insert(plans).values(predefinedPlans);
    });
    
    log("Database initialization complete!", "db-init");
  } catch (error) {
    log(`Database initialization error: ${error}`, "db-init");
    console.error("Failed to initialize database:", error);
    throw error;
  }
}