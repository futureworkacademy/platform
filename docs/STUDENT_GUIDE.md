# The Future of Work Simulation — Privacy Mode Guide

*A step-by-step walkthrough for instructors and students using anonymous enrollment*

---

## What Is Privacy Mode?

Privacy Mode lets your class use the simulation without requiring university emails or phone numbers. Students enroll through Replit and are identified on the leaderboard and in instructor reports by a pseudonymous ID (e.g., `Student_a3f82b01`). The instructor maintains a separate offline roster mapping pseudonyms to real students.

This enables immediate classroom use without institutional data agreements or SOC 2 compliance.

> **Note:** The enrollment form includes optional name fields. In Privacy Mode, we recommend students leave these blank or use initials only. If a student does enter a name, it is stored in their profile but is NOT sent to the AI essay grader — only the written response text is evaluated.

**What's different from standard mode:**

| Feature | Standard Mode | Privacy Mode |
|---|---|---|
| Student identity | Real name + verified .edu email | Pseudonymous ID (names optional, not required) |
| Email verification | Required | Skipped |
| Phone number collection | Optional (for SMS alerts) | Skipped entirely |
| SMS/email notifications | Enabled | Disabled |
| Instructor signup alerts | SMS + email | None (check admin dashboard manually) |
| AI essay grading | Receives student name | Receives written response only, no PII |
| Leaderboard display | Student/team names | Pseudonymous IDs |
| Student-to-identity mapping | Automatic | Offline CSV roster template |

---

## Phase 1: Instructor Sets Up the Class

### Step 1 — Create Your Organization

1. Log in to the platform with your instructor account
2. Navigate to your **Admin Dashboard**
3. Click **Create Organization**
4. Fill in:
   - **Organization Name** (e.g., "MGT 490 — Spring 2026")
   - **Description** (optional)
   - **Admin Email** (your contact email)
5. Toggle **Privacy Mode** to ON
   - You'll see a confirmation that SMS/email notifications will be disabled
   - This is expected — privacy mode prevents all student PII from being collected
6. Click **Create**

> **Note:** Once Privacy Mode is enabled on an organization, all students who join will enroll anonymously. You can toggle it off later if your institution completes a data agreement, but students who already enrolled anonymously will retain their pseudonymous IDs.

### Step 2 — Create Teams

1. In your Admin Dashboard, select your organization
2. Click **Create Team**
3. Enter a team name (e.g., "Team Alpha," "Team 1")
4. Repeat for each team you need
5. Each team receives a unique **Team Code** — a short alphanumeric string students will use to join

> **Tip:** Create teams before distributing codes. Students need a valid team code to enroll.

### Step 3 — Distribute Team Codes to Students

Share the team codes with your students through your usual channels:

- Announce in class
- Post on your LMS (Canvas, Blackboard, etc.)
- Include in the course syllabus
- Email to students directly

**What to tell your students:**

> "Go to [your platform URL], click 'Sign in with Replit,' and enter this team code: **[CODE]**. You do NOT need to provide your university email or phone number. You'll receive a pseudonymous ID like `Student_a3f82b01` — write it down. I will distribute a separate roster for you to tell me which pseudonym is yours."

### Step 4 — Set the Simulation Week

1. In your Admin Dashboard, confirm the simulation is at **Week 1**
2. The simulation won't advance automatically — you control the pace
3. Students can begin once the simulation status is active

---

## Phase 2: Students Enroll

### Step 5 — Students Log In via Replit

1. Go to the simulation URL your instructor provided
2. Click **Sign in with Replit**
   - If you don't have a Replit account, you'll create one (free)
   - Use any email — your university email is NOT required
3. After signing in, you'll see the **Enrollment Wizard**

### Step 6 — Students Enter the Team Code

1. On the enrollment screen, enter the **Team Code** your instructor gave you
2. The system validates the code and shows the organization name
3. Click **Continue**

### Step 7 — Students Confirm Information (Simplified)

Because Privacy Mode is enabled, this step is streamlined:

- You'll see "Your class uses anonymous enrollment"
- You may optionally enter a first and last name — your instructor will tell you whether to fill these in or leave them blank for maximum anonymity
- **No email verification** — the .edu email step is skipped entirely
- **No phone number** — the SMS consent step is skipped entirely
- Click **Continue**

### Step 8 — Students Complete Enrollment

1. Review the confirmation screen
2. Click **Join Simulation**
3. You'll see a success message: "Welcome to the simulation!"
4. You now have a pseudonymous ID (e.g., `Student_a3f82b01`)

> **Important:** Your pseudonym is how your instructor identifies your work. It appears on the leaderboard and in instructor reports. Your instructor cannot see your real identity on the platform — they'll map pseudonyms to real students using a separate offline roster. Your instructor will tell you how to find or report your pseudonym.

---

## Phase 3: Instructor Maps Pseudonyms to Real Students

### Step 9 — Download the Roster Template

Once students have enrolled:

1. Go to your **Admin Dashboard**
2. Select your organization
3. Click **Download Privacy Roster Template**
4. A CSV file downloads with the following columns:

| Pseudonym (Username) | Team Name | Enrolled Date | Real Name (FILL IN OFFLINE) | Student ID (FILL IN OFFLINE) | Email (FILL IN OFFLINE) |
|---|---|---|---|---|---|
| Student_a3f82b01 | Team Alpha | 2/5/2026 | | | |
| Student_7c1d9e42 | Team Alpha | 2/5/2026 | | | |
| Student_f4e06a89 | Team Beta | 2/6/2026 | | | |

### Step 10 — Collect Student Identities Offline

Distribute a simple form (paper, Google Form, or LMS survey) asking each student:

> "What is your simulation pseudonym? (It looks like `Student_` followed by 8 characters. You can find it in the simulation sidebar.)"

Then fill in the "Real Name," "Student ID," and "Email" columns in your downloaded CSV.

> **Critical:** Keep this completed roster on your own computer or institutional storage. Do NOT upload it to the simulation platform. The entire point of Privacy Mode is that student PII stays offline.

---

## Phase 4: The Weekly Simulation Loop

Each simulation week follows the same pattern. Below is what happens from both perspectives.

### Step 11 — Instructor Advances the Week (When Ready)

1. Go to your **Admin Dashboard**
2. Click **Advance Week** when you want students to begin the next week's content
3. Students can only access the current week and prior weeks — they cannot skip ahead
4. You control the pace: advance weekly, biweekly, or on your own schedule

### Step 12 — Students Check Their Dashboard

Each week, students should:

1. Open the simulation and check the **Dashboard**
2. Review company metrics:
   - **Financial Score** — revenue, costs, ROI
   - **Cultural Score** — morale, union relations, workforce adaptability
   - **Combined Score** — your overall standing
3. Note any warning indicators before reading the briefing

### Step 13 — Students Read the Intelligence Briefing

1. Navigate to **Intelligence Briefing** from the sidebar
2. Read the **Situation Report** — the week's scenario narrative describing what's happening at Apex Manufacturing
3. Review **Stakeholder Pressures** — which stakeholders are affected and how

### Step 14 — Students Listen to Voicemails

Within the briefing, students will find voicemail messages from key characters at Apex Manufacturing:

- **Critical** (Red) — Urgent issues requiring immediate attention
- **High** (Amber) — Important matters to address this week
- **Medium** (Blue) — Strategic guidance and updates

> **Tip for students:** Listen carefully. Stakeholder concerns directly influence how your decisions are evaluated by the AI grading system. Reference specific voicemail content in your essays for higher scores.

### Step 15 — Students Read Intel Articles

- Optional but valuable industry news and research articles
- Reading them earns an **engagement bonus** toward your score
- Data points from articles can strengthen your essay responses
- Each article tracks whether you've viewed it

### Step 16 — Students Make Decisions

1. Navigate to **Decisions** from the sidebar
2. For each decision:
   - Read the scenario and options carefully
   - Select your chosen strategic direction
   - Write an **essay response** explaining your reasoning
3. Your essay is evaluated by AI against four criteria:
   - **Evidence Quality** — Reference data from briefings and articles
   - **Reasoning Coherence** — Clear logical connections
   - **Trade-off Analysis** — Acknowledge pros and cons
   - **Stakeholder Consideration** — Address multiple perspectives
4. Submit all decisions for the week

> **Important:** Decisions are final once submitted. You cannot change them — just like real executive decisions.

### Step 17 — Students Review Week Results

After submitting decisions:

1. Navigate to **Week Results**
2. Review:
   - **AI essay feedback** — detailed evaluation of your written responses
   - **Decision outcomes** — how your choices affected the company
   - **Score changes** — impact on financial and cultural metrics
3. Use the feedback to improve future responses

### Step 18 — Students Check the Leaderboard

1. Navigate to **Leaderboard** from the sidebar
2. See how your team ranks against classmates
3. Rankings show pseudonymous IDs — no real names appear
4. Scores are broken down by financial and cultural performance

---

## Phase 5: Using the Phone-a-Friend Advisor System

### Step 19 — Students Consult Advisors (Optional)

When facing particularly challenging decisions, students can use the **Phone-a-Friend** system:

- **3 credits per semester** — use them wisely
- **9 specialized advisors** available:
  - CEO Coach
  - CFO Strategist
  - HR Expert
  - Union Relations Specialist
  - Technology Advisor
  - Crisis Manager
  - Legal Counsel
  - Communications Director
  - Operations Expert
- Each advisor provides **AI-generated strategic guidance** tailored to your situation
- Advisors understand the stakeholder dynamics and current company context
- Guidance is confidential — it doesn't affect your score, but can improve your decision-making

> **Tip:** Save your advisor credits for the most complex decisions. Weeks 4-7 tend to present the toughest trade-offs.

---

## Phase 6: Instructor Monitors Progress

### Step 20 — Review Student Performance

Throughout the simulation, instructors can:

1. **View the Admin Dashboard** to see:
   - Which students have submitted decisions each week
   - Team scores and rankings
   - Individual essay scores and AI feedback
2. **Track engagement** — which students have read briefings, listened to voicemails, and viewed intel articles
3. **Review essays** — read student responses and the AI's evaluation

### Step 21 — Use the Offline Roster for Grading

When entering grades in your LMS:

1. Open your completed privacy roster CSV
2. Match each pseudonym's simulation scores to the real student
3. Transfer grades according to your syllabus weighting

> **Tip:** Export the leaderboard or results data from the admin dashboard, then cross-reference with your offline roster. All exported data uses pseudonymous IDs only.

---

## Phase 7: Completing the Simulation

### Step 22 — Final Week

1. Instructor advances to **Week 8** (the final week)
2. Students complete their last set of decisions and essays
3. Final scores are calculated

### Step 23 — Review Final Results

**Students:**
- Check your final Dashboard scores
- Review the final Leaderboard standings
- Reflect on how your strategy evolved over 8 weeks

**Instructor:**
- Export final scores from the Admin Dashboard
- Map pseudonymous scores to real students using your offline roster
- Enter final simulation grades in your LMS

---

## Tips for Students

**Read everything.** Intel articles and voicemails contain hints about upcoming challenges and valuable data points for your essays.

**Consider all stakeholders.** Employees, board members, union representatives, and customers all have valid perspectives. The best decisions acknowledge multiple viewpoints.

**Balance short-term and long-term thinking.** Quick wins can backfire later in the simulation. Sustainable strategies that consider long-term consequences tend to perform better.

**Write thoughtful essays.** Quality reasoning matters as much as the choice itself. Reference specific data from briefings and explain your logic clearly.

**Track your metrics.** Monitor your Dashboard regularly. Watch for warning signs in morale, union sentiment, or cash flow before they become crises.

**Learn from your results.** Review your Week Results carefully. The AI feedback highlights specific areas for improvement in future responses.

---

## Frequently Asked Questions

**Q: I forgot my pseudonym. How do I find it?**
A: Your pseudonymous ID appears on the leaderboard next to your team's scores. It looks like `Student_` followed by 8 characters. If you can't locate it, ask your instructor — they can look it up on the admin dashboard.

**Q: Can I use my real name instead of the pseudonym?**
A: In Privacy Mode, the platform identifies you by your pseudonymous ID. Even if you enter a name during enrollment, the leaderboard and submissions display your pseudonymous ID to maintain anonymity.

**Q: I can't log in. What should I do?**
A: Make sure you're signing in with the same Replit account you used to enroll. If you created a new Replit account, it won't be linked to your enrollment. Contact your instructor or email support@futureworkacademy.com.

**Q: Can I change my decisions after submitting?**
A: No, decisions are final once submitted — just like in real business situations.

**Q: How long do I have to complete each week?**
A: Your instructor controls the simulation pace. Check with them for specific deadlines.

**Q: Do intel articles affect my score?**
A: Reading them contributes to an engagement bonus, and the information can strengthen your essay responses.

**Q: What if my team members disagree on decisions?**
A: In team mode, coordinate with teammates. Use the decision discussions to build consensus before submitting.

**Q: Can I replay weeks or restart?**
A: No, the simulation progresses forward only. This mirrors real executive decision-making where you can't undo past choices.

**Q: Does the AI grader know my real identity?**
A: No. In Privacy Mode, the AI evaluator receives only your written response text. No names, emails, or other PII are included in the grading request.

**Q: How does my instructor know my score if everything is anonymous?**
A: Your instructor downloads a roster template from the admin dashboard that lists all pseudonymous IDs. They then collect your pseudonym separately (via a class survey or form) and map it to your real identity offline. The platform never sees this mapping.

---

## Quick Reference

### Instructor Checklist — Before the Semester

- [ ] Create organization with Privacy Mode enabled
- [ ] Create teams and note the team codes
- [ ] Distribute team codes to students
- [ ] Confirm students have enrolled (check admin dashboard)
- [ ] Download the privacy roster template
- [ ] Collect student pseudonyms via offline survey
- [ ] Complete the roster mapping (pseudonym to real student)

### Student Checklist — Each Week

1. Check Dashboard for company status
2. Navigate to Intelligence Briefing
3. Read the situation report carefully
4. Listen to all stakeholder voicemails
5. Review intel articles for data points
6. Navigate to Decisions
7. Select your choices and write essay responses
8. Submit all decisions
9. Review Week Results and AI feedback
10. Check the Leaderboard

### Scoring Weights (Default)

- Financial Performance: 50%
- Cultural Health: 50%
- (Your instructor may adjust these weights)

### Essay Writing Checklist

- [ ] Reference specific data from briefings and articles
- [ ] Explain logical reasoning clearly
- [ ] Acknowledge trade-offs and risks
- [ ] Consider multiple stakeholder perspectives
- [ ] Stay within word limits

---

*Last updated: February 2026*

*Future Work Academy — A Business Simulation for Tomorrow's Leaders*
