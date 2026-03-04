// Auto-sync documentation to Google Docs
// Watches the docs/ folder and syncs changes automatically
// Now auto-discovers all .md files in docs/ directory

import * as fs from 'fs';
import * as path from 'path';
import { syncMarkdownToGoogleDoc, syncFormattedDocument, findOrCreateFolder } from './google-docs-service';

// Documents that should be synced with full formatting (headings, TOC, etc.)
const FORMATTED_DOCS = ['STUDENT_GUIDE', 'GAME_DESIGN', 'BUSINESS_PLAN', 'INSTITUTIONAL_PROPOSAL'];

// Debounce timers for each file
const debounceTimers: Map<string, NodeJS.Timeout> = new Map();
const DEBOUNCE_DELAY = 3000; // 3 seconds

// Track if sync is in progress to avoid overlapping syncs
let syncInProgress = false;

// Convert filename to document title
function filenameToTitle(filename: string): string {
  // Remove .md extension
  const name = filename.replace(/\.md$/i, '');
  
  // Convert SCREAMING_SNAKE_CASE to Title Case
  const words = name.split('_').map(word => {
    // Handle common abbreviations
    const lowerWord = word.toLowerCase();
    if (['ai', 'llm', 'api', 'ui', 'ux', 'sso', 'soc', 'esg', 'faq'].includes(lowerWord)) {
      return word.toUpperCase();
    }
    // Regular title case
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
  
  return `Future Work Academy - ${words.join(' ')}`;
}

// Discover all markdown files in docs/ directory
function discoverDocFiles(): { key: string; path: string; title: string }[] {
  const docsDir = path.join(process.cwd(), 'docs');
  
  if (!fs.existsSync(docsDir)) {
    return [];
  }
  
  try {
    const files = fs.readdirSync(docsDir);
    return files
      .filter(file => file.endsWith('.md'))
      .map(file => ({
        key: file.replace(/\.md$/i, '').toLowerCase(),
        path: `docs/${file}`,
        title: filenameToTitle(file)
      }));
  } catch (error: any) {
    console.error('[Auto-Sync] Error discovering doc files:', error.message);
    return [];
  }
}

// Sync a single document by file path
async function syncDocumentByPath(filePath: string, title: string): Promise<{ success: boolean; title: string; error?: string }> {
  const fullPath = path.join(process.cwd(), filePath);
  
  try {
    if (!fs.existsSync(fullPath)) {
      return { success: false, title, error: 'File not found' };
    }

    const content = fs.readFileSync(fullPath, 'utf-8');
    
    // Check if this document should use formatted sync
    const filename = path.basename(filePath, '.md');
    const useFormatted = FORMATTED_DOCS.some(doc => 
      doc.toLowerCase() === filename.toLowerCase()
    );
    
    if (useFormatted) {
      await syncFormattedDocument(title, content);
    } else {
      await syncMarkdownToGoogleDoc(title, content);
    }
    
    return { success: true, title };
  } catch (error: any) {
    console.error(`[Auto-Sync] Failed to sync ${title}:`, error.message);
    return { success: false, title, error: error.message };
  }
}

// Sync all documents
export async function syncAllDocuments(): Promise<{ synced: string[]; failed: string[] }> {
  if (syncInProgress) {
    console.log('[Auto-Sync] Sync already in progress, skipping...');
    return { synced: [], failed: [] };
  }

  syncInProgress = true;
  const synced: string[] = [];
  const failed: string[] = [];

  console.log('[Auto-Sync] Starting sync of all documents...');

  try {
    // Ensure folder exists first
    await findOrCreateFolder();

    // Discover all docs dynamically
    const docs = discoverDocFiles();
    
    for (const doc of docs) {
      const result = await syncDocumentByPath(doc.path, doc.title);
      if (result.success) {
        synced.push(result.title);
      } else {
        failed.push(`${result.title}: ${result.error}`);
      }
    }

    console.log(`[Auto-Sync] Complete. Synced: ${synced.length}, Failed: ${failed.length}`);
  } catch (error: any) {
    console.error('[Auto-Sync] Error during sync:', error.message);
  } finally {
    syncInProgress = false;
  }

  return { synced, failed };
}

// Handle file change with debouncing
function handleFileChange(filename: string) {
  if (!filename.endsWith('.md')) {
    return;
  }

  const filePath = `docs/${filename}`;
  const title = filenameToTitle(filename);
  const docKey = filename.replace(/\.md$/i, '').toLowerCase();

  // Clear existing timer for this file
  const existingTimer = debounceTimers.get(docKey);
  if (existingTimer) {
    clearTimeout(existingTimer);
  }

  // Set new timer
  const timer = setTimeout(async () => {
    console.log(`[Auto-Sync] File changed: ${filename}`);
    debounceTimers.delete(docKey);
    
    try {
      const result = await syncDocumentByPath(filePath, title);
      if (result.success) {
        console.log(`[Auto-Sync] Successfully synced: ${result.title}`);
      } else {
        console.error(`[Auto-Sync] Failed to sync ${result.title}: ${result.error}`);
      }
    } catch (error: any) {
      console.error(`[Auto-Sync] Error syncing ${title}:`, error.message);
    }
  }, DEBOUNCE_DELAY);

  debounceTimers.set(docKey, timer);
}

// Start the file watcher
export function startDocsWatcher(): void {
  const docsDir = path.join(process.cwd(), 'docs');

  // Check if docs directory exists
  if (!fs.existsSync(docsDir)) {
    console.log('[Auto-Sync] docs/ directory not found, skipping watcher setup');
    return;
  }

  try {
    // Watch the docs directory
    const watcher = fs.watch(docsDir, { persistent: false }, (eventType, filename) => {
      if (filename && filename.endsWith('.md')) {
        handleFileChange(filename);
      }
    });

    watcher.on('error', (error) => {
      console.error('[Auto-Sync] Watcher error:', error.message);
    });

    console.log('[Auto-Sync] File watcher started for docs/ directory');
  } catch (error: any) {
    console.error('[Auto-Sync] Failed to start file watcher:', error.message);
  }
}

// Initialize: sync on startup and start watcher
export async function initializeDocsAutoSync(): Promise<void> {
  console.log('[Auto-Sync] Initializing documentation auto-sync...');

  // Check if Google Docs connectors are available
  if (!process.env.REPLIT_CONNECTORS_HOSTNAME) {
    console.log('[Auto-Sync] Google Docs connectors not available, skipping auto-sync');
    return;
  }

  try {
    // Sync all documents on startup
    console.log('[Auto-Sync] Running initial sync...');
    const result = await syncAllDocuments();
    
    if (result.synced.length > 0) {
      console.log(`[Auto-Sync] Initial sync complete. Synced ${result.synced.length} documents to "Future Work Academy" folder`);
    }
    
    if (result.failed.length > 0) {
      console.log(`[Auto-Sync] Some documents failed to sync: ${result.failed.join(', ')}`);
    }

    // Start the file watcher
    startDocsWatcher();
  } catch (error: any) {
    console.error('[Auto-Sync] Initialization failed:', error.message);
    // Still try to start the watcher even if initial sync fails
    startDocsWatcher();
  }
}

// Export discovered doc files for use in routes (for backward compatibility)
export function getDocFiles(): Record<string, { path: string; title: string }> {
  const docs = discoverDocFiles();
  return docs.reduce((acc, doc) => {
    acc[doc.key] = { path: doc.path, title: doc.title };
    return acc;
  }, {} as Record<string, { path: string; title: string }>);
}
