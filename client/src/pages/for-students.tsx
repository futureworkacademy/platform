import { useState } from "react";
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
  Sparkles,
  Share2,
  Mail,
  CheckCircle,
  Play,
  Brain,
  GraduationCap,
  Rocket,
  Copy,
  ExternalLink,
} from "lucide-react";
import logoForLight from "@assets/logo-horizontal.png";
import logoForDark from "@assets/logo-white.png";
import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const TRIAL_FEATURES = [
  {
    icon: Brain,
    title: "AI-Graded Decisions",
    description: "Write strategic rationales evaluated by AI, getting instant feedback on your business acumen",
  },
  {
    icon: BarChart3,
    title: "Dual-Score Tracking",
    description: "Monitor your financial performance AND cultural health - just like real executives do",
  },
  {
    icon: Users,
    title: "17 Stakeholders",
    description: "Navigate complex relationships with employees, union reps, investors, and board members",
  },
  {
    icon: Target,
    title: "Real Consequences",
    description: "Every choice impacts revenue, morale, and workforce dynamics - no safe answers",
  },
];

const SIMULATION_HIGHLIGHTS = [
  { week: "Week 1", title: "The Automation Mandate", description: "CEO announces AI transformation - you decide the approach" },
  { week: "Week 2", title: "Workforce Anxiety", description: "Employees push back - manage displacement fears and retention" },
  { week: "Week 3", title: "Financial Pressure", description: "Board demands ROI on automation investment" },
  { week: "Weeks 4-8", title: "Escalating Complexity", description: "Union threats, Gen Z pipeline crisis, ethical dilemmas" },
];

export default function ForStudents() {
  const { toast } = useToast();
  const [trialActivated, setTrialActivated] = useState(false);
  const [showReferral, setShowReferral] = useState(false);
  const [referralCopied, setReferralCopied] = useState(false);

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
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <ArrowLeft className="h-4 w-4 text-muted-foreground" />
              <img
                src={logoForLight}
                alt="Future Work Academy"
                className="h-12 w-auto block dark:hidden"
                data-testid="img-header-logo-light"
              />
              <img
                src={logoForDark}
                alt="Future Work Academy"
                className="h-12 w-auto hidden dark:block"
                data-testid="img-header-logo-dark"
              />
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <a
              href="/for-educators"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:inline"
              data-testid="link-educator-page"
            >
              For Educators
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
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl text-center space-y-6">
            <Badge variant="secondary" className="text-sm" data-testid="badge-trial">
              <Clock className="h-3 w-3 mr-1" />
              7-Day Free Trial
            </Badge>
            <h1
              className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground"
              data-testid="text-hero-heading"
            >
              Can You Lead a Company Through the AI Revolution?
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto" data-testid="text-hero-description">
              Step into the CEO's shoes at Apex Manufacturing. Make strategic decisions about automation, 
              manage workforce anxiety, and prove you can lead when the stakes are real.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
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
            </div>
            <p className="text-xs text-muted-foreground">
              Sign in with any account. No credit card. No .edu email required.
            </p>
          </div>
        </section>

        <section className="py-16 px-4 bg-card/30">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold mb-2" data-testid="text-features-heading">What You'll Experience</h2>
              <p className="text-sm text-muted-foreground">Skills that employers actually look for</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {TRIAL_FEATURES.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <Card key={index} className="bg-card" data-testid={`card-feature-${index}`}>
                    <CardHeader>
                      <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center mb-2">
                        <IconComponent className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-16 px-4">
          <div className="container mx-auto max-w-3xl">
            <h2 className="text-2xl font-bold text-center mb-8" data-testid="text-timeline-heading">Your 8-Week Journey</h2>
            <div className="space-y-4">
              {SIMULATION_HIGHLIGHTS.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 rounded-md bg-card/50 border"
                  data-testid={`timeline-item-${index}`}
                >
                  <Badge variant="outline" className="shrink-0 font-mono text-xs">
                    {item.week}
                  </Badge>
                  <div>
                    <p className="font-medium text-sm">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 px-4 bg-card/30">
          <div className="container mx-auto max-w-3xl text-center space-y-6">
            <h2 className="text-2xl font-bold" data-testid="text-how-heading">How the Trial Works</h2>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="space-y-2">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <span className="text-lg font-bold text-primary">1</span>
                </div>
                <p className="text-sm font-medium">Sign In</p>
                <p className="text-xs text-muted-foreground">Use any account - Google, GitHub, etc.</p>
              </div>
              <div className="space-y-2">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <span className="text-lg font-bold text-primary">2</span>
                </div>
                <p className="text-sm font-medium">Play for 7 Days</p>
                <p className="text-xs text-muted-foreground">Full access to Week 1 of the simulation</p>
              </div>
              <div className="space-y-2">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <span className="text-lg font-bold text-primary">3</span>
                </div>
                <p className="text-sm font-medium">Share It</p>
                <p className="text-xs text-muted-foreground">Tell your professor - they get 30 days free</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 px-4">
          <div className="container mx-auto max-w-xl">
            <Card className="border-primary/20" data-testid="card-referral">
              <CardHeader className="text-center">
                <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-2">
                  <Share2 className="h-6 w-6 text-accent" />
                </div>
                <CardTitle className="text-lg">Think Your Class Should Use This?</CardTitle>
                <CardDescription>
                  Share the platform with your instructor. They get a free 30-day educator demo 
                  with full access to all features.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
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
                <p className="text-[10px] text-muted-foreground text-center">
                  When your professor signs up through your link, we'll know you referred them
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="py-16 px-4 bg-primary text-primary-foreground">
          <div className="container mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold mb-4" data-testid="text-cta-heading">Ready to Prove Your Leadership?</h2>
            <p className="opacity-90 mb-6">
              7 days. Zero cost. Real strategic decisions. Find out if you've got what it takes.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="/api/login">
                <Button variant="secondary" size="lg" data-testid="button-bottom-cta">
                  Start Your Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
            </div>
            <div className="mt-8 pt-6 border-t border-primary-foreground/20">
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
          </div>
        </section>
      </main>

      <AppFooter />
    </div>
  );
}
