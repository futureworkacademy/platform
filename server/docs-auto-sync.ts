// Auto-sync documentation to Google Docs
// Watches the docs/ folder and syncs changes automatically

import * as fs from 'fs';
import * as path from 'path';
import { syncMarkdownToGoogleDoc, findOrCreateFolder } from './google-docs-service';
import { storage } from './storage';

// Document configuration
const DOC_FILES: Record<string, { path: string; title: string }> = {
  business_plan: {
    path: 'docs/BUSINESS_PLAN.md',
    title: 'Future Work Academy - Business Plan'
  },
  product_roadmap: {
    path: 'docs/PRODUCT_ROADMAP.md',
    title: 'Future Work Academy - Product Roadmap'
  },
  marketing_materials: {
    path: 'docs/MARKETING_MATERIALS.md',
    title: 'Future Work Academy - Marketing Materials'
  },
  appendix_diagrams: {
    path: 'docs/APPENDIX_DIAGRAMS.md',
    title: 'Future Work Academy - Visual Appendix'
  },
  ai_transparency: {
    path: 'docs/AI_TRANSPARENCY.md',
    title: 'Future Work Academy - AI Transparency & Prompt Documentation'
  },
  brand_standards: {
    path: 'docs/BRAND_STANDARDS.md',
    title: 'Future Work Academy - Brand Standards'
  },
  security_compliance: {
    path: 'docs/SECURITY_COMPLIANCE.md',
    title: 'Future Work Academy - Security & Compliance'
  },
  game_design: {
    path: 'docs/GAME_DESIGN.md',
    title: 'Future Work Academy - Game Design Document'
  },
  iowa_grant_proposal: {
    path: 'docs/IOWA_GRANT_PROPOSAL_OUTLINE.md',
    title: 'Future Work Academy - Iowa Grant Proposal Outline'
  },
  iowa_manufacturing_module: {
    path: 'docs/IOWA_MANUFACTURING_MODULE_CONCEPT.md',
    title: 'Future Work Academy - Iowa Manufacturing Module Concept'
  },
  iowa_community_college: {
    path: 'docs/IOWA_COMMUNITY_COLLEGE_ONEPAGER.md',
    title: 'Future Work Academy - Iowa Community College One-Pager'
  }
};

// Debounce timers for each file
const debounceTimers: Map<string, NodeJS.Timeout> = new Map();
const DEBOUNCE_DELAY = 3000; // 3 seconds

// Track if sync is in progress to avoid overlapping syncs
let syncInProgress = false;

// Log sync activity to the activity log
async function logSyncActivity(docTitle: string, success: boolean, error?: string): Promise<void> {
  try {
    await storage.logActivity({
      eventType: success ? 'google_docs_sync_success' : 'google_docs_sync_failure',
      userId: 'system',
      details: {
        documentTitle: docTitle,
        success,
        error: error || null,
        syncType: 'auto-sync'
      }
    });
  } catch (logError: any) {
    console.error(`[Auto-Sync] Failed to log activity:`, logError.message);
  }
}

// Sync a single document
async function syncDocument(docKey: string): Promise<{ success: boolean; title: string; error?: string }> {
  const doc = DOC_FILES[docKey];
  if (!doc) {
    return { success: false, title: docKey, error: 'Unknown document type' };
  }

  const filePath = path.join(process.cwd(), doc.path);
  
  try {
    if (!fs.existsSync(filePath)) {
      return { success: false, title: doc.title, error: 'File not found' };
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    await syncMarkdownToGoogleDoc(doc.title, content);
    
    // Log successful sync
    await logSyncActivity(doc.title, true);
    
    return { success: true, title: doc.title };
  } catch (error: any) {
    console.error(`[Auto-Sync] Failed to sync ${doc.title}:`, error.message);
    
    // Log failed sync
    await logSyncActivity(doc.title, false, error.message);
    
    return { success: false, title: doc.title, error: error.message };
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

    for (const [key, doc] of Object.entries(DOC_FILES)) {
      const result = await syncDocument(key);
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
  // Find which doc this file belongs to
  const docEntry = Object.entries(DOC_FILES).find(([_, doc]) => 
    doc.path.endsWith(filename) || filename.endsWith(path.basename(doc.path))
  );

  if (!docEntry) {
    return; // Not a tracked file
  }

  const [docKey, doc] = docEntry;

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
      const result = await syncDocument(docKey);
      if (result.success) {
        console.log(`[Auto-Sync] Successfully synced: ${result.title}`);
      } else {
        console.error(`[Auto-Sync] Failed to sync ${result.title}: ${result.error}`);
      }
    } catch (error: any) {
      console.error(`[Auto-Sync] Error syncing ${doc.title}:`, error.message);
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

// Export doc files config for use in routes
export { DOC_FILES };
