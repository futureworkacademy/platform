# The Future of Work - Business Simulation Game

## Overview
A web-based business simulation game designed for graduate students to make strategic company decisions over a semester-long period. Teams navigate the challenges of AI adoption while managing employee anxiety about job displacement, competing to achieve the best outcomes across financial performance and cultural health metrics.

## Key Features
- **Executive Dashboard**: Real-time company metrics including revenue, employees, morale, and budgets
- **Weekly Intelligence Briefings**: Curated articles with strategic insights for decision-making
- **AI Deployment Decisions**: Deploy AI/ML across departments with risk/reward tradeoffs
- **Resource Allocation**: Invest in lobbying and employee reskilling programs
- **People Analytics**: Deep insights into employee sentiment, behavior trends, and key issues
- **Competition Leaderboard**: Team rankings by financial and cultural performance scores

## Technology Stack
- **Frontend**: React with TypeScript, Wouter routing, TanStack Query
- **UI Components**: Shadcn/UI, Radix primitives, Recharts for data visualization
- **Styling**: Tailwind CSS with custom design tokens
- **Backend**: Express.js with in-memory storage
- **Fonts**: IBM Plex Sans, Inter, Roboto Mono

## Project Structure
```
client/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── app-sidebar.tsx
│   │   ├── metric-card.tsx
│   │   ├── score-gauge.tsx
│   │   ├── briefing-article.tsx
│   │   ├── department-card.tsx
│   │   ├── event-alert.tsx
│   │   ├── leaderboard-table.tsx
│   │   ├── analytics-charts.tsx
│   │   └── theme-toggle.tsx
│   ├── pages/
│   │   ├── dashboard.tsx   # Executive dashboard
│   │   ├── briefing.tsx    # Weekly intelligence briefing
│   │   ├── decisions.tsx   # Strategic decisions interface
│   │   ├── analytics.tsx   # People analytics dashboard
│   │   └── leaderboard.tsx # Competition rankings
│   ├── lib/
│   │   ├── theme-provider.tsx
│   │   ├── queryClient.ts
│   │   └── utils.ts
│   └── App.tsx
server/
├── routes.ts               # API endpoints
├── storage.ts              # In-memory data storage
└── index.ts
shared/
└── schema.ts               # TypeScript types and Zod schemas
```

## API Endpoints
- `GET /api/team` - Current team state and company metrics
- `GET /api/departments` - Available departments for AI deployment
- `GET /api/briefing/:weekNumber` - Weekly intelligence briefing
- `GET /api/leaderboard` - Competition rankings
- `GET /api/analytics` - People analytics data
- `POST /api/decisions` - Submit strategic decisions
- `POST /api/advance-week` - Complete current week and advance

## Design System
- **Primary**: Corporate Navy (#1E3A8A)
- **Success**: Growth Green (#10B981)  
- **Warning**: Caution Amber (#F59E0B)
- **Accent**: Tech Purple (#6366F1)
- **Background**: Professional Grey (#F8FAFC)
- **Data Positive**: #34D399
- **Data Negative**: #EF4444

## Game Mechanics
1. Each week, teams receive an intelligence briefing with articles
2. Global events may occur with positive/negative impacts
3. Teams allocate resources: AI deployment, lobbying, reskilling
4. Performance tracked via dual scoring:
   - **Financial Score**: Revenue × Workforce ratio
   - **Cultural Score**: Employee morale/sentiment
   - **Combined Score**: Financial × Cultural

## Running the Application
The application runs via the "Start application" workflow which executes `npm run dev`, starting both the Express backend and Vite frontend on port 5000.

## Recent Changes
- Initial MVP implementation (January 2026)
- Bloomberg Terminal inspired design with Shadcn components
- Full simulation loop: Dashboard → Briefing → Decisions → Analytics → Leaderboard
- Dark mode support
