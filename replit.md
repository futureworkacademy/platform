# The Future of Work - Business Simulation Game

## Overview
This web-based business simulation game is designed for graduate students to make strategic company decisions over a semester. It focuses on navigating AI adoption, managing employee anxiety, and workforce transformation. Teams compete on financial performance and cultural health, providing an engaging and educational experience for future business leaders. The platform aims to prepare leaders for AI-driven decision-making and offers a multi-scenario simulation platform for experiential learning in complex decision-making, with a business vision to address the market potential for AI integration and workforce management training.

## User Preferences
I prefer clear and concise communication. When making changes, prioritize the core logic and critical features. I value iterative development and expect to be consulted before major architectural shifts or significant feature additions. Do not make changes to files related to authentication without explicit approval.

## System Architecture

**UI/UX Decisions:**
- **Design Inspiration:** Bloomberg Terminal aesthetic.
- **Components:** Shadcn/UI, Radix primitives.
- **Data Visualization:** Recharts.
- **Styling:** Tailwind CSS with custom design tokens.
- **Color Scheme:** Corporate Navy, Growth Green, Caution Amber, Tech Purple, Professional Grey, with specific positive/negative data colors.
- **Fonts:** IBM Plex Sans, Inter, Roboto Mono.
- **Landing Page:** Features a tagline, sub-headline, rotating challenge cards, and calls to action.

**Technical Implementations:**
- **Frontend:** React with TypeScript, Wouter for routing, TanStack Query for data fetching.
- **Backend:** Express.js.
- **Database:** PostgreSQL with Drizzle ORM.
- **Authentication:** Replit OIDC Auth with `connect-pg-simple` for session storage.
- **Role System:** Three-tier hierarchy (Super Admin, Class Admin, Student).
- **Multi-Tenancy:** Organizations managed with unique team codes.
- **Simulation Loop:** Dashboard → Briefing → Decisions → Analytics → Leaderboard, with dual scoring (Financial & Cultural), global events, and resource allocation.
- **LLM-Powered Grading:** OpenAI-based semantic evaluation for essay responses using a 4-criteria rubric.
- **Activity Logging:** Tracks user and game actions, exportable to CSV/JSON.
- **Student Enrollment:** Configurable `.edu` email verification, team code entry, and SMS notifications.
- **Admin Dashboards:** Dedicated interfaces for Super Admins and Class Admins.
- **CSV Bulk Import:** Class Admins can import up to 500 students.
- **Member Soft-Delete:** Allows deactivation and reactivation of organization members.
- **Simulation Lifecycle:** Formal management with status tracking, configurable dates, and week advancement controls.
- **Scheduled Reminders:** Email queue system for instructors.
- **Platform Settings (Super Admin):** Configurable enrollment requirements, competition modes, scoring weights, and bonus settings.
- **Sandbox Mode (Instructor Preview):** Class Admins can test the full student experience without affecting real student data.
- **Super Admin Dashboard Redesign:** Features a 6-tab structure.
- **Multi-Scenario Module Support:** Utilizes `simulationModules` and `simulationContent` tables for diverse themes.
- **Unified People API:** Merges users, organization memberships, and team assignments.
- **Week Results & Feedback System:** Displays detailed performance feedback, LLM-evaluated essay scores with rubric, and top answers.

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