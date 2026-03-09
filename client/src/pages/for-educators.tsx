import { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ThemeToggle } from "@/components/theme-toggle";
import { AppFooter } from "@/components/app-footer";
import {
  ArrowLeft,
  ArrowRight,
  Send,
  CheckCircle,
  Linkedin,
  Mail,
  Phone,
  BookOpen,
  Users,
  TrendingUp,
  Award,
  FileText,
  Sparkles,
  Newspaper,
  Settings,
  UserCog,
  ShieldCheck,
  Clock,
  Share2,
  Target,
  GraduationCap,
  Factory,
  Truck,
  Leaf,
  AlertTriangle,
  Globe,
  Building2,
  Zap,
  Lock,
  Play,
  Eye,
  BarChart3,
  MessageSquare,
  Activity,
  Star,
  ChevronDown,
  Layers,
  Shield
} from "lucide-react";
import danMitchellPhoto from "@assets/image_1768085802226.png";
import { BrandLogo } from "@/components/brand-logo";
import heroImg from "@assets/generated_images/educator-classroom.png";
import assessmentImg from "@assets/generated_images/educator-assessment.png";
import privacyImg from "@assets/generated_images/educator-privacy.png";
import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const INSTITUTIONS = [
  "4-Year University",
  "Community College",
  "Business School / MBA Program",
  "Corporate Training",
  "Government / Public Sector",
  "Non-Profit Organization",
  "Other"
];

const INQUIRY_TYPES = [
  { value: "general", label: "General Inquiry" },
  { value: "demo_request", label: "Request a Demo" },
  { value: "pricing", label: "Pricing Information" },
  { value: "partnership", label: "Partnership Opportunity" },
  { value: "curriculum", label: "Curriculum Integration" },
];

const RUBRIC_CRITERIA = [
  { name: "Evidence Quality", points: 25, desc: "Cite specific data, statistics, or case studies from Intel articles using source codes (AIM, APX, WFT)" },
  { name: "Reasoning Coherence", points: 25, desc: "Present a logical argument connecting chosen strategy settings to evidence and outcomes" },
  { name: "Trade-off Analysis", points: 25, desc: "Acknowledge sacrifices, identify biggest risks, and explain contingency plans" },
  { name: "Stakeholder Consideration", points: 25, desc: "Address how decisions affect 2-3+ stakeholder groups and balance competing interests" },
];

const WEEK_TITLES = [
  { num: 1, title: "The Automation Imperative" },
  { num: 2, title: "The Talent Pipeline Crisis" },
  { num: 3, title: "Union Storm Brewing" },
  { num: 4, title: "The First Displacement" },
  { num: 5, title: "The Manager Exodus" },
  { num: 6, title: "Debt Day of Reckoning" },
  { num: 7, title: "The Competitive Response" },
  { num: 8, title: "Strategic Direction" },
];

const PLATFORM_TOOLS = [
  { icon: Sparkles, title: "AI-Powered Grading", desc: "LLM rubric evaluation with bulk CSV upload from any LMS" },
  { icon: BarChart3, title: "Optional Curved Scoring", desc: "Opt-in statistical normalization with configurable class curve targets" },
  { icon: MessageSquare, title: "Student Feedback Surveys", desc: "6-dimension ratings with AI-analyzed results dashboard" },
  { icon: FileText, title: "Content Editor", desc: "Manage weekly briefings, research, and decisions with AI assistance" },
  { icon: Activity, title: "Activity Logs", desc: "Track every student action, engagement metric, and participation" },
  { icon: Users, title: "People Management", desc: "Team creation, enrollment, role assignment, and progress tracking" },
  { icon: Newspaper, title: "Intel Articles & Research", desc: "WSJ, HBR, McKinsey-style case materials with citation codes" },
  { icon: Phone, title: "Phone-a-Friend Advisors", desc: "9 specialized advisors with audio guidance and strategic counsel" },
  { icon: Settings, title: "Injectable Situations", desc: "Alter simulation dynamics mid-semester with special events" },
  { icon: Star, title: "Easter Egg Bonuses", desc: "Reward students who reference research in their decisions" },
  { icon: Eye, title: "Role Preview System", desc: "Experience the platform as a student or educator before deployment" },
  { icon: Shield, title: "Content Validation", desc: "Verify all content consistency against canonical source data" },
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

export default function ForEducators() {
  const { toast } = useToast();

  useEffect(() => {
    document.title = "For Educators | Future Work Academy";
  }, []);

  const referralSource = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("ref") || null;
  }, []);

  const [demoProvisioned, setDemoProvisioned] = useState(false);
  const [demoCode, setDemoCode] = useState('');
  const [demoExpiresAt, setDemoExpiresAt] = useState('');
  const [demoEmail, setDemoEmail] = useState('');
  const [demoName, setDemoName] = useState('');
  const [demoEmailInput, setDemoEmailInput] = useState('');
  const [demoInstitution, setDemoInstitution] = useState('');

  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactInstitution, setContactInstitution] = useState('');
  const [inquiryType, setInquiryType] = useState('general');
  const [contactMessage, setContactMessage] = useState('');

  const demoMutation = useMutation({
    mutationFn: async (data: { email: string; name: string; institution?: string; message?: string; referralSource?: string; }) => {
      const response = await apiRequest('POST', '/api/demo/request-access', data);
      return response.json();
    },
    onSuccess: (data) => {
      setDemoProvisioned(true);
      setDemoCode(data.demoCode || 'DEMO2025');
      setDemoExpiresAt(data.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString());
      setDemoEmail(demoEmailInput);
      toast({ title: "Demo access granted!", description: "You can now sign in and explore the platform." });
    },
    onError: () => {
      toast({ title: "Failed to provision demo access", description: "Please try again or email doug@futureworkacademy.com directly.", variant: "destructive" });
    }
  });

  const submitMutation = useMutation({
    mutationFn: async (data: { name: string; email: string; phone?: string; institution?: string; inquiryType: string; message: string; referralSource?: string; }) => {
      return apiRequest('POST', '/api/educator-inquiry', data);
    },
    onSuccess: () => { setContactSubmitted(true); },
    onError: () => {
      toast({ title: "Failed to send inquiry", description: "Please try again or email doug@futureworkacademy.com directly.", variant: "destructive" });
    }
  });

  const handleDemoRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoName || !demoEmailInput) {
      toast({ title: "Missing fields", description: "Please fill in your name and email.", variant: "destructive" });
      return;
    }
    demoMutation.mutate({ name: demoName, email: demoEmailInput, institution: demoInstitution || undefined, message: `Instant demo request from educator page`, referralSource: referralSource || undefined });
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) {
      toast({ title: "Missing fields", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    submitMutation.mutate({ name: contactName, email: contactEmail, phone: contactPhone || undefined, institution: contactInstitution || undefined, inquiryType, message: contactMessage, referralSource: referralSource || undefined });
  };

  if (demoProvisioned) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
            <Link href="/"><BrandLogo height="h-12" data-testid="img-header-logo" /></Link>
            <ThemeToggle />
          </div>
        </header>
        <main className="container mx-auto px-4 py-16 max-w-xl">
          <Card className="text-center">
            <CardHeader className="pb-4">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                <Zap className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl">Demo Access Granted!</CardTitle>
              <CardDescription className="text-base">Your evaluator account has been created. You can now explore the full simulation experience.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-primary/5 rounded-lg p-4 text-left space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Demo Code:</span>
                  <code className="bg-muted px-2 py-1 rounded text-sm font-mono font-bold" data-testid="text-demo-code">{demoCode}</code>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Access Expires:</span>
                  <span className="text-sm font-medium" data-testid="text-demo-expiry">
                    {demoExpiresAt && !isNaN(new Date(demoExpiresAt).getTime()) ? new Date(demoExpiresAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '30 days from today'}
                  </span>
                </div>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-semibold text-sm mb-2">What's included in your demo:</h4>
                <ul className="text-sm text-muted-foreground space-y-1 text-left">
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" />Pre-populated demo class with sample students</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" />Full access to instructor dashboard features</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" />Student preview mode to experience their view</li>
                  <li className="flex items-center gap-2"><Lock className="h-4 w-4 text-muted-foreground" />Sandboxed environment (no real student data)</li>
                </ul>
              </div>
              <div className="pt-2 space-y-3">
                <a href="/api/login"><Button className="w-full gap-2" data-testid="button-start-demo"><Play className="h-4 w-4" />Sign In & Start Exploring</Button></a>
                <p className="text-xs text-muted-foreground">Sign in with <strong>{demoEmail || 'your email'}</strong> to access your demo environment</p>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background scroll-smooth">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Link href="/">
            <BrandLogo height="h-12" data-testid="img-header-logo" />
          </Link>
          <div className="flex items-center gap-5">
            <Link href="/">
              <span className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:inline cursor-pointer" data-testid="link-home">Home</span>
            </Link>
            <a href="#demo" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:inline" data-testid="link-try-demo">Try Demo</a>
            <a href="#contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:inline" data-testid="link-contact-nav">Contact</a>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main>

        <section className="relative min-h-[85vh] flex items-center justify-center px-4 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img src={heroImg} alt="" className="w-full h-full object-cover opacity-15 dark:opacity-10" data-testid="img-hero-educator" />
            <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
          </div>
          <div className="relative z-10 container mx-auto max-w-5xl text-center space-y-8">
            <FadeInSection>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <GraduationCap className="h-3.5 w-3.5" />
                For Educators & Administrators
              </div>
            </FadeInSection>
            <FadeInSection delay={150}>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.1]" data-testid="text-hero-headline">
                The AI simulation<br />
                <span className="text-primary">your students deserve.</span>
              </h1>
            </FadeInSection>
            <FadeInSection delay={300}>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                An immersive, research-backed platform that moves students from passive case analysis
                to dynamic decision-making — with every evaluation criterion visible and every rubric published.
              </p>
            </FadeInSection>
            <FadeInSection delay={450}>
              <div className="flex flex-wrap justify-center gap-4 pt-2">
                <a href="#demo">
                  <Button size="lg" data-testid="button-try-demo-hero">
                    <Zap className="mr-2 h-4 w-4" />
                    Try Instant Demo
                  </Button>
                </a>
                <a href="#contact">
                  <Button size="lg" variant="outline" data-testid="button-contact-hero">
                    <Mail className="mr-2 h-4 w-4" />
                    Request a Walkthrough
                  </Button>
                </a>
              </div>
            </FadeInSection>
            <FadeInSection delay={600}>
              <div className="flex flex-wrap justify-center gap-6 sm:gap-10 pt-8 text-sm" data-testid="stats-ribbon-educator">
                {[
                  { value: "8", label: "Weeks" },
                  { value: "17", label: "Characters" },
                  { value: "3", label: "Difficulty Tiers" },
                  { value: "100%", label: "Transparent Rubrics" },
                  { value: "FERPA", label: "Aligned" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-muted-foreground text-xs uppercase tracking-wider mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </FadeInSection>
            <FadeInSection delay={750}>
              <div className="pt-6 animate-bounce"><ChevronDown className="h-6 w-6 text-muted-foreground mx-auto" /></div>
            </FadeInSection>
          </div>
        </section>

        <section className="py-24 sm:py-32 px-4 bg-card/30">
          <div className="container mx-auto max-w-5xl">
            <FadeInSection>
              <div className="text-center mb-16">
                <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">The Problem</p>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight" data-testid="text-pedagogy-headline">
                  Case studies weren't built<br />for the AI era.
                </h2>
                <p className="text-muted-foreground mt-6 max-w-2xl mx-auto text-lg leading-relaxed">
                  Management education faces a persistent "Relevance Gap" between academic theory
                  and organizational practice.<sup><a href="#references" className="text-primary hover:underline">1</a></sup> Traditional cases are static snapshots —
                  they can't capture the messy, evolving complexity of leading through technological transformation.<sup><a href="#references" className="text-primary hover:underline">2</a></sup>
                </p>
              </div>
            </FadeInSection>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: BookOpen, title: "Experiential Learning", sup: "6", desc: "Students make consequential decisions over 8 simulated weeks and see the organizational ripple effects — implementing Kolb's learning cycle iteratively to address concerns about single-iteration designs.", accent: "text-blue-500", bg: "bg-blue-500/10" },
                { icon: Target, title: "Productive Failure", sup: "8", desc: "A risk-free environment where strategic mistakes become powerful learning moments. Kapur's research shows students who struggle with complex problems before instruction outperform those who receive instruction first.", accent: "text-green-500", bg: "bg-green-500/10" },
                { icon: Award, title: "Actionable Knowledge", sup: "4", desc: "Moving beyond theory to create the data-driven rigor required by the academic community while delivering the engagement students demand.", accent: "text-purple-500", bg: "bg-purple-500/10" },
              ].map((item, i) => (
                <FadeInSection key={item.title} delay={i * 150}>
                  <Card className="bg-card h-full">
                    <CardContent className="pt-8 pb-6 px-6">
                      <div className={`h-12 w-12 rounded-xl ${item.bg} flex items-center justify-center mb-5`}>
                        <item.icon className={`h-6 w-6 ${item.accent}`} />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}{"sup" in item && item.sup && <sup><a href="#references" className="text-primary hover:underline text-xs">{item.sup}</a></sup>}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                    </CardContent>
                  </Card>
                </FadeInSection>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 sm:py-32 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <FadeInSection>
                <div>
                  <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">Radical Transparency</p>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.1]" data-testid="text-transparency-headline">
                    Every rubric visible.<br />Every criterion published.
                  </h2>
                  <p className="text-muted-foreground mt-6 text-lg leading-relaxed">
                    Unlike "black box" AI tools that obscure evaluation logic, FWA uses transparent,
                    rubric-based assessment.<sup><a href="#references" className="text-primary hover:underline">9</a></sup> Students see
                    the exact same criteria used by the AI grader — displayed on every weekly simulation page.
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
                  <div className="mt-8 p-4 rounded-xl bg-primary/5 border border-primary/20">
                    <p className="text-sm text-muted-foreground mb-3">Want to see every scoring band, the 5-step evaluation process, and how we calibrate against exemplar responses?</p>
                    <a href="/methodology" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline transition-colors" data-testid="link-methodology-educators">
                      See our complete AI grading methodology
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </FadeInSection>
              <FadeInSection delay={200}>
                <div className="relative">
                  <img src={assessmentImg} alt="Transparent assessment criteria" className="rounded-2xl shadow-2xl w-full" data-testid="img-assessment-feature" />
                  <div className="absolute -bottom-4 -left-4 bg-card border border-border rounded-xl p-4 shadow-lg hidden sm:block">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                        <Eye className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-foreground">100%</div>
                        <div className="text-xs text-muted-foreground">Visible to Students</div>
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
                <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">Assessment</p>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight" data-testid="text-grading-headline">
                  AI-powered grading.<br />Instructor authority.
                </h2>
                <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg">
                  The grading module evaluates student essays against the published rubric, providing detailed formative
                  feedback — while the instructor retains full override authority on every score.
                </p>
              </div>
            </FadeInSection>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Sparkles, title: "LLM Rubric Evaluation", desc: "Scores across all 4 criteria with specific feedback per dimension" },
                { icon: FileText, title: "Bulk CSV Upload", desc: "Paste from Blackboard, Canvas, or any LMS — grade entire classes at once" },
                { icon: BarChart3, title: "Optional Curved Scoring", desc: "Opt-in statistical normalization adjusts for week difficulty across the class" },
                { icon: GraduationCap, title: "Instructor Override", desc: "Every AI score labeled formative — review, adjust, add comments, finalize" },
              ].map((item, i) => (
                <FadeInSection key={item.title} delay={i * 100}>
                  <div className="p-6 rounded-xl bg-card border border-border h-full">
                    <item.icon className="h-8 w-8 text-primary mb-4" />
                    <h3 className="text-base font-semibold text-foreground mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </FadeInSection>
              ))}
            </div>
            <FadeInSection delay={500}>
              <div className="text-center mt-10">
                <p className="text-sm text-muted-foreground" data-testid="text-grading-access-note">
                  The grading module is available to enrolled instructors and administrators.
                </p>
              </div>
            </FadeInSection>
          </div>
        </section>

        <section className="py-24 sm:py-32 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <FadeInSection delay={200} className="order-2 lg:order-1">
                <div className="space-y-6">
                  {[
                    { tier: "Introductory", level: "Undergraduate", desc: "Gentler consequences, simplified financial tradeoffs, guided decision frameworks. Ideal for students new to strategic thinking.", color: "border-l-green-500" },
                    { tier: "Standard", level: "Executive / Professional", desc: "Balanced complexity with realistic stakeholder dynamics and competitive pressures. The default experience.", color: "border-l-blue-500" },
                    { tier: "Advanced", level: "Graduate / MBA", desc: "Harsh consequences, complex multi-variable tradeoffs, ambiguous data, and aggressive timelines. Designed for rigorous programs.", color: "border-l-purple-500" },
                  ].map((item) => (
                    <div key={item.tier} className={`p-5 rounded-xl bg-card border border-border border-l-4 ${item.color}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <Layers className="h-4 w-4 text-primary" />
                        <div className="text-sm font-semibold text-foreground">{item.tier}</div>
                        <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground ml-auto">{item.level}</span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">{item.desc}</div>
                    </div>
                  ))}
                </div>
              </FadeInSection>
              <FadeInSection className="order-1 lg:order-2">
                <div>
                  <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">Adaptability</p>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.1]" data-testid="text-difficulty-headline">
                    3 difficulty tiers.<br />One platform.
                  </h2>
                  <p className="text-muted-foreground mt-6 text-lg leading-relaxed">
                    Whether you're teaching introductory management to undergraduates or running a
                    rigorous MBA seminar, the simulation adapts — implementing Vygotsky's Zone of Proximal
                    Development<sup><a href="#references" className="text-primary hover:underline">10</a></sup> by
                    progressively reducing scaffolding as student capability increases. Difficulty affects consequence
                    severity, financial complexity, and rubric expectations — all configurable by the instructor.
                  </p>
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
                  <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">Continuous Improvement</p>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.1]" data-testid="text-survey-headline">
                    Built-in student feedback.<br />AI-analyzed insights.
                  </h2>
                  <p className="text-muted-foreground mt-6 text-lg leading-relaxed">
                    Every week, students rate the simulation across six dimensions. The instructor dashboard
                    aggregates responses into trend charts, radar analysis, and AI-generated recommendations —
                    so you can iterate based on real data, not guesswork.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-8">
                    {["Realism", "Fairness", "Difficulty", "Learning Value", "Engagement", "Clarity"].map((dim) => (
                      <div key={dim} className="p-3 rounded-lg bg-background border border-border text-center">
                        <Star className="h-4 w-4 text-amber-500 mx-auto mb-1" />
                        <div className="text-sm font-medium text-foreground">{dim}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8">
                    <a href="#demo">
                      <Button variant="outline" size="lg" data-testid="button-view-survey">
                        <Zap className="mr-2 h-4 w-4" />
                        Try It in the Demo
                      </Button>
                    </a>
                  </div>
                </div>
              </FadeInSection>
              <FadeInSection delay={200}>
                <div className="space-y-4">
                  <div className="p-5 rounded-xl bg-card border border-border">
                    <div className="text-sm font-semibold text-foreground mb-2">Trend Line Charts</div>
                    <div className="text-sm text-muted-foreground">Track how each dimension changes week over week across the semester</div>
                  </div>
                  <div className="p-5 rounded-xl bg-card border border-border">
                    <div className="text-sm font-semibold text-foreground mb-2">Radar Analysis</div>
                    <div className="text-sm text-muted-foreground">See the overall profile of student sentiment across all six dimensions</div>
                  </div>
                  <div className="p-5 rounded-xl bg-card border border-border">
                    <div className="text-sm font-semibold text-foreground mb-2">AI-Powered Insights</div>
                    <div className="text-sm text-muted-foreground">AI analyzes open-ended comments to identify themes, strengths, and actionable recommendations</div>
                  </div>
                  <div className="p-5 rounded-xl bg-card border border-border">
                    <div className="text-sm font-semibold text-foreground mb-2">Distribution Charts</div>
                    <div className="text-sm text-muted-foreground">Visualize how ratings cluster — identify if difficulty is perceived as too high or too low</div>
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
                <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">Immersion</p>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight" data-testid="text-characters-headline">
                  17 stakeholders.<br />Quantifiable personalities.
                </h2>
                <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg">
                  Each character has a rich backstory, professional history, and four measurable traits
                  that directly affect simulation difficulty and decision outcomes.
                </p>
              </div>
            </FadeInSection>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              {[
                { label: "Influence", desc: "How much their opinion moves organizational decisions", color: "text-blue-500", bg: "bg-blue-500/10" },
                { label: "Hostility", desc: "Controls the difficulty of related scenarios", color: "text-red-500", bg: "bg-red-500/10" },
                { label: "Flexibility", desc: "How they react to disruptive strategic choices", color: "text-green-500", bg: "bg-green-500/10" },
                { label: "Risk Tolerance", desc: "Appetite for bold moves and innovation", color: "text-amber-500", bg: "bg-amber-500/10" },
              ].map((trait) => (
                <FadeInSection key={trait.label}>
                  <div className={`p-4 rounded-xl bg-card border border-border text-center h-full`}>
                    <div className={`h-10 w-10 rounded-full ${trait.bg} flex items-center justify-center mx-auto mb-3`}>
                      <Users className={`h-5 w-5 ${trait.color}`} />
                    </div>
                    <div className={`text-sm font-semibold ${trait.color}`}>{trait.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">{trait.desc}</div>
                  </div>
                </FadeInSection>
              ))}
            </div>
            <FadeInSection>
              <div className="text-center">
                <a href="/characters">
                  <Button variant="outline" size="lg" data-testid="button-view-characters">
                    <Users className="mr-2 h-4 w-4" />
                    Meet the Stakeholders
                  </Button>
                </a>
              </div>
            </FadeInSection>
          </div>
        </section>

        <section className="py-24 sm:py-32 px-4 bg-card/30">
          <div className="container mx-auto max-w-6xl">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <FadeInSection delay={200}>
                <div className="relative">
                  <img src={privacyImg} alt="Privacy and institutional compliance" className="rounded-2xl shadow-2xl w-full" data-testid="img-privacy-feature" />
                  <div className="absolute -top-4 -right-4 bg-card border border-border rounded-xl p-4 shadow-lg hidden sm:block">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <ShieldCheck className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-foreground">FERPA</div>
                        <div className="text-xs text-muted-foreground">Aligned</div>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeInSection>
              <FadeInSection>
                <div>
                  <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">Institutional Trust</p>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.1]" data-testid="text-privacy-headline">
                    Privacy-first.<br />Compliance-ready.
                  </h2>
                  <p className="text-muted-foreground mt-6 text-lg leading-relaxed">
                    Privacy Mode enables completely anonymous enrollment — no student names, emails, or
                    PII collected. Instructors map pseudonymous IDs to real records offline.
                  </p>
                  <div className="mt-8 space-y-3">
                    {[
                      { label: "Privacy Mode", desc: "Anonymous enrollment with pseudonymized student IDs" },
                      { label: "FERPA Alignment", desc: "PII stripped before any AI interaction" },
                      { label: "Sandbox Environment", desc: "Instructors audit the full student journey before deployment" },
                      { label: "Institutional Controls", desc: "Team codes, .edu email requirements, enrollment management" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                        <div>
                          <div className="text-sm font-semibold text-foreground">{item.label}</div>
                          <div className="text-xs text-muted-foreground">{item.desc}</div>
                        </div>
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
                <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">The Journey</p>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight" data-testid="text-journey-headline">
                  8 weeks of escalating<br />complexity.
                </h2>
                <p className="text-muted-foreground mt-4 max-w-xl mx-auto text-lg">
                  A structured arc from initial AI assessment through full organizational transformation.
                </p>
              </div>
            </FadeInSection>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
              {WEEK_TITLES.map((week, i) => (
                <FadeInSection key={week.num} delay={i * 80}>
                  <a href={`/week-${week.num}`} className="group block" data-testid={`link-week-${week.num}`}>
                    <div className="p-4 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-md transition-all duration-300 h-full">
                      <div className="text-xs font-medium text-primary uppercase tracking-wider mb-1">Week {week.num}</div>
                      <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{week.title}</div>
                    </div>
                  </a>
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
        </section>

        <section className="py-24 sm:py-32 px-4 bg-card/30">
          <div className="container mx-auto max-w-6xl">
            <FadeInSection>
              <div className="text-center mb-16">
                <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">Instructor Toolkit</p>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight" data-testid="text-tools-headline">
                  Everything you need<br />to run the simulation.
                </h2>
                <p className="text-muted-foreground mt-4 max-w-xl mx-auto text-lg">
                  A complete suite of tools for managing simulations, grading at scale, and iterating based on real student feedback.
                </p>
              </div>
            </FadeInSection>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {PLATFORM_TOOLS.map((tool, i) => (
                <FadeInSection key={tool.title} delay={i * 60}>
                  <div className="p-5 rounded-xl bg-card border border-border h-full">
                    <tool.icon className="h-6 w-6 text-primary mb-3" />
                    <h3 className="text-sm font-semibold text-foreground mb-1">{tool.title}</h3>
                    <p className="text-xs text-muted-foreground">{tool.desc}</p>
                  </div>
                </FadeInSection>
              ))}
            </div>
            <FadeInSection delay={800}>
              <div className="flex flex-wrap justify-center gap-4 mt-10">
                <a href="/guides/instructor" data-testid="link-instructor-guide">
                  <Button variant="outline" size="lg">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Instructor Guide
                  </Button>
                </a>
                <a href="/guides/student" data-testid="link-student-guide">
                  <Button variant="outline" size="lg">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Student Guide
                  </Button>
                </a>
              </div>
            </FadeInSection>
          </div>
        </section>

        <section className="py-24 sm:py-32 px-4 bg-card/30" id="modules">
          <div className="container mx-auto max-w-5xl">
            <FadeInSection>
              <div className="text-center mb-12">
                <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">Modules</p>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight" data-testid="text-modules-headline">
                  Scenario-based learning<br />across strategic challenges.
                </h2>
              </div>
            </FadeInSection>
            <FadeInSection delay={100}>
              <Card className="max-w-2xl mx-auto border-primary/30 mb-8">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Factory className="h-7 w-7 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-lg">The Future of Work</h4>
                        <span className="text-xs bg-green-500/10 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full font-medium">Available Now</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Lead Apex Manufacturing through 8 weeks of AI adoption decisions balancing automation, workforce transformation, union relations, and stakeholder management.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {["AI Strategy", "Workforce Transformation", "Labor Relations", "8 Weeks"].map((tag) => (
                          <span key={tag} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeInSection>
            <FadeInSection delay={300}>
              <p className="text-center text-sm text-muted-foreground mb-4 uppercase tracking-wide font-medium">In Development</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl mx-auto">
                {[
                  { icon: Truck, title: "Supply Chain Resilience" },
                  { icon: Leaf, title: "Sustainability & ESG" },
                  { icon: AlertTriangle, title: "Crisis Management" },
                  { icon: Globe, title: "Digital Transformation" },
                  { icon: UserCog, title: "Change Management" },
                  { icon: Building2, title: "Custom Module" },
                ].map((mod) => (
                  <div key={mod.title} className="flex items-center gap-3 p-4 rounded-xl bg-card/50 border border-dashed border-border">
                    <mod.icon className="h-5 w-5 text-muted-foreground shrink-0" />
                    <span className="text-sm font-medium text-muted-foreground">{mod.title}</span>
                  </div>
                ))}
              </div>
            </FadeInSection>
          </div>
        </section>

        <section className="py-24 sm:py-32 px-4" id="demo">
          <div className="container mx-auto max-w-5xl">
            <FadeInSection>
              <div className="text-center mb-16">
                <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">Get Started</p>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight" data-testid="text-demo-headline">
                  See it for yourself.
                </h2>
                <p className="text-muted-foreground mt-4 max-w-xl mx-auto text-lg">
                  Get instant 30-day demo access — no scheduling required. Or reach out for a personal walkthrough.
                </p>
              </div>
            </FadeInSection>
            <div className="grid lg:grid-cols-2 gap-8 items-start" id="contact">
              <FadeInSection>
                <Card className="border-green-500/30 bg-green-500/5">
                  <CardHeader>
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-green-500" />
                        Instant Demo
                      </CardTitle>
                      <span className="text-xs bg-green-500/20 text-green-600 dark:text-green-400 px-2 py-1 rounded-full font-medium">30-Day Access</span>
                    </div>
                    <CardDescription>Get immediate access — no waiting, no scheduling required</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleDemoRequest} className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="demo-name">Your Name *</Label>
                          <Input id="demo-name" placeholder="Dr. Jane Smith" value={demoName} onChange={(e) => setDemoName(e.target.value)} data-testid="input-demo-name" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="demo-email">Work Email *</Label>
                          <Input id="demo-email" type="email" placeholder="name@university.edu" value={demoEmailInput} onChange={(e) => setDemoEmailInput(e.target.value)} data-testid="input-demo-email" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="demo-institution">Institution (optional)</Label>
                        <Input id="demo-institution" placeholder="Your university or organization" value={demoInstitution} onChange={(e) => setDemoInstitution(e.target.value)} data-testid="input-demo-institution" />
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-2">
                        <p className="font-medium flex items-center gap-2"><Lock className="h-4 w-4 text-muted-foreground" />What you'll get:</p>
                        <ul className="text-muted-foreground text-xs space-y-1 ml-6">
                          <li>30-day evaluator access to explore the full platform</li>
                          <li>Pre-populated demo class with sample students</li>
                          <li>Sandboxed environment — completely isolated from real courses</li>
                        </ul>
                      </div>
                      <Button type="submit" className="w-full gap-2" disabled={demoMutation.isPending} data-testid="button-instant-demo">
                        {demoMutation.isPending ? <>Processing...</> : <><Play className="h-4 w-4" />Start Exploring Now</>}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </FadeInSection>

              <FadeInSection delay={200}>
                {contactSubmitted ? (
                  <Card>
                    <CardContent className="pt-8 pb-8 text-center space-y-4">
                      <div className="mx-auto h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center">
                        <CheckCircle className="h-8 w-8 text-green-500" />
                      </div>
                      <h3 className="text-2xl font-semibold">Thank You!</h3>
                      <p className="text-muted-foreground">Your inquiry has been submitted. I'll review your message and get back to you within 1-2 business days.</p>
                      <Link href="/"><Button variant="outline" className="mt-4" data-testid="button-back-home"><ArrowLeft className="mr-2 h-4 w-4" />Back to Home</Button></Link>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5" />Get in Touch</CardTitle>
                      <CardDescription>Interested in using this simulation in your course? Fill out the form and I'll reach out to discuss how it fits your curriculum.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleContactSubmit} className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="contact-name">Name *</Label>
                            <Input id="contact-name" value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Your name" required data-testid="input-educator-name" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="contact-email">Email *</Label>
                            <Input id="contact-email" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="your.email@institution.edu" required data-testid="input-educator-email" />
                          </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="contact-phone">Phone (Optional)</Label>
                            <Input id="contact-phone" type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="+1 (555) 123-4567" data-testid="input-educator-phone" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="contact-institution">Institution Type</Label>
                            <Select value={contactInstitution} onValueChange={setContactInstitution}>
                              <SelectTrigger data-testid="select-institution"><SelectValue placeholder="Select type..." /></SelectTrigger>
                              <SelectContent>
                                {INSTITUTIONS.map((inst) => (<SelectItem key={inst} value={inst} data-testid={`option-institution-${inst.toLowerCase().replace(/\s+/g, '-')}`}>{inst}</SelectItem>))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="contact-inquiry-type">What can I help you with?</Label>
                          <Select value={inquiryType} onValueChange={setInquiryType}>
                            <SelectTrigger data-testid="select-inquiry-type"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {INQUIRY_TYPES.map((type) => (<SelectItem key={type.value} value={type.value} data-testid={`option-inquiry-${type.value}`}>{type.label}</SelectItem>))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="contact-message">Message *</Label>
                          <Textarea id="contact-message" value={contactMessage} onChange={(e) => setContactMessage(e.target.value)} placeholder="Tell me about your course, class size, and how you'd like to use the simulation..." className="min-h-32" required data-testid="input-educator-message" />
                        </div>
                        <Button type="submit" className="w-full" disabled={submitMutation.isPending} data-testid="button-submit-inquiry">
                          {submitMutation.isPending ? "Sending..." : <><Send className="mr-2 h-4 w-4" />Send Inquiry</>}
                        </Button>
                        <p className="text-xs text-muted-foreground text-center">
                          Or reach out directly at <a href="mailto:doug@futureworkacademy.com" className="text-primary hover:underline">doug@futureworkacademy.com</a>
                        </p>
                      </form>
                    </CardContent>
                  </Card>
                )}
              </FadeInSection>
            </div>

            <FadeInSection delay={400}>
              <div className="mt-16 max-w-2xl mx-auto">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-5">
                      <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0">
                        <img src={danMitchellPhoto} alt="Douglas E. Mitchell" className="w-full h-full object-cover" data-testid="img-educator-photo" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">Doug Mitchell</h3>
                        <p className="text-sm text-muted-foreground mb-2">Master of Analytics program, Grand View University</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          I built this simulation to challenge students to lead through pressure, constant change, and ambiguity.
                          I'd love to show you how it works.
                        </p>
                        <div className="flex items-center gap-4 mt-3">
                          <a href="mailto:doug@futureworkacademy.com" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline" data-testid="link-email"><Mail className="h-4 w-4" />Email</a>
                          <a href="https://linkedin.com/in/dougmitchell" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline" data-testid="link-linkedin"><Linkedin className="h-4 w-4" />LinkedIn</a>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </FadeInSection>
          </div>
        </section>

        <section className="py-12 px-4 bg-muted/30 border-t" id="references">
          <div className="container mx-auto max-w-4xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
                Academic References & Research Library
              </h3>
              <a href="/white-paper" className="text-sm text-primary hover:underline font-medium" data-testid="link-white-paper-from-refs">
                Read the full White Paper &rarr;
              </a>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p className="pl-8 -indent-8">
                <sup className="text-primary font-bold">1</sup>{" "}
                Hay, G., & Heracleous, L. (2009). Bridging the scholar-practitioner divide. <em>The Journal of Applied Behavioral Science</em>.{" "}
                <a href="https://doi.org/10.1177/0021886309336780" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">doi:10.1177/0021886309336780</a>
              </p>
              <p className="pl-8 -indent-8">
                <sup className="text-primary font-bold">2</sup>{" "}
                Ungureanu, P., & Bertolotti, F. (2022). Dynamic stereotyping across occupations. <em>The Journal of Applied Behavioral Science</em>.{" "}
                <a href="https://doi.org/10.1177/00218863221084149" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">doi:10.1177/00218863221084149</a>
              </p>
              <p className="pl-8 -indent-8">
                <sup className="text-primary font-bold">3</sup>{" "}
                United Nations Development Programme Eurasia Regional Hub. (2025). <em>Listening to 200 young people about work</em>. UNDP.{" "}
                <a href="https://www.undp.org/eurasia/publications/listening-200-young-people-about-work" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">undp.org</a>
              </p>
              <p className="pl-8 -indent-8">
                <sup className="text-primary font-bold">4</sup>{" "}
                Argyris, C. (2009). Actionable knowledge. In H. Tsoukas & C. Knudsen (Eds.), <em>The Oxford handbook of organization theory</em>. Oxford University Press.{" "}
                <a href="https://doi.org/10.1093/oxfordhb/9780199275250.003.0016" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">doi:10.1093/oxfordhb/9780199275250.003.0016</a>
              </p>
              <p className="pl-8 -indent-8">
                <sup className="text-primary font-bold">5</sup>{" "}
                United Nations Development Programme. (2025). <em>Future of Work Academy: Green & digital transitions</em>. UNDP.{" "}
                <a href="https://www.undp.org/eurasia/future-work-academy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">undp.org</a>
              </p>
              <p className="pl-8 -indent-8">
                <sup className="text-primary font-bold">6</sup>{" "}
                Kolb, D. A. (1984). <em>Experiential learning: Experience as the source of learning and development</em>. Prentice-Hall.
              </p>
              <p className="pl-8 -indent-8">
                <sup className="text-primary font-bold">7</sup>{" "}
                Bartunek, J. M., & Rynes, S. L. (2014). Academics and practitioners are alike and unlike: The paradoxes of academic-practitioner relationships. <em>Journal of Management, 40</em>(5), 1181-1201.{" "}
                <a href="https://doi.org/10.1177/0149206314529160" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">doi:10.1177/0149206314529160</a>
              </p>
              <p className="pl-8 -indent-8">
                <sup className="text-primary font-bold">8</sup>{" "}
                Kapur, M. (2016). Examining productive failure, productive success, and unproductive failure in learning. <em>Educational Psychologist, 51</em>(2), 289-299.{" "}
                <a href="https://doi.org/10.1080/00461520.2016.1155457" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">doi:10.1080/00461520.2016.1155457</a>
              </p>
              <p className="pl-8 -indent-8">
                <sup className="text-primary font-bold">9</sup>{" "}
                Black, P., & Wiliam, D. (1998). Assessment and classroom learning. <em>Assessment in Education: Principles, Policy & Practice, 5</em>(1), 7-74.{" "}
                <a href="https://doi.org/10.1080/0969595980050102" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">doi:10.1080/0969595980050102</a>
              </p>
              <p className="pl-8 -indent-8">
                <sup className="text-primary font-bold">10</sup>{" "}
                Wood, D., Bruner, J. S., & Ross, G. (1976). The role of tutoring in problem solving. <em>Journal of Child Psychology and Psychiatry, 17</em>(2), 89-100.{" "}
                <a href="https://doi.org/10.1111/j.1469-7610.1976.tb00381.x" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">doi:10.1111/j.1469-7610.1976.tb00381.x</a>
              </p>
              <p className="pl-8 -indent-8">
                <sup className="text-primary font-bold">11</sup>{" "}
                Hattie, J., & Timperley, H. (2007). The power of feedback. <em>Review of Educational Research, 77</em>(1), 81-112.{" "}
                <a href="https://doi.org/10.3102/003465430298487" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">doi:10.3102/003465430298487</a>
              </p>
              <p className="pl-8 -indent-8">
                <sup className="text-primary font-bold">12</sup>{" "}
                Brown, J. S., Collins, A., & Duguid, P. (1989). Situated cognition and the culture of learning. <em>Educational Researcher, 18</em>(1), 32-42.{" "}
                <a href="https://doi.org/10.3102/0013189X018001032" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">doi:10.3102/0013189X018001032</a>
              </p>
              <p className="pl-8 -indent-8">
                <sup className="text-primary font-bold">13</sup>{" "}
                Mitchell, R. K., Agle, B. R., & Wood, D. J. (1997). Toward a theory of stakeholder identification and salience. <em>Academy of Management Review, 22</em>(4), 853-886.{" "}
                <a href="https://doi.org/10.5465/amr.1997.9711022105" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">doi:10.5465/amr.1997.9711022105</a>
              </p>
              <p className="pl-8 -indent-8">
                <sup className="text-primary font-bold">14</sup>{" "}
                Shermis, M. D., & Burstein, J. (Eds.). (2013). <em>Handbook of automated essay evaluation: Current applications and new directions</em>. Routledge.
              </p>
              <p className="pl-8 -indent-8">
                <sup className="text-primary font-bold">15</sup>{" "}
                Kayes, D. C. (2002). Experiential learning and its critics: Preserving the role of experience in management learning and education. <em>Academy of Management Learning & Education, 1</em>(2), 137-149.{" "}
                <a href="https://doi.org/10.5465/amle.2002.8509336" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">doi:10.5465/amle.2002.8509336</a>
              </p>
              <p className="pl-8 -indent-8">
                <sup className="text-primary font-bold">16</sup>{" "}
                Future Work Academy. (2026). <em>AI transparency & prompt documentation</em> [Internal technical audit]. FWA.
              </p>
              <p className="pl-8 -indent-8">
                <sup className="text-primary font-bold">17</sup>{" "}
                Future Work Academy. (2026). <em>Security & compliance documentation</em> [FERPA alignment]. FWA.
              </p>
            </div>
          </div>
        </section>

      </main>

      <AppFooter />
    </div>
  );
}
