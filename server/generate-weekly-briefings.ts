import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import { eq, and } from 'drizzle-orm';
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
  weeks: Array<{ number: number; title: string; theme: string }>;
  characters: Array<{ name: string; role: string; influence: number; hostility: number; nickname?: string }>;
  competitors: Array<{ name: string; approach: string; outcome: string }>;
}

const MODULE_ID = 'ab027ff4-ff8b-4898-8a19-6c44c10b0cdc';

function loadCanonicalData(): CanonicalData {
  const canonicalPath = path.join(process.cwd(), 'docs', 'canonical.json');
  const content = fs.readFileSync(canonicalPath, 'utf-8');
  return JSON.parse(content);
}

function getWeekPrompt(week: { number: number; title: string; theme: string }, canon: CanonicalData): string {
  const companyContext = `
COMPANY FACTS (use these EXACTLY):
- Company: ${canon.company.name}
- Industry: ${canon.company.industry}
- Revenue: $${(canon.company.annualRevenue / 1000000).toFixed(0)} million
- Employees: ${canon.company.employees.toLocaleString()}
- Average Tenure: ${canon.company.averageTenure} years
- Location: ${canon.company.location}
- Founded: ${canon.company.founded}
`;

  const characterList = canon.characters
    .map(c => `- ${c.name} (${c.role}) - Influence: ${c.influence}/10, Hostility: ${c.hostility}/10`)
    .join('\n');

  const weekSpecificPrompts: Record<number, string> = {
    1: `Week 1: "${week.title}"
Theme: ${week.theme}

This is the opening week. The board has just approved an AI transformation initiative. Students are stepping into the CEO role.

Key elements to include:
- Board Chair Victoria Hartwell (influence 10) has delivered an ultimatum: modernize or be replaced
- CFO David Chen presents financial projections showing margin erosion without automation
- The workforce is anxious - rumors are spreading about job losses
- A major customer (Thomas Richardson from AutoCorp) is pressuring for faster delivery
- The company's 12% automation level is far behind competitors at 35-50%

Introduce the central tension: How do you transform a company with a loyal, long-tenured workforce without destroying the culture that made it successful?

Focus characters: Victoria Hartwell, David Chen, Sandra Williams (HR), Frank Torres (Operations)`,

    2: `Week 2: "${week.title}"
Theme: ${week.theme}

The automation project is approved, but now comes the hard part: finding the talent to execute it.

Key elements to include:
- Local talent pool lacks AI/robotics skills - nearest experts are 200 miles away
- Young workers (represented by Jaylen Brooks) want different career paths than older workers
- Community college dean wants to partner on training programs
- Existing supervisors worry they'll be obsolete
- Two key technical managers have received job offers from competitors

Introduce tension between building internal pipeline vs. hiring external talent (which threatens current employees).

Focus characters: Sandra Williams, Jaylen Brooks, Destiny Martinez, Frank Torres`,

    3: `Week 3: "${week.title}"
Theme: ${week.theme}

Union organizer Marcus Webb has arrived. Workers are talking.

Key elements to include:
- Marcus Webb (influence 8, hostility 8) is a experienced UAW organizer
- Some employees see the union as protection; others see it as risking the company's future
- Management must continue transformation while responding to organizing
- Legal constraints (Robert Nakamura advises on what managers can/can't say)
- The press has picked up the story - Mayor Angela Reyes is watching

Reference competitor AutoTech Industries which unionized during transformation and faced strikes.

Focus characters: Marcus Webb, Robert Nakamura (Legal), Frank Torres, Angela Reyes`,

    4: `Week 4: "${week.title}"
Theme: ${week.theme}

The first automation line is live. 47 positions will be eliminated.

Key elements to include:
- Real people are now losing jobs - names and faces, not just numbers
- Some employees refuse retraining; others embrace it
- The community is watching - local news covers layoffs
- Severance packages and outplacement decisions have real budget impact
- Remaining employees are watching how departing colleagues are treated

This is the emotional heart of the simulation - the human cost of transformation.

Focus characters: Sandra Williams, Frank Torres, Angela Reyes, workers affected`,

    5: `Week 5: "${week.title}"
Theme: ${week.theme}

Middle managers are burning out. Gen Z employees are questioning everything.

Key elements to include:
- Transformation has been brutal on supervisors caught between old and new
- Three mid-level managers have quit in the past month
- Young employees (Jaylen, Destiny) openly question if this is the right company for them
- Work-life balance concerns clash with transformation urgency
- Toxic positivity vs. honest acknowledgment of difficulty

Explore generational divide and management sustainability.

Focus characters: Jaylen Brooks, Destiny Martinez, Sandra Williams, operational supervisors`,

    6: `Week 6: "${week.title}"
Theme: ${week.theme}

The bank is calling. Transformation costs are higher than projected.

Key elements to include:
- Patricia Lawson (Bank Representative, influence 9, hostility 5) demands debt covenants review
- Board member William Thornton III (PE background) is pushing for faster ROI
- Cutting transformation now means wasted investment; continuing means more risk
- David Chen presents scenarios: pause, slow down, or double down
- Competitors are also struggling - industry analyst Dr. Nathan Cross has insights

Financial pressure meets transformation momentum.

Focus characters: Patricia Lawson, David Chen, William Thornton III, Victoria Hartwell`,

    7: `Week 7: "${week.title}"
Theme: ${week.theme}

Market perception is shifting. Competitors are responding.

Key elements to include:
- AutoCorp (Thomas Richardson) is considering diversifying suppliers
- Industry press coverage: Is Apex's transformation working or failing?
- Competitor PrecisionParts Co. won "Best Employer" award while Apex struggles
- Sales VP Jennifer Park reports pipeline concerns
- Technology vendor Rachel Kim offers accelerated implementation (at a cost)

External perception and competitive positioning become critical.

Focus characters: Thomas Richardson, Jennifer Park, Dr. Nathan Cross, Rachel Kim`,

    8: `Week 8: "${week.title}"
Theme: ${week.theme}

Final week. Time to set the 3-year vision.

Key elements to include:
- Board wants a clear strategic direction presentation
- All stakeholders have expectations - workers, customers, community, investors
- Results so far: what worked, what didn't
- Legacy question: What kind of company will Apex be?
- The next CEO will inherit these decisions
- Dr. Helen Mercer (consultant) offers external perspective

Synthesis and long-term strategic thinking.

Focus characters: Victoria Hartwell, all key stakeholders, Dr. Helen Mercer`
  };

  return `Write a weekly briefing for a business simulation game. This is Week ${week.number} of 8.

${companyContext}

AVAILABLE CHARACTERS (reference appropriately):
${characterList}

${weekSpecificPrompts[week.number]}

COMPETITOR CONTEXT:
- AutoTech Industries: Aggressive automation approach - FAILED (unionized, strikes, customer satisfaction dropped)
- PrecisionParts Co.: Balanced approach - SUCCESS (high morale, Best Employer award)
- FastParts: No workforce investment - FAILED (quality issues, became acquisition target)

FORMAT REQUIREMENTS:
1. Start with "Week ${week.number}: ${week.title}" as the title
2. Include a "SITUATION BRIEFING" section (300-400 words) that sets the scene
3. Include "KEY DEVELOPMENTS" with 3-4 bullet points of specific events
4. Include "STAKEHOLDER PULSE" showing how 3-4 characters are feeling
5. Include "THE DECISION AHEAD" teasing the choices students will face
6. End with "KEY QUESTION" - the central dilemma for this week

Write in second person ("You arrive at the office..."). Be vivid and narrative-driven while remaining professional.
Total length: 800-1000 words. Use markdown formatting.`;
}

async function generateBriefing(
  week: { number: number; title: string; theme: string },
  canon: CanonicalData
): Promise<string> {
  const prompt = getWeekPrompt(week, canon);

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are an expert business simulation content writer. You create immersive, realistic weekly briefings for graduate business students managing a manufacturing company through AI transformation. Your writing is vivid, professional, and emotionally engaging while remaining grounded in realistic business scenarios.`
      },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 2000,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error(`No content generated for Week ${week.number}: ${week.title}`);
  }
  return content;
}

async function main() {
  console.log('Loading canonical data...\n');
  const canon = loadCanonicalData();

  console.log(`Company: ${canon.company.name}`);
  console.log(`Weeks to generate: ${canon.weeks.length}`);

  const existingBriefings = await db
    .select()
    .from(simulationContent)
    .where(
      and(
        eq(simulationContent.moduleId, MODULE_ID),
        eq(simulationContent.contentType, 'briefing')
      )
    );

  const existingWeeks = new Set(existingBriefings.map(b => b.weekNumber));
  console.log(`Already generated: ${existingWeeks.size}`);

  const weeksToGenerate = canon.weeks.filter(w => !existingWeeks.has(w.number));
  console.log(`Remaining to generate: ${weeksToGenerate.length}\n`);

  for (const week of weeksToGenerate) {
    try {
      console.log(`  Generating: Week ${week.number} - ${week.title}...`);
      const content = await generateBriefing(week, canon);

      await db.insert(simulationContent).values({
        id: crypto.randomUUID(),
        moduleId: MODULE_ID,
        weekNumber: week.number,
        contentType: 'briefing',
        title: `Week ${week.number}: ${week.title}`,
        content: content,
        order: week.number,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log(`  Saved: Week ${week.number} - ${week.title} (${content.length} chars)`);
    } catch (error) {
      console.error(`  ERROR generating Week ${week.number}:`, error);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('Weekly briefing generation complete!');
  console.log('='.repeat(50));
}

main().catch(console.error);
