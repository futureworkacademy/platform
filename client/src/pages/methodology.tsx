import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { AppFooter } from "@/components/app-footer";
import { Link } from "wouter";
import {
  ArrowRight,
  CheckCircle,
  Eye,
  Shield,
  BarChart3,
  Brain,
  Scale,
  FileText,
  Sparkles,
  Target,
  BookOpen,
} from "lucide-react";
import logoForLight from "@assets/logo-horizontal.png";
import logoForDark from "@assets/logo-white.png";

function useInView() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return { ref, isVisible };
}

function FadeInSection({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, isVisible } = useInView();
  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

const RUBRIC_CRITERIA = [
  {
    name: "Evidence Quality",
    points: 25,
    desc: "Cite specific data, statistics, or case studies from Intel articles using source codes (AIM, APX, WFT)",
    guidelines: "Does the response reference concrete data points, industry benchmarks, or research findings? Are sources identified by code? Vague references to 'studies' without specifics score lower.",
  },
  {
    name: "Reasoning Coherence",
    points: 25,
    desc: "Present a logical argument connecting chosen strategy settings to evidence and outcomes",
    guidelines: "Is there a clear thesis or decision rationale? Do the paragraphs build on each other logically? Are cause-and-effect relationships articulated, not just asserted?",
  },
  {
    name: "Trade-off Analysis",
    points: 25,
    desc: "Acknowledge sacrifices, identify biggest risks, and explain contingency plans",
    guidelines: "Does the response name what is being given up? Are risks specific (not generic)? Is there a 'Plan B' or mitigation strategy? One-sided arguments score lower.",
  },
  {
    name: "Stakeholder Consideration",
    points: 25,
    desc: "Address how decisions affect 2-3+ stakeholder groups and balance competing interests",
    guidelines: "Are at least two distinct stakeholder perspectives named? Does the response acknowledge tension between groups? Are trade-offs between stakeholders addressed rather than ignored?",
  },
];

const CRITERION_BANDS = [
  { range: "24–25", label: "Thorough", desc: "Specific, well-supported, addresses the criterion comprehensively with depth and nuance" },
  { range: "21–23", label: "Solid", desc: "Strong work with minor gaps — may lack one citation or one stakeholder perspective" },
  { range: "15–20", label: "General", desc: "Demonstrates understanding of general concepts but limited depth, specificity, or evidence" },
  { range: "10–14", label: "Basic", desc: "Shows basic awareness of the topic but lacks citations, reasoning, or stakeholder analysis" },
  { range: "< 10", label: "Insufficient", desc: "No evidence of research use, off-topic, or too brief to evaluate meaningfully" },
];

const QUALITY_THRESHOLDS = [
  { range: "93–100%", label: "Excellent", color: "bg-emerald-500", textColor: "text-emerald-600 dark:text-emerald-400", desc: "Exceptional depth with specific data citations, multi-stakeholder analysis, and risk mitigation" },
  { range: "72–92%", label: "Good", color: "bg-blue-500", textColor: "text-blue-600 dark:text-blue-400", desc: "Solid analysis with clear reasoning, relevant evidence, and recognition of competing interests" },
  { range: "52–71%", label: "Adequate", color: "bg-amber-500", textColor: "text-amber-600 dark:text-amber-400", desc: "General understanding demonstrated but missing depth, specificity, or balanced perspective" },
  { range: "< 52%", label: "Poor", color: "bg-red-500", textColor: "text-red-600 dark:text-red-400", desc: "Insufficient evidence, unclear reasoning, or does not address the prompt requirements" },
];

const PROCESS_STEPS = [
  { num: 1, title: "Student Submits Essay", desc: "The response is submitted through the weekly decision page, where the rubric and recommended sources are always visible.", icon: FileText },
  { num: 2, title: "AI Evaluates Against Rubric", desc: "The AI independently scores each of the four criteria using the same rubric published to students — no hidden criteria, no secret formulas.", icon: Brain },
  { num: 3, title: "Per-Criterion Feedback", desc: "Each criterion receives a numeric score (out of 25) and written feedback identifying specific strengths and areas for improvement.", icon: BarChart3 },
  { num: 4, title: "Overall Quality Assessment", desc: "Scores are totaled and mapped to a quality label (Excellent, Good, Adequate, Poor) using the published thresholds.", icon: Target },
  { num: 5, title: "Instructor Reviews", desc: "The instructor sees every AI score alongside the original essay. They can adjust scores, add comments, and override any grade before finalizing.", icon: Shield },
];

export default function Methodology() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Link href="/">
            <img src={logoForLight} alt="Future Work Academy" className="h-16 w-auto cursor-pointer block dark:hidden" data-testid="img-header-logo-light" />
            <img src={logoForDark} alt="Future Work Academy" className="h-16 w-auto cursor-pointer hidden dark:block" data-testid="img-header-logo-dark" />
          </Link>
          <div className="flex items-center gap-5">
            <Link href="/">
              <span className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:inline cursor-pointer" data-testid="link-home">Home</span>
            </Link>
            <Link href="/for-educators">
              <span className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:inline cursor-pointer" data-testid="link-for-educators">For Educators</span>
            </Link>
            <ThemeToggle />
            <a href="/api/login">
              <Button data-testid="button-login">
                Sign In
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </header>

      <main>

        <section className="relative min-h-[80vh] flex items-center justify-center px-4 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
          </div>
          <div className="relative z-10 container mx-auto max-w-4xl text-center space-y-8">
            <FadeInSection>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium" data-testid="badge-methodology">
                <Eye className="h-3.5 w-3.5" />
                Radical Transparency
              </div>
            </FadeInSection>
            <FadeInSection delay={150}>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]" data-testid="text-hero-headline">
                How We Grade
              </h1>
            </FadeInSection>
            <FadeInSection delay={300}>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed" data-testid="text-hero-subtitle">
                The AI sees the same rubric you see. No hidden criteria, no secret formulas.
                This page documents exactly how every essay is evaluated.
              </p>
            </FadeInSection>
          </div>
        </section>

        <section className="py-24 sm:py-32 px-4 bg-card/30">
          <div className="container mx-auto max-w-5xl">
            <FadeInSection>
              <div className="text-center mb-16">
                <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">Theoretical Foundation</p>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight" data-testid="text-theory-headline">
                  Grounded in research.<br />Not just built — designed.
                </h2>
                <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg">
                  Every design decision in this assessment system maps to established pedagogical research,
                  ensuring the grading methodology serves learning — not just measurement.
                </p>
              </div>
            </FadeInSection>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: "Formative Assessment",
                  citation: "Black & Wiliam (1998)",
                  desc: "Rubric criteria are displayed while students write — not hidden until after submission. This implements Black & Wiliam's seminal finding that achievement improves when students understand evaluation criteria before performing tasks.",
                  anchor: "rubric-visibility",
                },
                {
                  title: "Feed-Forward Feedback",
                  citation: "Hattie & Timperley (2007)",
                  desc: "Per-criterion AI feedback after each weekly submission informs the next performance rather than merely evaluating the last. Each cycle's feedback becomes input for the next week's decision-making.",
                  anchor: "iterative-feedback",
                },
                {
                  title: "Iterative Experiential Cycles",
                  citation: "Kolb (1984); Kayes (2002)",
                  desc: "The 8-week simulation repeats Kolb's experiential learning cycle — experience, reflection, conceptualization, experimentation — with compounding consequences, directly addressing Kayes's critique of single-iteration designs.",
                  anchor: "experiential-cycles",
                },
                {
                  title: "Productive Failure",
                  citation: "Kapur (2008, 2016)",
                  desc: "Students who struggle with complex problems before receiving instruction outperform those who receive instruction first. The compounding metric system — where early decisions create downstream consequences — embodies this principle.",
                  anchor: "productive-failure",
                },
                {
                  title: "Scaffolded Complexity",
                  citation: "Wood, Bruner & Ross (1976)",
                  desc: "Three difficulty tiers progressively reduce scaffolding as student capability increases — fewer advisor uses, tighter crisis thresholds — implementing Vygotsky's Zone of Proximal Development through structured support withdrawal.",
                  anchor: "scaffolding",
                },
                {
                  title: "Automated Essay Scoring",
                  citation: "Shermis & Burstein (2013)",
                  desc: "AI-assisted evaluation achieves inter-rater reliability comparable to human raters when rubric criteria are clearly defined. Our transparent, criterion-level rubric design is built on this established AES research foundation.",
                  anchor: "aes-foundation",
                },
              ].map((item, i) => (
                <FadeInSection key={item.title} delay={i * 100}>
                  <div className="p-6 rounded-2xl bg-card border border-border h-full flex flex-col" data-testid={`card-theory-${i}`}>
                    <div className="text-xs font-medium text-primary mb-2">{item.citation}</div>
                    <h3 className="text-lg font-bold text-foreground mb-3">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed flex-1">{item.desc}</p>
                  </div>
                </FadeInSection>
              ))}
            </div>
            <FadeInSection delay={600}>
              <div className="mt-12 p-6 rounded-2xl bg-muted/50 border border-border" data-testid="card-theory-additional">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-bold text-foreground mb-2">Situated Cognition</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Brown, Collins & Duguid (1989) established that knowledge is most effectively acquired within
                      authentic contexts. The simulation's CEO role, 17 stakeholder characters with quantified traits,
                      and industry-sourced articles create a situated learning environment where strategic reasoning
                      is embedded in realistic organizational dynamics.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground mb-2">Stakeholder Salience</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      The character system's influence, hostility, flexibility, and risk-tolerance dimensions
                      mirror Mitchell, Agle & Wood's (1997) stakeholder salience framework of power, urgency,
                      and legitimacy — creating the organizational complexity that makes decision-making
                      consequential and grading contextually rich.
                    </p>
                  </div>
                </div>
              </div>
            </FadeInSection>
          </div>
        </section>

        <section className="py-24 sm:py-32 px-4">
          <div className="container mx-auto max-w-5xl">
            <FadeInSection>
              <div className="text-center mb-16">
                <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">The Rubric</p>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight" data-testid="text-rubric-headline">
                  Four criteria.<br />100 points total.
                </h2>
                <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg">
                  Every essay is scored on these four dimensions — the same criteria displayed
                  on the decision page while students write their responses.
                </p>
              </div>
            </FadeInSection>
            <div className="grid md:grid-cols-2 gap-6">
              {RUBRIC_CRITERIA.map((criterion, i) => (
                <FadeInSection key={criterion.name} delay={i * 100}>
                  <div className="p-6 rounded-2xl bg-card border border-border h-full" data-testid={`card-criterion-${i}`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-foreground">{criterion.name}</h3>
                      <span className="text-2xl font-bold text-primary">{criterion.points}pts</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{criterion.desc}</p>
                    <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                      <p className="text-xs font-medium text-foreground mb-1">What the AI evaluates:</p>
                      <p className="text-xs text-muted-foreground">{criterion.guidelines}</p>
                    </div>
                  </div>
                </FadeInSection>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 sm:py-32 px-4 bg-card/30">
          <div className="container mx-auto max-w-5xl">
            <FadeInSection>
              <div className="text-center mb-16">
                <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">Scoring Bands</p>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight" data-testid="text-bands-headline">
                  Clear expectations.<br />Published thresholds.
                </h2>
                <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg">
                  Every score maps to a published band — students know exactly where they stand
                  and what it takes to improve.
                </p>
              </div>
            </FadeInSection>

            <div className="grid lg:grid-cols-2 gap-12">
              <FadeInSection>
                <div>
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2" data-testid="text-per-criterion-bands">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Per-Criterion Bands (25 points each)
                  </h3>
                  <div className="space-y-3">
                    {CRITERION_BANDS.map((band, i) => (
                      <div key={band.range} className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border" data-testid={`band-criterion-${i}`}>
                        <div className="text-lg font-bold text-primary whitespace-nowrap min-w-[4.5rem]">{band.range}</div>
                        <div>
                          <div className="text-sm font-semibold text-foreground">{band.label}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{band.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeInSection>

              <FadeInSection delay={200}>
                <div>
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2" data-testid="text-overall-quality">
                    <Target className="h-5 w-5 text-primary" />
                    Overall Quality Thresholds
                  </h3>
                  <div className="space-y-4">
                    {QUALITY_THRESHOLDS.map((threshold, i) => (
                      <div key={threshold.label} className="p-5 rounded-xl bg-card border border-border" data-testid={`band-quality-${i}`}>
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`h-3 w-3 rounded-full ${threshold.color}`} />
                          <span className={`text-lg font-bold ${threshold.textColor}`}>{threshold.label}</span>
                          <span className="text-sm font-medium text-muted-foreground ml-auto">{threshold.range}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{threshold.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeInSection>
            </div>
          </div>
        </section>

        <section className="py-24 sm:py-32 px-4">
          <div className="container mx-auto max-w-5xl">
            <FadeInSection>
              <div className="text-center mb-16">
                <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">The Process</p>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight" data-testid="text-process-headline">
                  How the AI evaluates<br />your essay.
                </h2>
                <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg">
                  From submission to final grade — a transparent, five-step process
                  where every decision point is visible.
                </p>
              </div>
            </FadeInSection>
            <div className="space-y-6">
              {PROCESS_STEPS.map((step, i) => (
                <FadeInSection key={step.num} delay={i * 100}>
                  <div className="flex items-start gap-6 p-6 rounded-2xl bg-card border border-border" data-testid={`step-process-${step.num}`}>
                    <div className="flex flex-col items-center shrink-0">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <step.icon className="h-6 w-6 text-primary" />
                      </div>
                      {i < PROCESS_STEPS.length - 1 && (
                        <div className="w-px h-6 bg-border mt-2 hidden sm:block" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-xs font-bold text-primary uppercase tracking-widest">Step {step.num}</span>
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-1">{step.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                </FadeInSection>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 sm:py-32 px-4 bg-card/30">
          <div className="container mx-auto max-w-5xl">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
              <FadeInSection>
                <div>
                  <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">Calibration</p>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.1]" data-testid="text-calibration-headline">
                    Calibrated against<br />exemplar responses.
                  </h2>
                  <p className="text-muted-foreground mt-6 text-lg leading-relaxed">
                    The grading engine is calibrated so that the scores match what experienced
                    faculty would assign. We validate against exemplar essays to ensure consistency.
                  </p>
                  <div className="mt-8 space-y-4">
                    <div className="p-4 rounded-xl bg-card border border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                        <span className="text-sm font-semibold text-foreground">Excellent responses (93–96%)</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Cite specific statistics, address 3+ stakeholder groups with contingency
                        plans, and provide multi-layered risk analysis. These consistently score
                        in the 93–96 range across repeated evaluations.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-card border border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-semibold text-foreground">Good responses (72–88%)</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Present clear reasoning with relevant evidence but may miss a stakeholder
                        group or provide generic rather than specific risk mitigation.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-card border border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-amber-500" />
                        <span className="text-sm font-semibold text-foreground">Adequate responses (52–68%)</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Show understanding of the topic but rely on general statements without
                        specific data, acknowledge fewer trade-offs, or skip stakeholder analysis.
                      </p>
                    </div>
                  </div>
                </div>
              </FadeInSection>

              <FadeInSection delay={200}>
                <div>
                  <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">Quality Assurance</p>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.1]" data-testid="text-qa-headline">
                    Consistent and<br />reproducible.
                  </h2>
                  <p className="text-muted-foreground mt-6 text-lg leading-relaxed">
                    The AI evaluates each criterion independently, reducing the halo effect
                    common in holistic grading. The same essay produces consistent scores
                    across multiple evaluations.
                  </p>
                  <div className="mt-8 space-y-4">
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border">
                      <Brain className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <div>
                        <div className="text-sm font-semibold text-foreground">Independent criterion scoring</div>
                        <div className="text-xs text-muted-foreground">Each of the four criteria is evaluated separately to prevent one strong area from inflating the others.</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border">
                      <Scale className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <div>
                        <div className="text-sm font-semibold text-foreground">Granular scoring bands</div>
                        <div className="text-xs text-muted-foreground">Five distinct bands per criterion (not just pass/fail) reduce variance and reward nuanced work.</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border">
                      <Sparkles className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <div>
                        <div className="text-sm font-semibold text-foreground">Written feedback per dimension</div>
                        <div className="text-xs text-muted-foreground">Students receive specific comments on each criterion — not just a number, but actionable guidance.</div>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeInSection>
            </div>
          </div>
        </section>

        <section className="py-24 sm:py-32 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
              <FadeInSection>
                <div>
                  <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">Human Authority</p>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.1]" data-testid="text-authority-headline">
                    AI assists.<br />Instructors decide.
                  </h2>
                  <p className="text-muted-foreground mt-6 text-lg leading-relaxed">
                    AI scores are formative — they give students immediate feedback and help instructors
                    work efficiently. But the instructor always has the final word.
                  </p>
                  <div className="mt-8 space-y-3">
                    {[
                      "Review every AI-generated score alongside the original essay",
                      "Adjust individual criterion scores up or down",
                      "Add written comments and qualitative feedback",
                      "Override the overall score with a single click",
                      "Finalize grades on your timeline, not the AI's",
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border" data-testid={`authority-item-${i}`}>
                        <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                        <span className="text-sm text-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeInSection>

              <FadeInSection delay={200}>
                <div>
                  <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">Optional Feature</p>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.1]" data-testid="text-curve-headline">
                    Curved scoring.<br />Opt-in only.
                  </h2>
                  <p className="text-muted-foreground mt-6 text-lg leading-relaxed">
                    When different weeks have different difficulty levels, curved scoring
                    normalizes results so students aren't penalized for tackling harder scenarios.
                  </p>
                  <div className="mt-8 p-6 rounded-2xl bg-card border border-border">
                    <h4 className="text-sm font-bold text-foreground mb-3">How it works</h4>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <div className="flex items-start gap-2">
                        <span className="text-primary font-bold shrink-0">1.</span>
                        <span>Statistical normalization centers the class around a target mean</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-primary font-bold shrink-0">2.</span>
                        <span>Requires a minimum number of submissions to activate (avoids distortion with small samples)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-primary font-bold shrink-0">3.</span>
                        <span>Curved scores are bounded to prevent extreme outliers</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-primary font-bold shrink-0">4.</span>
                        <span>Off by default — instructors enable it via a toggle in the grading module</span>
                      </div>
                    </div>
                    <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border/50">
                      <p className="text-xs text-muted-foreground">
                        <strong className="text-foreground">Note:</strong> When curved scoring is disabled, all curved score columns,
                        chart datasets, and PDF references are hidden. Raw scores are the only scores displayed.
                      </p>
                    </div>
                  </div>
                </div>
              </FadeInSection>
            </div>
          </div>
        </section>

        <section className="py-24 sm:py-32 px-4 bg-card/30">
          <div className="container mx-auto max-w-5xl">
            <FadeInSection>
              <div className="text-center mb-16">
                <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">Student Experience</p>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight" data-testid="text-experience-headline">
                  What students see<br />at every step.
                </h2>
                <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg">
                  Transparency isn't just about publishing criteria — it's about making them
                  visible in the moment they matter most.
                </p>
              </div>
            </FadeInSection>
            <div className="grid md:grid-cols-2 gap-8">
              <FadeInSection>
                <div className="p-8 rounded-2xl bg-card border border-border h-full" data-testid="card-writing-experience">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">While Writing</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    The weekly decision page displays the full rubric and recommended source articles
                    alongside the essay input. Students can reference criteria and source codes
                    while composing their response.
                  </p>
                  <div className="space-y-2">
                    {["Rubric criteria with point values", "Recommended reading panel with source codes", "Word count tracking against minimums", "3-part structured prompts for depth"].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle className="h-3 w-3 text-emerald-500 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeInSection>
              <FadeInSection delay={200}>
                <div className="p-8 rounded-2xl bg-card border border-border h-full" data-testid="card-results-experience">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">After Submission</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    The week results page shows a per-criterion score breakdown with the same
                    quality labels (Excellent, Good, Adequate, Poor) and written feedback
                    on each dimension.
                  </p>
                  <div className="space-y-2">
                    {["Per-criterion scores out of 25", "Written feedback per dimension", "Overall quality label with color coding", "Comparison to published scoring bands"].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle className="h-3 w-3 text-emerald-500 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeInSection>
            </div>
          </div>
        </section>

        <section className="py-12 px-4 bg-muted/30 border-t" id="references">
          <div className="container mx-auto max-w-4xl">
            <h3 className="text-sm font-semibold mb-6 text-muted-foreground uppercase tracking-widest">
              References
            </h3>
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p className="pl-8 -indent-8">
                Black, P., & Wiliam, D. (1998). Assessment and classroom learning. <em>Assessment in Education: Principles, Policy & Practice, 5</em>(1), 7-74.{" "}
                <a href="https://doi.org/10.1080/0969595980050102" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">doi:10.1080/0969595980050102</a>
              </p>
              <p className="pl-8 -indent-8">
                Brown, J. S., Collins, A., & Duguid, P. (1989). Situated cognition and the culture of learning. <em>Educational Researcher, 18</em>(1), 32-42.{" "}
                <a href="https://doi.org/10.3102/0013189X018001032" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">doi:10.3102/0013189X018001032</a>
              </p>
              <p className="pl-8 -indent-8">
                Hattie, J., & Timperley, H. (2007). The power of feedback. <em>Review of Educational Research, 77</em>(1), 81-112.{" "}
                <a href="https://doi.org/10.3102/003465430298487" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">doi:10.3102/003465430298487</a>
              </p>
              <p className="pl-8 -indent-8">
                Kapur, M. (2016). Examining productive failure, productive success, and unproductive failure in learning. <em>Educational Psychologist, 51</em>(2), 289-299.{" "}
                <a href="https://doi.org/10.1080/00461520.2016.1155457" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">doi:10.1080/00461520.2016.1155457</a>
              </p>
              <p className="pl-8 -indent-8">
                Kayes, D. C. (2002). Experiential learning and its critics: Preserving the role of experience in management learning and education. <em>Academy of Management Learning & Education, 1</em>(2), 137-149.{" "}
                <a href="https://doi.org/10.5465/amle.2002.8509336" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">doi:10.5465/amle.2002.8509336</a>
              </p>
              <p className="pl-8 -indent-8">
                Kolb, D. A. (1984). <em>Experiential learning: Experience as the source of learning and development</em>. Prentice-Hall.
              </p>
              <p className="pl-8 -indent-8">
                Mitchell, R. K., Agle, B. R., & Wood, D. J. (1997). Toward a theory of stakeholder identification and salience. <em>Academy of Management Review, 22</em>(4), 853-886.{" "}
                <a href="https://doi.org/10.5465/amr.1997.9711022105" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">doi:10.5465/amr.1997.9711022105</a>
              </p>
              <p className="pl-8 -indent-8">
                Shermis, M. D., & Burstein, J. (Eds.). (2013). <em>Handbook of automated essay evaluation: Current applications and new directions</em>. Routledge.
              </p>
              <p className="pl-8 -indent-8">
                Wood, D., Bruner, J. S., & Ross, G. (1976). The role of tutoring in problem solving. <em>Journal of Child Psychology and Psychiatry, 17</em>(2), 89-100.{" "}
                <a href="https://doi.org/10.1111/j.1469-7610.1976.tb00381.x" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">doi:10.1111/j.1469-7610.1976.tb00381.x</a>
              </p>
            </div>
          </div>
        </section>

        <section className="py-24 sm:py-32 px-4">
          <div className="container mx-auto max-w-3xl text-center">
            <FadeInSection>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-6" data-testid="text-cta-headline">
                See it in action.
              </h2>
              <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
                Request a 30-day demo to experience the full grading workflow — submit essays,
                review AI feedback, and explore the instructor dashboard.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a href="/for-educators#demo">
                  <Button size="lg" data-testid="button-try-demo">
                    Try the Demo
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </a>
                <Link href="/guides/student">
                  <Button size="lg" variant="outline" data-testid="button-student-guide">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Read the Student Guide
                  </Button>
                </Link>
              </div>
            </FadeInSection>
          </div>
        </section>

      </main>

      <AppFooter />
    </div>
  );
}
