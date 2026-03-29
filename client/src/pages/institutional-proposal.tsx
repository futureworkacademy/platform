import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { AppFooter } from "@/components/app-footer";
import {
  ArrowLeft,
  ChevronDown,
  Shield,
  BookOpen,
  GraduationCap,
  Users,
  FileText,
  CheckCircle2,
  Clock,
  ClipboardList,
  Banknote,
  Handshake,
  ExternalLink,
  Mail,
  Phone,
  Target,
  Brain,
  BarChart3,
  Lock,
  Eye,
  Monitor,
} from "lucide-react";
import { Link } from "wouter";
import { BrandLogo } from "@/components/brand-logo";
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

const THEORETICAL_FOUNDATIONS = [
  {
    theory: "Experiential Learning Theory",
    authors: "Kolb, D. A.",
    year: "1984",
    title: "Experiential Learning: Experience as the Source of Learning and Development",
    publisher: "Prentice-Hall",
    doi: null,
    icon: Brain,
    description: "FWA's 8-week simulation maps directly to Kolb's learning cycle: students encounter concrete experiences (weekly scenarios), engage in reflective observation (stakeholder analysis), develop abstract conceptualizations (strategic rationale), and apply active experimentation (decision implementation). Each week completes a full cycle, building cumulative learning.",
    refNum: 1,
  },
  {
    theory: "Productive Failure",
    authors: "Kapur, M.",
    year: "2016",
    title: "Examining productive failure, productive success, and constructive failure as learning designs",
    doi: "10.1080/10508406.2016.1166810",
    icon: Target,
    description: "Students encounter complex, ill-structured scenarios before receiving explicit instruction. Research demonstrates that this struggle—when properly scaffolded—produces deeper conceptual understanding and superior transfer than direct instruction alone. FWA's scenarios are intentionally designed so that no single 'correct' answer exists, requiring students to navigate genuine ambiguity.",
    refNum: 2,
  },
  {
    theory: "Formative Assessment",
    authors: "Black, P. & Wiliam, D.",
    year: "1998",
    title: "Assessment and classroom learning",
    doi: "10.1080/0969595980050102",
    icon: BarChart3,
    description: "AI-powered rubric feedback after each weekly decision functions as formative assessment—continuous, criterion-referenced evaluation that enables students to improve over the simulation's duration. This contrasts with purely summative approaches, providing actionable insights while learning is still in progress.",
    refNum: 3,
  },
  {
    theory: "Scaffolding",
    authors: "Wood, D., Bruner, J. S., & Ross, G.",
    year: "1976",
    title: "The role of tutoring in problem solving",
    doi: "10.1111/j.1469-7610.1976.tb00381.x",
    icon: GraduationCap,
    description: "FWA's 3-tier difficulty framework (Introductory / Standard / Advanced) operationalizes scaffolding by providing adjustable support structures. Introductory scenarios offer more guidance and clearer stakeholder signals; Advanced scenarios introduce greater ambiguity, conflicting data, and higher-stakes trade-offs—matching Vygotsky's Zone of Proximal Development.",
    refNum: 4,
  },
  {
    theory: "Feed-Forward Feedback",
    authors: "Hattie, J. & Timperley, H.",
    year: "2007",
    title: "The power of feedback",
    doi: "10.3102/003465430298487",
    icon: FileText,
    description: "Grading reports include not just scores but actionable improvement guidance—specific recommendations for strengthening evidence quality, stakeholder analysis, and risk mitigation. This feed-forward orientation ensures feedback drives future performance, not just retrospective judgment.",
    refNum: 5,
  },
  {
    theory: "Situated Cognition",
    authors: "Brown, J. S., Collins, A., & Duguid, P.",
    year: "1989",
    title: "Situated cognition and the culture of learning",
    doi: "10.3102/0013189X018001032",
    icon: Users,
    description: "Learning is embedded in a realistic business context—Apex Manufacturing—with authentic organizational dynamics, competing stakeholder interests, and genuine uncertainty. Students don't study AI transformation abstractly; they practice it in a simulated environment that mirrors real-world complexity.",
    refNum: 6,
  },
  {
    theory: "Stakeholder Salience",
    authors: "Mitchell, R. K., Agle, B. R., & Wood, D. J.",
    year: "1997",
    title: "Toward a theory of stakeholder identification and salience",
    doi: "10.5465/amr.1997.9711022105",
    icon: Users,
    description: "23 character profiles with quantifiable traits (influence, hostility, flexibility, risk tolerance) model real organizational complexity. Students must navigate competing interests—from resistant union representatives to enthusiastic early adopters—developing stakeholder management skills grounded in established theory.",
    refNum: 7,
  },
  {
    theory: "Single-Iteration Critique",
    authors: "Kayes, D. C.",
    year: "2002",
    title: "Experiential learning and its critics: Preserving the role of experience in management learning and education",
    doi: "10.5465/amle.2002.8509336",
    icon: Clock,
    description: "FWA's compressed 8-week timeline forces decisive action under uncertainty—reflecting real managerial conditions where leaders rarely get to 'replay' decisions. This design choice addresses critiques that experiential simulations often allow unrealistic do-overs, instead building comfort with irreversibility.",
    refNum: 8,
  },
];

const COMPLIANCE_COMPLETED = [
  "Privacy Mode with anonymous student enrollment",
  "Pseudonymous identifiers (no PII required)",
  "AES-256 encryption at rest",
  "TLS 1.3 encryption in transit",
  "PII-free AI processing (no student data sent to LLMs)",
  "No-training policy (submissions never used for AI model training)",
  "Activity audit logging with 2-year retention",
  "Offline identity mapping for instructors",
  "Published privacy policy (GDPR & CCPA sections) and terms of service",
  "FERPA self-assessment completed",
  "Security & compliance documentation (400+ lines)",
  "Security headers (Helmet.js — CSP, HSTS, X-Frame-Options, Referrer-Policy)",
  "API rate limiting (global, auth, and mutation tiers)",
  "Cookie consent banner with GA4 opt-out",
  "Self-service data export and account deletion requests",
];

const COMPLIANCE_ROADMAP = [
  {
    status: "in_progress",
    label: "HECVAT Questionnaire",
    description: "Higher Education Community Vendor Assessment Toolkit — the standard security questionnaire required by most universities before adopting new educational technology",
    target: "Q2 2026",
  },
  {
    status: "planned",
    label: "SOC 2 Type II Audit",
    description: "Independent third-party audit of security controls, availability, and confidentiality — the gold standard for SaaS compliance",
    target: "Q3–Q4 2026",
  },
  {
    status: "planned",
    label: "WCAG 2.1 AA Accessibility",
    description: "Web Content Accessibility Guidelines compliance to ensure the platform is usable by students with disabilities",
    target: "Q2 2026",
  },
  {
    status: "planned",
    label: "Formal Penetration Testing",
    description: "Independent security testing by certified professionals to identify and remediate vulnerabilities",
    target: "Q3 2026",
  },
  {
    status: "planned",
    label: "Institutional DPA Template",
    description: "Standardized Data Processing Agreement template ready for institutional legal review and execution",
    target: "Q2 2026",
  },
];

const GRANT_OPPORTUNITIES = [
  {
    name: "NSF IUSE",
    fullName: "Improving Undergraduate STEM Education",
    description: "Supports development of innovative pedagogical approaches and educational technologies. FWA's AI-driven experiential learning model directly addresses IUSE priorities around active learning, assessment innovation, and workforce preparation.",
    url: "https://www.nsf.gov/funding/pgm_summ.jsp?pims_id=505082",
  },
  {
    name: "NSF CyberCorps / SFS",
    fullName: "Scholarship for Service",
    description: "Funds cybersecurity and AI literacy education initiatives. FWA's simulation of AI adoption challenges and workforce transformation aligns with workforce readiness objectives.",
    url: "https://www.nsf.gov/funding/pgm_summ.jsp?pims_id=504991",
  },
  {
    name: "Dept. of Education FIPSE",
    fullName: "Fund for the Improvement of Postsecondary Education",
    description: "Supports innovative projects that improve postsecondary education quality and accessibility. FWA's experiential learning platform and AI-assisted assessment represent exactly the kind of innovation FIPSE targets.",
    url: "https://www2.ed.gov/about/offices/list/ope/fipse/index.html",
  },
  {
    name: "AACSB Innovation Grants",
    fullName: "AACSB International Curriculum Innovation",
    description: "AACSB-accredited programs can access innovation funding for curriculum modernization. FWA is designed for AACSB-aligned programs, making it a natural fit for these competitive grants.",
    url: "https://www.aacsb.edu",
  },
  {
    name: "University Internal Funding",
    fullName: "Seed Grants, Faculty Development, Dean's Innovation Fund",
    description: "Most institutions offer internal seed funding ($5K–$50K) for faculty-led innovation projects. A pilot deployment of FWA in 1–2 courses typically falls within these programs, with strong potential for external follow-on funding based on pilot results.",
    url: null,
  },
];

const PLATFORM_LINKS = [

  { label: "Grading Methodology", path: "/methodology", icon: BarChart3, description: "Published rubric criteria, scoring bands, and assessment transparency" },
  { label: "Academic White Paper", path: "/white-paper", icon: FileText, description: "7-section paper with 17 academic references and DOI links" },
  { label: "For Educators", path: "/for-educators", icon: GraduationCap, description: "Full educator overview with pedagogy, features, and demo access" },
  { label: "Character Profiles", path: "/characters", icon: Users, description: "23 stakeholder characters with traits, bios, and relationship mapping" },
  { label: "Week 1 Preview", path: "/week-1", icon: BookOpen, description: "Sample weekly scenario with briefing, decision options, and resources" },
  { label: "Student Guide", path: "/guides/student", icon: FileText, description: "Complete student onboarding guide with simulation overview" },
];

const REFERENCES = [
  { id: 1, text: "Kolb, D. A. (1984). Experiential Learning: Experience as the Source of Learning and Development. Prentice-Hall." },
  { id: 2, text: "Kapur, M. (2016). Examining productive failure, productive success, and constructive failure as learning designs. Instructional Science, 44(3), 289–306.", doi: "10.1080/10508406.2016.1166810" },
  { id: 3, text: "Black, P. & Wiliam, D. (1998). Assessment and classroom learning. Assessment in Education: Principles, Policy & Practice, 5(1), 7–74.", doi: "10.1080/0969595980050102" },
  { id: 4, text: "Wood, D., Bruner, J. S., & Ross, G. (1976). The role of tutoring in problem solving. Journal of Child Psychology and Psychiatry, 17(2), 89–100.", doi: "10.1111/j.1469-7610.1976.tb00381.x" },
  { id: 5, text: "Hattie, J. & Timperley, H. (2007). The power of feedback. Review of Educational Research, 77(1), 81–112.", doi: "10.3102/003465430298487" },
  { id: 6, text: "Brown, J. S., Collins, A., & Duguid, P. (1989). Situated cognition and the culture of learning. Educational Researcher, 18(1), 32–42.", doi: "10.3102/0013189X018001032" },
  { id: 7, text: "Mitchell, R. K., Agle, B. R., & Wood, D. J. (1997). Toward a theory of stakeholder identification and salience. Academy of Management Review, 22(4), 853–886.", doi: "10.5465/amr.1997.9711022105" },
  { id: 8, text: "Kayes, D. C. (2002). Experiential learning and its critics. Academy of Management Learning & Education, 1(2), 137–149.", doi: "10.5465/amle.2002.8509336" },
  { id: 9, text: "Shermis, M. D. & Burstein, J. (2013). Handbook of Automated Essay Evaluation: Current Applications and New Directions. Routledge.", doi: "10.4324/9780203122761" },
  { id: 10, text: "Vygotsky, L. S. (1978). Mind in Society: The Development of Higher Psychological Processes. Harvard University Press." },
  { id: 11, text: "Bandura, A. (1997). Self-Efficacy: The Exercise of Control. W. H. Freeman." },
  { id: 12, text: "Biggs, J. (1996). Enhancing teaching through constructive alignment. Higher Education, 32(3), 347–364.", doi: "10.1007/BF00138871" },
  { id: 13, text: "Mehrabi, N., Morstatter, F., Saxena, N., Lerman, K., & Galstyan, A. (2021). A survey on bias and fairness in machine learning. ACM Computing Surveys, 54(6), 1–35.", doi: "10.1145/3457607" },
  { id: 14, text: "Baker, R. S. & Hawn, A. (2022). Algorithmic bias in education. International Journal of Artificial Intelligence in Education, 32, 1052–1092.", doi: "10.1007/s40593-021-00285-9" },
  { id: 15, text: "Liao, Q. V., Gruen, D., & Miller, S. (2020). Questioning the AI: Informing design practices for explainable AI user experiences. Proceedings of CHI 2020.", doi: "10.1145/3313831.3376590" },
];

export default function InstitutionalProposal() {
  useEffect(() => {
    document.title = "Institutional Partnership Proposal | Future Work Academy";
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
          h1 { font-size: 22pt !important; }
          h2 { font-size: 16pt !important; }
          h3 { font-size: 12pt !important; }
          p, li, span, td { color: #333 !important; }
          .text-muted-foreground { color: #555 !important; }
          a { color: #1e3a5f !important; text-decoration: underline; }
          a > sup { text-decoration: none; }
          .min-h-\\[85vh\\], .min-h-\\[90vh\\] { min-height: auto !important; padding: 2rem 0 !important; }
          .bg-gradient-to-b, .bg-gradient-to-br { background: none !important; }
          .rounded-xl, .rounded-2xl, .rounded-lg { border-radius: 3px !important; }
          .border { border: 1px solid #ccc !important; }
          section { padding-top: 1rem !important; padding-bottom: 1rem !important; }
          .py-24, .py-16, .sm\\:py-32, .sm\\:py-20 { padding-top: 1rem !important; padding-bottom: 1rem !important; }
          .bg-primary\\/5 { background-color: #f0f4f8 !important; }
          .bg-primary\\/10 { background-color: #e8eef5 !important; }
          .bg-muted\\/30, .bg-muted\\/50, .bg-muted { background-color: #f5f5f5 !important; }
          .grid { gap: 0.6rem !important; }
          .p-4, .p-6, .sm\\:p-8 { padding: 0.5rem !important; }
          .gap-4, .gap-6 { gap: 0.5rem !important; }
          .mb-10, .mb-8 { margin-bottom: 0.75rem !important; }
          .mb-6 { margin-bottom: 0.5rem !important; }
          .space-y-6 > * + * { margin-top: 0.5rem !important; }
          img.rounded-full { width: 60px !important; height: 60px !important; }
          .border-border { border: 1px solid #ccc !important; }
          table { border-collapse: collapse !important; width: 100% !important; }
          th, td { border: 1px solid #ccc !important; padding: 0.3rem 0.5rem !important; font-size: 9pt !important; }
          th { background: #e8eef5 !important; font-weight: bold !important; }
          .bg-card { background: #fff !important; border: 1px solid #ddd !important; }
          .text-xs { font-size: 8.5pt !important; }
          .text-sm { font-size: 9pt !important; }
          .leading-relaxed { line-height: 1.5 !important; }
          .bg-card, [class*="CardContent"] { break-inside: avoid; page-break-inside: avoid; }
          ol > li { break-inside: avoid; page-break-inside: avoid; }
          .print-only p { color: inherit !important; }
        }
      `}</style>

      <div className="min-h-screen bg-background" data-testid="page-institutional-proposal">
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b no-print">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" data-testid="link-back">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <BrandLogo height="h-8" data-testid="img-nav-logo" />
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

        {/* Hero */}
        <section className="min-h-[85vh] flex items-center justify-center pt-20 pb-16 px-4 bg-gradient-to-b from-[#1e3a5f]/5 to-transparent">
          <div className="container mx-auto max-w-4xl text-center">
            <FadeInSection>
              <p className="text-sm font-medium text-primary uppercase tracking-widest mb-4">Confidential Proposal</p>
            </FadeInSection>
            <FadeInSection delay={150}>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
                Institutional Partnership Proposal
              </h1>
            </FadeInSection>
            <FadeInSection delay={300}>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
                AI-Driven Experiential Learning for Graduate Business Education — A FERPA-Aligned Platform Grounded in Established Learning Science
              </p>
            </FadeInSection>
            <FadeInSection delay={450}>
              <p className="text-sm text-muted-foreground">
                Prepared by Doug Mitchell, M.S. — Founder, Future Work Academy
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </p>
            </FadeInSection>
            <FadeInSection delay={600}>
              <ChevronDown className="h-6 w-6 mx-auto mt-12 animate-bounce text-muted-foreground" />
            </FadeInSection>
          </div>
        </section>

        {/* Executive Summary */}
        <section className="py-24 sm:py-32 px-4">
          <div className="container mx-auto max-w-4xl">
            <FadeInSection>
              <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">Overview</p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-8">Executive Summary</h2>
            </FadeInSection>
            <FadeInSection delay={150}>
              <div className="prose prose-lg dark:prose-invert max-w-none space-y-6">
                <p className="text-lg leading-relaxed text-muted-foreground">
                  Future Work Academy (FWA) is a web-based business simulation platform where graduate students assume leadership of a mid-size manufacturing company navigating AI transformation. Over 8 weeks, student teams make consequential decisions about technology adoption, workforce development, and stakeholder management — experiencing the tensions and trade-offs that real business leaders face.
                </p>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  The platform is designed for AACSB-aligned graduate programs in business strategy, organizational behavior, analytics, and management. It fills a critical gap: while AI transformation is reshaping every industry, few graduate programs offer hands-on, scenario-based experiences that prepare students for the human dimensions of this change.
                </p>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  FWA is not a generic simulation engine. It is a scholar-practitioner tool built on established learning science, featuring AI-powered formative assessment, radical grading transparency, and a privacy-first architecture designed for institutional adoption. This proposal outlines the platform's theoretical foundations, current compliance posture, and a partnership framework for pilot deployment and collaborative research.
                </p>
              </div>
            </FadeInSection>
          </div>
        </section>

        {/* Pedagogical & Theoretical Framework */}
        <section className="py-24 sm:py-32 px-4 bg-muted/30 print:break-before-page">
          <div className="container mx-auto max-w-5xl">
            <FadeInSection>
              <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">Academic Foundation</p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Pedagogical & Theoretical Framework</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mb-12 leading-relaxed">
                Every design decision in FWA is grounded in established learning science. The platform operationalizes eight foundational theories, creating a cohesive pedagogical architecture that connects research to practice.
              </p>
            </FadeInSection>

            <div className="space-y-6">
              {THEORETICAL_FOUNDATIONS.map((item, i) => {
                const Icon = item.icon;
                return (
                  <FadeInSection key={item.theory} delay={i * 100}>
                    <Card className="bg-card border">
                      <CardContent className="p-6 sm:p-8">
                        <div className="flex items-start gap-4">
                          <div className="bg-primary/10 rounded-lg p-3 shrink-0 mt-1">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-baseline gap-x-3">
                              <h3 className="text-xl font-bold">{item.theory}<sup className="text-xs text-primary ml-0.5">[{item.refNum}]</sup></h3>
                              <span className="text-sm text-muted-foreground">
                                {item.authors} ({item.year})
                              </span>
                            </div>
                            <p className="text-sm italic text-muted-foreground">{item.title}</p>
                            {item.doi && (
                              <a
                                href={`https://doi.org/${item.doi}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                              >
                                DOI: {item.doi}
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                            <p className="text-muted-foreground leading-relaxed pt-2">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </FadeInSection>
                );
              })}
            </div>

            <FadeInSection delay={200}>
              <Card className="mt-10 border-primary/20 bg-primary/5">
                <CardContent className="p-6 sm:p-8">
                  <div className="flex items-start gap-3">
                    <BookOpen className="h-5 w-5 text-primary shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold mb-2">For a deeper treatment of this theoretical framework:</p>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        The published white paper — <em>"Bridging the Relevance Gap: AI-Driven Experiential Learning for the Future of Work"</em> — synthesizes these foundations into a 7-section academic paper with 17 references and DOI links. The{" "}
                        <a href="/methodology" className="text-primary hover:underline">Grading Methodology</a> page provides complete transparency into assessment design, rubric criteria, and scoring calibration.
                      </p>
                      <div className="flex gap-3 mt-4 no-print">
                        <Link href="/white-paper">
                          <Button variant="outline" size="sm" data-testid="link-white-paper">
                            <FileText className="h-4 w-4 mr-2" />
                            Read the White Paper
                          </Button>
                        </Link>
                        <Link href="/methodology">
                          <Button variant="outline" size="sm" data-testid="link-methodology">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            View Methodology
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

        {/* Learning Outcomes & Assessment Design */}
        <section className="py-24 sm:py-32 px-4 print:break-before-page">
          <div className="container mx-auto max-w-4xl">
            <FadeInSection>
              <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">Assessment Architecture</p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-8">Learning Outcomes & Assessment Design</h2>
            </FadeInSection>

            <FadeInSection delay={150}>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                FWA employs a structured assessment approach informed by research on automated essay scoring<sup className="text-xs text-primary">[9]</sup> and constructive alignment<sup className="text-xs text-primary">[12]</sup>. Every rubric criterion, scoring band, and evaluation guideline is published and visible to students — a practice we call <strong>radical transparency</strong>.
              </p>
            </FadeInSection>

            <div className="grid gap-6 md:grid-cols-2">
              <FadeInSection delay={200}>
                <Card className="bg-card border h-full">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Structured 3-Part Responses
                    </h3>
                    <ul className="space-y-3 text-muted-foreground text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-primary font-bold mt-0.5">1.</span>
                        <span><strong>Evidence-Based Rationale</strong> — Students cite specific simulation data sources (AIM, APX, WFT, ATL, CMP, TFG) to support their decision</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary font-bold mt-0.5">2.</span>
                        <span><strong>Stakeholder Trade-offs</strong> — Analysis of how the decision impacts different character groups, requiring multi-perspective reasoning</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary font-bold mt-0.5">3.</span>
                        <span><strong>Risk Mitigation</strong> — Identification of potential negative outcomes and contingency strategies, building strategic foresight</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </FadeInSection>

              <FadeInSection delay={350}>
                <Card className="bg-card border h-full">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      4-Criterion Rubric (25 pts each)
                    </h3>
                    <ul className="space-y-3 text-muted-foreground text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                        <span><strong>Evidence Quality</strong> — Specificity and relevance of cited data sources</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                        <span><strong>Reasoning Coherence</strong> — Logical flow from evidence to conclusion</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                        <span><strong>Trade-off Analysis</strong> — Depth of multi-stakeholder impact assessment</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                        <span><strong>Stakeholder Consideration</strong> — Breadth and nuance of perspective-taking</span>
                      </li>
                    </ul>
                    <p className="text-xs text-muted-foreground mt-4 border-t pt-3">
                      Calibrated scoring bands: Excellent ≥93% | Good ≥72% | Adequate ≥52% | Poor &lt;52%
                    </p>
                  </CardContent>
                </Card>
              </FadeInSection>
            </div>

            <FadeInSection delay={400}>
              <Card className="mt-6 bg-card border">
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    AI-Powered Formative Assessment
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    Student responses are evaluated by GPT-4o-mini using the published rubric criteria. The AI evaluator receives only the response text and simulation context — <strong>no student PII is ever transmitted</strong>. Feedback includes per-criterion scores, specific strengths, improvement recommendations, and an overall quality assessment. This approach aligns with established automated essay scoring research<sup className="text-xs text-primary">[9]</sup> while maintaining the transparency and fairness that Black & Wiliam<sup className="text-xs text-primary">[3]</sup> identify as essential for formative assessment to drive learning.
                  </p>
                  <p className="text-muted-foreground leading-relaxed text-sm mt-3">
                    Optional curved scoring using Z-score normalization is available for instructors who prefer relative grading, but is disabled by default to prioritize criterion-referenced feedback.
                  </p>
                </CardContent>
              </Card>
            </FadeInSection>
          </div>
        </section>

        {/* AI Ethics & Transparency */}
        <section className="py-24 sm:py-32 px-4 bg-muted/30 print:break-before-page">
          <div className="container mx-auto max-w-4xl">
            <FadeInSection>
              <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">Responsible AI</p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">AI Ethics & Transparency</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mb-10 leading-relaxed">
                FWA uses AI across three domains: essay evaluation, content generation, and media production. Each domain carries distinct ethical considerations. Our approach prioritizes explainability<sup className="text-xs text-primary">[15]</sup>, demographic neutrality<sup className="text-xs text-primary">[14]</sup>, and full disclosure of AI involvement.
              </p>
            </FadeInSection>

            <FadeInSection delay={100}>
              <Card className="bg-card border mb-6">
                <CardContent className="p-6 sm:p-8">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Scoring Bias Safeguards
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    Algorithmic bias in educational AI is a documented concern<sup className="text-xs text-primary">[13]</sup><sup className="text-xs text-primary">[14]</sup>. FWA implements multiple layers of protection to ensure scoring fairness:
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      { title: "Blind Evaluation", desc: "No student name, email, gender, age, ethnicity, or institutional identifier is ever sent to the AI. The evaluator receives only the response text and simulation context." },
                      { title: "Deterministic Configuration", desc: "AI models are configured with low-temperature settings to minimize output variance, producing highly consistent scores for the same response across evaluations." },
                      { title: "Source-Based Rubrics", desc: "Scoring rewards specific data citations and logical reasoning — not writing style, vocabulary sophistication, or rhetorical flourish. This reduces sociolinguistic bias." },
                      { title: "Explicit Calibration", desc: "The AI prompt includes scoring calibration guidance that prevents systematic score compression, ensuring strong work is rewarded generously rather than clustered around a safe middle." },
                      { title: "Human Override", desc: "Instructors can review and adjust any AI-generated score. The system is designed as an evaluation assistant, not a replacement for instructor judgment." },
                      { title: "Distribution Monitoring", desc: "The Week Summary Dashboard provides visual score distribution charts per week, enabling instructors to identify and investigate scoring anomalies across cohorts." },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-sm">{item.title}</p>
                          <p className="text-xs text-muted-foreground leading-relaxed mt-1">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </FadeInSection>

            <FadeInSection delay={200}>
              <Card className="bg-card border mb-6">
                <CardContent className="p-6 sm:p-8">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Eye className="h-5 w-5 text-primary" />
                    AI-Generated Media Disclosure
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    FWA uses AI to generate visual and audio assets for the simulation. In the interest of full transparency:
                  </p>
                  <div className="space-y-3">
                    {[
                      { media: "Character Headshots", tech: "OpenAI DALL-E (gpt-image-1)", detail: "23 stakeholder character portraits are AI-generated using detailed prompts specifying professional corporate photography style. No real individuals are depicted." },
                      { media: "Advisor Audio", tech: "ElevenLabs Text-to-Speech", detail: "Phone-a-Friend advisor audio clips are synthesized from text scripts using voice profiles designed for each character persona. All advisors are fictional." },
                      { media: "Hero & Feature Images", tech: "OpenAI DALL-E", detail: "Background images on public-facing pages (boardroom scenes, classroom settings) are AI-generated for editorial illustration purposes." },
                      { media: "Brand Assets", tech: "AI-Assisted Design", detail: "Logo lockups and brand iconography were developed with AI design assistance and refined through manual iteration." },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <div className="bg-primary/10 rounded p-1.5 shrink-0 mt-0.5">
                          <FileText className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-sm">{item.media}</p>
                            <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{item.tech}</span>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed mt-1">{item.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-4 border-t pt-3 italic">
                    Full AI transparency documentation — including exact prompts, model configurations, and data handling policies — is maintained internally and available for institutional review upon request.
                  </p>
                </CardContent>
              </Card>
            </FadeInSection>

            <FadeInSection delay={300}>
              <Card className="bg-card border mb-6">
                <CardContent className="p-6 sm:p-8">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Lock className="h-5 w-5 text-primary" />
                    AI Data Handling & Student Privacy
                  </h3>
                  <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                    <p>
                      Student essay submissions are evaluated by OpenAI's GPT-4o-mini via API endpoints governed by OpenAI's enterprise data usage policies. The following safeguards are in place:
                    </p>
                    <ul className="space-y-2 ml-4">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                        <span><strong>No PII Transmission:</strong> Only the response text and simulation context (scenario description, available data sources, rubric criteria) are sent to the AI. Student names, emails, and identifiers are never included.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                        <span><strong>No Model Training:</strong> Under OpenAI's data usage policy for API customers, inputs and outputs are not used to train or improve models. Data retention is governed by the provider's enterprise terms, with zero-day retention available upon request.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                        <span><strong>Explainable Outputs:</strong> Every AI evaluation returns structured feedback (per-criterion scores, specific strengths, improvement recommendations) — not just a number. Students can see exactly why they received their score<sup className="text-xs text-primary">[15]</sup>.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                        <span><strong>Radical Transparency:</strong> The complete rubric, scoring bands, and evaluation criteria are published and visible to students while writing — before, during, and after submission. There are no hidden formulas or opaque algorithms.</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </FadeInSection>

            <FadeInSection delay={400}>
              <Card className="bg-card border mb-6">
                <CardContent className="p-6 sm:p-8">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Ongoing Validity & Fairness Monitoring
                  </h3>
                  <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                    <p>
                      AI assessment is not a "set and forget" system. FWA provides built-in tools for continuous validation:
                    </p>
                    <ul className="space-y-2 ml-4">
                      <li className="flex items-start gap-2">
                        <span className="text-primary font-bold">•</span>
                        <span><strong>Score Distribution Dashboard:</strong> Visual histograms and distribution charts per week allow instructors to spot skewed distributions, ceiling/floor effects, or scoring drift across the simulation timeline.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary font-bold">•</span>
                        <span><strong>Instructor Override Tracking:</strong> When instructors adjust AI scores, the system logs the original and modified values — creating a dataset for inter-rater reliability analysis between AI and human evaluators.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary font-bold">•</span>
                        <span><strong>Student Feedback Surveys:</strong> Per-week surveys capture student perceptions of fairness, difficulty, and learning value on validated scales — including self-efficacy<sup className="text-xs text-primary">[11]</sup> and productive struggle<sup className="text-xs text-primary">[2]</sup> constructs — providing triangulated data on assessment quality.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary font-bold">•</span>
                        <span><strong>Difficulty-Adjusted Evaluation:</strong> The 3-tier framework adjusts AI evaluation expectations by difficulty level — Introductory scenarios award partial credit more generously, while Advanced scenarios maintain rigorous professional standards — ensuring fairness across heterogeneous student populations.</span>
                      </li>
                    </ul>
                    <p className="mt-3 italic border-t pt-3">
                      We welcome institutional partnerships that include formal validity studies — comparing AI-generated scores with instructor-assigned scores across demographic groups — as a publishable research outcome.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </FadeInSection>

            <FadeInSection delay={500}>
              <Card className="bg-card border">
                <CardContent className="p-6 sm:p-8">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Monitor className="h-5 w-5 text-primary" />
                    Accessibility Posture
                  </h3>
                  <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                    <p>
                      FWA is committed to ensuring equitable access for all learners, including those with disabilities. The platform's UI is built on <strong>Radix UI primitives</strong> — a component library specifically engineered for accessibility — providing a strong architectural foundation.
                    </p>

                    <div>
                      <p className="font-semibold text-foreground text-sm mb-2">Architectural Accessibility Features</p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {[
                          { feature: "Keyboard Navigation", detail: "Core UI components (menus, modals, tabs, forms) are built on Radix primitives designed for keyboard operability with visible focus indicators. Custom interactive widgets will undergo manual keyboard testing before pilot deployment." },
                          { feature: "ARIA Semantics", detail: "Screen reader support via ARIA labels, roles, and live regions is provided through Radix-based components. Full conformance across all views is pending formal WCAG audit." },
                          { feature: "Alt Text on Images", detail: "Development standards require descriptive alt text on meaningful images and empty alt attributes on decorative images, following WCAG guidance." },
                          { feature: "Focus Management", detail: "Radix-based modals trap focus correctly, dialogs return focus on close, and tab order follows logical reading sequence." },
                          { feature: "Light & Dark Themes", detail: "Full theme support with defined foreground/background contrast ratios for both modes, reducing visual fatigue." },
                          { feature: "Semantic HTML", detail: "Heading hierarchy, landmark regions, and form labels are used to convey content structure to assistive technologies." },
                        ].map((item, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                            <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-semibold text-sm">{item.feature}</p>
                              <p className="text-xs text-muted-foreground leading-relaxed mt-1">{item.detail}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="font-semibold text-foreground text-sm mb-2">Known Limitations & Roadmap</p>
                      <div className="space-y-2">
                        {[
                          { status: "planned", label: "WCAG 2.1 AA Formal Audit", detail: "A professional external accessibility audit is scheduled for Q2 2026. Following audit completion and remediation, FWA will publish a Voluntary Product Accessibility Template (VPAT/ACR) — the standard conformance report universities request during procurement." },
                          { status: "planned", label: "Color Contrast Verification", detail: "While the platform uses defined contrast ratios in both themes, a systematic audit against WCAG 2.1 AA contrast minimums (4.5:1 for normal text, 3:1 for large text) has not yet been completed." },
                          { status: "planned", label: "Color Blindness Review", detail: "Status indicators currently use green/amber/red color coding. A review is planned to ensure all color-coded information is also conveyed through icons, labels, or patterns — so no information is communicated by color alone." },
                          { status: "planned", label: "Custom Widget Keyboard Testing", detail: "While Radix-based components provide built-in keyboard support, custom interactive elements (audio players, specialized controls) require manual keyboard and screen reader testing — scheduled as part of the WCAG audit cycle." },
                          { status: "available", label: "Multimedia Transcripts", detail: "All advisor audio content includes full text transcripts, ensuring audio-dependent content is accessible to deaf and hard-of-hearing users." },
                        ].map((item, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                            {item.status === "available" ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                            ) : (
                              <Clock className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                            )}
                            <div>
                              <p className="font-semibold text-sm">{item.label}</p>
                              <p className="text-xs text-muted-foreground leading-relaxed mt-1">{item.detail}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <p className="mt-2 italic border-t pt-3">
                      FWA's accessibility approach mirrors its compliance philosophy: build the right architecture first, then validate with formal audits. We welcome accessibility feedback from institutional partners and are committed to addressing identified barriers before pilot deployment.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </FadeInSection>
          </div>
        </section>

        {/* Current Compliance Posture */}
        <section className="py-24 sm:py-32 px-4 print:break-before-page">
          <div className="container mx-auto max-w-4xl">
            <FadeInSection>
              <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">Privacy & Security</p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Current Compliance Posture</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mb-10 leading-relaxed">
                FWA was built with a privacy-first architecture. Rather than collecting student data and then protecting it, the platform minimizes data collection from the start — reducing FERPA exposure by design.
              </p>
            </FadeInSection>

            <div className="grid gap-4 sm:grid-cols-2">
              {COMPLIANCE_COMPLETED.map((item, i) => (
                <FadeInSection key={item} delay={i * 75}>
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-card border">
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm">{item}</span>
                  </div>
                </FadeInSection>
              ))}
            </div>

            <FadeInSection delay={300}>
              <Card className="mt-8 border-primary/20 bg-primary/5">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-primary shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold mb-1">Privacy Mode — Immediate Classroom Deployment</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Privacy Mode enables anonymous enrollment using pseudonymous identifiers (e.g., Student_abc12345). No real names, email addresses, phone numbers, or institutional IDs are collected. Instructors receive an offline roster template to map identifiers to students in their own secure systems. All SMS/email notifications are automatically suppressed. This allows deployment without a formal DPA — though we recommend one for institutional peace of mind.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeInSection>
          </div>
        </section>

        {/* Understanding FERPA */}
        <section className="py-24 sm:py-32 px-4 print:break-before-page">
          <div className="container mx-auto max-w-4xl">
            <FadeInSection>
              <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">Regulatory Context</p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-8">Understanding FERPA & the Compliance Pathway</h2>
            </FadeInSection>

            <FadeInSection delay={150}>
              <Card className="bg-card border mb-10">
                <CardContent className="p-6 sm:p-8">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Eye className="h-5 w-5 text-primary" />
                    What FERPA Is (and Isn't)
                  </h3>
                  <div className="space-y-4 text-muted-foreground leading-relaxed text-sm">
                    <p>
                      <strong>FERPA (Family Educational Rights and Privacy Act)</strong> is a federal law that protects the privacy of student education records. It applies to educational institutions that receive federal funding — not directly to software vendors.
                    </p>
                    <p>
                      There is no "FERPA certification" that a vendor obtains. Instead, software platforms support institutional compliance by implementing appropriate safeguards, executing Data Processing Agreements (DPAs), and demonstrating security practices through assessments like HECVAT and SOC 2.
                    </p>
                    <p>
                      FWA's approach is data minimization: by collecting the minimum data necessary for educational purposes (and offering Privacy Mode that collects no PII at all), the platform reduces the institution's FERPA compliance burden significantly. Student simulation responses and scores constitute "education records" under FERPA, and FWA treats them accordingly — with access controls, encryption, audit logging, and clear data handling policies.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </FadeInSection>

            <FadeInSection delay={200}>
              <h3 className="text-xl font-bold mb-6">Compliance Roadmap</h3>
            </FadeInSection>

            <div className="space-y-4">
              {COMPLIANCE_ROADMAP.map((item, i) => (
                <FadeInSection key={item.label} delay={250 + i * 100}>
                  <Card className="bg-card border">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className={`rounded-full p-2 shrink-0 mt-0.5 ${item.status === "in_progress" ? "bg-amber-500/10 text-amber-600" : "bg-muted text-muted-foreground"}`}>
                          {item.status === "in_progress" ? (
                            <Clock className="h-4 w-4" />
                          ) : (
                            <ClipboardList className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h4 className="font-bold">{item.label}</h4>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                              item.status === "in_progress"
                                ? "bg-amber-500/10 text-amber-600"
                                : "bg-muted text-muted-foreground"
                            }`}>
                              {item.status === "in_progress" ? "In Progress" : "Planned"} — {item.target}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </FadeInSection>
              ))}
            </div>
          </div>
        </section>

        {/* Funding & Grant Opportunities */}
        <section className="py-24 sm:py-32 px-4 bg-muted/30 print:break-before-page">
          <div className="container mx-auto max-w-4xl">
            <FadeInSection>
              <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">Funding Pathways</p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Grant & Funding Opportunities</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mb-10 leading-relaxed">
                FWA's combination of innovative pedagogy, AI-assisted assessment, and workforce preparation aligns with multiple federal and institutional funding programs. A joint application with institutional co-investigators significantly strengthens competitiveness.
              </p>
            </FadeInSection>

            <div className="space-y-4">
              {GRANT_OPPORTUNITIES.map((grant, i) => (
                <FadeInSection key={grant.name} delay={i * 100}>
                  <Card className="bg-card border">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="bg-primary/10 rounded-lg p-3 shrink-0">
                          <Banknote className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{grant.name}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{grant.fullName}</p>
                          <p className="text-sm text-muted-foreground leading-relaxed">{grant.description}</p>
                          {grant.url && (
                            <a
                              href={grant.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-2"
                            >
                              Learn more <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </FadeInSection>
              ))}
            </div>
          </div>
        </section>

        {/* The Partnership Proposal */}
        <section className="py-24 sm:py-32 px-4 print:break-before-page">
          <div className="container mx-auto max-w-4xl">
            <FadeInSection>
              <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">Collaboration</p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-8">The Partnership Proposal</h2>
            </FadeInSection>

            <FadeInSection delay={150}>
              <p className="text-lg text-muted-foreground leading-relaxed mb-10">
                This proposal seeks a mutually beneficial partnership that advances both institutional innovation goals and FWA's mission to transform graduate business education. The framework below outlines three areas of collaboration.
              </p>
            </FadeInSection>

            <div className="grid gap-6 md:grid-cols-3">
              <FadeInSection delay={200}>
                <Card className="bg-card border h-full">
                  <CardContent className="p-6 text-center">
                    <div className="bg-primary/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <GraduationCap className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="font-bold text-lg mb-3">Pilot Deployment</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Deploy FWA in 1–2 graduate courses (e.g., Strategic Management, Business Analytics, Organizational Behavior) for one semester. Privacy Mode enables immediate adoption without complex IT approvals.
                    </p>
                  </CardContent>
                </Card>
              </FadeInSection>

              <FadeInSection delay={350}>
                <Card className="bg-card border h-full">
                  <CardContent className="p-6 text-center">
                    <div className="bg-primary/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <FileText className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="font-bold text-lg mb-3">Research Collaboration</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Joint grant applications as co-investigators with publishable research outcomes — student engagement analytics, AI assessment validity, learning efficacy measurement, and productive failure in simulated environments.
                    </p>
                  </CardContent>
                </Card>
              </FadeInSection>

              <FadeInSection delay={500}>
                <Card className="bg-card border h-full">
                  <CardContent className="p-6 text-center">
                    <div className="bg-primary/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <Handshake className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="font-bold text-lg mb-3">Institutional Support</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Departmental sponsorship for compliance milestones (HECVAT, SOC 2), IT security review facilitation, IRB support for research protocols, and introductions to university grant offices.
                    </p>
                  </CardContent>
                </Card>
              </FadeInSection>
            </div>

            <FadeInSection delay={400}>
              <Card className="mt-10 border-2 border-primary/20">
                <CardContent className="p-6 sm:p-8">
                  <h3 className="font-bold text-lg mb-4">What the Institution Gains</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      "Innovation leadership in AI-integrated curriculum",
                      "Publishable research data from student engagement metrics",
                      "Differentiated program offering for recruitment",
                      "Hands-on AI literacy training for graduate students",
                      "Built-in student feedback surveys with analytics dashboard",
                      "Faculty development in simulation-based pedagogy",
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

        {/* Platform Highlights */}
        <section className="py-24 sm:py-32 px-4 bg-muted/30 print:break-before-page">
          <div className="container mx-auto max-w-5xl">
            <FadeInSection>
              <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">Live Platform</p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Explore the Platform</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mb-10 leading-relaxed">
                Every page below is live and accessible. Click through to explore the platform's depth — from published grading methodology to the full academic white paper.
              </p>
            </FadeInSection>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {PLATFORM_LINKS.map((link, i) => {
                const Icon = link.icon;
                return (
                  <FadeInSection key={link.path} delay={i * 100}>
                    <a href={link.path} target="_blank" rel="noopener noreferrer">
                      <Card className="bg-card border h-full hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer group">
                        <CardContent className="p-5">
                          <div className="flex items-start gap-3">
                            <div className="bg-primary/10 rounded-lg p-2 shrink-0 group-hover:bg-primary/20 transition-colors">
                              <Icon className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-bold text-sm mb-1 group-hover:text-primary transition-colors">{link.label}</h3>
                              <p className="text-xs text-muted-foreground leading-relaxed">{link.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </a>
                  </FadeInSection>
                );
              })}
            </div>
          </div>
        </section>

        {/* Contact & Next Steps */}
        <section className="py-24 sm:py-32 px-4 print:break-before-page">
          <div className="container mx-auto max-w-4xl">
            <FadeInSection>
              <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">Next Steps</p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-10">About the Founder & Contact</h2>
            </FadeInSection>

            <FadeInSection delay={150}>
              <Card className="bg-card border">
                <CardContent className="p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    <img
                      src={dougPhoto}
                      alt="Doug Mitchell"
                      className="w-24 h-24 rounded-full object-cover border-2 border-primary/20"
                    />
                    <div className="text-center sm:text-left">
                      <h3 className="text-xl font-bold mb-1">Doug Mitchell, M.S.</h3>
                      <p className="text-sm text-muted-foreground mb-4">Founder, Future Work Academy</p>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                        Doug is a practitioner-scholar with experience in analytics, workforce transformation, and business education. Future Work Academy was built from firsthand observation that graduate business programs need immersive, scenario-based tools to prepare students for the human dimensions of AI adoption — not just the technical ones.
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
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeInSection>

            <FadeInSection delay={300}>
              <Card className="mt-6 bg-card border">
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-4">Suggested Next Steps</h3>
                  <ol className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-start gap-3">
                      <span className="bg-primary/10 text-primary font-bold rounded-full w-6 h-6 flex items-center justify-center shrink-0 text-xs">1</span>
                      <span><strong>Schedule a live demo</strong> — Walk through the full simulation experience, including student and instructor dashboards</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="bg-primary/10 text-primary font-bold rounded-full w-6 h-6 flex items-center justify-center shrink-0 text-xs">2</span>
                      <span><strong>Review the Methodology page</strong> — See how grading transparency, rubric criteria, and AI assessment work in practice</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="bg-primary/10 text-primary font-bold rounded-full w-6 h-6 flex items-center justify-center shrink-0 text-xs">3</span>
                      <span><strong>Identify pilot courses</strong> — Determine 1–2 graduate courses suitable for a one-semester deployment</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="bg-primary/10 text-primary font-bold rounded-full w-6 h-6 flex items-center justify-center shrink-0 text-xs">4</span>
                      <span><strong>Discuss grant opportunities</strong> — Explore co-investigator roles and available funding mechanisms</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="bg-primary/10 text-primary font-bold rounded-full w-6 h-6 flex items-center justify-center shrink-0 text-xs">5</span>
                      <span><strong>Initiate institutional review</strong> — Begin HECVAT / IT security review process with campus IT</span>
                    </li>
                  </ol>
                </CardContent>
              </Card>
            </FadeInSection>
          </div>
        </section>

        {/* References */}
        <section className="py-16 px-4 border-t print:break-before-page">
          <div className="container mx-auto max-w-4xl">
            <FadeInSection>
              <h2 className="text-2xl font-bold tracking-tight mb-6">References</h2>
              <ol className="space-y-2 text-sm text-muted-foreground">
                {REFERENCES.map((ref) => (
                  <li key={ref.id} className="flex items-start gap-2">
                    <span className="text-primary font-mono text-xs mt-0.5">[{ref.id}]</span>
                    <span>
                      {ref.text}
                      {ref.doi && (
                        <>
                          {" "}
                          <a
                            href={`https://doi.org/${ref.doi}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            doi:{ref.doi}
                          </a>
                        </>
                      )}
                    </span>
                  </li>
                ))}
              </ol>
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
