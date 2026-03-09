import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { AppFooter } from "@/components/app-footer";
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  Mail,
  Phone,
  ExternalLink,
  Users,
  GraduationCap,
  BarChart3,
  Shield,
  BookOpen,
  Zap,
  Clock,
  DollarSign,
  Building2,
  Rocket,
  Globe,
} from "lucide-react";
import { Link } from "wouter";
import logoForLight from "@assets/logo-horizontal.png";
import logoForDark from "@assets/logo-white.png";
import dougPhoto from "@assets/doug-mitchell-headshot-2026SMALL_1769306419960.png";

function useInView() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.1 }
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

const INCLUDED_FEATURES = [
  "Full 8-week simulation platform access",
  "AI-powered essay grading with rubric feedback",
  "Student analytics & leaderboard dashboards",
  "Instructor dashboard with class performance views",
  "External grading module for LMS-submitted work",
  "Phone-a-Friend AI advisor system (3 credits/student)",
  "Character-driven stakeholder scenarios",
  "Weekly briefings with multimedia content",
  "SMS & email notifications (optional)",
  "Privacy Mode for immediate deployment",
  "Student feedback survey with analytics",
  "PDF export for offline participation",
];

const DEPLOYMENT_TIERS = [
  {
    name: "Pilot",
    scope: "1 class, up to 40 students",
    ideal: "Test in a single course before broader adoption",
    includes: [
      "Full platform access for one section",
      "Instructor onboarding session",
      "Email support throughout semester",
      "Post-pilot effectiveness report",
    ],
  },
  {
    name: "Course-Wide",
    scope: "Multiple sections, up to 150 students",
    ideal: "Deploy across all sections of a course",
    includes: [
      "Everything in Pilot",
      "Multi-section analytics & comparison",
      "Dedicated support contact",
      "Faculty training workshop",
    ],
  },
  {
    name: "Institutional",
    scope: "Department-wide, 150+ students",
    ideal: "Integrate across programs and departments",
    includes: [
      "Everything in Course-Wide",
      "Custom module development consultation",
      "Volume pricing",
      "Priority support & SLA",
    ],
  },
];

const APPENDIX_LINKS = [
  {
    title: "Institutional Partnership Proposal",
    description: "Comprehensive 10-section proposal covering pedagogical framework (8 learning theories with APA citations), FERPA compliance, grant opportunities, and research collaboration.",
    href: "/institutional-proposal",
    icon: BookOpen,
  },
  {
    title: "Academic White Paper",
    description: "\"Bridging the Relevance Gap\" — a 7-section academic paper synthesizing the platform's pedagogical foundations with full citations.",
    href: "/white-paper",
    icon: FileText,
  },
  {
    title: "Grading Methodology",
    description: "Transparent breakdown of the 4-criterion AI rubric, scoring calibration, quality thresholds, and instructor override capabilities.",
    href: "/methodology",
    icon: BarChart3,
  },
  {
    title: "Security & Privacy Policy",
    description: "FERPA-aligned data handling, Content Security Policy, HSTS, rate limiting, cookie consent, GDPR/CCPA disclosures, and data retention policies.",
    href: "/privacy",
    icon: Shield,
  },
];

export default function PartnershipProposal() {
  useEffect(() => {
    document.title = "Partnership Proposal | Future Work Academy";
  }, []);

  return (
    <>
      <style>{`
        @media print {
          @page { size: A4; margin: 1.5cm 1.5cm 2cm 1.5cm; }
          nav, header, footer, button, .no-print, [data-testid="link-back"] { display: none !important; }
          .print-only { display: block !important; }
          .print\\:break-before-page { break-before: page; }
          body { font-family: 'IBM Plex Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important; font-size: 10pt; color: #000 !important; background: #fff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          * { animation: none !important; transition: none !important; transform: none !important; opacity: 1 !important; box-shadow: none !important; }
          h1, h2, h3, h4 { color: #1e3a5f !important; }
          h1 { font-size: 20pt !important; }
          h2 { font-size: 14pt !important; }
          h3 { font-size: 11pt !important; }
          p, li, span, td { color: #333 !important; }
          .text-muted-foreground { color: #555 !important; }
          a { color: #1e3a5f !important; text-decoration: underline; }
          .min-h-\\[60vh\\] { min-height: auto !important; padding: 1.5rem 0 !important; }
          .bg-gradient-to-b, .bg-gradient-to-br { background: none !important; }
          .rounded-xl, .rounded-2xl, .rounded-lg { border-radius: 3px !important; }
          .border { border: 1px solid #ccc !important; }
          section { padding-top: 0.75rem !important; padding-bottom: 0.75rem !important; }
          .py-16, .py-12, .sm\\:py-20, .sm\\:py-16 { padding-top: 0.75rem !important; padding-bottom: 0.75rem !important; }
          .bg-primary\\/5 { background-color: #f0f4f8 !important; }
          .bg-primary\\/10 { background-color: #e8eef5 !important; }
          .bg-muted\\/30, .bg-muted\\/50, .bg-muted { background-color: #f5f5f5 !important; }
          .grid { gap: 0.5rem !important; }
          .p-4, .p-5, .p-6 { padding: 0.5rem !important; }
          .gap-3, .gap-4, .gap-6 { gap: 0.4rem !important; }
          .mb-8, .mb-6 { margin-bottom: 0.5rem !important; }
          .space-y-4 > * + * { margin-top: 0.4rem !important; }
          .space-y-3 > * + * { margin-top: 0.3rem !important; }
          img.rounded-full { width: 50px !important; height: 50px !important; }
          table { border-collapse: collapse !important; width: 100% !important; }
          th, td { border: 1px solid #ccc !important; padding: 0.25rem 0.4rem !important; font-size: 9pt !important; }
          th { background: #e8eef5 !important; font-weight: bold !important; }
          .bg-card { background: #fff !important; border: 1px solid #ddd !important; }
          .text-xs { font-size: 8pt !important; }
          .text-sm { font-size: 9pt !important; }
          .leading-relaxed { line-height: 1.45 !important; }
          .bg-card, [class*="CardContent"] { break-inside: avoid; page-break-inside: avoid; }
          .print-only p { color: inherit !important; }
        }
      `}</style>

      <div className="min-h-screen bg-background" data-testid="page-partnership-proposal">
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b no-print">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" data-testid="link-back">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <img src={logoForLight} alt="Future Work Academy" className="h-8 dark:hidden" />
              <img src={logoForDark} alt="Future Work Academy" className="h-8 hidden dark:block" />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="no-print"
                data-testid="button-print"
              >
                <FileText className="h-4 w-4 mr-2" />
                Print / Save PDF
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </nav>

        {/* Header */}
        <section className="min-h-[60vh] flex items-center justify-center pt-20 pb-12 px-4 bg-gradient-to-b from-[#1e3a5f]/5 to-transparent">
          <div className="container mx-auto max-w-4xl text-center">
            <FadeInSection>
              <img src={logoForLight} alt="Future Work Academy" className="h-12 mx-auto mb-6 dark:hidden" />
              <img src={logoForDark} alt="Future Work Academy" className="h-12 mx-auto mb-6 hidden dark:block" />
            </FadeInSection>
            <FadeInSection delay={150}>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.1] mb-4" data-testid="heading-title">
                Partnership Proposal
              </h1>
            </FadeInSection>
            <FadeInSection delay={300}>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-6">
                An AI-driven business simulation for graduate programs — pricing, deployment, and what's included.
              </p>
            </FadeInSection>
            <FadeInSection delay={400}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-muted-foreground">
                <span>Prepared by Doug Mitchell, M.S.</span>
                <span className="hidden sm:inline">|</span>
                <span>{new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
              </div>
            </FadeInSection>
          </div>
        </section>

        {/* What is FWA */}
        <section className="py-12 sm:py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <FadeInSection>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6" data-testid="heading-what-is-fwa">The Platform</h2>
            </FadeInSection>
            <FadeInSection delay={100}>
              <p className="text-base text-muted-foreground leading-relaxed mb-8">
                Future Work Academy is a web-based business simulation where graduate students step into an executive role at a fictional manufacturing company navigating AI adoption and workforce transformation. Over 8 weeks, students make strategic decisions, receive AI-powered formative feedback on written rationales, and compete on dual financial and cultural performance metrics. The platform is designed for courses in Strategic Management, Organizational Behavior, Business Analytics, and Change Management — any program preparing leaders for technology-driven disruption.
              </p>
            </FadeInSection>

            <FadeInSection delay={200}>
              <h3 className="font-bold text-lg mb-4">How It Works</h3>
              <div className="grid sm:grid-cols-4 gap-4 mb-6">
                {[
                  { icon: FileText, label: "Weekly Briefing", desc: "Students read a scenario briefing with stakeholder dynamics and intel articles" },
                  { icon: Zap, label: "Make Decisions", desc: "Choose a strategic option and write a defended rationale (100+ words)" },
                  { icon: BarChart3, label: "Get Feedback", desc: "AI evaluates responses on a 4-criterion rubric with actionable feedback" },
                  { icon: Users, label: "Compete & Learn", desc: "Track progress on leaderboards; improve over 8 iterative cycles" },
                ].map((step, i) => (
                  <Card key={i} className="bg-card border">
                    <CardContent className="p-4 text-center">
                      <div className="bg-primary/10 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                        <step.icon className="h-5 w-5 text-primary" />
                      </div>
                      <h4 className="font-semibold text-sm mb-1">{step.label}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </FadeInSection>

            <FadeInSection delay={300}>
              <Card className="border-2 border-primary/20">
                <CardContent className="p-5">
                  <h3 className="font-bold text-base mb-3">What Your Institution Gets</h3>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {[
                      "Innovation leadership in AI-integrated curriculum",
                      "Publishable research data from student engagement metrics",
                      "Differentiated program offering for student recruitment",
                      "Built-in assessment aligned with AACSB learning goals",
                      "Faculty development in simulation-based pedagogy",
                      "Student feedback surveys with trend analytics",
                      "Zero IT infrastructure to manage — fully hosted SaaS",
                      "Privacy Mode enables adoption without complex IT approvals",
                    ].map((benefit, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </FadeInSection>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-12 sm:py-16 px-4 print:break-before-page">
          <div className="container mx-auto max-w-4xl">
            <FadeInSection>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6" data-testid="heading-pricing">Pricing</h2>
            </FadeInSection>

            <FadeInSection delay={100}>
              <Card className="bg-card border mb-6">
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-xl font-bold" data-testid="text-price">$49 per student / semester</h3>
                      <p className="text-sm text-muted-foreground">Flat-rate semester license — everything included, no hidden fees</p>
                    </div>
                    <div className="bg-primary/10 rounded-lg px-4 py-2 shrink-0">
                      <DollarSign className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {INCLUDED_FEATURES.map((feature, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </FadeInSection>

            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <FadeInSection delay={200}>
                <Card className="bg-card border h-full">
                  <CardContent className="p-5">
                    <h3 className="font-bold text-base mb-3">Cost Transparency</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                      We believe in full transparency about what it costs to run the platform. Here's what the $49 covers:
                    </p>
                    <table className="w-full text-sm border-collapse" data-testid="table-costs">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-1.5 font-semibold text-foreground">Cost Component</th>
                          <th className="text-right py-1.5 font-semibold text-foreground">Per Student</th>
                        </tr>
                      </thead>
                      <tbody className="text-muted-foreground">
                        <tr className="border-b border-border/50">
                          <td className="py-1.5">AI grading & advisor calls</td>
                          <td className="text-right">~$0.30–0.50</td>
                        </tr>
                        <tr className="border-b border-border/50">
                          <td className="py-1.5">SMS notifications (optional)</td>
                          <td className="text-right">~$0.13/week</td>
                        </tr>
                        <tr className="border-b border-border/50">
                          <td className="py-1.5">Hosting & infrastructure</td>
                          <td className="text-right">~$0.10–0.20</td>
                        </tr>
                        <tr className="border-b border-border/50">
                          <td className="py-1.5">Content development & support</td>
                          <td className="text-right">Amortized</td>
                        </tr>
                        <tr>
                          <td className="py-1.5 font-semibold text-foreground">Platform margin</td>
                          <td className="text-right font-semibold text-foreground">~$47+</td>
                        </tr>
                      </tbody>
                    </table>
                    <p className="text-xs text-muted-foreground mt-2">
                      Operating costs are under $2/student. The margin funds ongoing development, compliance certifications, and support.
                    </p>
                  </CardContent>
                </Card>
              </FadeInSection>

              <FadeInSection delay={300}>
                <Card className="bg-card border h-full">
                  <CardContent className="p-5">
                    <h3 className="font-bold text-base mb-3">Your Costs as an Instructor</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Clock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Time: ~1 hour/week</p>
                          <p className="text-xs text-muted-foreground">Review dashboards, check submissions, add optional comments</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Globe className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Infrastructure: None</p>
                          <p className="text-xs text-muted-foreground">Fully hosted — no servers, no IT tickets, no LMS plugin required</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Shield className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">IT Approval: Optional</p>
                          <p className="text-xs text-muted-foreground">Privacy Mode enables immediate deployment — students enroll with a class code, no institutional SSO needed</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <GraduationCap className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Training: We handle it</p>
                          <p className="text-xs text-muted-foreground">Onboarding session plus instructor guide, student guide, and ongoing email support</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </FadeInSection>
            </div>

            <FadeInSection delay={350}>
              <Card className="bg-muted/30 border">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">
                    <strong>Volume pricing available.</strong> For departments adopting across multiple courses or institutions licensing for 150+ students, contact us for custom pricing. We also support grant-funded deployments with documentation for 260F, NSF IUSE, and FIPSE programs.
                  </p>
                </CardContent>
              </Card>
            </FadeInSection>
          </div>
        </section>

        {/* Deployment & Getting Started */}
        <section className="py-12 sm:py-16 px-4 print:break-before-page">
          <div className="container mx-auto max-w-4xl">
            <FadeInSection>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6" data-testid="heading-deployment">Deployment Options</h2>
            </FadeInSection>

            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              {DEPLOYMENT_TIERS.map((tier, i) => (
                <FadeInSection key={tier.name} delay={i * 100}>
                  <Card className={`bg-card border h-full ${i === 1 ? "border-primary/30 border-2" : ""}`}>
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-2">
                        {i === 0 && <Rocket className="h-5 w-5 text-primary" />}
                        {i === 1 && <Users className="h-5 w-5 text-primary" />}
                        {i === 2 && <Building2 className="h-5 w-5 text-primary" />}
                        <h3 className="font-bold text-base">{tier.name}</h3>
                      </div>
                      <p className="text-sm font-medium text-primary mb-1">{tier.scope}</p>
                      <p className="text-xs text-muted-foreground mb-3">{tier.ideal}</p>
                      <div className="space-y-1.5">
                        {tier.includes.map((item, j) => (
                          <div key={j} className="flex items-start gap-2">
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5" />
                            <span className="text-xs text-muted-foreground">{item}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </FadeInSection>
              ))}
            </div>

            <FadeInSection delay={300}>
              <h3 className="font-bold text-lg mb-4">Getting Started — 3 Steps</h3>
              <div className="grid sm:grid-cols-3 gap-4 mb-8">
                {[
                  { step: "1", title: "Sign Agreement", desc: "Simple semester license — no multi-year commitment required. We can start with a single section." },
                  { step: "2", title: "We Provision Your Class", desc: "We create your organization, configure settings, and provide enrollment materials within 48 hours." },
                  { step: "3", title: "Students Enroll", desc: "Students join with a class code or .edu email. Week 1 briefing is ready day one." },
                ].map((s) => (
                  <Card key={s.step} className="bg-card border">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-primary text-primary-foreground font-bold rounded-full w-7 h-7 flex items-center justify-center text-sm shrink-0">{s.step}</span>
                        <h4 className="font-semibold text-sm">{s.title}</h4>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </FadeInSection>

            <FadeInSection delay={400}>
              <Card className="bg-card border">
                <CardContent className="p-5">
                  <h3 className="font-bold text-base mb-3">Privacy & Compliance Summary</h3>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {[
                      "FERPA-aligned: no student PII transmitted to AI models",
                      "All AI evaluation uses anonymized, text-only inputs",
                      "AES-256 encryption at rest, TLS in transit",
                      "Content Security Policy, HSTS, and rate limiting enforced",
                      "No student data used for model training",
                      "SOC 2 Type II certification on roadmap",
                      "Self-service data export and deletion rights",
                      "Cookie consent controls for analytics (GA4)",
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Shield className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                        <span className="text-xs text-muted-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </FadeInSection>
          </div>
        </section>

        {/* Contact */}
        <section className="py-12 sm:py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <FadeInSection>
              <Card className="bg-card border">
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                    <img
                      src={dougPhoto}
                      alt="Doug Mitchell"
                      className="w-20 h-20 rounded-full object-cover border-2 border-primary/20 shrink-0"
                    />
                    <div className="text-center sm:text-left">
                      <h3 className="text-lg font-bold mb-1">Doug Mitchell, M.S.</h3>
                      <p className="text-sm text-muted-foreground mb-3">Founder, Future Work Academy</p>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                        Ready to explore how FWA fits your program? I'm happy to walk through a live demo, discuss grant-funded deployment, or answer any questions about the platform.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 text-sm">
                        <a href="mailto:doug@futureworkacademy.com" className="flex items-center gap-2 text-primary hover:underline" data-testid="link-email">
                          <Mail className="h-4 w-4" />
                          doug@futureworkacademy.com
                        </a>
                        <a href="tel:5156191640" className="flex items-center gap-2 text-primary hover:underline" data-testid="link-phone">
                          <Phone className="h-4 w-4" />
                          515.619.1640
                        </a>
                      </div>
                      <div className="mt-4 no-print">
                        <Link href="/demo">
                          <Button size="sm" data-testid="button-request-demo">
                            Request a Demo
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeInSection>
          </div>
        </section>

        {/* Appendix: Supporting Materials */}
        <section className="py-12 sm:py-16 px-4 border-t print:break-before-page">
          <div className="container mx-auto max-w-4xl">
            <FadeInSection>
              <p className="text-xs font-medium text-primary uppercase tracking-widest mb-2">Appendix</p>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2" data-testid="heading-appendix">Supporting Materials</h2>
              <p className="text-sm text-muted-foreground mb-6">
                The following pages provide detailed background on the platform's pedagogical framework, security posture, grading methodology, and academic foundations.
              </p>
            </FadeInSection>

            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {APPENDIX_LINKS.map((link, i) => (
                <FadeInSection key={link.title} delay={i * 100}>
                  <a href={link.href} target="_blank" rel="noopener noreferrer" className="block h-full">
                    <Card className="bg-card border h-full hover:border-primary/40 transition-colors">
                      <CardContent className="p-5">
                        <div className="flex items-start gap-3">
                          <div className="bg-primary/10 rounded-lg p-2.5 shrink-0">
                            <link.icon className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-bold text-sm mb-1 flex items-center gap-1">
                              {link.title}
                              <ExternalLink className="h-3 w-3 text-muted-foreground no-print" />
                            </h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">{link.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </a>
                </FadeInSection>
              ))}
            </div>

            <FadeInSection delay={400}>
              <Card className="bg-muted/30 border">
                <CardContent className="p-5">
                  <h3 className="font-bold text-sm mb-3">Key Background Highlights</h3>
                  <div className="space-y-3 text-xs text-muted-foreground">
                    <div>
                      <strong className="text-foreground">Pedagogical Framework:</strong> Grounded in 8 established learning theories including Kolb's Experiential Learning, Productive Failure (Kapur, 2016), Formative Assessment (Black & Wiliam, 1998), and Situated Cognition. Each weekly cycle maps to Kolb's four stages. Full citations in the Institutional Proposal.
                    </div>
                    <div>
                      <strong className="text-foreground">AI Ethics & Transparency:</strong> AI grading uses blind evaluation (no student identity passed), deterministic configuration, source-based rubrics, and explicit scoring calibration. All AI-generated content (character headshots, advisor audio, hero images) is disclosed. Student data is never used for model training.
                    </div>
                    <div>
                      <strong className="text-foreground">Assessment Design:</strong> 4-criterion rubric (Strategic Thinking, Financial Acumen, Cultural Awareness, Reasoning Coherence) with consistent definitions across schema and grading services. AI scores are formative — instructors retain full authority to review and adjust.
                    </div>
                    <div>
                      <strong className="text-foreground">Grant Compatibility:</strong> Platform deployments are compatible with NSF IUSE, Department of Education FIPSE, Iowa 260F workforce training, and institutional innovation grants. We provide documentation and serve as co-investigator where appropriate.
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeInSection>
          </div>
        </section>

        <div className="hidden print-only px-4 py-6" style={{ display: 'none' }}>
          <div className="container mx-auto max-w-4xl">
            <div style={{ borderTop: '2px solid #1e3a5f', paddingTop: '0.75rem' }}>
              <p style={{ fontSize: '9pt', color: '#888', fontStyle: 'italic' }}>
                This document is confidential and intended for institutional evaluation purposes only. Not for redistribution.
              </p>
              <p style={{ fontSize: '9pt', color: '#555', marginTop: '0.25rem' }}>
                Future Work Academy | The Mitchell Group, LLC — Des Moines, Iowa | futureworkacademy.com
              </p>
            </div>
          </div>
        </div>

        <AppFooter />
      </div>
    </>
  );
}
