import { db } from "./db";
import { simulationContent, characterProfiles } from "@shared/models/auth";
import { eq, and } from "drizzle-orm";
import { evaluateTextResponse, type RubricCriterionInput } from "./services/llm-evaluation";

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

function escapeHtml(text: string | number | unknown): string {
  const str = String(text ?? "");
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const GRADING_RUBRIC: RubricCriterionInput[] = [
  {
    id: "strategic_thinking",
    name: "Strategic Thinking & Financial Analysis",
    description: "Quality of strategic reasoning, use of financial data (NPV, ROI, payback period), and alignment with company objectives",
    maxPoints: 25,
    evaluationGuidelines: "Award 20-25 for specific financial metrics cited and applied to the decision. 15-19 for general financial awareness. 10-14 for basic reasoning without data. Below 10 for vague or missing analysis.",
  },
  {
    id: "stakeholder_awareness",
    name: "Stakeholder Awareness & Management",
    description: "Recognition of diverse stakeholder perspectives (board, employees, union, customers) and strategies to address their concerns",
    maxPoints: 25,
    evaluationGuidelines: "Award 20-25 for addressing 3+ stakeholders with specific strategies. 15-19 for mentioning multiple stakeholders. 10-14 for acknowledging stakeholders without depth. Below 10 for ignoring stakeholder impact.",
  },
  {
    id: "risk_assessment",
    name: "Risk Assessment & Mitigation",
    description: "Identification of operational, financial, and cultural risks with proposed mitigation strategies",
    maxPoints: 25,
    evaluationGuidelines: "Award 20-25 for identifying specific risks with probability/impact and mitigation plans. 15-19 for identifying risks with some mitigation. 10-14 for mentioning risks without mitigation. Below 10 for minimal risk awareness.",
  },
  {
    id: "research_application",
    name: "Research & Evidence Application",
    description: "Use of Intel Article research (WSJ, HBR, McKinsey), citation of case studies, industry data, and external evidence to support arguments",
    maxPoints: 25,
    evaluationGuidelines: "Award 20-25 for citing specific data from Intel Articles, case studies, or industry benchmarks. 15-19 for general references to research materials. 10-14 for awareness of external factors without citations. Below 10 for no evidence of research use.",
  },
];

export interface GradingRequest {
  weekNumber: number;
  optionChosen: string;
  studentName: string;
  essayText: string;
}

export interface GradingResult {
  studentName: string;
  weekNumber: number;
  optionChosen: string;
  totalScore: number;
  maxScore: number;
  percentage: number;
  overallQuality: string;
  rubricScores: Array<{
    criterionName: string;
    score: number;
    maxPoints: number;
    feedback: string;
  }>;
  overallFeedback: string;
  strengths: string[];
  areasForImprovement: string[];
}

async function getWeekContext(weekNumber: number): Promise<string> {
  try {
    const content = await db
      .select({
        title: simulationContent.title,
        content: simulationContent.content,
        contentType: simulationContent.contentType,
      })
      .from(simulationContent)
      .where(and(eq(simulationContent.weekNumber, weekNumber), eq(simulationContent.isActive, true)));

    const briefing = content.find(c => c.contentType === "briefing");
    const decisions = content.filter(c => c.contentType === "decision");

    let context = `Week ${weekNumber}: ${WEEK_TITLES[weekNumber] || "Unknown"}\n\n`;
    if (briefing) {
      context += `BRIEFING: ${briefing.content?.substring(0, 1500) || ""}\n\n`;
    }
    decisions.forEach((d, i) => {
      const optionLetter = String.fromCharCode(65 + i);
      context += `OPTION ${optionLetter}: ${d.title}\n${d.content?.substring(0, 800) || ""}\n\n`;
    });
    return context;
  } catch (e) {
    console.error("Error fetching week context for grading:", e);
    return `Week ${weekNumber}: ${WEEK_TITLES[weekNumber] || "Unknown"}`;
  }
}

async function getStakeholderContext(): Promise<string> {
  try {
    const chars = await db
      .select({
        name: characterProfiles.name,
        role: characterProfiles.role,
        title: characterProfiles.title,
        influence: characterProfiles.influence,
        hostility: characterProfiles.hostility,
        flexibility: characterProfiles.flexibility,
      })
      .from(characterProfiles);

    return "Key stakeholders at Apex Manufacturing:\n" +
      chars.map(c => `- ${c.name} (${c.title || c.role}): Influence ${c.influence}/10, Hostility ${c.hostility}/10, Flexibility ${c.flexibility}/10`).join("\n");
  } catch (e) {
    return "";
  }
}

export async function gradeSubmission(req: GradingRequest): Promise<GradingResult> {
  const weekContext = await getWeekContext(req.weekNumber);
  const stakeholderContext = await getStakeholderContext();

  const promptContext = `${weekContext}\nThe student chose Option ${req.optionChosen}.\n\nEvaluate their complete response including strategic rationale, stakeholder analysis, and risk assessment sections.`;

  const result = await evaluateTextResponse(
    req.essayText,
    promptContext,
    GRADING_RUBRIC,
    req.weekNumber,
    stakeholderContext,
  );

  let quality = "Poor";
  if (result.percentageScore >= 80) quality = "Excellent";
  else if (result.percentageScore >= 65) quality = "Good";
  else if (result.percentageScore >= 50) quality = "Adequate";

  return {
    studentName: req.studentName,
    weekNumber: req.weekNumber,
    optionChosen: req.optionChosen,
    totalScore: result.totalScore,
    maxScore: result.maxPossibleScore,
    percentage: result.percentageScore,
    overallQuality: quality,
    rubricScores: result.rubricScores.map(s => ({
      criterionName: s.criterionName,
      score: s.score,
      maxPoints: s.maxPoints,
      feedback: s.feedback,
    })),
    overallFeedback: result.overallFeedback,
    strengths: result.strengths,
    areasForImprovement: result.areasForImprovement,
  };
}

export function renderGradingPage(): string {
  const weekOptions = Object.entries(WEEK_TITLES)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([num, title]) => `<option value="${num}">Week ${num}: ${escapeHtml(title)}</option>`)
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Grading Module | Future Work Academy</title>
  <meta name="description" content="AI-powered grading module for Apex Manufacturing simulation responses. Grade student essays submitted through Blackboard or other LMS platforms.">
  <meta property="og:title" content="Grading Module | Future Work Academy">
  <meta property="og:description" content="Grade student simulation responses with AI-powered rubric evaluation">
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
      --warning-bg: #fffbeb;
      --warning-border: #fde68a;
      --warning-text: #92400e;
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
    .container { max-width: 64rem; margin: 0 auto; padding: 1.5rem 1rem; }
    @media (min-width: 768px) { .container { padding: 2rem 1.5rem; } }

    h1 { font-size: 1.5rem; font-weight: 700; line-height: 1.3; }
    h2 { font-size: 1.25rem; font-weight: 700; }
    h3 { font-size: 1rem; font-weight: 600; }
    .subtitle { font-size: 0.875rem; color: var(--text-secondary); }
    .separator { height: 1px; background: var(--border); margin: 1.5rem 0; }

    .card {
      background: var(--card-bg); border: 1px solid var(--border);
      border-radius: 8px; overflow: hidden;
    }
    .card-body { padding: 1.5rem; }
    .space-y > * + * { margin-top: 1rem; }

    .badge {
      display: inline-flex; align-items: center; padding: 0.125rem 0.625rem;
      font-size: 0.75rem; font-weight: 500; border-radius: 9999px;
      border: 1px solid var(--border); color: var(--text-secondary);
      background: var(--card-bg);
    }

    .tabs {
      display: flex; gap: 0; border-bottom: 2px solid var(--border); margin-bottom: 1.5rem;
    }
    .tab-btn {
      padding: 0.75rem 1.5rem; font-size: 0.875rem; font-weight: 500;
      background: none; border: none; border-bottom: 2px solid transparent;
      margin-bottom: -2px; cursor: pointer; color: var(--text-secondary);
      transition: all 0.15s;
    }
    .tab-btn:hover { color: var(--text); background: var(--muted-bg); }
    .tab-btn.active { color: var(--navy); border-bottom-color: var(--navy); font-weight: 600; }
    .tab-panel { display: none; }
    .tab-panel.active { display: block; }

    label {
      display: block; font-size: 0.875rem; font-weight: 500;
      margin-bottom: 0.375rem; color: var(--text);
    }
    .label-hint { font-weight: 400; color: var(--text-muted); }
    select, input[type="text"], textarea {
      width: 100%; padding: 0.625rem 0.75rem;
      border: 1px solid var(--border); border-radius: 6px;
      font-size: 0.875rem; font-family: inherit;
      background: var(--card-bg); color: var(--text);
      transition: border-color 0.15s;
    }
    select:focus, input:focus, textarea:focus {
      outline: none; border-color: var(--navy);
      box-shadow: 0 0 0 3px rgba(30, 58, 95, 0.1);
    }
    textarea { resize: vertical; min-height: 200px; line-height: 1.6; }

    .form-row {
      display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;
    }
    @media (max-width: 640px) { .form-row { grid-template-columns: 1fr; } }
    .form-group { margin-bottom: 1rem; }

    .btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
      padding: 0.625rem 1.25rem; font-size: 0.875rem; font-weight: 600;
      border-radius: 6px; border: none; cursor: pointer;
      transition: all 0.15s; font-family: inherit;
    }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-primary { background: var(--navy); color: white; }
    .btn-primary:hover:not(:disabled) { background: #163252; }
    .btn-secondary { background: var(--muted-bg); color: var(--text); border: 1px solid var(--border); }
    .btn-secondary:hover:not(:disabled) { background: var(--border); }
    .btn-green { background: var(--green); color: white; }
    .btn-green:hover:not(:disabled) { background: #16a34a; }

    .disclaimer {
      background: var(--warning-bg); border: 1px solid var(--warning-border);
      border-radius: 6px; padding: 0.75rem 1rem; font-size: 0.8125rem;
      color: var(--warning-text); display: flex; align-items: flex-start; gap: 0.5rem;
    }
    .tip-box {
      background: var(--primary-bg); border: 1px solid #bfdbfe;
      border-radius: 6px; padding: 0.75rem 1rem; font-size: 0.8125rem;
      color: var(--navy);
    }

    .results-card {
      border: 2px solid var(--navy); border-radius: 8px;
      background: var(--card-bg); overflow: hidden; margin-top: 1.5rem;
    }
    .results-header {
      background: var(--navy); color: white; padding: 1rem 1.5rem;
      display: flex; align-items: center; justify-content: space-between;
    }
    .results-body { padding: 1.5rem; }
    .score-circle {
      width: 80px; height: 80px; border-radius: 50%;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      font-weight: 700; font-size: 1.5rem; line-height: 1;
      border: 3px solid;
    }
    .score-excellent { border-color: var(--green); color: var(--green); background: var(--accent-bg); }
    .score-good { border-color: #3b82f6; color: #3b82f6; background: var(--primary-bg); }
    .score-adequate { border-color: #f59e0b; color: #f59e0b; background: var(--warning-bg); }
    .score-poor { border-color: var(--destructive); color: var(--destructive); background: var(--destructive-bg); }
    .score-label { font-size: 0.625rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; }

    .rubric-row {
      display: flex; align-items: flex-start; gap: 1rem; padding: 0.75rem 0;
      border-bottom: 1px solid var(--border);
    }
    .rubric-row:last-child { border-bottom: none; }
    .rubric-bar-wrap { flex: 1; min-width: 0; }
    .rubric-bar-label { font-size: 0.8125rem; font-weight: 500; margin-bottom: 0.25rem; display: flex; justify-content: space-between; }
    .rubric-bar-track { height: 8px; border-radius: 4px; background: var(--muted-bg); overflow: hidden; }
    .rubric-bar-fill { height: 100%; border-radius: 4px; transition: width 0.5s ease; }
    .rubric-feedback { font-size: 0.8125rem; color: var(--text-secondary); margin-top: 0.25rem; }

    .tag { display: inline-block; padding: 0.25rem 0.625rem; margin: 0.125rem; border-radius: 4px; font-size: 0.75rem; }
    .tag-green { background: var(--accent-bg); color: #15803d; border: 1px solid var(--accent-border); }
    .tag-amber { background: var(--warning-bg); color: var(--warning-text); border: 1px solid var(--warning-border); }

    .bulk-upload-zone {
      border: 2px dashed var(--border); border-radius: 8px;
      padding: 2rem; text-align: center; cursor: pointer;
      transition: all 0.15s; background: var(--card-bg);
    }
    .bulk-upload-zone:hover { border-color: var(--navy); background: var(--primary-bg); }
    .bulk-upload-zone.drag-over { border-color: var(--green); background: var(--accent-bg); }

    .progress-bar-wrap { margin: 1rem 0; }
    .progress-label { font-size: 0.8125rem; font-weight: 500; margin-bottom: 0.25rem; color: var(--text-secondary); }
    .progress-track { height: 6px; border-radius: 3px; background: var(--muted-bg); overflow: hidden; }
    .progress-fill { height: 100%; border-radius: 3px; background: var(--navy); transition: width 0.3s; }

    .bulk-results-table {
      width: 100%; border-collapse: collapse; font-size: 0.8125rem;
    }
    .bulk-results-table th {
      text-align: left; padding: 0.625rem 0.75rem; font-weight: 600;
      border-bottom: 2px solid var(--border); background: var(--muted-bg);
      font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.03em;
      color: var(--text-secondary);
    }
    .bulk-results-table td {
      padding: 0.625rem 0.75rem; border-bottom: 1px solid var(--border);
      vertical-align: top;
    }
    .bulk-results-table tr:hover td { background: var(--muted-bg); }

    .expand-btn {
      background: none; border: none; cursor: pointer; color: var(--navy);
      font-size: 0.75rem; font-weight: 500; padding: 0.25rem 0; text-decoration: underline;
    }
    .detail-row { display: none; }
    .detail-row.visible { display: table-row; }
    .detail-cell { padding: 1rem !important; background: var(--primary-bg) !important; }

    .loading-spinner {
      display: inline-block; width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white; border-radius: 50%; animation: spin 0.6s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .hidden { display: none !important; }
    .footer-note {
      text-align: center; color: var(--text-muted); font-size: 0.75rem;
      margin-top: 2rem; padding: 1rem 0;
    }
  </style>
</head>
<body>
  <header class="header">
    <div class="header-left">
      <a href="/week-0" class="back-btn" data-testid="btn-back-orientation" title="Back to Orientation">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </a>
      <div>
        <div class="brand-name">Future Work Academy</div>
        <div class="brand-sub">Grading Module</div>
      </div>
    </div>
    <a href="/week-0" style="font-size: 0.8125rem; color: var(--text-secondary);" data-testid="link-orientation">Orientation</a>
  </header>

  <div class="container space-y">
    <div>
      <div class="badge" style="margin-bottom: 0.5rem;">Instructor Tool</div>
      <h1 data-testid="text-grading-title">Grading Module</h1>
      <p class="subtitle" style="margin-top: 0.25rem;">
        Paste student responses from Blackboard for AI-powered formative feedback. Scores use the same rubric shown on each week's simulation page.
      </p>
    </div>

    <div class="disclaimer" data-testid="text-grading-disclaimer">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0; margin-top: 1px;"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
      <span>Scores are formative feedback only. Instructors retain full authority to review, adjust, or override AI-assigned scores before finalizing grades.</span>
    </div>

    <div class="tabs" data-testid="tabs-grading-mode">
      <button class="tab-btn active" data-tab="single" data-testid="btn-tab-single">Single Response</button>
      <button class="tab-btn" data-tab="bulk" data-testid="btn-tab-bulk">Bulk Upload (CSV)</button>
    </div>

    <!-- SINGLE GRADING TAB -->
    <div class="tab-panel active" id="panel-single" data-testid="panel-single">
      <div class="card">
        <div class="card-body space-y">
          <div class="form-row">
            <div class="form-group">
              <label for="week-select">Simulation Week</label>
              <select id="week-select" data-testid="select-week">
                ${weekOptions}
              </select>
            </div>
            <div class="form-group">
              <label for="option-select">Option Chosen</label>
              <select id="option-select" data-testid="select-option">
                <option value="A">Option A</option>
                <option value="B">Option B</option>
                <option value="C">Option C</option>
                <option value="D" class="option-d-item">Option D</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label for="student-name">Student Name or ID <span class="label-hint">(optional)</span></label>
            <input type="text" id="student-name" placeholder="e.g., Valerie Shepherd or Student_abc12345" data-testid="input-student-name" />
          </div>
          <div class="form-group">
            <label for="essay-text">Student Response <span class="label-hint">(paste all sections together)</span></label>
            <textarea id="essay-text" placeholder="Paste the student's complete response here, including their strategic rationale, stakeholder analysis, and risk assessment sections..." data-testid="input-essay-text" rows="12"></textarea>
          </div>
          <div style="display: flex; align-items: center; gap: 1rem;">
            <button class="btn btn-primary" id="btn-grade-single" data-testid="btn-grade-single">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
              Grade Response
            </button>
            <span id="single-status" class="subtitle" data-testid="text-single-status"></span>
          </div>
        </div>
      </div>
      <div id="single-results" data-testid="container-single-results"></div>
    </div>

    <!-- BULK GRADING TAB -->
    <div class="tab-panel" id="panel-bulk" data-testid="panel-bulk">
      <div class="card">
        <div class="card-body space-y">
          <div class="form-group">
            <label for="bulk-week-select">Simulation Week</label>
            <select id="bulk-week-select" data-testid="select-bulk-week">
              ${weekOptions}
            </select>
          </div>

          <div class="tip-box" data-testid="text-csv-format">
            <strong>CSV Format:</strong> Your file should have columns: <code>StudentName</code>, <code>OptionChosen</code>, <code>EssayText</code><br>
            The first row should be headers. Option should be a letter (A, B, C, or D). Essay text can include all sections.
          </div>

          <div class="bulk-upload-zone" id="upload-zone" data-testid="zone-csv-upload">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 0.5rem;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <p style="font-weight: 500;">Drop a CSV file here or click to browse</p>
            <p class="subtitle" style="margin-top: 0.25rem;">Supports .csv files</p>
            <input type="file" id="csv-file-input" accept=".csv" style="display: none;" data-testid="input-csv-file" />
          </div>

          <div id="bulk-file-info" class="hidden" data-testid="text-bulk-file-info" style="font-size: 0.875rem; color: var(--text-secondary);"></div>

          <div style="display: flex; align-items: center; gap: 1rem;">
            <button class="btn btn-primary hidden" id="btn-grade-bulk" data-testid="btn-grade-bulk">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
              Grade All Responses
            </button>
            <span id="bulk-status" class="subtitle" data-testid="text-bulk-status"></span>
          </div>

          <div id="bulk-progress" class="progress-bar-wrap hidden" data-testid="container-bulk-progress">
            <div class="progress-label" id="progress-label">Grading...</div>
            <div class="progress-track"><div class="progress-fill" id="progress-fill" style="width: 0%;"></div></div>
          </div>
        </div>
      </div>

      <div id="bulk-results" class="hidden" data-testid="container-bulk-results" style="margin-top: 1.5rem;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
          <h2 data-testid="text-bulk-results-title">Grading Results</h2>
          <button class="btn btn-green" id="btn-download-csv" data-testid="btn-download-csv">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Download Results CSV
          </button>
        </div>
        <div class="card" style="overflow-x: auto;">
          <table class="bulk-results-table" id="results-table" data-testid="table-bulk-results">
            <thead>
              <tr>
                <th>Student</th>
                <th>Option</th>
                <th>Score</th>
                <th>%</th>
                <th>Quality</th>
                <th></th>
              </tr>
            </thead>
            <tbody id="results-tbody"></tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <p class="footer-note">
    Future Work Academy Grading Module &mdash; AI-powered formative feedback for instructor use only
  </p>

  <script>
    (function() {
      var bulkData = [];
      var bulkResults = [];

      // Tab switching
      document.querySelectorAll('.tab-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
          document.querySelectorAll('.tab-btn').forEach(function(b) { b.classList.remove('active'); });
          document.querySelectorAll('.tab-panel').forEach(function(p) { p.classList.remove('active'); });
          btn.classList.add('active');
          document.getElementById('panel-' + btn.getAttribute('data-tab')).classList.add('active');
        });
      });

      // Option D visibility (only week 8 has option D)
      var weekSelect = document.getElementById('week-select');
      var optionD = document.querySelector('.option-d-item');
      weekSelect.addEventListener('change', function() {
        if (parseInt(weekSelect.value) === 8) {
          optionD.style.display = '';
        } else {
          optionD.style.display = 'none';
          if (document.getElementById('option-select').value === 'D') {
            document.getElementById('option-select').value = 'A';
          }
        }
      });
      optionD.style.display = 'none';

      // Single grading
      document.getElementById('btn-grade-single').addEventListener('click', function() {
        var btn = this;
        var essayText = document.getElementById('essay-text').value.trim();
        if (!essayText) {
          document.getElementById('single-status').textContent = 'Please paste a student response first.';
          return;
        }
        if (essayText.length < 50) {
          document.getElementById('single-status').textContent = 'Response seems too short. Please paste the complete student response.';
          return;
        }

        btn.disabled = true;
        btn.innerHTML = '<span class="loading-spinner"></span> Grading...';
        document.getElementById('single-status').textContent = 'Evaluating response against rubric (this may take 10-20 seconds)...';
        document.getElementById('single-results').innerHTML = '';

        fetch('/api/grade/single', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            weekNumber: parseInt(document.getElementById('week-select').value),
            optionChosen: document.getElementById('option-select').value,
            studentName: document.getElementById('student-name').value.trim() || 'Student',
            essayText: essayText
          })
        })
        .then(function(res) { return res.json(); })
        .then(function(result) {
          if (result.error) {
            document.getElementById('single-status').textContent = 'Error: ' + result.error;
          } else {
            document.getElementById('single-status').textContent = '';
            renderSingleResult(result);
          }
        })
        .catch(function(err) {
          document.getElementById('single-status').textContent = 'Error: ' + err.message;
        })
        .finally(function() {
          btn.disabled = false;
          btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg> Grade Response';
        });
      });

      function getScoreClass(pct) {
        if (pct >= 80) return 'excellent';
        if (pct >= 65) return 'good';
        if (pct >= 50) return 'adequate';
        return 'poor';
      }

      function getBarColor(pct) {
        if (pct >= 80) return 'var(--green)';
        if (pct >= 65) return '#3b82f6';
        if (pct >= 50) return '#f59e0b';
        return 'var(--destructive)';
      }

      function esc(s) {
        var d = document.createElement('div');
        d.textContent = s;
        return d.innerHTML;
      }

      function renderSingleResult(r) {
        var cls = getScoreClass(r.percentage);
        var html = '<div class="results-card">';
        html += '<div class="results-header">';
        html += '<div><h3 style="color:white; margin:0;">' + esc(r.studentName) + '</h3>';
        html += '<div style="font-size: 0.8125rem; opacity: 0.8;">Week ' + r.weekNumber + ' \\u2022 Option ' + esc(r.optionChosen) + '</div></div>';
        html += '<div class="score-circle score-' + cls + '" style="background: rgba(255,255,255,0.95);">';
        html += r.percentage + '<span class="score-label">%</span></div>';
        html += '</div>';
        html += '<div class="results-body space-y">';

        html += '<div style="display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;">';
        html += '<span style="font-size: 1.25rem; font-weight: 700;">' + r.totalScore + ' / ' + r.maxScore + '</span>';
        html += '<span class="badge" style="text-transform: capitalize;">' + esc(r.overallQuality) + '</span>';
        html += '</div>';

        html += '<div class="separator" style="margin: 0.75rem 0;"></div>';
        html += '<h3>Rubric Breakdown</h3>';
        for (var i = 0; i < r.rubricScores.length; i++) {
          var s = r.rubricScores[i];
          var pct = Math.round((s.score / s.maxPoints) * 100);
          html += '<div class="rubric-row"><div class="rubric-bar-wrap">';
          html += '<div class="rubric-bar-label"><span>' + esc(s.criterionName) + '</span><span>' + s.score + '/' + s.maxPoints + '</span></div>';
          html += '<div class="rubric-bar-track"><div class="rubric-bar-fill" style="width:' + pct + '%;background:' + getBarColor(pct) + ';"></div></div>';
          html += '<div class="rubric-feedback">' + esc(s.feedback) + '</div>';
          html += '</div></div>';
        }

        html += '<div class="separator" style="margin: 0.75rem 0;"></div>';
        html += '<h3>Overall Feedback</h3>';
        html += '<p style="font-size: 0.875rem; color: var(--text-secondary);">' + esc(r.overallFeedback) + '</p>';

        if (r.strengths && r.strengths.length > 0) {
          html += '<div style="margin-top: 0.75rem;"><strong style="font-size: 0.8125rem;">Strengths:</strong><div style="margin-top: 0.25rem;">';
          for (var j = 0; j < r.strengths.length; j++) {
            html += '<span class="tag tag-green">' + esc(r.strengths[j]) + '</span>';
          }
          html += '</div></div>';
        }

        if (r.areasForImprovement && r.areasForImprovement.length > 0) {
          html += '<div style="margin-top: 0.5rem;"><strong style="font-size: 0.8125rem;">Areas for Improvement:</strong><div style="margin-top: 0.25rem;">';
          for (var k = 0; k < r.areasForImprovement.length; k++) {
            html += '<span class="tag tag-amber">' + esc(r.areasForImprovement[k]) + '</span>';
          }
          html += '</div></div>';
        }

        html += '</div></div>';
        document.getElementById('single-results').innerHTML = html;
      }

      // CSV Upload
      var uploadZone = document.getElementById('upload-zone');
      var fileInput = document.getElementById('csv-file-input');

      uploadZone.addEventListener('click', function() { fileInput.click(); });
      uploadZone.addEventListener('dragover', function(e) { e.preventDefault(); uploadZone.classList.add('drag-over'); });
      uploadZone.addEventListener('dragleave', function() { uploadZone.classList.remove('drag-over'); });
      uploadZone.addEventListener('drop', function(e) {
        e.preventDefault(); uploadZone.classList.remove('drag-over');
        if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
      });
      fileInput.addEventListener('change', function() { if (fileInput.files.length) handleFile(fileInput.files[0]); });

      function parseCSV(text) {
        var allRows = parseCSVFull(text);
        if (allRows.length < 2) return [];
        var headers = allRows[0].map(function(h) { return h.trim().toLowerCase(); });
        var nameIdx = headers.indexOf('studentname');
        var optIdx = headers.indexOf('optionchosen');
        var essayIdx = headers.indexOf('essaytext');
        if (nameIdx === -1) nameIdx = 0;
        if (optIdx === -1) optIdx = 1;
        if (essayIdx === -1) essayIdx = 2;

        var rows = [];
        for (var i = 1; i < allRows.length; i++) {
          var cols = allRows[i];
          if (cols.length > essayIdx && cols[essayIdx].trim()) {
            rows.push({
              studentName: (cols[nameIdx] || 'Student ' + i).trim(),
              optionChosen: (cols[optIdx] || 'A').trim().toUpperCase().charAt(0),
              essayText: cols[essayIdx].trim()
            });
          }
        }
        return rows;
      }

      function parseCSVFull(text) {
        var rows = [];
        var row = [];
        var field = '';
        var inQuotes = false;
        var i = 0;
        while (i < text.length) {
          var c = text[i];
          if (inQuotes) {
            if (c === '"') {
              if (i + 1 < text.length && text[i + 1] === '"') {
                field += '"'; i += 2;
              } else {
                inQuotes = false; i++;
              }
            } else {
              field += c; i++;
            }
          } else {
            if (c === '"') {
              inQuotes = true; i++;
            } else if (c === ',') {
              row.push(field); field = ''; i++;
            } else if (c === '\\r') {
              if (i + 1 < text.length && text[i + 1] === '\\n') i++;
              row.push(field); field = '';
              if (row.some(function(f) { return f.trim(); })) rows.push(row);
              row = []; i++;
            } else if (c === '\\n') {
              row.push(field); field = '';
              if (row.some(function(f) { return f.trim(); })) rows.push(row);
              row = []; i++;
            } else {
              field += c; i++;
            }
          }
        }
        row.push(field);
        if (row.some(function(f) { return f.trim(); })) rows.push(row);
        return rows;
      }

      function handleFile(file) {
        if (!file.name.endsWith('.csv')) {
          document.getElementById('bulk-status').textContent = 'Please upload a .csv file.';
          return;
        }
        var reader = new FileReader();
        reader.onload = function(e) {
          bulkData = parseCSV(e.target.result);
          if (bulkData.length === 0) {
            document.getElementById('bulk-status').textContent = 'No valid rows found. Check your CSV format.';
            return;
          }
          document.getElementById('bulk-file-info').textContent = 'Loaded ' + file.name + ' with ' + bulkData.length + ' student response(s)';
          document.getElementById('bulk-file-info').classList.remove('hidden');
          document.getElementById('btn-grade-bulk').classList.remove('hidden');
          document.getElementById('bulk-status').textContent = '';
        };
        reader.readAsText(file);
      }

      // Bulk grading
      document.getElementById('btn-grade-bulk').addEventListener('click', async function() {
        var btn = this;
        if (bulkData.length === 0) return;
        var weekNum = parseInt(document.getElementById('bulk-week-select').value);
        btn.disabled = true;
        btn.innerHTML = '<span class="loading-spinner"></span> Grading...';
        document.getElementById('bulk-progress').classList.remove('hidden');
        document.getElementById('bulk-results').classList.add('hidden');
        bulkResults = [];

        for (var i = 0; i < bulkData.length; i++) {
          document.getElementById('progress-label').textContent = 'Grading ' + (i + 1) + ' of ' + bulkData.length + '... (' + esc(bulkData[i].studentName) + ')';
          document.getElementById('progress-fill').style.width = Math.round(((i) / bulkData.length) * 100) + '%';

          try {
            var res = await fetch('/api/grade/single', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                weekNumber: weekNum,
                optionChosen: bulkData[i].optionChosen,
                studentName: bulkData[i].studentName,
                essayText: bulkData[i].essayText
              })
            });
            var result = await res.json();
            if (!result.error) bulkResults.push(result);
            else bulkResults.push({ studentName: bulkData[i].studentName, optionChosen: bulkData[i].optionChosen, error: result.error });
          } catch (err) {
            bulkResults.push({ studentName: bulkData[i].studentName, optionChosen: bulkData[i].optionChosen, error: err.message });
          }
        }

        document.getElementById('progress-fill').style.width = '100%';
        document.getElementById('progress-label').textContent = 'Complete! Graded ' + bulkResults.length + ' response(s).';
        renderBulkResults();
        btn.disabled = false;
        btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg> Grade All Responses';
      });

      function renderBulkResults() {
        var tbody = document.getElementById('results-tbody');
        tbody.innerHTML = '';
        for (var i = 0; i < bulkResults.length; i++) {
          var r = bulkResults[i];
          if (r.error) {
            tbody.innerHTML += '<tr><td>' + esc(r.studentName) + '</td><td>' + esc(r.optionChosen) + '</td><td colspan="4" style="color:var(--destructive);">Error: ' + esc(r.error) + '</td></tr>';
            continue;
          }
          var cls = getScoreClass(r.percentage);
          var qualityColor = cls === 'excellent' ? 'var(--green)' : cls === 'good' ? '#3b82f6' : cls === 'adequate' ? '#f59e0b' : 'var(--destructive)';
          tbody.innerHTML += '<tr data-idx="' + i + '">'
            + '<td><strong>' + esc(r.studentName) + '</strong></td>'
            + '<td>' + esc(r.optionChosen) + '</td>'
            + '<td>' + r.totalScore + '/' + r.maxScore + '</td>'
            + '<td><strong>' + r.percentage + '%</strong></td>'
            + '<td style="color:' + qualityColor + '; font-weight: 600; text-transform: capitalize;">' + esc(r.overallQuality) + '</td>'
            + '<td><button class="expand-btn" onclick="toggleDetail(' + i + ')">Details</button></td>'
            + '</tr>'
            + '<tr class="detail-row" id="detail-' + i + '"><td colspan="6" class="detail-cell">'
            + buildDetailHtml(r)
            + '</td></tr>';
        }
        document.getElementById('bulk-results').classList.remove('hidden');
      }

      function buildDetailHtml(r) {
        var h = '<div style="max-width: 600px;">';
        h += '<p style="font-size: 0.8125rem; color: var(--text-secondary); margin-bottom: 0.75rem;">' + esc(r.overallFeedback) + '</p>';
        for (var i = 0; i < r.rubricScores.length; i++) {
          var s = r.rubricScores[i];
          h += '<div style="font-size: 0.8125rem; margin-bottom: 0.5rem;"><strong>' + esc(s.criterionName) + ':</strong> ' + s.score + '/' + s.maxPoints + ' &mdash; ' + esc(s.feedback) + '</div>';
        }
        if (r.strengths && r.strengths.length) {
          h += '<div style="margin-top: 0.5rem;">';
          for (var j = 0; j < r.strengths.length; j++) h += '<span class="tag tag-green">' + esc(r.strengths[j]) + '</span>';
          h += '</div>';
        }
        if (r.areasForImprovement && r.areasForImprovement.length) {
          h += '<div style="margin-top: 0.25rem;">';
          for (var k = 0; k < r.areasForImprovement.length; k++) h += '<span class="tag tag-amber">' + esc(r.areasForImprovement[k]) + '</span>';
          h += '</div>';
        }
        h += '</div>';
        return h;
      }

      window.toggleDetail = function(idx) {
        var row = document.getElementById('detail-' + idx);
        if (row) row.classList.toggle('visible');
      };

      // CSV Download
      document.getElementById('btn-download-csv').addEventListener('click', function() {
        if (bulkResults.length === 0) return;
        var csvContent = 'StudentName,OptionChosen,TotalScore,MaxScore,Percentage,OverallQuality,StrategicThinking,StakeholderAwareness,RiskAssessment,ResearchApplication,OverallFeedback,Strengths,AreasForImprovement\\n';
        for (var i = 0; i < bulkResults.length; i++) {
          var r = bulkResults[i];
          if (r.error) {
            csvContent += csvEscape(r.studentName) + ',' + csvEscape(r.optionChosen) + ',ERROR,,,,,,,,,' + csvEscape(r.error) + '\\n';
            continue;
          }
          var scores = r.rubricScores || [];
          csvContent += csvEscape(r.studentName) + ','
            + csvEscape(r.optionChosen) + ','
            + r.totalScore + ','
            + r.maxScore + ','
            + r.percentage + ','
            + csvEscape(r.overallQuality) + ','
            + (scores[0] ? scores[0].score + '/' + scores[0].maxPoints : '') + ','
            + (scores[1] ? scores[1].score + '/' + scores[1].maxPoints : '') + ','
            + (scores[2] ? scores[2].score + '/' + scores[2].maxPoints : '') + ','
            + (scores[3] ? scores[3].score + '/' + scores[3].maxPoints : '') + ','
            + csvEscape(r.overallFeedback || '') + ','
            + csvEscape((r.strengths || []).join('; ')) + ','
            + csvEscape((r.areasForImprovement || []).join('; '))
            + '\\n';
        }
        var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'grading-results-week-' + document.getElementById('bulk-week-select').value + '.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });

      function csvEscape(val) {
        var s = String(val || '');
        if (s.indexOf(',') !== -1 || s.indexOf('"') !== -1 || s.indexOf('\\n') !== -1) {
          return '"' + s.replace(/"/g, '""') + '"';
        }
        return s;
      }
    })();
  </script>
</body>
</html>`;
}
