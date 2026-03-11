const SITE = "https://futureworkacademy.com";
const BRAND = "Future Work Academy";

interface PageMeta {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
}

const META: Record<string, PageMeta> = {
  "/": {
    title: "Future Work Academy | AI Business Simulation for Management Education",
    description:
      "Lead Apex Manufacturing through 8 weeks of strategic decisions about AI adoption, workforce transformation, and cultural health. An experiential learning platform for graduate and undergraduate management courses.",
    ogTitle: "Future Work Academy — Navigate the AI Revolution",
    ogDescription:
      "An 8-week business simulation where students balance automation, employee anxiety, and financial performance. Every rubric visible. Every criterion transparent.",
  },
  "/for-educators": {
    title: "For Educators — AI Business Simulation Curriculum | Future Work Academy",
    description:
      "Everything educators need to run Future Work Academy: AI-powered grading with instructor override, 3 difficulty tiers, FERPA-aligned privacy mode, student feedback surveys, and LMS integration via bulk CSV upload.",
    ogTitle: "For Educators — The AI Simulation Your Students Deserve",
    ogDescription:
      "Research-backed experiential learning that moves students from passive case analysis to dynamic decision-making. Transparent rubrics, AI grading, and full instructor control.",
  },
  "/for-students": {
    title: "For Students — AI Business Simulation Experience | Future Work Academy",
    description:
      "Step into the role of a strategic leader at Apex Manufacturing. Make decisions about AI adoption, manage 17 stakeholders, consult 9 expert advisors, and receive AI-graded feedback on every essay.",
    ogTitle: "For Students — Lead a Company Through the AI Revolution",
    ogDescription:
      "8 weeks of strategic decisions, 17 characters whose futures depend on you, and AI-graded essays with transparent rubrics. Your management education, transformed.",
  },
  "/about": {
    title: "About Future Work Academy | AI Business Simulation Platform",
    description:
      "Future Work Academy is an immersive AI-powered business simulation created by Doug Mitchell for graduate and undergraduate management education. Learn about our mission, methodology, and team.",
    ogTitle: "About Future Work Academy",
    ogDescription:
      "An immersive business simulation platform preparing the next generation of leaders for AI-driven workforce transformation.",
  },
  "/methodology": {
    title: "Grading Methodology — AI Essay Evaluation | Future Work Academy",
    description:
      "How Future Work Academy evaluates student essays: a 4-criterion rubric (Evidence Quality, Reasoning Coherence, Trade-off Analysis, Stakeholder Consideration), scoring bands, AI grading pipeline, and instructor review process.",
    ogTitle: "Grading Methodology — Transparent AI Evaluation",
    ogDescription:
      "4 criteria, 25 points each, scored by AI with full instructor oversight. Evidence Quality, Reasoning Coherence, Trade-off Analysis, and Stakeholder Consideration.",
  },
  "/white-paper": {
    title: "White Paper — Bridging the Relevance Gap | Future Work Academy",
    description:
      "Academic white paper: 'Bridging the Relevance Gap: AI-Driven Experiential Learning for the Future of Work.' Synthesizes pedagogical foundations including Kolb, Kayes, Edmondson, and Argyris with academic citations.",
    ogTitle: "White Paper — AI-Driven Experiential Learning",
    ogDescription:
      "A research-grounded exploration of how AI-powered business simulations bridge the gap between management theory and organizational practice.",
  },
  "/privacy": {
    title: "Privacy Policy | Future Work Academy",
    description:
      "Future Work Academy privacy policy covering GDPR and CCPA compliance, data collection practices, student privacy protections, AI data handling, and data subject rights.",
    ogTitle: "Privacy Policy — Future Work Academy",
    ogDescription:
      "How we protect your data: GDPR/CCPA compliance, no PII sent to AI models, no model training on submissions, and self-service data rights.",
  },
  "/terms": {
    title: "Terms of Service | Future Work Academy",
    description:
      "Future Work Academy terms of service covering acceptable use, AI-generated content disclaimers, intellectual property, and governing law.",
    ogTitle: "Terms of Service — Future Work Academy",
    ogDescription:
      "Terms governing use of the Future Work Academy simulation platform.",
  },
  "/guides/student": {
    title: "Student Guide — How to Succeed in the Simulation | Future Work Academy",
    description:
      "Complete student guide: weekly workflow, decision process, essay scoring rubric, how the AI evaluator works, visualization tips, Phone-a-Friend advisors, intel articles, and leaderboard mechanics.",
    ogTitle: "Student Guide — Your Complete Simulation Playbook",
    ogDescription:
      "Everything you need to know: how decisions work, how essays are scored, how charts improve your grade, and how to use advisors strategically.",
  },
  "/guides/instructor": {
    title: "Instructor Guide — Platform Administration | Future Work Academy",
    description:
      "Instructor guide for Future Work Academy: simulation setup, class management, grading workflows, AI evaluation oversight, student enrollment, and analytics dashboards.",
    ogTitle: "Instructor Guide — Run Your Simulation",
    ogDescription:
      "Step-by-step guide for setting up classes, managing students, reviewing AI grades, and using the admin dashboard.",
  },
  "/brochure": {
    title: "Platform Brochure | Future Work Academy",
    description:
      "Future Work Academy platform overview: 8-week AI business simulation with experiential learning, transparent grading, and research-backed pedagogy for management education.",
    ogTitle: "Future Work Academy — Platform Overview",
    ogDescription:
      "A concise overview of the AI business simulation platform for educators and academic leadership.",
  },
  "/characters": {
    title: "Character Profiles — Meet the Apex Manufacturing Team | Future Work Academy",
    description:
      "Meet 17 stakeholders at Apex Manufacturing: executives, managers, union leaders, and frontline workers. Each character has quantifiable traits — influence, hostility, flexibility, and risk tolerance — that shape simulation outcomes.",
    ogTitle: "Character Profiles — 17 Stakeholders Whose Futures Depend on You",
    ogDescription:
      "From the CEO to the union steward, every character has motivations, relationships, and traits that influence your decisions.",
  },
};

export function getMetaForPath(pathname: string): PageMeta | null {
  const clean = pathname.replace(/\/+$/, "") || "/";
  return META[clean] ?? null;
}

export function injectMeta(html: string, pathname: string): string {
  const meta = getMetaForPath(pathname);
  if (!meta) return html;

  const canonical = `${SITE}${pathname === "/" ? "" : pathname}`;

  let out = html;

  out = out.replace(
    /<title>[^<]*<\/title>/,
    `<title>${meta.title}</title>`,
  );

  out = out.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${meta.description}" />`,
  );

  out = out.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:title" content="${meta.ogTitle}" />`,
  );

  out = out.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:description" content="${meta.ogDescription}" />`,
  );

  out = out.replace(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:url" content="${canonical}" />`,
  );

  out = out.replace(
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/,
    `<meta name="twitter:title" content="${meta.ogTitle}" />`,
  );

  out = out.replace(
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="twitter:description" content="${meta.ogDescription}" />`,
  );

  if (out.includes('rel="canonical"')) {
    out = out.replace(
      /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
      `<link rel="canonical" href="${canonical}" />`,
    );
  } else {
    out = out.replace(
      "</head>",
      `  <link rel="canonical" href="${canonical}" />\n  </head>`,
    );
  }

  return out;
}
