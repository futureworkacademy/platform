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
- `GET /api/enhanced-decisions/:weekNumber` - Multi-attribute decisions with sliders, budgets, toggles
- `POST /api/submit-enhanced-decision` - Submit enhanced decision with attribute values and rationale
- `GET /api/admin/simulation-config` - Get simulation configuration (admin only)
- `POST /api/admin/simulation-config` - Update simulation configuration (admin only)
- `GET /api/admin/analytics` - Get admin analytics dashboard data (admin only)
- `GET /api/easter-eggs` - Get list of easter eggs (admin only)
- `GET /api/admin/activity-logs` - Get activity logs with filters (admin only)
- `GET /api/admin/activity-logs/export` - Export activity logs as CSV/JSON (admin only)

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

## Development Preview Note
**Important**: The Replit embedded webview (preview pane) does not work with session-based authentication. This is a known browser security limitation - the webview runs in an iframe, and modern browsers block third-party cookies in iframes by default.

**To test the app during development:**
- Click "Open in new tab" in the webview toolbar to open in an external browser
- Or use a private/incognito browser window with the app URL
- The webview will show a blank screen or fail to maintain login sessions

This applies to any Replit app using OIDC authentication or session cookies. Once published/deployed, the app works normally in all browsers.

## Authentication Flow
The app uses Replit Auth (OIDC). When users click "Sign In":
1. They're redirected to Replit's login consent page
2. **Important**: Users must click "Continue with Google", "Continue with Apple", or "Continue with email" - NOT the "Log in secured by Replit" text at the bottom (that's just branding that links to replit.com)
3. After authenticating, users are redirected back to the app
4. New users without team assignments see a "Waiting for Team Assignment" page
5. Admins can assign users to teams via the Admin panel

## Recent Changes
- Initial MVP implementation (January 2026)
- Bloomberg Terminal inspired design with Shadcn components
- Full simulation loop: Dashboard → Briefing → Decisions → Analytics → Leaderboard
- Dark mode support
- Added Replit Auth integration with OIDC for school email authentication (January 2026)
- Implemented admin-controlled team management system:
  - Users cannot self-register to teams
  - Admin assigns users to teams via /api/admin/assign-team
  - Users table has teamId (nullable) and isAdmin fields
- Created waiting assignment page for authenticated users without team assignment
- Protected all game routes with isAuthenticated middleware
- Each user sees only their assigned team's game data
- **Enhanced Multi-Attribute Decision System** (January 2026):
  - Week 1: Automation Strategy (intensity sliders, debt/reskilling budgets, timeline/communication selects)
  - Week 2: Talent Development (hiring budgets, dual career track toggle, job guarantee sliders)
  - Week 3: Union Relations (wage increase sliders, worker council toggle, communication budget)
  - 15 Easter eggs detect specific research statistics (72%, AutoTech, TechnoForge, etc.) for bonus points
  - Simulation config for admin to toggle individual/team/hybrid competition modes
  - Admin analytics dashboard with player performance tracking and easter egg detection rates
- **Activity Logging System** (January 2026):
  - Tracks key events: team_created, user_assigned, week_advanced, enhanced_decision_submitted
  - Supports filtering by eventType, userId, teamId, and date range
  - Export to CSV or JSON formats for analysis
