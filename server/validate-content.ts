/**
 * Content Consistency Validation Script
 * 
 * Validates all content (docs + database) against the canonical.json source.
 * Run with: npx tsx server/validate-content.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { db } from './db';
import { characterProfiles, simulationContent } from '@shared/schema';

interface ValidationResult {
  type: 'error' | 'warning' | 'info';
  source: string;
  message: string;
  line?: number;
}

interface CanonicalCharacter {
  name: string;
  role: string;
  influence: number;
  hostility: number;
  nickname?: string;
}

interface CanonicalWeek {
  number: number;
  title: string;
  theme: string;
}

interface CanonicalData {
  company: {
    name: string;
    industry: string;
    employees: number;
    annualRevenue: number;
  };
  simulation: {
    totalWeeks: number;
  };
  weeks: CanonicalWeek[];
  characters: CanonicalCharacter[];
  competitors: { name: string; approach: string; outcome: string }[];
  researchReports: { number: number; title: string; readingTime: string }[];
  advisors: string[];
}

const results: ValidationResult[] = [];

/**
 * Load canonical data from docs/canonical.json
 */
function loadCanonicalData(): CanonicalData {
  const canonicalPath = path.join(process.cwd(), 'docs', 'canonical.json');
  
  if (!fs.existsSync(canonicalPath)) {
    console.error('ERROR: docs/canonical.json not found at', canonicalPath);
    console.error('This file is the source of truth for all simulation content.');
    process.exit(1);
  }
  
  try {
    const content = fs.readFileSync(canonicalPath, 'utf-8');
    return JSON.parse(content) as CanonicalData;
  } catch (error) {
    console.error('ERROR: Failed to parse docs/canonical.json:', error);
    process.exit(1);
  }
}

/**
 * Scan a markdown file for consistency issues
 */
function validateMarkdownFile(filePath: string, canon: CanonicalData): void {
  if (!fs.existsSync(filePath)) return;
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const fileName = path.basename(filePath);
  
  // Skip canonical files themselves
  if (fileName === 'STORY_BIBLE.md' || fileName === 'canonical.json') return;
  
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    
    // Check for incorrect company names (common mistakes)
    // But exclude lines that are clearly examples or documentation about validation
    const isExampleLine = /example|e\.g\.|should be|expected|incorrect|wrong/i.test(line);
    if (!isExampleLine && /\b(meridian|acme)\s*(manufacturing|industries)?/i.test(line)) {
      results.push({
        type: 'error',
        source: `${fileName}:${lineNum}`,
        message: `Possible wrong company name. Expected "${canon.company.name}"`,
        line: lineNum
      });
    }
    
    // Check for week number references
    const weekMatch = line.match(/\bweek\s+(\d+)\b/gi);
    if (weekMatch) {
      weekMatch.forEach(match => {
        const weekNum = parseInt(match.replace(/week\s+/i, ''));
        // Allow 0 for pre-game and 1-8 for simulation weeks
        if (weekNum < 0 || weekNum > canon.simulation.totalWeeks) {
          results.push({
            type: 'error',
            source: `${fileName}:${lineNum}`,
            message: `Invalid week number: ${weekNum}. Valid range is 0-${canon.simulation.totalWeeks}.`,
            line: lineNum
          });
        }
      });
    }
  });
}

/**
 * Validate STORY_BIBLE.md against canonical.json
 */
function validateStoryBible(canon: CanonicalData): void {
  const storyBiblePath = path.join(process.cwd(), 'docs', 'STORY_BIBLE.md');
  
  if (!fs.existsSync(storyBiblePath)) {
    results.push({
      type: 'error',
      source: 'STORY_BIBLE.md',
      message: 'STORY_BIBLE.md not found in docs/ directory'
    });
    return;
  }
  
  const content = fs.readFileSync(storyBiblePath, 'utf-8');
  
  // Check company name is mentioned correctly
  const companyNameRegex = new RegExp(canon.company.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
  const companyMentions = content.match(companyNameRegex);
  if (!companyMentions || companyMentions.length < 5) {
    results.push({
      type: 'warning',
      source: 'STORY_BIBLE.md',
      message: `Company name "${canon.company.name}" mentioned only ${companyMentions?.length || 0} times. Expected frequent usage.`
    });
  }
  
  // Check all canonical characters are mentioned
  const missingCharacters: string[] = [];
  canon.characters.forEach(char => {
    if (!content.includes(char.name)) {
      missingCharacters.push(char.name);
    }
  });
  
  if (missingCharacters.length > 0) {
    results.push({
      type: 'error',
      source: 'STORY_BIBLE.md',
      message: `Missing canonical characters: ${missingCharacters.join(', ')}`
    });
  }
  
  // Check week count matches
  const weekCountMatch = content.match(/Total Weeks\s*\|\s*(\d+)/);
  if (weekCountMatch) {
    const storyBibleWeeks = parseInt(weekCountMatch[1]);
    if (storyBibleWeeks !== canon.simulation.totalWeeks) {
      results.push({
        type: 'error',
        source: 'STORY_BIBLE.md',
        message: `Week count mismatch: STORY_BIBLE says ${storyBibleWeeks}, canonical.json says ${canon.simulation.totalWeeks}`
      });
    }
  }
  
  // Check all week titles are present
  const missingWeeks: number[] = [];
  canon.weeks.forEach(week => {
    if (!content.includes(week.title)) {
      missingWeeks.push(week.number);
    }
  });
  
  if (missingWeeks.length > 0) {
    results.push({
      type: 'error',
      source: 'STORY_BIBLE.md',
      message: `Missing week titles for weeks: ${missingWeeks.join(', ')}`
    });
  }
  
  // Check competitor names are present
  const missingCompetitors: string[] = [];
  canon.competitors.forEach(comp => {
    if (!content.includes(comp.name)) {
      missingCompetitors.push(comp.name);
    }
  });
  
  if (missingCompetitors.length > 0) {
    results.push({
      type: 'error',
      source: 'STORY_BIBLE.md',
      message: `Missing competitor companies: ${missingCompetitors.join(', ')}`
    });
  }
  
  // Check company metrics match
  const revenueMatch = content.match(/Annual Revenue[^\d]*\$?([\d,]+)/i);
  if (revenueMatch) {
    const storyRevenue = parseInt(revenueMatch[1].replace(/,/g, ''));
    if (storyRevenue !== canon.company.annualRevenue) {
      results.push({
        type: 'error',
        source: 'STORY_BIBLE.md',
        message: `Revenue mismatch: STORY_BIBLE says $${storyRevenue.toLocaleString()}, canonical.json says $${canon.company.annualRevenue.toLocaleString()}`
      });
    }
  }
  
  const employeesMatch = content.match(/Employees[^\d]*\|([\d,]+)/i);
  if (employeesMatch) {
    const storyEmployees = parseInt(employeesMatch[1].replace(/,/g, ''));
    if (storyEmployees !== canon.company.employees) {
      results.push({
        type: 'error',
        source: 'STORY_BIBLE.md',
        message: `Employee count mismatch: STORY_BIBLE says ${storyEmployees.toLocaleString()}, canonical.json says ${canon.company.employees.toLocaleString()}`
      });
    }
  }
  
  // Check research report titles are present
  const missingReports: string[] = [];
  canon.researchReports.forEach(report => {
    if (!content.includes(report.title)) {
      missingReports.push(report.title);
    }
  });
  
  if (missingReports.length > 0) {
    results.push({
      type: 'error',
      source: 'STORY_BIBLE.md',
      message: `Missing research report titles: ${missingReports.join(', ')}`
    });
  }
  
  results.push({
    type: 'info',
    source: 'STORY_BIBLE.md',
    message: 'STORY_BIBLE.md validated against canonical.json'
  });
}

/**
 * Validate all markdown files in docs directory
 */
function validateAllDocs(canon: CanonicalData): void {
  const docsPath = path.join(process.cwd(), 'docs');
  
  if (!fs.existsSync(docsPath)) {
    results.push({
      type: 'error',
      source: 'System',
      message: 'docs/ directory not found'
    });
    return;
  }
  
  const files = fs.readdirSync(docsPath).filter(f => f.endsWith('.md'));
  
  files.forEach(file => {
    validateMarkdownFile(path.join(docsPath, file), canon);
  });
  
  results.push({
    type: 'info',
    source: 'Docs',
    message: `Scanned ${files.length} markdown files in docs/`
  });
}

/**
 * Validate database content against canonical data
 */
async function validateDatabase(canon: CanonicalData): Promise<void> {
  try {
    // Check character profiles
    const characters = await db.select().from(characterProfiles);
    
    if (characters.length === 0) {
      results.push({
        type: 'warning',
        source: 'Database',
        message: 'character_profiles table is empty. No characters have been created yet.'
      });
    } else {
      results.push({
        type: 'info',
        source: 'Database',
        message: `Found ${characters.length} character(s) in database`
      });
      
      // Build set of canonical names
      const canonicalNames = new Set(canon.characters.map(c => c.name));
      
      // Check if database character names match canonical list
      characters.forEach(char => {
        if (!canonicalNames.has(char.name)) {
          results.push({
            type: 'warning',
            source: `character_profiles.${char.id}`,
            message: `Character "${char.name}" not found in canonical.json. May need to be added or is misspelled.`
          });
        }
      });
      
      // Check for missing characters
      const dbCharNames = new Set(characters.map(c => c.name));
      canon.characters.forEach(canonChar => {
        if (!dbCharNames.has(canonChar.name)) {
          results.push({
            type: 'warning',
            source: 'Database',
            message: `Canonical character "${canonChar.name}" not found in database`
          });
        }
      });
    }
    
    // Check simulation content
    const content = await db.select().from(simulationContent);
    
    if (content.length === 0) {
      results.push({
        type: 'warning',
        source: 'Database',
        message: 'simulation_content table is empty. No briefings/reports have been created yet.'
      });
    } else {
      results.push({
        type: 'info',
        source: 'Database',
        message: `Found ${content.length} simulation content item(s) in database`
      });
      
      // Check week numbers in content
      content.forEach(item => {
        if (item.weekNumber !== null && (item.weekNumber < 0 || item.weekNumber > canon.simulation.totalWeeks)) {
          results.push({
            type: 'error',
            source: `simulation_content.${item.id}`,
            message: `Invalid week number: ${item.weekNumber}. Valid range is 0-${canon.simulation.totalWeeks}.`
          });
        }
      });
    }
    
  } catch (error) {
    results.push({
      type: 'error',
      source: 'Database',
      message: `Database connection error: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
}

/**
 * Print results summary
 */
function printResults(): void {
  console.log('\n' + '='.repeat(60));
  console.log('CONTENT CONSISTENCY VALIDATION REPORT');
  console.log('='.repeat(60) + '\n');
  
  const errors = results.filter(r => r.type === 'error');
  const warnings = results.filter(r => r.type === 'warning');
  const infos = results.filter(r => r.type === 'info');
  
  // Print errors first
  if (errors.length > 0) {
    console.log('ERRORS (' + errors.length + ')');
    console.log('-'.repeat(40));
    errors.forEach(r => {
      console.log(`  [${r.source}] ${r.message}`);
    });
    console.log('');
  }
  
  // Print warnings
  if (warnings.length > 0) {
    console.log('WARNINGS (' + warnings.length + ')');
    console.log('-'.repeat(40));
    warnings.forEach(r => {
      console.log(`  [${r.source}] ${r.message}`);
    });
    console.log('');
  }
  
  // Print info
  if (infos.length > 0) {
    console.log('INFO (' + infos.length + ')');
    console.log('-'.repeat(40));
    infos.forEach(r => {
      console.log(`  [${r.source}] ${r.message}`);
    });
    console.log('');
  }
  
  // Summary
  console.log('='.repeat(60));
  console.log('SUMMARY');
  console.log('-'.repeat(40));
  console.log(`  Errors:   ${errors.length}`);
  console.log(`  Warnings: ${warnings.length}`);
  console.log(`  Info:     ${infos.length}`);
  console.log('='.repeat(60));
  
  if (errors.length > 0) {
    console.log('\nValidation FAILED - Please fix errors above.');
    process.exit(1);
  } else if (warnings.length > 0) {
    console.log('\nValidation PASSED with warnings.');
    process.exit(0);
  } else {
    console.log('\nValidation PASSED.');
    process.exit(0);
  }
}

/**
 * Main validation runner
 */
async function main(): Promise<void> {
  console.log('Starting content consistency validation...\n');
  console.log('Canonical Source: docs/canonical.json\n');
  
  // Load canonical data from JSON file
  const canon = loadCanonicalData();
  console.log(`Company: ${canon.company.name}`);
  console.log(`Loaded ${canon.characters.length} canonical characters`);
  console.log(`Loaded ${canon.simulation.totalWeeks} weeks of simulation`);
  console.log(`Loaded ${canon.competitors.length} competitor companies\n`);
  
  // Validate Story Bible against canonical.json
  console.log('Validating STORY_BIBLE.md against canonical.json...');
  validateStoryBible(canon);
  
  // Validate docs
  console.log('Scanning documentation files...');
  validateAllDocs(canon);
  
  // Validate database
  console.log('Checking database content...');
  await validateDatabase(canon);
  
  // Print results
  printResults();
}

// Run if called directly
main().catch(error => {
  console.error('Validation failed with error:', error);
  process.exit(1);
});
