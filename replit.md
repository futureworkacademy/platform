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

**Content Consistency Dashboard:** Super Admin dashboard at `/content-validation` validates all simulation content (briefings, decisions, voicemails, intel articles, advisors) against `docs/canonical.json` as the source of truth. Ensures 17 characters, 8 weeks, and company details are consistent across all content.

**Phone-a-Friend Advisor System:** 9 specialized advisors provide AI-generated strategic guidance (3 credits per semester). Advisors include CEO Coach, HR Expert, CFO Strategist, and more with stakeholder awareness integration.

**Documentation Auto-Sync:** All markdown files in `docs/` folder automatically sync to Google Docs in the "Future Work Academy" folder. Supports 20+ documents including business plan, game design, brand standards, and test checklists.

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