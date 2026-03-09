import jsPDF from "jspdf";
import { PDF_COLORS, addWrappedText, checkPageBreak, loadLogoForPdf } from "./pdf-utils";

const NAVY = PDF_COLORS.NAVY;
const GREEN = PDF_COLORS.GREEN;
const DARK_GRAY = PDF_COLORS.DARK_GRAY;
const MED_GRAY = PDF_COLORS.MED_GRAY;
const LIGHT_GRAY = PDF_COLORS.LIGHT_GRAY;
const WHITE = PDF_COLORS.WHITE;

export async function generateBrochurePDF(): Promise<void> {
  const logoDataUrl = await loadLogoForPdf();
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let y: number;

  doc.setFillColor(...NAVY);
  doc.rect(0, 0, pageWidth, 48, "F");

  doc.setFillColor(...GREEN);
  doc.rect(0, 48, pageWidth, 2.5, "F");

  doc.addImage(logoDataUrl, "PNG", margin, 4, 12, 12);
  doc.setTextColor(...WHITE);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("FUTURE WORK ACADEMY", margin + 15, 13);

  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("Prepare Leaders for the", margin, 26);
  doc.text("AI-Driven Workplace", margin, 35);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(200, 200, 200);
  doc.text("An immersive business simulation for graduate and executive education", margin, 44);

  y = 58;

  doc.setTextColor(...NAVY);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("THE PROBLEM", margin, y);
  y += 3;
  doc.setDrawColor(...GREEN);
  doc.setLineWidth(0.6);
  doc.line(margin, y, margin + 38, y);
  y += 7;

  doc.setTextColor(...DARK_GRAY);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  y = addWrappedText(
    doc,
    "AI is reshaping every industry, yet business schools lack hands-on tools to teach students how to lead through this transition. Traditional case studies are static, detached from the emotional and political realities of workforce transformation.",
    margin,
    y,
    contentWidth,
    4.5
  );
  y += 3;

  const stats = [
    { stat: "72%", label: "of executives cite AI as\ntop strategic priority" },
    { stat: "63%", label: "of employees report\nanxiety about AI" },
    { stat: "< 15%", label: "of MBA programs offer\nexperiential AI training" },
  ];
  const statBoxWidth = (contentWidth - 8) / 3;
  stats.forEach((s, i) => {
    const bx = margin + i * (statBoxWidth + 4);
    doc.setFillColor(240, 243, 248);
    doc.roundedRect(bx, y, statBoxWidth, 18, 2, 2, "F");
    doc.setTextColor(...NAVY);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(s.stat, bx + statBoxWidth / 2, y + 8, { align: "center" });
    doc.setTextColor(...MED_GRAY);
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "normal");
    const labelLines = s.label.split("\n");
    labelLines.forEach((line, li) => {
      doc.text(line, bx + statBoxWidth / 2, y + 12.5 + li * 3, { align: "center" });
    });
  });
  y += 26;

  doc.setTextColor(...NAVY);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("THE SOLUTION", margin, y);
  y += 3;
  doc.setDrawColor(...GREEN);
  doc.setLineWidth(0.6);
  doc.line(margin, y, margin + 38, y);
  y += 7;

  doc.setTextColor(...DARK_GRAY);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  y = addWrappedText(
    doc,
    "Future Work Academy places students in the role of Chief Transformation Officer at Apex Manufacturing, a mid-size company facing competitive pressure to adopt AI. Over 8 simulated weeks, student teams make decisions that impact finances, employee morale, and organizational culture.",
    margin,
    y,
    contentWidth,
    4.5
  );
  y += 4;

  const solutionPoints = [
    ["Realistic Scenarios", "Each week presents new AI adoption challenges with multi-stakeholder implications."],
    ["Competitive Leaderboard", "Teams compete on a dual scorecard balancing financial returns and cultural health."],
    ["3-Tier Difficulty", "Introductory, Standard, and Advanced modes accommodate undergrad through executive education."],
    ["Instant Setup", "Privacy Mode enables anonymous enrollment; magic invite links let students join in seconds."],
  ];
  const colW = (contentWidth - 6) / 2;
  let solRowY = y;
  for (let row = 0; row < 2; row++) {
    solRowY = checkPageBreak(doc, solRowY, 14);
    for (let col = 0; col < 2; col++) {
      const idx = row * 2 + col;
      if (idx >= solutionPoints.length) break;
      const sp = solutionPoints[idx];
      const bx = margin + col * (colW + 6);
      doc.setFillColor(...GREEN);
      doc.circle(bx + 2, solRowY + 1, 1.2, "F");
      doc.setTextColor(...DARK_GRAY);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text(sp[0], bx + 6, solRowY + 2);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(...MED_GRAY);
      addWrappedText(doc, sp[1], bx + 6, solRowY + 6, colW - 8, 3.5);
    }
    solRowY += 14;
  }
  y = solRowY + 4;

  y = checkPageBreak(doc, y, 60);

  doc.setTextColor(...NAVY);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("KEY FEATURES", margin, y);
  y += 3;
  doc.setDrawColor(...GREEN);
  doc.setLineWidth(0.6);
  doc.line(margin, y, margin + 38, y);
  y += 7;

  const features = [
    ["AI-Powered Evaluation", "Student decisions assessed by LLM-driven grading that mirrors real executive feedback."],
    ["17 Dynamic Characters", "Employees with unique personalities, influence levels, and relationships that react to every choice."],
    ["Dual Scorecard", "Teams ranked on both financial performance and cultural health, rewarding balanced leadership."],
    ["Phone-a-Friend Advisors", "9 specialized advisors (CEO coach, CFO, HR expert) provide AI-generated strategic counsel."],
    ["8-Week Curriculum Arc", "A structured semester-long journey from initial AI assessment through full transformation."],
    ["Privacy-First Design", "Privacy Mode enables anonymous enrollment without sharing personal data."],
  ];
  const featColW = (contentWidth - 6) / 2;
  let featRowY = y;
  for (let row = 0; row < 3; row++) {
    featRowY = checkPageBreak(doc, featRowY, 14);
    for (let col = 0; col < 2; col++) {
      const idx = row * 2 + col;
      if (idx >= features.length) break;
      const f = features[idx];
      const bx = margin + col * (featColW + 6);
      doc.setFillColor(...GREEN);
      doc.circle(bx + 2, featRowY + 1, 1.2, "F");
      doc.setTextColor(...DARK_GRAY);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text(f[0], bx + 6, featRowY + 2);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(...MED_GRAY);
      addWrappedText(doc, f[1], bx + 6, featRowY + 6, featColW - 8, 3.5);
    }
    featRowY += 14;
  }
  y = featRowY + 4;

  y = checkPageBreak(doc, y, 50);

  doc.setTextColor(...NAVY);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("EXPECTED STUDENT OUTCOMES", margin, y);
  y += 3;
  doc.setDrawColor(...GREEN);
  doc.setLineWidth(0.6);
  doc.line(margin, y, margin + 38, y);
  y += 7;

  const outcomes = [
    "Develop strategic thinking for AI-era leadership decisions",
    "Practice stakeholder management with realistic characters",
    "Build change management skills through iterative decisions",
    "Learn data-driven decision-making with real-time analytics",
    "Experience cross-functional team dynamics and collaboration",
    "Understand the tension between financial results and culture",
  ];
  outcomes.forEach((o) => {
    y = checkPageBreak(doc, y, 8);
    doc.setFillColor(...GREEN);
    doc.circle(margin + 2, y + 0.5, 1.2, "F");
    doc.setTextColor(...DARK_GRAY);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(o, margin + 6, y + 1.5);
    y += 7;
  });
  y += 4;

  y = checkPageBreak(doc, y, 30);

  doc.setTextColor(...NAVY);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("WHO THIS IS FOR", margin, y);
  y += 3;
  doc.setDrawColor(...GREEN);
  doc.setLineWidth(0.6);
  doc.line(margin, y, margin + 38, y);
  y += 7;

  const audiences = [
    ["MBA & Graduate Programs", "Strategy, management, and organizational behavior courses"],
    ["Undergraduate Business", "Introductory-level exposure to AI strategy and change management"],
    ["Executive Education", "Advanced scenarios for mid-career professionals and leadership programs"],
  ];
  const audColW = (contentWidth - 8) / 3;
  audiences.forEach((a, i) => {
    const bx = margin + i * (audColW + 4);
    doc.setFillColor(240, 243, 248);
    doc.roundedRect(bx, y, audColW, 20, 2, 2, "F");
    doc.setTextColor(...NAVY);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(a[0], bx + audColW / 2, y + 7, { align: "center" });
    doc.setTextColor(...MED_GRAY);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(a[1], audColW - 6);
    lines.forEach((line: string, li: number) => {
      doc.text(line, bx + audColW / 2, y + 12 + li * 3, { align: "center" });
    });
  });
  y += 28;

  y = checkPageBreak(doc, y, 22);

  doc.setFillColor(240, 243, 248);
  doc.roundedRect(margin, y, contentWidth, 18, 3, 3, "F");
  doc.setTextColor(...NAVY);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Ready to Transform Your Classroom?", pageWidth / 2, y + 7, { align: "center" });
  doc.setTextColor(...MED_GRAY);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Visit futureworkacademy.com/for-educators to request a 30-day evaluator demo.", pageWidth / 2, y + 13, { align: "center" });

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(...LIGHT_GRAY);
    doc.line(margin, 282, pageWidth - margin, 282);
    doc.setTextColor(...LIGHT_GRAY);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Future Work Academy | futureworkacademy.com | Page ${i} of ${pageCount}`,
      pageWidth / 2,
      287,
      { align: "center" }
    );
  }

  doc.save("Future-Work-Academy-Brochure.pdf");
}
