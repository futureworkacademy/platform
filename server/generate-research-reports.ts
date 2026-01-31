import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import { eq } from 'drizzle-orm';
import { db } from './db';
import { simulationContent } from '@shared/models/auth';

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

interface CanonicalData {
  company: {
    name: string;
    industry: string;
    size: string;
    annualRevenue: number;
    employees: number;
    averageTenure: number;
    location: string;
    founded: number;
  };
  characters: Array<{ name: string; role: string; influence: number; hostility: number }>;
  competitors: Array<{ name: string; approach: string; outcome: string }>;
  researchReports: Array<{ number: number; title: string; readingTime: string }>;
}

const MODULE_ID = 'ab027ff4-ff8b-4898-8a19-6c44c10b0cdc';

const reportPrompts = [
  {
    number: 1,
    title: 'State of AI in Manufacturing 2025',
    prompt: `Write a research report titled "State of AI in Manufacturing 2025" for graduate business students preparing for a simulation.

This report should cover:
- Current AI adoption rates in manufacturing (cite realistic statistics)
- Key automation technologies: robotics, machine learning, predictive maintenance
- Labor market impacts: job displacement statistics, new roles created
- Financial considerations: typical ROI timelines, investment requirements
- Challenges: workforce resistance, implementation complexity, skills gaps
- Industry trends: what leading manufacturers are doing

Write in a professional, analytical tone suitable for MBA students. Include realistic-sounding data points and statistics. The report should be 1,200-1,500 words.

Format with clear headings and subheadings using markdown.`,
  },
  {
    number: 2,
    title: 'Apex Manufacturing Company Profile',
    prompt: `Write a company profile research report for "Apex Manufacturing" - a fictional company students will manage in a business simulation.

Use these EXACT canonical facts:
- Company Name: Apex Manufacturing
- Industry: Automotive parts supplier
- Size: Mid-sized
- Annual Revenue: $125,000,000
- Employees: 2,400
- Average Tenure: 7.2 years
- Location: Midwest United States
- Founded: 1987
- Current state: Privately held, 12% automation level, no union currently, 68/100 morale

The report should cover:
- Company history and growth trajectory
- Current market position and competitive landscape
- Organizational structure and culture (long-tenured workforce, family-like atmosphere)
- Financial health (profitable but facing margin pressure)
- Technology status (behind competitors in automation)
- Key challenges facing the company

Write 1,000-1,200 words in professional analyst style. Format with markdown headings.`,
  },
  {
    number: 3,
    title: 'Workforce Transition Best Practices',
    prompt: `Write a research report titled "Workforce Transition Best Practices" for graduate students preparing for a manufacturing simulation focused on AI adoption and workforce transformation.

Cover these topics:
- Change management frameworks for technology transitions
- Communication strategies that reduce employee anxiety
- Reskilling and upskilling program design
- Severance and outplacement best practices
- Union relations during technological change
- Case examples of successful (and failed) workforce transitions
- Timeline expectations: how long transitions actually take
- Metrics for measuring transition success

Include realistic statistics on reskilling success rates, typical costs, and common pitfalls.

Write 1,200-1,500 words in professional consulting style. Format with markdown headings.`,
  },
  {
    number: 4,
    title: 'AI Technology Landscape',
    prompt: `Write a research report titled "AI Technology Landscape" for graduate business students about to manage a manufacturing company simulation.

Cover:
- Categories of AI/automation relevant to manufacturing:
  - Robotic process automation (RPA)
  - Industrial robotics and cobots
  - Predictive maintenance systems
  - Quality control AI
  - Supply chain optimization
- Vendor landscape and typical costs
- Implementation timelines and complexity
- Integration challenges with legacy systems
- ROI expectations by technology type
- Build vs. buy considerations
- Emerging technologies on the horizon

Write in accessible but professional style. Students need to understand enough to make investment decisions. 1,500-1,800 words. Format with markdown headings.`,
  },
  {
    number: 5,
    title: 'Competitive Analysis',
    prompt: `Write a competitive analysis research report for students about to manage Apex Manufacturing in a business simulation.

Use these EXACT canonical competitor facts:
1. AutoTech Industries - Aggressive automation approach - Outcome: Failed due to unionization, strikes, customer satisfaction dropped
2. PrecisionParts Co. - Balanced approach to automation and workforce - Outcome: Success, high morale, won Best Employer award
3. FastParts - No workforce investment, automation only - Outcome: Failed due to quality issues, became acquisition target

The report should:
- Profile each competitor in detail (fictional but realistic details)
- Analyze what worked and what didn't in each approach
- Draw lessons for Apex Manufacturing
- Discuss market dynamics and customer expectations
- Identify strategic options available to Apex

Write 1,200-1,500 words. Professional analyst style. Format with markdown headings.`,
  },
  {
    number: 6,
    title: 'Case Study: Manufacturing Transformation',
    prompt: `Write a detailed case study titled "Manufacturing Transformation: Lessons from the Field" for graduate business students.

Create a fictional but realistic case study of a manufacturing company similar to Apex Manufacturing that underwent AI transformation. Include:

- Company background (similar profile to Apex: mid-sized, automotive supplier, ~2,000 employees)
- The catalyst for change (market pressure, competitive threat)
- The transformation journey week-by-week highlights
- Key decisions made and their consequences
- Stakeholder reactions (board, employees, union, customers, bankers)
- Financial outcomes (costs, savings, timeline to ROI)
- Cultural outcomes (morale, turnover, adaptability)
- Lessons learned and recommendations

Make this a teaching case that students can reference during their simulation. Include specific decision points and their trade-offs.

Write 1,500-2,000 words. Case study style with clear narrative. Format with markdown headings.`,
  },
];

async function generateReport(report: typeof reportPrompts[0], canon: CanonicalData): Promise<string> {
  console.log(`  Generating: ${report.title}...`);
  
  const response = await openai.chat.completions.create({
    model: 'gpt-5.2',
    messages: [
      {
        role: 'system',
        content: `You are an expert business analyst and educator creating research materials for a graduate-level business simulation. Write clear, professional content that will help students make informed decisions in the simulation. Use realistic but fictional data and examples.`,
      },
      {
        role: 'user',
        content: report.prompt,
      },
    ],
    max_completion_tokens: 4000,
  });
  
  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error(`No content generated for ${report.title}`);
  }
  
  return content;
}

async function saveReport(number: number, title: string, content: string): Promise<void> {
  await db.insert(simulationContent).values({
    moduleId: MODULE_ID,
    weekNumber: 0, // Pre-game content
    title: title,
    contentType: 'text',
    content: content,
    order: number,
    isActive: true,
    isIntelContent: false,
  });
}

async function main(): Promise<void> {
  console.log('Loading canonical data...\n');
  
  const canonPath = path.join(process.cwd(), 'docs', 'canonical.json');
  const canon: CanonicalData = JSON.parse(fs.readFileSync(canonPath, 'utf-8'));
  
  console.log(`Company: ${canon.company.name}`);
  
  // Check what already exists
  const existing = await db.select({ title: simulationContent.title })
    .from(simulationContent)
    .where(eq(simulationContent.weekNumber, 0));
  const existingTitles = new Set(existing.map(e => e.title));
  
  const toGenerate = reportPrompts.filter(r => !existingTitles.has(r.title));
  console.log(`Already generated: ${existing.length}`);
  console.log(`Remaining to generate: ${toGenerate.length}\n`);
  
  for (const report of toGenerate) {
    try {
      const content = await generateReport(report, canon);
      await saveReport(report.number, report.title, content);
      console.log(`  Saved: ${report.title} (${content.length} chars)\n`);
    } catch (error) {
      console.error(`  ERROR generating ${report.title}:`, error);
    }
  }
  
  console.log('='.repeat(50));
  console.log('Research report generation complete!');
  console.log('='.repeat(50));
  
  process.exit(0);
}

main().catch(error => {
  console.error('Generation failed:', error);
  process.exit(1);
});
