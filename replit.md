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
- **Multi-Tenant Architecture**: Organizations (classes) with team codes for student enrollment

## Technology Stack
- **Frontend**: React with TypeScript, Wouter routing, TanStack Query
- **UI Components**: Shadcn/UI, Radix primitives, Recharts for data visualization
- **Styling**: Tailwind CSS with custom design tokens
- **Backend**: Express.js with PostgreSQL database
- **Database ORM**: Drizzle ORM
- **Authentication**: Replit OIDC Auth
- **SMS Notifications**: Twilio integration
- **Fonts**: IBM Plex Sans, Inter, Roboto Mono

## Project Structure
```
client/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── app-sidebar.tsx
│   │   ├── app-footer.tsx  # Footer with Mitchell Group copyright
│   │   ├── metric-card.tsx
│   │   ├── score-gauge.tsx
│   │   ├── briefing-article.tsx
│   │   ├── department-card.tsx
│   │   ├── event-alert.tsx
│   │   ├── leaderboard-table.tsx
│   │   ├── analytics-charts.tsx
│   │   └── theme-toggle.tsx
│   ├── pages/
│   │   ├── landing.tsx          # Public landing page with challenge cards
│   │   ├── waiting-assignment.tsx # Student team code entry
│   │   ├── dashboard.tsx        # Executive dashboard
│   │   ├── briefing.tsx         # Weekly intelligence briefing
│   │   ├── research.tsx         # Research reports library
│   │   ├── decisions.tsx        # Strategic decisions interface
│   │   ├── analytics.tsx        # People analytics dashboard
│   │   ├── leaderboard.tsx      # Competition rankings
│   │   ├── super-admin.tsx      # Super Admin dashboard
│   │   ├── class-admin.tsx      # Class Admin/Instructor dashboard
│   │   ├── educator-inquiries.tsx # Educator lead management
│   │   └── setup.tsx            # Initial Super Admin setup
│   ├── lib/
│   │   ├── theme-provider.tsx
│   │   ├── queryClient.ts
│   │   └── utils.ts
│   └── App.tsx
server/
├── routes.ts               # API endpoints
├── storage.ts              # Game data storage (teams, decisions, etc.)
├── auth-storage.ts         # User authentication storage
├── organization-storage.ts # Multi-tenant organization management
└── index.ts
shared/
├── schema.ts               # Game data types and Zod schemas
└── models/
    └── auth.ts             # User, Organization, Member schemas
```

## Database Schema

### Core Tables
- **users**: User accounts with role flags (is_admin: 'true'/'false'/'super_admin')
- **organizations**: Classes/groups with unique team codes
- **organization_members**: User-organization relationships with roles
- **organization_invites**: Team codes for student enrollment (legacy, now using organization.code)
- **teams**: Game teams with company state
- **notifications**: In-app notifications for admins

### Role System
- **Super Admin** (is_admin='true' or 'super_admin'): Platform-wide management
- **Class Admin** (organization_members.role='class_admin'): Organization/class management
- **Student** (organization_members.role='student'): Game participants

## API Endpoints

### Public
- `GET /api/setup/status` - Check if Super Admin exists

### Authentication
- `GET /api/auth/user` - Get current user
- `POST /api/auth/logout` - Log out user
- `GET /api/my-role` - Get user's role and memberships

### Game
- `GET /api/team` - Current team state and company metrics
- `GET /api/departments` - Available departments for AI deployment
- `GET /api/briefing/:weekNumber` - Weekly intelligence briefing
- `GET /api/leaderboard` - Competition rankings
- `GET /api/analytics` - People analytics data
- `POST /api/decisions` - Submit strategic decisions
- `POST /api/advance-week` - Complete current week and advance
- `GET /api/enhanced-decisions/:weekNumber` - Multi-attribute decisions
- `POST /api/submit-enhanced-decision` - Submit enhanced decision
- `GET /api/research/reports` - Get all research reports
- `GET /api/research/historical` - Get historical company data
- `GET /api/research/workforce` - Get workforce demographics

### Student Enrollment
- `POST /api/join-organization` - Join organization with team code (requires verified .edu email)
- `POST /api/verify-edu-email/send` - Send verification email to .edu address
- `POST /api/verify-edu-email/confirm` - Confirm verification code

### Class Admin
- `GET /api/class-admin/organizations` - Get admin's organizations
- `POST /api/class-admin/organizations` - Create organization
- `GET /api/class-admin/organizations/:orgId/members` - Get members
- `POST /api/class-admin/organizations/:orgId/add-member` - Add member by email
- `PATCH /api/class-admin/organizations/:orgId/members/:memberId/role` - Update role
- `DELETE /api/class-admin/organizations/:orgId/members/:memberId` - Remove member
- `PATCH /api/class-admin/organizations/:orgId/members/:memberId/approve` - Approve member

### Super Admin
- `GET /api/super-admin/organizations` - List all organizations
- `POST /api/super-admin/organizations` - Create organization
- `GET /api/super-admin/users` - List all users
- `POST /api/super-admin/assign-admin` - Assign admin role
- `GET /api/super-admin/educator-inquiries` - List educator inquiries
- `PATCH /api/super-admin/educator-inquiries/:id` - Update inquiry status/notes
- `GET /api/super-admin/educator-inquiries/export` - Export inquiries as CSV

### Admin
- `GET /api/admin/simulation-config` - Get simulation configuration
- `POST /api/admin/simulation-config` - Update simulation configuration
- `GET /api/admin/analytics` - Get admin analytics dashboard
- `GET /api/admin/activity-logs` - Get activity logs with filters
- `GET /api/admin/activity-logs/export` - Export logs as CSV/JSON

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

## Content Architecture (For Future Development)

### Weekly Briefings (Week 1-8)
Located in: `server/storage.ts` - `generateBriefing()` function
Each week's briefing contains:
- 4-5 articles with headlines, sources, summaries
- Key insights extracted from articles
- Links to relevant research reports

### Research Reports
Located in: `server/storage.ts` - `getResearchReports()` function
Six comprehensive reports available:
1. **AIM** - State of AI in Manufacturing 2025
2. **APX** - Apex Manufacturing Company Profile
3. **WFT** - Workforce Transition Best Practices
4. **ATL** - AI Technology Landscape for Manufacturing
5. **CMP** - Competitive Analysis: Auto Parts Sector
6. **TFG** - Case Study: TechnoForge Transformation

### Enhanced Decision System (Weeks 1-3)
Located in: `server/routes.ts` - Enhanced decisions endpoints
- Week 1: Automation Strategy
- Week 2: Talent Development
- Week 3: Union Relations
Each decision has sliders, toggles, budgets, and rationale fields

### Easter Eggs
15 hidden bonuses for citing specific statistics:
- "72%" (Gen Z management interest)
- "AutoTech" (competitor reference)
- "TechnoForge" (case study reference)
- And more...

## Running the Application
The application runs via the "Start application" workflow which executes `npm run dev`, starting both the Express backend and Vite frontend on port 5000.

## Development Preview Note
**Important**: The Replit embedded webview (preview pane) does not work with session-based authentication. This is a known browser security limitation.

**To test the app during development:**
- Click "Open in new tab" in the webview toolbar to open in an external browser
- Or use a private/incognito browser window with the app URL

## Authentication Flow
1. User clicks "Sign In" on landing page
2. Redirected to Replit OIDC login
3. **Important**: Click "Continue with Google/Apple/email" (not the "Log in secured by Replit" branding text)
4. After auth, routing based on status:
   - Super Admin → /super-admin
   - Class Admin with org → /class-admin
   - Student with team → /dashboard
   - New user → /waiting-assignment

## Student Registration Flow
1. Student authenticates via Replit OIDC
2. Lands on /waiting-assignment
3. Must verify .edu email first (verification code sent)
4. After verification, enters team code from instructor
5. Optionally provides phone number and SMS consent
6. On valid code + verified email → auto-approved and added to organization
7. SMS notification sent to Class Admin

## Landing Page
- Tagline: "Are you Ready to Navigate the AI Revolution?"
- Sub-headline: mentions robotics, generational, and cultural challenges
- 12 rotating challenge cards (6 visible at a time, fade animation every 5 seconds)
- "For Educators" CTA in header and footer
- Footer: "The Mitchell Group, LLC - Iowa"

## Recent Changes
- Initial MVP implementation (January 2026)
- Bloomberg Terminal inspired design with Shadcn components
- Full simulation loop: Dashboard → Briefing → Decisions → Analytics → Leaderboard
- Dark mode support
- Replit Auth integration with OIDC
- **Multi-Tenant Role System** (January 2026):
  - Three-tier hierarchy: Super Admin → Class Admin → Student
  - Organizations with unique team codes (organizations.code field)
  - Super Admin dashboard at /super-admin
  - Class Admin dashboard at /class-admin
  - .edu email validation required for student signups
  - SMS notifications via Twilio on student signups
- **Member Management System** (January 2026):
  - Add/remove members, update roles
  - Role validation prevents privilege escalation
  - Permanent team codes with copy functionality
- **Enhanced Decision System**:
  - Week 1-3 multi-attribute decisions
  - 15 Easter eggs for research citations
  - Admin analytics dashboard
- **Activity Logging**:
  - Tracks team_created, user_assigned, week_advanced, enhanced_decision_submitted
  - Export to CSV/JSON
- **Landing Page Updates** (January 2026):
  - New tagline and sub-headline
  - 12 rotating challenge cards with fade animation
  - "For Educators" CTAs
  - Mitchell Group copyright
- **Security Fixes** (January 2026):
  - Role validation allowlist prevents privilege escalation
  - join-organization requires verified .edu from user profile only (no bypass)
