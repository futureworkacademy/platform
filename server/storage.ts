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
} from "@shared/schema";

export interface IStorage {
  getTeam(id: string): Promise<Team | undefined>;
  getDefaultTeam(): Promise<Team | null>;
  createTeam(team: InsertTeam): Promise<Team>;
  updateTeam(id: string, updates: Partial<Team>): Promise<Team | undefined>;
  getDepartments(): Promise<Department[]>;
  updateDepartment(id: string, updates: Partial<Department>): Promise<Department | undefined>;
  getWeeklyBriefing(weekNumber: number): Promise<WeeklyBriefing>;
  getLeaderboard(): Promise<LeaderboardEntry[]>;
  getPeopleAnalytics(teamId: string): Promise<PeopleAnalytics>;
  addDecision(teamId: string, decision: InsertDecision): Promise<Decision>;
  advanceWeek(teamId: string): Promise<Team | undefined>;
  getResearchReports(): Promise<ResearchReport[]>;
  getHistoricalData(): Promise<HistoricalData[]>;
  getWorkforceDemographics(): Promise<WorkforceDemographics>;
  completeResearch(teamId: string): Promise<Team | undefined>;
  hasActiveTeam(): Promise<boolean>;
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
    title: "Workforce Trends 2026",
    content: "Companies with strong transition programs see 15% higher retention during technology shifts. Employee engagement and transparent communication are critical success factors.",
    source: "Forbes",
    category: "workforce",
    insights: ["Transition programs boost retention", "Employee engagement key", "Transparent communication"],
  },
  {
    id: "4",
    title: "ML Breakthroughs for Supply Chains",
    content: "New predictive models cut inventory costs by 25%. Early adopters in Operations departments report significant efficiency gains, though data quality issues remain a concern.",
    source: "TechCrunch",
    category: "technology",
    insights: ["ML cuts costs", "Operations first mover advantage", "Data quality critical"],
  },
  {
    id: "5",
    title: "Policy Watch: Manufacturing Incentives",
    content: "New federal incentives may provide tax breaks for companies investing in domestic AI development. Lobbying efforts could influence the scope and timeline of implementation.",
    source: "Policy Insider",
    category: "policy",
    insights: ["Tax incentives possible", "Lobbying may help", "Domestic investment focus"],
  },
  {
    id: "6",
    title: "Employee Sentiment During AI Adoption",
    content: "Survey reveals 67% of manufacturing workers express anxiety about AI replacing their jobs. Companies implementing comprehensive reskilling programs report 30% lower anxiety levels.",
    source: "HR Weekly",
    category: "workforce",
    insights: ["Worker anxiety high", "Reskilling reduces fear", "Communication matters"],
  },
  {
    id: "7",
    title: "R&D Innovation Accelerating",
    content: "Machine learning is revolutionizing product development cycles. Companies leveraging ML for innovation see 2x faster time-to-market, though initial investment requirements are substantial.",
    source: "Innovation Journal",
    category: "technology",
    insights: ["Faster innovation cycles", "High upfront costs", "Competitive advantage"],
  },
  {
    id: "8",
    title: "Customer Service Automation Trends",
    content: "AI chatbots now handle 40% of customer inquiries in manufacturing. Customer satisfaction scores remain stable when bots are properly implemented with human escalation paths.",
    source: "CX Magazine",
    category: "ai",
    insights: ["Automation expanding", "Customer satisfaction stable", "Human escalation important"],
  },
];

const defaultDepartments: Department[] = [
  { id: "ops", name: "Operations", aiOption: "Automate inventory with ML", jobImpact: -50, revenueBoost: 200000, risk: 20, deployed: false },
  { id: "sales", name: "Sales", aiOption: "Predictive analytics for leads", jobImpact: -20, revenueBoost: 150000, risk: 15, deployed: false },
  { id: "cs", name: "Customer Service", aiOption: "AI chatbots for support", jobImpact: -30, revenueBoost: 100000, risk: 25, deployed: false },
  { id: "rd", name: "R&D", aiOption: "ML for product innovation", jobImpact: 20, revenueBoost: 300000, risk: 30, deployed: false },
];

const defaultCompanyState: CompanyState = {
  revenue: 1000000,
  employees: 500,
  morale: 80,
  aiBudget: 200000,
  reskillingFund: 100000,
  lobbyingBudget: 50000,
};

const researchReports: ResearchReport[] = [
  {
    id: "report-1",
    title: "State of AI in Manufacturing 2025",
    category: "industry",
    summary: "Comprehensive analysis of AI adoption trends across the manufacturing sector.",
    content: `The manufacturing industry is at a critical inflection point. Our research indicates that 67% of Fortune 500 manufacturers have initiated AI transformation programs, yet only 23% report successful enterprise-wide deployment.

Key barriers to adoption include workforce resistance (cited by 78% of respondents), legacy system integration challenges (65%), and unclear ROI metrics (54%). Companies that successfully navigate these challenges report average productivity gains of 35-45%.

The most successful transformations share common characteristics: early and transparent employee communication, phased rollouts beginning with low-risk departments, and substantial investment in reskilling programs. Companies allocating at least 15% of their AI budget to workforce transition see 40% higher adoption rates.`,
    keyFindings: [
      "67% of Fortune 500 manufacturers have AI programs, but only 23% achieve enterprise-wide success",
      "Workforce resistance is the #1 barrier to AI adoption (78% of respondents)",
      "Companies investing 15%+ in reskilling see 40% higher adoption rates",
      "Phased departmental rollouts outperform 'big bang' implementations by 3x"
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
    category: "company",
    summary: "Internal analysis of Apex Manufacturing's current position, capabilities, and strategic challenges.",
    content: `Apex Manufacturing Inc. is a mid-sized automotive parts supplier with 500 employees across operations, sales, customer service, and R&D. Founded in 1985, the company has built a reputation for quality but faces increasing pressure from competitors embracing automation.

Current financial position: $1M annual revenue with healthy 18% operating margins. However, growth has stagnated at 3% annually over the past 5 years while competitors average 8%.

The company has a loyal workforce with average tenure of 7.2 years, which is both an asset and challenge. Employee surveys indicate high pride in craftsmanship but growing anxiety about technological change. 42% of employees report concern about AI-related job displacement.

Board pressure for AI adoption is mounting, but failed technology initiatives in 2019 and 2021 have created organizational skepticism. Any transformation must address both the technical and cultural dimensions.`,
    keyFindings: [
      "500 employees with 7.2 year average tenure - stability but change resistance",
      "Revenue growth stagnated at 3% vs. 8% industry average",
      "42% of employees concerned about AI job displacement",
      "Previous tech initiatives (2019, 2021) failed, creating skepticism"
    ],
    dataPoints: [
      { label: "Annual Revenue", value: "$1M", trend: "stable" },
      { label: "Employee Count", value: "500", trend: "stable" },
      { label: "Avg Tenure", value: "7.2 yrs", trend: "stable" },
      { label: "Growth Rate", value: "3%", trend: "down" }
    ],
    publishedDate: "January 2026",
    readingTime: 6
  },
  {
    id: "report-3",
    title: "Workforce Transition Best Practices",
    category: "workforce",
    summary: "Evidence-based strategies for managing workforce transitions during technological change.",
    content: `Research across 200+ manufacturing transformations reveals clear patterns distinguishing successful transitions from failures.

COMMUNICATION: Companies that communicate early and often about AI plans see 35% less workforce anxiety. The key is honesty about both opportunities and challenges. Employees who feel informed are 2.8x more likely to support change.

RESKILLING: Investment in employee development is the strongest predictor of morale during transitions. For every $10,000 invested per affected employee, turnover intention decreases by 12%.

PHASED APPROACH: Departments with lower AI displacement risk should be targeted first. This builds organizational confidence and creates internal champions for subsequent phases.

LEADERSHIP INVOLVEMENT: Visible executive engagement correlates with 45% higher employee trust scores. Town halls, skip-level meetings, and transparent Q&A sessions are essential.`,
    keyFindings: [
      "Early communication reduces workforce anxiety by 35%",
      "Informed employees are 2.8x more likely to support change",
      "$10,000 reskilling investment = 12% decrease in turnover intention",
      "Visible executive engagement increases trust by 45%"
    ],
    dataPoints: [
      { label: "Anxiety Reduction", value: "35%", trend: "up" },
      { label: "Support Increase", value: "2.8x", trend: "up" },
      { label: "Trust Improvement", value: "45%", trend: "up" }
    ],
    publishedDate: "November 2025",
    readingTime: 7
  },
  {
    id: "report-4",
    title: "AI Technology Landscape for Manufacturing",
    category: "technology",
    summary: "Technical assessment of AI/ML solutions applicable to manufacturing operations.",
    content: `The manufacturing AI landscape has matured significantly. Key application areas include:

OPERATIONS: ML-powered inventory optimization and predictive maintenance offer the highest proven ROI (typically 20-30% cost reduction). Implementation risk is moderate, with most failures attributed to data quality issues rather than technology.

SALES: Predictive analytics for lead scoring and demand forecasting show strong results. Early adopters report 25% improvement in conversion rates. Lower displacement risk as AI augments rather than replaces sales personnel.

CUSTOMER SERVICE: Chatbots and automated support have reached maturity. Expected to handle 60% of routine inquiries by 2027. Higher displacement risk but also higher customer satisfaction when implemented with proper human escalation.

R&D: ML for product innovation is highest risk but highest reward. Companies leveraging generative AI for design see 2x faster prototyping, but the technology requires sophisticated internal capabilities.`,
    keyFindings: [
      "Operations ML offers 20-30% cost reduction with moderate risk",
      "Sales AI augments rather than replaces - lower displacement",
      "Customer service chatbots: 60% inquiry handling by 2027",
      "R&D AI is highest risk/reward - 2x faster prototyping possible"
    ],
    dataPoints: [
      { label: "Ops Cost Reduction", value: "20-30%", trend: "up" },
      { label: "Sales Conversion", value: "+25%", trend: "up" },
      { label: "CS Automation", value: "60%", trend: "up" }
    ],
    publishedDate: "December 2025",
    readingTime: 9
  },
  {
    id: "report-5",
    title: "Competitive Analysis: Auto Parts Sector",
    category: "competition",
    summary: "Strategic assessment of key competitors and their AI transformation initiatives.",
    content: `TIER 1 COMPETITORS:
AutoTech Industries has invested heavily in automation, reducing workforce by 30% while increasing output 45%. However, recent union disputes and negative press have damaged brand reputation. Customer satisfaction dropped 15 points.

PrecisionParts Co. took a balanced approach, combining AI deployment with aggressive reskilling. They've maintained workforce size while improving productivity 28%. Employee morale remains high, and they've attracted talent from competitors.

TIER 2 COMPETITORS:
Several smaller competitors have avoided AI investment entirely, betting on "craftsmanship" positioning. Early data suggests this strategy is failing as price pressure intensifies.

STRATEGIC IMPLICATIONS:
The competitive landscape rewards balanced approaches. Pure cost-cutting through automation creates short-term gains but long-term vulnerabilities. Companies maintaining cultural health while modernizing are outperforming on 5-year returns.`,
    keyFindings: [
      "AutoTech: -30% workforce, +45% output, but -15 pts customer satisfaction",
      "PrecisionParts: balanced approach, +28% productivity, maintained morale",
      "Pure automation creates short-term gains but long-term vulnerabilities",
      "Balanced cultural + technical approaches outperform on 5-year returns"
    ],
    dataPoints: [
      { label: "AutoTech Workforce", value: "-30%", trend: "down" },
      { label: "PrecisionParts Prod.", value: "+28%", trend: "up" },
      { label: "Market Leaders", value: "Balanced", trend: "stable" }
    ],
    publishedDate: "January 2026",
    readingTime: 6
  },
  {
    id: "report-6",
    title: "Case Study: TechnoForge Transformation",
    category: "case_study",
    summary: "Detailed examination of a successful AI transformation in the auto parts industry.",
    content: `TechnoForge, a 400-person automotive supplier, began their AI transformation in 2022. Their journey offers valuable lessons.

PHASE 1 (Months 1-6): Started with Operations department - lowest displacement risk. Invested heavily in communication. CEO held weekly town halls. Allocated $500K to reskilling fund upfront.

PHASE 2 (Months 7-12): Expanded to Sales after Operations success created internal champions. Employees who successfully transitioned became peer mentors. Morale actually increased despite uncertainty.

PHASE 3 (Months 13-18): Customer Service automation with guaranteed redeployment for displaced workers. 80% of affected employees moved to new roles within the company.

PHASE 4 (Months 19-24): R&D enhancement. By this point, organizational confidence was high. The program was completed ahead of schedule.

RESULTS: 35% productivity increase, 22% revenue growth, employee morale up 8 points from baseline. Named "Best Place to Work" in their region.`,
    keyFindings: [
      "Phased approach over 24 months with Operations first",
      "$500K upfront reskilling investment created trust",
      "80% of displaced employees redeployed internally",
      "Final results: +35% productivity, +22% revenue, +8 morale points"
    ],
    dataPoints: [
      { label: "Productivity", value: "+35%", trend: "up" },
      { label: "Revenue Growth", value: "+22%", trend: "up" },
      { label: "Morale Change", value: "+8 pts", trend: "up" },
      { label: "Redeployment", value: "80%", trend: "up" }
    ],
    publishedDate: "October 2025",
    readingTime: 10
  }
];

const historicalData: HistoricalData[] = [
  { year: 2021, quarter: "Q1 2021", revenue: 850000, employees: 520, aiInvestment: 0, marketShare: 8.2, customerSatisfaction: 78, employeeSatisfaction: 82, rndSpending: 45000, operatingMargin: 16 },
  { year: 2021, quarter: "Q2 2021", revenue: 875000, employees: 515, aiInvestment: 0, marketShare: 8.1, customerSatisfaction: 79, employeeSatisfaction: 81, rndSpending: 48000, operatingMargin: 17 },
  { year: 2021, quarter: "Q3 2021", revenue: 890000, employees: 510, aiInvestment: 5000, marketShare: 8.0, customerSatisfaction: 77, employeeSatisfaction: 80, rndSpending: 50000, operatingMargin: 16 },
  { year: 2021, quarter: "Q4 2021", revenue: 920000, employees: 508, aiInvestment: 8000, marketShare: 7.9, customerSatisfaction: 78, employeeSatisfaction: 79, rndSpending: 52000, operatingMargin: 17 },
  { year: 2022, quarter: "Q1 2022", revenue: 910000, employees: 505, aiInvestment: 10000, marketShare: 7.8, customerSatisfaction: 76, employeeSatisfaction: 78, rndSpending: 55000, operatingMargin: 16 },
  { year: 2022, quarter: "Q2 2022", revenue: 925000, employees: 502, aiInvestment: 15000, marketShare: 7.7, customerSatisfaction: 77, employeeSatisfaction: 77, rndSpending: 58000, operatingMargin: 17 },
  { year: 2022, quarter: "Q3 2022", revenue: 940000, employees: 500, aiInvestment: 18000, marketShare: 7.6, customerSatisfaction: 75, employeeSatisfaction: 76, rndSpending: 60000, operatingMargin: 17 },
  { year: 2022, quarter: "Q4 2022", revenue: 955000, employees: 498, aiInvestment: 22000, marketShare: 7.5, customerSatisfaction: 76, employeeSatisfaction: 75, rndSpending: 62000, operatingMargin: 18 },
  { year: 2023, quarter: "Q1 2023", revenue: 950000, employees: 495, aiInvestment: 25000, marketShare: 7.4, customerSatisfaction: 74, employeeSatisfaction: 74, rndSpending: 65000, operatingMargin: 17 },
  { year: 2023, quarter: "Q2 2023", revenue: 960000, employees: 492, aiInvestment: 30000, marketShare: 7.3, customerSatisfaction: 75, employeeSatisfaction: 73, rndSpending: 68000, operatingMargin: 17 },
  { year: 2023, quarter: "Q3 2023", revenue: 975000, employees: 495, aiInvestment: 35000, marketShare: 7.2, customerSatisfaction: 73, employeeSatisfaction: 74, rndSpending: 70000, operatingMargin: 18 },
  { year: 2023, quarter: "Q4 2023", revenue: 985000, employees: 498, aiInvestment: 40000, marketShare: 7.1, customerSatisfaction: 74, employeeSatisfaction: 76, rndSpending: 72000, operatingMargin: 18 },
  { year: 2024, quarter: "Q1 2024", revenue: 970000, employees: 500, aiInvestment: 45000, marketShare: 7.0, customerSatisfaction: 72, employeeSatisfaction: 77, rndSpending: 75000, operatingMargin: 17 },
  { year: 2024, quarter: "Q2 2024", revenue: 985000, employees: 502, aiInvestment: 50000, marketShare: 6.9, customerSatisfaction: 73, employeeSatisfaction: 78, rndSpending: 78000, operatingMargin: 18 },
  { year: 2024, quarter: "Q3 2024", revenue: 995000, employees: 500, aiInvestment: 55000, marketShare: 6.8, customerSatisfaction: 74, employeeSatisfaction: 79, rndSpending: 80000, operatingMargin: 18 },
  { year: 2024, quarter: "Q4 2024", revenue: 1000000, employees: 500, aiInvestment: 60000, marketShare: 6.8, customerSatisfaction: 75, employeeSatisfaction: 80, rndSpending: 82000, operatingMargin: 18 },
  { year: 2025, quarter: "Q1 2025", revenue: 990000, employees: 500, aiInvestment: 65000, marketShare: 6.7, customerSatisfaction: 73, employeeSatisfaction: 79, rndSpending: 85000, operatingMargin: 17 },
  { year: 2025, quarter: "Q2 2025", revenue: 1005000, employees: 502, aiInvestment: 70000, marketShare: 6.7, customerSatisfaction: 74, employeeSatisfaction: 80, rndSpending: 88000, operatingMargin: 18 },
  { year: 2025, quarter: "Q3 2025", revenue: 1010000, employees: 500, aiInvestment: 75000, marketShare: 6.6, customerSatisfaction: 75, employeeSatisfaction: 80, rndSpending: 90000, operatingMargin: 18 },
  { year: 2025, quarter: "Q4 2025", revenue: 1000000, employees: 500, aiInvestment: 80000, marketShare: 6.6, customerSatisfaction: 76, employeeSatisfaction: 80, rndSpending: 92000, operatingMargin: 18 },
];

const workforceDemographics: WorkforceDemographics = {
  departments: [
    { name: "Operations", headcount: 200, avgTenure: 8.5, avgAge: 42, aiExposureRisk: 75, reskillingPotential: 65 },
    { name: "Sales", headcount: 80, avgTenure: 5.2, avgAge: 35, aiExposureRisk: 40, reskillingPotential: 85 },
    { name: "Customer Service", headcount: 60, avgTenure: 4.8, avgAge: 32, aiExposureRisk: 70, reskillingPotential: 75 },
    { name: "R&D", headcount: 100, avgTenure: 6.5, avgAge: 38, aiExposureRisk: 25, reskillingPotential: 90 },
    { name: "Administration", headcount: 40, avgTenure: 9.2, avgAge: 45, aiExposureRisk: 55, reskillingPotential: 60 },
    { name: "Quality Assurance", headcount: 20, avgTenure: 7.8, avgAge: 40, aiExposureRisk: 45, reskillingPotential: 70 },
  ],
  skillDistribution: [
    { skill: "Manufacturing Operations", percentage: 35, demandTrend: "stable" },
    { skill: "Technical Engineering", percentage: 20, demandTrend: "growing" },
    { skill: "Customer Relations", percentage: 15, demandTrend: "stable" },
    { skill: "Data Analytics", percentage: 8, demandTrend: "growing" },
    { skill: "Project Management", percentage: 12, demandTrend: "growing" },
    { skill: "Administrative", percentage: 10, demandTrend: "declining" },
  ],
  tenureDistribution: [
    { range: "0-2 years", count: 85 },
    { range: "2-5 years", count: 120 },
    { range: "5-10 years", count: 150 },
    { range: "10-15 years", count: 95 },
    { range: "15+ years", count: 50 },
  ],
};

export class MemStorage implements IStorage {
  private teams: Map<string, Team>;
  private departments: Map<string, Department>;
  private defaultTeamId: string | null;

  constructor() {
    this.teams = new Map();
    this.departments = new Map();
    this.defaultTeamId = null;

    defaultDepartments.forEach((dept) => {
      this.departments.set(dept.id, { ...dept });
    });
  }

  async getTeam(id: string): Promise<Team | undefined> {
    return this.teams.get(id);
  }

  async getDefaultTeam(): Promise<Team | null> {
    if (!this.defaultTeamId) return null;
    return this.teams.get(this.defaultTeamId) || null;
  }

  async hasActiveTeam(): Promise<boolean> {
    return this.defaultTeamId !== null && this.teams.has(this.defaultTeamId);
  }

  async createTeam(insertTeam: InsertTeam): Promise<Team> {
    const id = randomUUID();
    const team: Team = {
      id,
      name: insertTeam.name,
      members: insertTeam.members,
      companyState: { ...defaultCompanyState },
      currentWeek: 0,
      totalWeeks: insertTeam.totalWeeks ?? 8,
      decisions: [],
      weeklyHistory: [],
      setupComplete: true,
      researchComplete: false,
      viewedReportIds: [],
      createdAt: new Date().toISOString(),
    };
    this.teams.set(id, team);
    this.defaultTeamId = id;
    return team;
  }

  async markReportViewed(teamId: string, reportId: string): Promise<Team | undefined> {
    const team = this.teams.get(teamId);
    if (!team) return undefined;
    if (!team.viewedReportIds.includes(reportId)) {
      const updatedTeam = { ...team, viewedReportIds: [...team.viewedReportIds, reportId] };
      this.teams.set(teamId, updatedTeam);
      return updatedTeam;
    }
    return team;
  }

  async getResearchProgress(teamId: string): Promise<{ viewed: number; total: number; percentage: number }> {
    const team = this.teams.get(teamId);
    const total = researchReports.length;
    const viewed = team?.viewedReportIds?.length || 0;
    return { viewed, total, percentage: total > 0 ? (viewed / total) * 100 : 0 };
  }

  async completeResearch(teamId: string): Promise<{ success: boolean; team?: Team; error?: string }> {
    const team = this.teams.get(teamId);
    if (!team) return { success: false, error: "Team not found" };
    
    const progress = await this.getResearchProgress(teamId);
    if (progress.percentage < 50) {
      return { success: false, error: `Must review at least 50% of research materials. Current: ${Math.round(progress.percentage)}%` };
    }
    
    const updatedTeam = { ...team, researchComplete: true, currentWeek: 1 };
    this.teams.set(teamId, updatedTeam);
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
    const team = this.teams.get(id);
    if (!team) return undefined;
    const updatedTeam = { ...team, ...updates };
    this.teams.set(id, updatedTeam);
    return updatedTeam;
  }

  async getDepartments(): Promise<Department[]> {
    return Array.from(this.departments.values());
  }

  async updateDepartment(id: string, updates: Partial<Department>): Promise<Department | undefined> {
    const dept = this.departments.get(id);
    if (!dept) return undefined;
    const updatedDept = { ...dept, ...updates };
    this.departments.set(id, updatedDept);
    return updatedDept;
  }

  async getWeeklyBriefing(weekNumber: number): Promise<WeeklyBriefing> {
    const numArticles = 2 + Math.floor(Math.random() * 3);
    const shuffled = [...briefingArticles].sort(() => Math.random() - 0.5);
    const selectedArticles = shuffled.slice(0, numArticles);

    const hasEvent = Math.random() < 0.3;
    const event = hasEvent ? globalEvents[Math.floor(Math.random() * globalEvents.length)] : undefined;

    const startDate = new Date("2026-01-03");
    startDate.setDate(startDate.getDate() + (weekNumber - 1) * 7);

    return {
      weekNumber,
      date: startDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
      articles: selectedArticles,
      event,
    };
  }

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    const competitorTeams = [
      { name: "Strategic Innovators", baseFinancial: 1.1, baseCultural: 0.85 },
      { name: "Digital Pioneers", baseFinancial: 0.95, baseCultural: 0.78 },
      { name: "Future Forward", baseFinancial: 1.05, baseCultural: 0.72 },
      { name: "Tech Transformers", baseFinancial: 0.88, baseCultural: 0.82 },
      { name: "AI Vanguard", baseFinancial: 1.02, baseCultural: 0.68 },
    ];

    const entries: LeaderboardEntry[] = [];
    
    const defaultTeam = this.defaultTeamId ? this.teams.get(this.defaultTeamId) : null;
    
    if (defaultTeam) {
      const financialScore = (defaultTeam.companyState.revenue / 1000000) * (defaultTeam.companyState.employees / 500);
      const culturalScore = defaultTeam.companyState.morale / 100;
      
      entries.push({
        teamId: defaultTeam.id,
        teamName: defaultTeam.name,
        rank: 0,
        previousRank: 1,
        financialScore,
        culturalScore,
        combinedScore: financialScore * culturalScore,
        currentWeek: defaultTeam.currentWeek,
      });
    }

    competitorTeams.forEach((competitor, index) => {
      const weekVariation = 1 + (Math.random() - 0.5) * 0.2;
      const financial = competitor.baseFinancial * weekVariation;
      const cultural = competitor.baseCultural * weekVariation;
      
      entries.push({
        teamId: `competitor-${index}`,
        teamName: competitor.name,
        rank: 0,
        previousRank: index + 2,
        financialScore: financial,
        culturalScore: cultural,
        combinedScore: financial * cultural,
        currentWeek: defaultTeam?.currentWeek || 1,
      });
    });

    entries.sort((a, b) => b.combinedScore - a.combinedScore);
    entries.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return entries;
  }

  async getPeopleAnalytics(teamId: string): Promise<PeopleAnalytics> {
    const team = this.teams.get(teamId) || (this.defaultTeamId ? this.teams.get(this.defaultTeamId) : null);
    if (!team) {
      return {
        sentimentByDepartment: [],
        keyIssues: [],
        behaviorTrends: [],
        employeeSegments: [],
      };
    }
    const baseMorale = team.companyState.morale;

    const sentimentByDepartment = [
      { department: "Operations", sentiment: Math.min(100, baseMorale + Math.floor(Math.random() * 10) - 5), trend: Math.random() > 0.5 ? "up" as const : "stable" as const },
      { department: "Sales", sentiment: Math.min(100, baseMorale + Math.floor(Math.random() * 15) - 7), trend: Math.random() > 0.6 ? "up" as const : Math.random() > 0.3 ? "stable" as const : "down" as const },
      { department: "Customer Service", sentiment: Math.min(100, baseMorale + Math.floor(Math.random() * 10) - 8), trend: Math.random() > 0.5 ? "stable" as const : "down" as const },
      { department: "R&D", sentiment: Math.min(100, baseMorale + Math.floor(Math.random() * 20) - 5), trend: "up" as const },
      { department: "HR", sentiment: Math.min(100, baseMorale + Math.floor(Math.random() * 8) - 3), trend: "stable" as const },
    ];

    const possibleIssues = [
      { issue: "AI job displacement concerns", priority: "high" as const, affectedEmployees: 120, category: "Technology Anxiety" },
      { issue: "Workload distribution imbalance", priority: "medium" as const, affectedEmployees: 45, category: "Work-Life Balance" },
      { issue: "Training program gaps", priority: "medium" as const, affectedEmployees: 80, category: "Professional Development" },
      { issue: "Communication transparency", priority: "low" as const, affectedEmployees: 200, category: "Leadership" },
      { issue: "Remote work policy clarity", priority: "low" as const, affectedEmployees: 150, category: "Workplace Policy" },
    ];

    const keyIssues = baseMorale < 70 
      ? possibleIssues.slice(0, 3).map((issue, i) => ({ ...issue, id: `issue-${i}` }))
      : possibleIssues.slice(2, 4).map((issue, i) => ({ ...issue, id: `issue-${i}` }));

    const behaviorTrends = [];
    for (let w = 1; w <= team.currentWeek; w++) {
      const weekData = team.weeklyHistory.find((h) => h.week === w);
      behaviorTrends.push({
        week: w,
        productivity: weekData ? 60 + (weekData.morale / 100) * 30 : 70 + Math.floor(Math.random() * 20),
        engagement: weekData ? 50 + (weekData.morale / 100) * 40 : 65 + Math.floor(Math.random() * 25),
        turnoverRisk: weekData ? Math.max(5, 40 - (weekData.morale / 100) * 30) : 15 + Math.floor(Math.random() * 20),
      });
    }

    const employeeSegments = [
      { segment: "Highly Engaged", count: Math.floor(team.companyState.employees * 0.25), avgMorale: Math.min(100, baseMorale + 15) },
      { segment: "Moderately Engaged", count: Math.floor(team.companyState.employees * 0.35), avgMorale: baseMorale },
      { segment: "At-Risk", count: Math.floor(team.companyState.employees * 0.25), avgMorale: Math.max(20, baseMorale - 20) },
      { segment: "Disengaged", count: Math.floor(team.companyState.employees * 0.15), avgMorale: Math.max(10, baseMorale - 35) },
    ];

    return {
      sentimentByDepartment,
      keyIssues,
      behaviorTrends,
      employeeSegments,
    };
  }

  async addDecision(teamId: string, insertDecision: InsertDecision): Promise<Decision> {
    const team = this.teams.get(teamId) || this.teams.get(this.defaultTeamId)!;
    const decision: Decision = {
      ...insertDecision,
      id: randomUUID(),
      timestamp: new Date().toISOString(),
    };

    let { companyState } = team;

    if (insertDecision.type === "ai_deployment" && insertDecision.departmentId) {
      const dept = this.departments.get(insertDecision.departmentId);
      if (dept && !dept.deployed) {
        const cost = 50000 + Math.floor(Math.random() * 50000);
        if (companyState.aiBudget >= cost) {
          companyState = {
            ...companyState,
            aiBudget: companyState.aiBudget - cost,
            revenue: companyState.revenue + dept.revenueBoost,
            employees: companyState.employees + dept.jobImpact,
          };

          let moraleChange = dept.jobImpact >= 0 ? 10 : -15;
          if (Math.random() * 100 < dept.risk) {
            companyState.revenue -= 50000;
            moraleChange -= 10;
          }
          companyState.morale = Math.max(0, Math.min(100, companyState.morale + moraleChange));

          this.departments.set(dept.id, { ...dept, deployed: true });
        }
      }
    }

    if (insertDecision.type === "lobbying" && insertDecision.lobbyingSpend) {
      if (companyState.lobbyingBudget >= insertDecision.lobbyingSpend) {
        companyState = {
          ...companyState,
          lobbyingBudget: companyState.lobbyingBudget - insertDecision.lobbyingSpend,
        };
        if (Math.random() < 0.6) {
          const boost = Math.random() < 0.5 ? 0.05 : 0.10;
          if (Math.random() < 0.5) {
            companyState.revenue *= (1 + boost);
          } else {
            companyState.morale = Math.min(100, companyState.morale + Math.floor(boost * 100));
          }
        }
      }
    }

    if (insertDecision.type === "reskilling" && insertDecision.reskillingSpend) {
      if (companyState.reskillingFund >= insertDecision.reskillingSpend) {
        companyState = {
          ...companyState,
          reskillingFund: companyState.reskillingFund - insertDecision.reskillingSpend,
        };
        const moraleBoost = Math.floor(insertDecision.reskillingSpend / 10000) * 2;
        companyState.morale = Math.min(100, companyState.morale + moraleBoost);
      }
    }

    const updatedTeam = {
      ...team,
      companyState,
      decisions: [...team.decisions, decision],
    };
    this.teams.set(team.id, updatedTeam);

    return decision;
  }

  async advanceWeek(teamId: string): Promise<Team | undefined> {
    const team = this.teams.get(teamId) || this.teams.get(this.defaultTeamId)!;
    if (team.currentWeek >= team.totalWeeks) return team;

    const financialScore = (team.companyState.revenue / 1000000) * (team.companyState.employees / 500);
    const culturalScore = team.companyState.morale / 100;

    const weeklySnapshot = {
      week: team.currentWeek,
      revenue: team.companyState.revenue,
      employees: team.companyState.employees,
      morale: team.companyState.morale,
      financialScore,
      culturalScore,
    };

    const updatedTeam = {
      ...team,
      currentWeek: team.currentWeek + 1,
      weeklyHistory: [...team.weeklyHistory, weeklySnapshot],
    };

    this.teams.set(team.id, updatedTeam);
    return updatedTeam;
  }
}

export const storage = new MemStorage();
