// Twilio integration for SMS notifications
// Uses Replit Twilio connector for authentication

import twilio from 'twilio';

let connectionSettings: any;

async function getCredentials() {
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
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=twilio',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || (!connectionSettings.settings.account_sid || !connectionSettings.settings.api_key || !connectionSettings.settings.api_key_secret)) {
    throw new Error('Twilio not connected');
  }
  return {
    accountSid: connectionSettings.settings.account_sid,
    apiKey: connectionSettings.settings.api_key,
    apiKeySecret: connectionSettings.settings.api_key_secret,
    phoneNumber: connectionSettings.settings.phone_number
  };
}

export async function getTwilioClient() {
  const { accountSid, apiKey, apiKeySecret } = await getCredentials();
  return twilio(apiKey, apiKeySecret, {
    accountSid: accountSid
  });
}

export async function getTwilioFromPhoneNumber() {
  const { phoneNumber } = await getCredentials();
  return phoneNumber;
}

// Notification types for the simulation game
export type NotificationType = 
  | 'student_signup'
  | 'team_assignment'
  | 'week_advanced'
  | 'decision_submitted'
  | 'organization_created'
  | 'educator_inquiry';

interface NotificationData {
  studentName?: string;
  studentEmail?: string;
  teamName?: string;
  organizationName?: string;
  weekNumber?: number;
  decisionTitle?: string;
  inquirerName?: string;
  inquirerEmail?: string;
  inquiryType?: string;
  institution?: string;
}

// Send SMS notification to admin/instructor
export async function sendSmsNotification(
  toPhoneNumber: string,
  notificationType: NotificationType,
  data: NotificationData
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const client = await getTwilioClient();
    const fromNumber = await getTwilioFromPhoneNumber();

    if (!fromNumber) {
      return { success: false, error: 'No Twilio phone number configured' };
    }

    const message = generateNotificationMessage(notificationType, data);

    const result = await client.messages.create({
      body: message,
      from: fromNumber,
      to: toPhoneNumber
    });

    console.log(`[Twilio] SMS sent: ${result.sid}`);
    return { success: true, messageId: result.sid };
  } catch (error: any) {
    console.error('[Twilio] Failed to send SMS:', error.message);
    return { success: false, error: error.message };
  }
}

// Generate message based on notification type
function generateNotificationMessage(type: NotificationType, data: NotificationData): string {
  switch (type) {
    case 'student_signup':
      return `[Future of Work] New student signup: ${data.studentName} (${data.studentEmail}) has joined${data.organizationName ? ` ${data.organizationName}` : ''}.`;
    
    case 'team_assignment':
      return `[Future of Work] ${data.studentName} has been assigned to ${data.teamName}.`;
    
    case 'week_advanced':
      return `[Future of Work] ${data.teamName} has advanced to Week ${data.weekNumber}.`;
    
    case 'decision_submitted':
      return `[Future of Work] ${data.teamName} submitted: ${data.decisionTitle}.`;
    
    case 'organization_created':
      return `[Future of Work] New organization created: ${data.organizationName}.`;
    
    case 'educator_inquiry':
      return `[Future of Work] New educator inquiry from ${data.inquirerName} (${data.inquirerEmail})${data.institution ? ` at ${data.institution}` : ''}. Type: ${data.inquiryType || 'general'}.`;
    
    default:
      return `[Future of Work] Notification: ${JSON.stringify(data)}`;
  }
}

// Check if Twilio is configured
export async function isTwilioConfigured(): Promise<boolean> {
  try {
    await getCredentials();
    return true;
  } catch {
    return false;
  }
}
