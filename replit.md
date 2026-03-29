# The Future of Work - Business Simulation Game

## Overview
This web-based business simulation game provides graduate students with an engaging platform for strategic decision-making over a semester, focusing on AI adoption, employee anxiety, and workforce transformation. Teams compete on financial performance and cultural health, offering experiential learning for future business leaders. The platform addresses the market need for AI integration and workforce management training, preparing leaders for complex decision-making in an AI-driven world. The project aims to become a leading educational tool in business strategy, known for its innovative approach to simulating real-world challenges in an AI-driven economy.

## User Preferences
I prefer clear and concise communication. When making changes, prioritize the core logic and critical features. I value iterative development and expect to be consulted before major architectural shifts or significant feature additions. Do not make changes to files related to authentication without explicit approval.

## System Architecture

**UI/UX Decisions:**
The design is inspired by the Bloomberg Terminal, offering a sophisticated and premium feel. It uses Shadcn/UI, Radix primitives, and Recharts for data visualization. Styling is managed with Tailwind CSS, featuring a custom color palette with Corporate Navy (#1e3a5f) as the primary and Growth Green (#22c55e) as an accent. Fonts include IBM Plex Sans, Inter, and Roboto Mono. The brand emphasizes an authoritative, forward-thinking, and sophisticated tone with clean, minimal visuals. Public-facing pages use an Apple-style scrolling showcase design with full-viewport sections, AI-generated hero/feature images, and fade-in animations. A shared `BrandLogo` component handles logo rendering for different contexts.

**Technical Implementations:**
The application uses React and TypeScript for the frontend, with Wouter for routing and TanStack Query for data fetching. The backend is Express.js, with PostgreSQL as the database and Drizzle ORM. Authentication uses Replit OIDC Auth with connect-pg-simple for session management. The system supports a three-tier role hierarchy (Super Admin, Class Admin, Student) and multi-tenancy.

The core simulation loop includes dashboards, briefings, decision-making, analytics, and leaderboards, with dual scoring for financial and cultural performance. Students can attach up to 5 image visualizations per decision response, which are evaluated by GPT-4o vision. LLM-powered grading is used for essay responses with structured 3-part sub-questions and a 4-criterion rubric. Configurable student enrollment supports .edu email verification and SMS notifications. Dedicated admin dashboards provide simulation lifecycle management, multi-scenario modules, and a content editor with AI enhancements. Detailed week results and LLM-evaluated essay scores are provided, and intel engagement bonuses encourage article interaction.

The system includes 23 character profiles with AI-generated headshots, rich bios, and relationship mapping, influencing simulation outcomes through quantifiable traits (influence, hostility, flexibility, risk tolerance). Each weekly voicemail character now has a dedicated profile (Dr. Priya Kapoor, Marcus Washington, Robert Kim, Sarah Mitchell added to match weeks 2/3/5/7 voicemails; David Okonkwo for week 8). The `ensure-characters-seed.ts` startup check uses a `REQUIRED_CHARACTERS` list and inserts any missing profiles on boot. A "Phone-a-Friend" advisor system offers AI-generated guidance from 9 specialized advisors. Multimedia content support for briefings includes transcripts and engagement tracking. A 3-tier difficulty framework (Introductory/Standard/Advanced) allows for customizable simulation experiences.

A self-service demo system offers 30-day evaluator access with a hybrid guided tour and a Gemini-powered Q&A assistant. Privacy Mode enables anonymous student enrollment. A unified Role Preview System allows Super Admins to experience the platform as an Educator or Student. A Content Consistency Dashboard validates all simulation content. An External Grading Module allows instructors to grade student responses submitted via LMS platforms with AI-scored rubric feedback, bulk upload, grading history, and image attachment support (up to 5 per response). Image uploads go directly from the browser to Google Cloud Storage via pre-signed URLs; the server then downloads each image and encodes it as base64 before passing it to the OpenAI vision API — images are never passed as public URLs, since they live in private object storage. Session expiry in the grading module is detected via HTTP 401 and handled with a descriptive message and automatic page reload rather than a cryptic JS crash. PDF rendering utilities are consolidated into shared modules for client-side and server-side exports, supporting wrapped text, page breaks, markdown/LaTeX conversion, and bold text within bullet and numbered list items (segment-based rendering handles mixed bold/normal within a single wrapped line). Public-facing pages include comprehensive `@media print` CSS for consistent printing.

SEO infrastructure includes server-side meta tag injection via `server/seo-metadata.ts`, a `<noscript>` fallback, an `llms.txt` file, `robots.txt` entries for AI bots, GA4 SPA route tracking, Open Graph and Twitter Card meta tags with a 1200×630 social sharing card (`/social-card.png`), canonical links, a 14-URL sitemap with `lastmod` dates, and per-page JSON-LD structured data. Schemas in use: `Organization`, `WebApplication`, `Course` (homepage), `ScholarlyArticle` (`/white-paper`), `FAQPage` (`/methodology`). The `/survey` route is served with `noindex, nofollow`. The `/institutional-proposal` and `/simulation-brief` pages are fully indexed with sitemap entries at priority 0.9 and 0.8 respectively.

Security hardening includes Helmet.js middleware enforcing Content-Security-Policy, Strict-Transport-Security, X-Frame-Options, X-Content-Type-Options, and Referrer-Policy headers. The CSP `connect-src` directive includes `https://storage.googleapis.com` to permit direct browser-to-GCS uploads via pre-signed URLs. Tiered API rate limiting via express-rate-limit protects all endpoints. A cookie consent banner controls GA4 analytics loading. The privacy policy includes explicit GDPR and CCPA sections. A Terms of Service page covers acceptable use and AI-generated content disclaimers. Self-service data rights include JSON data export and account deletion requests.

## External Dependencies

- **Authentication:** Replit OIDC Auth
- **Database:** PostgreSQL
- **SMS Notifications:** Twilio
- **Email Notifications:** SendGrid
- **AI/LLM Integration:** OpenAI (GPT-4o-mini, gpt-image-1), Gemini
- **Document Sync:** Google Docs, Google Drive
- **Analytics:** Google Analytics 4
- **UI Components:** Shadcn/UI, Radix UI
- **Charting Library:** Recharts
- **Frontend Framework:** React
- **Backend Framework:** Express.js
- **ORM:** Drizzle ORM