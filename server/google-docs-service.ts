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

interface ParsedElement {
  type: 'title' | 'subtitle' | 'heading1' | 'heading2' | 'heading3' | 'heading4' | 'paragraph' | 'bullet' | 'numbered' | 'separator' | 'table_row' | 'code_block';
  text: string;
  level?: number;
}

function parseMarkdownToElements(markdown: string): ParsedElement[] {
  const elements: ParsedElement[] = [];
  const lines = markdown.split('\n');
  let inCodeBlock = false;
  let codeBlockContent = '';
  let isFirstHeading = true;
  let hasSeenSubtitle = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Handle code blocks
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        elements.push({ type: 'code_block', text: codeBlockContent.trim() });
        codeBlockContent = '';
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }
    
    if (inCodeBlock) {
      codeBlockContent += line + '\n';
      continue;
    }
    
    // Horizontal rule / separator
    if (/^[-*_]{3,}\s*$/.test(line)) {
      elements.push({ type: 'separator', text: '' });
      continue;
    }
    
    // Headings
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      let text = headingMatch[2]
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .trim();
      
      if (level === 1 && isFirstHeading) {
        elements.push({ type: 'title', text });
        isFirstHeading = false;
      } else if (level === 1) {
        elements.push({ type: 'heading1', text, level: 1 });
      } else if (level === 2) {
        // Check if this is a subtitle (italic text right after title)
        if (!hasSeenSubtitle && elements.length > 0 && elements[elements.length - 1].type === 'title') {
          elements.push({ type: 'subtitle', text });
          hasSeenSubtitle = true;
        } else {
          elements.push({ type: 'heading2', text, level: 2 });
        }
      } else if (level === 3) {
        elements.push({ type: 'heading3', text, level: 3 });
      } else {
        elements.push({ type: 'heading4', text, level: 4 });
      }
      continue;
    }
    
    // Check for italic subtitle line (e.g., *Everything you need...*)
    if (!hasSeenSubtitle && /^\*[^*]+\*$/.test(line.trim()) && elements.length > 0 && elements[elements.length - 1].type === 'title') {
      const text = line.trim().replace(/^\*|\*$/g, '');
      elements.push({ type: 'subtitle', text });
      hasSeenSubtitle = true;
      continue;
    }
    
    // Table rows
    if (line.includes('|') && line.trim().startsWith('|')) {
      // Skip separator rows (|---|---|)
      if (/^\|[-:\s|]+\|$/.test(line.trim())) {
        continue;
      }
      const cells = line.split('|').filter(c => c.trim()).map(c => c.trim());
      if (cells.length > 0) {
        elements.push({ type: 'table_row', text: cells.join('\t') });
      }
      continue;
    }
    
    // Numbered lists
    const numberedMatch = line.match(/^\s*(\d+)\.\s+(.+)$/);
    if (numberedMatch) {
      let text = numberedMatch[2]
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
      elements.push({ type: 'numbered', text, level: Math.floor((line.match(/^\s*/)?.[0].length || 0) / 2) });
      continue;
    }
    
    // Bullet points
    const bulletMatch = line.match(/^\s*[-*]\s+(.+)$/);
    if (bulletMatch) {
      let text = bulletMatch[1]
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
      // Check for checkbox syntax
      text = text.replace(/^\[[ x]\]\s*/, '');
      elements.push({ type: 'bullet', text, level: Math.floor((line.match(/^\s*/)?.[0].length || 0) / 2) });
      continue;
    }
    
    // Empty lines - skip
    if (!line.trim()) {
      continue;
    }
    
    // Regular paragraph
    let text = line
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .trim();
    
    if (text) {
      elements.push({ type: 'paragraph', text });
    }
  }
  
  return elements;
}

function buildTableOfContents(elements: ParsedElement[]): string {
  const tocLines: string[] = [
    '────────────────────────────────────────',
    '',
    'TABLE OF CONTENTS',
    ''
  ];
  
  for (const element of elements) {
    if (element.type === 'heading1') {
      tocLines.push('▸ ' + element.text);
    } else if (element.type === 'heading2') {
      tocLines.push('    ▹ ' + element.text);
    } else if (element.type === 'heading3') {
      tocLines.push('        ◦ ' + element.text);
    }
  }
  
  tocLines.push('', '────────────────────────────────────────', '', '');
  return tocLines.join('\n');
}

async function applyFormattingWithTOC(documentId: string, elements: ParsedElement[], includeTableOfContents: boolean): Promise<void> {
  const docs = await getUncachableGoogleDocsClient();
  
  // Build the document content with proper structure
  let fullText = '';
  const styleRanges: Array<{
    startIndex: number;
    endIndex: number;
    style: string;
  }> = [];
  
  let currentIndex = 1; // Google Docs indices start at 1
  
  // First, add title and subtitle
  let titleSubtitleEndIndex = 1;
  const titleSubtitleElements = elements.filter(e => e.type === 'title' || e.type === 'subtitle');
  const contentElements = elements.filter(e => e.type !== 'title' && e.type !== 'subtitle');
  
  // Add title/subtitle first
  for (const element of titleSubtitleElements) {
    const startIndex = currentIndex;
    let text = element.text + '\n\n';
    fullText += text;
    
    if (element.type === 'title') {
      styleRanges.push({ startIndex, endIndex: startIndex + element.text.length, style: 'TITLE' });
    } else if (element.type === 'subtitle') {
      styleRanges.push({ startIndex, endIndex: startIndex + element.text.length, style: 'SUBTITLE' });
    }
    
    currentIndex = startIndex + text.length;
    titleSubtitleEndIndex = currentIndex;
  }
  
  // Add table of contents if requested
  if (includeTableOfContents && contentElements.some(e => e.type.startsWith('heading'))) {
    const tocText = buildTableOfContents(contentElements);
    const tocStartIndex = currentIndex;
    fullText += tocText;
    currentIndex += tocText.length;
    
    // Style the TOC header
    styleRanges.push({ 
      startIndex: tocStartIndex, 
      endIndex: tocStartIndex + 'TABLE OF CONTENTS'.length, 
      style: 'HEADING_1' 
    });
  }
  
  // Add remaining content
  for (const element of contentElements) {
    const startIndex = currentIndex;
    let text = element.text;
    
    switch (element.type) {
      case 'heading1':
        text += '\n';
        fullText += text;
        styleRanges.push({ startIndex, endIndex: startIndex + element.text.length, style: 'HEADING_1' });
        break;
        
      case 'heading2':
        text += '\n';
        fullText += text;
        styleRanges.push({ startIndex, endIndex: startIndex + element.text.length, style: 'HEADING_2' });
        break;
        
      case 'heading3':
        text += '\n';
        fullText += text;
        styleRanges.push({ startIndex, endIndex: startIndex + element.text.length, style: 'HEADING_3' });
        break;
        
      case 'heading4':
        text += '\n';
        fullText += text;
        styleRanges.push({ startIndex, endIndex: startIndex + element.text.length, style: 'HEADING_4' });
        break;
        
      case 'separator':
        text = '────────────────────────────────────────\n';
        fullText += text;
        break;
        
      case 'bullet':
        text = '• ' + element.text + '\n';
        fullText += text;
        break;
        
      case 'numbered':
        text = element.text + '\n';
        fullText += text;
        break;
        
      case 'table_row':
        text += '\n';
        fullText += text;
        break;
        
      case 'code_block':
        text = element.text + '\n\n';
        fullText += text;
        break;
        
      case 'paragraph':
      default:
        text += '\n';
        fullText += text;
        break;
    }
    
    currentIndex = startIndex + text.length;
  }
  
  // Clear the document first
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
  
  // Insert the full text
  requests.push({
    insertText: {
      location: { index: 1 },
      text: fullText
    }
  });
  
  // Apply styles to headings
  for (const range of styleRanges) {
    requests.push({
      updateParagraphStyle: {
        range: {
          startIndex: range.startIndex,
          endIndex: range.endIndex
        },
        paragraphStyle: {
          namedStyleType: range.style
        },
        fields: 'namedStyleType'
      }
    });
    
    // Center title and subtitle
    if (range.style === 'TITLE' || range.style === 'SUBTITLE') {
      requests.push({
        updateParagraphStyle: {
          range: {
            startIndex: range.startIndex,
            endIndex: range.endIndex
          },
          paragraphStyle: {
            alignment: 'CENTER'
          },
          fields: 'alignment'
        }
      });
    }
  }
  
  // Execute the batch update
  await docs.documents.batchUpdate({
    documentId,
    requestBody: { requests }
  });
  
}

export async function syncMarkdownToGoogleDoc(title: string, markdownContent: string, options?: { formatted?: boolean }): Promise<DocumentInfo> {
  const docInfo = await findOrCreateDocument(title);
  
  // Check if we should use formatted sync (with headings, TOC, etc.)
  const useFormatted = options?.formatted ?? false;
  
  if (useFormatted) {
    const elements = parseMarkdownToElements(markdownContent);
    const includeTableOfContents = true; // Always include TOC for formatted docs
    await applyFormattingWithTOC(docInfo.documentId, elements, includeTableOfContents);
    console.log(`[Google Docs] Synced with formatting: ${title} (${docInfo.documentId})`);
    return docInfo;
  }
  
  // Original plain-text sync logic
  const hasMermaid = markdownContent.includes('```mermaid');
  
  let plainText = markdownContent
    .replace(/^#{1,6}\s+/gm, (match) => match.toUpperCase())
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^\s*[-*]\s+/gm, '• ');
  
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

export async function syncFormattedDocument(title: string, markdownContent: string): Promise<DocumentInfo> {
  return syncMarkdownToGoogleDoc(title, markdownContent, { formatted: true });
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

// Find documents with similar names (e.g., "One-Pager" vs "Onepager")
export async function findSimilarDocuments(): Promise<Array<{
  group: string;
  docs: Array<{ id: string; name: string; modifiedTime: string; createdTime: string }>;
}>> {
  const docs = await listFolderDocuments();
  const groups: Array<{
    group: string;
    docs: Array<{ id: string; name: string; modifiedTime: string; createdTime: string }>;
  }> = [];
  
  // Define known similar name patterns
  const similarPatterns = [
    ['One-Pager', 'Onepager', 'One Pager'],
    ['Game Design Document', 'Game Design'],
    ['Security & Compliance', 'Security and Compliance'],
  ];
  
  for (const pattern of similarPatterns) {
    const matchingDocs = docs.filter(d => 
      pattern.some(p => d.name.toLowerCase().includes(p.toLowerCase()))
    );
    if (matchingDocs.length > 1) {
      groups.push({
        group: pattern[0],
        docs: matchingDocs.sort((a, b) => 
          new Date(b.modifiedTime).getTime() - new Date(a.modifiedTime).getTime()
        )
      });
    }
  }
  
  return groups;
}

// Delete a document permanently (not just trash)
export async function deleteDocument(documentId: string): Promise<void> {
  const drive = await getGoogleDriveClient();
  
  await drive.files.delete({
    fileId: documentId
  });
  
  console.log(`[Google Docs] Permanently deleted document ${documentId}`);
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
  syncFormattedDocument,
  listFolderDocuments,
  findDuplicateDocuments,
  findSimilarDocuments,
  trashDocument,
  deleteDocument,
  cleanupDuplicates
};
