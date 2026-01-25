# The Future of Work - Business Simulation Game

## Overview
A web-based business simulation game designed for graduate students to make strategic company decisions over a semester. The game focuses on navigating the complexities of AI adoption, managing employee anxiety, and workforce transformation. Teams compete on both financial performance and cultural health. The platform aims to provide an engaging and educational experience for future business leaders to understand and navigate AI integration and workforce management.

## User Preferences
I prefer clear and concise communication. When making changes, prioritize the core logic and critical features. I value iterative development and expect to be consulted before major architectural shifts or significant feature additions. Do not make changes to files related to authentication without explicit approval.

## System Architecture

**UI/UX Decisions:**
-   **Design Inspiration:** Bloomberg Terminal aesthetic.
-   **Components:** Shadcn/UI, Radix primitives for accessibility.
-   **Data Visualization:** Recharts for dynamic charts.
-   **Styling:** Tailwind CSS with custom design tokens.
-   **Color Scheme:** Corporate Navy, Growth Green, Caution Amber, Tech Purple, Professional Grey, with specific positive/negative data colors.
-   **Fonts:** IBM Plex Sans, Inter, Roboto Mono.
-   **Landing Page:** Features a tagline, sub-headline, rotating challenge cards, and calls to action for educators.

**Technical Implementations:**
-   **Frontend:** React with TypeScript, Wouter for routing, TanStack Query for data fetching.
-   **Backend:** Express.js.
-   **Database:** PostgreSQL with Drizzle ORM.
-   **Authentication:** Replit OIDC Auth with `connect-pg-simple` for session storage.
-   **Notifications:** Twilio for SMS.
-   **Role System:** Three-tier hierarchy (Super Admin, Class Admin, Student) with an `is_admin` VARCHAR field.
-   **Multi-Tenancy:** Organizations managed with unique team codes.
-   **Simulation Loop:** Dashboard → Briefing → Decisions → Analytics → Leaderboard.
-   **Game Mechanics:** Dual scoring (Financial & Cultural), global events, resource allocation (AI deployment, lobbying, reskilling), and multi-attribute decision system.
-   **LLM-Powered Grading:** OpenAI-based semantic evaluation for essay responses using a transparent 4-criteria rubric.
-   **Activity Logging:** Tracks key user and game actions, exportable to CSV/JSON.
-   **Student Enrollment:** Configurable `.edu` email verification, team code entry, and SMS notifications to Class Admins.
-   **Admin Dashboards:** Dedicated interfaces for Super Admins (platform-wide) and Class Admins (organization-specific).
-   **CSV Bulk Import:** Class Admins can import up to 500 students via CSV, including email invitations.
-   **Member Soft-Delete:** Allows deactivation and reactivation of organization members.
-   **Simulation Lifecycle:** Formal management with status tracking, configurable dates, and week advancement controls.
-   **Scheduled Reminders:** Email queue system for instructors to schedule notifications.
-   **Platform Settings (Super Admin):** Configurable enrollment requirements, competition modes, scoring weights, and bonus settings.
-   **Preview as Student (Instructor Mode):** Allows Class Admins to test the simulation.
-   **Super Admin Dashboard Redesign:** Features a 6-tab structure for Organizations, People, Content, Simulation, Activity, and Settings.
-   **Multi-Scenario Module Support:** `simulationModules` table for different themes (e.g., AI Workplace, Supply Chain) and `simulationContent` for per-week content.
-   **Unified People API:** Merges users, organization memberships, and team assignments for efficient querying.
-   **Week Results & Feedback System:** Displays detailed performance feedback, LLM-evaluated essay scores with rubric, and top answers after each week, with SendGrid email notifications.

## External Dependencies

-   **Authentication:** Replit OIDC Auth
-   **Database:** PostgreSQL
-   **SMS Notifications:** Twilio
-   **Email Notifications:** SendGrid
-   **AI/LLM Integration:** OpenAI (GPT-4o-mini)
-   **UI Components:** Shadcn/UI, Radix UI
-   **Charting Library:** Recharts
-   **Frontend Framework:** React
-   **Backend Framework:** Express.js
-   **ORM:** Drizzle ORM

---

## Marketing Materials

### VERSION 1: Graduate Business Programs (MBA/MS Analytics)

#### **The Future of Work Simulation**
*Prepare Tomorrow's Leaders for AI-Driven Decision Making*

**What is The Future of Work?**

An 8-week immersive business simulation where students step into the role of executives at Apex Manufacturing, navigating the real-world challenges of AI adoption, workforce transformation, and strategic decision-making. Students compete on both financial performance and cultural health—reflecting the dual pressures modern leaders face.

**Key Highlights**

- **Executive-Level Decision Making**: Students allocate resources across AI deployment, employee reskilling, lobbying efforts, and union relations
- **Bloomberg Terminal-Inspired Interface**: Professional-grade dashboard mirrors the tools used in industry
- **Dual Scoring System**: Financial metrics AND cultural health scores—because sustainable success requires both
- **Team-Based Competition**: Leaderboards foster healthy competition while encouraging collaborative strategy
- **Weekly Intelligence Briefings**: Curated content simulates the information flow real executives navigate

**The Weekly Workflow**

1. **Review Intelligence Briefing** → Students analyze curated industry news, market signals, and emerging trends
2. **Make Strategic Decisions** → Resource allocation across multiple competing priorities with both structured inputs and open-ended strategic justifications
3. **Receive AI-Evaluated Feedback** → Immediate, detailed performance analysis with transparent scoring
4. **Track Progress** → Dashboard updates with new metrics, rank changes, and competitive standings
5. **Iterate** → Apply lessons learned to the next week's challenges

**LLM-Powered Essay Evaluation: Transparency by Design**

Unlike black-box AI grading, our system provides complete transparency:

**The 4-Criteria Rubric (25 points each, 100 total)**
- **Evidence Quality**: Are claims supported by data, research, or concrete examples?
- **Reasoning Coherence**: Is the argument logically structured and internally consistent?
- **Trade-off Analysis**: Does the response acknowledge competing priorities and constraints?
- **Stakeholder Consideration**: Are diverse perspectives (employees, shareholders, community) addressed?

**What Students See:**
- The full rubric BEFORE they write (no guessing what's expected)
- Detailed scores per criterion AFTER submission
- Specific strengths and areas for improvement
- Anonymized top-scoring responses from their cohort for peer learning

**Frequently Asked Questions**

**Q: How much time does this require per week?**
A: Students typically spend 30-45 minutes per week reviewing briefings and making decisions. The simulation runs asynchronously, so students complete work on their own schedule within the weekly window.

**Q: Can I customize the simulation for my course?**
A: Yes. Class Admins can configure simulation duration (4-12 weeks), scoring weights (financial vs. cultural emphasis), and enrollment requirements.

**Q: How are teams formed?**
A: You can assign teams manually, allow self-selection, or use individual mode. CSV bulk import supports up to 500 students at once.

**Q: What if a student misses a week?**
A: The simulation tracks individual progress. Students can catch up, though competitive rankings reflect real-time participation.

**Q: Is the AI grading fair?**
A: The transparent rubric ensures students know exactly how they're evaluated. LLM scoring focuses on reasoning quality, not keyword matching. Every criterion is visible before, during, and after submission.

**Q: What analytics do I get as an instructor?**
A: Activity logs, participation tracking, score distributions, and exportable reports (CSV/JSON) for integration with your LMS.

**Perfect For:**
- Strategy courses exploring technology disruption
- Organizational Behavior units on change management
- HR/People Analytics modules on workforce transformation
- Capstone experiences requiring integrated decision-making
- Executive Education programs on digital leadership

---

### VERSION 2: Generic Academia (Multi-Module)

#### **Future Work Academy Simulations**
*Experiential Learning for Complex Decision-Making*

**What Is This Platform?**

A multi-scenario simulation platform where students take on leadership roles, make high-stakes decisions, and receive immediate, transparent feedback. Each module presents a different challenge domain—from AI workplace transformation to supply chain resilience—all using the same proven pedagogical framework.

**Platform Highlights**

- **Modular Design**: Choose from multiple simulation themes to match your curriculum
- **Authentic Decision Environments**: Students face realistic trade-offs with incomplete information
- **Dual Performance Metrics**: Quantitative outcomes AND qualitative factors (culture, ethics, stakeholder impact)
- **Transparent AI Evaluation**: Open rubrics with detailed feedback on written responses
- **Flexible Administration**: Configure duration, team structures, and scoring emphasis to fit your course

**The Learning Cycle**

Each week follows a consistent pattern that builds decision-making skills:

1. **Contextualize** → Review scenario briefings with relevant background information
2. **Analyze** → Identify key trade-offs and stakeholder considerations
3. **Decide** → Submit both structured choices and written justifications
4. **Reflect** → Receive transparent feedback with specific improvement guidance
5. **Compare** → Learn from anonymized high-scoring peer responses

**How Essay Evaluation Works**

Our AI-powered grading system prioritizes transparency over mystery:

**Students See the Rubric First**
Four clear criteria, each worth 25 points:
- Evidence Quality
- Reasoning Coherence
- Trade-off Analysis
- Stakeholder Consideration

**Students See Detailed Feedback After**
- Individual scores per criterion
- Specific strengths identified
- Concrete areas for improvement
- Exemplary responses from peers (anonymized)

This approach eliminates the "black box" concern common with AI grading—students always know what's expected and how they performed.

**Instructor FAQs**

**Q: How long is a typical simulation?**
A: Configurable from 4-12 weeks. Most instructors run 6-8 week simulations.

**Q: How much class time does this require?**
A: The simulation runs asynchronously. Many instructors use 10-15 minutes of class time for debrief discussions, but this is optional.

**Q: Can I enroll students quickly?**
A: Yes—bulk CSV import handles up to 500 students. Students receive email invitations automatically.

**Q: What if I need to adjust mid-simulation?**
A: Administrators can modify settings, send reminder notifications, and track student progress throughout.

**Q: How do students authenticate?**
A: Secure single sign-on. Optional .edu email verification for institutional use.

**Q: What data do I get?**
A: Comprehensive activity logs, decision histories, and performance analytics—all exportable.

**Available Modules**
- AI Workplace Transformation (flagship)
- Additional themes coming soon (supply chain, sustainability, crisis management)

---

### Reusable Prompt for Future Marketing Content

```
You are a higher education marketing specialist creating promotional content for a business simulation platform.

PLATFORM DETAILS:
- Name: [Simulation Name]
- Duration: [X] weeks of immersive decision-making
- Target Audience: [Graduate Business / Undergraduate / Executive Education]
- Core Theme: [AI Adoption / Supply Chain / Sustainability / etc.]
- Key Differentiators: 
  * Transparent LLM-powered essay grading with visible 4-criteria rubric
  * Dual scoring (quantitative + qualitative metrics)
  * Weekly decision cycles with immediate feedback
  * Team-based competition with leaderboards
  * Professional-grade dashboard interface

CONTENT TO PRODUCE:
1. One-paragraph executive summary
2. 5-7 key feature highlights (bullet points)
3. Weekly workflow explanation (5 steps)
4. LLM transparency section explaining:
   - The 4 rubric criteria (Evidence Quality, Reasoning Coherence, Trade-off Analysis, Stakeholder Consideration)
   - What students see before and after submission
   - Why this matters pedagogically
5. 6-8 FAQs with concise answers covering:
   - Time commitment
   - Customization options
   - Team formation
   - Grading fairness
   - Instructor analytics
   - Technical requirements
6. "Perfect For" section listing 4-5 ideal course applications

TONE: [Academic but accessible / Conversational / Formal]
LENGTH: [One-pager / Full brochure / Email pitch]

Additional context: [Add any specific features, use cases, or institutional requirements]
```