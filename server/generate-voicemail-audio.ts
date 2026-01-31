import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { db } from './db';
import { triggeredVoicemails } from '@shared/models/auth';
import { eq } from 'drizzle-orm';

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

interface VoicemailWithProfile {
  weekNumber: number;
  characterName: string;
  title: string;
  transcript: string;
  voiceId: OpenAI.Audio.Speech.SpeechCreateParams['voice'];
  voiceProfile: {
    pitch: string;
    pace: string;
    accent: string;
    tone: string;
    gender: string;
    ageRange: string;
  };
}

const voicemailVoiceMapping: Record<number, OpenAI.Audio.Speech.SpeechCreateParams['voice']> = {
  1: 'nova',     // Victoria Hartwell - commanding female
  2: 'shimmer',  // Dr. Helen Mercer - warm academic female  
  3: 'onyx',     // Marcus Webb - deep resonant male
  4: 'nova',     // Sandra Williams - warm empathetic female
  5: 'echo',     // Frank Torres - gruff male
  6: 'echo',     // David Chen - calm analytical male
  7: 'shimmer',  // Jennifer Park - confident quick female
  8: 'nova',     // Margaret O'Brien - warm authoritative female
};

async function generateVoicemailAudio() {
  console.log('🎙️ Generating voicemail audio files using OpenAI TTS...\n');

  const outputDir = 'client/public/audio/voicemails';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`📁 Created directory: ${outputDir}\n`);
  }

  const voicemails = await db.select().from(triggeredVoicemails).orderBy(triggeredVoicemails.weekNumber);
  
  if (voicemails.length === 0) {
    console.log('❌ No voicemails found in database. Run generate-voicemails.ts first.');
    return;
  }

  console.log(`Found ${voicemails.length} voicemails to process\n`);

  for (const voicemail of voicemails) {
    const week = voicemail.weekNumber;
    if (!week) continue;
    
    const voice = voicemailVoiceMapping[week] || 'alloy';
    const outputPath = path.join(outputDir, `week-${week}-voicemail.mp3`);
    
    console.log(`📞 Week ${week}: "${voicemail.title}"`);
    console.log(`   Voice: ${voice}`);
    
    try {
      const response = await openai.audio.speech.create({
        model: 'tts-1-hd',
        voice: voice,
        input: voicemail.transcript,
        speed: 1.0,
      });

      const buffer = Buffer.from(await response.arrayBuffer());
      fs.writeFileSync(outputPath, buffer);
      
      const fileSizeKB = Math.round(buffer.length / 1024);
      console.log(`   ✅ Generated: ${outputPath} (${fileSizeKB}KB)`);

      await db.update(triggeredVoicemails)
        .set({ audioUrl: `/audio/voicemails/week-${week}-voicemail.mp3` })
        .where(eq(triggeredVoicemails.id, voicemail.id));
      
      console.log(`   💾 Updated database with audio URL\n`);

      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error: any) {
      console.error(`   ❌ Error generating audio for Week ${week}:`, error.message);
      
      if (error.message?.includes('model') || error.message?.includes('not supported')) {
        console.log('   ⚠️ TTS model may not be available through AI Integrations.');
        console.log('   Try using gpt-audio model or ElevenLabs instead.\n');
      }
    }
  }

  console.log('\n✨ Voicemail audio generation complete!');
  console.log(`   Files saved to: ${outputDir}/`);
}

generateVoicemailAudio()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
