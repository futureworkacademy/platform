import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export interface RationaleEvaluation {
  researchQualityScore: number;
  evidenceUsed: string[];
  reasoning: string;
  overallQuality: "excellent" | "good" | "adequate" | "poor";
}

const RESEARCH_CONTEXT = `
You are evaluating student rationales for business decisions in a simulation about manufacturing AI adoption.

Key research topics students should reference:
- Labor shortage statistics (415,000 unfilled jobs, 2.1 million projected by 2030)
- Workforce demographics (26% approaching retirement, Gen Z management refusal 72%)
- Tariff impacts (25% steel/aluminum, 50% copper)
- Competitor case studies (MicroPrecision FDA failure, PrecisionFirst success)
- Manufacturing compensation ($102,000 average)
- Workforce solutions (community college partnerships, dual career tracks, Master Technician paths)
- Geographic factors (Iowa labor shortage)
- Regulatory requirements (FDA medical device compliance)
- Industry trends (reshoring, automation ROI)

Evaluate how well the student demonstrates understanding of these concepts and applies them to their decision.
`;

export async function evaluateRationale(
  rationale: string,
  decisionContext: string,
  weekNumber: number
): Promise<RationaleEvaluation> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [
        {
          role: "system",
          content: RESEARCH_CONTEXT,
        },
        {
          role: "user",
          content: `Week ${weekNumber} Decision Context: ${decisionContext}

Student's Rationale:
"${rationale}"

Evaluate this rationale and respond with a JSON object containing:
1. "researchQualityScore": A number from 0-100 indicating how well they used research/evidence
2. "evidenceUsed": An array of strings listing specific research points they referenced
3. "reasoning": A brief explanation of your evaluation (2-3 sentences)
4. "overallQuality": One of "excellent", "good", "adequate", or "poor"

Scoring guide:
- 93-100 (excellent): Cites specific statistics/case studies with source codes, applies research directly to decision with multi-dimensional reasoning
- 72-92 (good): References general concepts from materials, shows solid understanding with some evidence
- 52-71 (adequate): Basic reasoning but limited research application
- 0-51 (poor): No evidence of research use, generic or off-topic response

Respond ONLY with the JSON object, no additional text.`,
        },
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 500,
    });

    const content = response.choices[0]?.message?.content || "{}";
    const evaluation = JSON.parse(content) as RationaleEvaluation;

    return {
      researchQualityScore: Math.min(100, Math.max(0, evaluation.researchQualityScore || 0)),
      evidenceUsed: evaluation.evidenceUsed || [],
      reasoning: evaluation.reasoning || "Unable to evaluate",
      overallQuality: evaluation.overallQuality || "poor",
    };
  } catch (error) {
    console.error("[LLM Evaluation] Failed to evaluate rationale:", error);
    return {
      researchQualityScore: 0,
      evidenceUsed: [],
      reasoning: "Evaluation service unavailable",
      overallQuality: "poor",
    };
  }
}

export function calculateEasterEggBonus(
  evaluation: RationaleEvaluation,
  bonusPercentage: number
): number {
  if (evaluation.overallQuality === "excellent") {
    return bonusPercentage;
  } else if (evaluation.overallQuality === "good") {
    return Math.round(bonusPercentage * 0.6);
  } else if (evaluation.overallQuality === "adequate") {
    return Math.round(bonusPercentage * 0.3);
  }
  return 0;
}

// Rubric-based evaluation for text/essay responses
export interface RubricCriterionInput {
  id: string;
  name: string;
  description: string;
  maxPoints: number;
  evaluationGuidelines: string;
}

export interface RubricScoreResult {
  criterionId: string;
  criterionName: string;
  score: number;
  maxPoints: number;
  feedback: string;
}

export interface RubricEvaluationResult {
  rubricScores: RubricScoreResult[];
  totalScore: number;
  maxPossibleScore: number;
  percentageScore: number;
  overallFeedback: string;
  strengths: string[];
  areasForImprovement: string[];
}

export async function evaluateTextResponse(
  response: string,
  promptContext: string,
  rubricCriteria: RubricCriterionInput[],
  weekNumber: number,
  stakeholderContext?: string,
  attachmentUrls?: string[]
): Promise<RubricEvaluationResult> {
  try {
    const criteriaPrompt = rubricCriteria.map(c => 
      `- ${c.name} (${c.maxPoints} points): ${c.description}
       Evaluation guide: ${c.evaluationGuidelines}`
    ).join('\n\n');

    const hasAttachments = attachmentUrls && attachmentUrls.length > 0;
    const attachmentGuidance = hasAttachments ? `

VISUAL ATTACHMENTS:
The student has attached ${attachmentUrls.length} visualization(s) (charts, tables, or diagrams) to support their analysis. When evaluating:
- Consider whether the visualizations strengthen and are relevant to their written argument
- Evaluate data literacy: Are charts properly labeled, clear, and meaningful?
- Give credit for effective use of data visualization to support reasoning
- A well-chosen chart that illustrates a key point should be treated as strong evidence, similar to citing statistics` : '';

    const systemContent = `You are an expert business education evaluator assessing student responses in a simulation about manufacturing AI adoption and workforce management. 
          
Your task is to evaluate a student's written response against a specific rubric. Be fair and reward strong work generously — graduate students who demonstrate critical thinking, cite specific evidence, and address multiple dimensions of a problem deserve scores in the top range.

SCORING CALIBRATION:
- An excellent response that cites specific data/statistics, presents clear logical reasoning, discusses trade-offs with mitigation strategies, and addresses 3+ stakeholder groups should score 23-25 per criterion (92-100 total).
- A good response with solid reasoning and some evidence but less depth should score 18-22 per criterion (72-88 total).
- An adequate response with basic reasoning and limited evidence should score 13-17 per criterion (52-68 total).
- A poor response with no evidence or off-topic content should score below 13 per criterion.
- Do NOT systematically hold back points from strong responses. If a student meets the criterion well, award the full points. A score of 25/25 is appropriate when the criterion is thoroughly satisfied.

Key topics students should understand:
- Labor shortage statistics (415,000 unfilled jobs, 2.1 million projected by 2030)
- Workforce demographics (26% approaching retirement, Gen Z management refusal 72%)
- Tariff impacts and supply chain considerations
- Case studies of success and failure in manufacturing AI adoption
- Workforce solutions (reskilling, dual career tracks, worker councils)
- Union dynamics and employee relations
- Financial trade-offs of automation investments
${attachmentGuidance}

${stakeholderContext || ''}`;

    const userTextContent = `Week ${weekNumber} Context:
${promptContext}

Student's Response:
"${response}"

Evaluate this response against these criteria:
${criteriaPrompt}

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

Be specific in feedback. Reference what the student did well or missed.${hasAttachments ? ' Comment on how effectively the student used their attached visualizations.' : ''}
Respond ONLY with the JSON object.`;

    const userContent: any[] = [{ type: "text", text: userTextContent }];
    
    if (hasAttachments) {
      const baseUrl = process.env.REPLIT_DEV_DOMAIN 
        ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
        : process.env.REPL_SLUG 
          ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`
          : 'http://localhost:5000';
      
      for (const attachmentUrl of attachmentUrls) {
        userContent.push({
          type: "image_url",
          image_url: { 
            url: `${baseUrl}${attachmentUrl}`,
            detail: "low"
          }
        });
      }
    }

    const model = hasAttachments ? "gpt-4o" : "gpt-4.1-nano";

    const response_result = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: systemContent,
        },
        {
          role: "user",
          content: hasAttachments ? userContent : userTextContent,
        },
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 1000,
    });

    const content = response_result.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(content);
    
    const rubricScores: RubricScoreResult[] = (parsed.scores || []).map((s: any) => ({
      criterionId: s.criterionId || "",
      criterionName: s.criterionName || "",
      score: Math.min(s.maxPoints || 25, Math.max(0, s.score || 0)),
      maxPoints: s.maxPoints || 25,
      feedback: s.feedback || "No feedback provided",
    }));

    const totalScore = rubricScores.reduce((sum, s) => sum + s.score, 0);
    const maxPossibleScore = rubricCriteria.reduce((sum, c) => sum + c.maxPoints, 0);
    const percentageScore = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;

    return {
      rubricScores,
      totalScore,
      maxPossibleScore,
      percentageScore,
      overallFeedback: parsed.overallFeedback || "Unable to generate feedback",
      strengths: parsed.strengths || [],
      areasForImprovement: parsed.areasForImprovement || [],
    };
  } catch (error) {
    console.error("[LLM Evaluation] Failed to evaluate text response:", error);
    
    return {
      rubricScores: rubricCriteria.map(c => ({
        criterionId: c.id,
        criterionName: c.name,
        score: 0,
        maxPoints: c.maxPoints,
        feedback: "Evaluation service unavailable",
      })),
      totalScore: 0,
      maxPossibleScore: rubricCriteria.reduce((sum, c) => sum + c.maxPoints, 0),
      percentageScore: 0,
      overallFeedback: "Evaluation service was unavailable. Please contact your instructor.",
      strengths: [],
      areasForImprovement: [],
    };
  }
}
