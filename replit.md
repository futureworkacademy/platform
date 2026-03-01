# The Future of Work - Business Simulation Game

## Overview
This web-based business simulation game provides graduate students with an engaging platform to make strategic company decisions over a semester. It focuses on navigating AI adoption, managing employee anxiety, and workforce transformation. Teams compete on financial performance and cultural health, offering an experiential learning environment for future business leaders. The platform addresses the market need for AI integration and workforce management training, preparing leaders for complex decision-making in an AI-driven world.

## User Preferences
I prefer clear and concise communication. When making changes, prioritize the core logic and critical features. I value iterative development and expect to be consulted before major architectural shifts or significant feature additions. Do not make changes to files related to authentication without explicit approval.

## System Architecture

**UI/UX Decisions:**
The design draws inspiration from the Bloomberg Terminal, featuring a sophisticated and premium feel with sharp, clean lines and geometric precision. Key UI components include Shadcn/UI, Radix primitives, and Recharts for data visualization. Styling is managed with Tailwind CSS, utilizing a custom color palette including Corporate Navy (#1e3a5f) as the primary brand color and Growth Green (#22c55e) as an accent. Fonts used are IBM Plex Sans, Inter, and Roboto Mono.

**Technical Implementations:**
The application is built with React and TypeScript for the frontend, using Wouter for routing and TanStack Query for data fetching. The backend is powered by Express.js. PostgreSQL is used as the database, integrated with Drizzle ORM. Authentication relies on Replit OIDC Auth with connect-pg-simple for session management. The system supports a three-tier role hierarchy (Super Admin, Class Admin, Student) and multi-tenancy through organizations and team codes.

The core simulation loop involves dashboards, briefings, decision-making, analytics, and leaderboards, with dual scoring for financial and cultural performance. Key features include LLM-powered grading for essay responses using OpenAI, comprehensive activity logging, configurable student enrollment with .edu email verification and SMS notifications, and dedicated admin dashboards with bulk import capabilities.

The simulation lifecycle is formally managed with status tracking and week advancement controls. It supports multi-scenario modules, a content editor with AI-powered enhancements (clarity, expansion, simplification, data points, scenario generation), and a unified People API for user management. Detailed week results and feedback are provided, including LLM-evaluated essay scores. Content view tracking and an Intel engagement bonus encourage student interaction with optional articles.

The system features 17 character profiles with AI-generated headshots, rich bios, and relationship mapping, influencing simulation outcomes through quantifiable traits (influence, hostility, flexibility, risk tolerance). These traits affect decision difficulty, LLM grading context injection, and advisor warnings. Triggered voicemail notifications from characters provide contextual updates. A "Phone-a-Friend" advisor system offers AI-generated guidance from 9 specialized advisors, incorporating stakeholder awareness. Multimedia content support for briefings includes transcripts and engagement tracking. A 3-tier difficulty framework (Introductory/Standard/Advanced) with 11 quantifiable factors allows for customizable simulation experiences.

**Brand Guidelines:** The brand emphasizes an authoritative, forward-thinking, and sophisticated tone. Visuals are clean and minimal, using navy blue and growth green, inspired by financial services and management consulting aesthetics. Logos are designed for legibility across various sizes and backgrounds, conveying leadership, technology, transformation, and education.

**Self-Service Demo System:** 30-day evaluator access available to any work email (no .edu required). Demo environment (org code DEMO2025) includes 6 pre-seeded fake students across 3 teams at Week 3. Features hybrid guided tour (Driver.js 8-step walkthrough auto-triggering on first login) and Gemini-powered Q&A assistant for real-time platform questions. Tour completion tracked in localStorage; "Restart Tour" button available in sidebar for demo users. Educator-facing content consolidated on single `/for-educators` page with instant demo form (primary CTA) and Doug's personal contact form (secondary CTA).

**Privacy Mode:** Enables immediate classroom use without SOC 2 compliance. When enabled on an organization: (1) Students enroll anonymously via Replit OIDC - no .edu email verification required; (2) Phone numbers not collected, SMS/email notifications disabled; (3) Students identified by pseudonymous IDs (e.g., `Student_abc12345`); (4) Instructors download offline roster template to map pseudonyms to real students; (5) LLM evaluation receives only written responses, no PII. Compliance roadmap: Privacy Mode (Now) → Institutional Agreements (Q1 2026) → SOC 2 Type II (Q2 2026).

## Recent Updates (February 2026)

**Unified Role Preview System:** Consolidated three separate preview modes (demo/evaluator, instructor, student sandbox) into a single "Role Switcher" on the Super Admin Console. Super admins can click "Preview as Educator" or "Preview as Student" on any organization to fully experience that role. A persistent blue banner shows the current preview role with an exit button. Uses unified DB fields (`previewRole`, `previewOrgId`) and API endpoints (`/api/preview/enter`, `/api/preview/exit`). Old preview flags (`inDemoPreview`, `inInstructorPreview`) preserved for backward compatibility.

**Evaluator Access Management:** Super admins can grant "Evaluator" access to trusted colleagues via email (Settings tab > Evaluator Access). Evaluators can preview the demo organization as educator or student but have no admin privileges. Managed via `/api/evaluators/grant` and `/api/evaluators/revoke` endpoints.

**Content Consistency Dashboard:** Super Admin dashboard at `/content-validation` validates all simulation content (briefings, decisions, voicemails, intel articles, advisors) against `docs/canonical.json` as the source of truth. Ensures 17 characters, 8 weeks, and company details are consistent across all content.

**Phone-a-Friend Advisor System:** 9 specialized advisors provide AI-generated strategic guidance (3 credits per semester). Advisors include CEO Coach, HR Expert, CFO Strategist, and more with stakeholder awareness integration.

**Documentation Auto-Sync:** All markdown files in `docs/` folder automatically sync to Google Docs in the "Future Work Academy" folder. Supports 20+ documents including business plan, game design, brand standards, and test checklists.

**Stakeholder Directory (Public):** The `/characters` page is publicly accessible without authentication, displaying all simulation characters in a searchable card grid with expandable details (headshots, bios, traits, experience, education, skills). Accessible from the student sidebar as "Stakeholders" for logged-in users. Both the Student Guide and Instructor Guide link to this page. The Student Guide PDF export includes a character directory appendix with names, roles, and headlines. Character cards use a gradient banner that wraps the avatar, name, headline, and company text for readability.

**Public Guide Pages:** Student Guide (`/guides/student`) and Instructor Guide (`/guides/instructor`) are public-facing, no-auth-required pages with comprehensive onboarding content and PDF download. The old `/student-guide` route redirects to `/guides/student`. Email templates dynamically link to the correct guide URLs via `getBaseUrl()` in `server/services/email.ts`.

**Welcome Modal & Enrollment UX (Feb 2026):** After successful enrollment, students see a full-screen welcome modal (replaces the previous toast notification) with a celebratory rocket icon, video placeholder for a future narrated walkthrough (16:9 aspect ratio, supports MP4/H.264), "What happens next" steps, and a pro tip linking to the Student Guide. In Privacy Mode, a nudge suggests students use a personal email for their Replit account. All enrollment UI uses semantic design tokens (`text-primary`, `text-accent`, `bg-primary/10`, `bg-accent/10`) instead of hard-coded hex colors for dark mode safety.

**Human Grading Disclaimer:** Both guides include a note that AI essay scores are formative feedback only — instructors retain full authority to review, adjust, or override AI-assigned scores before finalizing grades.

**Design Token Cleanup (Feb 2026):** All hard-coded hex colors (`#1e3a5f`, `#22c55e`) in the Student Guide, Instructor Guide, and enrollment wizard have been replaced with semantic design tokens (`text-primary`, `text-accent`, `bg-primary`, `bg-accent`) for consistent dark mode behavior.

**Week 1 Offline Guide & PDF Export (Feb 2026):** Comprehensive offline guide (`docs/week-1-offline-guide.md`) enables instructors to run Week 1 via Blackboard/LMS without platform access. Includes full briefing, 3 Intel Articles (WSJ, HBR, McKinsey), 3 decision options with financial data, LMS submission template, and 100-point scoring rubric. A branded PDF export (`client/src/lib/offline-guide-pdf-export.ts`) generates a downloadable PDF matching the Student/Instructor Guide styling. The download button appears on the public `/characters` page in the Week 1 Resources section.

**Public API Endpoints (Feb 2026):** Two public (no-auth) API endpoints expose Week 1 simulation content for offline students: `/api/public/voicemail` returns the Week 1 triggered voicemail (Victoria Hartwell's "Board Pressure Call") with character details, and `/api/public/advisor` returns a featured Phone-a-Friend advisor. These are consumed by the public `/characters` page to show voicemail transcript and advisor profile cards below the stakeholder directory.

**External Grading Module (Mar 2026):** Public server-rendered page at `/grade` (`server/grading-page-renderer.ts`) enables instructors to grade student responses submitted through Blackboard or other LMS platforms without requiring students to be enrolled in the system. Two modes: (1) Single Response — paste one student's essay, select week and option chosen, get AI-scored rubric feedback instantly; (2) Bulk Upload — upload a CSV (columns: StudentName, OptionChosen, EssayText) to grade multiple responses sequentially with progress tracking and downloadable results CSV. Uses the same `evaluateTextResponse` LLM engine from `server/services/llm-evaluation.ts`. Scoring rubric: Strategic Thinking (25pts), Stakeholder Awareness (25pts), Risk Assessment (25pts), Research Application (25pts) = 100pts total. Rate-limited to 10 requests/minute per IP. CSV parser handles multiline quoted fields for essay text. Linked from Week 0 Orientation page under "Instructor Tools" section.

## Pre-Publish Checklist
Before each production publish, review the following:
1. **Student Guide** (`client/src/pages/guides/student-guide.tsx` and `client/src/lib/guide-pdf-export.ts`): Verify all content matches current simulation features (weekly workflow, scoring, advisor credits, character count, etc.)
2. **Instructor Guide** (`client/src/pages/guides/instructor-guide.tsx` and `client/src/lib/guide-pdf-export.ts`): Verify class management steps, simulation controls, difficulty levels, and communication tools are accurate.
3. **Email Templates** (`server/services/email.ts`): Confirm all links point to correct pages and `getBaseUrl()` resolves properly in production.
4. **Advisor Data**: Confirm 9 advisors with headshots in `/images/advisors/` and correct database records.
5. **Character Data**: Confirm 17 characters with headshots and accurate trait data.
6. **Week 1 Offline Guide PDF** (`client/src/lib/offline-guide-pdf-export.ts`): Verify content matches canonical simulation data (briefing text, Intel Articles, decision options, scoring rubric).
7. **Public Characters Page** (`client/src/pages/character-profiles.tsx`): Verify public view shows stakeholder directory, Week 1 voicemail, advisor, and PDF download button. Test gradient banner readability for character cards.

## External Dependencies

- **Authentication:** Replit OIDC Auth
- **Database:** PostgreSQL
- **SMS Notifications:** Twilio
- **Email Notifications:** SendGrid
- **AI/LLM Integration:** OpenAI (GPT-4o-mini for text, gpt-image-1 for image generation), Gemini (Q&A assistant)
- **Document Sync:** Google Docs, Google Drive
- **Analytics:** Google Analytics 4
- **UI Components:** Shadcn/UI, Radix UI
- **Charting Library:** Recharts
- **Frontend Framework:** React
- **Backend Framework:** Express.js
- **ORM:** Drizzle ORM