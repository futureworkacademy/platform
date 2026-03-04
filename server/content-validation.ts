/**
 * Content Consistency Validation Service
 * 
 * Exportable validation functions for use by CLI and API.
 * Validates all content (docs + database) against canonical.json source.
 */

import * as fs from 'fs';
import * as path from 'path';
import { db } from './db';
import { 
  characterProfiles, 
  simulationContent,
  triggeredVoicemails,
  advisors
} from '@shared/models/auth';

export interface ValidationResult {
  type: 'error' | 'warning' | 'info';
  source: string;
  message: string;
  category: 'character' | 'company' | 'week' | 'competitor' | 'content' | 'voicemail' | 'advisor' | 'briefing' | 'decision' | 'intel' | 'system';
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
 * Validate voicemails - check character associations and week assignments
 */
async function validateVoicemails(canon: CanonicalData, results: ValidationResult[]): Promise<void> {
  try {
    const voicemails = await db.select().from(triggeredVoicemails);
    const characters = await db.select().from(characterProfiles);
    
    if (voicemails.length === 0) {
      results.push({
        type: 'warning',
        source: 'Database',
        message: 'triggered_voicemails table is empty. No voicemails have been created yet.',
        category: 'voicemail'
      });
      return;
    }
    
    results.push({
      type: 'info',
      source: 'Database',
      message: `Found ${voicemails.length} voicemail(s) in database`,
      category: 'voicemail'
    });
    
    // Build character ID to name map
    const characterIdToName = new Map(characters.map(c => [c.id, c.name]));
    const canonicalNames = new Set(canon.characters.map(c => c.name));
    
    // Validate each voicemail
    for (const vm of voicemails) {
      // Check week number is valid
      if (vm.weekNumber !== null && (vm.weekNumber < 0 || vm.weekNumber > canon.simulation.totalWeeks)) {
        results.push({
          type: 'error',
          source: `voicemail.${vm.id}`,
          message: `Invalid week number ${vm.weekNumber} for voicemail "${vm.title}". Valid range is 0-${canon.simulation.totalWeeks}.`,
          category: 'voicemail'
        });
      }
      
      // Check character exists and is canonical
      const charName = characterIdToName.get(vm.characterId);
      if (!charName) {
        results.push({
          type: 'error',
          source: `voicemail.${vm.id}`,
          message: `Voicemail "${vm.title}" references non-existent character ID: ${vm.characterId}`,
          category: 'voicemail'
        });
      } else if (!canonicalNames.has(charName)) {
        results.push({
          type: 'warning',
          source: `voicemail.${vm.id}`,
          message: `Voicemail "${vm.title}" is from character "${charName}" which is not in canonical.json`,
          category: 'voicemail'
        });
      }
      
      // Check transcript exists
      if (!vm.transcript || vm.transcript.trim().length === 0) {
        results.push({
          type: 'error',
          source: `voicemail.${vm.id}`,
          message: `Voicemail "${vm.title}" has no transcript`,
          category: 'voicemail'
        });
      }
      
      // Check audio URL exists for active voicemails
      if (vm.isActive && !vm.audioUrl) {
        results.push({
          type: 'warning',
          source: `voicemail.${vm.id}`,
          message: `Active voicemail "${vm.title}" has no audio URL`,
          category: 'voicemail'
        });
      }
    }
  } catch (error) {
    results.push({
      type: 'error',
      source: 'Voicemails',
      message: `Error validating voicemails: ${error instanceof Error ? error.message : 'Unknown error'}`,
      category: 'system'
    });
  }
}

/**
 * Validate weekly briefings - check character names and week themes
 */
async function validateBriefings(canon: CanonicalData, results: ValidationResult[]): Promise<void> {
  try {
    const content = await db.select().from(simulationContent);
    const briefings = content.filter(c => c.contentType === 'text' && c.title?.toLowerCase().includes('briefing'));
    
    if (briefings.length === 0) {
      results.push({
        type: 'warning',
        source: 'Database',
        message: 'No briefing content found in simulation_content table.',
        category: 'briefing'
      });
      return;
    }
    
    results.push({
      type: 'info',
      source: 'Database',
      message: `Found ${briefings.length} briefing(s) in database`,
      category: 'briefing'
    });
    
    const canonicalNames = new Set(canon.characters.map(c => c.name));
    const weekTitles = new Map(canon.weeks.map(w => [w.number, w.title]));
    const weekThemes = new Map(canon.weeks.map(w => [w.number, w.theme]));
    
    for (const briefing of briefings) {
      const textContent = briefing.content || '';
      
      // Check if briefing mentions at least one canonical character
      const mentionedCharacters = canon.characters.filter(char => textContent.includes(char.name));
      if (textContent.length > 500 && mentionedCharacters.length === 0) {
        results.push({
          type: 'warning',
          source: `briefing.${briefing.id}`,
          message: `Briefing "${briefing.title}" does not mention any canonical characters`,
          category: 'briefing'
        });
      }
      
      // Track which canonical characters are mentioned
      if (mentionedCharacters.length > 0) {
        results.push({
          type: 'info',
          source: `briefing.${briefing.id}`,
          message: `Briefing "${briefing.title}" references ${mentionedCharacters.length} character(s): ${mentionedCharacters.map(c => c.name).slice(0, 3).join(', ')}${mentionedCharacters.length > 3 ? '...' : ''}`,
          category: 'briefing'
        });
      }
      
      // Check for common wrong names (non-canonical company/character names)
      const wrongNames = ['Meridian', 'Acme', 'GlobalTech', 'TechCorp', 'MegaCorp'];
      for (const wrongName of wrongNames) {
        if (textContent.includes(wrongName) && !textContent.toLowerCase().includes('example')) {
          results.push({
            type: 'error',
            source: `briefing.${briefing.id}`,
            message: `Briefing "${briefing.title}" contains wrong company/character name "${wrongName}". Use "${canon.company.name}" instead.`,
            category: 'briefing'
          });
        }
      }
      
      // Check week theme alignment - briefing should relate to its week's theme
      const weekTheme = weekThemes.get(briefing.weekNumber);
      if (weekTheme && textContent.length > 200) {
        const themeKeywords = weekTheme.toLowerCase().split(' ').filter(w => w.length > 3);
        const hasThemeReference = themeKeywords.some(keyword => textContent.toLowerCase().includes(keyword));
        if (!hasThemeReference) {
          results.push({
            type: 'warning',
            source: `briefing.${briefing.id}`,
            message: `Briefing "${briefing.title}" may not align with week ${briefing.weekNumber} theme: "${weekTheme}"`,
            category: 'briefing'
          });
        }
      }
    }
  } catch (error) {
    results.push({
      type: 'error',
      source: 'Briefings',
      message: `Error validating briefings: ${error instanceof Error ? error.message : 'Unknown error'}`,
      category: 'system'
    });
  }
}

/**
 * Validate decision options - check week numbers and character references
 */
async function validateDecisions(canon: CanonicalData, results: ValidationResult[]): Promise<void> {
  try {
    const content = await db.select().from(simulationContent);
    const decisions = content.filter(c => 
      c.title?.toLowerCase().includes('decision') || 
      c.contentType === 'text' && c.category === 'decision'
    );
    
    results.push({
      type: 'info',
      source: 'Database',
      message: `Found ${decisions.length} decision-related content item(s) in database`,
      category: 'decision'
    });
    
    // Validate week coverage
    const weeksCovered = new Set(decisions.map(d => d.weekNumber));
    for (let week = 1; week <= canon.simulation.totalWeeks; week++) {
      if (!weeksCovered.has(week)) {
        results.push({
          type: 'warning',
          source: 'Decisions',
          message: `No decision content found for week ${week}`,
          category: 'decision'
        });
      }
    }
    
    // Check for character mentions in decision text
    for (const decision of decisions) {
      const textContent = decision.content || '';
      
      // Validate week number
      if (decision.weekNumber < 0 || decision.weekNumber > canon.simulation.totalWeeks) {
        results.push({
          type: 'error',
          source: `decision.${decision.id}`,
          message: `Decision "${decision.title}" has invalid week number: ${decision.weekNumber}`,
          category: 'decision'
        });
      }
      
      // Check character references - decisions often involve stakeholder input
      const mentionedCharacters = canon.characters.filter(char => textContent.includes(char.name));
      if (mentionedCharacters.length > 0) {
        results.push({
          type: 'info',
          source: `decision.${decision.id}`,
          message: `Decision "${decision.title}" references ${mentionedCharacters.length} stakeholder(s): ${mentionedCharacters.map(c => c.name).slice(0, 3).join(', ')}${mentionedCharacters.length > 3 ? '...' : ''}`,
          category: 'decision'
        });
      }
      
      // Check for wrong company name usage
      const wrongNames = ['Meridian', 'Acme', 'GlobalTech', 'TechCorp', 'MegaCorp'];
      for (const wrongName of wrongNames) {
        if (textContent.includes(wrongName) && !textContent.toLowerCase().includes('example') && !textContent.toLowerCase().includes('competitor')) {
          results.push({
            type: 'error',
            source: `decision.${decision.id}`,
            message: `Decision "${decision.title}" contains wrong company name "${wrongName}". Use "${canon.company.name}" instead.`,
            category: 'decision'
          });
        }
      }
      
      // Check content length - decisions should have substantial content
      if (textContent.length < 50 && decision.title) {
        results.push({
          type: 'warning',
          source: `decision.${decision.id}`,
          message: `Decision "${decision.title}" has minimal content (${textContent.length} chars)`,
          category: 'decision'
        });
      }
    }
  } catch (error) {
    results.push({
      type: 'error',
      source: 'Decisions',
      message: `Error validating decisions: ${error instanceof Error ? error.message : 'Unknown error'}`,
      category: 'system'
    });
  }
}

/**
 * Validate intel articles - check character mentions, week associations, content coverage
 */
async function validateIntelArticles(canon: CanonicalData, results: ValidationResult[]): Promise<void> {
  try {
    const content = await db.select().from(simulationContent);
    const intelArticles = content.filter(c => c.isIntelContent === true);
    
    if (intelArticles.length === 0) {
      results.push({
        type: 'warning',
        source: 'Database',
        message: 'No intel articles found in simulation_content table (isIntelContent=true).',
        category: 'intel'
      });
      return;
    }
    
    results.push({
      type: 'info',
      source: 'Database',
      message: `Found ${intelArticles.length} intel article(s) in database`,
      category: 'intel'
    });
    
    // Check for required categories
    const categories = new Set(intelArticles.map(a => a.category).filter(Boolean));
    const expectedCategories = ['industry', 'company', 'workforce', 'technology'];
    
    for (const expected of expectedCategories) {
      if (!categories.has(expected)) {
        results.push({
          type: 'warning',
          source: 'Intel',
          message: `No intel articles found in category "${expected}"`,
          category: 'intel'
        });
      }
    }
    
    // Check week coverage
    const weeksCovered = new Set(intelArticles.map(a => a.weekNumber));
    for (let week = 1; week <= canon.simulation.totalWeeks; week++) {
      const articlesForWeek = intelArticles.filter(a => a.weekNumber === week);
      if (articlesForWeek.length === 0) {
        results.push({
          type: 'warning',
          source: 'Intel',
          message: `No intel articles found for week ${week}`,
          category: 'intel'
        });
      }
    }
    
    // Validate each article
    for (const article of intelArticles) {
      if (!article.title || article.title.trim().length === 0) {
        results.push({
          type: 'error',
          source: `intel.${article.id}`,
          message: `Intel article has no title`,
          category: 'intel'
        });
      }
      
      if (!article.content || article.content.trim().length < 100) {
        results.push({
          type: 'warning',
          source: `intel.${article.id}`,
          message: `Intel article "${article.title}" has very short content (< 100 chars)`,
          category: 'intel'
        });
      }
      
      const textContent = article.content || '';
      
      // Check for character mentions - intel often references stakeholders
      const mentionedCharacters = canon.characters.filter(char => textContent.includes(char.name));
      if (mentionedCharacters.length > 0) {
        results.push({
          type: 'info',
          source: `intel.${article.id}`,
          message: `Intel "${article.title}" references ${mentionedCharacters.length} character(s): ${mentionedCharacters.map(c => c.name).slice(0, 3).join(', ')}${mentionedCharacters.length > 3 ? '...' : ''}`,
          category: 'intel'
        });
      }
      
      // Check for company name consistency
      const wrongNames = ['Meridian', 'Acme', 'GlobalTech', 'TechCorp', 'MegaCorp'];
      for (const wrongName of wrongNames) {
        if (textContent.includes(wrongName) && !textContent.toLowerCase().includes('example') && !textContent.toLowerCase().includes('competitor')) {
          results.push({
            type: 'error',
            source: `intel.${article.id}`,
            message: `Intel "${article.title}" contains wrong company name "${wrongName}". Use "${canon.company.name}" instead.`,
            category: 'intel'
          });
        }
      }
      
      // Check week alignment - article theme should relate to its week
      const weekForArticle = canon.weeks.find(w => w.number === article.weekNumber);
      if (weekForArticle && textContent.length > 300) {
        const themeKeywords = weekForArticle.theme.toLowerCase().split(' ').filter(w => w.length > 3);
        const hasThemeReference = themeKeywords.some(keyword => textContent.toLowerCase().includes(keyword));
        if (!hasThemeReference) {
          results.push({
            type: 'info',
            source: `intel.${article.id}`,
            message: `Intel "${article.title}" may not align with week ${article.weekNumber} theme: "${weekForArticle.theme}"`,
            category: 'intel'
          });
        }
      }
    }
  } catch (error) {
    results.push({
      type: 'error',
      source: 'Intel',
      message: `Error validating intel articles: ${error instanceof Error ? error.message : 'Unknown error'}`,
      category: 'system'
    });
  }
}

/**
 * Validate advisors - check all 9 categories exist with transcripts and audio
 */
async function validateAdvisors(canon: CanonicalData, results: ValidationResult[]): Promise<void> {
  try {
    const advisorRecords = await db.select().from(advisors);
    
    if (advisorRecords.length === 0) {
      results.push({
        type: 'warning',
        source: 'Database',
        message: 'advisors table is empty. No advisors have been created yet.',
        category: 'advisor'
      });
      return;
    }
    
    results.push({
      type: 'info',
      source: 'Database',
      message: `Found ${advisorRecords.length} advisor(s) in database`,
      category: 'advisor'
    });
    
    // Build canonical advisor specialty map (e.g., "Finance Advisor" -> "finance")
    const canonicalAdvisorSpecialties = new Set(
      canon.advisors.map(a => a.toLowerCase().replace(' advisor', '').trim())
    );
    
    // Expected categories from the Phone-a-Friend system
    const expectedCategories = ['consultant', 'industry_expert', 'thought_leader'];
    const foundCategories = new Set(advisorRecords.map(a => a.category));
    
    for (const expected of expectedCategories) {
      if (!foundCategories.has(expected)) {
        results.push({
          type: 'warning',
          source: 'Advisors',
          message: `No advisors found in category "${expected}"`,
          category: 'advisor'
        });
      }
    }
    
    // Track which canonical specialties are covered
    const coveredSpecialties = new Set<string>();
    
    // Validate each advisor
    for (const advisor of advisorRecords) {
      // Check transcript exists
      if (!advisor.transcript || advisor.transcript.trim().length === 0) {
        results.push({
          type: 'error',
          source: `advisor.${advisor.id}`,
          message: `Advisor "${advisor.name}" has no transcript`,
          category: 'advisor'
        });
      } else if (advisor.transcript.split(' ').length < 50) {
        results.push({
          type: 'warning',
          source: `advisor.${advisor.id}`,
          message: `Advisor "${advisor.name}" transcript is very short (< 50 words)`,
          category: 'advisor'
        });
      }
      
      // Check audio exists for active advisors
      if (advisor.isActive && !advisor.audioUrl) {
        results.push({
          type: 'warning',
          source: `advisor.${advisor.id}`,
          message: `Active advisor "${advisor.name}" has no audio URL`,
          category: 'advisor'
        });
      }
      
      // Check bio exists
      if (!advisor.bio || advisor.bio.trim().length === 0) {
        results.push({
          type: 'warning',
          source: `advisor.${advisor.id}`,
          message: `Advisor "${advisor.name}" has no bio`,
          category: 'advisor'
        });
      }
      
      // Check specialty alignment with canonical list
      const specialtyLower = advisor.specialty?.toLowerCase() || '';
      
      // Check if this specialty maps to a canonical advisor type
      const matchesCanonical = canonicalAdvisorSpecialties.has(specialtyLower) ||
        Array.from(canonicalAdvisorSpecialties).some(ca => 
          specialtyLower.includes(ca) || ca.includes(specialtyLower)
        );
      
      if (matchesCanonical) {
        coveredSpecialties.add(specialtyLower);
      } else if (advisor.specialty) {
        results.push({
          type: 'warning',
          source: `advisor.${advisor.id}`,
          message: `Advisor "${advisor.name}" specialty "${advisor.specialty}" is not in canonical list: ${canon.advisors.join(', ')}`,
          category: 'advisor'
        });
      }
    }
    
    // Report which canonical advisor types are missing
    const missingSpecialties = Array.from(canonicalAdvisorSpecialties)
      .filter(spec => !coveredSpecialties.has(spec) && 
        !Array.from(coveredSpecialties).some(cs => cs.includes(spec) || spec.includes(cs))
      );
    
    if (missingSpecialties.length > 0) {
      results.push({
        type: 'warning',
        source: 'Advisors',
        message: `Missing advisors for canonical specialties: ${missingSpecialties.join(', ')}`,
        category: 'advisor'
      });
    }
    
    // Check we have expected number of advisors (9)
    if (advisorRecords.length < 9) {
      results.push({
        type: 'warning',
        source: 'Advisors',
        message: `Only ${advisorRecords.length} advisors found. Expected 9 (one per specialty).`,
        category: 'advisor'
      });
    } else if (advisorRecords.length === 9) {
      results.push({
        type: 'info',
        source: 'Advisors',
        message: `All 9 advisor slots are filled`,
        category: 'advisor'
      });
    }
    
  } catch (error) {
    results.push({
      type: 'error',
      source: 'Advisors',
      message: `Error validating advisors: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
  
  // Run extended content validations
  await validateVoicemails(canon, results);
  await validateBriefings(canon, results);
  await validateDecisions(canon, results);
  await validateIntelArticles(canon, results);
  await validateAdvisors(canon, results);
  
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
