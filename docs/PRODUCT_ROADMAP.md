# Future Work Academy - Product Roadmap

**Version:** 1.2  
**Last Updated:** January 2026

---

## Vision Statement

Future Work Academy will become the leading platform for AI-powered business simulations in higher education, preparing the next generation of leaders for technology-driven decision-making through immersive, transparent, and scalable experiential learning.

---

## Current Capabilities (v1.2) - January 2026

### Core Simulation Engine
- 8-week immersive business simulation with weekly decision cycles
- "The Future of Work" flagship module (AI adoption at Apex Manufacturing)
- Dual scoring system: Financial Performance + Cultural Health
- Resource allocation across AI deployment, reskilling, lobbying, and union relations
- Global events that impact all teams each week

### LLM-Powered Evaluation
- GPT-4o-mini integration for essay grading
- Transparent 4-criteria rubric (Evidence, Reasoning, Trade-offs, Stakeholders)
- 25 points per criterion, 100 points total per essay
- Detailed feedback with strengths and areas for improvement
- Anonymized top responses for peer learning

### User Experience
- Bloomberg Terminal-inspired professional interface
- Real-time dashboard with metrics and rankings
- Weekly intelligence briefings with curated content
- Team-based competition with live leaderboards
- Mobile-responsive design

### Multi-Tenant Architecture
- Three-tier role system: Super Admin → Class Admin → Student
- Organization-based isolation with unique team codes
- Configurable simulation settings per organization
- CSV bulk import for up to 500 students

### Instructor Tools
- Sandbox Mode: Test complete student experience
- Jump to any week (1-8) in sandbox
- Submit decisions and receive AI feedback
- Reset sandbox data without affecting real students
- Activity logging with CSV/JSON export
- Scheduled email reminders

### Notifications
- SMS alerts via Twilio for enrollment notifications
- Email automation via SendGrid
- Configurable notification preferences

### Character Profiles & Immersive Storytelling
- 17 predefined stakeholder roles (CEO, CFO, Union Leader, HR Director, etc.)
- AI-generated professional headshots using OpenAI image generation
- Rich character bios with personality traits, motivations, fears, and communication styles
- Character relationship mapping for authentic organizational dynamics
- Module-specific or global character assignments
- Admin character profile editor for full CRUD management

### Triggered Voicemail System
- Context-sensitive audio notifications from simulation characters
- 6 trigger types: time_window, decision_made, content_viewed, week_started, score_threshold, random
- Character-specific voicemails with customizable urgency levels (low, medium, high, critical)
- Audio file management with transcript support
- Cooldown periods to prevent notification fatigue

### Phone-a-Friend Advisor System
- 9 specialized advisor categories: Finance, HR, Operations, Legal, Union Relations, Technology, Marketing, Strategy, Ethics
- 3-use lifetime limit per student per simulation (creates strategic decision-making)
- AI-generated contextual advice using GPT-4o-mini
- Advisor availability tracking with cooldown periods
- Rich advisor personas with expertise areas and communication styles

### Multimedia Content Support
- Video and audio content embedding in weekly briefings
- Full transcript support for accessibility
- Dynamic reading/viewing time estimates based on content type
- Media engagement tracking (started, completed, resume position)
- Intel classification for multimedia content (bonus multiplier eligibility)
- AI-powered content consistency review

### Platform Administration
- Super Admin dashboard for global settings
- Configurable enrollment requirements (.edu verification)
- Competition modes and scoring weight adjustments
- Simulation lifecycle management (draft, active, completed)

---

## Near-Term Roadmap (Q2-Q3 2026)

### Custom Content Authoring *(Partnership Priority)*
**Status:** Seeking University Partners

**Planned Features:**
- Instructor-facing content editor for briefings
- Decision prompt customization within framework
- Template library for common business challenges
- Scenario cloning and modification tools
- Preview and testing workflow

**Partnership Model:**
- Co-develop with 2-3 pilot institutions
- Iterate based on instructor feedback
- Share learnings across partner network

**Target Completion:** Q3 2026

---

### Additional Simulation Modules

**Module 2: Supply Chain Resilience**
- Theme: Global supply chain disruption and recovery
- Focus: Supplier diversification, logistics optimization, risk management
- Duration: 6-8 weeks configurable
- Target: Operations and Supply Chain courses

**Module 3: Sustainability & ESG**
- Theme: Environmental, Social, and Governance transformation
- Focus: Carbon reduction, stakeholder capitalism, ESG reporting
- Duration: 6-8 weeks configurable
- Target: Sustainability and CSR courses

**Module 4: Crisis Management**
- Theme: Corporate crisis response and communications
- Focus: Stakeholder communication, reputation management, rapid decision-making
- Duration: 4-6 weeks (compressed format)
- Target: Communications and PR courses

**Module 5: Digital Transformation**
- Theme: Legacy business digital transformation
- Focus: Technology adoption, change resistance, digital strategy
- Duration: 6-8 weeks configurable
- Target: Digital Strategy and IT Management courses

**Module 6: Change Management**
- Theme: Organizational restructuring and culture change
- Focus: Employee engagement, communication strategies, resistance management
- Duration: 6-8 weeks configurable
- Target: OB and HR courses

**Target Completion:** 1-2 modules per quarter starting Q2 2026

---

### Enhanced Analytics Dashboard

**Planned Features:**
- Cohort comparison across semesters
- Learning outcome tracking (AACSB alignment)
- Decision pathway visualization
- Predictive analytics for at-risk students
- Exportable reports for assessment documentation
- Instructor benchmarking tools

**Target Completion:** Q3 2026

---

### Content Engagement Enhancements

**Planned Features:**
- Enhanced easter egg-to-article matching (map specific research references to source articles)
- Content-reference analytics (track which intel articles lead to higher-quality responses)
- Reading time estimates for briefings and research materials
- Engagement heatmaps showing popular content sections
- Correlation analysis between content viewed and decision quality

**Current Capability (v1.1):**
- Content view tracking with cross-session persistence
- Intel engagement bonus (up to 1.5x multiplier for viewing articles)
- Interactive article dialogs with key insights
- Breadcrumb navigation across simulation pages

**Target Completion:** Q2 2026

---

## Mid-Term Roadmap (Q4 2026 - Q1 2027)

### LMS Integration

**Canvas LTI Integration**
- Single sign-on via LTI 1.3
- Grade passback to Canvas gradebook
- Assignment creation from simulation weeks
- Deep linking to specific simulation content

**Blackboard & Moodle Connectors**
- Parity with Canvas integration
- Universal LTI support

**Target Completion:** Q4 2026

---

### Mobile Experience

**Progressive Web App (PWA)**
- Install-to-homescreen capability
- Push notifications for deadlines
- Offline briefing access
- Optimized touch interactions
- Responsive dashboard layouts

**Target Completion:** Q1 2027

---

### Peer Evaluation & Collaboration

**Planned Features:**
- Team contribution self/peer ratings
- In-simulation discussion boards
- Collaborative decision drafting (Google Docs-style)
- Peer feedback on essay responses
- Anonymous feedback aggregation

**Target Completion:** Q1 2027

---

## Long-Term Roadmap (2027+)

### Scenario Branching & Consequences
- Decisions in early weeks affect later scenarios
- Multiple narrative pathways based on team choices
- "What-if" replay mode for learning
- Branching complexity visualization

### Industry Partnerships
- Guest content from C-suite executives
- Real company case studies as simulation foundations
- Industry mentor matching for top-performing teams
- Corporate sponsorship opportunities

### Certification & Credentials
- Digital badges for simulation completion
- Skill-based micro-credentials
- LinkedIn integration for verified achievements
- Credly/Acclaim badge platform integration

### Enterprise & White-Label
- Custom branding for institutions
- Dedicated hosting options (private cloud)
- API access for institutional data integration
- Multi-language admin interfaces

### Accessibility & Internationalization
- WCAG 2.1 AA compliance (full certification)
- Multi-language support:
  - Spanish (priority)
  - Mandarin Chinese
  - Portuguese
  - French
- Screen reader optimization
- Keyboard navigation improvements
- High contrast mode

### Advanced AI Features
- Personalized learning paths based on performance
- Adaptive difficulty adjustment
- Natural language Q&A with simulation context
- AI-powered debrief summaries for instructors

---

## Technical Debt & Infrastructure

### Ongoing Improvements
- Performance optimization for large cohorts (500+ students)
- Database query optimization
- CDN implementation for static assets
- Automated backup and disaster recovery
- Load testing and capacity planning

### Security Enhancements
- SOC 2 Type II certification (Q3 2026)
- Annual penetration testing
- Bug bounty program consideration
- Enhanced audit logging
- Two-factor authentication option

---

## Feedback & Prioritization

This roadmap is a living document informed by:
- Instructor feedback from pilot programs
- Student experience surveys
- Market research and competitive analysis
- Technical feasibility assessments
- Resource availability

**Priority Framework:**
1. **Customer-requested features** - Direct feedback from paying customers
2. **Competitive necessities** - Features required to win deals
3. **Platform stability** - Security, performance, reliability
4. **Differentiators** - Unique capabilities competitors lack
5. **Nice-to-haves** - Enhancements that add polish

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | January 2026 | Initial roadmap document |
| 1.1 | January 2026 | Added Content Engagement Enhancements section, updated current capabilities |
| 1.2 | January 2026 | Added Character Profiles with AI headshots, Triggered Voicemails, Phone-a-Friend advisor system, multimedia content support - major immersion update |

---

*For questions or feature requests, contact: doug@futureworkacademy.com*

<!-- Last auto-sync test: Sun Jan 25 06:11:42 PM UTC 2026 -->
