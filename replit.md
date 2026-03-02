# The Future of Work - Business Simulation Game

## Overview
This web-based business simulation game provides graduate students with an engaging platform for strategic decision-making over a semester, focusing on AI adoption, employee anxiety, and workforce transformation. Teams compete on financial performance and cultural health, offering experiential learning for future business leaders. The platform addresses the market need for AI integration and workforce management training, preparing leaders for complex decision-making in an AI-driven world. The project aims to become a leading educational tool in business strategy, known for its innovative approach to simulating real-world challenges in an AI-driven economy.

## User Preferences
I prefer clear and concise communication. When making changes, prioritize the core logic and critical features. I value iterative development and expect to be consulted before major architectural shifts or significant feature additions. Do not make changes to files related to authentication without explicit approval.

## System Architecture

**UI/UX Decisions:**
The design is inspired by the Bloomberg Terminal, offering a sophisticated and premium feel with sharp lines and geometric precision. It uses Shadcn/UI, Radix primitives, and Recharts for data visualization. Styling is managed with Tailwind CSS, featuring a custom color palette with Corporate Navy (#1e3a5f) as the primary brand color and Growth Green (#22c55e) as an accent. Fonts include IBM Plex Sans, Inter, and Roboto Mono. The brand emphasizes an authoritative, forward-thinking, and sophisticated tone with clean, minimal visuals.

**Technical Implementations:**
The application uses React and TypeScript for the frontend, with Wouter for routing and TanStack Query for data fetching. The backend is Express.js, with PostgreSQL as the database and Drizzle ORM. Authentication uses Replit OIDC Auth with connect-pg-simple for session management. The system supports a three-tier role hierarchy (Super Admin, Class Admin, Student) and multi-tenancy.

The core simulation loop includes dashboards, briefings, decision-making, analytics, and leaderboards, with dual scoring for financial and cultural performance. Key features include LLM-powered grading for essay responses, persistent activity logging (PostgreSQL-backed `activity_logs` table tracking 10+ event types including logins, team creation, decisions, admin actions, and more), configurable student enrollment with .edu email verification and SMS notifications, and dedicated admin dashboards. The simulation lifecycle is managed with status tracking and week advancement controls. It supports multi-scenario modules, a content editor with AI enhancements, and a unified People API for user management. Detailed week results and LLM-evaluated essay scores are provided. Intel engagement bonuses encourage interaction with optional articles.

The system includes 17 character profiles with AI-generated headshots, rich bios, and relationship mapping, influencing simulation outcomes through quantifiable traits (influence, hostility, flexibility, risk tolerance). These traits affect decision difficulty, LLM grading context injection, and advisor warnings, with triggered voicemail notifications. A "Phone-a-Friend" advisor system offers AI-generated guidance from 9 specialized advisors. Multimedia content support for briefings includes transcripts and engagement tracking. A 3-tier difficulty framework (Introductory/Standard/Advanced) allows for customizable simulation experiences.

All public-facing pages use an Apple-style scrolling showcase design with full-viewport sections, AI-generated hero/feature images, IntersectionObserver-based FadeInSection fade-in animations, generous spacing (py-24 sm:py-32), and big typography (text-4xl+). The landing page (`/`) highlights the 8-week simulation timeline, 17 character profiles, radical transparency, AI-powered grading, Phone-a-Friend advisors, and educator tools — all linking to live pages. The `/for-educators` page is the primary sell page for professors, featuring 12 sections covering pedagogical foundation, radical transparency with published rubric criteria, AI-powered assessment, 3-tier difficulty framework, built-in student feedback surveys, 17 stakeholder characters, privacy/FERPA compliance, 8-week journey timeline, platform toolkit grid, demo provisioning forms, and academic references with DOI links. The `/for-students` page targets students with trial activation, referral system, and simulation preview. The `/about` page features CMS-editable content (Super Admin) with default bio fallback. The `/brochure` page includes PDF export via generateBrochurePDF().

A self-service demo system offers 30-day evaluator access with a hybrid guided tour and a Gemini-powered Q&A assistant. Privacy Mode enables anonymous student enrollment for immediate classroom use, pseudonymizing student IDs and disabling PII collection. A unified Role Preview System allows Super Admins to experience the platform as an Educator or Student. A Content Consistency Dashboard validates all simulation content against a canonical source. An External Grading Module allows instructors to grade student responses submitted via LMS platforms with AI-scored rubric feedback, bulk upload, and grading history. A curved scoring system dynamically normalizes grades using Z-score normalization. A Week Summary Dashboard provides visual distribution charts of class performance per week. A Student Feedback Survey at `/survey` collects per-week ratings (realism, fairness, difficulty, learning value, engagement, clarity) with star ratings and optional comments, stored in `survey_responses` table with unique constraint per student per week, featuring a Results Dashboard with trend line charts, radar charts, distribution charts, and week-by-week breakdown tables.

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