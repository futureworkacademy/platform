import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { AppFooter } from "@/components/app-footer";
import { Link } from "wouter";
import { generateInstructorGuidePDF } from "@/lib/guide-pdf-export";
import { BrandLogo } from "@/components/brand-logo";
import {
  ArrowLeft,
  Download,
  LogIn,
  KeyRound,
  Shield,
  Users,
  UserPlus,
  FileSpreadsheet,
  ListChecks,
  ChevronRight,
  Play,
  FastForward,
  Calendar,
  BarChart3,
  LayoutDashboard,
  FileText,
  PenTool,
  Phone,
  UserCheck,
  Trophy,
  DollarSign,
  Heart,
  Award,
  Target,
  Cpu,
  Eye,
  ClipboardCheck,
  Activity,
  AlertCircle,
  Mail,
  MessageSquare,
  Bell,
  Send,
  Layers,
  Settings,
  FlaskConical,
  Lightbulb,
  CheckCircle,
  HelpCircle,
  GraduationCap,
  BookOpen,
  Lock,
  Hash,
  Gauge,
} from "lucide-react";

const TABLE_OF_CONTENTS = [
  { id: "getting-started", label: "Getting Started" },
  { id: "managing-class", label: "Managing Your Class" },
  { id: "simulation-controls", label: "Simulation Controls" },
  { id: "student-experience", label: "Student Experience Overview" },
  { id: "grading", label: "Grading and Assessment" },
  { id: "monitoring", label: "Monitoring Student Progress" },
  { id: "communication", label: "Communication Tools" },
  { id: "difficulty", label: "Difficulty Levels" },
  { id: "sandbox", label: "Student Sandbox Mode" },
  { id: "tips", label: "Tips for Instructors" },
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

export default function InstructorGuidePage() {
  useEffect(() => {
    document.title = "Instructor Guide | Future Work Academy";
  }, []);

  return (
    <div className="min-h-screen bg-background" data-testid="instructor-guide-page">
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
            <BookOpen className="mr-1 h-3 w-3" />
            Educator Resource
          </Badge>
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight"
            data-testid="text-page-title"
          >
            Instructor Guide
          </h1>
          <p
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
            data-testid="text-page-subtitle"
          >
            A comprehensive guide to setting up, managing, and getting the most
            out of the Future of Work simulation for your class. From initial
            setup to grading and assessment, everything you need is here.
          </p>
          <div className="pt-2">
            <Button variant="outline" data-testid="button-download-pdf" onClick={() => generateInstructorGuidePDF()}>
              <Download className="mr-2 h-4 w-4" />
              Download as PDF
            </Button>
          </div>
        </section>

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

          <SectionAnchor id="getting-started" />
          <Card data-testid="card-getting-started">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 flex-wrap text-xl">
                <LogIn className="h-5 w-5 text-primary" />
                Getting Started as an Instructor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-start gap-4 flex-wrap" data-testid="step-create-account">
                <NumberCircle n={1} />
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="font-semibold">Create Your Account</p>
                  <p className="text-sm text-muted-foreground">
                    Navigate to the Future Work Academy landing page and click
                    <strong> Sign In</strong>. You will be redirected to Replit's
                    secure OIDC authentication page. Sign in with your existing
                    Replit account or create a new one using any email address.
                    There is no separate password to manage — Replit handles all
                    authentication securely. Once signed in, the platform
                    administrator will assign you the <strong>Instructor</strong> role,
                    granting access to the Class Admin dashboard.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 flex-wrap" data-testid="step-setup-class">
                <NumberCircle n={2} />
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="font-semibold">Set Up Your Organization / Class</p>
                  <p className="text-sm text-muted-foreground">
                    From the <strong>Class Admin</strong> dashboard, create a new
                    organization (class section). Give it a descriptive name — for
                    example, "BUS-301 Fall 2026 Section A." The platform will
                    generate a unique <strong>enrollment code</strong> that you
                    share with your students. You can create multiple organizations
                    if you teach multiple sections or courses, each with its own
                    enrollment code, teams, and simulation instance.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 flex-wrap" data-testid="step-enrollment-code">
                <NumberCircle n={3} />
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="font-semibold">Understanding the Enrollment Code System</p>
                  <p className="text-sm text-muted-foreground">
                    Each organization has a unique, case-sensitive enrollment code.
                    Students can join your class in two ways:
                  </p>
                  <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                    <li>
                      <strong>Direct invite link</strong> — Share the link
                      displayed on your Class Admin dashboard (e.g.,{" "}
                      <code className="text-xs bg-muted px-1 py-0.5 rounded">
                        futureworkacademy.replit.app/join/BUS501F26
                      </code>
                      ). Students click the link, sign in, and are automatically
                      enrolled — no code entry needed.
                    </li>
                    <li>
                      <strong>Enrollment code</strong> — Students can also
                      enter the code manually after signing in. Share the code
                      via your LMS, syllabus, or in class.
                    </li>
                  </ul>
                  <p className="text-sm text-muted-foreground">
                    The invite link is the easiest option for most classes. If
                    a code is compromised, you can regenerate it from the Class
                    Admin dashboard without affecting students who have already
                    enrolled.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 flex-wrap" data-testid="step-privacy-mode">
                <NumberCircle n={4} />
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold">Privacy Mode</p>
                    <Badge variant="secondary">Optional</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    For institutions that require heightened data privacy, you can
                    enable <strong>Privacy Mode</strong> on your organization. When
                    activated: no .edu email verification is required, phone numbers
                    are not collected, email/SMS notifications are disabled, and
                    students are identified by pseudonymous IDs (e.g.,{" "}
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">
                      Student_abc12345
                    </code>
                    ). Download the offline roster template from your Class Admin
                    dashboard to map pseudonyms to real student identities. Students
                    are also encouraged to use a personal email for their Replit
                    account for maximum privacy. This is ideal for community
                    colleges, non-traditional programs, or any setting where FERPA
                    compliance demands minimal data collection.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <SectionAnchor id="managing-class" />
          <Card data-testid="card-managing-class">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 flex-wrap text-xl">
                <Users className="h-5 w-5 text-primary" />
                Managing Your Class
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-muted-foreground">
                The Class Admin dashboard is your command center for managing
                students, teams, and simulation progress. Here is an overview of
                the key management features.
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-md bg-muted/50 space-y-2" data-testid="manage-dashboard-overview">
                  <div className="flex items-center gap-2 flex-wrap">
                    <LayoutDashboard className="h-4 w-4 text-primary" />
                    <p className="font-semibold text-sm">Class Admin Dashboard</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    A centralized view of your organization's enrollment status,
                    team assignments, simulation progress, and communication tools.
                    Switch between organizations using the dropdown if you manage
                    multiple sections.
                  </p>
                </div>
                <div className="p-4 rounded-md bg-muted/50 space-y-2" data-testid="manage-add-students">
                  <div className="flex items-center gap-2 flex-wrap">
                    <UserPlus className="h-4 w-4 text-primary" />
                    <p className="font-semibold text-sm">Adding Students</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Students can self-enroll using the <strong>direct invite
                    link</strong> (recommended) or by entering the enrollment
                    code manually. You can also add them individually by email
                    address. For large classes, use the{" "}
                    <strong>bulk CSV import</strong> feature — upload a
                    spreadsheet with student names and emails to enroll an
                    entire roster at once. Invitation emails are sent
                    automatically.
                  </p>
                </div>
                <div className="p-4 rounded-md bg-muted/50 space-y-2" data-testid="manage-teams">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Shield className="h-4 w-4 text-primary" />
                    <p className="font-semibold text-sm">Creating Teams</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Students work in teams throughout the simulation. Create teams
                    from the Class Admin dashboard and assign students to them.
                    Each team operates as an independent company (Apex
                    Manufacturing) with its own metrics, decisions, and
                    leaderboard position. The recommended team size is
                    <strong> 3-5 students</strong> for optimal collaboration and
                    discussion.
                  </p>
                </div>
                <div className="p-4 rounded-md bg-muted/50 space-y-2" data-testid="manage-enrollment-status">
                  <div className="flex items-center gap-2 flex-wrap">
                    <ClipboardCheck className="h-4 w-4 text-primary" />
                    <p className="font-semibold text-sm">Enrollment Status</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Monitor each student's enrollment status: <strong>Active</strong> (enrolled
                    and assigned to a team), <strong>Pending</strong> (invited but
                    has not yet joined), or <strong>Deactivated</strong> (removed
                    from the simulation). You can reactivate or deactivate students
                    at any time without affecting other team members.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <SectionAnchor id="simulation-controls" />
          <Card data-testid="card-simulation-controls">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 flex-wrap text-xl">
                <Play className="h-5 w-5 text-primary" />
                Simulation Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-5">
                <div className="flex items-start gap-4 flex-wrap" data-testid="sim-start">
                  <NumberCircle n={1} />
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="font-semibold">Starting the Simulation</p>
                    <p className="text-sm text-muted-foreground">
                      Once your teams are set up and students have enrolled, start
                      the simulation from the Class Admin dashboard. You can set the
                      initial week (typically Week 1) and the simulation status will
                      change to <strong>Active</strong>. All teams within the
                      organization will begin at the same week.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 flex-wrap" data-testid="sim-advance">
                  <NumberCircle n={2} />
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="font-semibold">Advancing Weeks</p>
                    <p className="text-sm text-muted-foreground">
                      You control when the simulation advances to the next week.
                      This allows you to pace the simulation to match your course
                      schedule — whether you run one week per class session, one
                      week per calendar week, or at your own cadence. When you
                      advance the week, all teams move forward simultaneously.
                      Students who have not yet submitted decisions for the current
                      week can still submit retroactively, but they will miss the
                      real-time pacing.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">The 8-Week Structure</h4>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { week: 1, theme: "Foundation", desc: "Initial AI assessment and workforce analysis" },
                    { week: 2, theme: "Early Adoption", desc: "First automation pilots and employee reactions" },
                    { week: 3, theme: "Scaling Up", desc: "Expanding AI initiatives across departments" },
                    { week: 4, theme: "Resistance", desc: "Union tensions and workforce pushback emerge" },
                    { week: 5, theme: "Crossroads", desc: "Critical decisions with long-term consequences" },
                    { week: 6, theme: "Acceleration", desc: "Rapid change and competitive pressure intensify" },
                    { week: 7, theme: "Crisis Management", desc: "Unexpected challenges test leadership resolve" },
                    { week: 8, theme: "Legacy", desc: "Final decisions shape the company's future trajectory" },
                  ].map((w) => (
                    <div
                      key={w.week}
                      className="p-3 rounded-md bg-muted/50 space-y-1"
                      data-testid={`week-theme-${w.week}`}
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
                          {w.week}
                        </span>
                        <p className="font-semibold text-xs">{w.theme}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">{w.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-md border border-dashed space-y-2" data-testid="sim-status-tracking">
                <div className="flex items-center gap-2 flex-wrap">
                  <Activity className="h-4 w-4 text-accent" />
                  <p className="font-semibold text-sm">Simulation Status Tracking</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  The Class Admin dashboard displays the current simulation status
                  (Not Started, Active, Paused, or Completed), the current week,
                  and key statistics like total decisions submitted and average
                  scores. Use this to quickly assess overall class engagement.
                </p>
              </div>
            </CardContent>
          </Card>

          <SectionAnchor id="student-experience" />
          <Card data-testid="card-student-experience">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 flex-wrap text-xl">
                <GraduationCap className="h-5 w-5 text-primary" />
                Student Experience Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-muted-foreground">
                Understanding what your students see and do each week helps you
                guide discussions, set expectations, and troubleshoot issues
                effectively.
              </p>

              <div>
                <h4 className="font-semibold mb-3">What Students See</h4>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { icon: LayoutDashboard, label: "Dashboard", desc: "Company metrics, quick actions, and simulation progress at a glance" },
                    { icon: FileText, label: "Briefings", desc: "Weekly narratives, voicemails from stakeholders, and curated intel articles" },
                    { icon: PenTool, label: "Decisions", desc: "Two strategic decisions per week with multiple-choice options and required essays" },
                    { icon: BarChart3, label: "Analytics", desc: "Historical charts of company performance across all metrics" },
                    { icon: Trophy, label: "Leaderboard", desc: "Team rankings based on combined financial and cultural scores" },
                    { icon: ClipboardCheck, label: "Week Results", desc: "AI-graded essay feedback and metric changes after each week" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-start gap-3 p-3 rounded-md bg-muted/50"
                      data-testid={`student-view-${item.label.toLowerCase()}`}
                    >
                      <item.icon className="h-4 w-4 mt-0.5 text-accent flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-md bg-muted/50 space-y-2" data-testid="student-weekly-workflow">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Calendar className="h-4 w-4 text-primary" />
                    <p className="font-semibold text-sm">Weekly Workflow</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Each week follows a three-step rhythm: (1) Read the intelligence
                    briefing and listen to voicemails, (2) Make two strategic
                    decisions with essay explanations, and (3) Review the week's
                    results including AI-graded feedback. Students must complete all
                    three steps before the simulation advances.
                  </p>
                </div>
                <div className="p-4 rounded-md bg-muted/50 space-y-2" data-testid="student-decisions">
                  <div className="flex items-center gap-2 flex-wrap">
                    <PenTool className="h-4 w-4 text-primary" />
                    <p className="font-semibold text-sm">Decision Types and Essays</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Each decision presents 3-4 options with distinct trade-offs.
                    Students must select an option and write a substantive essay
                    explaining their reasoning. Essays are graded by AI on evidence
                    quality, reasoning coherence, trade-off analysis, and stakeholder
                    consideration. Simply picking an option without a well-argued
                    essay results in a lower score.
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-md border border-dashed space-y-2" data-testid="student-advisors">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Phone className="h-4 w-4 text-accent" />
                    <p className="font-semibold text-sm">Phone-a-Friend Advisors</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Students receive <strong>3 advisor credits</strong> for the
                    entire simulation. They can "call" one of nine AI-powered
                    advisors (strategy consultants, industry experts, or thought
                    leaders) to receive tailored guidance on a specific decision.
                    Credits do not replenish, encouraging strategic use. Each
                    consultation produces a personalized audio response based on
                    the advisor's expertise and the student's current company state.
                  </p>
                </div>
                <div className="p-4 rounded-md border border-dashed space-y-2" data-testid="student-characters">
                  <div className="flex items-center gap-2 flex-wrap">
                    <UserCheck className="h-4 w-4 text-accent" />
                    <p className="font-semibold text-sm">Character Profiles and Stakeholders</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    The simulation features 17 richly detailed stakeholder
                    characters — from the CFO to the union steward — each with
                    unique personality traits (influence, hostility, flexibility,
                    risk tolerance). Characters appear in briefings and voicemails,
                    and their reactions actively influence how decisions play out.
                    Students can click any character's name to view their full
                    biography, or browse the complete{" "}
                    <Link href="/characters" className="text-accent underline underline-offset-2">
                      Stakeholder Directory
                    </Link>.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <SectionAnchor id="grading" />
          <Card data-testid="card-grading">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 flex-wrap text-xl">
                <Trophy className="h-5 w-5 text-primary" />
                Grading and Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-muted-foreground">
                The simulation provides a multi-dimensional assessment framework
                that evaluates both quantitative outcomes and qualitative
                reasoning.
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-md bg-muted/50 space-y-3" data-testid="grading-financial">
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
                <div className="p-4 rounded-md bg-muted/50 space-y-3" data-testid="grading-cultural">
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

              <div className="p-4 rounded-md border space-y-3" data-testid="grading-essay-criteria">
                <div className="flex items-center gap-2 flex-wrap">
                  <Award className="h-4 w-4 text-primary" />
                  <p className="font-semibold">AI-Powered Essay Evaluation</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Every essay submitted by students is evaluated by an LLM-based
                  grading engine using a structured rubric. The AI evaluates each
                  essay across four criteria, producing a score and detailed
                  written feedback for each dimension:
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    {
                      criterion: "Evidence Quality",
                      detail: "Does the essay reference specific data, metrics, or intel from the briefing materials?",
                    },
                    {
                      criterion: "Reasoning Coherence",
                      detail: "Is the argument logical, well-structured, and internally consistent?",
                    },
                    {
                      criterion: "Trade-off Analysis",
                      detail: "Does the essay acknowledge and weigh competing priorities and risks?",
                    },
                    {
                      criterion: "Stakeholder Consideration",
                      detail: "Does the essay account for perspectives of employees, management, unions, and the board?",
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
                <div className="p-3 mt-2 rounded-md bg-muted/30 border" data-testid="grading-scoring-bands">
                  <p className="text-xs font-semibold mb-2">Scoring Bands (per criterion, 25 points each):</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span><strong className="text-foreground">24-25:</strong> Thorough, specific, well-supported</span>
                    <span><strong className="text-foreground">21-23:</strong> Solid work with minor gaps</span>
                    <span><strong className="text-foreground">15-20:</strong> General concepts, limited depth</span>
                    <span><strong className="text-foreground">10-14:</strong> Basic awareness without citations</span>
                    <span><strong className="text-foreground">&lt;10:</strong> No evidence of research use</span>
                  </div>
                  <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
                    <strong className="text-foreground">Overall Quality:</strong> Excellent (93-100%) | Good (72-92%) | Adequate (52-71%) | Poor (&lt;52%)
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  AI-generated scores provide students with immediate, formative
                  feedback to help them improve week over week. As the instructor,
                  you retain full authority to review, adjust, or override any
                  AI-assigned score before finalizing grades. The platform surfaces
                  the AI score alongside the original essay so you can make informed
                  adjustments efficiently.
                </p>
                <a href="/methodology" className="inline-flex items-center gap-1.5 mt-4 text-xs font-medium text-primary hover:underline transition-colors" data-testid="link-methodology-instructor-guide">
                  Full methodology documentation →
                </a>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-md bg-muted/50 space-y-2" data-testid="grading-submissions">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Eye className="h-4 w-4 text-primary" />
                    <p className="font-semibold text-sm">Viewing Submissions</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Access all student submissions, selected options, essay text,
                    and AI-generated scores from the Class Admin dashboard. You can
                    review individual essays and compare scores across teams.
                  </p>
                </div>
                <div className="p-4 rounded-md bg-muted/50 space-y-2" data-testid="grading-leaderboard">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Trophy className="h-4 w-4 text-primary" />
                    <p className="font-semibold text-sm">Leaderboard Dynamics</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    The leaderboard ranks teams by combined financial and cultural
                    scores. Students can see their ranking relative to other teams,
                    creating healthy competition. Use the leaderboard as a
                    discussion tool in class to explore different strategic
                    approaches.
                  </p>
                </div>
                <div className="p-4 rounded-md bg-muted/50 space-y-2" data-testid="grading-week-results">
                  <div className="flex items-center gap-2 flex-wrap">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    <p className="font-semibold text-sm">Week Results</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    After each week, students see a detailed results breakdown
                    including metric changes, essay feedback, and narrative
                    consequences of their decisions. You can use these results to
                    facilitate class discussions about strategy and outcomes.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <SectionAnchor id="monitoring" />
          <Card data-testid="card-monitoring">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 flex-wrap text-xl">
                <Eye className="h-5 w-5 text-primary" />
                Monitoring Student Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                The platform provides detailed tracking tools to help you monitor
                student engagement and identify those who may need support.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  {
                    icon: FileText,
                    title: "Content View Tracking",
                    text: "Track which students have read their weekly briefings, reviewed intel articles, and listened to stakeholder voicemails. Students who skip briefing content tend to write weaker essays.",
                  },
                  {
                    icon: PenTool,
                    title: "Decision Submission Monitoring",
                    text: "See at a glance which teams have submitted decisions for the current week and which are still pending. Send targeted reminders to teams that have not yet submitted.",
                  },
                  {
                    icon: Activity,
                    title: "Engagement Metrics",
                    text: "View aggregate participation metrics across your class: login frequency, average time spent on briefings, essay word counts, and advisor credit usage patterns.",
                  },
                  {
                    icon: AlertCircle,
                    title: "Identifying At-Risk Students",
                    text: "Students who consistently miss deadlines, submit minimal essays, or show declining engagement metrics may need additional support. Use the monitoring tools to proactively reach out.",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="p-4 rounded-md bg-muted/50 space-y-2"
                    data-testid={`monitoring-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
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

          <SectionAnchor id="communication" />
          <Card data-testid="card-communication">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 flex-wrap text-xl">
                <Mail className="h-5 w-5 text-primary" />
                Communication Tools
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-muted-foreground">
                Keep your students informed and engaged with built-in
                communication tools that integrate directly with the Class Admin
                dashboard. <strong>Note:</strong> If Privacy Mode is enabled for
                your organization, email and SMS notifications are automatically
                disabled to protect student anonymity. Use your institution's LMS
                or in-class announcements for communication instead.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-md bg-muted/50 space-y-2" data-testid="comm-email">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Send className="h-4 w-4 text-accent" />
                    <p className="font-semibold text-sm">Email Notifications</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Send email notifications to all students or specific teams
                    directly from the dashboard. Powered by <strong>SendGrid</strong>,
                    emails are delivered reliably and can include custom messages,
                    reminders, or announcements. Pre-built templates are available
                    for common scenarios: welcome messages, submission reminders,
                    score updates, and end-of-simulation thank-you notes.
                  </p>
                </div>
                <div className="p-4 rounded-md bg-muted/50 space-y-2" data-testid="comm-sms">
                  <div className="flex items-center gap-2 flex-wrap">
                    <MessageSquare className="h-4 w-4 text-accent" />
                    <p className="font-semibold text-sm">SMS Notifications</p>
                    <Badge variant="secondary">Optional</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    For time-sensitive reminders, enable SMS notifications powered
                    by <strong>Twilio</strong>. Students who have provided a phone
                    number will receive text messages alongside emails. This is
                    particularly useful for deadline reminders and urgent
                    announcements.
                  </p>
                </div>
                <div className="p-4 rounded-md bg-muted/50 space-y-2" data-testid="comm-custom">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Bell className="h-4 w-4 text-accent" />
                    <p className="font-semibold text-sm">Custom Reminders</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Create and schedule custom reminder messages tied to specific
                    simulation weeks. Set reminders to fire automatically when a
                    new week begins, when a deadline approaches, or at a custom
                    date and time. All reminders are logged in the dashboard for
                    your reference.
                  </p>
                </div>
                <div className="p-4 rounded-md bg-muted/50 space-y-2" data-testid="comm-bulk">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Users className="h-4 w-4 text-accent" />
                    <p className="font-semibold text-sm">Bulk Communication</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Target communications by audience: all students, specific
                    teams, students who have not submitted for the current week,
                    or individual students. Combine email and SMS channels for
                    maximum reach. Track delivery and failure counts in the
                    reminders log.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <SectionAnchor id="difficulty" />
          <Card data-testid="card-difficulty">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 flex-wrap text-xl">
                <Gauge className="h-5 w-5 text-primary" />
                Difficulty Levels
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-muted-foreground">
                The simulation offers a 3-tier difficulty framework that allows
                you to tailor the experience to your students' level of
                preparation and course objectives.
              </p>

              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  {
                    level: "Introductory",
                    color: "bg-accent",
                    desc: "Designed for undergraduate survey courses or students with limited business experience. Decisions have clearer trade-offs, metric impacts are more forgiving, and essay expectations are calibrated for foundational critical thinking.",
                  },
                  {
                    level: "Standard",
                    color: "bg-primary",
                    desc: "The default setting for most business courses. Decisions present genuine ambiguity, metric impacts reflect realistic complexity, and essays require substantive analysis with evidence from briefing materials.",
                  },
                  {
                    level: "Advanced",
                    color: "bg-accent",
                    desc: "Built for MBA programs, executive education, or advanced seminar courses. Decisions involve compounding consequences, metric swings are dramatic, and the essay rubric demands sophisticated multi-stakeholder reasoning.",
                  },
                ].map((tier) => (
                  <div
                    key={tier.level}
                    className="p-4 rounded-md bg-muted/50 space-y-2"
                    data-testid={`difficulty-${tier.level.toLowerCase()}`}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`w-2 h-2 rounded-full ${tier.color}`} />
                      <p className="font-semibold text-sm">{tier.level}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{tier.desc}</p>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-md border border-dashed space-y-2" data-testid="difficulty-factors">
                <div className="flex items-center gap-2 flex-wrap">
                  <Layers className="h-4 w-4 text-accent" />
                  <p className="font-semibold text-sm">11 Quantifiable Difficulty Factors</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Difficulty is not a single dial — it is composed of 11 distinct
                  factors including: option ambiguity, metric volatility, essay
                  length requirements, stakeholder complexity, information density,
                  time pressure simulation, financial penalty severity, cultural
                  impact magnitude, advisor guidance clarity, decision
                  interdependence, and cumulative consequence weight. Each factor
                  is calibrated independently across the three tiers, giving you
                  fine-grained control over the challenge level.
                </p>
              </div>

              <div className="p-4 rounded-md bg-muted/50 space-y-2" data-testid="difficulty-choosing">
                <div className="flex items-center gap-2 flex-wrap">
                  <Settings className="h-4 w-4 text-primary" />
                  <p className="font-semibold text-sm">Choosing the Right Level</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Consider your students' prior coursework, the learning
                  objectives of your course, and whether the simulation is being
                  used as a primary assessment tool or a supplementary exercise.
                  Most undergraduate courses perform well at Standard. If your
                  students have completed foundational business courses and are
                  comfortable with case analysis, Standard is appropriate.
                  Advanced is recommended only for students with significant
                  prior experience in strategic decision-making.
                </p>
              </div>
            </CardContent>
          </Card>

          <SectionAnchor id="sandbox" />
          <Card data-testid="card-sandbox">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 flex-wrap text-xl">
                <FlaskConical className="h-5 w-5 text-primary" />
                Student Sandbox Mode
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <p className="text-sm text-muted-foreground">
                Sandbox Mode allows you to experience the simulation exactly as
                your students will, without affecting real class data.
              </p>
              <div className="flex items-start gap-4 flex-wrap" data-testid="sandbox-preview">
                <NumberCircle n={1} />
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="font-semibold">Preview the Student Experience</p>
                  <p className="text-sm text-muted-foreground">
                    From the Class Admin dashboard, click the <strong>Enter
                    Sandbox</strong> button. The platform creates a temporary test
                    student account and test team, placing you into the full student
                    interface. You will see the dashboard, briefings, decisions, and
                    all other student-facing features exactly as they appear to your
                    class.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 flex-wrap" data-testid="sandbox-controls">
                <NumberCircle n={2} />
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="font-semibold">Navigate Weeks Freely</p>
                  <p className="text-sm text-muted-foreground">
                    While in sandbox mode, you can advance or rewind weeks using
                    the sandbox controls. This lets you preview content for any
                    week without waiting for the simulation to progress naturally.
                    Submit test decisions and see how the AI grading engine responds
                    to different essay qualities.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 flex-wrap" data-testid="sandbox-use-cases">
                <NumberCircle n={3} />
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="font-semibold">When to Use Sandbox Mode</p>
                  <p className="text-sm text-muted-foreground">
                    Use sandbox mode before the semester begins to familiarize
                    yourself with the content and pacing. Revisit it during the
                    semester to preview upcoming weeks, understand what your
                    students are experiencing, and prepare discussion questions.
                    When you are finished, exit sandbox mode to return to the
                    Class Admin view — all test data is automatically cleaned up.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <SectionAnchor id="tips" />
          <Card data-testid="card-tips">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 flex-wrap text-xl">
                <Lightbulb className="h-5 w-5 text-accent" />
                Tips for Instructors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  {
                    icon: FlaskConical,
                    tip: "Run the Simulation Yourself First",
                    detail: "Use sandbox mode to complete all 8 weeks before your students begin. This gives you firsthand understanding of the content, decision difficulty, and AI grading quality — making you a much more effective facilitator.",
                  },
                  {
                    icon: Calendar,
                    tip: "Set Clear Weekly Deadlines",
                    detail: "Establish firm submission deadlines for each week and communicate them in your syllabus. The simulation works best when all teams submit within the same window, enabling meaningful leaderboard competition.",
                  },
                  {
                    icon: MessageSquare,
                    tip: "Discuss AI Ethics Themes",
                    detail: "The simulation raises rich questions about workforce displacement, algorithmic fairness, surveillance, and the social contract between employers and employees. Use these as springboards for in-class discussions.",
                  },
                  {
                    icon: Trophy,
                    tip: "Leverage the Leaderboard",
                    detail: "The leaderboard drives healthy competition between teams. Share rankings in class, celebrate top performers, and use score differences to explore why different strategies produce different outcomes.",
                  },
                  {
                    icon: Award,
                    tip: "Review Essay Feedback",
                    detail: "Read the AI-generated essay feedback for a sample of submissions each week. This helps you calibrate your own grading expectations, identify common student misconceptions, and prepare targeted instruction.",
                  },
                  {
                    icon: Users,
                    tip: "Optimize Team Size",
                    detail: "The simulation works best with 3-5 students per team. Smaller teams ensure every member contributes meaningfully to discussions. Larger teams may lead to free-riding. Consider odd-numbered teams to avoid decision deadlocks.",
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
                <div className="p-4 rounded-md bg-muted/50 space-y-2" data-testid="help-technical">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Mail className="h-4 w-4 text-accent" />
                    <p className="font-semibold text-sm">Technical Support</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    For bugs, platform errors, or account issues, email{" "}
                    <a
                      href="mailto:support@futureworkacademy.com"
                      className="underline font-medium"
                      data-testid="link-support-email"
                    >
                      support@futureworkacademy.com
                    </a>{" "}
                    with a description of the issue and screenshots if available.
                    Our team responds within 24 hours on business days.
                  </p>
                </div>
                <div className="p-4 rounded-md bg-muted/50 space-y-2" data-testid="help-platform">
                  <div className="flex items-center gap-2 flex-wrap">
                    <MessageSquare className="h-4 w-4 text-accent" />
                    <p className="font-semibold text-sm">Platform Questions</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    For general "how do I...?" questions about the simulation, use
                    the <strong>AI Q&A Assistant</strong> available within the app.
                    It can answer most questions about navigation, features, and
                    classroom integration instantly.
                  </p>
                </div>
                <div className="p-4 rounded-md bg-muted/50 space-y-2" data-testid="help-contact">
                  <div className="flex items-center gap-2 flex-wrap">
                    <GraduationCap className="h-4 w-4 text-primary" />
                    <p className="font-semibold text-sm">Contact the Creator</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    For partnership inquiries, curriculum integration questions,
                    or to schedule a personal walkthrough, reach out to{" "}
                    <strong>Doug Mitchell</strong>, platform creator, at{" "}
                    <a
                      href="mailto:doug@futureworkacademy.com"
                      className="underline font-medium"
                      data-testid="link-doug-email"
                    >
                      doug@futureworkacademy.com
                    </a>
                    . Doug is available for guest lectures and faculty workshops.
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
