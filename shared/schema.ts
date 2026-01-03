import { z } from "zod";

// Enhanced company state schema with automation and workforce metrics
export const companyStateSchema = z.object({
  revenue: z.number(),
  employees: z.number(),
  morale: z.number().min(0).max(100),
  
  // Financial metrics
  cash: z.number(),
  debt: z.number(),
  debtInterestRate: z.number(),
  
  // Automation metrics
  automationLevel: z.number().min(0).max(100),
  automationROI: z.number(),
  roboticsInvestment: z.number(),
  
  // Workforce metrics
  unionSentiment: z.number().min(0).max(100),
  unionized: z.boolean(),
  workforceAdaptability: z.number().min(0).max(100),
  reskillingProgress: z.number().min(0).max(100),
  
  // Leadership metrics
  managementBenchStrength: z.number().min(0).max(100),
  genZWorkforcePercentage: z.number().min(0).max(100),
  managerVacancies: z.number(),
  
  // Legacy fields
  aiBudget: z.number(),
  reskillingFund: z.number(),
  lobbyingBudget: z.number(),
});

export type CompanyState = z.infer<typeof companyStateSchema>;

// Default company state for new games
export const defaultCompanyState: CompanyState = {
  revenue: 125000000,
  employees: 2400,
  morale: 68,
  cash: 15000000,
  debt: 0,
  debtInterestRate: 0.065,
  automationLevel: 12,
  automationROI: 0,
  roboticsInvestment: 0,
  unionSentiment: 35,
  unionized: false,
  workforceAdaptability: 55,
  reskillingProgress: 20,
  managementBenchStrength: 45,
  genZWorkforcePercentage: 28,
  managerVacancies: 8,
  aiBudget: 2000000,
  reskillingFund: 500000,
  lobbyingBudget: 100000,
};

// Department schema
export const departmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  aiOption: z.string(),
  jobImpact: z.number(),
  revenueBoost: z.number(),
  risk: z.number(),
  deployed: z.boolean().default(false),
});

export type Department = z.infer<typeof departmentSchema>;

// Global event schema
export const globalEventSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  impact: z.object({
    revenue: z.number().optional(),
    morale: z.number().optional(),
    employees: z.number().optional(),
  }),
});

export type GlobalEvent = z.infer<typeof globalEventSchema>;

// Briefing article schema
export const briefingArticleSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  source: z.string(),
  insights: z.array(z.string()),
  category: z.enum(["ai", "trade", "workforce", "technology", "policy", "labor", "finance"]),
});

export type BriefingArticle = z.infer<typeof briefingArticleSchema>;

// Weekly scenario - the main narrative for each week
export const weeklyScenarioSchema = z.object({
  weekNumber: z.number(),
  title: z.string(),
  narrative: z.string(),
  pressures: z.array(z.object({
    source: z.string(),
    message: z.string(),
    urgency: z.enum(["low", "medium", "high", "critical"]),
  })),
  contextArticles: z.array(briefingArticleSchema),
  keyQuestion: z.string(),
});

export type WeeklyScenario = z.infer<typeof weeklyScenarioSchema>;

// Decision option with detailed impacts
export const decisionOptionSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string(),
  financialImpact: z.object({
    revenue: z.number().optional(),
    cost: z.number().optional(),
    debt: z.number().optional(),
    cashFlow: z.number().optional(),
  }),
  workforceImpact: z.object({
    employees: z.number().optional(),
    morale: z.number().optional(),
    unionSentiment: z.number().optional(),
    adaptability: z.number().optional(),
  }),
  leadershipImpact: z.object({
    managementBench: z.number().optional(),
    managerVacancies: z.number().optional(),
  }).optional(),
  automationImpact: z.object({
    level: z.number().optional(),
    roi: z.number().optional(),
  }).optional(),
  risks: z.array(z.string()),
  timeframe: z.string(),
});

export type DecisionOption = z.infer<typeof decisionOptionSchema>;

// Weekly decision challenge
export const weeklyDecisionSchema = z.object({
  id: z.string(),
  weekNumber: z.number(),
  category: z.enum([
    "automation_financing",
    "workforce_displacement",
    "union_relations",
    "reskilling",
    "management_pipeline",
    "organizational_change",
    "strategic_investment",
  ]),
  title: z.string(),
  context: z.string(),
  stakeholderPerspectives: z.array(z.object({
    role: z.string(),
    stance: z.string(),
    quote: z.string(),
  })),
  options: z.array(decisionOptionSchema),
  deadline: z.string().optional(),
});

export type WeeklyDecision = z.infer<typeof weeklyDecisionSchema>;

// Decision record (what the team chose)
export const decisionRecordSchema = z.object({
  id: z.string(),
  weekNumber: z.number(),
  decisionId: z.string(),
  optionId: z.string(),
  timestamp: z.string(),
  rationale: z.string().optional(),
});

export type DecisionRecord = z.infer<typeof decisionRecordSchema>;

// Legacy decision schema for compatibility
export const decisionSchema = z.object({
  id: z.string(),
  weekNumber: z.number(),
  type: z.enum(["ai_deployment", "lobbying", "reskilling", "event_response", "automation", "union", "management"]),
  departmentId: z.string().optional(),
  lobbyingSpend: z.number().optional(),
  reskillingSpend: z.number().optional(),
  eventMitigation: z.boolean().optional(),
  timestamp: z.string(),
});

export type Decision = z.infer<typeof decisionSchema>;

export const insertDecisionSchema = decisionSchema.omit({ id: true, timestamp: true });
export type InsertDecision = z.infer<typeof insertDecisionSchema>;

// Weekly history with enhanced metrics
export const weeklyHistoryEntrySchema = z.object({
  week: z.number(),
  revenue: z.number(),
  employees: z.number(),
  morale: z.number(),
  financialScore: z.number(),
  culturalScore: z.number(),
  debt: z.number(),
  automationLevel: z.number(),
  unionSentiment: z.number(),
  managementBench: z.number(),
  decisionsThisWeek: z.array(z.string()),
});

export type WeeklyHistoryEntry = z.infer<typeof weeklyHistoryEntrySchema>;

// Team schema
export const teamSchema = z.object({
  id: z.string(),
  name: z.string(),
  members: z.array(z.string()),
  companyState: companyStateSchema,
  currentWeek: z.number(),
  totalWeeks: z.number(),
  decisions: z.array(decisionSchema),
  decisionRecords: z.array(decisionRecordSchema).default([]),
  weeklyHistory: z.array(weeklyHistoryEntrySchema),
  setupComplete: z.boolean().default(false),
  researchComplete: z.boolean().default(false),
  viewedReportIds: z.array(z.string()).default([]),
  createdAt: z.string().optional(),
});

export type Team = z.infer<typeof teamSchema>;

export const insertTeamSchema = z.object({
  name: z.string().min(1, "Team name is required").max(50, "Team name too long"),
  members: z.array(z.string().min(1)).min(1, "At least one member is required").max(6, "Maximum 6 team members"),
  totalWeeks: z.number().min(4).max(12).default(8),
});

export type InsertTeam = z.infer<typeof insertTeamSchema>;

// Weekly briefing schema
export const weeklyBriefingSchema = z.object({
  weekNumber: z.number(),
  date: z.string(),
  articles: z.array(briefingArticleSchema),
  event: globalEventSchema.optional(),
  scenario: weeklyScenarioSchema.optional(),
  decisions: z.array(weeklyDecisionSchema).optional(),
});

export type WeeklyBriefing = z.infer<typeof weeklyBriefingSchema>;

// Historical company data for pre-game research
export const historicalDataSchema = z.object({
  year: z.number(),
  quarter: z.string(),
  revenue: z.number(),
  employees: z.number(),
  aiInvestment: z.number(),
  marketShare: z.number(),
  customerSatisfaction: z.number(),
  employeeSatisfaction: z.number(),
  rndSpending: z.number(),
  operatingMargin: z.number(),
});

export type HistoricalData = z.infer<typeof historicalDataSchema>;

// Research report for pre-game analysis
export const researchReportSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: z.enum(["industry", "company", "workforce", "technology", "competition", "case_study"]),
  summary: z.string(),
  content: z.string(),
  keyFindings: z.array(z.string()),
  dataPoints: z.array(z.object({
    label: z.string(),
    value: z.string(),
    trend: z.enum(["up", "down", "stable"]).optional(),
  })).optional(),
  publishedDate: z.string(),
  readingTime: z.number(),
});

export type ResearchReport = z.infer<typeof researchReportSchema>;

// Workforce demographics for pre-game research
export const workforceDemographicsSchema = z.object({
  departments: z.array(z.object({
    name: z.string(),
    headcount: z.number(),
    avgTenure: z.number(),
    avgAge: z.number(),
    aiExposureRisk: z.number(),
    reskillingPotential: z.number(),
  })),
  skillDistribution: z.array(z.object({
    skill: z.string(),
    percentage: z.number(),
    demandTrend: z.enum(["growing", "stable", "declining"]),
  })),
  tenureDistribution: z.array(z.object({
    range: z.string(),
    count: z.number(),
  })),
});

export type WorkforceDemographics = z.infer<typeof workforceDemographicsSchema>;

// Leaderboard entry
export const leaderboardEntrySchema = z.object({
  teamId: z.string(),
  teamName: z.string(),
  rank: z.number(),
  previousRank: z.number().optional(),
  financialScore: z.number(),
  culturalScore: z.number(),
  combinedScore: z.number(),
  currentWeek: z.number(),
});

export type LeaderboardEntry = z.infer<typeof leaderboardEntrySchema>;

// People analytics data
export const peopleAnalyticsSchema = z.object({
  sentimentByDepartment: z.array(z.object({
    department: z.string(),
    sentiment: z.number(),
    trend: z.enum(["up", "down", "stable"]),
  })),
  keyIssues: z.array(z.object({
    id: z.string(),
    issue: z.string(),
    priority: z.enum(["high", "medium", "low"]),
    affectedEmployees: z.number(),
    category: z.string(),
  })),
  behaviorTrends: z.array(z.object({
    week: z.number(),
    productivity: z.number(),
    engagement: z.number(),
    turnoverRisk: z.number(),
  })),
  employeeSegments: z.array(z.object({
    segment: z.string(),
    count: z.number(),
    avgMorale: z.number(),
  })),
});

export type PeopleAnalytics = z.infer<typeof peopleAnalyticsSchema>;

// Game session schema
export const gameSessionSchema = z.object({
  id: z.string(),
  startDate: z.string(),
  teams: z.array(teamSchema),
  currentGlobalWeek: z.number(),
  isActive: z.boolean(),
});

export type GameSession = z.infer<typeof gameSessionSchema>;

// Enhanced decision attribute - a single configurable dimension of a decision
export const decisionAttributeSchema = z.object({
  id: z.string(),
  type: z.enum(["slider", "budget", "select", "toggle"]),
  label: z.string(),
  description: z.string(),
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().optional(),
  defaultValue: z.number().optional(),
  options: z.array(z.object({
    id: z.string(),
    label: z.string(),
    description: z.string().optional(),
  })).optional(),
  impactFormula: z.object({
    morale: z.number().optional(),
    revenue: z.number().optional(),
    unionSentiment: z.number().optional(),
    automationLevel: z.number().optional(),
    managementBench: z.number().optional(),
    adaptability: z.number().optional(),
    cost: z.number().optional(),
  }).optional(),
});

export type DecisionAttribute = z.infer<typeof decisionAttributeSchema>;

// Enhanced decision template with multiple attributes
export const enhancedDecisionSchema = z.object({
  id: z.string(),
  weekNumber: z.number(),
  category: z.enum([
    "automation_financing",
    "workforce_displacement",
    "union_relations",
    "reskilling",
    "management_pipeline",
    "organizational_change",
    "strategic_investment",
  ]),
  title: z.string(),
  context: z.string(),
  stakeholderPerspectives: z.array(z.object({
    role: z.string(),
    stance: z.string(),
    quote: z.string(),
  })),
  attributes: z.array(decisionAttributeSchema),
  baseImpact: z.object({
    financialImpact: z.object({
      revenue: z.number().optional(),
      cost: z.number().optional(),
      debt: z.number().optional(),
    }).optional(),
    workforceImpact: z.object({
      morale: z.number().optional(),
      unionSentiment: z.number().optional(),
      adaptability: z.number().optional(),
    }).optional(),
  }).optional(),
  requiredRationaleWords: z.number().default(100),
  deadline: z.string().optional(),
});

export type EnhancedDecision = z.infer<typeof enhancedDecisionSchema>;

// Player's submitted decision with attribute values
export const playerDecisionSubmissionSchema = z.object({
  id: z.string(),
  odecisionId: z.string(),
  playerId: z.string(),
  weekNumber: z.number(),
  attributeValues: z.record(z.string(), z.union([z.number(), z.string(), z.boolean()])),
  rationale: z.string(),
  timestamp: z.string(),
  computedImpact: z.object({
    morale: z.number().optional(),
    revenue: z.number().optional(),
    unionSentiment: z.number().optional(),
    automationLevel: z.number().optional(),
    managementBench: z.number().optional(),
    cost: z.number().optional(),
  }).optional(),
});

export type PlayerDecisionSubmission = z.infer<typeof playerDecisionSubmissionSchema>;

// Simulation configuration - admin settings
export const simulationConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  competitionMode: z.enum(["individual", "team", "hybrid"]),
  totalWeeks: z.number().min(4).max(12).default(8),
  teamSize: z.number().min(1).max(6).optional(),
  enableGroupDecisions: z.boolean().default(false),
  groupDecisionAggregation: z.enum(["average", "median", "consensus"]).optional(),
  scoringWeights: z.object({
    financial: z.number().default(50),
    cultural: z.number().default(50),
  }),
  easterEggBonusEnabled: z.boolean().default(true),
  easterEggBonusPercentage: z.number().default(5),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type SimulationConfig = z.infer<typeof simulationConfigSchema>;

// Easter egg keywords that should be detected in rationales
export const easterEggSchema = z.object({
  id: z.string(),
  keyword: z.string(),
  sourceReport: z.string(),
  pointValue: z.number().default(1),
  weekNumber: z.number().optional(),
});

export type EasterEgg = z.infer<typeof easterEggSchema>;

// Player performance tracking
export const playerPerformanceSchema = z.object({
  playerId: z.string(),
  playerEmail: z.string(),
  playerName: z.string(),
  teamId: z.string().optional(),
  weeklyScores: z.array(z.object({
    weekNumber: z.number(),
    financialScore: z.number(),
    culturalScore: z.number(),
    combinedScore: z.number(),
    decisionQuality: z.number(),
    easterEggsFound: z.array(z.string()),
    easterEggBonus: z.number(),
    submittedAt: z.string().optional(),
  })),
  totalFinancialScore: z.number(),
  totalCulturalScore: z.number(),
  totalCombinedScore: z.number(),
  totalEasterEggsFound: z.number(),
  researchCompletionRate: z.number(),
  avgDecisionQuality: z.number(),
  rank: z.number().optional(),
});

export type PlayerPerformance = z.infer<typeof playerPerformanceSchema>;

// Admin analytics summary
export const adminAnalyticsSchema = z.object({
  simulationId: z.string(),
  totalPlayers: z.number(),
  activePlayers: z.number(),
  currentWeek: z.number(),
  playerPerformances: z.array(playerPerformanceSchema),
  topPerformers: z.array(z.object({
    playerId: z.string(),
    playerName: z.string(),
    combinedScore: z.number(),
    rank: z.number(),
  })),
  averageScores: z.object({
    financial: z.number(),
    cultural: z.number(),
    combined: z.number(),
  }),
  easterEggDetectionRate: z.number(),
  completionRate: z.number(),
});

export type AdminAnalytics = z.infer<typeof adminAnalyticsSchema>;

// Export auth models from Replit Auth integration
export * from "./models/auth";
