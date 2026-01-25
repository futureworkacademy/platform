import { useState } from "react";
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
  Mail, 
  Calendar, 
  Users, 
  GraduationCap, 
  Target, 
  BookOpen,
  Award,
  Clock,
  Sparkles,
  Share2,
  Building2
} from "lucide-react";
import logo from "@assets/logo-icon-dark.png";
import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const DEMO_TIMES = [
  "Morning (9am-12pm ET)",
  "Afternoon (12pm-5pm ET)",
  "Evening (5pm-8pm ET)",
  "Flexible - Contact me to schedule"
];

const PROGRAM_TYPES = [
  { value: "mba", label: "MBA / Graduate Business Program" },
  { value: "undergrad", label: "Undergraduate Business" },
  { value: "executive", label: "Executive Education" },
  { value: "corporate", label: "Corporate Training" },
  { value: "community", label: "Community College" },
  { value: "other", label: "Other" }
];

export default function Academia() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [institution, setInstitution] = useState('');
  const [programType, setProgramType] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [classSize, setClassSize] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [message, setMessage] = useState('');

  const submitMutation = useMutation({
    mutationFn: async (data: { 
      name: string; 
      email: string; 
      institution?: string;
      inquiryType: string;
      message: string 
    }) => {
      return apiRequest('POST', '/api/educator-inquiry', data);
    },
    onSuccess: () => {
      setSubmitted(true);
    },
    onError: () => {
      toast({
        title: "Failed to send request",
        description: "Please try again or email doug@futureworkacademy.com directly.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      toast({
        title: "Missing fields",
        description: "Please fill in your name and email.",
        variant: "destructive",
      });
      return;
    }
    
    const fullMessage = `
Program Type: ${programType || 'Not specified'}
Preferred Demo Time: ${preferredTime || 'Not specified'}
Estimated Class Size: ${classSize || 'Not specified'}
Referral Code: ${referralCode || 'None'}

Additional Notes:
${message || 'None provided'}
    `.trim();
    
    submitMutation.mutate({ 
      name, 
      email, 
      institution: institution || undefined,
      inquiryType: 'demo_request',
      message: fullMessage
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
            <Link href="/">
              <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-md px-3 py-2">
                <img 
                  src={logo} 
                  alt="Future Work Academy" 
                  className="h-14 w-auto cursor-pointer"
                  data-testid="img-header-logo"
                />
              </div>
            </Link>
            <ThemeToggle />
          </div>
        </header>

        <main className="container mx-auto px-4 py-16 max-w-xl">
          <Card className="text-center">
            <CardHeader className="pb-4">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl">Demo Request Received</CardTitle>
              <CardDescription className="text-base">
                We'll be in touch within 24 hours to schedule your personalized demo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted/50 rounded-lg p-4 text-sm">
                <p className="text-muted-foreground">
                  In the meantime, feel free to reach out directly:
                </p>
                <a 
                  href="mailto:doug@futureworkacademy.com" 
                  className="text-primary font-medium hover:underline"
                >
                  doug@futureworkacademy.com
                </a>
              </div>
              
              <Link href="/">
                <Button variant="outline" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
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
            <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-md px-3 py-2">
              <img 
                src={logo} 
                alt="Future Work Academy" 
                className="h-14 w-auto cursor-pointer"
                data-testid="img-header-logo"
              />
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
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
          <div className="container mx-auto max-w-4xl text-center space-y-6">
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

        <section className="py-8 px-4 border-b">
          <div className="container mx-auto max-w-4xl text-center">
            <p className="text-base text-muted-foreground italic">
              "FWA places students in an executive sandbox, forcing them to navigate the Twin Transition—the 
              simultaneous shift to digital and green economies—cited by the UNDP as the defining labor market 
              challenge of 2030."<sup>5</sup>
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

                <Card className="bg-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Prefer to reach out directly?
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <a 
                      href="mailto:doug@futureworkacademy.com?subject=Demo Request - Future Work Academy" 
                      className="text-primary font-medium hover:underline"
                      data-testid="link-email-contact"
                    >
                      doug@futureworkacademy.com
                    </a>
                    <p className="text-sm text-muted-foreground mt-1">
                      Let's build decision-making muscle together!
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-primary/5 border-primary/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Share2 className="h-4 w-4" />
                      Referral Program
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <p className="text-muted-foreground">
                      Know a colleague who could benefit? Refer another program and both institutions 
                      receive 15% off your first semester.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Scan to Share</CardTitle>
                    <CardDescription>
                      Share this page with colleagues
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center gap-3">
                    <div className="bg-white p-3 rounded-lg">
                      <svg 
                        data-testid="img-qr-code"
                        viewBox="0 0 256 256" 
                        className="w-32 h-32"
                        aria-label="QR Code for futureworkacademy.com/academia"
                      >
                        <rect width="256" height="256" fill="white"/>
                        <g fill="black">
                          <rect x="16" y="16" width="8" height="8"/><rect x="24" y="16" width="8" height="8"/><rect x="32" y="16" width="8" height="8"/><rect x="40" y="16" width="8" height="8"/><rect x="48" y="16" width="8" height="8"/><rect x="56" y="16" width="8" height="8"/><rect x="64" y="16" width="8" height="8"/>
                          <rect x="80" y="16" width="8" height="8"/><rect x="88" y="16" width="8" height="8"/><rect x="112" y="16" width="8" height="8"/>
                          <rect x="144" y="16" width="8" height="8"/><rect x="160" y="16" width="8" height="8"/><rect x="176" y="16" width="8" height="8"/><rect x="184" y="16" width="8" height="8"/><rect x="192" y="16" width="8" height="8"/><rect x="200" y="16" width="8" height="8"/><rect x="208" y="16" width="8" height="8"/><rect x="216" y="16" width="8" height="8"/><rect x="224" y="16" width="8" height="8"/>
                          <rect x="16" y="24" width="8" height="8"/><rect x="64" y="24" width="8" height="8"/><rect x="96" y="24" width="8" height="8"/><rect x="112" y="24" width="8" height="8"/><rect x="128" y="24" width="8" height="8"/><rect x="160" y="24" width="8" height="8"/><rect x="224" y="24" width="8" height="8"/>
                          <rect x="16" y="32" width="8" height="8"/><rect x="32" y="32" width="8" height="8"/><rect x="40" y="32" width="8" height="8"/><rect x="48" y="32" width="8" height="8"/><rect x="64" y="32" width="8" height="8"/><rect x="88" y="32" width="8" height="8"/><rect x="104" y="32" width="8" height="8"/><rect x="112" y="32" width="8" height="8"/><rect x="160" y="32" width="8" height="8"/><rect x="176" y="32" width="8" height="8"/><rect x="184" y="32" width="8" height="8"/><rect x="192" y="32" width="8" height="8"/><rect x="224" y="32" width="8" height="8"/>
                          <rect x="16" y="40" width="8" height="8"/><rect x="32" y="40" width="8" height="8"/><rect x="40" y="40" width="8" height="8"/><rect x="48" y="40" width="8" height="8"/><rect x="64" y="40" width="8" height="8"/><rect x="80" y="40" width="8" height="8"/><rect x="96" y="40" width="8" height="8"/><rect x="128" y="40" width="8" height="8"/><rect x="136" y="40" width="8" height="8"/><rect x="160" y="40" width="8" height="8"/><rect x="176" y="40" width="8" height="8"/><rect x="184" y="40" width="8" height="8"/><rect x="192" y="40" width="8" height="8"/><rect x="224" y="40" width="8" height="8"/>
                          <rect x="16" y="48" width="8" height="8"/><rect x="32" y="48" width="8" height="8"/><rect x="40" y="48" width="8" height="8"/><rect x="48" y="48" width="8" height="8"/><rect x="64" y="48" width="8" height="8"/><rect x="88" y="48" width="8" height="8"/><rect x="96" y="48" width="8" height="8"/><rect x="104" y="48" width="8" height="8"/><rect x="120" y="48" width="8" height="8"/><rect x="136" y="48" width="8" height="8"/><rect x="160" y="48" width="8" height="8"/><rect x="176" y="48" width="8" height="8"/><rect x="184" y="48" width="8" height="8"/><rect x="192" y="48" width="8" height="8"/><rect x="224" y="48" width="8" height="8"/>
                          <rect x="16" y="56" width="8" height="8"/><rect x="64" y="56" width="8" height="8"/><rect x="80" y="56" width="8" height="8"/><rect x="104" y="56" width="8" height="8"/><rect x="120" y="56" width="8" height="8"/><rect x="136" y="56" width="8" height="8"/><rect x="160" y="56" width="8" height="8"/><rect x="224" y="56" width="8" height="8"/>
                          <rect x="16" y="64" width="8" height="8"/><rect x="24" y="64" width="8" height="8"/><rect x="32" y="64" width="8" height="8"/><rect x="40" y="64" width="8" height="8"/><rect x="48" y="64" width="8" height="8"/><rect x="56" y="64" width="8" height="8"/><rect x="64" y="64" width="8" height="8"/><rect x="80" y="64" width="8" height="8"/><rect x="96" y="64" width="8" height="8"/><rect x="112" y="64" width="8" height="8"/><rect x="128" y="64" width="8" height="8"/><rect x="144" y="64" width="8" height="8"/><rect x="160" y="64" width="8" height="8"/><rect x="168" y="64" width="8" height="8"/><rect x="176" y="64" width="8" height="8"/><rect x="184" y="64" width="8" height="8"/><rect x="192" y="64" width="8" height="8"/><rect x="200" y="64" width="8" height="8"/><rect x="208" y="64" width="8" height="8"/><rect x="216" y="64" width="8" height="8"/><rect x="224" y="64" width="8" height="8"/>
                          <rect x="88" y="72" width="8" height="8"/><rect x="96" y="72" width="8" height="8"/><rect x="128" y="72" width="8" height="8"/><rect x="136" y="72" width="8" height="8"/>
                          <rect x="16" y="80" width="8" height="8"/><rect x="24" y="80" width="8" height="8"/><rect x="32" y="80" width="8" height="8"/><rect x="48" y="80" width="8" height="8"/><rect x="56" y="80" width="8" height="8"/><rect x="72" y="80" width="8" height="8"/><rect x="88" y="80" width="8" height="8"/><rect x="120" y="80" width="8" height="8"/><rect x="128" y="80" width="8" height="8"/><rect x="144" y="80" width="8" height="8"/><rect x="168" y="80" width="8" height="8"/><rect x="184" y="80" width="8" height="8"/><rect x="208" y="80" width="8" height="8"/><rect x="216" y="80" width="8" height="8"/>
                          <rect x="16" y="88" width="8" height="8"/><rect x="40" y="88" width="8" height="8"/><rect x="64" y="88" width="8" height="8"/><rect x="80" y="88" width="8" height="8"/><rect x="96" y="88" width="8" height="8"/><rect x="120" y="88" width="8" height="8"/><rect x="152" y="88" width="8" height="8"/><rect x="168" y="88" width="8" height="8"/><rect x="176" y="88" width="8" height="8"/><rect x="184" y="88" width="8" height="8"/><rect x="192" y="88" width="8" height="8"/><rect x="200" y="88" width="8" height="8"/>
                          <rect x="24" y="96" width="8" height="8"/><rect x="56" y="96" width="8" height="8"/><rect x="64" y="96" width="8" height="8"/><rect x="72" y="96" width="8" height="8"/><rect x="88" y="96" width="8" height="8"/><rect x="96" y="96" width="8" height="8"/><rect x="104" y="96" width="8" height="8"/><rect x="112" y="96" width="8" height="8"/><rect x="120" y="96" width="8" height="8"/><rect x="136" y="96" width="8" height="8"/><rect x="144" y="96" width="8" height="8"/><rect x="152" y="96" width="8" height="8"/><rect x="160" y="96" width="8" height="8"/><rect x="176" y="96" width="8" height="8"/><rect x="200" y="96" width="8" height="8"/><rect x="208" y="96" width="8" height="8"/><rect x="216" y="96" width="8" height="8"/>
                          <rect x="16" y="104" width="8" height="8"/><rect x="48" y="104" width="8" height="8"/><rect x="72" y="104" width="8" height="8"/><rect x="80" y="104" width="8" height="8"/><rect x="96" y="104" width="8" height="8"/><rect x="104" y="104" width="8" height="8"/><rect x="128" y="104" width="8" height="8"/><rect x="136" y="104" width="8" height="8"/><rect x="176" y="104" width="8" height="8"/><rect x="192" y="104" width="8" height="8"/><rect x="200" y="104" width="8" height="8"/><rect x="216" y="104" width="8" height="8"/>
                          <rect x="24" y="112" width="8" height="8"/><rect x="40" y="112" width="8" height="8"/><rect x="48" y="112" width="8" height="8"/><rect x="64" y="112" width="8" height="8"/><rect x="80" y="112" width="8" height="8"/><rect x="88" y="112" width="8" height="8"/><rect x="112" y="112" width="8" height="8"/><rect x="120" y="112" width="8" height="8"/><rect x="136" y="112" width="8" height="8"/><rect x="168" y="112" width="8" height="8"/><rect x="192" y="112" width="8" height="8"/><rect x="200" y="112" width="8" height="8"/><rect x="224" y="112" width="8" height="8"/>
                          <rect x="16" y="120" width="8" height="8"/><rect x="40" y="120" width="8" height="8"/><rect x="56" y="120" width="8" height="8"/><rect x="64" y="120" width="8" height="8"/><rect x="72" y="120" width="8" height="8"/><rect x="80" y="120" width="8" height="8"/><rect x="96" y="120" width="8" height="8"/><rect x="104" y="120" width="8" height="8"/><rect x="136" y="120" width="8" height="8"/><rect x="144" y="120" width="8" height="8"/><rect x="152" y="120" width="8" height="8"/><rect x="176" y="120" width="8" height="8"/><rect x="184" y="120" width="8" height="8"/><rect x="192" y="120" width="8" height="8"/><rect x="200" y="120" width="8" height="8"/><rect x="208" y="120" width="8" height="8"/>
                          <rect x="24" y="128" width="8" height="8"/><rect x="32" y="128" width="8" height="8"/><rect x="40" y="128" width="8" height="8"/><rect x="48" y="128" width="8" height="8"/><rect x="64" y="128" width="8" height="8"/><rect x="72" y="128" width="8" height="8"/><rect x="80" y="128" width="8" height="8"/><rect x="88" y="128" width="8" height="8"/><rect x="96" y="128" width="8" height="8"/><rect x="104" y="128" width="8" height="8"/><rect x="112" y="128" width="8" height="8"/><rect x="120" y="128" width="8" height="8"/><rect x="128" y="128" width="8" height="8"/><rect x="136" y="128" width="8" height="8"/><rect x="176" y="128" width="8" height="8"/><rect x="200" y="128" width="8" height="8"/><rect x="224" y="128" width="8" height="8"/>
                          <rect x="32" y="136" width="8" height="8"/><rect x="56" y="136" width="8" height="8"/><rect x="64" y="136" width="8" height="8"/><rect x="72" y="136" width="8" height="8"/><rect x="112" y="136" width="8" height="8"/><rect x="120" y="136" width="8" height="8"/><rect x="144" y="136" width="8" height="8"/><rect x="152" y="136" width="8" height="8"/><rect x="160" y="136" width="8" height="8"/><rect x="176" y="136" width="8" height="8"/><rect x="184" y="136" width="8" height="8"/><rect x="192" y="136" width="8" height="8"/><rect x="200" y="136" width="8" height="8"/><rect x="216" y="136" width="8" height="8"/>
                          <rect x="16" y="144" width="8" height="8"/><rect x="40" y="144" width="8" height="8"/><rect x="56" y="144" width="8" height="8"/><rect x="72" y="144" width="8" height="8"/><rect x="88" y="144" width="8" height="8"/><rect x="96" y="144" width="8" height="8"/><rect x="104" y="144" width="8" height="8"/><rect x="120" y="144" width="8" height="8"/><rect x="128" y="144" width="8" height="8"/><rect x="136" y="144" width="8" height="8"/><rect x="152" y="144" width="8" height="8"/><rect x="160" y="144" width="8" height="8"/><rect x="176" y="144" width="8" height="8"/><rect x="184" y="144" width="8" height="8"/><rect x="192" y="144" width="8" height="8"/><rect x="208" y="144" width="8" height="8"/><rect x="216" y="144" width="8" height="8"/><rect x="224" y="144" width="8" height="8"/>
                          <rect x="16" y="152" width="8" height="8"/><rect x="24" y="152" width="8" height="8"/><rect x="32" y="152" width="8" height="8"/><rect x="40" y="152" width="8" height="8"/><rect x="48" y="152" width="8" height="8"/><rect x="72" y="152" width="8" height="8"/><rect x="88" y="152" width="8" height="8"/><rect x="96" y="152" width="8" height="8"/><rect x="104" y="152" width="8" height="8"/><rect x="112" y="152" width="8" height="8"/><rect x="128" y="152" width="8" height="8"/><rect x="152" y="152" width="8" height="8"/><rect x="160" y="152" width="8" height="8"/><rect x="168" y="152" width="8" height="8"/><rect x="176" y="152" width="8" height="8"/><rect x="200" y="152" width="8" height="8"/><rect x="224" y="152" width="8" height="8"/>
                          <rect x="16" y="160" width="8" height="8"/><rect x="24" y="160" width="8" height="8"/><rect x="32" y="160" width="8" height="8"/><rect x="48" y="160" width="8" height="8"/><rect x="64" y="160" width="8" height="8"/><rect x="104" y="160" width="8" height="8"/><rect x="112" y="160" width="8" height="8"/><rect x="120" y="160" width="8" height="8"/><rect x="128" y="160" width="8" height="8"/><rect x="136" y="160" width="8" height="8"/><rect x="152" y="160" width="8" height="8"/><rect x="192" y="160" width="8" height="8"/><rect x="200" y="160" width="8" height="8"/><rect x="208" y="160" width="8" height="8"/><rect x="224" y="160" width="8" height="8"/>
                          <rect x="80" y="168" width="8" height="8"/><rect x="88" y="168" width="8" height="8"/><rect x="96" y="168" width="8" height="8"/><rect x="112" y="168" width="8" height="8"/><rect x="128" y="168" width="8" height="8"/><rect x="144" y="168" width="8" height="8"/><rect x="152" y="168" width="8" height="8"/><rect x="168" y="168" width="8" height="8"/><rect x="184" y="168" width="8" height="8"/><rect x="200" y="168" width="8" height="8"/><rect x="208" y="168" width="8" height="8"/><rect x="216" y="168" width="8" height="8"/>
                          <rect x="16" y="176" width="8" height="8"/><rect x="24" y="176" width="8" height="8"/><rect x="32" y="176" width="8" height="8"/><rect x="40" y="176" width="8" height="8"/><rect x="48" y="176" width="8" height="8"/><rect x="56" y="176" width="8" height="8"/><rect x="64" y="176" width="8" height="8"/><rect x="80" y="176" width="8" height="8"/><rect x="88" y="176" width="8" height="8"/><rect x="104" y="176" width="8" height="8"/><rect x="120" y="176" width="8" height="8"/><rect x="128" y="176" width="8" height="8"/><rect x="152" y="176" width="8" height="8"/><rect x="168" y="176" width="8" height="8"/><rect x="176" y="176" width="8" height="8"/><rect x="192" y="176" width="8" height="8"/><rect x="200" y="176" width="8" height="8"/><rect x="208" y="176" width="8" height="8"/>
                          <rect x="16" y="184" width="8" height="8"/><rect x="64" y="184" width="8" height="8"/><rect x="96" y="184" width="8" height="8"/><rect x="112" y="184" width="8" height="8"/><rect x="128" y="184" width="8" height="8"/><rect x="144" y="184" width="8" height="8"/><rect x="152" y="184" width="8" height="8"/><rect x="168" y="184" width="8" height="8"/><rect x="200" y="184" width="8" height="8"/><rect x="208" y="184" width="8" height="8"/>
                          <rect x="16" y="192" width="8" height="8"/><rect x="32" y="192" width="8" height="8"/><rect x="40" y="192" width="8" height="8"/><rect x="48" y="192" width="8" height="8"/><rect x="64" y="192" width="8" height="8"/><rect x="80" y="192" width="8" height="8"/><rect x="88" y="192" width="8" height="8"/><rect x="96" y="192" width="8" height="8"/><rect x="112" y="192" width="8" height="8"/><rect x="136" y="192" width="8" height="8"/><rect x="152" y="192" width="8" height="8"/><rect x="168" y="192" width="8" height="8"/><rect x="176" y="192" width="8" height="8"/><rect x="200" y="192" width="8" height="8"/><rect x="208" y="192" width="8" height="8"/><rect x="224" y="192" width="8" height="8"/>
                          <rect x="16" y="200" width="8" height="8"/><rect x="32" y="200" width="8" height="8"/><rect x="40" y="200" width="8" height="8"/><rect x="48" y="200" width="8" height="8"/><rect x="64" y="200" width="8" height="8"/><rect x="80" y="200" width="8" height="8"/><rect x="88" y="200" width="8" height="8"/><rect x="104" y="200" width="8" height="8"/><rect x="120" y="200" width="8" height="8"/><rect x="128" y="200" width="8" height="8"/><rect x="136" y="200" width="8" height="8"/><rect x="144" y="200" width="8" height="8"/><rect x="168" y="200" width="8" height="8"/><rect x="176" y="200" width="8" height="8"/><rect x="184" y="200" width="8" height="8"/><rect x="192" y="200" width="8" height="8"/>
                          <rect x="16" y="208" width="8" height="8"/><rect x="32" y="208" width="8" height="8"/><rect x="40" y="208" width="8" height="8"/><rect x="48" y="208" width="8" height="8"/><rect x="64" y="208" width="8" height="8"/><rect x="80" y="208" width="8" height="8"/><rect x="120" y="208" width="8" height="8"/><rect x="136" y="208" width="8" height="8"/><rect x="152" y="208" width="8" height="8"/><rect x="168" y="208" width="8" height="8"/><rect x="176" y="208" width="8" height="8"/><rect x="184" y="208" width="8" height="8"/><rect x="192" y="208" width="8" height="8"/><rect x="200" y="208" width="8" height="8"/><rect x="208" y="208" width="8" height="8"/><rect x="216" y="208" width="8" height="8"/>
                          <rect x="16" y="216" width="8" height="8"/><rect x="64" y="216" width="8" height="8"/><rect x="88" y="216" width="8" height="8"/><rect x="112" y="216" width="8" height="8"/><rect x="128" y="216" width="8" height="8"/><rect x="136" y="216" width="8" height="8"/><rect x="144" y="216" width="8" height="8"/><rect x="152" y="216" width="8" height="8"/><rect x="168" y="216" width="8" height="8"/><rect x="176" y="216" width="8" height="8"/><rect x="192" y="216" width="8" height="8"/><rect x="200" y="216" width="8" height="8"/><rect x="216" y="216" width="8" height="8"/><rect x="224" y="216" width="8" height="8"/>
                          <rect x="16" y="224" width="8" height="8"/><rect x="24" y="224" width="8" height="8"/><rect x="32" y="224" width="8" height="8"/><rect x="40" y="224" width="8" height="8"/><rect x="48" y="224" width="8" height="8"/><rect x="56" y="224" width="8" height="8"/><rect x="64" y="224" width="8" height="8"/><rect x="80" y="224" width="8" height="8"/><rect x="88" y="224" width="8" height="8"/><rect x="104" y="224" width="8" height="8"/><rect x="120" y="224" width="8" height="8"/><rect x="128" y="224" width="8" height="8"/><rect x="160" y="224" width="8" height="8"/><rect x="168" y="224" width="8" height="8"/><rect x="200" y="224" width="8" height="8"/><rect x="208" y="224" width="8" height="8"/><rect x="216" y="224" width="8" height="8"/><rect x="224" y="224" width="8" height="8"/>
                        </g>
                      </svg>
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      futureworkacademy.com/academia
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Request Your Demo
                  </CardTitle>
                  <CardDescription>
                    Fill out the form and we'll contact you within 24 hours
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Your Name *</Label>
                      <Input
                        id="name"
                        placeholder="Dr. Jane Smith"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        data-testid="input-name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="jsmith@university.edu"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        data-testid="input-email"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="institution">Institution</Label>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <Input
                          id="institution"
                          placeholder="University of Business"
                          value={institution}
                          onChange={(e) => setInstitution(e.target.value)}
                          className="flex-1"
                          data-testid="input-institution"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="programType">Program Type</Label>
                      <Select value={programType} onValueChange={setProgramType}>
                        <SelectTrigger data-testid="select-program-type">
                          <SelectValue placeholder="Select your program type" />
                        </SelectTrigger>
                        <SelectContent>
                          {PROGRAM_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="classSize">Estimated Class Size</Label>
                      <Input
                        id="classSize"
                        placeholder="e.g., 30 students"
                        value={classSize}
                        onChange={(e) => setClassSize(e.target.value)}
                        data-testid="input-class-size"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="preferredTime">Preferred Demo Time</Label>
                      <Select value={preferredTime} onValueChange={setPreferredTime}>
                        <SelectTrigger data-testid="select-preferred-time">
                          <SelectValue placeholder="When works best?" />
                        </SelectTrigger>
                        <SelectContent>
                          {DEMO_TIMES.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="referralCode">Referral Code (optional)</Label>
                      <Input
                        id="referralCode"
                        placeholder="Enter if referred by a colleague"
                        value={referralCode}
                        onChange={(e) => setReferralCode(e.target.value)}
                        data-testid="input-referral-code"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Additional Notes</Label>
                      <Textarea
                        id="message"
                        placeholder="Any specific questions or requirements for your course?"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={3}
                        data-testid="textarea-message"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full gap-2"
                      disabled={submitMutation.isPending}
                      data-testid="button-submit-demo"
                    >
                      {submitMutation.isPending ? (
                        "Sending..."
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Request Demo
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
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
