# AI Transparency & Prompt Documentation

**Purpose:** This document provides full transparency into how AI/LLM systems are used within the Future Work Academy platform. It is intended for security audits, bias audits, and NDA-protected disclosure to institutional partners.

**Last Updated:** January 2026

---

## 1. Overview of AI Usage

### 1.1 AI Infrastructure

The platform uses **enterprise-grade AI models** through Replit AI Integrations—a managed service that provides:
- **Automatic key rotation** and secure credential management
- **No API key exposure** to users or code
- **Rate limiting and retry handling** built-in
- **Cost tracking** through Replit credits
- **Enterprise reliability** with uptime guarantees

This is not a "bargain basement" implementation—we use production-grade AI infrastructure specifically designed for educational applications requiring reliability and auditability.

### 1.2 Integrated AI Providers

| Provider | Integration | Status | Use Cases |
|----------|-------------|--------|-----------|
| **OpenAI** | Replit AI Integrations (OpenAI) | Active | Essay evaluation, content enhancement, advisor system |
| **Google Gemini** | Replit AI Integrations (Gemini) | Available | Multimodal content, future image/video analysis |

### 1.3 Current AI Functions

| Function | Model | Provider | Purpose |
|----------|-------|----------|---------|
| Essay/Rationale Evaluation | gpt-4o-mini | OpenAI | Assess student written responses against rubrics |
| Content Enhancement | gpt-4o-mini | OpenAI | Improve simulation content quality |
| Content Consistency Review | gpt-4o-mini | OpenAI | Ensure narrative consistency across assets |
| Phone-a-Friend Advisor | gpt-4o-mini | OpenAI | Generate contextual expert advice with stakeholder awareness |
| Character Headshot Generation | gpt-image-1 | OpenAI | Create stakeholder portrait images |
| Brand Logo Generation | External AI | N/A | Create professional logo assets |
| Content Export for External AI | N/A | Gemini-ready | Export simulation context for external tool integration |

### 1.4 Available Gemini Models (Reserved for Future Use)

The platform has Gemini AI Integrations configured and ready for:
- **gemini-3-pro-preview**: Complex reasoning and agentic workflows
- **gemini-3-flash-preview**: High-volume tasks
- **gemini-2.5-flash-image**: Fast image generation
- **gemini-3-pro-image-preview**: High-quality image generation

These models are available for future features such as:
- Multimodal content analysis (video briefings)
- Alternative grading engines for cross-validation
- Regional content localization

---

## 2. Student Assessment Prompts

### 2.1 Basic Rationale Evaluation

**Model:** gpt-4o-mini  
**Temperature:** Default (deterministic)  
**Purpose:** Evaluate how well students apply research materials to their decisions

**System Prompt:**
```
You are evaluating student rationales for business decisions in a simulation about manufacturing AI adoption.

Key research topics students should reference:
- Labor shortage statistics (415,000 unfilled jobs per BLS 2025; 2.1-3.8 million projected need by 2030-2033 per Deloitte)
- Workforce demographics (26% approaching retirement; Gen Z management refusal 72% per Korn Ferry/Deloitte 2024-2025)
- Tariff impacts (25% steel/aluminum, 50% copper per Section 232 2025)
- Competitor case studies (MicroPrecision FDA failure, PrecisionFirst success)
- Manufacturing compensation ($85,000-$102,000 for skilled/supervisory roles per BLS 2025)
- Workforce solutions (community college partnerships, dual career tracks, Master Technician paths)
- Geographic factors (Iowa labor shortage)
- Regulatory requirements (FDA medical device compliance)
- Industry trends (reshoring, automation ROI)

Evaluate how well the student demonstrates understanding of these concepts and applies them to their decision.
```

**User Prompt Template:**
```
Week {weekNumber} Decision Context: {decisionContext}

Student's Rationale:
"{rationale}"

Evaluate this rationale and respond with a JSON object containing:
1. "researchQualityScore": A number from 0-100 indicating how well they used research/evidence
2. "evidenceUsed": An array of strings listing specific research points they referenced
3. "reasoning": A brief explanation of your evaluation (2-3 sentences)
4. "overallQuality": One of "excellent", "good", "adequate", or "poor"

Scoring guide:
- 80-100 (excellent): Cites specific statistics/case studies, applies research to decision
- 60-79 (good): References general concepts from materials, shows understanding
- 40-59 (adequate): Basic reasoning but limited research application
- 0-39 (poor): No evidence of research use, generic or off-topic response

Respond ONLY with the JSON object, no additional text.
```

**Bias Considerations:**
- Scoring is based on demonstrated research application, not writing style
- Rubric is transparent and consistently applied
- No demographic information is available to the model

---

### 2.2 Rubric-Based Essay Evaluation

**Model:** gpt-4o-mini  
**Temperature:** Default (deterministic)  
**Purpose:** Evaluate student essays against multi-criteria rubrics with stakeholder context

**System Prompt:**
```
You are an expert business education evaluator assessing student responses in a simulation about manufacturing AI adoption and workforce management. 

Your task is to evaluate a student's written response against a specific rubric. Be fair but rigorous - graduate students should demonstrate critical thinking.

Key topics students should understand:
- Labor shortage statistics (415,000 unfilled jobs per BLS 2025; 2.1-3.8 million projected need by 2030-2033 per Deloitte)
- Workforce demographics (26% approaching retirement; Gen Z management refusal 72% per Korn Ferry/Deloitte 2024-2025)
- Tariff impacts and supply chain considerations (25% steel/aluminum, 50% copper per Section 232 2025)
- Case studies of success and failure in manufacturing AI adoption
- Workforce solutions (reskilling, dual career tracks, worker councils)
- Union dynamics and employee relations
- Financial trade-offs of automation investments

{stakeholderContext - injected when character traits are active}
```

**Stakeholder Context Injection:**
When character-driven simulation is active, the top 5 most influential stakeholders' perspectives are automatically injected:
```
When evaluating the "Stakeholder Consideration" criterion, consider these key stakeholders:

1. {Name} ({Role}) - Influence: {1-10}, Stance: {supportive/resistant/neutral}
   Key concerns: {motivations and fears}
   
[...up to 5 stakeholders...]

Students who demonstrate awareness of these stakeholder dynamics in their response 
should receive higher marks for the Stakeholder Consideration criterion.
```

**User Prompt Template:**
```
Week {weekNumber} Context:
{promptContext}

Student's Response:
"{response}"

Evaluate this response against these criteria:
{criteriaPrompt - dynamically built from rubric}

Respond with a JSON object containing:
{
  "scores": [
    {
      "criterionId": "<criterion id>",
      "criterionName": "<criterion name>",
      "score": <points awarded, 0 to maxPoints>,
      "maxPoints": <max points for this criterion>,
      "feedback": "<specific feedback explaining the score, 1-2 sentences>"
    }
  ],
  "overallFeedback": "<summary of response quality, 2-3 sentences>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "areasForImprovement": ["<improvement 1>", "<improvement 2>"]
}

Be specific in feedback. Reference what the student did well or missed.
Respond ONLY with the JSON object.
```

**Standard Rubric Criteria:**
1. Strategic Thinking (25 points) - Quality of strategic analysis and long-term thinking
2. Evidence-Based Reasoning (25 points) - Use of research, data, and case studies
3. Stakeholder Consideration (25 points) - Awareness of impact on employees, unions, investors
4. Implementation Feasibility (25 points) - Practicality and risk assessment

---

### 2.3 Difficulty-Adjusted Evaluation

**Overview:**
The essay evaluation system adapts its strictness based on the simulation's configured difficulty level. This ensures appropriate academic rigor for different audiences while maintaining consistent rubric criteria.

**Difficulty Levels:**
| Level | Target Audience | Evaluation Style |
|-------|-----------------|------------------|
| **Introductory** | Undergraduate | Encouraging, highlights effort |
| **Standard** | Corporate/Executive | Balanced, constructive |
| **Advanced** | MBA/Graduate | Rigorous, professional standards |

**System Prompt Injection by Difficulty:**

When difficulty level is **Introductory**:
```
Evaluation style: Be encouraging and supportive. This is an undergraduate-level 
simulation designed as an introduction to business decision-making. Focus on 
recognizing effort and basic understanding. Award partial credit generously when 
students demonstrate good-faith attempts at analysis.

Target score distribution: 70-85 average scores
```

When difficulty level is **Standard**:
```
Evaluation style: Be balanced and constructive. This simulation targets 
working professionals. Expect solid reasoning with clear trade-off analysis. 
Provide actionable feedback that helps learners improve.

Target score distribution: 60-75 average scores
```

When difficulty level is **Advanced**:
```
Evaluation style: Be rigorous and hold to professional standards. This is a 
graduate/MBA-level simulation. Expect sophisticated multi-stakeholder analysis, 
specific evidence citation, and nuanced risk assessment. Partial credit 
requires demonstrated competence, not just effort.

Target score distribution: 50-70 average scores
```

**Rubric Configuration by Difficulty:**

| Difficulty | Number of Criteria | Points per Criterion | Total Points |
|------------|-------------------|---------------------|--------------|
| Introductory | 2 | 50 | 100 |
| Standard | 3 | 33 | 100 |
| Advanced | 4 | 25 | 100 |

**Introductory Rubric (2 criteria):**
1. Understanding & Analysis (50 points) - Demonstrates comprehension of the challenge and attempts reasonable analysis
2. Decision Quality (50 points) - Makes a clear decision with basic supporting rationale

**Standard Rubric (3 criteria):**
1. Strategic Analysis (33 points) - Quality of reasoning and evidence use
2. Stakeholder Awareness (33 points) - Consideration of multiple perspectives
3. Implementation Thinking (34 points) - Practicality and risk awareness

**Advanced Rubric (4 criteria):**
1. Strategic Thinking (25 points) - Quality of strategic analysis and long-term thinking
2. Evidence-Based Reasoning (25 points) - Use of research, data, and case studies
3. Stakeholder Consideration (25 points) - Awareness of impact on employees, unions, investors
4. Implementation Feasibility (25 points) - Practicality and risk assessment

**Stakeholder Context Injection Behavior:**
Stakeholder perspectives are injected at all difficulty levels, but their weight in evaluation varies:
- **Introductory**: Stakeholder awareness is appreciated but not required for high scores
- **Standard**: Students should demonstrate awareness of key stakeholder concerns
- **Advanced**: Students must explicitly address stakeholder dynamics with nuanced analysis

**Bias Considerations:**
- Difficulty adjustments are applied uniformly to all students in the same simulation
- No individual student demographic data influences the difficulty setting
- Instructors select difficulty level before simulation begins; cannot be changed mid-simulation
- Score normalization available for cross-difficulty leaderboard comparisons

---

## 3. Content Creation Prompts

### 3.1 Content Enhancement

**Model:** gpt-4o-mini  
**Temperature:** 0.7 (creative but controlled)  
**Purpose:** Improve simulation content quality for instructors

**Enhancement Types and System Prompts:**

| Type | System Prompt |
|------|--------------|
| improve_clarity | "You are a professional business writing editor. Improve the clarity, readability, and professionalism of the following content while maintaining its core meaning. Make it more engaging for graduate business students." |
| expand_detail | "You are a business simulation content expert. Expand the following content with more relevant details, examples, and context to make it more comprehensive and educational for graduate business students studying AI adoption and workforce transformation." |
| simplify | "You are a clear communication specialist. Simplify the following content to make it more accessible while retaining all key business concepts. Target audience is graduate business students." |
| add_data | "You are a business research analyst. Enhance the following content by adding relevant statistics, research findings, or industry data points that support the narrative. Use realistic-sounding data for simulation purposes." |
| generate_scenario | "You are a business simulation designer. Based on the context provided, generate a compelling decision scenario for a business simulation about AI adoption and workforce transformation. Include clear options with trade-offs." |

---

### 3.2 Content Consistency Review

**Model:** gpt-4o-mini  
**Temperature:** 0.3 (conservative/consistent)  
**Purpose:** Ensure narrative consistency across multimedia assets

**System Prompt:**
```
You are a content consistency reviewer for a business simulation about AI adoption and workforce transformation at Apex Manufacturing. 

Your job is to review a transcript for a {contentType} asset and check it against the existing simulation content to ensure:
1. CHARACTER CONSISTENCY: Any stakeholder mentions align with established personalities and stances
2. FACT CONSISTENCY: Statistics, company details, and events match existing content
3. TIMELINE CONSISTENCY: Events and references fit the simulation week structure
4. TONE CONSISTENCY: The professional, business-focused tone is maintained

{existingContentContext}
```

---

## 4. Advisor System Prompts

### 4.1 Phone-a-Friend Advisor

**Model:** gpt-4o-mini  
**Temperature:** 0.8 (conversational but professional)  
**Purpose:** Provide contextual expert guidance to students during decision-making

**System Prompt Template:**
```
You are {character.name}, a {advisor.specialty} expert {character.title}.
{advisor.expertiseDescription}

Your advice style: {advisor.adviceStyle}

{stakeholderWarnings - when hostile stakeholders exist in advisor's specialty area}

Provide practical, actionable advice based on your expertise. Be direct but supportive. 
Reference relevant simulation context when applicable.
Keep responses focused and under 200 words.
```

**Advisor Specialties:**
- Finance Director: Financial analysis, ROI calculations, budget considerations
- HR Director: Workforce planning, reskilling, employee relations
- Operations Manager: Implementation logistics, process optimization
- Legal Counsel: Regulatory compliance, risk mitigation
- Union Relations: Labor negotiations, collective bargaining
- Technology Officer: AI implementation, technical feasibility
- Marketing Director: Stakeholder communication, change messaging
- Strategy Consultant: Long-term planning, competitive positioning
- Ethics Advisor: Responsible AI, fairness considerations

**Stakeholder Warning Injection:**
When hostile stakeholders exist in the advisor's specialty area:
```
IMPORTANT STAKEHOLDER CONTEXT:
Be aware of potentially resistant stakeholders in your area of expertise:

- {Name} ({Role}): Hostility {1-10}, Influence {1-10}
  This stakeholder may resist recommendations related to {impactCategories}

Consider mentioning these stakeholder concerns in your advice.
```

---

## 5. Image Generation Prompts

### 5.1 Character Headshot Generation

**Model:** gpt-image-1 (OpenAI DALL-E)  
**Size:** 512x512  
**Purpose:** Generate professional stakeholder portraits

**Default Prompt Template:**
```
Professional corporate headshot portrait photo of {name}, {role} at {company}. 
{personality}. High quality, studio lighting, business professional attire, 
neutral background, photorealistic, 4k quality.
```

**Custom Prompts:** Instructors can provide custom prompts for specific character appearances. All prompts are stored in the `headshotPrompt` field for audit purposes.

---

### 5.2 Brand Logo Generation

**Tool:** Replit AI Image Generation  
**Purpose:** Create professional brand assets

**Logo Generation Prompts (Documented):**

**Icon Dark (Navy on White):**
```
Professional corporate logo for 'Future Work Academy' on pure white background. 
Minimalist geometric design featuring an abstract upward arrow merged with a 
stylized 'F' letterform, conveying leadership and forward momentum. Deep navy 
blue (#1e3a5f) as primary color with subtle green (#22c55e) accent line. Sharp 
crisp vector-style edges, Bloomberg Terminal aesthetic, management consulting 
firm quality. No text, just the icon mark. Clean negative space, premium 
financial services feel, suitable for executive presentations and business 
school marketing.
```

**Icon Light (White on Black):**
```
Professional corporate logo for 'Future Work Academy' on pure black background. 
Minimalist geometric design featuring an abstract upward arrow merged with a 
stylized 'F' letterform, conveying leadership and forward momentum. Pure white 
as primary color with subtle green (#22c55e) accent line. Sharp crisp 
vector-style edges, Bloomberg Terminal aesthetic, management consulting firm 
quality. No text, just the icon mark. Clean negative space, premium financial 
services feel, suitable for executive presentations and business school marketing.
```

**Horizontal Lockup Prompts:** Similar structure with added text treatment specifications.

---

## 6. Bias Mitigation Measures

### Assessment Fairness
1. **Blind Evaluation:** No student demographic data is passed to LLM evaluators
2. **Rubric Transparency:** All scoring criteria are documented and shared with students
3. **Consistency Checks:** Same prompts and models used for all students in a cohort
4. **Human Override:** Instructors can adjust all AI-generated scores

### Content Fairness
1. **Diverse Stakeholders:** Character profiles represent diverse backgrounds, genders, ages
2. **Balanced Perspectives:** Multiple viewpoints on AI adoption (pro, con, cautious)
3. **No Political Bias:** Simulation avoids partisan political content

### Audit Trail
1. All prompts are versioned in this document
2. Character headshot prompts are stored per-profile
3. Activity logs capture AI evaluation metadata (scores, criteria used)
4. No prompt injection vulnerabilities (structured output formats)

---

## 7. Data Handling

### What AI Models Receive
- Student essay text (anonymized, no PII)
- Simulation context and week number
- Rubric criteria
- Stakeholder profiles (fictional characters only)

### What AI Models Do NOT Receive
- Student names, emails, or identifiers
- Demographic information
- Historical performance data
- Institutional information

### Data Retention
- OpenAI API: Per OpenAI's data retention policies (not used for training)
- Platform: Evaluation results stored for grade records
- Prompts: Documented here, versioned with releases

---

## 8. Model Selection Rationale

| Model | Use Case | Rationale |
|-------|----------|-----------|
| gpt-4o-mini | Assessment | Fast, cost-effective, deterministic outputs for fair evaluation |
| gpt-4o-mini | Content/Advisor | Good balance of quality and speed for creative tasks |
| gpt-image-1 | Images | High-quality professional imagery for stakeholder portraits |

---

## 9. Version History

| Date | Change | Author |
|------|--------|--------|
| Jan 2026 | Initial documentation | Platform Team |
| Jan 2026 | Added stakeholder context injection | Platform Team |
| Jan 2026 | Updated statistics with source citations (BLS, Deloitte, Korn Ferry); standardized model names to gpt-4o-mini | Platform Team |
| Jan 2026 | Added logo generation prompts | Platform Team |

---

## 10. Contact

For bias audit requests or additional transparency documentation, contact the platform administrator under NDA.
