import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AppFooter } from "@/components/app-footer";
import { ThemeToggle } from "@/components/theme-toggle";
import { Link } from "wouter";
import { BrandLogo } from "@/components/brand-logo";
import heroImg from "@assets/generated_images/hero-boardroom.png";
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
  BookOpen,
  ChevronDown,
  ArrowRight,
  Eye,
  Sparkles
} from "lucide-react";

function useInView() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
      { threshold: 0.15 }
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

const FEATURES = [
  {
    icon: Brain,
    title: "AI-Powered Evaluation",
    desc: "Student decisions are assessed by LLM-driven grading that mirrors real executive feedback.",
    accent: "text-blue-500",
    bg: "bg-blue-500/10"
  },
  {
    icon: Users,
    title: "17 Dynamic Characters",
    desc: "Employees with unique personalities, influence levels, and relationships that react to every choice.",
    accent: "text-purple-500",
    bg: "bg-purple-500/10"
  },
  {
    icon: BarChart3,
    title: "Dual Scorecard",
    desc: "Teams are ranked on both financial performance and cultural health, rewarding balanced leadership.",
    accent: "text-green-500",
    bg: "bg-green-500/10"
  },
  {
    icon: MessageSquare,
    title: "Phone-a-Friend Advisors",
    desc: "9 specialized advisors (CEO coach, CFO, HR expert, and more) provide AI-generated strategic counsel.",
    accent: "text-amber-500",
    bg: "bg-amber-500/10"
  },
  {
    icon: Clock,
    title: "8-Week Curriculum Arc",
    desc: "A structured semester-long journey from initial AI assessment through full organizational transformation.",
    accent: "text-sky-500",
    bg: "bg-sky-500/10"
  },
  {
    icon: Shield,
    title: "Privacy-First Design",
    desc: "Privacy Mode enables anonymous enrollment, letting students participate without sharing personal data.",
    accent: "text-rose-500",
    bg: "bg-rose-500/10"
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

const AUDIENCES = [
  { icon: GraduationCap, title: "MBA & Graduate Programs", desc: "Strategy, management, and organizational behavior courses seeking experiential AI leadership tools.", accent: "text-blue-500", bg: "bg-blue-500/10" },
  { icon: BookOpen, title: "Undergraduate Business", desc: "Introductory-level exposure to AI strategy and change management with scaffolded difficulty.", accent: "text-green-500", bg: "bg-green-500/10" },
  { icon: Award, title: "Executive Education", desc: "Advanced scenarios for mid-career professionals and leadership development programs.", accent: "text-purple-500", bg: "bg-purple-500/10" },
];

export default function Brochure() {
  useEffect(() => {
    document.title = "Program Brochure | Future Work Academy";
  }, []);

  return (
    <div className="min-h-screen bg-background scroll-smooth" data-testid="page-brochure">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex items-center justify-between gap-2 px-6 py-3">
          <div className="flex items-center gap-3 flex-wrap">
            <Link href="/">
              <BrandLogo height="h-10" data-testid="img-header-logo" />
            </Link>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
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

      <main>
        <section className="relative min-h-[85vh] flex items-center justify-center px-4 overflow-hidden" data-testid="section-hero">
          <div className="absolute inset-0 z-0">
            <img src={heroImg} alt="" className="w-full h-full object-cover opacity-15 dark:opacity-10" />
            <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
          </div>
          <div className="relative z-10 container mx-auto max-w-5xl text-center space-y-8">
            <FadeInSection>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Sparkles className="h-3.5 w-3.5" />
                Program Brochure
              </div>
            </FadeInSection>
            <FadeInSection delay={150}>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.1]" data-testid="text-hero-headline">
                Prepare Leaders for the<br />
                <span className="text-primary">AI-Driven Workplace</span>
              </h1>
            </FadeInSection>
            <FadeInSection delay={300}>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                An immersive business simulation where students navigate 8 weeks of AI
                transformation, managing employee anxiety, strategic trade-offs, and organizational
                culture at a fictional manufacturing company.
              </p>
            </FadeInSection>
            <FadeInSection delay={450}>
              <div className="flex flex-wrap justify-center gap-4 pt-2">
                <Link href="/for-educators#demo">
                  <Button size="lg" data-testid="button-try-demo">
                    <Target className="mr-2 h-4 w-4" />
                    Request a Demo
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => generateBrochurePDF()}
                  data-testid="button-download-pdf-hero"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download as PDF
                </Button>
              </div>
            </FadeInSection>
            <FadeInSection delay={600}>
              <div className="flex flex-wrap justify-center gap-6 sm:gap-10 pt-8 text-sm">
                {[
                  { value: "8", label: "Weeks" },
                  { value: "17", label: "Characters" },
                  { value: "3", label: "Difficulty Tiers" },
                  { value: "9", label: "Expert Advisors" },
                  { value: "100%", label: "Transparent Rubrics" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-muted-foreground text-xs uppercase tracking-wider mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </FadeInSection>
            <FadeInSection delay={750}>
              <div className="pt-6 animate-bounce">
                <ChevronDown className="h-6 w-6 text-muted-foreground mx-auto" />
              </div>
            </FadeInSection>
          </div>
        </section>

        <section className="py-24 sm:py-32 px-4 bg-card/30" data-testid="section-problem">
          <div className="container mx-auto max-w-5xl">
            <FadeInSection>
              <div className="text-center mb-16">
                <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">The Challenge</p>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
                  The leadership gap<br />is widening.
                </h2>
                <p className="text-muted-foreground mt-6 max-w-2xl mx-auto text-lg leading-relaxed">
                  AI is reshaping every industry, yet business schools lack hands-on tools
                  to teach students how to lead through this transition.
                  Traditional case studies are static, detached from the emotional and political
                  realities of workforce transformation.
                </p>
              </div>
            </FadeInSection>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { stat: "72%", label: "of executives say AI adoption is their top strategic priority" },
                { stat: "63%", label: "of employees report anxiety about AI replacing their roles" },
                { stat: "Few", label: "MBA programs offer experiential AI leadership simulation tools" },
              ].map((item, i) => (
                <FadeInSection key={item.stat} delay={i * 150}>
                  <Card className="text-center h-full">
                    <CardContent className="pt-8 pb-6 px-6">
                      <p className="text-4xl sm:text-5xl font-bold text-primary mb-3">{item.stat}</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.label}</p>
                    </CardContent>
                  </Card>
                </FadeInSection>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 sm:py-32 px-4" data-testid="section-solution">
          <div className="container mx-auto max-w-6xl">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <FadeInSection>
                <div>
                  <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">The Solution</p>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.1]">
                    Immersive. Consequential.<br />Research-backed.
                  </h2>
                  <p className="text-muted-foreground mt-6 text-lg leading-relaxed">
                    Future Work Academy places students in the role of Chief Transformation Officer at
                    Apex Manufacturing, a mid-size company facing competitive pressure to adopt AI.
                    Over 8 simulated weeks, student teams make decisions that impact finances,
                    employee morale, and organizational culture.
                  </p>
                  <div className="mt-8 space-y-4">
                    {[
                      { icon: Lightbulb, title: "Realistic Scenarios", desc: "Each week presents new AI adoption challenges with multi-stakeholder implications." },
                      { icon: TrendingUp, title: "Competitive Leaderboard", desc: "Teams compete on a dual scorecard balancing financial returns and cultural health." },
                      { icon: GraduationCap, title: "3-Tier Difficulty", desc: "Introductory, Standard, and Advanced modes accommodate undergrad through executive education." },
                      { icon: Zap, title: "Instant Setup", desc: "Privacy Mode enables anonymous enrollment; magic invite links let students join in seconds." },
                    ].map((item) => (
                      <div key={item.title} className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <item.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{item.title}</p>
                          <p className="text-sm text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeInSection>
              <FadeInSection delay={200}>
                <div className="relative">
                  <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-6">
                    <div className="text-center">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
                        <Eye className="h-3 w-3" />
                        Simulation Preview
                      </div>
                      <h3 className="text-lg font-bold text-foreground">Week 3: Union Storm Brewing</h3>
                      <p className="text-sm text-muted-foreground mt-1">The United Workers Alliance files a formal grievance...</p>
                    </div>
                    <div className="space-y-3">
                      {[
                        { label: "Financial Impact", value: "High", color: "text-amber-500" },
                        { label: "Employee Morale", value: "Critical", color: "text-rose-500" },
                        { label: "Strategic Complexity", value: "Advanced", color: "text-blue-500" },
                      ].map((metric) => (
                        <div key={metric.label} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{metric.label}</span>
                          <span className={`font-semibold ${metric.color}`}>{metric.value}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-border pt-4 text-center">
                      <p className="text-xs text-muted-foreground">Students face real consequences for every decision</p>
                    </div>
                  </div>
                </div>
              </FadeInSection>
            </div>
          </div>
        </section>

        <section className="py-24 sm:py-32 px-4 bg-card/30" data-testid="section-features">
          <div className="container mx-auto max-w-5xl">
            <FadeInSection>
              <div className="text-center mb-16">
                <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">Platform</p>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
                  Everything you need.<br />Nothing you don't.
                </h2>
                <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg">
                  A comprehensive simulation platform with AI-powered grading, dynamic characters,
                  and full instructor control.
                </p>
              </div>
            </FadeInSection>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURES.map((f, i) => (
                <FadeInSection key={f.title} delay={i * 100}>
                  <Card className="h-full">
                    <CardContent className="pt-8 pb-6 px-6">
                      <div className={`h-12 w-12 rounded-xl ${f.bg} flex items-center justify-center mb-5`}>
                        <f.icon className={`h-6 w-6 ${f.accent}`} />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">{f.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                    </CardContent>
                  </Card>
                </FadeInSection>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 sm:py-32 px-4" data-testid="section-outcomes">
          <div className="container mx-auto max-w-5xl">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <FadeInSection>
                <div>
                  <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">Impact</p>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.1]">
                    Skills that transfer<br />to the real world.
                  </h2>
                  <p className="text-muted-foreground mt-6 text-lg leading-relaxed">
                    Students don't just learn theory — they develop the judgment, resilience,
                    and analytical skills that employers demand from day one.
                  </p>
                </div>
              </FadeInSection>
              <FadeInSection delay={200}>
                <div className="space-y-4">
                  {OUTCOMES.map((o, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 rounded-lg bg-card border border-border">
                      <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      </div>
                      <p className="text-sm text-foreground leading-relaxed pt-1">{o}</p>
                    </div>
                  ))}
                </div>
              </FadeInSection>
            </div>
          </div>
        </section>

        <section className="py-24 sm:py-32 px-4 bg-card/30" data-testid="section-audience">
          <div className="container mx-auto max-w-5xl">
            <FadeInSection>
              <div className="text-center mb-16">
                <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">Audience</p>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
                  Built for every level<br />of business education.
                </h2>
                <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg">
                  Three difficulty tiers ensure the simulation works across undergraduate,
                  graduate, and executive programs.
                </p>
              </div>
            </FadeInSection>
            <div className="grid sm:grid-cols-3 gap-6">
              {AUDIENCES.map((a, i) => (
                <FadeInSection key={a.title} delay={i * 150}>
                  <Card className="h-full text-center">
                    <CardContent className="pt-8 pb-6 px-6">
                      <div className={`h-14 w-14 rounded-xl ${a.bg} flex items-center justify-center mx-auto mb-5`}>
                        <a.icon className={`h-7 w-7 ${a.accent}`} />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">{a.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{a.desc}</p>
                    </CardContent>
                  </Card>
                </FadeInSection>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 sm:py-32 px-4" data-testid="section-cta">
          <div className="container mx-auto max-w-3xl text-center">
            <FadeInSection>
              <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">Get Started</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
                Ready to transform<br />your classroom?
              </h2>
              <p className="text-muted-foreground mt-6 max-w-xl mx-auto text-lg leading-relaxed">
                Request a 30-day evaluator demo or download this brochure to share
                with your department.
              </p>
            </FadeInSection>
            <FadeInSection delay={200}>
              <div className="flex flex-wrap justify-center gap-4 mt-10">
                <Link href="/for-educators#demo">
                  <Button size="lg" data-testid="button-try-demo-cta">
                    <Target className="mr-2 h-4 w-4" />
                    Request a Demo
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => generateBrochurePDF()}
                  data-testid="button-download-pdf-cta"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download This Page as PDF
                </Button>
              </div>
            </FadeInSection>
            <FadeInSection delay={350}>
              <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
                <Link href="/for-students">
                  <span className="hover:text-foreground transition-colors cursor-pointer flex items-center gap-1" data-testid="link-for-students">
                    For Students <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
                <Link href="/about">
                  <span className="hover:text-foreground transition-colors cursor-pointer flex items-center gap-1" data-testid="link-about">
                    About Us <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
                <Link href="/for-educators">
                  <span className="hover:text-foreground transition-colors cursor-pointer flex items-center gap-1" data-testid="link-educators">
                    Educator Details <ArrowRight className="h-3.5 w-3.5" />
                  </span>
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
