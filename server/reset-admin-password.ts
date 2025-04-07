/**
 * Script to reset admin password
 * This script updates the admin user's password using bcrypt
 */

import { db } from "./db";
import { users } from "@shared/schema";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { log } from "./vite";
import { fileURLToPath } from 'url';
import path from 'path';

async function resetAdminPassword() {
  try {
    log("Resetting admin password...", "password-reset");
    
    // Hash the default password with bcrypt directly
    const password = "admin123";
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Update admin user password
    const [updatedUser] = await db
      .update(users)
      .set({
        password: hashedPassword,
        updatedAt: new Date()
      })
      .where(eq(users.username, "admin"))
      .returning();
    
    if (updatedUser) {
      log(`Admin password reset successfully for user ID: ${updatedUser.id}`, "password-reset");
      return true;
    } else {
      log("Admin user not found", "password-reset");
      return false;
    }
  } catch (error) {
    log(`Failed to reset admin password: ${error}`, "password-reset");
    console.error("Error resetting admin password:", error);
    return false;
  }
}

// Run the reset function
resetAdminPassword()
  .then(() => {
    log("Password reset process completed", "password-reset");
    process.exit(0);
  })
  .catch(err => {
    log(`Fatal error: ${err}`, "password-reset");
    process.exit(1);
  });

export { resetAdminPassword };