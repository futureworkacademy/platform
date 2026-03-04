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

function addTableRow(doc: jsPDF, label: string, value: string, y: number, margin: number, contentWidth: number, isHeader: boolean = false): number {
  y = checkPageBreak(doc, y, 7);
  const colWidth = contentWidth / 2;

  if (isHeader) {
    doc.setFillColor(...NAVY);
    doc.rect(margin, y - 4, contentWidth, 6, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
  } else {
    doc.setFillColor(245, 247, 250);
    doc.rect(margin, y - 4, contentWidth, 6, "F");
    doc.setTextColor(...DARK_GRAY);
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
  }

  doc.text(label, margin + 2, y);
  doc.text(value, margin + colWidth + 2, y);
  y += 6;
  return y;
}

function addCalloutBox(doc: jsPDF, title: string, text: string, y: number, margin: number, contentWidth: number): number {
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  const textLines = doc.splitTextToSize(text, contentWidth - 16);
  const boxHeight = Math.max(14, textLines.length * 4 + 14);
  y = checkPageBreak(doc, y, boxHeight + 4);
  doc.setFillColor(245, 247, 255);
  doc.roundedRect(margin, y - 2, contentWidth, boxHeight, 1, 1, "F");
  doc.setDrawColor(...NAVY);
  doc.setLineWidth(0.6);
  doc.line(margin + 3, y, margin + 3, y + boxHeight - 5);
  doc.setTextColor(...NAVY);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(title, margin + 8, y + 4);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...MED_GRAY);
  doc.text(textLines, margin + 8, y + 9);
  y += boxHeight + 4;
  return y;
}

function addHeader(doc: jsPDF): void {
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

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Week 1 Offline Guide", margin, 28);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(200, 200, 200);
  doc.text("\"The Automation Imperative\" \u2014 Complete simulation materials for LMS delivery", margin, 36);
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
      `Future Work Academy | Week 1 Offline Guide | Page ${i} of ${pageCount}`,
      pageWidth / 2,
      285,
      { align: "center" }
    );
  }
}

export function generateWeek1OfflineGuidePDF(): void {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y: number;

  addHeader(doc);
  y = 52;

  y = addSectionHeader(doc, "How to Use This Guide", y, margin);
  y = addBodyText(doc, "This document contains everything students need to complete Week 1 of the Apex Manufacturing simulation without logging into the platform. Distribute via your LMS (Blackboard, Canvas, etc.) or as a printed handout.", y, margin, contentWidth);
  y = addNumberedStep(doc, 1, "Read the Situation Briefing", "Understand the scenario and company context", y, margin, contentWidth);
  y = addNumberedStep(doc, 2, "Review the Intel Articles", "Three research articles provide critical background", y, margin, contentWidth);
  y = addNumberedStep(doc, 3, "Choose a Decision Option", "Select one of three investment paths (A, B, or C)", y, margin, contentWidth);
  y = addNumberedStep(doc, 4, "Write a Strategic Rationale", "Minimum 100 words explaining your reasoning", y, margin, contentWidth);
  y = addNumberedStep(doc, 5, "Submit via LMS", "Use your institution's assignment submission system", y, margin, contentWidth);
  y += 4;

  y = addSectionHeader(doc, "Company Background", y, margin);
  y = addSubHeader(doc, "Apex Manufacturing - Company Profile", y, margin);
  y = addTableRow(doc, "Detail", "Value", y, margin, contentWidth, true);
  y = addTableRow(doc, "Company", "Apex Manufacturing", y, margin, contentWidth);
  y = addTableRow(doc, "Industry", "Automotive parts supplier", y, margin, contentWidth);
  y = addTableRow(doc, "Annual Revenue", "$125 million", y, margin, contentWidth);
  y = addTableRow(doc, "Employees", "2,400", y, margin, contentWidth);
  y = addTableRow(doc, "Average Tenure", "7.2 years", y, margin, contentWidth);
  y = addTableRow(doc, "Location", "Midwest United States", y, margin, contentWidth);
  y = addTableRow(doc, "Founded", "1987", y, margin, contentWidth);
  y = addTableRow(doc, "Current Automation Level", "12%", y, margin, contentWidth);
  y += 4;

  y = addSubHeader(doc, "Key Stakeholders", y, margin);
  y = addTableRow(doc, "Name & Role", "Disposition", y, margin, contentWidth, true);
  const stakeholders = [
    ["Victoria Hartwell - Board Chair", "Demanding, urgent about modernization"],
    ["David Chen - CFO", "Data-driven, focused on margins"],
    ["Margaret O'Brien - COO", "Operationally focused"],
    ["Sandra Williams - HR Director", "Empathetic, concerned about morale"],
    ["Frank Torres - Operations Manager", "Loyal to workers, cautious about change"],
    ["Jennifer Park - VP of Sales", "Customer-focused"],
    ["Robert Nakamura - General Counsel", "Risk-averse, legal compliance"],
    ["Marcus Webb - Union Organizer", "Protective of worker interests"],
    ["Patricia Lawson - Bank Representative", "Focused on debt covenants"],
    ["Dr. Nathan Cross - Industry Analyst", "Objective, data-focused"],
    ["Angela Reyes - Mayor", "Community impact concerns"],
    ["Thomas Richardson - Key Customer", "Demanding faster delivery"],
    ["Rachel Kim - Technology Vendor", "Promoting automation solutions"],
    ["Dr. Helen Mercer - External Consultant", "Strategic advisor"],
    ["Jaylen Brooks - Gen Z Representative", "Tech-savvy, optimistic about change"],
    ["Destiny Martinez - Gen Z Employee", "Entry-level perspective"],
    ["William Thornton III - Board Member (PE)", "Focused on returns"],
  ];
  for (const [name, disposition] of stakeholders) {
    y = addTableRow(doc, name, disposition, y, margin, contentWidth);
  }
  y += 6;

  y = addSectionHeader(doc, "Week 1 Situation Briefing", y, margin);
  y = addSubHeader(doc, "\"The Automation Imperative\"", y, margin);
  doc.setTextColor(...MED_GRAY);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "italic");
  y = addWrappedText(doc, "Theme: Financing and communicating AI strategy", margin, y, contentWidth, 4.5);
  y += 3;

  y = addBodyText(doc, "You arrive at the office early on a crisp Monday morning, the Midwest sun barely peeking through the clouds. As you step into the bustling headquarters of Apex Manufacturing, the weight of your new role as CEO settles heavily on your shoulders. Just last week, the Board of Directors, led by the formidable Victoria Hartwell, delivered a stark ultimatum: modernize or be replaced. The stakes have never been higher.", y, margin, contentWidth);
  y = addBodyText(doc, "Apex, a trusted name in the automotive parts supplier industry since 1987, is at a critical juncture. With annual revenues of $125 million and a workforce of 2,400 employees who have an average tenure of 7.2 years, the culture here is rooted in loyalty, craftsmanship, and a shared commitment to quality. Yet, the winds of change are blowing, and you must navigate them carefully.", y, margin, contentWidth);
  y = addBodyText(doc, "In your first meeting, CFO David Chen presents alarming financial projections. He outlines how Apex's current 12% automation level is trailing far behind competitors like AutoTech Industries and PrecisionParts Co., which boast automation rates of 35-50%. Without significant investments in automation, Chen warns of inevitable margin erosion and declining market competitiveness. The urgency of the situation is palpable, especially as Thomas Richardson, your key customer from AutoCorp, has been increasingly vocal, demanding faster delivery times to meet their production schedule.", y, margin, contentWidth);
  y = addBodyText(doc, "However, as you consider the implications of transformation, the atmosphere within the company grows tense. Rumors about potential job losses swirl among employees, igniting a sense of anxiety. As HR Director Sandra Williams emphasizes, maintaining morale and trust among your loyal workforce is paramount. The challenge lies in how to embrace technological advancement without alienating the very people who have contributed to Apex's success.", y, margin, contentWidth);
  y = addBodyText(doc, "In the backdrop, you recall the cautionary tales of competitors. AutoTech's aggressive automation strategy resulted in strikes and a steep decline in customer satisfaction, while FastParts' neglect of workforce investment led to poor quality and ultimately made them a target for acquisition. In contrast, PrecisionParts has achieved a balance between automation and workforce empowerment, earning them the title of Best Employer. You realize that the path ahead will demand not just strategic financial decisions, but also a deep understanding of human dynamics.", y, margin, contentWidth);
  y += 2;

  y = addSubHeader(doc, "Key Developments", y, margin);
  y = addBulletPoint(doc, "Board Ultimatum: Victoria Hartwell sets a clear mandate for transformation, stating unequivocally that failure to modernize will lead to leadership changes.", y, margin, contentWidth);
  y = addBulletPoint(doc, "Financial Insights: CFO David Chen presents a stark analysis revealing that without automation, Apex will face diminishing profit margins and an inability to compete effectively.", y, margin, contentWidth);
  y = addBulletPoint(doc, "Workforce Anxiety: HR Director Sandra Williams reports a growing unease among employees, sparked by rumors of job cuts, which threatens the company's longstanding culture of loyalty.", y, margin, contentWidth);
  y = addBulletPoint(doc, "Customer Pressure: Thomas Richardson from AutoCorp expresses his frustration over delivery timelines, increasing pressure on Apex to accelerate its response to market demands.", y, margin, contentWidth);
  y += 2;

  y = addSubHeader(doc, "Stakeholder Pulse", y, margin);
  y = addBulletPoint(doc, "Victoria Hartwell (Board Chair): Driven and focused, she feels a sense of urgency mixed with impatience. Her influence is unwavering, and she is determined to see Apex thrive in the face of automation.", y, margin, contentWidth);
  y = addBulletPoint(doc, "David Chen (CFO): Analytical and pragmatic, Chen is worried about the financial health of the company. He feels a strong obligation to present the data clearly and persuade you to act swiftly.", y, margin, contentWidth);
  y = addBulletPoint(doc, "Sandra Williams (HR Director): Concerned and empathetic, Williams is deeply aware of the emotional toll that rumors are taking on the workforce. She is committed to fostering open communication but feels the tension rising.", y, margin, contentWidth);
  y = addBulletPoint(doc, "Frank Torres (Operations Manager): Caught between the demands of the board and the fears of his team, Torres feels conflicted. He respects the need for modernization but is apprehensive about how it will impact the skilled workforce he has nurtured.", y, margin, contentWidth);
  y += 2;

  y = addCalloutBox(doc, "The Decision Ahead", "How do you transform Apex Manufacturing with a loyal, long-tenured workforce while preserving the culture that has driven its success?", y, margin, contentWidth);
  y += 4;

  y = addSectionHeader(doc, "Intel Article 1: WSJ Analysis", y, margin);
  y = addSubHeader(doc, "The Hidden Costs of Factory Automation", y, margin);
  doc.setTextColor(...MED_GRAY);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "italic");
  y = addWrappedText(doc, "Source: Wall Street Journal  |  Citation Code: AIM", margin, y, contentWidth, 4.5);
  y += 3;

  y = addBodyText(doc, "The allure of factory automation is undeniable, yet many companies overlook critical hidden costs:", y, margin, contentWidth);
  y = addSubHeader(doc, "Integration Costs Beyond Equipment", y, margin);
  y = addBodyText(doc, "The initial capital investment is just the tip of the iceberg. Retrofitting facilities, enhancing infrastructure, and ensuring compatibility with legacy systems lead to unforeseen expenses.", y, margin, contentWidth);
  y = addSubHeader(doc, "Training and Change Management", y, margin);
  y = addBodyText(doc, "Employees must be trained to operate new machines and understand underlying technologies. This is not a one-time expense - continuous education is essential. Companies that fail to invest in training face morale issues and increased turnover.", y, margin, contentWidth);
  y = addSubHeader(doc, "Productivity Dip During Transition", y, margin);
  y = addBodyText(doc, "During implementation, productivity often dips as employees adapt. This temporary decline can be damaging in sectors with tight deadlines. The timeline for ROI can stretch significantly longer than anticipated.", y, margin, contentWidth);
  y = addSubHeader(doc, "Maintenance and Upgrade Cycles", y, margin);
  y = addBodyText(doc, "Automation technologies require ongoing maintenance and regular upgrades. These costs are often underestimated. With rapid technological advances, companies may need to invest in new systems sooner than expected.", y, margin, contentWidth);
  y = addCalloutBox(doc, "Case Study: FastParts", "FastParts hastily transitioned to a fully automated production line without adequately assessing total costs. They faced extensive training requirements, a significant productivity dip, plummeting morale, and a wave of resignations. Within a few years, their technology became outdated, leading to quality issues that tarnished their reputation and made them an acquisition target.", y, margin, contentWidth);
  y += 4;

  y = addSectionHeader(doc, "Intel Article 2: Harvard Business Review", y, margin);
  y = addSubHeader(doc, "Leading Through Technological Disruption", y, margin);
  doc.setTextColor(...MED_GRAY);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "italic");
  y = addWrappedText(doc, "Source: Harvard Business Review  |  Citation Code: APX", margin, y, contentWidth, 4.5);
  y += 3;

  y = addBodyText(doc, "A framework for change leadership consists of five key elements:", y, margin, contentWidth);
  y = addNumberedStep(doc, 1, "Vision", "Articulate a clear vision that resonates with employees at all levels", y, margin, contentWidth);
  y = addNumberedStep(doc, 2, "Engagement", "Encourage open dialogue, solicit feedback, involve employees in the process", y, margin, contentWidth);
  y = addNumberedStep(doc, 3, "Education", "Ensure employees possess skills to leverage AI effectively", y, margin, contentWidth);
  y = addNumberedStep(doc, 4, "Resources", "Balance investments in technology with workforce development", y, margin, contentWidth);
  y = addNumberedStep(doc, 5, "Metrics", "Establish clear KPIs to measure progress and enable course corrections", y, margin, contentWidth);

  y = addSubHeader(doc, "Common CEO Mistakes During Transformation", y, margin);
  y = addBulletPoint(doc, "Underestimating the cultural impact of change", y, margin, contentWidth);
  y = addBulletPoint(doc, "Failure to communicate effectively, leading to skepticism", y, margin, contentWidth);
  y = addBulletPoint(doc, "Focusing too heavily on short-term gains at the expense of long-term viability", y, margin, contentWidth);
  y += 2;

  y = addBodyText(doc, "Balance Between Urgency and Patience: Pushing for immediate results leads to burnout. An overly cautious approach results in missed opportunities. A phased implementation strategy allows for experimentation and feedback.", y, margin, contentWidth);
  y = addBodyText(doc, "Building Coalition Among Skeptics: Transform skeptics into advocates by actively listening to concerns and involving them in decision-making.", y, margin, contentWidth);
  y += 4;

  y = addSectionHeader(doc, "Intel Article 3: McKinsey Report", y, margin);
  y = addSubHeader(doc, "Manufacturing Automation Accelerates Post-Pandemic", y, margin);
  doc.setTextColor(...MED_GRAY);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "italic");
  y = addWrappedText(doc, "Source: McKinsey Global Institute  |  Citation Code: APX", margin, y, contentWidth, 4.5);
  y += 3;

  y = addSubHeader(doc, "Key Statistics", y, margin);
  y = addBulletPoint(doc, "70% of manufacturers have increased automation investments post-pandemic", y, margin, contentWidth);
  y = addBulletPoint(doc, "50% plan to further expand automation within two years", y, margin, contentWidth);
  y = addBulletPoint(doc, "50% increase in robotics and AI technology adoption since 2020", y, margin, contentWidth);
  y = addBulletPoint(doc, "4 million workers left jobs in 2021; manufacturing saw 30% increase in unfilled positions", y, margin, contentWidth);
  y += 2;

  y = addSubHeader(doc, "ROI Timelines by Automation Category", y, margin);
  y = addTableRow(doc, "Category", "Typical ROI Timeline", y, margin, contentWidth, true);
  y = addTableRow(doc, "Robotics (Assembly line tasks)", "12-18 months", y, margin, contentWidth);
  y = addTableRow(doc, "AI & Machine Learning (Predictive maintenance)", "18-36 months", y, margin, contentWidth);
  y = addTableRow(doc, "Process Automation / RPA (Data entry)", "6-12 months", y, margin, contentWidth);
  y = addTableRow(doc, "Advanced Manufacturing / 3D Printing", "24-48 months", y, margin, contentWidth);
  y += 2;

  y = addBodyText(doc, "Risk Factors: High initial investment, integration complexity, workforce resistance.", y, margin, contentWidth);
  y = addCalloutBox(doc, "Early Adopters vs. Laggards", "PrecisionParts Co. (early adopter) maintained high employee morale while automating. AutoTech Industries (laggard) faced union strikes and declining customer satisfaction.", y, margin, contentWidth);
  y += 4;

  y = addSectionHeader(doc, "Decision Options", y, margin);
  y = addBodyText(doc, "Choose ONE of the three investment paths below. Each has different financial and cultural implications.", y, margin, contentWidth);
  y += 2;

  y = addSubHeader(doc, "Option A: Conservative Path ($8M Investment)", y, margin);
  y = addTableRow(doc, "Metric", "Value", y, margin, contentWidth, true);
  y = addTableRow(doc, "Capital Investment", "$8,000,000", y, margin, contentWidth);
  y = addTableRow(doc, "Expected Productivity Gain", "12%", y, margin, contentWidth);
  y = addTableRow(doc, "Workforce Reduction", "85 positions over 18 months", y, margin, contentWidth);
  y = addTableRow(doc, "Payback Period", "4.2 years", y, margin, contentWidth);
  y = addTableRow(doc, "NPV (5yr, 10% discount)", "$2.1 million", y, margin, contentWidth);
  y = addTableRow(doc, "Additional Debt Required", "None", y, margin, contentWidth);
  y += 1;
  y = addBodyText(doc, "A cautious, lower-risk approach that minimizes workforce disruption and maintains stakeholder relations. Aligns with current cash management. Slower competitive improvement.", y, margin, contentWidth);
  y += 4;

  y = addSubHeader(doc, "Option B: Phased Hybrid Approach ($12M Y1 + $8M Y2)", y, margin);
  y = addTableRow(doc, "Metric", "Value", y, margin, contentWidth, true);
  y = addTableRow(doc, "Capital Investment", "$20,000,000 total ($12M Y1 + $8M Y2)", y, margin, contentWidth);
  y = addTableRow(doc, "Expected Productivity Gain", "28% by end of Year 2", y, margin, contentWidth);
  y = addTableRow(doc, "Workforce Reduction", "145 positions (6-month retraining buffer)", y, margin, contentWidth);
  y = addTableRow(doc, "Payback Period", "3.1 years", y, margin, contentWidth);
  y = addTableRow(doc, "NPV (5yr, 10% discount)", "$6.2 million", y, margin, contentWidth);
  y = addTableRow(doc, "Retraining/Severance Costs", "~$2 million", y, margin, contentWidth);
  y += 1;
  y = addBodyText(doc, "A balanced approach allowing iterative learning and adjustment. Provides competitive improvement while allowing time for workforce transition. Moderate risk.", y, margin, contentWidth);
  y += 4;

  y = addSubHeader(doc, "Option C: Aggressive Transformation ($18M)", y, margin);
  y = addTableRow(doc, "Metric", "Value", y, margin, contentWidth, true);
  y = addTableRow(doc, "Capital Investment", "$18,000,000", y, margin, contentWidth);
  y = addTableRow(doc, "Expected Productivity Gain", "35%", y, margin, contentWidth);
  y = addTableRow(doc, "Workforce Reduction", "210 positions over 24 months", y, margin, contentWidth);
  y = addTableRow(doc, "Payback Period", "2.8 years", y, margin, contentWidth);
  y = addTableRow(doc, "NPV (5yr, 10% discount)", "$8.4 million", y, margin, contentWidth);
  y = addTableRow(doc, "Additional Debt Required", "$6 million at 7.2% APR", y, margin, contentWidth);
  y += 1;
  y = addBodyText(doc, "Maximum financial return but highest cultural risk. Fastest competitive improvement. Raises concerns about employee morale, debt covenants, and union relations.", y, margin, contentWidth);
  y += 6;

  y = addSectionHeader(doc, "LMS Submission Template", y, margin);
  y = addBodyText(doc, "Create an assignment in your LMS (Blackboard, Canvas, etc.) with the following components:", y, margin, contentWidth);
  y += 2;

  y = addSubHeader(doc, "Submission 1: Decision Selection", y, margin);
  y = addBodyText(doc, "Which investment path do you choose for Apex Manufacturing?", y, margin, contentWidth);
  y = addBulletPoint(doc, "A) Conservative Path ($8M)", y, margin, contentWidth);
  y = addBulletPoint(doc, "B) Phased Hybrid Approach ($12M + $8M)", y, margin, contentWidth);
  y = addBulletPoint(doc, "C) Aggressive Transformation ($18M)", y, margin, contentWidth);
  y += 2;

  y = addSubHeader(doc, "Submission 2: Strategic Rationale Essay (min. 100 words)", y, margin);
  y = addBodyText(doc, "As the new CEO of Apex Manufacturing, explain your reasoning for the investment path you selected. Your response should:", y, margin, contentWidth);
  y = addNumberedStep(doc, 1, "Financial Justification", "Cite specific data from the briefing and research materials", y, margin, contentWidth);
  y = addNumberedStep(doc, 2, "Workforce Strategy", "Address how you will manage workforce anxiety and stakeholder concerns", y, margin, contentWidth);
  y = addNumberedStep(doc, 3, "Communication Plan", "Explain your strategy for employees, the board, and key customers", y, margin, contentWidth);
  y = addNumberedStep(doc, 4, "Research Integration", "Reference at least one Intel Article (cite using codes: AIM, APX)", y, margin, contentWidth);
  y = addNumberedStep(doc, 5, "Competitive Lessons", "Consider lessons from AutoTech, FastParts, and PrecisionParts", y, margin, contentWidth);
  y += 2;

  y = addCalloutBox(doc, "Recommended Length", "Minimum 100 words. For a thorough analysis, aim for 200-400 words.", y, margin, contentWidth);
  y += 4;

  y = addSectionHeader(doc, "Scoring Rubric (For Instructors)", y, margin);
  y = addBodyText(doc, "The platform uses dual scoring (Financial + Cultural). Use this rubric for manual grading that mirrors the simulation's approach.", y, margin, contentWidth);
  y += 2;

  y = addSubHeader(doc, "Financial Score (50 points)", y, margin);
  y = addTableRow(doc, "Criteria (Points)", "What to Look For", y, margin, contentWidth, true);
  y = addTableRow(doc, "Data-Driven Justification (15)", "Cites specific financial metrics (NPV, payback, productivity)", y, margin, contentWidth);
  y = addTableRow(doc, "Risk Assessment (10)", "Acknowledges financial risks (debt, ROI timeline, hidden costs)", y, margin, contentWidth);
  y = addTableRow(doc, "Competitive Awareness (10)", "References competitor benchmarks (35-50% automation rates)", y, margin, contentWidth);
  y = addTableRow(doc, "Financial Feasibility (15)", "Chosen path is realistic given $125M revenue position", y, margin, contentWidth);
  y += 4;

  y = addSubHeader(doc, "Cultural Score (50 points)", y, margin);
  y = addTableRow(doc, "Criteria (Points)", "What to Look For", y, margin, contentWidth, true);
  y = addTableRow(doc, "Stakeholder Awareness (15)", "Addresses concerns of board, employees, customers, union", y, margin, contentWidth);
  y = addTableRow(doc, "Communication Strategy (10)", "Outlines how changes would be communicated to workforce", y, margin, contentWidth);
  y = addTableRow(doc, "Workforce Transition Plan (15)", "Addresses retraining, severance, or timeline for changes", y, margin, contentWidth);
  y = addTableRow(doc, "Cultural Sensitivity (10)", "Acknowledges culture of loyalty and 7.2-year avg tenure", y, margin, contentWidth);
  y += 4;

  y = addSubHeader(doc, "Intel Application Bonus (up to 10 points)", y, margin);
  y = addTableRow(doc, "Citation", "Bonus Points", y, margin, contentWidth, true);
  y = addTableRow(doc, "WSJ article (hidden costs, FastParts case study)", "+3 points", y, margin, contentWidth);
  y = addTableRow(doc, "HBR article (change leadership, CEO mistakes)", "+3 points", y, margin, contentWidth);
  y = addTableRow(doc, "McKinsey report (ROI timelines, adopters vs laggards)", "+4 points", y, margin, contentWidth);
  y += 2;

  y = addCalloutBox(doc, "Total: 100 points + up to 10 bonus points", "A (93-100): Excellent comprehensive analysis  |  B (72-92): Good solid reasoning  |  C (52-71): Adequate but missing key perspectives  |  D (40-51): Superficial analysis  |  F (<40): Insufficient understanding", y, margin, contentWidth);
  y += 6;

  y = addSectionHeader(doc, "Instructor Notes", y, margin);
  y = addSubHeader(doc, "Facilitating Class Discussion", y, margin);
  y = addBulletPoint(doc, "Why did teams choose differently? Have students share rationale in small groups", y, margin, contentWidth);
  y = addBulletPoint(doc, "The tension between financial and cultural health - no option is \"right\"", y, margin, contentWidth);
  y = addBulletPoint(doc, "Stakeholder mapping - who benefits and who loses under each scenario?", y, margin, contentWidth);
  y = addBulletPoint(doc, "Real-world parallels - compare to actual manufacturing automation cases", y, margin, contentWidth);
  y += 2;

  y = addSubHeader(doc, "Key Takeaways for Students", y, margin);
  y = addBulletPoint(doc, "There is no single \"correct\" answer - the simulation rewards thoughtful analysis", y, margin, contentWidth);
  y = addBulletPoint(doc, "Financial performance and cultural health are equally weighted", y, margin, contentWidth);
  y = addBulletPoint(doc, "Referencing research materials demonstrates analytical rigor", y, margin, contentWidth);
  y = addBulletPoint(doc, "The decisions made in Week 1 cascade into subsequent weeks", y, margin, contentWidth);
  y += 2;

  y = addSubHeader(doc, "What Happens Next (Weeks 2-8)", y, margin);
  y = addBodyText(doc, "In the full simulation, Week 1 decisions affect starting financial position, employee morale baseline, union sentiment, and automation level going into Week 2: \"The Talent Pipeline Crisis.\" Each subsequent week introduces new challenges building on previous decisions.", y, margin, contentWidth);
  y += 6;

  y = addSectionHeader(doc, "Quick Reference Card (Student Handout)", y, margin);
  y = checkPageBreak(doc, y, 60);
  doc.setFillColor(245, 247, 255);
  doc.roundedRect(margin, y - 4, contentWidth, 56, 2, 2, "F");
  doc.setDrawColor(...NAVY);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y - 4, contentWidth, 56, 2, 2, "S");

  doc.setTextColor(...NAVY);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("WEEK 1 QUICK REFERENCE", margin + 4, y + 2);
  y += 8;

  doc.setTextColor(...DARK_GRAY);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Your Role:", margin + 4, y);
  doc.setFont("helvetica", "normal");
  doc.text("CEO of Apex Manufacturing", margin + 30, y);
  y += 5;

  doc.setFont("helvetica", "bold");
  doc.text("Your Challenge:", margin + 4, y);
  doc.setFont("helvetica", "normal");
  doc.text("Navigate AI transformation while preserving company culture", margin + 36, y);
  y += 5;

  doc.setFont("helvetica", "bold");
  doc.text("Your Company:", margin + 4, y);
  doc.setFont("helvetica", "normal");
  doc.text("$125M revenue, 2,400 employees, 12% automated, founded 1987", margin + 34, y);
  y += 5;

  doc.setFont("helvetica", "bold");
  doc.text("This Week:", margin + 4, y);
  doc.setFont("helvetica", "normal");
  doc.text("Financing and communicating AI strategy", margin + 28, y);
  y += 8;

  doc.setFont("helvetica", "bold");
  doc.setTextColor(...GREEN);
  doc.text("Pro Tips:", margin + 4, y);
  y += 5;
  doc.setTextColor(...DARK_GRAY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text("\u2022  Cite specific numbers from the briefing and articles", margin + 4, y);
  y += 4;
  doc.text("\u2022  Address multiple stakeholders, not just the board", margin + 4, y);
  y += 4;
  doc.text("\u2022  Consider both financial AND cultural implications", margin + 4, y);
  y += 4;
  doc.text("\u2022  Use source codes (AIM, APX) when citing Intel Articles", margin + 4, y);

  addFooter(doc);
  doc.save("Future_Work_Academy_Week1_Offline_Guide.pdf");
}

interface WeekContent {
  weekNumber: number;
  weekTitle: string;
  briefing: { title: string; content: string } | null;
  decisions: { title: string; content: string }[];
  intelArticles: { title: string; content: string }[];
}

function addDynamicHeader(doc: jsPDF, weekNumber: number, weekTitle: string): void {
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

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(`Week ${weekNumber} Offline Guide`, margin, 28);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(200, 200, 200);
  doc.text(`"${weekTitle}" \u2014 Complete simulation materials for LMS delivery`, margin, 36);
}

function addDynamicFooter(doc: jsPDF, weekNumber: number): void {
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
      `Future Work Academy | Week ${weekNumber} Offline Guide | Page ${i} of ${pageCount}`,
      pageWidth / 2,
      285,
      { align: "center" }
    );
  }
}

function parseContentSections(content: string): string[] {
  return content.split(/\n\n+/).filter(s => s.trim().length > 0);
}

function addBoldSegmentedText(doc: jsPDF, text: string, x: number, y: number, maxWidth: number, lineHeight: number): number {
  const plainText = text.replace(/\*\*([^*]+)\*\*/g, '$1');
  const wrappedLines = doc.splitTextToSize(plainText, maxWidth);
  const segments: { text: string; bold: boolean }[] = [];
  const parts = text.split(/(\*\*[^*]+\*\*)/);
  for (const part of parts) {
    if (part.startsWith('**') && part.endsWith('**')) {
      segments.push({ text: part.slice(2, -2), bold: true });
    } else if (part.length > 0) {
      segments.push({ text: part, bold: false });
    }
  }
  let segIdx = 0;
  let segCharIdx = 0;
  for (const wLine of wrappedLines) {
    if (y > 270) { doc.addPage(); y = 25; }
    let xPos = x;
    let remaining = wLine.length;
    while (remaining > 0 && segIdx < segments.length) {
      const seg = segments[segIdx];
      const avail = seg.text.length - segCharIdx;
      const take = Math.min(avail, remaining);
      const chunk = seg.text.substring(segCharIdx, segCharIdx + take);
      doc.setFont("helvetica", seg.bold ? "bold" : "normal");
      doc.text(chunk, xPos, y);
      xPos += doc.getTextWidth(chunk);
      segCharIdx += take;
      remaining -= take;
      if (segCharIdx >= seg.text.length) {
        segIdx++;
        segCharIdx = 0;
      }
    }
    y += lineHeight;
  }
  doc.setFont("helvetica", "normal");
  return y;
}

function isFormulaLine(line: string): boolean {
  if (!line.match(/^\s{2,}/)) return false;
  return /[=≈Σ≤≥≠±→÷·×]/.test(line);
}

function addRichBodyText(doc: jsPDF, text: string, y: number, margin: number, contentWidth: number): number {
  const paragraphs = text.split(/\n\n+/).filter(s => s.trim().length > 0);
  for (const paragraph of paragraphs) {
    const lines = paragraph.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed === '') continue;

      const headerMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
      if (headerMatch) {
        const level = headerMatch[1].length;
        const headerText = headerMatch[2].replace(/\*\*([^*]+)\*\*/g, '$1');
        y = checkPageBreak(doc, y, 12);
        y += 2;
        doc.setTextColor(...NAVY);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(level <= 2 ? 12 : 11);
        y = addWrappedText(doc, headerText, margin, y, contentWidth, 5);
        y += 2;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(...DARK_GRAY);
        continue;
      }

      if (isFormulaLine(line)) {
        y = checkPageBreak(doc, y, 6);
        doc.setFont("courier", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(...DARK_GRAY);
        y = addWrappedText(doc, trimmed, margin + 5, y, contentWidth - 10, 4);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        continue;
      }

      const bulletMatch = trimmed.match(/^[-*+]\s+(.*)$/);
      if (bulletMatch) {
        y = checkPageBreak(doc, y, 6);
        doc.setTextColor(...DARK_GRAY);
        doc.setFontSize(9);
        doc.text("\u2022", margin + 4, y);
        if (bulletMatch[1].includes('**')) {
          y = addBoldSegmentedText(doc, bulletMatch[1], margin + 10, y, contentWidth - 14, 4.5);
        } else {
          y = addWrappedText(doc, bulletMatch[1], margin + 10, y, contentWidth - 14, 4.5);
        }
        doc.setFont("helvetica", "normal");
        y += 1;
        continue;
      }

      const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
      if (numberedMatch) {
        y = checkPageBreak(doc, y, 6);
        doc.setTextColor(...DARK_GRAY);
        doc.setFontSize(9.5);
        doc.setFont("helvetica", "bold");
        doc.text(numberedMatch[1] + '.', margin + 2, y);
        doc.setFont("helvetica", "normal");
        if (numberedMatch[2].includes('**')) {
          y = addBoldSegmentedText(doc, numberedMatch[2], margin + 9, y, contentWidth - 12, 4.5);
        } else {
          y = addWrappedText(doc, numberedMatch[2], margin + 9, y, contentWidth - 12, 4.5);
        }
        y += 1;
        continue;
      }

      if (trimmed.includes('**')) {
        y = checkPageBreak(doc, y, 6);
        doc.setTextColor(...DARK_GRAY);
        doc.setFontSize(9.5);
        y = addBoldSegmentedText(doc, trimmed, margin, y, contentWidth, 4.5);
        y += 1;
        continue;
      }

      doc.setTextColor(...DARK_GRAY);
      doc.setFontSize(9.5);
      doc.setFont("helvetica", "normal");
      y = addWrappedText(doc, trimmed, margin, y, contentWidth, 4.5);
      y += 1;
    }
    y += 3;
  }
  return y;
}

export function generateWeeklyOfflineGuidePDF(weekNumber: number, weekTitle: string, weekContent: WeekContent): void {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y: number;

  addDynamicHeader(doc, weekNumber, weekTitle);
  y = 52;

  y = addSectionHeader(doc, "How to Use This Guide", y, margin);
  y = addBodyText(doc, `This document contains everything students need to complete Week ${weekNumber} of the Apex Manufacturing simulation without logging into the platform. Distribute via your LMS (Blackboard, Canvas, etc.) or as a printed handout.`, y, margin, contentWidth);
  y = addNumberedStep(doc, 1, "Read the Situation Briefing", "Understand the scenario and company context", y, margin, contentWidth);
  y = addNumberedStep(doc, 2, "Review the Intel Articles", "Research articles provide critical background", y, margin, contentWidth);
  y = addNumberedStep(doc, 3, "Choose a Decision Option", "Select one of the investment/strategy paths", y, margin, contentWidth);
  y = addNumberedStep(doc, 4, "Write a Strategic Rationale", "Minimum 100 words explaining your reasoning", y, margin, contentWidth);
  y = addNumberedStep(doc, 5, "Submit via LMS", "Use your institution's assignment submission system", y, margin, contentWidth);
  y += 4;

  y = addSectionHeader(doc, "Company Background", y, margin);
  y = addSubHeader(doc, "Apex Manufacturing - Company Profile", y, margin);
  y = addTableRow(doc, "Detail", "Value", y, margin, contentWidth, true);
  y = addTableRow(doc, "Company", "Apex Manufacturing", y, margin, contentWidth);
  y = addTableRow(doc, "Industry", "Automotive parts supplier", y, margin, contentWidth);
  y = addTableRow(doc, "Annual Revenue", "$125 million", y, margin, contentWidth);
  y = addTableRow(doc, "Employees", "2,400", y, margin, contentWidth);
  y = addTableRow(doc, "Average Tenure", "7.2 years", y, margin, contentWidth);
  y = addTableRow(doc, "Location", "Midwest United States", y, margin, contentWidth);
  y = addTableRow(doc, "Founded", "1987", y, margin, contentWidth);
  y += 4;

  if (weekContent.briefing) {
    y = addSectionHeader(doc, `Week ${weekNumber} Situation Briefing`, y, margin);
    y = addSubHeader(doc, `"${weekTitle}"`, y, margin);
    y = addRichBodyText(doc, weekContent.briefing.content, y, margin, contentWidth);
    y += 4;
  }

  if (weekContent.intelArticles.length > 0) {
    for (let i = 0; i < weekContent.intelArticles.length; i++) {
      const article = weekContent.intelArticles[i];
      y = addSectionHeader(doc, `Intel Article ${i + 1}`, y, margin);
      y = addSubHeader(doc, article.title, y, margin);
      y = addRichBodyText(doc, article.content, y, margin, contentWidth);
      y += 4;
    }
  }

  if (weekContent.decisions.length > 0) {
    y = addSectionHeader(doc, "Decision Options", y, margin);
    y = addBodyText(doc, "Choose ONE of the options below. Each has different financial and cultural implications.", y, margin, contentWidth);
    y += 2;

    const optionLetters = ["A", "B", "C", "D", "E"];
    for (let i = 0; i < weekContent.decisions.length; i++) {
      const decision = weekContent.decisions[i];
      y = addSubHeader(doc, `Option ${optionLetters[i] || (i + 1)}: ${decision.title}`, y, margin);
      y = addRichBodyText(doc, decision.content, y, margin, contentWidth);
      y += 4;
    }
  }

  y = addSectionHeader(doc, "LMS Submission Template", y, margin);
  y = addBodyText(doc, "Create an assignment in your LMS (Blackboard, Canvas, etc.) with the following components:", y, margin, contentWidth);
  y += 2;

  y = addSubHeader(doc, "Submission 1: Decision Selection", y, margin);
  y = addBodyText(doc, "Which path do you choose for Apex Manufacturing?", y, margin, contentWidth);
  if (weekContent.decisions.length > 0) {
    const optionLetters = ["A", "B", "C", "D", "E"];
    for (let i = 0; i < weekContent.decisions.length; i++) {
      y = addBulletPoint(doc, `${optionLetters[i] || (i + 1)}) ${weekContent.decisions[i].title}`, y, margin, contentWidth);
    }
  }
  y += 2;

  y = addSubHeader(doc, "Submission 2: Strategic Rationale Essay (min. 100 words)", y, margin);
  y = addBodyText(doc, "As the CEO of Apex Manufacturing, explain your reasoning for the path you selected. Your response should:", y, margin, contentWidth);
  y = addNumberedStep(doc, 1, "Financial Justification", "Cite specific data from the briefing and research materials", y, margin, contentWidth);
  y = addNumberedStep(doc, 2, "Workforce Strategy", "Address how you will manage workforce anxiety and stakeholder concerns", y, margin, contentWidth);
  y = addNumberedStep(doc, 3, "Communication Plan", "Explain your strategy for employees, the board, and key customers", y, margin, contentWidth);
  y = addNumberedStep(doc, 4, "Research Integration", "Reference at least one Intel Article", y, margin, contentWidth);
  y += 2;

  y = addCalloutBox(doc, "Recommended Length", "Minimum 100 words. For a thorough analysis, aim for 200-400 words.", y, margin, contentWidth);
  y += 4;

  y = addSectionHeader(doc, "Scoring Rubric (For Instructors)", y, margin);
  y = addBodyText(doc, "The platform uses dual scoring (Financial + Cultural). Use this rubric for manual grading.", y, margin, contentWidth);
  y += 2;

  y = addSubHeader(doc, "Financial Score (50 points)", y, margin);
  y = addTableRow(doc, "Criteria (Points)", "What to Look For", y, margin, contentWidth, true);
  y = addTableRow(doc, "Data-Driven Justification (15)", "Cites specific financial metrics from briefing", y, margin, contentWidth);
  y = addTableRow(doc, "Risk Assessment (10)", "Acknowledges financial risks and trade-offs", y, margin, contentWidth);
  y = addTableRow(doc, "Competitive Awareness (10)", "References competitor benchmarks and market context", y, margin, contentWidth);
  y = addTableRow(doc, "Financial Feasibility (15)", "Chosen path is realistic given company position", y, margin, contentWidth);
  y += 4;

  y = addSubHeader(doc, "Cultural Score (50 points)", y, margin);
  y = addTableRow(doc, "Criteria (Points)", "What to Look For", y, margin, contentWidth, true);
  y = addTableRow(doc, "Stakeholder Awareness (15)", "Addresses concerns of board, employees, customers", y, margin, contentWidth);
  y = addTableRow(doc, "Communication Strategy (10)", "Outlines how changes would be communicated", y, margin, contentWidth);
  y = addTableRow(doc, "Workforce Transition Plan (15)", "Addresses retraining, severance, or timeline", y, margin, contentWidth);
  y = addTableRow(doc, "Cultural Sensitivity (10)", "Acknowledges company culture and employee loyalty", y, margin, contentWidth);
  y += 4;

  y = addCalloutBox(doc, "Total: 100 points + up to 10 bonus points", "A (93-100): Excellent comprehensive analysis  |  B (72-92): Good solid reasoning  |  C (52-71): Adequate  |  D (40-51): Superficial  |  F (<40): Insufficient", y, margin, contentWidth);
  y += 6;

  y = checkPageBreak(doc, y, 60);
  doc.setFillColor(245, 247, 255);
  doc.roundedRect(margin, y - 4, contentWidth, 40, 2, 2, "F");
  doc.setDrawColor(...NAVY);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y - 4, contentWidth, 40, 2, 2, "S");

  doc.setTextColor(...NAVY);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(`WEEK ${weekNumber} QUICK REFERENCE`, margin + 4, y + 2);
  y += 8;

  doc.setTextColor(...DARK_GRAY);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Your Role:", margin + 4, y);
  doc.setFont("helvetica", "normal");
  doc.text("CEO of Apex Manufacturing", margin + 30, y);
  y += 5;

  doc.setFont("helvetica", "bold");
  doc.text("This Week:", margin + 4, y);
  doc.setFont("helvetica", "normal");
  doc.text(`"${weekTitle}"`, margin + 28, y);
  y += 5;

  doc.setFont("helvetica", "bold");
  doc.setTextColor(...GREEN);
  doc.text("Pro Tips:", margin + 4, y);
  y += 5;
  doc.setTextColor(...DARK_GRAY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text("\u2022  Cite specific numbers from the briefing and articles", margin + 4, y);
  y += 4;
  doc.text("\u2022  Address multiple stakeholders, not just the board", margin + 4, y);
  y += 4;
  doc.text("\u2022  Consider both financial AND cultural implications", margin + 4, y);

  addDynamicFooter(doc, weekNumber);
  doc.save(`Future_Work_Academy_Week${weekNumber}_Offline_Guide.pdf`);
}
