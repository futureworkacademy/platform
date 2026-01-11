import { randomUUID } from "crypto";
import type {
  Team,
  InsertTeam,
  Department,
  WeeklyBriefing,
  BriefingArticle,
  GlobalEvent,
  LeaderboardEntry,
  PeopleAnalytics,
  CompanyState,
  Decision,
  InsertDecision,
  ResearchReport,
  HistoricalData,
  WorkforceDemographics,
  WeeklyScenario,
  WeeklyDecision,
  DecisionRecord,
  EnhancedDecision,
  SimulationConfig,
  PlayerPerformance,
  AdminAnalytics,
  EasterEgg,
  PlayerDecisionSubmission,
  ActivityLog,
} from "@shared/schema";
import { defaultCompanyState } from "@shared/schema";

// Activity log storage
const activityLogs: ActivityLog[] = [];

export interface IStorage {
  getTeam(id: string): Promise<Team | undefined>;
  getAllTeams(): Promise<Team[]>;
  getDefaultTeam(): Promise<Team | null>;
  createTeam(team: InsertTeam): Promise<Team>;
  updateTeam(id: string, updates: Partial<Team>): Promise<Team | undefined>;
  getDepartments(): Promise<Department[]>;
  updateDepartment(id: string, updates: Partial<Department>): Promise<Department | undefined>;
  getWeeklyBriefing(weekNumber: number): Promise<WeeklyBriefing>;
  getWeeklyScenario(weekNumber: number): Promise<WeeklyScenario | undefined>;
  getWeeklyDecisions(weekNumber: number): Promise<WeeklyDecision[]>;
  getEnhancedDecisions(weekNumber: number): Promise<EnhancedDecision[]>;
  submitDecision(teamId: string, decisionId: string, optionId: string, rationale?: string): Promise<Team | undefined>;
  submitEnhancedDecision(playerId: string, decisionId: string, attributeValues: Record<string, number | string | boolean>, rationale: string): Promise<PlayerDecisionSubmission>;
  getLeaderboard(): Promise<LeaderboardEntry[]>;
  getPeopleAnalytics(teamId: string): Promise<PeopleAnalytics>;
  addDecision(teamId: string, decision: InsertDecision): Promise<Decision>;
  advanceWeek(teamId: string): Promise<Team | undefined>;
  getResearchReports(): Promise<ResearchReport[]>;
  getHistoricalData(): Promise<HistoricalData[]>;
  getWorkforceDemographics(): Promise<WorkforceDemographics>;
  markReportViewed(teamId: string, reportId: string): Promise<Team | undefined>;
  getResearchProgress(teamId: string): Promise<{ viewed: number; total: number; percentage: number }>;
  completeResearch(teamId: string): Promise<{ success: boolean; team?: Team; error?: string }>;
  hasActiveTeam(): Promise<boolean>;
  getSimulationConfig(): Promise<SimulationConfig>;
  updateSimulationConfig(updates: Partial<SimulationConfig>): Promise<SimulationConfig>;
  getPlayerPerformance(playerId: string): Promise<PlayerPerformance | undefined>;
  getAllPlayerPerformances(): Promise<PlayerPerformance[]>;
  getAdminAnalytics(): Promise<AdminAnalytics>;
  getEasterEggs(): Promise<EasterEgg[]>;
  detectEasterEggs(rationale: string, weekNumber: number): Promise<string[]>;
  
  // Activity logging
  logActivity(log: Omit<ActivityLog, "id" | "timestamp">): Promise<ActivityLog>;
  getActivityLogs(filters?: { eventType?: string; userId?: string; teamId?: string; startDate?: string; endDate?: string }): Promise<ActivityLog[]>;
  exportActivityLogs(format: "csv" | "json"): Promise<string>;
  
  // Educator inquiries
  createEducatorInquiry(inquiry: { name: string; email: string; phone?: string | null; institution?: string | null; inquiryType: string; message: string }): Promise<{ id: string }>;
}

const globalEvents: GlobalEvent[] = [
  { id: "1", name: "Steel & Aluminum Tariffs (25%)", description: "New 25% tariffs on imported steel and aluminum increase raw material costs for precision components.", impact: { revenue: -0.12, morale: -8 } },
  { id: "2", name: "Tariffs on Chinese Components", description: "20% tariff on Chinese precision components boosts demand for domestic suppliers like Apex.", impact: { revenue: 0.15, morale: 5 } },
  { id: "3", name: "Diesel Price Surge", description: "Diesel prices spike 30%, increasing distribution costs across Apex's trucking network.", impact: { revenue: -0.08, morale: -5 } },
  { id: "4", name: "DOT Hours Regulation", description: "New DOT regulations limit trucker hours, creating delivery delays and increased logistics costs.", impact: { revenue: -0.06, morale: -3 } },
  { id: "5", name: "FDA Compliance Audit", description: "FDA announces surprise audits of medical device suppliers. Quality documentation becomes critical.", impact: { revenue: -0.05, morale: -10 } },
  { id: "6", name: "Medical Device Demand Surge", description: "Aging population drives 20% increase in medical device orders. Precision component demand soars.", impact: { revenue: 0.18, morale: 12 } },
  { id: "7", name: "Skilled Worker Shortage Crisis", description: "Regional manufacturing labor shortage hits 415,000 unfilled jobs. Wage competition intensifies.", impact: { revenue: -0.10, employees: -15, morale: -8 } },
  { id: "8", name: "Aerospace Contract Win", description: "Major aerospace contractor seeks domestic suppliers after tariff changes. New RFQ opportunities.", impact: { revenue: 0.12, morale: 8 } },
  { id: "9", name: "Community College Partnership", description: "State announces funding for manufacturing training programs. Reskilling costs reduced 40%.", impact: { revenue: 0.05, morale: 15 } },
  { id: "10", name: "Competitor Plant Closure", description: "Overseas competitor closes US operations due to tariff pressure. Their customers seek new suppliers.", impact: { revenue: 0.10, morale: 5 } },
  { id: "11", name: "Union Organizing Campaign", description: "UAW announces campaign targeting Midwest precision manufacturers. Workers at Apex are contacted.", impact: { morale: -15, revenue: -0.03 } },
  { id: "12", name: "Copper Tariff (50%)", description: "New 50% tariff on copper imports dramatically increases costs for electronic component manufacturing.", impact: { revenue: -0.15, morale: -10 } },
];

const briefingArticles: BriefingArticle[] = [
  {
    id: "1",
    title: "Manufacturing Labor Crisis: 415,000 Jobs Unfilled",
    content: "The US manufacturing sector faces a structural crisis with 415,000 unfilled positions and projections of 2.1 million unfilled jobs by 2030. Iowa is among the hardest-hit states. Despite average compensation exceeding $102,000 annually, manufacturers struggle to attract workers. 26% of the current workforce is approaching retirement, and younger workers show little interest in manufacturing careers.",
    source: "Manufacturing Institute",
    category: "workforce",
    insights: ["415K unfilled manufacturing jobs", "2.1M shortfall projected by 2030", "Iowa heavily affected", "$102K avg compensation not enough"],
  },
  {
    id: "2",
    title: "Trump Announces 25% Tariffs on Steel and Aluminum",
    content: "New 25% tariffs on imported steel and aluminum take effect, increasing raw material costs for precision manufacturers. However, the tariffs also boost demand for domestic suppliers as buyers seek to avoid duties on imported components. Companies with US-based production capacity are seeing increased RFQs from medical device and aerospace customers.",
    source: "Bloomberg",
    category: "trade",
    insights: ["25% steel/aluminum tariffs", "Raw material costs up 2-4%", "Domestic suppliers see opportunity", "Medical/aerospace seeking US sources"],
  },
  {
    id: "3",
    title: "Gen Z Workers Shun Management Roles",
    content: "New research shows 72% of Gen Z workers have no interest in becoming managers. They cite work-life balance concerns and the 'emotional labor' of management. Companies must adapt their leadership pipelines. Successful manufacturers are creating dual career tracks with technical specialist roles that pay as well as management without the supervisory burden.",
    source: "Harvard Business Review",
    category: "workforce",
    insights: ["72% of Gen Z refuse management", "Leadership pipeline at risk", "Dual career tracks emerging", "Technical specialist roles gaining traction"],
  },
  {
    id: "4",
    title: "Precision Manufacturing Sees Reshoring Wave",
    content: "Tariffs and supply chain concerns are driving a reshoring wave in precision manufacturing. Medical device companies report shifting 30% of component sourcing to domestic suppliers. The challenge: US manufacturers lack capacity and skilled workers to meet surging demand. Companies that can scale quickly will capture significant market share.",
    source: "Supply Chain Dive",
    category: "trade",
    insights: ["30% medical components reshoring", "Capacity constraints limit opportunity", "Skilled worker shortage bottleneck", "First movers gain market share"],
  },
  {
    id: "5",
    title: "Diesel Prices Surge, Trucking Costs Soar",
    content: "Diesel prices have increased 25% year-over-year, dramatically impacting distribution costs for manufacturers. Companies with extensive trucking networks face margin pressure. Logistics experts recommend consolidating shipments, optimizing routes, and exploring regional distribution center strategies to mitigate costs.",
    source: "Transport Topics",
    category: "logistics",
    insights: ["Diesel up 25% YoY", "Distribution costs squeezing margins", "Route optimization critical", "Regional DC strategy helps"],
  },
  {
    id: "6",
    title: "FDA Increases Medical Device Supplier Audits",
    content: "The FDA has announced increased scrutiny of medical device supply chains, including component suppliers. Precision manufacturers serving medical customers face more frequent audits and documentation requirements. Non-compliance can result in supply chain exclusion. Companies with robust quality management systems gain competitive advantage.",
    source: "MedTech Insight",
    category: "regulatory",
    insights: ["FDA audits increasing", "Documentation requirements rising", "Non-compliance = exclusion", "QMS becomes competitive advantage"],
  },
  {
    id: "7",
    title: "Union Activity Surges in Midwest Manufacturing",
    content: "Union organizing campaigns have increased 40% year-over-year in manufacturing. The UAW has announced specific focus on precision manufacturers in Iowa, Wisconsin, and Michigan. Workers cite automation fears, wage stagnation, and job security as primary motivators. Proactive engagement and transparent communication can mitigate organizing risk.",
    source: "Labor Relations Weekly",
    category: "labor",
    insights: ["UAW targeting Midwest", "40% increase in organizing", "Automation fears drive campaigns", "Transparency reduces risk"],
  },
  {
    id: "8",
    title: "AI-Powered Quality Inspection Gains Traction",
    content: "Machine learning-based quality inspection systems are achieving 99.7% defect detection rates in precision manufacturing, compared to 94% for human inspectors. Early adopters report 30% reduction in quality escapes and significant reskilling opportunities for displaced QA workers. The technology requires $2-5M investment and 6-month implementation.",
    source: "Manufacturing Today",
    category: "ai",
    insights: ["ML achieves 99.7% defect detection", "30% fewer quality escapes", "Reskilling paths available", "$2-5M investment required"],
  },
];

const defaultDepartments: Department[] = [
  { id: "ops", name: "Operations", aiOption: "Automate inventory with ML", jobImpact: -50, revenueBoost: 200000, risk: 20, deployed: false },
  { id: "sales", name: "Sales", aiOption: "Predictive analytics for leads", jobImpact: -20, revenueBoost: 150000, risk: 15, deployed: false },
  { id: "cs", name: "Customer Service", aiOption: "AI chatbots for support", jobImpact: -30, revenueBoost: 100000, risk: 25, deployed: false },
  { id: "rd", name: "R&D", aiOption: "ML for product innovation", jobImpact: 20, revenueBoost: 300000, risk: 30, deployed: false },
];

// Weekly Scenarios - The narrative for each week
const weeklyScenarios: WeeklyScenario[] = [
  {
    weekNumber: 1,
    title: "The Precision Imperative",
    narrative: `The board has delivered an ultimatum: Apex Manufacturing must modernize or face acquisition. Your precision micro-molding competitors have achieved 30% cost reductions through AI-powered quality inspection and robotic automation. Meanwhile, new tariffs on Chinese components are driving a surge of RFQs from medical device and aerospace customers seeking domestic suppliers.

Your CFO has secured preliminary approval for a $15M line of credit from First Midwest Bank at 6.5% interest. The opportunity is clear: capture reshoring demand while competitors struggle with capacity. But the challenge is equally clear: Iowa faces one of the nation's worst manufacturing labor shortages, with 415,000 jobs unfilled nationally and 26% of your skilled workforce approaching retirement.

The production floor is buzzing with anxiety. Workers have heard about the UAW's new organizing campaign targeting Midwest precision manufacturers. Your HR Director reports informal union discussions have begun among the moldmakers.`,
    pressures: [
      { source: "Board of Directors", message: "Tariffs are creating a once-in-a-decade opportunity. We need to scale capacity 40% in 18 months or lose it forever.", urgency: "critical" },
      { source: "CFO", message: "The bank loan is ready. We can draw $15M at 6.5% interest, but we need a solid plan.", urgency: "high" },
      { source: "Lead Moldmaker", message: "My team built this company's reputation by hand. If machines replace us, who maintains the quality?", urgency: "high" },
      { source: "UAW Organizer", message: "Workers are talking. How leadership handles this will determine whether we organize.", urgency: "medium" },
    ],
    contextArticles: briefingArticles.slice(0, 3),
    keyQuestion: "How will you balance the reshoring opportunity against workforce concerns and capacity constraints?",
  },
  {
    weekNumber: 2,
    title: "The Talent Pipeline Crisis",
    narrative: `Your expansion planning has revealed a deeper problem: Apex lacks the skilled workers to scale production. The micro-molding technicians who can hold tolerances to 0.001" take years to train, and the labor market is bone-dry - Iowa has fewer manufacturing job seekers than openings.

Exit interviews from the past quarter show a troubling pattern - your best young talent is leaving for tech companies offering remote work and higher pay. Meanwhile, 5 of your 12 master moldmakers are within 3 years of retirement, and Gen Z workers show no interest in the supervisory roles that would traditionally replace them.

The community college has proposed a partnership: $800K investment for a precision manufacturing program that would create a talent pipeline in 18 months. Some board members want to poach talent from competitors instead. Your HR Director warns that without fresh approaches, you simply cannot staff the expansion the board demands.`,
    pressures: [
      { source: "HR Director", message: "We posted 15 positions last month. We got 3 qualified applicants. The $102K average compensation isn't enough - they want flexibility we can't offer.", urgency: "critical" },
      { source: "Master Moldmaker", message: "It took me 8 years to learn this craft. You can't replace us with a 6-week training program.", urgency: "high" },
      { source: "Community College Dean", message: "We can build a precision manufacturing program, but we need industry commitment and curriculum input.", urgency: "medium" },
      { source: "Board Member", message: "Poach from competitors. Offer 20% premiums. We don't have time to grow talent.", urgency: "medium" },
    ],
    contextArticles: briefingArticles.filter(a => a.category === "workforce"),
    keyQuestion: "How will you build the skilled workforce needed to capture the reshoring opportunity?",
  },
  {
    weekNumber: 3,
    title: "Union Storm Brewing",
    narrative: `The UAW organizing effort has gained momentum. A vote is now scheduled for next month. Union representatives are framing your expansion plans as 'automation by another name' and pointing to your bank loan as evidence of management prioritizing machines over people.

Your legal team advises that you can communicate with employees about the implications of unionization, but you cannot threaten or promise benefits to influence the vote. Your HR Director believes a comprehensive skills investment commitment might defuse the situation.

Meanwhile, a major medical device customer has sent an urgent RFP requiring 50% capacity increase within 12 months. The contract would add $18M in annual revenue - but you can't staff it with current workforce levels. The union is watching how you respond: will you automate, outsource, or invest in workers?`,
    pressures: [
      { source: "UAW Organizer", message: "Workers have a right to collective bargaining. Management keeps talking about 'opportunity' but workers only see risk.", urgency: "critical" },
      { source: "General Counsel", message: "We need to be very careful here. Any missteps could be unfair labor practice charges.", urgency: "high" },
      { source: "HR Director", message: "A genuine skills investment commitment - not just words - could change the narrative.", urgency: "high" },
      { source: "Medical Device Customer", message: "We need your answer on the capacity expansion within 2 weeks. Our supply chain team is evaluating alternatives.", urgency: "critical" },
    ],
    contextArticles: briefingArticles.filter(a => a.category === "labor" || a.category === "workforce"),
    keyQuestion: "How will you respond to the unionization effort while capturing the customer opportunity?",
  },
  {
    weekNumber: 4,
    title: "The Supply Chain Squeeze",
    narrative: `New tariffs have created both opportunity and crisis. The 25% steel and aluminum tariffs have increased your raw material costs by 3.5%. Simultaneously, the 50% copper tariff is devastating your electronic component costs. Your margins are being squeezed just as demand is surging.

Your procurement team has identified domestic suppliers who could reduce tariff exposure, but they require 6-month contracts and 20% volume commitments. Meanwhile, your trucking costs are up 25% due to diesel price increases, and new DOT regulations are causing delivery delays to your distribution network.

The medical device customer is pressing for a decision on their $18M contract. They want pricing locked for 3 years - but with material costs in flux, that's a significant risk.`,
    pressures: [
      { source: "Procurement Director", message: "We can lock in domestic steel suppliers, but they want 3-year commitments. If tariffs drop, we're stuck.", urgency: "critical" },
      { source: "CFO", message: "Margins have dropped 2.5 points this quarter. We need to raise prices or find cost offsets.", urgency: "high" },
      { source: "Logistics Manager", message: "Our trucking costs are up 25%. We need to rethink our distribution strategy - maybe regional warehouses.", urgency: "high" },
      { source: "Medical Device Customer", message: "We need 3-year pricing. Our procurement board won't approve contracts with escalation clauses.", urgency: "critical" },
    ],
    contextArticles: briefingArticles.filter(a => a.category === "trade" || a.category === "logistics"),
    keyQuestion: "How will you manage supply chain volatility while locking in customer contracts?",
  },
  {
    weekNumber: 5,
    title: "The Quality Crisis",
    narrative: `An FDA audit of your largest medical device customer has flagged quality concerns with Apex components. Three lots have been placed on hold pending investigation. The customer's quality director is demanding immediate action: implement AI-powered inspection systems or face supply chain exclusion.

Your QA team is stretched thin - two supervisors resigned last month, citing burnout. The remaining inspectors are working mandatory overtime, and error rates are climbing. Your master moldmakers argue that the quality issues stem from rushing new hires through training, not from inspection failures.

Meanwhile, your aerospace customer has sent a new RFQ worth $8M annually - but their quality requirements are even more stringent than medical. Can you capture this opportunity while fixing the quality crisis?`,
    pressures: [
      { source: "Medical Device Quality Director", message: "We need to see your corrective action plan within 30 days or we'll activate our backup suppliers.", urgency: "critical" },
      { source: "QA Manager", message: "My team is exhausted. We're catching defects, but we can't keep up with the volume increase.", urgency: "critical" },
      { source: "Master Moldmaker", message: "The quality problems start at the press, not inspection. New hires are rushing and making mistakes.", urgency: "high" },
      { source: "Aerospace Customer", message: "We're interested in Apex, but we've heard rumors about quality issues. Can you assure us?", urgency: "high" },
    ],
    contextArticles: briefingArticles.filter(a => a.category === "regulatory" || a.category === "ai"),
    keyQuestion: "How will you resolve the quality crisis while pursuing new opportunities?",
  },
  {
    weekNumber: 6,
    title: "The Workforce Investment Decision",
    narrative: `Your community college partnership is ready to launch - but it requires final commitment. The $800K investment would create a precision manufacturing program producing 40 qualified technicians per year. The catch: you must guarantee employment for graduates at $55K+ salaries.

Meanwhile, your competitors are taking different approaches. MicroPrecision Inc. has announced plans to offshore 30% of production to Mexico to avoid labor costs. TechMold Partners is acquiring a struggling competitor to capture their skilled workforce. The industry is fragmenting into different strategic camps.

Your board wants to know: is the long-term workforce investment worth it, or should you follow competitors toward lower-cost alternatives? The tariff situation remains volatile - what happens if reshoring demand fades?`,
    pressures: [
      { source: "Community College Dean", message: "We need your final commitment by month-end. Other manufacturers are interested if you pass.", urgency: "critical" },
      { source: "CFO", message: "$800K is significant. If tariffs drop and reshoring reverses, we're stuck with training costs and employment guarantees.", urgency: "high" },
      { source: "Board Member", message: "MicroPrecision is moving to Mexico. Their labor costs will be 40% lower. How do we compete?", urgency: "high" },
      { source: "HR Director", message: "This pipeline would solve our talent crisis permanently. No more competing for the same 50 qualified workers in Iowa.", urgency: "high" },
    ],
    contextArticles: briefingArticles.filter(a => a.category === "workforce" || a.category === "trade"),
    keyQuestion: "Will you invest in building the workforce of tomorrow, or pursue cost-reduction alternatives?",
  },
  {
    weekNumber: 7,
    title: "The Competitive Response",
    narrative: `Breaking news: MicroPrecision's Mexico facility has failed its FDA audit. Their medical device customers are scrambling for alternatives, and your phone is ringing off the hook. This is the reshoring opportunity you've been preparing for - but can you deliver?

Simultaneously, TechMold Partners' acquisition has backfired. They inherited labor disputes and equipment problems, and they're now shedding the skilled workers they acquired. These workers - experienced micro-molding technicians - are suddenly available.

Your sales team is pressing for aggressive commitments. Your operations team is warning about capacity limits. Your HR team sees a once-in-a-career hiring opportunity. The decisions you make this week could define Apex's position for the next decade.`,
    pressures: [
      { source: "Sales VP", message: "MicroPrecision's customers are calling us. We could add $25M in revenue - but we need to commit capacity now.", urgency: "critical" },
      { source: "Operations Manager", message: "We're at 87% capacity. Any major new contracts will require overtime, hiring, or automation acceleration.", urgency: "high" },
      { source: "HR Director", message: "TechMold laid off 35 skilled technicians. We could hire them at market rate - no premium needed. But we have to move fast.", urgency: "critical" },
      { source: "CFO", message: "This is the moment we invested for. But overcommitting could break us. We need disciplined growth.", urgency: "high" },
    ],
    contextArticles: briefingArticles.slice(0, 4),
    keyQuestion: "How will you capitalize on competitors' failures without overextending?",
  },
  {
    weekNumber: 8,
    title: "The New Equilibrium",
    narrative: `Eight weeks have passed since the tariff announcement that triggered this transformation. The dust is settling, and Apex is finding a new equilibrium. Some choices worked brilliantly; others have created lasting challenges.

The reshoring wave is real - your medical and aerospace customers are committed to domestic sourcing for the foreseeable future. But the labor shortage hasn't eased, and the workers you've invested in are now being recruited by competitors who didn't make the same investments.

The board wants a 3-year strategic plan. Should you double down on the precision micro-molding niche, or diversify into adjacent markets? Should you expand the Iowa facility or open a second location? The foundation you've built could support many futures.`,
    pressures: [
      { source: "Board of Directors", message: "Present your 3-year strategic plan. We need to see how this quarter's actions become sustainable advantage.", urgency: "high" },
      { source: "Master Moldmaker", message: "Three of my best technicians got offers from competitors. They're staying for now, but we need to show them a future here.", urgency: "high" },
      { source: "Major Customer", message: "We're ready to expand our relationship significantly - if you can demonstrate sustained quality and capacity.", urgency: "high" },
      { source: "Community College Dean", message: "Our first cohort graduates in 6 months. The program is a success - other manufacturers want to replicate it.", urgency: "medium" },
    ],
    contextArticles: briefingArticles,
    keyQuestion: "What legacy will you leave, and what foundation will you build for the next decade?",
  },
];

// Weekly Decisions - The choices teams must make each week
const weeklyDecisions: WeeklyDecision[] = [
  // Week 1: Automation Financing
  {
    id: "w1-financing",
    weekNumber: 1,
    category: "automation_financing",
    title: "Automation Financing Strategy",
    context: "The bank has approved a $15M credit line at 6.5% interest. How much debt will you take on, and how aggressively will you pursue automation?",
    stakeholderPerspectives: [
      { role: "CFO", stance: "Pro-debt", quote: "Debt is cheap right now at 5.5-7%. We should move fast before competitors consolidate their advantage." },
      { role: "HR Director", stance: "Cautious", quote: "The research shows companies allocating 15% or more of their AI budget to workforce transition see 40% higher adoption rates. We need time for that." },
      { role: "Board Member", stance: "Aggressive", quote: "Look at AutoTech - they cut 30% of their workforce and increased output 45%. Half-measures won't save us." },
      { role: "Skeptical Analyst", stance: "Warning", quote: "But AutoTech also had two strikes in 18 months and their customer satisfaction dropped 15 points. There's more to that story." },
    ],
    options: [
      {
        id: "w1-f-aggressive",
        label: "Aggressive Automation ($15M debt)",
        description: "Take the full credit line. Deploy automation across all four departments simultaneously. Target 30% cost reduction in 18 months.",
        financialImpact: { debt: 15000000, cost: 500000 },
        workforceImpact: { morale: -25, unionSentiment: 35, employees: -120 },
        automationImpact: { level: 45, roi: 25 },
        risks: ["High displacement creates union risk", "Implementation complexity may cause failures", "Debt service pressure if ROI delays"],
        timeframe: "18 months to full deployment",
      },
      {
        id: "w1-f-moderate",
        label: "Phased Automation ($8M debt)",
        description: "Take partial credit. Begin with Operations and Sales (lower risk departments). Expand based on results.",
        financialImpact: { debt: 8000000, cost: 300000 },
        workforceImpact: { morale: -10, unionSentiment: 15, employees: -45 },
        automationImpact: { level: 25, roi: 18 },
        risks: ["Slower competitive response", "May lose market share during transition", "Competitors may pull ahead"],
        timeframe: "24 months phased deployment",
      },
      {
        id: "w1-f-conservative",
        label: "Minimal Automation ($3M debt)",
        description: "Limited borrowing. Focus only on Operations department with careful worker transition planning.",
        financialImpact: { debt: 3000000, cost: 150000 },
        workforceImpact: { morale: -5, unionSentiment: 5, employees: -15 },
        automationImpact: { level: 12, roi: 10 },
        risks: ["Insufficient to close competitive gap", "Board may lose patience", "Gradual market share erosion"],
        timeframe: "12 months for Operations only",
      },
    ],
    deadline: "End of Week 1",
  },
  {
    id: "w1-communication",
    weekNumber: 1,
    category: "organizational_change",
    title: "Workforce Communication Strategy",
    context: "Word of the automation plans has leaked. How will you communicate with your workforce?",
    stakeholderPerspectives: [
      { role: "HR Director", stance: "Transparency", quote: "Research shows early communication reduces workforce anxiety by 35%. Employees who feel informed are 2.8x more likely to support change." },
      { role: "General Counsel", stance: "Cautious", quote: "Be careful what you promise. Any commitments become legally binding." },
      { role: "Operations Manager", stance: "Practical", quote: "My team just wants to know if they'll have jobs next year. 42% of our workforce already reports concern about AI job displacement." },
    ],
    options: [
      {
        id: "w1-c-transparent",
        label: "Full Transparency Town Hall",
        description: "CEO-led town hall sharing complete automation plans, timeline, and honest assessment of job impacts. Announce reskilling commitment upfront.",
        financialImpact: { cost: 50000 },
        workforceImpact: { morale: 10, unionSentiment: -15, adaptability: 10 },
        risks: ["Some workers may leave preemptively", "Creates expectations that must be met", "Media may cover negatively"],
        timeframe: "This week",
      },
      {
        id: "w1-c-phased",
        label: "Phased Disclosure",
        description: "Department-by-department communication as each phase approaches. General messaging about 'modernization' without specifics.",
        financialImpact: { cost: 20000 },
        workforceImpact: { morale: -5, unionSentiment: 5 },
        risks: ["Rumors continue to spread", "Trust erodes as pattern becomes clear", "Union organizers fill the information vacuum"],
        timeframe: "Over 8 weeks",
      },
      {
        id: "w1-c-minimal",
        label: "Need-to-Know Only",
        description: "Communicate only with directly affected workers, shortly before changes occur. Focus on business necessity messaging.",
        financialImpact: { cost: 10000 },
        workforceImpact: { morale: -20, unionSentiment: 25 },
        risks: ["Severe trust damage", "High likelihood of unionization", "Productivity drops from anxiety"],
        timeframe: "As needed",
      },
    ],
  },
  // Week 2: Talent Pipeline
  {
    id: "w2-talent",
    weekNumber: 2,
    category: "management_pipeline",
    title: "Leadership Pipeline Strategy",
    context: "Gen Z workers are refusing management roles, and 5 managers retire within 3 years. How will you build your leadership pipeline?",
    stakeholderPerspectives: [
      { role: "HR Director", stance: "Adapt", quote: "72% of our Gen Z workers have no interest in management - nationally it's the same. We need dual career tracks like TechnoForge implemented." },
      { role: "COO", stance: "Practical", quote: "Someone has to manage. We have 8 unfilled positions and 5 managers retiring in 3 years. If internal candidates won't step up, we hire external." },
      { role: "Gen Z Employee", stance: "Clear", quote: "I want to grow technically, not spend my days in meetings and dealing with emotional labor. Give us technical paths that pay like management." },
    ],
    options: [
      {
        id: "w2-t-dual",
        label: "Dual Career Track System",
        description: "Create equal-prestige technical and management tracks. Technical specialists can earn as much as managers without direct reports. Invest $1.5M in new role definitions and training.",
        financialImpact: { cost: 1500000 },
        workforceImpact: { morale: 15, adaptability: 15 },
        leadershipImpact: { managementBench: 10, managerVacancies: -3 },
        risks: ["Management roles still understaffed short-term", "May create cultural divide between tracks", "Expensive to implement"],
        timeframe: "6 months to implement",
      },
      {
        id: "w2-t-external",
        label: "External Manager Recruitment",
        description: "Hire 8 experienced managers from outside the company. Offer competitive packages to attract proven leaders from competitors.",
        financialImpact: { cost: 800000 },
        workforceImpact: { morale: -10 },
        leadershipImpact: { managementBench: 20, managerVacancies: -8 },
        risks: ["Internal resentment from passed-over employees", "Cultural fit challenges", "External hires may not understand Apex culture"],
        timeframe: "3 months to hire",
      },
      {
        id: "w2-t-flatten",
        label: "Flatten Hierarchy",
        description: "Reduce management layers from 5 to 3. Increase spans of control. Remaining managers get higher compensation and AI tools to handle larger teams.",
        financialImpact: { cost: 400000, cashFlow: 200000 },
        workforceImpact: { morale: -5, unionSentiment: 10 },
        leadershipImpact: { managementBench: -10, managerVacancies: -5 },
        automationImpact: { level: 5 },
        risks: ["Remaining managers may burn out", "Decision-making slows with fewer leaders", "Some coordination loss"],
        timeframe: "4 months to restructure",
      },
    ],
  },
  {
    id: "w2-reskill",
    weekNumber: 2,
    category: "reskilling",
    title: "Reskilling Investment",
    context: "You need workers who can operate and maintain automated systems. How much will you invest in reskilling?",
    stakeholderPerspectives: [
      { role: "Training Manager", stance: "Invest", quote: "Industry data shows for every $10,000 invested per affected employee, turnover intention decreases by 12%. With job guarantees, we can achieve 80% internal redeployment." },
      { role: "CFO", stance: "ROI-focused", quote: "TechnoForge allocated 25% of their automation budget to reskilling and repaid their debt by month 30. But that's a lot of upfront capital." },
      { role: "Operations Worker", stance: "Hopeful", quote: "I've been here 15 years - our average tenure is 7.2 years. I can learn new skills if you give me a chance." },
    ],
    options: [
      {
        id: "w2-r-comprehensive",
        label: "Comprehensive Reskilling Program ($2.5M)",
        description: "Full-scale program covering all affected workers. Partnership with local community college. Guarantee no layoffs for workers who complete training.",
        financialImpact: { cost: 2500000 },
        workforceImpact: { morale: 25, unionSentiment: -25, adaptability: 30 },
        risks: ["High upfront cost", "Some workers may not succeed", "3-6 month productivity gap during training"],
        timeframe: "6 months program",
      },
      {
        id: "w2-r-targeted",
        label: "Targeted Reskilling ($1M)",
        description: "Train only workers with highest aptitude scores. Others receive enhanced severance and outplacement services.",
        financialImpact: { cost: 1000000 },
        workforceImpact: { morale: 5, unionSentiment: 10, adaptability: 15, employees: -40 },
        risks: ["Perceived unfairness", "Loss of institutional knowledge", "Community reputation impact"],
        timeframe: "3 months program",
      },
      {
        id: "w2-r-minimal",
        label: "On-the-Job Training Only ($200K)",
        description: "Train as we go. Workers learn new systems while working. Those who can't adapt are let go with standard severance.",
        financialImpact: { cost: 200000 },
        workforceImpact: { morale: -15, unionSentiment: 20, adaptability: 5, employees: -60 },
        risks: ["Quality issues during transition", "High turnover", "Union organizing likely"],
        timeframe: "Ongoing",
      },
    ],
  },
  // Week 3: Union Response
  {
    id: "w3-union",
    weekNumber: 3,
    category: "union_relations",
    title: "Union Campaign Response",
    context: "A union vote is scheduled for next month. How will you respond to the organizing effort?",
    stakeholderPerspectives: [
      { role: "General Counsel", stance: "Legal", quote: "We can share factual information about unionization but cannot threaten or promise benefits." },
      { role: "Union Organizer", stance: "Determined", quote: "Workers deserve a voice. Management has shown they prioritize machines over people." },
      { role: "HR Director", stance: "Bridge-building", quote: "Maybe we can give workers what they're seeking without the union as intermediary." },
    ],
    options: [
      {
        id: "w3-u-engage",
        label: "Proactive Engagement",
        description: "Announce enhanced job security commitments, establish formal worker council, increase wages 5%. Show workers their concerns are heard without union.",
        financialImpact: { cost: 3000000 },
        workforceImpact: { morale: 20, unionSentiment: -30 },
        risks: ["May be seen as buying off workers", "Commitments are binding", "Sets precedent for future demands"],
        timeframe: "Before union vote",
      },
      {
        id: "w3-u-neutral",
        label: "Factual Information Campaign",
        description: "Share factual information about what unionization means - dues, negotiation process, strike risks. Let workers make informed choice.",
        financialImpact: { cost: 100000 },
        workforceImpact: { morale: 0, unionSentiment: -10 },
        risks: ["May not be enough to change outcome", "Could be seen as anti-union messaging", "Relationship with union leaders damaged if vote fails"],
        timeframe: "Before union vote",
      },
      {
        id: "w3-u-accept",
        label: "Accept Unionization",
        description: "If workers want a union, work with it constructively. Pivot to partnership model where union helps manage transition.",
        financialImpact: { cost: 500000 },
        workforceImpact: { morale: 10, unionSentiment: -20 },
        automationImpact: { level: -5 },
        risks: ["Higher labor costs long-term", "Slower decision-making", "Board may object"],
        timeframe: "Post-vote implementation",
      },
    ],
  },
  // Week 4: Displacement
  {
    id: "w4-displacement",
    weekNumber: 4,
    category: "workforce_displacement",
    title: "Worker Displacement Approach",
    context: "45 positions are being eliminated by Phase 1 automation. What happens to these workers?",
    stakeholderPerspectives: [
      { role: "CFO", stance: "Cost-focused", quote: "Standard severance is 2 weeks per year of service. That's the industry norm." },
      { role: "HR Director", stance: "Humane", quote: "These are people who gave us years of service. We owe them more than a check." },
      { role: "Mayor", stance: "Community", quote: "Apex is a pillar of this community. How you treat these workers matters." },
    ],
    options: [
      {
        id: "w4-d-reskill",
        label: "Maximum Retention Effort",
        description: "Guarantee placement for any worker who completes reskilling. Create 30 new technical roles. 15 workers with full early retirement packages.",
        financialImpact: { cost: 2000000 },
        workforceImpact: { morale: 20, unionSentiment: -20, employees: -15 },
        risks: ["High cost", "Not all retrained workers may succeed in new roles", "Productivity lag during transition"],
        timeframe: "6 months retention program",
      },
      {
        id: "w4-d-enhanced",
        label: "Enhanced Severance Package",
        description: "4 weeks per year of service, 6 months COBRA coverage, outplacement services, and priority rehire rights if economy improves.",
        financialImpact: { cost: 1200000 },
        workforceImpact: { morale: 5, unionSentiment: 5, employees: -45 },
        risks: ["Still significant displacement", "Community reputation impact", "Remaining workers anxious about their future"],
        timeframe: "Immediate",
      },
      {
        id: "w4-d-standard",
        label: "Standard Severance",
        description: "2 weeks per year of service per industry standard. Focus resources on automation execution rather than transition costs.",
        financialImpact: { cost: 500000 },
        workforceImpact: { morale: -15, unionSentiment: 20, employees: -45 },
        risks: ["Severe morale damage", "Media coverage likely negative", "Remaining workers distrustful"],
        timeframe: "Immediate",
      },
    ],
  },
  // Week 5: Management Crisis
  {
    id: "w5-management",
    weekNumber: 5,
    category: "management_pipeline",
    title: "Management Crisis Response",
    context: "Three managers resigned this week. Remaining managers are burning out. Gen Z won't take promotions. What do you do?",
    stakeholderPerspectives: [
      { role: "COO", stance: "Innovation", quote: "AI-augmented management could let one manager handle a team of 30. We should try it." },
      { role: "HR Director", stance: "Concerned", quote: "We need to stop the bleeding first. Our remaining managers need immediate support." },
      { role: "Consultant", stance: "Radical", quote: "Maybe the traditional management model is obsolete. Self-organizing teams work in tech companies." },
    ],
    options: [
      {
        id: "w5-m-ai",
        label: "AI-Augmented Management",
        description: "Deploy AI tools for scheduling, performance monitoring, and routine decisions. Managers focus on coaching and complex issues. Double manager span of control.",
        financialImpact: { cost: 800000 },
        workforceImpact: { morale: -10, unionSentiment: 10 },
        leadershipImpact: { managementBench: -5, managerVacancies: -4 },
        automationImpact: { level: 8 },
        risks: ["Workers may resent algorithmic management", "Managers may lose skills", "Technical failures create chaos"],
        timeframe: "3 months implementation",
      },
      {
        id: "w5-m-support",
        label: "Manager Wellness Investment",
        description: "Reduce manager workloads by 25%. Hire administrative support. Provide mental health resources. Increase manager compensation 15%.",
        financialImpact: { cost: 1500000 },
        workforceImpact: { morale: 10 },
        leadershipImpact: { managementBench: 15, managerVacancies: -2 },
        risks: ["Doesn't solve Gen Z pipeline issue", "High ongoing cost", "May not prevent further resignations"],
        timeframe: "Immediate",
      },
      {
        id: "w5-m-teams",
        label: "Self-Managing Teams Pilot",
        description: "Pilot self-organizing teams in one department. Team members share leadership responsibilities. Eliminate traditional manager role in pilot.",
        financialImpact: { cost: 200000 },
        workforceImpact: { morale: 5, adaptability: 15 },
        leadershipImpact: { managementBench: -10, managerVacancies: -3 },
        risks: ["May fail if workers aren't ready", "Could create coordination problems", "Other departments may resist"],
        timeframe: "6 month pilot",
      },
    ],
  },
  // Week 6: Financial Pressure
  {
    id: "w6-financial",
    weekNumber: 6,
    category: "strategic_investment",
    title: "Financial Pressure Response",
    context: "The bank is concerned about debt covenant compliance. Automation ROI is behind schedule. What's your strategy?",
    stakeholderPerspectives: [
      { role: "CFO", stance: "Financial", quote: "We need to show the bank a credible path to covenant compliance or they'll restrict our credit." },
      { role: "COO", stance: "Operational", quote: "If we cut back now, we lose the momentum we've built. The team is finally getting it." },
      { role: "Bank Rep", stance: "Concerned", quote: "We believe in Apex, but the numbers need to improve by Q3 or we'll need additional collateral." },
    ],
    options: [
      {
        id: "w6-f-accelerate",
        label: "Accelerate Automation",
        description: "Push automation deployment faster to capture savings sooner. Accept higher short-term risk for faster ROI realization.",
        financialImpact: { cost: 500000, revenue: 2000000 },
        workforceImpact: { morale: -15, unionSentiment: 15, employees: -30 },
        automationImpact: { level: 15, roi: 10 },
        risks: ["Quality issues from rushed implementation", "Worker resistance increases", "If it fails, no runway left"],
        timeframe: "Next quarter",
      },
      {
        id: "w6-f-optimize",
        label: "Optimize Current Systems",
        description: "Pause new automation. Focus on getting maximum value from what's already deployed. Reduce costs elsewhere to improve margins.",
        financialImpact: { cost: -500000, revenue: 500000 },
        workforceImpact: { morale: 5 },
        automationImpact: { roi: 8 },
        risks: ["Slows transformation momentum", "Competitors continue to advance", "May not satisfy bank"],
        timeframe: "Immediate",
      },
      {
        id: "w6-f-equity",
        label: "Seek Equity Partner",
        description: "Bring in private equity partner to replace debt with equity. Trade some control for financial flexibility.",
        financialImpact: { debt: -5000000, cost: 200000 },
        workforceImpact: { morale: -5, unionSentiment: 10 },
        risks: ["Loss of control", "PE may demand cost cuts", "Could destabilize culture"],
        timeframe: "2-3 months to close",
      },
    ],
  },
  // Week 7: Competition
  {
    id: "w7-competition",
    weekNumber: 7,
    category: "strategic_investment",
    title: "Competitive Response Strategy",
    context: "You lost a major contract to a competitor. Your reputation is suffering. A struggling competitor is laying off skilled workers. What's your move?",
    stakeholderPerspectives: [
      { role: "Sales VP", stance: "Aggressive", quote: "We need a bold move to show the market we've figured this out. Maybe acquire FastParts' customer base." },
      { role: "HR Director", stance: "Opportunistic", quote: "FastParts laid off great people. We could hire 20 skilled workers at below-market rates." },
      { role: "Marketing", stance: "Narrative", quote: "We need to control our story. A major announcement could shift perception." },
    ],
    options: [
      {
        id: "w7-c-talent",
        label: "Talent Acquisition Raid",
        description: "Hire 25 skilled workers from FastParts and competitors. Build capability faster than internal training allows.",
        financialImpact: { cost: 800000 },
        workforceImpact: { morale: -5, employees: 25, adaptability: 10 },
        leadershipImpact: { managementBench: 5 },
        risks: ["Internal resentment", "Culture integration challenges", "Competitors may retaliate"],
        timeframe: "2 months to hire",
      },
      {
        id: "w7-c-customer",
        label: "Customer Recovery Campaign",
        description: "Major sales offensive targeting lost customers and FastParts refugees. Price competitively. Emphasize operational stability.",
        financialImpact: { cost: 500000, revenue: 3000000 },
        workforceImpact: { morale: 10 },
        risks: ["May trigger price war", "Overpromising to win deals", "Existing customers may demand same terms"],
        timeframe: "Next quarter",
      },
      {
        id: "w7-c-announce",
        label: "Transformation Success Announcement",
        description: "Major press event showcasing automation success, worker retention, and customer testimonials. Position Apex as transformation model.",
        financialImpact: { cost: 200000 },
        workforceImpact: { morale: 15 },
        risks: ["Must have real results to share", "If spun negatively, backfires", "Sets high expectations"],
        timeframe: "This month",
      },
    ],
  },
  // Week 8: Legacy
  {
    id: "w8-legacy",
    weekNumber: 8,
    category: "strategic_investment",
    title: "Strategic Direction",
    context: "The board wants a 3-year plan. The bank wants refinancing terms. Employees want clarity. What's your vision?",
    stakeholderPerspectives: [
      { role: "Board Chair", stance: "Strategic", quote: "We've learned a lot. Now we need to codify that into a sustainable strategy." },
      { role: "CFO", stance: "Financial", quote: "Our debt structure needs to match our operational reality. Let's refinance smartly." },
      { role: "Employee Council", stance: "Hopeful", quote: "We've been through a lot. What does the next chapter look like for us?" },
    ],
    options: [
      {
        id: "w8-l-growth",
        label: "Aggressive Growth Strategy",
        description: "Double down on automation and expansion. Target 50% revenue growth over 3 years. Accept continued workforce disruption.",
        financialImpact: { debt: 5000000, revenue: 10000000 },
        workforceImpact: { morale: -5, unionSentiment: 15, adaptability: 20 },
        automationImpact: { level: 25, roi: 20 },
        risks: ["High debt load", "Ongoing labor disruption", "Execution risk remains high"],
        timeframe: "3-year plan",
      },
      {
        id: "w8-l-balance",
        label: "Balanced Sustainability",
        description: "Moderate growth with strong focus on workforce development and cultural health. Target 25% revenue growth with high retention.",
        financialImpact: { revenue: 5000000 },
        workforceImpact: { morale: 15, adaptability: 15 },
        automationImpact: { level: 10, roi: 12 },
        leadershipImpact: { managementBench: 10 },
        risks: ["Competitors may outpace", "Shareholders may want more", "Requires continued investment"],
        timeframe: "3-year plan",
      },
      {
        id: "w8-l-human",
        label: "Human-Centered Excellence",
        description: "Position Apex as the 'employer of choice' in manufacturing. Limit automation to augmentation only. Compete on quality and service, not cost.",
        financialImpact: { cost: 2000000, revenue: 3000000 },
        workforceImpact: { morale: 25, unionSentiment: -25, adaptability: 10 },
        automationImpact: { level: 5 },
        leadershipImpact: { managementBench: 15 },
        risks: ["May not satisfy cost-focused customers", "Board may resist", "Requires premium positioning"],
        timeframe: "3-year plan",
      },
    ],
  },
];

const enhancedDecisions: EnhancedDecision[] = [
  {
    id: "ed1-automation-strategy",
    weekNumber: 1,
    category: "automation_financing",
    title: "Automation Strategy Configuration",
    context: "The board has approved an automation initiative. You must configure the key parameters of your approach - how aggressively to automate, how much to spend, and how to communicate with employees.",
    stakeholderPerspectives: [
      { role: "CFO", stance: "ROI-focused", quote: "The bank has approved $15M at 6.5%. Every dollar we borrow needs to pay back in 18-24 months." },
      { role: "Operations Manager", stance: "Cautious", quote: "AutoTech Industries cut 30% in 18 months. My team is watching - if we go too fast, we'll lose our best people before automation is ready." },
      { role: "HR Director", stance: "People-first", quote: "Industry research shows $10,000 per affected employee in reskilling reduces turnover intention by 12%." },
    ],
    attributes: [
      {
        id: "automation-intensity",
        type: "slider",
        label: "Automation Intensity",
        description: "How aggressively will you deploy automation? Higher intensity means faster ROI but greater workforce disruption.",
        min: 10,
        max: 100,
        step: 10,
        defaultValue: 40,
        impactFormula: { automationLevel: 0.5, morale: -0.3, unionSentiment: 0.4 },
      },
      {
        id: "debt-financing",
        type: "budget",
        label: "Debt Financing Amount",
        description: "How much of the $15M credit line will you draw? More capital enables faster automation but increases financial risk.",
        min: 0,
        max: 15000000,
        step: 1000000,
        defaultValue: 5000000,
        impactFormula: { cost: 1, revenue: 0.1 },
      },
      {
        id: "reskilling-budget",
        type: "budget",
        label: "Reskilling Investment",
        description: "How much will you invest in employee reskilling? Industry data suggests $10K per affected employee = 12% turnover reduction.",
        min: 0,
        max: 3000000,
        step: 250000,
        defaultValue: 500000,
        impactFormula: { morale: 0.01, adaptability: 0.02, cost: 1 },
      },
      {
        id: "timeline",
        type: "select",
        label: "Implementation Timeline",
        description: "How quickly will you roll out automation?",
        options: [
          { id: "aggressive", label: "Aggressive (12 months)", description: "40% success rate but faster ROI" },
          { id: "standard", label: "Standard (18 months)", description: "70% success rate, balanced approach" },
          { id: "conservative", label: "Conservative (24 months)", description: "85% success rate but competitors may advance" },
        ],
      },
      {
        id: "communication-strategy",
        type: "select",
        label: "Communication Approach",
        description: "How will you communicate the automation plans to employees?",
        options: [
          { id: "transparent", label: "Full Transparency", description: "Share all details including job impacts - builds trust but may cause anxiety" },
          { id: "phased", label: "Phased Disclosure", description: "Share information as decisions are finalized - balanced approach" },
          { id: "minimal", label: "Need-to-Know Basis", description: "Share only when necessary - limits anxiety but risks rumors and distrust" },
        ],
      },
    ],
    requiredRationaleWords: 100,
  },
  {
    id: "ed2-talent-development",
    weekNumber: 2,
    category: "management_pipeline",
    title: "Talent & Leadership Development Strategy",
    context: "Your talent pipeline is broken. Gen Z won't take management roles, experienced managers are retiring, and you need new skills for an automated factory. Design your talent strategy.",
    stakeholderPerspectives: [
      { role: "HR Director", stance: "Strategic", quote: "72% of Gen Z workers refuse management roles. We need dual career tracks or we'll never fill leadership gaps." },
      { role: "Training Manager", stance: "Investment", quote: "TechnoForge allocated 25% of their automation budget to reskilling and repaid their debt by month 30." },
      { role: "Operations Worker", stance: "Hopeful", quote: "I've been here 15 years. I can learn new skills if you give me the chance and some job security." },
    ],
    attributes: [
      {
        id: "external-hiring-budget",
        type: "budget",
        label: "External Hiring Budget",
        description: "Budget for recruiting external talent with automation skills.",
        min: 0,
        max: 2000000,
        step: 200000,
        defaultValue: 400000,
        impactFormula: { managementBench: 0.01, cost: 1, morale: -0.005 },
      },
      {
        id: "internal-training-budget",
        type: "budget",
        label: "Internal Training Budget",
        description: "Investment in training existing employees for new roles.",
        min: 0,
        max: 2500000,
        step: 250000,
        defaultValue: 750000,
        impactFormula: { adaptability: 0.02, morale: 0.01, cost: 1 },
      },
      {
        id: "dual-track-career",
        type: "toggle",
        label: "Create Dual Career Track",
        description: "Establish technical expert track with equal prestige/pay as management track. One-time cost of $500K for restructuring.",
        impactFormula: { morale: 15, managementBench: 10, cost: 500000 },
      },
      {
        id: "job-guarantee-scope",
        type: "slider",
        label: "Job Guarantee Coverage",
        description: "What percentage of affected workers will receive job guarantees if they complete reskilling? Higher coverage builds trust but increases costs.",
        min: 0,
        max: 100,
        step: 10,
        defaultValue: 50,
        impactFormula: { morale: 0.3, unionSentiment: -0.4, cost: 10000 },
      },
      {
        id: "management-compensation-increase",
        type: "slider",
        label: "Manager Compensation Increase (%)",
        description: "Percentage increase to manager compensation to improve retention and attract internal candidates.",
        min: 0,
        max: 25,
        step: 5,
        defaultValue: 10,
        impactFormula: { managementBench: 0.8, cost: 50000, morale: 0.2 },
      },
    ],
    requiredRationaleWords: 100,
  },
  {
    id: "ed3-union-response",
    weekNumber: 3,
    category: "union_relations",
    title: "Union Relations Strategy",
    context: "Union organizing is gaining momentum. A vote is scheduled for next month. Your approach will define labor relations for years.",
    stakeholderPerspectives: [
      { role: "General Counsel", stance: "Legal", quote: "We can share facts about unionization but cannot threaten or make promises to influence the vote." },
      { role: "Union Organizer", stance: "Determined", quote: "Workers deserve a voice. 40% increase in manufacturing union organizing this year." },
      { role: "CFO", stance: "Financial", quote: "Unionization typically increases labor costs 15-20%. Our automation ROI won't work if that happens." },
    ],
    attributes: [
      {
        id: "wage-increase",
        type: "slider",
        label: "Immediate Wage Increase (%)",
        description: "Preemptive wage increase for non-management employees. Must be genuinely offered, not contingent on vote.",
        min: 0,
        max: 10,
        step: 1,
        defaultValue: 3,
        impactFormula: { morale: 2, unionSentiment: -3, cost: 300000 },
      },
      {
        id: "worker-council",
        type: "toggle",
        label: "Establish Worker Council",
        description: "Create formal channel for worker input on company decisions. Demonstrates commitment to employee voice.",
        impactFormula: { morale: 10, unionSentiment: -15, adaptability: 5 },
      },
      {
        id: "communication-spending",
        type: "budget",
        label: "Information Campaign Budget",
        description: "Budget for factual communications about what unionization means. Must be purely informational.",
        min: 0,
        max: 500000,
        step: 50000,
        defaultValue: 100000,
        impactFormula: { unionSentiment: -0.02, cost: 1 },
      },
      {
        id: "labor-consultant",
        type: "toggle",
        label: "Hire Labor Relations Consultant",
        description: "External expert to help navigate the organizing process legally and strategically. $150K cost.",
        impactFormula: { unionSentiment: -8, cost: 150000 },
      },
      {
        id: "union-partnership-openness",
        type: "slider",
        label: "Partnership Openness Level",
        description: "How open are you to working with a union if workers vote yes? 0=Adversarial, 100=Full Partnership",
        min: 0,
        max: 100,
        step: 10,
        defaultValue: 30,
        impactFormula: { morale: 0.1, unionSentiment: -0.05, adaptability: 0.1 },
      },
    ],
    requiredRationaleWords: 100,
  },
];

const easterEggs: EasterEgg[] = [
  { id: "ee1", keyword: "415,000", sourceReport: "Unfilled manufacturing jobs statistic", pointValue: 3 },
  { id: "ee2", keyword: "2.1 million", sourceReport: "Projected labor shortage by 2030", pointValue: 2 },
  { id: "ee3", keyword: "72%", sourceReport: "Gen Z management refusal rate", pointValue: 3 },
  { id: "ee4", keyword: "MicroPrecision", sourceReport: "Competitor Mexico FDA failure case", pointValue: 3 },
  { id: "ee5", keyword: "PrecisionFirst", sourceReport: "Workforce investment success story", pointValue: 3 },
  { id: "ee6", keyword: "reshoring", sourceReport: "Tariff-driven manufacturing trend", pointValue: 2 },
  { id: "ee7", keyword: "community college", sourceReport: "Workforce pipeline solution", pointValue: 3 },
  { id: "ee8", keyword: "25%", sourceReport: "Steel/aluminum tariff rate", pointValue: 2 },
  { id: "ee9", keyword: "$102,000", sourceReport: "Average manufacturing compensation", pointValue: 2 },
  { id: "ee10", keyword: "26%", sourceReport: "Workforce approaching retirement", pointValue: 2 },
  { id: "ee11", keyword: "Master Technician", sourceReport: "Alternative career track solution", pointValue: 3 },
  { id: "ee12", keyword: "Iowa", sourceReport: "Labor shortage geographic hotspot", pointValue: 1 },
  { id: "ee13", keyword: "FDA", sourceReport: "Medical device compliance requirement", pointValue: 2 },
  { id: "ee14", keyword: "dual career", sourceReport: "Dual career track solution", pointValue: 3 },
  { id: "ee15", keyword: "50%", sourceReport: "Copper tariff rate", pointValue: 2 },
];

const defaultSimulationConfig: SimulationConfig = {
  id: "default-sim",
  name: "Future of Work Simulation",
  competitionMode: "individual",
  totalWeeks: 8,
  enableGroupDecisions: false,
  scoringWeights: { financial: 50, cultural: 50 },
  easterEggBonusEnabled: true,
  easterEggBonusPercentage: 5,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const researchReports: ResearchReport[] = [
  {
    id: "report-1",
    title: "State of AI in Manufacturing 2025",
    sourceCode: "AIM",
    category: "industry",
    summary: "Comprehensive analysis of AI adoption trends across the manufacturing sector.",
    content: `The manufacturing industry is at a critical inflection point. Our research indicates that 67% of Fortune 500 manufacturers have initiated AI transformation programs, yet only 23% report successful enterprise-wide deployment.

Key barriers to adoption include workforce resistance (cited by 78% of respondents), legacy system integration challenges (65%), and unclear ROI metrics (54%). Companies that successfully navigate these challenges report average productivity gains of 35-45%.

The most successful transformations share common characteristics: early and transparent employee communication, phased rollouts beginning with low-risk departments, and substantial investment in reskilling programs. Companies allocating at least 15% of their AI budget to workforce transition see 40% higher adoption rates.

A critical finding: companies that took on significant debt to finance automation faced higher failure rates when they did not simultaneously invest in change management and workforce development.`,
    keyFindings: [
      "67% of Fortune 500 manufacturers have AI programs, but only 23% achieve enterprise-wide success",
      "Workforce resistance is the #1 barrier to AI adoption (78% of respondents)",
      "Companies investing 15%+ in reskilling see 40% higher adoption rates",
      "Debt-financed automation has higher failure rates without change management investment"
    ],
    dataPoints: [
      { label: "AI Adoption Rate", value: "67%", trend: "up" },
      { label: "Successful Deployment", value: "23%", trend: "stable" },
      { label: "Productivity Gains", value: "35-45%", trend: "up" }
    ],
    publishedDate: "December 2025",
    readingTime: 8
  },
  {
    id: "report-2",
    title: "Apex Manufacturing: Company Profile",
    sourceCode: "APX",
    category: "company",
    summary: "Internal analysis of Apex Manufacturing's current position, capabilities, and strategic challenges.",
    content: `Apex Manufacturing Inc. is a precision micro-component manufacturer headquartered in Central Iowa. Founded in 1985, the company specializes in high-tolerance injection-molded plastic and polymer components for medical devices, electronics, and aerospace applications. With 2,400 employees and tolerances measured in microns, Apex has built a reputation as a trusted supplier where failure is not an option.

Current financial position: $125M annual revenue with 18% operating margins. Growth has stagnated at 3% annually as larger competitors with automation capabilities capture market share. The company has $15M in available cash and access to a $15M credit line at 6.5% interest from First Midwest Bank.

The workforce challenge is acute. Iowa faces one of the nation's worst manufacturing labor shortages, with 26% of Apex's skilled moldmakers approaching retirement. Average employee tenure of 7.2 years reflects deep institutional knowledge - but also resistance to change. The precision skills required take 5-8 years to develop, and the labor market offers only 3 qualified candidates for every 15 positions posted.

The 28% Gen Z portion of the workforce shows no interest in management roles (72% refuse supervisory positions). This creates a leadership pipeline crisis: 8 unfilled supervisor positions and 5 master moldmakers retiring within 3 years.

Market opportunity: New tariffs on Chinese precision components are driving a reshoring wave. Medical device and aerospace customers are actively seeking domestic suppliers. However, capacity constraints and labor shortages limit Apex's ability to capture this demand without significant investment.

Union activity: The UAW has announced organizing campaigns targeting Midwest precision manufacturers. While Apex is not currently unionized, informal discussions have been observed among production workers concerned about automation and job security.`,
    keyFindings: [
      "Precision micro-molding specialist serving medical, electronics, aerospace",
      "Iowa labor shortage: 3 qualified applicants per 15 positions posted",
      "26% of skilled workforce approaching retirement",
      "Tariff-driven reshoring creates demand surge - but capacity is constrained",
      "72% of Gen Z workers refuse management roles - leadership pipeline crisis"
    ],
    dataPoints: [
      { label: "Annual Revenue", value: "$125M", trend: "stable" },
      { label: "Employee Count", value: "2,400", trend: "stable" },
      { label: "Avg Tenure", value: "7.2 yrs", trend: "stable" },
      { label: "Tolerance Capability", value: "±0.001\"", trend: "stable" }
    ],
    publishedDate: "January 2026",
    readingTime: 7
  },
  {
    id: "report-3",
    title: "Workforce Transition Best Practices",
    sourceCode: "WFT",
    category: "workforce",
    summary: "Evidence-based strategies for managing workforce transitions during technological change.",
    content: `Research across 200+ manufacturing transformations reveals clear patterns distinguishing successful transitions from failures.

COMMUNICATION: Companies that communicate early and often about AI plans see 35% less workforce anxiety. The key is honesty about both opportunities and challenges. Employees who feel informed are 2.8x more likely to support change.

RESKILLING: Investment in employee development is the strongest predictor of morale during transitions. For every $10,000 invested per affected employee, turnover intention decreases by 12%.

UNION DYNAMICS: Companies facing union organizing during transformation have two paths: fight or partner. Fighting typically delays transformation 12-18 months and damages morale. Partnering with unions on transition planning can actually accelerate change by providing worker buy-in.

GEN Z MANAGEMENT GAP: The emerging leadership crisis requires structural solutions. Traditional management tracks appeal to only 28% of Gen Z workers. Successful companies are creating dual career tracks (technical and management) with equal prestige and compensation.

DISPLACEMENT BEST PRACTICES: Companies that offer reskilling with job guarantees see 80% internal redeployment. Those relying on severance alone see 60% community reputation damage.`,
    keyFindings: [
      "Early communication reduces workforce anxiety by 35%",
      "$10,000 reskilling investment per worker = 12% turnover reduction",
      "Union partnership can accelerate transformation vs. fighting it",
      "72% of Gen Z refuse traditional management roles",
      "Job guarantee with reskilling achieves 80% internal redeployment"
    ],
    dataPoints: [
      { label: "Anxiety Reduction", value: "35%", trend: "up" },
      { label: "Gen Z Management Interest", value: "28%", trend: "down" },
      { label: "Redeployment (with guarantee)", value: "80%", trend: "up" }
    ],
    publishedDate: "November 2025",
    readingTime: 7
  },
  {
    id: "report-4",
    title: "AI Technology Landscape for Manufacturing",
    sourceCode: "ATL",
    category: "technology",
    summary: "Technical assessment of AI/ML solutions applicable to manufacturing operations.",
    content: `The manufacturing AI landscape has matured significantly. Key application areas include:

OPERATIONS: ML-powered inventory optimization and predictive maintenance offer the highest proven ROI (typically 20-30% cost reduction). Implementation risk is moderate, with most failures attributed to data quality issues rather than technology.

ROBOTICS: Industrial robotics costs have fallen 50% in 5 years. A typical manufacturing floor automation project now costs $3-8M and displaces 15-25% of manual labor. Maintenance and operation of these systems requires significant reskilling investment.

AI-AUGMENTED MANAGEMENT: Emerging tools allow managers to handle 50% larger teams by automating scheduling, performance monitoring, and routine decisions. Early adopters report mixed results - efficiency gains but worker resentment of 'algorithmic management.'

FINANCING: Banks are offering favorable terms (5.5-7% interest) for automation investments, viewing them as secured by productive assets. However, debt-financed automation carries risks if implementation fails or worker transition isn't managed well.

ROI TIMELINES: Typical automation investments break even in 18-24 months. Aggressive timelines (12 months) succeed only 40% of the time. Conservative timelines (36 months) succeed 85% of the time but may allow competitors to pull ahead.`,
    keyFindings: [
      "Operations ML offers 20-30% cost reduction with moderate risk",
      "Industrial robotics costs have fallen 50% in 5 years",
      "AI-augmented management allows 50% larger team spans but creates worker resentment",
      "Debt financing available at 5.5-7% for automation",
      "Aggressive automation timelines (12 months) only succeed 40% of the time"
    ],
    dataPoints: [
      { label: "Ops Cost Reduction", value: "20-30%", trend: "up" },
      { label: "Robotics Cost Trend", value: "-50%", trend: "down" },
      { label: "Conservative Timeline Success", value: "85%", trend: "stable" }
    ],
    publishedDate: "December 2025",
    readingTime: 9
  },
  {
    id: "report-5",
    title: "Competitive Analysis: Precision Manufacturing Sector",
    sourceCode: "CMP",
    category: "competition",
    summary: "Strategic assessment of key competitors in precision micro-molding and their transformation initiatives.",
    content: `TIER 1 COMPETITORS:

MicroPrecision Inc.: Aggressive offshoring strategy, moving 30% of production to Mexico to reduce labor costs. Initial savings of 40% on labor. However: FDA audit failures at Mexico facility, quality escapes reaching customers, medical device customers now seeking alternatives. Their loss is Apex's potential gain.

TechMold Partners: Growth-through-acquisition strategy. Acquired struggling competitor to capture skilled workforce. Result: inherited labor disputes, equipment problems, and cultural conflicts. Now shedding the workers they acquired. Cautionary tale about buying talent vs. building it.

TIER 2 COMPETITORS:

PrecisionFirst: Balanced approach combining automation with workforce investment. Created community college partnership producing 30 technicians annually. Maintained quality while growing 15% per year. Recently won 'Best Employer' in precision manufacturing. The model to emulate.

CraftMold: Avoided all modernization, betting on 'heritage craftsmanship' positioning. Unable to meet medical/aerospace quality documentation requirements. Losing customers to competitors with AI-powered inspection. Likely to fail within 18 months.

MARKET DYNAMICS:

The reshoring wave is real: 30% of medical device precision components are moving to domestic suppliers. Tariffs on Chinese components (20%) and raw materials (25% steel/aluminum, 50% copper) are reshaping competitive economics.

Winners: US-based manufacturers with capacity, quality systems, and workforce. Losers: Offshore producers facing tariffs, and domestic manufacturers who can't staff expansion.

The 415,000 unfilled manufacturing jobs create a structural constraint. Companies investing in workforce development now will capture disproportionate share of reshoring demand.`,
    keyFindings: [
      "MicroPrecision: Mexico offshoring failed FDA audit - customers seeking alternatives",
      "TechMold: acquisition strategy backfired - inherited problems, shedding workers",
      "PrecisionFirst: workforce investment + community college model succeeding",
      "30% of medical precision components reshoring to domestic suppliers",
      "Labor shortage (415K unfilled jobs) constrains industry capacity"
    ],
    dataPoints: [
      { label: "Reshoring Wave", value: "30%", trend: "up" },
      { label: "Steel Tariff", value: "25%", trend: "up" },
      { label: "Unfilled Mfg Jobs", value: "415,000", trend: "up" }
    ],
    publishedDate: "January 2026",
    readingTime: 7
  },
  {
    id: "report-6",
    title: "Case Study: PrecisionFirst Workforce Transformation",
    sourceCode: "TFG",
    category: "case_study",
    summary: "Detailed examination of a successful workforce development strategy in precision manufacturing.",
    content: `PrecisionFirst, a 1,200-person precision component manufacturer in Wisconsin, faced the same challenges as Apex: labor shortage, aging workforce, and reshoring opportunity. Their 24-month transformation offers valuable lessons.

PHASE 1 (Months 1-6): Rather than chase the same 50 qualified workers everyone else was recruiting, they partnered with a local community college. Investment: $600K for a precision manufacturing program. Critical decision: guaranteed employment at $55K starting salary for all graduates.

PHASE 2 (Months 7-12): Created 'Master Technician' career track parallel to management. Senior moldmakers became mentors with 15% pay premium. Gen Z workers who refused management roles found a growth path. Retention improved 40%.

PHASE 3 (Months 13-18): Deployed AI-powered quality inspection, but positioned it as 'assistant to inspectors' not 'replacement.' Inspectors became 'Quality Engineers' overseeing multiple AI stations. Zero layoffs. Defect rates dropped 60%.

PHASE 4 (Months 19-24): First cohort of community college graduates joined. Mentored by Master Technicians, they reached productivity within 6 months instead of typical 18. Pipeline now produces 30 qualified technicians annually.

RESULTS: 15% annual revenue growth. Quality escapes reduced 60%. Named 'Best Employer' in precision manufacturing. Zero union organizing activity. Competitors now attempting to poach their workers - but retention remains above 90%.

KEY INSIGHT: CEO said, 'Everyone was fighting over the same tiny pool of experienced workers. We decided to grow the pool instead. It took longer, but now we have a sustainable advantage no competitor can match.'`,
    keyFindings: [
      "Community college partnership: $600K investment, 30 graduates/year",
      "Master Technician track solved Gen Z management resistance",
      "AI inspection positioned as 'assistant' not 'replacement' - zero layoffs",
      "New graduates productive in 6 months with mentorship (vs. 18 months)",
      "Results: 15% growth, 60% fewer defects, 90%+ retention"
    ],
    dataPoints: [
      { label: "Revenue Growth", value: "+15%/yr", trend: "up" },
      { label: "Quality Improvement", value: "-60% defects", trend: "up" },
      { label: "Retention Rate", value: "90%+", trend: "up" },
      { label: "Pipeline Output", value: "30/year", trend: "up" }
    ],
    publishedDate: "October 2025",
    readingTime: 10
  }
];

const historicalData: HistoricalData[] = [
  { year: 2021, quarter: "Q1", revenue: 108000000, employees: 2500, aiInvestment: 0, marketShare: 8.2, customerSatisfaction: 78, employeeSatisfaction: 82, rndSpending: 4500000, operatingMargin: 16 },
  { year: 2021, quarter: "Q2", revenue: 110000000, employees: 2480, aiInvestment: 0, marketShare: 8.1, customerSatisfaction: 79, employeeSatisfaction: 81, rndSpending: 4800000, operatingMargin: 17 },
  { year: 2021, quarter: "Q3", revenue: 112000000, employees: 2460, aiInvestment: 500000, marketShare: 8.0, customerSatisfaction: 77, employeeSatisfaction: 80, rndSpending: 5000000, operatingMargin: 16 },
  { year: 2021, quarter: "Q4", revenue: 115000000, employees: 2450, aiInvestment: 800000, marketShare: 7.9, customerSatisfaction: 78, employeeSatisfaction: 79, rndSpending: 5200000, operatingMargin: 17 },
  { year: 2022, quarter: "Q1", revenue: 114000000, employees: 2440, aiInvestment: 1000000, marketShare: 7.8, customerSatisfaction: 76, employeeSatisfaction: 78, rndSpending: 5500000, operatingMargin: 16 },
  { year: 2022, quarter: "Q2", revenue: 116000000, employees: 2430, aiInvestment: 1500000, marketShare: 7.7, customerSatisfaction: 77, employeeSatisfaction: 77, rndSpending: 5800000, operatingMargin: 17 },
  { year: 2022, quarter: "Q3", revenue: 118000000, employees: 2420, aiInvestment: 1800000, marketShare: 7.6, customerSatisfaction: 75, employeeSatisfaction: 76, rndSpending: 6000000, operatingMargin: 17 },
  { year: 2022, quarter: "Q4", revenue: 120000000, employees: 2410, aiInvestment: 2200000, marketShare: 7.5, customerSatisfaction: 76, employeeSatisfaction: 75, rndSpending: 6200000, operatingMargin: 18 },
  { year: 2023, quarter: "Q1", revenue: 119000000, employees: 2400, aiInvestment: 2500000, marketShare: 7.4, customerSatisfaction: 74, employeeSatisfaction: 74, rndSpending: 6500000, operatingMargin: 17 },
  { year: 2023, quarter: "Q2", revenue: 121000000, employees: 2390, aiInvestment: 3000000, marketShare: 7.3, customerSatisfaction: 75, employeeSatisfaction: 73, rndSpending: 6800000, operatingMargin: 17 },
  { year: 2023, quarter: "Q3", revenue: 122000000, employees: 2395, aiInvestment: 3500000, marketShare: 7.2, customerSatisfaction: 73, employeeSatisfaction: 72, rndSpending: 7000000, operatingMargin: 18 },
  { year: 2023, quarter: "Q4", revenue: 123000000, employees: 2400, aiInvestment: 4000000, marketShare: 7.1, customerSatisfaction: 74, employeeSatisfaction: 71, rndSpending: 7200000, operatingMargin: 18 },
  { year: 2024, quarter: "Q1", revenue: 122000000, employees: 2400, aiInvestment: 4500000, marketShare: 7.0, customerSatisfaction: 72, employeeSatisfaction: 70, rndSpending: 7500000, operatingMargin: 17 },
  { year: 2024, quarter: "Q2", revenue: 124000000, employees: 2405, aiInvestment: 5000000, marketShare: 6.9, customerSatisfaction: 73, employeeSatisfaction: 69, rndSpending: 7800000, operatingMargin: 18 },
  { year: 2024, quarter: "Q3", revenue: 125000000, employees: 2400, aiInvestment: 5500000, marketShare: 6.8, customerSatisfaction: 74, employeeSatisfaction: 68, rndSpending: 8000000, operatingMargin: 18 },
  { year: 2024, quarter: "Q4", revenue: 126000000, employees: 2400, aiInvestment: 6000000, marketShare: 6.8, customerSatisfaction: 75, employeeSatisfaction: 68, rndSpending: 8200000, operatingMargin: 18 },
  { year: 2025, quarter: "Q1", revenue: 124000000, employees: 2400, aiInvestment: 6500000, marketShare: 6.7, customerSatisfaction: 73, employeeSatisfaction: 67, rndSpending: 8500000, operatingMargin: 17 },
  { year: 2025, quarter: "Q2", revenue: 125000000, employees: 2402, aiInvestment: 7000000, marketShare: 6.7, customerSatisfaction: 74, employeeSatisfaction: 68, rndSpending: 8800000, operatingMargin: 18 },
  { year: 2025, quarter: "Q3", revenue: 126000000, employees: 2400, aiInvestment: 7500000, marketShare: 6.6, customerSatisfaction: 75, employeeSatisfaction: 68, rndSpending: 9000000, operatingMargin: 18 },
  { year: 2025, quarter: "Q4", revenue: 125000000, employees: 2400, aiInvestment: 8000000, marketShare: 6.6, customerSatisfaction: 76, employeeSatisfaction: 68, rndSpending: 9200000, operatingMargin: 18 },
];

const workforceDemographics: WorkforceDemographics = {
  departments: [
    { name: "Operations", headcount: 1200, avgTenure: 9.5, avgAge: 44, aiExposureRisk: 75, reskillingPotential: 60 },
    { name: "Sales", headcount: 250, avgTenure: 5.2, avgAge: 35, aiExposureRisk: 40, reskillingPotential: 85 },
    { name: "Customer Service", headcount: 180, avgTenure: 4.8, avgAge: 32, aiExposureRisk: 70, reskillingPotential: 75 },
    { name: "R&D", headcount: 320, avgTenure: 6.5, avgAge: 38, aiExposureRisk: 25, reskillingPotential: 90 },
    { name: "Administration", headcount: 280, avgTenure: 8.2, avgAge: 42, aiExposureRisk: 55, reskillingPotential: 65 },
    { name: "Quality Assurance", headcount: 170, avgTenure: 7.8, avgAge: 40, aiExposureRisk: 45, reskillingPotential: 70 },
  ],
  skillDistribution: [
    { skill: "Manufacturing Operations", percentage: 42, demandTrend: "declining" },
    { skill: "Technical Engineering", percentage: 18, demandTrend: "growing" },
    { skill: "Customer Relations", percentage: 12, demandTrend: "stable" },
    { skill: "Data Analytics", percentage: 6, demandTrend: "growing" },
    { skill: "Project Management", percentage: 10, demandTrend: "growing" },
    { skill: "Administrative", percentage: 8, demandTrend: "declining" },
    { skill: "Robotics/Automation", percentage: 4, demandTrend: "growing" },
  ],
  tenureDistribution: [
    { range: "0-2 years", count: 420 },
    { range: "2-5 years", count: 580 },
    { range: "5-10 years", count: 650 },
    { range: "10-15 years", count: 450 },
    { range: "15+ years", count: 300 },
  ],
};

export class MemStorage implements IStorage {
  private departments: Department[] = [...defaultDepartments];
  private playerDecisions: Map<string, PlayerDecisionSubmission[]> = new Map();
  private playerPerformances: Map<string, PlayerPerformance> = new Map();
  private simulationConfig: SimulationConfig = { ...defaultSimulationConfig };

  async getTeam(id: string): Promise<Team | undefined> {
    const { teamStorage } = await import("./team-storage");
    return teamStorage.getTeam(id);
  }

  async getAllTeams(): Promise<Team[]> {
    const { teamStorage } = await import("./team-storage");
    return teamStorage.getAllTeams();
  }

  async getDefaultTeam(): Promise<Team | null> {
    const { teamStorage } = await import("./team-storage");
    const teams = await teamStorage.getAllTeams();
    return teams.length > 0 ? teams[0] : null;
  }

  async hasActiveTeam(): Promise<boolean> {
    const { teamStorage } = await import("./team-storage");
    return teamStorage.hasActiveTeam();
  }

  async createTeam(insertTeam: InsertTeam): Promise<Team> {
    const { teamStorage } = await import("./team-storage");
    return teamStorage.createTeam(insertTeam);
  }

  async markReportViewed(teamId: string, reportId: string): Promise<Team | undefined> {
    const { teamStorage } = await import("./team-storage");
    const team = await teamStorage.getTeam(teamId);
    if (!team) return undefined;
    if (!team.viewedReportIds.includes(reportId)) {
      return teamStorage.updateTeam(teamId, { 
        viewedReportIds: [...team.viewedReportIds, reportId] 
      });
    }
    return team;
  }

  async getResearchProgress(teamId: string): Promise<{ viewed: number; total: number; percentage: number }> {
    const { teamStorage } = await import("./team-storage");
    const team = await teamStorage.getTeam(teamId);
    const total = researchReports.length;
    const viewed = team?.viewedReportIds?.length || 0;
    return { viewed, total, percentage: total > 0 ? (viewed / total) * 100 : 0 };
  }

  async completeResearch(teamId: string): Promise<{ success: boolean; team?: Team; error?: string }> {
    const { teamStorage } = await import("./team-storage");
    const team = await teamStorage.getTeam(teamId);
    if (!team) return { success: false, error: "Team not found" };
    
    const progress = await this.getResearchProgress(teamId);
    if (progress.percentage < 50) {
      return { success: false, error: `Must review at least 50% of research materials. Current: ${Math.round(progress.percentage)}%` };
    }
    
    const updatedTeam = await teamStorage.updateTeam(teamId, { researchComplete: true, currentWeek: 1 });
    return { success: true, team: updatedTeam };
  }

  async getResearchReports(): Promise<ResearchReport[]> {
    return researchReports;
  }

  async getHistoricalData(): Promise<HistoricalData[]> {
    return historicalData;
  }

  async getWorkforceDemographics(): Promise<WorkforceDemographics> {
    return workforceDemographics;
  }

  async updateTeam(id: string, updates: Partial<Team>): Promise<Team | undefined> {
    const { teamStorage } = await import("./team-storage");
    return teamStorage.updateTeam(id, updates);
  }

  async getDepartments(): Promise<Department[]> {
    return this.departments;
  }

  async updateDepartment(id: string, updates: Partial<Department>): Promise<Department | undefined> {
    const index = this.departments.findIndex((d) => d.id === id);
    if (index === -1) return undefined;
    this.departments[index] = { ...this.departments[index], ...updates };
    return this.departments[index];
  }

  async getWeeklyBriefing(weekNumber: number): Promise<WeeklyBriefing> {
    const scenario = weeklyScenarios.find(s => s.weekNumber === weekNumber);
    const decisions = weeklyDecisions.filter(d => d.weekNumber === weekNumber);
    
    return {
      weekNumber,
      date: `Week ${weekNumber} - January 2026`,
      articles: scenario?.contextArticles || briefingArticles.slice(0, 3),
      event: globalEvents[weekNumber % globalEvents.length],
      scenario,
      decisions,
    };
  }

  async getWeeklyScenario(weekNumber: number): Promise<WeeklyScenario | undefined> {
    return weeklyScenarios.find(s => s.weekNumber === weekNumber);
  }

  async getWeeklyDecisions(weekNumber: number): Promise<WeeklyDecision[]> {
    return weeklyDecisions.filter(d => d.weekNumber === weekNumber);
  }

  async submitDecision(teamId: string, decisionId: string, optionId: string, rationale?: string): Promise<Team | undefined> {
    const { teamStorage } = await import("./team-storage");
    const team = await teamStorage.getTeam(teamId);
    if (!team) return undefined;

    const decision = weeklyDecisions.find(d => d.id === decisionId);
    if (!decision) return undefined;

    const option = decision.options.find(o => o.id === optionId);
    if (!option) return undefined;

    const record: DecisionRecord = {
      id: randomUUID(),
      weekNumber: team.currentWeek,
      decisionId,
      optionId,
      timestamp: new Date().toISOString(),
      rationale,
    };

    const updatedState = { ...team.companyState };

    if (option.financialImpact.debt) {
      updatedState.debt += option.financialImpact.debt;
    }
    if (option.financialImpact.cost) {
      updatedState.cash -= option.financialImpact.cost;
    }
    if (option.financialImpact.revenue) {
      updatedState.revenue += option.financialImpact.revenue;
    }

    if (option.workforceImpact.morale) {
      updatedState.morale = Math.max(0, Math.min(100, updatedState.morale + option.workforceImpact.morale));
    }
    if (option.workforceImpact.unionSentiment) {
      updatedState.unionSentiment = Math.max(0, Math.min(100, updatedState.unionSentiment + option.workforceImpact.unionSentiment));
    }
    if (option.workforceImpact.employees) {
      updatedState.employees += option.workforceImpact.employees;
    }
    if (option.workforceImpact.adaptability) {
      updatedState.workforceAdaptability = Math.max(0, Math.min(100, updatedState.workforceAdaptability + option.workforceImpact.adaptability));
    }

    if (option.automationImpact?.level) {
      updatedState.automationLevel = Math.max(0, Math.min(100, updatedState.automationLevel + option.automationImpact.level));
    }
    if (option.automationImpact?.roi) {
      updatedState.automationROI = Math.max(0, updatedState.automationROI + option.automationImpact.roi);
    }

    if (option.leadershipImpact?.managementBench) {
      updatedState.managementBenchStrength = Math.max(0, Math.min(100, updatedState.managementBenchStrength + option.leadershipImpact.managementBench));
    }
    if (option.leadershipImpact?.managerVacancies) {
      updatedState.managerVacancies = Math.max(0, updatedState.managerVacancies + option.leadershipImpact.managerVacancies);
    }

    if (updatedState.unionSentiment >= 75 && !updatedState.unionized) {
      updatedState.unionized = true;
    }

    return teamStorage.updateTeam(teamId, {
      companyState: updatedState,
      decisionRecords: [...team.decisionRecords, record],
    });
  }

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    const { teamStorage } = await import("./team-storage");
    const teams = await teamStorage.getAllTeams();
    const entries: LeaderboardEntry[] = [];
    
    for (const team of teams) {
      const workforceRatio = team.companyState.employees / 2400;
      const financialScore = (team.companyState.revenue / 125000000) * workforceRatio * 100;
      const culturalScore = (team.companyState.morale + (100 - team.companyState.unionSentiment) + team.companyState.workforceAdaptability) / 3;
      
      entries.push({
        teamId: team.id,
        teamName: team.name,
        rank: 0,
        financialScore: Math.round(financialScore),
        culturalScore: Math.round(culturalScore),
        combinedScore: Math.round((financialScore + culturalScore) / 2),
        currentWeek: team.currentWeek,
      });
    }

    entries.sort((a, b) => b.combinedScore - a.combinedScore);
    entries.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return entries;
  }

  async getPeopleAnalytics(teamId: string): Promise<PeopleAnalytics> {
    const { teamStorage } = await import("./team-storage");
    const team = await teamStorage.getTeam(teamId);
    const morale = team?.companyState.morale ?? 68;
    const unionSentiment = team?.companyState.unionSentiment ?? 35;
    
    return {
      sentimentByDepartment: [
        { department: "Operations", sentiment: Math.max(20, morale - 15 + (unionSentiment > 50 ? -10 : 0)), trend: unionSentiment > 50 ? "down" : "stable" },
        { department: "Sales", sentiment: morale + 5, trend: "stable" },
        { department: "Customer Service", sentiment: morale - 5, trend: "down" },
        { department: "R&D", sentiment: morale + 10, trend: "up" },
        { department: "Administration", sentiment: morale, trend: "stable" },
      ],
      keyIssues: [
        { id: "1", issue: "Automation concerns in Operations", priority: "high", affectedEmployees: 450, category: "Job Security" },
        { id: "2", issue: "Management pipeline gaps", priority: "high", affectedEmployees: 120, category: "Career Development" },
        { id: "3", issue: "Gen Z career path concerns", priority: "medium", affectedEmployees: 672, category: "Career Development" },
        { id: "4", issue: "Union organizing activity", priority: unionSentiment > 50 ? "high" : "medium", affectedEmployees: 800, category: "Labor Relations" },
      ],
      behaviorTrends: [
        { week: 1, productivity: 85, engagement: 72, turnoverRisk: 18 },
        { week: 2, productivity: 82, engagement: 68, turnoverRisk: 22 },
        { week: 3, productivity: 80, engagement: 65, turnoverRisk: 25 },
        { week: 4, productivity: 78, engagement: 62, turnoverRisk: 28 },
      ],
      employeeSegments: [
        { segment: "High Performers", count: 480, avgMorale: morale + 15 },
        { segment: "Steady Contributors", count: 1200, avgMorale: morale },
        { segment: "At Risk", count: 480, avgMorale: morale - 20 },
        { segment: "Gen Z Workers", count: 672, avgMorale: morale - 5 },
      ],
    };
  }

  async addDecision(teamId: string, decision: InsertDecision): Promise<Decision> {
    const { teamStorage } = await import("./team-storage");
    const team = await teamStorage.getTeam(teamId);
    if (!team) throw new Error("Team not found");

    const newDecision: Decision = {
      ...decision,
      id: randomUUID(),
      timestamp: new Date().toISOString(),
    };

    const updatedDecisions = [...team.decisions, newDecision];
    await teamStorage.updateTeam(teamId, { decisions: updatedDecisions });

    return newDecision;
  }

  async advanceWeek(teamId: string): Promise<Team | undefined> {
    const { teamStorage } = await import("./team-storage");
    const team = await teamStorage.getTeam(teamId);
    if (!team) return undefined;
    if (team.currentWeek >= team.totalWeeks) return team;

    const state = team.companyState;
    const interestPayment = (state.debt * state.debtInterestRate) / 4;
    
    const automationBonus = state.automationLevel * 0.002;
    const moraleMultiplier = state.morale / 100;
    const revenueChange = state.revenue * (automationBonus * moraleMultiplier);
    
    const historyEntry = {
      week: team.currentWeek,
      revenue: state.revenue,
      employees: state.employees,
      morale: state.morale,
      financialScore: Math.round((state.revenue / 125000000) * (state.employees / 2400) * 100),
      culturalScore: Math.round((state.morale + (100 - state.unionSentiment) + state.workforceAdaptability) / 3),
      debt: state.debt,
      automationLevel: state.automationLevel,
      unionSentiment: state.unionSentiment,
      managementBench: state.managementBenchStrength,
      decisionsThisWeek: team.decisionRecords.filter((d: DecisionRecord) => d.weekNumber === team.currentWeek).map((d: DecisionRecord) => d.optionId),
    };

    const updatedState = {
      ...state,
      cash: state.cash - interestPayment,
      revenue: state.revenue + revenueChange,
    };

    return teamStorage.updateTeam(teamId, {
      currentWeek: team.currentWeek + 1,
      companyState: updatedState,
      weeklyHistory: [...team.weeklyHistory, historyEntry],
    });
  }

  async getEnhancedDecisions(weekNumber: number): Promise<EnhancedDecision[]> {
    return enhancedDecisions.filter(d => d.weekNumber === weekNumber);
  }

  async submitEnhancedDecision(
    playerId: string,
    decisionId: string,
    attributeValues: Record<string, number | string | boolean>,
    rationale: string
  ): Promise<PlayerDecisionSubmission> {
    const decision = enhancedDecisions.find(d => d.id === decisionId);
    if (!decision) throw new Error("Decision not found");

    const computedImpact: Record<string, number> = {};
    
    for (const attr of decision.attributes) {
      const value = attributeValues[attr.id];
      if (value !== undefined && attr.impactFormula) {
        for (const [impactKey, multiplier] of Object.entries(attr.impactFormula)) {
          if (typeof multiplier === 'number' && typeof value === 'number') {
            computedImpact[impactKey] = (computedImpact[impactKey] || 0) + (value * multiplier);
          } else if (typeof value === 'boolean' && value && typeof multiplier === 'number') {
            computedImpact[impactKey] = (computedImpact[impactKey] || 0) + multiplier;
          }
        }
      }
    }

    const submission: PlayerDecisionSubmission = {
      id: randomUUID(),
      odecisionId: decisionId,
      playerId,
      weekNumber: decision.weekNumber,
      attributeValues,
      rationale,
      timestamp: new Date().toISOString(),
      computedImpact,
    };

    const existing = this.playerDecisions.get(playerId) || [];
    this.playerDecisions.set(playerId, [...existing, submission]);

    return submission;
  }

  async getSimulationConfig(): Promise<SimulationConfig> {
    return this.simulationConfig;
  }

  async updateSimulationConfig(updates: Partial<SimulationConfig>): Promise<SimulationConfig> {
    this.simulationConfig = {
      ...this.simulationConfig,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return this.simulationConfig;
  }

  async getPlayerPerformance(playerId: string): Promise<PlayerPerformance | undefined> {
    return this.playerPerformances.get(playerId);
  }

  async getAllPlayerPerformances(): Promise<PlayerPerformance[]> {
    return Array.from(this.playerPerformances.values());
  }

  async getAdminAnalytics(): Promise<AdminAnalytics> {
    const performances = await this.getAllPlayerPerformances();
    const totalPlayers = performances.length;
    const activePlayers = performances.filter(p => p.weeklyScores.length > 0).length;

    const avgFinancial = performances.length > 0 
      ? performances.reduce((sum, p) => sum + p.totalFinancialScore, 0) / performances.length 
      : 0;
    const avgCultural = performances.length > 0
      ? performances.reduce((sum, p) => sum + p.totalCulturalScore, 0) / performances.length
      : 0;
    const avgCombined = performances.length > 0
      ? performances.reduce((sum, p) => sum + p.totalCombinedScore, 0) / performances.length
      : 0;

    const sortedPerformers = [...performances].sort((a, b) => b.totalCombinedScore - a.totalCombinedScore);
    const topPerformers = sortedPerformers.slice(0, 10).map((p, idx) => ({
      playerId: p.playerId,
      playerName: p.playerName,
      combinedScore: p.totalCombinedScore,
      rank: idx + 1,
    }));

    const totalEasterEggsFound = performances.reduce((sum, p) => sum + p.totalEasterEggsFound, 0);
    const possibleEasterEggs = performances.length * easterEggs.length;
    const easterEggDetectionRate = possibleEasterEggs > 0 ? totalEasterEggsFound / possibleEasterEggs : 0;

    return {
      simulationId: this.simulationConfig.id,
      totalPlayers,
      activePlayers,
      currentWeek: 1,
      playerPerformances: performances,
      topPerformers,
      averageScores: {
        financial: Math.round(avgFinancial),
        cultural: Math.round(avgCultural),
        combined: Math.round(avgCombined),
      },
      easterEggDetectionRate: Math.round(easterEggDetectionRate * 100),
      completionRate: totalPlayers > 0 ? Math.round((activePlayers / totalPlayers) * 100) : 0,
    };
  }

  async getEasterEggs(): Promise<EasterEgg[]> {
    return easterEggs;
  }

  async detectEasterEggs(rationale: string, weekNumber: number): Promise<string[]> {
    const found: string[] = [];
    const lowerRationale = rationale.toLowerCase();
    
    for (const egg of easterEggs) {
      if (egg.weekNumber === undefined || egg.weekNumber === weekNumber) {
        if (lowerRationale.includes(egg.keyword.toLowerCase())) {
          found.push(egg.id);
        }
      }
    }
    
    return found;
  }

  async logActivity(log: Omit<ActivityLog, "id" | "timestamp">): Promise<ActivityLog> {
    const activityLog: ActivityLog = {
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      ...log,
    };
    activityLogs.push(activityLog);
    return activityLog;
  }

  async getActivityLogs(filters?: { 
    eventType?: string; 
    userId?: string; 
    teamId?: string; 
    startDate?: string; 
    endDate?: string;
  }): Promise<ActivityLog[]> {
    let logs = [...activityLogs];
    
    if (filters) {
      if (filters.eventType) {
        logs = logs.filter(l => l.eventType === filters.eventType);
      }
      if (filters.userId) {
        logs = logs.filter(l => l.userId === filters.userId);
      }
      if (filters.teamId) {
        logs = logs.filter(l => l.teamId === filters.teamId);
      }
      if (filters.startDate) {
        const startTime = new Date(filters.startDate).getTime();
        logs = logs.filter(l => new Date(l.timestamp).getTime() >= startTime);
      }
      if (filters.endDate) {
        const endTime = new Date(filters.endDate).getTime();
        logs = logs.filter(l => new Date(l.timestamp).getTime() <= endTime);
      }
    }
    
    // Sort by timestamp descending (most recent first)
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async exportActivityLogs(format: "csv" | "json"): Promise<string> {
    const logs = await this.getActivityLogs();
    
    if (format === "json") {
      return JSON.stringify(logs, null, 2);
    }
    
    // CSV format
    const headers = ["Timestamp", "Event Type", "User ID", "User Email", "User Name", "Team ID", "Team Name", "Week", "Details"];
    const rows = logs.map(log => [
      log.timestamp,
      log.eventType,
      log.userId || "",
      log.userEmail || "",
      log.userName || "",
      log.teamId || "",
      log.teamName || "",
      log.weekNumber?.toString() || "",
      log.details ? JSON.stringify(log.details) : "",
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    ].join("\n");
    
    return csvContent;
  }

  async createEducatorInquiry(inquiry: { 
    name: string; 
    email: string; 
    phone?: string | null; 
    institution?: string | null; 
    inquiryType: string; 
    message: string 
  }): Promise<{ id: string }> {
    const { db } = await import("./db");
    const { educatorInquiries } = await import("@shared/models/auth");
    
    const [result] = await db.insert(educatorInquiries).values({
      name: inquiry.name,
      email: inquiry.email,
      phone: inquiry.phone || null,
      institution: inquiry.institution || null,
      inquiryType: inquiry.inquiryType,
      message: inquiry.message,
    }).returning({ id: educatorInquiries.id });
    
    return { id: result.id };
  }
}

export const storage = new MemStorage();
