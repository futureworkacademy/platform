import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { AppFooter } from "@/components/app-footer";
import { Link } from "wouter";
import {
  ArrowRight,
  Download,
  BookOpen,
  Brain,
  Users,
  Eye,
  Target,
  Layers,
  FlaskConical,
  ChevronDown,
  GraduationCap,
  ExternalLink,
} from "lucide-react";
import logoForLight from "@assets/logo-horizontal.png";
import logoForDark from "@assets/logo-white.png";

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

const REFERENCES = [
  { id: 1, authors: "Bartunek, J. M. & Rynes, S. L.", year: 2014, title: "Academics and practitioners are alike and unlike: The paradoxes of academic-practitioner relationships", journal: "Journal of Management", volume: "40(5)", pages: "1181–1201", doi: "https://doi.org/10.1177/0149206314529160" },
  { id: 2, authors: "Black, P. & Wiliam, D.", year: 1998, title: "Assessment and classroom learning", journal: "Assessment in Education: Principles, Policy & Practice", volume: "5(1)", pages: "7–74", doi: "https://doi.org/10.1080/0969595980050102" },
  { id: 3, authors: "Brown, J. S., Collins, A., & Duguid, P.", year: 1989, title: "Situated cognition and the culture of learning", journal: "Educational Researcher", volume: "18(1)", pages: "32–42", doi: "https://doi.org/10.3102/0013189X018001032" },
  { id: 4, authors: "Hattie, J. & Timperley, H.", year: 2007, title: "The power of feedback", journal: "Review of Educational Research", volume: "77(1)", pages: "81–112", doi: "https://doi.org/10.3102/003465430298487" },
  { id: 5, authors: "Hay, A. & Heracleous, L.", year: 2009, title: "Rethinking management education: A practice-based approach", conference: "UFHRD Annual Conference", doi: "" },
  { id: 6, authors: "Kapur, M.", year: 2008, title: "Productive failure", journal: "Cognition and Instruction", volume: "26(3)", pages: "379–424", doi: "https://doi.org/10.1080/07370000802212669" },
  { id: 7, authors: "Kapur, M.", year: 2016, title: "Examining productive failure, productive success, and constructive failure as learning designs", journal: "Journal of the Learning Sciences", volume: "25(4)", pages: "601–630", doi: "https://doi.org/10.1080/10508406.2016.1166810" },
  { id: 8, authors: "Kayes, D. C.", year: 2002, title: "Experiential learning and its critics: Preserving the role of experience in management learning and education", journal: "Academy of Management Learning & Education", volume: "1(2)", pages: "137–149", doi: "https://doi.org/10.5465/amle.2002.8509336" },
  { id: 9, authors: "Kolb, D. A.", year: 1984, title: "Experiential Learning: Experience as the Source of Learning and Development", journal: "Englewood Cliffs, NJ: Prentice-Hall", volume: "", pages: "", doi: "" },
  { id: 10, authors: "Mitchell, R. K., Agle, B. R., & Wood, D. J.", year: 1997, title: "Toward a theory of stakeholder identification and salience: Defining the principle of who and what really counts", journal: "Academy of Management Review", volume: "22(4)", pages: "853–886", doi: "https://doi.org/10.5465/amr.1997.9711022105" },
  { id: 11, authors: "Shermis, M. D. & Burstein, J.", year: 2013, title: "Handbook of Automated Essay Evaluation: Current Applications and New Directions", journal: "New York: Routledge", volume: "", pages: "", doi: "https://doi.org/10.4324/9780203122761" },
  { id: 12, authors: "UNDP", year: 2025, title: "Human Development Report: AI and the Future of Work", journal: "United Nations Development Programme", volume: "", pages: "", doi: "https://hdr.undp.org" },
  { id: 13, authors: "Wood, D., Bruner, J. S., & Ross, G.", year: 1976, title: "The role of tutoring in problem solving", journal: "Journal of Child Psychology and Psychiatry", volume: "17(2)", pages: "89–100", doi: "https://doi.org/10.1111/j.1469-7610.1976.tb00381.x" },
  { id: 14, authors: "Bandura, A.", year: 1997, title: "Self-Efficacy: The Exercise of Control", journal: "New York: W. H. Freeman", volume: "", pages: "", doi: "" },
  { id: 15, authors: "Kirkpatrick, D. L.", year: 1994, title: "Evaluating Training Programs: The Four Levels", journal: "San Francisco: Berrett-Koehler", volume: "", pages: "", doi: "" },
  { id: 16, authors: "Vygotsky, L. S.", year: 1978, title: "Mind in Society: The Development of Higher Psychological Processes", journal: "Cambridge, MA: Harvard University Press", volume: "", pages: "", doi: "" },
  { id: 17, authors: "Biggs, J.", year: 1996, title: "Enhancing teaching through constructive alignment", journal: "Higher Education", volume: "32(3)", pages: "347–364", doi: "https://doi.org/10.1007/BF00138871" },
];

function Cite({ ids }: { ids: number[] }) {
  return (
    <sup className="text-xs">
      {ids.map((id, i) => (
        <span key={id}>
          {i > 0 && ", "}
          <a href="#references" className="text-primary hover:underline">{id}</a>
        </span>
      ))}
    </sup>
  );
}

export default function WhitePaper() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <style>{`
        @media print {
          header, footer, [data-testid="button-download-pdf"], [data-testid="button-sidebar-toggle"] { display: none !important; }
          section { break-inside: avoid; page-break-inside: avoid; min-height: auto !important; padding-top: 2rem !important; padding-bottom: 2rem !important; }
          .print\\:break-before-page { break-before: page; }
          body { font-size: 11pt; }
          * { animation: none !important; transition: none !important; opacity: 1 !important; transform: none !important; }
        }
      `}</style>

      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50 print:hidden">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Link href="/">
            <img src={logoForLight} alt="Future Work Academy" className="h-16 w-auto cursor-pointer block dark:hidden" data-testid="img-header-logo-light" />
            <img src={logoForDark} alt="Future Work Academy" className="h-16 w-auto cursor-pointer hidden dark:block" data-testid="img-header-logo-dark" />
          </Link>
          <div className="flex items-center gap-5">
            <Link href="/">
              <span className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:inline cursor-pointer" data-testid="link-home">Home</span>
            </Link>
            <Link href="/for-educators">
              <span className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:inline cursor-pointer" data-testid="link-for-educators">For Educators</span>
            </Link>
            <Link href="/methodology">
              <span className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:inline cursor-pointer" data-testid="link-methodology">Methodology</span>
            </Link>
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

      <main className="flex-1">

        <section className="relative min-h-[85vh] flex items-center justify-center px-4 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
          </div>
          <div className="relative z-10 container mx-auto max-w-4xl text-center space-y-8">
            <FadeInSection>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium" data-testid="badge-white-paper">
                <BookOpen className="h-3.5 w-3.5" />
                White Paper
              </div>
            </FadeInSection>
            <FadeInSection delay={150}>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08]" data-testid="text-hero-headline">
                Bridging the Relevance Gap:<br />
                <span className="text-primary">AI-Driven Experiential Learning</span><br />
                for the Future of Work
              </h1>
            </FadeInSection>
            <FadeInSection delay={300}>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed" data-testid="text-hero-subtitle">
                A formal analysis of how simulation-based pedagogy, transparent AI assessment,
                and stakeholder complexity design prepare students for organizational leadership
                in an era of technological transformation.
              </p>
            </FadeInSection>
            <FadeInSection delay={450}>
              <div className="flex flex-wrap justify-center gap-4 pt-2">
                <Button size="lg" onClick={handlePrint} data-testid="button-download-pdf">
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
                <a href="#section-1">
                  <Button size="lg" variant="outline" data-testid="button-begin-reading">
                    Begin Reading
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </a>
              </div>
            </FadeInSection>
            <FadeInSection delay={600}>
              <p className="text-sm text-muted-foreground" data-testid="text-author-info">
                Doug Mitchell, Ed.D. Candidate &middot; Future Work Academy &middot; 2025
              </p>
            </FadeInSection>
            <FadeInSection delay={750}>
              <div className="pt-4 animate-bounce"><ChevronDown className="h-6 w-6 text-muted-foreground mx-auto" /></div>
            </FadeInSection>
          </div>
        </section>

        <section id="section-1" className="py-24 sm:py-32 px-4 bg-card/30 print:break-before-page">
          <div className="container mx-auto max-w-4xl">
            <FadeInSection>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                  <Target className="h-5 w-5 text-red-500" />
                </div>
                <p className="text-sm font-medium text-primary uppercase tracking-widest">Section 1</p>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-8" data-testid="text-section-1-headline">
                The Relevance Gap
              </h2>
            </FadeInSection>
            <FadeInSection delay={150}>
              <div className="prose prose-lg dark:prose-invert max-w-none space-y-6">
                <p className="text-muted-foreground leading-relaxed text-base" data-testid="text-section-1-p1">
                  Management education has long confronted a persistent disconnect between what is
                  taught in classrooms and what is practiced in organizations. Hay and Heracleous
                  identified this as a fundamental failure of business school pedagogy to prepare
                  leaders for the ambiguity of real-world decision-making.<Cite ids={[5]} /> Bartunek
                  and Rynes deepened this critique by documenting the paradoxical relationship between
                  academic researchers and practitioners: despite shared goals, the two communities
                  operate with divergent time horizons, success metrics, and knowledge validation
                  standards.<Cite ids={[1]} />
                </p>
                <p className="text-muted-foreground leading-relaxed text-base" data-testid="text-section-1-p2">
                  The emergence of artificial intelligence as a transformative organizational force
                  has amplified this gap. The 2025 UNDP Human Development Report warns that AI-driven
                  workforce displacement will affect not only routine tasks but also knowledge-intensive
                  professional roles — the very roles MBA graduates expect to fill.<Cite ids={[12]} /> Traditional
                  case-based teaching, while valuable for developing analytical reasoning, offers
                  students static snapshots of organizational life. Cases do not compound. Decisions
                  made in Week 1 do not alter the strategic landscape of Week 4. There are no
                  stakeholders who remember what you promised.
                </p>
                <p className="text-muted-foreground leading-relaxed text-base" data-testid="text-section-1-p3">
                  The Future Work Academy platform was designed to address this gap directly —
                  creating a dynamic, multi-week simulation environment where students experience
                  the compounding consequences of strategic leadership through AI-assisted
                  workforce transformation.
                </p>
              </div>
            </FadeInSection>
          </div>
        </section>

        <section id="section-2" className="py-24 sm:py-32 px-4 print:break-before-page">
          <div className="container mx-auto max-w-4xl">
            <FadeInSection>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                  <Brain className="h-5 w-5 text-blue-500" />
                </div>
                <p className="text-sm font-medium text-primary uppercase tracking-widest">Section 2</p>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-8" data-testid="text-section-2-headline">
                Theoretical Framework
              </h2>
            </FadeInSection>
            <FadeInSection delay={150}>
              <div className="space-y-6">
                <p className="text-muted-foreground leading-relaxed text-base" data-testid="text-section-2-p1">
                  The platform's pedagogical design draws on four complementary learning theories,
                  each addressing a different dimension of the gap between classroom instruction
                  and organizational practice.
                </p>

                <div className="grid md:grid-cols-2 gap-6 my-8">
                  {[
                    {
                      title: "Experiential Learning Cycles",
                      citation: "Kolb (1984); Kayes (2002)",
                      citeIds: [9, 8],
                      desc: "Kolb's four-stage cycle — concrete experience, reflective observation, abstract conceptualization, and active experimentation — provides the structural backbone. The 8-week simulation repeats this cycle iteratively, directly addressing Kayes's critique that single-iteration case studies fail to capture the developmental arc of experiential learning.",
                    },
                    {
                      title: "Productive Failure",
                      citation: "Kapur (2008, 2016)",
                      citeIds: [6, 7],
                      desc: "Kapur's research demonstrates that students who struggle with complex, ill-structured problems before receiving direct instruction generate deeper understanding and superior transfer performance. The simulation's compounding metric system — where early miscalibrations create progressively more constrained decision spaces — embodies this principle.",
                    },
                    {
                      title: "Situated Cognition",
                      citation: "Brown, Collins & Duguid (1989)",
                      citeIds: [3],
                      desc: "Knowledge is most effectively acquired when embedded in authentic activity, context, and culture. The simulation's CEO role, 17 stakeholder characters with quantified personality traits, and industry-sourced intelligence articles create a situated learning environment where strategic reasoning is inseparable from organizational context.",
                    },
                    {
                      title: "Scaffolded Complexity",
                      citation: "Wood, Bruner & Ross (1976)",
                      citeIds: [13],
                      desc: "The three-tier difficulty system (Standard, Advanced, Expert) progressively reduces scaffolding as student capability increases — fewer advisor consultations, tighter crisis thresholds, higher minimum performance expectations — implementing Vygotsky's Zone of Proximal Development through structured support withdrawal.",
                    },
                  ].map((item, i) => (
                    <div key={item.title} className="p-6 rounded-2xl bg-card border border-border" data-testid={`card-theory-${i}`}>
                      <div className="text-xs font-medium text-primary mb-2">{item.citation}</div>
                      <h3 className="text-lg font-bold text-foreground mb-3">{item.title}<Cite ids={item.citeIds} /></h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>

                <p className="text-muted-foreground leading-relaxed text-base" data-testid="text-section-2-p2">
                  Together, these frameworks create what Biggs<Cite ids={[17]} /> describes as
                  constructive alignment: the learning activities (weekly decisions), assessment
                  method (rubric-based AI evaluation), and intended outcomes (strategic reasoning
                  under uncertainty) are internally consistent and mutually reinforcing.
                </p>
              </div>
            </FadeInSection>
          </div>
        </section>

        <section id="section-3" className="py-24 sm:py-32 px-4 bg-card/30 print:break-before-page">
          <div className="container mx-auto max-w-4xl">
            <FadeInSection>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
                  <Layers className="h-5 w-5 text-green-500" />
                </div>
                <p className="text-sm font-medium text-primary uppercase tracking-widest">Section 3</p>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-8" data-testid="text-section-3-headline">
                Platform Design
              </h2>
            </FadeInSection>
            <FadeInSection delay={150}>
              <div className="space-y-6">
                <p className="text-muted-foreground leading-relaxed text-base" data-testid="text-section-3-p1">
                  The simulation places students in the role of CEO at Apex Manufacturing, a
                  mid-sized industrial firm navigating AI-driven workforce transformation. Over
                  eight simulated weeks, participants confront escalating strategic challenges —
                  from initial automation investment decisions through union negotiations,
                  workforce displacement, and competitive disruption.
                </p>

                <div className="my-8">
                  <h3 className="text-xl font-bold text-foreground mb-4" data-testid="text-8-week-structure">8-Week Simulation Arc</h3>
                  <div className="space-y-3">
                    {[
                      { num: 1, title: "The Automation Imperative", desc: "Evaluate a $2M robotics investment proposal with competing stakeholder perspectives" },
                      { num: 2, title: "The Talent Pipeline Crisis", desc: "Address Gen Z leadership vacuum and retention challenges" },
                      { num: 3, title: "Union Storm Brewing", desc: "Navigate collective bargaining pressures as automation anxiety grows" },
                      { num: 4, title: "The First Displacement", desc: "Manage the human cost of the automation rollout" },
                      { num: 5, title: "The Manager Exodus", desc: "Respond to mid-level leadership departures triggered by earlier decisions" },
                      { num: 6, title: "Debt Day of Reckoning", desc: "Balance financial obligations with workforce investment needs" },
                      { num: 7, title: "The Competitive Response", desc: "React to competitors' aggressive automation strategies" },
                      { num: 8, title: "Strategic Direction", desc: "Chart the long-term future of Apex Manufacturing" },
                    ].map((week) => (
                      <div key={week.num} className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border" data-testid={`week-item-${week.num}`}>
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-primary">{week.num}</span>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-foreground">{week.title}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{week.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-foreground mb-4" data-testid="text-difficulty-tiers">3-Tier Difficulty Scaffolding</h3>
                <p className="text-muted-foreground leading-relaxed text-base" data-testid="text-section-3-p2">
                  Following Wood, Bruner, and Ross's scaffolding framework<Cite ids={[13]} />,
                  the platform offers three difficulty tiers that progressively reduce instructional
                  support:
                </p>
                <div className="grid sm:grid-cols-3 gap-4 my-6">
                  {[
                    { tier: "Standard", desc: "Full access to all 9 advisors, relaxed crisis thresholds, detailed guidance prompts" },
                    { tier: "Advanced", desc: "Limited advisor consultations per week, tighter performance thresholds, reduced scaffolding" },
                    { tier: "Expert", desc: "Minimal advisor access, aggressive crisis triggers, no guidance prompts — maximum productive failure" },
                  ].map((t, i) => (
                    <div key={t.tier} className="p-5 rounded-xl bg-card border border-border text-center" data-testid={`tier-card-${i}`}>
                      <div className="text-lg font-bold text-foreground mb-2">{t.tier}</div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{t.desc}</p>
                    </div>
                  ))}
                </div>

                <h3 className="text-xl font-bold text-foreground mb-4" data-testid="text-character-system">Character System &amp; Stakeholder Salience</h3>
                <p className="text-muted-foreground leading-relaxed text-base" data-testid="text-section-3-p3">
                  The simulation features 17 characters across five organizational departments,
                  each with quantifiable personality traits — influence, hostility, flexibility,
                  and risk tolerance — that mirror Mitchell, Agle, and Wood's stakeholder salience
                  framework of power, urgency, and legitimacy.<Cite ids={[10]} /> These traits
                  are not decorative; they algorithmically determine how each character reacts to
                  the student's strategic decisions, creating an authentically complex organizational
                  environment.
                </p>
              </div>
            </FadeInSection>
          </div>
        </section>

        <section id="section-4" className="py-24 sm:py-32 px-4 print:break-before-page">
          <div className="container mx-auto max-w-4xl">
            <FadeInSection>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                  <GraduationCap className="h-5 w-5 text-purple-500" />
                </div>
                <p className="text-sm font-medium text-primary uppercase tracking-widest">Section 4</p>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-8" data-testid="text-section-4-headline">
                AI-Assisted Formative Assessment
              </h2>
            </FadeInSection>
            <FadeInSection delay={150}>
              <div className="space-y-6">
                <p className="text-muted-foreground leading-relaxed text-base" data-testid="text-section-4-p1">
                  The assessment architecture is grounded in three interconnected research
                  traditions: formative assessment, feed-forward feedback, and automated essay
                  scoring.
                </p>

                <div className="my-8 space-y-6">
                  <div className="p-6 rounded-2xl bg-card border border-border" data-testid="card-rubric-transparency">
                    <h3 className="text-lg font-bold text-foreground mb-3">Rubric Transparency</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      Black and Wiliam's seminal meta-analysis established that student achievement
                      improves significantly when learners understand evaluation criteria before
                      performing tasks.<Cite ids={[2]} /> The platform implements this finding
                      literally: the four-criterion rubric (Evidence Quality, Reasoning Coherence,
                      Trade-off Analysis, Stakeholder Consideration — 25 points each) is displayed
                      on every weekly decision page while students compose their responses.
                    </p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {[
                        { name: "Evidence Quality", pts: 25 },
                        { name: "Reasoning Coherence", pts: 25 },
                        { name: "Trade-off Analysis", pts: 25 },
                        { name: "Stakeholder Consideration", pts: 25 },
                      ].map((c) => (
                        <div key={c.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/50">
                          <span className="text-sm font-medium text-foreground">{c.name}</span>
                          <span className="text-sm font-bold text-primary">{c.pts}pts</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-card border border-border" data-testid="card-scoring-calibration">
                    <h3 className="text-lg font-bold text-foreground mb-3">Scoring Calibration</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Drawing on Shermis and Burstein's research on automated essay scoring<Cite ids={[11]} />,
                      the AI evaluation engine is calibrated against exemplar responses to achieve
                      inter-rater reliability comparable to trained human evaluators. Scores map to
                      published quality bands — Excellent (93–100%), Good (72–92%), Adequate (52–71%),
                      Poor (&lt;52%) — with per-criterion breakdowns that identify specific strengths
                      and improvement areas.
                    </p>
                  </div>

                  <div className="p-6 rounded-2xl bg-card border border-border" data-testid="card-feed-forward">
                    <h3 className="text-lg font-bold text-foreground mb-3">Feed-Forward Feedback</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Hattie and Timperley's model of effective feedback<Cite ids={[4]} /> distinguishes
                      between feedback about the task, the process, and self-regulation. The platform's
                      per-criterion commentary after each weekly submission is designed to inform the
                      next performance rather than merely evaluate the last — creating what Hattie and
                      Timperley term "feed-forward" loops across the 8-week arc.
                    </p>
                  </div>
                </div>

                <p className="text-muted-foreground leading-relaxed text-base" data-testid="text-section-4-p2">
                  Crucially, instructors retain full override authority. Every AI-generated score
                  can be reviewed, adjusted, and annotated before grades are finalized — ensuring
                  that automated assessment augments rather than replaces professional pedagogical
                  judgment.
                </p>
              </div>
            </FadeInSection>
          </div>
        </section>

        <section id="section-5" className="py-24 sm:py-32 px-4 bg-card/30 print:break-before-page">
          <div className="container mx-auto max-w-4xl">
            <FadeInSection>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                  <Users className="h-5 w-5 text-amber-500" />
                </div>
                <p className="text-sm font-medium text-primary uppercase tracking-widest">Section 5</p>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-8" data-testid="text-section-5-headline">
                Stakeholder Complexity
              </h2>
            </FadeInSection>
            <FadeInSection delay={150}>
              <div className="space-y-6">
                <p className="text-muted-foreground leading-relaxed text-base" data-testid="text-section-5-p1">
                  One of the platform's most distinctive design features is its character system:
                  17 individuals spanning five departments (Executive Leadership, Finance &amp; Legal,
                  Operations &amp; HR, Production Floor, External Stakeholders), each modeled with
                  four quantifiable behavioral dimensions.
                </p>

                <div className="grid sm:grid-cols-2 gap-4 my-8">
                  {[
                    { trait: "Influence", range: "1–10", desc: "Determines how much a character's opinion shifts organizational metrics and narrative outcomes" },
                    { trait: "Hostility", range: "1–10", desc: "Controls the difficulty of scenarios associated with that character; high-hostility characters create more constrained decision spaces" },
                    { trait: "Flexibility", range: "1–10", desc: "Governs how a character responds to disruptive or unconventional strategic choices" },
                    { trait: "Risk Tolerance", range: "1–10", desc: "Shapes the character's appetite for bold, high-variance strategic moves versus conservative approaches" },
                  ].map((t, i) => (
                    <div key={t.trait} className="p-5 rounded-xl bg-card border border-border" data-testid={`trait-card-${i}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-base font-bold text-foreground">{t.trait}</span>
                        <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">{t.range}</span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{t.desc}</p>
                    </div>
                  ))}
                </div>

                <p className="text-muted-foreground leading-relaxed text-base" data-testid="text-section-5-p2">
                  These trait dimensions are directly informed by Mitchell, Agle, and Wood's
                  stakeholder salience theory<Cite ids={[10]} />, which posits that managers
                  allocate attention to stakeholders based on their perceived power, urgency,
                  and legitimacy. The character system translates this theoretical framework
                  into computational mechanics: high-influence, high-hostility characters
                  demand attention precisely because they possess both the power and the urgency
                  to disrupt organizational stability.
                </p>

                <p className="text-muted-foreground leading-relaxed text-base" data-testid="text-section-5-p3">
                  The relationship mapping across characters creates organizational tension
                  that mirrors real leadership challenges. A decision that satisfies the CFO's
                  risk-averse financial priorities may alienate the union representative's
                  workforce protection demands. Students learn to navigate these competing
                  interests iteratively, building stakeholder management capabilities that
                  transfer directly to professional practice.
                </p>
              </div>
            </FadeInSection>
          </div>
        </section>

        <section id="section-6" className="py-24 sm:py-32 px-4 print:break-before-page">
          <div className="container mx-auto max-w-4xl">
            <FadeInSection>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <Eye className="h-5 w-5 text-emerald-500" />
                </div>
                <p className="text-sm font-medium text-primary uppercase tracking-widest">Section 6</p>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-8" data-testid="text-section-6-headline">
                Radical Transparency
              </h2>
            </FadeInSection>
            <FadeInSection delay={150}>
              <div className="space-y-6">
                <p className="text-muted-foreground leading-relaxed text-base" data-testid="text-section-6-p1">
                  Transparency is not a marketing position — it is a design principle embedded at
                  every layer of the platform. In an era of growing concern about AI opacity in
                  educational settings, the platform takes the opposite approach: every evaluation
                  mechanism, scoring algorithm, and assessment criterion is published and visible
                  to all stakeholders.
                </p>

                <div className="space-y-4 my-8">
                  {[
                    { title: "Published Methodology", desc: "The complete AI grading methodology — rubric criteria, scoring bands, calibration process, and quality thresholds — is published on a dedicated public page accessible without authentication." },
                    { title: "Visible Rubrics During Task", desc: "Students see the exact four-criterion rubric while composing their weekly decision essays. There are no hidden criteria, no secret weighting schemes, no post-hoc evaluation dimensions." },
                    { title: "Instructor Override", desc: "Every AI-generated score is a recommendation, not a verdict. Instructors can review, adjust, annotate, and override any grade before finalization, maintaining human pedagogical judgment as the ultimate authority." },
                    { title: "Optional Curved Scoring", desc: "When enabled, the platform applies statistical normalization using a configurable class curve. The curve parameters, methodology, and effect on individual scores are fully visible to instructors." },
                  ].map((item, i) => (
                    <div key={item.title} className="flex items-start gap-4 p-5 rounded-xl bg-card border border-border" data-testid={`transparency-item-${i}`}>
                      <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Eye className="h-4 w-4 text-emerald-500" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-foreground mb-1">{item.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-muted-foreground leading-relaxed text-base" data-testid="text-section-6-p2">
                  This commitment to transparency is rooted in both pedagogical evidence — Black
                  and Wiliam's finding that criterion visibility improves learning<Cite ids={[2]} /> —
                  and ethical conviction: students have a right to understand how they are being
                  evaluated, especially when AI systems are involved in the assessment process.
                </p>
              </div>
            </FadeInSection>
          </div>
        </section>

        <section id="section-7" className="py-24 sm:py-32 px-4 bg-card/30 print:break-before-page">
          <div className="container mx-auto max-w-4xl">
            <FadeInSection>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-sky-500/10 flex items-center justify-center shrink-0">
                  <FlaskConical className="h-5 w-5 text-sky-500" />
                </div>
                <p className="text-sm font-medium text-primary uppercase tracking-widest">Section 7</p>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-8" data-testid="text-section-7-headline">
                Future Research
              </h2>
            </FadeInSection>
            <FadeInSection delay={150}>
              <div className="space-y-6">
                <p className="text-muted-foreground leading-relaxed text-base" data-testid="text-section-7-p1">
                  The platform's built-in assessment infrastructure creates opportunities for
                  rigorous empirical research on simulation-based pedagogy. Several research
                  directions are currently in development.
                </p>

                <div className="space-y-4 my-8">
                  {[
                    {
                      title: "Validated Survey Constructs",
                      desc: "The platform includes a 9-dimension student feedback survey measuring engagement, complexity appreciation, decision confidence, feedback quality, platform usability, overall satisfaction, self-efficacy (per Bandura, 1997), transfer confidence (as a Kirkpatrick Level 3 proxy), and productive struggle (per Kapur, 2016). These constructs are designed for pre/post administration to capture developmental change across the simulation arc.",
                      citeIds: [14, 15, 7],
                    },
                    {
                      title: "Pre/Post Assessment Design",
                      desc: "A quasi-experimental design comparing students' strategic reasoning quality before and after the 8-week simulation, using rubric-scored essay responses as the dependent measure. This design controls for prior ability through baseline assessment while measuring growth in evidence quality, reasoning coherence, trade-off analysis, and stakeholder consideration.",
                      citeIds: [],
                    },
                    {
                      title: "Cross-Institutional Studies",
                      desc: "The platform's cloud-based architecture and privacy-mode enrollment (which requires no personally identifiable information) enables multi-site deployment across universities, community colleges, and corporate training programs. Comparative studies across institutional types, student populations, and disciplinary contexts will test the generalizability of simulation-based experiential learning outcomes.",
                      citeIds: [],
                    },
                    {
                      title: "AI Scoring Reliability",
                      desc: "Ongoing calibration research compares AI-generated rubric scores against expert human raters to establish and maintain inter-rater reliability benchmarks. This work builds directly on Shermis and Burstein's automated essay scoring foundations and extends them into the domain of strategic reasoning assessment.",
                      citeIds: [11],
                    },
                  ].map((item, i) => (
                    <div key={item.title} className="p-6 rounded-2xl bg-card border border-border" data-testid={`research-card-${i}`}>
                      <h3 className="text-lg font-bold text-foreground mb-2">
                        {item.title}
                        {item.citeIds.length > 0 && <Cite ids={item.citeIds} />}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>

                <p className="text-muted-foreground leading-relaxed text-base" data-testid="text-section-7-p2">
                  These research directions are designed to produce publishable empirical evidence
                  that advances both the platform's effectiveness claims and the broader field of
                  simulation-based management education.
                </p>
              </div>
            </FadeInSection>
          </div>
        </section>

        <section id="references" className="py-24 sm:py-32 px-4 print:break-before-page">
          <div className="container mx-auto max-w-4xl">
            <FadeInSection>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <p className="text-sm font-medium text-primary uppercase tracking-widest">References</p>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-8" data-testid="text-references-headline">
                References
              </h2>
            </FadeInSection>
            <FadeInSection delay={150}>
              <div className="space-y-4">
                {REFERENCES
                  .sort((a, b) => a.authors.localeCompare(b.authors) || a.year - b.year)
                  .map((ref, i) => (
                    <div key={`${ref.authors}-${ref.year}`} className="flex gap-4 p-4 rounded-xl bg-card border border-border" data-testid={`reference-${i}`}>
                      <span className="text-xs font-bold text-primary shrink-0 mt-0.5 min-w-[1.5rem] text-right">[{ref.id}]</span>
                      <div className="text-sm text-muted-foreground leading-relaxed">
                        <span className="text-foreground font-medium">{ref.authors}</span> ({ref.year}).{" "}
                        <em>{ref.title}</em>.{" "}
                        {ref.journal && <span>{ref.journal}</span>}
                        {ref.volume && <span>, {ref.volume}</span>}
                        {ref.pages && <span>, {ref.pages}</span>}
                        .
                        {ref.doi && (
                          <a
                            href={ref.doi}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-primary hover:underline ml-1"
                            data-testid={`link-doi-${i}`}
                          >
                            <ExternalLink className="h-3 w-3" />
                            DOI
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </FadeInSection>
          </div>
        </section>

        <section className="py-16 sm:py-20 px-4 bg-card/30 print:hidden">
          <div className="container mx-auto max-w-2xl text-center">
            <FadeInSection>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4" data-testid="text-cta-headline">
                Experience the platform firsthand.
              </h2>
              <p className="text-muted-foreground mb-8 text-lg">
                Request an educator demo or explore the published methodology.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/for-educators">
                  <Button size="lg" data-testid="button-cta-educators">
                    <GraduationCap className="mr-2 h-4 w-4" />
                    For Educators
                  </Button>
                </Link>
                <Link href="/methodology">
                  <Button size="lg" variant="outline" data-testid="button-cta-methodology">
                    <Eye className="mr-2 h-4 w-4" />
                    View Methodology
                  </Button>
                </Link>
                <Button size="lg" variant="outline" onClick={handlePrint} data-testid="button-cta-download-pdf">
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
              </div>
            </FadeInSection>
          </div>
        </section>

      </main>

      <AppFooter />
    </div>
  );
}