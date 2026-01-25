# The Future of Work - Business Simulation Game

## Overview
This web-based business simulation game is designed for graduate students to make strategic company decisions over a semester. It focuses on navigating AI adoption, managing employee anxiety, and workforce transformation. Teams compete on financial performance and cultural health, providing an engaging and educational experience for future business leaders. The platform aims to prepare leaders for AI-driven decision-making and offers a multi-scenario simulation platform for experiential learning in complex decision-making, addressing the market potential for AI integration and workforce management training.

## User Preferences
I prefer clear and concise communication. When making changes, prioritize the core logic and critical features. I value iterative development and expect to be consulted before major architectural shifts or significant feature additions. Do not make changes to files related to authentication without explicit approval.

## Brand Guidelines

**Target Audience:** C-suite executives, educational administrators, MBA program directors, business school deans
**Presentation Context:** Executive boardrooms, academic committee meetings, investor pitches

**Brand Tone:**
- Authoritative but not academic - We prepare leaders, not lecture students
- Forward-thinking - AI transformation is opportunity, not threat
- Sophisticated - Bloomberg Terminal aesthetic, not classroom chalkboard
- Confident - Battle-tested simulation platform, not experimental prototype

**Visual Style:**
- Sharp, clean lines with geometric precision
- Navy blue (#1e3a5f) as primary brand color - conveys trust and authority
- Growth green (#22c55e) as accent - signals progress and positive outcomes
- Minimal ornamentation - every element earns its place
- Premium feel - think financial services, management consulting

**Brand Story:**
"The Future of Work Academy doesn't teach theory - it builds decision-making muscle. Our simulation puts future leaders in the hot seat, forcing real-time choices about AI adoption, workforce transformation, and stakeholder management. When they graduate, they've already made the hard calls."

**Logo Requirements:**
- Must be legible at 32px (favicon) and 400px (presentation header)
- Works on both light and dark backgrounds
- Conveys: Leadership, Technology, Transformation, Education
- Avoid: Cartoonish elements, clip-art aesthetics, overly academic symbols

**Complete Brand Standards:** See `docs/BRAND_STANDARDS.md` for full documentation including:
- Color palette with hex codes (Corporate Navy #1e3a5f, Growth Green #22c55e, etc.)
- Typography guidelines (IBM Plex Sans, Inter, Roboto Mono)
- Logo usage guidelines and asset locations
- Tone and voice guidelines
- Visual style principles
- Spacing system

**Logo Assets:**
- `attached_assets/logo-icon-dark.png` - Square icon, navy on white (for light backgrounds)
- `attached_assets/logo-icon-light.png` - Square icon, white on black (for dark backgrounds)
- `attached_assets/logo-horizontal-dark.png` - Full lockup, navy on white (presentations, headers)
- `attached_assets/logo-horizontal-light.png` - Full lockup, white on black (dark mode, slides)
- `attached_assets/logo-dark.svg` - SVG icon, navy on transparent (scalable)
- `attached_assets/logo-light.svg` - SVG icon, white on transparent (scalable)
- `client/public/logo.png` - Primary web app logo (copy of icon-dark)
- `client/public/favicon.png` - Browser tab icon

**Current Logo Sizes in Web App:**
- Header logos (landing, academia, for-educators, waiting-assignment, feedback): h-16 (64px) - horizontal logo with text
- Secondary page headers (about, privacy): h-14 (56px) - horizontal logo with text
- Sidebar collapsed: h-10 (40px)
- Favicon: 32px

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
- **Character Profiles System:** 17 predefined stakeholder roles (CEO, CFO, Union Leader, etc.) with AI-generated headshots via OpenAI gpt-image-1 model, rich bios including personality traits, motivations, fears, and communication styles, plus relationship mapping between characters.
- **Character-Driven Simulation Engine:** Quantifiable character traits (influence, hostility, flexibility, riskTolerance on 1-10 scale) plus impact categories (labor, finance, technology, culture, operations, strategy, legal, marketing, executive, external) that mechanically affect simulation outcomes:
  - **Decision Difficulty Modifiers:** High-hostility + high-influence characters make related decisions harder (0.5x-2.0x difficulty multiplier)
  - **LLM Grading Context Injection:** Top 5 influential stakeholders' perspectives are automatically injected into essay grading prompts for "Stakeholder Consideration" scoring
  - **Phone-a-Friend Stakeholder Warnings:** Advisor AI responses include warnings about resistant/hostile stakeholders in their specialty area
  - **Voicemail Trigger Sensitivity:** Character hostility/influence boost voicemail trigger probability
  - **Admin Trait Editor:** Visual sliders and category checkboxes at `/admin/character-profiles` for editing traits with live preview of impact calculations
- **Triggered Voicemail Notifications:** Context-sensitive audio messages from simulation characters triggered by 6 event types (time_window, decision_made, content_viewed, week_started, score_threshold, random) with customizable urgency levels and cooldown periods.
- **Phone-a-Friend Advisor System:** 9 specialized advisors (Finance, HR, Operations, Legal, Union Relations, Technology, Marketing, Strategy, Ethics) provide AI-generated contextual guidance using GPT-4o-mini with stakeholder awareness. Students have 3 lifetime uses per simulation.
- **Multimedia Content Support:** Video and audio content in briefings with full transcripts, dynamic reading/viewing time estimates, media engagement tracking (started, completed, resume position), and Intel classification for bonus eligibility.
- **SVG Logo System:** Dual-variant SVG logos with transparent backgrounds (logo-dark.svg for light backgrounds, logo-light.svg for dark sidebar).
- **Difficulty Framework:** 3-tier difficulty system (Introductory/Standard/Advanced) with 11 quantifiable factors including simulation duration, reading load, stakeholder complexity, rubric criteria, advisor uses, event probability, scoring thresholds, and crisis triggers. Current default: Advanced (Graduate/MBA level). Student dashboard shows difficulty badge with tooltip explaining grading implications. Full documentation in GAME_DESIGN.md Section 13.

## External Dependencies

- **Authentication:** Replit OIDC Auth
- **Database:** PostgreSQL
- **SMS Notifications:** Twilio
- **Email Notifications:** SendGrid
- **AI/LLM Integration:** OpenAI (GPT-4o-mini for text, gpt-image-1 for headshot generation)
- **Analytics:** Google Analytics 4 (G-Y13X8BC4MW) - tracking code in `client/index.html`
- **UI Components:** Shadcn/UI, Radix UI
- **Charting Library:** Recharts
- **Frontend Framework:** React
- **Backend Framework:** Express.js
- **ORM:** Drizzle ORM

## AI Transparency

Full documentation of all AI/LLM prompts, models, and bias mitigation measures is maintained in:
- **docs/AI_TRANSPARENCY.md** - Complete prompt documentation for audits

This document covers:
- All LLM prompts used for student assessment (essay evaluation, rationale scoring)
- Content enhancement and generation prompts
- Phone-a-Friend advisor system prompts with stakeholder context injection
- Character headshot and brand logo generation prompts
- Bias mitigation measures and data handling policies
- Model selection rationale

---

## Additional Documentation

Business and marketing documentation is maintained in the `docs/` folder:
- **docs/BUSINESS_PLAN.md** - Full business plan with costs, compliance requirements, and monetization strategy
- **docs/PRODUCT_ROADMAP.md** - Detailed product roadmap with near-term, mid-term, and long-term features
- **docs/MARKETING_MATERIALS.md** - Marketing content for MBA programs and generic academia
- **docs/SECURITY_COMPLIANCE.md** - Security architecture, FERPA compliance, data handling, incident response
- **docs/BRAND_STANDARDS.md** - Complete brand guidelines (colors, typography, logo usage, tone)
- **docs/AI_TRANSPARENCY.md** - All AI/LLM prompts documented for audit readiness
- **docs/APPENDIX_DIAGRAMS.md** - 10 Mermaid diagrams for visual documentation
- **docs/GAME_DESIGN.md** - Complete simulation mechanics (variables, scenarios, scoring, stakeholders)

### Google Docs Integration

Documents automatically sync to Google Docs on server startup and when files in the `docs/` directory are modified. They are organized in a "Future Work Academy" folder.

**Automatic Sync Features:**
- Initial sync on server startup
- File watcher monitors docs/ directory with 3-second debounce for rapid saves
- Documents moved to organized "Future Work Academy" folder

**Manual API Endpoints:**
- `POST /api/docs/sync` - Sync a specific document (body: `{ documentType: 'business_plan' | 'product_roadmap' | 'marketing_materials' | 'appendix_diagrams' }`)
- `POST /api/docs/sync-all` - Sync all documents to Google Docs
- `GET /api/docs/list` - List all Google Docs in connected account

### Visual Documentation

- **docs/APPENDIX_DIAGRAMS.md** - 10 Mermaid diagrams covering system architecture, workflows, scoring, rubrics, roles, competitive positioning, data models, lifecycle, and notification flows
- Diagrams are code-based (version-controlled), render to images via [mermaid.live](https://mermaid.live) for presentations

---

## Documentation Update Checklist

**Purpose:** Ensure all documentation stays current when features are added or changed.

### After Implementing Any New Feature:

1. **Update replit.md**
   - Add feature to "Technical Implementations" section
   - Note any new external dependencies
   - Document any new API endpoints

2. **Update Marketing Materials** (`docs/MARKETING_MATERIALS.md`)
   - Add user-facing feature description to "Key Highlights" (Version 1)
   - Add to "Platform Highlights" (Version 2 - Generic Academia)
   - Update FAQs if the feature affects common questions

3. **Update Product Roadmap** (`docs/PRODUCT_ROADMAP.md`)
   - Move from "Planned" to "Current Capabilities" if applicable
   - Add future enhancements to appropriate roadmap section
   - Update version history

4. **Update Business Plan** (`docs/BUSINESS_PLAN.md`)
   - Only if feature affects pricing, costs, or market positioning

### Suggested Review Cadence:
- **Weekly:** Quick review of replit.md accuracy
- **Monthly:** Full documentation review across all docs
- **Before Major Releases:** Complete sync of all documentation

### Recently Added Features (Pending Full Documentation)
*Move items to main docs after review:*
- (empty - all caught up as of January 2026)
