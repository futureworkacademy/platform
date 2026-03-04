# Content Integrity System
## Why Every Character Trait Matters

**Last Updated:** January 2026

---

## The Problem We Solve

Imagine changing an actor halfway through filming a movie. Every scene they've already shot now feels "off" - their mannerisms don't match, their relationships with other characters seem inconsistent, the story has "glitches in the matrix."

Educational simulations face the same challenge. When students make decisions across 8 weeks of gameplay, they're interacting with a living world of characters, each with defined personalities, motivations, and influence over outcomes. **One inconsistency anywhere breaks immersion and undermines learning.**

This document explains how Future Work Academy guarantees content integrity - and why that matters for instructors, institutions, and students.

---

## Characters Are Variables, Not Just Portraits

In our simulation, characters aren't decorative. They're **functional variables** that feed into multiple systems:

| Character Attribute | Where It's Used | What Happens If Wrong |
|--------------------|-----------------|-----------------------|
| **Name** | Weekly briefings, voicemails, LLM grading prompts, relationship references | A student references "Victoria" in their essay, but Week 5's briefing calls her "Vicky" - confusion, lost immersion |
| **Role** (CFO, Union Rep) | Stakeholder categorization, decision framing, advisor warnings | Week 2 shows finance pressure from the "CFO" but the character is labeled "COO" elsewhere - students cite the wrong stakeholder |
| **Influence** (1-10) | LLM essay grading, decision difficulty calculations | High-influence stakeholder rated 3 instead of 10 - students who correctly prioritize them get marked down |
| **Hostility** (1-10) | LLM grading context, triggered voicemail tone, outcome likelihood | Hostile union organizer marked as friendly - the "Union Storm" week has no tension, voicemails sound mismatched |
| **Motivations/Fears** | LLM essay evaluation, advisor guidance | Essay grading ignores what actually drives the character - students who understood the simulation get penalized |

### The Ripple Effect in Action

**Example: Changing Marcus Webb's hostility from 8 to 2**

Marcus Webb is the Union Organizer. Here's what breaks:

1. **Week 3 ("Union Storm Brewing")** - The entire week's tension depends on him being a credible threat. With hostility at 2, why is there a "storm"?

2. **Triggered Voicemails** - His confrontational messages ("The workers are watching, and we won't be ignored") now sound out of character for someone who's supposedly easygoing.

3. **LLM Essay Grading** - The AI evaluator is told Marcus has hostility 2, so it grades student essays as if appeasing him is trivial. Students who treated him as a serious threat get marked as "overreacting."

4. **Decision Difficulty** - Our calculation `difficulty += influence × hostility` drops significantly. Week 3 becomes easier than intended.

5. **Competitive Balance** - Teams who played when hostility was 8 had a harder simulation than teams who play when it's 2. Leaderboards become unfair.

**One number changed. Five systems broken. That's the ripple effect.**

---

## Our Solution: Single Source of Truth + Transparent Validation

### 1. Canonical Data Source

All character traits, company facts, week structures, and narrative elements live in ONE place:

```
docs/canonical.json
```

This file is the "DNA" of the simulation. Everything else - documentation, database content, briefings, marketing materials - must match it exactly.

### 2. Automated Validation

Run a single command to verify content integrity:

```bash
npx tsx server/validate-content.ts
```

This checks:
- All 17 character profiles match canonical.json
- Week titles and structures are consistent
- Company metrics (revenue, employees) align across all docs
- Database content matches the canonical source
- No "glitches" between documentation and live simulation

### 3. Human-in-the-Loop Updates

We intentionally chose **validation over auto-propagation**. Why?

- **Narrative judgment required**: Changing a character's role might require rewriting dialogue, not just find-replace.
- **Intentional drift detection**: Sometimes "inconsistencies" are discovered that reveal the canonical source needs updating, not the downstream content.
- **Audit trail**: Changes are deliberate and reviewed, not silent overwrites.

The system tells you WHAT is inconsistent. A human decides HOW to fix it.

---

## Why This Matters for Your Institution

### For Instructors

- **Repeatability**: When you run the same simulation next semester, students get the same experience. No "the simulation was harder last year" complaints.
- **Fair Grading**: LLM evaluators use consistent character data. Essay grades reflect student understanding, not data drift.
- **Confidence**: You can verify content integrity yourself before each class.

### For Administrators

- **Quality Assurance**: A verifiable system that proves content hasn't degraded.
- **Audit Readiness**: Clear documentation of what content exists and how it's validated.
- **Differentiation**: Show accreditors and evaluators that your simulation platform has engineering-grade content management.

### For Students

- **Immersion**: Characters behave consistently. The simulation feels like a real world, not a buggy game.
- **Trust**: Their decisions are evaluated against stable criteria, not shifting goalposts.

---

## Transparency as a Feature

This Content Integrity System joins our other transparency-focused features:

| Feature | What It Provides |
|---------|-----------------|
| **Content Integrity Validation** | Prove simulation content is consistent and correct |
| **Privacy Mode** | Students can participate anonymously; instructors map identities offline |
| **LLM Grading Transparency** | Students see exactly what criteria the AI used to evaluate their essays |
| **Activity Logging** | Instructors can audit all system actions |
| **Intel Engagement Tracking** | Students prove they engaged with research materials |

We believe educational technology should be **verifiable, not a black box**. If you care about the integrity of your learning experience, you should be able to prove it.

---

## Technical Reference

### Canonical Data Structure

```json
{
  "company": { "name": "Apex Manufacturing", "employees": 2400, ... },
  "characters": [
    { "name": "Victoria Hartwell", "role": "Board Chair", "influence": 10, "hostility": 4 },
    ...
  ],
  "weeks": [
    { "number": 1, "title": "The Automation Imperative", "theme": "..." },
    ...
  ],
  "competitors": [...],
  "researchReports": [...]
}
```

### Validation Output Example

```
============================================================
CONTENT CONSISTENCY VALIDATION REPORT
============================================================

ERRORS (0)
WARNINGS (2)
  [Database] simulation_content table is empty
  
INFO (3)
  [STORY_BIBLE.md] Validated against canonical.json
  [Docs] Scanned 19 markdown files
  [Database] Found 17 character(s) matching canonical

SUMMARY: Validation PASSED
============================================================
```

### Content Creation Workflow

1. **Define in canonical.json** - Add or modify the authoritative data
2. **Run validation** - Check what's now inconsistent
3. **Update downstream** - Fix documentation, database, briefings as needed
4. **Re-validate** - Confirm everything aligns
5. **Commit** - Changes are tracked in version control

---

## Summary

The "Westworld problem" - characters behaving inconsistently across storylines - is solved by treating content integrity as a first-class engineering concern, not an afterthought.

**One source. Transparent validation. Human judgment for updates.**

Your students experience a coherent world. Your instructors can verify it. Your institution can prove it.

---

*For implementation details, see [CONTENT_CONSISTENCY_FLOW.md](./CONTENT_CONSISTENCY_FLOW.md) and [CONTENT_CREATION_HANDBOOK.md](./CONTENT_CREATION_HANDBOOK.md).*
