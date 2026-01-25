// Google Docs Integration Service
// Connected via Replit Google Docs connector

import { google } from 'googleapis';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
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

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-docs',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('Google Docs not connected');
  }
  return accessToken;
}

async function getUncachableGoogleDocsClient() {
  const accessToken = await getAccessToken();

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken
  });

  return google.docs({ version: 'v1', auth: oauth2Client });
}

async function getGoogleDriveClient() {
  const accessToken = await getAccessToken();

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
  
  const response = await drive.files.list({
    q: `mimeType='application/vnd.google-apps.document' and name='${title.replace(/'/g, "\\'")}'`,
    fields: 'files(id, name)',
    pageSize: 1
  });

  if (response.data.files && response.data.files.length > 0) {
    return {
      documentId: response.data.files[0].id!,
      title: response.data.files[0].name!
    };
  }

  return await createDocument(title);
}

export async function syncMarkdownToGoogleDoc(title: string, markdownContent: string): Promise<DocumentInfo> {
  const docInfo = await findOrCreateDocument(title);
  
  const plainText = markdownContent
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^\s*[-*]\s+/gm, '• ')
    .replace(/^\s*\d+\.\s+/gm, (match, offset, string) => {
      return match;
    });
  
  await updateDocumentContent(docInfo.documentId, plainText);
  
  return docInfo;
}

export const googleDocsService = {
  createDocument,
  getDocument,
  updateDocumentContent,
  appendToDocument,
  listDocuments,
  findOrCreateDocument,
  syncMarkdownToGoogleDoc
};
