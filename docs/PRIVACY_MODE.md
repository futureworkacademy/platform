# Privacy Mode Documentation

## Overview

Privacy Mode enables instructors to use the Future Work Academy simulation platform with their classes **immediately** without requiring expensive SOC 2 compliance audits or complex data processing agreements. This is achieved through **anonymous enrollment** where no personally identifiable information (PII) is collected or stored.

## How It Works

### For Instructors

1. **Create a Privacy Mode Organization**
   - When creating a new organization, toggle "Privacy Mode" ON
   - This automatically disables all notification features (SMS/Email)
   - Students can enroll using only their Replit account - no .edu email verification required

2. **Student Enrollment Flow**
   - Share the team code with students
   - Students sign in via Replit OIDC (Google, GitHub, or email)
   - No phone numbers or school emails are collected
   - Students appear with pseudonymous identifiers (e.g., `Student_abc12345`)

3. **Offline Identity Mapping**
   - Download the "Privacy Roster Template" CSV from the admin dashboard
   - This template contains pseudonymous IDs and team assignments
   - Fill in real student names/IDs offline in your own secure system
   - Never upload this mapping to the platform

4. **Grading & Assessment**
   - All student work is identified by pseudonymous IDs
   - Export grades with pseudonymous IDs
   - Match to real students using your offline roster

### For Students

1. **Simplified Enrollment**
   - Enter the team code provided by instructor
   - No email verification required
   - No phone number collection
   - Immediate access to simulation

2. **Privacy Protections**
   - Your real name/email is not visible to other students
   - LLM evaluation receives only your written responses (no identifying info)
   - No SMS/email notifications are sent

## Technical Implementation

### Database Schema

```typescript
// Organizations table includes:
privacyMode: boolean()           // Enables privacy mode features
privacyModeNotificationsDisabled: boolean()  // Auto-disabled when privacy mode is on
```

### Enrollment Flow

1. **Team Code Validation**: Returns `privacyMode: true` if org is in privacy mode
2. **Join Organization**: Skips .edu email verification when privacy mode enabled
3. **Notification Suppression**: All SMS/email notifications are disabled
4. **Phone Number Blocking**: Phone numbers are not stored even if provided

### LLM Integration

The LLM evaluation system is designed to be PII-free:
- Only student written responses are sent to OpenAI
- No names, emails, student IDs, or user identifiers are included
- Decision context and rubric criteria are passed (simulation content, not PII)

## Workflow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                       PRIVACY MODE WORKFLOW                         │
└─────────────────────────────────────────────────────────────────────┘

INSTRUCTOR SETUP:
┌──────────────┐    ┌───────────────────┐    ┌─────────────────────┐
│ Create Org   │───>│ Toggle Privacy    │───>│ Share Team Code     │
│ (Super Admin)│    │ Mode ON           │    │ with Students       │
└──────────────┘    └───────────────────┘    └─────────────────────┘
                           │
                           ▼
                    ┌───────────────────┐
                    │ Notifications     │
                    │ Auto-Disabled     │
                    └───────────────────┘

STUDENT ENROLLMENT:
┌──────────────┐    ┌───────────────────┐    ┌─────────────────────┐
│ Enter Team   │───>│ Privacy Mode      │───>│ Join Org            │
│ Code         │    │ Detected          │    │ (No Email Verify)   │
└──────────────┘    └───────────────────┘    └─────────────────────┘
                           │
                           ▼
                    ┌───────────────────┐
                    │ Phone/Email Fields│
                    │ Hidden            │
                    └───────────────────┘

GRADING WORKFLOW:
┌──────────────┐    ┌───────────────────┐    ┌─────────────────────┐
│ Student      │───>│ LLM Evaluation    │───>│ Scores Stored with  │
│ Submits Work │    │ (PII-free)        │    │ Pseudonymous ID     │
└──────────────┘    └───────────────────┘    └─────────────────────┘
                                                     │
                                                     ▼
                                              ┌─────────────────────┐
                                              │ Export with         │
                                              │ Pseudonymous IDs    │
                                              └─────────────────────┘
```

## Testing Checklist

### Pre-Deployment Testing

- [ ] **Organization Creation**
  - [ ] Privacy Mode toggle visible in create org dialog
  - [ ] Enabling Privacy Mode auto-disables SMS notification option
  - [ ] Organization created with `privacyMode: true` in database

- [ ] **Organization Editing**
  - [ ] Privacy Mode toggle visible in edit org dialog
  - [ ] Changing Privacy Mode state persists correctly
  - [ ] SMS toggle disabled when Privacy Mode is ON

- [ ] **Student Enrollment**
  - [ ] Team code validation returns `privacyMode: true`
  - [ ] "Privacy Mode Active" banner shown on enrollment page
  - [ ] Phone number field hidden when Privacy Mode detected
  - [ ] SMS consent checkbox hidden when Privacy Mode detected
  - [ ] Email verification warning NOT shown when Privacy Mode active
  - [ ] Join button enabled without email verification in Privacy Mode
  - [ ] No email/SMS notifications sent on signup

- [ ] **Roster Template**
  - [ ] Download button available for Privacy Mode organizations
  - [ ] CSV contains pseudonymous IDs (not real names)
  - [ ] CSV includes columns for offline identity mapping
  - [ ] Instructions in CSV header about offline-only use

- [ ] **LLM Evaluation**
  - [ ] Confirm no PII in LLM prompts (check server logs)
  - [ ] Student responses evaluated without identifying info
  - [ ] Scores stored with pseudonymous identifiers

### Compliance Verification

- [ ] No student emails stored in user profiles
- [ ] No phone numbers stored in user profiles
- [ ] No notification records created for Privacy Mode orgs
- [ ] LLM API calls contain no PII
- [ ] Exported data uses pseudonymous identifiers only

## Compliance Roadmap

| Phase | Timeline | Description |
|-------|----------|-------------|
| **Phase 1: Privacy Mode** | Now | Anonymous enrollment for immediate classroom use |
| **Phase 2: Institutional Agreements** | Q1 2026 | Standard DPAs with partner institutions |
| **Phase 3: SOC 2 Compliance** | Q2 2026 | Full SOC 2 Type II certification |

## FAQ

### Q: Can students opt-out of Privacy Mode?
No. Privacy Mode is an organization-level setting controlled by the instructor. All students in a Privacy Mode organization are enrolled anonymously.

### Q: Can I convert a regular organization to Privacy Mode?
Yes. You can edit an existing organization and enable Privacy Mode. Existing student data will remain, but new enrollments will be anonymous and notifications will be disabled.

### Q: What happens if a student includes their name in their written responses?
Written responses are sent to the LLM for evaluation, but no system-level identifiers are attached. If students self-identify in their writing, this information passes through to OpenAI but is not stored or processed differently by our system.

### Q: How do I grade students if I don't know who they are?
Download the Privacy Roster Template and fill in real student identities offline. Keep this file secure on your own systems (e.g., your institution's secure drive). Match pseudonymous IDs from grade exports to your offline roster.

### Q: Is Privacy Mode FERPA compliant?
Privacy Mode significantly reduces FERPA compliance risk by not collecting student PII. However, each institution should consult with their legal/compliance teams for specific guidance.

---

*Last Updated: January 2026*
*Version: 1.0*
