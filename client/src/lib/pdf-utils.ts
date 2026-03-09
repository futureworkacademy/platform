import jsPDF from "jspdf";

export const PDF_COLORS = {
  NAVY: [30, 58, 95] as const,
  GREEN: [34, 197, 94] as const,
  DARK_GRAY: [51, 51, 51] as const,
  MED_GRAY: [100, 100, 100] as const,
  LIGHT_GRAY: [200, 200, 200] as const,
  WHITE: [255, 255, 255] as const,
  PAGE_BG: [250, 250, 252] as const,
};

type Color = readonly [number, number, number];

export interface PageBreakOptions {
  threshold?: number;
  topMargin?: number;
}

export function checkPageBreak(
  doc: jsPDF,
  y: number,
  needed: number,
  opts?: PageBreakOptions
): number {
  const threshold = opts?.threshold ?? 272;
  const topMargin = opts?.topMargin ?? 25;
  if (y + needed > threshold) {
    doc.addPage();
    return topMargin;
  }
  return y;
}

export function addWrappedText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  opts?: PageBreakOptions
): number {
  const lines = doc.splitTextToSize(text, maxWidth);
  for (const line of lines) {
    y = checkPageBreak(doc, y, lineHeight, opts);
    doc.text(line, x, y);
    y += lineHeight;
  }
  return y;
}

export function addSectionHeader(
  doc: jsPDF,
  title: string,
  y: number,
  margin: number
): number {
  y = checkPageBreak(doc, y, 20);
  doc.setTextColor(...PDF_COLORS.NAVY);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(title.toUpperCase(), margin, y);
  y += 3;
  doc.setDrawColor(...PDF_COLORS.GREEN);
  doc.setLineWidth(0.5);
  doc.line(margin, y, margin + 45, y);
  y += 8;
  return y;
}

export function addSubHeader(
  doc: jsPDF,
  title: string,
  y: number,
  margin: number
): number {
  y = checkPageBreak(doc, y, 12);
  doc.setTextColor(...PDF_COLORS.NAVY);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(title, margin, y);
  y += 6;
  return y;
}

export function addBodyText(
  doc: jsPDF,
  text: string,
  y: number,
  margin: number,
  contentWidth: number
): number {
  doc.setTextColor(...PDF_COLORS.DARK_GRAY);
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "normal");
  y = addWrappedText(doc, text, margin, y, contentWidth, 4.5);
  y += 3;
  return y;
}

export function addBulletPoint(
  doc: jsPDF,
  text: string,
  y: number,
  margin: number,
  contentWidth: number
): number {
  y = checkPageBreak(doc, y, 8);
  doc.setTextColor(...PDF_COLORS.DARK_GRAY);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("\u2022", margin + 4, y);
  y = addWrappedText(doc, text, margin + 10, y, contentWidth - 14, 4.5);
  y += 1;
  return y;
}

export function convertMarkdownTables(text: string): string {
  const lines = text.split("\n");
  const result: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();
    if (line.startsWith("|") && line.endsWith("|") && line.includes("|")) {
      const tableLines: string[] = [];
      while (i < lines.length) {
        const tl = lines[i].trim();
        if (tl.startsWith("|") && tl.includes("|")) {
          tableLines.push(tl);
          i++;
        } else {
          break;
        }
      }

      const rows = tableLines
        .filter((r) => !r.match(/^\|[\s\-:|]+\|$/))
        .map((r) =>
          r
            .split("|")
            .slice(1, -1)
            .map((cell) => cell.replace(/\*\*/g, "").trim())
        );

      if (rows.length === 0) continue;

      const colCount = rows[0].length;
      const colWidths: number[] = [];
      for (let c = 0; c < colCount; c++) {
        colWidths[c] = 0;
        for (const row of rows) {
          if (row[c] && row[c].length > colWidths[c]) {
            colWidths[c] = row[c].length;
          }
        }
        colWidths[c] = Math.min(colWidths[c], 40);
      }

      result.push("");
      for (let r = 0; r < rows.length; r++) {
        const cells = rows[r];
        const formatted = cells
          .map((cell, c) => {
            const w = colWidths[c] || 10;
            return (cell || "").substring(0, w).padEnd(w);
          })
          .join("   ");
        result.push(formatted);

        if (r === 0) {
          const separator = colWidths.map((w) => "-".repeat(w)).join("   ");
          result.push(separator);
        }
      }
      result.push("");
    } else {
      result.push(lines[i]);
      i++;
    }
  }
  return result.join("\n");
}

export function stripMarkdownForPdf(text: string): string {
  let result = text;
  result = convertMarkdownTables(result);
  return result
    .replace(/```[\s\S]*?```/g, "")
    .replace(/__([^_]+)__/g, "**$1**")
    .replace(/~~([^~]+)~~/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "")
    .replace(/^>\s+/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function convertLatexToPlainText(text: string): string {
  let result = text;
  result = result.replace(/\\text\{([^}]*)\}/g, "$1");
  for (let i = 0; i < 3; i++) {
    result = result.replace(
      /\\frac\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g,
      "($1 / $2)"
    );
  }
  result = result.replace(/\\sum(?:_\{[^}]*\}\^?\{?[^}]*\}?)?/g, "Σ");
  result = result.replace(/\\approx/g, "≈");
  result = result.replace(/\\times/g, "×");
  result = result.replace(/\\cdot/g, "·");
  result = result.replace(/\\div/g, "÷");
  result = result.replace(/\\leq/g, "≤");
  result = result.replace(/\\geq/g, "≥");
  result = result.replace(/\\neq/g, "≠");
  result = result.replace(/\\pm/g, "±");
  result = result.replace(/\\Rightarrow/g, "⇒");
  result = result.replace(/\\rightarrow/g, "→");
  result = result.replace(/\\left\(/g, "(");
  result = result.replace(/\\right\)/g, ")");
  result = result.replace(/\\left\[/g, "[");
  result = result.replace(/\\right\]/g, "]");
  result = result.replace(/\\\[([\s\S]*?)\\\]/g, (_m: string, inner: string) => {
    const cleaned = inner.trim().replace(/\s+/g, " ");
    const parts = cleaned.split(/\s*=\s*/);
    if (parts.length > 2) {
      return (
        "\n    " +
        parts[0].trim() +
        " = " +
        parts[1].trim() +
        "\n    = " +
        parts.slice(2).join("\n    = ") +
        "\n"
      );
    }
    return "\n    " + cleaned + "\n";
  });
  result = result.replace(/\\\(([\s\S]*?)\\\)/g, (_m: string, inner: string) =>
    inner.trim().replace(/\s+/g, " ")
  );
  result = result.replace(/\\\$/g, "$");
  result = result.replace(/\\ /g, " ");
  result = result.replace(/_\{([^}]*)\}/g, "$1");
  result = result.replace(/\^\{([^}]*)\}/g, "^($1)");
  result = result.replace(/\\[a-zA-Z]+/g, "");
  return result;
}

export function cleanTextForPdf(text: string): string {
  return convertLatexToPlainText(stripMarkdownForPdf(text));
}
