import { Express, Request, Response } from "express";
import OpenAI from "openai";
import { isAuthenticated } from "./replit_integrations/auth";

const DEMO_CONTEXT = `You are a helpful guide for Future Work Academy, an 8-week business simulation platform for graduate students.

KEY SIMULATION FACTS:
- Students play as executives at "Apex Manufacturing" navigating AI adoption
- Each week has: Intelligence Briefing → Decisions → Results
- Two scores matter: Financial Performance and Cultural Health
- Decisions are graded by AI for reasoning quality, not just the option chosen
- Phone-a-Friend: 9 AI advisors offer strategic guidance
- Easter Egg: Reading all intel articles gives a 5% bonus
- Simulation runs 8 weeks with weekly leaderboard updates

SCORING SYSTEM:
- Financial Score: Revenue, costs, cash flow, debt management
- Cultural Score: Morale, anxiety levels, trust in leadership
- Combined Score: Weighted average (configurable by instructor)

KEY FEATURES:
- LLM-powered essay grading evaluates decision rationale
- Character profiles influence stakeholder reactions
- Difficulty levels: Introductory, Standard, Advanced
- Multi-tenant: Each class is isolated
- Voicemail notifications from simulation characters

NAVIGATION:
- Dashboard: Overview of week, scores, company metrics
- Briefing: Weekly intelligence with SITREP, stakeholder pressures, research articles
- Decisions: Make strategic choices with written rationale
- Analytics: Track performance trends over time
- Leaderboard: Compare against other teams
- Phone-a-Friend: Get AI advisor guidance

Keep responses concise (2-3 sentences max). Be helpful and encouraging.`;

export function registerDemoQARoutes(app: Express) {
  app.post("/api/demo/ask-gemini", isAuthenticated, async (req: any, res: Response) => {
    try {
      const { question } = req.body;
      const user = req.user?.claims;
      
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      if (!question || typeof question !== "string") {
        return res.status(400).json({ error: "Question is required" });
      }

      const baseUrl = process.env.AI_INTEGRATIONS_GEMINI_BASE_URL;
      const apiKey = process.env.AI_INTEGRATIONS_GEMINI_API_KEY;

      if (!baseUrl || !apiKey) {
        return res.status(500).json({ 
          error: "AI integration not configured",
          answer: "I'm not fully configured yet. Please contact support." 
        });
      }

      const client = new OpenAI({
        apiKey,
        baseURL: baseUrl,
      });

      const response = await client.chat.completions.create({
        model: "gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: DEMO_CONTEXT,
          },
          {
            role: "user",
            content: question,
          },
        ],
        max_tokens: 300,
        temperature: 0.7,
      });

      const answer = response.choices[0]?.message?.content || "I couldn't generate a response. Please try again.";

      return res.json({ 
        answer,
        context: "demo_guide" 
      });
    } catch (error: any) {
      console.error("Gemini Q&A error:", error);
      return res.status(500).json({ 
        error: "Failed to get response",
        answer: "I'm having trouble right now. Please try again in a moment."
      });
    }
  });
}
