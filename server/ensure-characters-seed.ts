import { db } from "./db";
import { characterProfiles } from "@shared/models/auth";
import { sql } from "drizzle-orm";
import { log } from "./index";
import seedData from "./data/character-profiles-seed.json";

export async function ensureCharactersSeed() {
  try {
    const result = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(characterProfiles);
    const count = result[0]?.count ?? 0;

    if (count > 0) {
      log(`Character profiles table has ${count} rows, checking for missing characters...`, "seed");
      // Check if David Okonkwo is present
      const davidExists = await db
        .select({ id: characterProfiles.id })
        .from(characterProfiles)
        .where(sql`${characterProfiles.name} = 'David Okonkwo'`);
      
      if (davidExists.length === 0) {
        const davidRecord = seedData.find(c => c.name === "David Okonkwo");
        if (davidRecord) {
          log("Adding missing character: David Okonkwo", "seed");
          await db.insert(characterProfiles).values({
            id: davidRecord.id,
            moduleId: davidRecord.module_id,
            name: davidRecord.name,
            role: davidRecord.role,
            title: davidRecord.title,
            company: davidRecord.company,
            headshotUrl: davidRecord.headshot_url,
            headshotPrompt: davidRecord.headshot_prompt,
            bio: davidRecord.bio,
            personality: davidRecord.personality,
            communicationStyle: davidRecord.communication_style,
            motivations: davidRecord.motivations,
            fears: davidRecord.fears,
            relationships: davidRecord.relationships,
            voiceDescription: davidRecord.voice_description,
            voiceId: davidRecord.voice_id,
            voiceProfile: davidRecord.voice_profile,
            speakingStyleExamples: davidRecord.speaking_style_examples,
            socialProfile: davidRecord.social_profile,
            influence: davidRecord.influence,
            hostility: davidRecord.hostility,
            flexibility: davidRecord.flexibility,
            riskTolerance: davidRecord.risk_tolerance,
            impactCategories: davidRecord.impact_categories,
            isActive: davidRecord.is_active,
            sortOrder: davidRecord.sort_order,
            createdBy: davidRecord.created_by,
          });
          log("Successfully added David Okonkwo", "seed");
        }
      }
      return;
    }

    log(
      `Character profiles table is empty, seeding ${seedData.length} characters...`,
      "seed",
    );

    for (const raw of seedData) {
      await db.insert(characterProfiles).values({
        id: raw.id,
        moduleId: raw.module_id,
        name: raw.name,
        role: raw.role,
        title: raw.title,
        company: raw.company,
        headshotUrl: raw.headshot_url,
        headshotPrompt: raw.headshot_prompt,
        bio: raw.bio,
        personality: raw.personality,
        communicationStyle: raw.communication_style,
        motivations: raw.motivations,
        fears: raw.fears,
        relationships: raw.relationships,
        voiceDescription: raw.voice_description,
        voiceId: raw.voice_id,
        voiceProfile: raw.voice_profile,
        speakingStyleExamples: raw.speaking_style_examples,
        socialProfile: raw.social_profile,
        influence: raw.influence,
        hostility: raw.hostility,
        flexibility: raw.flexibility,
        riskTolerance: raw.risk_tolerance,
        impactCategories: raw.impact_categories,
        isActive: raw.is_active,
        sortOrder: raw.sort_order,
        createdBy: raw.created_by,
      });
    }

    log(
      `Successfully seeded ${seedData.length} character profiles`,
      "seed",
    );
  } catch (error: any) {
    log(`Error seeding character profiles: ${error.message}`, "seed");
  }
}
