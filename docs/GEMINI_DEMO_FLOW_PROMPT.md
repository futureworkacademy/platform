# Gemini Demo Flow Builder Prompt

This document provides a structured prompt for using Gemini (or other LLMs) to build guided demo flows for the Future Work Academy simulation platform.

---

## System Context

You are building interactive demo flows for the Future Work Academy business simulation platform. The platform is used by graduate students to make strategic decisions about AI adoption, workforce management, and organizational change.

**Platform Architecture:**
- React/TypeScript frontend with Shadcn/UI components
- Express.js backend with PostgreSQL database
- Multi-tenant architecture with organizations and team codes
- Dual scoring system: Financial Health + Cultural Health
- LLM-powered essay grading with transparent rubrics

**Demo Environment:**
- Organization Code: `DEMO2025`
- Pre-seeded with 6 fake students across 3 teams
- Simulation starts at Week 3 (mid-simulation view)
- 30-day evaluator access with isolated sandbox
- Any work email accepted (no .edu requirement)

**Hybrid Guided Tour System:**
- **Driver.js Tour**: Auto-triggers 1.5 seconds after first demo user login
- **8-Step Walkthrough**: Covers logo, company name, scores, navigation, and key features
- **Gemini Q&A Widget**: Floating AI assistant for real-time questions
- **Quick Question Buttons**: Pre-defined common questions for fast answers
- **Restart Tour Button**: Available in sidebar for demo users to replay anytime
- **Completion Tracking**: localStorage-based, only shows once per browser

---

## Demo Flow Personas

### Persona A: Skeptical Dean
**Profile:** Academic administrator evaluating platform for curriculum integration
**Concerns:** Academic integrity, student data privacy, cost-effectiveness
**Key Questions:**
- "How do students submit work?"
- "What prevents cheating?"
- "How is grading auditable?"

### Persona B: Curious Professor
**Profile:** Management faculty seeking experiential learning tools
**Concerns:** Pedagogical alignment, time investment, flexibility
**Key Questions:**
- "Can I customize scenarios?"
- "How does this fit my syllabus?"
- "What's the student experience like?"

### Persona C: Innovation Champion
**Profile:** Business school leader pursuing modernization
**Concerns:** Competitive differentiation, scalability, ROI
**Key Questions:**
- "What makes this different from case studies?"
- "Can multiple sections run simultaneously?"
- "What's the implementation timeline?"

---

## Demo Flow Structure

Each guided demo should follow this narrative arc:

### 1. The Hook (30 seconds)
Start with a compelling problem statement that resonates with the persona.

**Example for Skeptical Dean:**
> "Your students are graduating with case study knowledge but no real practice making messy, consequential decisions. Let me show you how FWA changes that."

### 2. The Dashboard Tour (2 minutes)
Navigate through key instructor views:
- Class overview with team standings
- Week-by-week progression
- Financial vs. Cultural health leaderboard
- Individual student performance metrics

### 3. The Student Experience Preview (3 minutes)
Walk through the student journey:
- Weekly briefing with CEO video/voicemail
- Intel articles and engagement bonus
- Decision interface with multiple choice + essay
- Phone-a-Friend advisor system
- Character relationships and stakeholder mapping

### 4. The Transparency Showcase (2 minutes)
Address academic integrity concerns:
- Show the grading rubric configuration
- Demonstrate how essay responses are evaluated
- Explain the audit trail and activity logging
- Highlight PII stripping before AI processing

### 5. The Difficulty Customization (1 minute)
Demonstrate flexibility:
- Introductory / Standard / Advanced presets
- 11 quantifiable difficulty factors
- Scenario module selection (Future of Work, Supply Chain, ESG)

### 6. The Close (1 minute)
Connect back to their specific needs:
- "Based on what you've seen, which features would be most valuable for your [MBA program / executive cohort / undergraduate course]?"

---

## Sample Dialogue Scripts

### Opening Script (Skeptical Dean)
```
"Dr. [Name], before we dive in, I want to acknowledge your concern about AI in education. 
Our platform is what we call 'white box' AI - every grading decision is transparent, 
auditable, and aligned with rubrics you control. Let me show you exactly how that works."
```

### Transition to Student View
```
"Now let me put you in a student's seat. You're the COO of Apex Manufacturing, 
and you're about to make a decision that will affect 200 employees' jobs. 
Notice how we present both the financial implications AND the human impact."
```

### Handling the "Can I Customize?" Question
```
"Absolutely. You can configure difficulty levels, select which stakeholder characters 
are active, and even adjust how much the LLM emphasizes different rubric criteria. 
Some professors want more financial rigor; others prioritize ethical reasoning. 
You control that balance."
```

---

## Technical Demo Points

### Key Routes to Highlight
- `/admin/dashboard` - Class Admin overview
- `/admin/simulation/[simId]` - Simulation management
- `/simulation/[simId]/week/[weekNum]` - Student decision interface
- `/student-preview` - Instructor preview of student experience

### Data Points to Reference
- 17 character profiles with AI-generated headshots
- 9 specialized advisors for Phone-a-Friend
- 8-week narrative arc with escalating complexity
- Dual scoring visible after Week 4

### API Endpoints for Live Demos
- `GET /api/simulations/:id/standings` - Leaderboard data
- `GET /api/simulations/:id/character-profiles` - Stakeholder directory
- `GET /api/simulations/:id/activity-log` - Audit trail

---

## Objection Handling

| Objection | Response |
|-----------|----------|
| "How is this different from a video game?" | "Games optimize for engagement; we optimize for learning transfer. Every decision maps to real management frameworks with measurable outcomes." |
| "What about students who just want the 'right answer'?" | "There are no right answers—only trade-offs. We grade on reasoning quality, stakeholder consideration, and synthesis of competing priorities." |
| "Our IT department won't approve another platform." | "We're a web app—no installation required. FERPA-compliant, SSO-compatible, and we can run a pilot with a single section before broader rollout." |
| "Faculty don't have time to learn new tools." | "The instructor dashboard takes 15 minutes to master. Most configuration is done once per semester, and we provide full onboarding support." |

---

## Demo Environment Technical Details

### Sandbox Isolation
- Demo users can only see demo organization data
- Demo org uses code `DEMO2025`
- Pre-seeded teams: "Alpha Innovators", "Beta Builders", "Gamma Growth"
- 6 fake students with realistic activity history
- Simulation positioned at Week 3 for mid-game context

### Access Provisioning
- Instant evaluator access via `/api/demo/request-access`
- 30-day expiration (extendable upon request)
- Email stored for follow-up but not required for platform access
- No .edu verification for demo accounts

### Security Boundaries
- Demo users cannot:
  - Create real organizations
  - Access non-demo simulation data
  - Modify production content
  - Send notifications to real students
- Demo users can:
  - Explore full instructor dashboard
  - Preview student experience
  - View pre-populated leaderboards
  - Test grading interface with sample responses

---

## Follow-Up Actions

After demo completion, recommended next steps:

1. **Immediate:** Send personalized thank-you with recording link (if applicable)
2. **Within 24 hours:** Share IOWA_OUTREACH_PLAYBOOK if Iowa target school
3. **Within 1 week:** Schedule pilot discussion with curriculum committee contact
4. **Ongoing:** Add to nurture sequence with case study updates

---

## LLM Prompt Template

Use this template when generating demo scripts with Gemini or other AI:

```
You are a sales engineer for Future Work Academy, an educational simulation platform for business schools. Generate a demo script for the following scenario:

PERSONA: [Dean / Professor / Innovation Leader]
INSTITUTION: [School Name]
PROGRAM TYPE: [MBA / Undergraduate / Executive Ed]
KEY CONCERNS: [e.g., academic integrity, time investment, student engagement]
TIME AVAILABLE: [15 min / 30 min / 60 min]

Structure the demo to:
1. Address their specific concerns in the first 2 minutes
2. Show the most relevant features for their program type
3. Include a "wow moment" that differentiates from traditional case studies
4. End with a clear next step appropriate for their institution

Use conversational language and avoid jargon. Include specific navigation paths and data points to reference during the live demo.
```
