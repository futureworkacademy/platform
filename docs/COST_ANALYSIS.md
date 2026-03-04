# Future Work Academy - Cost Analysis

**Last Updated:** February 2026

This document provides a comprehensive breakdown of operating costs for the Future Work Academy simulation platform. It covers both fixed infrastructure costs and variable per-class costs, as well as development estimates for new modules.

---

## Platform Cost Summary

| Cost Category | Per Class (8 weeks) | Monthly Fixed |
|---------------|---------------------|---------------|
| Hosting & Infrastructure | - | $7-17 |
| AI/LLM API Calls | $2-5 | - |
| SMS Notifications | $0-1.30 | - |
| Email Notifications | Free | - |
| **Total** | **~$10-23** | **~$7-17** |

---

## Fixed Costs (Monthly)

These costs are incurred regardless of the number of active classes.

### Hosting (Replit Autoscale Deployment)
- **Cost:** ~$5-15/month
- **Notes:** Autoscale deployment charges only when serving requests. Idle time is free.
- **Scaling:** Cost increases with traffic; estimate ~$0.001 per request

### PostgreSQL Database
- **Cost:** Included with Replit
- **Provider:** Neon-backed PostgreSQL
- **Notes:** No additional charges for database storage or queries

### Object Storage
- **Cost:** ~$0-2/month
- **Usage:** Character headshots, audio files, uploaded assets
- **Notes:** Minimal transfer costs for static assets

### Domain & SSL
- **Cost:** Included with Replit deployment
- **Notes:** Free `.replit.app` subdomain with automatic SSL

---

## Variable Costs (Per Class)

These costs scale with the number of students and duration of the simulation.

### AI/LLM API Calls (via Replit AI Integrations)

| Feature | Model | Est. Calls (10 students × 8 weeks) | Est. Cost |
|---------|-------|-----------------------------------|-----------|
| Essay Grading | gpt-4.1-nano | 160 (2 decisions/week × 10 × 8) | $1-2 |
| Phone-a-Friend Advisors | gpt-4o-mini | 30 (3 credits × 10 students) | $0.50-1 |
| Demo Q&A Widget | gpt-4o-mini | 50 (evaluators + demo users) | $0.50 |
| **Total AI** | | ~240 calls | **$2-5** |

**Scaling Formula:** ~$0.30-0.50 per student for an 8-week simulation

### Twilio SMS Notifications
- **Cost:** $0.0079 per SMS
- **Usage:** Weekly reminders, enrollment confirmations, deadline alerts
- **Est. Volume:** ~16 messages per student (2/week × 8 weeks)
- **10 Students:** ~$1.30

**Note:** SMS costs are **$0** if using **Privacy Mode** (disabled notifications)

### SendGrid Email
- **Cost:** Free tier (100 emails/day)
- **Usage:** Enrollment invitations, weekly summaries, admin notifications
- **Notes:** Well under free tier limits for typical class sizes

---

## Cost by Class Size

| Students | AI Costs | SMS Costs | Total Variable |
|----------|----------|-----------|----------------|
| 10 | $2-5 | $1.30 | $3-6 |
| 25 | $5-13 | $3.25 | $8-16 |
| 50 | $10-25 | $6.50 | $17-32 |
| 100 | $20-50 | $13 | $33-63 |

**Privacy Mode** reduces variable costs by ~30-40% (no SMS).

---

## New Module Development Costs

Estimated effort to create a completely new simulation module (different industry/scenario).

### AI-Assisted Development (Current Workflow)

| Component | Hours | Notes |
|-----------|-------|-------|
| Scenario Design | 2-4 | Industry context, 8-week narrative arc |
| Weekly Briefings (×8) | 4-6 | SITREP, stakeholder pressures, key questions |
| Decision Options (×16+) | 3-5 | 2+ decisions/week with options and impacts |
| Character Profiles (×10-17) | 2-3 | Bios, traits, AI-generated headshots |
| Intel Articles (×24+) | 2-4 | 3+ research articles per week |
| Voicemails (×8-16) | 2-3 | Scripts + external ElevenLabs generation |
| Testing & Refinement | 4-6 | Playtesting, balancing, edge cases |
| **Total** | **19-31 hours** | |

### Development Cost Estimate
- **Hourly Rate Range:** $50-150/hour
- **Low Estimate:** 20 hours × $50 = **$1,000**
- **High Estimate:** 30 hours × $150 = **$4,500**
- **API Costs (generation):** ~$5-15 (one-time)
- **ElevenLabs (voiceovers):** ~$5-20 (external)

### Traditional Development Comparison
Without AI-assisted content generation: **66-98 hours** (~$3,300-14,700)

**AI assistance provides ~70% time savings**

---

## Key Cost Parameters

Update these values to recalculate estimates:

| Parameter | Current Value | Impact |
|-----------|---------------|--------|
| Students per class | 10 | Scales AI + SMS costs linearly |
| Decisions per week | 2 | Affects essay grading calls |
| Weeks per simulation | 8 | Multiplies weekly costs |
| Phone-a-Friend credits | 3 per student | Adds advisor AI calls |
| SMS enabled | Yes (non-Privacy Mode) | Adds ~$0.13/student/week |
| Essay grading model | gpt-4.1-nano | Lower cost per evaluation |
| Advisor model | gpt-4o-mini | Moderate cost per call |

---

## Cost Optimization Strategies

1. **Enable Privacy Mode** - Eliminates SMS costs entirely
2. **Use nano models** - gpt-4.1-nano is significantly cheaper than gpt-4o
3. **Limit Phone-a-Friend credits** - Reduce from 3 to 2 per student
4. **Batch classes** - Fixed hosting costs amortized across more students
5. **Off-peak deployment** - Autoscale charges less during low traffic

---

## Annual Cost Projections

### Scenario: 5 Classes/Year, 25 Students Each

| Category | Cost |
|----------|------|
| Hosting (12 months) | $84-204 |
| AI Calls (5 classes × 25 students) | $25-65 |
| SMS (if enabled) | $16 |
| **Total Annual** | **$125-285** |

### Scenario: 20 Classes/Year, 30 Students Each

| Category | Cost |
|----------|------|
| Hosting (12 months) | $84-204 |
| AI Calls (20 classes × 30 students) | $180-300 |
| SMS (if enabled) | $76 |
| **Total Annual** | **$340-580** |

---

## Changelog

| Date | Change | Impact |
|------|--------|--------|
| Feb 2026 | Initial cost analysis created | Baseline established |
| Feb 2026 | Switched Q&A widget from Gemini to OpenAI | Simplified AI billing |

---

*This document is automatically synced to Google Docs. Update the markdown file to reflect changes.*
