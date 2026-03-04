# The Future of Work - Business Simulation Game

## Overview
This web-based business simulation game provides graduate students with an engaging platform for strategic decision-making over a semester, focusing on AI adoption, employee anxiety, and workforce transformation. Teams compete on financial performance and cultural health, offering experiential learning for future business leaders. The platform addresses the market need for AI integration and workforce management training, preparing leaders for complex decision-making in an AI-driven world. The project aims to become a leading educational tool in business strategy, known for its innovative approach to simulating real-world challenges in an AI-driven economy.

## User Preferences
I prefer clear and concise communication. When making changes, prioritize the core logic and critical features. I value iterative development and expect to be consulted before major architectural shifts or significant feature additions. Do not make changes to files related to authentication without explicit approval.

## System Architecture

**UI/UX Decisions:**
The design is inspired by the Bloomberg Terminal, offering a sophisticated and premium feel with sharp lines and geometric precision. It uses Shadcn/UI, Radix primitives, and Recharts for data visualization. Styling is managed with Tailwind CSS, featuring a custom color palette with Corporate Navy (#1e3a5f) as the primary brand color and Growth Green (#22c55e) as an accent. Fonts include IBM Plex Sans, Inter, and Roboto Mono. The brand emphasizes an authoritative, forward-thinking, and sophisticated tone with clean, minimal visuals. Public-facing pages use an Apple-style scrolling showcase design with full-viewport sections, AI-generated hero/feature images, and fade-in animations.

**Technical Implementations:**
The application uses React and TypeScript for the frontend, with Wouter for routing and TanStack Query for data fetching. The backend is Express.js, with PostgreSQL as the database and Drizzle ORM. Authentication uses Replit OIDC Auth with connect-pg-simple for session management. The system supports a three-tier role hierarchy (Super Admin, Class Admin, Student) and multi-tenancy.

The core simulation loop includes dashboards, briefings, decision-making, analytics, and leaderboards, with dual scoring for financial and cultural performance. Key features include LLM-powered grading for essay responses with structured 3-part sub-questions and a 4-criterion rubric. The rubric criteria are consistently defined across schema and grading services, with explicit scoring calibration guidance for LLM evaluation. Optional curved scoring based on Z-score normalization is available. Persistent activity logging tracks over 10 event types. Configurable student enrollment supports .edu email verification and SMS notifications. Dedicated admin dashboards provide simulation lifecycle management, multi-scenario modules, and a content editor with AI enhancements. Detailed week results and LLM-evaluated essay scores are provided, and intel engagement bonuses encourage article interaction.

The system includes 17 character profiles with AI-generated headshots, rich bios, and relationship mapping, influencing simulation outcomes through quantifiable traits (influence, hostility, flexibility, risk tolerance). These traits affect decision difficulty, LLM grading context injection, and advisor warnings, with triggered voicemail notifications. A "Phone-a-Friend" advisor system offers AI-generated guidance from 9 specialized advisors. Multimedia content support for briefings includes transcripts and engagement tracking. A 3-tier difficulty framework (Introductory/Standard/Advanced) allows for customizable simulation experiences.

A self-service demo system offers 30-day evaluator access with a hybrid guided tour and a Gemini-powered Q&A assistant. Privacy Mode enables anonymous student enrollment. A unified Role Preview System allows Super Admins to experience the platform as an Educator or Student. A Content Consistency Dashboard validates all simulation content. An External Grading Module allows instructors to grade student responses submitted via LMS platforms with AI-scored rubric feedback, bulk upload, and grading history. A Week Summary Dashboard provides visual distribution charts of class performance per week. A Student Feedback Survey collects per-week ratings and comments, stored in `survey_responses` table, with a Results Dashboard providing trend line charts, radar charts, and distribution charts. Server-rendered week pages include "Copy Answer Template" and "Download .txt" buttons alongside existing PDF download. A public-facing academic white paper, "Bridging the Relevance Gap: AI-Driven Experiential Learning for the Future of Work," synthesizes the platform's pedagogical foundations into 7 sections with academic citations. All PDF generators have been audited and fixed for proper text wrapping and page break logic. Public-facing page CTAs are standardized, with educator-facing pages using "Request a Demo" and student-facing pages funneling toward sign-in/trial. SEO infrastructure includes GA4 SPA route tracking, Open Graph and Twitter Card meta tags, canonical links, a sitemap, `robots.txt`, JSON-LD structured data, and dynamic per-page document titles.

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
- **GitHub:** github.com/futureworkacademy/platform (public repo, linked from site footer)

## Unlisted Pages

The `/institutional-proposal` page is an unlisted page (not in site navigation) for targeted sharing with academic leadership. It features 10 sections covering pedagogical framework (8 foundational theories with APA citations), assessment design, FERPA compliance posture and roadmap, grant opportunities, and a partnership proposal. Includes print-friendly CSS and 15 academic references with DOI links. An AI Ethics & Transparency section covers scoring bias safeguards (blind evaluation, deterministic config, source-based rubrics, calibration, human override, distribution monitoring), AI-generated media disclosure (character headshots via DALL-E, advisor audio via ElevenLabs, hero images, brand assets), AI data handling and student privacy (no PII transmission, no model training, explainable outputs, radical transparency), ongoing validity and fairness monitoring (score distribution dashboards, instructor override tracking, student feedback surveys, difficulty-adjusted evaluation), and an accessibility posture subsection (Radix-based keyboard/ARIA support, alt text standards, focus management, WCAG 2.1 AA audit roadmap with VPAT/ACR, color contrast verification, color blindness review, custom widget keyboard testing, multimedia transcripts).