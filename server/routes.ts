import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDecisionSchema } from "@shared/schema";
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
      const decision = await storage.addDecision(team.id, validationResult.data);
      res.json(decision);
    } catch (error) {
      res.status(500).json({ error: "Failed to process decision" });
    }
  });

  app.post("/api/advance-week", async (req, res) => {
    try {
      const team = await storage.getDefaultTeam();
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
