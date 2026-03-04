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

interface VoiceProfile {
  pitch: 'low' | 'medium-low' | 'medium' | 'medium-high' | 'high';
  pace: 'slow' | 'measured' | 'moderate' | 'quick' | 'rapid';
  accent: string;
  tone: string;
  ageRange: string;
  gender: 'male' | 'female';
  emotionalBaseline: string;
  distinctiveQualities: string[];
  samplePhrases: string[];
}

interface SocialProfile {
  headline: string;
  about: string;
  currentPosition: {
    title: string;
    company: string;
    duration: string;
    description: string;
  };
  previousPositions: Array<{
    title: string;
    company: string;
    duration: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    year: string;
  }>;
  skills: string[];
  endorsements: number;
  connections: string;
}

interface CharacterSpec {
  name: string;
  role: string;
  title: string;
  gender: 'male' | 'female';
  age: number;
  ethnicity: string;
  voiceHints: string;
  careerHints: string;
}

const characterSpecs: CharacterSpec[] = [
  {
    name: "Victoria Hartwell",
    role: "Board Chair",
    title: "Chairwoman of the Board",
    gender: "female",
    age: 62,
    ethnicity: "Caucasian",
    voiceHints: "Commanding, patrician, Harvard-educated tone. Clipped, efficient speech. Slight New England undertone. Never wastes words.",
    careerHints: "Former Fortune 500 executive. Led transformations at two major companies. Harvard MBA. Board member at multiple companies."
  },
  {
    name: "David Chen",
    role: "Chief Financial Officer",
    title: "Chief Financial Officer",
    gender: "male",
    age: 48,
    ethnicity: "Chinese American",
    voiceHints: "Calm, analytical, precise. Neutral American accent. Measured pace. Explains complex financial concepts clearly.",
    careerHints: "Stanford MBA. Started as accountant, rose to Controller then CFO. 15 years at Apex. Previously at Big Four firm."
  },
  {
    name: "Margaret O'Brien",
    role: "Chief Operating Officer",
    title: "Chief Operating Officer",
    gender: "female",
    age: 55,
    ethnicity: "Irish American",
    voiceHints: "Warm, direct Midwest accent. Down-to-earth. Occasional manufacturing jargon. Speaks from experience not theory.",
    careerHints: "Started as machinist 28 years ago. Rose through ranks. Executive education at Kellogg. No college degree initially."
  },
  {
    name: "Sandra Williams",
    role: "HR Director",
    title: "Director of Human Resources",
    gender: "female",
    age: 44,
    ethnicity: "African American",
    voiceHints: "Warm, empathetic, professional. Slight Southern warmth. Careful word choice. Makes people feel heard.",
    careerHints: "Industrial Psychology from Michigan State. 12 years at Apex. Previous HR roles at healthcare and retail companies."
  },
  {
    name: "Frank Torres",
    role: "Operations Manager",
    title: "Senior Operations Manager",
    gender: "male",
    age: 52,
    ethnicity: "Mexican American",
    voiceHints: "Gruff, skeptical, working-class Midwest. Direct and blunt. Occasional Spanish phrases. Doesn't suffer fools.",
    careerHints: "22 years at Apex. Started on production line. Worked up to supervisor then manager. Local high school, trade certifications."
  },
  {
    name: "Jennifer Park",
    role: "Vice President of Sales",
    title: "Vice President of Sales",
    gender: "female",
    age: 41,
    ethnicity: "Korean American",
    voiceHints: "Confident, polished, fast-paced. Corporate American. Persuasive. Occasional urgency in voice.",
    careerHints: "Northwestern MBA. Previous sales leadership at competitor. 6 years at Apex. Aggressive career trajectory."
  },
  {
    name: "Robert Nakamura",
    role: "General Counsel",
    title: "General Counsel",
    gender: "male",
    age: 56,
    ethnicity: "Japanese American",
    voiceHints: "Calm, deliberate, formal. Precise legal language. Never rushed. Thoughtful pauses.",
    careerHints: "Georgetown Law. Partner track at labor law firm. 10 years at Apex. Specializes in employment and union law."
  },
  {
    name: "Marcus Webb",
    role: "Union Organizer",
    title: "UAW Regional Organizer",
    gender: "male",
    age: 47,
    ethnicity: "African American",
    voiceHints: "Passionate, rhythmic Detroit cadence. Working-class authenticity. Can shift from conversational to rally speech.",
    careerHints: "Third-generation autoworker. 20 years organizing experience. Lost father's job in 2008 plant closure. UAW leadership training."
  },
  {
    name: "Patricia Lawson",
    role: "Bank Representative",
    title: "Senior Vice President, Commercial Lending",
    gender: "female",
    age: 58,
    ethnicity: "Caucasian",
    voiceHints: "Midwestern practical. No-nonsense banker voice. Firm but fair. Straight-shooter.",
    careerHints: "Farm background. State university. 25 years in commercial banking. Rose from loan officer to SVP."
  },
  {
    name: "Dr. Nathan Cross",
    role: "Industry Analyst",
    title: "Managing Director, Manufacturing Insights",
    gender: "male",
    age: 45,
    ethnicity: "African American",
    voiceHints: "Intellectual, articulate. Neutral professional American. Academic precision with business accessibility.",
    careerHints: "MIT PhD Industrial Engineering. Former McKinsey consultant. Writes influential industry reports. Media commentator."
  },
  {
    name: "Angela Reyes",
    role: "Mayor",
    title: "Mayor, City of Riverside",
    gender: "female",
    age: 54,
    ethnicity: "Latina",
    voiceHints: "Political warmth. Midwest American with subtle Hispanic inflection. Diplomatic but genuine concern.",
    careerHints: "Local business owner before politics. First-term mayor. Community college, later completed BA. Lifelong resident."
  },
  {
    name: "Thomas Richardson",
    role: "Customer (AutoCorp)",
    title: "VP of Supply Chain, AutoCorp",
    gender: "male",
    age: 49,
    ethnicity: "Caucasian",
    voiceHints: "Southern executive polish (Atlanta). Cool, transactional. Slight drawl. Golf club charm when useful.",
    careerHints: "Old money Atlanta family. Wharton MBA. Fast track at AutoCorp. Previous experience at tier-one suppliers."
  },
  {
    name: "Rachel Kim",
    role: "Technology Vendor",
    title: "Regional Sales Director, RoboTech Solutions",
    gender: "female",
    age: 34,
    ethnicity: "Korean American",
    voiceHints: "Energetic, enthusiastic. Tech startup energy. Quick pace. Genuinely believes in her product.",
    careerHints: "Carnegie Mellon engineering. Startup experience. Joined RoboTech early. Technical sales background."
  },
  {
    name: "Dr. Helen Mercer",
    role: "External Consultant",
    title: "Principal, Transformation Partners LLC",
    gender: "female",
    age: 63,
    ethnicity: "Caucasian",
    voiceHints: "Wise, measured, academic warmth. New England educated. Patient, listens before speaking.",
    careerHints: "Harvard Business School professor. PhD Organizational Behavior. 50+ company transformations. Author of management books."
  },
  {
    name: "Jaylen Brooks",
    role: "Gen Z Representative",
    title: "Production Associate & Employee Council Rep",
    gender: "male",
    age: 24,
    ethnicity: "African American",
    voiceHints: "Young, articulate, questioning. Modern urban American. Not afraid to challenge. Social media fluent.",
    careerHints: "Community college manufacturing technology certificate. First job at Apex. Employee council representative. Ambitious."
  },
  {
    name: "Destiny Martinez",
    role: "Gen Z Employee",
    title: "Quality Control Technician",
    gender: "female",
    age: 22,
    ethnicity: "Latina",
    voiceHints: "Guarded, observant, young professional. Midwest with slight Hispanic heritage. Skeptical but fair.",
    careerHints: "Technical certification. First in family with technical credential. Student loans. Dating Jaylen Brooks."
  },
  {
    name: "William Thornton III",
    role: "Board Member (PE)",
    title: "Managing Partner, Thornton Capital Partners",
    gender: "male",
    age: 52,
    ethnicity: "Caucasian",
    voiceHints: "Old money confident. Slight prep school New England. Cool, calculating. Expects to be listened to.",
    careerHints: "Yale legacy. Harvard MBA. Founded PE firm after Goldman Sachs. Multiple board seats. Family wealth."
  }
];

async function generateProfiles(spec: CharacterSpec): Promise<{ voiceProfile: VoiceProfile; socialProfile: SocialProfile }> {
  const prompt = `Generate detailed voice and social media profiles for a business simulation character.

CHARACTER: ${spec.name}
Role: ${spec.role}
Title: ${spec.title}
Gender: ${spec.gender}
Age: ${spec.age}
Ethnicity: ${spec.ethnicity}
Voice Hints: ${spec.voiceHints}
Career Background: ${spec.careerHints}

Generate a JSON response with two objects:

1. voiceProfile: For external voice synthesis tools (like ElevenLabs)
{
  "pitch": "low|medium-low|medium|medium-high|high",
  "pace": "slow|measured|moderate|quick|rapid",
  "accent": "specific accent description",
  "tone": "primary emotional tone",
  "ageRange": "e.g., early 60s",
  "gender": "${spec.gender}",
  "emotionalBaseline": "default emotional state",
  "distinctiveQualities": ["array of 3-4 unique vocal characteristics"],
  "samplePhrases": ["4 short characteristic phrases this person would say, matching their speaking style"]
}

2. socialProfile: LinkedIn-style professional profile
{
  "headline": "Professional headline (e.g., 'CFO | Financial Strategy | Manufacturing')",
  "about": "150-200 word professional summary in first person",
  "currentPosition": {
    "title": "${spec.title}",
    "company": "Apex Manufacturing (or their actual company)",
    "duration": "realistic tenure like '8 years 3 months'",
    "description": "2-3 sentences about their role"
  },
  "previousPositions": [2-3 previous roles with title, company, duration],
  "education": [1-2 education entries with institution, degree, year],
  "skills": ["8-10 professional skills"],
  "endorsements": realistic number based on seniority (50-500),
  "connections": "500+" or "1,000+" etc based on role
}

Return valid JSON only with keys "voiceProfile" and "socialProfile".`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You create realistic professional profiles for business simulation characters. Return only valid JSON.'
      },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 1500,
    response_format: { type: "json_object" }
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error(`No content generated for ${spec.name}`);
  }

  return JSON.parse(content);
}

async function main() {
  console.log('Generating voice and social profiles for all characters...\n');

  for (const spec of characterSpecs) {
    console.log(`Processing: ${spec.name}...`);

    try {
      const { voiceProfile, socialProfile } = await generateProfiles(spec);

      await db
        .update(characterProfiles)
        .set({
          voiceProfile: voiceProfile,
          socialProfile: socialProfile,
          updatedAt: new Date(),
        })
        .where(eq(characterProfiles.name, spec.name));

      console.log(`  Updated: voiceProfile + socialProfile`);
    } catch (error) {
      console.error(`  ERROR for ${spec.name}:`, error);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('Voice and social profile generation complete!');
  console.log('='.repeat(50));
}

main().catch(console.error);
