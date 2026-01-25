// SendGrid Email Service - using Replit SendGrid integration
import sgMail from '@sendgrid/mail';

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
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=sendgrid',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || (!connectionSettings.settings.api_key || !connectionSettings.settings.from_email)) {
    throw new Error('SendGrid not connected');
  }
  return { apiKey: connectionSettings.settings.api_key, email: connectionSettings.settings.from_email };
}

async function getUncachableSendGridClient() {
  const { apiKey, email } = await getCredentials();
  sgMail.setApiKey(apiKey);
  return {
    client: sgMail,
    fromEmail: email
  };
}

export interface InvitationEmailData {
  toEmail: string;
  studentName: string;
  className: string;
  instructorName: string;
  loginUrl: string;
}

export async function sendInvitationEmail(data: InvitationEmailData): Promise<boolean> {
  try {
    const { client, fromEmail } = await getUncachableSendGridClient();
    
    const msg = {
      to: data.toEmail,
      from: fromEmail,
      subject: `You've been added to ${data.className} - The Future of Work Simulation`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f8; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #1a1f36 0%, #2d3555 100%); padding: 30px; text-align: center;">
              <img src="https://futureworkacademy.com/logo.png" alt="Future Work Academy" style="max-width: 220px; height: auto;" />
            </div>
            
            <div style="padding: 30px;">
              <h2 style="color: #1a1f36; margin-top: 0;">Welcome, ${data.studentName || 'Student'}!</h2>
              
              <p style="color: #475569; line-height: 1.6;">
                You've been added to <strong>${data.className}</strong> by ${data.instructorName}.
              </p>
              
              <p style="color: #475569; line-height: 1.6;">
                In this simulation, you'll step into the role of an executive at Apex Manufacturing, 
                navigating the challenges of AI adoption, workforce management, and strategic decision-making.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${data.loginUrl}" 
                   style="display: inline-block; background-color: #22c55e; color: #ffffff; padding: 14px 32px; 
                          text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                  Start the Simulation
                </a>
              </div>
              
              <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
                Click the button above to log in and begin. Make sure to use this email address 
                (<strong>${data.toEmail}</strong>) when signing in.
              </p>
            </div>
            
            <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                The Future of Work - A Business Simulation for Tomorrow's Leaders
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Welcome to The Future of Work Simulation!

Hi ${data.studentName || 'Student'},

You've been added to ${data.className} by ${data.instructorName}.

In this simulation, you'll step into the role of an executive at Apex Manufacturing, navigating the challenges of AI adoption, workforce management, and strategic decision-making.

To get started, visit: ${data.loginUrl}

Make sure to use this email address (${data.toEmail}) when signing in.

- The Future of Work Team
      `.trim()
    };

    await client.send(msg);
    console.log(`Invitation email sent to ${data.toEmail}`);
    return true;
  } catch (error: any) {
    // Log full SendGrid error details for debugging
    console.error(`Failed to send invitation email to ${data.toEmail}:`, error.message);
    if (error.response) {
      console.error('SendGrid Response Status:', error.response.statusCode || error.code);
      console.error('SendGrid Response Body:', JSON.stringify(error.response.body, null, 2));
    }
    if (error.code) {
      console.error('SendGrid Error Code:', error.code);
    }
    return false;
  }
}

export async function sendBulkInvitations(
  students: Array<{ email: string; name?: string }>,
  className: string,
  instructorName: string,
  loginUrl: string
): Promise<{ sent: number; failed: number; errors: string[] }> {
  const results = { sent: 0, failed: 0, errors: [] as string[] };
  
  for (const student of students) {
    const success = await sendInvitationEmail({
      toEmail: student.email,
      studentName: student.name || '',
      className,
      instructorName,
      loginUrl
    });
    
    if (success) {
      results.sent++;
    } else {
      results.failed++;
      results.errors.push(`Failed to send to ${student.email}`);
    }
  }
  
  return results;
}

export interface ReminderEmailData {
  toEmail: string;
  studentName: string;
  className: string;
  subject: string;
  message: string;
}

export async function sendReminderEmail(data: ReminderEmailData): Promise<boolean> {
  try {
    const { client, fromEmail } = await getUncachableSendGridClient();
    
    const formattedMessage = data.message.replace(/\n/g, '<br>');
    
    const msg = {
      to: data.toEmail,
      from: fromEmail,
      subject: `${data.subject} - ${data.className}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f8; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #1a1f36 0%, #2d3555 100%); padding: 30px; text-align: center;">
              <img src="https://futureworkacademy.com/logo.png" alt="Future Work Academy" style="max-width: 220px; height: auto;" />
              <p style="color: #94a3b8; margin: 12px 0 0 0; font-size: 14px;">${data.className}</p>
            </div>
            
            <div style="padding: 30px;">
              <h2 style="color: #1a1f36; margin-top: 0;">${data.subject}</h2>
              
              <p style="color: #475569; line-height: 1.6;">
                Hi ${data.studentName},
              </p>
              
              <div style="color: #475569; line-height: 1.8;">
                ${formattedMessage}
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://futureworkacademy.com" 
                   style="display: inline-block; background-color: #22c55e; color: #ffffff; padding: 14px 32px; 
                          text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                  Go to Dashboard
                </a>
              </div>
            </div>
            
            <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                The Future of Work - A Business Simulation for Tomorrow's Leaders
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
${data.subject}

Hi ${data.studentName},

${data.message}

Visit your dashboard: https://futureworkacademy.com

- The Future of Work Team
      `.trim()
    };

    await client.send(msg);
    console.log(`Reminder email sent to ${data.toEmail}`);
    return true;
  } catch (error: any) {
    console.error(`Failed to send reminder email to ${data.toEmail}:`, error.message);
    if (error.response) {
      console.error('SendGrid Response Status:', error.response.statusCode || error.code);
      console.error('SendGrid Response Body:', JSON.stringify(error.response.body, null, 2));
    }
    return false;
  }
}

export interface WeekResultsEmailData {
  toEmail: string;
  studentName: string;
  className: string;
  weekNumber: number;
  nextWeekNumber: number;
}

export async function sendWeekResultsEmail(data: WeekResultsEmailData): Promise<boolean> {
  try {
    const { client, fromEmail } = await getUncachableSendGridClient();
    
    const msg = {
      to: data.toEmail,
      from: fromEmail,
      subject: `Week ${data.weekNumber} Results Are In! - ${data.className}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f8; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #1a1f36 0%, #2d3555 100%); padding: 30px; text-align: center;">
              <img src="https://futureworkacademy.com/logo.png" alt="Future Work Academy" style="max-width: 220px; height: auto;" />
              <p style="color: #94a3b8; margin: 12px 0 0 0; font-size: 14px;">${data.className}</p>
            </div>
            
            <div style="padding: 30px;">
              <h2 style="color: #1a1f36; margin-top: 0;">Week ${data.weekNumber} Complete!</h2>
              
              <p style="color: #475569; line-height: 1.6;">
                Hi ${data.studentName},
              </p>
              
              <p style="color: #475569; line-height: 1.6;">
                Your Week ${data.weekNumber} results are now available. Log in to see your detailed performance analysis, 
                including AI-evaluated essay scores and feedback.
              </p>
              
              <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 16px; margin: 20px 0; border-radius: 4px;">
                <p style="color: #166534; margin: 0; font-weight: 600;">What's Next?</p>
                <p style="color: #166534; margin: 8px 0 0 0; font-size: 14px;">
                  Week ${data.nextWeekNumber} is now available. Review your results and prepare for new strategic challenges!
                </p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://futureworkacademy.com/week-results" 
                   style="display: inline-block; background-color: #22c55e; color: #ffffff; padding: 14px 32px; 
                          text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                  View Your Results
                </a>
              </div>
              
              <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
                Your essay responses were evaluated against our transparent 4-criteria rubric:
                Evidence Quality, Reasoning Coherence, Trade-off Analysis, and Stakeholder Consideration.
              </p>
            </div>
            
            <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                The Future of Work - A Business Simulation for Tomorrow's Leaders
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Week ${data.weekNumber} Complete!

Hi ${data.studentName},

Your Week ${data.weekNumber} results are now available. Log in to see your detailed performance analysis, including AI-evaluated essay scores and feedback.

What's Next?
Week ${data.nextWeekNumber} is now available. Review your results and prepare for new strategic challenges!

View your results at: https://futureworkacademy.com/week-results

- The Future of Work Team
      `.trim()
    };

    await client.send(msg);
    console.log(`Week results email sent to ${data.toEmail}`);
    return true;
  } catch (error: any) {
    console.error(`Failed to send week results email to ${data.toEmail}:`, error.message);
    if (error.response) {
      console.error('SendGrid Response Status:', error.response.statusCode || error.code);
      console.error('SendGrid Response Body:', JSON.stringify(error.response.body, null, 2));
    }
    return false;
  }
}

export async function sendBulkWeekResultsEmails(
  students: Array<{ email: string; firstName?: string; lastName?: string }>,
  className: string,
  weekNumber: number,
  nextWeekNumber: number
): Promise<{ sent: number; failed: number }> {
  const results = { sent: 0, failed: 0 };
  
  for (const student of students) {
    const studentName = [student.firstName, student.lastName].filter(Boolean).join(' ') || 'Student';
    const success = await sendWeekResultsEmail({
      toEmail: student.email,
      studentName,
      className,
      weekNumber,
      nextWeekNumber,
    });
    
    if (success) {
      results.sent++;
    } else {
      results.failed++;
    }
  }
  
  return results;
}
