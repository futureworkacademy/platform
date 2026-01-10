import { Request, Response, NextFunction } from "express";
import { organizationStorage } from "./organization-storage";
import { ROLES, Role } from "@shared/models/auth";

// Extended request type with role info
export interface AuthRequest extends Request {
  userRole?: Role | null;
  isSuperAdmin?: boolean;
  isClassAdmin?: boolean;
  organizationIds?: string[];
}

// Check if user is authenticated
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

// Load user role information
export async function loadUserRole(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.isAuthenticated() || !req.user) {
    return next();
  }

  try {
    const userId = (req.user as any).id;
    const memberships = await organizationStorage.getMembershipsByUser(userId);
    
    req.isSuperAdmin = memberships.some(m => m.role === ROLES.SUPER_ADMIN);
    req.isClassAdmin = memberships.some(m => m.role === ROLES.CLASS_ADMIN);
    req.organizationIds = memberships.map(m => m.organizationId);
    req.userRole = await organizationStorage.getUserRole(userId);
    
    next();
  } catch (error) {
    console.error("Error loading user role:", error);
    next();
  }
}

// Require super admin role
export async function requireSuperAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const userId = (req.user as any).id;
    const isSuperAdmin = await organizationStorage.isSuperAdmin(userId);
    
    if (!isSuperAdmin) {
      return res.status(403).json({ error: "Super Admin access required" });
    }
    
    next();
  } catch (error) {
    console.error("Error checking super admin:", error);
    res.status(500).json({ error: "Authorization check failed" });
  }
}

// Require class admin or super admin role
export async function requireClassAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const userId = (req.user as any).id;
    const isSuperAdmin = await organizationStorage.isSuperAdmin(userId);
    const isClassAdmin = await organizationStorage.isClassAdmin(userId);
    
    if (!isSuperAdmin && !isClassAdmin) {
      return res.status(403).json({ error: "Admin access required" });
    }
    
    req.isSuperAdmin = isSuperAdmin;
    req.isClassAdmin = isClassAdmin;
    next();
  } catch (error) {
    console.error("Error checking class admin:", error);
    res.status(500).json({ error: "Authorization check failed" });
  }
}

// Require class admin for a specific organization
export function requireOrgAdmin(orgIdParam: string = "orgId") {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const userId = (req.user as any).id;
      const orgId = req.params[orgIdParam] || req.body.organizationId;
      
      const isSuperAdmin = await organizationStorage.isSuperAdmin(userId);
      if (isSuperAdmin) {
        req.isSuperAdmin = true;
        return next();
      }
      
      const isOrgAdmin = await organizationStorage.isClassAdmin(userId, orgId);
      if (!isOrgAdmin) {
        return res.status(403).json({ error: "You don't have admin access to this organization" });
      }
      
      req.isClassAdmin = true;
      next();
    } catch (error) {
      console.error("Error checking org admin:", error);
      res.status(500).json({ error: "Authorization check failed" });
    }
  };
}

// Validate .edu email
export function validateEduEmail(email: string): boolean {
  if (!email) return false;
  const emailLower = email.toLowerCase().trim();
  return emailLower.endsWith(".edu");
}

// Generate a random team code
export function generateTeamCode(length: number = 6): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Exclude confusing chars like I, O, 0, 1
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
