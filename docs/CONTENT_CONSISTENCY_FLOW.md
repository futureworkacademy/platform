# Content Consistency System
## How All Simulation Content Stays Aligned

**Last Updated:** January 2026

**WHY THIS MATTERS:** See [CONTENT_INTEGRITY.md](./CONTENT_INTEGRITY.md) for the full explanation of why content consistency is critical - including the "ripple effect" when character traits change.

---

## The Golden Rule

> **canonical.json is THE single source of truth.**
> - `canonical.json` contains all structured canonical data (names, numbers, facts)
> - `STORY_BIBLE.md` is a narrative mirror that MUST match canonical.json
> - The validation script checks Story Bible against canonical.json to prevent drift
> All other content references canonical.json. Nothing auto-propagates. You validate, then manually update.

---

## Visual Flow

```
                    +---------------------+
                    |  canonical.json     |
                    |  (PRIMARY SOURCE)   |
                    |  Structured Data    |
                    +----------+----------+
                               |
                               | DEFINES
                               v
        +----------------------+----------------------+
        |                      |                      |
        v                      v                      v
+---------------+     +---------------+     +------------------+
| Company Facts |     | 17 Characters |     | 8-Week Structure |
| - Name        |     | - Names       |     | - Titles         |
| - Financials  |     | - Roles       |     | - Themes         |
| - Metrics     |     | - Traits      |     | - Questions      |
+-------+-------+     +-------+-------+     +--------+---------+
        |                     |                      |
        +---------------------+----------------------+
                              |
                              | REFERENCED BY
                              v
+-------------------------------------------------------------------------+
|                         ALL DERIVED CONTENT                             |
+-------------------------------------------------------------------------+
|                                                                         |
|  +-------------------+  +-------------------+  +---------------------+  |
|  | Documentation     |  | Database Content  |  | Marketing Materials |  |
|  | - STORY_BIBLE.md  |  | - Briefings       |  | - EXPLAINER_VIDEO   |  |
|  | - GAME_DESIGN.md  |  | - Research        |  | - Sales decks       |  |
|  | - HANDBOOK.md     |  | - Intel articles  |  | - Demo scripts      |  |
|  +-------------------+  | - Character bios  |  +---------------------+  |
|                         +-------------------+                           |
|                                                                         |
+-------------------------------------------------------------------------+
                              |
                              | CHECKED BY
                              v
                    +---------------------+
                    |  VALIDATION SCRIPT  |
                    |  npx tsx server/    |
                    |  validate-content.ts|
                    +----------+----------+
                               |
                               | REPORTS
                               v
        +----------------------+----------------------+
        |                      |                      |
        v                      v                      v
+---------------+     +---------------+     +---------------+
|    ERRORS     |     |   WARNINGS    |     |     INFO      |
| (Must fix)    |     | (Should fix)  |     | (Status only) |
+---------------+     +---------------+     +---------------+
```

---

## The Update Workflow

### When You Change the Story Bible

```
Step 1: EDIT STORY_BIBLE.md
        |
        | (Change a character name, add a fact, update a metric)
        v
Step 2: RUN VALIDATION
        |
        | npx tsx server/validate-content.ts
        v
Step 3: REVIEW REPORT
        |
        | See which files/database rows reference outdated info
        v
Step 4: MANUALLY UPDATE
        |
        | Fix each flagged location (this is intentional - not automatic)
        v
Step 5: RUN VALIDATION AGAIN
        |
        | Confirm all issues resolved
        v
Step 6: DONE
```

### Why No Auto-Propagation?

| Reason | Example |
|--------|---------|
| **Context matters** | Changing "Victoria Hartwell" to "Victoria Chen" in Story Bible doesn't mean find-replace everywhere. Some dialogue might need rewriting for voice. |
| **Quality control** | A bio change might require nuanced rewrites in 5 places. Human judgment decides HOW. |
| **Audit trail** | You know exactly what was changed and why. No mysterious automatic updates. |
| **Safety** | Auto-propagation could corrupt database content or overwrite intentional variations. |

---

## What the Validation Script Checks

### Documentation Files (docs/*.md)

| Check | What It Catches |
|-------|-----------------|
| Company name | Incorrect company names (should be "Apex Manufacturing") |
| Week numbers | Invalid week references (valid range is 0-8) |
| Character mentions | Names that don't match Story Bible (coming soon) |

### Database Content

| Check | What It Catches |
|-------|-----------------|
| character_profiles | Characters not in Story Bible, missing canonical characters |
| simulation_content | Invalid week numbers, empty tables |
| Content references | Character names in briefing text (planned) |

---

## Example Validation Output

```
============================================================
CONTENT CONSISTENCY VALIDATION REPORT
============================================================

ERRORS (1)
----------------------------------------
  [EXPLAINER_VIDEO_SCRIPT.md:35] Possible wrong company name. Expected "Apex Manufacturing"

WARNINGS (17)
----------------------------------------
  [Database] Story Bible character "Victoria Hartwell" not found in database
  [Database] Story Bible character "David Chen" not found in database
  [Database] Story Bible character "Margaret O'Brien" not found in database
  ... (all 17 characters need to be added)

INFO (3)
----------------------------------------
  [Docs] Scanned 8 markdown files in docs/
  [Database] Found 1 character(s) in database
  [Database] simulation_content table is empty. No briefings/reports created yet.

============================================================
SUMMARY
----------------------------------------
  Errors:   1
  Warnings: 17
  Info:     3
============================================================

Validation FAILED - Please fix errors above.
```

---

## Canonical Reference Quick Lookup

### Company Name
```
Apex Manufacturing
```
(Never: "Apex", "Apex Mfg", "Apex Industries", "the company" in formal contexts)

### Character Names (Full List)
```
1.  Victoria Hartwell     - Board Chair
2.  David Chen            - CFO
3.  Margaret O'Brien      - COO (nickname: Maggie)
4.  Sandra Williams       - HR Director
5.  Frank Torres          - Operations Manager
6.  Jennifer Park         - Sales VP
7.  Robert Nakamura       - General Counsel
8.  Marcus Webb           - Union Organizer
9.  Patricia Lawson       - Bank Representative
10. Dr. Nathan Cross      - Industry Analyst
11. Angela Reyes          - Mayor
12. Thomas Richardson     - Customer (AutoCorp)
13. Rachel Kim            - Technology Vendor
14. Dr. Helen Mercer      - External Consultant
15. Jaylen Brooks         - Gen Z Representative
16. Destiny Martinez      - Gen Z Employee
17. William Thornton III  - Board Member (PE)
```

### Week Titles
```
Week 1: The Automation Imperative
Week 2: The Talent Pipeline Crisis
Week 3: Union Storm Brewing
Week 4: The First Displacement
Week 5: The Manager Exodus
Week 6: Debt Day of Reckoning
Week 7: The Competitive Response
Week 8: Strategic Direction
```

### Competitor Companies
```
AutoTech Industries   - Aggressive approach (failed)
PrecisionParts Co.    - Balanced approach (succeeded)
FastParts             - No workforce investment (failed)
```

---

## Running Validation

### Command
```bash
npx tsx server/validate-content.ts
```

The script reads from `docs/canonical.json` as the structured source of truth.

### When to Run
- Before publishing any new content
- After editing STORY_BIBLE.md
- After bulk content imports
- Before major releases
- As part of content review workflow

### Exit Codes
| Code | Meaning |
|------|---------|
| 0 | All checks passed (or passed with warnings) |
| 1 | Errors found - must fix before proceeding |

---

## FAQ

### Q: What if I want to intentionally deviate from the Story Bible?

**A:** Update the Story Bible first, THEN make your change. The Story Bible is the canon - if reality differs from canon, fix canon.

### Q: Can I add characters not in the Story Bible?

**A:** Yes, but you should add them to the Story Bible first. The validation will warn (not error) on unknown characters.

### Q: What about typos vs. intentional variations?

**A:** The validation script catches obvious mismatches. Subtle variations (like using "the CFO" instead of "David Chen") won't trigger warnings - that's intentional for natural writing flow.

### Q: How do I update multiple places efficiently?

**A:** Use your IDE's find-and-replace, or use AI prompts like:
> "Update this briefing to replace all references to [old name] with [new name] while maintaining natural flow."

---

## Maintenance

| Task | Frequency |
|------|-----------|
| Run validation | Before every content publish |
| Review Story Bible | Monthly or after major changes |
| Update validation script | When new content types are added |
