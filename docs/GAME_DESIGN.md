# The Future of Work: Game Design Document
## Complete Simulation Mechanics Reference

*This document provides a comprehensive breakdown of all simulation elements including game mechanics, variables, scenarios, and scoring systems.*

**Document Purpose:** For instructors, academic reviewers, and stakeholders who need to understand how the simulation works mechanically.

---

## Table of Contents
1. [Game Overview & Learning Objectives](#1-game-overview--learning-objectives)
2. [Company State Variables](#2-company-state-variables)
3. [Game Flow & Phases](#3-game-flow--phases)
4. [Pre-Game Research Content](#4-pre-game-research-content)
5. [Weekly Scenarios (Week 1-8)](#5-weekly-scenarios-week-1-8)
6. [Decision Framework](#6-decision-framework)
7. [Stakeholder Characters](#7-stakeholder-characters)
8. [Global Events System](#8-global-events-system)
9. [Scoring Mechanics](#9-scoring-mechanics)
10. [People Analytics Data](#10-people-analytics-data)
11. [Media Enhancement Opportunities](#11-media-enhancement-opportunities)
12. [Future Expansion Modules](#12-future-expansion-modules)
13. [Difficulty Framework](#13-difficulty-framework)

---

## 1. Game Overview & Learning Objectives

### Premise
Students take on the role of executive leadership at **Apex Manufacturing**, a mid-sized automotive parts supplier facing pressure to modernize. Over 8 weeks, they must navigate the challenges of AI/automation adoption while managing employee anxiety, union dynamics, financial constraints, and generational workforce differences.

### Core Tension
The simulation presents a fundamental tension between:
- **Financial Performance**: Automation delivers cost savings but requires debt financing and displaces workers
- **Cultural Health**: Employee morale, adaptability, and union stability determine long-term viability

### Learning Objectives
1. **Strategic Decision-Making Under Uncertainty**: Balancing short-term financial pressures against long-term workforce health
2. **Stakeholder Management**: Navigating conflicting interests (board, employees, unions, banks, community)
3. **Change Management**: Understanding how communication, timing, and investment affect organizational transitions
4. **Ethical Leadership**: Weighing efficiency gains against human costs of automation
5. **Financial Literacy**: Understanding debt financing, ROI calculations, and capital allocation
6. **Generational Workforce Dynamics**: Adapting leadership pipelines for Gen Z attitudes toward management

### Target Audience
Graduate students in business, organizational behavior, labor relations, technology management, or public policy programs.

---

## 2. Company State Variables

### Starting State: Apex Manufacturing

| Category | Variable | Starting Value | Description |
|----------|----------|----------------|-------------|
| **Financial** | Revenue | $125,000,000 | Annual revenue |
| | Cash | $15,000,000 | Available cash reserves |
| | Debt | $0 | Current debt load |
| | Debt Interest Rate | 6.5% | Interest on bank loans |
| | AI Budget | $2,000,000 | Allocated AI spending |
| | Reskilling Fund | $500,000 | Workforce transition budget |
| | Lobbying Budget | $100,000 | Government relations |
| **Workforce** | Employees | 2,400 | Total headcount |
| | Morale | 68/100 | Overall employee satisfaction |
| | Union Sentiment | 35/100 | Likelihood of unionization |
| | Unionized | false | Current union status |
| | Workforce Adaptability | 55/100 | Ability to learn new skills |
| | Reskilling Progress | 20/100 | Completed training programs |
| **Automation** | Automation Level | 12/100 | Current automation deployment |
| | Automation ROI | 0% | Return on automation investment |
| | Robotics Investment | $0 | Cumulative robotics spending |
| **Leadership** | Management Bench Strength | 45/100 | Pipeline health for managers |
| | Gen Z Workforce % | 28% | Workers born 1997-2012 |
| | Manager Vacancies | 8 | Unfilled management positions |

### Variable Interactions

**Key Dynamics:**
1. **Automation ↑ → Employees ↓ → Union Sentiment ↑**
2. **Reskilling Investment → Morale ↑ → Adaptability ↑**
3. **Debt ↑ → Interest Costs ↑ → Cash Flow Pressure**
4. **Union Sentiment > 75% → Unionization Vote Triggered**
5. **Gen Z refuses management → Manager Vacancies ↑ → Bench Strength ↓**

### Threshold Events
| Threshold | Trigger Event |
|-----------|---------------|
| Union Sentiment ≥ 75% | Mandatory union election |
| Morale ≤ 30% | Mass resignation event |
| Debt Service Coverage < 1.5x | Bank intervention |
| Manager Vacancies > 15 | Operations crisis |

---

## 3. Game Flow & Phases

### Phase 1: Pre-Game Research (Week 0)
**Duration**: Before simulation begins
**Requirement**: Review at least 50% of research materials

**Content Includes:**
- Industry AI adoption trends
- Company profile and financials
- Workforce transition best practices
- Technology landscape assessment
- Competitive analysis
- Case studies of transformation success/failure

### Phase 2: Weekly Simulation Loop (Weeks 1-8)

Each week follows this pattern:

```
1. SCENARIO PRESENTATION
   - Narrative describing current situation
   - Stakeholder pressures with urgency levels
   - Context articles from industry sources
   - Key question framing the week's challenge

2. DECISION MAKING
   - 2-3 major decisions with 3-4 options each
   - Each option shows impacts on all state variables
   - Teams discuss and submit choices with rationale

3. OUTCOME PROCESSING
   - Decisions applied to company state
   - Random events may occur
   - Metrics updated
   - Leaderboard recalculated

4. ANALYTICS REVIEW
   - People analytics dashboard updates
   - Sentiment by department
   - Trend analysis
   - Early warning indicators
```

### Weekly Theme Progression

| Week | Title | Core Challenge |
|------|-------|----------------|
| 1 | The Automation Imperative | How to finance and communicate AI strategy |
| 2 | The Talent Pipeline Crisis | Building technical and management pipelines |
| 3 | Union Storm Brewing | Responding to organizing while transforming |
| 4 | The First Displacement | Handling the first wave of affected workers |
| 5 | The Manager Exodus | Addressing burnout and Gen Z reluctance |
| 6 | Debt Day of Reckoning | Managing financial pressure vs. momentum |
| 7 | The Competitive Response | Responding to market perception challenges |
| 8 | Strategic Direction | Setting 3-year vision and legacy |

---

## 4. Pre-Game Research Content

### Research Report 1: State of AI in Manufacturing 2025
**Category**: Industry Analysis
**Reading Time**: 8 minutes

**Key Statistics:**
- 67% of Fortune 500 manufacturers have AI programs
- Only 23% achieve enterprise-wide success
- 78% cite workforce resistance as #1 barrier
- Companies investing 15%+ in reskilling see 40% higher adoption
- Debt-financed automation has higher failure rates without change management

---

### Research Report 2: Apex Manufacturing Company Profile
**Category**: Company Analysis
**Reading Time**: 6 minutes

**Key Statistics:**
- 2,400 employees with 7.2 year average tenure
- Revenue growth stagnated at 3% vs. 8% industry average
- 42% of employees concerned about AI job displacement
- 28% Gen Z workforce, 72% of whom refuse management roles *(per Korn Ferry/Deloitte 2024-2025)*
- 8 unfilled manager positions, 5 managers retiring in 3 years

---

### Research Report 3: Workforce Transition Best Practices
**Category**: Workforce Strategy
**Reading Time**: 7 minutes

**Key Statistics:**
- Early communication reduces workforce anxiety by 35%
- $10,000 reskilling investment per worker = 12% turnover reduction
- Union partnership can accelerate transformation vs. fighting it
- Job guarantee with reskilling achieves 80% internal redeployment

---

### Research Report 4: AI Technology Landscape
**Category**: Technology Assessment
**Reading Time**: 9 minutes

**Key Statistics:**
- Operations ML offers 20-30% cost reduction with moderate risk
- Industrial robotics costs have fallen 50% in 5 years
- AI-augmented management allows 50% larger team spans
- Aggressive automation timelines (12 months) only succeed 40% of the time
- Conservative timelines (36 months) succeed 85%

---

### Research Report 5: Competitive Analysis
**Category**: Competition
**Reading Time**: 8 minutes

**Competitor Profiles:**

**AutoTech Industries (Aggressive Approach)**
- Took $20M in debt
- Reduced workforce 30%, increased output 45%
- Result: Union certified, 2 strikes, customer satisfaction dropped 15 points

**PrecisionParts Co. (Balanced Approach)**
- $8M debt with $3M reskilling investment
- Maintained workforce, improved productivity 28%
- Result: High morale, 'Best Employer' award, winning contracts

**FastParts (Failed Approach)**
- Rapid automation without workforce investment
- Quality issues led to customer defections
- Result: Laying off 25% of workforce, potential acquisition target

---

### Research Report 6: Case Study - Manufacturing Transformation
**Category**: Case Study
**Reading Time**: 10 minutes

**Content**: Detailed narrative of a company that successfully navigated automation while maintaining workforce health, including:
- Timeline of decisions
- Communication strategies used
- Reskilling program structure
- Financial outcomes
- Lessons learned

---

## 5. Weekly Scenarios (Week 1-8)

### Week 1: The Automation Imperative

**Narrative:**
The board has delivered an ultimatum: Apex Manufacturing must modernize or face acquisition. Competitors have achieved 30% cost reductions through robotics and AI. Your CFO has secured preliminary approval for a $15M line of credit from First National Bank at 6.5% interest to fund automation investments.

However, the factory floor is buzzing with rumors. Workers have seen what happened at AutoTech Industries - 30% workforce reduction in 18 months. Your HR Director reports that informal union organizing discussions have begun in the Operations department.

**Stakeholder Pressures:**

| Source | Message | Urgency |
|--------|---------|---------|
| Board of Directors | "We need a 25% cost reduction within 2 years or we'll explore strategic alternatives." | CRITICAL |
| CFO | "The bank loan is ready. We can draw $15M at 6.5% interest, but we need a solid plan." | HIGH |
| Operations Manager | "My team is scared. If we don't address their concerns, we'll see productivity drop before we even start." | HIGH |
| Union Representative | "Workers are talking. How leadership handles this will determine whether we organize." | MEDIUM |

**Key Question:** "How will you finance and communicate your automation strategy?"

---

### Week 2: The Talent Pipeline Crisis

**Narrative:**
Your automation planning has revealed a deeper problem: Apex lacks the technical talent to implement and maintain advanced systems. Your current managers are stretched thin, and the Gen Z workers who could fill the pipeline have no interest in management roles.

Exit interviews from the past quarter show a troubling pattern - your best young talent is leaving for companies offering 'individual contributor' career tracks without management responsibilities. Meanwhile, 5 of your 12 middle managers are within 3 years of retirement.

**Stakeholder Pressures:**

| Source | Message | Urgency |
|--------|---------|---------|
| HR Director | "We're losing Gen Z talent to competitors. They don't want to be managers - they want technical career paths." | HIGH |
| Operations Manager | "Half my supervisors will retire in 3 years. We have no one ready to step up." | HIGH |
| Technology Vendor | "We can train your team, but it requires commitment and investment upfront." | MEDIUM |
| Board Member | "Just hire the talent we need. The existing workforce has the wrong skills anyway." | MEDIUM |

**Key Question:** "How will you build your leadership and technical talent pipeline?"

---

### Week 3: Union Storm Brewing

**Narrative:**
The union organizing effort has gained momentum. A vote is now scheduled for next month. Union representatives are framing the automation initiative as a 'job elimination program' and pointing to your bank loan as evidence of management prioritizing machines over people.

Your legal team advises that you can communicate with employees about the implications of unionization, but you cannot threaten or promise benefits to influence the vote. Your HR Director believes a comprehensive reskilling commitment might defuse the situation.

Meanwhile, the first automation equipment has arrived and is sitting on the loading dock. Workers are photographing it and sharing images on social media with captions like 'Our replacements have arrived.'

**Stakeholder Pressures:**

| Source | Message | Urgency |
|--------|---------|---------|
| Union Organizer | "Workers have a right to collective bargaining. Management has shown they care more about robots than people." | CRITICAL |
| General Counsel | "We need to be very careful here. Any missteps could be unfair labor practice charges." | HIGH |
| HR Director | "A genuine reskilling commitment - not just words - could change the narrative." | HIGH |
| CFO | "If we unionize, our labor costs will increase 15-20%. The automation ROI projections won't work." | HIGH |

**Key Question:** "How will you respond to the unionization effort while maintaining your transformation agenda?"

---

### Week 4: The First Displacement

**Narrative:**
Phase 1 automation is ready to go live in the Operations department. The system will eliminate 45 positions - about 8% of your total workforce. You must decide what happens to these workers.

Your reskilling program has identified that 30 of the 45 affected workers could transition to new roles operating and maintaining the automated systems - but this requires 3 months of training during which they would be paid but not productive. The remaining 15 workers lack the aptitude for technical roles.

Industry benchmarks suggest severance of 2 weeks per year of service is standard, but some competitors have offered enhanced packages to maintain community reputation.

**Stakeholder Pressures:**

| Source | Message | Urgency |
|--------|---------|---------|
| Operations Manager | "We can't delay the automation anymore. Every week we wait costs us $200K in competitive disadvantage." | CRITICAL |
| HR Director | "How we handle these 45 workers will define our employer brand for a decade." | HIGH |
| CFO | "The bank is watching. They want to see ROI from their loan, not just training expenses." | HIGH |
| Mayor's Office | "Apex is the second-largest employer in this county. We're concerned about workforce impacts." | MEDIUM |

**Key Question:** "How will you handle the workers displaced by automation?"

---

### Week 5: The Manager Exodus

**Narrative:**
Three of your middle managers have resigned this week, citing 'burnout' and 'change fatigue.' They're not going to competitors - they're leaving manufacturing entirely. This leaves critical gaps in Production Planning, Quality Control, and Maintenance.

Your Gen Z workers refuse the promotion opportunities. In focus groups, they cite 'unrealistic expectations,' 'always-on culture,' and 'emotional labor with no upside.' They prefer the new technical specialist track you created, which pays well but has no direct reports.

The remaining managers are working 60+ hour weeks. Two have requested medical leave for stress-related conditions. Your COO is asking if AI could augment management capacity.

**Stakeholder Pressures:**

| Source | Message | Urgency |
|--------|---------|---------|
| HR Director | "Our remaining managers are burning out. If we lose more, operations will collapse." | CRITICAL |
| COO | "We need to fundamentally rethink the management model. AI-augmented management could be the answer." | HIGH |
| Gen Z Focus Group | "We want careers, not boss jobs. Give us technical paths that pay like management." | HIGH |
| External Consultant | "Many companies are flattening hierarchies and using technology to reduce management layers." | MEDIUM |

**Key Question:** "How will you address the management crisis and adapt your organizational structure?"

---

### Week 6: Debt Day of Reckoning

**Narrative:**
The quarterly board meeting is approaching, and the numbers tell a mixed story. Automation has delivered 15% of projected cost savings - but implementation delays and worker transition costs have eaten into the ROI. You're now carrying $12M in debt with $650K in quarterly interest payments.

The bank has requested a meeting to review the loan covenant terms. While you're not yet in violation, they're 'concerned about trajectory.' If the automation doesn't deliver results in the next two quarters, you may face a capital call or restructuring.

Meanwhile, morale has stabilized after the rocky start. The reskilling program is showing results, and the union situation has clarified. But the financial pressure is mounting.

**Stakeholder Pressures:**

| Source | Message | Urgency |
|--------|---------|---------|
| Bank Representative | "We need to see the automation ROI materialize. The covenant requires 1.5x debt service coverage by Q3." | CRITICAL |
| CFO | "We have options: accelerate automation to capture more savings, or slow down to reduce burn rate." | HIGH |
| Board Chair | "The shareholders are getting nervous. We need a credible path to profitability improvement." | HIGH |
| COO | "The team is finally getting the hang of the new systems. Momentum is building." | MEDIUM |

**Key Question:** "How will you manage the financial pressure while maintaining transformation momentum?"

---

### Week 7: The Competitive Response

**Narrative:**
Your largest competitor, PrecisionParts, has announced a major customer win - a contract you were favored to get. Their pitch emphasized 'automation-enabled quality' and 'flexible workforce capabilities.' The customer specifically cited concerns about labor instability at Apex.

The market is taking notice. Industry analysts have downgraded Apex's outlook, citing 'execution risk' and 'unclear cultural health.' Your sales pipeline has softened 15% as prospects adopt a wait-and-see approach.

However, there's opportunity in crisis. A smaller competitor, FastParts, is struggling with their own automation initiative and has laid off 25% of their workforce. Their customers are looking for alternatives, and their displaced workers - many of them skilled - are available for hire.

**Stakeholder Pressures:**

| Source | Message | Urgency |
|--------|---------|---------|
| Sales VP | "We're losing deals because of our reputation. We need a bold move to show we've figured this out." | CRITICAL |
| Industry Analyst | "The market sees Apex as behind the curve. You need proof points of successful transformation." | HIGH |
| Customer | "We want to work with Apex, but we need assurance your operations are stable." | HIGH |
| Recruiting | "FastParts laid off excellent talent. We could hire 20 skilled workers at below-market rates." | MEDIUM |

**Key Question:** "How will you respond to competitive pressure and restore market confidence?"

---

### Week 8: Strategic Direction

**Narrative:**
The simulation concludes with a pivotal strategic decision. The past 7 weeks have tested your ability to balance competing demands. Now the board wants a 3-year plan. The bank wants refinancing terms. Employees want clarity about the future.

Your decisions will determine Apex's legacy: a cautionary tale of transformation gone wrong, a model of balanced adaptation, or a bold bet on aggressive automation. Each path has its advocates and its risks.

**Stakeholder Pressures:**

| Source | Message | Urgency |
|--------|---------|---------|
| Board Chair | "We've learned a lot. Now we need to codify that into a sustainable strategy." | HIGH |
| CFO | "Our debt structure needs to match our operational reality. Let's refinance smartly." | HIGH |
| Employee Council | "We've been through a lot. What does the next chapter look like for us?" | HIGH |

**Key Question:** "What is your vision for Apex's future?"

---

## 6. Decision Framework

### Decision Categories

| Category | Focus Area | Typical Trade-offs |
|----------|------------|-------------------|
| automation_financing | Debt, cash flow, ROI | Speed vs. risk, cost vs. capability |
| workforce_displacement | Layoffs, severance, reskilling | Short-term costs vs. long-term reputation |
| union_relations | Organizing, bargaining, communication | Flexibility vs. worker power |
| reskilling | Training investment, skill development | Investment vs. production time |
| management_pipeline | Leadership development, org structure | Hierarchy vs. flat organization |
| organizational_change | Culture, communication, processes | Speed of change vs. stability |
| strategic_investment | Major capital allocation, M&A | Growth vs. consolidation |

### Sample Decisions by Week

**Week 1 - Automation Financing:**
1. **Conservative Ramp**: Take $8M debt, invest $1.5M in communication/reskilling
2. **Aggressive Transformation**: Take full $15M, deploy across 3 departments
3. **Cash-Funded Pilot**: Use existing cash for small pilot, no debt

**Week 3 - Union Response:**
1. **Union Partnership**: Negotiate neutrality agreement, partner on transition
2. **Communication Campaign**: Town halls, transparency, but no formal agreement
3. **Wait and See**: Minimal response, focus on automation

**Week 4 - Displacement Handling:**
1. **Premium Treatment**: Enhanced severance, outplacement, community fund
2. **Standard Transition**: Industry-standard severance, optional reskilling
3. **Minimal Package**: Legal minimum, immediate separation

**Week 8 - Strategic Direction:**
1. **Aggressive Growth**: 50% revenue target, continued automation, accept disruption
2. **Balanced Sustainability**: 25% growth, strong workforce development
3. **Human-Centered Excellence**: Position as employer of choice, limit automation

---

## 7. Stakeholder Characters

### Internal Stakeholders

| Role | Stance | Key Concerns | Quote Style |
|------|--------|--------------|-------------|
| Board Chair | Strategic, impatient | Shareholder value, competitive position | Formal, demanding |
| CFO | Analytical, cautious | ROI, debt covenants, cash flow | Numbers-focused |
| COO | Pragmatic, solutions-oriented | Efficiency, implementation | Practical |
| HR Director | Employee advocate | Morale, retention, culture | Empathetic |
| Operations Manager | Caught in middle | Team morale, production targets | Stressed, honest |
| Sales VP | Customer-focused | Pipeline, reputation | Urgent |
| General Counsel | Risk-averse | Compliance, liability | Cautious |

### External Stakeholders

| Role | Stance | Key Concerns | Quote Style |
|------|--------|--------------|-------------|
| Union Organizer | Adversarial to management | Worker rights, job security | Confrontational |
| Bank Representative | Creditor | Loan covenants, risk | Formal, threatening |
| Industry Analyst | Neutral observer | Market perception | Analytical |
| Mayor's Office | Community advocate | Local employment | Political |
| Customer | Business partner | Service stability | Demanding |
| Technology Vendor | Service provider | Implementation success | Sales-oriented |
| External Consultant | Advisor | Best practices | Academic |

### Gen Z Focus Group
Represents the voice of younger workers:
- Refuses traditional management roles
- Values work-life balance
- Prefers technical career paths
- Distrusts corporate messaging
- Quote style: Direct, values-driven

### Character-Driven Impact System
Each stakeholder has quantifiable traits (influence, hostility, flexibility, risk tolerance on 1-10 scale) that mechanically affect simulation outcomes:
- **Decision Difficulty Modifiers**: High-hostility + high-influence characters make related decisions harder
- **Essay Grading Context**: Top influential stakeholders' perspectives are injected into LLM grading prompts
- **Phone-a-Friend Warnings**: Advisor AI responses include warnings about resistant stakeholders
- **Voicemail Triggers**: Character hostility/influence affect trigger probability

---

## 8. Global Events System

Random events that can occur each week, simulating external factors beyond player control.

### Event Types

| Event | Description | Impacts |
|-------|-------------|---------|
| **Tariff Increase (50%)** | US tariffs on imports rise to 50%, increasing costs for raw materials | Revenue -15%, Morale -10 |
| **Reciprocal Tariff on US** | China imposes reciprocal tariffs on US exports | Revenue -20%, Morale -5 |
| **Geopolitical Tension** | Escalating conflicts disrupt global supply chains | Revenue -10%, Employees -10, Morale -15 |
| **Labor Strike** | Union workers strike over AI-related job concerns | Revenue -5%, Morale -20 |
| **Tech Breakthrough** | New ML tools for manufacturing reduce costs industry-wide | Revenue +15%, Morale +10 |
| **Economic Boom** | US economy surges, boosting demand for auto parts | Revenue +10%, Employees +20 |
| **Supply Chain Shortage** | Chip shortages delay production | Revenue -12%, Morale -8 |
| **Regulatory Change** | New incentives for AI adoption in manufacturing | Revenue +8%, Morale +5 |

### Event Probability
- 30% chance of event per week
- Events selected randomly from pool
- Some events may be triggered by company state (e.g., high union sentiment triggers strike)

---

## 9. Scoring Mechanics

### Dual Score System

Teams are evaluated on two independent dimensions:

**Financial Score** = (Revenue × Automation ROI × (1 - Debt Burden)) / 1,000,000

Where:
- Revenue = Current annual revenue
- Automation ROI = Return on automation investment (0-100%)
- Debt Burden = Debt / Revenue (capped at 0.5)

**Cultural Score** = (Morale + (100 - Union Sentiment) + Workforce Adaptability + Management Bench Strength) / 4

Where each component is 0-100.

**Combined Score** = Financial Score × (Cultural Score / 100)

### Leaderboard Ranking

Teams ranked by Combined Score with:
- Current rank
- Previous rank (for movement indicators)
- Financial Score breakdown
- Cultural Score breakdown
- Current week progress

### Victory Conditions

| Outcome | Criteria |
|---------|----------|
| **Optimal** | Combined Score > 80, No unionization, Morale > 70 |
| **Good** | Combined Score > 60, Cultural Score > 50 |
| **Struggling** | Combined Score 40-60 or Cultural Score < 40 |
| **Failed** | Combined Score < 40 or Forced bankruptcy/acquisition |

### LLM-Powered Essay Evaluation

Student rationales are evaluated using a 4-criteria rubric:
1. **Strategic Thinking** (0-25 points): Quality of analysis and reasoning
2. **Stakeholder Consideration** (0-25 points): Awareness of diverse perspectives
3. **Risk Assessment** (0-25 points): Identification and mitigation of risks
4. **Communication Quality** (0-25 points): Clarity and professionalism

---

## 10. People Analytics Data

### Sentiment by Department

| Department | Headcount | Avg Tenure | Avg Age | AI Exposure Risk | Reskilling Potential |
|------------|-----------|------------|---------|------------------|---------------------|
| Operations | 1,200 | 9.5 yrs | 44 | 75% | 60% |
| Sales | 250 | 5.2 yrs | 35 | 40% | 85% |
| Customer Service | 180 | 4.8 yrs | 32 | 70% | 75% |
| R&D | 320 | 6.5 yrs | 38 | 25% | 90% |
| Administration | 280 | 8.2 yrs | 42 | 55% | 65% |
| Quality Assurance | 170 | 7.8 yrs | 40 | 45% | 70% |

### Skill Distribution

| Skill | % of Workforce | Demand Trend |
|-------|----------------|--------------|
| Manufacturing Operations | 42% | Declining |
| Technical Engineering | 18% | Growing |
| Customer Relations | 12% | Stable |
| Data Analytics | 6% | Growing |
| Project Management | 10% | Growing |
| Administrative | 8% | Declining |
| Robotics/Automation | 4% | Growing |

### Tenure Distribution

| Range | Count |
|-------|-------|
| 0-2 years | 420 |
| 2-5 years | 580 |
| 5-10 years | 650 |
| 10-15 years | 450 |
| 15+ years | 300 |

### Key Issues Tracking
The system tracks emerging issues such as:
- Job security anxiety (affected employee count)
- Change fatigue (priority level)
- Management burnout (severity)
- Skill gaps (departments affected)
- Union organizing activity (momentum)

---

## 11. Media Enhancement Opportunities

This section outlines where AI-generated video, audio, and images enhance the simulation experience.

### Video Content

#### Weekly Briefing Videos (8 videos, 2-3 min each)
**Purpose**: Set the scene for each week's challenge
**Style**: Documentary/news report hybrid
**Content**:
- Week 1: Factory floor footage, automation equipment arriving, workers looking concerned
- Week 2: Gen Z workers in focus group, empty manager offices, retirement announcements
- Week 3: Union organizers distributing flyers, town hall meeting, social media posts
- Week 4: First layoffs, training sessions, emotional farewells
- Week 5: Stressed managers, vacant desks, algorithm interface screens
- Week 6: Bank meeting, board room tension, financial charts
- Week 7: Competitor celebration, customer meetings, news coverage
- Week 8: Strategic planning session, vision presentation, employee town hall

### Audio Content

#### Stakeholder Voicemails
**Purpose**: Deliver stakeholder pressures with emotional impact
**System**: Triggered voicemail notifications based on 6 event types:
- time_window (deadline approaching)
- decision_made (reaction to player choice)
- content_viewed (after reading materials)
- week_started (new week introduction)
- score_threshold (performance triggers)
- random (atmospheric pressure)

#### Phone-a-Friend Advisor System
9 specialized advisors provide AI-generated contextual guidance:
- Finance Advisor
- HR Advisor
- Operations Advisor
- Legal Advisor
- Union Relations Advisor
- Technology Advisor
- Marketing Advisor
- Strategy Advisor
- Ethics Advisor

Students have 3 lifetime uses per simulation.

### Visual Content

#### Character Portraits
AI-generated professional headshots for all 17+ stakeholder characters using OpenAI gpt-image-1 model.

#### Scenario Illustrations
Header images for each week depicting the central tension.

#### Data Visualization
Bloomberg Terminal-inspired dashboards with animated metrics.

---

## 12. Future Expansion Modules

The Future of Work Academy platform is designed for multi-scenario deployment. The core simulation engine, scoring mechanics, and pedagogical framework remain constant while scenarios, stakeholders, and industry contexts vary.

### Planned Expansion Modules

#### Healthcare AI Transformation
**Setting**: Regional Health System (3,500 employees)
**Core Tension**: Clinical efficiency vs. patient care quality; nurse shortages vs. automation

**Industry Context:**
- 500,000+ nursing positions unfilled nationally
- AI diagnostics achieving specialist-level accuracy
- Telehealth adoption accelerated post-pandemic
- Burnout and moral injury at crisis levels

**Unique Variables:**
- Patient outcomes score
- Staff-to-patient ratios
- Telehealth adoption rate
- Clinical quality metrics
- Credentialing/licensing constraints

**Stakeholder Adaptations:**
- Chief Medical Officer (quality advocate)
- Nursing Union Representative (patient safety + job protection)
- Hospital Board (financial sustainability)
- State Health Department (regulatory oversight)
- Patient Advocacy Groups (community voice)

---

#### Retail & Logistics Automation
**Setting**: Regional Distribution Network (2,800 employees)
**Core Tension**: Warehouse automation vs. gig economy workforce; same-day delivery pressures

**Industry Context:**
- E-commerce driving 40% YoY fulfillment demand
- Warehouse robotics reducing labor needs 60%
- Gig worker classification legal battles
- Last-mile delivery innovation

**Unique Variables:**
- Fulfillment speed
- Gig worker satisfaction
- Inventory accuracy
- Customer delivery ratings
- Worker classification risk

**Stakeholder Adaptations:**
- Distribution Center Manager
- Gig Driver Representative
- E-commerce Platform Partner
- Labor Board Investigator
- Community Delivery Association

---

#### Financial Services Digital Transformation
**Setting**: Regional Bank (1,800 employees)
**Core Tension**: Branch closures vs. community presence; algorithmic lending vs. relationship banking

**Industry Context:**
- Branch traffic down 40% since 2019
- AI underwriting outperforming human loan officers
- Fintech competitors capturing younger demographics
- Regulatory scrutiny on algorithmic bias

**Unique Variables:**
- Digital adoption rate
- Loan approval accuracy
- Compliance risk score
- Customer satisfaction (by age cohort)
- Community Reinvestment Act metrics

**Stakeholder Adaptations:**
- Chief Risk Officer (compliance focus)
- Branch Manager Network (community relationships)
- Fintech Competitor (disruptive threat)
- CFPB Representative (regulatory oversight)
- Community Development Officer

---

#### Public Sector Digital Government
**Setting**: State Agency (2,200 employees)
**Core Tension**: Service delivery efficiency vs. public sector employment; citizen privacy vs. data-driven governance

**Industry Context:**
- 30% of government workforce retirement-eligible within 5 years
- AI-driven citizen services reducing wait times 70%
- Public trust in government at historic lows
- Cybersecurity threats escalating

**Unique Variables:**
- Citizen satisfaction score
- Service delivery time
- Public trust index
- Cybersecurity posture
- Union grievance rate

**Stakeholder Adaptations:**
- Agency Director (political appointee)
- Civil Service Union Representative
- State Legislature Budget Committee
- Citizen Advocacy Group
- Cybersecurity Auditor

---

### Regional Focus: Midwest Manufacturing Initiative

**Special Module: Iowa/Midwest Manufacturing Workforce**

This module addresses the specific challenges facing Midwest manufacturing communities:

**Regional Context:**
- Iowa manufacturing employs 220,000+ workers
- Rural communities disproportionately affected by automation
- Strong community college and workforce development infrastructure
- Access to Iowa CIRAS (Center for Industrial Research and Service) resources

**Grant Alignment:**
Designed to support applications for:
- Iowa Economic Development Authority workforce grants
- USDA Rural Development programs
- National Science Foundation workforce training grants
- Department of Labor apprenticeship programs

**Unique Elements:**
- Rural vs. urban workforce dynamics
- Community college partnership scenarios
- Multi-generational family employment considerations
- Agricultural-industrial crossover opportunities

**Partner Opportunities:**
- Iowa State University CIRAS
- Iowa Workforce Development
- Community colleges (DMACC, Kirkwood, etc.)
- Regional manufacturing associations

---

### Module Development Framework

Each expansion module follows this development template:

| Component | Flagship Module | Adaptation Required |
|-----------|-----------------|---------------------|
| Company State Variables | Apex Manufacturing | Industry-specific equivalents |
| Weekly Scenarios | 8 manufacturing challenges | Industry-specific narratives |
| Stakeholder Characters | 17 manufacturing roles | Industry-specific personas |
| Research Reports | 6 manufacturing studies | Industry-specific research |
| Scoring Mechanics | Financial + Cultural | Industry-appropriate metrics |
| Global Events | Tariffs, strikes, recalls | Industry-relevant disruptions |

**Development Timeline per Module:**
- Research & Design: 4 weeks
- Content Writing: 6 weeks
- Stakeholder Development: 3 weeks
- Testing & Iteration: 3 weeks
- **Total: 16 weeks per module**

---

## 13. Difficulty Framework

This section documents the simulation's difficulty profile and provides a framework for understanding complexity factors that affect student experience.

### Current Difficulty Profile: Advanced (Graduate/MBA Level)

The default simulation configuration is calibrated for graduate business students with some professional experience. The following table quantifies each difficulty factor:

| Difficulty Factor | Current Setting | Impact Description |
|-------------------|-----------------|-------------------|
| **Simulation Duration** | 8 weeks | Longer duration = more cumulative decisions, compound effects |
| **Pre-Game Reading Load** | ~50 minutes (6 reports) | Higher load = more preparation required |
| **Weekly Decision Complexity** | 3-4 decisions/week | More decisions = greater cognitive demand |
| **Stakeholder Count** | 17+ characters | More stakeholders = complex relationship dynamics |
| **Essay Rubric Criteria** | 4 criteria (100 points) | More criteria = nuanced evaluation, harder to optimize |
| **Phone-a-Friend Uses** | 3 lifetime | Fewer uses = must be strategic about seeking help |
| **Global Event Probability** | 30% per week | Higher probability = more uncertainty/chaos |
| **Victory Threshold** | >80 combined score | Higher threshold = less margin for error |
| **Failure Threshold** | <40 combined score | Higher failure bar = more forgiving |
| **Union Trigger** | 75% sentiment | Lower threshold = easier to accidentally trigger |
| **Morale Crisis Trigger** | ≤30% morale | Higher threshold = easier to accidentally trigger |

### Difficulty Factor Definitions

#### 1. Simulation Duration (Weeks)
- **Introductory**: 4 weeks (compressed decisions, faster feedback)
- **Standard**: 6 weeks (balanced pacing)
- **Advanced**: 8 weeks (full semester, compound effects)

#### 2. Pre-Game Reading Load
- **Introductory**: ~20 minutes (3 essential reports)
- **Standard**: ~35 minutes (5 reports)
- **Advanced**: ~50 minutes (6 reports + optional Intel articles)

#### 3. Weekly Decision Complexity
- **Introductory**: 2 decisions/week (clear trade-offs)
- **Standard**: 3 decisions/week (moderate complexity)
- **Advanced**: 3-4 decisions/week (interconnected choices)

#### 4. Stakeholder Count
- **Introductory**: 8-10 stakeholders (core roles only)
- **Standard**: 12-14 stakeholders (moderate relationship web)
- **Advanced**: 17+ stakeholders (full ecosystem with nuanced dynamics)

#### 5. Essay Rubric Configuration
- **Introductory**: 2 criteria (50 points each, forgiving evaluation)
- **Standard**: 3 criteria (33 points each, balanced)
- **Advanced**: 4 criteria (25 points each, nuanced multi-dimensional evaluation)

#### 6. Phone-a-Friend Advisor Uses
- **Introductory**: 5 lifetime uses (ample guidance)
- **Standard**: 4 lifetime uses (moderate scaffolding)
- **Advanced**: 3 lifetime uses (strategic resource management)

#### 7. Global Event Probability
- **Introductory**: 15% per week (stable environment)
- **Standard**: 25% per week (occasional disruption)
- **Advanced**: 30% per week (high volatility, realistic uncertainty)

#### 8. Scoring Thresholds
| Level | Optimal | Good | Struggling | Failed |
|-------|---------|------|------------|--------|
| **Introductory** | >65 | >50 | 35-50 | <35 |
| **Standard** | >75 | >55 | 40-55 | <40 |
| **Advanced** | >80 | >60 | 40-60 | <40 |

#### 9. Crisis Trigger Sensitivity
| Level | Union Trigger | Morale Crisis | Manager Vacancy Crisis |
|-------|---------------|---------------|------------------------|
| **Introductory** | ≥85% | ≤20% | >20 vacancies |
| **Standard** | ≥80% | ≤25% | >18 vacancies |
| **Advanced** | ≥75% | ≤30% | >15 vacancies |

### Difficulty Presets by Audience

| Audience | Preset | Typical Use Case |
|----------|--------|------------------|
| **Undergraduate Business** | Introductory | First exposure to simulation-based learning |
| **MBA/Graduate** | Advanced | Full complexity for experienced professionals |
| **Executive Education** | Standard or Advanced | Adjustable based on program intensity |
| **Corporate Training** | Standard | Time-constrained but meaningful engagement |
| **Academic Research** | Any | Controlled comparison studies |

### Character-Driven Difficulty Modifiers

Beyond baseline difficulty settings, individual stakeholder characteristics create dynamic difficulty:

**Hostility + Influence Compound Effect:**
```
Decision Difficulty Modifier = 0.5 + (hostility × influence / 50)
Range: 0.5x (easy) to 2.0x (very hard)
```

**Example Calculations:**
- Low-hostility, low-influence stakeholder (3, 3): 0.5 + (0.18) = 0.68x (easier)
- High-hostility, high-influence stakeholder (8, 9): 0.5 + (1.44) = 1.94x (much harder)

This means instructors can further tune difficulty by adjusting stakeholder trait profiles in the Character Editor.

### LLM Grading Strictness by Difficulty

The essay evaluation rubric adapts based on difficulty level:

| Difficulty | Evaluation Style | Score Distribution Target |
|------------|------------------|---------------------------|
| **Introductory** | Encouraging, highlights effort | 70-85 average scores |
| **Standard** | Balanced, constructive | 60-75 average scores |
| **Advanced** | Rigorous, professional standards | 50-70 average scores |

Stakeholder context injection (top 5 influential stakeholders' perspectives) remains active at all difficulty levels but evaluation strictness scales accordingly.

### Intel Engagement Bonus by Difficulty

| Difficulty | Base Research Multiplier | Max Bonus | Per-Article Bonus |
|------------|--------------------------|-----------|-------------------|
| **Introductory** | 1.0x | 1.3x | +0.10x |
| **Standard** | 1.0x | 1.4x | +0.12x |
| **Advanced** | 1.0x | 1.5x | +0.15x |

### Future: Difficulty Configuration UI

The platform roadmap includes an instructor-facing Difficulty Configuration interface allowing:
- Selection of preset difficulty levels (Introductory/Standard/Advanced)
- Custom factor adjustment with live preview of difficulty rating
- Per-simulation difficulty visibility on student dashboard
- Cross-simulation difficulty normalization for leaderboards

---

## Appendix: Variable Reference

### Financial Variables
- `revenue`: Annual revenue in dollars
- `cash`: Available cash reserves
- `debt`: Total outstanding debt
- `debtInterestRate`: Interest rate (e.g., 0.065 = 6.5%)
- `aiBudget`: Allocated AI/automation budget
- `reskillingFund`: Workforce transition budget
- `lobbyingBudget`: Government relations budget

### Workforce Variables
- `employees`: Total headcount
- `morale`: 0-100, employee satisfaction
- `unionSentiment`: 0-100, likelihood of organizing
- `unionized`: Whether company is unionized
- `workforceAdaptability`: 0-100, ability to learn/change
- `reskillingProgress`: 0-100, training completion

### Automation Variables
- `automationLevel`: 0-100, deployment extent
- `automationROI`: Return on investment percentage
- `roboticsInvestment`: Cumulative investment in robotics

### Leadership Variables
- `managementBenchStrength`: 0-100, pipeline health
- `genZWorkforcePercentage`: Percentage of Gen Z workers
- `managerVacancies`: Unfilled management positions

---

*Document Version: 2.2*
*Last Updated: January 2026*
*Purpose: Complete Game Mechanics Reference for Instructors and Academic Reviewers*
*Changes in 2.2: Added Difficulty Framework section with quantified current difficulty profile (Advanced/Graduate level) and 3-tier preset system (Introductory/Standard/Advanced)*
*Changes in 2.1: Added Future Expansion Modules section (Healthcare, Retail, Finance, Public Sector, Iowa Manufacturing)*
