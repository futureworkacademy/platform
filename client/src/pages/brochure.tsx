import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AppFooter } from "@/components/app-footer";
import { ThemeToggle } from "@/components/theme-toggle";
import { Link } from "wouter";
import logoForLight from "@assets/logo-horizontal.png";
import logoForDark from "@assets/logo-white.png";
import { generateBrochurePDF } from "@/lib/brochure-pdf-export";
import {
  ArrowLeft,
  Download,
  Brain,
  Users,
  BarChart3,
  Shield,
  Target,
  TrendingUp,
  GraduationCap,
  Lightbulb,
  CheckCircle,
  Zap,
  Clock,
  Award,
  MessageSquare,
  BookOpen
} from "lucide-react";

const FEATURES = [
  {
    icon: Brain,
    title: "AI-Powered Evaluation",
    desc: "Student decisions are assessed by LLM-driven grading that mirrors real executive feedback."
  },
  {
    icon: Users,
    title: "17 Dynamic Characters",
    desc: "Employees with unique personalities, influence levels, and relationships that react to every choice."
  },
  {
    icon: BarChart3,
    title: "Dual Scorecard",
    desc: "Teams are ranked on both financial performance and cultural health, rewarding balanced leadership."
  },
  {
    icon: MessageSquare,
    title: "Phone-a-Friend Advisors",
    desc: "9 specialized advisors (CEO coach, CFO, HR expert, and more) provide AI-generated strategic counsel."
  },
  {
    icon: Clock,
    title: "8-Week Curriculum Arc",
    desc: "A structured semester-long journey from initial AI assessment through full organizational transformation."
  },
  {
    icon: Shield,
    title: "Privacy-First Design",
    desc: "Privacy Mode enables anonymous enrollment, letting students participate without sharing personal data."
  },
];

const OUTCOMES = [
  "Develop strategic thinking for AI-era leadership decisions",
  "Practice stakeholder management with realistic characters",
  "Build change management skills through iterative decisions",
  "Learn data-driven decision-making with real-time analytics",
  "Experience cross-functional team dynamics and collaboration",
  "Understand the tension between financial results and culture",
];

export default function Brochure() {
  return (
    <div className="min-h-screen bg-background" data-testid="page-brochure">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2 px-6 py-3">
          <div className="flex items-center gap-3 flex-wrap">
            <Link href="/">
              <img src={logoForLight} alt="Future Work Academy" className="h-8 dark:hidden" />
              <img src={logoForDark} alt="Future Work Academy" className="h-8 hidden dark:block" />
            </Link>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Link href="/for-educators">
              <Button variant="ghost" size="sm" data-testid="link-for-educators">
                <ArrowLeft className="w-4 h-4 mr-1" />
                For Educators
              </Button>
            </Link>
            <Button
              onClick={() => generateBrochurePDF()}
              variant="default"
              size="sm"
              data-testid="button-download-pdf"
            >
              <Download className="w-4 h-4 mr-1" />
              Download PDF
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-12">
        <section className="text-center space-y-4" data-testid="section-hero">
          <p className="text-sm font-semibold tracking-widest uppercase text-muted-foreground">
            Future Work Academy
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Prepare Leaders for the AI-Driven Workplace
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
            An immersive business simulation where graduate students navigate 8 weeks of AI
            transformation, managing employee anxiety, strategic trade-offs, and organizational
            culture at a fictional manufacturing company.
          </p>
        </section>

        <section data-testid="section-problem" className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-1 rounded-full bg-destructive" />
            <h2 className="text-xl font-bold">The Problem</h2>
          </div>
          <Card>
            <CardContent className="p-6 space-y-3">
              <p className="text-muted-foreground leading-relaxed">
                AI is reshaping every industry, yet business schools lack hands-on tools
                to teach students how to <span className="font-semibold text-foreground">lead through this transition</span>.
                Traditional case studies are static, detached from the emotional and political
                realities of workforce transformation.
              </p>
              <div className="grid sm:grid-cols-3 gap-4 pt-2">
                {[
                  { stat: "72%", label: "of executives say AI adoption is their top strategic priority" },
                  { stat: "63%", label: "of employees report anxiety about AI replacing their roles" },
                  { stat: "< 15%", label: "of MBA programs offer experiential AI leadership training" },
                ].map((item) => (
                  <div key={item.stat} className="text-center p-3 rounded-md bg-muted/50">
                    <p className="text-2xl font-bold text-primary">{item.stat}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section data-testid="section-solution" className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-1 rounded-full bg-primary" />
            <h2 className="text-xl font-bold">The Solution</h2>
          </div>
          <Card>
            <CardContent className="p-6 space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Future Work Academy places students in the role of <span className="font-semibold text-foreground">Chief Transformation Officer</span> at
                Apex Manufacturing, a mid-size company facing competitive pressure to adopt AI.
                Over 8 simulated weeks, student teams make decisions that impact finances,
                employee morale, and organizational culture.
              </p>
              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Realistic Scenarios</p>
                    <p className="text-xs text-muted-foreground">Each week presents new AI adoption challenges with multi-stakeholder implications.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Competitive Leaderboard</p>
                    <p className="text-xs text-muted-foreground">Teams compete on a dual scorecard balancing financial returns and cultural health.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <GraduationCap className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-sm">3-Tier Difficulty</p>
                    <p className="text-xs text-muted-foreground">Introductory, Standard, and Advanced modes accommodate undergrad through executive education.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Instant Setup</p>
                    <p className="text-xs text-muted-foreground">Privacy Mode enables anonymous enrollment; magic invite links let students join in seconds.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section data-testid="section-features" className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-1 rounded-full bg-primary" />
            <h2 className="text-xl font-bold">Key Features</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <Card key={f.title}>
                <CardContent className="p-5 space-y-2">
                  <div className="flex items-center gap-2">
                    <f.icon className="w-5 h-5 text-primary shrink-0" />
                    <h3 className="font-semibold text-sm">{f.title}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section data-testid="section-outcomes" className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-1 rounded-full bg-success dark:bg-success" />
            <h2 className="text-xl font-bold">Expected Student Outcomes</h2>
          </div>
          <Card>
            <CardContent className="p-6">
              <div className="grid sm:grid-cols-2 gap-3">
                {OUTCOMES.map((o, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
                    <p className="text-sm text-muted-foreground">{o}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section data-testid="section-audience" className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-1 rounded-full bg-primary" />
            <h2 className="text-xl font-bold">Who This Is For</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: GraduationCap, title: "MBA & Graduate Programs", desc: "Strategy, management, and organizational behavior courses" },
              { icon: BookOpen, title: "Undergraduate Business", desc: "Introductory-level exposure to AI strategy and change management" },
              { icon: Award, title: "Executive Education", desc: "Advanced scenarios for mid-career professionals and leadership programs" },
            ].map((a) => (
              <Card key={a.title}>
                <CardContent className="p-5 text-center space-y-2">
                  <a.icon className="w-8 h-8 text-primary mx-auto" />
                  <h3 className="font-semibold text-sm">{a.title}</h3>
                  <p className="text-xs text-muted-foreground">{a.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section data-testid="section-cta" className="text-center space-y-4 pb-4">
          <h2 className="text-xl font-bold">Ready to Transform Your Classroom?</h2>
          <p className="text-muted-foreground text-sm max-w-lg mx-auto">
            Request a 30-day evaluator demo or contact us to discuss curriculum integration.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/for-educators">
              <Button data-testid="button-try-demo">
                <Target className="w-4 h-4 mr-1" />
                Try the Demo
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => generateBrochurePDF()}
              data-testid="button-download-pdf-cta"
            >
              <Download className="w-4 h-4 mr-1" />
              Download This Page as PDF
            </Button>
          </div>
        </section>
      </main>

      <AppFooter />
    </div>
  );
}
