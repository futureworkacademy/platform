# The Future of Work - Business Simulation Game

## Overview
This web-based business simulation game is designed for graduate students to make strategic company decisions over a semester. It focuses on navigating AI adoption, managing employee anxiety, and workforce transformation. Teams compete on financial performance and cultural health, providing an engaging and educational experience for future business leaders. The platform aims to prepare leaders for AI-driven decision-making and offers a multi-scenario simulation platform for experiential learning in complex decision-making, addressing the market potential for AI integration and workforce management training.

## User Preferences
I prefer clear and concise communication. When making changes, prioritize the core logic and critical features. I value iterative development and expect to be consulted before major architectural shifts or significant feature additions. Do not make changes to files related to authentication without explicit approval.

## System Architecture

**UI/UX Decisions:**
- **Design Inspiration:** Bloomberg Terminal aesthetic.
- **Components:** Shadcn/UI, Radix primitives, Recharts for data visualization.
- **Styling:** Tailwind CSS with custom design tokens, Corporate Navy, Growth Green, Caution Amber, Tech Purple, Professional Grey color scheme.
- **Fonts:** IBM Plex Sans, Inter, Roboto Mono.
- **Landing Page:** Features a tagline, sub-headline, rotating challenge cards, and calls to action.

**Technical Implementations:**
- **Frontend:** React with TypeScript, Wouter for routing, TanStack Query for data fetching.
- **Backend:** Express.js.
- **Database:** PostgreSQL with Drizzle ORM.
- **Authentication:** Replit OIDC Auth with connect-pg-simple for session storage.
- **Role System:** Three-tier hierarchy (Super Admin, Class Admin, Student).
- **Multi-Tenancy:** Organizations managed with unique team codes.
- **Simulation Loop:** Dashboard to Briefing to Decisions to Analytics to Leaderboard, with dual scoring (Financial and Cultural), global events, and resource allocation.
- **LLM-Powered Grading:** OpenAI-based semantic evaluation for essay responses using a 4-criteria rubric.
- **Activity Logging:** Tracks user and game actions, exportable to CSV/JSON.
- **Student Enrollment:** Configurable .edu email verification, team code entry, and SMS notifications.
- **Admin Dashboards:** Dedicated interfaces for Super Admins and Class Admins, including CSV bulk import and member soft-delete.
- **Simulation Lifecycle:** Formal management with status tracking, configurable dates, and week advancement controls.
- **Scheduled Reminders:** Email queue system for instructors.
- **Platform Settings (Super Admin):** Configurable enrollment requirements, competition modes, scoring weights, and bonus settings.
- **Sandbox Mode (Instructor Preview):** Class Admins can test the full student experience without affecting real student data.
- **Multi-Scenario Module Support:** Utilizes simulationModules and simulationContent tables for diverse themes.
- **Simulation Content Editor:** Admin interface at `/admin/simulation-content` for managing weekly briefings, research reports, and decision scenarios with AI-powered enhancement using OpenAI (improve clarity, expand details, simplify, add data points, generate scenarios).
- **Unified People API:** Merges users, organization memberships, and team assignments.
- **Week Results and Feedback System:** Displays detailed performance feedback, LLM-evaluated essay scores with rubric, and top answers.
- **Content View Tracking:** Records when students view research reports, briefing sections, and intel articles for cross-session persistence and engagement analytics.
- **Intel Engagement Bonus:** Students who engage with optional Industry Intelligence articles receive a bonus multiplier on their research score (1.0x base, +0.15x per article viewed, max 1.5x).
- **Navigation Breadcrumbs:** Research, Briefing, and Decisions pages feature breadcrumb navigation for intuitive back-and-forth movement.

## External Dependencies

- **Authentication:** Replit OIDC Auth
- **Database:** PostgreSQL
- **SMS Notifications:** Twilio
- **Email Notifications:** SendGrid
- **AI/LLM Integration:** OpenAI (GPT-4o-mini)
- **UI Components:** Shadcn/UI, Radix UI
- **Charting Library:** Recharts
- **Frontend Framework:** React
- **Backend Framework:** Express.js
- **ORM:** Drizzle ORM
---

## Additional Documentation

Business and marketing documentation is maintained in the `docs/` folder:
- **docs/BUSINESS_PLAN.md** - Full business plan with costs, compliance requirements, and monetization strategy
- **docs/PRODUCT_ROADMAP.md** - Detailed product roadmap with near-term, mid-term, and long-term features
- **docs/MARKETING_MATERIALS.md** - Marketing content for MBA programs and generic academia

Legacy documentation:
- **SOLUTION_DOC.md** - Original solution document (superseded by docs/ folder)

### Google Docs Integration

These documents can be synced to Google Docs via the Super Admin dashboard or API:
- `POST /api/docs/sync` - Sync a specific document (body: `{ documentType: 'business_plan' | 'product_roadmap' | 'marketing_materials' | 'solution_doc' }`)
- `POST /api/docs/sync-all` - Sync all documents to Google Docs
- `GET /api/docs/list` - List all Google Docs in connected account
