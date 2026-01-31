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
  category: z.enum(["ai", "trade", "workforce", "technology", "policy", "labor", "finance", "logistics", "regulatory"]),
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
  difficultyLevel: z.enum(["introductory", "standard", "advanced"]).default("advanced"),
  decisions: z.array(decisionSchema),
  decisionRecords: z.array(decisionRecordSchema).default([]),
  weeklyHistory: z.array(weeklyHistoryEntrySchema),
  setupComplete: z.boolean().default(false),
  researchComplete: z.boolean().default(false),
  viewedReportIds: z.array(z.string()).default([]),
  advisorCreditsRemaining: z.number().default(3),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type Team = z.infer<typeof teamSchema>;

export const insertTeamSchema = z.object({
  name: z.string().min(1, "Team name is required").max(50, "Team name too long"),
  members: z.array(z.string().min(1)).max(6, "Maximum 6 team members").default([]),
  totalWeeks: z.number().min(4).max(12).default(8),
  organizationId: z.string().optional(),
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
  sourceCode: z.string(), // 3-character reference code for citations (e.g., "AIM", "APX", "WFT")
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

// LLM Evaluation Rubric - criteria for scoring text responses
export const rubricCriterionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  maxPoints: z.number().default(25),
  evaluationGuidelines: z.string(), // Instructions for the LLM
});

export type RubricCriterion = z.infer<typeof rubricCriterionSchema>;

// Default rubric criteria for text evaluation
export const defaultRubricCriteria: RubricCriterion[] = [
  {
    id: "evidence",
    name: "Evidence Quality",
    description: "References course materials, research, data, or stakeholder perspectives to support arguments.",
    maxPoints: 25,
    evaluationGuidelines: "Award higher scores for specific citations, data points, or direct references to provided materials. Deduct points for unsupported claims or vague generalizations.",
  },
  {
    id: "coherence",
    name: "Reasoning Coherence",
    description: "Presents a logical, well-structured argument with clear connections between premises and conclusions.",
    maxPoints: 25,
    evaluationGuidelines: "Award higher scores for clear logical flow, well-organized paragraphs, and explicit reasoning chains. Deduct for contradictions, jumps in logic, or unclear connections.",
  },
  {
    id: "tradeoffs",
    name: "Trade-off Analysis",
    description: "Acknowledges risks, limitations, and alternative approaches. Shows awareness of what could go wrong.",
    maxPoints: 25,
    evaluationGuidelines: "Award higher scores for explicit discussion of downsides, contingency plans, and consideration of opposing viewpoints. Deduct for one-sided arguments or ignoring obvious risks.",
  },
  {
    id: "stakeholders",
    name: "Stakeholder Consideration",
    description: "Demonstrates empathy for multiple perspectives including employees, shareholders, unions, and management.",
    maxPoints: 25,
    evaluationGuidelines: "Award higher scores for addressing how decisions affect different groups, showing empathy, and balancing competing interests. Deduct for ignoring major stakeholder groups.",
  },
];

// Enhanced decision attribute - a single configurable dimension of a decision
export const decisionAttributeSchema = z.object({
  id: z.string(),
  type: z.enum(["slider", "budget", "select", "toggle", "text", "essay"]), // Added text and essay types
  label: z.string(),
  description: z.string(),
  // For slider/budget
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().optional(),
  defaultValue: z.number().optional(),
  // For select
  options: z.array(z.object({
    id: z.string(),
    label: z.string(),
    description: z.string().optional(),
  })).optional(),
  // For text/essay (LLM evaluated)
  minWords: z.number().optional(), // Minimum word count
  maxWords: z.number().optional(), // Maximum word count
  placeholder: z.string().optional(),
  rubricCriteria: z.array(rubricCriterionSchema).optional(), // Custom rubric for this field (uses default if not specified)
  llmWeight: z.number().optional(), // Weight of this field's LLM score in overall decision score (0-100)
  richText: z.boolean().optional(), // Whether to use rich text editor
  // Impact formula for structured types
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

// LLM evaluation result for a single criterion
export const rubricScoreSchema = z.object({
  criterionId: z.string(),
  criterionName: z.string(),
  score: z.number(), // Points awarded
  maxPoints: z.number(),
  feedback: z.string(), // LLM explanation for the score
});

export type RubricScore = z.infer<typeof rubricScoreSchema>;

// Complete LLM evaluation for a text response
export const llmEvaluationSchema = z.object({
  attributeId: z.string(),
  rubricScores: z.array(rubricScoreSchema),
  totalScore: z.number(), // Sum of all criterion scores
  maxPossibleScore: z.number(), // Sum of all maxPoints
  percentageScore: z.number(), // 0-100
  overallFeedback: z.string(), // Summary feedback from LLM
  strengths: z.array(z.string()), // Key strengths identified
  areasForImprovement: z.array(z.string()), // Suggestions
  evaluatedAt: z.string(),
});

export type LLMEvaluation = z.infer<typeof llmEvaluationSchema>;

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

// Player's submitted decision with attribute values and LLM evaluations
export const playerDecisionSubmissionSchema = z.object({
  id: z.string(),
  decisionId: z.string(), // Fixed typo from 'odecisionId'
  playerId: z.string(),
  teamId: z.string().optional(),
  weekNumber: z.number(),
  attributeValues: z.record(z.string(), z.union([z.number(), z.string(), z.boolean()])),
  rationale: z.string(), // Legacy field for backward compatibility
  timestamp: z.string(),
  computedImpact: z.object({
    morale: z.number().optional(),
    revenue: z.number().optional(),
    unionSentiment: z.number().optional(),
    automationLevel: z.number().optional(),
    managementBench: z.number().optional(),
    cost: z.number().optional(),
  }).optional(),
  // LLM evaluation results for text/essay attributes
  llmEvaluations: z.array(llmEvaluationSchema).optional(),
  // Overall LLM score (weighted average of all text evaluations)
  overallLLMScore: z.number().optional(), // 0-100
  // Whether evaluations are complete
  evaluationStatus: z.enum(["pending", "evaluating", "completed", "failed"]).optional(),
});

export type PlayerDecisionSubmission = z.infer<typeof playerDecisionSubmissionSchema>;

// Week results summary for a team - shown after week advances
export const weekResultsSchema = z.object({
  teamId: z.string(),
  weekNumber: z.number(),
  // Score changes
  previousFinancialScore: z.number(),
  newFinancialScore: z.number(),
  previousCulturalScore: z.number(),
  newCulturalScore: z.number(),
  previousCombinedScore: z.number(),
  newCombinedScore: z.number(),
  // Rank changes
  previousRank: z.number(),
  newRank: z.number(),
  totalTeams: z.number(),
  // Their submissions with evaluations
  submissions: z.array(playerDecisionSubmissionSchema),
  // Key events/outcomes from their decisions
  outcomes: z.array(z.object({
    title: z.string(),
    description: z.string(),
    impact: z.enum(["positive", "negative", "neutral"]),
  })),
  // Flag for whether user has viewed results
  viewed: z.boolean().default(false),
  // Timestamp when results became available
  availableAt: z.string(),
});

export type WeekResults = z.infer<typeof weekResultsSchema>;

// Top scoring answer (anonymized) for display
export const topAnswerSchema = z.object({
  weekNumber: z.number(),
  decisionId: z.string(),
  attributeId: z.string(),
  responseExcerpt: z.string(), // First 500 chars or so
  llmScore: z.number(),
  rubricScores: z.array(rubricScoreSchema),
  overallFeedback: z.string(),
  // Anonymized - no team/player info
});

export type TopAnswer = z.infer<typeof topAnswerSchema>;

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

// Platform-wide settings (stored in database, configurable by Super Admin)
export const platformSettingsSchema = z.object({
  id: z.string().default("default"),
  requireEduEmail: z.boolean().default(true),
  requireTeamCode: z.boolean().default(true),
  competitionMode: z.enum(["individual", "team"]).default("individual"),
  totalWeeks: z.number().min(4).max(12).default(8),
  scoringWeightFinancial: z.number().min(0).max(100).default(50),
  scoringWeightCultural: z.number().min(0).max(100).default(50),
  easterEggBonusEnabled: z.boolean().default(true),
  easterEggBonusPercentage: z.number().min(0).max(20).default(5),
  updatedAt: z.string(),
  updatedBy: z.string().optional(),
});

export type PlatformSettings = z.infer<typeof platformSettingsSchema>;

export const insertPlatformSettingsSchema = platformSettingsSchema.omit({ updatedAt: true });
export type InsertPlatformSettings = z.infer<typeof insertPlatformSettingsSchema>;

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

// Activity log for admin tracking
export const activityLogSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  eventType: z.enum([
    "simulation_start",
    "research_viewed",
    "research_complete",
    "decision_submitted",
    "enhanced_decision_submitted",
    "week_advanced",
    "team_created",
    "user_assigned",
    "user_login",
    "user_logout",
    "error",
    "admin_action",
    "feedback_submitted",
    "educator_inquiry_submitted",
    "demo_access_provisioned",
  ]),
  userId: z.string().optional(),
  userEmail: z.string().optional(),
  userName: z.string().optional(),
  teamId: z.string().optional(),
  teamName: z.string().optional(),
  weekNumber: z.number().optional(),
  details: z.record(z.any()).optional(),
  metadata: z.object({
    ipAddress: z.string().optional(),
    userAgent: z.string().optional(),
    sessionId: z.string().optional(),
  }).optional(),
});

export type ActivityLog = z.infer<typeof activityLogSchema>;

// User profile update schema
export const profileUpdateSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  jobTitle: z.string().optional(),
  company: z.string().optional(),
  institution: z.string().optional(),
  department: z.string().optional(),
  profileImageUrl: z.string().optional(),
  notifyPhone: z.string().optional(),
  smsEnabled: z.boolean().optional(),
});

export type ProfileUpdate = z.infer<typeof profileUpdateSchema>;

// Simulation Module schema - different simulation scenarios
export const simulationModuleSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  slug: z.string(),
  isDefault: z.boolean(),
  isActive: z.boolean(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type SimulationModuleType = z.infer<typeof simulationModuleSchema>;

export const insertSimulationModuleSchema = simulationModuleSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export type InsertSimulationModule = z.infer<typeof insertSimulationModuleSchema>;

// Content types enum - includes uploaded media (video/audio)
export const contentTypeEnum = z.enum(["text", "video", "audio", "google_doc", "link", "file", "media"]);
export type ContentTypeEnum = z.infer<typeof contentTypeEnum>;

// Timestamp entry for synced transcript display
export const transcriptTimestampSchema = z.object({
  time: z.number(), // Seconds into the media
  text: z.string(), // Transcript segment at that time
});
export type TranscriptTimestamp = z.infer<typeof transcriptTimestampSchema>;

// Simulation Content schema - per-week content items
export const simulationContentSchema = z.object({
  id: z.string(),
  moduleId: z.string(),
  weekNumber: z.number(),
  title: z.string(),
  contentType: contentTypeEnum,
  content: z.string().nullable(),
  embedUrl: z.string().nullable(),
  resourceUrl: z.string().nullable(),
  thumbnailUrl: z.string().nullable(),
  order: z.number(),
  isActive: z.boolean(),
  // Media-specific fields for uploaded video/audio content
  mediaUrl: z.string().nullable(), // Object storage path for uploaded media
  mediaDurationSeconds: z.number().nullable(), // Duration for progress tracking
  transcript: z.string().nullable(), // Full transcript for accessibility & LLM reference
  transcriptTimestamps: z.array(transcriptTimestampSchema).nullable(), // For synced display
  // Category for intel content
  category: z.string().nullable(),
  isIntelContent: z.boolean().default(false), // Whether this counts for Intel Bonus
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  createdBy: z.string().nullable(),
  updatedBy: z.string().nullable(),
});

export type SimulationContentType = z.infer<typeof simulationContentSchema>;

export const insertSimulationContentSchema = simulationContentSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export type InsertSimulationContent = z.infer<typeof insertSimulationContentSchema>;

// Media engagement tracking - detailed progress for video/audio content
export const mediaEngagementSchema = z.object({
  id: z.string(),
  userId: z.string(),
  teamId: z.string().nullable(),
  contentId: z.string(), // simulation_content ID
  weekNumber: z.number().nullable(),
  // Engagement milestones
  started: z.boolean().default(false), // User clicked play
  percentWatched: z.number().default(0), // 0-100
  completed: z.boolean().default(false), // 75%+ watched = completed
  // Detailed progress data
  lastPositionSeconds: z.number().default(0), // Resume position
  totalWatchTimeSeconds: z.number().default(0), // Accumulated watch time
  completedAt: z.string().nullable(), // When they reached 75%+
  // Timestamps
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
export type MediaEngagement = z.infer<typeof mediaEngagementSchema>;

export const insertMediaEngagementSchema = mediaEngagementSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export type InsertMediaEngagement = z.infer<typeof insertMediaEngagementSchema>;

// Content view tracking schema
export const contentViewSchema = z.object({
  id: z.string(),
  userId: z.string(),
  teamId: z.string().nullable(),
  contentType: z.enum(['research_report', 'briefing_section', 'simulation_content']),
  contentId: z.string(),
  weekNumber: z.number().nullable(),
  viewedAt: z.string(),
  timeSpentSeconds: z.number().nullable(),
});
export type ContentView = z.infer<typeof contentViewSchema>;

export const insertContentViewSchema = contentViewSchema.omit({ id: true, viewedAt: true });
export type InsertContentView = z.infer<typeof insertContentViewSchema>;

export const contentViewProgressSchema = z.object({
  briefing: z.object({
    viewed: z.number(),
    total: z.number(),
    percentage: z.number(),
  }),
  research: z.object({
    viewed: z.number(),
    total: z.number(),
    percentage: z.number(),
  }),
  overall: z.object({
    viewed: z.number(),
    total: z.number(),
    percentage: z.number(),
  }),
});
export type ContentViewProgress = z.infer<typeof contentViewProgressSchema>;

// Character Profile schema - AI-generated personas for immersive simulation
export const characterProfileSchema = z.object({
  id: z.string(),
  moduleId: z.string().nullable(), // null = global character, otherwise module-specific
  name: z.string(),
  role: z.string(), // e.g., "CEO", "Union Leader", "HR Director"
  title: z.string().nullable(), // e.g., "Chief Executive Officer"
  company: z.string().nullable(), // e.g., "Apex Manufacturing"
  // AI-generated headshot stored in object storage
  headshotUrl: z.string().nullable(),
  headshotPrompt: z.string().nullable(), // Prompt used to generate the headshot
  // Rich bio and personality
  bio: z.string().nullable(), // Full backstory
  personality: z.string().nullable(), // Personality traits description
  communicationStyle: z.string().nullable(), // How they speak/write
  motivations: z.string().nullable(), // What drives them
  fears: z.string().nullable(), // What concerns them
  // Relationships with other characters
  relationships: z.array(z.object({
    characterId: z.string(),
    relationshipType: z.string(), // e.g., "reports to", "rival", "ally"
    description: z.string().nullable(),
  })).nullable(),
  // Voice/audio settings for triggered voicemails
  voiceDescription: z.string().nullable(), // Description for AI voice synthesis
  voiceId: z.string().nullable(), // External voice ID if using voice synthesis
  // Content generation prompts
  speakingStyleExamples: z.array(z.string()).nullable(), // Example quotes for AI reference
  // Quantifiable traits for simulation mechanics (1-10 scale)
  influence: z.number().min(1).max(10).default(5), // How much sway they have over decisions
  hostility: z.number().min(1).max(10).default(5), // How antagonistic they are
  flexibility: z.number().min(1).max(10).default(5), // How open they are to change
  riskTolerance: z.number().min(1).max(10).default(5), // How comfortable with uncertainty
  // Categories this character impacts (used for decision difficulty modifiers)
  impactCategories: z.array(z.enum([
    "labor", "finance", "technology", "culture", "operations", 
    "strategy", "legal", "marketing", "executive", "external"
  ])).nullable(), // Which decision categories this character affects
  // Metadata
  isActive: z.boolean().default(true),
  sortOrder: z.number().default(0),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  createdBy: z.string().nullable(),
});
export type CharacterProfile = z.infer<typeof characterProfileSchema>;

export const insertCharacterProfileSchema = characterProfileSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertCharacterProfile = z.infer<typeof insertCharacterProfileSchema>;

// Triggered Voicemail schema - immersive notifications from characters
export const triggeredVoicemailSchema = z.object({
  id: z.string(),
  moduleId: z.string(),
  characterId: z.string(), // Which character sends this voicemail
  weekNumber: z.number().nullable(), // null = any week
  title: z.string(),
  // Trigger conditions
  triggerType: z.enum([
    "time_window", // Appears during specific time
    "decision_made", // After submitting a decision
    "content_viewed", // After viewing specific content
    "week_started", // When a new week begins
    "score_threshold", // When score hits threshold
    "random", // Random chance each session
  ]),
  triggerCondition: z.object({
    // For time_window
    startHour: z.number().optional(),
    endHour: z.number().optional(),
    daysOfWeek: z.array(z.number()).optional(), // 0-6 for Sun-Sat
    // For decision_made
    decisionId: z.string().optional(),
    // For content_viewed
    contentId: z.string().optional(),
    // For score_threshold
    scoreType: z.enum(["financial", "cultural", "overall"]).optional(),
    threshold: z.number().optional(),
    comparison: z.enum(["above", "below"]).optional(),
    // For random
    probability: z.number().optional(), // 0-1
  }).nullable(),
  // Content
  audioUrl: z.string().nullable(), // Pre-recorded or AI-generated audio
  transcript: z.string(), // Text transcript for accessibility
  duration: z.number().nullable(), // Duration in seconds
  // Display settings
  urgency: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  expiresAfterMinutes: z.number().nullable(), // How long before voicemail dismisses
  // Metadata
  isActive: z.boolean().default(true),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
export type TriggeredVoicemail = z.infer<typeof triggeredVoicemailSchema>;

export const insertTriggeredVoicemailSchema = triggeredVoicemailSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertTriggeredVoicemail = z.infer<typeof insertTriggeredVoicemailSchema>;

// Phone-a-Friend Advisor schema - specialized advisors students can consult
export const phoneAFriendAdvisorSchema = z.object({
  id: z.string(),
  characterId: z.string(), // Links to character profile
  moduleId: z.string().nullable(), // null = available in all modules
  specialty: z.enum([
    "finance", // CFO type - financial strategy
    "hr", // CHRO type - workforce/culture
    "operations", // COO type - efficiency/automation
    "legal", // General Counsel - compliance/risk
    "union", // Labor relations expert
    "technology", // CTO type - tech strategy
    "marketing", // CMO type - market/brand
    "strategy", // Strategy consultant
    "ethics", // Ethics/sustainability advisor
  ]),
  // AI prompt context for generating advice
  expertiseDescription: z.string(), // What they know about
  adviceStyle: z.string().nullable(), // How they give advice
  biases: z.string().nullable(), // Their professional biases
  // Display settings
  isActive: z.boolean().default(true),
  sortOrder: z.number().default(0),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
export type PhoneAFriendAdvisor = z.infer<typeof phoneAFriendAdvisorSchema>;

export const insertPhoneAFriendAdvisorSchema = phoneAFriendAdvisorSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertPhoneAFriendAdvisor = z.infer<typeof insertPhoneAFriendAdvisorSchema>;

// Phone-a-Friend Usage tracking - 3 lifelines per student per simulation
export const phoneAFriendUsageSchema = z.object({
  id: z.string(),
  userId: z.string(),
  teamId: z.string().nullable(),
  simulationId: z.string(), // Which simulation run
  advisorId: z.string(), // Which advisor was consulted
  weekNumber: z.number(),
  // The question asked and advice received
  question: z.string(),
  context: z.string().nullable(), // Current situation context
  advice: z.string(), // AI-generated response
  // Metadata
  createdAt: z.string().optional(),
});
export type PhoneAFriendUsage = z.infer<typeof phoneAFriendUsageSchema>;

export const insertPhoneAFriendUsageSchema = phoneAFriendUsageSchema.omit({
  id: true,
  createdAt: true,
});
export type InsertPhoneAFriendUsage = z.infer<typeof insertPhoneAFriendUsageSchema>;

// Voicemail delivery tracking - which voicemails have been shown to users
export const voicemailDeliverySchema = z.object({
  id: z.string(),
  userId: z.string(),
  voicemailId: z.string(),
  // Status
  deliveredAt: z.string(),
  viewedAt: z.string().nullable(),
  dismissedAt: z.string().nullable(),
  listenedFully: z.boolean().default(false),
});
export type VoicemailDelivery = z.infer<typeof voicemailDeliverySchema>;

export const insertVoicemailDeliverySchema = voicemailDeliverySchema.omit({
  id: true,
});
export type InsertVoicemailDelivery = z.infer<typeof insertVoicemailDeliverySchema>;

// Difficulty Levels enum
export const DIFFICULTY_LEVELS = {
  INTRODUCTORY: "introductory",
  STANDARD: "standard",
  ADVANCED: "advanced",
} as const;

export type DifficultyLevel = typeof DIFFICULTY_LEVELS[keyof typeof DIFFICULTY_LEVELS];

// Difficulty Presets - configurable difficulty factor combinations
export const difficultyPresetSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  isSystemPreset: z.boolean().default(false),
  // Difficulty factors
  simulationWeeks: z.number().int().min(4).max(8).default(8),
  requiredResearchReports: z.number().int().min(3).max(6).default(6),
  decisionsPerWeek: z.number().int().min(2).max(4).default(3),
  activeStakeholderCount: z.number().int().min(8).max(20).default(17),
  rubricCriteriaCount: z.number().int().min(2).max(4).default(4),
  phoneAFriendUses: z.number().int().min(3).max(5).default(3),
  eventProbability: z.number().int().min(15).max(30).default(30),
  // Scoring thresholds
  optimalScoreThreshold: z.number().int().min(65).max(80).default(80),
  goodScoreThreshold: z.number().int().min(50).max(60).default(60),
  failureScoreThreshold: z.number().int().min(35).max(40).default(40),
  // Crisis triggers
  unionTriggerThreshold: z.number().int().min(75).max(85).default(75),
  moraleCrisisThreshold: z.number().int().min(20).max(30).default(30),
  managerVacancyCrisis: z.number().int().min(15).max(20).default(15),
  // LLM grading
  gradingStrictness: z.enum(["encouraging", "balanced", "rigorous"]).default("rigorous"),
  targetScoreMin: z.number().int().min(50).max(70).default(50),
  targetScoreMax: z.number().int().min(70).max(85).default(70),
  // Intel bonus
  intelBonusPerArticle: z.number().int().min(10).max(15).default(15),
  maxIntelBonus: z.number().int().min(30).max(50).default(50),
  // Metadata
  createdBy: z.string().nullable(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
export type DifficultyPreset = z.infer<typeof difficultyPresetSchema>;

export const insertDifficultyPresetSchema = difficultyPresetSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertDifficultyPreset = z.infer<typeof insertDifficultyPresetSchema>;

// Export auth models from Replit Auth integration
export * from "./models/auth";

// Export chat models for AI integrations
export * from "./models/chat";
