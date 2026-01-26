# Future Work Academy - Technical Architecture

**Document Version:** 1.0  
**Last Updated:** January 2026  
**Purpose:** Technical reference for developers and stakeholders. Each section includes a plain-language summary explaining what it covers.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Authentication & Authorization](#authentication--authorization)
3. [Database Schema](#database-schema)
4. [API Design](#api-design)
5. [Frontend Architecture](#frontend-architecture)
6. [Key Features Implementation](#key-features-implementation)
7. [Integrations](#integrations)
8. [Deployment & Environment](#deployment--environment)

---

## 1. System Overview

> **What this section covers:** A bird's-eye view of how all the pieces fit together—the frontend users interact with, the server that processes requests, the database that stores everything, and the external services we connect to.

### Architecture Diagram (Conceptual)

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                              │
│  React + TanStack Query + Wouter Router + Shadcn/UI                 │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                │ HTTPS (Port 5000)
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        SERVER (Express.js)                           │
│  • Vite Dev Server (frontend bundling)                               │
│  • REST API Routes                                                   │
│  • Session Management (Passport.js)                                  │
│  • Role-Based Access Control                                         │
└─────────────────────────────────────────────────────────────────────┘
          │              │              │              │
          ▼              ▼              ▼              ▼
   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
   │ PostgreSQL│   │ Replit   │   │ Google   │   │ SendGrid │
   │ Database  │   │ Auth     │   │ Docs/    │   │ Twilio   │
   │ (Neon)    │   │ (OIDC)   │   │ Drive    │   │ (Email/  │
   │           │   │          │   │          │   │  SMS)    │
   └──────────┘   └──────────┘   └──────────┘   └──────────┘
```

### Tech Stack Summary

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 18, TypeScript | User interface |
| **State Management** | TanStack Query v5 | Server state, caching |
| **Routing** | Wouter | Client-side navigation |
| **UI Components** | Shadcn/UI, Radix | Accessible, styled components |
| **Backend** | Express.js, TypeScript | API server |
| **Database** | PostgreSQL (Neon) | Persistent storage |
| **ORM** | Drizzle ORM | Type-safe database queries |
| **Authentication** | Replit Auth (OIDC) | User login/identity |
| **Session Storage** | connect-pg-simple | Database-backed sessions |

---

## 2. Authentication & Authorization

> **What this section covers:** How users log in, how the system knows who's an admin vs a student, and how we protect pages so only the right people can access them.

### Authentication Flow

1. **User clicks "Login"** → Redirected to Replit's OAuth page
2. **User authenticates with Replit** → Replit verifies identity
3. **Callback to our app** → We receive user info (email, name, profile photo)
4. **Session created** → User data stored in PostgreSQL `sessions` table
5. **Role lookup** → System checks if user is admin, class admin, or student
6. **Redirect** → Admins go to `/super-admin`, others go to dashboard

### Role Hierarchy

```
SUPER_ADMIN (Platform Owner)
    │
    ├── Can manage ALL organizations
    ├── Can promote users to Class Admin
    ├── Can access simulation content editor
    └── Can view all analytics

CLASS_ADMIN (Professor/Instructor)
    │
    ├── Can manage their OWN organizations
    ├── Can create teams, assign students
    ├── Can start/pause simulations
    └── Can view their class analytics

STUDENT (Participant)
    │
    ├── Can join organizations via team code
    ├── Can participate in assigned simulations
    └── Can view their own progress
```

### Key Files

| File | Purpose |
|------|---------|
| `server/replit_integrations/auth/replitAuth.ts` | OIDC setup, login/logout/callback routes |
| `server/replit_integrations/auth/storage.ts` | User database operations (upsert, fetch) |
| `server/auth-middleware.ts` | Role checking middleware functions |
| `shared/models/auth.ts` | Role constants, database table definitions |

### Middleware Stack

```typescript
// Authentication check (is user logged in?)
isAuthenticated(req, res, next)

// Role loading (fetch user's permissions)
loadUserRole(req, res, next)

// Role enforcement
requireSuperAdmin(req, res, next)
requireClassAdmin(req, res, next)
requireDemoAccess(req, res, next)  // For evaluator sandbox
```

### Demo/Evaluator Access

Special access level for prospective faculty to preview the platform:
- `demoAccess: "evaluator"` - Restricted to demo organizations only
- `demoExpiresAt` - Time-limited access
- Sandboxed environment with sample data

---

## 3. Database Schema

> **What this section covers:** How we organize and store data—users, teams, organizations, simulation progress, and more. Think of this as the filing cabinet structure where everything lives.

### Core Tables

#### Users & Identity

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `users` | All platform users | id, email, firstName, lastName, isAdmin, teamId, demoAccess |
| `sessions` | Login sessions (Replit Auth) | sid, sess (JSON), expire |

#### Organizations & Membership

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `organizations` | Classes/cohorts | id, code, name, ownerId, status, isDemo, privacyMode |
| `organization_members` | User ↔ Org links | userId, organizationId, role, status |
| `organization_invites` | Team codes | code, maxUses, usedCount, expiresAt |

#### Simulation Engine

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `teams` | Game state per team | id, name, currentWeek, companyState (JSON), decisions (JSON) |
| `simulations` | Lifecycle tracking | organizationId, status, difficultyLevel, currentWeek |
| `simulation_modules` | Different scenarios | name, slug, isDefault (e.g., "AI Workplace Transformation") |
| `simulation_content` | Weekly content items | moduleId, weekNumber, contentType, content |

#### Content & Engagement

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `content_views` | What users have viewed | userId, contentType, contentId, viewedAt |
| `media_engagement` | Video/audio progress | userId, contentId, percentWatched, completed |
| `character_profiles` | AI personas | name, role, bio, headshotUrl, influence, hostility |

#### Platform Management

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `platform_settings` | Global config | requireEduEmail, competitionMode, scoringWeights |
| `email_templates` | Customizable emails | templateType, subject, htmlContent |
| `notifications` | User alerts | userId, type, title, message, read |
| `educator_inquiries` | Contact form submissions | name, email, institution, inquiryType |

### Data Model Patterns

**Company State (JSON):** Each team's simulation state is stored as a JSON blob:
```typescript
{
  revenue: 125000000,
  employees: 2400,
  morale: 68,
  automationLevel: 12,
  unionSentiment: 35,
  // ... 15+ metrics
}
```

**Weekly History:** Array of snapshots tracking progress over time.

**Decision Records:** Each decision the team makes is logged with timestamp, option chosen, and optional rationale.

---

## 4. API Design

> **What this section covers:** How the frontend talks to the backend—the "language" they use to request data and submit actions. Each endpoint is like a specific question or command the app can ask.

### API Structure

All routes are prefixed with `/api/` and follow RESTful conventions:

| Method | Pattern | Purpose |
|--------|---------|---------|
| GET | `/api/resource` | List all or get single |
| POST | `/api/resource` | Create new |
| PUT/PATCH | `/api/resource/:id` | Update existing |
| DELETE | `/api/resource/:id` | Remove |

### Key Endpoint Categories

#### Authentication
```
GET  /api/login              → Initiate OAuth flow
GET  /api/callback           → Handle OAuth callback
GET  /api/logout             → End session
GET  /api/auth               → Get current user info
```

#### Team & Game State
```
GET  /api/team               → Get current team state
POST /api/team/complete-research → Mark research phase done
POST /api/decisions          → Submit a decision
POST /api/advance-week       → Move to next simulation week
GET  /api/week-results/:week → Get weekly outcome details
```

#### Content & Briefings
```
GET  /api/briefing/:week     → Get weekly news/scenarios
GET  /api/research/reports   → Get pre-game research materials
GET  /api/scenario/:week     → Get narrative for the week
GET  /api/enhanced-decisions/:week → Get decision options
```

#### Organization Management (Class Admin)
```
GET  /api/my-memberships     → User's org memberships
POST /api/join-organization  → Join via team code
POST /api/validate-team-code → Check if code is valid
```

#### Super Admin
```
GET  /api/super-admin/organizations    → List all orgs
POST /api/super-admin/organizations    → Create new org
PUT  /api/super-admin/organizations/:id → Update org
GET  /api/super-admin/people           → List all users
POST /api/super-admin/promote-class-admin → Elevate user role
```

### Request/Response Patterns

**Standard Success:**
```json
{
  "data": { ... },
  "message": "Success"
}
```

**Standard Error:**
```json
{
  "error": "Description of what went wrong"
}
```

### Validation

- Request bodies validated with Zod schemas
- Schemas defined in `shared/schema.ts`
- Insert schemas auto-generated from table definitions via `drizzle-zod`

---

## 5. Frontend Architecture

> **What this section covers:** How the user interface is organized—the pages users visit, the components that make up those pages, and how data flows from the server to what users see on screen.

### Directory Structure

```
client/src/
├── pages/                 # Page components (one per route)
│   ├── landing.tsx        # Home/marketing page
│   ├── dashboard.tsx      # Student main view
│   ├── class-admin.tsx    # Instructor dashboard
│   ├── super-admin.tsx    # Platform admin console
│   ├── briefing.tsx       # Weekly news view
│   ├── decisions.tsx      # Decision-making interface
│   ├── research.tsx       # Pre-game research phase
│   └── ...
├── components/
│   ├── ui/                # Shadcn/Radix base components
│   ├── app-sidebar.tsx    # Navigation sidebar
│   ├── metric-card.tsx    # Stats display
│   └── ...
├── hooks/                 # Custom React hooks
├── lib/
│   └── queryClient.ts     # TanStack Query setup
└── App.tsx                # Route definitions
```

### Routing (Wouter)

```tsx
<Switch>
  <Route path="/" component={Landing} />
  <Route path="/dashboard" component={Dashboard} />
  <Route path="/briefing" component={Briefing} />
  <Route path="/decisions" component={Decisions} />
  <Route path="/class-admin" component={ClassAdmin} />
  <Route path="/super-admin" component={SuperAdmin} />
  {/* ... */}
</Switch>
```

### Data Fetching (TanStack Query)

```tsx
// Fetching data
const { data: team, isLoading } = useQuery({
  queryKey: ['/api/team'],
  // Default fetcher is pre-configured
});

// Submitting data
const mutation = useMutation({
  mutationFn: (decision) => apiRequest('POST', '/api/decisions', decision),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['/api/team'] });
  }
});
```

### Key UI Patterns

1. **Loading States:** Show skeleton/spinner while data loads
2. **Error Boundaries:** Graceful error handling with user-friendly messages
3. **Form Handling:** `react-hook-form` with Zod validation
4. **Toast Notifications:** User feedback for actions via `useToast`
5. **Responsive Design:** Tailwind CSS, mobile-first

### Page Complexity

| Page | Lines | Description |
|------|-------|-------------|
| `super-admin.tsx` | ~102K | Full admin console (orgs, users, content, analytics) |
| `class-admin.tsx` | ~88K | Instructor dashboard with team management |
| `decisions.tsx` | ~54K | Complex decision interface with stakeholders |
| `simulation-content-editor.tsx` | ~47K | Content CMS |

---

## 6. Key Features Implementation

> **What this section covers:** The special features that make Future Work Academy unique—the simulation engine, preview mode, demo access for evaluators, and how organizations are managed.

### 6.1 Simulation Engine

**Purpose:** Powers the week-by-week business simulation where teams make decisions and see consequences.

**Core Loop:**
1. Teams start at Week 1 with baseline company metrics
2. Each week: Read briefing → Review scenarios → Make decisions → See results
3. Decisions affect metrics: revenue, employees, morale, automation, etc.
4. Game ends after configured number of weeks (default: 8)

**Company State Tracking:**
```typescript
interface CompanyState {
  // Financial
  revenue: number;
  cash: number;
  debt: number;
  
  // Workforce
  employees: number;
  morale: number;
  unionSentiment: number;
  
  // Technology
  automationLevel: number;
  automationROI: number;
  
  // Leadership
  managementBenchStrength: number;
  genZWorkforcePercentage: number;
  // ... more metrics
}
```

**Difficulty Levels:**
- **Introductory** (Undergraduate): Gentler consequences, more guidance
- **Standard** (Corporate): Balanced challenge
- **Advanced** (MBA): Realistic complexity, harsher tradeoffs

### 6.2 Preview Mode

**Purpose:** Let Class Admins "walk in students' shoes" to experience the simulation before running it with their class.

**How it works:**
1. Admin creates a "test student" account linked to their org
2. System flags user: `inStudentPreview: true`, `previewModeOrgId: "xyz"`
3. Admin sees exactly what students see
4. All progress is sandboxed—doesn't affect real class data

### 6.3 Demo/Evaluator Access

**Purpose:** Prospective faculty can explore the platform before committing.

**Implementation:**
1. Faculty requests demo access via `/api/demo/request-access`
2. Super Admin reviews and approves
3. User gets `demoAccess: "evaluator"` with expiration date
4. Evaluator can ONLY access organizations marked `isDemo: true`
5. After expiration, demo access is revoked

### 6.4 Organization Management

**Hierarchy:**
```
Super Admin
    │
    └── Creates Organizations (classes)
            │
            ├── Assigns Class Admins (professors)
            │
            └── Students join via team code
                    │
                    └── Grouped into Teams for simulation
```

**Privacy Mode:**
When `privacyMode: true` on an organization:
- Students don't need to provide real names/emails
- Anonymous enrollment with just team code
- All notifications disabled
- Compliant with privacy requirements

---

## 7. Integrations

> **What this section covers:** External services we connect to—Google Docs for document management, SendGrid for emails, Twilio for text messages, and AI services for content generation.

### 7.1 Replit Auth (OIDC)

**What it does:** Handles user login/identity using Replit's OAuth system.

**Key environment variables:**
- `ISSUER_URL` - Replit's OIDC endpoint
- `REPL_ID` - Client ID for OAuth
- `SESSION_SECRET` - Encryption key for sessions
- `DATABASE_URL` - Session storage

**Files:**
- `server/replit_integrations/auth/replitAuth.ts`
- `server/replit_integrations/auth/storage.ts`

### 7.2 Google Docs/Drive

**What it does:** Syncs platform documents to Google Drive, allows embedding Google Docs in the app.

**Capabilities:**
- Create documents in "Future Work Academy" folder
- Read document content
- Auto-sync changes
- Embed Google Docs in simulation content

**Files:**
- `server/google-docs-service.ts`
- `server/docs-auto-sync.ts`

### 7.3 SendGrid (Email)

**What it does:** Sends transactional emails—welcome messages, reminders, notifications.

**Use cases:**
- Student signup notifications to instructors
- Simulation reminders
- Custom email templates (editable by admin)

**Files:**
- Uses Replit's SendGrid integration
- Template storage in `email_templates` table

### 7.4 Twilio (SMS)

**What it does:** Sends text message notifications.

**Use cases:**
- Urgent reminders
- New student signup alerts
- Optional SMS preferences per user

**Files:**
- `server/twilio-service.ts`

### 7.5 AI Services (OpenAI/Gemini)

**What it does:** Powers content enhancement, Q&A assistance, and character generation.

**Capabilities:**
- Content enhancement for simulation narratives
- Gemini Q&A widget for student questions
- Character headshot generation prompts
- Transcript processing

**Files:**
- `server/replit_integrations/chat/` (Gemini)
- `server/replit_integrations/image/` (Image generation)

### 7.6 Object Storage

**What it does:** Stores uploaded media files (videos, images, audio).

**Use cases:**
- Character headshots
- Simulation media content
- User uploads

**Files:**
- `server/replit_integrations/object_storage/`
- `client/src/components/ObjectUploader.tsx`

---

## 8. Deployment & Environment

> **What this section covers:** How the app runs in production—environment configuration, the hosting setup on Replit, and how different environments (development vs production) are managed.

### Environment Variables

| Variable | Purpose | Where Set |
|----------|---------|-----------|
| `DATABASE_URL` | PostgreSQL connection string | Replit Secrets |
| `SESSION_SECRET` | Session encryption key | Replit Secrets |
| `ISSUER_URL` | OIDC provider URL | Auto-set by Replit |
| `REPL_ID` | Application identifier | Auto-set by Replit |
| `SENDGRID_API_KEY` | Email service | Replit Integration |
| `TWILIO_*` | SMS service credentials | Replit Integration |

### Development vs Production

| Aspect | Development | Production |
|--------|-------------|------------|
| Database | Dev PostgreSQL | Production PostgreSQL |
| URL | `*.repl.co` | Custom domain or `*.replit.app` |
| Logging | Verbose | Essential only |
| Error Pages | Stack traces | User-friendly messages |

### Workflow Configuration

The app runs with a single workflow:
```bash
npm run dev
```

This starts:
1. **Vite dev server** - Bundles frontend, hot reloading
2. **Express server** - API routes, serves frontend
3. Both bound to **port 5000**

### Database Migrations

Using Drizzle ORM:
```bash
npm run db:push        # Apply schema changes
npm run db:push --force # Force-apply (use carefully)
```

Schema changes go in:
- `shared/models/auth.ts` - Auth-related tables
- `shared/schema.ts` - Business logic schemas (Zod only)

### Replit-Specific Patterns

1. **Trust Proxy:** `app.set("trust proxy", 1)` for HTTPS behind proxy
2. **Secure Cookies:** `secure: true`, `sameSite: "lax"` for production
3. **Health Checks:** Replit monitors app availability
4. **Auto-Restart:** Workflows restart on code changes

---

## Appendix: Quick Reference

### Common Operations

| Task | Where to Look |
|------|---------------|
| Add new API endpoint | `server/routes.ts` |
| Add new database table | `shared/models/auth.ts` |
| Add new page | `client/src/pages/`, register in `App.tsx` |
| Modify simulation logic | `server/storage.ts`, `server/character-impact-engine.ts` |
| Update email templates | Super Admin console or `email_templates` table |

### Debugging Checklist

1. **Auth issues:** Check `sessions` table, verify `DATABASE_URL`
2. **API errors:** Check server logs, verify request body matches schema
3. **Frontend not updating:** Check TanStack Query cache, invalidate queries
4. **Role issues:** Check `organization_members` table, verify role assignment

### Key Contacts

- **Platform Owner:** Doug Mitchell
- **Technical Questions:** Reference this document + codebase search

---

*This document is maintained alongside the codebase. Last comprehensive review: January 2026.*
