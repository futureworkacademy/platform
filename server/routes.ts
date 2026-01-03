import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDecisionSchema, insertTeamSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/api/team", async (req, res) => {
    try {
      const team = await storage.getDefaultTeam();
      res.json(team);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch team" });
    }
  });

  app.post("/api/team", async (req, res) => {
    try {
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

  app.post("/api/team/complete-research", async (req, res) => {
    try {
      const team = await storage.getDefaultTeam();
      if (!team) {
        return res.status(404).json({ error: "No team found" });
      }
      const result = await storage.completeResearch(team.id);
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }
      res.json(result.team);
    } catch (error) {
      res.status(500).json({ error: "Failed to complete research" });
    }
  });

  app.post("/api/research/mark-viewed/:reportId", async (req, res) => {
    try {
      const team = await storage.getDefaultTeam();
      if (!team) {
        return res.status(404).json({ error: "No team found" });
      }
      const updatedTeam = await storage.markReportViewed(team.id, req.params.reportId);
      res.json(updatedTeam);
    } catch (error) {
      res.status(500).json({ error: "Failed to mark report as viewed" });
    }
  });

  app.get("/api/research/progress", async (req, res) => {
    try {
      const team = await storage.getDefaultTeam();
      if (!team) {
        return res.json({ viewed: 0, total: 6, percentage: 0 });
      }
      const progress = await storage.getResearchProgress(team.id);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch research progress" });
    }
  });

  app.get("/api/research/reports", async (req, res) => {
    try {
      const reports = await storage.getResearchReports();
      res.json(reports);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch research reports" });
    }
  });

  app.get("/api/research/historical", async (req, res) => {
    try {
      const data = await storage.getHistoricalData();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch historical data" });
    }
  });

  app.get("/api/research/workforce", async (req, res) => {
    try {
      const demographics = await storage.getWorkforceDemographics();
      res.json(demographics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch workforce demographics" });
    }
  });

  app.get("/api/departments", async (req, res) => {
    try {
      const departments = await storage.getDepartments();
      res.json(departments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch departments" });
    }
  });

  app.get("/api/briefing/:weekNumber?", async (req, res) => {
    try {
      const weekNumber = parseInt(req.params.weekNumber || "1", 10);
      const briefing = await storage.getWeeklyBriefing(weekNumber);
      res.json(briefing);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch briefing" });
    }
  });

  app.get("/api/leaderboard", async (req, res) => {
    try {
      const leaderboard = await storage.getLeaderboard();
      res.json(leaderboard);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  app.get("/api/analytics", async (req, res) => {
    try {
      const team = await storage.getDefaultTeam();
      if (!team) {
        return res.json({
          sentimentByDepartment: [],
          keyIssues: [],
          behaviorTrends: [],
          employeeSegments: [],
        });
      }
      const analytics = await storage.getPeopleAnalytics(team.id);
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  app.post("/api/decisions", async (req, res) => {
    try {
      const validationResult = insertDecisionSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid decision data",
          details: validationResult.error.flatten() 
        });
      }

      const team = await storage.getDefaultTeam();
      if (!team) {
        return res.status(404).json({ error: "No team found" });
      }
      const decision = await storage.addDecision(team.id, validationResult.data);
      res.json(decision);
    } catch (error) {
      res.status(500).json({ error: "Failed to process decision" });
    }
  });

  app.post("/api/advance-week", async (req, res) => {
    try {
      const team = await storage.getDefaultTeam();
      if (!team) {
        return res.status(404).json({ error: "No team found" });
      }
      const updatedTeam = await storage.advanceWeek(team.id);
      if (!updatedTeam) {
        return res.status(400).json({ error: "Cannot advance week" });
      }
      res.json(updatedTeam);
    } catch (error) {
      res.status(500).json({ error: "Failed to advance week" });
    }
  });

  return httpServer;
}
