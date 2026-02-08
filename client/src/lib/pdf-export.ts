import jsPDF from "jspdf";

interface CompanyState {
  revenue: number;
  employees: number;
  morale: number;
  unionSentiment: number;
  debt: number;
  automationLevel: number;
  managementBenchStrength: number;
  genZWorkforcePercentage: number;
}

interface Pressure {
  source: string;
  message: string;
  urgency: string;
}

interface Article {
  id: string;
  title: string;
  content: string;
  source: string;
  category: string;
  insights?: string[];
}

interface WeeklyPDFData {
  weekNumber: number;
  totalWeeks: number;
  scenarioTitle: string;
  narrative: string;
  keyQuestion: string;
  pressures: Pressure[];
  companyState: CompanyState;
  articles?: Article[];
  teamName?: string;
}

const NAVY = [30, 58, 95] as const;
const GREEN = [34, 197, 94] as const;
const DARK_GRAY = [51, 51, 51] as const;
const MED_GRAY = [100, 100, 100] as const;
const LIGHT_GRAY = [200, 200, 200] as const;
const PAGE_BG = [250, 250, 252] as const;

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

export function generateWeeklyPDF(data: WeeklyPDFData): void {
  const safeData = {
    ...data,
    scenarioTitle: data.scenarioTitle || "Weekly Briefing",
    narrative: data.narrative || "",
    keyQuestion: data.keyQuestion || "No key question available for this week.",
    pressures: data.pressures || [],
    articles: data.articles || [],
    companyState: {
      revenue: data.companyState?.revenue ?? 0,
      employees: data.companyState?.employees ?? 0,
      morale: data.companyState?.morale ?? 0,
      unionSentiment: data.companyState?.unionSentiment ?? 0,
      debt: data.companyState?.debt ?? 0,
      automationLevel: data.companyState?.automationLevel ?? 0,
      managementBenchStrength: data.companyState?.managementBenchStrength ?? 0,
      genZWorkforcePercentage: data.companyState?.genZWorkforcePercentage ?? 0,
    },
  };
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 0;

  doc.setFillColor(...NAVY);
  doc.rect(0, 0, pageWidth, 45, "F");

  doc.setFillColor(...GREEN);
  doc.rect(0, 45, pageWidth, 2, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("FUTURE WORK ACADEMY", margin, 15);

  doc.setFontSize(8);
  doc.text("APEX MANUFACTURING SIMULATION", margin, 21);

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(`Week ${safeData.weekNumber} of ${safeData.totalWeeks}`, margin, 33);

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  const titleLines = doc.splitTextToSize(safeData.scenarioTitle, contentWidth - 40);
  doc.text(titleLines, margin, 40);

  if (safeData.teamName) {
    doc.setFontSize(8);
    doc.setTextColor(200, 200, 200);
    doc.text(safeData.teamName, pageWidth - margin, 15, { align: "right" });
  }

  y = 55;

  doc.setTextColor(...NAVY);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("SITUATION REPORT", margin, y);
  y += 3;
  doc.setDrawColor(...GREEN);
  doc.setLineWidth(0.5);
  doc.line(margin, y, margin + 40, y);
  y += 6;

  doc.setTextColor(...DARK_GRAY);
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "normal");

  const paragraphs = safeData.narrative.split("\n\n");
  for (const para of paragraphs) {
    y = addWrappedText(doc, para.trim(), margin, y, contentWidth, 4.5);
    y += 3;
  }

  y += 4;
  y = checkPageBreak(doc, y, 40);

  doc.setFillColor(...NAVY);
  doc.roundedRect(margin, y, contentWidth, 8, 1, 1, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("KEY QUESTION", margin + 4, y + 5.5);
  y += 12;

  doc.setFillColor(245, 247, 255);
  const questionLines = doc.splitTextToSize(safeData.keyQuestion, contentWidth - 16);
  const questionHeight = questionLines.length * 5.5 + 8;
  doc.roundedRect(margin, y, contentWidth, questionHeight, 1, 1, "F");

  doc.setDrawColor(...NAVY);
  doc.setLineWidth(0.8);
  doc.line(margin + 4, y + 4, margin + 4, y + questionHeight - 4);

  doc.setTextColor(...NAVY);
  doc.setFontSize(10.5);
  doc.setFont("helvetica", "bolditalic");
  doc.text(questionLines, margin + 10, y + 7);
  y += questionHeight + 6;

  y = checkPageBreak(doc, y, 50);
  doc.setTextColor(...NAVY);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("COMPANY STATUS", margin, y);
  y += 3;
  doc.setDrawColor(...GREEN);
  doc.line(margin, y, margin + 40, y);
  y += 6;

  const stats = [
    { label: "Revenue", value: `$${(safeData.companyState.revenue / 1000000).toFixed(1)}M` },
    { label: "Employees", value: safeData.companyState.employees.toLocaleString() },
    { label: "Morale", value: `${safeData.companyState.morale}%` },
    { label: "Union Risk", value: `${safeData.companyState.unionSentiment}%` },
    { label: "Debt", value: `$${(safeData.companyState.debt / 1000000).toFixed(1)}M` },
    { label: "Automation", value: `${safeData.companyState.automationLevel}%` },
    { label: "Mgmt Bench", value: `${safeData.companyState.managementBenchStrength}%` },
    { label: "Gen Z Workforce", value: `${safeData.companyState.genZWorkforcePercentage}%` },
  ];

  const colWidth = contentWidth / 4;
  const rows = Math.ceil(stats.length / 4);
  for (let row = 0; row < rows; row++) {
    y = checkPageBreak(doc, y, 14);
    doc.setFillColor(row % 2 === 0 ? 248 : 255, row % 2 === 0 ? 249 : 255, row % 2 === 0 ? 252 : 255);
    doc.rect(margin, y - 3, contentWidth, 12, "F");

    for (let col = 0; col < 4; col++) {
      const idx = row * 4 + col;
      if (idx >= stats.length) break;
      const stat = stats[idx];
      const xPos = margin + col * colWidth + 3;

      doc.setTextColor(...MED_GRAY);
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.text(stat.label.toUpperCase(), xPos, y);

      doc.setTextColor(...DARK_GRAY);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(stat.value, xPos, y + 6);
    }
    y += 14;
  }

  y += 4;
  y = checkPageBreak(doc, y, 30);

  doc.setTextColor(...NAVY);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("STAKEHOLDER PRESSURES", margin, y);
  y += 3;
  doc.setDrawColor(...GREEN);
  doc.line(margin, y, margin + 40, y);
  y += 6;

  const urgencyColors: Record<string, readonly [number, number, number]> = {
    critical: [220, 38, 38],
    high: [234, 88, 12],
    medium: [202, 138, 4],
    low: [22, 163, 74],
  };

  for (const pressure of safeData.pressures) {
    y = checkPageBreak(doc, y, 20);

    const color = urgencyColors[pressure.urgency] || urgencyColors.medium;
    doc.setFillColor(...color);
    doc.roundedRect(margin, y - 1, 2, 10, 0.5, 0.5, "F");

    doc.setTextColor(...DARK_GRAY);
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "bold");
    doc.text(pressure.source, margin + 6, y + 2);

    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...(color as unknown as [number, number, number]));
    const urgencyWidth = doc.getTextWidth(pressure.urgency.toUpperCase());
    doc.text(pressure.urgency.toUpperCase(), pageWidth - margin - urgencyWidth, y + 2);

    doc.setTextColor(...MED_GRAY);
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "italic");
    y = addWrappedText(doc, `"${pressure.message}"`, margin + 6, y + 7, contentWidth - 10, 4);
    y += 4;
  }

  if (safeData.articles && safeData.articles.length > 0) {
    y += 4;
    y = checkPageBreak(doc, y, 30);

    doc.setTextColor(...NAVY);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("INDUSTRY INTELLIGENCE", margin, y);
    y += 3;
    doc.setDrawColor(...GREEN);
    doc.line(margin, y, margin + 40, y);
    y += 6;

    for (const article of safeData.articles) {
      y = checkPageBreak(doc, y, 30);

      doc.setFillColor(...PAGE_BG);
      const articleContentLines = doc.splitTextToSize(article.content, contentWidth - 12);
      let articleBoxHeight = 18 + articleContentLines.length * 4;
      if (article.insights && article.insights.length > 0) {
        articleBoxHeight += 6 + article.insights.length * 4;
      }
      articleBoxHeight = Math.min(articleBoxHeight, 250);

      doc.roundedRect(margin, y - 2, contentWidth, articleBoxHeight, 1, 1, "F");

      doc.setTextColor(...MED_GRAY);
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.text(`${article.category.toUpperCase()} | Source: ${article.source}`, margin + 4, y + 2);

      doc.setTextColor(...DARK_GRAY);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      const titleLinesArr = doc.splitTextToSize(article.title, contentWidth - 12);
      doc.text(titleLinesArr, margin + 4, y + 8);
      let articleY = y + 8 + titleLinesArr.length * 4.5;

      doc.setTextColor(...MED_GRAY);
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      articleY = addWrappedText(doc, article.content, margin + 4, articleY + 2, contentWidth - 12, 4);

      if (article.insights && article.insights.length > 0) {
        articleY += 3;
        doc.setTextColor(...NAVY);
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.text("Key Insights:", margin + 4, articleY);
        articleY += 4;

        doc.setTextColor(...MED_GRAY);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        for (const insight of article.insights) {
          articleY = checkPageBreak(doc, articleY, 5);
          doc.text(`\u2022 ${insight}`, margin + 8, articleY);
          articleY += 4;
        }
      }

      y = articleY + 6;
    }
  }

  y = checkPageBreak(doc, y, 15);
  y += 4;
  doc.setDrawColor(...LIGHT_GRAY);
  doc.line(margin, y, pageWidth - margin, y);
  y += 5;
  doc.setTextColor(...LIGHT_GRAY);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text(
    "SIMULATED CONTENT \u2014 FOR EDUCATIONAL USE ONLY | Future Work Academy \u00A9 2026",
    pageWidth / 2,
    y,
    { align: "center" }
  );

  const filename = `Apex_Week${safeData.weekNumber}_${safeData.scenarioTitle.replace(/[^a-z0-9]/gi, "_")}.pdf`;
  doc.save(filename);
}
