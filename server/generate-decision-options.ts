import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import { eq, and } from 'drizzle-orm';
import { db } from './db';
import { simulationContent } from '@shared/models/auth';

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

interface CanonicalData {
  company: {
    name: string;
    industry: string;
    size: string;
    annualRevenue: number;
    employees: number;
    averageTenure: number;
    location: string;
    founded: number;
  };
  weeks: Array<{ number: number; title: string; theme: string }>;
  characters: Array<{ name: string; role: string; influence: number; hostility: number; nickname?: string }>;
  competitors: Array<{ name: string; approach: string; outcome: string }>;
}

const MODULE_ID = 'ab027ff4-ff8b-4898-8a19-6c44c10b0cdc';

function loadCanonicalData(): CanonicalData {
  const canonicalPath = path.join(process.cwd(), 'docs', 'canonical.json');
  const content = fs.readFileSync(canonicalPath, 'utf-8');
  return JSON.parse(content);
}

interface DecisionSpec {
  weekNumber: number;
  decisionTitle: string;
  context: string;
  options: Array<{
    label: string;
    financialImplications: string;
    stakeholderImpacts: string;
    calculationRequirements: string;
  }>;
  keyMetrics: string[];
  tradeoffs: string;
}

const decisionSpecs: DecisionSpec[] = [
  {
    weekNumber: 1,
    decisionTitle: "AI Transformation Investment Level",
    context: "The board has approved transformation. You must determine the investment level for Year 1 automation.",
    options: [
      {
        label: "Conservative Path ($8M investment)",
        financialImplications: "Capital outlay: $8M. Expected productivity gain: 12%. Payback period: 4.2 years. NPV at 10% discount: $2.1M over 5 years. Reduces 85 positions over 18 months.",
        stakeholderImpacts: "Victoria Hartwell: Disappointed but accepting. David Chen: Approves conservative cash management. Frank Torres: Relieved at slower pace. Union risk: Low (15% probability).",
        calculationRequirements: "Calculate IRR, compare to WACC of 9.5%. Model cash flow timing. Assess probability-weighted NPV with union risk scenarios."
      },
      {
        label: "Aggressive Transformation ($18M investment)",
        financialImplications: "Capital outlay: $18M (requires $6M additional debt at 7.2% APR). Expected productivity gain: 35%. Payback period: 2.8 years. NPV at 10% discount: $8.4M over 5 years. Eliminates 210 positions over 24 months.",
        stakeholderImpacts: "Victoria Hartwell: Strongly approves. Patricia Lawson: Concerned about debt covenants (debt/EBITDA rising to 3.2x). Marcus Webb: High alert. Employee morale: -15 points initially.",
        calculationRequirements: "Model debt service coverage ratio impact. Calculate break-even timeline. Assess covenant breach probability. Run sensitivity analysis on productivity assumptions."
      },
      {
        label: "Phased Hybrid Approach ($12M Year 1, $8M Year 2)",
        financialImplications: "Total: $20M over 2 years. Expected productivity gain: 28% by end of Year 2. Payback period: 3.1 years. NPV at 10% discount: $6.2M. Workforce reduction: 145 positions with 6-month retraining buffer.",
        stakeholderImpacts: "All stakeholders: Moderate support. Allows course correction. Higher execution complexity. Requires maintaining transformation team for 24 months (additional $1.2M in consulting/training costs).",
        calculationRequirements: "Compare staged vs. lump sum NPV. Model learning curve effects. Calculate option value of delayed commitment. Assess talent retention risk premium."
      }
    ],
    keyMetrics: ["NPV", "IRR", "Payback Period", "Debt/EBITDA", "Headcount Impact", "Morale Score"],
    tradeoffs: "Speed vs. financial risk vs. workforce disruption. Board expectations vs. community relations. Short-term EPS impact vs. long-term competitive position."
  },
  {
    weekNumber: 2,
    decisionTitle: "Talent Pipeline Strategy",
    context: "You need AI/robotics talent but face a constrained local labor market. Nearest talent hub is 200 miles away.",
    options: [
      {
        label: "Build Internal Academy ($2.4M over 18 months)",
        financialImplications: "Training investment: $2.4M. Productivity loss during training: $800K (4 hours/week per trainee). Success rate: 65% of trainees qualify. Cost per qualified technician: $38K vs. $95K external hire.",
        stakeholderImpacts: "Sandra Williams: Champions this approach. Frank Torres: Skeptical of production impact. Existing workers: High morale boost (+8 points). Community: Strong positive PR.",
        calculationRequirements: "Calculate cost per qualified outcome. Model productivity drag during training. Compare 3-year TCO vs. external hiring. Factor in retention probability (internal: 85%, external: 62%)."
      },
      {
        label: "Acquire Talent Externally ($4.8M recruiting + relocation)",
        financialImplications: "Recruiting costs: $18K per hire. Relocation packages: $35K average. Salary premium: 22% above local rates. Year 1 total: $4.8M for 40 specialists. Turnover risk: 38% in Year 1.",
        stakeholderImpacts: "Victoria Hartwell: Approves speed. Existing workforce: Resentment (morale -6 points). Jaylen Brooks: May leave if passed over. Two-tier workforce risk.",
        calculationRequirements: "Model expected value with turnover scenarios. Calculate true cost including replacement cycles. Assess culture integration costs. Compare time-to-productivity."
      },
      {
        label: "Hybrid: Partner with Community College + Selective External",
        financialImplications: "Partnership investment: $1.5M (shared with state grant $600K). External hires: 15 critical roles at $1.8M. Total: $2.7M. Pipeline produces 25 qualified workers in 12 months, 40 in 24 months.",
        stakeholderImpacts: "Mayor Angela Reyes: Strong support (economic development win). Sandra Williams: Supports. Creates sustainable pipeline. Slower initial ramp but lower long-term cost.",
        calculationRequirements: "Calculate grant ROI and co-investment leverage. Model pipeline capacity vs. demand curve. Assess political capital value. Compare 5-year talent cost projections."
      }
    ],
    keyMetrics: ["Cost per Qualified Hire", "Time to Productivity", "Retention Rate", "Training ROI", "Culture Integration Risk"],
    tradeoffs: "Speed vs. cost vs. culture fit. External talent premium vs. internal development investment. Community relations vs. operational urgency."
  },
  {
    weekNumber: 3,
    decisionTitle: "Union Organizing Response",
    context: "Marcus Webb is actively organizing. 34% of workforce has signed authorization cards. NLRB election could be filed.",
    options: [
      {
        label: "Proactive Engagement: Voluntary Recognition with Terms",
        financialImplications: "Legal fees: $150K. Contract negotiation costs: $400K. Wage increase commitment: 3.5% (adds $2.8M annually). Job security provisions limit flexibility, estimated cost: $1.2M/year in reduced optimization.",
        stakeholderImpacts: "Marcus Webb: Partial victory, reduced hostility (-3 points). Workforce: Morale +12 points. Victoria Hartwell: Deeply concerned. William Thornton III: May push for board changes.",
        calculationRequirements: "Calculate total cost of union contract over 5 years. Model impact on transformation flexibility. Assess strike probability under alternative scenarios. Compare NPV of proactive vs. reactive paths."
      },
      {
        label: "Counter-Campaign: Aggressive but Legal Opposition",
        financialImplications: "Legal/consulting fees: $800K. Captive audience meetings cost: $200K in lost productivity. Win probability: 55%. If union wins anyway: adversarial relationship adds $500K annually in grievance costs.",
        stakeholderImpacts: "Marcus Webb: Hostility +3 points. Workforce: Split (morale -8 points for union supporters, +4 for opponents). Frank Torres: Supports. Community: Negative press risk.",
        calculationRequirements: "Expected value calculation with win/lose scenarios. Model reputation damage costs. Calculate NLRB violation risk (estimated 15% probability, $100K average penalty). Run decision tree analysis."
      },
      {
        label: "Strategic Delay: Address Concerns, Don't Fight Organization",
        financialImplications: "Investment in immediate improvements: $1.2M (wages, conditions, communication). Legal monitoring: $200K. Delays election 3-6 months. May reduce support below 50% threshold.",
        stakeholderImpacts: "Marcus Webb: Suspicious but less hostile. Workforce: Appreciates improvements. Robert Nakamura: Advises caution on ULP risk. Buys time for transformation proof points.",
        calculationRequirements: "Model probability of support erosion with improvements. Calculate cost-benefit of voluntary improvements vs. negotiated contract. Assess legal risk of timing."
      }
    ],
    keyMetrics: ["5-Year Contract Cost", "Strike Probability", "Legal Risk Exposure", "Morale Impact", "Transformation Flexibility"],
    tradeoffs: "Control vs. worker relations. Short-term costs vs. long-term flexibility. Board expectations vs. workforce stability."
  },
  {
    weekNumber: 4,
    decisionTitle: "First Wave Displacement Strategy",
    context: "47 positions are being eliminated. These are real people with families. The community and remaining employees are watching.",
    options: [
      {
        label: "Premium Severance Package ($3.2M total)",
        financialImplications: "Severance: 4 weeks per year of service (avg $42K per employee). Outplacement services: $8K per person. Extended healthcare: 12 months ($1.1M). Total: $3.2M. Unemployment insurance impact: +$180K annually for 3 years.",
        stakeholderImpacts: "Departing workers: Grateful. Remaining workforce: Morale +10 points (trust in company). Sandra Williams: Strongly advocates. CFO David Chen: Concerned about precedent for future waves.",
        calculationRequirements: "Calculate per-employee cost vs. industry benchmarks. Model impact on future displacement economics (precedent effect). Assess wrongful termination risk reduction. Compare to minimum legal requirements."
      },
      {
        label: "Standard Severance with Retraining Priority ($1.8M)",
        financialImplications: "Severance: 2 weeks per year of service (avg $21K). Outplacement: $3K per person. Retraining voucher: $5K for approved programs. Total: $1.8M. 15 of 47 may qualify for internal redeployment.",
        stakeholderImpacts: "Departing workers: Disappointed but accept. Remaining workforce: Morale +4 points. Frank Torres: Pragmatic support. Sets sustainable precedent for 200+ future displacements.",
        calculationRequirements: "Model retraining success probability. Calculate lifetime cost if this becomes template for all 250 projected displacements. Assess litigation probability (estimated 8% file claims at standard package)."
      },
      {
        label: "Minimum Compliance + Community Investment ($1.2M + $800K)",
        financialImplications: "Legal minimum severance: $1.2M. Community fund for local job creation: $800K (tax-advantaged). Partnership with economic development agency. Creates jobs for some displaced workers.",
        stakeholderImpacts: "Departing workers: Angry (morale impact -5 for remaining). Mayor Angela Reyes: Appreciates community investment. Victoria Hartwell: Questions optics. May generate negative press.",
        calculationRequirements: "Calculate tax benefit of community investment. Model PR impact on customer relationships. Assess risk of organized protest. Compare direct vs. indirect support economics."
      }
    ],
    keyMetrics: ["Per-Employee Cost", "Litigation Risk", "Remaining Workforce Morale", "Precedent Cost for Future Waves", "Community Relations Score"],
    tradeoffs: "Generosity vs. precedent-setting vs. community investment. Direct support vs. systemic solutions. Emotional impact vs. financial sustainability."
  },
  {
    weekNumber: 5,
    decisionTitle: "Management Sustainability Crisis",
    context: "3 mid-level managers quit this month. Remaining supervisors show burnout symptoms. Gen Z employees openly question company direction.",
    options: [
      {
        label: "Comprehensive Manager Support Program ($1.4M)",
        financialImplications: "Executive coaching: $400K (15 managers x $26K). Workload audit and rebalancing: $200K consulting. Mental health benefits expansion: $300K annually. Retention bonuses: $500K (tied to 18-month commitment).",
        stakeholderImpacts: "Managers: Morale +15 points. Sandra Williams: Fully supports. Jaylen Brooks: Wants similar investment in frontline. Risk of perceived favoritism between management and labor.",
        calculationRequirements: "Calculate cost of manager turnover (estimated $180K per departure including knowledge loss). Model ROI of retention bonuses. Compare coaching cost to replacement recruiting costs."
      },
      {
        label: "Organizational Restructure: Flatten Hierarchy ($600K transition cost)",
        financialImplications: "Eliminate 2 management layers. Transition costs: $600K. Ongoing savings: $1.8M annually in reduced management headcount. Increases span of control from 8 to 14 reports.",
        stakeholderImpacts: "Remaining managers: Mixed (more autonomy but more stress). Gen Z workers: Approve of less hierarchy. Victoria Hartwell: Likes efficiency. Risk of control gaps during transformation.",
        calculationRequirements: "Model productivity impact of increased span of control. Calculate break-even timeline. Assess transformation execution risk with fewer managers. Compare to industry benchmarks."
      },
      {
        label: "Gen Z Leadership Pipeline ($800K pilot)",
        financialImplications: "Accelerated development program: $800K (20 participants x $40K investment). Promotes 8 Gen Z employees to supervisor roles within 12 months. May lose 3-5 current managers who feel bypassed.",
        stakeholderImpacts: "Jaylen Brooks, Destiny Martinez: Highly engaged. Current supervisors: Threatened. Creates generational tension. Signals future-focused culture to younger workforce.",
        calculationRequirements: "Calculate expected value of accelerated promotions vs. traditional timeline. Model knowledge transfer costs if experienced managers leave. Assess Gen Z retention impact."
      }
    ],
    keyMetrics: ["Manager Turnover Rate", "Span of Control", "Development Cost per Promotion", "Generational Mix", "Burnout Index"],
    tradeoffs: "Supporting existing managers vs. accelerating new leaders. Hierarchy stability vs. organizational agility. Experience vs. fresh perspective."
  },
  {
    weekNumber: 6,
    decisionTitle: "Financial Restructuring Under Pressure",
    context: "Transformation costs exceeded budget by 18%. Patricia Lawson demands debt covenant review. Board wants answers.",
    options: [
      {
        label: "Pause Transformation, Shore Up Balance Sheet",
        financialImplications: "Halt $4M in planned Year 2 automation. Reduces debt by $4M. Improves debt/EBITDA from 3.4x to 2.8x. Satisfies Patricia Lawson. Delays productivity gains by 18 months. Loses $2.1M in already-negotiated vendor discounts.",
        stakeholderImpacts: "Patricia Lawson: Satisfied. Victoria Hartwell: Furious (may call for CEO replacement). William Thornton III: May trigger PE exit provisions. Workforce: Uncertain about company commitment.",
        calculationRequirements: "Calculate NPV loss from delayed transformation. Model covenant compliance scenarios. Assess probability of board action under each path. Compare sunk cost vs. future investment value."
      },
      {
        label: "Negotiate Covenant Relief, Maintain Momentum",
        financialImplications: "Bank amendment fee: $350K. Higher interest rate: +0.75% (adds $280K annually). Maintain full transformation investment. Requires quarterly financial reporting (adds $150K in audit costs). Debt/EBITDA waiver to 3.8x for 18 months.",
        stakeholderImpacts: "Patricia Lawson: Reluctantly agrees (hostility +1). David Chen: Strained relationship with bank. Victoria Hartwell: Supports keeping transformation on track. Demonstrates commitment to plan.",
        calculationRequirements: "Calculate total cost of covenant relief. Compare to transformation delay economics. Model probability of future covenant issues. Assess bank relationship long-term value."
      },
      {
        label: "Asset Sale and Leaseback ($6M liquidity injection)",
        financialImplications: "Sell manufacturing equipment, lease back. Immediate liquidity: $6M. Annual lease cost: $1.1M (15-year term). Improves debt ratios immediately. Reduces book value of assets.",
        stakeholderImpacts: "David Chen: Creative financial engineering. Patricia Lawson: Accepts as balance sheet improvement. Victoria Hartwell: Concerned about long-term flexibility. Industry analysts may question.",
        calculationRequirements: "Calculate effective interest rate of sale-leaseback vs. traditional financing. Model impact on future acquisition/exit valuation. Assess lease accounting implications (ASC 842)."
      }
    ],
    keyMetrics: ["Debt/EBITDA Ratio", "Covenant Compliance Margin", "Transformation NPV Impact", "Bank Relationship Score", "Board Confidence"],
    tradeoffs: "Financial safety vs. transformation momentum. Short-term ratios vs. long-term value creation. Bank relations vs. board expectations."
  },
  {
    weekNumber: 7,
    decisionTitle: "Competitive Positioning Response",
    context: "AutoCorp is considering diversifying suppliers. PrecisionParts won 'Best Employer' award. Industry analysts question Apex's strategy.",
    options: [
      {
        label: "Customer Retention Investment ($2.8M)",
        financialImplications: "Price reduction for AutoCorp: 4% ($1.6M annual margin sacrifice). Quality guarantee program: $400K. Dedicated account team: $800K annually. Locks in 3-year contract. Protects $28M annual revenue.",
        stakeholderImpacts: "Thomas Richardson: Satisfied, maintains relationship. Jennifer Park: Advocates strongly. Victoria Hartwell: Concerned about margin erosion. Other customers may demand similar terms.",
        calculationRequirements: "Calculate customer lifetime value under retention scenario vs. loss scenario. Model probability of customer defection without investment. Assess precedent risk with other customers."
      },
      {
        label: "Aggressive New Customer Acquisition ($1.5M)",
        financialImplications: "Sales expansion: 3 new account executives ($450K). Marketing campaign: $400K. Trade show presence: $200K. Customer development: $450K. Expected new revenue: $8M in 18 months (35% probability).",
        stakeholderImpacts: "Jennifer Park: Supports diversification. Thomas Richardson: Feels neglected (hostility +2). Dr. Nathan Cross: Notes strategic pivot. Reduces AutoCorp concentration risk from 42% to 36%.",
        calculationRequirements: "Calculate expected value of new customer pipeline. Model customer concentration risk reduction value. Assess sales cycle probability. Compare CAC to industry benchmarks."
      },
      {
        label: "Employer Brand Campaign ($1.2M)",
        financialImplications: "PR campaign highlighting workforce investment: $500K. Industry awards submissions: $100K. Recruiting brand upgrade: $300K. Employee ambassador program: $300K. May attract better talent, improve retention.",
        stakeholderImpacts: "Sandra Williams: Champions. Jaylen Brooks: Skeptical of 'marketing over substance.' Dr. Nathan Cross: May improve analyst coverage. Competitors: Notice and may respond.",
        calculationRequirements: "Calculate employer brand ROI (reduced recruiting costs, improved retention). Model indirect impact on customer perception. Assess competitive response probability."
      }
    ],
    keyMetrics: ["Customer Concentration", "Net Revenue Retention", "Customer Acquisition Cost", "Employer Brand Score", "Analyst Sentiment"],
    tradeoffs: "Existing customer defense vs. new market development. Price vs. differentiation. Internal investment vs. external positioning."
  },
  {
    weekNumber: 8,
    decisionTitle: "3-Year Strategic Direction",
    context: "Final week. Board expects a comprehensive strategic plan. Your decisions will shape Apex's next chapter.",
    options: [
      {
        label: "Full Transformation Leadership Position",
        financialImplications: "3-year investment: $45M total. Target: 65% automation by Year 3. Expected revenue growth: 22%. Workforce reduction: 35% (from 2,400 to 1,560). EBITDA margin improvement: 8 percentage points. Requires $15M additional capital.",
        stakeholderImpacts: "Victoria Hartwell: Strongly supports. William Thornton III: Sees PE exit opportunity. Workforce: Significant anxiety. Community: Major displacement concerns. Positions Apex as industry technology leader.",
        calculationRequirements: "Build full 3-year financial model. Calculate terminal value at various exit multiples. Model workforce transition costs. Assess capital raise options (debt vs. equity)."
      },
      {
        label: "Balanced Stakeholder Model",
        financialImplications: "3-year investment: $28M. Target: 45% automation by Year 3. Revenue growth: 14%. Workforce reduction: 18% (to 1,968) with robust retraining. EBITDA margin improvement: 5 percentage points. Fundable from operations + modest debt.",
        stakeholderImpacts: "All stakeholders: Moderate satisfaction. No group gets everything they want. Preserves optionality. May be seen as indecisive by aggressive board members. Sustainable pace reduces execution risk.",
        calculationRequirements: "Model stakeholder satisfaction index. Calculate risk-adjusted returns. Compare execution probability across scenarios. Assess competitive positioning implications."
      },
      {
        label: "Workforce-First Transformation",
        financialImplications: "3-year investment: $22M. Target: 35% automation by Year 3. Revenue growth: 8%. Workforce reduction: 8% (to 2,208) primarily through attrition. EBITDA margin improvement: 3 percentage points. Lower risk, lower return profile.",
        stakeholderImpacts: "Sandra Williams, Frank Torres: Strong support. Marcus Webb: Cautiously optimistic. Victoria Hartwell: Disappointed. William Thornton III: May push for sale. Community: Positive relations. Employee morale: +20 points.",
        calculationRequirements: "Calculate employee lifetime value retention benefit. Model attrition-based transition timeline. Assess competitive vulnerability. Compare to competitor PrecisionParts success metrics."
      },
      {
        label: "Strategic Sale Process",
        financialImplications: "Engage investment bank: $2M. Sale process timeline: 9-12 months. Estimated valuation: 6-8x EBITDA ($54M-$72M). Founders and long-tenured employees may receive retention packages. New owner determines transformation strategy.",
        stakeholderImpacts: "William Thornton III: Supports liquidity event. Victoria Hartwell: Mixed feelings about legacy. Workforce: High uncertainty (new owner's intentions unknown). Community: Concerns about new ownership priorities.",
        calculationRequirements: "Build valuation model with comparable transactions. Calculate shareholder returns under sale vs. continue scenarios. Model employee retention probability during sale process."
      }
    ],
    keyMetrics: ["3-Year NPV", "Terminal Valuation", "Workforce Retention", "Stakeholder Satisfaction Index", "Execution Risk Score", "Legacy Impact"],
    tradeoffs: "Growth vs. stability. Shareholder returns vs. stakeholder value. Speed vs. sustainability. Control vs. exit."
  }
];

async function generateDecisionOption(
  spec: DecisionSpec,
  optionIndex: number,
  canon: CanonicalData
): Promise<string> {
  const option = spec.options[optionIndex];
  const week = canon.weeks.find(w => w.number === spec.weekNumber);

  const prompt = `You are creating a decision option for an MBA-level business simulation game.

CONTEXT:
Company: ${canon.company.name} (${canon.company.industry})
Revenue: $${(canon.company.annualRevenue / 1000000).toFixed(0)}M | Employees: ${canon.company.employees}
Week ${spec.weekNumber}: "${week?.title}" - Theme: ${week?.theme}

DECISION: ${spec.decisionTitle}
${spec.context}

OPTION: ${option.label}

Write a comprehensive decision option document that includes:

1. EXECUTIVE SUMMARY (100 words)
A concise overview of this strategic choice.

2. FINANCIAL ANALYSIS (250 words)
${option.financialImplications}
Expand with realistic supporting calculations, assumptions, and sensitivity ranges.

3. STAKEHOLDER IMPACT ASSESSMENT (200 words)
${option.stakeholderImpacts}
Expand with specific behavioral predictions and relationship dynamics.

4. IMPLEMENTATION REQUIREMENTS (150 words)
Detail the operational steps, timeline, and resources required.

5. RISK ANALYSIS (150 words)
Identify 3-4 key risks with probability and impact estimates.

6. QUANTITATIVE WORKSHEET (200 words)
Provide specific numbers students should calculate:
${option.calculationRequirements}
Include formulas and data points needed.

7. KEY TRADE-OFFS
${spec.tradeoffs}

8. SUCCESS METRICS
Track these KPIs: ${spec.keyMetrics.join(', ')}

Write in professional business strategy language. Include realistic numbers, percentages, and dollar amounts.
Use markdown formatting with clear headers.
Total length: 900-1,100 words.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are a senior strategy consultant writing decision analysis documents for MBA students. Your writing combines rigorous quantitative analysis with strategic insight. You use realistic financial metrics, industry benchmarks, and sophisticated business frameworks. Every recommendation includes specific numbers that students must analyze and calculate.`
      },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 2500,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error(`No content generated for Week ${spec.weekNumber}, Option ${optionIndex + 1}`);
  }
  return content;
}

async function main() {
  console.log('Loading canonical data...\n');
  const canon = loadCanonicalData();

  console.log(`Company: ${canon.company.name}`);
  console.log(`Decision specifications: ${decisionSpecs.length} weeks`);
  console.log(`Total options to generate: ${decisionSpecs.reduce((sum, s) => sum + s.options.length, 0)}\n`);

  const existingDecisions = await db
    .select()
    .from(simulationContent)
    .where(
      and(
        eq(simulationContent.moduleId, MODULE_ID),
        eq(simulationContent.contentType, 'decision')
      )
    );

  console.log(`Existing decisions in database: ${existingDecisions.length}\n`);

  let generated = 0;
  for (const spec of decisionSpecs) {
    console.log(`\nWeek ${spec.weekNumber}: ${spec.decisionTitle}`);

    for (let i = 0; i < spec.options.length; i++) {
      const option = spec.options[i];
      const existingMatch = existingDecisions.find(
        d => d.weekNumber === spec.weekNumber && d.title?.includes(option.label.split('(')[0].trim())
      );

      if (existingMatch) {
        console.log(`  [SKIP] Option ${i + 1}: ${option.label.substring(0, 40)}... (already exists)`);
        continue;
      }

      try {
        console.log(`  Generating Option ${i + 1}: ${option.label.substring(0, 40)}...`);
        const content = await generateDecisionOption(spec, i, canon);

        await db.insert(simulationContent).values({
          id: crypto.randomUUID(),
          moduleId: MODULE_ID,
          weekNumber: spec.weekNumber,
          contentType: 'decision',
          title: `Week ${spec.weekNumber} Decision: ${option.label}`,
          content: content,
          order: i + 1,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        console.log(`    Saved (${content.length} chars)`);
        generated++;
      } catch (error) {
        console.error(`  ERROR generating Option ${i + 1}:`, error);
      }
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`Decision option generation complete!`);
  console.log(`Generated: ${generated} new options`);
  console.log('='.repeat(50));
}

main().catch(console.error);
