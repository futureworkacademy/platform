import { db } from "./db";
import { characterProfiles, triggeredVoicemails, advisors, simulationContent } from "@shared/models/auth";
import { eq, and } from "drizzle-orm";

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

function escapeHtml(text: string): string {
  return text
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
    influence?: number | null;
    hostility?: number | null;
    flexibility?: number | null;
    riskTolerance?: number | null;
    sortOrder?: number | null;
  }[];
  pdfContent: {
    briefing: { title: string; content: string } | null;
    decisions: { title: string; content: string }[];
    intelArticles: { title: string; content: string }[];
  };
}

function stripMarkdown(text: string): string {
  return text
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
      briefing: briefingRow ? { title: briefingRow.title, content: stripMarkdown(briefingRow.content || "") } : null,
      decisions: content.filter(c => c.contentType === "decision").map(d => ({ title: d.title, content: stripMarkdown(d.content || "") })),
      intelArticles: content.filter(c => c.contentType === "intel").map(a => ({ title: a.title, content: stripMarkdown(a.content || "") })),
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
  <meta name="description" content="Apex Manufacturing Simulation — Week ${weekNumber}: ${escapeHtml(weekTitle)}. Download the offline guide, listen to voicemails and expert consultants, and review the stakeholder directory.">
  <meta property="og:title" content="Week ${weekNumber}: ${escapeHtml(weekTitle)} | Future Work Academy">
  <meta property="og:description" content="Apex Manufacturing Simulation — Week ${weekNumber} Assignment">
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
        <button onclick="downloadPDF()" class="btn btn-primary" id="pdf-btn" data-testid="button-download-offline-guide">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
          Download Week ${weekNumber} PDF
        </button>
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
                <li><strong>Submit your response</strong> through your LMS using the template in the PDF.</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

${renderVoicemailSection(voicemail)}

${renderAdvisorSection(advisor)}
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
        var doc = new jsPDF();
        var y = 20;
        var NAVY = [30, 58, 95];
        var DARK = [51, 51, 51];
        var MED = [100, 100, 100];
        var pageW = doc.internal.pageSize.getWidth();
        var margin = 20;
        var maxW = pageW - margin * 2;

        function checkPage(needed) {
          if (y + needed > 270) { doc.addPage(); y = 25; }
          return y;
        }
        function addWrapped(text, mw, lh, color) {
          doc.setTextColor(color[0], color[1], color[2]);
          var lines = doc.splitTextToSize(text || '', mw);
          for (var i = 0; i < lines.length; i++) {
            checkPage(lh);
            doc.text(lines[i], margin, y);
            y += lh;
          }
        }

        doc.setFillColor(NAVY[0], NAVY[1], NAVY[2]);
        doc.rect(0, 0, pageW, 45, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('FUTURE WORK ACADEMY', margin, 18);
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
          checkPage(15);
          doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text('INTEL ARTICLES', margin, y);
          y += 8;
          for (var a = 0; a < data.intelArticles.length; a++) {
            checkPage(12);
            doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            addWrapped((a + 1) + '. ' + (data.intelArticles[a].title || ''), maxW, 6, NAVY);
            y += 2;
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            addWrapped(data.intelArticles[a].content || '', maxW, 5, MED);
            y += 6;
          }
        }

        if (data.decisions && data.decisions.length > 0) {
          checkPage(15);
          doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text('DECISION OPTIONS', margin, y);
          y += 8;
          for (var d = 0; d < data.decisions.length; d++) {
            checkPage(12);
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
      const bio = c.bio ? (c.bio.length > 150 ? c.bio.substring(0, 147) + "..." : c.bio) : "";

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

      return `
        <div class="card char-card-wrapper" data-search="${escapeHtml(searchText)}" data-testid="card-character-${escapeHtml(c.id)}">
          <div class="char-card">
            <div class="flex items-center gap-3">
              ${avatarHtml}
              <div style="min-width:0;">
                <div class="char-name">${escapeHtml(c.name)}</div>
                <div class="char-role">${escapeHtml(c.title || c.role)}${c.company ? ` &middot; ${escapeHtml(c.company)}` : ""}</div>
              </div>
            </div>
            ${bio ? `<p class="char-bio">${escapeHtml(bio)}</p>` : ""}
            ${traitHtml}
          </div>
        </div>`;
    })
    .join("\n");
}
