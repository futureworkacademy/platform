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
}

const globalEvents: GlobalEvent[] = [
  { id: "1", name: "Tariff Increase (50%)", description: "US tariffs on imports rise to 50%, increasing costs for raw materials.", impact: { revenue: -0.15, morale: -10 } },
  { id: "2", name: "Reciprocal Tariff on US", description: "China imposes reciprocal tariffs on US exports, hitting Apex's overseas sales.", impact: { revenue: -0.20, morale: -5 } },
  { id: "3", name: "Geopolitical Tension", description: "Escalating conflicts disrupt global supply chains.", impact: { revenue: -0.10, employees: -10, morale: -15 } },
  { id: "4", name: "Labor Strike", description: "Union workers strike over AI-related job concerns.", impact: { morale: -20, revenue: -0.05 } },
  { id: "5", name: "Tech Breakthrough", description: "New ML tools for manufacturing reduce costs industry-wide.", impact: { revenue: 0.15, morale: 10 } },
  { id: "6", name: "Economic Boom", description: "US economy surges, boosting demand for auto parts.", impact: { revenue: 0.10, employees: 20 } },
  { id: "7", name: "Supply Chain Shortage", description: "Chip shortages delay production.", impact: { revenue: -0.12, morale: -8 } },
  { id: "8", name: "Regulatory Change", description: "New incentives for AI adoption in manufacturing.", impact: { revenue: 0.08, morale: 5 } },
];

const briefingArticles: BriefingArticle[] = [
  {
    id: "1",
    title: "AI in Manufacturing: Opportunities and Risks",
    content: "Experts predict AI could boost productivity by 40% but displace 20% of jobs. Industry leaders emphasize the importance of proactive workforce transition programs to maintain employee morale during digital transformation.",
    source: "Manufacturing Today",
    category: "ai",
    insights: ["AI boosts productivity", "Job displacement risk", "Reskilling mitigates morale drop"],
  },
  {
    id: "2",
    title: "Trade Wars Heat Up",
    content: "US-China tariffs expected to rise further. Companies with strong government relations are better positioned to secure exemptions. Consider diversifying suppliers to reduce geopolitical exposure.",
    source: "Bloomberg",
    category: "trade",
    insights: ["Tariffs incoming", "Lobby for exemptions", "Supply chain diversification"],
  },
  {
    id: "3",
    title: "Gen Z Workers Shun Management Roles",
    content: "New research shows 72% of Gen Z workers have no interest in becoming managers. They cite work-life balance concerns and the 'emotional labor' of management. Companies must adapt their leadership pipelines.",
    source: "Harvard Business Review",
    category: "workforce",
    insights: ["Gen Z avoids management", "Leadership pipeline at risk", "New career paths needed"],
  },
  {
    id: "4",
    title: "Union Activity Surges in Manufacturing",
    content: "Union organizing campaigns have increased 40% year-over-year in manufacturing. Workers cite automation fears and wage stagnation as primary motivators. Proactive engagement can mitigate organizing risk.",
    source: "Labor Relations Weekly",
    category: "labor",
    insights: ["Union activity rising", "Automation fears drive organizing", "Proactive engagement helps"],
  },
  {
    id: "5",
    title: "Bank Lending for Automation Investments",
    content: "Commercial banks are offering favorable terms for automation investments, with rates as low as 5.5%. However, debt-financed automation carries risks if implementation fails or displaces too many workers.",
    source: "Financial Times",
    category: "finance",
    insights: ["Favorable lending rates", "Debt financing available", "Implementation risk exists"],
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
    title: "The Automation Imperative",
    narrative: `The board has delivered an ultimatum: Apex Manufacturing must modernize or face acquisition. Competitors have achieved 30% cost reductions through robotics and AI. Your CFO has secured preliminary approval for a $15M line of credit from First National Bank at 6.5% interest to fund automation investments.

However, the factory floor is buzzing with rumors. Workers have seen what happened at AutoTech Industries - 30% workforce reduction in 18 months. Your HR Director reports that informal union organizing discussions have begun in the Operations department.

You have one week to decide how to approach this transformation. The board wants bold action, but your workforce wants assurance.`,
    pressures: [
      { source: "Board of Directors", message: "We need a 25% cost reduction within 2 years or we'll explore strategic alternatives.", urgency: "critical" },
      { source: "CFO", message: "The bank loan is ready. We can draw $15M at 6.5% interest, but we need a solid plan.", urgency: "high" },
      { source: "Operations Manager", message: "My team is scared. If we don't address their concerns, we'll see productivity drop before we even start.", urgency: "high" },
      { source: "Union Representative", message: "Workers are talking. How leadership handles this will determine whether we organize.", urgency: "medium" },
    ],
    contextArticles: briefingArticles.slice(0, 3),
    keyQuestion: "How will you finance and communicate your automation strategy?",
  },
  {
    weekNumber: 2,
    title: "The Talent Pipeline Crisis",
    narrative: `Your automation planning has revealed a deeper problem: Apex lacks the technical talent to implement and maintain advanced systems. Your current managers are stretched thin, and the Gen Z workers who could fill the pipeline have no interest in management roles.

Exit interviews from the past quarter show a troubling pattern - your best young talent is leaving for companies offering 'individual contributor' career tracks without management responsibilities. Meanwhile, 5 of your 12 middle managers are within 3 years of retirement.

The technology vendor has offered to provide training, but it will cost $2M and take 6 months. Some board members suggest just hiring externally. Your HR Director warns this could further demoralize the existing workforce.`,
    pressures: [
      { source: "HR Director", message: "We're losing Gen Z talent to competitors. They don't want to be managers - they want technical career paths.", urgency: "high" },
      { source: "Operations Manager", message: "Half my supervisors will retire in 3 years. We have no one ready to step up.", urgency: "high" },
      { source: "Technology Vendor", message: "We can train your team, but it requires commitment and investment upfront.", urgency: "medium" },
      { source: "Board Member", message: "Just hire the talent we need. The existing workforce has the wrong skills anyway.", urgency: "medium" },
    ],
    contextArticles: briefingArticles.filter(a => a.category === "workforce"),
    keyQuestion: "How will you build your leadership and technical talent pipeline?",
  },
  {
    weekNumber: 3,
    title: "Union Storm Brewing",
    narrative: `The union organizing effort has gained momentum. A vote is now scheduled for next month. Union representatives are framing the automation initiative as a 'job elimination program' and pointing to your bank loan as evidence of management prioritizing machines over people.

Your legal team advises that you can communicate with employees about the implications of unionization, but you cannot threaten or promise benefits to influence the vote. Your HR Director believes a comprehensive reskilling commitment might defuse the situation.

Meanwhile, the first automation equipment has arrived and is sitting on the loading dock. Workers are photographing it and sharing images on social media with captions like 'Our replacements have arrived.'`,
    pressures: [
      { source: "Union Organizer", message: "Workers have a right to collective bargaining. Management has shown they care more about robots than people.", urgency: "critical" },
      { source: "General Counsel", message: "We need to be very careful here. Any missteps could be unfair labor practice charges.", urgency: "high" },
      { source: "HR Director", message: "A genuine reskilling commitment - not just words - could change the narrative.", urgency: "high" },
      { source: "CFO", message: "If we unionize, our labor costs will increase 15-20%. The automation ROI projections won't work.", urgency: "high" },
    ],
    contextArticles: briefingArticles.filter(a => a.category === "labor" || a.category === "workforce"),
    keyQuestion: "How will you respond to the unionization effort while maintaining your transformation agenda?",
  },
  {
    weekNumber: 4,
    title: "The First Displacement",
    narrative: `Phase 1 automation is ready to go live in the Operations department. The system will eliminate 45 positions - about 8% of your total workforce. You must decide what happens to these workers.

Your reskilling program has identified that 30 of the 45 affected workers could transition to new roles operating and maintaining the automated systems - but this requires 3 months of training during which they would be paid but not productive. The remaining 15 workers lack the aptitude for technical roles.

Industry benchmarks suggest severance of 2 weeks per year of service is standard, but some competitors have offered enhanced packages to maintain community reputation. The local newspaper has already published a story about 'layoff rumors at Apex.'`,
    pressures: [
      { source: "Operations Manager", message: "We can't delay the automation anymore. Every week we wait costs us $200K in competitive disadvantage.", urgency: "critical" },
      { source: "HR Director", message: "How we handle these 45 workers will define our employer brand for a decade.", urgency: "high" },
      { source: "CFO", message: "The bank is watching. They want to see ROI from their loan, not just training expenses.", urgency: "high" },
      { source: "Mayor's Office", message: "Apex is the second-largest employer in this county. We're concerned about workforce impacts.", urgency: "medium" },
    ],
    contextArticles: briefingArticles.slice(0, 2),
    keyQuestion: "How will you handle the workers displaced by automation?",
  },
  {
    weekNumber: 5,
    title: "The Manager Exodus",
    narrative: `Three of your middle managers have resigned this week, citing 'burnout' and 'change fatigue.' They're not going to competitors - they're leaving manufacturing entirely. This leaves critical gaps in Production Planning, Quality Control, and Maintenance.

Your Gen Z workers refuse the promotion opportunities. In focus groups, they cite 'unrealistic expectations,' 'always-on culture,' and 'emotional labor with no upside.' They prefer the new technical specialist track you created, which pays well but has no direct reports.

The remaining managers are working 60+ hour weeks. Two have requested medical leave for stress-related conditions. Your COO is asking if AI could augment management capacity - essentially having algorithms handle scheduling, performance monitoring, and routine decisions.`,
    pressures: [
      { source: "COO", message: "We need to fundamentally rethink the management model. AI-augmented management could be the answer.", urgency: "high" },
      { source: "HR Director", message: "Our remaining managers are burning out. If we lose more, operations will collapse.", urgency: "critical" },
      { source: "Gen Z Focus Group", message: "We want careers, not boss jobs. Give us technical paths that pay like management.", urgency: "high" },
      { source: "External Consultant", message: "Many companies are flattening hierarchies and using technology to reduce management layers.", urgency: "medium" },
    ],
    contextArticles: briefingArticles.filter(a => a.category === "workforce" || a.category === "ai"),
    keyQuestion: "How will you address the management crisis and adapt your organizational structure?",
  },
  {
    weekNumber: 6,
    title: "Debt Day of Reckoning",
    narrative: `The quarterly board meeting is approaching, and the numbers tell a mixed story. Automation has delivered 15% of projected cost savings - but implementation delays and worker transition costs have eaten into the ROI. You're now carrying $12M in debt with $650K in quarterly interest payments.

The bank has requested a meeting to review the loan covenant terms. While you're not yet in violation, they're 'concerned about trajectory.' If the automation doesn't deliver results in the next two quarters, you may face a capital call or restructuring.

Meanwhile, morale has stabilized after the rocky start. The reskilling program is showing results, and the union vote - whether it happened or not - has clarified the employee relations situation. But the financial pressure is mounting.`,
    pressures: [
      { source: "Bank Representative", message: "We need to see the automation ROI materialize. The covenant requires 1.5x debt service coverage by Q3.", urgency: "critical" },
      { source: "CFO", message: "We have options: accelerate automation to capture more savings, or slow down to reduce burn rate.", urgency: "high" },
      { source: "Board Chair", message: "The shareholders are getting nervous. We need a credible path to profitability improvement.", urgency: "high" },
      { source: "COO", message: "The team is finally getting the hang of the new systems. Momentum is building.", urgency: "medium" },
    ],
    contextArticles: briefingArticles.filter(a => a.category === "finance" || a.category === "ai"),
    keyQuestion: "How will you manage the financial pressure while maintaining transformation momentum?",
  },
  {
    weekNumber: 7,
    title: "The Competitive Response",
    narrative: `Your largest competitor, PrecisionParts, has announced a major customer win - a contract you were favored to get. Their pitch emphasized 'automation-enabled quality' and 'flexible workforce capabilities.' The customer specifically cited concerns about labor instability at Apex.

The market is taking notice. Industry analysts have downgraded Apex's outlook, citing 'execution risk' and 'unclear cultural health.' Your sales pipeline has softened 15% as prospects adopt a wait-and-see approach.

However, there's opportunity in crisis. A smaller competitor, FastParts, is struggling with their own automation initiative and has laid off 25% of their workforce. Their customers are looking for alternatives, and their displaced workers - many of them skilled - are available for hire.`,
    pressures: [
      { source: "Sales VP", message: "We're losing deals because of our reputation. We need a bold move to show we've figured this out.", urgency: "critical" },
      { source: "Industry Analyst", message: "The market sees Apex as behind the curve. You need proof points of successful transformation.", urgency: "high" },
      { source: "Recruiting", message: "FastParts laid off excellent talent. We could hire 20 skilled workers at below-market rates.", urgency: "medium" },
      { source: "Customer", message: "We want to work with Apex, but we need assurance your operations are stable.", urgency: "high" },
    ],
    contextArticles: briefingArticles.slice(0, 3),
    keyQuestion: "How will you respond to competitive pressure and rebuild market confidence?",
  },
  {
    weekNumber: 8,
    title: "The New Equilibrium",
    narrative: `Eight weeks have passed since you began this transformation. The dust is settling, and the organization is finding a new equilibrium. Some choices worked brilliantly; others have created lasting challenges. It's time to consolidate gains and set direction for the next phase.

Your workforce has changed fundamentally. The skills mix is different, the organizational structure has evolved, and the relationship between management and workers has been redefined. The question now is sustainability - can you maintain momentum without burning out the organization?

The board wants a 3-year strategic plan incorporating lessons learned. The bank wants a refinancing proposal. Your employees want clarity about their futures. And the market wants proof that Apex can compete.`,
    pressures: [
      { source: "Board of Directors", message: "Present your 3-year strategic plan. We need to see how this quarter's actions become sustainable advantage.", urgency: "high" },
      { source: "Bank", message: "Based on your progress, we're prepared to discuss refinancing options.", urgency: "medium" },
      { source: "Employee Council", message: "We've come through a lot together. What's the vision for the next three years?", urgency: "high" },
      { source: "Major Customer", message: "We're ready to expand our relationship if you can demonstrate sustained capability.", urgency: "high" },
    ],
    contextArticles: briefingArticles,
    keyQuestion: "What legacy will you leave, and what foundation will you build for the future?",
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
  { id: "ee1", keyword: "72%", sourceReport: "Gen Z refusing management roles", pointValue: 2 },
  { id: "ee2", keyword: "10,000", sourceReport: "Reskilling investment per employee", pointValue: 2 },
  { id: "ee3", keyword: "12%", sourceReport: "Turnover reduction from reskilling", pointValue: 2 },
  { id: "ee4", keyword: "AutoTech", sourceReport: "AutoTech Industries case study", pointValue: 3 },
  { id: "ee5", keyword: "30%", sourceReport: "AutoTech workforce reduction", pointValue: 2 },
  { id: "ee6", keyword: "18 months", sourceReport: "AutoTech timeline", pointValue: 1 },
  { id: "ee7", keyword: "TechnoForge", sourceReport: "TechnoForge reskilling success", pointValue: 3 },
  { id: "ee8", keyword: "25%", sourceReport: "TechnoForge reskilling budget allocation", pointValue: 2 },
  { id: "ee9", keyword: "7.2", sourceReport: "Average employee tenure", pointValue: 1 },
  { id: "ee10", keyword: "40%", sourceReport: "Manufacturing union organizing increase", pointValue: 2 },
  { id: "ee11", keyword: "85%", sourceReport: "Conservative timeline success rate", pointValue: 2 },
  { id: "ee12", keyword: "35%", sourceReport: "Early communication anxiety reduction", pointValue: 2 },
  { id: "ee13", keyword: "80%", sourceReport: "Internal redeployment with job guarantee", pointValue: 2 },
  { id: "ee14", keyword: "dual career", sourceReport: "Dual career track solution", pointValue: 3 },
  { id: "ee15", keyword: "15-20%", sourceReport: "Union labor cost increase", pointValue: 2 },
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
    content: `Apex Manufacturing Inc. is a mid-sized automotive parts supplier with 2,400 employees across operations, sales, customer service, R&D, and corporate functions. Founded in 1985, the company has built a reputation for quality but faces increasing pressure from competitors embracing automation.

Current financial position: $125M annual revenue with healthy 18% operating margins. However, growth has stagnated at 3% annually over the past 5 years while competitors average 8%. The company has $15M in available cash and access to a $15M credit line at 6.5% interest.

The workforce has 7.2 year average tenure, which is both an asset and challenge. Employee surveys indicate high pride in craftsmanship but growing anxiety about technological change. 42% of employees report concern about AI-related job displacement.

Notably, 28% of the workforce is Gen Z (born 1997-2012), and internal surveys show 72% of this group has no interest in management roles. The company has 8 unfilled manager positions and 5 managers retiring within 3 years.

Union activity: While not currently unionized, informal organizing discussions have been observed in the Operations department, particularly among workers with high AI exposure risk.`,
    keyFindings: [
      "2,400 employees with 7.2 year average tenure - stability but change resistance",
      "Revenue growth stagnated at 3% vs. 8% industry average",
      "42% of employees concerned about AI job displacement",
      "28% Gen Z workforce, 72% of whom refuse management roles",
      "8 unfilled manager positions, 5 managers retiring in 3 years"
    ],
    dataPoints: [
      { label: "Annual Revenue", value: "$125M", trend: "stable" },
      { label: "Employee Count", value: "2,400", trend: "stable" },
      { label: "Avg Tenure", value: "7.2 yrs", trend: "stable" },
      { label: "Gen Z Workforce", value: "28%", trend: "up" }
    ],
    publishedDate: "January 2026",
    readingTime: 6
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
    title: "Competitive Analysis: Auto Parts Sector",
    sourceCode: "CMP",
    category: "competition",
    summary: "Strategic assessment of key competitors and their AI transformation initiatives.",
    content: `TIER 1 COMPETITORS:

AutoTech Industries: Aggressive automation, taking $20M in debt. Reduced workforce 30% while increasing output 45%. However: union certified, 2 strikes in 18 months, customer satisfaction dropped 15 points, now struggling to hire skilled technicians.

PrecisionParts Co.: Balanced approach, $8M debt. Combined AI deployment with $3M reskilling investment. Maintained workforce size while improving productivity 28%. Employee morale high. Recently won 'Best Employer' award. Won the contract Apex was favored for.

TIER 2 COMPETITORS:

FastParts: Attempted rapid automation without workforce investment. Quality issues led to customer defections. Currently laying off 25% of workforce. May be acquisition target.

CraftWorks: Avoided automation entirely, betting on 'craftsmanship' positioning. Losing market share rapidly as price pressure intensifies. Likely to fail within 2 years.

STRATEGIC IMPLICATIONS:

The competitive landscape rewards balanced approaches. Pure cost-cutting through automation creates short-term gains but long-term vulnerabilities (talent, reputation, quality). Companies maintaining cultural health while modernizing outperform on 5-year returns.

Bank debt accelerates transformation but amplifies both success and failure. Companies that failed with high debt often cited 'rushing to meet covenant requirements' as a key mistake.`,
    keyFindings: [
      "AutoTech: aggressive automation led to union, strikes, reputation damage",
      "PrecisionParts: balanced approach winning contracts and talent",
      "FastParts: failed automation, now laying off 25% - acquisition target",
      "Debt amplifies both success and failure trajectories",
      "5-year returns favor balanced cultural + technical approach"
    ],
    dataPoints: [
      { label: "AutoTech Workforce Change", value: "-30%", trend: "down" },
      { label: "PrecisionParts Productivity", value: "+28%", trend: "up" },
      { label: "FastParts Status", value: "Failing", trend: "down" }
    ],
    publishedDate: "January 2026",
    readingTime: 6
  },
  {
    id: "report-6",
    title: "Case Study: TechnoForge Transformation",
    sourceCode: "TFG",
    category: "case_study",
    summary: "Detailed examination of a successful AI transformation in the auto parts industry.",
    content: `TechnoForge, a 1,200-person automotive supplier, began their AI transformation in 2022. Their journey offers valuable lessons about balancing automation, debt, and workforce development.

PHASE 1 (Months 1-6): Started with $5M debt financing for Operations automation. Critical decision: allocated 25% of budget ($1.25M) to reskilling upfront. CEO held weekly town halls. Union organizing was defused by announcing job guarantee for any worker completing reskilling.

PHASE 2 (Months 7-12): Expanded automation while simultaneously creating technical career tracks. 40% of Gen Z workers who refused management roles became 'Automation Specialists' - highly paid individual contributors.

PHASE 3 (Months 13-18): Customer Service automation with guaranteed redeployment. 85% of affected employees moved to new roles. Remaining 15% received enhanced severance (4 weeks per year) and outplacement.

PHASE 4 (Months 19-24): Addressed management pipeline through AI-augmented supervision. Managers using AI tools handled 40% larger teams with same satisfaction scores. Pilot of self-managing teams in R&D showed promise.

RESULTS: 35% productivity increase, 22% revenue growth, employee morale up 8 points from baseline. Debt fully repaid by month 30. Named 'Best Place to Work' in their region.

KEY INSIGHT: The CEO later said, 'Our competitors saw automation as a way to cut workers. We saw it as a way to upgrade workers. That mindset made all the difference.'`,
    keyFindings: [
      "25% of automation budget allocated to reskilling upfront",
      "Job guarantee defused union organizing threat",
      "Technical career tracks solved Gen Z management resistance",
      "AI-augmented management allowed 40% larger team spans",
      "Final results: +35% productivity, +22% revenue, +8 morale points"
    ],
    dataPoints: [
      { label: "Productivity Gain", value: "+35%", trend: "up" },
      { label: "Revenue Growth", value: "+22%", trend: "up" },
      { label: "Morale Change", value: "+8 pts", trend: "up" },
      { label: "Internal Redeployment", value: "85%", trend: "up" }
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
}

export const storage = new MemStorage();
