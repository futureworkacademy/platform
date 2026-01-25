# Future Work Academy - Visual Appendix

**Version:** 1.1  
**Last Updated:** January 2026

This document contains all visual diagrams for presentations, documentation, and stakeholder materials. All diagrams use [Mermaid](https://mermaid.js.org/) syntax for version control and easy export.

---

## How to Export Diagrams

1. **Online Editor**: Copy any diagram code block to [mermaid.live](https://mermaid.live) → Download as PNG/SVG
2. **GitHub/GitLab**: These platforms render Mermaid natively in markdown preview
3. **VS Code**: Install "Markdown Preview Mermaid Support" extension
4. **CLI Export**: `npm install -g @mermaid-js/mermaid-cli` then `mmdc -i input.md -o output.png`

---

## 1. System Architecture

High-level overview of the platform's technical architecture.

```mermaid
flowchart TB
    subgraph Client["Frontend (React + TypeScript)"]
        UI[Shadcn/UI Components]
        TQ[TanStack Query]
        Router[Wouter Router]
    end

    subgraph Server["Backend (Express.js)"]
        API[REST API Routes]
        Auth[Replit OIDC Auth]
        Sessions[PostgreSQL Sessions]
    end

    subgraph Database["PostgreSQL (Neon)"]
        Users[(Users & Orgs)]
        Sims[(Simulations)]
        Content[(Modules & Content)]
        Submissions[(Decisions & Scores)]
    end

    subgraph External["External Services"]
        OpenAI[OpenAI GPT-4o-mini]
        Twilio[Twilio SMS]
        SendGrid[SendGrid Email]
        GDocs[Google Docs API]
    end

    Client <-->|JSON/REST| Server
    Server <-->|Drizzle ORM| Database
    Server -->|LLM Grading| OpenAI
    Server -->|Notifications| Twilio
    Server -->|Email Queue| SendGrid
    Server -->|Doc Sync| GDocs
```

---

## 2. Weekly Simulation Workflow

The student journey through each simulation week.

```mermaid
flowchart LR
    subgraph Week["Weekly Cycle"]
        A[Dashboard] --> B[Briefing]
        B --> C[Research & Intel]
        C --> D[Decision Making]
        D --> E[Submit Decisions]
        E --> F[Analytics & Results]
        F --> G[Leaderboard]
    end

    subgraph Scoring["Scoring Engine"]
        H[Financial Score]
        I[Cultural Score]
        J[LLM Essay Eval]
        K[Intel Bonus]
    end

    E --> H & I & J
    C -.->|View Articles| K
    K -.->|1.0x-1.5x Multiplier| J
    
    G --> |Next Week| A
```

---

## 3. Role Hierarchy & Permissions

Three-tier access control system.

```mermaid
flowchart TB
    subgraph SuperAdmin["Super Admin"]
        SA1[Platform Settings]
        SA2[All Organizations]
        SA3[User Management]
        SA4[Simulation Modules]
        SA5[Content Editor]
        SA6[Activity Logs]
        SA7[Google Docs Sync]
    end

    subgraph ClassAdmin["Class Admin / Instructor"]
        CA1[Own Organization]
        CA2[Team Management]
        CA3[Week Advancement]
        CA4[Student Progress]
        CA5[Email Reminders]
        CA6[Sandbox Mode]
        CA7[CSV Import/Export]
    end

    subgraph Student["Student"]
        ST1[Join via Team Code]
        ST2[View Briefings]
        ST3[Submit Decisions]
        ST4[View Results]
        ST5[Leaderboard Access]
    end

    SuperAdmin --> ClassAdmin --> Student

    style SuperAdmin fill:#1e3a5f,color:#fff
    style ClassAdmin fill:#2d5016,color:#fff
    style Student fill:#4a4a4a,color:#fff
```

---

## 4. LLM-Powered Grading Rubric

Semantic evaluation criteria for essay responses.

```mermaid
flowchart TB
    subgraph Input["Student Essay Response"]
        Essay[Free-text Answer]
    end

    subgraph Rubric["4-Criteria Evaluation"]
        R1["Strategic Alignment 25%"]
        R2["Cultural Sensitivity 25%"]
        R3["Implementation Feasibility 25%"]
        R4["Innovation & Insight 25%"]
    end

    subgraph Output["Grading Output"]
        Score[Numeric Score 0-100]
        Feedback[Detailed Feedback]
        Strengths[Key Strengths]
        Improvements[Areas to Improve]
    end

    Essay --> R1 & R2 & R3 & R4
    R1 & R2 & R3 & R4 --> Score & Feedback & Strengths & Improvements

    style Rubric fill:#4a1e6b,color:#fff
```

---

## 5. Scoring System Overview

How final scores are calculated each week.

```mermaid
flowchart LR
    subgraph Decisions["Student Decisions"]
        D1[Resource Allocation]
        D2[Strategic Choices]
        D3[Essay Responses]
        D4[Research Engagement]
    end

    subgraph Processing["Score Processing"]
        P1[Financial Impact Model]
        P2[Cultural Impact Model]
        P3[LLM Semantic Eval]
        P4[Intel Bonus Calc]
    end

    subgraph Weights["Configurable Weights"]
        W1["Financial Weight (default 50%)"]
        W2["Cultural Weight (default 50%)"]
    end

    subgraph Final["Final Output"]
        FS[Financial Score]
        CS[Cultural Score]
        TS[Total Score]
        Rank[Leaderboard Position]
    end

    D1 & D2 --> P1 --> FS
    D1 & D2 --> P2 --> CS
    D3 --> P3
    D4 --> P4 -->|1.0x-1.5x| P3
    
    FS --> W1 --> TS
    CS --> W2 --> TS
    TS --> Rank

    style Processing fill:#1e3a5f,color:#fff
    style Final fill:#2d5016,color:#fff
```

---

## 6. Multi-Tenant Data Model

Organization and team structure.

```mermaid
erDiagram
    ORGANIZATIONS ||--o{ ORGANIZATION_MEMBERS : has
    ORGANIZATIONS ||--o{ TEAMS : contains
    ORGANIZATIONS ||--o{ SIMULATIONS : runs
    
    USERS ||--o{ ORGANIZATION_MEMBERS : joins
    USERS ||--o{ TEAM_ASSIGNMENTS : assigned_to
    
    TEAMS ||--o{ TEAM_ASSIGNMENTS : includes
    
    SIMULATIONS ||--o{ SIMULATION_MODULES : uses
    SIMULATIONS ||--o{ WEEK_RESULTS : generates
    
    SIMULATION_MODULES ||--o{ SIMULATION_CONTENT : contains
    
    TEAMS ||--o{ WEEK_RESULTS : earns
    TEAMS ||--o{ SUBMISSIONS : makes
    
    USERS ||--o{ CONTENT_VIEWS : tracks

    ORGANIZATIONS {
        int id PK
        string name
        string team_code
        string settings
    }
    
    USERS {
        int id PK
        string email
        string role
        boolean edu_verified
    }
    
    TEAMS {
        int id PK
        string name
        int organization_id FK
    }
    
    SIMULATIONS {
        int id PK
        int organization_id FK
        string status
        int current_week
    }
```

---

## 7. Competitive Positioning Matrix

Market differentiation against alternatives.

```mermaid
%%{init: {"quadrantChart": {"chartWidth": 500, "chartHeight": 500}}}%%
quadrantChart
    title Competitive Landscape
    x-axis Low AI Integration --> High AI Integration
    y-axis Low Engagement --> High Engagement
    quadrant-1 Leaders
    quadrant-2 Engaging but Manual
    quadrant-3 Basic Tools
    quadrant-4 AI-Heavy but Passive
    Future Work Academy: [0.85, 0.90]
    Traditional Case Studies: [0.15, 0.40]
    Generic Business Sims: [0.30, 0.60]
    AI Tutoring Platforms: [0.75, 0.35]
    Static Online Courses: [0.10, 0.20]
```

> **Note:** If the quadrant chart doesn't render in your environment, use the [mermaid.live editor](https://mermaid.live) to generate a PNG/SVG export.

---

## 8. Simulation Lifecycle States

Status transitions for simulation management.

```mermaid
stateDiagram-v2
    [*] --> draft: Create Simulation
    
    draft --> active: Start Simulation
    draft --> [*]: Delete
    
    active --> paused: Pause
    active --> completed: Complete All Weeks
    
    paused --> active: Resume
    paused --> [*]: Cancel
    
    completed --> [*]: Archive
    
    note right of active
        Week advancement
        Student submissions
        Score processing
    end note
    
    note right of paused
        No new submissions
        Data preserved
        Can resume anytime
    end note
```

---

## 9. Content Engagement Tracking Flow

How intel bonus multipliers are calculated.

```mermaid
flowchart TB
    subgraph Student["Student Actions"]
        A[Open Industry Intel Article]
        B[Read Research Report]
        C[View Briefing Section]
    end

    subgraph Tracking["Content View Tracking"]
        D[Record View in DB]
        E[contentType: simulation_content]
        F[contentId: briefing_article_X]
        G[viewedAt: timestamp]
    end

    subgraph Bonus["Bonus Calculation"]
        H[Count Unique Articles Viewed]
        I["Base: 1.0x Multiplier"]
        J["+0.15x per Article"]
        K["Cap: 1.5x Maximum"]
    end

    subgraph Result["Applied to Submission"]
        L[Research Score × Multiplier]
        M[Return adjusted score + metadata]
    end

    A --> D --> E & F & G
    B --> D
    C --> D
    
    H --> I --> J --> K --> L --> M

    style Bonus fill:#4a1e6b,color:#fff
    style Result fill:#2d5016,color:#fff
```

---

## 10. Email/SMS Notification Flow

Automated reminder and notification system.

```mermaid
sequenceDiagram
    participant Admin as Class Admin
    participant System as Platform
    participant Queue as Email Queue
    participant SG as SendGrid
    participant TW as Twilio
    participant Student as Student

    Admin->>System: Schedule Reminder
    System->>Queue: Add to Queue
    
    loop Every 15 minutes
        Queue->>Queue: Check Pending Emails
    end
    
    Queue->>SG: Send Email Batch
    SG->>Student: Email Delivered
    
    alt SMS Enabled
        Queue->>TW: Send SMS
        TW->>Student: SMS Delivered
    end
    
    Student->>System: Open Email / SMS Link
    System->>System: Log Engagement
```

---

## Usage Notes

- **Colors**: Diagrams use the platform's brand colors (Corporate Navy #1e3a5f, Growth Green #2d5016, Tech Purple #4a1e6b)
- **Updates**: When features change, update the relevant diagram code and re-export
- **Presentations**: Export at 2x resolution for crisp slides
- **Print**: Use SVG format for vector quality in printed materials
