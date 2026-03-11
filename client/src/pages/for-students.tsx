import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { AppFooter } from "@/components/app-footer";
import {
  ArrowLeft,
  ArrowRight,
  Zap,
  TrendingUp,
  Users,
  Bot,
  Shield,
  Target,
  BarChart3,
  Clock,
  Share2,
  Mail,
  CheckCircle,
  Play,
  Brain,
  GraduationCap,
  Rocket,
  Copy,
  ExternalLink,
  ChevronDown,
  Eye,
  Phone,
  Sparkles,
  FileText,
  MessageSquare,
  Scale,
  AlertTriangle,
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import heroImg from "@assets/generated_images/hero-boardroom.png";
import charactersImg from "@assets/generated_images/characters-team.png";
import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const TRIAL_FEATURES = [
  {
    icon: Brain,
    title: "AI-Graded Decisions",
    description: "Write strategic rationales evaluated by AI against a published rubric — getting instant, transparent feedback on your business acumen.",
  },
  {
    icon: BarChart3,
    title: "Dual-Score Tracking",
    description: "Monitor your financial performance AND cultural health scores — just like real executives balance the bottom line with people.",
  },
  {
    icon: Users,
    title: "17 Living Stakeholders",
    description: "Navigate complex relationships with employees, union reps, investors, and board members — each with quantifiable personality traits.",
  },
  {
    icon: Target,
    title: "Real Consequences",
    description: "Every choice impacts revenue, morale, and workforce dynamics. There are no safe answers — only strategic trade-offs.",
  },
];

const SIMULATION_WEEKS = [
  { num: 1, title: "The Automation Imperative", description: "CEO announces a $2M AI transformation. You decide the approach." },
  { num: 2, title: "The Talent Pipeline Crisis", description: "Gen Z workers refuse management roles. Address retention and leadership gaps." },
  { num: 3, title: "Union Storm Brewing", description: "Labor unrest threatens operations. Navigate collective bargaining." },
  { num: 4, title: "The First Displacement", description: "Automation rolls out. Manage the human cost of progress." },
  { num: 5, title: "The Manager Exodus", description: "Mid-level leaders flee. Stop the organizational brain drain." },
  { num: 6, title: "Debt Day of Reckoning", description: "Financial obligations collide with workforce needs." },
  { num: 7, title: "The Competitive Response", description: "Competitors go all-in on automation. React or lead." },
  { num: 8, title: "Strategic Direction", description: "Chart the long-term future of Apex Manufacturing." },
];

const DIFFERENTIATORS = [
  {
    icon: Eye,
    title: "Transparent Rubrics",
    description: "See the exact criteria before you write. No hidden formulas, no black-box grading. You know exactly what earns points.",
  },
  {
    icon: Phone,
    title: "Phone-a-Friend Advisors",
    description: "Stuck on a tough call? Access 9 specialized advisors — from a CFO to a union relations expert — for audio guidance.",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Feedback",
    description: "Get detailed formative feedback on every decision. The AI evaluates your rationale against the same rubric you can see.",
  },
  {
    icon: FileText,
    title: "Intel Articles & Research",
    description: "WSJ, HBR, and McKinsey-style case materials with citation codes. Reference them in your decisions for bonus points.",
  },
  {
    icon: Scale,
    title: "No Right Answers",
    description: "This isn't a quiz. It's a leadership challenge. Every option has trade-offs — your reasoning quality is what matters.",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "Your data is protected. Privacy mode means anonymous participation is possible. Your institution controls access.",
  },
];

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

export default function ForStudents() {
  const { toast } = useToast();
  const [trialActivated, setTrialActivated] = useState(false);
  const [referralCopied, setReferralCopied] = useState(false);

  useEffect(() => {
    document.title = "For Students | Future Work Academy";
  }, []);

  const trialMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/demo/student-trial", {});
      return response.json();
    },
    onSuccess: (data: any) => {
      setTrialActivated(true);
      toast({
        title: "Trial activated",
        description: data.message,
      });
    },
    onError: (error: any) => {
      if (error.message?.includes("expired")) {
        toast({
          title: "Trial expired",
          description: "Your 7-day trial has ended. Ask your instructor about getting full access.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sign in required",
          description: "Sign in first, then come back to activate your trial.",
          variant: "destructive",
        });
      }
    },
  });

  const referralUrl = `${window.location.origin}/for-educators?ref=student`;
  const referralEmailSubject = encodeURIComponent("Check out this AI business simulation for your class");
  const referralEmailBody = encodeURIComponent(
    `Hi Professor,\n\nI've been using Future Work Academy, an AI business simulation where students lead a company through workforce transformation. It covers automation strategy, union dynamics, cultural health, and more.\n\nI think it would be a great fit for our class. Here's the link for educators:\n${referralUrl}\n\nThey offer a free 30-day demo for faculty.\n\nBest regards`
  );

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralUrl);
    setReferralCopied(true);
    toast({ title: "Link copied", description: "Share it with your professor" });
    setTimeout(() => setReferralCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background scroll-smooth">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <ArrowLeft className="h-4 w-4 text-muted-foreground" />
              <BrandLogo height="h-10" data-testid="img-header-logo" />
            </div>
          </Link>
          <div className="flex items-center gap-5">
            <a
              href="/for-educators"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:inline"
              data-testid="link-educator-page"
            >
              For Educators
            </a>
            <a
              href="#trial"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:inline"
              data-testid="link-trial-nav"
            >
              Free Trial
            </a>
            <ThemeToggle />
            <a href="/api/login">
              <Button data-testid="button-sign-in">
                Sign In
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </header>

      <main>

        <section className="relative min-h-[85vh] flex items-center justify-center px-4 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img src={heroImg} alt="" aria-hidden="true" className="w-full h-full object-cover opacity-15 dark:opacity-10" />
            <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
          </div>
          <div className="relative z-10 container mx-auto max-w-5xl text-center space-y-8">
            <FadeInSection>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Clock className="h-3.5 w-3.5" />
                7-Day Free Trial — No Credit Card Required
              </div>
            </FadeInSection>
            <FadeInSection delay={150}>
              <h1
                className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.1]"
                data-testid="text-hero-heading"
              >
                Can you lead through<br />
                <span className="text-primary">the AI revolution?</span>
              </h1>
            </FadeInSection>
            <FadeInSection delay={300}>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed" data-testid="text-hero-description">
                Step into the CEO's chair at Apex Manufacturing. Make strategic decisions about automation,
                manage workforce anxiety, and prove you can lead when every choice has real consequences.
              </p>
            </FadeInSection>
            <FadeInSection delay={450}>
              <div className="flex flex-wrap justify-center gap-4 pt-2">
                {!trialActivated ? (
                  <a href="/api/login">
                    <Button size="lg" data-testid="button-start-trial">
                      <Play className="mr-2 h-4 w-4" />
                      Start Free Trial
                    </Button>
                  </a>
                ) : (
                  <Link href="/">
                    <Button size="lg" data-testid="button-enter-simulation">
                      <Rocket className="mr-2 h-4 w-4" />
                      Enter Simulation
                    </Button>
                  </Link>
                )}
                <a href="#how-it-works">
                  <Button size="lg" variant="outline" data-testid="button-learn-more">
                    See How It Works
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </a>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Sign in with any account. No .edu email required.
              </p>
            </FadeInSection>
            <FadeInSection delay={600}>
              <div className="flex flex-wrap justify-center gap-6 sm:gap-10 pt-8 text-sm" data-testid="stats-ribbon-student">
                {[
                  { value: "8", label: "Weeks" },
                  { value: "17", label: "Characters" },
                  { value: "9", label: "Advisors" },
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
              <div className="pt-6 animate-bounce">
                <ChevronDown className="h-6 w-6 text-muted-foreground mx-auto" />
              </div>
            </FadeInSection>
          </div>
        </section>

        <section className="py-24 sm:py-32 px-4 bg-card/30">
          <div className="container mx-auto max-w-5xl">
            <FadeInSection>
              <div className="text-center mb-16">
                <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">The Challenge</p>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight" data-testid="text-features-heading">
                  This isn't a textbook.<br />It's a proving ground.
                </h2>
                <p className="text-muted-foreground mt-4 max-w-xl mx-auto text-lg">
                  Skills that employers actually look for — strategic thinking, stakeholder management, and decision-making under pressure.
                </p>
              </div>
            </FadeInSection>
            <div className="grid md:grid-cols-2 gap-8">
              {TRIAL_FEATURES.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <FadeInSection key={index} delay={index * 120}>
                    <Card className="bg-card h-full" data-testid={`card-feature-${index}`}>
                      <CardContent className="pt-8 pb-6 px-6">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                          <IconComponent className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                      </CardContent>
                    </Card>
                  </FadeInSection>
                );
              })}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-24 sm:py-32 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <FadeInSection>
                <div>
                  <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">The Simulation Loop</p>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.1]" data-testid="text-how-heading">
                    Read. Decide.<br />See what happens.
                  </h2>
                  <p className="text-muted-foreground mt-6 text-lg leading-relaxed">
                    Each week follows the same high-stakes cycle: absorb your intelligence briefing, consult advisors,
                    make a strategic decision, write your rationale — and watch the consequences unfold across the organization.
                  </p>
                  <div className="mt-8 space-y-4">
                    {[
                      { step: "1", title: "Read the Briefing", desc: "Multimedia reports on what's happening at Apex this week" },
                      { step: "2", title: "Research & Consult", desc: "Study Intel Articles, call advisors, review stakeholder profiles" },
                      { step: "3", title: "Make Your Decision", desc: "Choose a strategic option and write a defended rationale" },
                      { step: "4", title: "Get Scored", desc: "AI evaluates against the published rubric — see exactly what you earned and why" },
                    ].map((item) => (
                      <div key={item.step} className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
                          {item.step}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-foreground">{item.title}</div>
                          <div className="text-sm text-muted-foreground">{item.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeInSection>
              <FadeInSection delay={200}>
                <div className="relative">
                  <img
                    src={charactersImg}
                    alt="The team at Apex Manufacturing"
                    className="rounded-2xl shadow-2xl w-full"
                    data-testid="img-characters-student"
                  />
                  <div className="absolute -bottom-4 -left-4 bg-card border border-border rounded-xl p-4 shadow-lg hidden sm:block">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-foreground">17</div>
                        <div className="text-xs text-muted-foreground">Living Stakeholders</div>
                      </div>
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
                <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">The Journey</p>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight" data-testid="text-timeline-heading">
                  8 weeks. One company.<br />Your leadership on the line.
                </h2>
                <p className="text-muted-foreground mt-4 max-w-xl mx-auto text-lg">
                  Each week escalates the complexity. What starts as a technology decision becomes a full organizational crisis.
                </p>
              </div>
            </FadeInSection>
            <div className="relative">
              <div className="absolute left-5 top-0 bottom-0 w-px bg-border hidden md:block" />
              <div className="space-y-4">
                {SIMULATION_WEEKS.map((week, index) => (
                  <FadeInSection key={week.num} delay={index * 80}>
                    <div className="flex items-start gap-5 md:pl-0" data-testid={`timeline-item-${index}`}>
                      <div className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold text-sm shrink-0 z-10 shadow-md">
                        {week.num}
                      </div>
                      <div className="flex-1 p-5 rounded-xl bg-card border border-border">
                        <div className="flex items-center gap-3 mb-1">
                          <Badge variant="outline" className="shrink-0 font-mono text-xs md:hidden">
                            W{week.num}
                          </Badge>
                          <h3 className="text-base font-semibold text-foreground">{week.title}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">{week.description}</p>
                      </div>
                    </div>
                  </FadeInSection>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 sm:py-32 px-4">
          <div className="container mx-auto max-w-5xl">
            <FadeInSection>
              <div className="text-center mb-16">
                <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">Why It's Different</p>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight" data-testid="text-differentiators-heading">
                  Not another case study.<br />A leadership experience.
                </h2>
                <p className="text-muted-foreground mt-4 max-w-xl mx-auto text-lg">
                  Transparent evaluation, expert advisors, real consequences, and the kind of strategic thinking employers actually want to see.
                </p>
              </div>
            </FadeInSection>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {DIFFERENTIATORS.map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <FadeInSection key={index} delay={index * 100}>
                    <Card className="bg-card h-full" data-testid={`card-differentiator-${index}`}>
                      <CardContent className="pt-6 pb-5 px-5">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                          <IconComponent className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="text-sm font-semibold text-foreground mb-1.5">{item.title}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                      </CardContent>
                    </Card>
                  </FadeInSection>
                );
              })}
            </div>
          </div>
        </section>

        <section id="trial" className="py-24 sm:py-32 px-4 bg-card/30">
          <div className="container mx-auto max-w-3xl">
            <FadeInSection>
              <div className="text-center mb-12">
                <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">Get Started</p>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight" data-testid="text-trial-heading">
                  Three steps.<br />Zero friction.
                </h2>
              </div>
            </FadeInSection>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: "1", title: "Sign In", desc: "Use any account — Google, GitHub, or email. No .edu required.", icon: GraduationCap },
                { step: "2", title: "Play for 7 Days", desc: "Full access to Week 1 of the simulation with AI grading and all features.", icon: Play },
                { step: "3", title: "Share It", desc: "Think your class should use it? Tell your professor — they get 30 days free.", icon: Share2 },
              ].map((item, index) => (
                <FadeInSection key={item.step} delay={index * 150}>
                  <div className="text-center space-y-4">
                    <div className="h-14 w-14 rounded-full bg-primary flex items-center justify-center mx-auto shadow-lg">
                      <span className="text-xl font-bold text-primary-foreground">{item.step}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </FadeInSection>
              ))}
            </div>
            <FadeInSection delay={500}>
              <div className="text-center mt-12">
                {!trialActivated ? (
                  <a href="/api/login">
                    <Button size="lg" data-testid="button-start-trial-bottom">
                      <Zap className="mr-2 h-4 w-4" />
                      Start Your Free Trial
                    </Button>
                  </a>
                ) : (
                  <Link href="/">
                    <Button size="lg" data-testid="button-enter-simulation-bottom">
                      <Rocket className="mr-2 h-4 w-4" />
                      Enter Simulation
                    </Button>
                  </Link>
                )}
              </div>
            </FadeInSection>
          </div>
        </section>

        <section className="py-24 sm:py-32 px-4">
          <div className="container mx-auto max-w-xl">
            <FadeInSection>
              <Card data-testid="card-referral">
                <CardHeader className="text-center pb-4">
                  <div className="h-14 w-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-3">
                    <Share2 className="h-7 w-7 text-accent-foreground" />
                  </div>
                  <CardTitle className="text-2xl">Think Your Class Should Use This?</CardTitle>
                  <CardDescription className="text-base mt-2">
                    Share the platform with your instructor. They get a free 30-day educator demo
                    with full access to every feature — grading, analytics, content tools, and more.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={handleCopyLink}
                      data-testid="button-copy-referral"
                    >
                      {referralCopied ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Link
                        </>
                      )}
                    </Button>
                    <a
                      href={`mailto:?subject=${referralEmailSubject}&body=${referralEmailBody}`}
                      className="flex-1"
                    >
                      <Button variant="outline" className="w-full" data-testid="button-email-professor">
                        <Mail className="h-4 w-4 mr-2" />
                        Email Professor
                      </Button>
                    </a>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    When your professor signs up through your link, we'll know you referred them
                  </p>
                </CardContent>
              </Card>
            </FadeInSection>
          </div>
        </section>

        <section className="py-24 sm:py-32 px-4 bg-primary text-primary-foreground">
          <div className="container mx-auto max-w-3xl text-center">
            <FadeInSection>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-6" data-testid="text-cta-heading">
                Ready to prove<br />your leadership?
              </h2>
              <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
                7 days. Zero cost. Real strategic decisions. Find out if you've got what it takes
                to lead a company through the AI transformation.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a href="/api/login">
                  <Button variant="secondary" size="lg" data-testid="button-bottom-cta">
                    Start Your Free Trial
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </a>
              </div>
              <div className="mt-10 pt-8 border-t border-primary-foreground/20">
                <p className="text-sm opacity-80 mb-3">
                  Already enrolled through your university?
                </p>
                <a
                  href="/api/login"
                  className="text-sm underline underline-offset-4 opacity-90 hover:opacity-100 transition-opacity"
                  data-testid="link-enrolled-signin"
                >
                  Sign in to your existing account
                </a>
              </div>
            </FadeInSection>
          </div>
        </section>

      </main>

      <AppFooter />
    </div>
  );
}
