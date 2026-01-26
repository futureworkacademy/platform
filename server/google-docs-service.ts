// Google Docs Integration Service
// Connected via Replit Google Docs and Google Drive connectors

import { google } from 'googleapis';

// Separate connection settings for Docs and Drive
let docsConnectionSettings: any;
let driveConnectionSettings: any;

// Cache for folder ID
let futureWorkFolderId: string | null = null;
const FOLDER_NAME = 'Future Work Academy';

async function getDocsAccessToken() {
  if (docsConnectionSettings && docsConnectionSettings.settings.expires_at && new Date(docsConnectionSettings.settings.expires_at).getTime() > Date.now()) {
    return docsConnectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  docsConnectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-docs',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = docsConnectionSettings?.settings?.access_token || docsConnectionSettings.settings?.oauth?.credentials?.access_token;

  if (!docsConnectionSettings || !accessToken) {
    throw new Error('Google Docs not connected');
  }
  return accessToken;
}

async function getDriveAccessToken() {
  if (driveConnectionSettings && driveConnectionSettings.settings.expires_at && new Date(driveConnectionSettings.settings.expires_at).getTime() > Date.now()) {
    return driveConnectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  driveConnectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-drive',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = driveConnectionSettings?.settings?.access_token || driveConnectionSettings.settings?.oauth?.credentials?.access_token;

  if (!driveConnectionSettings || !accessToken) {
    throw new Error('Google Drive not connected');
  }
  return accessToken;
}

async function getUncachableGoogleDocsClient() {
  const accessToken = await getDocsAccessToken();

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken
  });

  return google.docs({ version: 'v1', auth: oauth2Client });
}

async function getGoogleDriveClient() {
  // Use the Drive connection which has proper Drive permissions
  const accessToken = await getDriveAccessToken();

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken
  });

  return google.drive({ version: 'v3', auth: oauth2Client });
}

export interface DocumentInfo {
  documentId: string;
  title: string;
  revisionId?: string;
  folderId?: string;
}

// Find or create the "Future Work Academy" folder
export async function findOrCreateFolder(): Promise<string> {
  if (futureWorkFolderId) {
    return futureWorkFolderId;
  }

  const drive = await getGoogleDriveClient();
  
  // Search for existing folder
  const response = await drive.files.list({
    q: `mimeType='application/vnd.google-apps.folder' and name='${FOLDER_NAME}' and trashed=false`,
    fields: 'files(id, name)',
    pageSize: 1
  });

  if (response.data.files && response.data.files.length > 0) {
    futureWorkFolderId = response.data.files[0].id!;
    console.log(`[Google Docs] Found existing folder: ${FOLDER_NAME} (${futureWorkFolderId})`);
    return futureWorkFolderId;
  }

  // Create new folder
  const createResponse = await drive.files.create({
    requestBody: {
      name: FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder'
    },
    fields: 'id'
  });

  futureWorkFolderId = createResponse.data.id!;
  console.log(`[Google Docs] Created folder: ${FOLDER_NAME} (${futureWorkFolderId})`);
  return futureWorkFolderId;
}

// Move a file to the Future Work Academy folder
async function moveToFolder(fileId: string): Promise<void> {
  const drive = await getGoogleDriveClient();
  const folderId = await findOrCreateFolder();
  
  // Get current parents
  const file = await drive.files.get({
    fileId: fileId,
    fields: 'parents'
  });
  
  const previousParents = file.data.parents?.join(',') || '';
  
  // Move to our folder (if not already there)
  if (!file.data.parents?.includes(folderId)) {
    await drive.files.update({
      fileId: fileId,
      addParents: folderId,
      removeParents: previousParents,
      fields: 'id, parents'
    });
    console.log(`[Google Docs] Moved document to ${FOLDER_NAME} folder`);
  }
}

export async function createDocument(title: string): Promise<DocumentInfo> {
  const docs = await getUncachableGoogleDocsClient();
  
  const response = await docs.documents.create({
    requestBody: {
      title: title
    }
  });

  return {
    documentId: response.data.documentId!,
    title: response.data.title!,
    revisionId: response.data.revisionId || undefined
  };
}

export async function getDocument(documentId: string): Promise<any> {
  const docs = await getUncachableGoogleDocsClient();
  
  const response = await docs.documents.get({
    documentId: documentId
  });

  return response.data;
}

export async function updateDocumentContent(documentId: string, content: string): Promise<void> {
  const docs = await getUncachableGoogleDocsClient();
  
  const doc = await docs.documents.get({ documentId });
  const endIndex = doc.data.body?.content?.slice(-1)[0]?.endIndex || 1;
  
  const requests: any[] = [];
  
  if (endIndex > 2) {
    requests.push({
      deleteContentRange: {
        range: {
          startIndex: 1,
          endIndex: endIndex - 1
        }
      }
    });
  }
  
  requests.push({
    insertText: {
      location: { index: 1 },
      text: content
    }
  });

  await docs.documents.batchUpdate({
    documentId: documentId,
    requestBody: {
      requests: requests
    }
  });
}

export async function appendToDocument(documentId: string, content: string): Promise<void> {
  const docs = await getUncachableGoogleDocsClient();
  
  const doc = await docs.documents.get({ documentId });
  const endIndex = doc.data.body?.content?.slice(-1)[0]?.endIndex || 1;
  
  await docs.documents.batchUpdate({
    documentId: documentId,
    requestBody: {
      requests: [
        {
          insertText: {
            location: { index: endIndex - 1 },
            text: content
          }
        }
      ]
    }
  });
}

export async function listDocuments(): Promise<DocumentInfo[]> {
  const drive = await getGoogleDriveClient();
  
  const response = await drive.files.list({
    q: "mimeType='application/vnd.google-apps.document'",
    fields: 'files(id, name)',
    orderBy: 'modifiedTime desc',
    pageSize: 50
  });

  return (response.data.files || []).map(file => ({
    documentId: file.id!,
    title: file.name!
  }));
}

export async function findOrCreateDocument(title: string): Promise<DocumentInfo> {
  const drive = await getGoogleDriveClient();
  const folderId = await findOrCreateFolder();
  
  // Search within our folder first
  const response = await drive.files.list({
    q: `mimeType='application/vnd.google-apps.document' and name='${title.replace(/'/g, "\\'")}' and '${folderId}' in parents and trashed=false`,
    fields: 'files(id, name)',
    pageSize: 1
  });

  if (response.data.files && response.data.files.length > 0) {
    return {
      documentId: response.data.files[0].id!,
      title: response.data.files[0].name!,
      folderId: folderId
    };
  }

  // Check if it exists elsewhere and move it
  const anywhereResponse = await drive.files.list({
    q: `mimeType='application/vnd.google-apps.document' and name='${title.replace(/'/g, "\\'")}' and trashed=false`,
    fields: 'files(id, name)',
    pageSize: 1
  });

  if (anywhereResponse.data.files && anywhereResponse.data.files.length > 0) {
    const existingDocId = anywhereResponse.data.files[0].id!;
    await moveToFolder(existingDocId);
    return {
      documentId: existingDocId,
      title: anywhereResponse.data.files[0].name!,
      folderId: folderId
    };
  }

  // Create new document in the folder
  const docInfo = await createDocument(title);
  await moveToFolder(docInfo.documentId);
  return { ...docInfo, folderId };
}

const MERMAID_NOTE = `
═══════════════════════════════════════════════════════════════════
NOTE: This document contains Mermaid diagram code blocks.
To render diagrams as images:
1. Copy the code block (between \`\`\`mermaid and \`\`\`)
2. Paste into https://mermaid.live
3. Download as PNG or SVG for presentations

This document auto-syncs from the source repository.
Last synced: {SYNC_TIME}
═══════════════════════════════════════════════════════════════════

`;

export async function syncMarkdownToGoogleDoc(title: string, markdownContent: string): Promise<DocumentInfo> {
  const docInfo = await findOrCreateDocument(title);
  
  // Check if content has Mermaid diagrams
  const hasMermaid = markdownContent.includes('```mermaid');
  
  // Convert markdown to plain text but KEEP code blocks for Mermaid
  let plainText = markdownContent
    .replace(/^#{1,6}\s+/gm, (match) => match.toUpperCase()) // Keep headings but uppercase
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
    .replace(/\*([^*]+)\*/g, '$1') // Remove italics
    .replace(/`([^`]+)`/g, '$1') // Remove inline code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links but keep text
    .replace(/^\s*[-*]\s+/gm, '• '); // Convert bullets
  
  // Add Mermaid note at top if diagrams present
  if (hasMermaid) {
    const syncTime = new Date().toLocaleString('en-US', { 
      dateStyle: 'medium', 
      timeStyle: 'short',
      timeZone: 'America/New_York'
    });
    plainText = MERMAID_NOTE.replace('{SYNC_TIME}', syncTime) + plainText;
  }
  
  await updateDocumentContent(docInfo.documentId, plainText);
  
  console.log(`[Google Docs] Synced: ${title} (${docInfo.documentId})`);
  return docInfo;
}

// List all documents in the Future Work Academy folder with metadata
export async function listFolderDocuments(): Promise<Array<{
  id: string;
  name: string;
  modifiedTime: string;
  createdTime: string;
}>> {
  const drive = await getGoogleDriveClient();
  const folderId = await findOrCreateFolder();
  
  const response = await drive.files.list({
    q: `'${folderId}' in parents and mimeType='application/vnd.google-apps.document' and trashed=false`,
    fields: 'files(id, name, modifiedTime, createdTime)',
    orderBy: 'name, modifiedTime desc',
    pageSize: 100
  });

  return (response.data.files || []).map(file => ({
    id: file.id!,
    name: file.name!,
    modifiedTime: file.modifiedTime!,
    createdTime: file.createdTime!
  }));
}

// Find duplicate documents (same name) and return grouped
export async function findDuplicateDocuments(): Promise<Map<string, Array<{
  id: string;
  name: string;
  modifiedTime: string;
  createdTime: string;
}>>> {
  const docs = await listFolderDocuments();
  const grouped = new Map<string, typeof docs>();
  
  for (const doc of docs) {
    const existing = grouped.get(doc.name) || [];
    existing.push(doc);
    grouped.set(doc.name, existing);
  }
  
  // Filter to only duplicates (more than one with same name)
  const duplicates = new Map<string, typeof docs>();
  const entries = Array.from(grouped.entries());
  for (const [name, docList] of entries) {
    if (docList.length > 1) {
      // Sort by modified time descending (newest first)
      docList.sort((a: { modifiedTime: string }, b: { modifiedTime: string }) => 
        new Date(b.modifiedTime).getTime() - new Date(a.modifiedTime).getTime()
      );
      duplicates.set(name, docList);
    }
  }
  
  return duplicates;
}

// Move a document to trash
export async function trashDocument(documentId: string): Promise<void> {
  const drive = await getGoogleDriveClient();
  
  await drive.files.update({
    fileId: documentId,
    requestBody: {
      trashed: true
    }
  });
  
  console.log(`[Google Docs] Moved document ${documentId} to trash`);
}

// Clean up duplicate documents (keep the most recently modified, trash the rest)
export async function cleanupDuplicates(): Promise<{
  cleaned: number;
  details: Array<{ name: string; kept: string; trashed: string[] }>;
}> {
  const duplicates = await findDuplicateDocuments();
  const details: Array<{ name: string; kept: string; trashed: string[] }> = [];
  let cleaned = 0;
  
  const dupEntries = Array.from(duplicates.entries());
  for (const [name, docList] of dupEntries) {
    // Keep the first one (most recently modified), trash the rest
    const [keep, ...toTrash] = docList;
    const trashedIds: string[] = [];
    
    for (const doc of toTrash) {
      await trashDocument(doc.id);
      trashedIds.push(doc.id);
      cleaned++;
    }
    
    details.push({
      name,
      kept: keep.id,
      trashed: trashedIds
    });
  }
  
  return { cleaned, details };
}

export const googleDocsService = {
  createDocument,
  getDocument,
  updateDocumentContent,
  appendToDocument,
  listDocuments,
  findOrCreateDocument,
  findOrCreateFolder,
  syncMarkdownToGoogleDoc,
  listFolderDocuments,
  findDuplicateDocuments,
  trashDocument,
  cleanupDuplicates
};
