import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDecisionSchema, insertTeamSchema } from "@shared/schema";
import { z } from "zod";
import { isAuthenticated, authStorage } from "./replit_integrations/auth";
import { db } from "./db";
import { users } from "@shared/models/auth";
import { eq } from "drizzle-orm";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
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
      const updatedTeam = await storage.advanceWeek(user.teamId);
      if (!updatedTeam) {
        return res.status(400).json({ error: "Cannot advance week" });
      }
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
      
      const updatedTeam = await storage.submitDecision(user.teamId, decisionId, optionId, rationale);
      if (!updatedTeam) {
        return res.status(400).json({ error: "Failed to submit decision" });
      }
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

  return httpServer;
}
