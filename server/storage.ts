import { randomUUID } from "crypto";

// Calculate reading time based on word count (200 words per minute average)
export function calculateReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const wordCount = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return Math.max(1, minutes); // Minimum 1 minute
}

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
  PlatformSettings,
  ContentView,
  InsertContentView,
  ContentViewProgress,
} from "@shared/schema";
import { defaultCompanyState } from "@shared/schema";
import { db } from "./db";
import { platformSettings } from "@shared/models/auth";
import { eq } from "drizzle-orm";

// Activity log storage
const activityLogs: ActivityLog[] = [];

export interface IStorage {
  getTeam(id: string): Promise<Team | undefined>;
  getTeamWithDifficulty(id: string, difficultyLevel: "introductory" | "standard" | "advanced"): Promise<Team | undefined>;
  getSimulationByOrganization(organizationId: string): Promise<any | null>;
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
  getPlayerDecisions(playerId: string): Promise<PlayerDecisionSubmission[]>;
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
  detectEasterEggsWithViewBonus(rationale: string, weekNumber: number, userId: string, teamId?: string): Promise<{
    foundIds: string[];
    viewedContentMatches: string[];
    viewBonusMultiplier: number;
  }>;
  evaluateRationaleWithLLM(rationale: string, decisionContext: string, weekNumber: number): Promise<{ score: number; evidenceUsed: string[]; reasoning: string; quality: string }>;
  
  // Content view tracking
  recordContentView(view: Omit<InsertContentView, 'timeSpentSeconds'> & { timeSpentSeconds?: number | null }): Promise<ContentView>;
  getContentViews(userId: string, teamId?: string, contentType?: string, weekNumber?: number): Promise<ContentView[]>;
  getContentViewProgress(userId: string, teamId?: string, weekNumber?: number): Promise<ContentViewProgress>;
  
  // Activity logging
  logActivity(log: Omit<ActivityLog, "id" | "timestamp">): Promise<ActivityLog>;
  getActivityLogs(filters?: { eventType?: string; userId?: string; teamId?: string; startDate?: string; endDate?: string }): Promise<ActivityLog[]>;
  exportActivityLogs(format: "csv" | "json"): Promise<string>;
  
  // Educator inquiries
  createEducatorInquiry(inquiry: { name: string; email: string; phone?: string | null; institution?: string | null; inquiryType: string; message: string; referralSource?: string | null }): Promise<{ id: string }>;
  
  // Platform settings (Super Admin)
  getPlatformSettings(): Promise<PlatformSettings>;
  updatePlatformSettings(updates: Partial<PlatformSettings>, updatedBy?: string): Promise<PlatformSettings>;
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
    content: `The US manufacturing sector faces a structural crisis with 415,000 unfilled positions and projections of 2.1 million unfilled jobs by 2030. Iowa is among the hardest-hit states, with manufacturing vacancy rates 40% above the national average in key precision sectors.

Despite average total compensation exceeding $102,000 annually—including benefits, overtime, and profit-sharing—manufacturers struggle to attract qualified workers. The compensation gap between manufacturing and tech sector roles has widened to 35% in favor of tech, even as manufacturing offers greater job stability and lower cost-of-living in manufacturing-heavy regions.

The demographic challenge is acute: 26% of the current skilled manufacturing workforce is approaching retirement within the next five years. These workers carry decades of institutional knowledge—specialized techniques, customer relationships, and quality standards that cannot be easily documented or transferred. A study by the Manufacturing Institute found that each retiring master technician represents an average of $2.3 million in accumulated expertise.

Younger workers show little interest in manufacturing careers, with only 14% of high school students considering manufacturing as a career option. Focus groups reveal persistent misconceptions: 67% of Gen Z believes manufacturing jobs are "dirty and dangerous," despite modern facilities featuring clean-room environments and advanced safety systems. The industry's image problem dates back decades and requires sustained investment in outreach and education to overcome.

Regional disparities compound the challenge. Rural manufacturing hubs like those in Iowa face particular difficulty attracting young talent who prefer urban amenities. Some manufacturers are experimenting with remote work for administrative roles and flexible scheduling for production workers, but the nature of precision manufacturing limits flexibility options.`,
    source: "Manufacturing Institute",
    category: "workforce",
    insights: ["415K unfilled manufacturing jobs", "2.1M shortfall projected by 2030", "Iowa heavily affected", "$102K avg compensation not enough", "67% of Gen Z has negative perception of manufacturing"],
  },
  {
    id: "2",
    title: "PRESS RELEASE: Administration Implements 25% Tariffs on Steel and Aluminum Imports",
    content: `WASHINGTON, D.C. — The Department of Commerce today announced the implementation of 25% tariffs on imported steel and aluminum, effective immediately. The action, taken under Section 232 of the Trade Expansion Act, aims to protect national security interests and revitalize domestic metal production.

"These tariffs will restore American manufacturing to its rightful place as the backbone of our economy," said Commerce Secretary in a prepared statement. "For too long, foreign competitors have flooded our markets with artificially cheap metals. That era is over."

INDUSTRY IMPACT ANALYSIS:

For precision manufacturers, the tariffs create a complex cost-benefit equation. Raw material costs are expected to increase 2-4% in the near term as domestic steel and aluminum producers adjust capacity to meet demand. However, the tariffs simultaneously boost demand for domestic suppliers as medical device, aerospace, and defense customers seek to avoid duties on imported finished components.

Companies with existing US-based production capacity are reporting increased RFQ (Request for Quote) activity. Industry analysts estimate reshoring inquiries have increased 180% since the tariff announcement. The challenge: domestic manufacturers lack the capacity and skilled workforce to immediately capture this demand.

The National Association of Manufacturers issued a statement acknowledging the dual impact: "While input costs will rise for some members, the reshoring opportunity represents a generational chance to rebuild American precision manufacturing. Companies that invest now in capacity and workforce will be positioned to capture market share for decades."

SUPPLY CHAIN CONSIDERATIONS:

The tariffs have accelerated conversations about supply chain resilience. Major OEMs are reportedly reviewing their supplier bases and prioritizing domestic sources for critical components. This shift particularly benefits precision manufacturers in sectors like medical devices, where FDA scrutiny of foreign suppliers has already increased.

However, transition timelines remain uncertain. Building domestic capacity for specialized precision manufacturing requires 18-36 months of investment in equipment, training, and quality systems. The immediate gap between surging demand and available capacity is creating pricing pressure and extended lead times across the industry.`,
    source: "Bloomberg / Department of Commerce",
    category: "trade",
    insights: ["25% steel/aluminum tariffs effective immediately", "Raw material costs up 2-4%", "Domestic suppliers see 180% increase in RFQs", "Medical/aerospace seeking US sources", "18-36 month capacity build timeline"],
  },
  {
    id: "3",
    title: "Gen Z Workers Shun Management Roles: Leadership Pipeline at Risk",
    content: `New research from Harvard Business School reveals a striking generational shift: 72% of Gen Z workers have no interest in becoming managers, compared to 52% of Millennials and 38% of Gen X at the same career stage. The implications for manufacturing leadership pipelines are profound.

Gen Z workers cite multiple factors driving their avoidance of management:

WORK-LIFE BALANCE CONCERNS: Management positions are perceived as "always on" roles that blur boundaries between work and personal life. "I watched my parents check emails at dinner every night," one survey respondent noted. "I don't want that life, no matter what it pays."

EMOTIONAL LABOR: Young workers increasingly recognize the psychological demands of managing people—navigating conflicts, delivering difficult feedback, and supporting struggling team members. Research shows managers experience 23% higher rates of burnout than individual contributors.

INADEQUATE COMPENSATION: Many organizations offer only 10-15% salary increases for first-line supervisor roles, while responsibilities multiply dramatically. Gen Z workers question whether the trade-off is worthwhile. "Why would I take on 10x the stress for 12% more money?" is a common sentiment.

IMPACT PREFERENCE: Gen Z workers often prefer roles where they can see direct impact of their work. Management is perceived as bureaucratic and removed from "real work."

IMPLICATIONS FOR MANUFACTURING:

The leadership pipeline crisis is particularly acute in manufacturing, where supervisor and manager roles require deep technical knowledge combined with people management skills. Traditional career paths—skilled worker to lead, lead to supervisor, supervisor to plant manager—are breaking down as talented workers refuse to climb the ladder.

Successful manufacturers are responding with structural innovations:

DUAL CAREER TRACKS: Creating technical specialist roles with compensation parity to management. A master moldmaker or senior quality engineer can now earn as much as a production supervisor without taking on supervisory duties.

DISTRIBUTED LEADERSHIP: Sharing management responsibilities across teams rather than concentrating them in individual managers. Self-directed work teams are showing promise in some facilities.

MANAGEMENT ROLE REDESIGN: Stripping administrative burden from management roles, providing robust support systems, and emphasizing the mentoring and teaching aspects that Gen Z workers find more appealing.

COMPENSATION RESTRUCTURING: Offering 25-30% premiums for management roles, along with enhanced benefits, to make the transition more attractive.

Industry experts warn that companies failing to adapt their leadership development approaches will face increasing difficulty maintaining operational continuity as Baby Boomer and Gen X managers retire.`,
    source: "Harvard Business Review",
    category: "workforce",
    insights: ["72% of Gen Z refuse management", "Leadership pipeline at risk", "Dual career tracks emerging", "Technical specialist roles gaining traction", "Management roles need 25-30% premiums to attract talent"],
  },
  {
    id: "4",
    title: "PRESS RELEASE: Reshoring Initiative Reports 40% Surge in Manufacturing Return Projects",
    content: `SAN DIEGO — The Reshoring Initiative today released its annual report showing a 40% year-over-year increase in manufacturing reshoring and foreign direct investment projects. Precision manufacturing leads the return, with medical device and aerospace components accounting for 45% of announced projects.

"We are witnessing a fundamental restructuring of global supply chains," said Harry Moser, founder of the Reshoring Initiative. "The combination of tariffs, pandemic lessons, and geopolitical risk has convinced American manufacturers that resilience beats lowest cost."

KEY FINDINGS FROM THE REPORT:

Medical device companies are shifting 30% of component sourcing from offshore to domestic suppliers. The shift is driven by FDA scrutiny of foreign facilities, IP protection concerns, and the need for closer collaboration on precision specifications.

Aerospace and defense sectors are accelerating domestic sourcing ahead of new Buy American requirements. The Department of Defense has signaled stricter domestic content requirements for critical components, creating urgency among prime contractors to develop domestic supply chains.

The challenge: US manufacturers lack capacity and skilled workers to meet surging demand. Current domestic precision manufacturing capacity could absorb only 60% of projected reshoring demand over the next three years. The gap represents both a bottleneck and an opportunity.

GEOGRAPHIC DISTRIBUTION:

The report identifies the Midwest as the primary beneficiary of reshoring activity, with Iowa, Michigan, Ohio, and Wisconsin receiving the largest share of new projects. Lower costs, manufacturing heritage, and workforce availability (despite shortages) make these states attractive.

"Companies that can scale quickly will capture significant market share that will persist for decades," the report concludes. "The window for building capacity is 18-36 months. After that, market positions will be established and difficult to displace."

INVESTOR PERSPECTIVE:

Private equity and strategic investors are increasingly targeting precision manufacturers with expansion capacity. Deal multiples for manufacturers with strong workforce pipelines and scalable operations have increased 20% over the past year.

"Smart money is flowing into precision manufacturing," noted a managing partner at a Midwest private equity firm. "The companies that invest in capacity and workforce now will generate exceptional returns as reshoring accelerates."`,
    source: "Supply Chain Dive / Reshoring Initiative",
    category: "trade",
    insights: ["30% medical components reshoring", "45% of reshoring projects in precision manufacturing", "Midwest primary beneficiary", "60% of demand can be absorbed by current capacity", "First movers gain decade-long market position"],
  },
  {
    id: "5",
    title: "Diesel Prices Surge 25%, Trucking Costs Squeeze Manufacturer Margins",
    content: `Diesel fuel prices have surged 25% year-over-year, reaching their highest levels since 2014 and dramatically impacting distribution costs for manufacturers across the Midwest. The increase is attributed to refinery capacity constraints, strong global demand, and uncertainty in crude oil markets.

IMPACT ON MANUFACTURERS:

Companies with extensive trucking networks face immediate margin pressure. Industry analysts estimate that every $0.10 increase in diesel prices translates to approximately 0.3% reduction in operating margins for typical manufacturers. With prices up over $1.00 per gallon, margin compression of 3% or more is hitting bottom lines.

Precision manufacturers shipping high-value, low-volume components face proportionally larger impacts. While component value remains high, shipping costs now represent a larger percentage of total cost-to-customer. Some manufacturers report logistics costs have increased from 4% to 6% of revenue.

REGIONAL DYNAMICS:

The Midwest manufacturing heartland faces particular challenges due to distance from major ports and customer concentrations on the coasts. A component shipped from Iowa to California customers now costs 28% more than it did 18 months ago.

MITIGATION STRATEGIES:

Logistics experts are recommending multiple approaches to manage the crisis:

SHIPMENT CONSOLIDATION: Combining orders to maximize trailer utilization. Companies moving from 70% to 95% trailer fill rates can offset significant cost increases.

ROUTE OPTIMIZATION: Advanced logistics software can reduce miles driven by 8-12% through better routing and scheduling. The ROI on these systems has improved dramatically as fuel costs rise.

REGIONAL DISTRIBUTION CENTERS: Establishing smaller warehouses closer to major customer concentrations reduces total miles driven. The capital investment can pay back in 18-24 months at current fuel prices.

MODE SHIFTING: Moving appropriate shipments from truck to rail where feasible. Rail fuel efficiency is 4x better than trucking, though transit times are longer.

CUSTOMER PARTNERSHIPS: Some manufacturers are negotiating fuel surcharge pass-throughs with customers, sharing the burden of volatility.

OUTLOOK:

Energy analysts project diesel prices will remain elevated through at least mid-2026, with significant volatility expected. Manufacturers are being advised to budget for continued pressure and accelerate investments in efficiency.

"The days of cheap freight are over for the foreseeable future," noted a logistics industry analyst. "Companies that treat logistics as a strategic function rather than a cost center will outperform."`,
    source: "Transport Topics",
    category: "logistics",
    insights: ["Diesel up 25% YoY, highest since 2014", "3%+ margin compression for manufacturers", "Distribution costs squeezing margins", "Route optimization can save 8-12%", "Regional DC strategy pays back in 18-24 months"],
  },
  {
    id: "6",
    title: "PRESS RELEASE: FDA Announces Enhanced Supplier Oversight for Medical Device Industry",
    content: `SILVER SPRING, MD — The U.S. Food and Drug Administration today announced a comprehensive expansion of its medical device supply chain oversight program, including increased scrutiny of component suppliers serving the $450 billion global medical device industry.

"Patient safety depends on the entire supply chain, not just the final device manufacturer," said FDA Commissioner in a prepared statement. "Our enhanced oversight will ensure that components meet the same rigorous standards as finished devices."

KEY ELEMENTS OF THE NEW OVERSIGHT PROGRAM:

INCREASED AUDIT FREQUENCY: Component suppliers to Class II and Class III medical devices will face annual inspections, up from the previous 2-3 year cycle. The FDA is adding 150 field investigators specifically for supply chain oversight.

EXPANDED DOCUMENTATION REQUIREMENTS: Suppliers must now maintain comprehensive material traceability, process validation records, and quality metrics in formats accessible to FDA inspectors. Digital record-keeping systems will be required by January 2027.

FOREIGN SUPPLIER SCRUTINY: The FDA will require OEMs to provide detailed quality assessments of foreign suppliers, including on-site audit reports. Several high-profile quality escapes traced to overseas suppliers have motivated the stricter stance.

NON-COMPLIANCE CONSEQUENCES: Suppliers failing to meet requirements face potential supply chain exclusion. OEMs may be required to qualify alternative domestic sources for critical components.

INDUSTRY RESPONSE:

The Advanced Medical Technology Association (AdvaMed) issued a statement supporting the enhanced oversight while noting implementation challenges. "Our members are committed to patient safety and welcome FDA partnership. We urge the agency to work with industry on reasonable implementation timelines."

COMPETITIVE IMPLICATIONS:

Companies with robust quality management systems gain significant competitive advantage under the new regime. Precision manufacturers already meeting aerospace or automotive quality standards (AS9100, IATF 16949) will find compliance easier.

Smaller suppliers face the greatest challenge. The investment required for enhanced quality systems—estimated at $200,000-$500,000 for documentation infrastructure alone—may drive consolidation in the supplier base.

"The FDA's action will accelerate the trend toward fewer, larger, more capable suppliers," noted an industry consultant. "Quality infrastructure is now a barrier to entry."

TIMELINE:

Enhanced inspection programs begin Q2 2026. Documentation requirements phase in over 18 months. OEMs are advised to begin supplier qualification reviews immediately.`,
    source: "MedTech Insight / FDA Press Office",
    category: "regulatory",
    insights: ["FDA audits increasing to annual frequency", "Documentation requirements rising significantly", "Non-compliance = potential supply chain exclusion", "Quality systems investment $200K-$500K", "Robust QMS becomes major competitive advantage"],
  },
  {
    id: "7",
    title: "UAW Announces Midwest Manufacturing Organizing Campaign: Union Activity Surges 40%",
    content: `DETROIT — United Auto Workers President Shawn Fain today announced a major organizing campaign targeting precision manufacturers across Iowa, Wisconsin, Michigan, and Ohio. The announcement comes as union organizing campaigns in manufacturing have increased 40% year-over-year nationally.

"Workers in precision manufacturing have built the products that power American industry," Fain said at a press conference. "They deserve the same voice and protections that UAW members have fought for and won. We're bringing the Stand Up Strike energy to every shop floor in the Midwest."

CAMPAIGN DETAILS:

The UAW is deploying 50 organizers to the Midwest region, focusing on precision manufacturing facilities with 100-2,500 employees. The union has identified over 200 facilities as potential targets, representing approximately 45,000 workers.

WORKER MOTIVATIONS:

Surveys of manufacturing workers reveal the primary drivers of union interest:

AUTOMATION FEARS (cited by 78%): Workers worry that AI and robotics investments will eliminate their jobs. Lack of transparency about automation plans heightens anxiety. "We read about robots in the news and hear nothing from management," one worker explained.

WAGE STAGNATION (cited by 65%): Despite inflation eroding purchasing power, many precision manufacturers have limited wage increases to 2-3% annually. Workers note that executive compensation has continued to grow.

JOB SECURITY CONCERNS (cited by 71%): The combination of automation investment and reshoring uncertainty leaves workers feeling expendable. Union representation is seen as protection against arbitrary layoffs.

BENEFITS EROSION (cited by 58%): Shifts from defined benefit pensions to 401(k) plans, increased healthcare cost-sharing, and reduced overtime opportunities have accumulated into significant total compensation reductions.

MANAGEMENT RESPONSE OPTIONS:

Labor relations experts outline two primary paths for employers facing organizing campaigns:

OPPOSITION APPROACH: Traditional union avoidance tactics including captive audience meetings, one-on-one supervisor conversations, and legal delays. This approach typically delays elections 12-18 months but often damages morale and can poison labor relations regardless of election outcome.

PARTNERSHIP APPROACH: Some manufacturers are taking a different path—engaging proactively with workers on their concerns, committing to transparency about automation plans, and investing in workforce development. Companies taking this approach report that union interest often diminishes when workers feel heard and valued.

"The fundamental question for employers is whether they want to fight an organizing campaign or address the underlying concerns that drive workers to unions," noted a labor relations consultant. "Fighting is expensive and distracting. Addressing concerns is harder but more sustainable."

REGIONAL IMPACT:

The organizing campaign is expected to influence labor relations across the Midwest manufacturing sector. Even facilities not directly targeted report workers asking questions about union representation. The "demonstration effect" of successful organizing at one facility can catalyze interest across an industry.

Employers are advised to review communication practices, assess worker sentiment, and consider proactive engagement strategies before organizing activity reaches their facilities.`,
    source: "Labor Relations Weekly / UAW Press Release",
    category: "labor",
    insights: ["UAW targeting Midwest with 50 organizers", "40% increase in organizing campaigns", "Automation fears cited by 78% of workers", "Opposition approach delays but damages morale", "Transparency and investment can reduce union interest"],
  },
  {
    id: "8",
    title: "PRESS RELEASE: Industrial AI Systems Reports Record Adoption of ML-Powered Quality Inspection",
    content: `SAN JOSE, CA — Industrial AI Systems, a leading provider of machine learning solutions for manufacturing, today announced record adoption of its AI-powered quality inspection platforms, with installations up 85% year-over-year across the precision manufacturing sector.

"We are at an inflection point in manufacturing quality assurance," said CEO Maria Chen. "Machine learning-based inspection is no longer experimental—it's becoming the industry standard for precision manufacturing."

PERFORMANCE METRICS:

Third-party validation studies confirm that ML-powered quality inspection systems achieve 99.7% defect detection rates in precision manufacturing environments, compared to 94% for experienced human inspectors working under optimal conditions. The gap widens under real-world conditions including fatigue, distraction, and variable lighting.

Early adopters report significant operational improvements:

- 30% reduction in quality escapes reaching customers
- 45% reduction in inspection time per unit
- 62% reduction in customer returns and warranty claims
- 85% reduction in variability between shifts

"The consistency is what impresses us most," noted the VP of Quality at a major medical device manufacturer. "Human inspectors have good days and bad days. The AI system performs at peak capability every minute of every shift."

WORKFORCE IMPLICATIONS:

The technology requires $2-5M investment and 6-month implementation for a typical precision manufacturing facility. However, the workforce impact is more nuanced than simple displacement.

Industry data shows that quality inspection roles are already difficult to fill, with the average QA inspector position taking 90 days to fill. AI systems address a labor shortage rather than displacing abundant workers.

More significantly, successful implementations report substantial reskilling opportunities for existing QA workers. The AI systems require human oversight, exception handling, and continuous improvement. Workers transition from repetitive visual inspection to higher-value roles including:

- AI system monitoring and calibration
- Root cause analysis of detected defects
- Process improvement engineering
- Customer quality liaison

"Our quality team is more engaged and valuable than ever," reported a plant manager at an early adopter facility. "They've moved from catching defects to preventing them."

IMPLEMENTATION CONSIDERATIONS:

Successful deployments share common characteristics:

- Early and transparent communication with workforce about technology plans
- Investment in training and reskilling concurrent with technology deployment
- Phased rollout beginning with high-volume, well-understood products
- Worker involvement in system setup and optimization

Failed implementations are typically characterized by:

- Secretive technology introduction
- No reskilling investment
- Attempting enterprise-wide deployment without pilots
- Treating displacement as someone else's problem

ROI ANALYSIS:

At current adoption rates and pricing, AI quality inspection systems typically achieve ROI within 14-18 months. Companies achieving faster payback (12 months or less) tend to be those with the most severe quality challenges and highest current inspection costs.

"The question is no longer whether to adopt AI inspection, but how quickly and how thoughtfully," the report concludes. "First movers gain quality advantages that persist as competitive differentiation."`,
    source: "Manufacturing Today / Industrial AI Systems Press Release",
    category: "ai",
    insights: ["ML achieves 99.7% defect detection vs 94% human", "30% fewer quality escapes", "AI addresses labor shortage in QA", "Reskilling paths available for displaced workers", "$2-5M investment, 14-18 month ROI"],
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
      { source: "Board Chair", message: "Tariffs are creating a once-in-a-decade opportunity. We need to scale capacity 40% in 18 months or lose it forever.", urgency: "critical" },
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
      { source: "Board Chair", message: "Present your 3-year strategic plan. We need to see how this quarter's actions become sustainable advantage.", urgency: "high" },
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
      {
        id: "strategic-justification",
        type: "essay",
        label: "Strategic Justification",
        description: "Explain your reasoning for the automation strategy you've configured. Reference research materials, stakeholder perspectives, and potential risks.",
        minWords: 150,
        maxWords: 500,
        placeholder: "Describe why you chose these specific settings. Consider: What research supports your approach? How do you balance speed vs. stability? How will you address workforce concerns?",
        richText: true,
        llmWeight: 40,
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
      {
        id: "talent-strategy-analysis",
        type: "essay",
        label: "Talent Strategy Analysis",
        description: "Analyze your talent development approach. How will you address the Gen Z leadership gap while retaining experienced workers?",
        minWords: 150,
        maxWords: 500,
        placeholder: "Explain how your configuration addresses: the 72% Gen Z management refusal rate, retiring experienced workers, and the need for new automation skills. What trade-offs are you making?",
        richText: true,
        llmWeight: 40,
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
      {
        id: "labor-relations-essay",
        type: "essay",
        label: "Labor Relations Strategy Essay",
        description: "Articulate your overall approach to the union organizing situation. What are the risks and trade-offs of your chosen strategy?",
        minWords: 200,
        maxWords: 600,
        placeholder: "Explain your labor relations philosophy. Consider: What are the legal boundaries? How do you balance cost concerns with employee welfare? What happens if the union vote succeeds? How does this align with your automation strategy?",
        richText: true,
        llmWeight: 50,
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
    content: `The manufacturing industry is at a critical inflection point in its relationship with artificial intelligence. Our comprehensive survey of 847 manufacturing executives across 12 industry segments reveals a stark gap between AI ambition and execution.

ADOPTION LANDSCAPE:

Our research indicates that 67% of Fortune 500 manufacturers have initiated AI transformation programs, yet only 23% report successful enterprise-wide deployment. This 44-percentage-point implementation gap represents billions in unrealized productivity gains and competitive vulnerability for lagging companies.

The adoption curve varies significantly by sector. Automotive and aerospace manufacturers lead with 78% adoption rates, driven by complex supply chains and demanding quality requirements. Food and beverage manufacturing lags at 41%, constrained by regulatory complexity and shorter product lifecycles that complicate ROI calculations.

BARRIER ANALYSIS:

Key barriers to adoption include workforce resistance (cited by 78% of respondents), legacy system integration challenges (65%), and unclear ROI metrics (54%). Secondary barriers include cybersecurity concerns (47%), leadership uncertainty (42%), and insufficient data infrastructure (38%).

The workforce resistance factor deserves particular attention. Our qualitative research reveals that resistance is often rooted not in technophobia but in legitimate concerns about job security, inadequate training, and management credibility gaps. Workers who have experienced previous technology rollouts that failed to deliver promised benefits are particularly skeptical.

Legacy system integration challenges are acute in precision manufacturing, where production equipment may span multiple decades and lack modern connectivity. The average manufacturing facility operates 7 distinct software systems with minimal integration. Creating the unified data environment required for AI success typically requires 12-24 months of preparatory work.

PRODUCTIVITY OUTCOMES:

Companies that successfully navigate these challenges report average productivity gains of 35-45%. The distribution is bimodal: successful implementers cluster around 40% gains, while partial implementations average only 12% improvement—barely above the cost of implementation.

Quality improvements are equally significant. AI-enabled quality inspection reduces defect rates by 30-50% in precision manufacturing applications. Customer satisfaction scores improve 15-20 points following successful AI deployment, driven by improved quality consistency and faster response times.

SUCCESS FACTORS:

The most successful transformations share common characteristics: early and transparent employee communication, phased rollouts beginning with low-risk departments, and substantial investment in reskilling programs. Companies allocating at least 15% of their AI budget to workforce transition see 40% higher adoption rates and 60% faster time-to-value.

Leadership commitment correlates strongly with success. Companies where C-suite executives spend 20%+ of their time on transformation initiatives achieve success rates of 58%, compared to 19% for companies with delegated leadership.

FINANCING AND RISK:

A critical finding: companies that took on significant debt to finance automation faced higher failure rates when they did not simultaneously invest in change management and workforce development. The failure rate for debt-financed transformations without change management investment was 67%, compared to 31% for those with comprehensive change management.

The optimal financing approach balances speed with risk tolerance. Companies with strong balance sheets can afford aggressive timelines. Those financing through debt should build in longer implementation timelines and larger contingency reserves.

OUTLOOK:

The next three years will be decisive. First movers in AI adoption are beginning to compound their advantages through learning curve effects. Laggards face a widening competitive gap that may become insurmountable by 2028.

Our recommendation: manufacturing executives should treat AI transformation as a strategic imperative, not an optional efficiency project. The companies that invest thoughtfully now—balancing technology with workforce development—will define the competitive landscape for the next decade.`,
    keyFindings: [
      "67% of Fortune 500 manufacturers have AI programs, but only 23% achieve enterprise-wide success",
      "Workforce resistance is the #1 barrier to AI adoption (78% of respondents)",
      "Companies investing 15%+ in reskilling see 40% higher adoption rates",
      "Debt-financed automation has higher failure rates without change management investment",
      "C-suite executives spending 20%+ time on transformation achieve 58% success rate"
    ],
    dataPoints: [
      { label: "AI Adoption Rate", value: "67%", trend: "up" },
      { label: "Successful Deployment", value: "23%", trend: "stable" },
      { label: "Productivity Gains", value: "35-45%", trend: "up" },
      { label: "Quality Improvement", value: "30-50%", trend: "up" }
    ],
    publishedDate: "December 2025",
    readingTime: 12
  },
  {
    id: "report-2",
    title: "Apex Manufacturing: Company Profile",
    sourceCode: "APX",
    category: "company",
    summary: "Internal analysis of Apex Manufacturing's current position, capabilities, and strategic challenges.",
    content: `COMPANY OVERVIEW:

Apex Manufacturing Inc. is a precision micro-component manufacturer headquartered in Central Iowa. Founded in 1985 by three veteran toolmakers who left a larger competitor, the company has grown from a 12-person shop to a 2,400-employee operation serving the most demanding industries in manufacturing.

Apex specializes in high-tolerance injection-molded plastic and polymer components for medical devices, electronics, and aerospace applications. The company's core competency is precision micro-molding: creating components with tolerances measured in microns where failure is not an option. A faulty component in a pacemaker or flight control system can cost lives. Apex's quality reputation—and the relationships built over four decades—are its most valuable assets.

FINANCIAL POSITION:

Current financial position: $125M annual revenue with 18% operating margins, placing Apex in the upper quartile of profitability for precision manufacturers. The company has maintained consistent margins through disciplined pricing and operational efficiency, resisting the race-to-the-bottom pricing pressure that has squeezed competitors.

However, growth has stagnated at 3% annually for the past five years. Larger competitors with advanced automation capabilities are capturing market share, offering faster turnaround times and lower prices. Apex has maintained quality leadership but risks becoming a niche player if growth doesn't accelerate.

The balance sheet is solid but not unlimited. Apex has $15M in available cash and access to a $15M credit line at 6.5% interest from First Midwest Bank. The credit line has never been drawn; the company has historically been conservative about debt. This creates both an opportunity (capacity for investment) and a challenge (cultural resistance to leveraged growth).

WORKFORCE ANALYSIS:

The workforce challenge is acute and multi-dimensional. Iowa faces one of the nation's worst manufacturing labor shortages, with the state's 2.1% unemployment rate leaving virtually no available labor pool. Apex currently has 47 open positions and receives only 3 qualified applicants for every 15 positions posted.

The demographic cliff is approaching: 26% of Apex's skilled moldmakers are approaching retirement within the next five years. These master technicians possess irreplaceable knowledge—not just technical skills, but understanding of customer requirements, material behaviors, and equipment quirks accumulated over decades. Each retiring master technician represents an estimated $2.3M in institutional knowledge.

Average employee tenure of 7.2 years reflects deep institutional knowledge and loyalty—but also resistance to change. Many long-tenured employees remember previous technology initiatives that failed or were abandoned. Trust in management's technology vision is low, and skepticism about automation runs high.

The precision skills required take 5-8 years to fully develop. A new hire with basic manufacturing background can become productive in entry-level roles within 6 months, but achieving master technician capability requires years of hands-on experience with specific materials, tolerances, and customer requirements.

GENERATIONAL DYNAMICS:

The 28% Gen Z portion of the workforce presents both challenges and opportunities. These workers bring digital fluency and fresh perspectives, but 72% refuse supervisory positions when offered. Exit interviews reveal they prioritize work-life balance, meaningful work, and continuous learning over traditional advancement. "I didn't go to school to spend my days in meetings," one departing worker explained.

This creates a leadership pipeline crisis: 8 supervisor positions remain unfilled, and 5 master moldmakers are retiring within 3 years with no clear successors. The traditional career path—line worker to lead, lead to supervisor, supervisor to manager—is breaking down.

MARKET OPPORTUNITY:

New tariffs on Chinese precision components are driving a historic reshoring wave. Medical device and aerospace customers are actively seeking domestic suppliers who can meet FDA documentation requirements and provide supply chain security. RFQ volume is up 180% year-over-year for precision micro-molding.

However, capacity constraints and labor shortages limit Apex's ability to capture this demand without significant investment. Current production lines are running at 87% capacity with existing workforce. Adding shifts requires workers that don't exist in the local labor market. The opportunity window is estimated at 18-36 months before competitors expand capacity to meet demand.

LABOR RELATIONS:

Union activity is rising. The UAW has announced organizing campaigns targeting Midwest precision manufacturers, deploying 50 organizers across Iowa, Wisconsin, Michigan, and Ohio. While Apex is not currently unionized, informal discussions have been observed among production workers concerned about automation and job security.

Recent town halls reveal worker anxieties: "We hear about robots replacing us in the news, but management says nothing. Are we supposed to just wait to get laid off?" Employee surveys show trust in management communication at 42%—a significant gap from the 75% benchmark for high-performing manufacturers.

STRATEGIC IMPERATIVES:

The next 24 months will determine Apex's trajectory for the next decade. Key decisions include:
- Whether and how much to invest in automation
- How to address the workforce pipeline crisis
- How to respond to union organizing activity
- Whether to expand capacity aggressively or accept slower growth
- How to balance debt-financed growth against cultural conservatism

These decisions are interconnected: automation choices affect labor relations, workforce investment affects capacity expansion, and communication strategy affects all of the above.`,
    keyFindings: [
      "Precision micro-molding specialist serving medical, electronics, aerospace",
      "Iowa labor shortage: 3 qualified applicants per 15 positions posted",
      "26% of skilled workforce (representing $2.3M institutional knowledge each) approaching retirement",
      "Tariff-driven reshoring creates 180% RFQ increase - but capacity constrained at 87%",
      "72% of Gen Z workers refuse management roles - 8 supervisor positions unfilled",
      "UAW organizing campaign active with worker trust in management at only 42%"
    ],
    dataPoints: [
      { label: "Annual Revenue", value: "$125M", trend: "stable" },
      { label: "Employee Count", value: "2,400", trend: "stable" },
      { label: "Avg Tenure", value: "7.2 yrs", trend: "stable" },
      { label: "Tolerance Capability", value: "±0.001\"", trend: "stable" },
      { label: "Capacity Utilization", value: "87%", trend: "up" }
    ],
    publishedDate: "January 2026",
    readingTime: 15
  },
  {
    id: "report-3",
    title: "Workforce Transition Best Practices",
    sourceCode: "WFT",
    category: "workforce",
    summary: "Evidence-based strategies for managing workforce transitions during technological change.",
    content: `EXECUTIVE SUMMARY:

Research across 200+ manufacturing transformations reveals clear patterns distinguishing successful transitions from failures. This report synthesizes lessons learned from companies that navigated automation and AI adoption while maintaining workforce morale, productivity, and community reputation.

The findings are unambiguous: workforce investment is not a "nice to have" during technological change—it is the primary determinant of success. Companies that treat workforce transition as an afterthought face significantly higher failure rates, labor disputes, and community backlash.

COMMUNICATION STRATEGY:

Companies that communicate early and often about AI plans see 35% less workforce anxiety compared to companies that communicate minimally or only when forced. The difference in outcomes is dramatic.

The key is honesty about both opportunities and challenges. Workers can handle difficult truths—what destroys trust is discovering that management concealed information. When asked what they want from management during technology transitions, workers consistently prioritize "honest information" over "job guarantees" or "severance packages."

Employees who feel informed are 2.8x more likely to support change initiatives. They become advocates rather than resisters. Informed workers also provide better feedback during implementation, identifying problems before they become crises.

Effective communication strategies share common elements:
- Early disclosure: Announcing technology plans 6-12 months before implementation, not after decisions are finalized
- Regular updates: Weekly or bi-weekly briefings during transition periods
- Two-way channels: Town halls with genuine Q&A, anonymous feedback mechanisms, manager accessibility
- Honesty about uncertainty: Acknowledging what is not yet known, rather than over-promising or under-delivering

RESKILLING INVESTMENT:

Investment in employee development is the strongest predictor of morale during transitions. The relationship is nearly linear: for every $10,000 invested per affected employee in reskilling and career transition support, turnover intention decreases by 12%.

The $10,000 threshold is not arbitrary. Effective reskilling programs typically cost $8,000-15,000 per worker and include:
- Technical training on new systems (40% of budget)
- Soft skills development for roles with more customer interaction or team leadership (25%)
- Career coaching and transition support (20%)
- Certification and credential programs (15%)

Companies that invest below this threshold—offering only cursory "training days" or online modules—see minimal benefit. Workers recognize performative investment and respond with skepticism.

The ROI calculation strongly favors reskilling investment. Replacing a skilled manufacturing worker costs 1.5-2x annual salary when accounting for recruiting, training, productivity ramp-up, and institutional knowledge loss. Even generous reskilling budgets are a fraction of replacement costs.

UNION DYNAMICS:

Companies facing union organizing during transformation have two fundamental paths: fight or partner. Our research shows that each path leads to distinctly different outcomes.

FIGHT APPROACH: Traditional union avoidance tactics including captive audience meetings, supervisor pressure, and legal delays. Outcomes:
- Delays transformation by 12-18 months on average
- Damages morale regardless of election outcome (workers remember how they were treated)
- Creates adversarial culture that persists for years
- Sometimes succeeds in preventing unionization, but at significant cost to productivity and engagement
- Average cost: $2-5M in direct expenses plus immeasurable cultural damage

PARTNERSHIP APPROACH: Engaging proactively with workers and, if organizing proceeds, treating union representatives as partners in transition planning. Outcomes:
- Can actually accelerate change by providing worker buy-in
- Union involvement provides cover for difficult decisions ("the union agreed this was fair")
- Creates collaborative culture that benefits future initiatives
- Workers feel represented and heard, reducing resentment
- Average cost: Higher labor costs over time, but lower transition friction

The choice depends on company culture, industry norms, and leadership values. Neither path is universally correct. But companies should make the choice deliberately, understanding the trade-offs, rather than defaulting to opposition reflexively.

GEN Z MANAGEMENT GAP:

The emerging leadership crisis requires structural solutions, not just better recruiting. Traditional management tracks appeal to only 28% of Gen Z workers—a dramatic decline from 52% of Millennials and 67% of Gen X at the same career stage.

The reasons are well-documented: Gen Z workers prioritize work-life balance, meaningful direct contribution, and continuous learning over positional authority. They've watched their parents sacrifice personal lives for management roles that brought stress without proportional reward.

Successful companies are responding with structural innovation:

DUAL CAREER TRACKS: Creating technical specialist roles with compensation parity to management. A "Master Technician" or "Principal Engineer" can earn as much as a Production Supervisor without taking on supervisory responsibilities. Both tracks are presented as equally prestigious paths to career success.

DISTRIBUTED LEADERSHIP: Sharing management responsibilities across teams rather than concentrating them in individual managers. Self-directed work teams handle scheduling, quality oversight, and basic conflict resolution, with managers serving as coaches rather than controllers.

MANAGEMENT ROLE REDESIGN: Stripping administrative burden from management roles through automation and support staff. Emphasizing mentoring and teaching aspects that Gen Z workers find more appealing than supervision and discipline.

COMPENSATION RESTRUCTURING: Offering 25-30% premiums for management roles, reflecting the true value and burden of the work. The traditional 10-15% premium is insufficient to attract reluctant candidates.

DISPLACEMENT BEST PRACTICES:

When technology eliminates roles, companies have options along a spectrum from pure severance to guaranteed redeployment.

SEVERANCE-ONLY APPROACH: Providing generous severance packages but no job transition support. Outcomes:
- 15% of displaced workers find comparable employment within 6 months
- 40% experience long-term unemployment or significant income decline
- 60% of companies report community reputation damage
- Remaining workers experience fear and reduced engagement
- "Survivor guilt" affects productivity for 12-18 months

RESKILLING WITH JOB GUARANTEE: Providing training for new roles with guarantee of internal placement. Outcomes:
- 80% of workers successfully redeploy internally
- 90% of remaining workers accept external placement support
- Minimal community reputation impact
- Remaining workforce engagement increases (they see company values in action)
- Higher near-term costs but better long-term outcomes

The business case for job guarantees is strongest when:
- The company is growing overall (new roles exist)
- Reskilling is feasible (workers have aptitude for new roles)
- Community reputation matters (local market, tight labor market)
- Union organizing is a concern (job guarantees reduce organizing momentum)`,
    keyFindings: [
      "Early communication reduces workforce anxiety by 35%",
      "$10,000 reskilling investment per worker = 12% turnover reduction",
      "Union partnership can accelerate transformation vs. 12-18 month delays from fighting",
      "Only 28% of Gen Z want management (vs. 67% of Gen X)",
      "Job guarantee with reskilling achieves 80% internal redeployment",
      "Severance-only approach causes 60% community reputation damage"
    ],
    dataPoints: [
      { label: "Anxiety Reduction", value: "35%", trend: "up" },
      { label: "Gen Z Management Interest", value: "28%", trend: "down" },
      { label: "Redeployment (with guarantee)", value: "80%", trend: "up" },
      { label: "Worker Replacement Cost", value: "1.5-2x salary", trend: "stable" }
    ],
    publishedDate: "November 2025",
    readingTime: 18
  },
  {
    id: "report-4",
    title: "AI Technology Landscape for Manufacturing",
    sourceCode: "ATL",
    category: "technology",
    summary: "Technical assessment of AI/ML solutions applicable to manufacturing operations.",
    content: `MARKET OVERVIEW:

The manufacturing AI landscape has matured significantly over the past five years, moving from experimental pilots to proven production systems. Annual spending on manufacturing AI is projected to reach $16.7 billion by 2027, with precision manufacturing representing 18% of that investment.

This report provides a technical assessment of AI/ML solutions applicable to manufacturing operations, with specific focus on precision manufacturing applications. We evaluate maturity levels, proven ROI ranges, implementation risk factors, and workforce implications for each category.

OPERATIONS AI: ML-POWERED OPTIMIZATION AND PREDICTIVE MAINTENANCE

ML-powered inventory optimization and predictive maintenance offer the highest proven ROI in manufacturing AI, typically delivering 20-30% cost reduction in targeted areas. These applications have reached maturity level 4 (proven at scale) and carry moderate implementation risk.

INVENTORY OPTIMIZATION uses machine learning to predict demand, optimize safety stock, and reduce carrying costs. Precision manufacturers implementing these systems report:
- 25-35% reduction in raw material inventory
- 15-20% reduction in work-in-progress
- 40-50% reduction in expediting costs
- Typical investment: $500K-2M for mid-size manufacturer
- Implementation timeline: 6-12 months
- Primary failure mode: poor data quality in legacy ERP systems

PREDICTIVE MAINTENANCE applies machine learning to equipment sensor data to predict failures before they occur. Results include:
- 30-50% reduction in unplanned downtime
- 20-25% reduction in maintenance costs
- 15-20% extension of equipment life
- Typical investment: $1-3M including sensors and integration
- Implementation timeline: 12-18 months
- Primary failure mode: insufficient sensor coverage on legacy equipment

Most implementation failures are attributed to data quality issues rather than technology limitations. Companies with well-maintained ERP systems and modern equipment with sensor capability see the fastest ROI. Those with legacy systems may need 6-12 months of data remediation before AI deployment.

ROBOTICS AND PHYSICAL AUTOMATION:

Industrial robotics costs have fallen 50% over the past five years, driven by competition from Asian manufacturers and advances in sensing and control technology. This price decline has fundamentally changed the economics of manufacturing automation.

A typical manufacturing floor automation project now costs $3-8M and displaces 15-25% of manual labor in targeted areas. However, the workforce impact is more nuanced than simple displacement:
- 60% of displaced roles are entry-level positions with high turnover
- 25% of displaced workers transition to robot maintenance and programming roles
- 15% require placement in other areas or separation

Maintenance and operation of robotic systems requires significant reskilling investment. Each $1M in robotic investment typically requires $150-200K in training costs. Companies that underinvest in training see 40% lower utilization rates and 3x higher downtime.

QUALITY INSPECTION AI:

AI-powered quality inspection has reached inflection point adoption in precision manufacturing. Machine vision systems with ML achieve:
- 99.7% defect detection rates (vs. 94% for human inspectors)
- 99.9% consistency across shifts (vs. 85% for human inspectors)
- 10x throughput improvement
- 30-50% reduction in quality escapes reaching customers

For precision micro-molding, AI inspection is particularly valuable because:
- Micron-level tolerances exceed human visual capability
- Fatigue-induced errors are eliminated
- Documentation for FDA compliance is automated
- Typical investment: $2-5M for comprehensive system
- Implementation timeline: 6-9 months
- ROI timeline: 12-18 months

Workforce transition: Quality inspectors typically move to Quality Engineer roles, overseeing multiple AI stations and focusing on root cause analysis rather than repetitive inspection. Companies report high satisfaction with this transition when communicated properly.

AI-AUGMENTED MANAGEMENT:

Emerging tools allow managers to handle 50% larger teams by automating scheduling, performance monitoring, routine communication, and basic decision-making. The technology category is maturing rapidly, with major ERP vendors incorporating AI management features.

Capabilities include:
- Automated scheduling optimization
- Real-time performance dashboards
- Anomaly detection in productivity patterns
- Automated routine communications
- Decision support for common scenarios

Early adopters report mixed results—efficiency gains but worker resentment of "algorithmic management." Workers describe feeling monitored and judged by machines rather than humans. The most successful implementations position AI as supporting managers, not replacing human judgment.

Key success factors:
- Transparency about what AI monitors and how it's used
- Human managers making final decisions on personnel matters
- Worker input into system design
- Clear policies limiting AI surveillance scope

FINANCING AND INVESTMENT:

Banks and equipment lenders are offering favorable terms (5.5-7% interest) for automation investments, viewing them as secured by productive assets with quantifiable returns. Asset-based lending is particularly attractive for robotics investments where equipment has clear resale value.

However, debt-financed automation carries risks if implementation fails or worker transition isn't managed well. Our analysis shows:
- Debt-financed projects with inadequate change management: 67% failure rate
- Debt-financed projects with comprehensive change management: 31% failure rate
- Cash-financed projects: 24% failure rate

The lesson is clear: debt amplifies both upside and downside. Companies should ensure robust implementation plans before drawing credit.

ROI TIMELINES AND SUCCESS RATES:

Typical automation investments break even in 18-24 months under realistic assumptions. However, timeline choices significantly affect success rates:

AGGRESSIVE TIMELINES (12 months to ROI):
- Success rate: 40%
- Failure mode: rushed implementation, insufficient training, worker resistance
- When appropriate: simple applications, existing expertise, low workforce impact

STANDARD TIMELINES (18-24 months to ROI):
- Success rate: 70%
- Appropriate for: most applications

CONSERVATIVE TIMELINES (36 months to ROI):
- Success rate: 85%
- Risk: competitors may pull ahead during extended implementation
- When appropriate: complex applications, high workforce impact, cultural change required

Companies should match timeline to complexity and organizational readiness, not pressure from boards or investors with unrealistic expectations.`,
    keyFindings: [
      "Operations ML (inventory/maintenance) offers 20-30% cost reduction with 6-12 month implementation",
      "Industrial robotics costs have fallen 50% in 5 years; typical project $3-8M",
      "AI quality inspection achieves 99.7% defect detection (vs. 94% human)",
      "AI-augmented management allows 50% larger team spans but creates 'algorithmic management' resentment",
      "Debt financing available at 5.5-7%, but 67% failure rate without change management",
      "Aggressive timelines (12 months) only succeed 40%; conservative (36 months) succeed 85%"
    ],
    dataPoints: [
      { label: "Ops Cost Reduction", value: "20-30%", trend: "up" },
      { label: "Robotics Cost Trend", value: "-50%", trend: "down" },
      { label: "AI Inspection Accuracy", value: "99.7%", trend: "up" },
      { label: "Conservative Timeline Success", value: "85%", trend: "stable" }
    ],
    publishedDate: "December 2025",
    readingTime: 20
  },
  {
    id: "report-5",
    title: "Competitive Analysis: Precision Manufacturing Sector",
    sourceCode: "CMP",
    category: "competition",
    summary: "Strategic assessment of key competitors in precision micro-molding and their transformation initiatives.",
    content: `EXECUTIVE SUMMARY:

This report provides a strategic assessment of key competitors in precision micro-molding and evaluates their transformation initiatives, workforce strategies, and market positioning. Understanding competitor approaches—both successes and failures—informs Apex's strategic options.

The competitive landscape is being reshaped by three forces: reshoring demand from tariffs and supply chain concerns, labor shortages constraining capacity expansion, and automation technology changing cost structures. How competitors respond to these forces will determine market share for the next decade.

TIER 1 COMPETITORS (Direct Competitors):

MICROPRECISION INC.
Revenue: $180M | Employees: 3,200 | Markets: Medical, Electronics

STRATEGY: Aggressive offshoring strategy, moving 30% of production to a new facility in Monterrey, Mexico to reduce labor costs.

INITIAL RESULTS: 40% labor cost savings, improved gross margins. The move was celebrated by Wall Street analysts and held up as a model for the industry.

CURRENT STATUS: The strategy is unraveling. The Monterrey facility failed its first FDA audit, with 14 observations including inadequate process validation and documentation gaps. Quality escapes reached medical device customers, triggering two product recalls. Major OEM customers including Medtronic and Boston Scientific have issued supplier diversification mandates, actively seeking alternative sources.

IMPLICATIONS FOR APEX: MicroPrecision's stumble creates significant opportunity. Their medical device customers are actively seeking domestic alternatives with proven quality systems. Industry sources suggest $15-25M in annual contracts are "in play" for competitors who can demonstrate capacity and FDA readiness.

LESSON: Offshoring precision manufacturing carries hidden costs. Quality culture, institutional knowledge, and regulatory expertise don't transfer easily across borders.

---

TECHMOLD PARTNERS
Revenue: $95M | Employees: 1,400 | Markets: Aerospace, Industrial

STRATEGY: Growth-through-acquisition strategy, acquiring PrecisionMold Corp. (a struggling competitor) primarily to capture their skilled workforce of 380 technicians.

EXECUTION: Paid 0.8x revenue premium for PrecisionMold, justified by the workforce acquisition rationale.

CURRENT STATUS: The acquisition has backfired significantly. TechMold inherited:
- Active labor disputes with 2 grievances pending arbitration
- Deferred equipment maintenance creating quality issues
- Cultural conflicts between TechMold and PrecisionMold teams
- Customer attrition as key accounts questioned stability

TechMold is now shedding workers it acquired, having laid off 120 of the 380 PrecisionMold employees. The remaining workforce is demoralized and actively seeking other opportunities.

IMPLICATIONS FOR APEX: TechMold's situation creates two opportunities:
1. Experienced workers from the failed acquisition are available for hire
2. Aerospace customers affected by the disruption may seek alternative suppliers

LESSON: Buying talent through acquisition is risky. Cultural integration is difficult, and acquired workers often leave within 24 months. Building talent internally takes longer but creates more sustainable competitive advantage.

---

TIER 2 COMPETITORS:

PRECISIONFIRST (Wisconsin)
Revenue: $65M | Employees: 1,200 | Markets: Medical, Aerospace

STRATEGY: Balanced approach combining selective automation with heavy workforce investment. PrecisionFirst has explicitly rejected the "automate everything" approach in favor of "automate the right things."

WORKFORCE APPROACH: Created landmark community college partnership with Madison Area Technical College (MATC). Key elements:
- $600K investment in dedicated precision manufacturing program
- Apex curriculum input ensures graduates are job-ready
- Guaranteed employment at $55K starting salary for all graduates
- Master Technician mentorship program pairs new hires with veterans
- Pipeline now produces 30 qualified technicians annually

Created "Master Technician" career track parallel to management, allowing senior moldmakers to advance without taking supervisory roles. This solved the Gen Z management gap that affects competitors.

AUTOMATION APPROACH: Deployed AI-powered quality inspection, but positioned it as "assistant to inspectors" rather than replacement. Inspectors transitioned to "Quality Engineers" overseeing multiple AI stations. Zero layoffs from automation.

RESULTS:
- 15% annual revenue growth (vs. industry average of 3%)
- Quality escapes reduced 60%
- Named "Best Employer in Precision Manufacturing" by Manufacturing Leadership Council
- Zero union organizing activity despite UAW targeting the sector
- Employee retention above 90%
- Competitors now attempting to poach their workers—but few are leaving

IMPLICATIONS FOR APEX: PrecisionFirst represents the model to emulate. Their balanced approach demonstrates that workforce investment and automation are complementary, not contradictory. Their community college partnership is replicable—Iowa has similar institutions seeking industry partners.

CEO QUOTE: "Everyone was fighting over the same tiny pool of experienced workers. We decided to grow the pool instead. It took longer, but now we have a sustainable advantage no competitor can match."

---

CRAFTMOLD (Iowa)
Revenue: $22M | Employees: 280 | Markets: Industrial, Agriculture

STRATEGY: Avoided all modernization, betting on "heritage craftsmanship" positioning. CraftMold's marketing emphasizes handmade quality and 40 years of tradition.

CURRENT STATUS: The strategy is failing. CraftMold cannot meet medical device or aerospace quality documentation requirements, which increasingly require AI-powered inspection for traceability. They're losing customers to competitors with modern systems.

Key indicators of distress:
- Revenue down 18% over two years
- Lost 3 major accounts in the past year
- Average employee age is 58 (no succession pipeline)
- Equipment is 20+ years old with no capital budget for replacement
- Industry analysts project failure within 18 months

IMPLICATIONS FOR APEX: CraftMold's customer base and potentially their skilled workers will be available as the company winds down. Their industrial and agricultural customers need new suppliers.

LESSON: Heritage positioning cannot substitute for capability. Customers value quality, but they define quality in modern terms that include documentation, traceability, and consistency that only automation can provide.

---

MARKET DYNAMICS:

THE RESHORING WAVE:
The reshoring wave is real and accelerating. Current data shows:
- 30% of medical device precision components are moving to domestic suppliers
- 45% of aerospace precision components are under domestic sourcing review
- RFQ volume for domestic precision manufacturing is up 180% year-over-year

TARIFF IMPACT:
Tariffs on Chinese components (20%) and raw materials (25% steel/aluminum, 50% copper) are reshaping competitive economics. The tariff burden makes domestic sourcing economically competitive even before accounting for:
- Shorter lead times (4 weeks vs. 12-16 weeks)
- Reduced inventory requirements
- Eliminated supply chain risk
- Simplified FDA compliance

CAPACITY CONSTRAINT:
The 415,000 unfilled manufacturing jobs create a structural constraint on industry capacity. Companies investing in workforce development now will capture disproportionate share of reshoring demand. Those waiting for the labor market to improve will find the window has closed.

COMPETITIVE POSITIONING SUMMARY:

WINNERS: US-based manufacturers with:
- Scalable capacity
- FDA-compliant quality systems
- Sustainable workforce pipelines
- Selective automation investments

LOSERS:
- Offshore producers facing tariff burdens
- Domestic manufacturers who can't staff expansion
- Companies that over-automate without workforce investment
- Companies that under-automate and can't meet quality requirements

The competitive landscape will look very different in 36 months. Market share that shifts during the reshoring wave will be difficult to recapture later. Now is the time to invest and position for long-term advantage.`,
    keyFindings: [
      "MicroPrecision: Mexico offshoring failed FDA audit, $15-25M in contracts 'in play'",
      "TechMold: acquisition strategy backfired—shedding 120 of 380 acquired workers",
      "PrecisionFirst: workforce investment + community college model achieving 15% annual growth",
      "CraftMold: heritage-only strategy failing, projected failure within 18 months",
      "30% of medical precision components reshoring to domestic suppliers",
      "Labor shortage (415K unfilled jobs) constrains industry-wide capacity expansion"
    ],
    dataPoints: [
      { label: "Reshoring Wave", value: "30%", trend: "up" },
      { label: "Steel Tariff", value: "25%", trend: "up" },
      { label: "Copper Tariff", value: "50%", trend: "up" },
      { label: "Unfilled Mfg Jobs", value: "415,000", trend: "up" },
      { label: "RFQ Volume Increase", value: "+180%", trend: "up" }
    ],
    publishedDate: "January 2026",
    readingTime: 18
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

  async getTeamWithDifficulty(id: string, difficultyLevel: "introductory" | "standard" | "advanced"): Promise<Team | undefined> {
    const { teamStorage } = await import("./team-storage");
    return teamStorage.getTeam(id, difficultyLevel);
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
    // Calculate reading time dynamically based on content length
    return researchReports.map(report => {
      // Combine all text content for accurate word count
      const fullText = [
        report.summary,
        report.content,
        ...report.keyFindings
      ].join(' ');
      
      return {
        ...report,
        readingTime: calculateReadingTime(fullText)
      };
    });
  }

  async getHistoricalData(): Promise<HistoricalData[]> {
    return historicalData;
  }

  async getWorkforceDemographics(): Promise<WorkforceDemographics> {
    return workforceDemographics;
  }

  // Content view tracking methods
  async recordContentView(view: Omit<InsertContentView, 'timeSpentSeconds'> & { timeSpentSeconds?: number | null }): Promise<ContentView> {
    const { contentViews } = await import("@shared/models/auth");
    const result = await db.insert(contentViews).values({
      userId: view.userId,
      teamId: view.teamId,
      contentType: view.contentType,
      contentId: view.contentId,
      weekNumber: view.weekNumber,
      timeSpentSeconds: view.timeSpentSeconds ?? null,
    }).returning();
    const row = result[0];
    return {
      id: row.id,
      userId: row.userId,
      teamId: row.teamId,
      contentType: row.contentType as 'research_report' | 'briefing_section' | 'simulation_content',
      contentId: row.contentId,
      weekNumber: row.weekNumber,
      viewedAt: row.viewedAt ? row.viewedAt.toISOString() : new Date().toISOString(),
      timeSpentSeconds: row.timeSpentSeconds,
    };
  }

  async getContentViews(userId: string, teamId?: string, contentType?: string, weekNumber?: number): Promise<ContentView[]> {
    const { contentViews } = await import("@shared/models/auth");
    const { eq, and } = await import("drizzle-orm");
    
    let conditions = [eq(contentViews.userId, userId)];
    if (contentType) {
      conditions.push(eq(contentViews.contentType, contentType));
    }
    if (weekNumber !== undefined) {
      conditions.push(eq(contentViews.weekNumber, weekNumber));
    }
    
    const rows = await db.select().from(contentViews).where(and(...conditions));
    return rows.map(row => ({
      id: row.id,
      userId: row.userId,
      teamId: row.teamId,
      contentType: row.contentType as 'research_report' | 'briefing_section' | 'simulation_content',
      contentId: row.contentId,
      weekNumber: row.weekNumber,
      viewedAt: row.viewedAt ? row.viewedAt.toISOString() : new Date().toISOString(),
      timeSpentSeconds: row.timeSpentSeconds,
    }));
  }

  async getContentViewProgress(userId: string, teamId?: string, weekNumber?: number): Promise<ContentViewProgress> {
    const { contentViews } = await import("@shared/models/auth");
    const { eq, and } = await import("drizzle-orm");
    
    // Get all views for this user
    const allViews = await db.select().from(contentViews).where(eq(contentViews.userId, userId));
    
    // Research progress - get total from research reports data
    // Note: Research reports include industry, workforce, financials, market, technology, regulatory
    const researchReportCategories = ['industry', 'workforce', 'financials', 'market', 'technology', 'regulatory'];
    const researchTotal = researchReportCategories.length;
    const researchViews = allViews.filter(v => v.contentType === 'research_report');
    const uniqueResearchIds = Array.from(new Set(researchViews.map(v => v.contentId)));
    const researchViewed = Math.min(uniqueResearchIds.length, researchTotal);
    
    // Briefing progress - each week has 4 sections:
    // 1. sitrep (Situation Report)
    // 2. pressures (Stakeholder Pressures)  
    // 3. keyquestion (Key Question)
    // 4. scenario (Main scenario - auto-recorded on page load)
    const sectionsPerWeek = 4;
    const briefingViews = allViews.filter(v => 
      v.contentType === 'briefing_section' && 
      (weekNumber === undefined || v.weekNumber === weekNumber)
    );
    const uniqueBriefingIds = Array.from(new Set(briefingViews.map(v => v.contentId)));
    
    // Get simulation config for dynamic week count (defaults to 8 if not available)
    let totalSimulationWeeks = 8;
    if (teamId) {
      const team = await this.getTeam(teamId);
      if (team?.totalWeeks) {
        totalSimulationWeeks = team.totalWeeks;
      }
    }
    
    const briefingTotal = weekNumber !== undefined ? sectionsPerWeek : (sectionsPerWeek * totalSimulationWeeks);
    const briefingViewed = Math.min(uniqueBriefingIds.length, briefingTotal);
    
    // Overall combines both
    const overallTotal = researchTotal + briefingTotal;
    const overallViewed = researchViewed + briefingViewed;
    
    return {
      briefing: {
        viewed: briefingViewed,
        total: briefingTotal,
        percentage: briefingTotal > 0 ? Math.round((briefingViewed / briefingTotal) * 100) : 0
      },
      research: {
        viewed: researchViewed,
        total: researchTotal,
        percentage: researchTotal > 0 ? Math.round((researchViewed / researchTotal) * 100) : 0
      },
      overall: {
        viewed: overallViewed,
        total: overallTotal,
        percentage: overallTotal > 0 ? Math.round((overallViewed / overallTotal) * 100) : 0
      }
    };
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
    const settings = await this.getPlatformSettings();
    const entries: LeaderboardEntry[] = [];
    
    // Get scoring weights from platform settings
    const financialWeight = settings.scoringWeightFinancial / 100;
    const culturalWeight = settings.scoringWeightCultural / 100;
    
    if (settings.competitionMode === "team") {
      // Team mode: Average scores across team members
      // For now, we still use team-level company state since individual player decisions
      // aren't yet fully implemented. When individual decisions are tracked,
      // this will average player performances within each team.
      for (const team of teams) {
        const workforceRatio = team.companyState.employees / 2400;
        const financialScore = (team.companyState.revenue / 125000000) * workforceRatio * 100;
        const culturalScore = (team.companyState.morale + (100 - team.companyState.unionSentiment) + team.companyState.workforceAdaptability) / 3;
        
        // Apply weighted scoring
        const combinedScore = (financialScore * financialWeight) + (culturalScore * culturalWeight);
        
        entries.push({
          teamId: team.id,
          teamName: team.name,
          rank: 0,
          financialScore: Math.round(financialScore),
          culturalScore: Math.round(culturalScore),
          combinedScore: Math.round(combinedScore),
          currentWeek: team.currentWeek,
        });
      }
    } else {
      // Individual mode: Each team/player scored separately
      for (const team of teams) {
        const workforceRatio = team.companyState.employees / 2400;
        const financialScore = (team.companyState.revenue / 125000000) * workforceRatio * 100;
        const culturalScore = (team.companyState.morale + (100 - team.companyState.unionSentiment) + team.companyState.workforceAdaptability) / 3;
        
        // Apply weighted scoring
        const combinedScore = (financialScore * financialWeight) + (culturalScore * culturalWeight);
        
        entries.push({
          teamId: team.id,
          teamName: team.name,
          rank: 0,
          financialScore: Math.round(financialScore),
          culturalScore: Math.round(culturalScore),
          combinedScore: Math.round(combinedScore),
          currentWeek: team.currentWeek,
        });
      }
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
      decisionId: decisionId,
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

  async getPlayerDecisions(playerId: string): Promise<PlayerDecisionSubmission[]> {
    return this.playerDecisions.get(playerId) || [];
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

  async detectEasterEggsWithViewBonus(
    rationale: string, 
    weekNumber: number, 
    userId: string, 
    teamId?: string
  ): Promise<{
    foundIds: string[];
    viewedContentMatches: string[];
    viewBonusMultiplier: number;
  }> {
    const foundIds: string[] = [];
    const viewedContentMatches: string[] = [];
    const lowerRationale = rationale.toLowerCase();
    
    // First detect all easter eggs in the rationale
    for (const egg of easterEggs) {
      if (egg.weekNumber === undefined || egg.weekNumber === weekNumber) {
        if (lowerRationale.includes(egg.keyword.toLowerCase())) {
          foundIds.push(egg.id);
        }
      }
    }
    
    // Get the user's content views for this week (optional intel items)
    const contentViews = await this.getContentViews(userId, teamId, undefined, weekNumber);
    
    // Map content view IDs to their content identifiers
    const viewedContentIds = new Set(contentViews.map(v => v.contentId.toLowerCase()));
    
    // Filter for briefing article views (these are the optional intel items)
    const briefingArticleViews = contentViews.filter(v => 
      v.contentId.startsWith('briefing_article_')
    );
    
    // Get the article IDs that were viewed
    const viewedArticleIds = new Set(
      briefingArticleViews.map(v => v.contentId.replace('briefing_article_', ''))
    );
    
    // Check which easter eggs match content the user actually viewed
    // We match based on whether the user viewed any intel articles
    // (The bonus applies when students engage with optional material and reference it)
    const hasViewedIntel = briefingArticleViews.length > 0;
    if (hasViewedIntel && foundIds.length > 0) {
      // If student viewed intel and referenced easter eggs, they get bonus for engagement
      // Mark all found easter eggs as matching viewed content since they engaged with material
      viewedContentMatches.push(...foundIds);
    }
    
    // Calculate bonus multiplier based on intel engagement:
    // Base: 1.0x (no bonus if no intel viewed)
    // +0.15x for each unique intel article viewed, cap at 1.5x
    const uniqueIntelViewed = viewedArticleIds.size;
    const viewBonusMultiplier = uniqueIntelViewed > 0 
      ? Math.min(1.5, 1.0 + (uniqueIntelViewed * 0.15))
      : 1.0;
    
    return {
      foundIds,
      viewedContentMatches,
      viewBonusMultiplier,
    };
  }

  async evaluateRationaleWithLLM(
    rationale: string,
    decisionContext: string,
    weekNumber: number
  ): Promise<{ score: number; evidenceUsed: string[]; reasoning: string; quality: string }> {
    try {
      const { evaluateRationale, calculateEasterEggBonus } = await import("./services/llm-evaluation");
      const evaluation = await evaluateRationale(rationale, decisionContext, weekNumber);
      return {
        score: evaluation.researchQualityScore,
        evidenceUsed: evaluation.evidenceUsed,
        reasoning: evaluation.reasoning,
        quality: evaluation.overallQuality,
      };
    } catch (error) {
      console.error("[Storage] LLM evaluation failed:", error);
      return {
        score: 0,
        evidenceUsed: [],
        reasoning: "Evaluation unavailable",
        quality: "poor",
      };
    }
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
    message: string;
    referralSource?: string | null;
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
      referralSource: inquiry.referralSource || null,
    }).returning({ id: educatorInquiries.id });
    
    return { id: result.id };
  }

  // Default platform settings (used when no DB row exists)
  private defaultPlatformSettings: PlatformSettings = {
    id: "default",
    requireEduEmail: true,
    requireTeamCode: true,
    competitionMode: "individual",
    totalWeeks: 8,
    scoringWeightFinancial: 50,
    scoringWeightCultural: 50,
    easterEggBonusEnabled: true,
    easterEggBonusPercentage: 5,
    updatedAt: new Date().toISOString(),
    updatedBy: undefined,
  };

  async getPlatformSettings(): Promise<PlatformSettings> {
    try {
      const [settings] = await db.select().from(platformSettings).where(eq(platformSettings.id, "default"));
      
      if (settings) {
        return {
          id: settings.id,
          requireEduEmail: settings.requireEduEmail,
          requireTeamCode: settings.requireTeamCode,
          competitionMode: settings.competitionMode as "individual" | "team",
          totalWeeks: settings.totalWeeks,
          scoringWeightFinancial: settings.scoringWeightFinancial,
          scoringWeightCultural: settings.scoringWeightCultural,
          easterEggBonusEnabled: settings.easterEggBonusEnabled,
          easterEggBonusPercentage: settings.easterEggBonusPercentage,
          updatedAt: settings.updatedAt?.toISOString() || new Date().toISOString(),
          updatedBy: settings.updatedBy || undefined,
        };
      }
      
      // No settings exist yet, return defaults
      return { ...this.defaultPlatformSettings };
    } catch (error) {
      console.error("Error fetching platform settings:", error);
      return { ...this.defaultPlatformSettings };
    }
  }

  async updatePlatformSettings(updates: Partial<PlatformSettings>, updatedBy?: string): Promise<PlatformSettings> {
    try {
      // Check if settings row exists
      const [existing] = await db.select().from(platformSettings).where(eq(platformSettings.id, "default"));
      
      const updateData = {
        ...(updates.requireEduEmail !== undefined && { requireEduEmail: updates.requireEduEmail }),
        ...(updates.requireTeamCode !== undefined && { requireTeamCode: updates.requireTeamCode }),
        ...(updates.competitionMode !== undefined && { competitionMode: updates.competitionMode }),
        ...(updates.totalWeeks !== undefined && { totalWeeks: updates.totalWeeks }),
        ...(updates.scoringWeightFinancial !== undefined && { scoringWeightFinancial: updates.scoringWeightFinancial }),
        ...(updates.scoringWeightCultural !== undefined && { scoringWeightCultural: updates.scoringWeightCultural }),
        ...(updates.easterEggBonusEnabled !== undefined && { easterEggBonusEnabled: updates.easterEggBonusEnabled }),
        ...(updates.easterEggBonusPercentage !== undefined && { easterEggBonusPercentage: updates.easterEggBonusPercentage }),
        updatedAt: new Date(),
        updatedBy: updatedBy || null,
      };

      if (existing) {
        // Update existing row
        await db.update(platformSettings)
          .set(updateData)
          .where(eq(platformSettings.id, "default"));
      } else {
        // Insert new row with defaults + updates
        await db.insert(platformSettings).values({
          id: "default",
          requireEduEmail: updates.requireEduEmail ?? true,
          requireTeamCode: updates.requireTeamCode ?? true,
          competitionMode: updates.competitionMode ?? "individual",
          totalWeeks: updates.totalWeeks ?? 8,
          scoringWeightFinancial: updates.scoringWeightFinancial ?? 50,
          scoringWeightCultural: updates.scoringWeightCultural ?? 50,
          easterEggBonusEnabled: updates.easterEggBonusEnabled ?? true,
          easterEggBonusPercentage: updates.easterEggBonusPercentage ?? 5,
          updatedAt: new Date(),
          updatedBy: updatedBy || null,
        });
      }
      
      return this.getPlatformSettings();
    } catch (error) {
      console.error("Error updating platform settings:", error);
      throw error;
    }
  }

  // Get simulation by organization ID
  async getSimulationByOrganization(organizationId: string): Promise<any | null> {
    const { db } = await import("./db");
    const { simulations } = await import("@shared/models/auth");
    
    const [simulation] = await db.select().from(simulations)
      .where(eq(simulations.organizationId, organizationId));
    return simulation || null;
  }

  // Simulation Modules CRUD
  async getSimulationModules(): Promise<any[]> {
    const { db } = await import("./db");
    const { simulationModules } = await import("@shared/models/auth");
    
    const modules = await db.select().from(simulationModules);
    return modules;
  }

  async getSimulationModule(id: string): Promise<any | null> {
    const { db } = await import("./db");
    const { simulationModules } = await import("@shared/models/auth");
    
    const [module] = await db.select().from(simulationModules).where(eq(simulationModules.id, id));
    return module || null;
  }

  async createSimulationModule(data: { name: string; description?: string; slug: string; isDefault?: boolean; isActive?: boolean }): Promise<any> {
    const { db } = await import("./db");
    const { simulationModules } = await import("@shared/models/auth");
    
    const [module] = await db.insert(simulationModules).values({
      name: data.name,
      description: data.description || null,
      slug: data.slug,
      isDefault: data.isDefault ?? false,
      isActive: data.isActive ?? true,
    }).returning();
    
    return module;
  }

  async updateSimulationModule(id: string, data: Partial<{ name: string; description?: string; slug: string; isDefault?: boolean; isActive?: boolean }>): Promise<any | null> {
    const { db } = await import("./db");
    const { simulationModules } = await import("@shared/models/auth");
    
    const [module] = await db.update(simulationModules)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(simulationModules.id, id))
      .returning();
    
    return module || null;
  }

  async deleteSimulationModule(id: string): Promise<boolean> {
    const { db } = await import("./db");
    const { simulationModules, simulationContent } = await import("@shared/models/auth");
    
    // First delete all content for this module
    await db.delete(simulationContent).where(eq(simulationContent.moduleId, id));
    // Then delete the module
    const result = await db.delete(simulationModules).where(eq(simulationModules.id, id));
    return true;
  }

  // Simulation Content CRUD
  async getSimulationContent(moduleId: string, weekNumber?: number): Promise<any[]> {
    const { db } = await import("./db");
    const { simulationContent } = await import("@shared/models/auth");
    const { and, asc } = await import("drizzle-orm");
    
    let query;
    if (weekNumber !== undefined) {
      query = await db.select().from(simulationContent)
        .where(and(
          eq(simulationContent.moduleId, moduleId),
          eq(simulationContent.weekNumber, weekNumber)
        ))
        .orderBy(asc(simulationContent.order));
    } else {
      query = await db.select().from(simulationContent)
        .where(eq(simulationContent.moduleId, moduleId))
        .orderBy(asc(simulationContent.weekNumber), asc(simulationContent.order));
    }
    
    return query;
  }

  async getSimulationContentItem(id: string): Promise<any | null> {
    const { db } = await import("./db");
    const { simulationContent } = await import("@shared/models/auth");
    
    const [item] = await db.select().from(simulationContent).where(eq(simulationContent.id, id));
    return item || null;
  }

  async createSimulationContent(data: {
    moduleId: string;
    weekNumber: number;
    title: string;
    contentType: string;
    content?: string;
    embedUrl?: string;
    resourceUrl?: string;
    thumbnailUrl?: string;
    order?: number;
    isActive?: boolean;
    createdBy?: string;
    mediaUrl?: string;
    mediaDurationSeconds?: number;
    transcript?: string;
    category?: string;
    isIntelContent?: boolean;
  }): Promise<any> {
    const { db } = await import("./db");
    const { simulationContent } = await import("@shared/models/auth");
    
    const [item] = await db.insert(simulationContent).values({
      moduleId: data.moduleId,
      weekNumber: data.weekNumber,
      title: data.title,
      contentType: data.contentType,
      content: data.content || null,
      embedUrl: data.embedUrl || null,
      resourceUrl: data.resourceUrl || null,
      thumbnailUrl: data.thumbnailUrl || null,
      order: data.order ?? 0,
      isActive: data.isActive ?? true,
      createdBy: data.createdBy || null,
      mediaUrl: data.mediaUrl || null,
      mediaDurationSeconds: data.mediaDurationSeconds || null,
      transcript: data.transcript || null,
      category: data.category || null,
      isIntelContent: data.isIntelContent ?? false,
    }).returning();
    
    return item;
  }

  async updateSimulationContent(id: string, data: Partial<{
    title: string;
    contentType: string;
    content?: string;
    embedUrl?: string;
    resourceUrl?: string;
    thumbnailUrl?: string;
    order?: number;
    isActive?: boolean;
    updatedBy?: string;
    mediaUrl?: string;
    mediaDurationSeconds?: number;
    transcript?: string;
    category?: string;
    isIntelContent?: boolean;
  }>): Promise<any | null> {
    const { db } = await import("./db");
    const { simulationContent } = await import("@shared/models/auth");
    
    const [item] = await db.update(simulationContent)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(simulationContent.id, id))
      .returning();
    
    return item || null;
  }

  async deleteSimulationContent(id: string): Promise<boolean> {
    const { db } = await import("./db");
    const { simulationContent } = await import("@shared/models/auth");
    
    await db.delete(simulationContent).where(eq(simulationContent.id, id));
    return true;
  }

  // Character Profiles CRUD
  async getCharacterProfiles(moduleId?: string): Promise<any[]> {
    const { db } = await import("./db");
    const { characterProfiles } = await import("@shared/models/auth");
    const { asc } = await import("drizzle-orm");
    
    if (moduleId) {
      const { or, isNull } = await import("drizzle-orm");
      return db.select().from(characterProfiles)
        .where(or(eq(characterProfiles.moduleId, moduleId), isNull(characterProfiles.moduleId)))
        .orderBy(asc(characterProfiles.sortOrder));
    }
    return db.select().from(characterProfiles).orderBy(asc(characterProfiles.sortOrder));
  }

  async getCharacterProfile(id: string): Promise<any | null> {
    const { db } = await import("./db");
    const { characterProfiles } = await import("@shared/models/auth");
    
    const [profile] = await db.select().from(characterProfiles).where(eq(characterProfiles.id, id));
    return profile || null;
  }

  async createCharacterProfile(data: {
    moduleId?: string;
    name: string;
    role: string;
    title?: string;
    company?: string;
    headshotUrl?: string;
    headshotPrompt?: string;
    bio?: string;
    personality?: string;
    communicationStyle?: string;
    motivations?: string;
    fears?: string;
    relationships?: any[];
    voiceDescription?: string;
    voiceId?: string;
    speakingStyleExamples?: string[];
    // Quantifiable traits for simulation mechanics
    influence?: number;
    hostility?: number;
    flexibility?: number;
    riskTolerance?: number;
    impactCategories?: string[];
    isActive?: boolean;
    sortOrder?: number;
    createdBy?: string;
  }): Promise<any> {
    const { db } = await import("./db");
    const { characterProfiles } = await import("@shared/models/auth");
    
    const [profile] = await db.insert(characterProfiles).values({
      moduleId: data.moduleId || null,
      name: data.name,
      role: data.role,
      title: data.title || null,
      company: data.company || null,
      headshotUrl: data.headshotUrl || null,
      headshotPrompt: data.headshotPrompt || null,
      bio: data.bio || null,
      personality: data.personality || null,
      communicationStyle: data.communicationStyle || null,
      motivations: data.motivations || null,
      fears: data.fears || null,
      relationships: data.relationships || null,
      voiceDescription: data.voiceDescription || null,
      voiceId: data.voiceId || null,
      speakingStyleExamples: data.speakingStyleExamples || null,
      // Quantifiable traits (default to 5 if not provided)
      influence: data.influence ?? 5,
      hostility: data.hostility ?? 5,
      flexibility: data.flexibility ?? 5,
      riskTolerance: data.riskTolerance ?? 5,
      impactCategories: data.impactCategories || null,
      isActive: data.isActive ?? true,
      sortOrder: data.sortOrder ?? 0,
      createdBy: data.createdBy || null,
    }).returning();
    
    return profile;
  }

  async updateCharacterProfile(id: string, data: Partial<{
    moduleId?: string;
    name?: string;
    role?: string;
    title?: string;
    company?: string;
    headshotUrl?: string;
    headshotPrompt?: string;
    bio?: string;
    personality?: string;
    communicationStyle?: string;
    motivations?: string;
    fears?: string;
    relationships?: any[];
    voiceDescription?: string;
    voiceId?: string;
    speakingStyleExamples?: string[];
    // Quantifiable traits for simulation mechanics
    influence?: number;
    hostility?: number;
    flexibility?: number;
    riskTolerance?: number;
    impactCategories?: string[];
    isActive?: boolean;
    sortOrder?: number;
  }>): Promise<any | null> {
    const { db } = await import("./db");
    const { characterProfiles } = await import("@shared/models/auth");
    
    const [profile] = await db.update(characterProfiles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(characterProfiles.id, id))
      .returning();
    
    return profile || null;
  }

  async deleteCharacterProfile(id: string): Promise<boolean> {
    const { db } = await import("./db");
    const { characterProfiles } = await import("@shared/models/auth");
    
    await db.delete(characterProfiles).where(eq(characterProfiles.id, id));
    return true;
  }

  // Phone-a-Friend Advisors CRUD
  async getPhoneAFriendAdvisors(moduleId?: string): Promise<any[]> {
    const { db } = await import("./db");
    const { phoneAFriendAdvisors, characterProfiles } = await import("@shared/models/auth");
    const { asc } = await import("drizzle-orm");
    
    if (moduleId) {
      const { or, isNull } = await import("drizzle-orm");
      return db.select({
        advisor: phoneAFriendAdvisors,
        character: characterProfiles
      })
        .from(phoneAFriendAdvisors)
        .leftJoin(characterProfiles, eq(phoneAFriendAdvisors.characterId, characterProfiles.id))
        .where(or(eq(phoneAFriendAdvisors.moduleId, moduleId), isNull(phoneAFriendAdvisors.moduleId)))
        .orderBy(asc(phoneAFriendAdvisors.sortOrder));
    }
    return db.select({
      advisor: phoneAFriendAdvisors,
      character: characterProfiles
    })
      .from(phoneAFriendAdvisors)
      .leftJoin(characterProfiles, eq(phoneAFriendAdvisors.characterId, characterProfiles.id))
      .orderBy(asc(phoneAFriendAdvisors.sortOrder));
  }

  async getPhoneAFriendUsageCount(userId: string, simulationId: string): Promise<number> {
    const { db } = await import("./db");
    const { phoneAFriendUsage } = await import("@shared/models/auth");
    const { and, count } = await import("drizzle-orm");
    
    const [result] = await db.select({ count: count() })
      .from(phoneAFriendUsage)
      .where(and(
        eq(phoneAFriendUsage.userId, userId),
        eq(phoneAFriendUsage.simulationId, simulationId)
      ));
    
    return result?.count || 0;
  }

  async createPhoneAFriendUsage(data: {
    userId: string;
    teamId?: string;
    simulationId: string;
    advisorId: string;
    weekNumber: number;
    question: string;
    context?: string;
    advice: string;
  }): Promise<any> {
    const { db } = await import("./db");
    const { phoneAFriendUsage } = await import("@shared/models/auth");
    
    const [usage] = await db.insert(phoneAFriendUsage).values({
      userId: data.userId,
      teamId: data.teamId || null,
      simulationId: data.simulationId,
      advisorId: data.advisorId,
      weekNumber: data.weekNumber,
      question: data.question,
      context: data.context || null,
      advice: data.advice,
    }).returning();
    
    return usage;
  }

  // Triggered Voicemails CRUD
  async getTriggeredVoicemails(moduleId: string, weekNumber?: number): Promise<any[]> {
    const { db } = await import("./db");
    const { triggeredVoicemails, characterProfiles } = await import("@shared/models/auth");
    const { and, or, isNull } = await import("drizzle-orm");
    
    let condition = eq(triggeredVoicemails.moduleId, moduleId);
    if (weekNumber !== undefined) {
      condition = and(
        condition,
        or(eq(triggeredVoicemails.weekNumber, weekNumber), isNull(triggeredVoicemails.weekNumber))
      ) as any;
    }
    
    return db.select({
      voicemail: triggeredVoicemails,
      character: characterProfiles
    })
      .from(triggeredVoicemails)
      .leftJoin(characterProfiles, eq(triggeredVoicemails.characterId, characterProfiles.id))
      .where(condition);
  }

  async getVoicemailDeliveries(userId: string): Promise<any[]> {
    const { db } = await import("./db");
    const { voicemailDeliveries, triggeredVoicemails, characterProfiles } = await import("@shared/models/auth");
    const { desc } = await import("drizzle-orm");
    
    return db.select({
      delivery: voicemailDeliveries,
      voicemail: triggeredVoicemails,
      character: characterProfiles
    })
      .from(voicemailDeliveries)
      .leftJoin(triggeredVoicemails, eq(voicemailDeliveries.voicemailId, triggeredVoicemails.id))
      .leftJoin(characterProfiles, eq(triggeredVoicemails.characterId, characterProfiles.id))
      .where(eq(voicemailDeliveries.userId, userId))
      .orderBy(desc(voicemailDeliveries.deliveredAt));
  }

  async createVoicemailDelivery(data: {
    userId: string;
    voicemailId: string;
  }): Promise<any> {
    const { db } = await import("./db");
    const { voicemailDeliveries } = await import("@shared/models/auth");
    
    const [delivery] = await db.insert(voicemailDeliveries).values({
      userId: data.userId,
      voicemailId: data.voicemailId,
    }).returning();
    
    return delivery;
  }

  async updateVoicemailDelivery(id: string, data: Partial<{
    viewedAt?: Date;
    dismissedAt?: Date;
    listenedFully?: boolean;
  }>): Promise<any | null> {
    const { db } = await import("./db");
    const { voicemailDeliveries } = await import("@shared/models/auth");
    
    const [delivery] = await db.update(voicemailDeliveries)
      .set(data)
      .where(eq(voicemailDeliveries.id, id))
      .returning();
    
    return delivery || null;
  }
}

export const storage = new MemStorage();
