import { db } from "./db";
import { characterProfiles } from "@shared/models/auth";
import { sql } from "drizzle-orm";
import { log } from "./index";
import seedData from "./data/character-profiles-seed.json";

const REQUIRED_CHARACTERS = [
  "David Okonkwo",
  "Dr. Priya Kapoor",
  "Marcus Washington",
  "Robert Kim",
  "Sarah Mitchell",
];

async function insertCharacter(raw: (typeof seedData)[number]) {
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

export async function ensureCharactersSeed() {
  try {
    const result = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(characterProfiles);
    const count = result[0]?.count ?? 0;

    if (count > 0) {
      log(`Character profiles table has ${count} rows, checking for missing characters...`, "seed");

      const existing = await db
        .select({ name: characterProfiles.name })
        .from(characterProfiles);
      const existingNames = new Set(existing.map((c) => c.name));

      for (const charName of REQUIRED_CHARACTERS) {
        if (!existingNames.has(charName)) {
          const record = seedData.find((c) => c.name === charName);
          if (record) {
            log(`Adding missing character: ${charName}`, "seed");
            await insertCharacter(record);
            log(`Successfully added ${charName}`, "seed");
          }
        }
      }
      return;
    }

    log(
      `Character profiles table is empty, seeding ${seedData.length} characters...`,
      "seed",
    );

    for (const raw of seedData) {
      await insertCharacter(raw);
    }

    log(
      `Successfully seeded ${seedData.length} character profiles`,
      "seed",
    );
  } catch (error: any) {
    log(`Error seeding character profiles: ${error.message}`, "seed");
  }
}
