# Lessons Learned: Building Future Work Academy with AI

*A retrospective analysis of 633 commits across ~95 working sessions*

---

## The Headline Numbers

| Category | Commits | % of Total |
|---|---|---|
| **Core features** (simulation, decisions, grading, advisors, enrollment) | ~94 | 15% |
| **Documentation** (guides, marketing, roadmaps, brand standards) | ~56 | 9% |
| **Demo/Tour/Preview system** (sandbox, evaluator, guided tours) | ~57 | 9% |
| **Auth/login debugging** (session fixes, redirects, diagnostics) | ~42 | 7% |
| **Logo/branding iterations** (sizing, dark mode, swapping files) | ~33 | 5% |
| **UI polish** (sizing, spacing, colors, button tweaks) | ~34 | 5% |
| **Publishes** | 76 | 12% |
| **Transitions & saves** (mode switches, progress saves) | ~200+ | 32% |

**Key insight:** Only about 15% of commits directly built the core simulation product. The rest was polish, rework, documentation, and infrastructure.

---

## Pattern 1: The Logo Spiral (29 commits)

This is the single clearest example of where time and money went sideways. Here's the actual sequence:

1. "Update header to display company logo prominently"
2. "Increase header logo size for better readability"
3. "Update website header with a new horizontal logo and adjust its size"
4. "Increase the height of the main logo displayed on the landing page"
5. "Adjust the website logo size to be 20% smaller"
6. "Update website headers with the new company logo"
7. "Update site logos to automatically adjust for dark and light modes"
8. "Update website logos to display correctly in dark mode"
9. "Update the dark mode logo to ensure transparency"
10. "Update the primary logo used in the application interface"
11. "Update logos across the application to use a single, unified image file"
12. ...and 18 more similar commits

**What happened:** Each session, you saw the logo, felt it wasn't quite right, and asked for a tweak. Each tweak was a separate AI session. Each session costs money and context.

**The lesson:** Cosmetic iterations are the most expensive way to use an AI agent. Each "make the logo 20% smaller" is a full session startup, context loading, code change, and publish cycle. 29 logo commits could have been 1-2 if the requirements were defined upfront: "Logo should be X pixels tall, work in dark and light mode, and appear on all pages."

---

## Pattern 2: The Auth Debugging Marathon (~15 commits)

The authentication debugging sequence tells a painful story:

1. "Add logging to Replit authentication flow to aid debugging"
2. "Add logging to trace authentication flow and redirect behavior"
3. "Improve login redirect logging for authentication issues"
4. "Add detailed logging for Replit authentication callback issues"
5. "Clarify login process and remove debugging logs from authentication flow"
6. "Add a diagnostic endpoint to help debug user authentication issues"
7. "Add a new diagnostic endpoint to check session status"
8. ...then much later...
9. "Add ability to repair missing user records during login"
10. "Add diagnostic information to user session repair process"
11. "Migrate user accounts with mismatched IDs to correct Replit IDs"

**What happened:** Auth broke in production, and the fix required iterative publish-test-debug cycles because the agent couldn't reproduce the exact production environment. Each cycle was a separate session.

**The lesson:** Authentication is infrastructure, not a feature. It should be rock-solid before building anything else. When something fundamental breaks, invest the time in one deep debugging session rather than sprinkling logging across multiple sessions. Also: test auth flows end-to-end before moving on to other features.

---

## Pattern 3: The Demo/Preview/Tour System (57 commits)

This was the single largest feature area by commit count, and it went through at least 4 major iterations:

1. **v1:** "Sandbox mode" - admin can preview as a student
2. **v2:** "Evaluator preview" - separate evaluator mode added
3. **v3:** "Instructor preview" - yet another preview mode added
4. **v4:** "Unified role switcher" - consolidated all three into one system

Each version worked, then you'd realize you needed another variant, then the old ones conflicted, and eventually they all got unified. The guided tour went through a similar cycle: basic tour -> multi-page tour -> tour-with-voicemails -> tour-not-blocking-enrollment -> tour-completion-modal -> etc.

**What happened:** The requirements evolved organically. You'd see the product, think "what if an evaluator could also preview?", and ask for it. Then "what about instructors?" Then "these should all be one thing."

**The lesson:** Before building any system with multiple user roles or modes, write down ALL the roles and ALL the things they should be able to do. A 10-minute planning session asking "who are all the people who will use this, and what does each one need to see?" would have saved 30+ commits of rework.

---

## Pattern 4: Documentation Overinvestment (56 commits)

The project has a massive documentation library: business plan, game design doc, brand standards, content creation handbook, AI transparency doc, story bible, marketing materials, cost analysis, product roadmap, technical architecture, FERPA compliance, Iowa outreach playbook, content consistency flow, and more.

Many of these were created, then updated, then synced to Google Docs, then updated again when features changed.

**The lesson:** Documentation is valuable, but not all of it is equally valuable at every stage. During active development, only three documents truly matter:

1. **The spec** (what are we building and for whom)
2. **The user guide** (how do people use it)
3. **replit.md** (how does the code work)

Everything else -- marketing materials, compliance docs, investor decks -- should wait until the product is stable. Writing a 20-page brand standards doc before the core product is finished means rewriting it every time a feature changes.

---

## Pattern 5: Publish-Fix-Publish Cycles (76 publishes)

With 633 commits and 76 publishes, you published roughly once every 8 commits. Many of these were rapid-fire:

- Publish -> find bug -> fix -> publish -> find another bug -> fix -> publish

This suggests features were being tested in production rather than in development.

**The lesson:** Test before publishing. Every publish is a context switch for both you and the agent. Batch your changes: build 3-4 things, test them all in the dev environment, then publish once.

---

## The Biggest Overall Insight: The "Shiny Object" Tax

Your self-diagnosis was exactly right: *"Each time I see an iteration, I end up asking for improvements vs. focusing on core functionality."*

Looking at the commit history, the pattern is clear:

1. Ask for a core feature (decisions, grading, enrollment)
2. See the result
3. Notice the logo looks small / a button is the wrong color / the tour should have one more step
4. Ask for the cosmetic fix
5. That spawns a new session
6. In the new session, notice something else
7. Core features wait while polish accumulates

This is completely natural -- it's how humans interact with visual products. But with AI agents, every session costs money, and cosmetic iterations have the worst cost-to-value ratio.

---

## Practical Tips for Your Next Project (or continuing this one)

### Before Starting a Session

1. **Write your request in a note first.** Don't type directly into chat. Spend 2 minutes writing what you want. This forces you to separate "must have" from "nice to have."

2. **Ask yourself: "Is this core functionality or polish?"** If it's polish, save it for a batch. Keep a running list of cosmetic fixes and submit them all at once: "Make these 8 UI tweaks" is one session instead of eight.

3. **Define done before starting.** Instead of "make the logo look better," say "make the logo 48px tall, white on dark backgrounds, navy on light backgrounds, consistent on all pages." The agent can't read your mind, and each vague request becomes a round trip.

### During a Session

4. **Don't get distracted by what you see.** When the agent shows you the enrollment page, resist the urge to say "also, can you make that button green?" Write it down and stay focused on the original request.

5. **Give the agent the full picture upfront.** Instead of asking for features one at a time, describe the whole system: "I need a preview system where super admins can preview as either an educator or a student on any organization, with a banner showing which role they're previewing." That's one session, not three.

6. **Trust the agent on technical decisions.** You mentioned you're not a coder -- that's fine. The agent is. Don't ask "should we use PostgreSQL or MongoDB?" Just describe what you need to store and let the agent decide. Every technical question you ask is a round trip that costs time.

### For the Product Overall

7. **Build the core loop first, polish last.** The simulation's core loop is: read briefing -> make decision -> get scored -> see leaderboard. Everything else (tours, previews, voicemails, PDF exports, stakeholder directory) is enhancement. Get the core loop bulletproof first.

8. **One role at a time.** Build the complete student experience. Then build the complete instructor experience. Then build the admin tools. Jumping between roles creates integration bugs (like the preview mode issues we just fixed).

9. **Docs can wait.** A marketing brochure doesn't help if the enrollment flow is broken. Focus documentation efforts on user-facing guides that help people actually use the product.

10. **Batch publishes.** Aim for one publish per working session, not three. Test in development, verify it works, then publish.

---

## What Went Right

It's not all rework. Several things went very well:

- **The simulation content pipeline** (characters, briefings, decisions, voicemails) was built methodically with a canonical data source and validation tools. This was well-planned.
- **The grading system** (LLM-powered essay evaluation with a transparent rubric) was implemented cleanly in a focused session.
- **The enrollment wizard** with team codes and magic links was well-scoped.
- **Privacy mode** was a smart, focused feature addition.
- **The unified preview system** (once it was consolidated) is well-architected.

These successes share a common trait: they were clearly defined before building started, and they solved a specific user problem.

---

## The Bottom Line

You built a genuinely impressive product -- an 8-week business simulation with 17 characters, AI grading, voicemails, guided tours, privacy mode, multi-role preview, PDF exports, and more. That's real.

But roughly 40-50% of the development effort went to rework, polish iterations, and debugging issues that could have been avoided with upfront planning. For your next project (or the next phase of this one), the single highest-leverage change you can make is:

**Spend 10 minutes planning before each session. Write down exactly what you want, define what "done" looks like, and resist the urge to ask for cosmetic tweaks until you have a batch of them.**

That alone would likely cut your costs by 30-40% while getting you to a finished product faster.

---

*Generated: February 2026*
