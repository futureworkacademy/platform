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
  notifyPhone: varchar("notify_phone"),
  smsEnabled: boolean("sms_enabled").default(true),
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
  status: varchar("status").notNull().default("pending"), // pending, active, suspended, deactivated
  joinedAt: timestamp("joined_at").defaultNow(),
  approvedBy: varchar("approved_by"),
  approvedAt: timestamp("approved_at"),
  deactivatedAt: timestamp("deactivated_at"),
  deactivatedBy: varchar("deactivated_by"),
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

// Platform settings - global configuration managed by Super Admin
export const platformSettings = pgTable("platform_settings", {
  id: varchar("id").primaryKey().default("default"),
  requireEduEmail: boolean("require_edu_email").notNull().default(true),
  requireTeamCode: boolean("require_team_code").notNull().default(true),
  competitionMode: varchar("competition_mode").notNull().default("individual"), // individual, team
  totalWeeks: integer("total_weeks").notNull().default(8),
  scoringWeightFinancial: integer("scoring_weight_financial").notNull().default(50),
  scoringWeightCultural: integer("scoring_weight_cultural").notNull().default(50),
  easterEggBonusEnabled: boolean("easter_egg_bonus_enabled").notNull().default(true),
  easterEggBonusPercentage: integer("easter_egg_bonus_percentage").notNull().default(5),
  updatedAt: timestamp("updated_at").defaultNow(),
  updatedBy: varchar("updated_by"),
});

export type PlatformSettingsDb = typeof platformSettings.$inferSelect;
export type InsertPlatformSettingsDb = typeof platformSettings.$inferInsert;

// Simulation status enum
export const SIMULATION_STATUS = {
  SETUP: "setup",
  ACTIVE: "active",
  PAUSED: "paused",
  COMPLETED: "completed",
} as const;

export type SimulationStatus = typeof SIMULATION_STATUS[keyof typeof SIMULATION_STATUS];

// Simulations - tracks the lifecycle of each class simulation
export const simulations = pgTable("simulations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().unique(),
  status: varchar("status").notNull().default("setup"), // setup, active, paused, completed
  totalWeeks: integer("total_weeks").notNull().default(8),
  currentWeek: integer("current_week").notNull().default(0),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  startedAt: timestamp("started_at"),
  startedBy: varchar("started_by"),
  completedAt: timestamp("completed_at"),
  completedBy: varchar("completed_by"),
  feedbackFormUrl: text("feedback_form_url"), // Google Form embed URL for post-simulation survey
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Simulation = typeof simulations.$inferSelect;
export type InsertSimulation = typeof simulations.$inferInsert;

// Reminder template types
export const REMINDER_TEMPLATES = {
  WELCOME: "welcome",
  NO_SUBMISSION_WARNING: "no_submission_warning",
  SCORE_UPDATE: "score_update",
  THANK_YOU: "thank_you",
  CUSTOM: "custom",
} as const;

export type ReminderTemplateType = typeof REMINDER_TEMPLATES[keyof typeof REMINDER_TEMPLATES];

// Scheduled reminders - email queue for simulation notifications
export const scheduledReminders = pgTable("scheduled_reminders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull(),
  simulationId: varchar("simulation_id"),
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  audience: varchar("audience").notNull().default("all_students"), // all_students, instructors, specific_team, no_submission
  teamId: varchar("team_id"), // If audience is specific_team
  scheduledFor: timestamp("scheduled_for").notNull(),
  relativeToWeek: integer("relative_to_week"), // Optional: which simulation week this relates to
  templateType: varchar("template_type").default("custom"), // welcome, no_submission_warning, score_update, thank_you, custom
  sendSms: boolean("send_sms").default(false), // Whether to also send SMS
  status: varchar("status").notNull().default("pending"), // pending, sent, failed, cancelled
  sentAt: timestamp("sent_at"),
  sendCount: integer("send_count").default(0),
  failCount: integer("fail_count").default(0),
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type ScheduledReminder = typeof scheduledReminders.$inferSelect;
export type InsertScheduledReminder = typeof scheduledReminders.$inferInsert;
