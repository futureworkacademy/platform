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
    annualRevenue: number;
    employees: number;
    location: string;
    founded: number;
  };
  weeks: Array<{ number: number; title: string; theme: string }>;
  characters: Array<{ name: string; role: string; influence: number; hostility: number }>;
  competitors: Array<{ name: string; approach: string; outcome: string }>;
}

const MODULE_ID = 'ab027ff4-ff8b-4898-8a19-6c44c10b0cdc';

interface IntelArticle {
  weekNumber: number;
  title: string;
  category: 'industry' | 'analysis' | 'news' | 'academic' | 'opinion';
  source: string;
  prompt: string;
}

const intelArticles: IntelArticle[] = [
  // Week 1 Intel
  {
    weekNumber: 1,
    title: "McKinsey Report: Manufacturing Automation Accelerates Post-Pandemic",
    category: "industry",
    source: "McKinsey Global Institute",
    prompt: `Write a consulting-style industry report about manufacturing automation trends post-pandemic.

Include:
- Statistics on automation adoption acceleration (cite realistic percentages)
- Labor shortage drivers pushing automation investment
- ROI timelines for different automation categories
- Risk factors and implementation challenges
- Comparison of early adopters vs. laggards

Write 600-800 words in McKinsey consulting report style with key takeaways and exhibits. Use markdown formatting.`
  },
  {
    weekNumber: 1,
    title: "WSJ Analysis: The Hidden Costs of Factory Automation",
    category: "analysis",
    source: "Wall Street Journal",
    prompt: `Write a Wall Street Journal style analysis piece about the often-overlooked costs of factory automation.

Cover:
- Integration costs beyond equipment purchase
- Training and change management expenses
- Productivity dip during transition periods
- Maintenance and upgrade cycles
- Case study of a company that underestimated total costs

Write 500-700 words in WSJ analytical journalism style. Use markdown formatting.`
  },
  {
    weekNumber: 1,
    title: "Harvard Business Review: Leading Through Technological Disruption",
    category: "academic",
    source: "Harvard Business Review",
    prompt: `Write an HBR-style article about leadership during technological transformation.

Include:
- Framework for change leadership
- Common CEO mistakes during transformation
- The balance between urgency and patience
- Building coalition among skeptics
- Research findings on transformation success factors

Write 600-800 words in HBR academic-practitioner style. Use markdown formatting.`
  },

  // Week 2 Intel
  {
    weekNumber: 2,
    title: "Skills Gap Crisis: Manufacturing's Talent Shortage Worsens",
    category: "industry",
    source: "Manufacturing Institute",
    prompt: `Write an industry report about the manufacturing skills gap crisis.

Include:
- Statistics on unfilled manufacturing positions
- Retirement wave among skilled workers
- Competition from tech sector for technical talent
- Geographic disparities in talent availability
- Successful workforce development models

Write 600-800 words in industry association report style. Use markdown formatting.`
  },
  {
    weekNumber: 2,
    title: "Gen Z in Manufacturing: What Young Workers Really Want",
    category: "analysis",
    source: "Industry Week",
    prompt: `Write an analysis of what Generation Z workers seek from manufacturing careers.

Cover:
- Career development expectations
- Work-life balance priorities
- Technology and innovation expectations
- Purpose and meaning in work
- Comparison to previous generations
- What successful manufacturers are doing differently

Write 500-700 words in trade publication style. Use markdown formatting.`
  },
  {
    weekNumber: 2,
    title: "Community College Partnerships: A Manufacturing Renaissance",
    category: "news",
    source: "Chronicle of Higher Education",
    prompt: `Write a news feature about successful community college-manufacturer partnerships.

Include:
- Specific partnership models that work
- Funding mechanisms and grant opportunities
- Curriculum co-development approaches
- Job placement success rates
- Quotes from industry and education leaders

Write 500-700 words in education journalism style. Use markdown formatting.`
  },

  // Week 3 Intel
  {
    weekNumber: 3,
    title: "Union Organizing Surges in Manufacturing Sector",
    category: "news",
    source: "Labor Notes",
    prompt: `Write a news article about the increase in union organizing in manufacturing.

Cover:
- Recent organizing victories and campaigns
- Drivers of increased worker interest
- Management response patterns
- Technology's role in organizing
- Expert analysis of the trend

Write 500-700 words in labor journalism style. Use markdown formatting.`
  },
  {
    weekNumber: 3,
    title: "Legal Landscape: What Managers Can and Cannot Say During Organizing",
    category: "analysis",
    source: "National Law Review",
    prompt: `Write a legal analysis of employer rights and restrictions during union organizing.

Include:
- TIPS framework (Threaten, Interrogate, Promise, Surveil)
- Recent NLRB rulings
- Captive audience meeting rules
- Common employer mistakes
- Best practices for legal compliance

Write 600-800 words in legal publication style. Use markdown formatting.`
  },
  {
    weekNumber: 3,
    title: "Case Study: When Automation and Unionization Collide",
    category: "academic",
    source: "MIT Sloan Management Review",
    prompt: `Write an academic case study analysis of companies that faced unionization during automation initiatives.

Include:
- AutoTech Industries: aggressive automation, faced strikes
- PrecisionParts Co.: balanced approach, won Best Employer
- Lessons for managing both simultaneously
- Framework for stakeholder management
- Research-based recommendations

Write 700-900 words in MIT Sloan case study style. Use markdown formatting.`
  },

  // Week 4 Intel
  {
    weekNumber: 4,
    title: "The Human Side of Layoffs: Best Practices for Workforce Reduction",
    category: "academic",
    source: "Academy of Management Perspectives",
    prompt: `Write an academic perspective on humane workforce reduction practices.

Cover:
- Research on survivor syndrome
- Impact of process on remaining workforce
- Severance and outplacement effectiveness
- Communication strategies
- Long-term reputation effects

Write 600-800 words in academic management style. Use markdown formatting.`
  },
  {
    weekNumber: 4,
    title: "Community Impact: When Major Employers Downsize",
    category: "analysis",
    source: "Brookings Institution",
    prompt: `Write a policy analysis of community impacts when major employers reduce workforce.

Include:
- Economic multiplier effects
- Social service strain
- Property value impacts
- Community resilience factors
- Policy recommendations for mitigation

Write 600-800 words in policy research style. Use markdown formatting.`
  },
  {
    weekNumber: 4,
    title: "Opinion: Retraining Programs Are a Myth",
    category: "opinion",
    source: "The Atlantic",
    prompt: `Write a provocative opinion piece challenging the effectiveness of corporate retraining programs.

Include:
- Statistics on retraining program outcomes
- Critique of corporate promises
- Alternative approaches
- What workers really need
- Call to action for systemic change

Write 500-700 words in Atlantic opinion style - thoughtful, provocative, well-argued. Use markdown formatting.`
  },

  // Week 5 Intel
  {
    weekNumber: 5,
    title: "Manager Burnout Epidemic: The Hidden Casualty of Transformation",
    category: "analysis",
    source: "Harvard Business Review",
    prompt: `Write an HBR analysis of middle manager burnout during organizational transformation.

Cover:
- Research on manager stress during change
- Caught between leadership and workforce
- Span of control challenges
- Support systems that work
- Warning signs and interventions

Write 600-800 words in HBR style. Use markdown formatting.`
  },
  {
    weekNumber: 5,
    title: "Why Gen Z Won't Become Managers",
    category: "analysis",
    source: "Fast Company",
    prompt: `Write a Fast Company style analysis of Gen Z reluctance to pursue management roles.

Include:
- Survey data on management interest
- Values driving the trend
- Impact on leadership pipelines
- Companies adapting successfully
- New models of leadership

Write 500-700 words in Fast Company business culture style. Use markdown formatting.`
  },
  {
    weekNumber: 5,
    title: "Flat Organizations: Promise and Peril",
    category: "academic",
    source: "California Management Review",
    prompt: `Write an academic article analyzing flat organizational structures during transformation.

Cover:
- Research on organizational delayering
- Benefits and hidden costs
- Span of control research
- When flat works and when it fails
- Implementation recommendations

Write 600-800 words in academic management journal style. Use markdown formatting.`
  },

  // Week 6 Intel
  {
    weekNumber: 6,
    title: "Manufacturing Debt: Walking the Covenant Tightrope",
    category: "analysis",
    source: "CFO Magazine",
    prompt: `Write a CFO Magazine analysis of debt covenant management in manufacturing.

Include:
- Common manufacturing covenants
- Warning signs of covenant stress
- Negotiation strategies with lenders
- Case studies of successful restructuring
- Financial flexibility preservation

Write 600-800 words in CFO Magazine style. Use markdown formatting.`
  },
  {
    weekNumber: 6,
    title: "Sale-Leaseback Transactions: A Double-Edged Sword",
    category: "industry",
    source: "Journal of Corporate Finance",
    prompt: `Write a financial analysis of sale-leaseback transactions in manufacturing.

Cover:
- Mechanics and accounting treatment (ASC 842)
- Advantages for liquidity-constrained firms
- Long-term cost implications
- Impact on future flexibility
- When to consider and when to avoid

Write 600-800 words in finance journal style. Use markdown formatting.`
  },
  {
    weekNumber: 6,
    title: "Opinion: The Transformation Trap",
    category: "opinion",
    source: "Fortune",
    prompt: `Write a Fortune opinion piece about companies that overcommit to transformation.

Include:
- Examples of transformation overreach
- Sunk cost fallacy in strategy
- Signs of healthy vs. unhealthy commitment
- When to pivot or pause
- Advice for CEOs facing the decision

Write 500-700 words in Fortune opinion style. Use markdown formatting.`
  },

  // Week 7 Intel
  {
    weekNumber: 7,
    title: "Customer Concentration Risk: Lessons from Manufacturing Failures",
    category: "analysis",
    source: "Strategy+Business",
    prompt: `Write a Strategy+Business analysis of customer concentration risk in manufacturing.

Include:
- Case studies of concentration-driven failures
- Metrics and warning signs
- Diversification strategies
- Balancing key account relationships with risk
- Board-level governance recommendations

Write 600-800 words in S+B style. Use markdown formatting.`
  },
  {
    weekNumber: 7,
    title: "Employer Branding in Manufacturing: Can You Compete with Tech?",
    category: "industry",
    source: "HR Executive",
    prompt: `Write an HR Executive article about employer branding challenges in manufacturing.

Cover:
- Perception gap between manufacturing and tech
- Successful rebranding case studies
- Social media and recruitment strategies
- Employee advocacy programs
- Measuring employer brand ROI

Write 500-700 words in HR trade publication style. Use markdown formatting.`
  },
  {
    weekNumber: 7,
    title: "Industry Analysts: How Their Reports Move Markets",
    category: "analysis",
    source: "Financial Times",
    prompt: `Write an FT analysis of how industry analyst coverage affects manufacturing companies.

Include:
- How analysts evaluate manufacturers
- Impact of coverage on customer decisions
- Managing analyst relationships
- The self-fulfilling prophecy problem
- Best practices for investor relations

Write 500-700 words in Financial Times analytical style. Use markdown formatting.`
  },

  // Week 8 Intel
  {
    weekNumber: 8,
    title: "Long-Term Strategy in Short-Term Markets",
    category: "academic",
    source: "Strategic Management Journal",
    prompt: `Write an academic article on balancing long-term strategy with short-term pressures.

Cover:
- Research on time horizon effects
- Stakeholder capitalism vs. shareholder primacy
- Board governance and long-term thinking
- Metrics that encourage strategic patience
- Framework for temporal strategic alignment

Write 700-900 words in academic strategy journal style. Use markdown formatting.`
  },
  {
    weekNumber: 8,
    title: "The PE Exit Playbook: What Happens After the Sale",
    category: "analysis",
    source: "Institutional Investor",
    prompt: `Write an Institutional Investor analysis of private equity exits in manufacturing.

Include:
- Typical PE holding periods and exit strategies
- Impact on workforce and operations
- Case studies of post-exit outcomes
- Due diligence considerations for sellers
- Protecting stakeholder interests in negotiations

Write 600-800 words in institutional finance publication style. Use markdown formatting.`
  },
  {
    weekNumber: 8,
    title: "Legacy Leadership: What Will You Be Remembered For?",
    category: "opinion",
    source: "CEO Magazine",
    prompt: `Write a reflective CEO Magazine piece about leadership legacy during transformation.

Include:
- Different dimensions of CEO legacy
- Balancing stakeholder interests
- Long-term thinking frameworks
- Lessons from leaders who got it right (and wrong)
- Questions every transformational leader should ask

Write 500-700 words in executive reflection style. Use markdown formatting.`
  }
];

function loadCanonicalData(): CanonicalData {
  const canonicalPath = path.join(process.cwd(), 'docs', 'canonical.json');
  const content = fs.readFileSync(canonicalPath, 'utf-8');
  return JSON.parse(content);
}

async function generateArticle(article: IntelArticle, canon: CanonicalData): Promise<string> {
  const week = canon.weeks.find(w => w.number === article.weekNumber);
  
  const contextPrompt = `You are writing content for an MBA-level business simulation. The simulation is about ${canon.company.name}, a ${canon.company.industry} company with ${canon.company.employees} employees and $${(canon.company.annualRevenue / 1000000).toFixed(0)}M revenue, navigating AI transformation.

Week ${article.weekNumber} Theme: ${week?.title} - ${week?.theme}

COMPETITORS TO REFERENCE (if relevant):
${canon.competitors.map(c => `- ${c.name}: ${c.approach} approach, ${c.outcome}`).join('\n')}

Write the following article:

Title: ${article.title}
Source: ${article.source}
Category: ${article.category}

${article.prompt}

The article should feel like genuine business journalism/research that provides valuable context for students making decisions in the simulation. It should be relevant to Week ${article.weekNumber}'s themes but not directly reference ${canon.company.name} (as this is external reading material).

Include the article title and source byline at the beginning.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are an expert business journalist and academic writer who creates authentic, insightful content for MBA students. Your writing matches the style and depth of leading business publications.'
      },
      { role: 'user', content: contextPrompt }
    ],
    temperature: 0.7,
    max_tokens: 1500,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error(`No content generated for ${article.title}`);
  }
  return content;
}

async function main() {
  console.log('Loading canonical data...\n');
  const canon = loadCanonicalData();

  console.log(`Company: ${canon.company.name}`);
  console.log(`Intel articles to generate: ${intelArticles.length}\n`);

  const existingIntel = await db
    .select()
    .from(simulationContent)
    .where(
      and(
        eq(simulationContent.moduleId, MODULE_ID),
        eq(simulationContent.contentType, 'intel')
      )
    );

  const existingTitles = new Set(existingIntel.map(i => i.title));
  console.log(`Existing intel articles: ${existingTitles.size}\n`);

  let generated = 0;
  for (const article of intelArticles) {
    if (existingTitles.has(article.title)) {
      console.log(`[SKIP] Week ${article.weekNumber}: ${article.title.substring(0, 50)}...`);
      continue;
    }

    try {
      console.log(`Generating Week ${article.weekNumber}: ${article.title.substring(0, 50)}...`);
      const content = await generateArticle(article, canon);

      await db.insert(simulationContent).values({
        id: crypto.randomUUID(),
        moduleId: MODULE_ID,
        weekNumber: article.weekNumber,
        contentType: 'intel',
        title: article.title,
        content: content,
        order: generated + 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log(`  Saved (${content.length} chars)`);
      generated++;
    } catch (error) {
      console.error(`  ERROR generating ${article.title}:`, error);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`Intel article generation complete!`);
  console.log(`Generated: ${generated} new articles`);
  console.log('='.repeat(50));
}

main().catch(console.error);
