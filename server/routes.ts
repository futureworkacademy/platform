import type { Express } from "express";
import { createServer, type Server } from "http";
import { randomUUID } from "crypto";
import { storage } from "./storage";
import { insertDecisionSchema, insertTeamSchema, defaultCompanyState } from "@shared/schema";
import { z } from "zod";
import { isAuthenticated, authStorage } from "./replit_integrations/auth";
import { db } from "./db";
import { users, organizations, organizationMembers, simulations, scheduledReminders, aboutPageContent, emailTemplates, EMAIL_TEMPLATE_TYPES, ROLES, type Role, SIMULATION_STATUS, mediaEngagement, simulationContent, characterProfiles, triggeredVoicemails, advisors, advisorCalls } from "@shared/models/auth";
import { teams } from "@shared/schema";
import { eq, sql, and, or } from "drizzle-orm";
import { institutions } from "@shared/institutions";
import { organizationStorage } from "./organization-storage";
import { validateEduEmail, generateTeamCode } from "./auth-middleware";
import { sendSmsNotification, isTwilioConfigured } from "./twilio-service";
import { sendInvitationEmail } from "./services/email";
import sanitizeHtml from "sanitize-html";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";
import { demoService } from "./demo-service";
import { registerDemoQARoutes } from "./demo-qa-routes";

function isAdminUser(user: { isAdmin?: string | boolean | null } | null | undefined): boolean {
  if (!user) return false;
  const adminValue = user.isAdmin;
  return adminValue === true || adminValue === "true" || adminValue === "super_admin";
}

// Helper function to extract themes from scenario content
function extractThemes(scenario: { title: string; narrative: string; keyQuestion: string }): string[] {
  const themes: string[] = [];
  const text = `${scenario.title} ${scenario.narrative} ${scenario.keyQuestion}`.toLowerCase();
  
  const themeKeywords: Record<string, string[]> = {
    "automation": ["automation", "automate", "robot", "ai-powered", "machine learning"],
    "workforce transformation": ["workforce", "workers", "employees", "labor", "hiring", "training"],
    "union relations": ["union", "uaw", "collective bargaining", "organizing"],
    "financial pressure": ["debt", "credit", "loan", "margin", "cost", "budget"],
    "supply chain": ["supply chain", "tariff", "domestic", "procurement", "logistics"],
    "quality management": ["quality", "fda", "inspection", "defect", "audit"],
    "talent development": ["talent", "training", "reskilling", "pipeline", "community college"],
    "competitive strategy": ["competitor", "market share", "reshoring", "capacity"],
    "leadership": ["board", "management", "decision", "strategic"],
    "stakeholder management": ["stakeholder", "perspective", "communication", "transparency"],
  };
  
  for (const [theme, keywords] of Object.entries(themeKeywords)) {
    if (keywords.some(kw => text.includes(kw))) {
      themes.push(theme);
    }
  }
  
  return themes;
}

// Helper function to infer character traits based on role
function inferCharacterTraits(role: string): string[] {
  const roleTraits: Record<string, string[]> = {
    "Board Chair": ["strategic thinker", "shareholder-focused", "long-term oriented", "demanding"],
    "CFO": ["analytical", "risk-aware", "numbers-driven", "pragmatic"],
    "HR Director": ["people-focused", "empathetic", "process-oriented", "communication-skilled"],
    "Operations Manager": ["practical", "detail-oriented", "efficiency-focused", "hands-on"],
    "General Counsel": ["cautious", "risk-averse", "legally precise", "protective"],
    "UAW Organizer": ["worker advocate", "passionate", "strategic", "persuasive"],
    "Master Moldmaker": ["experienced", "traditional", "craft-proud", "skeptical of change"],
    "Lead Moldmaker": ["skilled", "respected", "quality-focused", "concerned about legacy"],
    "Board Member": ["results-oriented", "impatient", "competitive", "decisive"],
    "Community College Dean": ["educational", "community-focused", "collaborative", "optimistic"],
    "Sales VP": ["ambitious", "customer-focused", "growth-oriented", "aggressive"],
    "QA Manager": ["detail-oriented", "process-driven", "under pressure", "systematic"],
    "Procurement Director": ["analytical", "negotiation-skilled", "supply-chain expert", "cautious"],
    "Logistics Manager": ["operations-focused", "efficiency-driven", "problem-solver", "practical"],
  };
  
  // Try exact match first
  if (roleTraits[role]) {
    return roleTraits[role];
  }
  
  // Try partial match
  const roleLower = role.toLowerCase();
  for (const [key, traits] of Object.entries(roleTraits)) {
    if (roleLower.includes(key.toLowerCase()) || key.toLowerCase().includes(roleLower)) {
      return traits;
    }
  }
  
  // Default traits
  return ["professional", "stakeholder", "perspective-driven"];
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Register object storage routes for media uploads
  registerObjectStorageRoutes(app);
  
  // Register demo Q&A routes for guided tour
  registerDemoQARoutes(app);

  // Server-rendered weekly simulation pages (bypasses React SPA entirely)
  const { fetchWeekPageData, renderWeekPage, renderWeek0Page } = await import("./weekly-page-renderer");

  // Grading module (auth required — Super Admin and Class Admin only)
  const { renderGradingPage, gradeSubmission } = await import("./grading-page-renderer");

  // Survey module (public, no auth)
  const { renderSurveyPage } = await import("./survey-page-renderer");

  async function requireAdminRole(req: any, res: any, next: any) {
    const user = req.user as any;
    if (!user) return res.status(401).json({ error: "Authentication required" });
    const userId = user.claims?.sub || user.id;
    if (!userId) return res.status(401).json({ error: "Authentication required" });
    const isSuperAdmin = await organizationStorage.isSuperAdmin(userId);
    if (isSuperAdmin) return next();
    const memberships = await db.select({ role: organizationMembers.role })
      .from(organizationMembers)
      .where(eq(organizationMembers.userId, userId))
      .limit(10);
    const isClassAdmin = memberships.some(m => m.role === "class_admin" || m.role === "super_admin");
    if (isClassAdmin) return next();
    return res.status(403).json({ error: "Admin access required. Only instructors and administrators can access the grading module." });
  }

  app.get("/grade", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user as any;
      const userId = user?.claims?.sub || user?.id;
      if (!userId) return res.redirect("/api/login");
      const isSuperAdmin = await organizationStorage.isSuperAdmin(userId);
      if (!isSuperAdmin) {
        const memberships = await db.select({ role: organizationMembers.role })
          .from(organizationMembers)
          .where(eq(organizationMembers.userId, userId))
          .limit(10);
        const isClassAdmin = memberships.some(m => m.role === "class_admin" || m.role === "super_admin");
        if (!isClassAdmin) {
          return res.status(403).send(`
            <html><head><title>Access Denied</title></head>
            <body style="font-family:system-ui;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f8f9fa;">
              <div style="text-align:center;max-width:400px;padding:2rem;">
                <h1 style="font-size:1.5rem;margin-bottom:0.5rem;">Access Denied</h1>
                <p style="color:#6b7280;">The grading module is restricted to instructors and administrators.</p>
                <a href="/" style="color:#1e3a5f;text-decoration:underline;">Return to Home</a>
              </div>
            </body></html>
          `);
        }
      }
      const html = renderGradingPage();
      res.status(200).set({ "Content-Type": "text/html" }).send(html);
    } catch (error) {
      console.error("Error rendering grading page:", error);
      res.status(500).send("Internal server error");
    }
  });

  const gradeRateLimit = new Map<string, number[]>();
  app.post("/api/grade/single", isAuthenticated, requireAdminRole, async (req, res) => {
    try {
      const ip = req.ip || "unknown";
      const now = Date.now();
      const windowMs = 60000;
      const maxRequests = 10;
      const timestamps = (gradeRateLimit.get(ip) || []).filter(t => now - t < windowMs);
      if (timestamps.length >= maxRequests) {
        return res.status(429).json({ error: "Too many grading requests. Please wait a minute before trying again." });
      }
      timestamps.push(now);
      gradeRateLimit.set(ip, timestamps);

      const { weekNumber, optionChosen, studentName, essayText } = req.body;
      if (!essayText || typeof essayText !== "string" || essayText.trim().length < 20) {
        return res.status(400).json({ error: "Essay text is required and must be at least 20 characters." });
      }
      const week = parseInt(weekNumber);
      if (isNaN(week) || week < 1 || week > 8) {
        return res.status(400).json({ error: "Week number must be between 1 and 8." });
      }
      const option = String(optionChosen || "A").toUpperCase().charAt(0);
      if (!"ABCD".includes(option)) {
        return res.status(400).json({ error: "Option must be A, B, C, or D." });
      }
      const result = await gradeSubmission({
        weekNumber: week,
        optionChosen: option,
        studentName: String(studentName || "Student").trim(),
        essayText: essayText.trim(),
      });
      try {
        const existingReports = await db.select({
          weekNumber: gradingReports.weekNumber,
          percentage: gradingReports.percentage,
        }).from(gradingReports).limit(200);
        const weekPcts = existingReports.filter(r => r.weekNumber === week).map(r => r.percentage);
        weekPcts.push(result.percentage);
        const n = weekPcts.length;
        const mean = weekPcts.reduce((a: number, b: number) => a + b, 0) / n;
        const variance = weekPcts.reduce((sum: number, p: number) => sum + (p - mean) ** 2, 0) / n;
        const stdDev = Math.sqrt(variance);
        const weekStats = { mean: Math.round(mean * 10) / 10, stdDev: Math.round(stdDev * 10) / 10, count: n };
        let curvedScore: number | null = null;
        if (n >= 3 && stdDev > 0) {
          curvedScore = Math.round(75 + (result.percentage - mean) * (10 / stdDev));
          curvedScore = Math.max(40, Math.min(100, curvedScore));
        }
        res.json({ ...result, curvedScore, weekStats });
      } catch {
        res.json(result);
      }
    } catch (error) {
      console.error("Error grading submission:", error);
      res.status(500).json({ error: "Grading service encountered an error. Please try again." });
    }
  });

  const { gradingReports, surveyResponses } = await import("@shared/models/auth");
  const { desc } = await import("drizzle-orm");

  function computeCurvedScores(reports: any[]) {
    const byWeek: Record<number, number[]> = {};
    for (const r of reports) {
      if (!byWeek[r.weekNumber]) byWeek[r.weekNumber] = [];
      byWeek[r.weekNumber].push(r.percentage);
    }
    const weekStats: Record<number, { mean: number; stdDev: number; count: number }> = {};
    for (const [wk, pcts] of Object.entries(byWeek)) {
      const n = pcts.length;
      const mean = pcts.reduce((a, b) => a + b, 0) / n;
      const variance = pcts.reduce((sum, p) => sum + (p - mean) ** 2, 0) / n;
      const stdDev = Math.sqrt(variance);
      weekStats[Number(wk)] = { mean: Math.round(mean * 10) / 10, stdDev: Math.round(stdDev * 10) / 10, count: n };
    }
    return reports.map((r: any) => {
      const stats = weekStats[r.weekNumber];
      let curvedScore: number | null = null;
      if (stats && stats.count >= 3 && stats.stdDev > 0) {
        curvedScore = Math.round(75 + (r.percentage - stats.mean) * (10 / stats.stdDev));
        curvedScore = Math.max(40, Math.min(100, curvedScore));
      }
      return { ...r, curvedScore, weekStats: stats };
    });
  }

  app.post("/api/grade/save", isAuthenticated, requireAdminRole, async (req, res) => {
    try {
      const { studentName, weekNumber, optionChosen, essayText, totalScore, maxScore, percentage, overallQuality, rubricScores, overallFeedback, strengths, areasForImprovement, instructorComments } = req.body;
      if (!studentName || !essayText) {
        return res.status(400).json({ error: "Missing required fields." });
      }
      const [report] = await db.insert(gradingReports).values({
        studentName: String(studentName).trim(),
        weekNumber: parseInt(weekNumber) || 1,
        optionChosen: String(optionChosen || "A"),
        essayText: String(essayText),
        totalScore: parseInt(totalScore) || 0,
        maxScore: parseInt(maxScore) || 100,
        percentage: parseInt(percentage) || 0,
        overallQuality: String(overallQuality || ""),
        rubricScores: rubricScores || [],
        overallFeedback: overallFeedback || "",
        strengths: strengths || [],
        areasForImprovement: areasForImprovement || [],
        instructorComments: instructorComments || null,
      }).returning();
      res.json(report);
    } catch (error) {
      console.error("Error saving grading report:", error);
      res.status(500).json({ error: "Failed to save report." });
    }
  });

  app.patch("/api/grade/:id/comments", isAuthenticated, requireAdminRole, async (req, res) => {
    try {
      const { instructorComments } = req.body;
      const [updated] = await db.update(gradingReports)
        .set({ instructorComments: instructorComments || null })
        .where(eq(gradingReports.id, req.params.id))
        .returning();
      if (!updated) return res.status(404).json({ error: "Report not found." });
      res.json(updated);
    } catch (error) {
      console.error("Error updating comments:", error);
      res.status(500).json({ error: "Failed to update comments." });
    }
  });

  app.get("/api/grade/history", isAuthenticated, requireAdminRole, async (_req, res) => {
    try {
      const reports = await db.select({
        id: gradingReports.id,
        studentName: gradingReports.studentName,
        weekNumber: gradingReports.weekNumber,
        optionChosen: gradingReports.optionChosen,
        totalScore: gradingReports.totalScore,
        maxScore: gradingReports.maxScore,
        percentage: gradingReports.percentage,
        overallQuality: gradingReports.overallQuality,
        rubricScores: gradingReports.rubricScores,
        overallFeedback: gradingReports.overallFeedback,
        strengths: gradingReports.strengths,
        areasForImprovement: gradingReports.areasForImprovement,
        instructorComments: gradingReports.instructorComments,
        essayText: gradingReports.essayText,
        createdAt: gradingReports.createdAt,
      }).from(gradingReports).orderBy(desc(gradingReports.createdAt)).limit(200);
      res.json(computeCurvedScores(reports));
    } catch (error) {
      console.error("Error fetching grading history:", error);
      res.status(500).json({ error: "Failed to fetch history." });
    }
  });

  app.get("/api/grade/:id", isAuthenticated, requireAdminRole, async (req, res) => {
    try {
      const allReports = await db.select({
        id: gradingReports.id,
        studentName: gradingReports.studentName,
        weekNumber: gradingReports.weekNumber,
        optionChosen: gradingReports.optionChosen,
        totalScore: gradingReports.totalScore,
        maxScore: gradingReports.maxScore,
        percentage: gradingReports.percentage,
        overallQuality: gradingReports.overallQuality,
        rubricScores: gradingReports.rubricScores,
        overallFeedback: gradingReports.overallFeedback,
        strengths: gradingReports.strengths,
        areasForImprovement: gradingReports.areasForImprovement,
        instructorComments: gradingReports.instructorComments,
        essayText: gradingReports.essayText,
        createdAt: gradingReports.createdAt,
      }).from(gradingReports).limit(200);
      const report = allReports.find(r => r.id === req.params.id);
      if (!report) return res.status(404).json({ error: "Report not found." });
      const curved = computeCurvedScores(allReports);
      const result = curved.find((r: any) => r.id === req.params.id);
      res.json(result);
    } catch (error) {
      console.error("Error fetching grading report:", error);
      res.status(500).json({ error: "Failed to fetch report." });
    }
  });

  app.delete("/api/grade/:id", isAuthenticated, requireAdminRole, async (req, res) => {
    try {
      const [deleted] = await db.delete(gradingReports)
        .where(eq(gradingReports.id, req.params.id))
        .returning({ id: gradingReports.id });
      if (!deleted) return res.status(404).json({ error: "Report not found." });
      res.json({ deleted: true, id: deleted.id });
    } catch (error) {
      console.error("Error deleting grading report:", error);
      res.status(500).json({ error: "Failed to delete report." });
    }
  });

  app.get("/survey", (_req, res) => {
    try {
      const html = renderSurveyPage();
      res.status(200).set({ "Content-Type": "text/html" }).send(html);
    } catch (error) {
      console.error("Error rendering survey page:", error);
      res.status(500).send("Internal server error");
    }
  });

  app.post("/api/survey", async (req, res) => {
    try {
      const { studentId, weekNumber, realism, fairness, difficulty, learningValue, engagement, clarity, comments } = req.body;
      if (!studentId || typeof studentId !== "string" || studentId.trim().length < 1 || studentId.trim().length > 50) {
        return res.status(400).json({ error: "Student ID is required (max 50 characters)." });
      }
      const wk = Number(weekNumber);
      if (!wk || wk < 1 || wk > 8) return res.status(400).json({ error: "Invalid week number." });
      const ratingFields = [realism, fairness, difficulty, learningValue, engagement, clarity];
      if (ratingFields.some((r: any) => typeof r !== "number" || r < 1 || r > 5 || !Number.isInteger(r))) {
        return res.status(400).json({ error: "All ratings must be integers between 1 and 5." });
      }
      const trimmedComments = comments ? String(comments).trim().substring(0, 2000) : null;
      const existing = await db.select({ id: surveyResponses.id }).from(surveyResponses)
        .where(and(eq(surveyResponses.studentId, studentId.trim()), eq(surveyResponses.weekNumber, wk)));
      if (existing.length > 0) {
        return res.status(409).json({ error: "You have already submitted feedback for this week." });
      }
      const [inserted] = await db.insert(surveyResponses).values({
        studentId: studentId.trim(),
        weekNumber: wk,
        realism: Number(realism),
        fairness: Number(fairness),
        difficulty: Number(difficulty),
        learningValue: Number(learningValue),
        engagement: Number(engagement),
        clarity: Number(clarity),
        comments: trimmedComments,
      }).returning();
      res.json({ id: inserted.id, weekNumber: inserted.weekNumber });
    } catch (error: any) {
      if (error?.code === "23505") {
        return res.status(409).json({ error: "You have already submitted feedback for this week." });
      }
      console.error("Error saving survey:", error);
      res.status(500).json({ error: "Failed to save feedback." });
    }
  });

  app.get("/api/survey/results", isAuthenticated, async (_req, res) => {
    try {
      const responses = await db.select({
        weekNumber: surveyResponses.weekNumber,
        realism: surveyResponses.realism,
        fairness: surveyResponses.fairness,
        difficulty: surveyResponses.difficulty,
        learningValue: surveyResponses.learningValue,
        engagement: surveyResponses.engagement,
        clarity: surveyResponses.clarity,
        comments: surveyResponses.comments,
        studentId: surveyResponses.studentId,
        createdAt: surveyResponses.createdAt,
      }).from(surveyResponses).orderBy(surveyResponses.weekNumber, surveyResponses.createdAt);
      res.json({ responses });
    } catch (error) {
      console.error("Error fetching survey results:", error);
      res.status(500).json({ error: "Failed to fetch results." });
    }
  });

  app.post("/api/survey/analyze", isAuthenticated, async (_req, res) => {
    try {
      const responses = await db.select({
        weekNumber: surveyResponses.weekNumber,
        realism: surveyResponses.realism,
        fairness: surveyResponses.fairness,
        difficulty: surveyResponses.difficulty,
        learningValue: surveyResponses.learningValue,
        engagement: surveyResponses.engagement,
        clarity: surveyResponses.clarity,
        comments: surveyResponses.comments,
        studentId: surveyResponses.studentId,
      }).from(surveyResponses).orderBy(surveyResponses.weekNumber);

      if (responses.length === 0) {
        return res.json({ analysis: "No survey responses to analyze yet." });
      }

      const weekGroups: Record<number, typeof responses> = {};
      for (const r of responses) {
        if (!weekGroups[r.weekNumber]) weekGroups[r.weekNumber] = [];
        weekGroups[r.weekNumber].push(r);
      }

      let dataSummary = `Survey Data Summary (${responses.length} total responses across ${Object.keys(weekGroups).length} weeks):\n\n`;
      for (const [week, wrs] of Object.entries(weekGroups).sort(([a],[b]) => Number(a) - Number(b))) {
        const avg = (field: string) => (wrs.reduce((s: number, r: any) => s + r[field], 0) / wrs.length).toFixed(1);
        dataSummary += `Week ${week} (${wrs.length} responses): Realism=${avg('realism')}, Fairness=${avg('fairness')}, Difficulty=${avg('difficulty')}, Learning=${avg('learningValue')}, Engagement=${avg('engagement')}, Clarity=${avg('clarity')}\n`;
        const comments = wrs.filter((r: any) => r.comments?.trim()).map((r: any) => `  - "${r.comments}"`);
        if (comments.length > 0) dataSummary += `  Comments:\n${comments.join('\n')}\n`;
      }

      const OpenAI = (await import("openai")).default;
      const openai = new OpenAI();

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an educational assessment analyst for "Future Work Academy," a business simulation where students manage AI transformation at a manufacturing company over 8 weeks. Analyze the student feedback survey data and provide actionable insights for the instructor. The survey measures: Realism (scenario believability), Fairness (decision options and scoring equity), Difficulty (challenge level), Learning Value (educational impact), Engagement (interest and involvement), and Clarity (instruction quality). All ratings are 1-5 scale.`
          },
          {
            role: "user",
            content: `Analyze this student feedback data and provide:\n\n1. **Key Themes** — What are the top 3-5 themes emerging from quantitative ratings and qualitative comments?\n2. **Strengths** — What aspects of the simulation are working well (consistently high ratings)?\n3. **Areas for Improvement** — Where are ratings low or declining? What do comments suggest?\n4. **Week-over-Week Trends** — Are perceptions improving, declining, or stable across weeks?\n5. **Actionable Recommendations** — 3-5 specific, concrete changes the instructor could make to improve the simulation experience.\n6. **Risk Flags** — Any concerning patterns (e.g., fairness complaints, difficulty spikes, disengagement)?\n\nBe specific and cite the data. Format with clear headers and bullet points.\n\n${dataSummary}`
          }
        ],
        max_tokens: 1500,
        temperature: 0.3,
      });

      res.json({ analysis: completion.choices[0]?.message?.content || "Unable to generate analysis." });
    } catch (error) {
      console.error("Error analyzing survey:", error);
      res.status(500).json({ error: "Failed to analyze survey data." });
    }
  });

  app.get("/week-0", async (_req, res) => {
    try {
      const html = await renderWeek0Page();
      res.status(200).set({ "Content-Type": "text/html", "Cache-Control": "public, max-age=300" }).send(html);
    } catch (error) {
      console.error("Error rendering week 0 page:", error);
      res.status(500).send("Internal server error");
    }
  });

  app.get("/week-:num(\\d+)", async (req, res) => {
    const weekNumber = parseInt(req.params.num);
    if (weekNumber < 1 || weekNumber > 8) {
      return res.status(404).send("Week not found");
    }
    try {
      const data = await fetchWeekPageData(weekNumber);
      const html = renderWeekPage(data);
      res.status(200).set({ "Content-Type": "text/html", "Cache-Control": "public, max-age=300" }).send(html);
    } catch (error) {
      console.error(`Error rendering week ${weekNumber} page:`, error);
      res.status(500).send("Internal server error");
    }
  });

  app.get("/apex-simulation-week-:num(\\d+)", (req, res) => {
    const weekNumber = parseInt(req.params.num);
    if (weekNumber >= 1 && weekNumber <= 8) {
      return res.redirect(301, `/week-${weekNumber}`);
    }
    res.status(404).send("Not found");
  });
  
  app.get("/api/institutions", (_req, res) => {
    res.json(institutions);
  });

  // Character profiles API
  const roleToCharacterMap: Record<string, string> = {
    "Board Chair": "Victoria Hartwell",
    "Board Chairwoman": "Victoria Hartwell",
    "Chairwoman": "Victoria Hartwell",
    "Board Member": "William Thornton III",
    "Board Member (PE)": "William Thornton III",
    "Private Equity": "William Thornton III",
    "PE Board Member": "William Thornton III",
    "CFO": "David Chen",
    "Chief Financial Officer": "David Chen",
    "Finance": "David Chen",
    "HR Director": "Sandra Williams",
    "Human Resources": "Sandra Williams",
    "Director of Human Resources": "Sandra Williams",
    "HR": "Sandra Williams",
    "Operations Manager": "Frank Torres",
    "Senior Operations Manager": "Frank Torres",
    "Operations": "Frank Torres",
    "Master Moldmaker": "Frank Torres",
    "Lead Moldmaker": "Frank Torres",
    "QA Manager": "Frank Torres",
    "UAW Organizer": "Marcus Webb",
    "Union Organizer": "Marcus Webb",
    "Union Representative": "Marcus Webb",
    "Union": "Marcus Webb",
    "UAW": "Marcus Webb",
    "UAW Regional Organizer": "Marcus Webb",
    "General Counsel": "Robert Nakamura",
    "Legal": "Robert Nakamura",
    "Legal Counsel": "Robert Nakamura",
    "Sales VP": "Jennifer Park",
    "Vice President of Sales": "Jennifer Park",
    "VP of Sales": "Jennifer Park",
    "Sales": "Jennifer Park",
    "COO": "Margaret O'Brien",
    "Chief Operating Officer": "Margaret O'Brien",
    "Procurement Director": "Margaret O'Brien",
    "Logistics Manager": "Margaret O'Brien",
    "CEO": "Test Character RbtThy",
    "Chief Executive Officer": "Test Character RbtThy",
    "Mayor": "Angela Reyes",
    "City Mayor": "Angela Reyes",
    "Community Leader": "Angela Reyes",
    "Gen Z Employee": "Destiny Martinez",
    "Quality Control Technician": "Destiny Martinez",
    "Gen Z Representative": "Jaylen Brooks",
    "Gen Z Rep": "Jaylen Brooks",
    "Employee Council Rep": "Jaylen Brooks",
    "Production Associate": "Jaylen Brooks",
    "External Consultant": "Dr. Helen Mercer",
    "Consultant": "Dr. Helen Mercer",
    "Community College Dean": "Dr. Helen Mercer",
    "Transformation Consultant": "Dr. Helen Mercer",
    "Industry Analyst": "Dr. Nathan Cross",
    "Analyst": "Dr. Nathan Cross",
    "Manufacturing Analyst": "Dr. Nathan Cross",
    "Bank Representative": "Patricia Lawson",
    "Banker": "Patricia Lawson",
    "Lender": "Patricia Lawson",
    "Commercial Lender": "Patricia Lawson",
    "Technology Vendor": "Rachel Kim",
    "Tech Vendor": "Rachel Kim",
    "RoboTech": "Rachel Kim",
    "Customer": "Thomas Richardson",
    "Medical Device Customer": "Thomas Richardson",
    "Medical Device Quality Director": "Thomas Richardson",
    "Aerospace Customer": "Thomas Richardson",
    "Major Customer": "Thomas Richardson",
    "Customer (AutoCorp)": "Thomas Richardson",
    "AutoCorp": "Thomas Richardson",
    "VP of Supply Chain": "Thomas Richardson",
    "Skeptical Analyst": "Dr. Nathan Cross",
    "Bank Rep": "Patricia Lawson",
    "Employee Council": "Jaylen Brooks",
    "Marketing": "Jennifer Park",
    "Training Manager": "Sandra Williams",
    "Operations Worker": "Frank Torres",
  };

  app.get("/api/characters/by-name", async (req, res) => {
    try {
      const name = req.query.name as string;
      if (!name) {
        return res.status(400).json({ error: "Name parameter required" });
      }

      // Step 1: Try exact name match
      let [character] = await db
        .select()
        .from(characterProfiles)
        .where(eq(characterProfiles.name, name))
        .limit(1);

      // Step 2: Try the role-to-name map
      if (!character) {
        const mappedName = roleToCharacterMap[name];
        if (mappedName) {
          [character] = await db
            .select()
            .from(characterProfiles)
            .where(eq(characterProfiles.name, mappedName))
            .limit(1);
        }
      }

      // Step 3: Try matching against the role column in the database
      if (!character) {
        [character] = await db
          .select()
          .from(characterProfiles)
          .where(eq(characterProfiles.role, name))
          .limit(1);
      }

      // Step 4: Try case-insensitive partial match on name or role
      if (!character) {
        [character] = await db
          .select()
          .from(characterProfiles)
          .where(
            or(
              sql`LOWER(${characterProfiles.name}) = LOWER(${name})`,
              sql`LOWER(${characterProfiles.role}) = LOWER(${name})`,
              sql`LOWER(${characterProfiles.title}) = LOWER(${name})`
            )
          )
          .limit(1);
      }

      if (!character) {
        return res.status(404).json({ error: "Character not found" });
      }

      res.json(character);
    } catch (error) {
      console.error("Error fetching character:", error);
      res.status(500).json({ error: "Failed to fetch character" });
    }
  });

  app.get("/api/characters", async (_req, res) => {
    try {
      const characters = await db
        .select()
        .from(characterProfiles)
        .where(eq(characterProfiles.isActive, true));

      res.json(characters);
    } catch (error) {
      console.error("Error fetching characters:", error);
      res.status(500).json({ error: "Failed to fetch characters" });
    }
  });

  // Public API - Get Week 1 voicemail (no auth required, for offline guide)
  const WEEK_ADVISOR_MAP: Record<number, string> = {
    1: "Dr. Elena Vasquez",
    2: "Diana Okonkwo",
    3: "Dr. Priya Sharma",
    4: "Dr. Thomas Brennan",
    5: "Marcus Chen",
    6: "James Richardson",
    7: "Kai Nakamura",
    8: "Dr. Amara Williams",
  };

  app.get("/api/public/voicemail", async (req, res) => {
    try {
      const weekNumber = parseInt(req.query.week as string) || 1;
      if (weekNumber < 1 || weekNumber > 8) {
        return res.status(400).json({ error: "Week must be between 1 and 8" });
      }

      const [voicemail] = await db
        .select()
        .from(triggeredVoicemails)
        .where(and(
          eq(triggeredVoicemails.weekNumber, weekNumber),
          eq(triggeredVoicemails.isActive, true)
        ))
        .limit(1);

      if (!voicemail) {
        return res.status(404).json({ error: "No voicemail available for this week" });
      }

      let character = null;
      if (voicemail.characterId) {
        const allChars = await db
          .select({
            name: characterProfiles.name,
            role: characterProfiles.role,
            title: characterProfiles.title,
            headshotUrl: characterProfiles.headshotUrl,
          })
          .from(characterProfiles);
        const slugMatch = allChars.find(c =>
          c.name.toLowerCase().replace(/[^a-z]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') === voicemail.characterId ||
          c.name.toLowerCase().replace(/\s+/g, '-') === voicemail.characterId
        );
        const idMatch = allChars.length > 0 ? (await db
          .select({
            name: characterProfiles.name,
            role: characterProfiles.role,
            title: characterProfiles.title,
            headshotUrl: characterProfiles.headshotUrl,
          })
          .from(characterProfiles)
          .where(eq(characterProfiles.id, voicemail.characterId))
          .limit(1)
        )[0] : null;
        character = slugMatch || idMatch || null;
      }

      res.json({
        title: voicemail.title,
        transcript: voicemail.transcript,
        urgency: voicemail.urgency,
        audioUrl: voicemail.audioUrl || `/audio/voicemails/week-${weekNumber}-voicemail.mp3`,
        duration: voicemail.duration,
        weekNumber,
        character: character || { name: "Unknown", role: "Apex Manufacturing", headshotUrl: null },
      });
    } catch (error) {
      console.error("Error fetching public voicemail:", error);
      res.status(500).json({ error: "Failed to fetch voicemail" });
    }
  });

  app.get("/api/public/advisor", async (req, res) => {
    try {
      const weekNumber = parseInt(req.query.week as string) || 1;
      if (weekNumber < 1 || weekNumber > 8) {
        return res.status(400).json({ error: "Week must be between 1 and 8" });
      }

      const advisorName = WEEK_ADVISOR_MAP[weekNumber];
      const [advisor] = await db
        .select({
          id: advisors.id,
          name: advisors.name,
          category: advisors.category,
          title: advisors.title,
          specialty: advisors.specialty,
          bio: advisors.bio,
          transcript: advisors.transcript,
          audioUrl: advisors.audioUrl,
          keyInsights: advisors.keyInsights,
          headshotUrl: advisors.headshotUrl,
        })
        .from(advisors)
        .where(and(
          eq(advisors.isActive, true),
          eq(advisors.name, advisorName)
        ))
        .limit(1);

      if (!advisor) {
        return res.status(404).json({ error: "No advisor available for this week" });
      }

      res.json({
        ...advisor,
        weekNumber,
        audioUrl: advisor.audioUrl || `/audio/advisors/${advisor.id}.mp3`,
      });
    } catch (error) {
      console.error("Error fetching public advisor:", error);
      res.status(500).json({ error: "Failed to fetch advisor" });
    }
  });

  app.get("/api/public/week-content", async (req, res) => {
    try {
      const weekNumber = parseInt(req.query.week as string) || 1;
      if (weekNumber < 1 || weekNumber > 8) {
        return res.status(400).json({ error: "Week must be between 1 and 8" });
      }

      const content = await db
        .select({
          id: simulationContent.id,
          title: simulationContent.title,
          content: simulationContent.content,
          contentType: simulationContent.contentType,
        })
        .from(simulationContent)
        .where(and(
          eq(simulationContent.weekNumber, weekNumber),
          eq(simulationContent.isActive, true)
        ));

      const briefing = content.find(c => c.contentType === "briefing");
      const decisions = content.filter(c => c.contentType === "decision");
      const intelArticles = content.filter(c => c.contentType === "intel");

      const weekTitles: Record<number, string> = {
        1: "The Automation Imperative",
        2: "The Talent Pipeline Crisis",
        3: "Union Storm Brewing",
        4: "The First Displacement",
        5: "The Manager Exodus",
        6: "Debt Day of Reckoning",
        7: "The Competitive Response",
        8: "Strategic Direction",
      };

      res.json({
        weekNumber,
        weekTitle: weekTitles[weekNumber] || `Week ${weekNumber}`,
        briefing: briefing ? { title: briefing.title, content: briefing.content } : null,
        decisions: decisions.map(d => ({ title: d.title, content: d.content })),
        intelArticles: intelArticles.map(a => ({ title: a.title, content: a.content })),
      });
    } catch (error) {
      console.error("Error fetching public week content:", error);
      res.status(500).json({ error: "Failed to fetch week content" });
    }
  });

  // Voicemail API - Get voicemail for a specific week
  app.get("/api/voicemails/:weekNumber", isAuthenticated, async (req, res) => {
    try {
      const weekNumber = parseInt(req.params.weekNumber);
      if (isNaN(weekNumber)) {
        return res.status(400).json({ error: "Invalid week number" });
      }

      const [voicemail] = await db
        .select()
        .from(triggeredVoicemails)
        .where(and(
          eq(triggeredVoicemails.weekNumber, weekNumber),
          eq(triggeredVoicemails.isActive, true)
        ))
        .limit(1);

      if (!voicemail) {
        return res.status(404).json({ error: "No voicemail for this week" });
      }

      // Get character info for the voicemail
      const characterName = voicemail.characterId
        ?.split('-')
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      const [character] = characterName ? await db
        .select({
          name: characterProfiles.name,
          role: characterProfiles.role,
          title: characterProfiles.title,
          headshotUrl: characterProfiles.headshotUrl,
        })
        .from(characterProfiles)
        .where(eq(characterProfiles.name, characterName))
        .limit(1) : [null];

      res.json({
        ...voicemail,
        character: character || {
          name: characterName || "Unknown",
          role: "Apex Manufacturing",
          headshotUrl: null,
        },
      });
    } catch (error) {
      console.error("Error fetching voicemail:", error);
      res.status(500).json({ error: "Failed to fetch voicemail" });
    }
  });

  // Advisor API - Get all advisors with categories
  app.get("/api/advisors", isAuthenticated, async (req, res) => {
    try {
      const allAdvisors = await db
        .select({
          id: advisors.id,
          name: advisors.name,
          category: advisors.category,
          title: advisors.title,
          organization: advisors.organization,
          specialty: advisors.specialty,
          bio: advisors.bio,
          keyInsights: advisors.keyInsights,
          headshotUrl: advisors.headshotUrl,
          hasAudio: advisors.audioUrl,
        })
        .from(advisors)
        .where(eq(advisors.isActive, true));

      // Group by category
      const grouped = {
        consultant: allAdvisors.filter(a => a.category === 'consultant'),
        industry_expert: allAdvisors.filter(a => a.category === 'industry_expert'),
        thought_leader: allAdvisors.filter(a => a.category === 'thought_leader'),
      };

      res.json({
        advisors: allAdvisors,
        byCategory: grouped,
      });
    } catch (error) {
      console.error("Error fetching advisors:", error);
      res.status(500).json({ error: "Failed to fetch advisors" });
    }
  });

  // Advisor API - Get specific advisor with full content
  app.get("/api/advisors/:id", isAuthenticated, async (req, res) => {
    try {
      const [advisor] = await db
        .select()
        .from(advisors)
        .where(and(
          eq(advisors.id, req.params.id),
          eq(advisors.isActive, true)
        ))
        .limit(1);

      if (!advisor) {
        return res.status(404).json({ error: "Advisor not found" });
      }

      res.json(advisor);
    } catch (error) {
      console.error("Error fetching advisor:", error);
      res.status(500).json({ error: "Failed to fetch advisor" });
    }
  });

  async function resolveTeamIdForUser(userId: string, sessionPreview?: { role: string; orgId: string } | null): Promise<string | null> {
    const user = await authStorage.getUser(userId);
    if (!user) return null;
    
    let teamId = user.teamId;
    
    const previewRole = sessionPreview?.role || user.previewRole;
    const previewOrgId = sessionPreview?.orgId || user.previewOrgId;
    
    if (previewRole === "student" && previewOrgId) {
      const [testStudent] = await db.select().from(users)
        .where(and(
          eq(users.testStudentOwnerId, userId),
          eq(users.testStudentOwnerOrgId, previewOrgId)
        ));
      if (testStudent?.teamId) {
        teamId = testStudent.teamId;
      }
    } else if (user.inStudentPreview && user.previewModeOrgId) {
      const [testStudent] = await db.select().from(users)
        .where(and(
          eq(users.testStudentOwnerId, userId),
          eq(users.testStudentOwnerOrgId, user.previewModeOrgId)
        ));
      if (testStudent?.teamId) {
        teamId = testStudent.teamId;
      }
    }
    
    return teamId || null;
  }

  // Advisor API - Call an advisor (use a credit)
  const advisorCallSchema = z.object({
    advisorId: z.string().uuid("Invalid advisor ID"),
  });

  app.post("/api/advisor-calls", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const userId = user?.claims?.sub;
      const teamId = await resolveTeamIdForUser(userId, (req.session as any)?.preview);
      if (!teamId) {
        return res.status(400).json({ error: "User not on a team" });
      }

      // Validate request body
      const parseResult = advisorCallSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          error: "Invalid request", 
          details: parseResult.error.errors 
        });
      }
      const { advisorId } = parseResult.data;

      // First verify the advisor exists
      const [advisor] = await db
        .select()
        .from(advisors)
        .where(eq(advisors.id, advisorId))
        .limit(1);

      if (!advisor) {
        return res.status(404).json({ error: "Advisor not found" });
      }

      // Get the team
      const [team] = await db
        .select()
        .from(teams)
        .where(eq(teams.id, teamId))
        .limit(1);

      if (!team) {
        return res.status(404).json({ error: "Team not found" });
      }

      // Check if already called this advisor
      const [existingCall] = await db
        .select()
        .from(advisorCalls)
        .where(and(
          eq(advisorCalls.teamId, teamId),
          eq(advisorCalls.advisorId, advisorId)
        ))
        .limit(1);

      if (existingCall) {
        // Already called - return advisor data without deducting credit
        return res.json({
          advisor,
          creditsRemaining: team.advisorCreditsRemaining ?? 3,
          alreadyCalled: true,
        });
      }

      // Check credits (with null safety)
      const currentCredits = team.advisorCreditsRemaining ?? 3;
      if (currentCredits <= 0) {
        return res.status(400).json({ 
          error: "No advisor credits remaining",
          creditsRemaining: 0,
        });
      }

      // Record the call
      await db.insert(advisorCalls).values({
        id: randomUUID(),
        teamId: team.id,
        advisorId,
        weekNumber: team.currentWeek,
      });

      // Deduct credit atomically using SQL to prevent race conditions
      await db.update(teams)
        .set({ 
          advisorCreditsRemaining: sql`GREATEST(COALESCE(advisor_credits_remaining, 3) - 1, 0)`,
          updatedAt: new Date(),
        })
        .where(eq(teams.id, team.id));

      res.json({
        advisor,
        creditsRemaining: Math.max(currentCredits - 1, 0),
        alreadyCalled: false,
      });
    } catch (error) {
      console.error("Error calling advisor:", error);
      res.status(500).json({ error: "Failed to call advisor" });
    }
  });

  // Advisor API - Get team's called advisors
  app.get("/api/advisor-calls", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const userId = user?.claims?.sub;
      const teamId = await resolveTeamIdForUser(userId, (req.session as any)?.preview);
      if (!teamId) {
        return res.json({ calls: [] });
      }

      const calls = await db
        .select({
          advisorId: advisorCalls.advisorId,
          weekNumber: advisorCalls.weekNumber,
          calledAt: advisorCalls.calledAt,
        })
        .from(advisorCalls)
        .where(eq(advisorCalls.teamId, teamId));

      res.json({ calls });
    } catch (error) {
      console.error("Error fetching advisor calls:", error);
      res.status(500).json({ error: "Failed to fetch advisor calls" });
    }
  });

  app.get("/api/team", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const user = await authStorage.getUser(userId);
      
      let teamId = user?.teamId;
      let orgId: string | null = null;
      
      const sessionPreview = (req.session as any)?.preview;
      if ((sessionPreview?.role === "student" && sessionPreview?.orgId) || (user?.inStudentPreview && user?.previewModeOrgId)) {
        const previewOrgId = sessionPreview?.orgId || user?.previewModeOrgId;
        const [testStudent] = await db.select().from(users)
          .where(and(
            eq(users.testStudentOwnerId, userId),
            eq(users.testStudentOwnerOrgId, previewOrgId!)
          ));
        
        if (testStudent?.teamId) {
          teamId = testStudent.teamId;
          orgId = previewOrgId!;
        }
      }
      
      if (!teamId) {
        return res.json(null);
      }
      
      // Get the difficulty level from the simulation associated with this team
      let difficultyLevel: "introductory" | "standard" | "advanced" = "advanced";
      
      // Use the preview org or find from memberships
      if (!orgId) {
        const memberships = await organizationStorage.getMembershipsByUser(userId);
        if (memberships && memberships.length > 0) {
          orgId = memberships[0].organizationId;
        }
      }
      
      if (orgId) {
        const simulation = await storage.getSimulationByOrganization(orgId);
        if (simulation?.difficultyLevel) {
          difficultyLevel = simulation.difficultyLevel as "introductory" | "standard" | "advanced";
        }
      }
      
      const team = await storage.getTeamWithDifficulty(teamId, difficultyLevel);
      
      // Include simulationLocked status from organization
      // Preview users (admins testing) always see unlocked so they can test decisions
      const isTeamPreviewUser = !!(user?.previewRole && (user?.previewOrgId || user?.previewModeOrgId));
      let simulationLocked = false;
      if (!isTeamPreviewUser && orgId) {
        const [orgForLock] = await db.select().from(organizations).where(eq(organizations.id, orgId));
        simulationLocked = orgForLock?.simulationLocked === true;
      }
      
      if (team) {
        res.json({ ...team, simulationLocked });
      } else {
        res.json(null);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch team" });
    }
  });

  app.get("/api/admin/teams", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await authStorage.getUser(userId);
      if (!isAdminUser(user)) {
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
      if (!isAdminUser(user)) {
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
      if (!isAdminUser(user)) {
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
      if (!isAdminUser(adminUser)) {
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
      if (!isAdminUser(adminUser)) {
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

  // Content view tracking endpoints
  // Zod schema for content view recording
  const recordContentViewSchema = z.object({
    contentType: z.enum(['research_report', 'briefing_section', 'simulation_content']),
    contentId: z.string().min(1),
    weekNumber: z.number().int().min(1).max(12).optional(),
    timeSpentSeconds: z.number().int().min(0).optional(),
  });

  app.post("/api/content-views", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const resolvedTeamId = await resolveTeamIdForUser(userId, (req.session as any)?.preview);
      
      const parseResult = recordContentViewSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ error: "Invalid request", details: parseResult.error.flatten() });
      }
      
      const { contentType, contentId, weekNumber, timeSpentSeconds } = parseResult.data;
      
      const view = await storage.recordContentView({
        userId,
        teamId: resolvedTeamId || null,
        contentType,
        contentId,
        weekNumber: weekNumber ?? null,
        timeSpentSeconds
      });
      
      res.json({ success: true, view });
    } catch (error) {
      console.error("Error recording content view:", error);
      res.status(500).json({ error: "Failed to record content view" });
    }
  });

  app.get("/api/content-views", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const resolvedTeamId = await resolveTeamIdForUser(userId, (req.session as any)?.preview);
      const { contentType, weekNumber } = req.query;
      
      const views = await storage.getContentViews(
        userId,
        resolvedTeamId || undefined,
        contentType as string | undefined,
        weekNumber ? parseInt(weekNumber as string, 10) : undefined
      );
      
      res.json(views);
    } catch (error) {
      console.error("Error fetching content views:", error);
      res.status(500).json({ error: "Failed to fetch content views" });
    }
  });

  app.get("/api/content-views/progress", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await authStorage.getUser(userId);
      const { weekNumber } = req.query;
      
      const progress = await storage.getContentViewProgress(
        userId,
        user?.teamId || undefined,
        weekNumber ? parseInt(weekNumber as string, 10) : undefined
      );
      
      res.json(progress);
    } catch (error) {
      console.error("Error fetching content view progress:", error);
      res.status(500).json({ error: "Failed to fetch content view progress" });
    }
  });

  // Media engagement tracking endpoints for video/audio content
  const mediaEngagementUpdateSchema = z.object({
    contentId: z.string().min(1),
    weekNumber: z.number().int().min(1).max(12).optional(),
    started: z.boolean().optional(),
    percentWatched: z.number().int().min(0).max(100).optional(),
    lastPositionSeconds: z.number().int().min(0).optional(),
    totalWatchTimeSeconds: z.number().int().min(0).optional(),
  });

  // Get media engagement for current user
  app.get("/api/media-engagement", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await authStorage.getUser(userId);
      const { contentId, weekNumber } = req.query;
      
      const query = db.select().from(mediaEngagement).where(
        and(
          eq(mediaEngagement.userId, userId),
          contentId ? eq(mediaEngagement.contentId, contentId as string) : undefined,
          weekNumber ? eq(mediaEngagement.weekNumber, parseInt(weekNumber as string, 10)) : undefined
        )
      );
      
      const results = await query;
      res.json(results);
    } catch (error) {
      console.error("Error fetching media engagement:", error);
      res.status(500).json({ error: "Failed to fetch media engagement" });
    }
  });

  // Update media engagement (upsert - create or update)
  app.post("/api/media-engagement", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await authStorage.getUser(userId);
      
      const parseResult = mediaEngagementUpdateSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ error: "Invalid request", details: parseResult.error.flatten() });
      }
      
      const { contentId, weekNumber, started, percentWatched, lastPositionSeconds, totalWatchTimeSeconds } = parseResult.data;
      
      // Check if engagement record exists
      const existing = await db.select().from(mediaEngagement).where(
        and(
          eq(mediaEngagement.userId, userId),
          eq(mediaEngagement.contentId, contentId)
        )
      );
      
      const isCompleted = percentWatched !== undefined && percentWatched >= 75;
      
      if (existing.length > 0) {
        // Update existing record
        const [updated] = await db.update(mediaEngagement)
          .set({
            started: started ?? existing[0].started,
            percentWatched: percentWatched !== undefined ? Math.max(percentWatched, existing[0].percentWatched || 0) : existing[0].percentWatched,
            lastPositionSeconds: lastPositionSeconds ?? existing[0].lastPositionSeconds,
            totalWatchTimeSeconds: totalWatchTimeSeconds !== undefined 
              ? (existing[0].totalWatchTimeSeconds || 0) + totalWatchTimeSeconds 
              : existing[0].totalWatchTimeSeconds,
            completed: isCompleted || existing[0].completed,
            completedAt: isCompleted && !existing[0].completed ? new Date() : existing[0].completedAt,
            updatedAt: new Date(),
          })
          .where(eq(mediaEngagement.id, existing[0].id))
          .returning();
        
        res.json({ success: true, engagement: updated });
      } else {
        // Create new record
        const [created] = await db.insert(mediaEngagement)
          .values({
            id: randomUUID(),
            userId,
            teamId: user?.teamId || null,
            contentId,
            weekNumber: weekNumber ?? null,
            started: started ?? false,
            percentWatched: percentWatched ?? 0,
            lastPositionSeconds: lastPositionSeconds ?? 0,
            totalWatchTimeSeconds: totalWatchTimeSeconds ?? 0,
            completed: isCompleted,
            completedAt: isCompleted ? new Date() : null,
          })
          .returning();
        
        res.json({ success: true, engagement: created });
      }
    } catch (error) {
      console.error("Error updating media engagement:", error);
      res.status(500).json({ error: "Failed to update media engagement" });
    }
  });

  // Get Intel bonus calculation including media engagement
  app.get("/api/intel-bonus", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await authStorage.getUser(userId);
      const { weekNumber } = req.query;
      
      // Get all Intel content for this week
      const intelContent = await db.select().from(simulationContent).where(
        and(
          eq(simulationContent.isIntelContent, true),
          weekNumber ? eq(simulationContent.weekNumber, parseInt(weekNumber as string, 10)) : undefined,
          eq(simulationContent.isActive, true)
        )
      );
      
      // Get user's completed engagements
      const completedEngagements = await db.select().from(mediaEngagement).where(
        and(
          eq(mediaEngagement.userId, userId),
          eq(mediaEngagement.completed, true)
        )
      );
      
      const completedContentIds = new Set(completedEngagements.map(e => e.contentId));
      
      // Calculate engagement counts
      const totalIntelItems = intelContent.length;
      const engagedItems = intelContent.filter(c => completedContentIds.has(c.id)).length;
      
      // Calculate bonus multiplier: 1.0x base + 0.15x per article, max 1.5x
      const baseMultiplier = 1.0;
      const bonusPerItem = 0.15;
      const maxMultiplier = 1.5;
      const rawMultiplier = baseMultiplier + (engagedItems * bonusPerItem);
      const multiplier = Math.min(rawMultiplier, maxMultiplier);
      
      res.json({
        totalIntelItems,
        engagedItems,
        multiplier,
        completedContentIds: Array.from(completedContentIds),
        intelContent: intelContent.map(c => ({
          id: c.id,
          title: c.title,
          contentType: c.contentType,
          completed: completedContentIds.has(c.id),
        })),
      });
    } catch (error) {
      console.error("Error calculating Intel bonus:", error);
      res.status(500).json({ error: "Failed to calculate Intel bonus" });
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

      // Check if simulation is locked (browse-only mode)
      // Preview users (super admins testing) bypass the lock check
      const isPreviewUser = !!(user.previewRole && (user.previewOrgId || user.previewModeOrgId));
      if (!isPreviewUser) {
        let decisionOrgId: string | null = null;
        const decisionMemberships = await organizationStorage.getMembershipsByUser(userId);
        if (decisionMemberships && decisionMemberships.length > 0) {
          decisionOrgId = decisionMemberships[0].organizationId;
        }
        if (decisionOrgId) {
          const [decisionOrg] = await db.select().from(organizations).where(eq(organizations.id, decisionOrgId));
          if (decisionOrg?.simulationLocked === true) {
            return res.status(403).json({ 
              error: "Decisions are currently locked by your instructor. You can browse the simulation content, but submissions are not open yet.",
              locked: true
            });
          }
        }
      }

      const expectedWeek = req.body.expectedWeek;
      if (expectedWeek !== undefined) {
        const team = await storage.getTeam(user.teamId);
        const currentWeek = team?.currentWeek || 1;
        if (expectedWeek !== currentWeek) {
          return res.status(409).json({ 
            error: "Week has changed since you loaded this page. Please refresh and try again.",
            currentWeek,
            expectedWeek 
          });
        }
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

      const expectedWeek = req.body?.expectedWeek;
      if (expectedWeek !== undefined && expectedWeek !== previousWeek) {
        return res.status(409).json({ 
          error: "Week has already been advanced. Please refresh the page.",
          currentWeek: previousWeek,
          expectedWeek 
        });
      }
      
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
      
      // Send email notification about new week results (async, non-blocking)
      if (user.email) {
        const { sendWeekResultsEmail } = await import("./services/email");
        sendWeekResultsEmail({
          toEmail: user.email,
          studentName: [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Student',
          className: updatedTeam.name,
          weekNumber: previousWeek,
          nextWeekNumber: updatedTeam.currentWeek,
        }).catch(err => console.error("Failed to send week results email:", err));
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

      // Check if simulation is locked - preview users (admins testing) bypass the lock
      const isSubmitPreviewUser = !!(user.previewRole && (user.previewOrgId || user.previewModeOrgId));
      if (!isSubmitPreviewUser) {
        let submitOrgId: string | null = null;
        const submitMemberships = await organizationStorage.getMembershipsByUser(userId);
        if (submitMemberships && submitMemberships.length > 0) {
          submitOrgId = submitMemberships[0].organizationId;
        }
        if (submitOrgId) {
          const [submitOrg] = await db.select().from(organizations).where(eq(organizations.id, submitOrgId));
          if (submitOrg?.simulationLocked === true) {
            return res.status(403).json({ 
              error: "Decisions are currently locked by your instructor. You can browse the simulation content, but submissions are not open yet.",
              locked: true
            });
          }
        }
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

      // Check if simulation is locked - preview users (admins testing) bypass the lock
      const isEnhancedPreviewUser = !!(user?.previewRole && (user?.previewOrgId || user?.previewModeOrgId));
      if (!isEnhancedPreviewUser) {
        let enhancedOrgId: string | null = null;
        const enhancedMemberships = await organizationStorage.getMembershipsByUser(userId);
        if (enhancedMemberships && enhancedMemberships.length > 0) {
          enhancedOrgId = enhancedMemberships[0].organizationId;
        }
        if (enhancedOrgId) {
          const [enhancedOrg] = await db.select().from(organizations).where(eq(organizations.id, enhancedOrgId));
          if (enhancedOrg?.simulationLocked === true) {
            return res.status(403).json({ 
              error: "Decisions are currently locked by your instructor. You can browse the simulation content, but submissions are not open yet.",
              locked: true
            });
          }
        }
      }

      const expectedWeek = req.body.expectedWeek;
      if (expectedWeek !== undefined && expectedWeek !== weekNumber) {
        return res.status(409).json({ 
          error: "Week has changed since you loaded this page. Please refresh and try again.",
          currentWeek: weekNumber,
          expectedWeek 
        });
      }
      
      // Get decision context for LLM evaluation
      const decisions = await storage.getEnhancedDecisions(weekNumber);
      const decision = decisions.find(d => d.id === decisionId);
      const decisionContext = decision ? `${decision.title}: ${decision.context}` : "Business decision";
      
      // Use LLM evaluation for rationale quality (semantic understanding)
      const llmEvaluation = await storage.evaluateRationaleWithLLM(rationale, decisionContext, weekNumber);
      
      // Enhanced easter egg detection with view bonus (rewards students who engage with optional intel)
      const easterEggResult = await storage.detectEasterEggsWithViewBonus(
        rationale, 
        weekNumber, 
        userId, 
        user?.teamId || undefined
      );
      const keywordMatches = easterEggResult.foundIds;
      
      // Evaluate essay/text attributes with rubric-based LLM scoring
      const { evaluateTextResponse } = await import("./services/llm-evaluation");
      const { defaultRubricCriteria } = await import("@shared/schema");
      const { calculateSimulationImpact } = await import("./character-impact-engine");
      
      // Get character profiles for stakeholder context in essay grading
      const allCharacters = await storage.getCharacterProfiles();
      const characterTraits = allCharacters.map((c: any) => ({
        name: c.name,
        role: c.role,
        influence: c.influence ?? 5,
        hostility: c.hostility ?? 5,
        flexibility: c.flexibility ?? 5,
        riskTolerance: c.riskTolerance ?? 5,
        impactCategories: c.impactCategories ?? [],
      }));
      const simulationImpact = calculateSimulationImpact(characterTraits);
      const stakeholderContext = simulationImpact.llmGradingContext;
      
      const llmEvaluations: any[] = [];
      let totalLLMScore = 0;
      let totalMaxScore = 0;
      
      if (decision) {
        const textAttributes = decision.attributes.filter(a => a.type === "text" || a.type === "essay");
        
        for (const attr of textAttributes) {
          const responseText = attributeValues[attr.id];
          if (typeof responseText === "string" && responseText.trim().length > 0) {
            // Strip HTML tags for word count validation
            const plainText = responseText.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
            const attrWordCount = plainText.split(/\s+/).filter(w => w.length > 0).length;
            
            if (attr.minWords && attrWordCount < attr.minWords) {
              return res.status(400).json({ 
                error: `${attr.label} requires at least ${attr.minWords} words. Current: ${attrWordCount}` 
              });
            }
            
            // Use custom rubric or default
            const rubricCriteria = attr.rubricCriteria || defaultRubricCriteria;
            
            // Pass stakeholder context to LLM for essay grading
            const evaluation = await evaluateTextResponse(
              plainText,
              `${decision.title}: ${decision.context}\nAttribute: ${attr.label} - ${attr.description}`,
              rubricCriteria,
              weekNumber,
              stakeholderContext
            );
            
            llmEvaluations.push({
              attributeId: attr.id,
              rubricScores: evaluation.rubricScores,
              totalScore: evaluation.totalScore,
              maxPossibleScore: evaluation.maxPossibleScore,
              percentageScore: evaluation.percentageScore,
              overallFeedback: evaluation.overallFeedback,
              strengths: evaluation.strengths,
              areasForImprovement: evaluation.areasForImprovement,
              evaluatedAt: new Date().toISOString(),
            });
            
            // Weight by llmWeight if specified
            const weight = attr.llmWeight || 100;
            totalLLMScore += evaluation.percentageScore * (weight / 100);
            totalMaxScore += weight;
          }
        }
      }
      
      // Calculate overall LLM score (weighted average)
      const overallLLMScore = totalMaxScore > 0 ? Math.round(totalLLMScore / (totalMaxScore / 100)) : 0;
      
      // Get decision difficulty modifier based on character traits
      // Map decision category to impact categories for modifier calculation
      const { getDecisionDifficultyModifier } = await import("./character-impact-engine");
      type ImpactCat = "labor" | "finance" | "technology" | "culture" | "operations" | "strategy" | "legal" | "marketing" | "executive" | "external";
      const categoryMapping: Record<string, ImpactCat[]> = {
        "reskilling": ["labor", "culture"],
        "automation_financing": ["finance", "technology"],
        "workforce_displacement": ["labor", "operations"],
        "union_relations": ["labor", "legal"],
        "management_pipeline": ["executive", "culture"],
        "organizational_change": ["culture", "operations"],
        "strategic_investment": ["strategy", "finance"],
      };
      const decisionCategories = decision?.category ? (categoryMapping[decision.category] || []) : [];
      const difficultyModifier = getDecisionDifficultyModifier(simulationImpact, decisionCategories);
      
      const submission = await storage.submitEnhancedDecision(userId, decisionId, attributeValues, rationale);
      
      // Add LLM evaluations to the submission
      const enrichedSubmission = {
        ...submission,
        llmEvaluations,
        overallLLMScore,
        evaluationStatus: llmEvaluations.length > 0 ? "completed" : "pending",
      };
      
      // Log activity with both evaluation methods and view bonus data
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
          viewedContentMatches: easterEggResult.viewedContentMatches.length,
          viewBonusMultiplier: easterEggResult.viewBonusMultiplier,
          stakeholderDifficultyModifier: difficultyModifier,
          attributeKeys: Object.keys(attributeValues),
          essayEvaluationsCount: llmEvaluations.length,
          overallLLMScore,
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
      
      // Apply view bonus multiplier to research score (rewards intel engagement)
      // Also apply difficulty modifier - harder decisions (modifier > 1) give bonus points for success
      // Easier decisions (modifier < 1) slightly reduce points as they require less stakeholder consideration
      const stakeholderDifficultyBonus = difficultyModifier > 1 ? 1 + ((difficultyModifier - 1) * 0.5) : difficultyModifier;
      const adjustedResearchScore = Math.round(llmEvaluation.score * easterEggResult.viewBonusMultiplier * stakeholderDifficultyBonus);
      
      res.json({ 
        submission: enrichedSubmission,
        qualityFeedback: feedbackMessage,
        researchScore: adjustedResearchScore,
        baseResearchScore: llmEvaluation.score,
        viewBonusMultiplier: easterEggResult.viewBonusMultiplier,
        stakeholderDifficultyModifier: difficultyModifier,
        stakeholderDifficultyBonus,
        viewedIntelCount: easterEggResult.viewedContentMatches.length,
        llmEvaluations,
        overallLLMScore,
      });
    } catch (error) {
      console.error("[Submit Decision] Error:", error);
      res.status(500).json({ error: "Failed to submit enhanced decision" });
    }
  });

  app.get("/api/week-results/:weekNumber", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const weekNumber = parseInt(req.params.weekNumber) || 0;
      if (weekNumber < 1) {
        return res.status(400).json({ error: "Invalid week number" });
      }
      
      const user = await authStorage.getUser(userId);
      const team = user?.teamId ? await storage.getTeam(user.teamId) : null;
      
      if (!team) {
        return res.status(404).json({ error: "Team not found" });
      }
      
      const playerDecisions = await storage.getPlayerDecisions(userId);
      const weekDecisions = playerDecisions.filter(d => d.weekNumber === weekNumber);
      const enhancedDecisions = await storage.getEnhancedDecisions(weekNumber);
      
      const decisionsWithDetails = weekDecisions.map(submission => {
        const decision = enhancedDecisions.find(d => d.id === submission.decisionId);
        return {
          id: submission.id,
          decisionId: submission.decisionId,
          title: decision?.title || "Unknown Decision",
          category: decision?.category || "general",
          submittedAt: submission.timestamp,
          attributeValues: submission.attributeValues,
          llmEvaluations: submission.llmEvaluations || [],
          overallLLMScore: submission.overallLLMScore || 0,
        };
      });
      
      const leaderboard = await storage.getLeaderboard();
      const currentTeamRank = leaderboard.findIndex(t => t.teamId === team.id) + 1;
      
      const mockFinancialScore = Math.min(100, 50 + Math.floor(Math.random() * 30));
      const mockCulturalScore = Math.min(100, 50 + Math.floor(Math.random() * 30));
      
      const results = {
        weekNumber,
        financialScore: mockFinancialScore,
        culturalScore: mockCulturalScore,
        combinedScore: Math.round((mockFinancialScore + mockCulturalScore) / 2),
        previousRank: currentTeamRank + Math.floor(Math.random() * 3) - 1,
        currentRank: currentTeamRank || 1,
        rankChange: Math.floor(Math.random() * 3) - 1,
        decisions: decisionsWithDetails,
        topAnswers: [],
      };
      
      res.json(results);
    } catch (error) {
      console.error("[Week Results] Error:", error);
      res.status(500).json({ error: "Failed to fetch week results" });
    }
  });

  app.get("/api/admin/simulation-config", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await authStorage.getUser(userId);
      if (!isAdminUser(user)) {
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
      if (!isAdminUser(user)) {
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
      if (!isAdminUser(user)) {
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
      if (!isAdminUser(user)) {
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
      if (!isAdminUser(user)) {
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
      if (!isAdminUser(user)) {
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
      if (!isAdminUser(user)) {
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

  // ===== Simulation Modules CRUD =====
  const simulationModuleSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
    isDefault: z.boolean().optional(),
    isActive: z.boolean().optional(),
  });

  const simulationContentSchema = z.object({
    moduleId: z.string().min(1, "Module ID is required"),
    weekNumber: z.number().int().min(1).max(12),
    title: z.string().min(1, "Title is required"),
    contentType: z.enum(["text", "video", "audio", "google_doc", "link", "media"]),
    content: z.string().optional(),
    embedUrl: z.string().optional(),
    resourceUrl: z.string().optional(),
    thumbnailUrl: z.string().optional(),
    order: z.number().int().optional(),
    isActive: z.boolean().optional(),
    mediaUrl: z.string().optional(),
    mediaDurationSeconds: z.number().int().optional(),
    transcript: z.string().optional(),
    category: z.string().optional(),
    isIntelContent: z.boolean().optional(),
  });

  const contentEnhancementSchema = z.object({
    content: z.string().min(1).max(50000, "Content too long (max 50000 characters)"),
    enhancementType: z.enum(["improve_clarity", "expand_detail", "simplify", "add_data", "generate_scenario"]),
    context: z.string().max(2000).optional(),
  });

  app.get("/api/admin/simulation-modules", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await authStorage.getUser(userId);
      if (!isAdminUser(user)) {
        return res.status(403).json({ error: "Admin access required" });
      }
      const modules = await storage.getSimulationModules();
      res.json(modules);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch simulation modules" });
    }
  });

  app.post("/api/admin/simulation-modules", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await authStorage.getUser(userId);
      if (!isAdminUser(user)) {
        return res.status(403).json({ error: "Admin access required" });
      }
      const parsed = simulationModuleSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid module data", details: parsed.error.errors });
      }
      const module = await storage.createSimulationModule(parsed.data);
      res.json(module);
    } catch (error) {
      res.status(500).json({ error: "Failed to create simulation module" });
    }
  });

  app.put("/api/admin/simulation-modules/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await authStorage.getUser(userId);
      if (!isAdminUser(user)) {
        return res.status(403).json({ error: "Admin access required" });
      }
      const parsed = simulationModuleSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid module data", details: parsed.error.errors });
      }
      const module = await storage.updateSimulationModule(req.params.id, parsed.data);
      if (!module) {
        return res.status(404).json({ error: "Module not found" });
      }
      res.json(module);
    } catch (error) {
      res.status(500).json({ error: "Failed to update simulation module" });
    }
  });

  app.delete("/api/admin/simulation-modules/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await authStorage.getUser(userId);
      if (!isAdminUser(user)) {
        return res.status(403).json({ error: "Admin access required" });
      }
      await storage.deleteSimulationModule(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete simulation module" });
    }
  });

  // ===== Simulation Content CRUD =====
  app.get("/api/admin/simulation-content/:moduleId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await authStorage.getUser(userId);
      if (!isAdminUser(user)) {
        return res.status(403).json({ error: "Admin access required" });
      }
      const weekNumber = req.query.week ? parseInt(req.query.week as string) : undefined;
      const content = await storage.getSimulationContent(req.params.moduleId, weekNumber);
      res.json(content);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch simulation content" });
    }
  });

  app.post("/api/admin/simulation-content", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await authStorage.getUser(userId);
      if (!isAdminUser(user)) {
        return res.status(403).json({ error: "Admin access required" });
      }
      const parsed = simulationContentSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid content data", details: parsed.error.errors });
      }
      const item = await storage.createSimulationContent({
        ...parsed.data,
        createdBy: userId,
      });
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to create simulation content" });
    }
  });

  app.put("/api/admin/simulation-content/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await authStorage.getUser(userId);
      if (!isAdminUser(user)) {
        return res.status(403).json({ error: "Admin access required" });
      }
      const parsed = simulationContentSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid content data", details: parsed.error.errors });
      }
      const item = await storage.updateSimulationContent(req.params.id, {
        ...parsed.data,
        updatedBy: userId,
      });
      if (!item) {
        return res.status(404).json({ error: "Content not found" });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to update simulation content" });
    }
  });

  app.delete("/api/admin/simulation-content/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await authStorage.getUser(userId);
      if (!isAdminUser(user)) {
        return res.status(403).json({ error: "Admin access required" });
      }
      await storage.deleteSimulationContent(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete simulation content" });
    }
  });

  // ===== AI Content Enhancement =====
  app.post("/api/admin/simulation-content/enhance", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await authStorage.getUser(userId);
      if (!isAdminUser(user)) {
        return res.status(403).json({ error: "Admin access required" });
      }
      
      const parsed = contentEnhancementSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid enhancement request", details: parsed.error.errors });
      }
      
      const { content, enhancementType, context } = parsed.data;
      
      const OpenAI = (await import("openai")).default;
      const openai = new OpenAI();
      
      let systemPrompt = "";
      switch (enhancementType) {
        case "improve_clarity":
          systemPrompt = "You are a professional business writing editor. Improve the clarity, readability, and professionalism of the following content while maintaining its core meaning. Make it more engaging for graduate business students.";
          break;
        case "expand_detail":
          systemPrompt = "You are a business simulation content expert. Expand the following content with more relevant details, examples, and context to make it more comprehensive and educational for graduate business students studying AI adoption and workforce transformation.";
          break;
        case "simplify":
          systemPrompt = "You are a clear communication specialist. Simplify the following content to make it more accessible while retaining all key business concepts. Target audience is graduate business students.";
          break;
        case "add_data":
          systemPrompt = "You are a business research analyst. Enhance the following content by adding relevant statistics, research findings, or industry data points that support the narrative. Use realistic-sounding data for simulation purposes.";
          break;
        case "generate_scenario":
          systemPrompt = "You are a business simulation designer. Based on the context provided, generate a compelling decision scenario for a business simulation about AI adoption and workforce transformation. Include clear options with trade-offs.";
          break;
      }
      
      if (context) {
        systemPrompt += ` Additional context: ${context}`;
      }
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: content }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });
      
      const enhancedContent = completion.choices[0]?.message?.content || content;
      res.json({ enhancedContent, usage: completion.usage });
    } catch (error) {
      console.error("AI enhancement error:", error);
      res.status(500).json({ error: "Failed to enhance content" });
    }
  });

  // ===== Content Brief Generator for AI Media Creation =====
  // Exports week context, characters, tone guidelines for external AI tools (Gemini, etc.)
  app.get("/api/admin/content-brief/:weekNumber", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await authStorage.getUser(userId);
      if (!isAdminUser(user)) {
        return res.status(403).json({ error: "Admin access required" });
      }
      
      const weekNumber = parseInt(req.params.weekNumber, 10);
      if (isNaN(weekNumber) || weekNumber < 1 || weekNumber > 12) {
        return res.status(400).json({ error: "Invalid week number (1-12)" });
      }
      
      // Get the weekly scenario and decisions
      const scenario = await storage.getWeeklyScenario(weekNumber);
      const decisions = await storage.getWeeklyDecisions(weekNumber);
      
      if (!scenario) {
        return res.status(404).json({ error: `No scenario found for week ${weekNumber}` });
      }
      
      // Build character profiles from stakeholder perspectives
      const characters = new Map<string, { role: string; quotes: string[]; stances: string[] }>();
      
      // Add characters from scenario pressures
      for (const pressure of scenario.pressures) {
        const existing = characters.get(pressure.source);
        if (existing) {
          existing.quotes.push(pressure.message);
        } else {
          characters.set(pressure.source, {
            role: pressure.source,
            quotes: [pressure.message],
            stances: [],
          });
        }
      }
      
      // Add characters from decision stakeholder perspectives
      for (const decision of decisions) {
        for (const perspective of decision.stakeholderPerspectives) {
          const existing = characters.get(perspective.role);
          if (existing) {
            existing.quotes.push(perspective.quote);
            existing.stances.push(perspective.stance);
          } else {
            characters.set(perspective.role, {
              role: perspective.role,
              quotes: [perspective.quote],
              stances: [perspective.stance],
            });
          }
        }
      }
      
      // Build the content brief
      const contentBrief = {
        meta: {
          weekNumber,
          generatedAt: new Date().toISOString(),
          simulationName: "Future of Work: AI Workplace Transformation",
          company: "Apex Manufacturing",
          industry: "Precision Micro-Molding",
          location: "Iowa, USA",
        },
        scenario: {
          title: scenario.title,
          narrative: scenario.narrative,
          keyQuestion: scenario.keyQuestion,
          themes: extractThemes(scenario),
        },
        stakeholders: Array.from(characters.values()).map(char => ({
          role: char.role,
          characterTraits: inferCharacterTraits(char.role),
          quotes: char.quotes,
          stances: Array.from(new Set(char.stances)),
        })),
        decisions: decisions.map(d => ({
          id: d.id,
          title: d.title,
          category: d.category,
          context: d.context,
          options: d.options.map(opt => ({
            id: opt.id,
            label: opt.label,
            description: opt.description,
            risks: opt.risks,
          })),
        })),
        toneGuidelines: {
          overall: "Professional yet accessible for graduate business students",
          urgency: scenario.pressures.some(p => p.urgency === "critical") ? "high" : "moderate",
          complexity: "Nuanced - multiple valid perspectives with tradeoffs",
          emotionalRange: ["tension", "opportunity", "uncertainty", "determination"],
        },
        contentSuggestions: {
          videoIdeas: [
            `CEO video message about ${scenario.title.toLowerCase()}`,
            `Panel discussion with ${Array.from(characters.keys()).slice(0, 3).join(", ")}`,
            `Documentary-style overview of the week's challenges`,
          ],
          audioIdeas: [
            `Podcast episode: "What's at stake in Week ${weekNumber}"`,
            `Interview with key stakeholder about their perspective`,
            `Audio briefing summarizing the scenario`,
          ],
        },
        exportFormat: "Use this brief to create consistent AI-generated content. Characters should speak authentically to their roles. Maintain tension between competing priorities.",
      };
      
      res.json(contentBrief);
    } catch (error) {
      console.error("Content brief generation error:", error);
      res.status(500).json({ error: "Failed to generate content brief" });
    }
  });

  // ===== AI Consistency Review for Uploaded Media Transcripts =====
  // Reviews transcript against existing simulation content for alignment
  const transcriptReviewSchema = z.object({
    transcript: z.string().min(50, "Transcript must be at least 50 characters"),
    weekNumber: z.number().int().min(1).max(12),
    contentType: z.enum(["video", "audio", "media"]),
    title: z.string().min(1),
  });

  app.post("/api/admin/transcript-review", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await authStorage.getUser(userId);
      if (!isAdminUser(user)) {
        return res.status(403).json({ error: "Admin access required" });
      }
      
      const parsed = transcriptReviewSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid request", details: parsed.error.errors });
      }
      
      const { transcript, weekNumber, contentType, title } = parsed.data;
      
      // Get the scenario and existing content for context
      const scenario = await storage.getWeeklyScenario(weekNumber);
      const decisions = await storage.getWeeklyDecisions(weekNumber);
      
      if (!scenario) {
        return res.status(404).json({ error: `No scenario found for week ${weekNumber}` });
      }
      
      // Build context from existing content
      const existingContext = {
        scenario: {
          title: scenario.title,
          narrative: scenario.narrative,
          keyQuestion: scenario.keyQuestion,
          pressures: scenario.pressures,
        },
        stakeholders: decisions.flatMap(d => d.stakeholderPerspectives),
        decisionCategories: decisions.map(d => d.category),
      };
      
      const OpenAI = (await import("openai")).default;
      const openai = new OpenAI();
      
      const systemPrompt = `You are a content consistency reviewer for a business simulation about AI adoption and workforce transformation at Apex Manufacturing. 

Your job is to review a transcript for a ${contentType} asset and check it against the existing simulation content to ensure:
1. CHARACTER CONSISTENCY: Any stakeholder mentions align with established personalities and stances
2. TERMINOLOGY ALIGNMENT: Industry terms, company details, and technical language match existing content
3. TONE CONSISTENCY: The urgency, professionalism, and emotional register match the week's narrative
4. TIMELINE ALIGNMENT: Any dates, timeframes, or sequences mentioned are consistent
5. FACTUAL ACCURACY: Numbers, statistics, and claims align with established simulation data

Provide a structured review with:
- OVERALL_SCORE: 1-10 (10 = perfectly aligned)
- ISSUES: Array of specific problems found (empty if none)
- WARNINGS: Array of potential concerns that aren't critical
- SUGGESTIONS: Array of improvement recommendations
- CHARACTER_NOTES: Any character consistency observations
- APPROVED: boolean - true if ready to publish, false if needs revision`;

      const userPrompt = `Review this transcript for "${title}" (Week ${weekNumber} ${contentType}):

---TRANSCRIPT---
${transcript}
---END TRANSCRIPT---

---EXISTING SIMULATION CONTEXT---
${JSON.stringify(existingContext, null, 2)}
---END CONTEXT---

Provide your consistency review in JSON format.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 1500,
        response_format: { type: "json_object" },
      });
      
      const reviewText = completion.choices[0]?.message?.content || "{}";
      let review;
      try {
        review = JSON.parse(reviewText);
      } catch {
        review = { 
          OVERALL_SCORE: 5, 
          ISSUES: ["Unable to parse review"], 
          WARNINGS: [], 
          SUGGESTIONS: [], 
          APPROVED: false,
          rawResponse: reviewText 
        };
      }
      
      res.json({ 
        review, 
        weekNumber,
        contentType,
        title,
        usage: completion.usage,
      });
    } catch (error) {
      console.error("Transcript review error:", error);
      res.status(500).json({ error: "Failed to review transcript" });
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
      const { name, email, phone, institution, inquiryType, message, referralSource } = req.body;
      
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
      
      const inquiry = await storage.createEducatorInquiry({
        name,
        email,
        phone: phone || null,
        institution: institution || null,
        inquiryType: inquiryType || 'general',
        message,
        referralSource: referralSource || null,
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

  // ==================== DEMO SELF-SERVICE ROUTES ====================
  
  // Request demo access (public - auto-provisions evaluator account)
  app.post("/api/demo/request-access", async (req, res) => {
    try {
      const { email, name, institution, message, referralSource } = req.body;
      
      if (!email || !name) {
        return res.status(400).json({ error: "Email and name are required" });
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }
      
      // Prefer .edu emails but don't require
      const isEduEmail = email.toLowerCase().endsWith('.edu');
      
      console.log("[Demo Access] Provisioning evaluator:", { 
        email, 
        name, 
        institution, 
        isEduEmail 
      });
      
      // Provision the evaluator
      const result = await demoService.provisionEvaluator(email, name, institution);
      
      // Log the activity
      await storage.logActivity({
        eventType: "demo_access_provisioned",
        userEmail: email,
        userName: name,
        details: { 
          institution, 
          message, 
          referralSource: referralSource || null,
          expiresAt: result.expiresAt.toISOString(),
          demoOrgId: result.orgId 
        },
      });
      
      // Send SMS notification to super admin
      try {
        if (await isTwilioConfigured()) {
          const superAdmins = await db.select()
            .from(users)
            .where(eq(users.isAdmin, 'super_admin'));
          
          for (const admin of superAdmins) {
            const adminOrgs = await organizationStorage.getOrganizationsByOwner(admin.id);
            for (const org of adminOrgs) {
              if (org.notifyOnSignup && org.notifyPhone) {
                await sendSmsNotification(org.notifyPhone, 'educator_inquiry', {
                  inquirerName: name,
                  inquirerEmail: email,
                  inquiryType: 'demo_access',
                  institution: institution || undefined,
                });
                break;
              }
            }
          }
        }
      } catch (smsError) {
        console.error("[Demo Access] SMS notification failed:", smsError);
      }
      
      res.json({ 
        success: true, 
        demoCode: demoService.getDemoOrgCode(),
        expiresAt: result.expiresAt.toISOString(),
        message: `Demo access granted! Your account will be active for 30 days. Sign in with your email (${email}) to explore the simulation.`
      });
    } catch (error) {
      console.error("[Demo Access] Error:", error);
      res.status(500).json({ error: "Failed to provision demo access" });
    }
  });
  
  // Student trial - provision 7-day trial for authenticated students
  app.post("/api/demo/student-trial", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const [user] = await db.select().from(users).where(eq(users.id, userId));
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (user.demoAccess === "student_trial" && user.demoExpiresAt && new Date(user.demoExpiresAt) > new Date()) {
        return res.json({
          success: true,
          alreadyActive: true,
          expiresAt: user.demoExpiresAt,
          message: "Your trial is already active!"
        });
      }

      if (user.demoAccess === "student_trial" && user.demoExpiresAt && new Date(user.demoExpiresAt) < new Date()) {
        return res.status(403).json({ error: "Your 7-day trial has expired. Ask your instructor about getting full access." });
      }

      const firstName = user.firstName || "Student";
      const lastName = user.lastName || "";

      console.log("[Student Trial] Provisioning trial:", { userId, firstName, lastName });

      const result = await demoService.provisionStudentTrial(userId, firstName, lastName);

      await storage.logActivity({
        eventType: "student_trial_provisioned",
        userId,
        userEmail: user.email || undefined,
        userName: `${firstName} ${lastName}`.trim(),
        details: {
          expiresAt: result.expiresAt.toISOString(),
          teamId: result.teamId,
          demoOrgId: result.orgId,
        },
      });

      res.json({
        success: true,
        expiresAt: result.expiresAt.toISOString(),
        message: "Your 7-day trial is active! Dive into the simulation and experience AI leadership firsthand."
      });
    } catch (error) {
      console.error("[Student Trial] Error:", error);
      res.status(500).json({ error: "Failed to provision student trial" });
    }
  });

  // Check if user has demo access (authenticated)
  app.get("/api/demo/status", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const isEvaluator = await demoService.isEvaluator(userId);
      const allowedOrgs = await demoService.getUserAllowedOrganizations(userId);
      
      res.json({ 
        isEvaluator,
        allowedOrganizations: allowedOrgs,
        demoCode: isEvaluator ? demoService.getDemoOrgCode() : undefined
      });
    } catch (error) {
      console.error("[Demo Status] Error:", error);
      res.status(500).json({ error: "Failed to check demo status" });
    }
  });

  // Enter demo preview mode (super admin only)
  app.post("/api/demo/preview/enter", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Only super admins can enter demo preview mode
      const isSuperAdmin = await organizationStorage.isSuperAdmin(userId);
      if (!isSuperAdmin) {
        return res.status(403).json({ error: "Super admin access required" });
      }

      // Ensure demo org exists and get its ID
      const demoOrgId = await demoService.ensureDemoOrganizationExists();

      // Check if admin is already a member of demo org, if not add them as class_admin
      const existingMember = await organizationStorage.getMember(userId, demoOrgId);
      if (!existingMember) {
        await organizationStorage.addMember({
          userId,
          organizationId: demoOrgId,
          role: ROLES.CLASS_ADMIN,
          status: "active",
          approvedAt: new Date(),
        });
      }

      (req.session as any).preview = { role: "demo", orgId: demoOrgId };

      await new Promise<void>((resolve, reject) => {
        req.session.save((err: any) => err ? reject(err) : resolve());
      });

      console.log("[Demo Preview] Admin entered demo preview mode:", { userId, demoOrgId });

      res.json({ 
        success: true, 
        demoOrgId,
        demoCode: demoService.getDemoOrgCode(),
        message: "You are now viewing the platform as an evaluator would. Use the demo controls to exit when done."
      });
    } catch (error) {
      console.error("[Demo Preview] Error entering:", error);
      res.status(500).json({ error: "Failed to enter demo preview mode" });
    }
  });

  // Exit demo preview mode
  app.post("/api/demo/preview/exit", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      delete (req.session as any).preview;

      await new Promise<void>((resolve, reject) => {
        req.session.save((err: any) => err ? reject(err) : resolve());
      });

      await db.update(users)
        .set({ 
          inDemoPreview: false, 
          demoPreviewOrgId: null, 
          updatedAt: new Date() 
        })
        .where(eq(users.id, userId));

      console.log("[Demo Preview] Admin exited demo preview mode:", { userId });

      res.json({ success: true });
    } catch (error) {
      console.error("[Demo Preview] Error exiting:", error);
      res.status(500).json({ error: "Failed to exit demo preview mode" });
    }
  });

  // Get demo preview status
  app.get("/api/demo/preview/status", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const sessionPreview = (req.session as any)?.preview;
      const inDemoPreview = sessionPreview?.role === "demo";
      const demoPreviewOrgId = inDemoPreview ? sessionPreview?.orgId : null;

      res.json({ 
        inDemoPreview,
        demoPreviewOrgId,
        demoCode: inDemoPreview ? demoService.getDemoOrgCode() : undefined
      });
    } catch (error) {
      console.error("[Demo Preview] Error getting status:", error);
      res.status(500).json({ error: "Failed to get demo preview status" });
    }
  });

  // ==================== MAGIC INVITE LINKS ====================

  app.get("/join/:code", (req: any, res) => {
    const code = req.params.code?.toUpperCase();
    if (!code) {
      return res.redirect("/?error=invalid_code");
    }
    (req.session as any).pendingJoinCode = code;
    if (req.isAuthenticated?.()) {
      return res.redirect(`/?joinCode=${code}`);
    }
    return res.redirect("/api/login");
  });

  app.get("/api/join/pending", isAuthenticated, async (req: any, res) => {
    const pendingCode = (req.session as any)?.pendingJoinCode;
    if (!pendingCode) {
      return res.json({ pending: false });
    }
    res.json({ pending: true, code: pendingCode });
  });

  app.post("/api/join/complete", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await authStorage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const pendingCode = (req.session as any)?.pendingJoinCode;
      if (!pendingCode) {
        return res.status(400).json({ error: "No pending join code" });
      }

      delete (req.session as any).pendingJoinCode;

      const result = await organizationStorage.validateInviteCode(pendingCode);
      if (!result.valid || !result.invite || !result.organization) {
        return res.status(400).json({ error: result.error || "Invalid or expired team code" });
      }

      const targetOrgId = result.organization.id;
      const targetOrgName = result.organization.name;

      const existingMember = await organizationStorage.getMember(userId, targetOrgId);
      if (existingMember) {
        return res.json({ success: true, alreadyMember: true, organizationName: targetOrgName });
      }

      await organizationStorage.addMember({
        userId,
        organizationId: targetOrgId,
        role: ROLES.STUDENT,
        status: "active",
      });

      await organizationStorage.incrementInviteUsage(result.invite.id);

      const isPrivacyMode = result.organization.privacyMode === true;
      if (!isPrivacyMode) {
        const userEmail = user.schoolEmail || user.email || "";
        await organizationStorage.notifyAdminsOfSignup(targetOrgId, {
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: userEmail,
        });
      }

      res.json({ success: true, organizationName: targetOrgName });
    } catch (error) {
      console.error("[Magic Join] Error:", error);
      res.status(500).json({ error: "Failed to join organization" });
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

      let instructorName: string | undefined;
      if (result.organization?.id) {
        const members = await organizationStorage.getMembersByOrganization(result.organization.id);
        const admin = members.find((m: any) => m.role === 'class_admin' || m.role === 'super_admin');
        if (admin) {
          const adminUser = await authStorage.getUser(admin.userId);
          if (adminUser) {
            instructorName = [adminUser.firstName, adminUser.lastName].filter(Boolean).join(' ') || undefined;
          }
        }
      }
      
      res.json({ 
        valid: true, 
        organizationName: result.organization?.name,
        organizationId: result.organization?.id,
        instructorName,
        privacyMode: result.organization?.privacyMode === true
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

      let targetOrgId: string;
      let targetOrgName: string;
      let inviteId: string | null = null;
      let targetOrg: any = null;

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
        targetOrg = result.organization;
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
          targetOrg = result.organization;
          inviteId = result.invite.id;
        } else if (organizationId) {
          // No code but organization ID provided (for open enrollment)
          const org = await organizationStorage.getOrganization(organizationId);
          if (!org) {
            return res.status(400).json({ error: "Organization not found" });
          }
          
          targetOrgId = org.id;
          targetOrgName = org.name;
          targetOrg = org;
        } else {
          // No code and no organization - cannot proceed
          return res.status(400).json({ error: "Please provide a team code or select an organization to join" });
        }
      }

      // PRIVACY MODE: Skip .edu email verification if organization has privacy mode enabled
      const isPrivacyMode = targetOrg?.privacyMode === true;
      
      // Check .edu email requirement based on platform settings (unless privacy mode is on)
      if (platformSettings.requireEduEmail && !isPrivacyMode) {
        // SECURITY: Only allow joining if user has a verified .edu email in their profile
        // We do NOT accept schoolEmail from request body to prevent bypassing verification
        if (user.schoolEmailVerified !== "true") {
          return res.status(400).json({ error: "Please verify your .edu email before joining an organization." });
        }
        
        if (!user.schoolEmail || !validateEduEmail(user.schoolEmail)) {
          return res.status(400).json({ error: "A verified .edu email is required. Please verify your email first." });
        }
      }

      // Check if already a member - handle gracefully instead of throwing error
      const existingMember = await organizationStorage.getMember(userId, targetOrgId);
      if (existingMember) {
        // If deactivated, reactivate them
        if (existingMember.status === "deactivated" || existingMember.status === "inactive") {
          await db.update(organizationMembers)
            .set({ status: 'active' })
            .where(eq(organizationMembers.id, existingMember.id));
        }
        return res.json({ success: true, alreadyMember: true, organizationName: targetOrgName });
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
      // PRIVACY MODE: Don't store phone numbers in privacy mode
      if (!isPrivacyMode && phoneNumber) {
        // Phone number storage is handled separately if needed
        console.log(`[Enrollment] Phone number provided for user ${userId}: ${phoneNumber.substring(0, 3)}***`);
      }

      // PRIVACY MODE: Skip all notifications in privacy mode
      if (!isPrivacyMode) {
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
      } else {
        console.log("[Privacy Mode] Notifications skipped for privacy mode organization:", targetOrgName);
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

      const { name, description, ownerEmail, maxMembers, notifyPhone, privacyMode } = req.body;
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

      // PRIVACY MODE: Disable notifications if privacy mode is enabled
      const isPrivacyModeEnabled = privacyMode === true;
      const org = await organizationStorage.createOrganization({
        code,
        name,
        description,
        ownerId,
        maxMembers: maxMembers || 100,
        notifyOnSignup: isPrivacyModeEnabled ? false : !!notifyPhone,
        notifyPhone: isPrivacyModeEnabled ? undefined : (notifyPhone || undefined),
        privacyMode: isPrivacyModeEnabled,
        privacyModeNotificationsDisabled: isPrivacyModeEnabled,
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

  // Toggle simulation lock (Class Admin or Super Admin)
  app.post("/api/class-admin/organizations/:orgId/toggle-lock", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const { orgId } = req.params;
      const { locked } = req.body;
      
      if (typeof locked !== 'boolean') {
        return res.status(400).json({ error: "locked must be a boolean" });
      }
      
      const isSuperAdmin = await organizationStorage.isSuperAdmin(userId);
      const member = await organizationStorage.getMember(userId, orgId);
      const isClassAdmin = member?.role === "class_admin" || member?.role === "super_admin";
      
      if (!isSuperAdmin && !isClassAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }
      
      const org = await organizationStorage.updateOrganization(orgId, { simulationLocked: locked });
      if (!org) {
        return res.status(404).json({ error: "Organization not found" });
      }
      
      res.json({ success: true, simulationLocked: org.simulationLocked });
    } catch (error) {
      console.error("Error toggling simulation lock:", error);
      res.status(500).json({ error: "Failed to toggle simulation lock" });
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
      const { name, description, maxMembers, notifyPhone, notifyOnSignup, status, privacyMode, simulationLocked } = req.body;

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

      // PRIVACY MODE: If privacy mode is enabled, disable notifications
      const isPrivacyModeEnabled = privacyMode === true;
      const org = await organizationStorage.updateOrganization(id, {
        name: name.trim(),
        description: description || undefined,
        maxMembers: parsedMaxMembers,
        notifyPhone: isPrivacyModeEnabled ? null : (notifyPhone || undefined),
        notifyOnSignup: isPrivacyModeEnabled ? false : (typeof notifyOnSignup === 'boolean' ? notifyOnSignup : undefined),
        status: status || undefined,
        privacyMode: isPrivacyModeEnabled,
        privacyModeNotificationsDisabled: isPrivacyModeEnabled,
        simulationLocked: typeof simulationLocked === 'boolean' ? simulationLocked : undefined,
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

  // Unified People API - combines all users, organization members, and team info (Super Admin only)
  app.get("/api/super-admin/people", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const isSuperAdmin = await organizationStorage.isSuperAdmin(userId);
      if (!isSuperAdmin) {
        return res.status(403).json({ error: "Super Admin access required" });
      }

      // Get all users with their team info
      const allUsers = await db.select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        teamId: users.teamId,
        isAdmin: users.isAdmin,
        createdAt: users.createdAt,
      }).from(users)
        .where(sql`${users.isTestStudent} = false OR ${users.isTestStudent} IS NULL`);

      // Get all organization members with org info (including deactivated for super admin management)
      const allOrgMembers = await db.select({
        id: organizationMembers.id,
        memberId: organizationMembers.id,
        userId: organizationMembers.userId,
        organizationId: organizationMembers.organizationId,
        role: organizationMembers.role,
        memberStatus: organizationMembers.status,
        joinedAt: organizationMembers.joinedAt,
        orgName: organizations.name,
        orgCode: organizations.code,
      }).from(organizationMembers)
        .leftJoin(organizations, eq(organizationMembers.organizationId, organizations.id));

      // Get all teams for team name lookup
      const allTeams = await db.select({
        id: teams.id,
        name: teams.name,
        organizationId: teams.organizationId,
      }).from(teams);

      // Create lookup maps
      const teamMap = new Map(allTeams.map(t => [t.id, t]));
      const userOrgMap = new Map<string, typeof allOrgMembers[0][]>();
      
      // Group org members by userId
      for (const member of allOrgMembers) {
        const existing = userOrgMap.get(member.userId) || [];
        existing.push(member);
        userOrgMap.set(member.userId, existing);
      }

      // Build unified people list
      const people = allUsers.map(user => {
        const orgMemberships = userOrgMap.get(user.id) || [];
        const primaryMembership = orgMemberships[0]; // Take first org membership
        const team = user.teamId ? teamMap.get(user.teamId) : null;
        
        // Determine role
        let role: 'super_admin' | 'class_admin' | 'student' = 'student';
        if (user.isAdmin === 'super_admin' || user.isAdmin === 'true') {
          role = 'super_admin';
        } else if (user.isAdmin === 'class_admin') {
          role = 'class_admin';
        } else if (primaryMembership?.role === 'class_admin') {
          role = 'class_admin';
        }

        // Determine status
        let status: 'active' | 'pending' | 'invited' | 'never_invited' | 'deactivated' = 'active';
        if (primaryMembership) {
          if (primaryMembership.memberStatus === 'deactivated') {
            status = 'deactivated';
          } else if (primaryMembership.memberStatus === 'pending') {
            status = 'pending';
          } else if (primaryMembership.memberStatus === 'active') {
            status = 'active';
          }
        }

        return {
          id: user.id,
          email: user.email || '',
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          profileImageUrl: user.profileImageUrl || null,
          role,
          status,
          hasAccount: true,
          organizationId: primaryMembership?.organizationId || null,
          organizationName: primaryMembership?.orgName || null,
          organizationCode: primaryMembership?.orgCode || null,
          teamId: user.teamId || null,
          teamName: team?.name || null,
          memberId: primaryMembership?.memberId || null,
          joinedAt: primaryMembership?.joinedAt || user.createdAt,
          allMemberships: orgMemberships.map(m => ({
            organizationId: m.organizationId,
            organizationName: m.orgName,
            role: m.role,
            status: m.memberStatus,
          })),
        };
      });

      // Also find org members without user accounts (invited but not registered)
      const userIds = new Set(allUsers.map(u => u.id));
      const pendingMembers = allOrgMembers
        .filter(m => !userIds.has(m.userId))
        .map(member => ({
          id: member.userId, // Use the placeholder userId
          email: '', // No email since no user account
          firstName: '',
          lastName: '',
          profileImageUrl: null,
          role: member.role as 'super_admin' | 'class_admin' | 'student',
          status: 'invited' as const,
          hasAccount: false,
          organizationId: member.organizationId,
          organizationName: member.orgName,
          organizationCode: member.orgCode,
          teamId: null,
          teamName: null,
          memberId: member.memberId,
          joinedAt: member.joinedAt,
          allMemberships: [{
            organizationId: member.organizationId,
            organizationName: member.orgName,
            role: member.role,
            status: member.memberStatus,
          }],
        }));

      // Combine and sort by name
      const allPeople = [...people, ...pendingMembers].sort((a, b) => {
        const nameA = `${a.lastName} ${a.firstName}`.toLowerCase();
        const nameB = `${b.lastName} ${b.firstName}`.toLowerCase();
        return nameA.localeCompare(nameB);
      });

      res.json(allPeople);
    } catch (error) {
      console.error("Error fetching unified people:", error);
      res.status(500).json({ error: "Failed to fetch people data" });
    }
  });

  // Get all teams (for team assignment dropdown)
  app.get("/api/super-admin/teams", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const isSuperAdmin = await organizationStorage.isSuperAdmin(userId);
      if (!isSuperAdmin) {
        return res.status(403).json({ error: "Super Admin access required" });
      }

      const allTeams = await db.select({
        id: teams.id,
        name: teams.name,
        organizationId: teams.organizationId,
        orgName: organizations.name,
      }).from(teams)
        .leftJoin(organizations, eq(teams.organizationId, organizations.id))
        .orderBy(teams.name);

      res.json(allTeams);
    } catch (error) {
      console.error("Error fetching teams:", error);
      res.status(500).json({ error: "Failed to fetch teams" });
    }
  });

  // Update user details (Super Admin only)
  app.patch("/api/super-admin/people/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const isSuperAdmin = await organizationStorage.isSuperAdmin(userId);
      if (!isSuperAdmin) {
        return res.status(403).json({ error: "Super Admin access required" });
      }

      const { id } = req.params;
      const { firstName, lastName, email, profileImageUrl } = req.body;

      const updateData: any = {};
      if (firstName !== undefined) updateData.firstName = firstName;
      if (lastName !== undefined) updateData.lastName = lastName;
      if (email !== undefined) updateData.email = email;
      if (profileImageUrl !== undefined) updateData.profileImageUrl = profileImageUrl;
      updateData.updatedAt = new Date();

      const [updated] = await db.update(users)
        .set(updateData)
        .where(eq(users.id, id))
        .returning();

      if (!updated) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(updated);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  // Update user team assignment (Super Admin only)
  app.patch("/api/super-admin/people/:id/team", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const isSuperAdmin = await organizationStorage.isSuperAdmin(userId);
      if (!isSuperAdmin) {
        return res.status(403).json({ error: "Super Admin access required" });
      }

      const { id } = req.params;
      const { teamId } = req.body;

      const [updated] = await db.update(users)
        .set({ teamId: teamId || null, updatedAt: new Date() })
        .where(eq(users.id, id))
        .returning();

      if (!updated) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(updated);
    } catch (error) {
      console.error("Error updating user team:", error);
      res.status(500).json({ error: "Failed to update team" });
    }
  });

  // Deactivate organization member (Super Admin only)
  app.post("/api/super-admin/people/:memberId/deactivate", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const isSuperAdmin = await organizationStorage.isSuperAdmin(userId);
      if (!isSuperAdmin) {
        return res.status(403).json({ error: "Super Admin access required" });
      }

      const { memberId } = req.params;

      // Get member info first
      const [member] = await db.select().from(organizationMembers).where(eq(organizationMembers.id, memberId));
      if (!member) {
        return res.status(404).json({ error: "Member not found" });
      }

      // Clear teamId from user
      await db.update(users)
        .set({ teamId: null })
        .where(eq(users.id, member.userId));

      // Set member status to deactivated
      const [updated] = await db.update(organizationMembers)
        .set({ status: 'deactivated' })
        .where(eq(organizationMembers.id, memberId))
        .returning();

      res.json(updated);
    } catch (error) {
      console.error("Error deactivating member:", error);
      res.status(500).json({ error: "Failed to deactivate member" });
    }
  });

  // Reactivate organization member (Super Admin only)
  app.post("/api/super-admin/people/:memberId/reactivate", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const isSuperAdmin = await organizationStorage.isSuperAdmin(userId);
      if (!isSuperAdmin) {
        return res.status(403).json({ error: "Super Admin access required" });
      }

      const { memberId } = req.params;

      const [updated] = await db.update(organizationMembers)
        .set({ status: 'active' })
        .where(eq(organizationMembers.id, memberId))
        .returning();

      if (!updated) {
        return res.status(404).json({ error: "Member not found" });
      }

      res.json(updated);
    } catch (error) {
      console.error("Error reactivating member:", error);
      res.status(500).json({ error: "Failed to reactivate member" });
    }
  });

  // Remove member from organization (Super Admin only)
  app.delete("/api/super-admin/people/member/:memberId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const isSuperAdmin = await organizationStorage.isSuperAdmin(userId);
      if (!isSuperAdmin) {
        return res.status(403).json({ error: "Super Admin access required" });
      }

      const { memberId } = req.params;

      // Get member info first
      const [member] = await db.select().from(organizationMembers).where(eq(organizationMembers.id, memberId));
      if (!member) {
        return res.status(404).json({ error: "Member not found" });
      }

      // Clear teamId from user
      await db.update(users)
        .set({ teamId: null })
        .where(eq(users.id, member.userId));

      // Delete the membership
      await db.delete(organizationMembers).where(eq(organizationMembers.id, memberId));

      res.json({ success: true, message: "Member removed from organization" });
    } catch (error) {
      console.error("Error removing member:", error);
      res.status(500).json({ error: "Failed to remove member" });
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

  // ==================== PRIVACY MODE ROUTES ====================
  
  // Download Privacy Mode Roster Template (for mapping pseudonyms to real students offline)
  app.get("/api/class-admin/organizations/:orgId/privacy-roster-template", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { orgId } = req.params;
      
      // Check if user is admin of this org
      const membership = await organizationStorage.getMember(userId, orgId);
      if (!membership || (membership.role !== ROLES.CLASS_ADMIN && !(await organizationStorage.isSuperAdmin(userId)))) {
        return res.status(403).json({ error: "Admin access required" });
      }
      
      const org = await organizationStorage.getOrganization(orgId);
      if (!org) {
        return res.status(404).json({ error: "Organization not found" });
      }
      
      // Get all members of this organization
      const members = await organizationStorage.getMembersByOrganization(orgId);
      const studentMembers = members.filter((m: any) => m.role === ROLES.STUDENT);
      
      // Get teams for this organization
      const allTeams = await storage.getAllTeams();
      const orgTeams = allTeams.filter((t: any) => t.organizationId === orgId);
      const teamMap = new Map(orgTeams.map((t: any) => [t.id, t.name]));
      
      // Generate CSV with pseudonymous identifiers
      const headers = [
        "Pseudonym (Username)", 
        "Team Name", 
        "Enrolled Date",
        "Real Name (FILL IN OFFLINE)",
        "Student ID (FILL IN OFFLINE)",
        "Email (FILL IN OFFLINE)"
      ];
      
      const rows: string[][] = studentMembers.map((m: any) => {
        // Use username or generate a pseudonym from user ID
        const pseudonym = m.firstName && m.lastName 
          ? `Student_${m.id.substring(0, 8)}` 
          : `Student_${m.id.substring(0, 8)}`;
        const teamName = m.teamId ? (teamMap.get(m.teamId) || "Unassigned") : "Unassigned";
        const enrolledDate = m.joinedAt ? new Date(m.joinedAt).toLocaleDateString() : "Unknown";
        
        return [
          pseudonym,
          teamName,
          enrolledDate,
          "", // Real Name - to be filled offline
          "", // Student ID - to be filled offline  
          ""  // Email - to be filled offline
        ];
      });
      
      const csv = [
        `# Privacy Mode Roster Template - ${org.name}`,
        `# Generated: ${new Date().toISOString()}`,
        `# IMPORTANT: This file is for OFFLINE use only. Do NOT upload student PII to the platform.`,
        "",
        headers.join(","),
        ...rows.map((r) => r.join(","))
      ].join("\n");
      
      const filename = `privacy-roster-${org.code || org.id}-${new Date().toISOString().split('T')[0]}.csv`;
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
      res.send(csv);
    } catch (error) {
      console.error("[Privacy Roster] Export error:", error);
      res.status(500).json({ error: "Failed to generate roster template" });
    }
  });

  // ==================== CLASS ADMIN ROUTES ====================
  
  // Get organizations I manage (Class Admin)
  app.get("/api/class-admin/my-organizations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const memberships = await organizationStorage.getMembershipsByUser(userId);
      
      // Check if user is in demo preview mode
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      const inDemoPreview = user?.inDemoPreview || false;
      const demoPreviewOrgId = user?.demoPreviewOrgId;
      
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
      
      // If in demo preview mode, ensure the demo org is included
      if (inDemoPreview && demoPreviewOrgId) {
        const hasDemoOrg = orgs.some(o => o?.id === demoPreviewOrgId);
        if (!hasDemoOrg) {
          const demoOrg = await organizationStorage.getOrganization(demoPreviewOrgId);
          if (demoOrg) {
            const members = await organizationStorage.getMembersByOrganization(demoPreviewOrgId);
            const invites = await organizationStorage.getInvitesByOrganization(demoPreviewOrgId);
            orgs.unshift({ ...demoOrg, memberCount: members.length, invites });
          }
        }
      }
      
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

      // Block real email sends in preview mode (still allow the import itself for testing)
      const sessionPreview = (req.session as any)?.preview;
      const adminUserCheck = await authStorage.getUser(adminUserId);
      const isInPreview = sessionPreview?.role || adminUserCheck?.previewRole || adminUserCheck?.inDemoPreview || adminUserCheck?.inInstructorPreview;

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

      // Send invitation emails if enabled (skip in preview mode)
      if (sendInvites && newlyAddedStudents.length > 0) {
        if (isInPreview) {
          console.log(`[Preview Mode] Skipping ${newlyAddedStudents.length} invitation emails (preview mode active)`);
          results.emailsSent = newlyAddedStudents.length;
        } else {
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

      // Block sending real emails/SMS in preview mode
      const sessionPreview = (req.session as any)?.preview;
      const adminUser0 = await authStorage.getUser(adminUserId);
      const isInPreview = sessionPreview?.role || adminUser0?.previewRole || adminUser0?.inDemoPreview || adminUser0?.inInstructorPreview;
      if (isInPreview) {
        return res.json({ success: true, message: "Invitation email simulated (preview mode — no real email sent)" });
      }

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
      
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      const sessionPreview = (req.session as any)?.preview;
      const inStudentPreview = sessionPreview?.role === "student";
      const previewModeOrgId = inStudentPreview ? sessionPreview?.orgId : null;
      
      const inDemoPreview = sessionPreview?.role === "demo";
      const demoPreviewOrgId = inDemoPreview ? sessionPreview?.orgId : null;
      
      const inInstructorPreview = sessionPreview?.role === "educator";
      const instructorPreviewOrgId = inInstructorPreview ? sessionPreview?.orgId : null;

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
        inDemoPreview,
        demoPreviewOrgId,
        inInstructorPreview,
        instructorPreviewOrgId,
        previewRole: sessionPreview?.role || null,
        previewOrgId: sessionPreview?.orgId || null,
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
        inPreviewMode: (req.session as any)?.preview?.role === "student" || adminUser?.inStudentPreview || false,
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

  // ==================== INSTRUCTOR PREVIEW MODE ====================
  
  app.post("/api/instructor-preview/enter", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { orgId } = req.body;

      const isSuperAdmin = await organizationStorage.isSuperAdmin(userId);
      if (!isSuperAdmin) {
        return res.status(403).json({ error: "Super Admin access required" });
      }

      if (!orgId) {
        return res.status(400).json({ error: "orgId is required" });
      }

      const [org] = await db.select().from(organizations).where(eq(organizations.id, orgId));
      if (!org) {
        return res.status(404).json({ error: "Organization not found" });
      }

      (req.session as any).preview = { role: "educator", orgId };

      await new Promise<void>((resolve, reject) => {
        req.session.save((err: any) => err ? reject(err) : resolve());
      });

      res.json({ success: true, orgId, orgName: org.name });
    } catch (error) {
      console.error("Error entering instructor preview:", error);
      res.status(500).json({ error: "Failed to enter instructor preview mode" });
    }
  });

  app.post("/api/instructor-preview/exit", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;

      delete (req.session as any).preview;

      await new Promise<void>((resolve, reject) => {
        req.session.save((err: any) => err ? reject(err) : resolve());
      });

      await db.update(users)
        .set({ inInstructorPreview: false, instructorPreviewOrgId: null, updatedAt: new Date() })
        .where(eq(users.id, userId));

      res.json({ success: true });
    } catch (error) {
      console.error("Error exiting instructor preview:", error);
      res.status(500).json({ error: "Failed to exit instructor preview mode" });
    }
  });

  // ==================== UNIFIED ROLE PREVIEW ====================

  app.post("/api/preview/enter", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { role, orgId } = req.body;

      if (!role || !["educator", "student"].includes(role)) {
        return res.status(400).json({ error: "role must be 'educator' or 'student'" });
      }
      if (!orgId) {
        return res.status(400).json({ error: "orgId is required" });
      }

      const isSuperAdmin = await organizationStorage.isSuperAdmin(userId);
      const isEvaluator = await (async () => {
        const [user] = await db.select().from(users).where(eq(users.id, userId));
        return user?.demoAccess === "evaluator";
      })();

      if (!isSuperAdmin && !isEvaluator) {
        return res.status(403).json({ error: "Super Admin or Evaluator access required" });
      }

      const [org] = await db.select().from(organizations).where(eq(organizations.id, orgId));
      if (!org) {
        return res.status(404).json({ error: "Organization not found" });
      }

      if (isEvaluator && !isSuperAdmin) {
        const demoOrgId = await demoService.ensureDemoOrganizationExists();
        if (orgId !== demoOrgId) {
          return res.status(403).json({ error: "Evaluators can only preview the demo organization" });
        }
      }

      if (role === "student") {
        let [testStudent] = await db.select().from(users)
          .where(and(
            eq(users.testStudentOwnerId, userId),
            eq(users.testStudentOwnerOrgId, orgId)
          ));

        if (!testStudent) {
          const testStudentId = randomUUID();
          const testEmail = `test-student-${userId.substring(0, 8)}-${orgId.substring(0, 6)}@preview.local`;
          const [adminUser] = await db.select().from(users).where(eq(users.id, userId));
          
          await db.insert(users).values({
            id: testStudentId,
            email: testEmail,
            firstName: "Test",
            lastName: "Student (Preview)",
            isAdmin: "false",
            isTestStudent: true,
            testStudentOwnerId: userId,
            testStudentOwnerOrgId: orgId,
            institution: adminUser?.institution,
          });

          [testStudent] = await db.select().from(users).where(eq(users.id, testStudentId));
        }

        let testTeam = null;
        if (testStudent.teamId) {
          const [existing] = await db.select().from(teams).where(eq(teams.id, testStudent.teamId));
          testTeam = existing;
        }

        if (!testTeam) {
          const teamName = `[Preview] Test Team - ${org.name}`;
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
            researchComplete: true,
          });

          await db.update(users)
            .set({ teamId: testTeamId, updatedAt: new Date() })
            .where(eq(users.id, testStudent.id));

          [testTeam] = await db.select().from(teams).where(eq(teams.id, testTeamId));
        }

        const [existingMember] = await db.select().from(organizationMembers)
          .where(and(
            eq(organizationMembers.userId, testStudent.id),
            eq(organizationMembers.organizationId, orgId)
          ));
        if (!existingMember) {
          await organizationStorage.addMember({
            userId: testStudent.id,
            organizationId: orgId,
            role: ROLES.STUDENT,
            status: "active",
            approvedAt: new Date(),
          });
        }

        (req.session as any).preview = { role: "student", orgId };

        await new Promise<void>((resolve, reject) => {
          req.session.save((err: any) => err ? reject(err) : resolve());
        });

        console.log("[Preview] Entered student preview:", { userId, orgId, testStudentId: testStudent.id });
        res.json({ success: true, role: "student", orgId, orgName: org.name, testStudentId: testStudent.id, teamId: testStudent.teamId });
      } else {
        const existingMember = await organizationStorage.getMember(userId, orgId);
        if (!existingMember) {
          await organizationStorage.addMember({
            userId,
            organizationId: orgId,
            role: ROLES.CLASS_ADMIN,
            status: "active",
            approvedAt: new Date(),
          });
        }

        (req.session as any).preview = { role: "educator", orgId };

        await new Promise<void>((resolve, reject) => {
          req.session.save((err: any) => err ? reject(err) : resolve());
        });

        console.log("[Preview] Entered educator preview:", { userId, orgId });
        res.json({ success: true, role: "educator", orgId, orgName: org.name });
      }
    } catch (error) {
      console.error("[Preview] Error entering:", error);
      res.status(500).json({ error: "Failed to enter preview mode" });
    }
  });

  app.post("/api/preview/exit", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      delete (req.session as any).preview;

      await new Promise<void>((resolve, reject) => {
        req.session.save((err: any) => err ? reject(err) : resolve());
      });

      await db.update(users)
        .set({ 
          previewRole: null,
          previewOrgId: null,
          inStudentPreview: false,
          previewModeOrgId: null,
          inInstructorPreview: false,
          instructorPreviewOrgId: null,
          inDemoPreview: false,
          demoPreviewOrgId: null,
          updatedAt: new Date() 
        })
        .where(eq(users.id, userId));

      console.log("[Preview] Exited preview mode:", { userId });
      res.json({ success: true });
    } catch (error) {
      console.error("[Preview] Error exiting:", error);
      res.status(500).json({ error: "Failed to exit preview mode" });
    }
  });

  // ==================== EVALUATOR ACCESS MANAGEMENT ====================

  app.get("/api/evaluators", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const isSuperAdmin = await organizationStorage.isSuperAdmin(userId);
      if (!isSuperAdmin) {
        return res.status(403).json({ error: "Super Admin access required" });
      }

      const evaluators = await db.select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        demoAccess: users.demoAccess,
        demoExpiresAt: users.demoExpiresAt,
        createdAt: users.createdAt,
      }).from(users).where(eq(users.demoAccess, "evaluator"));

      res.json(evaluators);
    } catch (error) {
      console.error("[Evaluators] Error listing:", error);
      res.status(500).json({ error: "Failed to list evaluators" });
    }
  });

  app.post("/api/evaluators/grant", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const isSuperAdmin = await organizationStorage.isSuperAdmin(userId);
      if (!isSuperAdmin) {
        return res.status(403).json({ error: "Super Admin access required" });
      }

      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      const [existingUser] = await db.select().from(users).where(eq(users.email, email));
      
      if (existingUser) {
        await db.update(users)
          .set({ demoAccess: "evaluator", demoExpiresAt: null, updatedAt: new Date() })
          .where(eq(users.id, existingUser.id));
        
        const demoOrgId = await demoService.ensureDemoOrganizationExists();
        const existingMember = await organizationStorage.getMember(existingUser.id, demoOrgId);
        if (!existingMember) {
          await organizationStorage.addMember({
            userId: existingUser.id,
            organizationId: demoOrgId,
            role: ROLES.CLASS_ADMIN,
            status: "active",
            approvedAt: new Date(),
          });
        }

        console.log("[Evaluators] Granted evaluator access to existing user:", email);
        res.json({ success: true, email, status: "updated" });
      } else {
        const newUserId = randomUUID();
        await db.insert(users).values({
          id: newUserId,
          email,
          demoAccess: "evaluator",
          isAdmin: "false",
        });

        const demoOrgId = await demoService.ensureDemoOrganizationExists();
        await organizationStorage.addMember({
          userId: newUserId,
          organizationId: demoOrgId,
          role: ROLES.CLASS_ADMIN,
          status: "active",
          approvedAt: new Date(),
        });

        console.log("[Evaluators] Created new evaluator user:", email);
        res.json({ success: true, email, status: "created" });
      }
    } catch (error) {
      console.error("[Evaluators] Error granting access:", error);
      res.status(500).json({ error: "Failed to grant evaluator access" });
    }
  });

  app.post("/api/evaluators/revoke", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const isSuperAdmin = await organizationStorage.isSuperAdmin(userId);
      if (!isSuperAdmin) {
        return res.status(403).json({ error: "Super Admin access required" });
      }

      const { evaluatorId } = req.body;
      if (!evaluatorId) {
        return res.status(400).json({ error: "evaluatorId is required" });
      }

      await db.update(users)
        .set({ demoAccess: "none", updatedAt: new Date() })
        .where(eq(users.id, evaluatorId));

      console.log("[Evaluators] Revoked evaluator access:", evaluatorId);
      res.json({ success: true });
    } catch (error) {
      console.error("[Evaluators] Error revoking access:", error);
      res.status(500).json({ error: "Failed to revoke evaluator access" });
    }
  });

  // Enter student preview mode (sandbox mode) - LEGACY
  app.post("/api/class-admin/organizations/:orgId/preview-mode/enter", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { orgId } = req.params;
      const { startWeek = 1 } = req.body; // Allow specifying starting week (1-8)

      const isSuperAdmin = await organizationStorage.isSuperAdmin(userId);
      const isOrgAdmin = await organizationStorage.isClassAdmin(userId, orgId);
      
      if (!isSuperAdmin && !isOrgAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      // Validate week number
      const week = Math.max(1, Math.min(8, parseInt(startWeek) || 1));

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
        const teamName = `[Sandbox] Test Team - ${org?.name || 'Admin'}`;
        
        const testTeamId = randomUUID();
        await db.insert(teams).values({
          id: testTeamId,
          name: teamName,
          organizationId: orgId,
          members: [testStudent.id],
          companyState: defaultCompanyState,
          currentWeek: week,
          totalWeeks: 8,
          setupComplete: true,
          researchComplete: true, // Skip research phase for demo/preview tours
        });

        // Assign test student to team
        await db.update(users)
          .set({ teamId: testTeamId, updatedAt: new Date() })
          .where(eq(users.id, testStudent.id));

        [testTeam] = await db.select().from(teams).where(eq(teams.id, testTeamId));
      } else {
        // Team exists - update to requested week and ensure researchComplete for tours
        await db.update(teams)
          .set({ currentWeek: week, researchComplete: true, updatedAt: new Date() })
          .where(eq(teams.id, testTeam.id));
        testTeam = { ...testTeam, currentWeek: week, researchComplete: true };
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

      (req.session as any).preview = { role: "student", orgId };

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

      delete (req.session as any).preview;
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

  // Set sandbox week (change week while in sandbox mode)
  app.post("/api/class-admin/organizations/:orgId/preview-mode/set-week", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { orgId } = req.params;
      const { week: requestedWeek } = req.body;

      const isSuperAdmin = await organizationStorage.isSuperAdmin(userId);
      const isOrgAdmin = await organizationStorage.isClassAdmin(userId, orgId);
      
      if (!isSuperAdmin && !isOrgAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      // Validate week number
      const week = Math.max(1, Math.min(8, parseInt(requestedWeek) || 1));

      // Find test student scoped to this admin AND this org
      const [testStudent] = await db.select().from(users)
        .where(and(
          eq(users.testStudentOwnerId, userId),
          eq(users.testStudentOwnerOrgId, orgId)
        ));

      if (!testStudent || !testStudent.teamId) {
        return res.status(404).json({ error: "No sandbox team found. Enter sandbox mode first." });
      }

      // Update the test team's current week
      await db.update(teams)
        .set({ currentWeek: week, updatedAt: new Date() })
        .where(eq(teams.id, testStudent.teamId));

      res.json({ success: true, currentWeek: week });
    } catch (error) {
      console.error("Error setting sandbox week:", error);
      res.status(500).json({ error: "Failed to set sandbox week" });
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
    photoUrl: z.string().max(2000).refine(
      (val) => !val || val.startsWith('/') || val.startsWith('http://') || val.startsWith('https://'),
      { message: "Must be a valid URL or path starting with /" }
    ).nullable().optional(),
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

  // Google Docs Integration Routes
  const { googleDocsService } = await import("./google-docs-service");
  const fsPromises = await import("fs/promises");
  const pathModule = await import("path");

  const syncDocSchema = z.object({
    documentType: z.enum(['business_plan', 'product_roadmap', 'marketing_materials', 'solution_doc', 'ai_transparency', 'appendix_diagrams', 'brand_standards', 'security_compliance'])
  });

  const docFilesConfig: Record<string, { path: string; title: string }> = {
    'business_plan': { 
      path: 'docs/BUSINESS_PLAN.md', 
      title: 'Future Work Academy - Business Plan' 
    },
    'product_roadmap': { 
      path: 'docs/PRODUCT_ROADMAP.md', 
      title: 'Future Work Academy - Product Roadmap' 
    },
    'marketing_materials': { 
      path: 'docs/MARKETING_MATERIALS.md', 
      title: 'Future Work Academy - Marketing Materials' 
    },
    'solution_doc': { 
      path: 'SOLUTION_DOC.md', 
      title: 'Future Work Academy - Solution Document' 
    },
    'ai_transparency': {
      path: 'docs/AI_TRANSPARENCY.md',
      title: 'Future Work Academy - AI Transparency & Prompt Documentation'
    },
    'appendix_diagrams': {
      path: 'docs/APPENDIX_DIAGRAMS.md',
      title: 'Future Work Academy - Visual Appendix'
    },
    'brand_standards': {
      path: 'docs/BRAND_STANDARDS.md',
      title: 'Future Work Academy - Brand Standards'
    },
    'security_compliance': {
      path: 'docs/SECURITY_COMPLIANCE.md',
      title: 'Future Work Academy - Security & Compliance'
    }
  };

  // List all documents synced to Google Docs
  app.get("/api/docs/list", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const isSuperAdmin = await organizationStorage.isSuperAdmin(userId);
      
      if (!isSuperAdmin) {
        return res.status(403).json({ error: "Super Admin access required" });
      }

      const docs = await googleDocsService.listDocuments();
      res.json(docs);
    } catch (error: any) {
      console.error("Error listing Google Docs:", error);
      if (error.message?.includes("not connected") || error.message?.includes("X_REPLIT_TOKEN")) {
        return res.status(503).json({ error: "Google Docs integration not configured. Please connect Google Docs in the Replit integrations panel." });
      }
      if (error.code === 403 || error.message?.includes("Insufficient Permission")) {
        return res.status(403).json({ error: "Google Docs integration requires additional permissions. Please reconnect the integration with Drive access." });
      }
      res.status(500).json({ error: "Failed to list documents" });
    }
  });

  // Sync a specific document to Google Docs
  app.post("/api/docs/sync", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const isSuperAdmin = await organizationStorage.isSuperAdmin(userId);
      
      if (!isSuperAdmin) {
        return res.status(403).json({ error: "Super Admin access required" });
      }

      const parseResult = syncDocSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          error: "Invalid document type",
          validTypes: Object.keys(docFilesConfig)
        });
      }

      const { documentType } = parseResult.data;
      const docConfig = docFilesConfig[documentType];
      const filePath = pathModule.join(process.cwd(), docConfig.path);
      
      try {
        await fsPromises.access(filePath);
      } catch {
        return res.status(404).json({ error: "Document file not found" });
      }

      const content = await fsPromises.readFile(filePath, 'utf-8');
      const result = await googleDocsService.syncMarkdownToGoogleDoc(docConfig.title, content);
      
      res.json({
        success: true,
        documentId: result.documentId,
        title: result.title,
        googleDocsUrl: `https://docs.google.com/document/d/${result.documentId}/edit`
      });
    } catch (error: any) {
      console.error("Error syncing to Google Docs:", error);
      if (error.message?.includes("not connected") || error.message?.includes("X_REPLIT_TOKEN")) {
        return res.status(503).json({ error: "Google Docs integration not configured. Please connect Google Docs in the Replit integrations panel." });
      }
      if (error.code === 403 || error.message?.includes("Insufficient Permission")) {
        return res.status(403).json({ error: "Google Docs integration requires additional permissions. Please reconnect the integration." });
      }
      res.status(500).json({ error: "Failed to sync document to Google Docs" });
    }
  });

  // Sync all documents to Google Docs
  app.post("/api/docs/sync-all", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const isSuperAdmin = await organizationStorage.isSuperAdmin(userId);
      
      if (!isSuperAdmin) {
        return res.status(403).json({ error: "Super Admin access required" });
      }

      const docFiles = Object.values(docFilesConfig);
      const results = [];
      
      for (const doc of docFiles) {
        const filePath = pathModule.join(process.cwd(), doc.path);
        
        try {
          await fsPromises.access(filePath);
          const content = await fsPromises.readFile(filePath, 'utf-8');
          const result = await googleDocsService.syncMarkdownToGoogleDoc(doc.title, content);
          results.push({
            success: true,
            title: doc.title,
            documentId: result.documentId,
            googleDocsUrl: `https://docs.google.com/document/d/${result.documentId}/edit`
          });
        } catch (syncError: any) {
          console.error(`Error syncing ${doc.title}:`, syncError);
          results.push({
            success: false,
            title: doc.title,
            error: 'Failed to sync document'
          });
        }
      }
      
      res.json({ results });
    } catch (error: any) {
      console.error("Error syncing all documents to Google Docs:", error);
      if (error.message?.includes("not connected") || error.message?.includes("X_REPLIT_TOKEN")) {
        return res.status(503).json({ error: "Google Docs integration not configured. Please connect Google Docs in the Replit integrations panel." });
      }
      if (error.code === 403 || error.message?.includes("Insufficient Permission")) {
        return res.status(403).json({ error: "Google Docs integration requires additional permissions. Please reconnect the integration." });
      }
      res.status(500).json({ error: error.message || "Failed to sync documents" });
    }
  });

  // List all documents in the Future Work Academy folder
  app.get("/api/docs/folder-contents", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const isSuperAdmin = await organizationStorage.isSuperAdmin(userId);
      
      if (!isSuperAdmin) {
        return res.status(403).json({ error: "Super Admin access required" });
      }

      const docs = await googleDocsService.listFolderDocuments();
      res.json(docs);
    } catch (error: any) {
      console.error("Error listing folder documents:", error);
      if (error.message?.includes("not connected") || error.message?.includes("X_REPLIT_TOKEN")) {
        return res.status(503).json({ error: "Google Docs integration not configured." });
      }
      res.status(500).json({ error: "Failed to list folder documents" });
    }
  });

  // Find duplicate documents (same name)
  app.get("/api/docs/duplicates", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const isSuperAdmin = await organizationStorage.isSuperAdmin(userId);
      
      if (!isSuperAdmin) {
        return res.status(403).json({ error: "Super Admin access required" });
      }

      const duplicates = await googleDocsService.findDuplicateDocuments();
      // Convert Map to array for JSON response
      const result: Array<{ name: string; copies: Array<{ id: string; modifiedTime: string }> }> = [];
      const entries = Array.from(duplicates.entries());
      for (const [name, docs] of entries) {
        result.push({
          name,
          copies: docs.map(d => ({ id: d.id, modifiedTime: d.modifiedTime }))
        });
      }
      res.json(result);
    } catch (error: any) {
      console.error("Error finding duplicate documents:", error);
      if (error.message?.includes("not connected") || error.message?.includes("X_REPLIT_TOKEN")) {
        return res.status(503).json({ error: "Google Docs integration not configured." });
      }
      res.status(500).json({ error: "Failed to find duplicate documents" });
    }
  });

  // Clean up duplicate documents (keep newest, trash older copies)
  app.post("/api/docs/cleanup-duplicates", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const isSuperAdmin = await organizationStorage.isSuperAdmin(userId);
      
      if (!isSuperAdmin) {
        return res.status(403).json({ error: "Super Admin access required" });
      }

      const result = await googleDocsService.cleanupDuplicates();
      res.json({
        success: true,
        message: `Cleaned up ${result.cleaned} duplicate documents`,
        details: result.details
      });
    } catch (error: any) {
      console.error("Error cleaning up duplicates:", error);
      if (error.message?.includes("not connected") || error.message?.includes("X_REPLIT_TOKEN")) {
        return res.status(503).json({ error: "Google Docs integration not configured." });
      }
      res.status(500).json({ error: "Failed to clean up duplicate documents" });
    }
  });

  // Trash a specific document
  app.delete("/api/docs/:documentId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const isSuperAdmin = await organizationStorage.isSuperAdmin(userId);
      
      if (!isSuperAdmin) {
        return res.status(403).json({ error: "Super Admin access required" });
      }

      const { documentId } = req.params;
      await googleDocsService.trashDocument(documentId);
      res.json({ success: true, message: "Document moved to trash" });
    } catch (error: any) {
      console.error("Error trashing document:", error);
      if (error.message?.includes("not connected") || error.message?.includes("X_REPLIT_TOKEN")) {
        return res.status(503).json({ error: "Google Docs integration not configured." });
      }
      res.status(500).json({ error: "Failed to trash document" });
    }
  });

  // List all documents in the Future Work Academy folder
  app.get("/api/docs/folder-list", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const isSuperAdmin = await organizationStorage.isSuperAdmin(userId);
      
      if (!isSuperAdmin) {
        return res.status(403).json({ error: "Super Admin access required" });
      }

      const docs = await googleDocsService.listFolderDocuments();
      res.json(docs);
    } catch (error: any) {
      console.error("Error listing folder documents:", error);
      if (error.message?.includes("not connected") || error.message?.includes("X_REPLIT_TOKEN")) {
        return res.status(503).json({ error: "Google Docs integration not configured." });
      }
      res.status(500).json({ error: "Failed to list folder documents" });
    }
  });

  // Find documents with similar names (name variants that might be duplicates)
  app.get("/api/docs/similar", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const isSuperAdmin = await organizationStorage.isSuperAdmin(userId);
      
      if (!isSuperAdmin) {
        return res.status(403).json({ error: "Super Admin access required" });
      }

      const similarGroups = await googleDocsService.findSimilarDocuments();
      res.json(similarGroups);
    } catch (error: any) {
      console.error("Error finding similar documents:", error);
      if (error.message?.includes("not connected") || error.message?.includes("X_REPLIT_TOKEN")) {
        return res.status(503).json({ error: "Google Docs integration not configured." });
      }
      res.status(500).json({ error: "Failed to find similar documents" });
    }
  });

  // Permanently delete a specific document (not just trash)
  app.delete("/api/docs/:documentId/permanent", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const isSuperAdmin = await organizationStorage.isSuperAdmin(userId);
      
      if (!isSuperAdmin) {
        return res.status(403).json({ error: "Super Admin access required" });
      }

      const { documentId } = req.params;
      await googleDocsService.deleteDocument(documentId);
      res.json({ success: true, message: "Document permanently deleted" });
    } catch (error: any) {
      console.error("Error deleting document:", error);
      if (error.message?.includes("not connected") || error.message?.includes("X_REPLIT_TOKEN")) {
        return res.status(503).json({ error: "Google Docs integration not configured." });
      }
      res.status(500).json({ error: "Failed to delete document" });
    }
  });

  // ===== Character Profiles API =====
  
  // Get all character profiles (optionally filtered by module)
  app.get("/api/admin/character-profiles", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await authStorage.getUser(userId);
      if (!isAdminUser(user)) {
        return res.status(403).json({ error: "Admin access required" });
      }
      
      const moduleId = req.query.moduleId as string | undefined;
      const profiles = await storage.getCharacterProfiles(moduleId);
      res.json(profiles);
    } catch (error) {
      console.error("Error getting character profiles:", error);
      res.status(500).json({ error: "Failed to get character profiles" });
    }
  });

  // Get single character profile
  app.get("/api/admin/character-profiles/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await authStorage.getUser(userId);
      if (!isAdminUser(user)) {
        return res.status(403).json({ error: "Admin access required" });
      }
      
      const profile = await storage.getCharacterProfile(req.params.id);
      if (!profile) {
        return res.status(404).json({ error: "Character profile not found" });
      }
      res.json(profile);
    } catch (error) {
      console.error("Error getting character profile:", error);
      res.status(500).json({ error: "Failed to get character profile" });
    }
  });

  // Create character profile
  app.post("/api/admin/character-profiles", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await authStorage.getUser(userId);
      if (!isAdminUser(user)) {
        return res.status(403).json({ error: "Admin access required" });
      }
      
      const profile = await storage.createCharacterProfile({
        ...req.body,
        createdBy: userId,
      });
      res.json(profile);
    } catch (error) {
      console.error("Error creating character profile:", error);
      res.status(500).json({ error: "Failed to create character profile" });
    }
  });

  // Update character profile
  app.put("/api/admin/character-profiles/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await authStorage.getUser(userId);
      if (!isAdminUser(user)) {
        return res.status(403).json({ error: "Admin access required" });
      }
      
      const profile = await storage.updateCharacterProfile(req.params.id, req.body);
      if (!profile) {
        return res.status(404).json({ error: "Character profile not found" });
      }
      res.json(profile);
    } catch (error) {
      console.error("Error updating character profile:", error);
      res.status(500).json({ error: "Failed to update character profile" });
    }
  });

  // Delete character profile
  app.delete("/api/admin/character-profiles/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await authStorage.getUser(userId);
      if (!isAdminUser(user)) {
        return res.status(403).json({ error: "Admin access required" });
      }
      
      await storage.deleteCharacterProfile(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting character profile:", error);
      res.status(500).json({ error: "Failed to delete character profile" });
    }
  });

  // Generate AI headshot for character
  app.post("/api/admin/character-profiles/:id/generate-headshot", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await authStorage.getUser(userId);
      if (!isAdminUser(user)) {
        return res.status(403).json({ error: "Admin access required" });
      }
      
      const profile = await storage.getCharacterProfile(req.params.id);
      if (!profile) {
        return res.status(404).json({ error: "Character profile not found" });
      }
      
      const { prompt: customPrompt } = req.body;
      
      // Build a detailed prompt for headshot generation
      const defaultPrompt = `Professional corporate headshot portrait photo of ${profile.name}, ${profile.role}${profile.company ? ` at ${profile.company}` : ''}. ${profile.personality || ''}. High quality, studio lighting, business professional attire, neutral background, photorealistic, 4k quality.`;
      
      const finalPrompt = customPrompt || defaultPrompt;
      
      // Use the image generation client
      const { generateImageBuffer } = await import("./replit_integrations/image/client");
      
      const imageBuffer = await generateImageBuffer(finalPrompt, "512x512");
      
      // Convert to base64 data URL for storage
      const base64Image = imageBuffer.toString('base64');
      const dataUrl = `data:image/png;base64,${base64Image}`;
      
      // Update the character profile with the base64 headshot
      await storage.updateCharacterProfile(profile.id, {
        headshotUrl: dataUrl,
        headshotPrompt: finalPrompt,
      });
      
      res.json({ 
        success: true, 
        headshotUrl: dataUrl,
        prompt: finalPrompt 
      });
    } catch (error: any) {
      console.error("Error generating headshot:", error);
      res.status(500).json({ error: error.message || "Failed to generate headshot" });
    }
  });

  // ===== Phone-a-Friend API =====
  
  // Get all advisors (for students)
  app.get("/api/phone-a-friend/advisors", isAuthenticated, async (req: any, res) => {
    try {
      const moduleId = req.query.moduleId as string | undefined;
      const advisors = await storage.getPhoneAFriendAdvisors(moduleId);
      res.json(advisors);
    } catch (error) {
      console.error("Error getting advisors:", error);
      res.status(500).json({ error: "Failed to get advisors" });
    }
  });

  // Get remaining lifelines for current user
  app.get("/api/phone-a-friend/remaining", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { simulationId } = req.query;
      
      if (!simulationId) {
        return res.status(400).json({ error: "simulationId is required" });
      }
      
      const usageCount = await storage.getPhoneAFriendUsageCount(userId, simulationId as string);
      const maxLifelines = 3;
      
      res.json({ 
        used: usageCount, 
        remaining: Math.max(0, maxLifelines - usageCount),
        max: maxLifelines 
      });
    } catch (error) {
      console.error("Error getting remaining lifelines:", error);
      res.status(500).json({ error: "Failed to get remaining lifelines" });
    }
  });

  // Use a lifeline - ask an advisor for advice
  app.post("/api/phone-a-friend/ask", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { advisorId, simulationId, weekNumber, question, context } = req.body;
      
      if (!advisorId || !simulationId || !weekNumber || !question) {
        return res.status(400).json({ error: "advisorId, simulationId, weekNumber, and question are required" });
      }
      
      // Check remaining lifelines
      const usageCount = await storage.getPhoneAFriendUsageCount(userId, simulationId);
      if (usageCount >= 3) {
        return res.status(400).json({ error: "No lifelines remaining" });
      }
      
      // Get advisor and character info
      const advisors = await storage.getPhoneAFriendAdvisors();
      const advisorData = advisors.find((a: any) => a.advisor.id === advisorId);
      
      if (!advisorData) {
        return res.status(404).json({ error: "Advisor not found" });
      }
      
      const { advisor, character } = advisorData;
      
      // Get all character profiles to provide stakeholder context
      const allCharacters = await storage.getCharacterProfiles();
      const { getPhoneAFriendContext } = await import("./character-impact-engine");
      const stakeholderContext = getPhoneAFriendContext(
        allCharacters.map((c: any) => ({
          name: c.name,
          role: c.role,
          influence: c.influence ?? 5,
          hostility: c.hostility ?? 5,
          flexibility: c.flexibility ?? 5,
          riskTolerance: c.riskTolerance ?? 5,
          impactCategories: c.impactCategories ?? [],
        })),
        advisor.specialty
      );
      
      // Generate AI advice using OpenAI
      const OpenAI = (await import("openai")).default;
      const openai = new OpenAI();
      
      const systemPrompt = `You are ${character?.name || 'an advisor'}, a ${advisor.specialty} expert ${character?.title ? `(${character.title})` : ''}. 
${advisor.expertiseDescription}

Your advice style: ${advisor.adviceStyle || 'Professional and direct'}
${advisor.biases ? `Your professional biases: ${advisor.biases}` : ''}
${character?.personality ? `Your personality: ${character.personality}` : ''}
${character?.communicationStyle ? `Your communication style: ${character.communicationStyle}` : ''}

You are advising a graduate business student in a simulation about AI adoption and workforce transformation. 
The current week is Week ${weekNumber} of an 8-week simulation.
${context ? `Current context: ${context}` : ''}

${stakeholderContext ? `STAKEHOLDER DYNAMICS TO CONSIDER:\n${stakeholderContext}` : ''}

Provide thoughtful, personalized advice in your character's voice. Keep your response under 300 words but make it substantive and actionable. When relevant, warn about stakeholders who may resist or support the decision.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: question }
        ],
        temperature: 0.8,
        max_tokens: 500,
      });
      
      const advice = completion.choices[0]?.message?.content || "I apologize, but I couldn't generate advice at this time.";
      
      // Record the usage
      const user = await authStorage.getUser(userId);
      const usage = await storage.createPhoneAFriendUsage({
        userId,
        teamId: user?.teamId || undefined,
        simulationId,
        advisorId,
        weekNumber,
        question,
        context,
        advice,
      });
      
      res.json({ 
        advice, 
        advisor: character?.name || advisor.specialty,
        remainingLifelines: Math.max(0, 2 - usageCount) // 3 total - 1 just used = 2 remaining at max
      });
    } catch (error: any) {
      console.error("Error asking advisor:", error);
      res.status(500).json({ error: error.message || "Failed to get advice" });
    }
  });

  // Content Validation API endpoint
  app.get("/api/admin/content-validation", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as { isAdmin?: string | boolean | null } | null;
      
      if (!isAdminUser(user)) {
        return res.status(403).json({ error: "Admin access required" });
      }
      
      const { runValidation } = await import("./content-validation");
      const report = await runValidation();
      
      res.json(report);
    } catch (error: any) {
      console.error("Content validation error:", error);
      res.status(500).json({ error: error.message || "Validation failed" });
    }
  });

  return httpServer;
}
