# Future Work Academy - Security & Compliance Documentation

**Version:** 1.0  
**Last Updated:** January 2026  
**Classification:** Confidential - For Institutional Review

---

## 1. Executive Summary

Future Work Academy is committed to protecting student data and maintaining the highest standards of information security. This document outlines our security architecture, data handling practices, and compliance posture for institutional partners, grant reviewers, and regulatory audits.

**Key Compliance Targets:**
- FERPA (Family Educational Rights and Privacy Act)
- SOC 2 Type II (in progress)
- HECVAT (Higher Education Community Vendor Assessment Toolkit)
- WCAG 2.1 AA (Accessibility)

---

## 2. Data Classification

### 2.1 Data Categories

| Category | Classification | Examples | Handling Requirements |
|----------|---------------|----------|----------------------|
| Student PII | Confidential | Names, emails, institution affiliation | Encrypted at rest and in transit, access-controlled |
| Educational Records | Confidential (FERPA) | Simulation scores, decision responses, essay submissions | Encrypted, audit-logged, retention policies |
| Authentication Data | Highly Confidential | Session tokens, OAuth credentials | Never logged, encrypted, short TTL |
| Simulation Content | Internal | Briefings, scenarios, research reports | Access-controlled by role |
| Analytics/Aggregated | Internal | Class-level statistics, anonymized trends | No PII, safe for reporting |

### 2.2 Data Inventory

| Data Element | Storage Location | Encrypted | Retention Period |
|--------------|-----------------|-----------|------------------|
| User profiles | PostgreSQL | Yes (AES-256) | Account lifetime + 7 years |
| Simulation responses | PostgreSQL | Yes | Course duration + 7 years |
| Session data | PostgreSQL | Yes | 24 hours |
| Uploaded media | Object Storage | Yes (at rest) | Course duration + 1 year |
| Activity logs | PostgreSQL | Yes | 2 years |
| Email records | SendGrid (third-party) | Yes | 30 days |

---

## 3. Technical Security Architecture

### 3.1 Infrastructure Security

| Layer | Technology | Security Measure |
|-------|------------|------------------|
| Hosting | Replit Cloud | SOC 2 compliant infrastructure |
| Database | PostgreSQL (Neon) | Encrypted connections, automated backups |
| Application | Node.js/Express | Input validation, parameterized queries |
| Frontend | React/Vite | XSS protection, CSP headers |
| CDN/Storage | Replit Object Storage | Encrypted at rest, signed URLs |

### 3.2 Encryption Standards

| Data State | Encryption Standard | Key Management |
|------------|--------------------|--------------------|
| Data at rest | AES-256 | Managed by infrastructure provider |
| Data in transit | TLS 1.3 | Auto-renewed certificates |
| Database connections | SSL/TLS required | Connection string enforced |
| API communications | HTTPS only | HSTS enabled |
| Secrets/API keys | Environment variables | Never in code, rotated quarterly |

### 3.3 Authentication & Authorization

**Authentication Method:** OpenID Connect (OIDC) via Replit Auth

| Feature | Implementation |
|---------|---------------|
| Session management | Server-side sessions with PostgreSQL store |
| Session timeout | 24 hours with sliding expiration |
| Password handling | Not stored - delegated to OIDC provider |
| MFA | Supported via OIDC provider |
| Session invalidation | Immediate on logout, token revocation |

**Authorization Model:** Role-Based Access Control (RBAC)

| Role | Access Level | Permissions |
|------|-------------|-------------|
| Super Admin | Platform-wide | All operations, user management, settings |
| Class Admin | Organization-scoped | Manage class members, view submissions, start simulations |
| Student | Individual | Submit decisions, view own scores, access assigned content |

### 3.4 Input Validation & Injection Prevention

| Threat | Mitigation |
|--------|------------|
| SQL Injection | Parameterized queries via Drizzle ORM |
| XSS (Cross-Site Scripting) | React auto-escaping, CSP headers |
| CSRF | Same-origin session cookies, SameSite=Strict |
| Command Injection | No shell execution, validated inputs |
| Path Traversal | Sanitized file paths, allowlisted directories |

---

## 4. FERPA Compliance

### 4.1 FERPA Applicability

Future Work Academy processes "education records" as defined under FERPA:
- Student simulation responses and scores
- Essay submissions evaluated by instructors or LLM
- Progress tracking and completion data
- Activity logs tied to student identifiers

### 4.2 FERPA Safeguards

| FERPA Requirement | Implementation |
|-------------------|---------------|
| Legitimate educational interest | Access restricted to assigned instructors and platform admins |
| Directory information | Not disclosed without consent; configurable per institution |
| Student consent | Obtained via institutional enrollment process |
| Right to inspect | Students can view all their submitted data via dashboard |
| Right to amend | Support process for data correction requests |
| Disclosure logging | All data access logged with timestamps and user IDs |
| Third-party agreements | Data processing agreements with all vendors |

### 4.3 Institutional Agreements

We execute the following agreements with institutional partners:

| Agreement Type | Purpose | Standard Used |
|---------------|---------|---------------|
| Data Processing Agreement (DPA) | Define data handling obligations | Institution-provided or standard template |
| Business Associate Agreement (BAA) | If health data involved | HIPAA-compliant template |
| Terms of Service | Platform usage terms | Custom for education sector |
| Privacy Policy | Transparency on data practices | FERPA-aligned |

---

## 5. Third-Party Integrations

### 5.1 Integration Inventory

| Service | Purpose | Data Shared | Compliance |
|---------|---------|-------------|------------|
| **OpenAI** | Essay evaluation, advisor AI | Anonymized essay text, no PII | DPA available, SOC 2 |
| **SendGrid** | Email notifications | Email addresses, names | SOC 2, GDPR compliant |
| **Twilio** | SMS notifications | Phone numbers | SOC 2, HIPAA eligible |
| **Google Docs** | Document sync | Non-sensitive documentation | SOC 2, FERPA compliant |
| **Replit** | Hosting, Auth, Storage | All application data | SOC 2 compliant |
| **Neon (PostgreSQL)** | Database | All application data | SOC 2, encrypted |

### 5.2 AI/LLM Data Handling

**Critical Policy:** No student PII is sent to OpenAI.

| Data Type | Sent to OpenAI | Handling |
|-----------|---------------|----------|
| Student names | NO | Stripped before API call |
| Email addresses | NO | Never included in prompts |
| Essay content | YES (anonymized) | Used only for evaluation, not training |
| Scores/feedback | Returned | Stored in our database |
| Prompts | YES | Documented in AI_TRANSPARENCY.md |

**OpenAI Data Retention:** API requests are not used for training. Data retained for 30 days for abuse monitoring, then deleted (per OpenAI API data policy).

---

## 6. Access Controls

### 6.1 Administrative Access

| Access Type | Who | Controls |
|-------------|-----|----------|
| Database (production) | Platform operators only | SSH key, IP allowlist, MFA required |
| Database (development) | Developers | Separate credentials, no production data |
| Application admin | Super Admins | OIDC authentication, role verification |
| Code repository | Development team | Git access controls, branch protection |
| Third-party dashboards | Authorized personnel | Individual accounts with MFA |

### 6.2 Audit Logging

All security-relevant events are logged:

| Event Type | Data Captured | Retention |
|------------|---------------|-----------|
| Authentication | User ID, timestamp, IP, success/failure | 2 years |
| Authorization failures | User ID, attempted resource, timestamp | 2 years |
| Data access | User ID, resource accessed, timestamp | 2 years |
| Data modification | User ID, before/after values, timestamp | 2 years |
| Admin actions | Admin ID, action type, affected users | 2 years |
| API errors | Endpoint, error type, timestamp | 90 days |

### 6.3 Activity Log Export

Administrators can export activity logs for audit purposes:
- **Formats:** CSV, JSON
- **Filters:** Date range, user, action type
- **Access:** Super Admin and Class Admin (scoped to their organization)

---

## 7. Incident Response

### 7.1 Incident Classification

| Severity | Description | Response Time | Examples |
|----------|-------------|---------------|----------|
| Critical | Data breach, system compromise | Immediate (< 1 hour) | Unauthorized data access, credential leak |
| High | Service disruption, vulnerability | < 4 hours | Database unavailable, XSS discovered |
| Medium | Degraded performance, minor issue | < 24 hours | Slow queries, failed email delivery |
| Low | Cosmetic issue, feature request | < 7 days | UI bug, documentation error |

### 7.2 Incident Response Procedure

1. **Detection** - Automated monitoring or user report
2. **Triage** - Assess severity, assign responder
3. **Containment** - Isolate affected systems if needed
4. **Investigation** - Root cause analysis, scope assessment
5. **Remediation** - Fix vulnerability, restore service
6. **Notification** - Inform affected parties per legal requirements
7. **Post-mortem** - Document lessons learned, update procedures

### 7.3 Breach Notification

| Requirement | Timeline | Method |
|-------------|----------|--------|
| Internal escalation | Immediate | Slack/email to security team |
| Institutional partner | Within 24 hours | Designated contact |
| Affected users | Within 72 hours | Email notification |
| Regulatory (if required) | Per jurisdiction | Formal written notice |

---

## 8. Data Subject Rights

### 8.1 Student Rights

| Right | Implementation | Process |
|-------|---------------|---------|
| Access | Dashboard shows all submitted data | Self-service |
| Correction | Contact support with correction request | 5 business days |
| Deletion | Request via institution or support | 30 days (subject to retention requirements) |
| Portability | Export scores and responses | Self-service CSV export |
| Restrict processing | Pause account | Contact support |

### 8.2 Request Handling

- **Request method:** Email to support or through institution
- **Identity verification:** Must match registered email or institutional confirmation
- **Response time:** 30 days maximum
- **Appeals:** Escalate to institution or regulatory body

---

## 9. Business Continuity

### 9.1 Backup Strategy

| Data Type | Backup Frequency | Retention | Recovery Time |
|-----------|-----------------|-----------|---------------|
| Database | Continuous (point-in-time) | 30 days | < 1 hour |
| Object storage | Daily snapshots | 7 days | < 4 hours |
| Configuration | Git version control | Indefinite | < 30 minutes |
| Secrets | Encrypted backup | On change | < 1 hour |

### 9.2 Disaster Recovery

| Scenario | Recovery Procedure | Target RTO |
|----------|-------------------|------------|
| Database failure | Automatic failover to replica | < 5 minutes |
| Application crash | Auto-restart via platform | < 1 minute |
| Region outage | Manual failover to backup region | < 4 hours |
| Data corruption | Point-in-time recovery | < 1 hour |

---

## 10. Compliance Roadmap

### 10.1 Current Status

| Requirement | Status | Target Date |
|-------------|--------|-------------|
| FERPA self-assessment | Complete | Done |
| Privacy policy | Published | Done |
| Terms of service | Published | Done |
| Data encryption (rest) | Implemented | Done |
| Data encryption (transit) | Implemented | Done |
| Role-based access control | Implemented | Done |
| Audit logging | Implemented | Done |
| AI transparency documentation | Complete | Done |

### 10.2 In Progress

| Requirement | Status | Target Date |
|-------------|--------|-------------|
| HECVAT questionnaire | Drafting | Q1 2026 |
| SOC 2 Type II audit | Planning | Q2 2026 |
| Penetration testing | Scheduled | Q1 2026 |
| WCAG 2.1 AA audit | Scheduled | Q2 2026 |

### 10.3 Planned

| Requirement | Status | Target Date |
|-------------|--------|-------------|
| SOC 2 certification | After audit | Q3 2026 |
| Compliance automation (Vanta) | Evaluation | Q2 2026 |
| Annual security training | Planning | Q2 2026 |

---

## 11. Contact Information

| Role | Contact |
|------|---------|
| Security inquiries | security@futureworkacademy.com |
| Privacy officer | privacy@futureworkacademy.com |
| Compliance questions | compliance@futureworkacademy.com |
| Incident reporting | incident@futureworkacademy.com |

---

## 12. Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | January 2026 | Platform Team | Initial release |

---

## Appendix A: Security Controls Checklist

**For Grant Applications and Procurement:**

- [x] Data encrypted at rest (AES-256)
- [x] Data encrypted in transit (TLS 1.3)
- [x] Role-based access control implemented
- [x] Audit logging enabled
- [x] Session management with secure cookies
- [x] Input validation and SQL injection prevention
- [x] XSS and CSRF protection
- [x] Third-party vendor assessment
- [x] Privacy policy published
- [x] Data retention policy defined
- [x] Incident response procedure documented
- [x] Backup and recovery procedures
- [ ] SOC 2 Type II certification (in progress)
- [ ] Annual penetration testing (scheduled)
- [ ] HECVAT completion (in progress)

---

## Appendix B: FERPA Compliance Checklist

- [x] Written policies for handling education records
- [x] Access limited to legitimate educational interest
- [x] Student data not disclosed without consent
- [x] Students can inspect their records (via dashboard)
- [x] Process for students to request amendments
- [x] Audit trail for all data access
- [x] Third-party agreements (DPA) with vendors
- [x] Training for personnel with data access
- [x] Data minimization practices
- [x] Secure disposal procedures defined

---

*This document should be reviewed and updated quarterly, or whenever significant changes occur to security practices, infrastructure, or compliance requirements.*
