import { db } from "./db";
import { eq, and, or, desc } from "drizzle-orm";
import { 
  organizations, 
  organizationMembers, 
  organizationInvites, 
  notifications,
  users,
  Organization,
  InsertOrganization,
  OrganizationMember,
  InsertOrganizationMember,
  OrganizationInvite,
  InsertOrganizationInvite,
  Notification,
  InsertNotification,
  ROLES,
  Role,
} from "@shared/models/auth";

class OrganizationStorage {
  // Organization CRUD
  async createOrganization(data: InsertOrganization): Promise<Organization> {
    const [org] = await db.insert(organizations).values(data).returning();
    
    // Also create an invite code matching the org code
    await db.insert(organizationInvites).values({
      organizationId: org.id,
      code: org.code,
      createdBy: org.ownerId,
      maxUses: data.maxMembers || 100,
    });
    
    return org;
  }

  async getOrganization(id: string): Promise<Organization | undefined> {
    const [org] = await db.select().from(organizations).where(eq(organizations.id, id));
    return org;
  }

  async getOrganizationByCode(code: string): Promise<Organization | undefined> {
    const [org] = await db.select().from(organizations).where(eq(organizations.code, code));
    return org;
  }

  async getAllOrganizations(): Promise<Organization[]> {
    return db.select().from(organizations).orderBy(desc(organizations.createdAt));
  }

  async getOrganizationsByOwner(ownerId: string): Promise<Organization[]> {
    return db.select().from(organizations).where(eq(organizations.ownerId, ownerId));
  }

  async updateOrganization(id: string, data: Partial<InsertOrganization>): Promise<Organization | undefined> {
    const [org] = await db.update(organizations)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(organizations.id, id))
      .returning();
    return org;
  }

  // Organization Members
  async addMember(data: InsertOrganizationMember): Promise<OrganizationMember> {
    const [member] = await db.insert(organizationMembers).values(data).returning();
    return member;
  }

  async getMember(userId: string, organizationId: string): Promise<OrganizationMember | undefined> {
    const [member] = await db.select().from(organizationMembers)
      .where(and(
        eq(organizationMembers.userId, userId),
        eq(organizationMembers.organizationId, organizationId)
      ));
    return member;
  }

  async getMembersByOrganization(organizationId: string): Promise<OrganizationMember[]> {
    return db.select().from(organizationMembers)
      .where(eq(organizationMembers.organizationId, organizationId));
  }

  async getMembershipsByUser(userId: string): Promise<OrganizationMember[]> {
    return db.select().from(organizationMembers)
      .where(eq(organizationMembers.userId, userId));
  }

  async updateMember(id: string, data: Partial<InsertOrganizationMember>): Promise<OrganizationMember | undefined> {
    const [member] = await db.update(organizationMembers)
      .set(data)
      .where(eq(organizationMembers.id, id))
      .returning();
    return member;
  }

  async getUserRole(userId: string): Promise<Role | null> {
    // Check if user is super admin (has super_admin role in any org)
    const memberships = await this.getMembershipsByUser(userId);
    
    for (const membership of memberships) {
      if (membership.role === ROLES.SUPER_ADMIN) {
        return ROLES.SUPER_ADMIN;
      }
    }
    
    // Check if class admin in any org
    for (const membership of memberships) {
      if (membership.role === ROLES.CLASS_ADMIN) {
        return ROLES.CLASS_ADMIN;
      }
    }
    
    // Check if student
    if (memberships.length > 0) {
      return ROLES.STUDENT;
    }
    
    return null;
  }

  async isSuperAdmin(userId: string): Promise<boolean> {
    // Check users table first (for legacy super admin flag)
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    // Support both 'super_admin' and legacy 'true' values
    if (user?.isAdmin === 'super_admin' || user?.isAdmin === 'true') {
      return true;
    }
    
    // Then check organization_members for super_admin role
    const memberships = await this.getMembershipsByUser(userId);
    return memberships.some(m => m.role === ROLES.SUPER_ADMIN);
  }

  async isClassAdmin(userId: string, organizationId?: string): Promise<boolean> {
    const memberships = await this.getMembershipsByUser(userId);
    if (organizationId) {
      return memberships.some(m => 
        m.role === ROLES.CLASS_ADMIN && m.organizationId === organizationId
      );
    }
    return memberships.some(m => m.role === ROLES.CLASS_ADMIN);
  }

  // Invite Codes
  async getInviteByCode(code: string): Promise<OrganizationInvite | undefined> {
    const [invite] = await db.select().from(organizationInvites)
      .where(eq(organizationInvites.code, code));
    return invite;
  }

  async validateInviteCode(code: string): Promise<{ valid: boolean; invite?: OrganizationInvite; organization?: Organization; error?: string }> {
    const invite = await this.getInviteByCode(code);
    
    if (!invite) {
      return { valid: false, error: "Invalid team code" };
    }
    
    if (!invite.isActive) {
      return { valid: false, error: "This team code is no longer active" };
    }
    
    if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
      return { valid: false, error: "This team code has expired" };
    }
    
    if (invite.maxUses && invite.usedCount >= invite.maxUses) {
      return { valid: false, error: "This team code has reached its usage limit" };
    }
    
    const org = await this.getOrganization(invite.organizationId);
    if (!org || org.status !== "active") {
      return { valid: false, error: "This organization is not active" };
    }
    
    return { valid: true, invite, organization: org };
  }

  async incrementInviteUsage(inviteId: string): Promise<void> {
    await db.update(organizationInvites)
      .set({ usedCount: db.$count(organizationInvites, eq(organizationInvites.id, inviteId)) })
      .where(eq(organizationInvites.id, inviteId));
    
    // Simpler approach - just increment
    const [invite] = await db.select().from(organizationInvites).where(eq(organizationInvites.id, inviteId));
    if (invite) {
      await db.update(organizationInvites)
        .set({ usedCount: (invite.usedCount || 0) + 1 })
        .where(eq(organizationInvites.id, inviteId));
    }
  }

  async createInvite(data: InsertOrganizationInvite): Promise<OrganizationInvite> {
    const [invite] = await db.insert(organizationInvites).values(data).returning();
    return invite;
  }

  async getInvitesByOrganization(organizationId: string): Promise<OrganizationInvite[]> {
    return db.select().from(organizationInvites)
      .where(eq(organizationInvites.organizationId, organizationId));
  }

  // Notifications
  async createNotification(data: InsertNotification): Promise<Notification> {
    const [notification] = await db.insert(notifications).values(data).returning();
    return notification;
  }

  async getNotificationsForUser(userId: string, limit = 50): Promise<Notification[]> {
    return db.select().from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);
  }

  async markNotificationRead(id: string): Promise<void> {
    await db.update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, id));
  }

  async getUnreadCount(userId: string): Promise<number> {
    const unread = await db.select().from(notifications)
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.read, false)
      ));
    return unread.length;
  }

  // Helper to notify admins of a signup
  async notifyAdminsOfSignup(organizationId: string, newUser: { firstName: string; lastName: string; email: string }): Promise<void> {
    const org = await this.getOrganization(organizationId);
    if (!org) return;

    // Notify org owner (Class Admin)
    await this.createNotification({
      userId: org.ownerId,
      type: "new_signup",
      title: "New Student Signup",
      message: `${newUser.firstName} ${newUser.lastName} (${newUser.email}) joined your class "${org.name}"`,
      data: { organizationId, userEmail: newUser.email },
    });

    // Find all super admins and notify them
    const allMembers = await db.select().from(organizationMembers)
      .where(eq(organizationMembers.role, ROLES.SUPER_ADMIN));
    
    const uniqueSuperAdmins = Array.from(new Set(allMembers.map(m => m.userId)));
    
    for (const adminId of uniqueSuperAdmins) {
      if (adminId !== org.ownerId) {
        await this.createNotification({
          userId: adminId,
          type: "new_signup",
          title: "New Student Signup",
          message: `${newUser.firstName} ${newUser.lastName} joined "${org.name}"`,
          data: { organizationId, userEmail: newUser.email },
        });
      }
    }
  }
}

export const organizationStorage = new OrganizationStorage();
