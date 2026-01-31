import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import { eq } from 'drizzle-orm';
import { db } from './db';
import { characterProfiles } from '@shared/models/auth';

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

interface CanonicalCharacter {
  name: string;
  role: string;
  influence: number;
  hostility: number;
  nickname?: string;
}

interface CanonicalData {
  company: {
    name: string;
    industry: string;
    employees: number;
    location: string;
    founded: number;
  };
  characters: CanonicalCharacter[];
}

interface CharacterSpec {
  name: string;
  role: string;
  title: string;
  influence: number;
  hostility: number;
  flexibility: number;
  riskTolerance: number;
  impactCategories: string[];
  backgroundHints: string;
  relationshipHints: string[];
  headshotPrompt: string;
}

const characterSpecs: CharacterSpec[] = [
  {
    name: "Victoria Hartwell",
    role: "Board Chair",
    title: "Chairwoman of the Board",
    influence: 10,
    hostility: 4,
    flexibility: 3,
    riskTolerance: 7,
    impactCategories: ["governance", "finance", "strategy"],
    backgroundHints: "Former Fortune 500 executive. Harvard MBA. Known for driving transformation at two previous companies. Impatient with slow progress. Family money originally invested in Apex. Unmarried, no children - company is her legacy.",
    relationshipHints: ["Appointed current CEO", "Respects David Chen's financial acumen", "Clashes with those who resist change", "Allied with William Thornton III on modernization"],
    headshotPrompt: "Professional headshot of a powerful 62-year-old Caucasian woman with silver-gray hair styled in an elegant bob, sharp blue eyes, wearing a navy Armani blazer and pearl earrings. Stern but refined expression. Corporate boardroom setting with soft lighting."
  },
  {
    name: "David Chen",
    role: "Chief Financial Officer",
    title: "Chief Financial Officer",
    influence: 8,
    hostility: 2,
    flexibility: 6,
    riskTolerance: 4,
    impactCategories: ["finance", "strategy", "governance"],
    backgroundHints: "Second-generation Chinese American. Stanford MBA. 15 years at Apex, promoted from Controller. Knows every line item in the budget. Conservative with money but sees automation as necessary investment. Two teenage daughters, coaches their soccer team.",
    relationshipHints: ["Trusted by Victoria Hartwell", "Mentor to Sandra Williams", "Cautious ally of transformation", "Manages Patricia Lawson relationship"],
    headshotPrompt: "Professional headshot of a 48-year-old Asian American man with neatly combed black hair graying at temples, wearing wire-rimmed glasses, a crisp white shirt and burgundy tie. Thoughtful, analytical expression. Modern office background."
  },
  {
    name: "Margaret O'Brien",
    role: "Chief Operating Officer",
    title: "Chief Operating Officer",
    influence: 8,
    hostility: 2,
    flexibility: 5,
    riskTolerance: 5,
    impactCategories: ["operations", "technology", "labor"],
    backgroundHints: "Goes by 'Maggie.' Started on the factory floor 28 years ago as a machinist. Rose through the ranks. No college degree but completed executive education at Kellogg. Deeply respected by workers. Divorced, two adult sons who also work in manufacturing.",
    relationshipHints: ["Frank Torres reports to her", "Protective of workers", "Bridge between management and floor", "Cautiously supportive of automation"],
    headshotPrompt: "Professional headshot of a 55-year-old Irish American woman with reddish-brown hair with gray streaks pulled back, warm brown eyes, weathered but kind face with subtle smile lines. Wearing a practical navy blazer over a light blue blouse. Factory floor visible in soft focus background."
  },
  {
    name: "Sandra Williams",
    role: "HR Director",
    title: "Director of Human Resources",
    influence: 7,
    hostility: 1,
    flexibility: 7,
    riskTolerance: 4,
    impactCategories: ["labor", "culture", "training"],
    backgroundHints: "African American woman, first in her family with a graduate degree (Industrial Psychology, Michigan State). 12 years at Apex. Genuinely cares about employee wellbeing. Known for creative problem-solving. Married to a high school principal, three kids.",
    relationshipHints: ["Advocates for workforce", "Works closely with Maggie O'Brien", "Trusted by employees", "Navigates between labor and management"],
    headshotPrompt: "Professional headshot of a 44-year-old African American woman with natural curly black hair, warm brown eyes, and a genuine smile. Wearing a professional teal blazer and simple gold necklace. Friendly and approachable expression. Bright, modern HR office background."
  },
  {
    name: "Frank Torres",
    role: "Operations Manager",
    title: "Senior Operations Manager",
    influence: 6,
    hostility: 3,
    flexibility: 4,
    riskTolerance: 3,
    impactCategories: ["operations", "labor", "technology"],
    backgroundHints: "Mexican American, grew up in the same Midwest town as the factory. 22 years at Apex. Leads the largest production shift. Skeptical of 'corporate initiatives' that have come and gone. Widower, raised three kids alone. Fiercely loyal to his team.",
    relationshipHints: ["Reports to Maggie O'Brien", "Informal leader among floor supervisors", "Wary of technology promises", "Workers trust him implicitly"],
    headshotPrompt: "Professional headshot of a 52-year-old Hispanic American man with salt-and-pepper hair, mustache, weathered face with deep lines from years of hard work. Wearing a company polo shirt. Direct, skeptical gaze. Industrial manufacturing floor in background."
  },
  {
    name: "Jennifer Park",
    role: "Vice President of Sales",
    title: "Vice President of Sales",
    influence: 7,
    hostility: 3,
    flexibility: 6,
    riskTolerance: 6,
    impactCategories: ["customers", "finance", "strategy"],
    backgroundHints: "Korean American, recruited from a competitor 6 years ago. Aggressive closer with Fortune 500 client relationships. Worried about losing customers during transformation. Travels constantly. Recently divorced, no kids, workaholic tendencies.",
    relationshipHints: ["Manages Thomas Richardson account", "Pressures operations for faster delivery", "Board favorite for results", "Competitive with peers"],
    headshotPrompt: "Professional headshot of a 41-year-old Korean American woman with sleek black shoulder-length hair, sharp features, confident smile. Wearing a tailored charcoal suit jacket with a silk scarf. Polished, ambitious expression. Sleek modern office with city view in background."
  },
  {
    name: "Robert Nakamura",
    role: "General Counsel",
    title: "General Counsel",
    influence: 6,
    hostility: 2,
    flexibility: 4,
    riskTolerance: 2,
    impactCategories: ["legal", "governance", "labor"],
    backgroundHints: "Japanese American, third generation. Georgetown Law. 10 years at Apex after career at large labor law firm. Methodical, risk-averse, but understands business realities. Happily married, adult daughter is also a lawyer.",
    relationshipHints: ["Advises on union matters", "Conservative voice in leadership", "Trusted for discretion", "Close to Victoria Hartwell"],
    headshotPrompt: "Professional headshot of a 56-year-old Japanese American man with distinguished gray hair, wearing horn-rimmed glasses and a conservative dark suit with blue tie. Calm, measured expression. Law library or wood-paneled office in background."
  },
  {
    name: "Marcus Webb",
    role: "Union Organizer",
    title: "UAW Regional Organizer",
    influence: 8,
    hostility: 8,
    flexibility: 3,
    riskTolerance: 7,
    impactCategories: ["labor", "community", "culture"],
    backgroundHints: "African American, grew up in Detroit. Third-generation autoworker family. Lost his father's job to plant closure in 2008. 20 years organizing experience. Sees himself as protector of working families. Single father of two.",
    relationshipHints: ["Adversarial to management", "Building alliances with workers", "Frank Torres is key target", "Media savvy"],
    headshotPrompt: "Professional headshot of a 47-year-old African American man with close-cropped hair and a goatee, wearing a UAW union jacket over a button-down shirt. Intense, determined expression. Standing outside a factory gate with workers in soft background."
  },
  {
    name: "Patricia Lawson",
    role: "Bank Representative",
    title: "Senior Vice President, Commercial Lending",
    influence: 9,
    hostility: 5,
    flexibility: 4,
    riskTolerance: 3,
    impactCategories: ["finance", "governance", "strategy"],
    backgroundHints: "Caucasian woman, grew up on a farm, worked her way through state university. 25 years in commercial banking. Has seen many companies fail during transformations. Protects the bank's interests but fair. Grandmother of four.",
    relationshipHints: ["Holds debt covenant power", "Respects David Chen", "Skeptical of aggressive plans", "Key external stakeholder"],
    headshotPrompt: "Professional headshot of a 58-year-old Caucasian woman with short blonde-gray hair, pearl stud earrings, wearing a conservative cream blazer. Shrewd, appraising expression. Traditional bank office with wood furniture in background."
  },
  {
    name: "Dr. Nathan Cross",
    role: "Industry Analyst",
    title: "Managing Director, Manufacturing Insights",
    influence: 5,
    hostility: 1,
    flexibility: 8,
    riskTolerance: 5,
    impactCategories: ["strategy", "technology", "customers"],
    backgroundHints: "African American, MIT PhD in Industrial Engineering. Former McKinsey consultant. Writes widely-followed industry reports. Objective observer but his coverage affects stock prices and customer confidence. Married to a university professor.",
    relationshipHints: ["Neutral observer", "Thomas Richardson reads his reports", "Victoria Hartwell courts his favor", "Source of industry benchmarks"],
    headshotPrompt: "Professional headshot of a 45-year-old African American man with short hair and a neat beard, wearing a blazer over a turtleneck sweater. Intellectual, thoughtful expression. Modern conference room with whiteboards in background."
  },
  {
    name: "Angela Reyes",
    role: "Mayor",
    title: "Mayor, City of Riverside",
    influence: 5,
    hostility: 4,
    flexibility: 5,
    riskTolerance: 4,
    impactCategories: ["community", "labor", "governance"],
    backgroundHints: "Latina, born and raised locally. Former small business owner. First-term mayor running on jobs platform. Apex is the largest employer in her city. Caught between supporting business and protecting workers. Married, four grandchildren.",
    relationshipHints: ["Political pressure from all sides", "Union has her ear", "Needs Apex for tax base", "Watches closely"],
    headshotPrompt: "Professional headshot of a 54-year-old Latina woman with shoulder-length dark hair with gray highlights, warm brown eyes, wearing a red blazer with a city pin on the lapel. Diplomatic, concerned expression. City hall office with American flag in background."
  },
  {
    name: "Thomas Richardson",
    role: "Customer (AutoCorp)",
    title: "VP of Supply Chain, AutoCorp",
    influence: 7,
    hostility: 4,
    flexibility: 4,
    riskTolerance: 4,
    impactCategories: ["customers", "finance", "strategy"],
    backgroundHints: "Caucasian, old money Atlanta family. Wharton MBA. 42% of Apex revenue comes from his decisions. Cold, transactional, but respects competence. Will switch suppliers without sentiment if quality or delivery slips. Golf obsession.",
    relationshipHints: ["Jennifer Park manages relationship", "Industry analysts influence him", "Demands constant improvement", "Loyalty is earned daily"],
    headshotPrompt: "Professional headshot of a 49-year-old Caucasian man with perfectly styled brown hair, tan from golf, wearing an expensive navy suit and Hermès tie. Cool, evaluating expression. Executive suite with automotive memorabilia in background."
  },
  {
    name: "Rachel Kim",
    role: "Technology Vendor",
    title: "Regional Sales Director, RoboTech Solutions",
    influence: 4,
    hostility: 1,
    flexibility: 8,
    riskTolerance: 6,
    impactCategories: ["technology", "finance", "operations"],
    backgroundHints: "Korean American, Carnegie Mellon engineering degree. Genuinely believes in automation improving lives. Not just selling - partners with clients. Startup mentality, high energy. Single, runs marathons.",
    relationshipHints: ["Technical resource for Maggie", "Offers implementation support", "Has solutions to problems", "Eager to prove value"],
    headshotPrompt: "Professional headshot of a 34-year-old Korean American woman with long straight black hair, enthusiastic smile, wearing a modern tech company blazer. Energetic, optimistic expression. High-tech showroom with robotic equipment in soft focus background."
  },
  {
    name: "Dr. Helen Mercer",
    role: "External Consultant",
    title: "Principal, Transformation Partners LLC",
    influence: 4,
    hostility: 1,
    flexibility: 7,
    riskTolerance: 5,
    impactCategories: ["strategy", "culture", "training"],
    backgroundHints: "Caucasian, Harvard Business School professor on leave. PhD in Organizational Behavior. Has advised 50+ companies through transformation. Objective third party. Widowed, grown children, writes books.",
    relationshipHints: ["Hired by Victoria Hartwell", "Trusted neutral voice", "Sees patterns others miss", "No political agenda"],
    headshotPrompt: "Professional headshot of a 63-year-old Caucasian woman with silver hair in a sophisticated bob, wearing elegant reading glasses and a tweed blazer. Wise, observant expression. Academic office with bookshelves in background."
  },
  {
    name: "Jaylen Brooks",
    role: "Gen Z Representative",
    title: "Production Associate & Employee Council Rep",
    influence: 5,
    hostility: 5,
    flexibility: 7,
    riskTolerance: 6,
    impactCategories: ["labor", "culture", "technology"],
    backgroundHints: "African American, 24 years old. Community college certificate in manufacturing technology. Articulate voice for younger workers. Questions everything - why do we do it this way? Frustrated by lack of advancement. Social media savvy.",
    relationshipHints: ["Informal leader of Gen Z workers", "Challenges Frank Torres' methods", "Sandra Williams mentor figure", "Could go either way on union"],
    headshotPrompt: "Professional headshot of a 24-year-old African American man with a fade haircut and small earring, wearing a clean company polo. Direct, questioning expression with underlying ambition. Modern break room or training facility in background."
  },
  {
    name: "Destiny Martinez",
    role: "Gen Z Employee",
    title: "Quality Control Technician",
    influence: 2,
    hostility: 4,
    flexibility: 6,
    riskTolerance: 5,
    impactCategories: ["labor", "culture", "technology"],
    backgroundHints: "Latina, 22 years old. First in family to get technical certification. Student loans to pay. Skeptical of company promises after watching her parents' employer close. Talented but won't commit until she sees proof. Dating Jaylen Brooks.",
    relationshipHints: ["Jaylen Brooks' girlfriend", "Follows his lead", "Trust must be earned", "Voice of younger skeptics"],
    headshotPrompt: "Professional headshot of a 22-year-old Latina woman with long dark hair pulled back, minimal makeup, wearing safety glasses pushed up on her head and a company uniform shirt. Guarded, observant expression. Quality control lab in background."
  },
  {
    name: "William Thornton III",
    role: "Board Member (PE)",
    title: "Managing Partner, Thornton Capital Partners",
    influence: 9,
    hostility: 6,
    flexibility: 3,
    riskTolerance: 8,
    impactCategories: ["finance", "governance", "strategy"],
    backgroundHints: "Caucasian, old money family. Yale legacy, MBA. Represents private equity investors who own 35% of Apex. Focused on 3-5 year exit. Human costs are 'externalities.' Sees transformation as path to higher multiple. Collects vintage cars.",
    relationshipHints: ["Allied with Victoria on modernization", "Pushes for aggressive timeline", "Patricia Lawson is obstacle", "Would sell company if price right"],
    headshotPrompt: "Professional headshot of a 52-year-old Caucasian man with slicked-back silver hair, cold blue eyes, wearing a bespoke pinstripe suit and gold cufflinks. Calculating, imperious expression. Wealthy private equity office with skyline view in background."
  }
];

async function generateCharacterBio(spec: CharacterSpec, canon: CanonicalData): Promise<{
  bio: string;
  personality: string;
  communicationStyle: string;
  motivations: string;
  fears: string;
  voiceDescription: string;
  speakingStyleExamples: string[];
}> {
  const prompt = `You are creating a detailed character profile for an MBA-level business simulation game.

COMPANY CONTEXT:
- Company: ${canon.company.name}
- Industry: ${canon.company.industry}
- Location: ${canon.company.location}
- Employees: ${canon.company.employees}
- Founded: ${canon.company.founded}

CHARACTER: ${spec.name}
Role: ${spec.role}
Title: ${spec.title}
Influence Level: ${spec.influence}/10
Hostility Level: ${spec.hostility}/10
Flexibility: ${spec.flexibility}/10
Risk Tolerance: ${spec.riskTolerance}/10
Impact Categories: ${spec.impactCategories.join(', ')}

BACKGROUND HINTS:
${spec.backgroundHints}

KEY RELATIONSHIPS:
${spec.relationshipHints.map(r => `- ${r}`).join('\n')}

Generate a comprehensive character profile with these sections:

1. BIO (200-250 words)
Write a rich backstory including education, career path, family situation, and how they came to their current position. Include specific details that make them feel real.

2. PERSONALITY (100 words)
Describe their core personality traits, what makes them tick, their strengths and blind spots.

3. COMMUNICATION STYLE (80 words)
How do they speak? Formal or casual? Direct or diplomatic? What phrases do they use? How do they write emails?

4. MOTIVATIONS (80 words)
What drives this person? What do they want to achieve? What matters most to them?

5. FEARS (80 words)
What keeps them up at night? What are they most afraid of in this transformation?

6. VOICE DESCRIPTION (50 words)
Describe their speaking voice for audio synthesis - tone, pace, accent, vocal qualities.

7. SPEAKING EXAMPLES (provide exactly 4)
Write 4 characteristic quotes this person might say during the simulation. Each should be 1-2 sentences and reveal their personality.

Format your response as JSON with these exact keys:
{
  "bio": "...",
  "personality": "...",
  "communicationStyle": "...",
  "motivations": "...",
  "fears": "...",
  "voiceDescription": "...",
  "speakingStyleExamples": ["quote1", "quote2", "quote3", "quote4"]
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are an expert character designer for business simulations. You create believable, nuanced characters that feel like real people navigating corporate transformation. Always respond with valid JSON.'
      },
      { role: 'user', content: prompt }
    ],
    temperature: 0.8,
    max_tokens: 1500,
    response_format: { type: "json_object" }
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error(`No content generated for ${spec.name}`);
  }

  return JSON.parse(content);
}

function loadCanonicalData(): CanonicalData {
  const canonicalPath = path.join(process.cwd(), 'docs', 'canonical.json');
  const content = fs.readFileSync(canonicalPath, 'utf-8');
  return JSON.parse(content);
}

async function main() {
  console.log('Loading canonical data...\n');
  const canon = loadCanonicalData();

  console.log(`Company: ${canon.company.name}`);
  console.log(`Characters to process: ${characterSpecs.length}\n`);

  for (const spec of characterSpecs) {
    console.log(`Processing: ${spec.name} (${spec.role})...`);

    try {
      const profile = await generateCharacterBio(spec, canon);

      const existing = await db
        .select()
        .from(characterProfiles)
        .where(eq(characterProfiles.name, spec.name))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(characterProfiles)
          .set({
            title: spec.title,
            company: canon.company.name,
            bio: profile.bio,
            personality: profile.personality,
            communicationStyle: profile.communicationStyle,
            motivations: profile.motivations,
            fears: profile.fears,
            voiceDescription: profile.voiceDescription,
            speakingStyleExamples: profile.speakingStyleExamples,
            flexibility: spec.flexibility,
            riskTolerance: spec.riskTolerance,
            impactCategories: spec.impactCategories,
            headshotPrompt: spec.headshotPrompt,
            updatedAt: new Date(),
          })
          .where(eq(characterProfiles.name, spec.name));
        console.log(`  Updated: ${spec.name}`);
      } else {
        await db.insert(characterProfiles).values({
          id: crypto.randomUUID(),
          name: spec.name,
          role: spec.role,
          title: spec.title,
          company: canon.company.name,
          influence: spec.influence,
          hostility: spec.hostility,
          flexibility: spec.flexibility,
          riskTolerance: spec.riskTolerance,
          impactCategories: spec.impactCategories,
          bio: profile.bio,
          personality: profile.personality,
          communicationStyle: profile.communicationStyle,
          motivations: profile.motivations,
          fears: profile.fears,
          voiceDescription: profile.voiceDescription,
          speakingStyleExamples: profile.speakingStyleExamples,
          headshotPrompt: spec.headshotPrompt,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        console.log(`  Created: ${spec.name}`);
      }
    } catch (error) {
      console.error(`  ERROR for ${spec.name}:`, error);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('Character bio generation complete!');
  console.log('='.repeat(50));
}

main().catch(console.error);
