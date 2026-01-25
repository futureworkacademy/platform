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
-   **LLM-Powered Grading:** OpenAI-based semantic evaluation for essay responses with transparent rubric-based scoring.
-   **Activity Logging:** Tracks key user and game actions, exportable to CSV/JSON.

**Feature Specifications:**
-   **Executive Dashboard:** Displays key performance indicators.
-   **Weekly Intelligence Briefings:** Curated articles with insights.
-   **AI Deployment Decisions:** Interface for strategic AI integration.
-   **People Analytics:** Detailed employee sentiment and behavior analysis.
-   **Student Enrollment:** Configurable `.edu` email verification and team code entry, with SMS notifications to Class Admins.
-   **Admin Dashboards:** Dedicated interfaces for Super Admins (platform-wide) and Class Admins (organization-specific).
-   **Instructor Notification Settings:** Admin users can set their phone number for SMS alerts when students enroll.
-   **CSV Bulk Import:** Class Admins can import up to 500 students at a time via CSV upload (email, firstName, lastName). Includes email invitations via SendGrid.
-   **Member Soft-Delete:** Organization members are "deactivated" instead of permanently deleted, allowing reactivation. Deactivated members are removed from teams and can be restored by instructors.
-   **Simulation Lifecycle:** Formal simulation management with status tracking (setup → active → completed), configurable start/end dates, total weeks, and week advancement controls.
-   **Scheduled Reminders:** Email queue system allowing instructors to schedule reminder notifications for students with title, message, and send time.
-   **Platform Settings (Super Admin):** Configurable enrollment requirements, competition modes, scoring weights, and bonus settings:
    - Enrollment: Toggle `.edu` email requirement, team code requirement
    - Competition: Individual vs team-based scoring, simulation duration (4-12 weeks)
    - Scoring: Configurable financial/cultural weight balance (0-100%)
    - Easter Egg Bonus: Toggle and percentage for research citation rewards
-   **Preview as Student (Instructor Mode):** Blackboard-style preview feature allowing Class Admins to test the simulation as a student:
    - Creates an org-scoped test student and team per admin per organization
    - Admin dashboard shows "Preview as Student" button
    - Student dashboard shows preview mode banner with exit/reset controls
    - Reset functionality clears test data back to initial state (week 1)
-   **Super Admin Dashboard Redesign (6-Tab Structure):**
    - Organizations: Create/edit organizations, view member counts
    - People: Unified view of all users with search, filters (status/role/org/deactivated), comprehensive CRUD actions
    - Content: About page editing, simulation content management (placeholder for future expansion)
    - Simulation: Simulation lifecycle controls (placeholder for future expansion)
    - Activity: Activity logs (placeholder for future expansion)
    - Settings: Platform-wide configuration
-   **People Tab CRUD Actions (Super Admin):**
    - Profile pictures: Avatar display with fallback initials, editable URL
    - Edit Details: Modify first name, last name, email, and profile image URL
    - Change Team: Reassign users to different teams within their organization
    - Deactivate: Soft-delete org members (removes from team, preserves data)
    - Reactivate: Restore deactivated members to active status
    - Remove from Org: Permanently delete organization membership
-   **Multi-Scenario Module Support:**
    - `simulationModules` table for different simulation themes (AI Workplace, Supply Chain, etc.)
    - `simulationContent` table for per-week content items (briefings, videos, resources)
    - Default "AI Workplace Transformation" module created automatically
    - Future extensibility for selling different modules to different institutions
-   **Unified People API (`/api/super-admin/people`):**
    - Merges users, organization memberships, and team assignments
    - Returns computed status (active/pending/invited/deactivated), role, org info, team info per person
    - Supports the new People tab with efficient unified querying
-   **Week Results & Feedback System:**
    - Week Results page (/week-results) displays detailed performance feedback after completing a week
    - LLM-evaluated essay scores with transparent 4-criteria rubric (Evidence Quality, Reasoning Coherence, Trade-off Analysis, Stakeholder Consideration - 25pts each)
    - Shows strengths, areas for improvement, and overall performance summary
    - Top Answers section displays anonymized exemplary responses from cohort
    - Automatic redirect to Week Results after completing week decisions
    - SendGrid email notifications sent when week advances with results available

## External Dependencies

-   **Authentication:** Replit OIDC Auth
-   **Database:** PostgreSQL
-   **SMS Notifications:** Twilio
-   **Email Notifications:** SendGrid
-   **AI/LLM Integration:** OpenAI (GPT-4o-mini for essay evaluation)
-   **UI Components:** Shadcn/UI, Radix UI
-   **Charting Library:** Recharts
-   **Frontend Framework:** React
-   **Backend Framework:** Express.js
-   **ORM:** Drizzle ORM