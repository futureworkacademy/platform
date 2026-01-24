import type { Express } from "express";
import { createServer, type Server } from "http";
import { randomUUID } from "crypto";
import { storage } from "./storage";
import { insertDecisionSchema, insertTeamSchema, defaultCompanyState } from "@shared/schema";
import { z } from "zod";
import { isAuthenticated, authStorage } from "./replit_integrations/auth";
import { db } from "./db";
import { users, organizations, organizationMembers, simulations, scheduledReminders, aboutPageContent, emailTemplates, EMAIL_TEMPLATE_TYPES, ROLES, type Role, SIMULATION_STATUS } from "@shared/models/auth";
import { teams } from "@shared/schema";
import { eq, sql, and } from "drizzle-orm";
import { institutions } from "@shared/institutions";
import { organizationStorage } from "./organization-storage";
import { validateEduEmail, generateTeamCode } from "./auth-middleware";
import { sendSmsNotification, isTwilioConfigured } from "./twilio-service";
import { sendInvitationEmail } from "./services/email";
import sanitizeHtml from "sanitize-html";

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
      
      // Get decision context for LLM evaluation
      const decisions = await storage.getEnhancedDecisions(weekNumber);
      const decision = decisions.find(d => d.id === decisionId);
      const decisionContext = decision ? `${decision.title}: ${decision.context}` : "Business decision";
      
      // Use LLM evaluation for rationale quality (semantic understanding)
      const llmEvaluation = await storage.evaluateRationaleWithLLM(rationale, decisionContext, weekNumber);
      
      // Also run keyword detection as a backup metric
      const keywordMatches = await storage.detectEasterEggs(rationale, weekNumber);
      
      const submission = await storage.submitEnhancedDecision(userId, decisionId, attributeValues, rationale);
      
      // Log activity with both evaluation methods
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
          llmQualityScore: llmEvaluation.score,
          llmQuality: llmEvaluation.quality,
          evidenceUsed: llmEvaluation.evidenceUsed.length,
          keywordMatches: keywordMatches.length,
          attributeKeys: Object.keys(attributeValues),
        },
      });
      
      // Generate feedback message based on LLM evaluation (don't reveal scoring details)
      let feedbackMessage: string | undefined;
      if (llmEvaluation.quality === "excellent") {
        feedbackMessage = "Excellent analysis! Your research application is outstanding.";
      } else if (llmEvaluation.quality === "good") {
        feedbackMessage = "Good work! Your reasoning demonstrates solid understanding.";
      } else if (llmEvaluation.quality === "adequate") {
        feedbackMessage = "Decision recorded. Consider diving deeper into the research materials.";
      }
      
      res.json({ 
        submission,
        qualityFeedback: feedbackMessage,
        researchScore: llmEvaluation.score,
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

  // Platform Settings - GET (any authenticated user can read)
  app.get("/api/platform-settings", isAuthenticated, async (req: any, res) => {
    try {
      const settings = await storage.getPlatformSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch platform settings" });
    }
  });

  // Platform Settings - PUT (Super Admin only)
  app.put("/api/admin/platform-settings", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      
      // Check Super Admin status using organization storage (checks both users table and memberships)
      const isSuperAdmin = await organizationStorage.isSuperAdmin(userId);
      if (!isSuperAdmin) {
        return res.status(403).json({ error: "Super Admin access required" });
      }
      
      // Validate totalWeeks - currently only 4-8 weeks have authored content
      if (req.body.totalWeeks !== undefined) {
        const weeks = Number(req.body.totalWeeks);
        if (weeks < 4 || weeks > 8) {
          return res.status(400).json({ error: "Simulation duration must be between 4 and 8 weeks. Additional weeks coming soon." });
        }
      }
      
      const user = await authStorage.getUser(userId);
      
      const updatedSettings = await storage.updatePlatformSettings(req.body, userId);
      
      // Log the activity
      await storage.logActivity({
        eventType: "admin_action",
        userId: userId,
        userEmail: user?.email || undefined,
        userName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || undefined : undefined,
        details: { 
          action: "platform_settings_updated",
          changes: req.body,
        },
      });
      
      res.json(updatedSettings);
    } catch (error) {
      res.status(500).json({ error: "Failed to update platform settings" });
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

      // Get platform settings to check enrollment requirements
      const platformSettings = await storage.getPlatformSettings();

      const { teamCode, code, organizationId, phoneNumber, smsConsent } = req.body;
      const teamCodeValue = teamCode || code; // Support both field names
      
      // Determine the best email to use for notifications
      const userEmail = user.schoolEmail || user.email || "";
      
      // Check .edu email requirement based on platform settings
      if (platformSettings.requireEduEmail) {
        // SECURITY: Only allow joining if user has a verified .edu email in their profile
        // We do NOT accept schoolEmail from request body to prevent bypassing verification
        if (user.schoolEmailVerified !== "true") {
          return res.status(400).json({ error: "Please verify your .edu email before joining an organization." });
        }
        
        if (!user.schoolEmail || !validateEduEmail(user.schoolEmail)) {
          return res.status(400).json({ error: "A verified .edu email is required. Please verify your email first." });
        }
      }

      let targetOrgId: string;
      let targetOrgName: string;
      let inviteId: string | null = null;

      // Handle organization lookup based on whether team code is required
      if (platformSettings.requireTeamCode) {
        // Team code is required - validate and use it to determine organization
        if (!teamCodeValue) {
          return res.status(400).json({ error: "Team code is required" });
        }
        
        const result = await organizationStorage.validateInviteCode(teamCodeValue.toUpperCase());
        if (!result.valid || !result.invite || !result.organization) {
          return res.status(400).json({ error: result.error || "Invalid team code" });
        }
        
        targetOrgId = result.organization.id;
        targetOrgName = result.organization.name;
        inviteId = result.invite.id;
      } else {
        // Team code is optional
        if (teamCodeValue) {
          // Code provided - validate it
          const result = await organizationStorage.validateInviteCode(teamCodeValue.toUpperCase());
          if (!result.valid || !result.invite || !result.organization) {
            return res.status(400).json({ error: result.error || "Invalid team code" });
          }
          
          targetOrgId = result.organization.id;
          targetOrgName = result.organization.name;
          inviteId = result.invite.id;
        } else if (organizationId) {
          // No code but organization ID provided (for open enrollment)
          const org = await organizationStorage.getOrganization(organizationId);
          if (!org) {
            return res.status(400).json({ error: "Organization not found" });
          }
          
          targetOrgId = org.id;
          targetOrgName = org.name;
        } else {
          // No code and no organization - cannot proceed
          return res.status(400).json({ error: "Please provide a team code or select an organization to join" });
        }
      }

      // Check if already a member
      const existingMember = await organizationStorage.getMember(userId, targetOrgId);
      if (existingMember) {
        return res.status(400).json({ error: "You are already a member of this organization" });
      }

      // Add user as active student member (auto-approved with valid code or open enrollment)
      await organizationStorage.addMember({
        userId,
        organizationId: targetOrgId,
        role: ROLES.STUDENT,
        status: "active",
      });

      // Increment invite usage if we used a code
      if (inviteId) {
        await organizationStorage.incrementInviteUsage(inviteId);
      }

      // Note: phoneNumber and smsConsent can be stored if we add user phone field later
      // For now, they're logged but not persisted

      // Notify admins via in-app notifications
      await organizationStorage.notifyAdminsOfSignup(targetOrgId, {
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: userEmail,
      });

      // Also try to send SMS notifications to admins
      try {
        const studentName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "New Student";
        await notifyAdminViaSmsForOrg(
          targetOrgId,
          studentName,
          userEmail,
          targetOrgName
        );
      } catch (smsError) {
        console.log("[SMS] Non-critical SMS notification failed:", smsError);
      }

      res.json({ 
        success: true, 
        message: "You have joined the organization successfully!",
        organizationName: targetOrgName 
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

  // Get all organization members across all orgs (Super Admin only) - includes invited/imported students
  app.get("/api/super-admin/all-members", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const isSuperAdmin = await organizationStorage.isSuperAdmin(userId);
      if (!isSuperAdmin) {
        return res.status(403).json({ error: "Super Admin access required" });
      }

      // Get all organization members with their org and user info
      const allMembers = await db.select({
        id: organizationMembers.id,
        organizationId: organizationMembers.organizationId,
        userId: organizationMembers.userId,
        role: organizationMembers.role,
        status: organizationMembers.status,
        joinedAt: organizationMembers.joinedAt,
        orgName: organizations.name,
        userEmail: users.email,
        userFirstName: users.firstName,
        userLastName: users.lastName,
      }).from(organizationMembers)
        .leftJoin(organizations, eq(organizationMembers.organizationId, organizations.id))
        .leftJoin(users, eq(organizationMembers.userId, users.id));

      // Enrich with account status
      const enrichedMembers = allMembers.map((member) => {
        const hasAccount = !!(member.userEmail);
        return {
          ...member,
          hasAccount,
          email: member.userEmail || 'No email on file',
          firstName: member.userFirstName || 'Unknown',
          lastName: member.userLastName || '',
        };
      });

      res.json(enrichedMembers);
    } catch (error) {
      console.error("Error fetching all members:", error);
      res.status(500).json({ error: "Failed to fetch organization members" });
    }
  });

  // Get all educator inquiries (Super Admin only)
  app.get("/api/super-admin/educator-inquiries", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const isSuperAdmin = await organizationStorage.isSuperAdmin(userId);
      if (!isSuperAdmin) {
        return res.status(403).json({ error: "Super Admin access required" });
      }

      const { educatorInquiries } = await import("@shared/models/auth");
      const inquiries = await db.select().from(educatorInquiries).orderBy(sql`created_at DESC`);
      res.json(inquiries);
    } catch (error) {
      console.error("[Educator Inquiries] Error:", error);
      res.status(500).json({ error: "Failed to fetch educator inquiries" });
    }
  });

  // Update educator inquiry status/notes (Super Admin only)
  app.patch("/api/super-admin/educator-inquiries/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const isSuperAdmin = await organizationStorage.isSuperAdmin(userId);
      if (!isSuperAdmin) {
        return res.status(403).json({ error: "Super Admin access required" });
      }

      const { id } = req.params;
      const { status, notes } = req.body;
      
      const { educatorInquiries } = await import("@shared/models/auth");
      const [updated] = await db.update(educatorInquiries)
        .set({ 
          status: status || undefined, 
          notes: notes !== undefined ? notes : undefined,
          updatedAt: new Date()
        })
        .where(eq(educatorInquiries.id, id))
        .returning();
      
      if (!updated) {
        return res.status(404).json({ error: "Inquiry not found" });
      }
      
      res.json(updated);
    } catch (error) {
      console.error("[Educator Inquiries] Update error:", error);
      res.status(500).json({ error: "Failed to update inquiry" });
    }
  });

  // Export educator inquiries as CSV (Super Admin only)
  app.get("/api/super-admin/educator-inquiries/export", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const isSuperAdmin = await organizationStorage.isSuperAdmin(userId);
      if (!isSuperAdmin) {
        return res.status(403).json({ error: "Super Admin access required" });
      }

      const { educatorInquiries } = await import("@shared/models/auth");
      const inquiries = await db.select().from(educatorInquiries).orderBy(sql`created_at DESC`);
      
      // Generate CSV
      const headers = ["ID", "Name", "Email", "Phone", "Institution", "Inquiry Type", "Message", "Status", "Notes", "Created At"];
      const rows = inquiries.map(i => [
        i.id,
        i.name,
        i.email,
        i.phone || "",
        i.institution || "",
        i.inquiryType,
        `"${(i.message || "").replace(/"/g, '""')}"`,
        i.status,
        `"${(i.notes || "").replace(/"/g, '""')}"`,
        i.createdAt?.toISOString() || ""
      ]);
      
      const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=educator-inquiries.csv");
      res.send(csv);
    } catch (error) {
      console.error("[Educator Inquiries] Export error:", error);
      res.status(500).json({ error: "Failed to export inquiries" });
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

      // Soft-delete: deactivate the member instead of deleting
      const member = await organizationStorage.getMemberById(memberId);
      if (!member || member.organizationId !== orgId) {
        return res.status(404).json({ error: "Member not found" });
      }

      // Update member status to deactivated
      await db.update(organizationMembers)
        .set({ 
          status: "deactivated",
          deactivatedAt: new Date(),
          deactivatedBy: adminUserId,
        })
        .where(eq(organizationMembers.id, memberId));

      // Remove from team if assigned
      if (member.userId) {
        await db.update(users)
          .set({ teamId: null })
          .where(eq(users.id, member.userId));
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error deactivating member:", error);
      res.status(500).json({ error: "Failed to deactivate member" });
    }
  });

  // Reactivate a deactivated member
  app.post("/api/class-admin/organizations/:orgId/members/:memberId/reactivate", isAuthenticated, async (req: any, res) => {
    try {
      const adminUserId = req.user?.claims?.sub;
      const { orgId, memberId } = req.params;
      
      // Check permissions
      const isSuperAdmin = await organizationStorage.isSuperAdmin(adminUserId);
      const isOrgAdmin = await organizationStorage.isClassAdmin(adminUserId, orgId);
      
      if (!isSuperAdmin && !isOrgAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const member = await organizationStorage.getMemberById(memberId);
      if (!member || member.organizationId !== orgId) {
        return res.status(404).json({ error: "Member not found" });
      }

      if (member.status !== "deactivated") {
        return res.status(400).json({ error: "Member is not deactivated" });
      }

      // Reactivate the member
      await db.update(organizationMembers)
        .set({ 
          status: "active",
          deactivatedAt: null,
          deactivatedBy: null,
        })
        .where(eq(organizationMembers.id, memberId));

      res.json({ success: true });
    } catch (error) {
      console.error("Error reactivating member:", error);
      res.status(500).json({ error: "Failed to reactivate member" });
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

  // Bulk import students from CSV (Class Admin)
  app.post("/api/class-admin/organizations/:orgId/bulk-import", isAuthenticated, async (req: any, res) => {
    try {
      const adminUserId = req.user?.claims?.sub;
      const { orgId } = req.params;
      const { students, sendInvites = true } = req.body;
      
      if (!Array.isArray(students) || students.length === 0) {
        return res.status(400).json({ error: "No students provided" });
      }

      // Limit bulk import to 500 students at a time
      if (students.length > 500) {
        return res.status(400).json({ error: "Maximum 500 students per import. Please split into multiple batches." });
      }

      // Check permissions
      const isSuperAdmin = await organizationStorage.isSuperAdmin(adminUserId);
      const isOrgAdmin = await organizationStorage.isClassAdmin(adminUserId, orgId);
      
      if (!isSuperAdmin && !isOrgAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      // Get organization and admin info for invitation emails
      const org = await organizationStorage.getOrganization(orgId);
      const [adminUser] = await db.select().from(users).where(eq(users.id, adminUserId));
      const instructorName = adminUser ? 
        [adminUser.firstName, adminUser.lastName].filter(Boolean).join(' ') || 'Your Instructor' : 
        'Your Instructor';
      const className = org?.name || 'The Future of Work Simulation';
      const loginUrl = process.env.REPLIT_DOMAINS ? 
        `https://${process.env.REPLIT_DOMAINS.split(',')[0]}` : 
        'https://futureworkacademy.com';

      const results = {
        success: 0,
        failed: 0,
        errors: [] as string[],
        emailsSent: 0,
        emailsFailed: 0,
      };

      // Track newly added students for sending invitations
      const newlyAddedStudents: Array<{ email: string; name: string }> = [];

      for (const student of students) {
        const { email, name, studentId, classLevel } = student;
        
        if (!email) {
          results.failed++;
          results.errors.push(`Missing email for student`);
          continue;
        }

        try {
          // Find user by email
          const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim()));
          
          if (!user) {
            // User doesn't exist - create a placeholder record for them
            // They'll complete their profile when they log in
            const nameParts = (name || '').split(' ').filter(Boolean);
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';
            
            const [newUser] = await db.insert(users).values({
              email: email.toLowerCase().trim(),
              firstName: firstName || null,
              lastName: lastName || null,
              isAdmin: 'false',
            }).returning();

            // Add to organization
            await organizationStorage.addMember({
              userId: newUser.id,
              organizationId: orgId,
              role: "STUDENT" as Role,
              status: "active",
            });
            
            results.success++;
            newlyAddedStudents.push({ email: email.toLowerCase().trim(), name: name || '' });
          } else {
            // Check if already a member
            const existingMember = await organizationStorage.getMember(user.id, orgId);
            if (existingMember) {
              results.failed++;
              results.errors.push(`${email}: Already a member`);
              continue;
            }

            // Add as member
            await organizationStorage.addMember({
              userId: user.id,
              organizationId: orgId,
              role: "STUDENT" as Role,
              status: "active",
            });
            
            results.success++;
            newlyAddedStudents.push({ email: email.toLowerCase().trim(), name: name || '' });
          }
        } catch (studentError: any) {
          results.failed++;
          results.errors.push(`${email}: ${studentError.message || 'Failed to import'}`);
        }
      }

      // Send invitation emails if enabled
      if (sendInvites && newlyAddedStudents.length > 0) {
        for (const student of newlyAddedStudents) {
          try {
            const sent = await sendInvitationEmail({
              toEmail: student.email,
              studentName: student.name,
              className,
              instructorName,
              loginUrl,
            });
            if (sent) {
              results.emailsSent++;
            } else {
              results.emailsFailed++;
            }
          } catch (emailError) {
            results.emailsFailed++;
            console.error(`Failed to send email to ${student.email}:`, emailError);
          }
        }
      }

      res.json(results);
    } catch (error) {
      console.error("Error bulk importing students:", error);
      res.status(500).json({ error: "Failed to bulk import students" });
    }
  });

  // Send invitation email to a single member
  app.post("/api/class-admin/organizations/:orgId/members/:memberId/send-invite", isAuthenticated, async (req: any, res) => {
    try {
      const adminUserId = req.user?.claims?.sub;
      const { orgId, memberId } = req.params;

      // Check permissions
      const isSuperAdmin = await organizationStorage.isSuperAdmin(adminUserId);
      const isOrgAdmin = await organizationStorage.isClassAdmin(adminUserId, orgId);
      
      if (!isSuperAdmin && !isOrgAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      // Get the member and their user info
      const member = await organizationStorage.getMemberById(memberId);
      if (!member || member.organizationId !== orgId) {
        return res.status(404).json({ error: "Member not found" });
      }

      const [memberUser] = await db.select().from(users).where(eq(users.id, member.userId));
      if (!memberUser || !memberUser.email) {
        return res.status(400).json({ error: "Member has no email address" });
      }

      // Get organization and admin info for invitation email
      const org = await organizationStorage.getOrganization(orgId);
      const [adminUser] = await db.select().from(users).where(eq(users.id, adminUserId));
      const instructorName = adminUser ? 
        [adminUser.firstName, adminUser.lastName].filter(Boolean).join(' ') || 'Your Instructor' : 
        'Your Instructor';
      const className = org?.name || 'The Future of Work Simulation';
      const loginUrl = process.env.REPLIT_DOMAINS ? 
        `https://${process.env.REPLIT_DOMAINS.split(',')[0]}` : 
        'https://futureworkacademy.com';

      const studentName = [memberUser.firstName, memberUser.lastName].filter(Boolean).join(' ') || '';

      const sent = await sendInvitationEmail({
        toEmail: memberUser.email,
        studentName,
        className,
        instructorName,
        loginUrl,
      });

      if (sent) {
        res.json({ success: true, message: "Invitation email sent successfully" });
      } else {
        res.status(500).json({ error: "Failed to send invitation email" });
      }
    } catch (error) {
      console.error("Error sending invitation email:", error);
      res.status(500).json({ error: "Failed to send invitation email" });
    }
  });

  // Test SendGrid configuration (Super Admin only)
  app.get("/api/admin/test-sendgrid", isAuthenticated, async (req: any, res) => {
    try {
      const adminUserId = req.user?.claims?.sub;
      const isSuperAdmin = await organizationStorage.isSuperAdmin(adminUserId);
      
      if (!isSuperAdmin) {
        return res.status(403).json({ error: "Super Admin access required" });
      }

      // Get SendGrid configuration
      const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
      const xReplitToken = process.env.REPL_IDENTITY 
        ? 'repl ' + process.env.REPL_IDENTITY 
        : process.env.WEB_REPL_RENEWAL 
        ? 'depl ' + process.env.WEB_REPL_RENEWAL 
        : null;

      if (!hostname || !xReplitToken) {
        return res.status(500).json({ 
          error: "Replit connector environment not available",
          hasHostname: !!hostname,
          hasToken: !!xReplitToken
        });
      }

      const connectionSettings = await fetch(
        'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=sendgrid',
        {
          headers: {
            'Accept': 'application/json',
            'X_REPLIT_TOKEN': xReplitToken
          }
        }
      ).then(r => r.json());

      if (!connectionSettings.items || connectionSettings.items.length === 0) {
        return res.json({
          status: "not_configured",
          message: "SendGrid integration not connected. Go to Integrations and connect SendGrid.",
          raw: connectionSettings
        });
      }

      const settings = connectionSettings.items[0].settings;
      const hasApiKey = !!settings?.api_key;
      const fromEmail = settings?.from_email || "NOT SET";

      // Try sending a test email to the admin
      const adminUser = await db.select().from(users).where(eq(users.id, adminUserId));
      const testEmail = adminUser[0]?.email;

      if (!testEmail) {
        return res.json({
          status: "configured",
          hasApiKey,
          fromEmail,
          message: "SendGrid configured but no admin email to test with"
        });
      }

      // Actually try to send a test email
      const sgMail = (await import('@sendgrid/mail')).default;
      sgMail.setApiKey(settings.api_key);

      try {
        await sgMail.send({
          to: testEmail,
          from: fromEmail,
          subject: 'SendGrid Test - Future of Work',
          text: 'This is a test email to verify SendGrid configuration.',
          html: '<p>This is a test email to verify SendGrid configuration.</p>'
        });

        res.json({
          status: "success",
          message: `Test email sent successfully to ${testEmail}`,
          fromEmail,
          hasApiKey: true
        });
      } catch (sendError: any) {
        res.json({
          status: "send_failed",
          message: sendError.message,
          fromEmail,
          hasApiKey: true,
          errorCode: sendError.code,
          responseStatus: sendError.response?.statusCode,
          responseBody: sendError.response?.body
        });
      }
    } catch (error: any) {
      console.error("SendGrid test error:", error);
      res.status(500).json({ error: error.message });
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
      
      // Get user's preview mode status
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      const inStudentPreview = user?.inStudentPreview || false;
      const previewModeOrgId = user?.previewModeOrgId || null;

      // Get organizations where user is admin (for preview mode exit)
      const adminOrgs: Array<{ id: string; name: string }> = [];
      for (const membership of memberships) {
        if (membership.role === ROLES.CLASS_ADMIN || membership.role === ROLES.SUPER_ADMIN) {
          const [org] = await db.select().from(organizations).where(eq(organizations.id, membership.organizationId));
          if (org) {
            adminOrgs.push({ id: org.id, name: org.name });
          }
        }
      }

      res.json({
        role,
        isSuperAdmin,
        isClassAdmin,
        inStudentPreview,
        previewModeOrgId,
        organizations: adminOrgs,
        membershipCount: memberships.length,
        memberships,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch role information" });
    }
  });

  // ==================== SIMULATION LIFECYCLE ROUTES ====================

  // Get simulation for an organization
  app.get("/api/class-admin/organizations/:orgId/simulation", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { orgId } = req.params;

      // Check permissions
      const isSuperAdmin = await organizationStorage.isSuperAdmin(userId);
      const isOrgAdmin = await organizationStorage.isClassAdmin(userId, orgId);
      
      if (!isSuperAdmin && !isOrgAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const [simulation] = await db.select().from(simulations)
        .where(eq(simulations.organizationId, orgId));

      if (!simulation) {
        // Return default setup state if no simulation exists yet
        return res.json({
          organizationId: orgId,
          status: SIMULATION_STATUS.SETUP,
          totalWeeks: 8,
          currentWeek: 0,
          startDate: null,
          endDate: null,
        });
      }

      res.json(simulation);
    } catch (error) {
      console.error("Error fetching simulation:", error);
      res.status(500).json({ error: "Failed to fetch simulation" });
    }
  });

  // Create or update simulation settings
  app.post("/api/class-admin/organizations/:orgId/simulation", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { orgId } = req.params;
      const { totalWeeks, startDate, endDate, feedbackFormUrl } = req.body;

      // Check permissions
      const isSuperAdmin = await organizationStorage.isSuperAdmin(userId);
      const isOrgAdmin = await organizationStorage.isClassAdmin(userId, orgId);
      
      if (!isSuperAdmin && !isOrgAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      // Check if simulation already exists
      const [existing] = await db.select().from(simulations)
        .where(eq(simulations.organizationId, orgId));

      if (existing) {
        // feedbackFormUrl can be updated at any time, other settings only in setup
        const isOnlyFeedbackUpdate = feedbackFormUrl !== undefined && !totalWeeks && !startDate && !endDate;
        
        if (!isOnlyFeedbackUpdate && existing.status !== SIMULATION_STATUS.SETUP) {
          return res.status(400).json({ error: "Cannot modify simulation settings after it has started" });
        }

        const [updated] = await db.update(simulations)
          .set({
            totalWeeks: totalWeeks || existing.totalWeeks,
            startDate: startDate ? new Date(startDate) : existing.startDate,
            endDate: endDate ? new Date(endDate) : existing.endDate,
            feedbackFormUrl: feedbackFormUrl !== undefined ? feedbackFormUrl : existing.feedbackFormUrl,
            updatedAt: new Date(),
          })
          .where(eq(simulations.id, existing.id))
          .returning();

        return res.json(updated);
      }

      // Create new simulation
      const [simulation] = await db.insert(simulations).values({
        organizationId: orgId,
        totalWeeks: totalWeeks || 8,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        feedbackFormUrl: feedbackFormUrl || null,
        status: SIMULATION_STATUS.SETUP,
        currentWeek: 0,
      }).returning();

      res.json(simulation);
    } catch (error) {
      console.error("Error creating/updating simulation:", error);
      res.status(500).json({ error: "Failed to save simulation settings" });
    }
  });

  // Start the simulation
  app.post("/api/class-admin/organizations/:orgId/simulation/start", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { orgId } = req.params;

      // Check permissions
      const isSuperAdmin = await organizationStorage.isSuperAdmin(userId);
      const isOrgAdmin = await organizationStorage.isClassAdmin(userId, orgId);
      
      if (!isSuperAdmin && !isOrgAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      // Get or create simulation
      let [simulation] = await db.select().from(simulations)
        .where(eq(simulations.organizationId, orgId));

      if (!simulation) {
        // Create default simulation if it doesn't exist
        [simulation] = await db.insert(simulations).values({
          organizationId: orgId,
          status: SIMULATION_STATUS.SETUP,
          totalWeeks: 8,
          currentWeek: 0,
        }).returning();
      }

      if (simulation.status === SIMULATION_STATUS.ACTIVE) {
        return res.status(400).json({ error: "Simulation is already active" });
      }

      if (simulation.status === SIMULATION_STATUS.COMPLETED) {
        return res.status(400).json({ error: "Simulation has already completed" });
      }

      // Validate that we have required settings
      if (!simulation.startDate) {
        return res.status(400).json({ error: "Please set a start date before starting the simulation" });
      }

      // Start the simulation
      const [updated] = await db.update(simulations)
        .set({
          status: SIMULATION_STATUS.ACTIVE,
          currentWeek: 1,
          startedAt: new Date(),
          startedBy: userId,
          updatedAt: new Date(),
        })
        .where(eq(simulations.id, simulation.id))
        .returning();

      res.json(updated);
    } catch (error) {
      console.error("Error starting simulation:", error);
      res.status(500).json({ error: "Failed to start simulation" });
    }
  });

  // Advance simulation week
  app.post("/api/class-admin/organizations/:orgId/simulation/advance-week", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { orgId } = req.params;

      // Check permissions
      const isSuperAdmin = await organizationStorage.isSuperAdmin(userId);
      const isOrgAdmin = await organizationStorage.isClassAdmin(userId, orgId);
      
      if (!isSuperAdmin && !isOrgAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const [simulation] = await db.select().from(simulations)
        .where(eq(simulations.organizationId, orgId));

      if (!simulation) {
        return res.status(404).json({ error: "Simulation not found" });
      }

      if (simulation.status !== SIMULATION_STATUS.ACTIVE) {
        return res.status(400).json({ error: "Simulation must be active to advance weeks" });
      }

      const newWeek = simulation.currentWeek + 1;
      
      // Check if simulation should complete
      if (newWeek > simulation.totalWeeks) {
        const [completed] = await db.update(simulations)
          .set({
            status: SIMULATION_STATUS.COMPLETED,
            completedAt: new Date(),
            completedBy: userId,
            updatedAt: new Date(),
          })
          .where(eq(simulations.id, simulation.id))
          .returning();

        return res.json({ ...completed, message: "Simulation completed" });
      }

      const [updated] = await db.update(simulations)
        .set({
          currentWeek: newWeek,
          updatedAt: new Date(),
        })
        .where(eq(simulations.id, simulation.id))
        .returning();

      res.json(updated);
    } catch (error) {
      console.error("Error advancing simulation week:", error);
      res.status(500).json({ error: "Failed to advance simulation week" });
    }
  });

  // Complete the simulation
  app.post("/api/class-admin/organizations/:orgId/simulation/complete", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { orgId } = req.params;

      // Check permissions
      const isSuperAdmin = await organizationStorage.isSuperAdmin(userId);
      const isOrgAdmin = await organizationStorage.isClassAdmin(userId, orgId);
      
      if (!isSuperAdmin && !isOrgAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const [simulation] = await db.select().from(simulations)
        .where(eq(simulations.organizationId, orgId));

      if (!simulation) {
        return res.status(404).json({ error: "Simulation not found" });
      }

      const [completed] = await db.update(simulations)
        .set({
          status: SIMULATION_STATUS.COMPLETED,
          completedAt: new Date(),
          completedBy: userId,
          updatedAt: new Date(),
        })
        .where(eq(simulations.id, simulation.id))
        .returning();

      res.json(completed);
    } catch (error) {
      console.error("Error completing simulation:", error);
      res.status(500).json({ error: "Failed to complete simulation" });
    }
  });

  // ==================== SCHEDULED REMINDERS ROUTES ====================

  // Get scheduled reminders for an organization
  app.get("/api/class-admin/organizations/:orgId/reminders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { orgId } = req.params;

      // Check permissions
      const isSuperAdmin = await organizationStorage.isSuperAdmin(userId);
      const isOrgAdmin = await organizationStorage.isClassAdmin(userId, orgId);
      
      if (!isSuperAdmin && !isOrgAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const reminders = await db.select().from(scheduledReminders)
        .where(eq(scheduledReminders.organizationId, orgId));

      res.json(reminders);
    } catch (error) {
      console.error("Error fetching reminders:", error);
      res.status(500).json({ error: "Failed to fetch reminders" });
    }
  });

  // Create a scheduled reminder
  app.post("/api/class-admin/organizations/:orgId/reminders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { orgId } = req.params;
      const { title, message, audience, teamId, scheduledFor, relativeToWeek, templateType, sendSms } = req.body;

      // Check permissions
      const isSuperAdmin = await organizationStorage.isSuperAdmin(userId);
      const isOrgAdmin = await organizationStorage.isClassAdmin(userId, orgId);
      
      if (!isSuperAdmin && !isOrgAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      if (!title || !message || !scheduledFor) {
        return res.status(400).json({ error: "Title, message, and scheduled time are required" });
      }

      // Get simulation ID if exists
      const [simulation] = await db.select().from(simulations)
        .where(eq(simulations.organizationId, orgId));

      const [reminder] = await db.insert(scheduledReminders).values({
        organizationId: orgId,
        simulationId: simulation?.id || null,
        title,
        message,
        audience: audience || "all_students",
        teamId: teamId || null,
        scheduledFor: new Date(scheduledFor),
        relativeToWeek: relativeToWeek || null,
        templateType: templateType || "custom",
        sendSms: sendSms || false,
        status: "pending",
        createdBy: userId,
      }).returning();

      res.json(reminder);
    } catch (error) {
      console.error("Error creating reminder:", error);
      res.status(500).json({ error: "Failed to create reminder" });
    }
  });

  // Update a scheduled reminder
  app.patch("/api/class-admin/organizations/:orgId/reminders/:reminderId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { orgId, reminderId } = req.params;
      const { title, message, audience, teamId, scheduledFor, relativeToWeek } = req.body;

      // Check permissions
      const isSuperAdmin = await organizationStorage.isSuperAdmin(userId);
      const isOrgAdmin = await organizationStorage.isClassAdmin(userId, orgId);
      
      if (!isSuperAdmin && !isOrgAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const [existing] = await db.select().from(scheduledReminders)
        .where(eq(scheduledReminders.id, reminderId));

      if (!existing || existing.organizationId !== orgId) {
        return res.status(404).json({ error: "Reminder not found" });
      }

      if (existing.status === "sent") {
        return res.status(400).json({ error: "Cannot modify a sent reminder" });
      }

      const [updated] = await db.update(scheduledReminders)
        .set({
          title: title || existing.title,
          message: message || existing.message,
          audience: audience || existing.audience,
          teamId: teamId !== undefined ? teamId : existing.teamId,
          scheduledFor: scheduledFor ? new Date(scheduledFor) : existing.scheduledFor,
          relativeToWeek: relativeToWeek !== undefined ? relativeToWeek : existing.relativeToWeek,
          updatedAt: new Date(),
        })
        .where(eq(scheduledReminders.id, reminderId))
        .returning();

      res.json(updated);
    } catch (error) {
      console.error("Error updating reminder:", error);
      res.status(500).json({ error: "Failed to update reminder" });
    }
  });

  // Cancel a scheduled reminder
  app.delete("/api/class-admin/organizations/:orgId/reminders/:reminderId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { orgId, reminderId } = req.params;

      // Check permissions
      const isSuperAdmin = await organizationStorage.isSuperAdmin(userId);
      const isOrgAdmin = await organizationStorage.isClassAdmin(userId, orgId);
      
      if (!isSuperAdmin && !isOrgAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const [existing] = await db.select().from(scheduledReminders)
        .where(eq(scheduledReminders.id, reminderId));

      if (!existing || existing.organizationId !== orgId) {
        return res.status(404).json({ error: "Reminder not found" });
      }

      if (existing.status === "sent") {
        return res.status(400).json({ error: "Cannot cancel a sent reminder" });
      }

      await db.update(scheduledReminders)
        .set({ status: "cancelled", updatedAt: new Date() })
        .where(eq(scheduledReminders.id, reminderId));

      res.json({ success: true });
    } catch (error) {
      console.error("Error cancelling reminder:", error);
      res.status(500).json({ error: "Failed to cancel reminder" });
    }
  });

  // ==================== STUDENT PREVIEW MODE ROUTES ====================

  // Get preview mode status
  app.get("/api/class-admin/organizations/:orgId/preview-mode", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { orgId } = req.params;

      const isSuperAdmin = await organizationStorage.isSuperAdmin(userId);
      const isOrgAdmin = await organizationStorage.isClassAdmin(userId, orgId);
      
      if (!isSuperAdmin && !isOrgAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      // Get current user to check preview mode status
      const [adminUser] = await db.select().from(users).where(eq(users.id, userId));
      
      // Check if test student exists for this admin AND this specific org
      const [testStudent] = await db.select().from(users)
        .where(and(
          eq(users.testStudentOwnerId, userId),
          eq(users.testStudentOwnerOrgId, orgId)
        ));
      
      // Get test team if exists (also verify it belongs to this org)
      let testTeam = null;
      if (testStudent?.teamId) {
        const [team] = await db.select().from(teams)
          .where(and(
            eq(teams.id, testStudent.teamId),
            eq(teams.organizationId, orgId)
          ));
        testTeam = team;
      }

      res.json({
        inPreviewMode: adminUser?.inStudentPreview || false,
        testStudent: testStudent ? {
          id: testStudent.id,
          email: testStudent.email,
          firstName: testStudent.firstName,
          lastName: testStudent.lastName,
          teamId: testStudent.teamId,
        } : null,
        testTeam: testTeam ? {
          id: testTeam.id,
          name: testTeam.name,
          currentWeek: testTeam.currentWeek,
        } : null,
      });
    } catch (error) {
      console.error("Error getting preview mode status:", error);
      res.status(500).json({ error: "Failed to get preview mode status" });
    }
  });

  // Enter student preview mode
  app.post("/api/class-admin/organizations/:orgId/preview-mode/enter", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { orgId } = req.params;

      const isSuperAdmin = await organizationStorage.isSuperAdmin(userId);
      const isOrgAdmin = await organizationStorage.isClassAdmin(userId, orgId);
      
      if (!isSuperAdmin && !isOrgAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      // Get admin user info
      const [adminUser] = await db.select().from(users).where(eq(users.id, userId));
      if (!adminUser) {
        return res.status(404).json({ error: "Admin user not found" });
      }

      // Check if test student already exists for this admin AND this specific org
      let [testStudent] = await db.select().from(users)
        .where(and(
          eq(users.testStudentOwnerId, userId),
          eq(users.testStudentOwnerOrgId, orgId)
        ));

      // Create test student if doesn't exist for this admin + org combination
      if (!testStudent) {
        const testStudentId = randomUUID();
        const testEmail = `test-student-${userId.substring(0, 8)}-${orgId.substring(0, 6)}@preview.local`;
        
        await db.insert(users).values({
          id: testStudentId,
          email: testEmail,
          firstName: "Test",
          lastName: "Student (Preview)",
          isAdmin: "false",
          isTestStudent: true,
          testStudentOwnerId: userId,
          testStudentOwnerOrgId: orgId,
          institution: adminUser.institution,
        });

        [testStudent] = await db.select().from(users).where(eq(users.id, testStudentId));
      }

      // Check if test team exists, create if not
      let testTeam = null;
      if (testStudent.teamId) {
        const [existing] = await db.select().from(teams).where(eq(teams.id, testStudent.teamId));
        testTeam = existing;
      }

      if (!testTeam) {
        // Get org info for team naming
        const [org] = await db.select().from(organizations).where(eq(organizations.id, orgId));
        const teamName = `[Preview] Test Team - ${org?.name || 'Admin'}`;
        
        const testTeamId = randomUUID();
        await db.insert(teams).values({
          id: testTeamId,
          name: teamName,
          organizationId: orgId,
          members: [testStudent.id],
          companyState: defaultCompanyState,
          currentWeek: 1,
          totalWeeks: 8,
          setupComplete: true,
          researchComplete: false,
        });

        // Assign test student to team
        await db.update(users)
          .set({ teamId: testTeamId, updatedAt: new Date() })
          .where(eq(users.id, testStudent.id));

        [testTeam] = await db.select().from(teams).where(eq(teams.id, testTeamId));
      }

      // Also add test student to organization members if not already (check BOTH userId AND orgId)
      const [existingMember] = await db.select().from(organizationMembers)
        .where(and(
          eq(organizationMembers.userId, testStudent.id),
          eq(organizationMembers.organizationId, orgId)
        ));
      
      if (!existingMember) {
        await db.insert(organizationMembers).values({
          id: randomUUID(),
          userId: testStudent.id,
          organizationId: orgId,
          role: "student",
          status: "active",
          joinedAt: new Date(),
        });
      }

      // Set admin into preview mode and track which org they are previewing
      await db.update(users)
        .set({ inStudentPreview: true, previewModeOrgId: orgId, updatedAt: new Date() })
        .where(eq(users.id, userId));

      res.json({
        success: true,
        testStudent: {
          id: testStudent.id,
          email: testStudent.email,
          firstName: testStudent.firstName,
          lastName: testStudent.lastName,
          teamId: testTeam?.id,
        },
        testTeam: {
          id: testTeam?.id,
          name: testTeam?.name,
          currentWeek: testTeam?.currentWeek,
        },
      });
    } catch (error) {
      console.error("Error entering preview mode:", error);
      res.status(500).json({ error: "Failed to enter preview mode" });
    }
  });

  // Exit student preview mode
  app.post("/api/class-admin/organizations/:orgId/preview-mode/exit", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { orgId } = req.params;

      const isSuperAdmin = await organizationStorage.isSuperAdmin(userId);
      const isOrgAdmin = await organizationStorage.isClassAdmin(userId, orgId);
      
      if (!isSuperAdmin && !isOrgAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      // Set admin out of preview mode and clear the org being previewed
      await db.update(users)
        .set({ inStudentPreview: false, previewModeOrgId: null, updatedAt: new Date() })
        .where(eq(users.id, userId));

      res.json({ success: true });
    } catch (error) {
      console.error("Error exiting preview mode:", error);
      res.status(500).json({ error: "Failed to exit preview mode" });
    }
  });

  // Reset test student data
  app.post("/api/class-admin/organizations/:orgId/preview-mode/reset", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { orgId } = req.params;

      const isSuperAdmin = await organizationStorage.isSuperAdmin(userId);
      const isOrgAdmin = await organizationStorage.isClassAdmin(userId, orgId);
      
      if (!isSuperAdmin && !isOrgAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      // Find test student scoped to this admin AND this org
      const [testStudent] = await db.select().from(users)
        .where(and(
          eq(users.testStudentOwnerId, userId),
          eq(users.testStudentOwnerOrgId, orgId)
        ));

      if (!testStudent) {
        return res.status(404).json({ error: "No test student found for this organization" });
      }

      // Reset the test team's game state
      if (testStudent.teamId) {
        await db.update(teams)
          .set({
            currentWeek: 1,
            companyState: defaultCompanyState,
            decisions: [],
            decisionRecords: [],
            weeklyHistory: [],
            viewedReportIds: [],
            setupComplete: true,
            researchComplete: false,
            updatedAt: new Date(),
          })
          .where(eq(teams.id, testStudent.teamId));
      }

      res.json({ success: true, message: "Test data has been reset to initial state" });
    } catch (error) {
      console.error("Error resetting test data:", error);
      res.status(500).json({ error: "Failed to reset test data" });
    }
  });

  // ==================== ABOUT PAGE ROUTES ====================

  // Get about page content (public)
  app.get("/api/about", async (req: any, res) => {
    try {
      const [content] = await db.select().from(aboutPageContent).limit(1);
      res.json(content || { photoUrl: null, content: null });
    } catch (error) {
      console.error("Error fetching about page content:", error);
      res.status(500).json({ error: "Failed to fetch about page content" });
    }
  });

  // Update about page content (super admin only)
  const aboutContentSchema = z.object({
    photoUrl: z.string().url().max(2000).nullable().optional(),
    content: z.string().max(50000).nullable().optional(),
  });

  app.put("/api/about", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const isSuperAdmin = await organizationStorage.isSuperAdmin(userId);
      
      if (!isSuperAdmin) {
        return res.status(403).json({ error: "Super Admin access required" });
      }

      // Validate request body
      const validation = aboutContentSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid input", details: validation.error.issues });
      }

      const { photoUrl, content } = validation.data;

      // Sanitize HTML content to prevent XSS
      const sanitizedContent = content ? sanitizeHtml(content, {
        allowedTags: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'strong', 'em', 'b', 'i', 'u', 'ul', 'ol', 'li', 'a', 'blockquote', 'hr'],
        allowedAttributes: {
          'a': ['href', 'target', 'rel'],
        },
        allowedSchemes: ['http', 'https', 'mailto'],
      }) : null;

      // Check if record exists
      const [existing] = await db.select().from(aboutPageContent).limit(1);
      
      if (existing) {
        await db.update(aboutPageContent)
          .set({ photoUrl: photoUrl || null, content: sanitizedContent, updatedAt: new Date(), updatedBy: userId })
          .where(eq(aboutPageContent.id, existing.id));
      } else {
        await db.insert(aboutPageContent).values({
          photoUrl: photoUrl || null,
          content: sanitizedContent,
          updatedBy: userId,
        });
      }

      const [updated] = await db.select().from(aboutPageContent).limit(1);
      res.json(updated);
    } catch (error) {
      console.error("Error updating about page content:", error);
      res.status(500).json({ error: "Failed to update about page content" });
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

  // ==================== EMAIL TEMPLATE ROUTES ====================
  
  // Default email templates for initialization
  const defaultEmailTemplates = [
    {
      templateType: EMAIL_TEMPLATE_TYPES.INVITATION,
      name: "Student Invitation",
      subject: "You've been added to {{className}} - The Future of Work Simulation",
      htmlContent: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f8; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #1a1f36 0%, #2d3555 100%); padding: 30px; text-align: center;">
      <img src="https://futureworkacademy.com/logo.png" alt="Future Work Academy" style="max-width: 220px; height: auto;" />
    </div>
    
    <div style="padding: 30px;">
      <h2 style="color: #1a1f36; margin-top: 0;">Welcome, {{studentName}}!</h2>
      
      <p style="color: #475569; line-height: 1.6;">
        You've been added to <strong>{{className}}</strong> by {{instructorName}}.
      </p>
      
      <p style="color: #475569; line-height: 1.6;">
        In this simulation, you'll step into the role of an executive at Apex Manufacturing, 
        navigating the challenges of AI adoption, workforce management, and strategic decision-making.
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{loginUrl}}" 
           style="display: inline-block; background-color: #22c55e; color: #ffffff; padding: 14px 32px; 
                  text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
          Start the Simulation
        </a>
      </div>
      
      <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
        Click the button above to log in and begin. Make sure to use this email address 
        (<strong>{{toEmail}}</strong>) when signing in.
      </p>
    </div>
    
    <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
      <p style="color: #94a3b8; font-size: 12px; margin: 0;">
        The Future of Work - A Business Simulation for Tomorrow's Leaders
      </p>
    </div>
  </div>
</body>
</html>`,
      textContent: `Welcome to The Future of Work Simulation!

Hi {{studentName}},

You've been added to {{className}} by {{instructorName}}.

In this simulation, you'll step into the role of an executive at Apex Manufacturing, navigating the challenges of AI adoption, workforce management, and strategic decision-making.

To get started, visit: {{loginUrl}}

Make sure to use this email address ({{toEmail}}) when signing in.

- The Future of Work Team`,
    },
    {
      templateType: EMAIL_TEMPLATE_TYPES.REMINDER,
      name: "Scheduled Reminder",
      subject: "{{subject}} - {{className}}",
      htmlContent: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f8; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #1a1f36 0%, #2d3555 100%); padding: 30px; text-align: center;">
      <img src="https://futureworkacademy.com/logo.png" alt="Future Work Academy" style="max-width: 220px; height: auto;" />
      <p style="color: #94a3b8; margin: 12px 0 0 0; font-size: 14px;">{{className}}</p>
    </div>
    
    <div style="padding: 30px;">
      <h2 style="color: #1a1f36; margin-top: 0;">{{subject}}</h2>
      
      <p style="color: #475569; line-height: 1.6;">
        Hi {{studentName}},
      </p>
      
      <div style="color: #475569; line-height: 1.8;">
        {{message}}
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://futureworkacademy.com" 
           style="display: inline-block; background-color: #22c55e; color: #ffffff; padding: 14px 32px; 
                  text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
          Go to Dashboard
        </a>
      </div>
    </div>
    
    <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
      <p style="color: #94a3b8; font-size: 12px; margin: 0;">
        The Future of Work - A Business Simulation for Tomorrow's Leaders
      </p>
    </div>
  </div>
</body>
</html>`,
      textContent: `{{subject}}

Hi {{studentName}},

{{message}}

Visit your dashboard: https://futureworkacademy.com

- The Future of Work Team`,
    },
    {
      templateType: EMAIL_TEMPLATE_TYPES.WELCOME,
      name: "Welcome Email",
      subject: "Welcome to The Future of Work Simulation!",
      htmlContent: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f8; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #1a1f36 0%, #2d3555 100%); padding: 30px; text-align: center;">
      <img src="https://futureworkacademy.com/logo.png" alt="Future Work Academy" style="max-width: 220px; height: auto;" />
    </div>
    
    <div style="padding: 30px;">
      <h2 style="color: #1a1f36; margin-top: 0;">Welcome, {{studentName}}!</h2>
      
      <p style="color: #475569; line-height: 1.6;">
        Thank you for joining The Future of Work simulation. We're excited to have you on board!
      </p>
      
      <p style="color: #475569; line-height: 1.6;">
        Over the coming weeks, you'll experience the challenges and opportunities of leading a company through digital transformation.
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://futureworkacademy.com" 
           style="display: inline-block; background-color: #22c55e; color: #ffffff; padding: 14px 32px; 
                  text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
          Access Your Dashboard
        </a>
      </div>
    </div>
    
    <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
      <p style="color: #94a3b8; font-size: 12px; margin: 0;">
        The Future of Work - A Business Simulation for Tomorrow's Leaders
      </p>
    </div>
  </div>
</body>
</html>`,
      textContent: `Welcome to The Future of Work Simulation!

Hi {{studentName}},

Thank you for joining The Future of Work simulation. We're excited to have you on board!

Over the coming weeks, you'll experience the challenges and opportunities of leading a company through digital transformation.

Access your dashboard at: https://futureworkacademy.com

- The Future of Work Team`,
    },
    {
      templateType: EMAIL_TEMPLATE_TYPES.SIMULATION_START,
      name: "Simulation Started",
      subject: "The Simulation Has Begun! - {{className}}",
      htmlContent: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f8; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #1a1f36 0%, #2d3555 100%); padding: 30px; text-align: center;">
      <img src="https://futureworkacademy.com/logo.png" alt="Future Work Academy" style="max-width: 220px; height: auto;" />
      <p style="color: #94a3b8; margin: 12px 0 0 0; font-size: 14px;">{{className}}</p>
    </div>
    
    <div style="padding: 30px;">
      <h2 style="color: #1a1f36; margin-top: 0;">The Simulation Has Started!</h2>
      
      <p style="color: #475569; line-height: 1.6;">
        Hi {{studentName}},
      </p>
      
      <p style="color: #475569; line-height: 1.6;">
        Your instructor has started the simulation. It's time to make your first decisions as an executive at Apex Manufacturing!
      </p>
      
      <p style="color: #475569; line-height: 1.6;">
        Log in now to review your weekly intelligence briefing and begin making strategic decisions.
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://futureworkacademy.com" 
           style="display: inline-block; background-color: #22c55e; color: #ffffff; padding: 14px 32px; 
                  text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
          Start Making Decisions
        </a>
      </div>
    </div>
    
    <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
      <p style="color: #94a3b8; font-size: 12px; margin: 0;">
        The Future of Work - A Business Simulation for Tomorrow's Leaders
      </p>
    </div>
  </div>
</body>
</html>`,
      textContent: `The Simulation Has Started!

Hi {{studentName}},

Your instructor has started the simulation for {{className}}. It's time to make your first decisions as an executive at Apex Manufacturing!

Log in now to review your weekly intelligence briefing and begin making strategic decisions.

Access your dashboard at: https://futureworkacademy.com

- The Future of Work Team`,
    },
  ];

  // Get all email templates
  app.get("/api/email-templates", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const isSuperAdmin = await organizationStorage.isSuperAdmin(userId);
      
      if (!isSuperAdmin) {
        return res.status(403).json({ error: "Super Admin access required" });
      }

      let templates = await db.select().from(emailTemplates);
      
      // If no templates exist, initialize with defaults
      if (templates.length === 0) {
        for (const template of defaultEmailTemplates) {
          await db.insert(emailTemplates).values({
            ...template,
            updatedBy: userId,
          });
        }
        templates = await db.select().from(emailTemplates);
      }

      res.json(templates);
    } catch (error) {
      console.error("Error fetching email templates:", error);
      res.status(500).json({ error: "Failed to fetch email templates" });
    }
  });

  // Update an email template
  const updateEmailTemplateSchema = z.object({
    name: z.string().min(1).max(200),
    subject: z.string().min(1).max(500),
    htmlContent: z.string().min(1),
    textContent: z.string().min(1),
    isActive: z.boolean().optional(),
  });

  app.put("/api/email-templates/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const isSuperAdmin = await organizationStorage.isSuperAdmin(userId);
      
      if (!isSuperAdmin) {
        return res.status(403).json({ error: "Super Admin access required" });
      }

      const { id } = req.params;
      const parseResult = updateEmailTemplateSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({ error: "Invalid template data", details: parseResult.error.errors });
      }

      const { name, subject, htmlContent, textContent, isActive } = parseResult.data;

      // Sanitize HTML content
      const sanitizedHtml = sanitizeHtml(htmlContent, {
        allowedTags: ['html', 'head', 'body', 'meta', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'strong', 'em', 'b', 'i', 'u', 'ul', 'ol', 'li', 'a', 'img', 'table', 'tr', 'td', 'th', 'thead', 'tbody', 'style', 'span'],
        allowedAttributes: {
          '*': ['style', 'class'],
          'a': ['href', 'target', 'rel'],
          'img': ['src', 'alt', 'width', 'height'],
          'meta': ['charset', 'name', 'content'],
        },
        allowedSchemes: ['http', 'https', 'mailto'],
      });

      await db.update(emailTemplates)
        .set({
          name,
          subject,
          htmlContent: sanitizedHtml,
          textContent,
          isActive: isActive ?? true,
          updatedAt: new Date(),
          updatedBy: userId,
        })
        .where(eq(emailTemplates.id, id));

      const [updated] = await db.select().from(emailTemplates).where(eq(emailTemplates.id, id));
      res.json(updated);
    } catch (error) {
      console.error("Error updating email template:", error);
      res.status(500).json({ error: "Failed to update email template" });
    }
  });

  // Reset email templates to defaults
  app.post("/api/email-templates/reset", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const isSuperAdmin = await organizationStorage.isSuperAdmin(userId);
      
      if (!isSuperAdmin) {
        return res.status(403).json({ error: "Super Admin access required" });
      }

      // Delete all existing templates
      await db.delete(emailTemplates);
      
      // Insert default templates
      for (const template of defaultEmailTemplates) {
        await db.insert(emailTemplates).values({
          ...template,
          updatedBy: userId,
        });
      }

      const templates = await db.select().from(emailTemplates);
      res.json(templates);
    } catch (error) {
      console.error("Error resetting email templates:", error);
      res.status(500).json({ error: "Failed to reset email templates" });
    }
  });

  return httpServer;
}
