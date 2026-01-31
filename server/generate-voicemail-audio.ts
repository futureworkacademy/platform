// Generate voicemail audio using ElevenLabs TTS
import fs from 'fs';
import path from 'path';
import { db } from './db';
import { triggeredVoicemails } from '@shared/models/auth';
import { eq } from 'drizzle-orm';
import { textToSpeech } from './lib/elevenlabs';

interface VoicemailVoiceConfig {
  voiceId: string;
  voiceName: string;
  description: string;
}

// ElevenLabs voice mappings for each week's character
// These are ElevenLabs preset voices that match character profiles
const voicemailVoiceMapping: Record<number, VoicemailVoiceConfig> = {
  1: { 
    voiceId: 'EXAVITQu4vr4xnSDxMaL', // Sarah - British accent, authoritative
    voiceName: 'Sarah',
    description: 'Victoria Hartwell - commanding, patrician, Harvard-educated'
  },
  2: { 
    voiceId: 'XB0fDUnXU5powFXDhCwa', // Charlotte - warm, educated
    voiceName: 'Charlotte',
    description: 'Dr. Helen Mercer - academic warmth, New England accent'
  },
  3: { 
    voiceId: 'TxGEqnHWrfWFTfGW9XjX', // Josh - deep, working class
    voiceName: 'Josh',
    description: 'Marcus Webb - deep resonant, Detroit accent, passionate'
  },
  4: { 
    voiceId: 'pFZP5JQG7iQjIQuC4Bku', // Lily - warm, empathetic
    voiceName: 'Lily',
    description: 'Sandra Williams - warm, Southern warmth, empathetic'
  },
  5: { 
    voiceId: 'VR6AewLTigWG4xSOukaG', // Arnold - tired, experienced
    voiceName: 'Arnold',
    description: 'Frank Torres - gruff, Midwestern, Spanish influence'
  },
  6: { 
    voiceId: 'pNInz6obpgDQGcFmaJgB', // Adam - calm, analytical
    voiceName: 'Adam',
    description: 'David Chen - calm, measured, neutral American accent'
  },
  7: { 
    voiceId: 'jsCqWAovK2LkecY7zXl4', // Freya - confident, quick
    voiceName: 'Freya',
    description: 'Jennifer Park - confident, persuasive, fast-paced'
  },
  8: { 
    voiceId: 'onwK4e9ZLuTAKqWW03F9', // Daniel - commanding, inspirational
    voiceName: 'Daniel',
    description: 'Margaret O\'Brien - warm, authoritative, Midwestern'
  },
};

async function generateVoicemailAudio() {
  console.log('🎙️ Generating voicemail audio files using ElevenLabs TTS...\n');

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
    
    const voiceConfig = voicemailVoiceMapping[week];
    if (!voiceConfig) {
      console.log(`⏭️ No voice config for Week ${week}, skipping`);
      continue;
    }
    
    const outputPath = path.join(outputDir, `week-${week}-voicemail.mp3`);
    
    console.log(`📞 Week ${week}: "${voicemail.title}"`);
    console.log(`   Character: ${voiceConfig.description}`);
    console.log(`   Voice: ${voiceConfig.voiceName} (${voiceConfig.voiceId})`);
    
    try {
      const audioBuffer = await textToSpeech(
        voicemail.transcript,
        voiceConfig.voiceId
      );

      fs.writeFileSync(outputPath, audioBuffer);
      
      const fileSizeKB = Math.round(audioBuffer.length / 1024);
      const estimatedSeconds = Math.round(fileSizeKB / 16); // ~16KB per second for MP3
      console.log(`   ✅ Generated: ${outputPath} (${fileSizeKB}KB, ~${estimatedSeconds}s)`);

      await db.update(triggeredVoicemails)
        .set({ audioUrl: `/audio/voicemails/week-${week}-voicemail.mp3` })
        .where(eq(triggeredVoicemails.id, voicemail.id));
      
      console.log(`   💾 Updated database with audio URL\n`);

      // Rate limiting - ElevenLabs has limits
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error: any) {
      console.error(`   ❌ Error generating audio for Week ${week}:`, error.message);
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
