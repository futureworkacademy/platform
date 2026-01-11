# The Future of Work - Business Simulation Game

## Overview
A web-based business simulation game for graduate students to make strategic company decisions over a semester, focusing on AI adoption challenges and managing employee anxiety. Teams compete on financial performance and cultural health.

**Key Capabilities:**
- Real-time executive dashboard with company metrics.
- Weekly intelligence briefings and AI deployment decisions.
- Resource allocation for lobbying and employee reskilling.
- In-depth people analytics and competition leaderboards.
- Multi-tenant architecture supporting classes and student teams.

**Business Vision:** To provide an engaging and educational platform for future business leaders to understand and navigate the complexities of AI integration and workforce management.

## User Preferences
I prefer clear and concise communication. When making changes, prioritize the core logic and critical features. I value iterative development and expect to be consulted before major architectural shifts or significant feature additions. Do not make changes to files related to authentication without explicit approval.

## System Architecture

**UI/UX Decisions:**
-   **Design Inspiration:** Bloomberg Terminal aesthetic.
-   **Components:** Shadcn/UI, Radix primitives for robust, accessible UI.
-   **Data Visualization:** Recharts for dynamic charts.
-   **Styling:** Tailwind CSS with custom design tokens for consistency.
-   **Color Scheme:** Corporate Navy, Growth Green, Caution Amber, Tech Purple, Professional Grey, with specific positive/negative data colors.
-   **Fonts:** IBM Plex Sans, Inter, Roboto Mono.
-   **Landing Page:** Features a tagline, sub-headline, 12 rotating challenge cards, and calls to action for educators.

**Technical Implementations:**
-   **Frontend:** React with TypeScript, Wouter for routing, TanStack Query for data fetching.
-   **Backend:** Express.js.
-   **Database:** PostgreSQL with Drizzle ORM.
-   **Authentication:** Replit OIDC Auth with session storage via `connect-pg-simple`.
-   **Notifications:** Twilio for SMS.
-   **Role System:** Three-tier hierarchy (Super Admin, Class Admin, Student) with `is_admin` VARCHAR field for roles.
-   **Multi-Tenancy:** Organizations managed with unique team codes.
-   **Simulation Loop:** Dashboard -> Briefing -> Decisions -> Analytics -> Leaderboard.
-   **Game Mechanics:** Dual scoring (Financial & Cultural), global events, resource allocation (AI deployment, lobbying, reskilling).
-   **Enhanced Decision System:** Multi-attribute decisions for strategic areas like Automation, Talent Development, and Union Relations.
-   **Activity Logging:** Tracks key user and game actions, exportable to CSV/JSON.

**Feature Specifications:**
-   **Executive Dashboard:** Displays key performance indicators.
-   **Weekly Intelligence Briefings:** Curated articles with insights.
-   **AI Deployment Decisions:** Interface for strategic AI integration.
-   **People Analytics:** Detailed employee sentiment and behavior analysis.
-   **Student Enrollment:** Configurable `.edu` email verification and team code entry, with SMS notifications to Class Admins.
-   **Admin Dashboards:** Dedicated interfaces for Super Admins (platform-wide) and Class Admins (organization-specific).
-   **Platform Settings (Super Admin):** Configurable enrollment requirements, competition modes, scoring weights, and bonus settings:
    - Enrollment: Toggle `.edu` email requirement, team code requirement
    - Competition: Individual vs team-based scoring, simulation duration (4-12 weeks)
    - Scoring: Configurable financial/cultural weight balance (0-100%)
    - Easter Egg Bonus: Toggle and percentage for research citation rewards

## External Dependencies

-   **Authentication:** Replit OIDC Auth
-   **Database:** PostgreSQL
-   **SMS Notifications:** Twilio
-   **UI Components:** Shadcn/UI, Radix UI
-   **Charting Library:** Recharts
-   **Frontend Framework:** React
-   **Backend Framework:** Express.js
-   **ORM:** Drizzle ORM