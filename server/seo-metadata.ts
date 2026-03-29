const SITE = "https://futureworkacademy.com";
const BRAND = "Future Work Academy";
const SOCIAL_CARD = `${SITE}/social-card.png`;

interface PageMeta {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  ogImage?: string;
  noindex?: boolean;
  jsonLd?: object | object[];
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
      "Step into the role of a strategic leader at Apex Manufacturing. Make decisions about AI adoption, manage 23 stakeholders, consult 9 expert advisors, and receive AI-graded feedback on every essay.",
    ogTitle: "For Students — Lead a Company Through the AI Revolution",
    ogDescription:
      "8 weeks of strategic decisions, 23 characters whose futures depend on you, and AI-graded essays with transparent rubrics. Your management education, transformed.",
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
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How does Future Work Academy grade student essays?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Essays are evaluated on 4 criteria worth 25 points each: Evidence Quality, Reasoning Coherence, Trade-off Analysis, and Stakeholder Consideration. AI scores every submission using GPT-4o, and instructors can override any score with full audit trail."
          }
        },
        {
          "@type": "Question",
          "name": "Can students attach charts and visualizations to their submissions?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Students can attach up to 5 image visualizations per weekly response. These are evaluated by GPT-4o vision and contribute to the Evidence Quality criterion score."
          }
        },
        {
          "@type": "Question",
          "name": "What are the scoring bands for the rubric?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Each of the 4 criteria is scored 0–25 points in bands: Distinguished (21–25), Proficient (16–20), Developing (11–15), Beginning (6–10), and Insufficient (0–5). Total possible score is 100 points per week."
          }
        },
        {
          "@type": "Question",
          "name": "Do instructors see the AI's reasoning or just the score?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Instructors see the full AI rationale for each criterion score, the evidence the AI cited from the student's essay, and can override any score with their own judgment. All overrides are logged."
          }
        },
        {
          "@type": "Question",
          "name": "Is student submission data used to train AI models?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No. Future Work Academy explicitly opts out of model training. Student submissions are sent to OpenAI for grading evaluation only and are not used to train any AI model."
          }
        }
      ]
    },
  },
  "/white-paper": {
    title: "White Paper — Bridging the Relevance Gap | Future Work Academy",
    description:
      "Academic white paper: 'Bridging the Relevance Gap: AI-Driven Experiential Learning for the Future of Work.' Synthesizes pedagogical foundations including Kolb, Kayes, Edmondson, and Argyris with academic citations.",
    ogTitle: "White Paper — AI-Driven Experiential Learning",
    ogDescription:
      "A research-grounded exploration of how AI-powered business simulations bridge the gap between management theory and organizational practice.",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "ScholarlyArticle",
      "name": "Bridging the Relevance Gap: AI-Driven Experiential Learning for the Future of Work",
      "author": {
        "@type": "Person",
        "name": "Doug Mitchell"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Future Work Academy"
      },
      "url": `${SITE}/white-paper`,
      "description": "Synthesizes pedagogical foundations including Kolb, Kayes, Edmondson, and Argyris to argue for AI-powered business simulations as a bridge between management theory and organizational practice.",
      "keywords": "experiential learning, AI education, management simulation, workforce transformation, business education"
    },
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
      "Meet 23 stakeholders at Apex Manufacturing: executives, managers, union leaders, and frontline workers. Each character has quantifiable traits — influence, hostility, flexibility, and risk tolerance — that shape simulation outcomes.",
    ogTitle: "Character Profiles — 23 Stakeholders Whose Futures Depend on You",
    ogDescription:
      "From the CEO to the union steward, every character has motivations, relationships, and traits that influence your decisions.",
  },
  "/institutional-proposal": {
    title: "Institutional Proposal — Partner with Future Work Academy | Future Work Academy",
    description:
      "Bring Future Work Academy to your institution. Review our academic partnership proposal covering curriculum integration, LMS compatibility, multi-section licensing, assessment alignment, and administrative support for business schools and management programs.",
    ogTitle: "Institutional Proposal — Future Work Academy",
    ogDescription:
      "A detailed proposal for academic institutions considering Future Work Academy for management curriculum. Multi-section licensing, LMS integration, and FERPA-aligned privacy included.",
  },
  "/simulation-brief": {
    title: "Simulation Brief — Apex Manufacturing AI Transformation | Future Work Academy",
    description:
      "The executive brief for the Future Work Academy simulation: Apex Manufacturing's AI transformation context, 8-week scenario arc, key stakeholders, financial performance metrics, and cultural health indicators.",
    ogTitle: "Simulation Brief — Lead Apex Manufacturing Through AI Transformation",
    ogDescription:
      "Background on the simulation: Apex Manufacturing, a $340M automotive parts manufacturer navigating AI adoption, workforce anxiety, and competitive pressure over 8 critical weeks.",
  },
  "/survey": {
    title: "Student Feedback Survey | Future Work Academy",
    description: "Share your feedback on the Future Work Academy simulation experience.",
    ogTitle: "Student Feedback Survey",
    ogDescription: "Rate your simulation experience.",
    noindex: true,
  },
  "/week-0": {
    title: "Week 0: Orientation | Future Work Academy",
    description: "Simulation orientation module.",
    ogTitle: "Week 0: Orientation",
    ogDescription: "Simulation orientation module.",
    noindex: true,
  },
  "/week-1": {
    title: "Week 1: The Automation Imperative | Future Work Academy",
    description: "Simulation module.",
    ogTitle: "Week 1: The Automation Imperative",
    ogDescription: "Simulation module.",
    noindex: true,
  },
  "/week-2": {
    title: "Week 2: The Talent Pipeline Crisis | Future Work Academy",
    description: "Simulation module.",
    ogTitle: "Week 2: The Talent Pipeline Crisis",
    ogDescription: "Simulation module.",
    noindex: true,
  },
  "/week-3": {
    title: "Week 3: Union Storm Brewing | Future Work Academy",
    description: "Simulation module.",
    ogTitle: "Week 3: Union Storm Brewing",
    ogDescription: "Simulation module.",
    noindex: true,
  },
  "/week-4": {
    title: "Week 4: The First Displacement | Future Work Academy",
    description: "Simulation module.",
    ogTitle: "Week 4: The First Displacement",
    ogDescription: "Simulation module.",
    noindex: true,
  },
  "/week-5": {
    title: "Week 5: The Manager Exodus | Future Work Academy",
    description: "Simulation module.",
    ogTitle: "Week 5: The Manager Exodus",
    ogDescription: "Simulation module.",
    noindex: true,
  },
  "/week-6": {
    title: "Week 6: Debt Day of Reckoning | Future Work Academy",
    description: "Simulation module.",
    ogTitle: "Week 6: Debt Day of Reckoning",
    ogDescription: "Simulation module.",
    noindex: true,
  },
  "/week-7": {
    title: "Week 7: The Competitive Response | Future Work Academy",
    description: "Simulation module.",
    ogTitle: "Week 7: The Competitive Response",
    ogDescription: "Simulation module.",
    noindex: true,
  },
  "/week-8": {
    title: "Week 8: Strategic Direction | Future Work Academy",
    description: "Simulation module.",
    ogTitle: "Week 8: Strategic Direction",
    ogDescription: "Simulation module.",
    noindex: true,
  },
};

export function getMetaForPath(pathname: string): PageMeta | null {
  const clean = pathname.replace(/\/+$/, "") || "/";
  return META[clean] ?? null;
}

export function injectMeta(html: string, pathname: string): string {
  const meta = getMetaForPath(pathname);

  const canonical = `${SITE}${pathname === "/" ? "" : pathname.replace(/\/+$/, "")}`;
  const ogImage = meta?.ogImage ?? SOCIAL_CARD;
  const ogImageAlt = meta?.ogTitle ?? BRAND;

  let out = html;

  if (meta) {
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
  }

  out = out.replace(
    /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:image" content="${ogImage}" />`,
  );

  out = out.replace(
    /<meta\s+property="og:image:alt"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:image:alt" content="${ogImageAlt}" />`,
  );

  out = out.replace(
    /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/,
    `<meta name="twitter:image" content="${ogImage}" />`,
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

  if (meta?.noindex) {
    out = out.replace(
      "</head>",
      `  <meta name="robots" content="noindex, nofollow" />\n  </head>`,
    );
  }

  if (meta?.jsonLd) {
    const schemas = Array.isArray(meta.jsonLd) ? meta.jsonLd : [meta.jsonLd];
    const scriptTags = schemas
      .map((s) => `  <script type="application/ld+json">\n  ${JSON.stringify(s, null, 2)}\n  </script>`)
      .join("\n");
    out = out.replace("</head>", `${scriptTags}\n  </head>`);
  }

  return out;
}
