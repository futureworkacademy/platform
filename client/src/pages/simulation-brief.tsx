import { useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { AppFooter } from "@/components/app-footer";
import {
  ArrowLeft,
  FileDown,
  Building2,
  Target,
  GraduationCap,
  Users,
  CalendarDays,
  BookOpen,
  BarChart3,
  ClipboardList,
  Sparkles,
  Lightbulb,
} from "lucide-react";
import { Link } from "wouter";
import { BrandLogo } from "@/components/brand-logo";
import jsPDF from "jspdf";
import {
  loadLogoForPdf,
  addPdfHeader,
  addSectionHeader,
  addBodyText,
  addBulletPoint,
  addSubHeader,
  checkPageBreak,
  PDF_COLORS,
} from "@/lib/pdf-utils";

const SECTIONS = [
  {
    num: "01",
    title: "Setting & Company Profile",
    icon: Building2,
    guidance: "Define the fictional (or fictionalized) organization students will manage. The richer the context, the more immersive the simulation.",
    fields: [
      { label: "Company Name", example: "Apex Manufacturing" },
      { label: "Industry", example: "Mid-size industrial manufacturing" },
      { label: "Headcount", example: "~2,500 employees across 3 facilities" },
      { label: "Geography", example: "Headquarters in Cedar Rapids, Iowa; plants in Midwest U.S." },
      { label: "Founded", example: "1987 — family-founded, now PE-backed" },
      { label: "Revenue / Budget", example: "$340M annual revenue, 6% operating margin" },
      { label: "Key Metrics at Start", example: "Employee satisfaction: 72/100, Automation level: 18%, Turnover: 14%" },
      { label: "Current State", example: "Stable but stagnant — board is pushing for digital transformation; workforce is skeptical" },
    ],
  },
  {
    num: "02",
    title: "Central Strategic Tension",
    icon: Target,
    guidance: "The core dilemma students must navigate throughout the simulation. This should be a genuine trade-off with no single 'right answer' — the kind of problem real leaders face.",
    fields: [
      {
        label: "Primary Tension",
        example: "Apex's board has mandated AI-driven automation to stay competitive, but the workforce — many of whom have 15+ years of tenure — sees this as an existential threat to their livelihoods. Students must balance aggressive modernization targets with workforce morale, union relations, and ethical obligations to long-tenured employees.",
        multiline: true,
      },
      {
        label: "Why It Matters",
        example: "This tension forces students to weigh short-term financial gains against long-term cultural health, preparing them for the human side of digital transformation.",
        multiline: true,
      },
    ],
  },
  {
    num: "03",
    title: "Learning Objectives",
    icon: GraduationCap,
    guidance: "3-5 outcomes students should achieve. These inform grading rubrics and the AI evaluator's assessment criteria.",
    bullets: [
      "Evaluate the trade-offs between operational efficiency and employee well-being during technology adoption",
      "Develop change management strategies that address stakeholder anxiety and resistance",
      "Analyze financial and cultural KPIs to make data-informed leadership decisions",
      "Practice ethical reasoning when workforce displacement is a potential consequence of strategic choices",
      "Communicate strategic decisions to diverse stakeholders with competing interests",
    ],
  },
  {
    num: "04",
    title: "Cast of Characters",
    icon: Users,
    guidance: "Define 8-20 stakeholders students will interact with. Each character should have a distinct perspective on the central tension. The platform will auto-generate AI headshots, voice profiles, and relationship maps from these descriptions.",
    characters: [
      {
        name: "Marcus Chen",
        role: "VP of Operations",
        personality: "Analytical, cautious, data-driven. Respected by floor workers because he started as a machinist.",
        stance: "Cautiously supportive of AI — wants proof of ROI before disrupting proven processes",
        influence: "High",
        resistance: "Medium",
      },
      {
        name: "Elena Vasquez",
        role: "Union Representative",
        personality: "Passionate, confrontational, deeply loyal to workers. Views management with suspicion earned over decades.",
        stance: "Strongly opposes any automation that eliminates jobs without retraining guarantees",
        influence: "High",
        resistance: "Very High",
      },
      {
        name: "Dr. James Whitmore",
        role: "Chief Technology Officer",
        personality: "Visionary, impatient, sometimes dismissive of 'soft' concerns. Recently hired from a tech company.",
        stance: "Aggressive AI adoption — sees hesitation as competitive suicide",
        influence: "High",
        resistance: "Very Low",
      },
    ],
    note: "Recommended: 8-20 characters covering leadership, middle management, frontline workers, external stakeholders (board, customers, regulators), and at least one 'wildcard' whose loyalty shifts based on student decisions.",
  },
  {
    num: "05",
    title: "Weekly Arc",
    icon: CalendarDays,
    guidance: "Define 4-12 weeks of escalating scenarios. Each week should raise the stakes and force increasingly difficult trade-offs. The platform handles briefing multimedia, advisor dialogue, and grading automatically.",
    weeks: [
      {
        week: 1,
        title: "The Mandate",
        event: "Board announces $50M AI transformation initiative. News leaks to factory floor before official announcement.",
        decisions: [
          {
            question: "How do you address the workforce?",
            options: ["Town hall with full transparency", "Department-by-department briefings", "Written memo from CEO", "Delay announcement until plan is finalized"],
          },
          {
            question: "What's your initial automation target?",
            options: ["Start with back-office processes (low visibility)", "Target highest-ROI production lines first", "Pilot in one facility before expanding", "Commission a 90-day assessment before any changes"],
          },
        ],
        stakes: "Sets the tone for employee trust — a misstep here compounds anxiety for the entire simulation",
      },
      {
        week: 4,
        title: "The Walkout",
        event: "After 3 weeks of rising tension, 40% of second-shift workers stage an unannounced work stoppage. A viral social media post from an employee goes regional.",
        decisions: [
          {
            question: "How do you respond to the work stoppage?",
            options: ["Emergency negotiation with union leadership", "Bring in temporary contractors to maintain output", "Suspend involved workers pending review", "CEO addresses workers directly on the floor"],
          },
          {
            question: "How do you handle the social media situation?",
            options: ["Issue a corporate statement", "Have the CEO post a personal video response", "Engage employees in drafting the response", "Ignore it and focus on internal resolution"],
          },
        ],
        stakes: "Tests crisis management under pressure — decisions here affect both Q2 production targets and long-term union relations",
      },
    ],
    note: "Provide at least the first week and midpoint in detail. The platform can help expand partial outlines into full weekly scenarios with AI assistance.",
  },
  {
    num: "06",
    title: "Background Research Materials",
    icon: BookOpen,
    guidance: "3-6 real or simulated data sources students should reference when making decisions. These become 'intel articles' in the simulation, with engagement tracking and bonus scoring.",
    materials: [
      { title: "McKinsey Global Institute — Jobs Lost, Jobs Gained (2017)", description: "Workforce displacement projections and reskilling economics" },
      { title: "MIT Sloan — The Work of the Future (2020)", description: "How AI transforms task composition rather than eliminating whole jobs" },
      { title: "Harvard Business Review — Leading Through Anxiety (2022)", description: "Change management frameworks for technology transitions" },
      { title: "Bureau of Labor Statistics — Manufacturing Employment Trends", description: "Real-world data on automation's impact on manufacturing employment" },
    ],
    note: "You can provide full articles, links to public sources, or brief summaries. The AI will expand summaries into full simulation-ready intel briefs.",
  },
  {
    num: "07",
    title: "Company Metrics / KPIs",
    icon: BarChart3,
    guidance: "Define 4-8 dashboard metrics that reflect the simulation's dual priorities. Each student decision shifts these metrics — the platform calculates changes based on the scenario logic you define.",
    metrics: [
      { name: "Revenue Growth", category: "Financial", start: "$340M", description: "Annual revenue trajectory" },
      { name: "Operating Margin", category: "Financial", start: "6.0%", description: "Profitability after operating expenses" },
      { name: "Employee Satisfaction", category: "Cultural", start: "72/100", description: "Composite score from engagement surveys" },
      { name: "Automation Level", category: "Operational", start: "18%", description: "Percentage of processes using AI/automation" },
      { name: "Voluntary Turnover", category: "Cultural", start: "14%", description: "Annual voluntary departure rate" },
      { name: "Training Completion", category: "Operational", start: "23%", description: "Workforce completing reskilling programs" },
    ],
    note: "Metrics should reflect your simulation's unique context. A healthcare simulation might track patient satisfaction and readmission rates; a retail simulation might track NPS and same-store sales.",
  },
  {
    num: "08",
    title: "Difficulty & Grading Notes",
    icon: ClipboardList,
    guidance: "Optional preferences for how student responses should be evaluated. The platform uses a 4-criterion rubric (Strategic Reasoning, Stakeholder Awareness, Implementation Feasibility, Communication Quality) scored 1-5 per criterion.",
    fields: [
      { label: "Difficulty Tier", example: "Standard (appropriate for MBA-level courses)" },
      { label: "Rubric Weight Preference", example: "Equal weight across all 4 criteria, or heavier weight on Stakeholder Awareness for this simulation" },
      { label: "Quantitative vs. Qualitative", example: "60/40 — financial outcomes matter but cultural health is the differentiator" },
      { label: "Grading Tone", example: "Constructive and developmental — this is a learning exercise, not a gotcha" },
    ],
    note: "You can also provide sample 'excellent' and 'poor' response excerpts for calibration. The AI grader uses these as anchors.",
  },
];

async function generatePdf() {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const margin = 15;
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - margin * 2;
  const logoDataUrl = await loadLogoForPdf();

  let y = addPdfHeader(doc, logoDataUrl, "Simulation Brief Template", "Co-Creation Intake Document", margin);

  doc.setTextColor(...PDF_COLORS.DARK_GRAY);
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  y += 2;
  y = addBodyText(doc, "This document captures everything needed to build a new simulation on the Future Work Academy platform. Complete each section with as much detail as possible — the AI engine will handle headshot generation, voice profiles, grading rubrics, intel article expansion, and dashboard configuration automatically.", y, margin, contentWidth);
  y += 4;

  for (const section of SECTIONS) {
    y = checkPageBreak(doc, y, 30);
    y = addSectionHeader(doc, `${section.num}. ${section.title}`, y, margin);

    doc.setTextColor(...PDF_COLORS.MED_GRAY);
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "italic");
    const guideLines = doc.splitTextToSize(section.guidance, contentWidth);
    for (const line of guideLines) {
      y = checkPageBreak(doc, y, 4.5);
      doc.text(line, margin, y);
      y += 4;
    }
    y += 3;

    if (section.fields) {
      for (const field of section.fields) {
        y = checkPageBreak(doc, y, 12);
        doc.setTextColor(...PDF_COLORS.NAVY);
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text(`${field.label}:`, margin, y);
        y += 4.5;
        doc.setTextColor(...PDF_COLORS.DARK_GRAY);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        const exLines = doc.splitTextToSize(`Example: ${field.example}`, contentWidth - 4);
        for (const line of exLines) {
          y = checkPageBreak(doc, y, 4.5);
          doc.text(line, margin + 2, y);
          y += 4;
        }
        y += 2;
      }
    }

    if (section.bullets) {
      for (const bullet of section.bullets) {
        y = addBulletPoint(doc, bullet, y, margin, contentWidth);
      }
      y += 3;
    }

    if (section.characters) {
      for (const char of section.characters) {
        y = checkPageBreak(doc, y, 28);
        y = addSubHeader(doc, `${char.name} — ${char.role}`, y, margin);
        y = addBodyText(doc, `Personality: ${char.personality}`, y, margin + 2, contentWidth - 4);
        y = addBodyText(doc, `Stance: ${char.stance}`, y, margin + 2, contentWidth - 4);
        y = addBodyText(doc, `Influence: ${char.influence} | Resistance: ${char.resistance}`, y, margin + 2, contentWidth - 4);
        y += 2;
      }
    }

    if (section.weeks) {
      for (const week of section.weeks) {
        y = checkPageBreak(doc, y, 35);
        y = addSubHeader(doc, `Week ${week.week}: ${week.title}`, y, margin);
        y = addBodyText(doc, `Event: ${week.event}`, y, margin + 2, contentWidth - 4);
        for (const dec of week.decisions) {
          y = checkPageBreak(doc, y, 15);
          doc.setTextColor(...PDF_COLORS.NAVY);
          doc.setFontSize(9);
          doc.setFont("helvetica", "bold");
          doc.text(dec.question, margin + 2, y);
          y += 5;
          for (const opt of dec.options) {
            y = addBulletPoint(doc, opt, y, margin + 4, contentWidth - 8);
          }
        }
        y = addBodyText(doc, `Stakes: ${week.stakes}`, y, margin + 2, contentWidth - 4);
        y += 3;
      }
    }

    if (section.materials) {
      for (const mat of section.materials) {
        y = checkPageBreak(doc, y, 10);
        y = addBulletPoint(doc, `${mat.title} — ${mat.description}`, y, margin, contentWidth);
      }
      y += 2;
    }

    if (section.metrics) {
      for (const met of section.metrics) {
        y = checkPageBreak(doc, y, 10);
        y = addBulletPoint(doc, `${met.name} (${met.category}) — Starting: ${met.start}. ${met.description}`, y, margin, contentWidth);
      }
      y += 2;
    }

    if (section.note) {
      y = checkPageBreak(doc, y, 10);
      doc.setTextColor(...PDF_COLORS.MED_GRAY);
      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      const noteLines = doc.splitTextToSize(`Note: ${section.note}`, contentWidth - 4);
      for (const line of noteLines) {
        y = checkPageBreak(doc, y, 4);
        doc.text(line, margin + 2, y);
        y += 3.5;
      }
      y += 4;
    }

    y += 4;
  }

  doc.save("FWA-Simulation-Brief-Template.pdf");
}

export default function SimulationBrief() {
  const pageRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={pageRef} className="min-h-screen bg-background text-foreground" data-testid="page-simulation-brief">
      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          .print-break { break-before: page; }
          section { break-inside: avoid; }
          .container { max-width: 100% !important; }
        }
      `}</style>

      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 no-print">
        <div className="container mx-auto flex items-center justify-between h-14 px-4 max-w-5xl">
          <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-back-home">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => generatePdf()}
              data-testid="button-download-pdf"
            >
              <FileDown className="h-4 w-4 mr-1.5" />
              Download PDF
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="py-12 sm:py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <BrandLogo height="h-16" variant="vertical" className="mx-auto mb-6" />
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3" data-testid="heading-title">
              Simulation Brief Template
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Co-Creation Intake Document
            </p>
          </div>

          <Card className="bg-primary/5 border-primary/20 mb-10">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-sm mb-1" data-testid="heading-how-it-works">How This Works</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Complete each section below with as much detail as you can. The Future Work Academy platform handles
                    the rest automatically: AI-generated character headshots, voice profiles for advisor calls, grading
                    rubric calibration, intel article expansion from your source materials, dashboard metric configuration,
                    and weekly briefing multimedia. You provide the narrative and expertise — we build the simulation.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <section key={section.num} className="mb-10 print-break" data-testid={`section-${section.num}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 shrink-0">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <span className="text-xs font-mono text-muted-foreground">Section {section.num}</span>
                    <h2 className="text-xl font-bold tracking-tight" data-testid={`heading-section-${section.num}`}>{section.title}</h2>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-5 leading-relaxed italic">{section.guidance}</p>

                {section.fields && (
                  <div className="space-y-4">
                    {section.fields.map((field) => (
                      <Card key={field.label} className="bg-card border">
                        <CardContent className="p-4">
                          <label className="text-sm font-semibold text-foreground">{field.label}</label>
                          {"multiline" in field && field.multiline ? (
                            <div className="mt-2 p-3 bg-muted/30 rounded-md border border-dashed border-border min-h-[60px]">
                              <p className="text-sm text-muted-foreground italic">{field.example}</p>
                            </div>
                          ) : (
                            <div className="mt-1.5 p-2.5 bg-muted/30 rounded-md border border-dashed border-border">
                              <p className="text-sm text-muted-foreground italic">{field.example}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {section.bullets && (
                  <Card className="bg-card border">
                    <CardContent className="p-4">
                      <ul className="space-y-2.5">
                        {section.bullets.map((b, i) => (
                          <li key={i} className="flex items-start gap-2.5">
                            <span className="text-primary font-bold text-sm mt-px">{i + 1}.</span>
                            <span className="text-sm text-muted-foreground">{b}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {section.characters && (
                  <div className="space-y-3">
                    <div className="grid gap-3">
                      {section.characters.map((char) => (
                        <Card key={char.name} className="bg-card border">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-semibold text-sm">{char.name}</h4>
                                <p className="text-xs text-muted-foreground">{char.role}</p>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                                  Influence: {char.influence}
                                </span>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 font-medium">
                                  Resistance: {char.resistance}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-1"><strong className="text-foreground">Personality:</strong> {char.personality}</p>
                            <p className="text-sm text-muted-foreground"><strong className="text-foreground">Stance:</strong> {char.stance}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    {section.note && (
                      <div className="flex items-start gap-2 px-1">
                        <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-muted-foreground italic">{section.note}</p>
                      </div>
                    )}
                  </div>
                )}

                {section.weeks && (
                  <div className="space-y-4">
                    {section.weeks.map((week) => (
                      <Card key={week.week} className="bg-card border">
                        <CardContent className="p-4">
                          <h4 className="font-semibold text-sm mb-1">Week {week.week}: {week.title}</h4>
                          <p className="text-sm text-muted-foreground mb-3">{week.event}</p>
                          {week.decisions.map((dec, di) => (
                            <div key={di} className="mb-3 last:mb-0">
                              <p className="text-sm font-medium text-foreground mb-1.5">{dec.question}</p>
                              <div className="grid sm:grid-cols-2 gap-1.5 ml-2">
                                {dec.options.map((opt, oi) => (
                                  <div key={oi} className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <span className="text-primary font-mono text-xs mt-0.5">{String.fromCharCode(65 + oi)}.</span>
                                    {opt}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                          <div className="mt-3 pt-3 border-t border-border/50">
                            <p className="text-xs text-muted-foreground">
                              <strong className="text-foreground">Stakes:</strong> {week.stakes}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {section.note && (
                      <div className="flex items-start gap-2 px-1">
                        <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-muted-foreground italic">{section.note}</p>
                      </div>
                    )}
                  </div>
                )}

                {section.materials && (
                  <div className="space-y-2">
                    {section.materials.map((mat, i) => (
                      <Card key={i} className="bg-card border">
                        <CardContent className="p-3 flex items-start gap-3">
                          <span className="text-primary font-mono text-xs mt-0.5">{i + 1}.</span>
                          <div>
                            <p className="text-sm font-medium">{mat.title}</p>
                            <p className="text-xs text-muted-foreground">{mat.description}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {section.note && (
                      <div className="flex items-start gap-2 px-1 mt-2">
                        <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-muted-foreground italic">{section.note}</p>
                      </div>
                    )}
                  </div>
                )}

                {section.metrics && (
                  <div className="space-y-2">
                    <div className="grid sm:grid-cols-2 gap-2">
                      {section.metrics.map((met, i) => (
                        <Card key={i} className="bg-card border">
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-semibold">{met.name}</span>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">{met.category}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">{met.description}</p>
                            <p className="text-xs font-mono text-primary mt-1">Starting: {met.start}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    {section.note && (
                      <div className="flex items-start gap-2 px-1 mt-2">
                        <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-muted-foreground italic">{section.note}</p>
                      </div>
                    )}
                  </div>
                )}

                {section.fields && section.note && (
                  <div className="flex items-start gap-2 px-1 mt-3">
                    <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground italic">{section.note}</p>
                  </div>
                )}
              </section>
            );
          })}

          <Card className="bg-muted/30 border mt-12 mb-8">
            <CardContent className="p-5 text-center">
              <h3 className="font-semibold text-base mb-2" data-testid="heading-next-steps">What Happens Next</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-4">
                Once you submit this brief, our team reviews it and builds a fully functional simulation prototype within
                2-3 weeks. You'll receive a demo instance to review, and we iterate together until it matches your
                pedagogical goals. The platform handles all technical complexity — you focus on the learning experience.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => generatePdf()}
                  data-testid="button-download-pdf-bottom"
                >
                  <FileDown className="h-4 w-4 mr-1.5" />
                  Download PDF Template
                </Button>
                <Button
                  size="sm"
                  asChild
                  data-testid="button-contact"
                >
                  <a href="mailto:doug@futureworkacademy.com?subject=Simulation%20Brief%20-%20New%20Simulation%20Inquiry">
                    Send Completed Brief
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="no-print">
        <AppFooter />
      </div>
    </div>
  );
}
