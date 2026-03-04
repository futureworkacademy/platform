import OpenAI from 'openai';
import { db } from './db';
import { advisors } from '@shared/models/auth';
import { randomUUID } from 'crypto';

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

interface AdvisorSpec {
  name: string;
  category: 'consultant' | 'industry_expert' | 'thought_leader';
  title: string;
  organization: string;
  specialty: string;
  bio: string;
  voiceHints: string;
  voiceId: string;
  voiceName: string;
  guidanceContext: string;
  keyInsights: string[];
}

// 9 Advisor personas across 3 categories
const advisorSpecs: AdvisorSpec[] = [
  // STRATEGY CONSULTANTS (3)
  {
    name: "Dr. Elena Vasquez",
    category: "consultant",
    title: "Senior Partner, AI Transformation Practice",
    organization: "Meridian Consulting Group",
    specialty: "AI Strategy & Implementation",
    bio: "Former MIT professor turned management consultant. Led 40+ Fortune 500 AI transformations over 15 years. Known for her 'Accelerated Adoption Framework' that balances speed with workforce stability. Author of 'The AI Inflection Point'. Stanford MBA, PhD in Organizational Behavior.",
    voiceHints: "Articulate, confident, academic precision with consulting pragmatism. Slight Spanish accent. Fast but clear.",
    voiceId: "XB0fDUnXU5powFXDhCwa", // Charlotte
    voiceName: "Charlotte",
    guidanceContext: "I help companies navigate the strategic complexity of AI adoption. The key is sequencing - you can't transform everything at once. I've seen too many companies fail because they moved too fast or too slow. The sweet spot is aggressive but sustainable change.",
    keyInsights: [
      "Sequence automation by workflow complexity, not cost savings",
      "Invest 15-20% of transformation budget in change management",
      "Create 'AI champions' in each department to accelerate adoption"
    ]
  },
  {
    name: "Marcus Chen",
    category: "consultant",
    title: "Managing Director, Change Leadership",
    organization: "Apex Advisory Partners",
    specialty: "Change Management & Culture",
    bio: "20 years leading organizational transformations. Former HR executive at Boeing and Ford. Specializes in the human side of technology transitions. Known for 'The Trust Triangle' framework for employee engagement during uncertainty. Harvard MBA, Certified Executive Coach.",
    voiceHints: "Calm, reassuring, empathetic but direct. Neutral American accent. Speaks slowly and deliberately.",
    voiceId: "pNInz6obpgDQGcFmaJgB", // Adam
    voiceName: "Adam",
    guidanceContext: "Technology transformations fail for people reasons, not technical ones. The number one predictor of success is how early you involve employees in the process. Fear spreads faster than information - you need to get ahead of the narrative.",
    keyInsights: [
      "Communicate the 'why' before the 'what' - employees need purpose",
      "Middle managers are your biggest leverage point for change",
      "Create visible early wins to build transformation momentum"
    ]
  },
  {
    name: "Diana Okonkwo",
    category: "consultant",
    title: "Partner, Future Workforce Practice",
    organization: "TalentBridge Global",
    specialty: "Workforce Planning & Skills Strategy",
    bio: "Pioneer in skills-based workforce planning. Developed the 'Skills Adjacency Model' used by over 100 companies globally. Former Chief People Officer at Siemens Americas. Board member at Society for Human Resource Management. Wharton MBA, SHRM-SCP certified.",
    voiceHints: "Warm, authoritative, strategic. Nigerian-British accent. Confident and encouraging tone.",
    voiceId: "jsCqWAovK2LkecY7zXl4", // Freya
    voiceName: "Freya",
    guidanceContext: "The skills gap is the hidden crisis in every AI transformation. Most companies underestimate how long it takes to reskill workers - it's not weeks, it's months or years. But here's the opportunity: your existing employees already know your business. That knowledge is irreplaceable.",
    keyInsights: [
      "Map skills adjacencies - who can be reskilled vs. who needs new roles",
      "Partner with community colleges for accelerated training programs",
      "Create internal AI apprenticeship programs to retain institutional knowledge"
    ]
  },

  // INDUSTRY EXPERTS (3)
  {
    name: "Robert 'Bobby' Hartwell",
    category: "industry_expert",
    title: "Manufacturing Automation Veteran",
    organization: "Independent Advisor",
    specialty: "Factory Floor Operations & Automation",
    bio: "40 years on manufacturing floors from line worker to VP Operations. Witnessed every automation wave from CNC to robotics to AI. Known for practical, no-nonsense approach to technology adoption. Former VP Operations at Caterpillar. Now advises mid-market manufacturers on realistic automation timelines.",
    voiceHints: "Deep, gravelly voice. Midwestern working-class accent. Straight-talking, occasionally gruff. Voice of experience.",
    voiceId: "VR6AewLTigWG4xSOukaG", // Arnold
    voiceName: "Arnold",
    guidanceContext: "I've seen every automation fad come through since the 80s. The ones that work are the ones that listen to the floor. Your line workers know things engineers don't. They've been improvising solutions for years. You ignore them at your own peril.",
    keyInsights: [
      "Pilot new technology with your most skeptical workers, not your enthusiasts",
      "Quality metrics always dip before they improve - plan for the J-curve",
      "The best automation augments workers, it doesn't replace judgment"
    ]
  },
  {
    name: "Dr. Priya Sharma",
    category: "industry_expert",
    title: "Labor Economist & Policy Analyst",
    organization: "Brookings Institution",
    specialty: "Labor Markets & Economic Policy",
    bio: "Leading researcher on technology's impact on labor markets. Advised three U.S. administrations on workforce policy. Published 50+ peer-reviewed papers on automation and employment. Known for nuanced views that challenge both technophobia and techno-optimism. PhD Economics, Princeton.",
    voiceHints: "Thoughtful, measured, academic but accessible. Indian-American accent. Careful word choice, slightly formal.",
    voiceId: "XB0fDUnXU5powFXDhCwa", // Charlotte
    voiceName: "Charlotte",
    guidanceContext: "The economic research is clear: automation creates jobs in the aggregate, but destroys specific jobs for specific people. That's not a contradiction - it's the challenge you need to manage. The question isn't whether to automate, it's how to do it responsibly.",
    keyInsights: [
      "Workers displaced after age 50 face 30% wage penalties - prioritize support here",
      "Geographic concentration of job losses creates community-level crises",
      "Companies that invest in transition support see 40% less legal/PR exposure"
    ]
  },
  {
    name: "James Richardson",
    category: "industry_expert",
    title: "Former CEO, Fortune 500 Manufacturing",
    organization: "Richardson Strategic Partners",
    specialty: "Executive Leadership & Board Relations",
    bio: "Retired CEO of Apex Industrial (not the simulation company). Led the company through digital transformation from 2012-2022, growing market cap 300%. Known for his 'Stakeholder Balance' approach to transformation. Now serves on 4 public company boards. Harvard Business School, West Point graduate.",
    voiceHints: "Commanding, measured, executive presence. Southern gentleman accent. Speaks from authority and experience.",
    voiceId: "onwK4e9ZLuTAKqWW03F9", // Daniel
    voiceName: "Daniel",
    guidanceContext: "I've been in your chair. The pressure from the board, the demands from shareholders, the responsibility to employees - they all feel like they're pulling in different directions. They're not. The path forward requires the courage to make long-term decisions in a short-term world.",
    keyInsights: [
      "Your board wants a narrative, not just numbers - give them a transformation story",
      "Reserve 10% of your change budget for unexpected opportunities and crises",
      "The CEO's job is to absorb uncertainty so others can execute"
    ]
  },

  // THOUGHT LEADERS (3)
  {
    name: "Dr. Amara Williams",
    category: "thought_leader",
    title: "AI Ethics Researcher & Author",
    organization: "Stanford Human-Centered AI Institute",
    specialty: "AI Ethics & Responsible Innovation",
    bio: "Leading voice on ethical AI implementation. Author of bestselling 'The Algorithm's Shadow: Navigating AI's Moral Landscape'. Advisor to EU Commission on AI Act. Former engineer at Google DeepMind. Known for bridging technical and humanistic perspectives. PhD Philosophy of Technology, MIT.",
    voiceHints: "Thoughtful, passionate, articulate. African-American, slight academic tone. Speaks with conviction about values.",
    voiceId: "pFZP5JQG7iQjIQuC4Bku", // Lily
    voiceName: "Lily",
    guidanceContext: "Every AI decision is an ethical decision, whether you realize it or not. Who gets displaced? Who benefits? How transparent are your algorithms? These aren't just compliance questions - they're questions about what kind of company you want to be.",
    keyInsights: [
      "Algorithmic transparency builds trust faster than promises do",
      "Diverse teams catch ethical blind spots that homogeneous teams miss",
      "Your AI decisions will be studied in business schools - act accordingly"
    ]
  },
  {
    name: "Kai Nakamura",
    category: "thought_leader",
    title: "Future of Work Futurist",
    organization: "Foresight Labs",
    specialty: "Technology Trends & Future Scenarios",
    bio: "Technology futurist who predicted the AI productivity boom in 2018. Former head of innovation at Toyota and Microsoft. TED speaker with 10M+ views. Known for actionable futurism that executives can actually use. Author of 'The Next Factory'. Stanford Design School faculty.",
    voiceHints: "Energetic, visionary, inspiring. Japanese-American, California tech culture. Quick, enthusiastic, forward-looking.",
    voiceId: "TxGEqnHWrfWFTfGW9XjX", // Josh
    voiceName: "Josh",
    guidanceContext: "The factory of 2030 looks nothing like today's - but the path there isn't linear. You're not just adopting AI, you're building organizational capability for continuous reinvention. The companies that thrive will be the ones that learn to learn.",
    keyInsights: [
      "Build for optionality - avoid vendor lock-in and single-point dependencies",
      "The most valuable skill becomes 'learning velocity' - how fast can your org adapt?",
      "Human-AI collaboration beats human-only or AI-only in every complex task"
    ]
  },
  {
    name: "Dr. Thomas Brennan",
    category: "thought_leader",
    title: "Organizational Psychologist",
    organization: "Columbia Business School",
    specialty: "Organizational Psychology & Leadership",
    bio: "30 years studying how humans respond to workplace change. Author of 'The Anxious Organization'. Consulted for NASA, military, and Fortune 100 companies on high-stress transitions. Known for his 'Psychological Safety Index' for measuring change readiness. PhD Organizational Psychology, Yale.",
    voiceHints: "Warm, grandfatherly, wise. New York Jewish intellectual accent. Gentle humor, profound insights.",
    voiceId: "pNInz6obpgDQGcFmaJgB", // Adam
    voiceName: "Adam",
    guidanceContext: "Anxiety is not the enemy - uncertainty is. When people understand what's happening and why, they can handle almost anything. The problem is when leadership communicates through actions without explanation. That's when fear fills the vacuum.",
    keyInsights: [
      "Psychological safety predicts change success better than any technical factor",
      "Leaders who acknowledge uncertainty build more trust than those who project false confidence",
      "Grief is a normal response to job loss - give people space to process it"
    ]
  }
];

async function generateAdvisorContent() {
  console.log('🎯 Generating Phone-a-Friend Advisor Content...\n');

  for (const spec of advisorSpecs) {
    console.log(`\n📞 Processing: ${spec.name} (${spec.category})`);
    console.log(`   Title: ${spec.title}`);
    console.log(`   Specialty: ${spec.specialty}`);

    try {
      // Generate the advisor guidance transcript using OpenAI
      const prompt = `You are ${spec.name}, ${spec.title} at ${spec.organization}. 
Your specialty is ${spec.specialty}.

Background: ${spec.bio}

Context: ${spec.guidanceContext}

Key insights you want to share:
${spec.keyInsights.map((i, idx) => `${idx + 1}. ${i}`).join('\n')}

Write a 45-55 second voicemail message (approximately 110-140 words) for a business leader who is managing an AI transformation at a manufacturing company. They're struggling with decisions about automation, workforce changes, and stakeholder management.

Your message should:
1. Briefly introduce yourself and your expertise
2. Acknowledge the difficulty of their situation
3. Provide ONE concrete, actionable insight from your experience
4. End with encouragement and an offer to discuss further

Speak naturally as if leaving a voicemail. Use your authentic voice based on: ${spec.voiceHints}

Write ONLY the transcript, no stage directions or labels.`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 300,
        temperature: 0.8,
      });

      const transcript = response.choices[0]?.message?.content?.trim() || '';
      console.log(`   ✓ Generated ${transcript.split(' ').length} word transcript`);

      // Insert into database
      await db.insert(advisors).values({
        id: randomUUID(),
        name: spec.name,
        category: spec.category,
        title: spec.title,
        organization: spec.organization,
        specialty: spec.specialty,
        bio: spec.bio,
        transcript,
        audioUrl: null, // Will be populated by audio generation script
        voiceId: spec.voiceId,
        voiceName: spec.voiceName,
        keyInsights: spec.keyInsights,
        headshotUrl: null, // Optional: could generate with DALL-E
        createdAt: new Date(),
      });

      console.log(`   ✓ Saved to database`);

    } catch (error) {
      console.error(`   ✗ Error processing ${spec.name}:`, error);
    }
  }

  console.log('\n✅ Advisor content generation complete!');
  console.log('Next step: Run generate-advisor-audio.ts to generate voice files');
}

generateAdvisorContent().catch(console.error);
