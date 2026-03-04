# STORY BIBLE: The Future of Work Academy
## Narrative Reference Document

**PURPOSE:** This document provides narrative context and detailed descriptions for all simulation content. It is a **mirror** of the structured data in `docs/canonical.json`.

**SINGLE SOURCE OF TRUTH:** `docs/canonical.json` is the primary canonical source. This Story Bible must match that JSON exactly. The validation script checks this document against canonical.json to prevent drift.

**VALIDATION:** Run `npx tsx server/validate-content.ts` to verify this document matches canonical.json.

**WHY THIS MATTERS:** Characters aren't just portraits - they're variables that affect LLM grading, decision difficulty, and narrative tension across all 8 weeks. One inconsistency creates ripple effects throughout the simulation. See [CONTENT_INTEGRITY.md](./CONTENT_INTEGRITY.md) for the full explanation.

**Last Updated:** January 2026

---

## PART 1: THE COMPANY

### Company Profile

| Field | Canonical Value |
|-------|-----------------|
| **Company Name** | Apex Manufacturing |
| **Industry** | Automotive parts supplier |
| **Size** | Mid-sized |
| **Annual Revenue** | $125,000,000 |
| **Employees** | 2,400 |
| **Average Tenure** | 7.2 years |
| **Location** | Midwest United States (unspecified city) |
| **Founded** | 1987 |
| **Ownership** | Privately held with institutional investors |

### Starting Financial State

| Metric | Value |
|--------|-------|
| Revenue | $125,000,000 |
| Cash Reserves | $15,000,000 |
| Debt | $0 |
| AI Budget | $2,000,000 |
| Reskilling Fund | $500,000 |
| Lobbying Budget | $100,000 |

### Starting Workforce State

| Metric | Value |
|--------|-------|
| Total Employees | 2,400 |
| Morale | 68/100 |
| Union Sentiment | 35/100 |
| Unionized | No |
| Workforce Adaptability | 55/100 |
| Reskilling Progress | 20/100 |
| Gen Z Workforce | 28% |
| Manager Vacancies | 8 |
| Management Bench Strength | 45/100 |

### Starting Automation State

| Metric | Value |
|--------|-------|
| Automation Level | 12/100 |
| Automation ROI | 0% |
| Robotics Investment | $0 |

### Company History (Brief)

Apex Manufacturing was founded in 1987 by industrial engineer Harold Novak. The company grew steadily through the 1990s and 2000s, surviving the 2008 financial crisis through conservative fiscal management. Harold retired in 2015, and the company transitioned to professional management with a board of institutional investors.

Revenue growth has stagnated at 3% annually versus an 8% industry average. Competitors have embraced automation while Apex maintained its labor-intensive operations. The board has grown impatient, setting an ultimatum: modernize or face acquisition.

---

## PART 2: THE CHARACTERS (17 Profiles)

### Internal Stakeholders

#### 1. Victoria Hartwell - Board Chair
| Field | Value |
|-------|-------|
| **Full Name** | Victoria Hartwell |
| **Role** | Board Chair |
| **Age** | 62 |
| **Background** | Former McKinsey partner, PE investor |
| **Stance** | Strategic, impatient |
| **Key Concerns** | Shareholder value, competitive positioning |
| **Communication Style** | Formal, demanding |
| **Influence** | 10/10 |
| **Hostility** | 4/10 |
| **Flexibility** | 3/10 |
| **Risk Tolerance** | 7/10 |
| **Signature Quote** | "We need a 25% cost reduction within 2 years or we'll explore strategic alternatives." |

#### 2. David Chen - Chief Financial Officer (CFO)
| Field | Value |
|-------|-------|
| **Full Name** | David Chen |
| **Role** | Chief Financial Officer |
| **Age** | 48 |
| **Background** | CPA, former Big Four, 6 years at Apex |
| **Stance** | Analytical, cautious |
| **Key Concerns** | ROI, debt covenants, cash flow |
| **Communication Style** | Numbers-focused, measured |
| **Influence** | 8/10 |
| **Hostility** | 2/10 |
| **Flexibility** | 5/10 |
| **Risk Tolerance** | 3/10 |
| **Signature Quote** | "The bank loan is ready. We can draw $15M at 6.5% interest, but we need a solid plan." |

#### 3. Margaret "Maggie" O'Brien - Chief Operating Officer (COO)
| Field | Value |
|-------|-------|
| **Full Name** | Margaret O'Brien |
| **Nickname** | Maggie |
| **Role** | Chief Operating Officer |
| **Age** | 54 |
| **Background** | 22 years at Apex, started on factory floor |
| **Stance** | Pragmatic, solutions-oriented |
| **Key Concerns** | Efficiency, implementation feasibility |
| **Communication Style** | Practical, direct |
| **Influence** | 8/10 |
| **Hostility** | 2/10 |
| **Flexibility** | 6/10 |
| **Risk Tolerance** | 5/10 |
| **Signature Quote** | "We need to fundamentally rethink the management model. AI-augmented management could be the answer." |

#### 4. Sandra Williams - HR Director
| Field | Value |
|-------|-------|
| **Full Name** | Sandra Williams |
| **Role** | HR Director |
| **Age** | 45 |
| **Background** | SHRM-SCP, organizational psychology PhD |
| **Stance** | Employee advocate |
| **Key Concerns** | Morale, retention, culture |
| **Communication Style** | Empathetic, thoughtful |
| **Influence** | 7/10 |
| **Hostility** | 1/10 |
| **Flexibility** | 8/10 |
| **Risk Tolerance** | 4/10 |
| **Signature Quote** | "How we handle these workers will define our employer brand for a decade." |

#### 5. Frank Torres - Operations Manager
| Field | Value |
|-------|-------|
| **Full Name** | Frank Torres |
| **Role** | Operations Manager |
| **Age** | 51 |
| **Background** | 18 years at Apex, union member before promotion |
| **Stance** | Caught in the middle |
| **Key Concerns** | Team morale, production targets |
| **Communication Style** | Stressed, honest |
| **Influence** | 6/10 |
| **Hostility** | 3/10 |
| **Flexibility** | 5/10 |
| **Risk Tolerance** | 4/10 |
| **Signature Quote** | "My team is scared. If we don't address their concerns, we'll see productivity drop before we even start." |

#### 6. Jennifer Park - Sales VP
| Field | Value |
|-------|-------|
| **Full Name** | Jennifer Park |
| **Role** | Vice President of Sales |
| **Age** | 42 |
| **Background** | MBA, former automotive OEM executive |
| **Stance** | Customer-focused |
| **Key Concerns** | Sales pipeline, company reputation |
| **Communication Style** | Urgent, persuasive |
| **Influence** | 7/10 |
| **Hostility** | 3/10 |
| **Flexibility** | 4/10 |
| **Risk Tolerance** | 6/10 |
| **Signature Quote** | "We're losing deals because of our reputation. We need a bold move to show we've figured this out." |

#### 7. Robert Nakamura - General Counsel
| Field | Value |
|-------|-------|
| **Full Name** | Robert Nakamura |
| **Role** | General Counsel |
| **Age** | 56 |
| **Background** | Labor law specialist, former NLRB attorney |
| **Stance** | Risk-averse |
| **Key Concerns** | Compliance, liability, labor law |
| **Communication Style** | Cautious, precise |
| **Influence** | 6/10 |
| **Hostility** | 2/10 |
| **Flexibility** | 3/10 |
| **Risk Tolerance** | 2/10 |
| **Signature Quote** | "We need to be very careful here. Any missteps could be unfair labor practice charges." |

### External Stakeholders

#### 8. Marcus Webb - Union Organizer
| Field | Value |
|-------|-------|
| **Full Name** | Marcus Webb |
| **Role** | Union Organizer (UAW) |
| **Age** | 44 |
| **Background** | Former autoworker, 15 years organizing |
| **Stance** | Adversarial to management |
| **Key Concerns** | Worker rights, job security |
| **Communication Style** | Confrontational, passionate |
| **Influence** | 8/10 |
| **Hostility** | 8/10 |
| **Flexibility** | 3/10 |
| **Risk Tolerance** | 7/10 |
| **Signature Quote** | "Workers have a right to collective bargaining. Management has shown they care more about robots than people." |

#### 9. Patricia Lawson - First National Bank Representative
| Field | Value |
|-------|-------|
| **Full Name** | Patricia Lawson |
| **Role** | Senior Relationship Manager, First National Bank |
| **Age** | 50 |
| **Background** | Commercial lending, 25 years in banking |
| **Stance** | Creditor protecting bank interests |
| **Key Concerns** | Loan covenants, credit risk |
| **Communication Style** | Formal, measured, subtly threatening |
| **Influence** | 9/10 |
| **Hostility** | 5/10 |
| **Flexibility** | 4/10 |
| **Risk Tolerance** | 2/10 |
| **Signature Quote** | "We need to see the automation ROI materialize. The covenant requires 1.5x debt service coverage by Q3." |

#### 10. Dr. Nathan Cross - Industry Analyst
| Field | Value |
|-------|-------|
| **Full Name** | Dr. Nathan Cross |
| **Role** | Senior Manufacturing Analyst, Gartner |
| **Age** | 47 |
| **Background** | PhD Industrial Engineering, former consultant |
| **Stance** | Neutral observer |
| **Key Concerns** | Market perception, industry trends |
| **Communication Style** | Analytical, detached |
| **Influence** | 5/10 |
| **Hostility** | 1/10 |
| **Flexibility** | 7/10 |
| **Risk Tolerance** | 5/10 |
| **Signature Quote** | "The market sees Apex as behind the curve. You need proof points of successful transformation." |

#### 11. Mayor Angela Reyes
| Field | Value |
|-------|-------|
| **Full Name** | Angela Reyes |
| **Role** | Mayor |
| **Age** | 52 |
| **Background** | Former union attorney, two-term mayor |
| **Stance** | Community advocate |
| **Key Concerns** | Local employment, tax base |
| **Communication Style** | Political, diplomatic |
| **Influence** | 5/10 |
| **Hostility** | 4/10 |
| **Flexibility** | 5/10 |
| **Risk Tolerance** | 3/10 |
| **Signature Quote** | "Apex is the second-largest employer in this county. We're concerned about workforce impacts." |

#### 12. Thomas Richardson - Customer (AutoCorp)
| Field | Value |
|-------|-------|
| **Full Name** | Thomas Richardson |
| **Role** | VP Supply Chain, AutoCorp |
| **Age** | 49 |
| **Background** | 20 years in automotive OEM procurement |
| **Stance** | Business partner, demanding |
| **Key Concerns** | Service stability, quality, pricing |
| **Communication Style** | Direct, transactional |
| **Influence** | 7/10 |
| **Hostility** | 4/10 |
| **Flexibility** | 4/10 |
| **Risk Tolerance** | 3/10 |
| **Signature Quote** | "We want to work with Apex, but we need assurance your operations are stable." |

#### 13. Rachel Kim - Technology Vendor (RoboTech Solutions)
| Field | Value |
|-------|-------|
| **Full Name** | Rachel Kim |
| **Role** | Enterprise Sales Director, RoboTech Solutions |
| **Age** | 38 |
| **Background** | Industrial automation, MBA |
| **Stance** | Service provider, sales-oriented |
| **Key Concerns** | Implementation success, upselling |
| **Communication Style** | Enthusiastic, solutions-focused |
| **Influence** | 4/10 |
| **Hostility** | 1/10 |
| **Flexibility** | 7/10 |
| **Risk Tolerance** | 6/10 |
| **Signature Quote** | "We can train your team, but it requires commitment and investment upfront." |

#### 14. Dr. Helen Mercer - External Consultant
| Field | Value |
|-------|-------|
| **Full Name** | Dr. Helen Mercer |
| **Role** | Managing Director, Mercer Transformation Group |
| **Age** | 55 |
| **Background** | Harvard Business School faculty, change management expert |
| **Stance** | Advisor, best practices advocate |
| **Key Concerns** | Implementation methodology, success metrics |
| **Communication Style** | Academic, structured |
| **Influence** | 4/10 |
| **Hostility** | 1/10 |
| **Flexibility** | 6/10 |
| **Risk Tolerance** | 4/10 |
| **Signature Quote** | "Many companies are flattening hierarchies and using technology to reduce management layers." |

### Gen Z Representatives

#### 15. Jaylen Brooks - Gen Z Focus Group Leader
| Field | Value |
|-------|-------|
| **Full Name** | Jaylen Brooks |
| **Role** | Quality Technician, Gen Z Workforce Representative |
| **Age** | 26 |
| **Background** | Community college, 3 years at Apex |
| **Stance** | Skeptical of management, values-driven |
| **Key Concerns** | Work-life balance, career growth without management |
| **Communication Style** | Direct, unfiltered |
| **Influence** | 5/10 |
| **Hostility** | 5/10 |
| **Flexibility** | 6/10 |
| **Risk Tolerance** | 5/10 |
| **Signature Quote** | "We want careers, not boss jobs. Give us technical paths that pay like management." |

#### 16. Destiny Martinez - Gen Z Employee
| Field | Value |
|-------|-------|
| **Full Name** | Destiny Martinez |
| **Role** | Production Associate |
| **Age** | 24 |
| **Background** | High school diploma, 2 years at Apex |
| **Stance** | Anxious about automation, distrustful |
| **Key Concerns** | Job security, training opportunities |
| **Communication Style** | Quiet, observant |
| **Influence** | 2/10 |
| **Hostility** | 4/10 |
| **Flexibility** | 7/10 |
| **Risk Tolerance** | 3/10 |
| **Signature Quote** | "They say they'll train us, but I've heard that before at my last job." |

### Board/Investor Representatives

#### 17. William Thornton III - Board Member (Investor)
| Field | Value |
|-------|-------|
| **Full Name** | William Thornton III |
| **Role** | Board Member (Representing PE Fund) |
| **Age** | 58 |
| **Background** | Private equity, former manufacturing CEO |
| **Stance** | Financial returns focused |
| **Key Concerns** | Exit timeline, valuation multiples |
| **Communication Style** | Blunt, impatient |
| **Influence** | 9/10 |
| **Hostility** | 6/10 |
| **Flexibility** | 2/10 |
| **Risk Tolerance** | 8/10 |
| **Signature Quote** | "Just hire the talent we need. The existing workforce has the wrong skills anyway." |

---

## PART 3: THE SIMULATION STRUCTURE

### Simulation Duration
| Field | Value |
|-------|-------|
| Total Weeks | 8 |
| Pre-Game Phase | Week 0 (Research) |
| Active Simulation | Weeks 1-8 |

### Week-by-Week Arc

| Week | Title | Core Challenge | Key Question |
|------|-------|----------------|--------------|
| 0 | Pre-Game Research | Building knowledge foundation | N/A (reading phase) |
| 1 | The Automation Imperative | How to finance and communicate AI strategy | "How will you finance and communicate your automation strategy?" |
| 2 | The Talent Pipeline Crisis | Building technical and management pipelines | "How will you build your leadership and technical talent pipeline?" |
| 3 | Union Storm Brewing | Responding to organizing while transforming | "How will you respond to the unionization effort while maintaining your transformation agenda?" |
| 4 | The First Displacement | Handling the first wave of affected workers | "How will you handle the workers displaced by automation?" |
| 5 | The Manager Exodus | Addressing burnout and Gen Z reluctance | "How will you address the management crisis and adapt your organizational structure?" |
| 6 | Debt Day of Reckoning | Managing financial pressure vs. momentum | "How will you manage the financial pressure while maintaining transformation momentum?" |
| 7 | The Competitive Response | Responding to market perception challenges | "How will you respond to competitive pressure and restore market confidence?" |
| 8 | Strategic Direction | Setting 3-year vision and legacy | "What is your vision for Apex's future?" |

### Pre-Game Research Reports (6 Total)

| # | Title | Category | Reading Time |
|---|-------|----------|--------------|
| 1 | State of AI in Manufacturing 2025 | Industry Analysis | 8 minutes |
| 2 | Apex Manufacturing Company Profile | Company Analysis | 6 minutes |
| 3 | Workforce Transition Best Practices | Workforce Strategy | 7 minutes |
| 4 | AI Technology Landscape | Technology Assessment | 9 minutes |
| 5 | Competitive Analysis | Competition | 8 minutes |
| 6 | Case Study - Manufacturing Transformation | Case Study | 10 minutes |

### Competitor Companies (Mentioned in Content)

| Company | Approach | Outcome |
|---------|----------|---------|
| AutoTech Industries | Aggressive (took $20M debt, cut 30% workforce) | Union certified, 2 strikes, customer satisfaction dropped |
| PrecisionParts Co. | Balanced ($8M debt + $3M reskilling) | High morale, "Best Employer" award, winning contracts |
| FastParts | Failed (rapid automation, no workforce investment) | Quality issues, layoffs, acquisition target |

---

## PART 4: SCORING & EVALUATION

### Dual Score System

**Financial Score Formula:**
```
Financial Score = (Revenue × Automation ROI × (1 - Debt Burden)) / 1,000,000
```

**Cultural Score Formula:**
```
Cultural Score = (Morale + (100 - Union Sentiment) + Workforce Adaptability + Management Bench Strength) / 4
```

**Combined Score Formula:**
```
Combined Score = Financial Score × (Cultural Score / 100)
```

### Victory Conditions

| Outcome | Criteria |
|---------|----------|
| Optimal | Combined Score > 80, No unionization, Morale > 70 |
| Good | Combined Score > 60, Cultural Score > 50 |
| Struggling | Combined Score 40-60 or Cultural Score < 40 |
| Failed | Combined Score < 40 or Forced bankruptcy/acquisition |

### LLM Essay Evaluation Rubric (100 points total)

| Criterion | Points | Description |
|-----------|--------|-------------|
| Strategic Thinking | 0-25 | Quality of analysis and reasoning |
| Stakeholder Consideration | 0-25 | Awareness of diverse perspectives |
| Risk Assessment | 0-25 | Identification and mitigation of risks |
| Communication Quality | 0-25 | Clarity and professionalism |

---

## PART 5: PHONE-A-FRIEND ADVISORS (9 Total)

| # | Advisor Type | Specialization |
|---|--------------|----------------|
| 1 | Finance Advisor | ROI, debt, cash flow, investment decisions |
| 2 | HR Advisor | Workforce morale, retention, culture |
| 3 | Operations Advisor | Implementation, efficiency, logistics |
| 4 | Legal Advisor | Compliance, labor law, risk mitigation |
| 5 | Union Relations Advisor | Collective bargaining, organizing response |
| 6 | Technology Advisor | Automation options, implementation timelines |
| 7 | Marketing Advisor | Brand reputation, external communications |
| 8 | Strategy Advisor | Long-term planning, competitive positioning |
| 9 | Ethics Advisor | Moral considerations, stakeholder fairness |

**Usage:** Students have 3 lifetime uses per simulation.

---

## PART 6: KEY TERMINOLOGY

| Term | Definition | Usage Context |
|------|------------|---------------|
| Apex Manufacturing | The fictional company students lead | All content |
| Automation ROI | Return on investment from automation efforts | Financial metrics |
| Cultural Health | Composite of morale, adaptability, and bench strength | Scoring |
| Debt Service Coverage | Ratio measuring ability to service debt | Bank interactions |
| Intel Articles | Weekly news/research items for context | Content type |
| Phone-a-Friend | AI advisor system with limited uses | Game mechanic |
| Reskilling | Training displaced workers for new roles | Core theme |
| Union Sentiment | Likelihood of unionization (0-100) | Key metric |
| Voicemail Triggers | Character messages based on events | Notification system |

---

## PART 7: BRAND VOICE

### Tone Guidelines

| Context | Tone |
|---------|------|
| Briefings | Professional, urgent, documentary-style |
| Character Dialogue | Authentic to role (see character profiles) |
| Research Reports | Academic, data-driven, objective |
| Intel Articles | Journalistic, third-person, factual |
| Student-Facing UI | Clear, supportive, instructional |
| Marketing Materials | Authoritative, forward-thinking, sophisticated |

### Visual Identity

| Element | Specification |
|---------|---------------|
| Primary Color | Corporate Navy (#1e3a5f) |
| Accent Color | Growth Green (#22c55e) |
| Typography | IBM Plex Sans (headers), Inter (body), Roboto Mono (data) |
| Design Inspiration | Bloomberg Terminal - sophisticated, premium, data-rich |

---

## CHANGE LOG

| Date | Change | Author |
|------|--------|--------|
| January 2026 | Initial Story Bible creation | System |

---

## VALIDATION CHECKLIST

When creating new content, verify:

- [ ] Company name is exactly "Apex Manufacturing"
- [ ] Character names match this document exactly
- [ ] Week numbers are 1-8 (not 0-7 or 1-9)
- [ ] Financial figures match starting state
- [ ] Competitor names match (AutoTech, PrecisionParts, FastParts)
- [ ] Scoring formulas are accurately represented
- [ ] Character traits (influence, hostility, etc.) are consistent
- [ ] Research report titles match
- [ ] Advisor types match the 9 defined

**Run validation:** `npx tsx server/validate-content.ts`
