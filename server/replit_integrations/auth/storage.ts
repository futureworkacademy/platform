import { users, type User, type UpsertUser } from "@shared/models/auth";
import { db } from "../../db";
import { eq, sql } from "drizzle-orm";

// Auto-promote certain emails to super admin on login
function getSuperAdminEmails(): string[] {
  const emails = process.env.SUPER_ADMIN_EMAILS || '';
  return emails.split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
}

function shouldAutoPromoteToSuperAdmin(email: string): boolean {
  const superAdminEmails = getSuperAdminEmails();
  return superAdminEmails.includes(email.toLowerCase());
}

export interface ProfileUpdate {
  firstName?: string;
  lastName?: string;
  jobTitle?: string;
  company?: string;
  institution?: string;
  department?: string;
  profileImageUrl?: string;
  schoolEmail?: string;
  schoolEmailVerified?: string;
  verificationCode?: string | null;
  verificationCodeExpires?: Date | null;
  notifyPhone?: string;
}

// Interface for auth storage operations
// (IMPORTANT) These user operations are mandatory for Replit Auth.
export interface IAuthStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateProfile(id: string, profile: ProfileUpdate): Promise<User | undefined>;
}

class AuthStorage implements IAuthStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const userId = userData.id as string;
    const userEmail = userData.email || '';
    const shouldPromote = shouldAutoPromoteToSuperAdmin(userEmail);
    
    // First check if user exists by ID
    let existingUser = await this.getUser(userId);
    
    // If not found by ID, check by email (handles ID mismatch from stale records)
    if (!existingUser && userEmail) {
      const [emailUser] = await db.select().from(users).where(eq(users.email, userEmail));
      if (emailUser) {
        console.log(`[AUTH STORAGE] User found by email ${userEmail} with stale ID ${emailUser.id}, updating to Replit ID ${userId}`);
        // Update the stale ID to match the authenticated Replit user ID
        // Also update all foreign key references
        const oldId = emailUser.id;
        try {
          // Update foreign key references in related tables
          await db.execute(sql`UPDATE organization_members SET user_id = ${userId} WHERE user_id = ${oldId}`);
          await db.execute(sql`UPDATE notifications SET user_id = ${userId} WHERE user_id = ${oldId}`);
          await db.execute(sql`UPDATE phone_a_friend_usage SET user_id = ${userId} WHERE user_id = ${oldId}`);
          await db.execute(sql`UPDATE voicemail_deliveries SET user_id = ${userId} WHERE user_id = ${oldId}`);
          await db.execute(sql`UPDATE content_views SET user_id = ${userId} WHERE user_id = ${oldId}`);
          await db.execute(sql`UPDATE media_engagement SET user_id = ${userId} WHERE user_id = ${oldId}`);
          // Update the user's primary key
          const [updated] = await db
            .update(users)
            .set({ id: userId, updatedAt: new Date() })
            .where(eq(users.id, oldId))
            .returning();
          existingUser = updated;
          console.log(`[AUTH STORAGE] Successfully migrated user from ID ${oldId} to ${userId}`);
        } catch (migrationErr: any) {
          console.error(`[AUTH STORAGE] Failed to migrate user ID:`, migrationErr?.message || migrationErr);
          // Fall through to update the existing record by email as fallback
          existingUser = emailUser;
        }
      }
    }
    
    if (existingUser) {
      const updateData: any = {
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        profileImageUrl: userData.profileImageUrl,
        updatedAt: new Date(),
      };
      
      if (shouldPromote && existingUser.isAdmin !== 'super_admin') {
        updateData.isAdmin = 'super_admin';
        console.log(`[AUTH STORAGE] Auto-promoting ${userEmail} to super_admin`);
      } else if ((userData as any).isAdmin !== undefined) {
        updateData.isAdmin = (userData as any).isAdmin;
        console.log(`[AUTH STORAGE] Updating isAdmin to: ${updateData.isAdmin}`);
      }
      
      const [user] = await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, existingUser.id))
        .returning();
      return user;
    }
    
    // New user - insert with defaults
    const insertData = shouldPromote 
      ? { ...userData, isAdmin: 'super_admin' as const }
      : userData;
    
    if (shouldPromote) {
      console.log(`[AUTH STORAGE] New user ${userEmail} auto-promoted to super_admin`);
    }
    
    const [user] = await db
      .insert(users)
      .values(insertData)
      .returning();
    return user;
  }

  async updateProfile(id: string, profile: ProfileUpdate): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({
        ...profile,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }
}

export const authStorage = new AuthStorage();
