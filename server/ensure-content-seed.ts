import { db } from "./db";
import { triggeredVoicemails, advisors, simulationContent } from "@shared/models/auth";
import { sql } from "drizzle-orm";
import { log } from "./index";
import voicemailSeedData from "./data/voicemails-seed.json";
import advisorSeedData from "./data/advisors-seed.json";
import simulationContentSeedData from "./data/simulation-content-seed.json";

export async function ensureContentSeed() {
  await seedVoicemails();
  await seedAdvisors();
  await seedSimulationContent();
}

async function seedVoicemails() {
  try {
    const result = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(triggeredVoicemails);
    const count = result[0]?.count ?? 0;

    if (count > 0) {
      log(`Voicemails table has ${count} rows, skipping seed`, "seed");
      return;
    }

    log(`Voicemails table is empty, seeding ${voicemailSeedData.length} voicemails...`, "seed");

    for (const raw of voicemailSeedData) {
      await db.insert(triggeredVoicemails).values({
        id: raw.id,
        moduleId: raw.module_id,
        characterId: raw.character_id,
        weekNumber: raw.week_number,
        title: raw.title,
        triggerType: raw.trigger_type,
        triggerCondition: raw.trigger_condition,
        audioUrl: raw.audio_url,
        transcript: raw.transcript,
        duration: raw.duration,
        urgency: raw.urgency,
        expiresAfterMinutes: raw.expires_after_minutes,
        isActive: raw.is_active,
      });
    }

    log(`Successfully seeded ${voicemailSeedData.length} voicemails`, "seed");
  } catch (error: any) {
    log(`Error seeding voicemails: ${error.message}`, "seed");
  }
}

async function seedAdvisors() {
  try {
    const result = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(advisors);
    const count = result[0]?.count ?? 0;

    if (count > 0) {
      log(`Advisors table has ${count} rows, skipping seed`, "seed");
      return;
    }

    log(`Advisors table is empty, seeding ${advisorSeedData.length} advisors...`, "seed");

    for (const raw of advisorSeedData) {
      await db.insert(advisors).values({
        id: raw.id,
        name: raw.name,
        category: raw.category,
        title: raw.title,
        organization: raw.organization,
        specialty: raw.specialty,
        bio: raw.bio,
        transcript: raw.transcript,
        audioUrl: raw.audio_url,
        voiceId: raw.voice_id,
        voiceName: raw.voice_name,
        keyInsights: raw.key_insights,
        headshotUrl: raw.headshot_url,
        isActive: raw.is_active,
      });
    }

    log(`Successfully seeded ${advisorSeedData.length} advisors`, "seed");
  } catch (error: any) {
    log(`Error seeding advisors: ${error.message}`, "seed");
  }
}

async function seedSimulationContent() {
  try {
    const result = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(simulationContent);
    const count = result[0]?.count ?? 0;

    if (count > 0) {
      log(`Simulation content table has ${count} rows, skipping seed`, "seed");
      return;
    }

    log(`Simulation content table is empty, seeding ${simulationContentSeedData.length} entries...`, "seed");

    for (const raw of simulationContentSeedData) {
      await db.insert(simulationContent).values({
        id: raw.id,
        moduleId: raw.module_id,
        weekNumber: raw.week_number,
        title: raw.title,
        contentType: raw.content_type,
        content: raw.content,
        embedUrl: raw.embed_url,
        resourceUrl: raw.resource_url,
        thumbnailUrl: raw.thumbnail_url,
        order: raw.order,
        isActive: raw.is_active,
        createdBy: raw.created_by,
        updatedBy: raw.updated_by,
        mediaUrl: raw.media_url,
        mediaDurationSeconds: raw.media_duration_seconds,
        transcript: raw.transcript,
        transcriptTimestamps: raw.transcript_timestamps,
        category: raw.category,
        isIntelContent: raw.is_intel_content,
      });
    }

    log(`Successfully seeded ${simulationContentSeedData.length} simulation content entries`, "seed");
  } catch (error: any) {
    log(`Error seeding simulation content: ${error.message}`, "seed");
  }
}
