import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { AppFooter } from "@/components/app-footer";
import { useState, useEffect, useRef } from "react";
import { 
  TrendingUp, 
  Users, 
  Bot, 
  Shield, 
  Target,
  ArrowRight,
  BarChart3,
  Zap,
  Scale,
  Globe,
  Lightbulb,
  HeartHandshake,
  Landmark,
  Brain,
  Eye,
  CheckCircle,
  Phone,
  GraduationCap,
  FileText,
  Lock,
  MessageSquare,
  Activity,
  Sparkles,
  ChevronDown,
  Star
} from "lucide-react";
import logoForLight from "@assets/logo-horizontal.png";
import logoForDark from "@assets/logo-white.png";
import heroImage from "@assets/generated_images/hero-boardroom.png";
import charactersImage from "@assets/generated_images/characters-team.png";
import transparencyImage from "@assets/generated_images/transparency-rubric.png";

const COLOR_MAP: Record<string, { bg: string; text: string }> = {
  primary: { bg: "bg-primary/10", text: "text-primary" },
  destructive: { bg: "bg-destructive/10", text: "text-destructive" },
  warning: { bg: "bg-amber-500/10", text: "text-amber-500" },
  accent: { bg: "bg-accent/50", text: "text-accent-foreground" },
  "chart-2": { bg: "bg-emerald-500/10", text: "text-emerald-500" },
  "chart-3": { bg: "bg-sky-500/10", text: "text-sky-500" },
};

const challengeSets = [
  [
    { icon: Bot, title: "Automation Financing", description: "Secure bank debt to fund robotics and AI development", colorClass: "primary" },
    { icon: Users, title: "Workforce Displacement", description: "Manage layoffs, reskilling programs, and employee anxiety about job security", colorClass: "destructive" },
    { icon: Shield, title: "Union Relations", description: "Prevent unionization or manage collective bargaining if sentiment reaches 75%", colorClass: "warning" },
    { icon: Target, title: "Gen Z Management", description: "Address leadership pipeline crisis as young workers refuse management roles", colorClass: "accent" },
    { icon: TrendingUp, title: "Financial Performance", description: "Balance debt service, automation ROI, and revenue while managing costs", colorClass: "chart-2" },
    { icon: BarChart3, title: "Cultural Health", description: "Maintain employee morale and adaptability through rapid organizational change", colorClass: "chart-3" },
  ],
  [
    { icon: Scale, title: "Ethical AI Decisions", description: "Navigate the moral implications of replacing human workers with intelligent systems", colorClass: "primary" },
    { icon: Globe, title: "Global Competition", description: "Respond to overseas competitors who have already embraced full automation", colorClass: "destructive" },
    { icon: Lightbulb, title: "Innovation vs. Stability", description: "Balance disruptive technology adoption with operational continuity", colorClass: "warning" },
    { icon: HeartHandshake, title: "Stakeholder Trust", description: "Maintain credibility with employees, investors, and community partners", colorClass: "accent" },
    { icon: Landmark, title: "Regulatory Compliance", description: "Anticipate and adapt to evolving labor laws and AI governance policies", colorClass: "chart-2" },
    { icon: Brain, title: "Knowledge Transfer", description: "Preserve institutional knowledge as experienced workers exit the organization", colorClass: "chart-3" },
  ],
];

const WEEK_TITLES = [
  { num: 1, title: "The Automation Imperative", desc: "Evaluate a $2M robotics investment proposal" },
  { num: 2, title: "The Talent Pipeline Crisis", desc: "Address Gen Z leadership vacuum and retention" },
  { num: 3, title: "Union Storm Brewing", desc: "Navigate collective bargaining and labor unrest" },
  { num: 4, title: "The First Displacement", desc: "Manage the human cost of automation rollout" },
  { num: 5, title: "The Manager Exodus", desc: "Respond to mid-level leadership departures" },
  { num: 6, title: "Debt Day of Reckoning", desc: "Balance financial obligations with workforce needs" },
  { num: 7, title: "The Competitive Response", desc: "React to competitors' aggressive automation moves" },
  { num: 8, title: "Strategic Direction", desc: "Chart the long-term future of Apex Manufacturing" },
];

const RUBRIC_CRITERIA = [
  { name: "Strategic Thinking & Financial Analysis", points: 25, desc: "Quality of reasoning, use of NPV, ROI, and payback period data" },
  { name: "Stakeholder Awareness & Management", points: 25, desc: "Recognition of diverse perspectives — board, employees, union, customers" },
  { name: "Risk Assessment & Mitigation", points: 25, desc: "Identification of operational, financial, and cultural risks" },
  { name: "Research & Evidence Application", points: 25, desc: "Citation of Intel Articles, case studies, and industry benchmarks" },
];

const EDUCATOR_TOOLS = [
  { icon: Sparkles, title: "AI-Powered Grading", desc: "LLM rubric evaluation with instructor override" },
  { icon: MessageSquare, title: "Student Feedback", desc: "6-dimension survey with AI-analyzed results" },
  { icon: FileText, title: "Content Editor", desc: "Manage briefings, decisions, and research materials" },
  { icon: Lock, title: "Privacy Mode", desc: "Anonymous enrollment — no PII collection required" },
  { icon: BarChart3, title: "Optional Curved Scoring", desc: "Opt-in Z-score normalization across the class" },
  { icon: Activity, title: "Activity Logs", desc: "Track every student action and engagement metric" },
];

function useInView() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
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

export default function Landing() {
  const [currentSet, setCurrentSet] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSet((prev) => (prev + 1) % challengeSets.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background scroll-smooth">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <img 
            src={logoForLight} 
            alt="Future Work Academy" 
            className="h-16 w-auto block dark:hidden"
            data-testid="img-header-logo-light"
          />
          <img 
            src={logoForDark} 
            alt="Future Work Academy" 
            className="h-16 w-auto hidden dark:block"
            data-testid="img-header-logo-dark"
          />
          <div className="flex items-center gap-5">
            <a 
              href="/about"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:inline"
              data-testid="link-about"
            >
              About FWA
            </a>
            <a 
              href="/for-students"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:inline"
              data-testid="link-student-trial"
            >
              Student?
            </a>
            <a 
              href="/for-educators"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:inline"
              data-testid="link-educator-inquiry"
            >
              Educator?
            </a>
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

        <section className="relative min-h-[90vh] flex items-center justify-center px-4 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              src={heroImage} 
              alt="" 
              className="w-full h-full object-cover opacity-20 dark:opacity-15"
              data-testid="img-hero-background"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
          </div>
          <div className="relative z-10 container mx-auto max-w-5xl text-center space-y-8">
            <FadeInSection>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Zap className="h-3.5 w-3.5" />
                Advanced AI Business Simulation
              </div>
            </FadeInSection>
            <FadeInSection delay={150}>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.1]" data-testid="text-hero-headline">
                Navigate the
                <br />
                <span className="text-primary">AI Revolution.</span>
              </h1>
            </FadeInSection>
            <FadeInSection delay={300}>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Lead Apex Manufacturing through 8 weeks of strategic decisions. 
                Balance automation, workforce transformation, and cultural health. 
                Every rubric visible. Every criterion transparent.
              </p>
            </FadeInSection>
            <FadeInSection delay={450}>
              <div className="flex flex-wrap justify-center gap-4 pt-2">
                <a href="/week-1">
                  <Button size="lg" data-testid="button-explore-week1">
                    Explore Week 1
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </a>
                <a href="/for-educators">
                  <Button size="lg" variant="outline" data-testid="button-for-educators-hero">
                    For Educators
                  </Button>
                </a>
              </div>
            </FadeInSection>
            <FadeInSection delay={600}>
              <div className="flex flex-wrap justify-center gap-6 sm:gap-10 pt-8 text-sm" data-testid="stats-ribbon">
                {[
                  { value: "8", label: "Weeks" },
                  { value: "17", label: "Characters" },
                  { value: "9", label: "Advisors" },
                  { value: "4", label: "Rubric Criteria" },
                  { value: "100%", label: "Transparent" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-muted-foreground text-xs uppercase tracking-wider mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </FadeInSection>
            <FadeInSection delay={750}>
              <div className="pt-8 animate-bounce">
                <ChevronDown className="h-6 w-6 text-muted-foreground mx-auto" />
              </div>
            </FadeInSection>
          </div>
        </section>

        <section className="py-24 sm:py-32 px-4 bg-card/30">
          <div className="container mx-auto max-w-5xl">
            <FadeInSection>
              <div className="text-center mb-16">
                <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">The Simulation</p>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight" data-testid="text-challenges-headline">
                  Real challenges.<br />Real consequences.
                </h2>
                <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
                  Every week brings new strategic dilemmas. Your decisions ripple across the organization.
                </p>
              </div>
            </FadeInSection>
            <div className="relative min-h-[400px]">
              {challengeSets.map((challenges, setIndex) => (
                <div
                  key={setIndex}
                  className={`grid md:grid-cols-3 gap-6 transition-all duration-700 ease-in-out ${
                    setIndex === currentSet
                      ? "opacity-100"
                      : "opacity-0 absolute inset-0 pointer-events-none"
                  }`}
                >
                  {challenges.map((challenge, index) => {
                    const IconComponent = challenge.icon;
                    const colors = COLOR_MAP[challenge.colorClass] || COLOR_MAP.primary;
                    return (
                      <Card key={index} className="bg-card">
                        <CardHeader>
                          <div className={`h-10 w-10 rounded-md ${colors.bg} flex items-center justify-center mb-2`}>
                            <IconComponent className={`h-5 w-5 ${colors.text}`} />
                          </div>
                          <CardTitle className="text-lg">{challenge.title}</CardTitle>
                          <CardDescription>{challenge.description}</CardDescription>
                        </CardHeader>
                      </Card>
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-2 mt-8">
              {challengeSets.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSet(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentSet ? "bg-primary w-8" : "bg-muted-foreground/30 w-2"
                  }`}
                  data-testid={`button-challenge-set-${index}`}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 sm:py-32 px-4">
          <div className="container mx-auto max-w-5xl">
            <FadeInSection>
              <div className="text-center mb-16">
                <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">The Journey</p>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight" data-testid="text-journey-headline">
                  8 weeks. One company.<br />Every decision matters.
                </h2>
                <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
                  A semester-long arc from initial AI assessment through full organizational transformation.
                </p>
              </div>
            </FadeInSection>
            <div className="relative">
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border hidden md:block" />
              <div className="space-y-6 md:space-y-0">
                {WEEK_TITLES.map((week, i) => (
                  <FadeInSection key={week.num} delay={i * 80}>
                    <div className={`md:flex items-center gap-8 md:py-6 ${i % 2 === 0 ? "" : "md:flex-row-reverse"}`}>
                      <div className={`flex-1 ${i % 2 === 0 ? "md:text-right" : "md:text-left"}`}>
                        <a href={`/week-${week.num}`} className="group block" data-testid={`link-week-${week.num}`}>
                          <div className="inline-block p-5 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300">
                            <div className="text-xs font-medium text-primary uppercase tracking-wider mb-1">Week {week.num}</div>
                            <div className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">{week.title}</div>
                            <div className="text-sm text-muted-foreground mt-1">{week.desc}</div>
                          </div>
                        </a>
                      </div>
                      <div className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold text-sm shrink-0 z-10 shadow-md">
                        {week.num}
                      </div>
                      <div className="flex-1" />
                    </div>
                  </FadeInSection>
                ))}
              </div>
              <FadeInSection delay={700}>
                <div className="text-center mt-10">
                  <a href="/week-0">
                    <Button variant="outline" size="lg" data-testid="button-start-orientation">
                      Start with Orientation
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </a>
                </div>
              </FadeInSection>
            </div>
          </div>
        </section>

        <section className="py-24 sm:py-32 px-4 bg-card/30">
          <div className="container mx-auto max-w-6xl">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <FadeInSection>
                <div>
                  <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">The People</p>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.1]" data-testid="text-characters-headline">
                    Meet the people whose futures depend on you.
                  </h2>
                  <p className="text-muted-foreground mt-6 text-lg leading-relaxed">
                    17 characters with rich backstories, professional histories, and quantifiable personality traits 
                    that actually change how the simulation plays out.
                  </p>
                  <div className="grid grid-cols-2 gap-4 mt-8">
                    {[
                      { label: "Influence", desc: "How much their opinion moves decisions", color: "text-blue-500" },
                      { label: "Hostility", desc: "Controls difficulty of related scenarios", color: "text-red-500" },
                      { label: "Flexibility", desc: "How they react to disruptive choices", color: "text-green-500" },
                      { label: "Risk Tolerance", desc: "Appetite for bold strategic moves", color: "text-amber-500" },
                    ].map((trait) => (
                      <div key={trait.label} className="p-3 rounded-lg bg-background border border-border">
                        <div className={`text-sm font-semibold ${trait.color}`}>{trait.label}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{trait.desc}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8">
                    <a href="/characters">
                      <Button variant="outline" size="lg" data-testid="button-view-characters">
                        <Users className="mr-2 h-4 w-4" />
                        View All Characters
                      </Button>
                    </a>
                  </div>
                </div>
              </FadeInSection>
              <FadeInSection delay={200}>
                <div className="relative">
                  <img 
                    src={charactersImage} 
                    alt="Diverse team of professionals at Apex Manufacturing" 
                    className="rounded-2xl shadow-2xl w-full"
                    data-testid="img-characters-feature"
                  />
                  <div className="absolute -bottom-4 -left-4 bg-card border border-border rounded-xl p-4 shadow-lg hidden sm:block">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-foreground">17</div>
                        <div className="text-xs text-muted-foreground">Unique Stakeholders</div>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeInSection>
            </div>
          </div>
        </section>

        <section className="py-24 sm:py-32 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <FadeInSection delay={200} className="order-2 lg:order-1">
                <div className="relative">
                  <img 
                    src={transparencyImage} 
                    alt="Transparent evaluation and grading criteria" 
                    className="rounded-2xl shadow-2xl w-full"
                    data-testid="img-transparency-feature"
                  />
                  <div className="absolute -top-4 -right-4 bg-card border border-border rounded-xl p-4 shadow-lg hidden sm:block">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                        <Eye className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-foreground">100%</div>
                        <div className="text-xs text-muted-foreground">Visible Criteria</div>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeInSection>
              <FadeInSection className="order-1 lg:order-2">
                <div>
                  <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">Radical Transparency</p>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.1]" data-testid="text-transparency-headline">
                    Every rubric.<br />Every criterion.<br />Nothing hidden.
                  </h2>
                  <p className="text-muted-foreground mt-6 text-lg leading-relaxed">
                    Students see exactly how they're evaluated. No secret formulas, no black-box grading. 
                    The same rubric used by the AI grader is displayed on every weekly simulation page.
                  </p>
                  <div className="mt-8 space-y-3">
                    {RUBRIC_CRITERIA.map((criterion) => (
                      <div key={criterion.name} className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                        <div>
                          <div className="text-sm font-semibold text-foreground">{criterion.name}</div>
                          <div className="text-xs text-muted-foreground">{criterion.desc}</div>
                        </div>
                        <div className="ml-auto text-sm font-bold text-primary shrink-0">{criterion.points}pts</div>
                      </div>
                    ))}
                  </div>
                  <a href="/methodology" className="inline-flex items-center gap-1.5 mt-6 text-sm font-medium text-primary hover:underline transition-colors" data-testid="link-methodology-landing">
                    Read the full methodology
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </FadeInSection>
            </div>
          </div>
        </section>

        <section className="py-24 sm:py-32 px-4 bg-card/30">
          <div className="container mx-auto max-w-5xl">
            <FadeInSection>
              <div className="text-center mb-16">
                <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">AI-Powered</p>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight" data-testid="text-grading-headline">
                  Formative feedback<br />in seconds.
                </h2>
                <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg">
                  The AI grading module evaluates student essays against a published rubric, 
                  providing detailed scores, strengths, and areas for improvement — while the instructor retains full override authority.
                </p>
              </div>
            </FadeInSection>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { 
                  icon: Sparkles, 
                  title: "LLM Rubric Evaluation", 
                  desc: "GPT-powered scoring across 4 criteria with specific feedback per dimension. Supports single responses and bulk CSV uploads from any LMS.",
                  accent: "text-purple-500",
                  bg: "bg-purple-500/10"
                },
                { 
                  icon: BarChart3, 
                  title: "Optional Curved Scoring", 
                  desc: "Opt-in Z-score normalization adjusts for week difficulty. When enabled, raw scores are mapped to a class curve with a 75% center target.",
                  accent: "text-blue-500",
                  bg: "bg-blue-500/10"
                },
                { 
                  icon: GraduationCap, 
                  title: "Instructor Authority", 
                  desc: "Every AI score is clearly labeled as formative. Instructors can review, adjust, add comments, and override any grade before it's final.",
                  accent: "text-green-500",
                  bg: "bg-green-500/10"
                },
              ].map((feature, i) => (
                <FadeInSection key={feature.title} delay={i * 150}>
                  <Card className="bg-card h-full">
                    <CardContent className="pt-8 pb-6 px-6">
                      <div className={`h-12 w-12 rounded-xl ${feature.bg} flex items-center justify-center mb-5`}>
                        <feature.icon className={`h-6 w-6 ${feature.accent}`} />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                    </CardContent>
                  </Card>
                </FadeInSection>
              ))}
            </div>
            <FadeInSection delay={500}>
              <div className="text-center mt-10">
                <a href="/for-educators">
                  <Button variant="outline" size="lg" data-testid="button-learn-more-grading">
                    <FileText className="mr-2 h-4 w-4" />
                    Learn More
                  </Button>
                </a>
              </div>
            </FadeInSection>
          </div>
        </section>

        <section className="py-24 sm:py-32 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <FadeInSection>
                <div>
                  <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">Strategic Support</p>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.1]" data-testid="text-advisors-headline">
                    9 experts.<br />Limited calls.<br />Choose wisely.
                  </h2>
                  <p className="text-muted-foreground mt-6 text-lg leading-relaxed">
                    The Phone-a-Friend system gives students access to specialized advisors — 
                    but with limited credits. Every consultation is a strategic choice.
                  </p>
                </div>
              </FadeInSection>
              <FadeInSection delay={200}>
                <div className="space-y-4">
                  {[
                    { category: "Strategy Consultants", names: "CEO Coach, Change Management Expert, Operations Strategist", color: "border-l-blue-500" },
                    { category: "Industry Experts", names: "CFO, HR Director, Union Relations Specialist", color: "border-l-green-500" },
                    { category: "Thought Leaders", names: "AI Ethics Professor, Labor Economist, Innovation Futurist", color: "border-l-purple-500" },
                  ].map((group) => (
                    <div key={group.category} className={`p-5 rounded-xl bg-card border border-border border-l-4 ${group.color}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <Phone className="h-4 w-4 text-primary" />
                        <div className="text-sm font-semibold text-foreground">{group.category}</div>
                      </div>
                      <div className="text-sm text-muted-foreground">{group.names}</div>
                    </div>
                  ))}
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 text-center">
                    <div className="text-sm text-primary font-medium">
                      <Star className="h-4 w-4 inline mr-1" />
                      Audio-first guidance with AI-generated strategic counsel
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
                <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">For Instructors</p>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight" data-testid="text-educators-headline">
                  Built for educators<br />who demand more.
                </h2>
                <p className="text-muted-foreground mt-4 max-w-xl mx-auto text-lg">
                  A complete toolkit for managing simulations, grading at scale, and iterating based on real student feedback.
                </p>
              </div>
            </FadeInSection>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
              {EDUCATOR_TOOLS.map((tool, i) => (
                <FadeInSection key={tool.title} delay={i * 100}>
                  <div className="p-6 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-md transition-all duration-300">
                    <tool.icon className="h-8 w-8 text-primary mb-4" />
                    <h3 className="text-base font-semibold text-foreground mb-1">{tool.title}</h3>
                    <p className="text-sm text-muted-foreground">{tool.desc}</p>
                  </div>
                </FadeInSection>
              ))}
            </div>
            <FadeInSection delay={700}>
              <div className="text-center mt-10">
                <a href="/for-educators">
                  <Button size="lg" data-testid="button-educator-cta">
                    Request a Demo
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </a>
              </div>
            </FadeInSection>
          </div>
        </section>

        <section className="py-24 sm:py-32 px-4 bg-primary text-primary-foreground">
          <div className="container mx-auto max-w-3xl text-center">
            <FadeInSection>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight" data-testid="text-cta-headline">
                Ready to lead?
              </h2>
              <p className="text-lg opacity-90 mt-6 max-w-xl mx-auto">
                Sign in with your school email to access your team's simulation, 
                or explore Week 1 to see what's waiting for you.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mt-10">
                <a href="/api/login">
                  <Button variant="secondary" size="lg" data-testid="button-login-cta">
                    Sign In to Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </a>
                <a href="/week-1">
                  <Button variant="secondary" size="lg" data-testid="button-explore-cta">
                    Explore Week 1
                  </Button>
                </a>
              </div>
            </FadeInSection>
            <FadeInSection delay={300}>
              <div className="mt-12 pt-8 border-t border-primary-foreground/20">
                <div className="flex items-center justify-center gap-4 sm:gap-6 flex-wrap text-sm">
                  <a 
                    href="/for-educators" 
                    className="underline underline-offset-4 opacity-80 hover:opacity-100 transition-opacity"
                    data-testid="link-professor-inquiry"
                  >
                    Academic Licensing
                  </a>
                  <span className="opacity-30">|</span>
                  <a 
                    href="/guides/student" 
                    className="underline underline-offset-4 opacity-80 hover:opacity-100 transition-opacity"
                    data-testid="link-student-guide"
                  >
                    Student Guide
                  </a>
                  <span className="opacity-30">|</span>
                  <a 
                    href="/guides/instructor" 
                    className="underline underline-offset-4 opacity-80 hover:opacity-100 transition-opacity"
                    data-testid="link-instructor-guide"
                  >
                    Instructor Guide
                  </a>
                  <span className="opacity-30">|</span>
                  <a 
                    href="/brochure" 
                    className="underline underline-offset-4 opacity-80 hover:opacity-100 transition-opacity"
                    data-testid="link-brochure"
                  >
                    Brochure
                  </a>
                  <span className="opacity-30">|</span>
                  <a 
                    href="/privacy" 
                    className="underline underline-offset-4 opacity-80 hover:opacity-100 transition-opacity"
                    data-testid="link-privacy-policy"
                  >
                    Privacy Policy
                  </a>
                </div>
              </div>
            </FadeInSection>
          </div>
        </section>
      </main>

      <AppFooter />
    </div>
  );
}
