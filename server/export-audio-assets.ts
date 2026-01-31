// Export all audio assets (voicemails + advisors) to a Google Doc
import { db } from './db';
import { triggeredVoicemails, advisors, characterProfiles } from '@shared/models/auth';
import { eq } from 'drizzle-orm';
import { google } from 'googleapis';

let docsConnectionSettings: any;
let driveConnectionSettings: any;

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

async function getGoogleDocsClient() {
  const accessToken = await getDocsAccessToken();
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });
  return google.docs({ version: 'v1', auth: oauth2Client });
}

async function getGoogleDriveClient() {
  const accessToken = await getDriveAccessToken();
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });
  return google.drive({ version: 'v3', auth: oauth2Client });
}

// Get or create the Future Work Academy folder
async function getOrCreateFolder(): Promise<string> {
  const drive = await getGoogleDriveClient();
  const folderName = 'Future Work Academy';
  
  // Search for existing folder
  const response = await drive.files.list({
    q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id, name)',
  });

  if (response.data.files && response.data.files.length > 0) {
    return response.data.files[0].id!;
  }

  // Create new folder
  const folder = await drive.files.create({
    requestBody: {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
    },
    fields: 'id',
  });

  return folder.data.id!;
}

// Get the Replit app URL
function getAppUrl(): string {
  const replitUrl = process.env.REPLIT_DEV_DOMAIN || process.env.REPL_SLUG;
  if (replitUrl) {
    return `https://${replitUrl}`;
  }
  return 'https://your-app-url.replit.app';
}

async function exportAudioAssets() {
  console.log('📄 Exporting Audio Assets to Google Doc...\n');

  const appUrl = getAppUrl();
  console.log(`App URL: ${appUrl}\n`);

  // Fetch all voicemails
  const voicemails = await db.select().from(triggeredVoicemails).orderBy(triggeredVoicemails.weekNumber);
  console.log(`Found ${voicemails.length} voicemails`);

  // Fetch all advisors
  const allAdvisors = await db.select().from(advisors);
  console.log(`Found ${allAdvisors.length} advisors`);

  // Fetch character profiles for voicemails
  const characters = await db.select().from(characterProfiles);
  const characterMap = new Map(characters.map(c => [c.name, c]));

  // Build the document content
  const docTitle = `Future Work Academy - Audio Assets Review (${new Date().toLocaleDateString()})`;
  
  // Create the document using Drive API
  const drive = await getGoogleDriveClient();
  const folderId = await getOrCreateFolder();
  
  const docFile = await drive.files.create({
    requestBody: {
      name: docTitle,
      mimeType: 'application/vnd.google-apps.document',
      parents: [folderId],
    },
    fields: 'id',
  });

  const documentId = docFile.data.id!;
  console.log(`Created document: ${documentId}`);

  // Now use Docs API to add content
  const docs = await getGoogleDocsClient();

  // Build requests array for batch update
  const requests: any[] = [];
  let index = 1;

  // Helper to add text
  const addText = (text: string, bold = false, fontSize = 11) => {
    const endIndex = index + text.length;
    requests.push({
      insertText: {
        location: { index },
        text,
      }
    });
    if (bold) {
      requests.push({
        updateTextStyle: {
          range: { startIndex: index, endIndex },
          textStyle: { bold: true },
          fields: 'bold',
        }
      });
    }
    if (fontSize !== 11) {
      requests.push({
        updateTextStyle: {
          range: { startIndex: index, endIndex },
          textStyle: { fontSize: { magnitude: fontSize, unit: 'PT' } },
          fields: 'fontSize',
        }
      });
    }
    index = endIndex;
  };

  // Add title
  addText('FUTURE WORK ACADEMY\n', true, 24);
  addText('Audio Assets Review Document\n\n', false, 14);
  addText(`Generated: ${new Date().toLocaleString()}\n`, false, 10);
  addText(`App URL: ${appUrl}\n\n`, false, 10);
  addText('────────────────────────────────────────\n\n', false, 11);

  // SECTION 1: Weekly Voicemails
  addText('SECTION 1: WEEKLY VOICEMAILS\n\n', true, 18);
  addText('Triggered voicemail messages from stakeholders that play at the start of each week.\n\n', false, 11);

  for (const voicemail of voicemails) {
    // Get character info
    const characterName = voicemail.characterId
      ?.split('-')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    const character = characterName ? characterMap.get(characterName) : null;

    addText(`Week ${voicemail.weekNumber}: ${voicemail.title}\n`, true, 14);
    addText('────────────────────\n', false, 11);
    
    addText('Character: ', true);
    addText(`${characterName || 'Unknown'}\n`);
    
    if (character) {
      addText('Role: ', true);
      addText(`${character.role || 'N/A'}\n`);
      addText('Title: ', true);
      addText(`${character.title || 'N/A'}\n`);
      if (character.bio) {
        addText('Bio: ', true);
        addText(`${character.bio.substring(0, 200)}...\n`);
      }
    }
    
    addText('Urgency: ', true);
    addText(`${voicemail.urgency?.toUpperCase() || 'MEDIUM'}\n`);
    
    if (voicemail.audioUrl) {
      addText('Audio URL: ', true);
      addText(`${appUrl}${voicemail.audioUrl}\n`);
    } else {
      addText('Audio URL: ', true);
      addText('Not generated\n');
    }
    
    addText('\nTranscript:\n', true);
    addText(`${voicemail.transcript}\n\n`);
    addText('────────────────────────────────────────\n\n', false, 11);
  }

  // SECTION 2: Phone-a-Friend Advisors
  addText('\n\nSECTION 2: PHONE-A-FRIEND ADVISORS\n\n', true, 18);
  addText('Expert advisors students can consult (3 credits per simulation).\n\n', false, 11);

  const categories = [
    { key: 'consultant', label: 'Strategy Consultants' },
    { key: 'industry_expert', label: 'Industry Experts' },
    { key: 'thought_leader', label: 'Thought Leaders' },
  ];

  for (const category of categories) {
    const categoryAdvisors = allAdvisors.filter(a => a.category === category.key);
    if (categoryAdvisors.length === 0) continue;

    addText(`\n${category.label.toUpperCase()}\n`, true, 16);
    addText('════════════════════\n\n', false, 11);

    for (const advisor of categoryAdvisors) {
      addText(`${advisor.name}\n`, true, 14);
      addText('────────────────────\n', false, 11);
      
      addText('Title: ', true);
      addText(`${advisor.title}\n`);
      
      addText('Organization: ', true);
      addText(`${advisor.organization}\n`);
      
      addText('Specialty: ', true);
      addText(`${advisor.specialty}\n`);
      
      addText('Category: ', true);
      addText(`${category.label}\n`);
      
      if (advisor.audioUrl) {
        addText('Audio URL: ', true);
        addText(`${appUrl}${advisor.audioUrl}\n`);
      } else {
        addText('Audio URL: ', true);
        addText('Not generated\n');
      }
      
      addText('\nBio:\n', true);
      addText(`${advisor.bio}\n\n`);
      
      addText('Key Insights:\n', true);
      const insights = advisor.keyInsights as string[] || [];
      for (const insight of insights) {
        addText(`• ${insight}\n`);
      }
      
      addText('\nTranscript:\n', true);
      addText(`${advisor.transcript}\n\n`);
      addText('────────────────────────────────────────\n\n', false, 11);
    }
  }

  // Add summary at the end
  addText('\n\nSUMMARY\n', true, 18);
  addText('════════════════════\n\n', false, 11);
  addText(`Total Voicemails: ${voicemails.length}\n`);
  addText(`Total Advisors: ${allAdvisors.length}\n`);
  addText(`  - Consultants: ${allAdvisors.filter(a => a.category === 'consultant').length}\n`);
  addText(`  - Industry Experts: ${allAdvisors.filter(a => a.category === 'industry_expert').length}\n`);
  addText(`  - Thought Leaders: ${allAdvisors.filter(a => a.category === 'thought_leader').length}\n`);

  // Execute batch update
  await docs.documents.batchUpdate({
    documentId,
    requestBody: { requests },
  });

  // Get the document URL
  const docUrl = `https://docs.google.com/document/d/${documentId}/edit`;
  
  console.log('\n✅ Export complete!');
  console.log(`📄 Document URL: ${docUrl}`);
  console.log(`\nThe document has been saved to your Google Drive in the "Future Work Academy" folder.`);
  
  return docUrl;
}

exportAudioAssets().catch(console.error);
