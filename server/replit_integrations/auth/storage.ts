import { users, type User, type UpsertUser } from "@shared/models/auth";
import { db } from "../../db";
import { eq } from "drizzle-orm";

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
    // Check if user already exists to preserve role-related fields
    const userId = userData.id as string;
    const existingUser = await this.getUser(userId);
    
    // Check for auto-promotion to super admin
    const userEmail = userData.email || '';
    const shouldPromote = shouldAutoPromoteToSuperAdmin(userEmail);
    
    if (existingUser) {
      // User exists - update profile fields
      // Also update isAdmin if provided in userData (allows OIDC to set admin status)
      const updateData: any = {
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        profileImageUrl: userData.profileImageUrl,
        updatedAt: new Date(),
      };
      
      // Auto-promote to super admin if email matches
      if (shouldPromote && existingUser.isAdmin !== 'super_admin') {
        updateData.isAdmin = 'super_admin';
        console.log(`[AUTH STORAGE] Auto-promoting ${userEmail} to super_admin`);
      } else if ((userData as any).isAdmin !== undefined) {
        // Only update isAdmin if it's explicitly provided (not undefined)
        updateData.isAdmin = (userData as any).isAdmin;
        console.log(`[AUTH STORAGE] Updating isAdmin to: ${updateData.isAdmin}`);
      }
      
      const [user] = await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, userId))
        .returning();
      return user;
    }
    
    // New user - insert with defaults
    // Auto-promote if email matches
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
