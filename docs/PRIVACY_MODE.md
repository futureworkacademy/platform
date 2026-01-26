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

## FERPA, COPPA & Data Privacy Compliance

Privacy Mode is specifically designed to minimize regulatory compliance risk by **not collecting protected student information in the first place**. Below is a point-by-point analysis of how Privacy Mode addresses key data protection requirements.

### FERPA (Family Educational Rights and Privacy Act)

FERPA protects the privacy of student education records. Here's how Privacy Mode addresses each relevant provision:

| FERPA Requirement | How Privacy Mode Addresses It |
|-------------------|-------------------------------|
| **Personally Identifiable Information (PII)** - Schools must protect student names, addresses, student IDs, and other direct identifiers | ✅ **No PII Collected**: Privacy Mode does not collect or store student names, school email addresses, phone numbers, or student IDs. Students are identified only by system-generated pseudonyms (e.g., `Student_abc12345`). |
| **Directory Information** - Schools can release "directory information" but must allow opt-out | ✅ **No Directory Info Stored**: No names, photos, majors, or enrollment status are stored in the platform. Nothing to release. |
| **Third-Party Disclosure** - Schools cannot disclose education records without consent | ✅ **No Records to Disclose**: Since no PII is collected, there are no identifiable education records that could be disclosed to third parties. |
| **Right to Inspect Records** - Students/parents can request to see their records | ✅ **Pseudonymous Records Only**: Students can view their own simulation decisions and scores. No cross-referencing to real identity exists within the platform. |
| **Data Minimization** - Collect only what's educationally necessary | ✅ **Minimal Data Collection**: Only simulation responses and choices are stored - no demographic data, no contact information, no institutional identifiers. |

### AI/LLM Data Handling

A critical concern for educational institutions is how AI systems process student work:

| Concern | How Privacy Mode Addresses It |
|---------|-------------------------------|
| **Student work sent to AI** | ✅ **PII-Free Prompts**: The LLM (OpenAI) receives only the text of student responses. No names, emails, student IDs, or user identifiers are included in API calls. |
| **AI training on student data** | ✅ **No Training**: We use OpenAI's API with data usage controls. Student responses are not used to train models. |
| **Identifiable feedback** | ✅ **Anonymous Scores**: AI-generated feedback is stored against pseudonymous IDs only. |

### COPPA (Children's Online Privacy Protection Act)

While COPPA applies primarily to children under 13, Privacy Mode's approach aligns with its principles:

| COPPA Principle | Privacy Mode Compliance |
|-----------------|------------------------|
| **Parental Consent for Data Collection** | ✅ **Not Applicable**: No personal information is collected that would trigger COPPA requirements. |
| **Data Minimization** | ✅ **Minimal Collection**: Only educational responses are collected; no profiles, preferences, or contact info. |

### State-Level Privacy Laws

Privacy Mode aligns with emerging state privacy requirements:

| Regulation | Compliance Approach |
|------------|---------------------|
| **California (CCPA/CPRA)** | No personal information as defined by CCPA is collected. No "sale" or "sharing" of data occurs. |
| **Colorado/Virginia/Connecticut** | De-identified data exemptions apply when no PII is present. |
| **Illinois BIPA** | No biometric data collected (no photos, voice, or biometric identifiers). |

### Data Flow Summary

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PRIVACY MODE DATA FLOW                           │
│                                                                     │
│  WHAT WE COLLECT              WHAT WE DON'T COLLECT                │
│  ─────────────────            ────────────────────                 │
│  ✓ Simulation responses       ✗ Student names                      │
│  ✓ Decision choices           ✗ Email addresses                    │
│  ✓ AI-generated scores        ✗ Phone numbers                      │
│  ✓ Team assignments           ✗ Student ID numbers                 │
│  ✓ Pseudonymous user ID       ✗ Institutional identifiers          │
│                               ✗ IP addresses (not logged)          │
│                               ✗ Device fingerprints                │
│                                                                     │
│  THIRD-PARTY DATA SHARING                                          │
│  ────────────────────────                                          │
│  OpenAI: Receives only response text (no identifiers)              │
│  Analytics: Disabled in Privacy Mode                               │
│  Notifications: Disabled (no Twilio/SendGrid calls)                │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Institutional Verification Checklist

For administrators verifying compliance, confirm the following in Privacy Mode organizations:

- [ ] No student email addresses in `users` table (verify: `email` field is Replit OIDC identifier, not school email)
- [ ] No phone numbers stored (`notifyPhone` is null/empty for all users)
- [ ] No SMS notifications sent (check Twilio logs - should be empty for this org)
- [ ] No SendGrid emails sent for this organization
- [ ] LLM API calls contain no user identifiers (audit OpenAI request logs)
- [ ] Grade exports use pseudonymous IDs only
- [ ] No Google Analytics user tracking for Privacy Mode sessions

### Statement for Institutional Review Boards

The following statement can be provided to IRBs, legal counsel, or compliance officers:

> *"Future Work Academy Privacy Mode operates without collecting personally identifiable information (PII) as defined by FERPA, COPPA, or state privacy laws. Students enroll using anonymized Replit accounts and are identified within the system only by system-generated pseudonymous identifiers. Student written responses are evaluated by AI systems that receive no identifying information. Instructors maintain offline mappings between pseudonyms and real student identities using their institution's secure systems. No student contact information is collected, stored, or transmitted to third parties."*

---

## Compliance Roadmap

| Phase | Timeline | Description |
|-------|----------|-------------|
| **Phase 1: Privacy Mode** | Now | Anonymous enrollment for immediate classroom use |
| **Phase 2: Institutional Agreements** | Q1 2026 | Standard DPAs with partner institutions |
| **Phase 3: SOC 2 Compliance** | Q2 2026 | Full SOC 2 Type II certification |

---

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
