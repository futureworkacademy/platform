/**
 * Content Consistency Validation Service
 * 
 * Exportable validation functions for use by CLI and API.
 * Validates all content (docs + database) against canonical.json source.
 */

import * as fs from 'fs';
import * as path from 'path';
import { db } from './db';
import { characterProfiles, simulationContent } from '@shared/schema';

export interface ValidationResult {
  type: 'error' | 'warning' | 'info';
  source: string;
  message: string;
  category: 'character' | 'company' | 'week' | 'competitor' | 'content' | 'system';
  line?: number;
}

export interface ValidationReport {
  timestamp: string;
  canonical: {
    company: string;
    characterCount: number;
    weekCount: number;
    competitorCount: number;
  };
  results: ValidationResult[];
  summary: {
    errors: number;
    warnings: number;
    info: number;
    passed: boolean;
  };
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

/**
 * Load canonical data from docs/canonical.json
 */
export function loadCanonicalData(): CanonicalData | null {
  const canonicalPath = path.join(process.cwd(), 'docs', 'canonical.json');
  
  if (!fs.existsSync(canonicalPath)) {
    return null;
  }
  
  try {
    const content = fs.readFileSync(canonicalPath, 'utf-8');
    return JSON.parse(content) as CanonicalData;
  } catch {
    return null;
  }
}

/**
 * Validate STORY_BIBLE.md against canonical.json
 */
function validateStoryBible(canon: CanonicalData, results: ValidationResult[]): void {
  const storyBiblePath = path.join(process.cwd(), 'docs', 'STORY_BIBLE.md');
  
  if (!fs.existsSync(storyBiblePath)) {
    results.push({
      type: 'error',
      source: 'STORY_BIBLE.md',
      message: 'STORY_BIBLE.md not found in docs/ directory',
      category: 'system'
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
      message: `Company name "${canon.company.name}" mentioned only ${companyMentions?.length || 0} times. Expected frequent usage.`,
      category: 'company'
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
      message: `Missing canonical characters: ${missingCharacters.join(', ')}`,
      category: 'character'
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
        message: `Week count mismatch: STORY_BIBLE says ${storyBibleWeeks}, canonical.json says ${canon.simulation.totalWeeks}`,
        category: 'week'
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
      message: `Missing week titles for weeks: ${missingWeeks.join(', ')}`,
      category: 'week'
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
      message: `Missing competitor companies: ${missingCompetitors.join(', ')}`,
      category: 'competitor'
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
        message: `Revenue mismatch: STORY_BIBLE says $${storyRevenue.toLocaleString()}, canonical.json says $${canon.company.annualRevenue.toLocaleString()}`,
        category: 'company'
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
        message: `Employee count mismatch: STORY_BIBLE says ${storyEmployees.toLocaleString()}, canonical.json says ${canon.company.employees.toLocaleString()}`,
        category: 'company'
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
      message: `Missing research report titles: ${missingReports.join(', ')}`,
      category: 'content'
    });
  }
  
  results.push({
    type: 'info',
    source: 'STORY_BIBLE.md',
    message: 'STORY_BIBLE.md validated against canonical.json',
    category: 'system'
  });
}

/**
 * Validate all markdown files in docs directory
 */
function validateAllDocs(canon: CanonicalData, results: ValidationResult[]): void {
  const docsPath = path.join(process.cwd(), 'docs');
  
  if (!fs.existsSync(docsPath)) {
    results.push({
      type: 'error',
      source: 'System',
      message: 'docs/ directory not found',
      category: 'system'
    });
    return;
  }
  
  const files = fs.readdirSync(docsPath).filter(f => f.endsWith('.md'));
  
  files.forEach(file => {
    if (file === 'STORY_BIBLE.md') return;
    
    const filePath = path.join(docsPath, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      
      // Check for incorrect company names
      const isExampleLine = /example|e\.g\.|should be|expected|incorrect|wrong/i.test(line);
      if (!isExampleLine && /\b(meridian|acme)\s*(manufacturing|industries)?/i.test(line)) {
        results.push({
          type: 'error',
          source: `${file}:${lineNum}`,
          message: `Possible wrong company name. Expected "${canon.company.name}"`,
          category: 'company',
          line: lineNum
        });
      }
      
      // Check for week number references
      const weekMatch = line.match(/\bweek\s+(\d+)\b/gi);
      if (weekMatch) {
        weekMatch.forEach(match => {
          const weekNum = parseInt(match.replace(/week\s+/i, ''));
          if (weekNum < 0 || weekNum > canon.simulation.totalWeeks) {
            results.push({
              type: 'error',
              source: `${file}:${lineNum}`,
              message: `Invalid week number: ${weekNum}. Valid range is 0-${canon.simulation.totalWeeks}.`,
              category: 'week',
              line: lineNum
            });
          }
        });
      }
    });
  });
  
  results.push({
    type: 'info',
    source: 'Docs',
    message: `Scanned ${files.length} markdown files in docs/`,
    category: 'system'
  });
}

/**
 * Validate database content against canonical data
 */
async function validateDatabase(canon: CanonicalData, results: ValidationResult[]): Promise<void> {
  try {
    // Check character profiles
    const characters = await db.select().from(characterProfiles);
    
    if (characters.length === 0) {
      results.push({
        type: 'warning',
        source: 'Database',
        message: 'character_profiles table is empty. No characters have been created yet.',
        category: 'character'
      });
    } else {
      results.push({
        type: 'info',
        source: 'Database',
        message: `Found ${characters.length} character(s) in database`,
        category: 'character'
      });
      
      // Build set of canonical names
      const canonicalNames = new Set(canon.characters.map(c => c.name));
      
      // Check if database character names match canonical list
      characters.forEach(char => {
        if (!canonicalNames.has(char.name)) {
          results.push({
            type: 'warning',
            source: `character_profiles.${char.id}`,
            message: `Character "${char.name}" not found in canonical.json. May need to be added or is misspelled.`,
            category: 'character'
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
            message: `Canonical character "${canonChar.name}" not found in database`,
            category: 'character'
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
        message: 'simulation_content table is empty. No briefings/reports have been created yet.',
        category: 'content'
      });
    } else {
      results.push({
        type: 'info',
        source: 'Database',
        message: `Found ${content.length} simulation content item(s) in database`,
        category: 'content'
      });
      
      // Check week numbers in content
      content.forEach(item => {
        if (item.weekNumber !== null && (item.weekNumber < 0 || item.weekNumber > canon.simulation.totalWeeks)) {
          results.push({
            type: 'error',
            source: `simulation_content.${item.id}`,
            message: `Invalid week number: ${item.weekNumber}. Valid range is 0-${canon.simulation.totalWeeks}.`,
            category: 'week'
          });
        }
      });
    }
    
  } catch (error) {
    results.push({
      type: 'error',
      source: 'Database',
      message: `Database connection error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      category: 'system'
    });
  }
}

/**
 * Run full validation and return structured report
 */
export async function runValidation(): Promise<ValidationReport> {
  const results: ValidationResult[] = [];
  
  // Load canonical data
  const canon = loadCanonicalData();
  
  if (!canon) {
    results.push({
      type: 'error',
      source: 'System',
      message: 'docs/canonical.json not found or could not be parsed',
      category: 'system'
    });
    
    return {
      timestamp: new Date().toISOString(),
      canonical: {
        company: 'Unknown',
        characterCount: 0,
        weekCount: 0,
        competitorCount: 0
      },
      results,
      summary: {
        errors: 1,
        warnings: 0,
        info: 0,
        passed: false
      }
    };
  }
  
  // Run all validations
  validateStoryBible(canon, results);
  validateAllDocs(canon, results);
  await validateDatabase(canon, results);
  
  // Calculate summary
  const errors = results.filter(r => r.type === 'error').length;
  const warnings = results.filter(r => r.type === 'warning').length;
  const info = results.filter(r => r.type === 'info').length;
  
  return {
    timestamp: new Date().toISOString(),
    canonical: {
      company: canon.company.name,
      characterCount: canon.characters.length,
      weekCount: canon.simulation.totalWeeks,
      competitorCount: canon.competitors.length
    },
    results,
    summary: {
      errors,
      warnings,
      info,
      passed: errors === 0
    }
  };
}
