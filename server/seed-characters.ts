import fs from 'fs';
import path from 'path';
import { eq } from 'drizzle-orm';
import { db } from './db';
import { characterProfiles } from '@shared/models/auth';

interface CanonicalCharacter {
  name: string;
  role: string;
  influence: number;
  hostility: number;
  nickname?: string;
}

interface CanonicalData {
  company: { name: string };
  characters: CanonicalCharacter[];
}

async function seedCharacters(): Promise<void> {
  console.log('Loading canonical data from docs/canonical.json...\n');
  
  const canonPath = path.join(process.cwd(), 'docs', 'canonical.json');
  
  if (!fs.existsSync(canonPath)) {
    console.error('ERROR: docs/canonical.json not found');
    process.exit(1);
  }
  
  const canon: CanonicalData = JSON.parse(fs.readFileSync(canonPath, 'utf-8'));
  
  console.log(`Company: ${canon.company.name}`);
  console.log(`Characters to seed: ${canon.characters.length}\n`);
  
  let created = 0;
  let skipped = 0;
  
  for (const char of canon.characters) {
    const existing = await db.select()
      .from(characterProfiles)
      .where(eq(characterProfiles.name, char.name))
      .limit(1);
    
    if (existing.length > 0) {
      console.log(`  SKIP: ${char.name} (already exists)`);
      skipped++;
      continue;
    }
    
    await db.insert(characterProfiles).values({
      name: char.name,
      role: char.role,
      company: canon.company.name,
      influence: char.influence,
      hostility: char.hostility,
      flexibility: 5,
      riskTolerance: 5,
    });
    
    console.log(`  CREATE: ${char.name} (${char.role})`);
    created++;
  }
  
  console.log('\n' + '='.repeat(40));
  console.log(`Created: ${created}`);
  console.log(`Skipped: ${skipped}`);
  console.log('='.repeat(40));
  
  process.exit(0);
}

seedCharacters().catch(error => {
  console.error('Seeding failed:', error);
  process.exit(1);
});
