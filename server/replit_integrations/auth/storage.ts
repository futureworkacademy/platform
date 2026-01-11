import { users, type User, type UpsertUser } from "@shared/models/auth";
import { db } from "../../db";
import { eq } from "drizzle-orm";

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
      
      // Only update isAdmin if it's explicitly provided (not undefined)
      if ((userData as any).isAdmin !== undefined) {
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
    const [user] = await db
      .insert(users)
      .values(userData)
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
