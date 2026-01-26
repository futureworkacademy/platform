import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";
import { AppFooter } from "@/components/app-footer";
import { 
  ArrowLeft, 
  CheckCircle, 
  Mail, 
  Users, 
  GraduationCap, 
  Target, 
  BookOpen,
  Award,
  Clock,
  Sparkles,
  Share2,
  Building2,
  Factory,
  Truck,
  Leaf,
  AlertTriangle,
  Globe,
  UserCog,
  Zap,
  Lock,
  Play
} from "lucide-react";
import logoDark from "@assets/logo-dark.svg";
import logoLight from "@assets/logo-light.svg";
import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Academia() {
  const { toast } = useToast();
  const [demoProvisioned, setDemoProvisioned] = useState(false);
  const [demoCode, setDemoCode] = useState('');
  const [demoExpiresAt, setDemoExpiresAt] = useState('');
  const [demoEmail, setDemoEmail] = useState('');
  
  const [demoName, setDemoName] = useState('');
  const [demoEmailInput, setDemoEmailInput] = useState('');
  const [demoInstitution, setDemoInstitution] = useState('');

  const demoMutation = useMutation({
    mutationFn: async (data: { 
      email: string; 
      name: string; 
      institution?: string;
      message?: string;
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
        description: "Please try again or use the contact form below.",
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
      message: `Instant demo request from academia page`
    });
  };

  if (demoProvisioned) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
            <Link href="/">
              <img 
                src={logoDark} 
                alt="Future Work Academy" 
                className="h-16 w-auto cursor-pointer block dark:hidden"
                data-testid="img-header-logo-light"
              />
              <img 
                src={logoLight} 
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
                <Link href="/login">
                  <Button className="w-full gap-2" data-testid="button-start-demo">
                    <Play className="h-4 w-4" />
                    Sign In & Start Exploring
                  </Button>
                </Link>
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
              src={logoDark} 
              alt="Future Work Academy" 
              className="h-16 w-auto cursor-pointer block dark:hidden"
              data-testid="img-header-logo-light"
            />
            <img 
              src={logoLight} 
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

        <section className="py-8 px-4 border-b">
          <div className="container mx-auto max-w-5xl text-center">
            <p className="text-base text-muted-foreground italic">
              "FWA places students in an executive sandbox, forcing them to navigate the Twin Transition—the 
              simultaneous shift to digital and green economies—cited by the UNDP as the defining labor market 
              challenge of 2030."<sup>5</sup>
            </p>
          </div>
        </section>

        <section className="py-12 px-4">
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
