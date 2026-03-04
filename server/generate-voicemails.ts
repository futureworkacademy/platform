import OpenAI from 'openai';
import { db } from './db';
import { triggeredVoicemails } from '@shared/models/auth';
import { randomUUID } from 'crypto';

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

interface VoicemailSpec {
  weekNumber: number;
  title: string;
  theme: string;
  characterName: string;
  characterRole: string;
  voiceHints: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  emotionalContext: string;
}

const voicemailSpecs: VoicemailSpec[] = [
  {
    weekNumber: 1,
    title: "Board Pressure Call",
    theme: "The Automation Imperative",
    characterName: "Victoria Hartwell",
    characterRole: "Board Chair",
    voiceHints: "Commanding, patrician, Harvard-educated. Clipped, efficient speech. Never wastes words.",
    urgency: "high",
    emotionalContext: "The board is watching your AI strategy closely. Private equity has noticed our competitors investing heavily in automation. This is a make-or-break moment - we need bold decisions backed by sound financial reasoning. Don't disappoint us."
  },
  {
    weekNumber: 2,
    title: "Talent Crisis Warning",
    theme: "The Talent Pipeline Crisis",
    characterName: "Dr. Priya Kapoor",
    characterRole: "Manufacturing Technology Consultant",
    voiceHints: "Articulate, academic yet practical. Light Indian-American accent. Speaks with authority backed by research.",
    urgency: "medium",
    emotionalContext: "I've been analyzing your workforce data and the skills gap is more severe than anticipated. Traditional training won't close this in time. We need to discuss a multi-pronged approach - internal development, external hiring, and strategic partnerships. The industry average transformation takes 18 months; we may not have that luxury."
  },
  {
    weekNumber: 3,
    title: "Union Organizing Alert",
    theme: "Union Storm Brewing",
    characterName: "Marcus Washington",
    characterRole: "UAW Regional Organizer",
    voiceHints: "Deep, resonant voice. Midwestern working-class accent. Passionate but controlled. Union pride evident.",
    urgency: "critical",
    emotionalContext: "Your people are scared. They're hearing rumors about layoffs, and nobody from management is giving them straight answers. I've got workers reaching out to us every day now. This doesn't have to be adversarial - but it will be if you keep treating them like they don't matter. We need to talk. Soon."
  },
  {
    weekNumber: 4,
    title: "HR Crisis Update",
    theme: "The First Displacement",
    characterName: "Sandra Williams",
    characterRole: "HR Director",
    voiceHints: "Warm, empathetic, professional. Slight Southern warmth. Careful word choice. Makes people feel heard.",
    urgency: "high",
    emotionalContext: "I just finished meeting with the first group affected by the automation rollout. These are 15 and 20-year veterans. Some are devastated. Some are angry. A few are hopeful about retraining. We need a comprehensive transition plan before we make any more announcements - the way this is handled will define our culture for years."
  },
  {
    weekNumber: 5,
    title: "Manager Resignation Warning",
    theme: "The Manager Exodus",
    characterName: "Robert Kim",
    characterRole: "Quality Control Manager",
    voiceHints: "Tired but dedicated. Second-generation Korean-American. Technical precision mixed with exhaustion.",
    urgency: "high",
    emotionalContext: "I need to be honest with you. I've had three job offers this month, and I'm not the only one. The middle managers are burned out - we're implementing AI systems we barely understand while trying to keep the floor running. My team is working 60-hour weeks and the younger supervisors are already updating their resumes. Something has to give."
  },
  {
    weekNumber: 6,
    title: "Financial Pressure Briefing",
    theme: "Debt Day of Reckoning",
    characterName: "David Chen",
    characterRole: "Chief Financial Officer",
    voiceHints: "Calm, analytical, precise. Neutral American accent. Measured pace. Explains complex concepts clearly.",
    urgency: "critical",
    emotionalContext: "I've been running the numbers on our debt servicing against the transformation timeline. We have a 90-day window before covenant violations become a real concern. The board is getting nervous. We either need to accelerate revenue from the new systems or negotiate with lenders. There's no room for error here."
  },
  {
    weekNumber: 7,
    title: "Market Perception Alert",
    theme: "The Competitive Response",
    characterName: "Sarah Mitchell",
    characterRole: "VP of Sales",
    voiceHints: "Confident, fast-paced. Chicago business accent. Customer-focused. Competitive fire evident.",
    urgency: "high",
    emotionalContext: "I just got back from the industry conference and we have a perception problem. Competitors are positioning us as 'legacy manufacturing' - too slow to adapt. I had three major accounts ask if we're even going to be around in five years. We need a strong public narrative about our transformation, and we need it yesterday."
  },
  {
    weekNumber: 8,
    title: "CEO Strategic Vision",
    theme: "Strategic Direction",
    characterName: "David Okonkwo",
    characterRole: "Chief Executive Officer",
    voiceHints: "Deep, commanding presence. Nigerian-American with executive polish. Inspirational but grounded.",
    urgency: "medium",
    emotionalContext: "We've come through the hardest part of this transformation - or at least, the most visible part. Now comes the question of legacy. What kind of company are we building? How do we balance shareholder returns with the workforce that got us here? The strategy you recommend this week will define Apex's direction for the next decade. Make it count."
  }
];

async function generateVoicemailScript(spec: VoicemailSpec): Promise<string> {
  const prompt = `You are writing a voicemail script for a business simulation game. The character is ${spec.characterName}, ${spec.characterRole} at Apex Manufacturing.

WEEK ${spec.weekNumber}: "${spec.theme}"

Character Voice: ${spec.voiceHints}

Emotional Context: ${spec.emotionalContext}

Write a voicemail transcript that:
1. Is 30-60 seconds when spoken (approximately 75-150 words)
2. Sounds like an authentic, slightly rushed voicemail
3. Captures the urgency level: ${spec.urgency.toUpperCase()}
4. Includes natural speech patterns (pauses indicated by "..." or "--")
5. Opens with identifying themselves briefly
6. Ends with a call to action or request
7. Reflects their role and personality
8. Creates emotional investment for MBA students making strategic decisions

Do NOT include stage directions, quotation marks, or formatting. Just the raw transcript as if transcribed from audio.

The voicemail should feel like a real message left on the player's phone, creating immersion and pressure.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.8,
    max_tokens: 300,
  });

  return response.choices[0].message.content?.trim() || '';
}

async function generateAllVoicemails() {
  console.log('🎙️ Generating triggered voicemails for weeks 1-8...\n');

  const voicemails: Array<{
    id: string;
    moduleId: string;
    characterId: string;
    weekNumber: number;
    title: string;
    triggerType: 'week_started';
    triggerCondition: null;
    audioUrl: null;
    transcript: string;
    duration: number;
    urgency: 'low' | 'medium' | 'high' | 'critical';
    expiresAfterMinutes: null;
    isActive: boolean;
  }> = [];

  for (const spec of voicemailSpecs) {
    console.log(`📞 Week ${spec.weekNumber}: ${spec.characterName} - "${spec.title}"`);
    
    try {
      const transcript = await generateVoicemailScript(spec);
      const wordCount = transcript.split(/\s+/).length;
      const estimatedDuration = Math.round(wordCount / 2.5); // ~2.5 words per second
      
      console.log(`   ✅ Generated ${wordCount} words (~${estimatedDuration}s)`);
      console.log(`   📝 Preview: "${transcript.substring(0, 80)}..."\n`);

      voicemails.push({
        id: randomUUID(),
        moduleId: 'apex-ai-transformation',
        characterId: spec.characterName.toLowerCase().replace(/\s+/g, '-'),
        weekNumber: spec.weekNumber,
        title: spec.title,
        triggerType: 'week_started',
        triggerCondition: null,
        audioUrl: null,
        transcript,
        duration: estimatedDuration,
        urgency: spec.urgency,
        expiresAfterMinutes: null,
        isActive: true,
      });
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`   ❌ Error generating voicemail for Week ${spec.weekNumber}:`, error);
    }
  }

  // Save to database
  console.log('\n💾 Saving voicemails to database...');
  
  for (const voicemail of voicemails) {
    try {
      await db.insert(triggeredVoicemails).values(voicemail);
      console.log(`   ✅ Saved: Week ${voicemail.weekNumber} - ${voicemail.title}`);
    } catch (error: any) {
      if (error.message?.includes('duplicate')) {
        console.log(`   ⏭️ Skipped (exists): Week ${voicemail.weekNumber}`);
      } else {
        console.error(`   ❌ Error saving:`, error.message);
      }
    }
  }

  // Also save to JSON for backup
  const fs = await import('fs');
  const outputPath = 'server/content/voicemails.json';
  
  // Ensure directory exists
  const dir = 'server/content';
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(outputPath, JSON.stringify(voicemails, null, 2));
  console.log(`\n📁 Backup saved to ${outputPath}`);
  
  console.log('\n✨ Voicemail generation complete!');
  console.log(`   Generated ${voicemails.length} voicemails for weeks 1-8`);
  
  return voicemails;
}

// Run generation
generateAllVoicemails()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
