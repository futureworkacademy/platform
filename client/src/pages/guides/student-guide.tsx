import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { AppFooter } from "@/components/app-footer";
import { Link } from "wouter";
import { generateStudentGuidePDF } from "@/lib/guide-pdf-export";
import { BrandLogo } from "@/components/brand-logo";
import {
  ArrowLeft,
  Download,
  LogIn,
  KeyRound,
  Briefcase,
  FileText,
  PenTool,
  BarChart3,
  LayoutDashboard,
  DollarSign,
  Users,
  Heart,
  Scale,
  CreditCard,
  Cpu,
  ListChecks,
  MessageSquare,
  Phone,
  BookOpen,
  Award,
  Trophy,
  Star,
  Lightbulb,
  CheckCircle,
  UserCheck,
  HelpCircle,
  Mail,
  GraduationCap,
  TrendingUp,
  Target,
  Headphones,
  CircleDot,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  Info,
  ImageIcon,
} from "lucide-react";

const TABLE_OF_CONTENTS = [
  { id: "getting-started", label: "Getting Started" },
  { id: "weekly-workflow", label: "Weekly Workflow" },
  { id: "your-dashboard", label: "Understanding Your Dashboard" },
  { id: "decision-process", label: "The Decision Process" },
  { id: "advisors", label: "Phone-a-Friend Advisors" },
  { id: "scoring", label: "How You're Scored" },
  { id: "characters", label: "Character Profiles" },
  { id: "tips", label: "Tips for Success" },
  { id: "need-help", label: "Need Help?" },
];

function SectionAnchor({ id }: { id: string }) {
  return <div id={id} className="scroll-mt-24" />;
}

function NumberCircle({ n }: { n: number }) {
  return (
    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center text-sm font-bold">
      {n}
    </span>
  );
}

export default function StudentGuidePage() {
  useEffect(() => {
    document.title = "Student Guide | Future Work Academy";
  }, []);

  return (
    <div className="min-h-screen bg-background" data-testid="student-guide-page">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4 flex-wrap">
          <Link href="/">
            <BrandLogo height="h-12" data-testid="img-header-logo" />
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <ThemeToggle />
            <Link href="/">
              <Button variant="outline" data-testid="button-back-home">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 max-w-5xl">
        <section className="mb-12 text-center space-y-4" data-testid="section-hero">
          <Badge variant="outline" className="mb-2">
            <GraduationCap className="mr-1 h-3 w-3" />
            Student Resource
          </Badge>
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight"
            data-testid="text-page-title"
          >
            Student Guide
          </h1>
          <p
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
            data-testid="text-page-subtitle"
          >
            Everything you need to succeed as the CEO of Apex Manufacturing in
            the Future of Work simulation. Bookmark this page for quick
            reference throughout the course.
          </p>
          <div className="pt-2">
            <Button variant="outline" data-testid="button-download-pdf" onClick={async () => {
              try {
                const res = await fetch('/api/characters');
                const chars = res.ok ? await res.json() : [];
                const summaries = chars.map((c: any) => ({
                  name: c.name,
                  role: c.role,
                  title: c.title,
                  company: c.company,
                  headline: c.socialProfile?.headline,
                }));
                await generateStudentGuidePDF(summaries);
              } catch {
                await generateStudentGuidePDF();
              }
            }}>
              <Download className="mr-2 h-4 w-4" />
              Download as PDF
            </Button>
          </div>
        </section>

        <Card className="mb-10 border-2 border-primary/30" data-testid="callout-privacy">
          <CardContent className="p-5 space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
            <h3 className="font-bold text-base">Your Privacy Matters</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            This simulation is designed with student privacy as a priority. Your instructor may enable <strong>Privacy Mode</strong> for your class, which means:
          </p>
          <ul className="text-sm text-muted-foreground space-y-1.5 pl-5 list-disc">
            <li>You enroll anonymously via Replit authentication — no school email verification is required.</li>
            <li>Your phone number is never collected, and SMS/email notifications are disabled.</li>
            <li>You are identified by a pseudonymous ID (e.g., <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">Student_abc12345</code>) within the platform.</li>
            <li>Your instructor maintains a separate offline roster to map pseudonyms to real identities.</li>
            <li>AI essay evaluation receives only your written responses — no personally identifiable information is shared with the AI.</li>
          </ul>
          <div className="flex items-start gap-2 pt-1">
            <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              If your class is not using Privacy Mode, you will be asked to verify a <strong>.edu email address</strong> during enrollment. This helps your instructor match you with the class roster. Your data is handled securely and is never shared with third parties.
            </p>
          </div>
        </CardContent>
        </Card>

        <Card className="mb-10" data-testid="card-table-of-contents">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 flex-wrap">
              <ListChecks className="h-5 w-5 text-accent" />
              Table of Contents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <nav className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3" data-testid="nav-toc">
              {TABLE_OF_CONTENTS.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="flex items-center gap-2 p-2 rounded-md hover-elevate text-sm font-medium"
                  data-testid={`link-toc-${item.id}`}
                >
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  {item.label}
                </a>
              ))}
            </nav>
          </CardContent>
        </Card>

        <div className="space-y-10">
          {/* ── Getting Started ── */}
          <SectionAnchor id="getting-started" />
          <Card data-testid="card-getting-started">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 flex-wrap text-xl">
                <LogIn className="h-5 w-5 text-primary" />
                Getting Started
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-start gap-4 flex-wrap" data-testid="step-login">
                <NumberCircle n={1} />
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="font-semibold">Log In with Replit</p>
                  <p className="text-sm text-muted-foreground">
                    Click the <strong>Sign In</strong> button on the landing
                    page. You will be redirected to Replit's secure
                    authentication page. If you already have a Replit account,
                    sign in with your existing credentials. If not, create a
                    free account using any email address. The platform uses
                    Replit's OIDC authentication, so there is no separate
                    password to remember.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 flex-wrap" data-testid="step-enrollment">
                <NumberCircle n={2} />
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="font-semibold">Find Your Class</p>
                  <p className="text-sm text-muted-foreground">
                    After signing in for the first time, you will be prompted
                    to join your class. There are two ways to do this:
                  </p>
                  <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                    <li>
                      <strong>Direct invite link</strong> — Your instructor may
                      share a link that takes you straight to the platform and
                      automatically connects you to the right class. Just click
                      the link, sign in, and you are in.
                    </li>
                    <li>
                      <strong>Enrollment code</strong> — Alternatively, your
                      instructor may give you a code (e.g., BUS501F26). Enter
                      the code exactly as given (codes are case-sensitive) and
                      click "Join."
                    </li>
                  </ul>
                  <p className="text-sm text-muted-foreground">
                    Either way, you will be enrolled in the class. Your
                    instructor will then assign you to a team — once assigned,
                    you can begin exploring the simulation.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 flex-wrap" data-testid="step-role">
                <NumberCircle n={3} />
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="font-semibold">Understand Your Role</p>
                  <p className="text-sm text-muted-foreground">
                    You are stepping into the shoes of a <strong>CEO</strong>{" "}
                    at <strong>Apex Manufacturing</strong>, a mid-sized
                    industrial company at a crossroads. The board has tasked
                    you with navigating a sweeping AI and automation
                    transformation while preserving employee morale, managing
                    union dynamics, and maintaining financial health. Every
                    decision you make over the next 8 weeks will shape the
                    company's future — and your final score.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── Weekly Workflow ── */}
          <SectionAnchor id="weekly-workflow" />
          <Card data-testid="card-weekly-workflow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 flex-wrap text-xl">
                <FileText className="h-5 w-5 text-primary" />
                Weekly Workflow
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-6">
                Each of the 8 simulation weeks follows the same three-step
                rhythm. Complete every step before advancing to the next week.
              </p>
              <div className="space-y-6">
                <div className="flex items-start gap-4 flex-wrap" data-testid="workflow-step-1">
                  <NumberCircle n={1} />
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold">Intelligence Briefing</p>
                      <Badge variant="secondary">Read + Listen</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Start each week by reading the <strong>scenario narrative</strong> that
                      sets the stage. Then listen to <strong>stakeholder voicemails</strong> —
                      phone messages from characters at Apex Manufacturing who are
                      affected by the week's events. Finally, review the
                      <strong> intel articles</strong>: curated industry news,
                      market data, and analyst reports that provide evidence you
                      can reference in your decisions. Treat the briefing like a
                      CEO's morning reading — the more carefully you absorb it,
                      the stronger your essays will be.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 flex-wrap" data-testid="workflow-step-2">
                  <NumberCircle n={2} />
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold">Make Decisions</p>
                      <Badge variant="secondary">Choose + Write</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Each week presents two strategic decisions. For each one,
                      you will select an option (A, B, C, or sometimes D) and
                      then write a substantive <strong>essay explanation</strong>{" "}
                      justifying your reasoning. Simply picking an option is not
                      enough — the essay is where you demonstrate critical
                      thinking. Refer to specific data from the briefing,
                      consider multiple stakeholders, and weigh short-term gains
                      against long-term consequences.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 flex-wrap" data-testid="workflow-step-3">
                  <NumberCircle n={3} />
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold">View Results</p>
                      <Badge variant="secondary">Review + Learn</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      After submitting both decisions, view the{" "}
                      <strong>Week Results</strong> screen. Here you will see
                      AI-graded feedback on your essay quality, changes to your
                      company metrics (revenue, morale, union sentiment, and
                      more), and a narrative summary of the consequences your
                      choices created. Pay close attention to the feedback — it
                      highlights what you did well and where you can improve for
                      the next week.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── Understanding Your Dashboard ── */}
          <SectionAnchor id="your-dashboard" />
          <Card data-testid="card-dashboard">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 flex-wrap text-xl">
                <LayoutDashboard className="h-5 w-5 text-primary" />
                Understanding Your Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-muted-foreground">
                Your CEO Dashboard is the command center for the entire
                simulation. It surfaces the information you need at a glance.
              </p>
              <div>
                <h4 className="font-semibold mb-3">Company Metrics</h4>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { icon: DollarSign, label: "Revenue", desc: "Total company revenue — aim for steady growth" },
                    { icon: Users, label: "Employees", desc: "Headcount, affected by hiring, layoffs, and attrition" },
                    { icon: Heart, label: "Morale", desc: "Employee sentiment — low morale triggers costly turnover" },
                    { icon: Scale, label: "Union Sentiment", desc: "Risk of unionization — exceeding 75% triggers collective bargaining" },
                    { icon: CreditCard, label: "Debt", desc: "Outstanding liabilities from automation financing" },
                    { icon: Cpu, label: "Automation Level", desc: "Percentage of operations automated with AI and robotics" },
                  ].map((metric) => (
                    <div
                      key={metric.label}
                      className="flex items-start gap-3 p-3 rounded-md bg-muted/50"
                      data-testid={`metric-${metric.label.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      <metric.icon className="h-4 w-4 mt-0.5 text-accent flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{metric.label}</p>
                        <p className="text-xs text-muted-foreground">{metric.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1" data-testid="dashboard-quick-actions">
                  <h4 className="font-semibold">Quick Actions</h4>
                  <p className="text-sm text-muted-foreground">
                    The dashboard provides shortcut buttons to jump directly to
                    your current week's briefing, decisions, and results. Use
                    the sidebar or the on-screen cards to navigate without
                    hunting through menus.
                  </p>
                </div>
                <div className="space-y-1" data-testid="dashboard-progress">
                  <h4 className="font-semibold">Progress Tracking</h4>
                  <p className="text-sm text-muted-foreground">
                    A progress indicator shows which week you are on (e.g.,
                    "Week 3 of 8") and whether you have completed the briefing,
                    decisions, and results review for the current week. Green
                    checkmarks appear as you finish each step.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── The Decision Process ── */}
          <SectionAnchor id="decision-process" />
          <Card data-testid="card-decision-process">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 flex-wrap text-xl">
                <PenTool className="h-5 w-5 text-primary" />
                The Decision Process
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Decisions are the core of the simulation. Here is what you need
                to know about how they work.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  {
                    icon: ListChecks,
                    title: "Two Decisions Per Week",
                    text: "Every simulation week presents exactly two strategic decisions. Both must be completed before you can advance to the following week.",
                  },
                  {
                    icon: CircleDot,
                    title: "Multiple-Choice Options",
                    text: "Each decision offers options labeled A, B, and C (some weeks include a fourth option, D). Read every option carefully before choosing — some are deliberately designed to look appealing but carry hidden risks.",
                  },
                  {
                    icon: MessageSquare,
                    title: "Essay Explanations Required",
                    text: "After selecting your option, you must write an essay explaining your reasoning. This is not optional. The essay is evaluated by AI on evidence quality, coherence, trade-off analysis, and stakeholder consideration.",
                  },
                  {
                    icon: ImageIcon,
                    title: "Attach Supporting Visualizations",
                    text: "You may attach up to 5 charts, tables, or visualizations (PNG, JPEG, WebP) to support your analysis. Export from Excel, Google Sheets, or any tool. The AI evaluator considers your visualizations when scoring Evidence Quality and Reasoning Coherence — a well-chosen chart is as strong as citing statistics.",
                  },
                  {
                    icon: TrendingUp,
                    title: "Difficulty Levels Affect Scoring",
                    text: "Decisions have varying difficulty levels that influence how aggressively your company metrics shift. Higher-difficulty decisions carry greater risk — and greater scoring upside if you handle them well.",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="p-4 rounded-md bg-muted/50 space-y-2"
                    data-testid={`decision-info-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <item.icon className="h-4 w-4 text-primary" />
                      <p className="font-semibold text-sm">{item.title}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{item.text}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* ── Phone-a-Friend Advisors ── */}
          <SectionAnchor id="advisors" />
          <Card data-testid="card-advisors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 flex-wrap text-xl">
                <Phone className="h-5 w-5 text-primary" />
                Phone-a-Friend Advisors
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <p className="text-sm text-muted-foreground">
                When you face an especially tough decision, you can call on one
                of nine world-class advisors for strategic guidance. Think of it
                like a "phone a friend" lifeline — powerful, but limited.
              </p>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  {
                    category: "Strategy Consultants",
                    color: "bg-primary",
                    desc: "Big-picture thinkers who help you frame problems and evaluate trade-offs at the executive level.",
                  },
                  {
                    category: "Industry Experts",
                    color: "bg-accent",
                    desc: "Specialists in manufacturing, automation, and labor relations who offer domain-specific insight.",
                  },
                  {
                    category: "Thought Leaders",
                    color: "bg-accent",
                    desc: "Visionaries who challenge conventional thinking and introduce innovative frameworks for change.",
                  },
                ].map((cat) => (
                  <div
                    key={cat.category}
                    className="p-4 rounded-md bg-muted/50 space-y-2"
                    data-testid={`advisor-category-${cat.category.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`w-2 h-2 rounded-full ${cat.color}`} />
                      <p className="font-semibold text-sm">{cat.category}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{cat.desc}</p>
                  </div>
                ))}
              </div>
              <div className="p-4 rounded-md border border-dashed space-y-2" data-testid="advisor-credits-info">
                <div className="flex items-center gap-2 flex-wrap">
                  <Star className="h-4 w-4 text-accent" />
                  <p className="font-semibold text-sm">3 Credits for the Entire Simulation</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  You receive exactly three advisor credits that span all 8
                  weeks. Once you use a credit, it is gone — so deploy them
                  strategically. Each consultation generates AI-powered guidance
                  tailored to your current company state, the specific decision
                  at hand, and the advisor's area of expertise. Save your
                  credits for the weeks where the stakes (and difficulty) are
                  highest.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* ── How You're Scored ── */}
          <SectionAnchor id="scoring" />
          <Card data-testid="card-scoring">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 flex-wrap text-xl">
                <Trophy className="h-5 w-5 text-primary" />
                How You're Scored
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-muted-foreground">
                Your performance is measured on two dimensions that combine to
                determine your leaderboard ranking.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-md bg-muted/50 space-y-3" data-testid="scoring-financial">
                  <div className="flex items-center gap-2 flex-wrap">
                    <DollarSign className="h-4 w-4 text-accent" />
                    <p className="font-semibold">Financial Score</p>
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-1.5">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-3 w-3 mt-0.5 text-accent flex-shrink-0" />
                      Revenue growth over the 8-week period
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-3 w-3 mt-0.5 text-accent flex-shrink-0" />
                      Cost management and debt control
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-3 w-3 mt-0.5 text-accent flex-shrink-0" />
                      Return on investment from automation spending
                    </li>
                  </ul>
                </div>
                <div className="p-4 rounded-md bg-muted/50 space-y-3" data-testid="scoring-cultural">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Heart className="h-4 w-4 text-accent" />
                    <p className="font-semibold">Cultural Score</p>
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-1.5">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-3 w-3 mt-0.5 text-accent flex-shrink-0" />
                      Employee morale and engagement levels
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-3 w-3 mt-0.5 text-accent flex-shrink-0" />
                      Union relations and avoidance of forced bargaining
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-3 w-3 mt-0.5 text-accent flex-shrink-0" />
                      Workforce adaptability and reskilling success
                    </li>
                  </ul>
                </div>
              </div>
              <div className="p-4 rounded-md border space-y-3" data-testid="scoring-essay">
                <div className="flex items-center gap-2 flex-wrap">
                  <Award className="h-4 w-4 text-primary" />
                  <p className="font-semibold">Essay Evaluation Criteria</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Every essay you submit is initially evaluated by an AI grading engine
                  across four dimensions:
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    {
                      criterion: "Evidence Quality",
                      detail: "Did you reference specific data, metrics, or intel from the briefing?",
                    },
                    {
                      criterion: "Reasoning Coherence",
                      detail: "Is your argument logical, well-structured, and internally consistent?",
                    },
                    {
                      criterion: "Trade-off Analysis",
                      detail: "Did you acknowledge and weigh competing priorities and risks?",
                    },
                    {
                      criterion: "Stakeholder Consideration",
                      detail: "Did you account for the perspectives of employees, management, unions, and the board?",
                    },
                  ].map((c) => (
                    <div
                      key={c.criterion}
                      className="flex items-start gap-2"
                      data-testid={`criterion-${c.criterion.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      <Target className="h-3 w-3 mt-1 text-accent flex-shrink-0" />
                      <div>
                        <p className="text-xs font-semibold">{c.criterion}</p>
                        <p className="text-xs text-muted-foreground">{c.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 mt-2 rounded-md bg-muted/30 border" data-testid="scoring-bands">
                  <p className="text-xs font-semibold mb-2">Scoring Bands (per criterion, 25 points each):</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span><strong className="text-foreground">24-25:</strong> Thorough, specific, well-supported</span>
                    <span><strong className="text-foreground">21-23:</strong> Solid work with minor gaps</span>
                    <span><strong className="text-foreground">15-20:</strong> General concepts, limited depth</span>
                    <span><strong className="text-foreground">&lt;15:</strong> Missing or off-topic</span>
                  </div>
                  <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
                    <strong className="text-foreground">Overall:</strong> A (93-100) Excellent | B (72-92) Good | C (52-71) Adequate | Below 52 needs improvement
                  </div>
                </div>
                <div className="flex items-start gap-2 p-3 mt-2 bg-amber-500/10 rounded-md border border-amber-500/20" data-testid="callout-human-grading">
                  <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    <strong className="text-foreground">Important:</strong> Human grading will always be performed on all AI-graded submissions. AI scores provide immediate feedback to help you improve week over week, but your instructor reviews and may adjust final grades to ensure fairness and accuracy.
                  </p>
                </div>
                <a href="/methodology" className="inline-flex items-center gap-1.5 mt-4 text-xs font-medium text-primary hover:underline transition-colors" data-testid="link-methodology-student-guide">
                  Learn how your essays are evaluated →
                </a>
              </div>
            </CardContent>
          </Card>

          {/* ── Character Profiles ── */}
          <SectionAnchor id="characters" />
          <Card data-testid="card-characters">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 flex-wrap text-xl">
                <UserCheck className="h-5 w-5 text-primary" />
                Character Profiles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Apex Manufacturing is populated by 17 richly detailed
                stakeholders — from the ambitious CFO to the skeptical union
                steward. Understanding who they are and what they care about is
                essential to making decisions that succeed.
              </p>
              <Link href="/characters">
                <Button variant="outline" size="sm" data-testid="button-view-all-characters">
                  <Users className="mr-2 h-4 w-4" />
                  View All Stakeholder Profiles
                </Button>
              </Link>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-md bg-muted/50 space-y-2" data-testid="characters-access">
                  <div className="flex items-center gap-2 flex-wrap">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <p className="font-semibold text-sm">How to Access Profiles</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Whenever a character's name appears in a briefing
                    narrative, voicemail, or decision prompt, it is rendered as
                    a clickable link. Click the name to open a modal with the
                    character's full biography, department, tenure, and
                    personality traits.
                  </p>
                </div>
                <div className="p-4 rounded-md bg-muted/50 space-y-2" data-testid="characters-traits">
                  <div className="flex items-center gap-2 flex-wrap">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    <p className="font-semibold text-sm">Key Traits to Watch</p>
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-1.5">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-3 w-3 mt-0.5 text-accent flex-shrink-0" />
                      <span><strong>Influence</strong> — how much sway they hold over outcomes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-3 w-3 mt-0.5 text-accent flex-shrink-0" />
                      <span><strong>Hostility</strong> — their resistance to change and AI adoption</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-3 w-3 mt-0.5 text-accent flex-shrink-0" />
                      <span><strong>Flexibility</strong> — willingness to compromise or adapt</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-3 w-3 mt-0.5 text-accent flex-shrink-0" />
                      <span><strong>Risk Tolerance</strong> — appetite for bold, high-stakes moves</span>
                    </li>
                  </ul>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Characters' reactions are not decorative — they actively
                influence how your decisions play out. A decision that ignores a
                high-influence stakeholder's concerns may trigger metric
                penalties, while one that aligns with key allies can amplify
                positive outcomes.
              </p>
            </CardContent>
          </Card>

          {/* ── Tips for Success ── */}
          <SectionAnchor id="tips" />
          <Card data-testid="card-tips">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 flex-wrap text-xl">
                <Lightbulb className="h-5 w-5 text-accent" />
                Tips for Success
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  {
                    icon: BookOpen,
                    tip: "Read Every Intel Article",
                    detail: "Intel articles are not filler — reading them earns bonus engagement points and gives you concrete evidence to cite in your essays.",
                  },
                  {
                    icon: Headphones,
                    tip: "Listen to Every Voicemail",
                    detail: "Voicemails reveal stakeholder emotions and hidden agendas that do not appear in the written narrative. They are short — do not skip them.",
                  },
                  {
                    icon: Users,
                    tip: "Consider Multiple Stakeholders",
                    detail: "Top-scoring essays explicitly address the perspectives of at least two or three stakeholder groups (e.g., employees, management, the board).",
                  },
                  {
                    icon: Scale,
                    tip: "Balance Short-Term and Long-Term",
                    detail: "Quick wins often create long-term problems. The grading engine rewards essays that acknowledge and weigh temporal trade-offs.",
                  },
                  {
                    icon: Target,
                    tip: "Reference Specific Data",
                    detail: "Generic reasoning scores lower than arguments grounded in specific numbers, trends, or scenarios from the briefing materials.",
                  },
                  {
                    icon: Briefcase,
                    tip: "Think Like a CEO",
                    detail: "The simulation rewards strategic thinking — not just correct answers. Show that you understand the interconnected nature of financial, cultural, and operational decisions.",
                  },
                ].map((item) => (
                  <div
                    key={item.tip}
                    className="flex items-start gap-3 p-3 rounded-md bg-muted/50"
                    data-testid={`tip-${item.tip.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <item.icon className="h-4 w-4 mt-0.5 text-accent flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{item.tip}</p>
                      <p className="text-xs text-muted-foreground">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* ── Need Help? ── */}
          <SectionAnchor id="need-help" />
          <Card data-testid="card-need-help">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 flex-wrap text-xl">
                <HelpCircle className="h-5 w-5 text-primary" />
                Need Help?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-md bg-muted/50 space-y-2" data-testid="help-academic">
                  <div className="flex items-center gap-2 flex-wrap">
                    <GraduationCap className="h-4 w-4 text-primary" />
                    <p className="font-semibold text-sm">Academic Questions</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Questions about grading, deadlines, or course
                    requirements should be directed to your professor or
                    teaching assistant. They have full visibility into your
                    simulation progress.
                  </p>
                </div>
                <div className="p-4 rounded-md bg-muted/50 space-y-2" data-testid="help-technical">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Mail className="h-4 w-4 text-accent" />
                    <p className="font-semibold text-sm">Technical Issues</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    If you encounter a bug, loading error, or account
                    problem, email{" "}
                    <a
                      href="mailto:support@futureworkacademy.com"
                      className="underline font-medium"
                      data-testid="link-support-email"
                    >
                      support@futureworkacademy.com
                    </a>{" "}
                    with a description of the issue and a screenshot if
                    possible.
                  </p>
                </div>
                <div className="p-4 rounded-md bg-muted/50 space-y-2" data-testid="help-platform">
                  <div className="flex items-center gap-2 flex-wrap">
                    <MessageSquare className="h-4 w-4 text-accent" />
                    <p className="font-semibold text-sm">Platform Questions</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    For general "how do I...?" questions about the
                    simulation, use the <strong>AI Q&A Assistant</strong>{" "}
                    available within the app. It can answer most questions about
                    navigation, features, and gameplay instantly.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <Link href="/">
            <Button variant="outline" data-testid="button-back-home-bottom">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
