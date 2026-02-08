import { useState, useMemo } from "react";
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
  Play
} from "lucide-react";
import danMitchellPhoto from "@assets/image_1768085802226.png";
import logoForLight from "@assets/logo-horizontal.png";
import logoForDark from "@assets/logo-white.png";
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

export default function ForEducators() {
  const { toast } = useToast();

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
    mutationFn: async (data: {
      email: string;
      name: string;
      institution?: string;
      message?: string;
      referralSource?: string;
    }) => {
      const response = await apiRequest('POST', '/api/demo/request-access', data);
      return response.json();
    },
    onSuccess: (data) => {
      setDemoProvisioned(true);
      setDemoCode(data.demoCode || 'DEMO2025');
      setDemoExpiresAt(data.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString());
      setDemoEmail(demoEmailInput);
      toast({
        title: "Demo access granted!",
        description: "You can now sign in and explore the platform.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to provision demo access",
        description: "Please try again or email doug@futureworkacademy.com directly.",
        variant: "destructive",
      });
    }
  });

  const submitMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      email: string;
      phone?: string;
      institution?: string;
      inquiryType: string;
      message: string;
      referralSource?: string;
    }) => {
      return apiRequest('POST', '/api/educator-inquiry', data);
    },
    onSuccess: () => {
      setContactSubmitted(true);
    },
    onError: () => {
      toast({
        title: "Failed to send inquiry",
        description: "Please try again or email doug@futureworkacademy.com directly.",
        variant: "destructive",
      });
    }
  });

  const handleDemoRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoName || !demoEmailInput) {
      toast({
        title: "Missing fields",
        description: "Please fill in your name and email.",
        variant: "destructive",
      });
      return;
    }
    demoMutation.mutate({
      name: demoName,
      email: demoEmailInput,
      institution: demoInstitution || undefined,
      message: `Instant demo request from educator page`,
      referralSource: referralSource || undefined,
    });
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    submitMutation.mutate({
      name: contactName,
      email: contactEmail,
      phone: contactPhone || undefined,
      institution: contactInstitution || undefined,
      inquiryType,
      message: contactMessage,
      referralSource: referralSource || undefined,
    });
  };

  if (demoProvisioned) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
            <Link href="/">
              <img
                src={logoForLight}
                alt="Future Work Academy"
                className="h-16 w-auto cursor-pointer block dark:hidden"
                data-testid="img-header-logo-light"
              />
              <img
                src={logoForDark}
                alt="Future Work Academy"
                className="h-16 w-auto cursor-pointer hidden dark:block"
                data-testid="img-header-logo-dark"
              />
            </Link>
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
              <CardDescription className="text-base">
                Your evaluator account has been created. You can now explore the full simulation experience.
              </CardDescription>
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
                    {demoExpiresAt && !isNaN(new Date(demoExpiresAt).getTime())
                      ? new Date(demoExpiresAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : '30 days from today'
                    }
                  </span>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-semibold text-sm mb-2">What's included in your demo:</h4>
                <ul className="text-sm text-muted-foreground space-y-1 text-left">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Pre-populated demo class with sample students
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Full access to instructor dashboard features
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Student preview mode to experience their view
                  </li>
                  <li className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    Sandboxed environment (no real student data)
                  </li>
                </ul>
              </div>

              <div className="pt-2 space-y-3">
                <a href="/api/login">
                  <Button className="w-full gap-2" data-testid="button-start-demo">
                    <Play className="h-4 w-4" />
                    Sign In & Start Exploring
                  </Button>
                </a>
                <p className="text-xs text-muted-foreground">
                  Sign in with <strong>{demoEmail || 'your email'}</strong> to access your demo environment
                </p>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Link href="/">
            <img
              src={logoForLight}
              alt="Future Work Academy"
              className="h-16 w-auto cursor-pointer block dark:hidden"
              data-testid="img-header-logo-light"
            />
            <img
              src={logoForDark}
              alt="Future Work Academy"
              className="h-16 w-auto cursor-pointer hidden dark:block"
              data-testid="img-header-logo-dark"
            />
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Home</span>
              </Button>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main>
        {/* HERO: Academic positioning - Attention */}
        <section className="py-16 px-4 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto max-w-5xl text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <GraduationCap className="h-4 w-4" />
              Operationalizing the Scholar-Practitioner Interface
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              Bridging the "Great Divide"
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Management education faces a persistent "Relevance Gap" between academic theory
              and practice.<sup>1</sup> Traditional case studies are often static, failing to capture
              the messy, complex phenomena of real organizational life.<sup>2</sup>
            </p>
            <p className="text-base text-foreground font-medium max-w-2xl mx-auto">
              Future Work Academy is an immersive simulation platform designed to close this gap—moving
              students from passive analysis to dynamic "Actionable Knowledge."<sup>4</sup>
            </p>
          </div>
        </section>

        {/* PRIMARY CTA: Instant Demo - Interest/Action */}
        <section className="py-12 px-4 bg-muted/30">
          <div className="container mx-auto max-w-5xl">
            <div className="grid lg:grid-cols-2 gap-8 items-start">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-4">Schedule a 15-Minute Demo</h2>
                  <p className="text-muted-foreground">
                    See how Future Work Academy can transform your AI/workforce management curriculum.
                    We'll walk through the simulation, grading system, and instructor dashboard.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Quick Setup</p>
                      <p className="text-sm text-muted-foreground">Get your class running in under an hour with our onboarding support</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Flexible Class Sizes</p>
                      <p className="text-sm text-muted-foreground">Works for seminars of 15 or cohorts of 150+</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <BookOpen className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Curriculum Integration</p>
                      <p className="text-sm text-muted-foreground">Complements strategy, HR, ethics, and technology management courses</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  <span>
                    Prefer email? <a
                      href="mailto:doug@futureworkacademy.com?subject=Demo Request - Future Work Academy"
                      className="text-primary font-medium hover:underline"
                      data-testid="link-email-contact"
                    >doug@futureworkacademy.com</a>
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <Share2 className="h-4 w-4 flex-shrink-0" />
                  <span>
                    <span className="font-medium text-foreground">Referral:</span> Refer a colleague and both get 15% off
                  </span>
                </div>
              </div>

              <div className="space-y-6">
                <Card className="border-green-500/30 bg-green-500/5">
                  <CardHeader>
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-green-500" />
                        Try It Now
                      </CardTitle>
                      <span className="text-xs bg-green-500/20 text-green-600 dark:text-green-400 px-2 py-1 rounded-full font-medium">
                        Instant Access
                      </span>
                    </div>
                    <CardDescription>
                      Get immediate demo access—no waiting, no scheduling required
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleDemoRequest} className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="demo-name">Your Name *</Label>
                          <Input
                            id="demo-name"
                            placeholder="Dr. Jane Smith"
                            value={demoName}
                            onChange={(e) => setDemoName(e.target.value)}
                            data-testid="input-demo-name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="demo-email">Work Email *</Label>
                          <Input
                            id="demo-email"
                            type="email"
                            placeholder="name@company.com"
                            value={demoEmailInput}
                            onChange={(e) => setDemoEmailInput(e.target.value)}
                            data-testid="input-demo-email"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="demo-institution">Organization (optional)</Label>
                        <Input
                          id="demo-institution"
                          placeholder="Your company or university"
                          value={demoInstitution}
                          onChange={(e) => setDemoInstitution(e.target.value)}
                          data-testid="input-demo-institution"
                        />
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-2">
                        <p className="font-medium flex items-center gap-2">
                          <Lock className="h-4 w-4 text-muted-foreground" />
                          What you'll get:
                        </p>
                        <ul className="text-muted-foreground text-xs space-y-1 ml-6">
                          <li>30-day evaluator access to explore the full platform</li>
                          <li>Pre-populated demo class with sample students</li>
                          <li>Sandboxed environment—completely isolated from real courses</li>
                        </ul>
                      </div>
                      <Button
                        type="submit"
                        className="w-full gap-2"
                        disabled={demoMutation.isPending}
                        data-testid="button-instant-demo"
                      >
                        {demoMutation.isPending ? (
                          <>Processing...</>
                        ) : (
                          <>
                            <Play className="h-4 w-4" />
                            Start Exploring Now
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* VALUE PROPOSITIONS - Desire */}
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card className="text-center hover-elevate">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">"White Box" Assessment</h3>
                  <p className="text-sm text-muted-foreground">
                    Unlike "black box" AI tools that obscure evaluation logic, FWA uses transparent,
                    rubric-based LLM evaluation with deterministic settings for consistency.<sup>6</sup>
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center hover-elevate">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Dual-Scoring System</h3>
                  <p className="text-sm text-muted-foreground">
                    Students manage a dual scoreboard: Financial Health (ROI, Revenue) and Cultural Health
                    (Morale, Union Sentiment)—operationalizing ethics and economics.<sup>7</sup>
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center hover-elevate">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Institutional Control</h3>
                  <p className="text-sm text-muted-foreground">
                    Sandbox Mode enables instructors to audit the entire student journey prior to deployment.
                    FERPA-compliant architecture strips PII before AI interaction.<sup>8,9</sup>
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* SIMULATION MODULES - Desire */}
        <section className="py-12 px-4 bg-muted/20 border-y">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Simulation Modules</h2>
              <p className="text-muted-foreground">
                Scenario-based learning across strategic business challenges
              </p>
            </div>

            <div className="mb-8">
              <h3 className="text-sm font-semibold text-primary uppercase tracking-wide mb-4 text-center">
                Currently Available
              </h3>
              <Card className="max-w-2xl mx-auto border-primary/30 bg-card">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Factory className="h-7 w-7 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg mb-1">The Future of Work</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Lead Apex Manufacturing through 8 weeks of AI adoption decisions. Balance automation
                        investments, workforce reskilling, union relations, and stakeholder management while
                        navigating global events and competitive pressures.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">AI Strategy</span>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">Workforce Transformation</span>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">Labor Relations</span>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">8 Weeks</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4 text-center">
                In Development
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="bg-card/50 border-dashed">
                  <CardContent className="pt-5 pb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                        <Truck className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <h4 className="font-semibold">Supply Chain Resilience</h4>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Global disruption, supplier diversification, and logistics optimization
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 border-dashed">
                  <CardContent className="pt-5 pb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                        <Leaf className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <h4 className="font-semibold">Sustainability & ESG</h4>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Carbon reduction, stakeholder capitalism, and ESG reporting
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 border-dashed">
                  <CardContent className="pt-5 pb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                        <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <h4 className="font-semibold">Crisis Management</h4>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Rapid response, stakeholder communication, and reputation recovery
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 border-dashed">
                  <CardContent className="pt-5 pb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                        <Globe className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <h4 className="font-semibold">Digital Transformation</h4>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Legacy business modernization, technology adoption, and change resistance
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 border-dashed">
                  <CardContent className="pt-5 pb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                        <UserCog className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <h4 className="font-semibold">Change Management</h4>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Organizational restructuring, employee engagement, and culture transformation
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="pt-5 pb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <h4 className="font-semibold text-primary">Custom Module?</h4>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      We partner with institutions to develop industry-specific scenarios
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* QUOTE - Social proof */}
        <section className="py-8 px-4 border-b">
          <div className="container mx-auto max-w-5xl text-center">
            <p className="text-base text-muted-foreground italic">
              "FWA places students in an executive sandbox, forcing them to navigate the Twin Transition—the
              simultaneous shift to digital and green economies—cited by the UNDP as the defining labor market
              challenge of 2030."<sup>5</sup>
            </p>
          </div>
        </section>

        {/* SECONDARY CTA: Doug's bio + Contact Form - Action (deliberative path) */}
        <section className="py-12 px-4" id="contact">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Let's Talk</h2>
              <p className="text-muted-foreground">
                Prefer a personal conversation? Reach out and we'll discuss how the simulation fits your curriculum.
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              <div className="space-y-6">
                <Card className="bg-card">
                  <CardContent className="pt-6">
                    <div className="float-left mr-5 mb-3">
                      <div className="w-36 h-36 rounded-lg overflow-hidden">
                        <img
                          src={danMitchellPhoto}
                          alt="Douglas E. Mitchell"
                          className="w-full h-full object-cover"
                          data-testid="img-educator-photo"
                        />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">Welcome to my playground</h3>
                      <p className="text-sm text-muted-foreground mb-3">I'm Doug and I'm humbled that you stopped by.</p>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                      This simulation is designed to challenge students to lead (and follow) effectively through
                      tremendous pressure, constant change, and variable macro-economic conditions. Students work
                      together in teams and are scored individually on their decisions.
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      The simulation has been designed for the modern graduate student and features:
                    </p>
                    <ul className="space-y-2 mb-4">
                      <li className="flex items-start gap-2 text-sm text-muted-foreground">
                        <FileText className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>Rich background information dossier on the organization, team members, and stakeholders.</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Sparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>Special "Easter Egg" information items that carry more weight through the simulation.</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Newspaper className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>Weekly briefing packages delivered with press releases, interviews, and podcasts with corporate, union, and other factions represented.</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Settings className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>Injectable "special situations" to alter the simulation.</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-muted-foreground">
                        <UserCog className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>Professors are assigned a "class admin" role and can create and manage teams of students.</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-muted-foreground">
                        <ShieldCheck className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>Privacy Mode enables anonymous enrollment without collecting student PII.</span>
                      </li>
                    </ul>
                    <div className="border-t pt-4 mt-4">
                      <h4 className="font-medium text-sm mb-2">About Me</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        I teach in the Masters of Analytics program at Grand View University and build products that sit at the intersection of Leadership and Analytics.
                      </p>
                    </div>
                    <div className="clear-both flex items-center gap-3 pt-2">
                      <a
                        href="mailto:doug@futureworkacademy.com"
                        className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                        data-testid="link-email"
                      >
                        <Mail className="h-4 w-4" />
                        doug@futureworkacademy.com
                      </a>
                      <a
                        href="https://linkedin.com/in/dougmitchell"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                        data-testid="link-linkedin"
                      >
                        <Linkedin className="h-4 w-4" />
                        LinkedIn
                      </a>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Why Use This Simulation?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2 p-3 rounded-lg bg-muted/50">
                        <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                          <BookOpen className="h-4 w-4 text-primary" />
                        </div>
                        <h4 className="font-medium text-sm">Experiential Learning</h4>
                        <p className="text-xs text-muted-foreground">Students make real strategic decisions and see immediate consequences over 8 simulated weeks.</p>
                      </div>
                      <div className="flex flex-col gap-2 p-3 rounded-lg bg-muted/50">
                        <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                        <h4 className="font-medium text-sm">Team Collaboration</h4>
                        <p className="text-xs text-muted-foreground">Groups work together to balance financial performance with cultural health.</p>
                      </div>
                      <div className="flex flex-col gap-2 p-3 rounded-lg bg-muted/50">
                        <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                          <TrendingUp className="h-4 w-4 text-primary" />
                        </div>
                        <h4 className="font-medium text-sm">Real-World Relevance</h4>
                        <p className="text-xs text-muted-foreground">Weekly briefings feature current AI adoption trends and workforce challenges.</p>
                      </div>
                      <div className="flex flex-col gap-2 p-3 rounded-lg bg-muted/50">
                        <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                          <Award className="h-4 w-4 text-primary" />
                        </div>
                        <h4 className="font-medium text-sm">Competitive Element</h4>
                        <p className="text-xs text-muted-foreground">Leaderboard rankings drive engagement and reflection on strategy choices.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                {contactSubmitted ? (
                  <Card className="bg-card">
                    <CardContent className="pt-8 pb-8 text-center space-y-4">
                      <div className="mx-auto h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center">
                        <CheckCircle className="h-8 w-8 text-green-500" />
                      </div>
                      <h3 className="text-2xl font-semibold">Thank You for Your Interest!</h3>
                      <p className="text-muted-foreground">
                        Your inquiry has been submitted. I'll review your message and get back to you within 1-2 business days.
                      </p>
                      <Link href="/">
                        <Button variant="outline" className="mt-4" data-testid="button-back-home">
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Back to Home
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="bg-card sticky top-24">
                    <CardHeader>
                      <CardTitle>Get in Touch</CardTitle>
                      <CardDescription>
                        Interested in using this simulation in your course? Fill out the form below and I'll reach out to discuss how it can fit your curriculum.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleContactSubmit} className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="contact-name">Name *</Label>
                            <Input
                              id="contact-name"
                              value={contactName}
                              onChange={(e) => setContactName(e.target.value)}
                              placeholder="Your name"
                              required
                              data-testid="input-educator-name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="contact-email">Email *</Label>
                            <Input
                              id="contact-email"
                              type="email"
                              value={contactEmail}
                              onChange={(e) => setContactEmail(e.target.value)}
                              placeholder="your.email@institution.edu"
                              required
                              data-testid="input-educator-email"
                            />
                          </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="contact-phone">Phone (Optional)</Label>
                            <Input
                              id="contact-phone"
                              type="tel"
                              value={contactPhone}
                              onChange={(e) => setContactPhone(e.target.value)}
                              placeholder="+1 (555) 123-4567"
                              data-testid="input-educator-phone"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="contact-institution">Institution Type</Label>
                            <Select value={contactInstitution} onValueChange={setContactInstitution}>
                              <SelectTrigger data-testid="select-institution">
                                <SelectValue placeholder="Select type..." />
                              </SelectTrigger>
                              <SelectContent>
                                {INSTITUTIONS.map((inst) => (
                                  <SelectItem key={inst} value={inst} data-testid={`option-institution-${inst.toLowerCase().replace(/\s+/g, '-')}`}>
                                    {inst}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="contact-inquiry-type">What can I help you with?</Label>
                          <Select value={inquiryType} onValueChange={setInquiryType}>
                            <SelectTrigger data-testid="select-inquiry-type">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {INQUIRY_TYPES.map((type) => (
                                <SelectItem key={type.value} value={type.value} data-testid={`option-inquiry-${type.value}`}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="contact-message">Message *</Label>
                          <Textarea
                            id="contact-message"
                            value={contactMessage}
                            onChange={(e) => setContactMessage(e.target.value)}
                            placeholder="Tell me about your course, class size, and how you'd like to use the simulation..."
                            className="min-h-32"
                            required
                            data-testid="input-educator-message"
                          />
                        </div>

                        <Button
                          type="submit"
                          className="w-full"
                          disabled={submitMutation.isPending}
                          data-testid="button-submit-inquiry"
                        >
                          {submitMutation.isPending ? (
                            "Sending..."
                          ) : (
                            <>
                              <Send className="mr-2 h-4 w-4" />
                              Send Inquiry
                            </>
                          )}
                        </Button>

                        <p className="text-xs text-muted-foreground text-center">
                          Or reach out directly at{" "}
                          <a href="mailto:doug@futureworkacademy.com" className="text-primary hover:underline">
                            doug@futureworkacademy.com
                          </a>
                        </p>
                      </form>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ACTIONABLE KNOWLEDGE - Closing */}
        <section className="py-12 px-4 border-t">
          <div className="container mx-auto max-w-2xl text-center space-y-4">
            <h3 className="text-xl font-semibold">The Result: Actionable Knowledge</h3>
            <p className="text-muted-foreground">
              FWA moves beyond theory to create a risk-free environment for "productive failure."
              It provides the data-driven rigor required by the PhD community while delivering
              the engagement required by students—preparing them for the 15–20 distinct career
              shifts expected of the modern "Learning-Worker."<sup>3</sup>
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <a href="mailto:doug@futureworkacademy.com?subject=Demo Request - Future Work Academy">
                <Button size="lg" className="gap-2">
                  <Mail className="h-4 w-4" />
                  Email for Demo
                </Button>
              </a>
              <Link href="/">
                <Button size="lg" variant="outline" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ACADEMIC REFERENCES - Trust */}
        <section className="py-8 px-4 bg-muted/20 border-t" id="references">
          <div className="container mx-auto max-w-4xl">
            <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wide">
              Academic Methodology & Research Library
            </h3>
            <div className="space-y-2 text-[10px] leading-relaxed text-muted-foreground" style={{ fontSize: '10px' }}>
              <p className="pl-6 -indent-6">
                <sup>1</sup> Hay, G., & Heracleous, L. (2009). Bridging the scholar-practitioner divide. <em>The Journal of Applied Behavioral Science</em>.
              </p>
              <p className="pl-6 -indent-6">
                <sup>2</sup> Ungureanu, P., & Bertolotti, F. (2022). Dynamic stereotyping across occupations. <em>The Journal of Applied Behavioral Science</em>.
              </p>
              <p className="pl-6 -indent-6">
                <sup>3</sup> United Nations Development Programme Eurasia Regional Hub. (2025). <em>Listening to 200 young people about work</em>. UNDP.
              </p>
              <p className="pl-6 -indent-6">
                <sup>4</sup> Argyris, C. (2009). <em>Actionable knowledge</em>. In H. Tsoukas & C. Knudsen (Eds.), The Oxford handbook of organization theory. Oxford University Press.
              </p>
              <p className="pl-6 -indent-6">
                <sup>5</sup> United Nations Development Programme. (2025). <em>Future of Work Academy: Green & digital transitions</em>. UNDP.
              </p>
              <p className="pl-6 -indent-6">
                <sup>6</sup> Future Work Academy. (2026). <em>AI transparency & prompt documentation</em> [Internal technical audit]. FWA.
              </p>
              <p className="pl-6 -indent-6">
                <sup>7</sup> Future Work Academy. (2026). <em>The future of work: Game design document</em> [Simulation mechanics]. FWA.
              </p>
              <p className="pl-6 -indent-6">
                <sup>8</sup> Future Work Academy. (2026). <em>FWA business plan</em> [Instructor tools]. FWA.
              </p>
              <p className="pl-6 -indent-6">
                <sup>9</sup> Future Work Academy. (2026). <em>FWA security & compliance documentation</em> [FERPA/SOC2]. FWA.
              </p>
            </div>
          </div>
        </section>
      </main>

      <AppFooter />
    </div>
  );
}