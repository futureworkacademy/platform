import { sql } from "drizzle-orm";
import { boolean, index, integer, jsonb, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

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
