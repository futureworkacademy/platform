import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDecisionSchema, insertTeamSchema } from "@shared/schema";
import { z } from "zod";
import { isAuthenticated, authStorage } from "./replit_integrations/auth";
import { db } from "./db";
import { users, organizationMembers, ROLES, type Role } from "@shared/models/auth";
import { teams } from "@shared/schema";
import { eq } from "drizzle-orm";
import { institutions } from "@shared/institutions";
import { organizationStorage } from "./organization-storage";
import { validateEduEmail, generateTeamCode } from "./auth-middleware";
import { sendSmsNotification, isTwilioConfigured } from "./twilio-service";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get("/api/institutions", (_req, res) => {
    res.json(institutions);
  });

  app.get("/api/team", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const user = await authStorage.getUser(userId);
      if (!user?.teamId) {
        return res.json(null);
      }
      
      const team = await storage.getTeam(user.teamId);
      res.json(team || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch team" });
    }
  });

  app.get("/api/admin/teams", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await authStorage.getUser(userId);
      if (user?.isAdmin !== "true") {
        return res.status(403).json({ error: "Admin access required" });
      }
      
      const teams = await storage.getAllTeams();
      res.json(teams);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch teams" });
    }
  });

  app.post("/api/admin/teams", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await authStorage.getUser(userId);
      if (user?.isAdmin !== "true") {
        return res.status(403).json({ error: "Admin access required" });
      }
      
      const validationResult = insertTeamSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid team data",
          details: validationResult.error.flatten() 
        });
      }
      const team = await storage.createTeam(validationResult.data);
      
      // Log activity
      await storage.logActivity({
        eventType: "team_created",
        userId: userId,
        userEmail: user?.email || undefined,
        userName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || undefined : undefined,
        teamId: team.id,
        teamName: team.name,
        details: { action: "admin_created_team" },
      });
      
      res.json(team);
    } catch (error) {
      res.status(500).json({ error: "Failed to create team" });
    }
  });

  app.get("/api/admin/users", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await authStorage.getUser(userId);
      if (user?.isAdmin !== "true") {
        return res.status(403).json({ error: "Admin access required" });
      }
      
      const allUsers = await db.select().from(users);
      res.json(allUsers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.post("/api/admin/assign-team", isAuthenticated, async (req: any, res) => {
    try {
      const adminUserId = req.user?.claims?.sub;
      const adminUser = await authStorage.getUser(adminUserId);
      if (adminUser?.isAdmin !== "true") {
        return res.status(403).json({ error: "Admin access required" });
      }
      
      const { userId, teamId } = req.body;
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }
      
      await db.update(users).set({ teamId, updatedAt: new Date() }).where(eq(users.id, userId));
      const updatedUser = await authStorage.getUser(userId);
      const team = teamId ? await storage.getTeam(teamId) : null;
      
      // Log activity
      await storage.logActivity({
        eventType: "user_assigned",
        userId: adminUserId,
        userEmail: adminUser?.email || undefined,
        userName: adminUser ? `${adminUser.firstName || ''} ${adminUser.lastName || ''}`.trim() || undefined : undefined,
        teamId: teamId || undefined,
        teamName: team?.name,
        details: { 
          assignedUserId: userId,
          assignedUserEmail: updatedUser?.email,
          action: teamId ? "assigned_to_team" : "removed_from_team",
        },
      });
      
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ error: "Failed to assign team" });
    }
  });

  app.post("/api/admin/set-admin", isAuthenticated, async (req: any, res) => {
    try {
      const adminUserId = req.user?.claims?.sub;
      const adminUser = await authStorage.getUser(adminUserId);
      if (adminUser?.isAdmin !== "true") {
        return res.status(403).json({ error: "Admin access required" });
      }
      
      const { userId, isAdmin } = req.body;
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }
      
      await db.update(users).set({ isAdmin: isAdmin ? "true" : "false", updatedAt: new Date() }).where(eq(users.id, userId));
      const updatedUser = await authStorage.getUser(userId);
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ error: "Failed to update admin status" });
    }
  });

  app.post("/api/team/complete-research", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await authStorage.getUser(userId);
      if (!user?.teamId) {
        return res.status(404).json({ error: "No team assigned" });
      }
      const result = await storage.completeResearch(user.teamId);
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }
      res.json(result.team);
    } catch (error) {
      res.status(500).json({ error: "Failed to complete research" });
    }
  });

  app.post("/api/research/mark-viewed/:reportId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await authStorage.getUser(userId);
      if (!user?.teamId) {
        return res.status(404).json({ error: "No team assigned" });
      }
      const updatedTeam = await storage.markReportViewed(user.teamId, req.params.reportId);
      res.json(updatedTeam);
    } catch (error) {
      res.status(500).json({ error: "Failed to mark report as viewed" });
    }
  });

  app.get("/api/research/progress", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await authStorage.getUser(userId);
      if (!user?.teamId) {
        return res.json({ viewed: 0, total: 6, percentage: 0 });
      }
      const progress = await storage.getResearchProgress(user.teamId);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch research progress" });
    }
  });

  app.get("/api/research/reports", isAuthenticated, async (req: any, res) => {
    try {
      const reports = await storage.getResearchReports();
      res.json(reports);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch research reports" });
    }
  });

  app.get("/api/research/historical", isAuthenticated, async (req: any, res) => {
    try {
      const data = await storage.getHistoricalData();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch historical data" });
    }
  });

  app.get("/api/research/workforce", isAuthenticated, async (req: any, res) => {
    try {
      const demographics = await storage.getWorkforceDemographics();
      res.json(demographics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch workforce demographics" });
    }
  });

  app.get("/api/departments", isAuthenticated, async (req: any, res) => {
    try {
      const departments = await storage.getDepartments();
      res.json(departments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch departments" });
    }
  });

  app.get("/api/briefing/:weekNumber?", isAuthenticated, async (req: any, res) => {
    try {
      const weekNumber = parseInt(req.params.weekNumber || "1", 10);
      const briefing = await storage.getWeeklyBriefing(weekNumber);
      res.json(briefing);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch briefing" });
    }
  });

  app.get("/api/leaderboard", isAuthenticated, async (req: any, res) => {
    try {
      const leaderboard = await storage.getLeaderboard();
      res.json(leaderboard);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  app.get("/api/analytics", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await authStorage.getUser(userId);
      if (!user?.teamId) {
        return res.json({
          sentimentByDepartment: [],
          keyIssues: [],
          behaviorTrends: [],
          employeeSegments: [],
        });
      }
      const analytics = await storage.getPeopleAnalytics(user.teamId);
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  app.post("/api/decisions", isAuthenticated, async (req: any, res) => {
    try {
      const validationResult = insertDecisionSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid decision data",
          details: validationResult.error.flatten() 
        });
      }

      const userId = req.user?.claims?.sub;
      const user = await authStorage.getUser(userId);
      if (!user?.teamId) {
        return res.status(404).json({ error: "No team assigned" });
      }
      const decision = await storage.addDecision(user.teamId, validationResult.data);
      res.json(decision);
    } catch (error) {
      res.status(500).json({ error: "Failed to process decision" });
    }
  });

  app.post("/api/advance-week", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await authStorage.getUser(userId);
      if (!user?.teamId) {
        return res.status(404).json({ error: "No team assigned" });
      }
      const team = await storage.getTeam(user.teamId);
      const previousWeek = team?.currentWeek || 1;
      
      const updatedTeam = await storage.advanceWeek(user.teamId);
      if (!updatedTeam) {
        return res.status(400).json({ error: "Cannot advance week" });
      }
      
      // Log activity
      await storage.logActivity({
        eventType: "week_advanced",
        userId: userId,
        userEmail: user.email || undefined,
        userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || undefined,
        teamId: user.teamId,
        teamName: updatedTeam.name,
        weekNumber: updatedTeam.currentWeek,
        details: { previousWeek, newWeek: updatedTeam.currentWeek },
      });
      
      res.json(updatedTeam);
    } catch (error) {
      res.status(500).json({ error: "Failed to advance week" });
    }
  });

  app.get("/api/scenario/:weekNumber", isAuthenticated, async (req: any, res) => {
    try {
      const weekNumber = parseInt(req.params.weekNumber, 10);
      const scenario = await storage.getWeeklyScenario(weekNumber);
      if (!scenario) {
        return res.status(404).json({ error: "Scenario not found" });
      }
      res.json(scenario);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch scenario" });
    }
  });

  app.get("/api/decisions/:weekNumber", isAuthenticated, async (req: any, res) => {
    try {
      const weekNumber = parseInt(req.params.weekNumber, 10);
      const decisions = await storage.getWeeklyDecisions(weekNumber);
      res.json(decisions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch decisions" });
    }
  });

  app.post("/api/submit-decision", isAuthenticated, async (req: any, res) => {
    try {
      const { decisionId, optionId, rationale } = req.body;
      if (!decisionId || !optionId) {
        return res.status(400).json({ error: "Missing decisionId or optionId" });
      }
      
      const userId = req.user?.claims?.sub;
      const user = await authStorage.getUser(userId);
      if (!user?.teamId) {
        return res.status(404).json({ error: "No team assigned" });
      }
      
      const team = await storage.getTeam(user.teamId);
      const updatedTeam = await storage.submitDecision(user.teamId, decisionId, optionId, rationale);
      if (!updatedTeam) {
        return res.status(400).json({ error: "Failed to submit decision" });
      }
      
      // Log activity
      await storage.logActivity({
        eventType: "decision_submitted",
        userId: userId,
        userEmail: user.email || undefined,
        userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || undefined,
        teamId: user.teamId,
        teamName: team?.name,
        weekNumber: team?.currentWeek,
        details: { decisionId, optionId, hasRationale: !!rationale },
      });
      
      res.json(updatedTeam);
    } catch (error) {
      res.status(500).json({ error: "Failed to submit decision" });
    }
  });

  app.get("/api/enhanced-decisions/:weekNumber", isAuthenticated, async (req: any, res) => {
    try {
      const weekNumber = parseInt(req.params.weekNumber, 10);
      const decisions = await storage.getEnhancedDecisions(weekNumber);
      res.json(decisions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch enhanced decisions" });
    }
  });

  app.post("/api/submit-enhanced-decision", isAuthenticated, async (req: any, res) => {
    try {
      const { decisionId, attributeValues, rationale } = req.body;
      if (!decisionId || !attributeValues || !rationale) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      const wordCount = rationale.trim().split(/\s+/).length;
      if (wordCount < 100) {
        return res.status(400).json({ error: `Rationale must be at least 100 words. Current: ${wordCount}` });
      }
      
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const user = await authStorage.getUser(userId);
      const team = user?.teamId ? await storage.getTeam(user.teamId) : null;
      const weekNumber = team?.currentWeek || 1;
      
      const easterEggsFound = await storage.detectEasterEggs(rationale, weekNumber);
      
      const submission = await storage.submitEnhancedDecision(userId, decisionId, attributeValues, rationale);
      
      // Log activity
      await storage.logActivity({
        eventType: "enhanced_decision_submitted",
        userId: userId,
        userEmail: user?.email || undefined,
        userName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || undefined : undefined,
        teamId: user?.teamId || undefined,
        teamName: team?.name,
        weekNumber,
        details: { 
          decisionId, 
          wordCount,
          easterEggsFound: easterEggsFound.length,
          attributeKeys: Object.keys(attributeValues),
        },
      });
      
      res.json({ 
        submission,
        easterEggsFound: easterEggsFound.length,
        message: easterEggsFound.length > 0 
          ? `Your research is showing! Detected ${easterEggsFound.length} relevant insights.`
          : undefined
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to submit enhanced decision" });
    }
  });

  app.get("/api/admin/simulation-config", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await authStorage.getUser(userId);
      if (user?.isAdmin !== "true") {
        return res.status(403).json({ error: "Admin access required" });
      }
      
      const config = await storage.getSimulationConfig();
      res.json(config);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch simulation config" });
    }
  });

  app.post("/api/admin/simulation-config", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await authStorage.getUser(userId);
      if (user?.isAdmin !== "true") {
        return res.status(403).json({ error: "Admin access required" });
      }
      
      const updatedConfig = await storage.updateSimulationConfig(req.body);
      res.json(updatedConfig);
    } catch (error) {
      res.status(500).json({ error: "Failed to update simulation config" });
    }
  });

  app.get("/api/admin/analytics", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await authStorage.getUser(userId);
      if (user?.isAdmin !== "true") {
        return res.status(403).json({ error: "Admin access required" });
      }
      
      const analytics = await storage.getAdminAnalytics();
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch admin analytics" });
    }
  });

  app.get("/api/admin/player-performance/:playerId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await authStorage.getUser(userId);
      if (user?.isAdmin !== "true") {
        return res.status(403).json({ error: "Admin access required" });
      }
      
      const performance = await storage.getPlayerPerformance(req.params.playerId);
      if (!performance) {
        return res.status(404).json({ error: "Player not found" });
      }
      res.json(performance);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch player performance" });
    }
  });

  app.get("/api/easter-eggs", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await authStorage.getUser(userId);
      if (user?.isAdmin !== "true") {
        return res.status(403).json({ error: "Admin access required" });
      }
      
      const eggs = await storage.getEasterEggs();
      res.json(eggs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch easter eggs" });
    }
  });

  // Activity log routes
  app.get("/api/admin/activity-logs", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await authStorage.getUser(userId);
      if (user?.isAdmin !== "true") {
        return res.status(403).json({ error: "Admin access required" });
      }
      
      const { eventType, userId: filterUserId, teamId, startDate, endDate } = req.query;
      const logs = await storage.getActivityLogs({
        eventType: eventType as string | undefined,
        userId: filterUserId as string | undefined,
        teamId: teamId as string | undefined,
        startDate: startDate as string | undefined,
        endDate: endDate as string | undefined,
      });
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch activity logs" });
    }
  });

  app.get("/api/admin/activity-logs/export", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await authStorage.getUser(userId);
      if (user?.isAdmin !== "true") {
        return res.status(403).json({ error: "Admin access required" });
      }
      
      const format = (req.query.format as "csv" | "json") || "csv";
      const content = await storage.exportActivityLogs(format);
      
      const contentType = format === "csv" ? "text/csv" : "application/json";
      const filename = `activity-logs-${new Date().toISOString().split("T")[0]}.${format}`;
      
      res.setHeader("Content-Type", contentType);
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(content);
    } catch (error) {
      res.status(500).json({ error: "Failed to export activity logs" });
    }
  });

  // Profile routes
  app.get("/api/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await authStorage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        jobTitle: user.jobTitle,
        company: user.company,
        institution: user.institution,
        department: user.department,
        teamId: user.teamId,
        isAdmin: user.isAdmin,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  app.patch("/api/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { profileUpdateSchema } = await import("@shared/schema");
      const parsed = profileUpdateSchema.safeParse(req.body);
      
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid profile data", details: parsed.error.errors });
      }
      
      const user = await authStorage.updateProfile(userId, parsed.data);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        jobTitle: user.jobTitle,
        company: user.company,
        institution: user.institution,
        department: user.department,
        teamId: user.teamId,
        isAdmin: user.isAdmin,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  app.patch("/api/auth/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { firstName, lastName, institution } = req.body;
      
      const user = await authStorage.updateProfile(userId, { firstName, lastName, institution });
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  app.post("/api/auth/request-verification", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { schoolEmail } = req.body;
      
      if (!schoolEmail || !schoolEmail.endsWith('.edu')) {
        return res.status(400).json({ error: "A valid .edu email address is required" });
      }
      
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const expires = new Date(Date.now() + 30 * 60 * 1000);
      
      await authStorage.updateProfile(userId, {
        schoolEmail,
        verificationCode: code,
        verificationCodeExpires: expires,
      });
      
      console.log(`[Verification] Code for ${schoolEmail}: ${code} (expires: ${expires.toISOString()})`);
      
      res.json({ 
        success: true, 
        message: "Verification code generated. Check with your instructor if you don't receive an email." 
      });
    } catch (error) {
      console.error("[Verification] Error:", error);
      res.status(500).json({ error: "Failed to generate verification code" });
    }
  });

  app.post("/api/auth/verify-email", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { code } = req.body;
      
      const user = await authStorage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      if (!user.verificationCode) {
        return res.status(400).json({ error: "No verification pending" });
      }
      
      if (user.verificationCodeExpires && new Date() > user.verificationCodeExpires) {
        return res.status(400).json({ error: "Verification code expired. Please request a new one." });
      }
      
      if (user.verificationCode !== code.toUpperCase()) {
        return res.status(400).json({ error: "Invalid verification code" });
      }
      
      await authStorage.updateProfile(userId, {
        schoolEmailVerified: "true",
        verificationCode: null,
        verificationCodeExpires: null,
      });
      
      const updatedUser = await authStorage.getUser(userId);
      res.json({ success: true, user: updatedUser });
    } catch (error) {
      console.error("[Verification] Error:", error);
      res.status(500).json({ error: "Failed to verify email" });
    }
  });

  app.post("/api/feedback", async (req, res) => {
    try {
      const { name, email, subject, message } = req.body;
      
      if (!name || !email || !message) {
        return res.status(400).json({ error: "Name, email, and message are required" });
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }
      
      // Validate lengths
      if (name.length > 100) {
        return res.status(400).json({ error: "Name is too long (max 100 characters)" });
      }
      if (message.length > 5000) {
        return res.status(400).json({ error: "Message is too long (max 5000 characters)" });
      }
      
      console.log("[Feedback] Received:", { name, email, subject, message: message.substring(0, 100) + "..." });
      
      await storage.logActivity({
        eventType: "feedback_submitted",
        userEmail: email,
        userName: name,
        details: { subject, message },
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("[Feedback] Error:", error);
      res.status(500).json({ error: "Failed to submit feedback" });
    }
  });

  // Educator inquiry (public - from "For Educators" page)
  app.post("/api/educator-inquiry", async (req, res) => {
    try {
      const { name, email, phone, institution, inquiryType, message } = req.body;
      
      if (!name || !email || !message) {
        return res.status(400).json({ error: "Name, email, and message are required" });
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }
      
      // Validate lengths
      if (name.length > 100) {
        return res.status(400).json({ error: "Name is too long (max 100 characters)" });
      }
      if (message.length > 5000) {
        return res.status(400).json({ error: "Message is too long (max 5000 characters)" });
      }
      
      console.log("[Educator Inquiry] Received:", { 
        name, 
        email, 
        phone, 
        institution, 
        inquiryType, 
        message: message.substring(0, 100) + "..." 
      });
      
      // Store in database
      const inquiry = await storage.createEducatorInquiry({
        name,
        email,
        phone: phone || null,
        institution: institution || null,
        inquiryType: inquiryType || 'general',
        message,
      });
      
      // Log activity
      await storage.logActivity({
        eventType: "educator_inquiry_submitted",
        userEmail: email,
        userName: name,
        details: { inquiryType, institution, message },
      });
      
      // Send SMS notification to super admin if configured
      try {
        if (await isTwilioConfigured()) {
          // Get super admin's phone number
          const superAdmins = await db.select()
            .from(users)
            .where(eq(users.isAdmin, 'super_admin'));
          
          // Also check for legacy 'true' super admin
          const legacySuperAdmins = await db.select()
            .from(users)
            .where(eq(users.isAdmin, 'true'));
          
          const allSuperAdmins = [...superAdmins, ...legacySuperAdmins];
          
          for (const admin of allSuperAdmins) {
            // Check if admin has a phone associated with any organization they own
            const adminOrgs = await organizationStorage.getOrganizationsByOwner(admin.id);
            for (const org of adminOrgs) {
              if (org.notifyOnSignup && org.notifyPhone) {
                await sendSmsNotification(org.notifyPhone, 'educator_inquiry', {
                  inquirerName: name,
                  inquirerEmail: email,
                  inquiryType: inquiryType || 'general',
                  institution: institution || undefined,
                });
                break; // Only notify once per admin
              }
            }
          }
        }
      } catch (smsError) {
        console.error("[Educator Inquiry] SMS notification failed:", smsError);
        // Don't fail the request if SMS fails
      }
      
      res.json({ success: true, id: inquiry?.id });
    } catch (error) {
      console.error("[Educator Inquiry] Error:", error);
      res.status(500).json({ error: "Failed to submit inquiry" });
    }
  });

  // ==================== ORGANIZATION ROUTES ====================
  
  // Validate team code (public - for signup flow)
  app.post("/api/validate-team-code", async (req, res) => {
    try {
      const { code } = req.body;
      if (!code) {
        return res.status(400).json({ error: "Team code is required" });
      }
      
      const result = await organizationStorage.validateInviteCode(code.toUpperCase());
      if (!result.valid) {
        return res.status(400).json({ error: result.error });
      }
      
      res.json({ 
        valid: true, 
        organizationName: result.organization?.name,
        organizationId: result.organization?.id 
      });
    } catch (error) {
      console.error("[Team Code] Validation error:", error);
      res.status(500).json({ error: "Failed to validate team code" });
    }
  });

  // Join organization with team code
  app.post("/api/join-organization", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await authStorage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const { teamCode, code, phoneNumber, smsConsent } = req.body;
      const teamCodeValue = teamCode || code; // Support both field names
      
      if (!teamCodeValue) {
        return res.status(400).json({ error: "Team code is required" });
      }

      // SECURITY: Only allow joining if user has a verified .edu email in their profile
      // We do NOT accept schoolEmail from request body to prevent bypassing verification
      if (user.schoolEmailVerified !== "true") {
        return res.status(400).json({ error: "Please verify your .edu email before joining an organization." });
      }
      
      const userSchoolEmail = user.schoolEmail;
      if (!userSchoolEmail || !validateEduEmail(userSchoolEmail)) {
        return res.status(400).json({ error: "A verified .edu email is required. Please verify your email first." });
      }

      // Validate the team code
      const result = await organizationStorage.validateInviteCode(teamCodeValue.toUpperCase());
      if (!result.valid || !result.invite || !result.organization) {
        return res.status(400).json({ error: result.error || "Invalid team code" });
      }

      // Check if already a member
      const existingMember = await organizationStorage.getMember(userId, result.organization.id);
      if (existingMember) {
        return res.status(400).json({ error: "You are already a member of this organization" });
      }

      // Add user as active student member (auto-approved with valid code)
      await organizationStorage.addMember({
        userId,
        organizationId: result.organization.id,
        role: ROLES.STUDENT,
        status: "active", // Auto-approve when they have a valid code and verified email
      });

      // Increment invite usage
      await organizationStorage.incrementInviteUsage(result.invite.id);

      // Note: phoneNumber and smsConsent can be stored if we add user phone field later
      // For now, they're logged but not persisted

      // Notify admins via in-app notifications
      await organizationStorage.notifyAdminsOfSignup(result.organization.id, {
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: userSchoolEmail || user.email || "",
      });

      // Also try to send SMS notifications to admins
      try {
        const studentName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "New Student";
        await notifyAdminViaSmsForOrg(
          result.organization.id,
          studentName,
          userSchoolEmail || user.email || "",
          result.organization.name
        );
      } catch (smsError) {
        console.log("[SMS] Non-critical SMS notification failed:", smsError);
      }

      res.json({ 
        success: true, 
        message: "You have joined the organization successfully!",
        organizationName: result.organization.name 
      });
    } catch (error) {
      console.error("[Join Org] Error:", error);
      res.status(500).json({ error: "Failed to join organization" });
    }
  });

  // Get user's memberships
  app.get("/api/my-memberships", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const memberships = await organizationStorage.getMembershipsByUser(userId);
      
      // Enrich with organization details
      const enriched = await Promise.all(memberships.map(async (m) => {
        const org = await organizationStorage.getOrganization(m.organizationId);
        return { ...m, organization: org };
      }));
      
      res.json(enriched);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch memberships" });
    }
  });

  // Get user's notifications
  app.get("/api/notifications", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const notifications = await organizationStorage.getNotificationsForUser(userId);
      const unreadCount = await organizationStorage.getUnreadCount(userId);
      res.json({ notifications, unreadCount });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  // Mark notification as read
  app.post("/api/notifications/:id/read", isAuthenticated, async (req: any, res) => {
    try {
      await organizationStorage.markNotificationRead(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to mark notification read" });
    }
  });

  // ==================== SUPER ADMIN ROUTES ====================
  
  // Get all organizations (Super Admin only)
  app.get("/api/super-admin/organizations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const isSuperAdmin = await organizationStorage.isSuperAdmin(userId);
      if (!isSuperAdmin) {
        return res.status(403).json({ error: "Super Admin access required" });
      }
      
      const orgs = await organizationStorage.getAllOrganizations();
      res.json(orgs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch organizations" });
    }
  });

  // Create organization (Super Admin only)
  app.post("/api/super-admin/organizations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const isSuperAdmin = await organizationStorage.isSuperAdmin(userId);
      if (!isSuperAdmin) {
        return res.status(403).json({ error: "Super Admin access required" });
      }

      const { name, description, ownerEmail, maxMembers, notifyPhone } = req.body;
      if (!name) {
        return res.status(400).json({ error: "Organization name is required" });
      }

      // Generate unique team code
      let code = generateTeamCode();
      let existing = await organizationStorage.getOrganizationByCode(code);
      while (existing) {
        code = generateTeamCode();
        existing = await organizationStorage.getOrganizationByCode(code);
      }

      // Find owner by email if provided, otherwise use super admin
      let ownerId = userId;
      if (ownerEmail) {
        const [owner] = await db.select().from(users).where(eq(users.email, ownerEmail));
        if (owner) {
          ownerId = owner.id;
        }
      }

      const org = await organizationStorage.createOrganization({
        code,
        name,
        description,
        ownerId,
        maxMembers: maxMembers || 100,
        notifyOnSignup: !!notifyPhone,
        notifyPhone: notifyPhone || undefined,
      });

      // If owner is different from creator, add them as class admin
      if (ownerId !== userId) {
        await organizationStorage.addMember({
          userId: ownerId,
          organizationId: org.id,
          role: ROLES.CLASS_ADMIN,
          status: "active",
          approvedBy: userId,
          approvedAt: new Date(),
        });
      }

      res.json(org);
    } catch (error) {
      console.error("[Create Org] Error:", error);
      res.status(500).json({ error: "Failed to create organization" });
    }
  });

  // Update organization (Super Admin only)
  app.put("/api/super-admin/organizations/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const isSuperAdmin = await organizationStorage.isSuperAdmin(userId);
      if (!isSuperAdmin) {
        return res.status(403).json({ error: "Super Admin access required" });
      }

      const { id } = req.params;
      const { name, description, maxMembers, notifyPhone, notifyOnSignup, status } = req.body;

      // Validate required fields
      if (!name || typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ error: "Organization name is required" });
      }

      // Validate status
      const validStatuses = ['active', 'inactive', 'archived'];
      if (status && !validStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status. Must be one of: active, inactive, archived" });
      }

      // Validate maxMembers
      const parsedMaxMembers = typeof maxMembers === 'number' && !isNaN(maxMembers) && maxMembers > 0 
        ? maxMembers 
        : undefined;

      const org = await organizationStorage.updateOrganization(id, {
        name: name.trim(),
        description: description || undefined,
        maxMembers: parsedMaxMembers,
        notifyPhone: notifyPhone || undefined,
        notifyOnSignup: typeof notifyOnSignup === 'boolean' ? notifyOnSignup : undefined,
        status: status || undefined,
      });

      if (!org) {
        return res.status(404).json({ error: "Organization not found" });
      }

      res.json(org);
    } catch (error) {
      console.error("[Update Org] Error:", error);
      res.status(500).json({ error: "Failed to update organization" });
    }
  });

  // Generate invite code for organization (Super Admin only)
  app.post("/api/super-admin/invites", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const isSuperAdmin = await organizationStorage.isSuperAdmin(userId);
      if (!isSuperAdmin) {
        return res.status(403).json({ error: "Super Admin access required" });
      }

      const { organizationId, maxUses, expiresAt } = req.body;
      if (!organizationId) {
        return res.status(400).json({ error: "organizationId is required" });
      }

      // Generate unique code
      let code = generateTeamCode();
      let existing = await organizationStorage.getInviteByCode(code);
      while (existing) {
        code = generateTeamCode();
        existing = await organizationStorage.getInviteByCode(code);
      }

      const invite = await organizationStorage.createInvite({
        code,
        organizationId,
        createdBy: userId,
        maxUses: maxUses || 100,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      });

      res.json(invite);
    } catch (error) {
      console.error("[Create Invite] Error:", error);
      res.status(500).json({ error: "Failed to create invite" });
    }
  });

  // Promote user to Class Admin (Super Admin only)
  app.post("/api/super-admin/promote-class-admin", isAuthenticated, async (req: any, res) => {
    try {
      const adminUserId = req.user?.claims?.sub;
      const isSuperAdmin = await organizationStorage.isSuperAdmin(adminUserId);
      if (!isSuperAdmin) {
        return res.status(403).json({ error: "Super Admin access required" });
      }

      const { userId, organizationId } = req.body;
      if (!userId || !organizationId) {
        return res.status(400).json({ error: "userId and organizationId are required" });
      }

      // Check if already a member
      let member = await organizationStorage.getMember(userId, organizationId);
      
      if (member) {
        // Update existing membership
        await organizationStorage.updateMember(member.id, {
          role: ROLES.CLASS_ADMIN,
          status: "active",
          approvedBy: adminUserId,
          approvedAt: new Date(),
        });
      } else {
        // Create new membership
        member = await organizationStorage.addMember({
          userId,
          organizationId,
          role: ROLES.CLASS_ADMIN,
          status: "active",
          approvedBy: adminUserId,
          approvedAt: new Date(),
        });
      }

      // Also update the organization owner if needed
      const org = await organizationStorage.getOrganization(organizationId);
      if (org && org.ownerId !== userId) {
        await organizationStorage.updateOrganization(organizationId, { ownerId: userId });
      }

      res.json({ success: true, message: "User promoted to Class Admin" });
    } catch (error) {
      console.error("[Promote] Error:", error);
      res.status(500).json({ error: "Failed to promote user" });
    }
  });

  // Get all users with their roles (Super Admin only)
  app.get("/api/super-admin/users-with-roles", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const isSuperAdmin = await organizationStorage.isSuperAdmin(userId);
      if (!isSuperAdmin) {
        return res.status(403).json({ error: "Super Admin access required" });
      }

      const allUsers = await db.select().from(users);
      
      // Enrich with role info
      const enriched = await Promise.all(allUsers.map(async (user) => {
        const memberships = await organizationStorage.getMembershipsByUser(user.id);
        const highestRole = await organizationStorage.getUserRole(user.id);
        return { 
          ...user, 
          memberships, 
          highestRole,
          membershipCount: memberships.length 
        };
      }));

      res.json(enriched);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // ==================== CLASS ADMIN ROUTES ====================
  
  // Get organizations I manage (Class Admin)
  app.get("/api/class-admin/my-organizations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const memberships = await organizationStorage.getMembershipsByUser(userId);
      
      // Get orgs where user is class admin or super admin
      const adminMemberships = memberships.filter(m => 
        m.role === ROLES.CLASS_ADMIN || m.role === ROLES.SUPER_ADMIN
      );
      
      const orgs = await Promise.all(adminMemberships.map(async (m) => {
        const org = await organizationStorage.getOrganization(m.organizationId);
        const members = await organizationStorage.getMembersByOrganization(m.organizationId);
        const invites = await organizationStorage.getInvitesByOrganization(m.organizationId);
        return { ...org, memberCount: members.length, invites };
      }));
      
      res.json(orgs.filter(Boolean));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch organizations" });
    }
  });

  // Get members of an organization (Class Admin)
  app.get("/api/class-admin/organizations/:orgId/members", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { orgId } = req.params;
      
      // Check if user is admin of this org or super admin
      const isSuperAdmin = await organizationStorage.isSuperAdmin(userId);
      const isOrgAdmin = await organizationStorage.isClassAdmin(userId, orgId);
      
      if (!isSuperAdmin && !isOrgAdmin) {
        return res.status(403).json({ error: "Admin access required for this organization" });
      }

      const members = await organizationStorage.getMembersByOrganization(orgId);
      
      // Enrich with user details
      const enriched = await Promise.all(members.map(async (m) => {
        const user = await authStorage.getUser(m.userId);
        return { ...m, user };
      }));

      res.json(enriched);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch members" });
    }
  });

  // Approve/activate member (Class Admin)
  app.post("/api/class-admin/members/:memberId/approve", isAuthenticated, async (req: any, res) => {
    try {
      const adminUserId = req.user?.claims?.sub;
      const { memberId } = req.params;
      
      // Get the member to find org ID
      const allMembers = await db.select().from(organizationMembers).where(eq(organizationMembers.id, memberId));
      if (allMembers.length === 0) {
        return res.status(404).json({ error: "Member not found" });
      }
      
      const member = allMembers[0];
      
      // Check permissions
      const isSuperAdmin = await organizationStorage.isSuperAdmin(adminUserId);
      const isOrgAdmin = await organizationStorage.isClassAdmin(adminUserId, member.organizationId);
      
      if (!isSuperAdmin && !isOrgAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      await organizationStorage.updateMember(memberId, {
        status: "active",
        approvedBy: adminUserId,
        approvedAt: new Date(),
      });

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to approve member" });
    }
  });

  // Assign member to team (Class Admin)
  app.post("/api/class-admin/members/:memberId/assign-team", isAuthenticated, async (req: any, res) => {
    try {
      const adminUserId = req.user?.claims?.sub;
      const { memberId } = req.params;
      const { teamId } = req.body;
      
      // Get the member
      const allMembers = await db.select().from(organizationMembers).where(eq(organizationMembers.id, memberId));
      if (allMembers.length === 0) {
        return res.status(404).json({ error: "Member not found" });
      }
      
      const member = allMembers[0];
      
      // Check permissions
      const isSuperAdmin = await organizationStorage.isSuperAdmin(adminUserId);
      const isOrgAdmin = await organizationStorage.isClassAdmin(adminUserId, member.organizationId);
      
      if (!isSuperAdmin && !isOrgAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      // Update user's team assignment
      await db.update(users).set({ teamId, updatedAt: new Date() }).where(eq(users.id, member.userId));

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to assign team" });
    }
  });

  // Create team within organization (Class Admin)
  app.post("/api/class-admin/organizations/:orgId/teams", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { orgId } = req.params;
      
      // Check permissions
      const isSuperAdmin = await organizationStorage.isSuperAdmin(userId);
      const isOrgAdmin = await organizationStorage.isClassAdmin(userId, orgId);
      
      if (!isSuperAdmin && !isOrgAdmin) {
        return res.status(403).json({ error: "Admin access required for this organization" });
      }

      const validationResult = insertTeamSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid team data",
          details: validationResult.error.flatten() 
        });
      }

      // Create team with organization ID
      const team = await storage.createTeam({
        ...validationResult.data,
        organizationId: orgId,
      });

      res.json(team);
    } catch (error) {
      res.status(500).json({ error: "Failed to create team" });
    }
  });

  // Get teams for organization (Class Admin)
  app.get("/api/class-admin/organizations/:orgId/teams", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { orgId } = req.params;
      
      // Check permissions
      const isSuperAdmin = await organizationStorage.isSuperAdmin(userId);
      const isOrgAdmin = await organizationStorage.isClassAdmin(userId, orgId);
      
      if (!isSuperAdmin && !isOrgAdmin) {
        return res.status(403).json({ error: "Admin access required for this organization" });
      }

      // Get teams for this organization
      const orgTeams = await db.select().from(teams).where(eq(teams.organizationId, orgId));
      res.json(orgTeams.map(t => ({
        id: t.id,
        name: t.name,
        members: t.members || [],
        currentWeek: t.currentWeek,
        organizationId: t.organizationId,
      })));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch teams" });
    }
  });

  // Assign member to team (alternate path for Class Admin)
  app.post("/api/class-admin/organizations/:orgId/assign-team", isAuthenticated, async (req: any, res) => {
    try {
      const adminUserId = req.user?.claims?.sub;
      const { orgId } = req.params;
      const { memberId, teamId } = req.body;
      
      // Check permissions
      const isSuperAdmin = await organizationStorage.isSuperAdmin(adminUserId);
      const isOrgAdmin = await organizationStorage.isClassAdmin(adminUserId, orgId);
      
      if (!isSuperAdmin && !isOrgAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      // Get the member
      const allMembers = await db.select().from(organizationMembers).where(eq(organizationMembers.id, memberId));
      if (allMembers.length === 0) {
        return res.status(404).json({ error: "Member not found" });
      }
      
      const member = allMembers[0];

      // Update user's team assignment
      await db.update(users).set({ teamId, updatedAt: new Date() }).where(eq(users.id, member.userId));

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to assign team" });
    }
  });

  // Approve member (Class Admin - alternate path)
  app.post("/api/class-admin/organizations/:orgId/approve-member", isAuthenticated, async (req: any, res) => {
    try {
      const adminUserId = req.user?.claims?.sub;
      const { orgId } = req.params;
      const { memberId } = req.body;
      
      // Check permissions
      const isSuperAdmin = await organizationStorage.isSuperAdmin(adminUserId);
      const isOrgAdmin = await organizationStorage.isClassAdmin(adminUserId, orgId);
      
      if (!isSuperAdmin && !isOrgAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      // Update member status
      await organizationStorage.updateMember(memberId, {
        status: "active",
        approvedBy: adminUserId,
        approvedAt: new Date(),
      });

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to approve member" });
    }
  });

  // Remove member from organization (Class Admin)
  app.delete("/api/class-admin/organizations/:orgId/members/:memberId", isAuthenticated, async (req: any, res) => {
    try {
      const adminUserId = req.user?.claims?.sub;
      const { orgId, memberId } = req.params;
      
      // Check permissions
      const isSuperAdmin = await organizationStorage.isSuperAdmin(adminUserId);
      const isOrgAdmin = await organizationStorage.isClassAdmin(adminUserId, orgId);
      
      if (!isSuperAdmin && !isOrgAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      // Remove the member
      await db.delete(organizationMembers).where(eq(organizationMembers.id, memberId));

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to remove member" });
    }
  });

  // Add member to organization by email (Class Admin)
  app.post("/api/class-admin/organizations/:orgId/add-member", isAuthenticated, async (req: any, res) => {
    try {
      const adminUserId = req.user?.claims?.sub;
      const { orgId } = req.params;
      const { email, role = "STUDENT" } = req.body;
      
      // Validate role - Class Admins can only add STUDENT or CLASS_ADMIN, never SUPER_ADMIN
      const allowedRoles = ["STUDENT", "CLASS_ADMIN"];
      if (!allowedRoles.includes(role)) {
        return res.status(400).json({ error: "Invalid role. Allowed: STUDENT, CLASS_ADMIN" });
      }
      
      // Check permissions
      const isSuperAdmin = await organizationStorage.isSuperAdmin(adminUserId);
      const isOrgAdmin = await organizationStorage.isClassAdmin(adminUserId, orgId);
      
      if (!isSuperAdmin && !isOrgAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }
      
      // Only Super Admins can add CLASS_ADMIN members
      if (role === "CLASS_ADMIN" && !isSuperAdmin) {
        return res.status(403).json({ error: "Only Super Admins can add Instructors" });
      }

      // Find user by email
      const [user] = await db.select().from(users).where(eq(users.email, email));
      if (!user) {
        return res.status(404).json({ error: "User not found. They must sign up first." });
      }

      // Check if already a member
      const existingMember = await organizationStorage.getMember(user.id, orgId);
      if (existingMember) {
        return res.status(400).json({ error: "User is already a member of this organization" });
      }

      // Add as member
      const member = await organizationStorage.addMember({
        userId: user.id,
        organizationId: orgId,
        role: role as Role,
        status: "active",
      });

      res.json(member);
    } catch (error) {
      console.error("Error adding member:", error);
      res.status(500).json({ error: "Failed to add member" });
    }
  });

  // Update member role (Class Admin)
  app.patch("/api/class-admin/organizations/:orgId/members/:memberId/role", isAuthenticated, async (req: any, res) => {
    try {
      const adminUserId = req.user?.claims?.sub;
      const { orgId, memberId } = req.params;
      const { role } = req.body;
      
      // Only super admins can change roles (Class Admins can't promote themselves)
      const isSuperAdmin = await organizationStorage.isSuperAdmin(adminUserId);
      
      if (!isSuperAdmin) {
        return res.status(403).json({ error: "Only Super Admins can change member roles" });
      }

      if (!role || !["STUDENT", "CLASS_ADMIN", "SUPER_ADMIN"].includes(role)) {
        return res.status(400).json({ error: "Invalid role" });
      }

      const updatedMember = await organizationStorage.updateMember(memberId, { role: role as Role });
      if (!updatedMember) {
        return res.status(404).json({ error: "Member not found" });
      }

      res.json(updatedMember);
    } catch (error) {
      console.error("Error updating member role:", error);
      res.status(500).json({ error: "Failed to update member role" });
    }
  });

  // ==================== INITIALIZATION ROUTES ====================
  
  // Check if any Super Admins exist
  app.get("/api/setup/status", async (_req, res) => {
    try {
      const allMembers = await db.select().from(organizationMembers)
        .where(eq(organizationMembers.role, ROLES.SUPER_ADMIN));
      
      res.json({
        hasSuperAdmin: allMembers.length > 0,
        superAdminCount: allMembers.length,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to check setup status" });
    }
  });

  // Initialize Super Admin (only works if no Super Admins exist)
  app.post("/api/setup/initialize-super-admin", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await authStorage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Check if any super admins already exist
      const existingSuperAdmins = await db.select().from(organizationMembers)
        .where(eq(organizationMembers.role, ROLES.SUPER_ADMIN));
      
      if (existingSuperAdmins.length > 0) {
        return res.status(400).json({ error: "Super Admin already exists. Contact existing admin." });
      }

      // Create the Platform organization
      const platformOrg = await organizationStorage.createOrganization({
        code: "PLATFORM",
        name: "Platform Administration",
        description: "Global platform management organization",
        ownerId: userId,
        maxMembers: 1000,
      });

      // Add user as Super Admin
      await organizationStorage.addMember({
        userId,
        organizationId: platformOrg.id,
        role: ROLES.SUPER_ADMIN,
        status: "active",
        approvedBy: userId,
        approvedAt: new Date(),
      });

      // Also update user's isAdmin flag for backward compatibility
      await db.update(users).set({ isAdmin: "true", updatedAt: new Date() }).where(eq(users.id, userId));

      res.json({ 
        success: true, 
        message: "You are now the Super Admin",
        organization: platformOrg 
      });
    } catch (error) {
      console.error("[Init Super Admin] Error:", error);
      res.status(500).json({ error: "Failed to initialize Super Admin" });
    }
  });

  // Get current user's role information
  app.get("/api/my-role", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const role = await organizationStorage.getUserRole(userId);
      const memberships = await organizationStorage.getMembershipsByUser(userId);
      const isSuperAdmin = await organizationStorage.isSuperAdmin(userId);
      const isClassAdmin = await organizationStorage.isClassAdmin(userId);

      res.json({
        role,
        isSuperAdmin,
        isClassAdmin,
        membershipCount: memberships.length,
        memberships,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch role information" });
    }
  });

  // ==================== SMS NOTIFICATION ROUTES ====================
  
  // Check if Twilio is configured
  app.get("/api/notifications/twilio-status", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const isSuperAdmin = await organizationStorage.isSuperAdmin(userId);
      const isClassAdmin = await organizationStorage.isClassAdmin(userId);
      
      if (!isSuperAdmin && !isClassAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const configured = await isTwilioConfigured();
      res.json({ configured });
    } catch (error) {
      res.json({ configured: false });
    }
  });

  // Send test SMS notification (Super Admin only)
  app.post("/api/notifications/test-sms", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const isSuperAdmin = await organizationStorage.isSuperAdmin(userId);
      
      if (!isSuperAdmin) {
        return res.status(403).json({ error: "Super Admin access required" });
      }

      const { phoneNumber } = req.body;
      if (!phoneNumber) {
        return res.status(400).json({ error: "Phone number is required" });
      }

      const result = await sendSmsNotification(phoneNumber, 'student_signup', {
        studentName: 'Test Student',
        studentEmail: 'test@university.edu',
        organizationName: 'Test Organization',
      });

      if (result.success) {
        res.json({ success: true, messageId: result.messageId });
      } else {
        res.status(500).json({ success: false, error: result.error });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to send test SMS" });
    }
  });

  // Utility function to send signup notifications for an organization
  async function notifyAdminViaSmsForOrg(
    organizationId: string, 
    studentName: string, 
    studentEmail: string,
    organizationName: string
  ) {
    try {
      const configured = await isTwilioConfigured();
      if (!configured) {
        console.log("[SMS] Twilio not configured, skipping SMS notification");
        return;
      }

      // Get organization to check if notification is enabled and get phone number
      const org = await organizationStorage.getOrganization(organizationId);
      if (!org) return;

      // Check if organization has SMS notifications enabled and has a phone number
      if (org.notifyOnSignup && org.notifyPhone) {
        console.log(`[SMS] Sending signup notification to ${org.notifyPhone}`);
        const result = await sendSmsNotification(org.notifyPhone, 'student_signup', {
          studentName,
          studentEmail,
          organizationName,
        });
        
        if (result.success) {
          console.log(`[SMS] Notification sent successfully: ${result.messageId}`);
        } else {
          console.log(`[SMS] Failed to send notification: ${result.error}`);
        }
      } else {
        console.log(`[SMS] Organization ${organizationName} does not have SMS notifications enabled or no phone configured`);
      }
    } catch (error) {
      console.error("[SMS] Error sending notification:", error);
    }
  }

  return httpServer;
}
