import { sql } from "drizzle-orm";
import { boolean, index, integer, jsonb, pgTable, timestamp, varchar, text } from "drizzle-orm/pg-core";

// Role enum values
export const ROLES = {
  SUPER_ADMIN: "super_admin",
  CLASS_ADMIN: "class_admin", 
  STUDENT: "student",
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

// Organization status enum values
export const ORG_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  ARCHIVED: "archived",
} as const;

export type OrgStatus = typeof ORG_STATUS[keyof typeof ORG_STATUS];

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  teamId: varchar("team_id"),
  isAdmin: varchar("is_admin").default("false"),
  jobTitle: varchar("job_title"),
  company: varchar("company"),
  institution: varchar("institution"),
  department: varchar("department"),
  schoolEmail: varchar("school_email"),
  schoolEmailVerified: varchar("school_email_verified").default("false"),
  verificationCode: varchar("verification_code"),
  verificationCodeExpires: timestamp("verification_code_expires"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Teams table for persistent game state
export const teams = pgTable("teams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  organizationId: varchar("organization_id"), // Links team to organization/class
  currentWeek: integer("current_week").notNull().default(1),
  totalWeeks: integer("total_weeks").notNull().default(8),
  setupComplete: boolean("setup_complete").notNull().default(false),
  researchComplete: boolean("research_complete").notNull().default(false),
  
  // JSONB for complex nested game state
  members: jsonb("members").notNull().default([]),
  companyState: jsonb("company_state").notNull(),
  decisions: jsonb("decisions").notNull().default([]),
  decisionRecords: jsonb("decision_records").notNull().default([]),
  weeklyHistory: jsonb("weekly_history").notNull().default([]),
  viewedReportIds: jsonb("viewed_report_ids").notNull().default([]),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type DbTeam = typeof teams.$inferSelect;
export type InsertDbTeam = typeof teams.$inferInsert;

// Organizations table - represents a class/cohort managed by a Class Admin
export const organizations = pgTable("organizations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code").notNull().unique(), // The "team code" professors give to students
  name: varchar("name").notNull(),
  description: text("description"),
  ownerId: varchar("owner_id").notNull(), // The Class Admin who owns this org
  status: varchar("status").notNull().default("active"), // active, inactive, archived
  maxMembers: integer("max_members").default(100),
  notifyOnSignup: boolean("notify_on_signup").default(true),
  notifyEmail: varchar("notify_email"),
  notifyPhone: varchar("notify_phone"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = typeof organizations.$inferInsert;

// Organization members - links users to organizations with roles
export const organizationMembers = pgTable("organization_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  organizationId: varchar("organization_id").notNull(),
  role: varchar("role").notNull().default("student"), // super_admin, class_admin, student
  status: varchar("status").notNull().default("pending"), // pending, active, suspended
  joinedAt: timestamp("joined_at").defaultNow(),
  approvedBy: varchar("approved_by"),
  approvedAt: timestamp("approved_at"),
});

export type OrganizationMember = typeof organizationMembers.$inferSelect;
export type InsertOrganizationMember = typeof organizationMembers.$inferInsert;

// Organization invites - team codes with usage tracking and expiration
export const organizationInvites = pgTable("organization_invites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull(),
  code: varchar("code").notNull().unique(), // Same as org code, or additional invite codes
  maxUses: integer("max_uses").default(100),
  usedCount: integer("used_count").notNull().default(0),
  expiresAt: timestamp("expires_at"),
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  isActive: boolean("is_active").notNull().default(true),
});

export type OrganizationInvite = typeof organizationInvites.$inferSelect;
export type InsertOrganizationInvite = typeof organizationInvites.$inferInsert;

// Notifications table - for dashboard alerts
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(), // Who should see this notification
  type: varchar("type").notNull(), // signup, team_assignment, week_advanced, etc.
  title: varchar("title").notNull(),
  message: text("message"),
  data: jsonb("data"), // Additional context data
  read: boolean("read").notNull().default(false),
  emailSent: boolean("email_sent").default(false),
  smsSent: boolean("sms_sent").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

// Educator inquiries - contact form submissions from "For Educators" page
export const educatorInquiries = pgTable("educator_inquiries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  email: varchar("email").notNull(),
  phone: varchar("phone"),
  institution: varchar("institution"),
  inquiryType: varchar("inquiry_type").notNull().default("general"), // general, demo_request, pricing, partnership
  message: text("message").notNull(),
  status: varchar("status").notNull().default("new"), // new, contacted, resolved
  notes: text("notes"), // Admin notes
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type EducatorInquiry = typeof educatorInquiries.$inferSelect;
export type InsertEducatorInquiry = typeof educatorInquiries.$inferInsert;
