/**
 * Initial database migration script
 */

import { db } from "../server/db";
import { migrate as migrateDrizzle } from "drizzle-orm/postgres-js/migrator";
import { log } from "../server/vite";
import { initializeDatabase } from "../server/init-db";

/**
 * Initialize the database with default data
 */
export async function migrate() {
  try {
    log("Running database migrations...", "migration");
    
    // Run the migrations
    await migrateDrizzle(db, { migrationsFolder: "drizzle" });
    
    log("Database migrations completed successfully", "migration");
    
    // Initialize database with default data
    await initializeDatabase();
    
    log("Database initialization completed", "migration");
  } catch (error) {
    log(`Migration error: ${error}`, "migration");
    console.error("Migration failed:", error);
    throw error;
  }
}