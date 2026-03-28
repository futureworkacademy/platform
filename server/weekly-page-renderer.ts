import { db } from "./db";
import { characterProfiles, triggeredVoicemails, advisors, simulationContent } from "@shared/models/auth";
import { eq, and } from "drizzle-orm";
import katex from 'katex';
import { getPdfUtilsScript } from "./pdf-utils-inline";

const WEEK_TITLES: Record<number, string> = {
  1: "The Automation Imperative",
  2: "The Talent Pipeline Crisis",
  3: "Union Storm Brewing",
  4: "The First Displacement",
  5: "The Manager Exodus",
  6: "Debt Day of Reckoning",
  7: "The Competitive Response",
  8: "Strategic Direction",
};

const WEEK_ADVISOR_MAP: Record<number, string> = {
  1: "Dr. Elena Vasquez",
  2: "Diana Okonkwo",
  3: "Dr. Priya Sharma",
  4: "Dr. Thomas Brennan",
  5: "Marcus Chen",
  6: "James Richardson",
  7: "Kai Nakamura",
  8: "Dr. Amara Williams",
};

function escapeHtml(text: string | number | unknown): string {
  const str = String(text ?? "");
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("");
}

interface WeekPageData {
  weekNumber: number;
  weekTitle: string;
  voicemail: {
    title: string;
    transcript: string;
    urgency: string;
    audioUrl: string;
    character: { name: string; role: string; title?: string; headshotUrl?: string | null };
  } | null;
  advisor: {
    id: string;
    name: string;
    category: string;
    title: string;
    specialty: string;
    bio: string;
    transcript?: string | null;
    audioUrl: string;
    keyInsights: string[] | null;
    headshotUrl?: string | null;
  } | null;
  characters: {
    id: string;
    name: string;
    role: string;
    title?: string | null;
    company?: string | null;
    headshotUrl?: string | null;
    bio?: string | null;
    personality?: string | null;
    motivations?: string | null;
    fears?: string | null;
    socialProfile?: unknown;
    influence?: number | null;
    hostility?: number | null;
    flexibility?: number | null;
    riskTolerance?: number | null;
    sortOrder?: number | null;
  }[];
  pdfContent: {
    briefing: { title: string; content: string } | null;
    decisions: { title: string; content: string }[];
    intelArticles: { title: string; content: string; citationKey: string }[];
  };
}

function convertMarkdownTables(text: string): string {
  const lines = text.split('\n');
  const result: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();
    if (line.startsWith('|') && line.endsWith('|') && line.includes('|')) {
      const tableLines: string[] = [];
      while (i < lines.length) {
        const tl = lines[i].trim();
        if (tl.startsWith('|') && tl.includes('|')) {
          tableLines.push(tl);
          i++;
        } else {
          break;
        }
      }

      const rows = tableLines
        .filter(r => !r.match(/^\|[\s\-:|]+\|$/))
        .map(r =>
          r.split('|')
            .slice(1, -1)
            .map(cell => cell.replace(/\*\*/g, '').trim())
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

      result.push('');
      for (let r = 0; r < rows.length; r++) {
        const cells = rows[r];
        const formatted = cells.map((cell, c) => {
          const w = colWidths[c] || 10;
          return (cell || '').substring(0, w).padEnd(w);
        }).join('   ');
        result.push(formatted);

        if (r === 0) {
          const separator = colWidths.map(w => '-'.repeat(w)).join('   ');
          result.push(separator);
        }
      }
      result.push('');
    } else {
      result.push(lines[i]);
      i++;
    }
  }
  return result.join('\n');
}

function stripMarkdown(text: string): string {
  let result = text;
  result = convertMarkdownTables(result);
  return result
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/~~([^~]+)~~/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/^\s*[-*+]\s+/gm, '- ')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
    .replace(/^>\s+/gm, '')
    .replace(/^---+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function stripMarkdownForPdf(text: string): string {
  let result = text;
  result = convertMarkdownTables(result);
  return result
    .replace(/```[\s\S]*?```/g, '')
    .replace(/__([^_]+)__/g, '**$1**')
    .replace(/~~([^~]+)~~/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
    .replace(/^>\s+/gm, '')
    // Strip single-star italic (*text*) without touching double-star bold (**text**)
    .replace(/(?<!\*)\*(?!\*)([^*\n]+)(?<!\*)\*(?!\*)/g, '$1')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function renderLatexToHtml(text: string): string {
  let result = text;
  result = result.replace(/\\\[([\s\S]*?)\\\]/g, (_match, inner) => {
    try {
      return katex.renderToString(inner.trim(), { displayMode: true, throwOnError: false });
    } catch { return inner.trim(); }
  });
  result = result.replace(/\\\(([\s\S]*?)\\\)/g, (_match, inner) => {
    try {
      return katex.renderToString(inner.trim(), { displayMode: false, throwOnError: false });
    } catch { return inner.trim(); }
  });
  return result;
}

function convertLatexToPlainText(text: string): string {
  let result = text;
  result = result.replace(/\\text\{([^}]*)\}/g, '$1');
  for (let i = 0; i < 3; i++) {
    result = result.replace(/\\frac\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g, '($1 / $2)');
  }
  result = result.replace(/\\sum(?:_\{[^}]*\}\^?\{?[^}]*\}?)?/g, 'Σ');
  result = result.replace(/\\approx/g, '≈');
  result = result.replace(/\\times/g, '×');
  result = result.replace(/\\cdot/g, '·');
  result = result.replace(/\\div/g, '÷');
  result = result.replace(/\\leq/g, '≤');
  result = result.replace(/\\geq/g, '≥');
  result = result.replace(/\\neq/g, '≠');
  result = result.replace(/\\pm/g, '±');
  result = result.replace(/\\Rightarrow/g, '⇒');
  result = result.replace(/\\rightarrow/g, '→');
  result = result.replace(/\\left\(/g, '(');
  result = result.replace(/\\right\)/g, ')');
  result = result.replace(/\\left\[/g, '[');
  result = result.replace(/\\right\]/g, ']');
  result = result.replace(/\\\[([\s\S]*?)\\\]/g, (_m, inner) => {
    const cleaned = inner.trim().replace(/\s+/g, ' ');
    const parts = cleaned.split(/\s*=\s*/);
    if (parts.length > 2) {
      return '\n    ' + parts[0].trim() + ' = ' + parts[1].trim() + '\n    = ' + parts.slice(2).join('\n    = ') + '\n';
    }
    return '\n    ' + cleaned + '\n';
  });
  result = result.replace(/\\\(([\s\S]*?)\\\)/g, (_m, inner) => inner.trim().replace(/\s+/g, ' '));
  result = result.replace(/\\\$/g, '$');
  result = result.replace(/\\ /g, ' ');
  result = result.replace(/_\{([^}]*)\}/g, '$1');
  result = result.replace(/\^\{([^}]*)\}/g, '^($1)');
  result = result.replace(/\\[a-zA-Z]+/g, '');
  return result;
}

function generateCitationKey(title: string, index: number): string {
  const t = title.toLowerCase();
  if (t.includes("harvard business review") || t.includes("hbr")) return "HBR";
  if (t.includes("wsj") || t.includes("wall street journal")) return "WSJ";
  if (t.includes("mckinsey")) return "MCK";
  if (t.includes("case study")) return "CST";
  if (t.includes("opinion")) return "OPN";
  if (t.includes("legal") || t.includes("law")) return "LAW";
  if (t.includes("community")) return "CMT";
  if (t.includes("gen z")) return "GNZ";
  if (t.includes("skills gap") || t.includes("talent")) return "SKL";
  if (t.includes("flat organizations")) return "FLT";
  if (t.includes("manager") || t.includes("burnout")) return "MGR";
  if (t.includes("debt") || t.includes("manufacturing debt")) return "DBT";
  if (t.includes("sale-leaseback")) return "SLB";
  if (t.includes("industry analyst")) return "IAN";
  if (t.includes("employer branding")) return "EBR";
  if (t.includes("customer concentration")) return "CCR";
  if (t.includes("long-term") || t.includes("strategy")) return "LTS";
  if (t.includes("pe exit") || t.includes("playbook")) return "PEX";
  if (t.includes("legacy")) return "LGC";
  if (t.includes("union") || t.includes("organizing")) return "UNI";
  if (t.includes("layoff") || t.includes("human side") || t.includes("reduction")) return "LAY";
  if (t.includes("retraining")) return "RTN";
  if (t.includes("transformation trap")) return "TRP";
  const words = title.split(/\s+/).filter(w => w.length > 2);
  if (words.length > 0) return words[0].substring(0, 3).toUpperCase();
  return `A${index + 1}`;
}

export async function fetchWeekPageData(weekNumber: number): Promise<WeekPageData> {
  const weekTitle = WEEK_TITLES[weekNumber] || `Week ${weekNumber}`;

  let voicemail = null;
  try {
    const [vm] = await db
      .select()
      .from(triggeredVoicemails)
      .where(and(eq(triggeredVoicemails.weekNumber, weekNumber), eq(triggeredVoicemails.isActive, true)))
      .limit(1);

    if (vm) {
      let character: any = { name: "Unknown", role: "Apex Manufacturing", headshotUrl: null };
      if (vm.characterId) {
        const allChars = await db
          .select({ name: characterProfiles.name, role: characterProfiles.role, title: characterProfiles.title, headshotUrl: characterProfiles.headshotUrl })
          .from(characterProfiles);
        const slugMatch = allChars.find(
          (c) =>
            c.name.toLowerCase().replace(/[^a-z]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") === vm.characterId ||
            c.name.toLowerCase().replace(/\s+/g, "-") === vm.characterId
        );
        const idMatch = (
          await db
            .select({ name: characterProfiles.name, role: characterProfiles.role, title: characterProfiles.title, headshotUrl: characterProfiles.headshotUrl })
            .from(characterProfiles)
            .where(eq(characterProfiles.id, vm.characterId))
            .limit(1)
        )[0];
        character = slugMatch || idMatch || character;
      }
      voicemail = {
        title: vm.title,
        transcript: vm.transcript || "",
        urgency: vm.urgency || "high",
        audioUrl: vm.audioUrl || `/audio/voicemails/week-${weekNumber}-voicemail.mp3`,
        character,
      };
    }
  } catch (e) {
    console.error("Error fetching voicemail for SSR:", e);
  }

  let advisor = null;
  try {
    const advisorName = WEEK_ADVISOR_MAP[weekNumber];
    const [adv] = await db
      .select({
        id: advisors.id,
        name: advisors.name,
        category: advisors.category,
        title: advisors.title,
        specialty: advisors.specialty,
        bio: advisors.bio,
        transcript: advisors.transcript,
        audioUrl: advisors.audioUrl,
        keyInsights: advisors.keyInsights,
        headshotUrl: advisors.headshotUrl,
      })
      .from(advisors)
      .where(and(eq(advisors.isActive, true), eq(advisors.name, advisorName)))
      .limit(1);

    if (adv) {
      advisor = {
        ...adv,
        keyInsights: (adv.keyInsights as string[] | null) || null,
        audioUrl: adv.audioUrl || `/audio/advisors/${adv.id}.mp3`,
      };
    }
  } catch (e) {
    console.error("Error fetching advisor for SSR:", e);
  }

  let characters: WeekPageData["characters"] = [];
  try {
    characters = await db
      .select({
        id: characterProfiles.id,
        name: characterProfiles.name,
        role: characterProfiles.role,
        title: characterProfiles.title,
        company: characterProfiles.company,
        headshotUrl: characterProfiles.headshotUrl,
        bio: characterProfiles.bio,
        personality: characterProfiles.personality,
        motivations: characterProfiles.motivations,
        fears: characterProfiles.fears,
        socialProfile: characterProfiles.socialProfile,
        influence: characterProfiles.influence,
        hostility: characterProfiles.hostility,
        flexibility: characterProfiles.flexibility,
        riskTolerance: characterProfiles.riskTolerance,
        sortOrder: characterProfiles.sortOrder,
      })
      .from(characterProfiles);
    characters.sort((a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99));
  } catch (e) {
    console.error("Error fetching characters for SSR:", e);
  }

  let pdfContent: WeekPageData["pdfContent"] = { briefing: null, decisions: [], intelArticles: [] };
  try {
    const content = await db
      .select({
        title: simulationContent.title,
        content: simulationContent.content,
        contentType: simulationContent.contentType,
      })
      .from(simulationContent)
      .where(and(eq(simulationContent.weekNumber, weekNumber), eq(simulationContent.isActive, true)));

    const briefingRow = content.find(c => c.contentType === "briefing");
    pdfContent = {
      briefing: briefingRow ? { title: briefingRow.title, content: convertLatexToPlainText(stripMarkdownForPdf(briefingRow.content || "")) } : null,
      decisions: content.filter(c => c.contentType === "decision").map(d => ({ title: d.title, content: convertLatexToPlainText(stripMarkdownForPdf(d.content || "")) })),
      intelArticles: content.filter(c => c.contentType === "intel").map((a, i) => ({ title: a.title, content: convertLatexToPlainText(stripMarkdownForPdf(a.content || "")), citationKey: generateCitationKey(a.title || "", i) })),
    };
  } catch (e) {
    console.error("Error fetching simulation content for SSR PDF:", e);
  }

  return { weekNumber, weekTitle, voicemail, advisor, characters, pdfContent };
}

export function renderWeekPage(data: WeekPageData): string {
  const { weekNumber, weekTitle, voicemail, advisor, characters, pdfContent } = data;
  const baseUrl = process.env.REPLIT_DEV_DOMAIN
    ? `https://${process.env.REPLIT_DEV_DOMAIN}`
    : process.env.REPL_SLUG
      ? `https://${process.env.REPL_SLUG}.replit.app`
      : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Week ${weekNumber}: ${escapeHtml(weekTitle)} | Future Work Academy</title>
  <meta name="robots" content="noindex, nofollow">
  <meta name="description" content="Apex Manufacturing Simulation — Week ${weekNumber}: ${escapeHtml(weekTitle)}. Download the offline guide, listen to voicemails and expert consultants, and review the stakeholder directory.">
  <meta property="og:title" content="Week ${weekNumber}: ${escapeHtml(weekTitle)} | Future Work Academy">
  <meta property="og:description" content="Apex Manufacturing Simulation — Week ${weekNumber} Assignment">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${baseUrl}/week-${weekNumber}">
  <meta property="og:image" content="${baseUrl}/logo.png">
  <meta property="og:site_name" content="Future Work Academy">
  <link rel="canonical" href="${baseUrl}/week-${weekNumber}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Roboto+Mono:wght@400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --navy: #1e3a5f;
      --green: #22c55e;
      --bg: #f8fafc;
      --card-bg: #ffffff;
      --border: #e2e8f0;
      --text: #0f172a;
      --text-secondary: #64748b;
      --text-muted: #94a3b8;
      --destructive: #ef4444;
      --destructive-bg: #fef2f2;
      --accent-bg: #f0fdf4;
      --accent-border: #bbf7d0;
      --primary-bg: #eff6ff;
      --muted-bg: #f1f5f9;
    }
    body {
      font-family: 'Inter', 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }
    a { color: var(--navy); text-decoration: none; }
    .header {
      display: flex; align-items: center; justify-content: space-between; gap: 1rem;
      padding: 0.75rem 1rem; border-bottom: 1px solid var(--border);
      background: rgba(255,255,255,0.8); backdrop-filter: blur(8px);
      position: sticky; top: 0; z-index: 50;
    }
    .header-left { display: flex; align-items: center; gap: 0.75rem; }
    .back-btn {
      display: inline-flex; align-items: center; justify-content: center;
      width: 36px; height: 36px; border-radius: 6px; border: 1px solid var(--border);
      background: transparent; cursor: pointer; color: var(--text-secondary);
      transition: background 0.15s;
    }
    .back-btn:hover { background: var(--muted-bg); }
    .brand-logo { height: 28px; width: auto; flex-shrink: 0; }
    .brand-name { font-weight: 600; font-size: 0.875rem; }
    .brand-sub { font-size: 0.75rem; color: var(--text-secondary); }
    .container { max-width: 72rem; margin: 0 auto; padding: 1.5rem 1rem; }
    @media (min-width: 768px) { .container { padding: 1.5rem; } }
    .badge {
      display: inline-flex; align-items: center; padding: 0.125rem 0.625rem;
      font-size: 0.75rem; font-weight: 500; border-radius: 9999px;
      border: 1px solid var(--border); color: var(--text-secondary);
      background: var(--card-bg); margin-bottom: 0.5rem;
    }
    .badge-destructive {
      background: var(--destructive); color: white; border-color: var(--destructive);
      font-size: 0.6875rem; padding: 0.125rem 0.5rem; font-weight: 600;
    }
    .badge-secondary {
      background: var(--muted-bg); color: var(--text-secondary); border-color: var(--border);
      text-transform: capitalize;
    }
    h1 { font-size: 1.5rem; font-weight: 700; line-height: 1.3; }
    h2 { font-size: 1.25rem; font-weight: 700; }
    h3 { font-size: 1.125rem; font-weight: 700; }
    .subtitle { font-size: 0.875rem; color: var(--text-secondary); }
    .separator { height: 1px; background: var(--border); margin: 1.5rem 0; }
    .card {
      background: var(--card-bg); border: 1px solid var(--border);
      border-radius: 8px; overflow: hidden;
    }
    .card-dashed { border-style: dashed; }
    .card-body { padding: 1.5rem; }
    .space-y > * + * { margin-top: 1rem; }
    .space-y-sm > * + * { margin-top: 0.75rem; }
    .flex { display: flex; }
    .flex-col { flex-direction: column; }
    .items-center { align-items: center; }
    .items-start { align-items: start; }
    .gap-2 { gap: 0.5rem; }
    .gap-3 { gap: 0.75rem; }
    .gap-4 { gap: 1rem; }
    .flex-wrap { flex-wrap: wrap; }
    .justify-between { justify-content: space-between; }
    .flex-1 { flex: 1; }
    .flex-shrink-0 { flex-shrink: 0; }
    .icon-circle {
      display: flex; align-items: center; justify-content: center;
      width: 36px; height: 36px; border-radius: 9999px; flex-shrink: 0;
    }
    .icon-circle-red { background: var(--destructive-bg); color: var(--destructive); }
    .icon-circle-blue { background: var(--primary-bg); color: var(--navy); }
    .icon-circle-green { background: var(--accent-bg); color: var(--green); }
    .avatar {
      width: 48px; height: 48px; border-radius: 9999px; object-fit: cover;
      background: var(--muted-bg); flex-shrink: 0;
    }
    .avatar-lg { width: 56px; height: 56px; }
    .avatar-sm { width: 40px; height: 40px; }
    .avatar-fallback {
      width: 48px; height: 48px; border-radius: 9999px;
      background: var(--navy); color: white;
      display: flex; align-items: center; justify-content: center;
      font-weight: 600; font-size: 0.875rem; flex-shrink: 0;
    }
    .avatar-fallback-lg { width: 56px; height: 56px; font-size: 1rem; }
    .avatar-fallback-sm { width: 40px; height: 40px; font-size: 0.75rem; }
    .tip-box {
      background: var(--accent-bg); border: 1px solid var(--accent-border);
      border-radius: 6px; padding: 0.75rem; font-size: 0.875rem; font-weight: 500;
    }
    .tip-box svg { color: var(--green); flex-shrink: 0; }
    .btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
      padding: 0.5rem 1rem; font-size: 0.875rem; font-weight: 500;
      border-radius: 6px; border: 1px solid transparent; cursor: pointer;
      transition: background 0.15s, opacity 0.15s; line-height: 1.4;
    }
    .btn-primary { background: var(--navy); color: white; }
    .btn-primary:hover { opacity: 0.9; }
    .btn-outline {
      background: transparent; color: var(--navy); border-color: var(--border);
    }
    .btn-outline:hover { background: var(--muted-bg); }
    .btn-ghost {
      background: transparent; color: var(--text-secondary);
      border-color: transparent; padding: 0.375rem 0.75rem; font-size: 0.8125rem;
    }
    .btn-ghost:hover { background: var(--muted-bg); }
    .label-sm {
      font-size: 0.6875rem; font-weight: 600; text-transform: uppercase;
      letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 0.25rem;
    }
    .text-sm { font-size: 0.875rem; }
    .text-xs { font-size: 0.75rem; }
    .text-muted { color: var(--text-secondary); }
    .text-semibold { font-weight: 600; }
    .text-medium { font-weight: 500; }
    .leading-relaxed { line-height: 1.7; }
    .transcript-box {
      background: var(--muted-bg); border: 1px solid var(--border);
      border-radius: 8px; padding: 1rem; margin-top: 0.5rem;
    }
    .transcript-text { font-size: 0.875rem; line-height: 1.7; font-style: italic; color: var(--text-secondary); }
    .audio-player {
      background: var(--muted-bg); border-radius: 8px; padding: 0.75rem;
      border: 1px solid var(--border);
    }
    .audio-player audio { width: 100%; height: 40px; }
    .audio-label {
      display: flex; align-items: center; gap: 0.25rem; font-size: 0.75rem;
      color: var(--text-muted); margin-top: 0.375rem;
    }
    .insight-item {
      display: flex; align-items: flex-start; gap: 0.5rem;
      font-size: 0.875rem; color: var(--text-secondary);
    }
    .insight-check { color: var(--green); flex-shrink: 0; margin-top: 0.125rem; }
    .char-grid {
      display: grid; gap: 1rem;
      grid-template-columns: repeat(1, 1fr);
    }
    @media (min-width: 640px) { .char-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (min-width: 1024px) { .char-grid { grid-template-columns: repeat(3, 1fr); } }
    .char-card { padding: 1rem; }
    .char-card .char-name { font-weight: 600; font-size: 0.875rem; }
    .char-card .char-role { font-size: 0.75rem; color: var(--text-secondary); }
    .char-card .char-bio { font-size: 0.8125rem; color: var(--text-secondary); line-height: 1.5; margin-top: 0.5rem; }
    .trait-bar-container { margin-top: 0.75rem; }
    .trait-row { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem; }
    .trait-label { font-size: 0.6875rem; color: var(--text-muted); width: 5.5rem; flex-shrink: 0; }
    .trait-track { flex: 1; height: 6px; background: var(--muted-bg); border-radius: 9999px; overflow: hidden; }
    .trait-fill { height: 100%; border-radius: 9999px; }
    .trait-val { font-size: 0.6875rem; font-family: 'Roboto Mono', monospace; color: var(--text-muted); width: 1.5rem; text-align: right; }

    .char-expand { margin-top: 0.75rem; border-top: 1px solid var(--border); }
    .char-expand-toggle {
      display: flex; align-items: center; justify-content: center; gap: 0.375rem;
      padding: 0.5rem 0 0.25rem; cursor: pointer; list-style: none;
      font-size: 0.75rem; font-weight: 500; color: var(--navy);
      user-select: none; transition: color 0.15s;
    }
    .char-expand-toggle::-webkit-details-marker { display: none; }
    .char-expand-toggle::marker { display: none; content: ""; }
    .char-expand-toggle:hover { color: var(--green); }
    .char-expand-icon { transition: transform 0.2s ease; flex-shrink: 0; }
    details[open] .char-expand-icon { transform: rotate(180deg); }
    details[open] .char-expand-text { }
    .char-expand-content { padding-top: 0.5rem; }
    .char-detail-section { margin-bottom: 0.75rem; }
    .char-detail-label {
      font-size: 0.6875rem; font-weight: 600; text-transform: uppercase;
      letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 0.375rem;
    }
    .char-detail-text { font-size: 0.8125rem; color: var(--text-secondary); line-height: 1.55; }
    .char-exp-item { padding-left: 0.75rem; border-left: 2px solid var(--border); margin-bottom: 0.5rem; }
    .char-exp-item.char-exp-current { border-left-color: var(--green); }
    .char-exp-title { font-size: 0.8125rem; font-weight: 500; color: var(--text); }
    .char-exp-co { font-size: 0.75rem; color: var(--text-secondary); }
    .char-exp-dur { font-size: 0.6875rem; color: var(--text-muted); }
    .char-skills-wrap { display: flex; flex-wrap: wrap; gap: 0.375rem; }
    .char-skill-badge {
      font-size: 0.6875rem; padding: 0.125rem 0.5rem;
      background: var(--muted-bg); border-radius: 9999px;
      color: var(--text-secondary); white-space: nowrap;
    }

    .ordered-list { list-style-type: decimal; padding-left: 1.5rem; }
    .ordered-list li { margin-bottom: 0.5rem; font-size: 0.875rem; color: var(--text-secondary); }
    .ordered-list li strong { color: var(--text); font-weight: 500; }
    .footer-note {
      font-size: 0.625rem; text-align: center; color: var(--text-muted);
      text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.5; padding: 2rem 0 1rem;
    }
    .search-wrapper { position: relative; max-width: 24rem; }
    .search-input {
      width: 100%; padding: 0.5rem 0.75rem 0.5rem 2.25rem;
      border: 1px solid var(--border); border-radius: 6px;
      font-size: 0.875rem; background: var(--card-bg);
      outline: none; transition: border-color 0.15s;
    }
    .search-input:focus { border-color: var(--navy); }
    .search-icon {
      position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%);
      color: var(--text-muted); pointer-events: none;
    }
    .hidden { display: none; }
    .pdf-download-note {
      background: var(--primary-bg); border: 1px solid #bfdbfe;
      border-radius: 6px; padding: 0.75rem; font-size: 0.8125rem; color: var(--navy);
      margin-top: 0.75rem;
    }
  </style>
</head>
<body>
  <header class="header">
    <div class="header-left">
      <a href="/" class="back-btn" aria-label="Back to home" data-testid="button-back-home">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
      </a>
      <img src="/logo-head.png" alt="FWA" class="brand-logo" />
      <div>
        <div class="brand-name">Future Work Academy</div>
        <div class="brand-sub">Apex Manufacturing Simulation</div>
      </div>
    </div>
  </header>

  <div class="container" data-testid="weekly-simulation-page">
    <div style="margin-bottom: 1.5rem;">
      <span class="badge">Week ${weekNumber} of 8</span>
      <h1 data-testid="text-page-title">${escapeHtml(weekTitle)}</h1>
      <p class="subtitle">Apex Manufacturing Simulation &mdash; Week ${weekNumber} Assignment</p>
    </div>

    <div class="separator"></div>

    <div class="space-y">
      <div class="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 data-testid="text-week-resources">Week ${weekNumber} Resources</h2>
          <p class="subtitle">Everything you need for &ldquo;${escapeHtml(weekTitle)}&rdquo;</p>
        </div>
        <div class="flex items-center gap-2 flex-wrap">
          <button onclick="copyAnswerTemplate()" class="btn btn-outline" id="copy-template-btn" data-testid="button-copy-answer-template">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
            Copy Answer Template
          </button>
          <button onclick="downloadAnswerTemplate()" class="btn btn-outline" data-testid="button-download-answer-template">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            Download .txt
          </button>
          <button onclick="downloadPDF()" class="btn btn-primary" id="pdf-btn" data-testid="button-download-offline-guide">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            Download Week ${weekNumber} PDF
          </button>
        </div>
      </div>

      <div class="card card-dashed" data-testid="card-offline-guide-info">
        <div class="card-body">
          <div class="flex items-start gap-4">
            <div class="icon-circle icon-circle-green">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>
            </div>
            <div>
              <h3 style="font-size: 0.875rem; margin-bottom: 0.5rem;">How to Complete Week ${weekNumber}</h3>
              <ol class="ordered-list">
                <li><strong>Download the PDF</strong> &mdash; contains the full briefing, Intel Articles, decision options with financial data, and the scoring rubric.</li>
                <li><strong>Listen to the voicemail</strong> below &mdash; an urgent message from a key stakeholder that sets the stage for your decision.</li>
                <li><strong>Listen to this week's expert consultant</strong> below &mdash; their special guidance provides critical context you won't find in the written materials.</li>
                <li><strong>Submit your response</strong> through your LMS &mdash; use the <em>Copy Answer Template</em> or <em>Download .txt</em> buttons above to get a pre-formatted template that pastes cleanly into Blackboard or any LMS text field.</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

${renderVoicemailSection(voicemail)}

${renderAdvisorSection(advisor)}

${pdfContent.intelArticles.length > 0 ? `
    <div class="separator" style="margin: 1.5rem 0;"></div>
    <div class="space-y" data-testid="section-research-sources">
      <div>
        <h2>Research Sources</h2>
        <p class="subtitle" style="margin-top: 0.25rem;">
          Use these citation keys when referencing articles in your response
        </p>
      </div>
      <div style="display: grid; gap: 0.75rem; margin-top: 0.75rem;">
        ${pdfContent.intelArticles.map((a, i) => `
          <div class="card" data-testid="card-citation-${a.citationKey}">
            <div class="card-body" style="padding: 1rem;">
              <div class="flex items-center gap-3">
                <span style="display: inline-flex; align-items: center; justify-content: center; min-width: 3.5rem; padding: 0.25rem 0.625rem; background: var(--navy); color: white; font-family: 'Roboto Mono', monospace; font-size: 0.8125rem; font-weight: 600; border-radius: 4px; letter-spacing: 0.05em;" data-testid="badge-citation-key-${a.citationKey}">[${escapeHtml(a.citationKey)}]</span>
                <div class="flex-1">
                  <div style="font-size: 0.875rem; font-weight: 500;">${escapeHtml(a.title)}</div>
                  <div style="font-size: 0.75rem; color: var(--text-muted);">Intel Article ${i + 1} &mdash; Included in PDF download</div>
                </div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="tip-box flex items-start gap-2" style="margin-top: 0.5rem;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;margin-top:0.125rem;"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
        <span>Reference these codes in your written response (e.g., &ldquo;According to [HBR], the key challenge is...&rdquo;)</span>
      </div>
    </div>
` : ''}
    </div>

    <div class="separator" style="margin: 2rem 0;"></div>

    <div class="space-y">
      <div>
        <h2 data-testid="text-stakeholder-title">Stakeholder Directory</h2>
        <p class="subtitle" style="margin-top: 0.25rem;">
          Meet the 17 key stakeholders at Apex Manufacturing. Understanding their backgrounds,
          motivations, and influence is critical to navigating your decisions successfully.
        </p>
      </div>

      <div class="search-wrapper" style="margin-top: 1rem;">
        <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <input type="text" class="search-input" placeholder="Search by name, role, or department..." id="char-search" data-testid="input-search-characters" />
      </div>

      <div class="char-grid" id="char-grid" style="margin-top: 1rem;" data-testid="grid-characters">
${renderCharacterCards(characters)}
      </div>
    </div>

    <p class="footer-note">
      All characters, organizations, and scenarios are fictional &mdash; created for educational simulation purposes only
    </p>
  </div>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
  <script>
    var __pdfData = ${JSON.stringify(pdfContent).replace(/<\//g, '<\\/')};
    var doc, y;
    ${getPdfUtilsScript()}

    function downloadPDF() {
      var btn = document.getElementById('pdf-btn');
      btn.textContent = 'Generating...';
      btn.disabled = true;
      try {
        if (!window.jspdf || !window.jspdf.jsPDF) {
          throw new Error('PDF library not loaded. Please check your internet connection and try again.');
        }
        var data = __pdfData;
        var jsPDF = window.jspdf.jsPDF;
        doc = new jsPDF();
        y = 20;
        var NAVY = [30, 58, 95];
        var DARK = [51, 51, 51];
        var MED = [100, 100, 100];
        var pageW = doc.internal.pageSize.getWidth();
        var margin = 20;
        var maxW = pageW - margin * 2;

        function addWrapped(text, mw, lh, color) {
          pdfAddWrappedMarkdown(text, mw, lh, color, margin, NAVY);
        }

        doc.setFillColor(NAVY[0], NAVY[1], NAVY[2]);
        doc.rect(0, 0, pageW, 45, 'F');
        var hasLogo = false;
        try {
          var logoImg = document.querySelector('.brand-logo');
          if (logoImg && logoImg.complete && logoImg.naturalWidth > 0) {
            var c = document.createElement('canvas');
            c.width = 80; c.height = 80;
            var cx = c.getContext('2d');
            cx.drawImage(logoImg, 0, 0, 80, 80);
            doc.addImage(c.toDataURL('image/png'), 'PNG', margin, 4, 12, 12);
            hasLogo = true;
          }
        } catch(e) {}
        var textX = hasLogo ? margin + 15 : margin;
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('FUTURE WORK ACADEMY', textX, 18);
        doc.setFontSize(14);
        doc.text('Week ${weekNumber}: ${escapeHtml(weekTitle).replace(/'/g, "\\'")}', margin, 28);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Apex Manufacturing Simulation - Offline Guide', margin, 37);
        y = 55;

        if (data.briefing) {
          doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text('BRIEFING', margin, y);
          y += 8;
          if (data.briefing.title) {
            doc.setFontSize(12);
            addWrapped(data.briefing.title, maxW, 6, NAVY);
            y += 2;
          }
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          addWrapped(data.briefing.content || '', maxW, 5, DARK);
          y += 8;
        }

        if (data.intelArticles && data.intelArticles.length > 0) {
          y = pdfCheckPage(y, 15);
          doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text('INTEL ARTICLES', margin, y);
          y += 8;
          for (var a = 0; a < data.intelArticles.length; a++) {
            y = pdfCheckPage(y, 30);
            doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            addWrapped('[' + (data.intelArticles[a].citationKey || (a + 1)) + '] ' + (data.intelArticles[a].title || ''), maxW, 6, NAVY);
            y += 2;
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            addWrapped(data.intelArticles[a].content || '', maxW, 5, MED);
            y += 6;
          }
        }

        if (data.decisions && data.decisions.length > 0) {
          y = pdfCheckPage(y, 15);
          doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text('DECISION OPTIONS', margin, y);
          y += 8;
          for (var d = 0; d < data.decisions.length; d++) {
            y = pdfCheckPage(y, 30);
            doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            addWrapped('Option ' + String.fromCharCode(65 + d) + ': ' + (data.decisions[d].title || ''), maxW, 6, NAVY);
            y += 2;
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            addWrapped(data.decisions[d].content || '', maxW, 5, DARK);
            y += 6;
          }
        }

        doc.addPage();
        y = 25;

        doc.setFillColor(NAVY[0], NAVY[1], NAVY[2]);
        doc.rect(0, 0, pageW, 20, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('SUBMISSION TEMPLATE - Week ${weekNumber}', margin, 14);
        y = 30;

        doc.setTextColor(MED[0], MED[1], MED[2]);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        addWrapped('Complete each section below and submit through your LMS (Blackboard, Canvas, etc.). Minimum 100 words for the Strategic Rationale.', maxW, 4.5, MED);
        y += 6;

        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.line(margin, y, pageW - margin, y);
        y += 6;

        doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Student Name:', margin, y);
        y += 1;
        doc.setDrawColor(180, 180, 180);
        doc.setLineWidth(0.3);
        doc.line(margin + 32, y, pageW - margin, y);
        y += 8;

        doc.text('Team Name:', margin, y);
        y += 1;
        doc.line(margin + 28, y, pageW - margin, y);
        y += 8;

        doc.text('Date:', margin, y);
        y += 1;
        doc.line(margin + 14, y, margin + 70, y);
        y += 10;

        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.line(margin, y, pageW - margin, y);
        y += 8;

        doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('SECTION 1: Decision Selection', margin, y);
        y += 7;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(DARK[0], DARK[1], DARK[2]);
        addWrapped('Circle or mark your chosen option:', maxW, 5, DARK);
        y += 5;

        if (data.decisions && data.decisions.length > 0) {
          for (var d = 0; d < data.decisions.length; d++) {
            y = pdfCheckPage(y, 14);
            var optLetter = String.fromCharCode(65 + d);
            var fullTitle = (data.decisions[d].title || '').replace(/^Week \\d+\\s*Decision:\\s*/i, '');

            doc.setDrawColor(NAVY[0], NAVY[1], NAVY[2]);
            doc.setLineWidth(0.6);
            var circleX = margin + 5;
            var circleY = y - 1.5;
            doc.circle(circleX, circleY, 4);

            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
            doc.text(optLetter, circleX - 2.8, circleY + 1.5);

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(DARK[0], DARK[1], DARK[2]);
            var titleLines = doc.splitTextToSize(fullTitle, maxW - 18);
            for (var tl = 0; tl < titleLines.length; tl++) {
              doc.text(titleLines[tl], margin + 14, y + (tl * 4.5));
            }
            y += Math.max(titleLines.length * 4.5, 5) + 5;
          }
        }
        y += 2;

        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.line(margin, y, pageW - margin, y);
        y += 8;

        doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('SECTION 2: Strategic Rationale (minimum 100 words)', margin, y);
        y += 7;

        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(MED[0], MED[1], MED[2]);
        addWrapped('Begin with "I chose Option [letter] because..." then explain your reasoning. Reference at least one Intel Article using its citation key (e.g., "According to [HBR]..."). Consider financial impact, employee morale, and long-term strategy.', maxW, 4.5, MED);
        y += 4;

        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.2);
        for (var ln = 0; ln < 18; ln++) {
          y = pdfCheckPage(y, 7);
          doc.line(margin, y, pageW - margin, y);
          y += 7;
        }
        y += 4;

        y = pdfCheckPage(y, 30);
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.line(margin, y, pageW - margin, y);
        y += 8;

        doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('SECTION 3: Stakeholder Impact Analysis', margin, y);
        y += 7;

        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(MED[0], MED[1], MED[2]);
        addWrapped('Identify 2-3 stakeholders most affected by your decision. How might they react? (Refer to the Stakeholder Directory)', maxW, 4.5, MED);
        y += 4;

        var stakeholderFields = ['Stakeholder 1', 'Stakeholder 2', 'Stakeholder 3'];
        for (var s = 0; s < stakeholderFields.length; s++) {
          y = pdfCheckPage(y, 22);
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
          doc.text(stakeholderFields[s] + ':', margin, y);
          y += 1;
          doc.setDrawColor(180, 180, 180);
          doc.setLineWidth(0.3);
          doc.line(margin + 30, y, pageW - margin, y);
          y += 5;
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(MED[0], MED[1], MED[2]);
          doc.text('Expected reaction:', margin + 4, y);
          y += 1;
          doc.line(margin + 36, y, pageW - margin, y);
          y += 5;
          doc.line(margin, y, pageW - margin, y);
          y += 7;
        }

        y = pdfCheckPage(y, 20);
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.line(margin, y, pageW - margin, y);
        y += 8;

        doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('SECTION 4: Risk Assessment', margin, y);
        y += 7;

        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(MED[0], MED[1], MED[2]);
        addWrapped('What is the biggest risk of your chosen option? What would you do if that risk materialized?', maxW, 4.5, MED);
        y += 4;

        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.2);
        for (var ln = 0; ln < 8; ln++) {
          y = pdfCheckPage(y, 7);
          doc.line(margin, y, pageW - margin, y);
          y += 7;
        }

        y += 6;
        y = pdfCheckPage(y, 30);
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.line(margin, y, pageW - margin, y);
        y += 8;

        doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('SUPPORTING VISUALIZATIONS', margin, y);
        y += 7;

        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(MED[0], MED[1], MED[2]);
        addWrapped('When submitting online, attach up to 5 charts, tables, or visualizations (PNG, JPEG, WebP) to strengthen your analysis. Export from Excel, Google Sheets, or any tool. The AI evaluator scores your visualizations alongside your essay for Evidence Quality and Reasoning Coherence.', maxW, 4.5, MED);

        y += 6;
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(MED[0], MED[1], MED[2]);
        var scoringNote = 'SCORING: Your response is evaluated on Strategic Thinking (depth of analysis, evidence use), '
          + 'Financial Acumen (understanding of costs, ROI, risk), and Cultural Awareness (empathy for workforce impact, '
          + 'stakeholder management). AI-generated essay scores are formative feedback only -- instructors retain full '
          + 'authority to review and adjust scores.';
        var scoringLines = doc.splitTextToSize(scoringNote, maxW - 8);
        var scoringBoxH = scoringLines.length * 3.5 + 6;
        y = pdfCheckPage(y, scoringBoxH + 4);
        doc.setFillColor(245, 247, 250);
        doc.roundedRect(margin, y - 4, maxW, scoringBoxH, 2, 2, 'F');
        for (var sl = 0; sl < scoringLines.length; sl++) {
          doc.text(scoringLines[sl], margin + 4, y + 1 + sl * 3.5);
        }

        var pageCount = doc.internal.getNumberOfPages();
        for (var p = 1; p <= pageCount; p++) {
          doc.setPage(p);
          doc.setFontSize(8);
          doc.setTextColor(150, 150, 150);
          doc.text('Future Work Academy - Week ${weekNumber} Offline Guide - Page ' + p + ' of ' + pageCount, margin, 287);
        }

        doc.save('Week-${weekNumber}-${weekTitle.replace(/\s+/g, "-")}-Offline-Guide.pdf');
      } catch(err) {
        console.error('PDF generation failed:', err);
        alert(err.message || 'Could not generate the PDF. Please try again.');
      } finally {
        btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg> Download Week ${weekNumber} PDF';
        btn.disabled = false;
      }
    }

    function buildAnswerTemplate() {
      var data = __pdfData;
      var lines = [];
      lines.push('========================================');
      lines.push('FUTURE WORK ACADEMY');
      lines.push('Week ${weekNumber}: ${weekTitle}');
      lines.push('Answer Template');
      lines.push('========================================');
      lines.push('');
      lines.push('Student Name: ________________________');
      lines.push('Date: ________________________________');
      lines.push('');
      lines.push('----------------------------------------');
      lines.push('SECTION 1: Decision Selection');
      lines.push('----------------------------------------');
      lines.push('');
      lines.push('Select ONE option:');
      lines.push('');
      if (data.decisions && data.decisions.length > 0) {
        for (var d = 0; d < data.decisions.length; d++) {
          var letter = String.fromCharCode(65 + d);
          var title = (data.decisions[d].title || '').replace(/^Week \\d+\\s*Decision:\\s*/i, '');
          lines.push('[ ] Option ' + letter + ': ' + title);
        }
      }
      lines.push('');
      lines.push('----------------------------------------');
      lines.push('SECTION 2: Evidence-Based Rationale');
      lines.push('(Minimum 250 words for Weeks 1-2; 300 words for Week 3; 150 words for rationale)');
      lines.push('----------------------------------------');
      lines.push('');
      lines.push('Begin with "I chose Option [letter] because..." then explain your reasoning.');
      lines.push('Reference at least one Intel Article using its citation key (e.g., "According to [HBR]...").');
      lines.push('');
      if (data.intelArticles && data.intelArticles.length > 0) {
        lines.push('Available source codes:');
        for (var a = 0; a < data.intelArticles.length; a++) {
          lines.push('  [' + data.intelArticles[a].citationKey + '] - ' + data.intelArticles[a].title);
        }
        lines.push('');
      }
      lines.push('[Your rationale here]');
      lines.push('');
      lines.push('');
      lines.push('');
      lines.push('----------------------------------------');
      lines.push('SECTION 3: Stakeholder Trade-offs');
      lines.push('----------------------------------------');
      lines.push('');
      lines.push('Identify 2-3 stakeholders most affected by your decision.');
      lines.push('How might they react? (Refer to the Stakeholder Directory)');
      lines.push('');
      lines.push('Stakeholder 1: ________________________');
      lines.push('Expected reaction:');
      lines.push('');
      lines.push('');
      lines.push('Stakeholder 2: ________________________');
      lines.push('Expected reaction:');
      lines.push('');
      lines.push('');
      lines.push('Stakeholder 3: ________________________');
      lines.push('Expected reaction:');
      lines.push('');
      lines.push('');
      lines.push('----------------------------------------');
      lines.push('SECTION 4: Risk Mitigation');
      lines.push('----------------------------------------');
      lines.push('');
      lines.push('What is the biggest risk of your chosen option?');
      lines.push('What would you do if that risk materialized?');
      lines.push('');
      lines.push('[Your risk assessment here]');
      lines.push('');
      lines.push('');
      lines.push('');
      lines.push('----------------------------------------');
      lines.push('SUPPORTING VISUALIZATIONS');
      lines.push('----------------------------------------');
      lines.push('');
      lines.push('Attach up to 5 charts, tables, or');
      lines.push('visualizations to strengthen your analysis');
      lines.push('when submitting online. Export from Excel,');
      lines.push('Google Sheets, or any tool as PNG/JPEG images.');
      lines.push('The AI evaluator scores your visualizations');
      lines.push('alongside your essay for Evidence Quality and');
      lines.push('Reasoning Coherence.');
      lines.push('');
      lines.push('');
      lines.push('========================================');
      lines.push('SCORING: Evidence Quality (25pts) | Reasoning');
      lines.push('Coherence (25pts) | Trade-off Analysis (25pts) |');
      lines.push('Stakeholder Consideration (25pts)');
      lines.push('');
      lines.push('Quality thresholds: Excellent >= 93% | Good >= 72%');
      lines.push('| Adequate >= 52% | Poor < 52%');
      lines.push('========================================');
      return lines.join('\\n');
    }

    function copyAnswerTemplate() {
      var btn = document.getElementById('copy-template-btn');
      var text = buildAnswerTemplate();
      var orig = btn.innerHTML;
      function showCopied() {
        btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Copied!';
        setTimeout(function() { btn.innerHTML = orig; }, 2000);
      }
      function fallbackCopy() {
        try {
          var ta = document.createElement('textarea');
          ta.value = text;
          ta.style.position = 'fixed';
          ta.style.left = '-9999px';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          showCopied();
        } catch(e) {
          alert('Could not copy to clipboard. Use the "Download .txt" button instead.');
        }
      }
      try {
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(text).then(showCopied).catch(fallbackCopy);
        } else {
          fallbackCopy();
        }
      } catch(e) {
        fallbackCopy();
      }
    }

    function downloadAnswerTemplate() {
      var text = buildAnswerTemplate();
      var blob = new Blob([text], { type: 'text/plain' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'Week-${weekNumber}-${weekTitle.replace(/\s+/g, "-")}-Answer-Template.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    document.getElementById('char-search').addEventListener('input', function(e) {
      var q = e.target.value.toLowerCase();
      var cards = document.querySelectorAll('.char-card-wrapper');
      cards.forEach(function(card) {
        var text = card.getAttribute('data-search').toLowerCase();
        card.style.display = text.includes(q) ? '' : 'none';
      });
    });

    document.querySelectorAll('.transcript-toggle').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var target = document.getElementById(btn.getAttribute('data-target'));
        if (target) {
          var isHidden = target.classList.contains('hidden');
          target.classList.toggle('hidden');
          btn.textContent = isHidden ? 'Hide Transcript' : 'Show Transcript';
        }
      });
    });
  </script>
</body>
</html>`;
}

export async function renderWeek0Page(): Promise<string> {
  let characters: WeekPageData["characters"] = [];
  try {
    characters = await db
      .select({
        id: characterProfiles.id,
        name: characterProfiles.name,
        role: characterProfiles.role,
        title: characterProfiles.title,
        company: characterProfiles.company,
        headshotUrl: characterProfiles.headshotUrl,
        bio: characterProfiles.bio,
        personality: characterProfiles.personality,
        motivations: characterProfiles.motivations,
        fears: characterProfiles.fears,
        socialProfile: characterProfiles.socialProfile,
        influence: characterProfiles.influence,
        hostility: characterProfiles.hostility,
        flexibility: characterProfiles.flexibility,
        riskTolerance: characterProfiles.riskTolerance,
        sortOrder: characterProfiles.sortOrder,
      })
      .from(characterProfiles);
    characters.sort((a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99));
  } catch (e) {
    console.error("Error fetching characters for Week 0 SSR:", e);
  }

  const weekLinks = Object.entries(WEEK_TITLES)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([num, title]) => {
      const n = Number(num);
      return `
        <a href="/week-${n}" class="timeline-item" data-testid="link-week-${n}">
          <div class="timeline-number">${n}</div>
          <div class="timeline-content">
            <div class="timeline-title">Week ${n}: ${escapeHtml(title)}</div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;color:var(--text-muted);"><path d="m9 18 6-6-6-6"/></svg>
        </a>`;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Orientation: Welcome to Future Work Academy</title>
  <meta name="robots" content="noindex, nofollow">
  <meta name="description" content="Welcome to Future Work Academy — your orientation guide to the Apex Manufacturing CEO simulation. Meet the stakeholders, understand the scoring system, and prepare for your 8-week journey.">
  <meta property="og:title" content="Orientation | Future Work Academy">
  <meta property="og:description" content="Your journey as CEO of Apex Manufacturing begins here">
  <meta property="og:type" content="website">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Roboto+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --navy: #1e3a5f;
      --green: #22c55e;
      --bg: #f8fafc;
      --card-bg: #ffffff;
      --border: #e2e8f0;
      --text: #0f172a;
      --text-secondary: #64748b;
      --text-muted: #94a3b8;
      --destructive: #ef4444;
      --destructive-bg: #fef2f2;
      --accent-bg: #f0fdf4;
      --accent-border: #bbf7d0;
      --primary-bg: #eff6ff;
      --muted-bg: #f1f5f9;
    }
    body {
      font-family: 'Inter', 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }
    a { color: var(--navy); text-decoration: none; }
    .header {
      display: flex; align-items: center; justify-content: space-between; gap: 1rem;
      padding: 0.75rem 1rem; border-bottom: 1px solid var(--border);
      background: rgba(255,255,255,0.8); backdrop-filter: blur(8px);
      position: sticky; top: 0; z-index: 50;
    }
    .header-left { display: flex; align-items: center; gap: 0.75rem; }
    .back-btn {
      display: inline-flex; align-items: center; justify-content: center;
      width: 36px; height: 36px; border-radius: 6px; border: 1px solid var(--border);
      background: transparent; cursor: pointer; color: var(--text-secondary);
      transition: background 0.15s;
    }
    .back-btn:hover { background: var(--muted-bg); }
    .brand-logo { height: 28px; width: auto; flex-shrink: 0; }
    .brand-name { font-weight: 600; font-size: 0.875rem; }
    .brand-sub { font-size: 0.75rem; color: var(--text-secondary); }
    .container { max-width: 72rem; margin: 0 auto; padding: 1.5rem 1rem; }
    @media (min-width: 768px) { .container { padding: 1.5rem; } }
    .badge {
      display: inline-flex; align-items: center; padding: 0.125rem 0.625rem;
      font-size: 0.75rem; font-weight: 500; border-radius: 9999px;
      border: 1px solid var(--border); color: var(--text-secondary);
      background: var(--card-bg); margin-bottom: 0.5rem;
    }
    h1 { font-size: 1.5rem; font-weight: 700; line-height: 1.3; }
    h2 { font-size: 1.25rem; font-weight: 700; }
    h3 { font-size: 1.125rem; font-weight: 700; }
    .subtitle { font-size: 0.875rem; color: var(--text-secondary); }
    .separator { height: 1px; background: var(--border); margin: 1.5rem 0; }
    .card {
      background: var(--card-bg); border: 1px solid var(--border);
      border-radius: 8px; overflow: hidden;
    }
    .card-body { padding: 1.5rem; }
    .space-y > * + * { margin-top: 1rem; }
    .space-y-sm > * + * { margin-top: 0.75rem; }
    .flex { display: flex; }
    .flex-col { flex-direction: column; }
    .items-center { align-items: center; }
    .items-start { align-items: start; }
    .gap-2 { gap: 0.5rem; }
    .gap-3 { gap: 0.75rem; }
    .gap-4 { gap: 1rem; }
    .flex-wrap { flex-wrap: wrap; }
    .justify-between { justify-content: space-between; }
    .flex-1 { flex: 1; }
    .flex-shrink-0 { flex-shrink: 0; }
    .icon-circle {
      display: flex; align-items: center; justify-content: center;
      width: 36px; height: 36px; border-radius: 9999px; flex-shrink: 0;
    }
    .icon-circle-red { background: var(--destructive-bg); color: var(--destructive); }
    .icon-circle-blue { background: var(--primary-bg); color: var(--navy); }
    .icon-circle-green { background: var(--accent-bg); color: var(--green); }
    .avatar {
      width: 48px; height: 48px; border-radius: 9999px; object-fit: cover;
      background: var(--muted-bg); flex-shrink: 0;
    }
    .avatar-lg { width: 56px; height: 56px; }
    .avatar-sm { width: 40px; height: 40px; }
    .avatar-fallback {
      width: 48px; height: 48px; border-radius: 9999px;
      background: var(--navy); color: white;
      display: flex; align-items: center; justify-content: center;
      font-weight: 600; font-size: 0.875rem; flex-shrink: 0;
    }
    .avatar-fallback-lg { width: 56px; height: 56px; font-size: 1rem; }
    .avatar-fallback-sm { width: 40px; height: 40px; font-size: 0.75rem; }
    .tip-box {
      background: var(--accent-bg); border: 1px solid var(--accent-border);
      border-radius: 6px; padding: 0.75rem; font-size: 0.875rem; font-weight: 500;
    }
    .tip-box svg { color: var(--green); flex-shrink: 0; }
    .btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
      padding: 0.5rem 1rem; font-size: 0.875rem; font-weight: 500;
      border-radius: 6px; border: 1px solid transparent; cursor: pointer;
      transition: background 0.15s, opacity 0.15s; line-height: 1.4;
    }
    .btn-primary { background: var(--navy); color: white; }
    .btn-primary:hover { opacity: 0.9; }
    .btn-outline {
      background: transparent; color: var(--navy); border-color: var(--border);
    }
    .btn-outline:hover { background: var(--muted-bg); }
    .btn-ghost {
      background: transparent; color: var(--text-secondary);
      border-color: transparent; padding: 0.375rem 0.75rem; font-size: 0.8125rem;
    }
    .btn-ghost:hover { background: var(--muted-bg); }
    .label-sm {
      font-size: 0.6875rem; font-weight: 600; text-transform: uppercase;
      letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 0.25rem;
    }
    .text-sm { font-size: 0.875rem; }
    .text-xs { font-size: 0.75rem; }
    .text-muted { color: var(--text-secondary); }
    .text-semibold { font-weight: 600; }
    .text-medium { font-weight: 500; }
    .leading-relaxed { line-height: 1.7; }
    .ordered-list { list-style-type: decimal; padding-left: 1.5rem; }
    .ordered-list li { margin-bottom: 0.5rem; font-size: 0.875rem; color: var(--text-secondary); }
    .ordered-list li strong { color: var(--text); font-weight: 500; }
    .char-grid {
      display: grid; gap: 1rem;
      grid-template-columns: repeat(1, 1fr);
    }
    @media (min-width: 640px) { .char-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (min-width: 1024px) { .char-grid { grid-template-columns: repeat(3, 1fr); } }
    .char-card { padding: 1rem; }
    .char-card .char-name { font-weight: 600; font-size: 0.875rem; }
    .char-card .char-role { font-size: 0.75rem; color: var(--text-secondary); }
    .char-card .char-bio { font-size: 0.8125rem; color: var(--text-secondary); line-height: 1.5; margin-top: 0.5rem; }
    .trait-bar-container { margin-top: 0.75rem; }
    .trait-row { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem; }
    .trait-label { font-size: 0.6875rem; color: var(--text-muted); width: 5.5rem; flex-shrink: 0; }
    .trait-track { flex: 1; height: 6px; background: var(--muted-bg); border-radius: 9999px; overflow: hidden; }
    .trait-fill { height: 100%; border-radius: 9999px; }
    .trait-val { font-size: 0.6875rem; font-family: 'Roboto Mono', monospace; color: var(--text-muted); width: 1.5rem; text-align: right; }
    .char-expand { margin-top: 0.75rem; border-top: 1px solid var(--border); }
    .char-expand-toggle {
      display: flex; align-items: center; justify-content: center; gap: 0.375rem;
      padding: 0.5rem 0 0.25rem; cursor: pointer; list-style: none;
      font-size: 0.75rem; font-weight: 500; color: var(--navy);
      user-select: none; transition: color 0.15s;
    }
    .char-expand-toggle::-webkit-details-marker { display: none; }
    .char-expand-toggle::marker { display: none; content: ""; }
    .char-expand-toggle:hover { color: var(--green); }
    .char-expand-icon { transition: transform 0.2s ease; flex-shrink: 0; }
    details[open] .char-expand-icon { transform: rotate(180deg); }
    .char-expand-content { padding-top: 0.5rem; }
    .char-detail-section { margin-bottom: 0.75rem; }
    .char-detail-label {
      font-size: 0.6875rem; font-weight: 600; text-transform: uppercase;
      letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 0.375rem;
    }
    .char-detail-text { font-size: 0.8125rem; color: var(--text-secondary); line-height: 1.55; }
    .char-exp-item { padding-left: 0.75rem; border-left: 2px solid var(--border); margin-bottom: 0.5rem; }
    .char-exp-item.char-exp-current { border-left-color: var(--green); }
    .char-exp-title { font-size: 0.8125rem; font-weight: 500; color: var(--text); }
    .char-exp-co { font-size: 0.75rem; color: var(--text-secondary); }
    .char-exp-dur { font-size: 0.6875rem; color: var(--text-muted); }
    .char-skills-wrap { display: flex; flex-wrap: wrap; gap: 0.375rem; }
    .char-skill-badge {
      font-size: 0.6875rem; padding: 0.125rem 0.5rem;
      background: var(--muted-bg); border-radius: 9999px;
      color: var(--text-secondary); white-space: nowrap;
    }
    .footer-note {
      font-size: 0.625rem; text-align: center; color: var(--text-muted);
      text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.5; padding: 2rem 0 1rem;
    }
    .search-wrapper { position: relative; max-width: 24rem; }
    .search-input {
      width: 100%; padding: 0.5rem 0.75rem 0.5rem 2.25rem;
      border: 1px solid var(--border); border-radius: 6px;
      font-size: 0.875rem; background: var(--card-bg);
      outline: none; transition: border-color 0.15s;
    }
    .search-input:focus { border-color: var(--navy); }
    .search-icon {
      position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%);
      color: var(--text-muted); pointer-events: none;
    }
    .hidden { display: none; }

    .numbered-step {
      display: flex; align-items: flex-start; gap: 1rem; padding: 1rem;
      border: 1px solid var(--border); border-radius: 8px; background: var(--card-bg);
    }
    .step-number {
      display: flex; align-items: center; justify-content: center;
      width: 32px; height: 32px; border-radius: 9999px; flex-shrink: 0;
      background: var(--navy); color: white; font-weight: 700; font-size: 0.875rem;
    }
    .step-title { font-weight: 600; font-size: 0.875rem; color: var(--text); }
    .step-desc { font-size: 0.8125rem; color: var(--text-secondary); margin-top: 0.125rem; }

    .scoring-grid {
      display: grid; gap: 1rem;
      grid-template-columns: 1fr;
    }
    @media (min-width: 640px) { .scoring-grid { grid-template-columns: 1fr 1fr; } }
    .scoring-card { padding: 1.25rem; }
    .scoring-card h3 { font-size: 1rem; margin-bottom: 0.75rem; }
    .scoring-card ul { list-style: none; padding: 0; }
    .scoring-card li {
      display: flex; align-items: flex-start; gap: 0.5rem;
      font-size: 0.8125rem; color: var(--text-secondary); margin-bottom: 0.375rem;
    }
    .scoring-card li svg { flex-shrink: 0; margin-top: 0.125rem; }
    .scoring-accent-green { border-left: 3px solid var(--green); }
    .scoring-accent-navy { border-left: 3px solid var(--navy); }

    .info-table { width: 100%; border-collapse: collapse; }
    .info-table tr { border-bottom: 1px solid var(--border); }
    .info-table tr:last-child { border-bottom: none; }
    .info-table td { padding: 0.625rem 0.75rem; font-size: 0.875rem; }
    .info-table td:first-child { font-weight: 500; color: var(--text); width: 40%; }
    .info-table td:last-child { color: var(--text-secondary); }

    .timeline-item {
      display: flex; align-items: center; gap: 1rem; padding: 0.75rem 1rem;
      border: 1px solid var(--border); border-radius: 8px; background: var(--card-bg);
      transition: background 0.15s, border-color 0.15s; text-decoration: none;
    }
    .timeline-item:hover { background: var(--muted-bg); border-color: var(--navy); }
    .timeline-number {
      display: flex; align-items: center; justify-content: center;
      width: 28px; height: 28px; border-radius: 9999px; flex-shrink: 0;
      background: var(--primary-bg); color: var(--navy); font-weight: 700; font-size: 0.8125rem;
    }
    .timeline-title { font-weight: 500; font-size: 0.875rem; color: var(--text); }
    .timeline-content { flex: 1; min-width: 0; }

    .cta-card {
      background: var(--primary-bg); border: 1px solid #bfdbfe;
      border-radius: 8px; padding: 1.5rem; text-align: center;
    }
    .cta-card p { font-size: 0.9375rem; color: var(--text-secondary); margin-bottom: 1rem; }
    .cta-card .btn-primary { font-size: 1rem; padding: 0.625rem 1.5rem; }
    .cta-links { margin-top: 0.75rem; font-size: 0.8125rem; color: var(--text-muted); }
    .cta-links a { color: var(--navy); text-decoration: underline; }

    .section-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; }
    .steps-list > * + * { margin-top: 0.75rem; }
    .timeline-list > * + * { margin-top: 0.5rem; }
  </style>
</head>
<body>
  <header class="header">
    <div class="header-left">
      <a href="/" class="back-btn" aria-label="Back to home" data-testid="button-back-home">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
      </a>
      <img src="/logo-head.png" alt="FWA" class="brand-logo" />
      <div>
        <div class="brand-name">Future Work Academy</div>
        <div class="brand-sub">Apex Manufacturing Simulation</div>
      </div>
    </div>
  </header>

  <div class="container" data-testid="week0-orientation-page">
    <div style="margin-bottom: 1.5rem;">
      <span class="badge">Orientation</span>
      <h1 data-testid="text-page-title">Welcome to Future Work Academy</h1>
      <p class="subtitle">Your journey as CEO of Apex Manufacturing begins here</p>
    </div>

    <div class="separator"></div>

    <div class="space-y">

      <div class="section-header">
        <div class="icon-circle icon-circle-red">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
        </div>
        <h2 data-testid="text-mission-title">Your Mission</h2>
      </div>

      <div class="card">
        <div class="card-body space-y-sm">
          <p class="text-sm leading-relaxed">You've just been appointed CEO of Apex Manufacturing &mdash; a $125M automotive parts supplier with 2,400 employees and a 37-year legacy of quality craftsmanship.</p>
          <p class="text-sm leading-relaxed">The Board of Directors has delivered an ultimatum: modernize through AI and automation &mdash; or be replaced. Over the next 8 weeks, every decision you make will shape the company's financial future and cultural identity.</p>
          <p class="text-sm leading-relaxed" style="font-style:italic; color: var(--text-muted);">There are no perfect answers. The simulation rewards thoughtful analysis, not a single &ldquo;right&rdquo; choice.</p>
        </div>
      </div>

      <div class="separator"></div>

      <div class="section-header">
        <div class="icon-circle icon-circle-blue">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.855z"/></svg>
        </div>
        <h2 data-testid="text-how-it-works-title">How the Simulation Works</h2>
      </div>

      <div class="steps-list">
        <div class="numbered-step">
          <div class="step-number">1</div>
          <div>
            <div class="step-title">Read the Weekly Briefing</div>
            <div class="step-desc">Each week presents a new challenge at Apex Manufacturing with real-world parallels</div>
          </div>
        </div>
        <div class="numbered-step">
          <div class="step-number">2</div>
          <div>
            <div class="step-title">Review Intel Articles</div>
            <div class="step-desc">Research from sources like WSJ, HBR, and McKinsey provides critical context</div>
          </div>
        </div>
        <div class="numbered-step">
          <div class="step-number">3</div>
          <div>
            <div class="step-title">Listen to Stakeholder Voicemails</div>
            <div class="step-desc">Key characters will contact you with urgent updates and concerns</div>
          </div>
        </div>
        <div class="numbered-step">
          <div class="step-number">4</div>
          <div>
            <div class="step-title">Consult Expert Advisors</div>
            <div class="step-desc">Specialized consultants offer strategic guidance (limited credits)</div>
          </div>
        </div>
        <div class="numbered-step">
          <div class="step-number">5</div>
          <div>
            <div class="step-title">Make Your Decision</div>
            <div class="step-desc">Choose from multiple strategic options, each with financial and cultural trade-offs</div>
          </div>
        </div>
        <div class="numbered-step">
          <div class="step-number">6</div>
          <div>
            <div class="step-title">Write Your Strategic Rationale</div>
            <div class="step-desc">Explain your reasoning in a minimum 100-word essay</div>
          </div>
        </div>
      </div>

      <div class="separator"></div>

      <div class="section-header">
        <div class="icon-circle icon-circle-green">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
        </div>
        <h2 data-testid="text-scoring-title">Dual Scoring System</h2>
      </div>

      <div class="scoring-grid">
        <div class="card scoring-accent-green">
          <div class="scoring-card">
            <h3 style="color: var(--green);">Financial Health (50 points)</h3>
            <ul>
              <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg> Data-driven justification</li>
              <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg> Risk assessment</li>
              <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg> Competitive awareness</li>
              <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg> Financial feasibility</li>
            </ul>
          </div>
        </div>
        <div class="card scoring-accent-navy">
          <div class="scoring-card">
            <h3 style="color: var(--navy);">Cultural Health (50 points)</h3>
            <ul>
              <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--navy)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg> Stakeholder awareness</li>
              <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--navy)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg> Communication strategy</li>
              <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--navy)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg> Workforce transition plan</li>
              <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--navy)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg> Cultural sensitivity</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="tip-box flex items-center gap-2">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        Up to 10 bonus points for citing Intel Article research
      </div>

      <div class="separator"></div>

      <div class="section-header">
        <div class="icon-circle icon-circle-blue">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20h.01"/><path d="M7 20v-4"/><path d="M12 20v-8"/><path d="M17 20V8"/><path d="M22 4v16"/></svg>
        </div>
        <h2 data-testid="text-company-title">Apex Manufacturing at a Glance</h2>
      </div>

      <div class="card">
        <div class="card-body" style="padding: 0;">
          <table class="info-table">
            <tr><td>Company</td><td>Apex Manufacturing</td></tr>
            <tr><td>Industry</td><td>Automotive parts supplier</td></tr>
            <tr><td>Annual Revenue</td><td>$125 million</td></tr>
            <tr><td>Employees</td><td>2,400</td></tr>
            <tr><td>Average Tenure</td><td>7.2 years</td></tr>
            <tr><td>Location</td><td>Midwest United States</td></tr>
            <tr><td>Founded</td><td>1987</td></tr>
            <tr><td>Current Automation Level</td><td>12%</td></tr>
          </table>
        </div>
      </div>

      <div class="separator"></div>

      <div class="section-header">
        <div class="icon-circle icon-circle-green">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>
        </div>
        <h2 data-testid="text-journey-title">The 8-Week Journey</h2>
      </div>

      <div class="timeline-list">
${weekLinks}
      </div>

      <div class="separator"></div>

      <div class="section-header">
        <div class="icon-circle icon-circle-blue">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
        </div>
        <h2 data-testid="text-instructor-tools-title">Instructor Tools</h2>
      </div>

      <a href="/grade" class="timeline-item" data-testid="link-grading-module">
        <div class="timeline-number" style="background: var(--navy); color: white;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
        </div>
        <div class="timeline-content">
          <div class="timeline-title">Grading Module</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">Grade student responses submitted through Blackboard or other LMS platforms</div>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;color:var(--text-muted);"><path d="m9 18 6-6-6-6"/></svg>
      </a>

      <a href="/survey" class="timeline-item" data-testid="link-student-survey">
        <div class="timeline-number" style="background: var(--navy); color: white;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </div>
        <div class="timeline-content">
          <div class="timeline-title">Student Feedback Survey</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">Weekly perception survey — share feedback on realism, fairness, difficulty, and engagement</div>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;color:var(--text-muted);"><path d="m9 18 6-6-6-6"/></svg>
      </a>

      <div class="separator"></div>

      <div>
        <h2 data-testid="text-stakeholder-title">Stakeholder Directory</h2>
        <p class="subtitle" style="margin-top: 0.25rem;">
          Meet the 17 key stakeholders at Apex Manufacturing. Understanding their backgrounds,
          motivations, and influence is critical to navigating your decisions successfully.
        </p>
      </div>

      <div class="search-wrapper" style="margin-top: 1rem;">
        <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <input type="text" class="search-input" placeholder="Search by name, role, or department..." id="char-search" data-testid="input-search-characters" />
      </div>

      <div class="char-grid" id="char-grid" style="margin-top: 1rem;" data-testid="grid-characters">
${renderCharacterCards(characters)}
      </div>

      <div class="separator"></div>

      <div class="cta-card" data-testid="card-ready-to-begin">
        <h2 style="margin-bottom: 0.5rem;">Ready to Begin?</h2>
        <p>Head to Week 1: The Automation Imperative to start your first assignment.</p>
        <a href="/week-1" class="btn btn-primary" data-testid="link-start-week-1">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          Start Week 1
        </a>
        <div class="cta-links">
          or review the <a href="/guides/student" data-testid="link-student-guide">Student Guide</a> first
        </div>
      </div>
    </div>

    <p class="footer-note">
      All characters, organizations, and scenarios are fictional &mdash; created for educational simulation purposes only
    </p>
  </div>

  <script>
    document.getElementById('char-search').addEventListener('input', function(e) {
      var q = e.target.value.toLowerCase();
      var cards = document.querySelectorAll('.char-card-wrapper');
      cards.forEach(function(card) {
        var text = card.getAttribute('data-search').toLowerCase();
        card.style.display = text.includes(q) ? '' : 'none';
      });
    });
  </script>
</body>
</html>`;
}

function renderVoicemailSection(voicemail: WeekPageData["voicemail"]): string {
  if (!voicemail) return "";
  const initials = getInitials(voicemail.character.name);
  const avatarHtml = voicemail.character.headshotUrl
    ? `<img src="${escapeHtml(voicemail.character.headshotUrl)}" alt="${escapeHtml(voicemail.character.name)}" class="avatar" />`
    : `<div class="avatar-fallback">${escapeHtml(initials)}</div>`;

  return `
      <div class="card" data-testid="card-public-voicemail">
        <div class="card-body space-y">
          <div class="flex items-center gap-3">
            <div class="icon-circle icon-circle-red">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            </div>
            <div style="flex:1; min-width:0;">
              <h3 data-testid="text-voicemail-title">Incoming Voicemail</h3>
              <p class="subtitle">${escapeHtml(voicemail.title)}</p>
            </div>
            <span class="badge badge-destructive">${escapeHtml(voicemail.urgency)} priority</span>
          </div>

          <div class="tip-box flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>
            Listen to this voicemail before making your decision
          </div>

          <div class="separator" style="margin: 0.75rem 0;"></div>

          <div class="flex items-start gap-3">
            ${avatarHtml}
            <div>
              <p class="text-sm text-semibold">${escapeHtml(voicemail.character.name)}</p>
              <p class="text-xs text-muted">${escapeHtml(voicemail.character.title || voicemail.character.role)}</p>
            </div>
          </div>

          <div class="audio-player">
            <audio controls preload="metadata" style="width:100%;">
              <source src="${escapeHtml(voicemail.audioUrl)}" type="audio/mpeg">
              Your browser does not support the audio element.
            </audio>
            <div class="audio-label">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>
              Voicemail Audio
            </div>
          </div>

          <div>
            <button class="btn btn-ghost transcript-toggle" data-target="vm-transcript" data-testid="button-toggle-voicemail-transcript">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px;"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>
              Show Transcript
            </button>
            <div id="vm-transcript" class="transcript-box hidden" data-testid="text-voicemail-transcript">
              <p class="transcript-text">&ldquo;${escapeHtml(voicemail.transcript)}&rdquo;</p>
            </div>
          </div>
        </div>
      </div>`;
}

function renderAdvisorSection(advisor: WeekPageData["advisor"]): string {
  if (!advisor) return "";
  const initials = getInitials(advisor.name);
  const avatarHtml = advisor.headshotUrl
    ? `<img src="${escapeHtml(advisor.headshotUrl)}" alt="${escapeHtml(advisor.name)}" class="avatar avatar-lg" />`
    : `<div class="avatar-fallback avatar-fallback-lg">${escapeHtml(initials)}</div>`;

  const insightsHtml =
    advisor.keyInsights && advisor.keyInsights.length > 0
      ? `
          <div>
            <div class="label-sm flex items-center gap-2" style="margin-bottom:0.5rem;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
              Key Insights
            </div>
            <ul style="list-style:none; padding:0;" class="space-y-sm">
              ${advisor.keyInsights
                .map(
                  (insight) => `
                <li class="insight-item">
                  <svg class="insight-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
                  ${escapeHtml(insight)}
                </li>`
                )
                .join("")}
            </ul>
          </div>`
      : "";

  const transcriptHtml = advisor.transcript
    ? `
          <div>
            <button class="btn btn-ghost transcript-toggle" data-target="adv-transcript" data-testid="button-toggle-advisor-transcript">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px;"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>
              Show Transcript
            </button>
            <div id="adv-transcript" class="transcript-box hidden" data-testid="text-advisor-transcript">
              <p class="transcript-text">${escapeHtml(advisor.transcript)}</p>
            </div>
          </div>`
    : "";

  return `
      <div class="card" data-testid="card-public-advisor">
        <div class="card-body space-y">
          <div class="flex items-center gap-3">
            <div class="icon-circle icon-circle-blue">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
            </div>
            <div>
              <h3 data-testid="text-advisor-title">This Week's Expert Consultant</h3>
              <p class="subtitle">Listen for special insights to inform your decision</p>
            </div>
          </div>

          <div class="tip-box flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>
            Listen to this consultant's guidance before submitting
          </div>

          <div class="separator" style="margin: 0.75rem 0;"></div>

          <div class="flex items-start gap-4">
            ${avatarHtml}
            <div>
              <p class="text-sm text-semibold">${escapeHtml(advisor.name)}</p>
              <p class="text-xs text-muted">${escapeHtml(advisor.title)}</p>
              <span class="badge badge-secondary" style="margin-top:0.375rem;">${escapeHtml(advisor.category.replace("_", " "))}</span>
            </div>
          </div>

          <div>
            <div class="label-sm">Specialty</div>
            <p class="text-sm">${escapeHtml(advisor.specialty)}</p>
          </div>
          <div>
            <div class="label-sm">Background</div>
            <p class="text-sm text-muted leading-relaxed">${escapeHtml(advisor.bio)}</p>
          </div>

          <div class="audio-player">
            <audio controls preload="metadata" style="width:100%;">
              <source src="${escapeHtml(advisor.audioUrl)}" type="audio/mpeg">
              Your browser does not support the audio element.
            </audio>
            <div class="audio-label">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>
              Consultant Audio
            </div>
          </div>

${insightsHtml}
${transcriptHtml}
        </div>
      </div>`;
}

function renderCharacterCards(characters: WeekPageData["characters"]): string {
  return characters
    .map((c) => {
      const initials = getInitials(c.name);
      const avatarHtml = c.headshotUrl
        ? `<img src="${escapeHtml(c.headshotUrl)}" alt="${escapeHtml(c.name)}" class="avatar avatar-sm" />`
        : `<div class="avatar-fallback avatar-fallback-sm">${escapeHtml(initials)}</div>`;

      const searchText = [c.name, c.role, c.title || "", c.company || ""].join(" ");
      let bioPreview = "";
      if (c.bio) {
        const sentences = c.bio.match(/[^.!?]+[.!?]+/g);
        if (sentences && sentences.length > 0) {
          let preview = "";
          for (const s of sentences) {
            if (preview.length > 0 && preview.length + s.length > 200) break;
            preview += s;
            if (preview.length >= 60) break;
          }
          bioPreview = preview.trim();
        } else {
          bioPreview = c.bio.trim();
        }
      }

      const traits = [];
      if (c.influence != null) traits.push({ label: "Influence", value: c.influence, color: "#3b82f6" });
      if (c.hostility != null) traits.push({ label: "Hostility", value: c.hostility, color: "#ef4444" });
      if (c.flexibility != null) traits.push({ label: "Flexibility", value: c.flexibility, color: "#22c55e" });
      if (c.riskTolerance != null) traits.push({ label: "Risk Tolerance", value: c.riskTolerance, color: "#f59e0b" });

      const traitHtml = traits.length > 0
        ? `<div class="trait-bar-container">${traits
            .map(
              (t) => `
            <div class="trait-row">
              <span class="trait-label">${t.label}</span>
              <div class="trait-track"><div class="trait-fill" style="width:${(t.value / 10) * 100}%;background:${t.color};"></div></div>
              <span class="trait-val">${t.value}</span>
            </div>`
            )
            .join("")}</div>`
        : "";

      const sp = c.socialProfile as Record<string, any> | null | undefined;

      const detailSections: string[] = [];

      const fullBio = sp?.about || c.bio;
      if (fullBio) {
        detailSections.push(`
          <div class="char-detail-section">
            <h4 class="char-detail-label">About</h4>
            <p class="char-detail-text">${escapeHtml(fullBio)}</p>
          </div>`);
      }

      if (c.personality) {
        detailSections.push(`
          <div class="char-detail-section">
            <h4 class="char-detail-label">Personality</h4>
            <p class="char-detail-text">${escapeHtml(c.personality)}</p>
          </div>`);
      }

      if (c.motivations) {
        detailSections.push(`
          <div class="char-detail-section">
            <h4 class="char-detail-label">Motivations</h4>
            <p class="char-detail-text">${escapeHtml(c.motivations)}</p>
          </div>`);
      }

      if (c.fears) {
        detailSections.push(`
          <div class="char-detail-section">
            <h4 class="char-detail-label">Concerns</h4>
            <p class="char-detail-text">${escapeHtml(c.fears)}</p>
          </div>`);
      }

      if (sp?.currentPosition) {
        let expHtml = `
          <div class="char-detail-section">
            <h4 class="char-detail-label">Experience</h4>
            <div class="char-exp-item char-exp-current">
              <p class="char-exp-title">${escapeHtml(sp.currentPosition.title)}</p>
              <p class="char-exp-co">${escapeHtml(sp.currentPosition.company)}</p>
              ${sp.currentPosition.duration ? `<p class="char-exp-dur">${escapeHtml(sp.currentPosition.duration)}</p>` : ""}
              ${sp.currentPosition.description ? `<p class="char-detail-text" style="margin-top:0.25rem;">${escapeHtml(sp.currentPosition.description)}</p>` : ""}
            </div>`;
        if (sp.previousPositions && Array.isArray(sp.previousPositions)) {
          for (const pos of sp.previousPositions) {
            expHtml += `
            <div class="char-exp-item">
              <p class="char-exp-title">${escapeHtml(pos.title)}</p>
              <p class="char-exp-co">${escapeHtml(pos.company)}</p>
              ${pos.duration ? `<p class="char-exp-dur">${escapeHtml(pos.duration)}</p>` : ""}
            </div>`;
          }
        }
        expHtml += `</div>`;
        detailSections.push(expHtml);
      }

      if (sp?.education && Array.isArray(sp.education) && sp.education.length > 0) {
        let eduHtml = `
          <div class="char-detail-section">
            <h4 class="char-detail-label">Education</h4>`;
        for (const edu of sp.education) {
          eduHtml += `
            <div class="char-exp-item">
              <p class="char-exp-title">${escapeHtml(edu.institution)}</p>
              <p class="char-exp-co">${escapeHtml(edu.degree)}</p>
              ${edu.year ? `<p class="char-exp-dur">${escapeHtml(edu.year)}</p>` : ""}
            </div>`;
        }
        eduHtml += `</div>`;
        detailSections.push(eduHtml);
      }

      if (sp?.skills && Array.isArray(sp.skills) && sp.skills.length > 0) {
        const skillBadges = sp.skills.map((s: string) => `<span class="char-skill-badge">${escapeHtml(s)}</span>`).join("");
        detailSections.push(`
          <div class="char-detail-section">
            <h4 class="char-detail-label">Skills</h4>
            <div class="char-skills-wrap">${skillBadges}</div>
          </div>`);
      }

      const hasDetails = detailSections.length > 0;

      return `
        <div class="card char-card-wrapper" data-search="${escapeHtml(searchText)}" data-testid="card-character-${escapeHtml(c.id)}">
          <div class="char-card">
            <div class="flex items-center gap-3">
              ${avatarHtml}
              <div style="min-width:0;flex:1;">
                <div class="char-name">${escapeHtml(c.name)}</div>
                <div class="char-role">${escapeHtml(c.title || c.role)}${c.company ? ` &middot; ${escapeHtml(c.company)}` : ""}</div>
              </div>
            </div>
            ${bioPreview ? `<p class="char-bio">${escapeHtml(bioPreview)}</p>` : ""}
            ${traitHtml}
            ${hasDetails ? `
            <details class="char-expand" data-testid="details-character-${escapeHtml(c.id)}">
              <summary class="char-expand-toggle" data-testid="button-expand-character-${escapeHtml(c.id)}">
                <span class="char-expand-text">View full profile</span>
                <svg class="char-expand-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </summary>
              <div class="char-expand-content">
                ${detailSections.join("")}
              </div>
            </details>` : ""}
          </div>
        </div>`;
    })
    .join("\n");
}
