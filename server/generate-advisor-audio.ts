// Generate advisor audio using ElevenLabs TTS
import fs from 'fs';
import path from 'path';
import { db } from './db';
import { advisors } from '@shared/models/auth';
import { eq } from 'drizzle-orm';
import { textToSpeech } from './lib/elevenlabs';

async function generateAdvisorAudio() {
  console.log('🎙️ Generating advisor audio files using ElevenLabs TTS...\n');

  const outputDir = 'client/public/audio/advisors';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`📁 Created directory: ${outputDir}\n`);
  }

  const allAdvisors = await db.select().from(advisors);
  
  if (allAdvisors.length === 0) {
    console.log('❌ No advisors found in database. Run generate-advisors.ts first.');
    return;
  }

  console.log(`Found ${allAdvisors.length} advisors to process\n`);

  for (const advisor of allAdvisors) {
    const outputPath = path.join(outputDir, `${advisor.id}.mp3`);
    const audioUrl = `/audio/advisors/${advisor.id}.mp3`;
    
    console.log(`📞 ${advisor.name} (${advisor.category})`);
    console.log(`   Title: ${advisor.title}`);
    console.log(`   Voice: ${advisor.voiceName} (${advisor.voiceId})`);
    
    if (!advisor.voiceId) {
      console.log(`   ⏭️ No voice ID configured, skipping`);
      continue;
    }

    if (!advisor.transcript) {
      console.log(`   ⏭️ No transcript, skipping`);
      continue;
    }
    
    try {
      const audioBuffer = await textToSpeech(
        advisor.transcript,
        advisor.voiceId
      );

      fs.writeFileSync(outputPath, audioBuffer);
      console.log(`   ✓ Generated audio: ${outputPath}`);

      // Update database with audio URL
      await db.update(advisors)
        .set({ audioUrl, updatedAt: new Date() })
        .where(eq(advisors.id, advisor.id));
      
      console.log(`   ✓ Updated database with audio URL`);

    } catch (error) {
      console.error(`   ✗ Error generating audio for ${advisor.name}:`, error);
    }
    
    console.log('');
  }

  console.log('✅ Advisor audio generation complete!');
}

generateAdvisorAudio().catch(console.error);
