import jsPDF from "jspdf";

const NAVY = [30, 58, 95] as const;
const GREEN = [34, 197, 94] as const;
const DARK_GRAY = [51, 51, 51] as const;
const MED_GRAY = [100, 100, 100] as const;
const LIGHT_GRAY = [200, 200, 200] as const;

function addWrappedText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const lines = doc.splitTextToSize(text, maxWidth);
  for (const line of lines) {
    if (y > 270) {
      doc.addPage();
      y = 25;
    }
    doc.text(line, x, y);
    y += lineHeight;
  }
  return y;
}

function checkPageBreak(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > 270) {
    doc.addPage();
    return 25;
  }
  return y;
}

function addSectionHeader(doc: jsPDF, title: string, y: number, margin: number): number {
  y = checkPageBreak(doc, y, 20);
  doc.setTextColor(...NAVY);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(title.toUpperCase(), margin, y);
  y += 3;
  doc.setDrawColor(...GREEN);
  doc.setLineWidth(0.5);
  doc.line(margin, y, margin + 45, y);
  y += 8;
  return y;
}

function addSubHeader(doc: jsPDF, title: string, y: number, margin: number): number {
  y = checkPageBreak(doc, y, 12);
  doc.setTextColor(...NAVY);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(title, margin, y);
  y += 6;
  return y;
}

function addBodyText(doc: jsPDF, text: string, y: number, margin: number, contentWidth: number): number {
  doc.setTextColor(...DARK_GRAY);
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "normal");
  y = addWrappedText(doc, text, margin, y, contentWidth, 4.5);
  y += 3;
  return y;
}

function addBulletPoint(doc: jsPDF, text: string, y: number, margin: number, contentWidth: number): number {
  y = checkPageBreak(doc, y, 8);
  doc.setTextColor(...DARK_GRAY);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("\u2022", margin + 4, y);
  y = addWrappedText(doc, text, margin + 10, y, contentWidth - 14, 4.5);
  y += 1;
  return y;
}

function addNumberedStep(doc: jsPDF, num: number, title: string, desc: string, y: number, margin: number, contentWidth: number): number {
  y = checkPageBreak(doc, y, 16);
  doc.setFillColor(...GREEN);
  doc.circle(margin + 4, y - 1.5, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text(String(num), margin + 2.8, y);

  doc.setTextColor(...DARK_GRAY);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(title, margin + 12, y);
  y += 5;

  doc.setTextColor(...MED_GRAY);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  y = addWrappedText(doc, desc, margin + 12, y, contentWidth - 16, 4.5);
  y += 3;
  return y;
}

function addHeader(doc: jsPDF, title: string, subtitle: string): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;

  doc.setFillColor(...NAVY);
  doc.rect(0, 0, pageWidth, 42, "F");

  doc.setFillColor(...GREEN);
  doc.rect(0, 42, pageWidth, 2, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("FUTURE WORK ACADEMY", margin, 14);

  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(title, margin, 28);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(200, 200, 200);
  doc.text(subtitle, margin, 36);
}

function addFooter(doc: jsPDF): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(...LIGHT_GRAY);
    doc.line(20, 280, pageWidth - 20, 280);
    doc.setTextColor(...LIGHT_GRAY);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Future Work Academy | Page ${i} of ${pageCount}`,
      pageWidth / 2,
      285,
      { align: "center" }
    );
  }
}

interface CharacterSummary {
  name: string;
  role: string;
  title?: string;
  company?: string;
  headline?: string;
}

export async function generateStudentGuidePDF(characters?: CharacterSummary[]): Promise<void> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y: number;

  addHeader(doc, "Student Guide", "Everything you need to succeed in the Apex Manufacturing simulation");

  y = 52;

  y = addSectionHeader(doc, "Getting Started", y, margin);
  y = addNumberedStep(doc, 1, "Log In", "Click \"Log in with Replit\" on the homepage. Use the same email your instructor registered you with.", y, margin, contentWidth);
  y = addNumberedStep(doc, 2, "Join Your Class", "Your instructor will share a direct invite link or an enrollment code. Click the link to join automatically, or enter the code manually after signing in.", y, margin, contentWidth);
  y = addNumberedStep(doc, 3, "Get Assigned to a Team", "Your instructor will assign you to a team. You'll work with your team throughout the 8-week simulation.", y, margin, contentWidth);
  y = addNumberedStep(doc, 4, "Understand Your Role", "You are the CEO of Apex Manufacturing, a mid-sized company navigating an AI transformation. Every decision you make impacts employees, finances, and company culture.", y, margin, contentWidth);
  y += 4;

  y = addSectionHeader(doc, "Weekly Workflow", y, margin);
  y = addBodyText(doc, "Each simulation week follows a consistent three-step pattern:", y, margin, contentWidth);
  y = addNumberedStep(doc, 1, "Intelligence Briefing", "Read the weekly scenario context, listen to stakeholder voicemails, and review industry intel articles. These provide critical information for your decisions.", y, margin, contentWidth);
  y = addNumberedStep(doc, 2, "Make Decisions", "Each week has 2 decisions. Choose from the available options (A, B, C, sometimes D) and write an essay explaining your reasoning. All decisions must be completed to advance.", y, margin, contentWidth);
  y = addNumberedStep(doc, 3, "View Results", "After your instructor advances the simulation, review your AI-graded essay feedback, score changes, and the consequences of your decisions.", y, margin, contentWidth);
  y += 4;

  y = addSectionHeader(doc, "Your Dashboard", y, margin);
  y = addBodyText(doc, "Your dashboard shows key company metrics that change based on your decisions:", y, margin, contentWidth);
  y = addBulletPoint(doc, "Revenue - Company income affected by strategic choices", y, margin, contentWidth);
  y = addBulletPoint(doc, "Employees - Total workforce count", y, margin, contentWidth);
  y = addBulletPoint(doc, "Morale - Employee satisfaction and engagement", y, margin, contentWidth);
  y = addBulletPoint(doc, "Union Sentiment - Risk level of labor relations", y, margin, contentWidth);
  y = addBulletPoint(doc, "Debt - Outstanding financial obligations", y, margin, contentWidth);
  y = addBulletPoint(doc, "Automation Level - Degree of AI/tech adoption", y, margin, contentWidth);
  y += 4;

  y = addSectionHeader(doc, "Phone-a-Friend Advisors", y, margin);
  y = addBodyText(doc, "Stuck on a tough decision? You have access to 9 specialized advisors who provide AI-generated strategic guidance. Advisors span three categories: Strategy Consultants, Industry Experts, and Thought Leaders.", y, margin, contentWidth);
  y = checkPageBreak(doc, y, 18);
  doc.setFillColor(245, 247, 255);
  doc.roundedRect(margin, y - 2, contentWidth, 14, 1, 1, "F");
  doc.setDrawColor(...NAVY);
  doc.setLineWidth(0.6);
  doc.line(margin + 3, y, margin + 3, y + 9);
  doc.setTextColor(...NAVY);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Important: You have only 3 advisor credits for the entire simulation.", margin + 8, y + 4);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text("Use them wisely on your most challenging decisions.", margin + 8, y + 9);
  y += 18;

  y = addSectionHeader(doc, "How You're Scored", y, margin);
  y = addSubHeader(doc, "Financial Score", y, margin);
  y = addBodyText(doc, "Based on revenue growth, cost management, and return on investment. Strong financial decisions improve shareholder value and company sustainability.", y, margin, contentWidth);
  y = addSubHeader(doc, "Cultural Score", y, margin);
  y = addBodyText(doc, "Measures employee morale, union relations, and workforce adaptability. People-focused decisions build a resilient organization.", y, margin, contentWidth);
  y = addSubHeader(doc, "Essay Evaluation Criteria", y, margin);
  y = addBulletPoint(doc, "Evidence Quality - Use specific data and facts from briefings to support your reasoning", y, margin, contentWidth);
  y = addBulletPoint(doc, "Reasoning Coherence - Present clear logical connections between your analysis and decisions", y, margin, contentWidth);
  y = addBulletPoint(doc, "Trade-off Analysis - Acknowledge and weigh the pros and cons of each option", y, margin, contentWidth);
  y = addBulletPoint(doc, "Stakeholder Consideration - Address the perspectives of employees, board, union, and customers", y, margin, contentWidth);
  y += 4;

  y = addSectionHeader(doc, "Character Profiles", y, margin);
  y = addBodyText(doc, "Apex Manufacturing has 17 stakeholders with unique personalities and traits. Click on character names in briefings and decisions to view their profiles, or visit the Stakeholder Directory in the app for the full catalog.", y, margin, contentWidth);
  if (characters && characters.length > 0) {
    for (const char of characters) {
      y = checkPageBreak(doc, y, 16);
      doc.setTextColor(...NAVY);
      doc.setFontSize(9.5);
      doc.setFont("helvetica", "bold");
      doc.text(char.name, margin + 4, y);
      doc.setTextColor(...MED_GRAY);
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      const roleText = [char.title || char.role, char.company].filter(Boolean).join(" — ");
      doc.text(roleText, margin + 4, y + 4);
      if (char.headline) {
        y = addWrappedText(doc, char.headline, margin + 4, y + 8, contentWidth - 8, 4);
        y += 2;
      } else {
        y += 10;
      }
    }
  }
  y += 4;

  y = addSectionHeader(doc, "Tips for Success", y, margin);
  y = addBulletPoint(doc, "Read all intel articles - they contain hints about upcoming challenges and earn engagement bonus points", y, margin, contentWidth);
  y = addBulletPoint(doc, "Listen to every voicemail - stakeholders' concerns foreshadow your decisions", y, margin, contentWidth);
  y = addBulletPoint(doc, "Reference specific data from briefings in your essays for higher scores", y, margin, contentWidth);
  y = addBulletPoint(doc, "Consider multiple stakeholders - don't just focus on one group", y, margin, contentWidth);
  y = addBulletPoint(doc, "Balance short-term gains with long-term sustainability", y, margin, contentWidth);
  y = addBulletPoint(doc, "Quality reasoning matters as much as the choice itself", y, margin, contentWidth);
  y += 4;

  y = addSectionHeader(doc, "Need Help?", y, margin);
  y = addBulletPoint(doc, "Academic questions (grading, deadlines): Contact your professor", y, margin, contentWidth);
  y = addBulletPoint(doc, "Technical issues (login, bugs): Email support@futureworkacademy.com", y, margin, contentWidth);
  y = addBulletPoint(doc, "Platform questions: Use the AI Q&A assistant available in the app", y, margin, contentWidth);

  addFooter(doc);
  doc.save("Future_Work_Academy_Student_Guide.pdf");
}

export function generateInstructorGuidePDF(): void {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y: number;

  addHeader(doc, "Instructor Guide", "Complete guide to setting up and managing your simulation class");

  y = 52;

  y = addSectionHeader(doc, "Getting Started", y, margin);
  y = addNumberedStep(doc, 1, "Create Your Account", "Log in via Replit OIDC authentication. Your account will be set up as an instructor.", y, margin, contentWidth);
  y = addNumberedStep(doc, 2, "Set Up Your Class", "Create an organization for your course. You'll receive a unique enrollment code (e.g., BUS501F26).", y, margin, contentWidth);
  y = addNumberedStep(doc, 3, "Share the Invite Link or Code", "Share your class invite link (e.g., yourdomain.com/join/BUS501F26) or enrollment code. The invite link is easiest — students click it, sign in, and are enrolled automatically.", y, margin, contentWidth);
  y = addNumberedStep(doc, 4, "Privacy Mode (Optional)", "Enable Privacy Mode for anonymized enrollment - no .edu email verification, no PII collected, students identified by pseudonymous IDs.", y, margin, contentWidth);
  y += 4;

  y = addSectionHeader(doc, "Managing Your Class", y, margin);
  y = addSubHeader(doc, "Class Admin Dashboard", y, margin);
  y = addBodyText(doc, "Your command center for managing students, teams, and the simulation. Access it from the sidebar after logging in.", y, margin, contentWidth);
  y = addSubHeader(doc, "Adding Students", y, margin);
  y = addBulletPoint(doc, "Manual: Click \"Add Member\" and enter student email addresses one at a time", y, margin, contentWidth);
  y = addBulletPoint(doc, "Bulk Import: Upload a CSV file with student names and emails", y, margin, contentWidth);
  y = addBulletPoint(doc, "Self-Enrollment: Share the invite link (recommended) or class code for students to join themselves", y, margin, contentWidth);
  y = addSubHeader(doc, "Team Management", y, margin);
  y = addBodyText(doc, "Create teams from the Teams tab, then assign students using the dropdown in the Members tab. Teams of 3-5 students work best. All team members share the same simulation state and scores.", y, margin, contentWidth);
  y += 4;

  y = addSectionHeader(doc, "Simulation Controls", y, margin);
  y = addSubHeader(doc, "Starting the Simulation", y, margin);
  y = addBodyText(doc, "From the Simulation tab, set the starting week and launch the simulation. Students will immediately see their first briefing and decisions.", y, margin, contentWidth);
  y = addSubHeader(doc, "Advancing Weeks", y, margin);
  y = addBodyText(doc, "When you're ready to move to the next week, use the \"Advance Week\" control. This triggers AI grading of essays, calculates score changes, and unlocks the next week's content. Students receive email notifications.", y, margin, contentWidth);
  y = addSubHeader(doc, "The 8-Week Structure", y, margin);
  y = addBulletPoint(doc, "Weeks 1-2: Introduction to Apex Manufacturing and initial AI assessment", y, margin, contentWidth);
  y = addBulletPoint(doc, "Weeks 3-4: Workforce planning and stakeholder management challenges", y, margin, contentWidth);
  y = addBulletPoint(doc, "Weeks 5-6: Scaling decisions and managing resistance", y, margin, contentWidth);
  y = addBulletPoint(doc, "Weeks 7-8: Long-term strategy and transformation outcomes", y, margin, contentWidth);
  y += 4;

  y = addSectionHeader(doc, "Grading & Assessment", y, margin);
  y = addSubHeader(doc, "Dual Scoring System", y, margin);
  y = addBodyText(doc, "Students are scored on two dimensions: Financial Score (revenue, costs, ROI) and Cultural Score (morale, union relations, adaptability). This dual system ensures students can't succeed by optimizing for just one dimension.", y, margin, contentWidth);
  y = addSubHeader(doc, "AI Essay Evaluation", y, margin);
  y = addBodyText(doc, "Student essays are evaluated by AI using a transparent 4-criteria rubric:", y, margin, contentWidth);
  y = addBulletPoint(doc, "Evidence Quality - Did they reference specific data from briefings?", y, margin, contentWidth);
  y = addBulletPoint(doc, "Reasoning Coherence - Is their logic clear and well-structured?", y, margin, contentWidth);
  y = addBulletPoint(doc, "Trade-off Analysis - Did they acknowledge pros and cons?", y, margin, contentWidth);
  y = addBulletPoint(doc, "Stakeholder Consideration - Did they consider multiple perspectives?", y, margin, contentWidth);
  y += 4;

  y = addSectionHeader(doc, "Monitoring Progress", y, margin);
  y = addBulletPoint(doc, "Content Views: Track which students have read briefings, articles, and listened to voicemails", y, margin, contentWidth);
  y = addBulletPoint(doc, "Decision Submissions: Monitor which teams have submitted their weekly decisions", y, margin, contentWidth);
  y = addBulletPoint(doc, "Engagement Metrics: Identify students who may need encouragement to participate", y, margin, contentWidth);
  y = addBulletPoint(doc, "Leaderboard: Use competitive rankings to drive healthy engagement", y, margin, contentWidth);
  y += 4;

  y = addSectionHeader(doc, "Communication Tools", y, margin);
  y = addBulletPoint(doc, "Email Notifications: Send custom messages to individual students or the entire class via SendGrid", y, margin, contentWidth);
  y = addBulletPoint(doc, "SMS Notifications: Optional Twilio integration for time-sensitive reminders", y, margin, contentWidth);
  y = addBulletPoint(doc, "Week Advance Notifications: Automatic emails when new weeks are released", y, margin, contentWidth);
  y = addBulletPoint(doc, "Custom Reminders: Create and send reminder messages from the Class Admin dashboard", y, margin, contentWidth);
  y += 4;

  y = addSectionHeader(doc, "Difficulty Levels", y, margin);
  y = addBodyText(doc, "The simulation offers three difficulty tiers:", y, margin, contentWidth);
  y = addBulletPoint(doc, "Introductory: Simpler decisions with clearer trade-offs. Best for undergraduate courses.", y, margin, contentWidth);
  y = addBulletPoint(doc, "Standard: Balanced complexity with nuanced stakeholder dynamics. Recommended for MBA courses.", y, margin, contentWidth);
  y = addBulletPoint(doc, "Advanced: Complex multi-stakeholder scenarios with ambiguous outcomes. For executive education.", y, margin, contentWidth);
  y = addBodyText(doc, "Difficulty is configured through 11 quantifiable factors that affect decision complexity, essay expectations, and scoring sensitivity.", y, margin, contentWidth);
  y += 4;

  y = addSectionHeader(doc, "Tips for Instructors", y, margin);
  y = addBulletPoint(doc, "Run through the simulation yourself first using the Student Sandbox preview mode", y, margin, contentWidth);
  y = addBulletPoint(doc, "Set clear weekly deadlines for decision submissions", y, margin, contentWidth);
  y = addBulletPoint(doc, "Use the simulation's AI ethics themes as springboards for classroom discussion", y, margin, contentWidth);
  y = addBulletPoint(doc, "Review AI-generated essay feedback to calibrate your own grading expectations", y, margin, contentWidth);
  y = addBulletPoint(doc, "Teams of 3-5 students produce the best collaborative dynamics", y, margin, contentWidth);
  y = addBulletPoint(doc, "The leaderboard drives healthy competition - reference it in class", y, margin, contentWidth);
  y += 4;

  y = addSectionHeader(doc, "Need Help?", y, margin);
  y = addBulletPoint(doc, "Technical support: support@futureworkacademy.com", y, margin, contentWidth);
  y = addBulletPoint(doc, "Platform questions: Use the AI Q&A assistant available in the app", y, margin, contentWidth);
  y = addBulletPoint(doc, "Direct contact: Reach out to Doug Mitchell (platform creator)", y, margin, contentWidth);

  addFooter(doc);
  doc.save("Future_Work_Academy_Instructor_Guide.pdf");
}
