import { z } from "zod";

// Company state schema
export const companyStateSchema = z.object({
  revenue: z.number(),
  employees: z.number(),
  morale: z.number().min(0).max(100),
  aiBudget: z.number(),
  reskillingFund: z.number(),
  lobbyingBudget: z.number(),
});

export type CompanyState = z.infer<typeof companyStateSchema>;

// Department schema
export const departmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  aiOption: z.string(),
  jobImpact: z.number(),
  revenueBoost: z.number(),
  risk: z.number(),
  deployed: z.boolean().default(false),
});

export type Department = z.infer<typeof departmentSchema>;

// Global event schema
export const globalEventSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  impact: z.object({
    revenue: z.number().optional(),
    morale: z.number().optional(),
    employees: z.number().optional(),
  }),
});

export type GlobalEvent = z.infer<typeof globalEventSchema>;

// Briefing article schema
export const briefingArticleSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  source: z.string(),
  insights: z.array(z.string()),
  category: z.enum(["ai", "trade", "workforce", "technology", "policy"]),
});

export type BriefingArticle = z.infer<typeof briefingArticleSchema>;

// Weekly briefing schema
export const weeklyBriefingSchema = z.object({
  weekNumber: z.number(),
  date: z.string(),
  articles: z.array(briefingArticleSchema),
  event: globalEventSchema.optional(),
});

export type WeeklyBriefing = z.infer<typeof weeklyBriefingSchema>;

// Decision schema
export const decisionSchema = z.object({
  id: z.string(),
  weekNumber: z.number(),
  type: z.enum(["ai_deployment", "lobbying", "reskilling", "event_response"]),
  departmentId: z.string().optional(),
  lobbyingSpend: z.number().optional(),
  reskillingSpend: z.number().optional(),
  eventMitigation: z.boolean().optional(),
  timestamp: z.string(),
});

export type Decision = z.infer<typeof decisionSchema>;

export const insertDecisionSchema = decisionSchema.omit({ id: true, timestamp: true });
export type InsertDecision = z.infer<typeof insertDecisionSchema>;

// Team schema
export const teamSchema = z.object({
  id: z.string(),
  name: z.string(),
  members: z.array(z.string()),
  companyState: companyStateSchema,
  currentWeek: z.number(),
  totalWeeks: z.number(),
  decisions: z.array(decisionSchema),
  weeklyHistory: z.array(z.object({
    week: z.number(),
    revenue: z.number(),
    employees: z.number(),
    morale: z.number(),
    financialScore: z.number(),
    culturalScore: z.number(),
  })),
});

export type Team = z.infer<typeof teamSchema>;

export const insertTeamSchema = z.object({
  name: z.string().min(1, "Team name is required"),
  members: z.array(z.string()).min(1, "At least one member is required"),
  totalWeeks: z.number().min(4).max(12).default(8),
});

export type InsertTeam = z.infer<typeof insertTeamSchema>;

// Leaderboard entry
export const leaderboardEntrySchema = z.object({
  teamId: z.string(),
  teamName: z.string(),
  rank: z.number(),
  previousRank: z.number().optional(),
  financialScore: z.number(),
  culturalScore: z.number(),
  combinedScore: z.number(),
  currentWeek: z.number(),
});

export type LeaderboardEntry = z.infer<typeof leaderboardEntrySchema>;

// People analytics data
export const peopleAnalyticsSchema = z.object({
  sentimentByDepartment: z.array(z.object({
    department: z.string(),
    sentiment: z.number(),
    trend: z.enum(["up", "down", "stable"]),
  })),
  keyIssues: z.array(z.object({
    id: z.string(),
    issue: z.string(),
    priority: z.enum(["high", "medium", "low"]),
    affectedEmployees: z.number(),
    category: z.string(),
  })),
  behaviorTrends: z.array(z.object({
    week: z.number(),
    productivity: z.number(),
    engagement: z.number(),
    turnoverRisk: z.number(),
  })),
  employeeSegments: z.array(z.object({
    segment: z.string(),
    count: z.number(),
    avgMorale: z.number(),
  })),
});

export type PeopleAnalytics = z.infer<typeof peopleAnalyticsSchema>;

// Game session schema
export const gameSessionSchema = z.object({
  id: z.string(),
  startDate: z.string(),
  teams: z.array(teamSchema),
  currentGlobalWeek: z.number(),
  isActive: z.boolean(),
});

export type GameSession = z.infer<typeof gameSessionSchema>;

// Keep existing user schema for compatibility
import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
