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
} from "@shared/schema";

export interface IStorage {
  getTeam(id: string): Promise<Team | undefined>;
  getDefaultTeam(): Promise<Team>;
  createTeam(team: InsertTeam): Promise<Team>;
  updateTeam(id: string, updates: Partial<Team>): Promise<Team | undefined>;
  getDepartments(): Promise<Department[]>;
  updateDepartment(id: string, updates: Partial<Department>): Promise<Department | undefined>;
  getWeeklyBriefing(weekNumber: number): Promise<WeeklyBriefing>;
  getLeaderboard(): Promise<LeaderboardEntry[]>;
  getPeopleAnalytics(teamId: string): Promise<PeopleAnalytics>;
  addDecision(teamId: string, decision: InsertDecision): Promise<Decision>;
  advanceWeek(teamId: string): Promise<Team | undefined>;
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

export class MemStorage implements IStorage {
  private teams: Map<string, Team>;
  private departments: Map<string, Department>;
  private defaultTeamId: string;

  constructor() {
    this.teams = new Map();
    this.departments = new Map();

    defaultDepartments.forEach((dept) => {
      this.departments.set(dept.id, { ...dept });
    });

    const defaultTeam: Team = {
      id: randomUUID(),
      name: "Team Alpha",
      members: ["Player 1"],
      companyState: { ...defaultCompanyState },
      currentWeek: 1,
      totalWeeks: 8,
      decisions: [],
      weeklyHistory: [],
    };
    this.teams.set(defaultTeam.id, defaultTeam);
    this.defaultTeamId = defaultTeam.id;
  }

  async getTeam(id: string): Promise<Team | undefined> {
    return this.teams.get(id);
  }

  async getDefaultTeam(): Promise<Team> {
    return this.teams.get(this.defaultTeamId)!;
  }

  async createTeam(insertTeam: InsertTeam): Promise<Team> {
    const id = randomUUID();
    const team: Team = {
      id,
      name: insertTeam.name,
      members: insertTeam.members,
      companyState: { ...defaultCompanyState },
      currentWeek: 1,
      totalWeeks: insertTeam.totalWeeks ?? 8,
      decisions: [],
      weeklyHistory: [],
    };
    this.teams.set(id, team);
    return team;
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
    
    const defaultTeam = this.teams.get(this.defaultTeamId)!;
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
        currentWeek: defaultTeam.currentWeek,
      });
    });

    entries.sort((a, b) => b.combinedScore - a.combinedScore);
    entries.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return entries;
  }

  async getPeopleAnalytics(teamId: string): Promise<PeopleAnalytics> {
    const team = this.teams.get(teamId) || this.teams.get(this.defaultTeamId)!;
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
