import { driver, DriveStep, Driver } from "driver.js";
import "driver.js/dist/driver.css";

export interface TourConfig {
  steps: DriveStep[];
  onComplete?: () => void;
  onSkip?: () => void;
  storageKey?: string;
}

// Sample decision question for the tour
export const SAMPLE_QUESTION = {
  question: `Given the current workforce anxiety levels (7.2/10) and the potential 15% efficiency gains from AI automation, should Apex Manufacturing proceed with Phase 1 AI implementation on the assembly line?

Consider:
• Financial impact on quarterly projections
• Employee morale and retention risks
• Union relations and communication strategy
• Competitive pressure from industry peers

Explain your reasoning in 2-3 paragraphs.`,
  modelAnswer: `I recommend proceeding with Phase 1 implementation, but with a carefully phased approach that prioritizes transparent communication and workforce development.

The 15% efficiency gain is compelling from a financial standpoint and necessary to remain competitive. However, the high anxiety score (7.2/10) signals that rushing implementation could trigger talent flight and union pushback, ultimately costing more than the efficiency gains. I would allocate 20% of projected savings toward a comprehensive retraining program, giving affected workers a path to higher-value roles.

My implementation plan: First, hold town halls with union leadership to preview the changes and gather feedback. Second, identify 10-15 employees for pilot training in AI oversight roles. Third, implement Phase 1 in a single production line while monitoring both efficiency metrics and employee sentiment weekly. This balanced approach demonstrates executive judgment—pursuing innovation while protecting our most valuable asset: our workforce.`
};

const STUDENT_TOUR_KEY = "fwa_student_tour_completed";
const INSTRUCTOR_TOUR_KEY = "fwa_instructor_tour_completed";

export function hasStudentTourBeenCompleted(): boolean {
  return localStorage.getItem(STUDENT_TOUR_KEY) === "true";
}

export function hasInstructorTourBeenCompleted(): boolean {
  return localStorage.getItem(INSTRUCTOR_TOUR_KEY) === "true";
}

export function hasTourBeenCompleted(): boolean {
  return hasStudentTourBeenCompleted();
}

export function markStudentTourCompleted(): void {
  localStorage.setItem(STUDENT_TOUR_KEY, "true");
}

export function markInstructorTourCompleted(): void {
  localStorage.setItem(INSTRUCTOR_TOUR_KEY, "true");
}

export function markTourCompleted(): void {
  markStudentTourCompleted();
}

export function resetStudentTourProgress(): void {
  localStorage.removeItem(STUDENT_TOUR_KEY);
}

export function resetInstructorTourProgress(): void {
  localStorage.removeItem(INSTRUCTOR_TOUR_KEY);
}

export function resetTourProgress(): void {
  resetStudentTourProgress();
}

export function resetAllTourProgress(): void {
  resetStudentTourProgress();
  resetInstructorTourProgress();
}

export const dashboardTourSteps: DriveStep[] = [
  {
    element: '[data-testid="img-sidebar-logo"]',
    popover: {
      title: "Welcome to Future Work Academy",
      description: "This is your command center for navigating the AI workforce transformation simulation. Let's take a quick tour of the key areas.",
      side: "right",
      align: "start",
    },
  },
  {
    element: '[data-testid="financial-score"]',
    popover: {
      title: "Financial Performance",
      description: "Track your company's financial health. Your decisions directly impact revenue, costs, and profitability. Aim to grow while managing expenses wisely.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: '[data-testid="cultural-score"]',
    popover: {
      title: "Cultural Health",
      description: "Monitor employee morale and organizational culture. AI adoption affects your workforce differently—manage anxiety and build trust for long-term success.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: '[data-testid="combined-score"]',
    popover: {
      title: "Combined Score",
      description: "This is your overall performance metric. Balance financial success with cultural health to climb the leaderboard and demonstrate executive leadership.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: '[data-testid="button-start-week"]',
    popover: {
      title: "Start Your Week",
      description: "Each simulation week presents new challenges. Click here to read your weekly intelligence briefing and begin making strategic decisions.",
      side: "left",
      align: "center",
    },
  },
  {
    element: '[data-testid="nav-leaderboard"]',
    popover: {
      title: "Competitive Leaderboard",
      description: "See how your team ranks against others. The simulation encourages healthy competition while learning executive decision-making skills.",
      side: "right",
      align: "center",
    },
  },
  {
    element: '[data-testid="nav-phone-a-friend"]',
    popover: {
      title: "Phone-a-Friend Advisors",
      description: "Stuck on a tough decision? Consult AI-powered advisors for strategic guidance. They offer different perspectives based on their expertise areas.",
      side: "right",
      align: "center",
    },
  },
  {
    popover: {
      title: "Ready to Begin!",
      description: "You're all set to experience the simulation. Click 'Start Week' to read your first briefing, or use the 'Ask Gemini' button (bottom right) if you have questions. Good luck, executive!",
      side: "top",
      align: "center",
    },
  },
];

export const briefingTourSteps: DriveStep[] = [
  {
    element: '[data-testid="briefing-page"]',
    popover: {
      title: "Intelligence Briefing",
      description: "This is your weekly intelligence briefing. Here you'll find critical information to inform your decisions. Read each section carefully.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: '[data-testid="card-situation-report"]',
    popover: {
      title: "Situation Report",
      description: "The SITREP provides context about what's happening at Apex Manufacturing this week. It sets the stage for your decisions.",
      side: "right",
      align: "start",
    },
  },
  {
    element: '[data-testid="card-stakeholder-pressures"]',
    popover: {
      title: "Stakeholder Pressures",
      description: "Different stakeholders have competing interests. Understanding their pressures helps you anticipate the impact of your choices.",
      side: "right",
      align: "start",
    },
  },
  {
    element: '[data-testid="card-key-question"]',
    popover: {
      title: "Key Question",
      description: "This is the central question you'll need to address this week. Your decisions should aim to resolve this strategic challenge.",
      side: "right",
      align: "start",
    },
  },
  {
    element: '[data-testid="button-go-to-decisions"]',
    popover: {
      title: "Make Decisions",
      description: "Once you've reviewed the briefing, proceed to make your strategic decisions. Each choice has consequences for both financial and cultural outcomes.",
      side: "top",
      align: "center",
    },
  },
];

export const decisionsTourSteps: DriveStep[] = [
  {
    element: '[data-testid="decisions-page"]',
    popover: {
      title: "Decision Center",
      description: "This is where you make strategic choices. Each decision is evaluated by AI for its reasoning quality, not just the option chosen.",
      side: "top",
      align: "center",
    },
  },
  {
    element: '[data-testid="step-indicator-0"]',
    popover: {
      title: "Decision Progress",
      description: "Track your progress through multiple decisions. Complete each one before submitting the week.",
      side: "bottom",
      align: "center",
    },
  },
];

export const instructorTourSteps: DriveStep[] = [
  {
    popover: {
      title: "Welcome to Your Instructor Console",
      description: `<div style="text-align:left; line-height:1.6;">
        This is your command center for managing the AI workforce transformation simulation.<br><br>
        <strong>What you'll learn:</strong><br>
        • Student enrollment & team management<br>
        • Simulation pacing controls<br>
        • AI-graded submission review<br>
        • Performance analytics dashboard
      </div>`,
      side: "bottom",
      align: "center",
    },
  },
  {
    element: '[data-testid="tab-students"]',
    popover: {
      title: "Student Management",
      description: `<div style="text-align:left; line-height:1.5;">
        <strong>Three enrollment options:</strong><br><br>
        1. <em>Self-Enrollment:</em> Share your class code—students register themselves<br>
        2. <em>Individual Add:</em> Manually add students with .edu email verification<br>
        3. <em>CSV Import:</em> Bulk import entire rosters with one file<br><br>
        Students receive SMS/email notifications when the simulation starts.
      </div>`,
      side: "bottom",
      align: "center",
    },
  },
  {
    element: '[data-testid="tab-teams"]',
    popover: {
      title: "Team Organization",
      description: `<div style="text-align:left; line-height:1.5;">
        <strong>Teams drive competition and collaboration:</strong><br><br>
        • Assign 3-5 students per team for optimal dynamics<br>
        • Each team shares decisions and scores together<br>
        • Leaderboard rankings foster healthy competition<br>
        • Teams can be auto-generated or manually assigned
      </div>`,
      side: "bottom",
      align: "center",
    },
  },
  {
    element: '[data-testid="tab-simulation"]',
    popover: {
      title: "Simulation Control Center",
      description: `<div style="text-align:left; line-height:1.5;">
        <strong>You control the pace:</strong><br><br>
        • <em>Start Simulation:</em> Launch Week 1 for all teams<br>
        • <em>Advance Week:</em> Move to the next week when ready<br>
        • <em>Pause/Resume:</em> Halt progress during holidays or exam periods<br><br>
        The 8-week simulation aligns with a typical semester—advance weekly or at your own pace.
      </div>`,
      side: "bottom",
      align: "center",
    },
  },
  {
    element: '[data-testid="tab-submissions"]',
    popover: {
      title: "AI-Graded Submissions",
      description: `<div style="text-align:left; line-height:1.5;">
        <strong>Every decision is evaluated by AI:</strong><br><br>
        • <em>Reasoning Quality:</em> Scored 1-10 for analytical depth<br>
        • <em>Stakeholder Awareness:</em> Did they consider all perspectives?<br>
        • <em>Strategic Thinking:</em> Short-term vs long-term balance<br><br>
        You can override AI scores and add personalized feedback.
      </div>`,
      side: "bottom",
      align: "center",
    },
  },
  {
    element: '[data-testid="tab-analytics"]',
    popover: {
      title: "Performance Analytics",
      description: `<div style="text-align:left; line-height:1.5;">
        <strong>Track class-wide patterns:</strong><br><br>
        • Team rankings by financial & cultural scores<br>
        • Week-over-week performance trends<br>
        • Common decision patterns across teams<br>
        • Engagement metrics (briefing reads, research views)<br><br>
        Use insights to guide classroom discussions.
      </div>`,
      side: "bottom",
      align: "center",
    },
  },
  {
    element: '[data-testid="button-student-preview"]',
    popover: {
      title: "Experience It Yourself",
      description: `<div style="text-align:left; line-height:1.5;">
        <strong>Student Preview Mode:</strong><br><br>
        Enter a sandbox environment to experience the simulation exactly as your students will see it:<br><br>
        • Read the intelligence briefings<br>
        • Make strategic decisions<br>
        • Consult AI advisors<br><br>
        Perfect for preparing discussion questions or troubleshooting issues.
      </div>`,
      side: "left",
      align: "center",
    },
  },
  {
    popover: {
      title: "You're Ready to Launch",
      description: `<div style="text-align:left; line-height:1.6;">
        <strong>Quick-start checklist:</strong><br><br>
        • Enroll students (share class code or import CSV)<br>
        • Organize into teams of 3-5<br>
        • Preview the student experience<br>
        • Start the simulation when ready<br><br>
        <strong>Need help?</strong> Click the "Ask Gemini" button (bottom right) for instant platform assistance.
      </div>`,
      side: "top",
      align: "center",
    },
  },
];

export function createTourDriver(config: TourConfig, markComplete: () => void = markTourCompleted): Driver {
  const driverObj = driver({
    showProgress: true,
    showButtons: ["next", "previous", "close"],
    steps: config.steps,
    nextBtnText: "Next →",
    prevBtnText: "← Back",
    doneBtnText: "Got it!",
    progressText: "{{current}} of {{total}}",
    popoverClass: "fwa-tour-popover",
    onDestroyStarted: () => {
      markComplete();
      if (config.onComplete) {
        config.onComplete();
      }
      driverObj.destroy();
    },
    onCloseClick: () => {
      markComplete();
      if (config.onSkip) {
        config.onSkip();
      }
      driverObj.destroy();
    },
  });
  
  return driverObj;
}

export function startDashboardTour(onComplete?: () => void, onSkip?: () => void): Driver {
  const driverObj = createTourDriver({
    steps: dashboardTourSteps,
    onComplete,
    onSkip,
  }, markStudentTourCompleted);
  
  driverObj.drive();
  return driverObj;
}

export function startInstructorTour(onComplete?: () => void, onSkip?: () => void): Driver {
  const driverObj = createTourDriver({
    steps: instructorTourSteps,
    onComplete,
    onSkip,
  }, markInstructorTourCompleted);
  
  driverObj.drive();
  return driverObj;
}

export function waitForElement(selector: string, timeout: number = 5000): Promise<Element> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const checkElement = () => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
        return;
      }
      
      if (Date.now() - startTime >= timeout) {
        reject(new Error(`Element ${selector} not found within ${timeout}ms`));
        return;
      }
      
      requestAnimationFrame(checkElement);
    };
    
    requestAnimationFrame(checkElement);
  });
}

// Show loading overlay during page transitions
function showLoadingOverlay(message: string = "Loading...") {
  const existing = document.getElementById("fwa-tour-loading");
  if (existing) existing.remove();
  
  const overlay = document.createElement("div");
  overlay.id = "fwa-tour-loading";
  overlay.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 999999;
    ">
      <div style="
        background: white;
        padding: 24px 32px;
        border-radius: 8px;
        text-align: center;
        box-shadow: 0 10px 25px rgba(0,0,0,0.3);
      ">
        <div style="
          width: 40px;
          height: 40px;
          border: 3px solid #e5e7eb;
          border-top-color: #1e3a5f;
          border-radius: 50%;
          margin: 0 auto 12px;
          animation: fwa-spin 1s linear infinite;
        "></div>
        <div style="color: #374151; font-size: 14px; font-weight: 500;">${message}</div>
      </div>
    </div>
    <style>
      @keyframes fwa-spin {
        to { transform: rotate(360deg); }
      }
    </style>
  `;
  document.body.appendChild(overlay);
}

function hideLoadingOverlay() {
  const overlay = document.getElementById("fwa-tour-loading");
  if (overlay) overlay.remove();
}

// Multi-page student tour with navigation
export async function startMultiPageStudentTour(
  navigate: (path: string) => void,
  onComplete?: () => void,
  onSkip?: () => void
): Promise<void> {
  const pages = ["dashboard", "briefing", "decisions", "analytics", "leaderboard"];
  
  const navigateToPage = async (page: string): Promise<boolean> => {
    const pageNames: Record<string, string> = {
      dashboard: "Dashboard",
      briefing: "Intelligence Briefing",
      decisions: "Decision Center",
      analytics: "People Analytics",
      leaderboard: "Leaderboard"
    };
    
    showLoadingOverlay(`Loading ${pageNames[page] || page}...`);
    
    switch (page) {
      case "dashboard":
        navigate("/");
        break;
      case "briefing":
        navigate("/briefing");
        break;
      case "decisions":
        navigate("/decisions");
        break;
      case "analytics":
        navigate("/analytics");
        break;
      case "leaderboard":
        navigate("/leaderboard");
        break;
    }
    // Wait for page to render
    await new Promise(resolve => setTimeout(resolve, 800));
    hideLoadingOverlay();
    return true;
  };

  const getStepsForPage = (page: string): DriveStep[] => {
    switch (page) {
      case "dashboard":
        return [
          {
            popover: {
              title: "Welcome to Future Work Academy",
              description: "You're about to step into the shoes of a CEO navigating AI transformation at Apex Manufacturing. This interactive tour will show you the key features of the simulation.",
              side: "bottom",
              align: "center",
            },
          },
          {
            element: '[data-testid="financial-score-card"]',
            popover: {
              title: "Financial Performance",
              description: "This tracks your company's financial health. Every strategic decision you make—from AI investments to workforce restructuring—directly impacts these numbers. Your goal: grow revenue while managing costs wisely.",
              side: "bottom",
              align: "center",
            },
          },
          {
            element: '[data-testid="cultural-score-card"]',
            popover: {
              title: "Cultural Health Score",
              description: "AI adoption affects your workforce. This score measures employee morale, trust, and organizational culture. Push too hard and you'll face resistance; move too slowly and competitors will overtake you.",
              side: "bottom",
              align: "center",
            },
          },
          {
            element: '[data-testid="combined-score-card"]',
            popover: {
              title: "Your Leadership Score",
              description: "This combined metric reflects true executive leadership—balancing short-term financial gains with long-term cultural sustainability. Top performers excel at both.",
              side: "bottom",
              align: "center",
            },
          },
          {
            popover: {
              title: "Next: Intelligence Briefing →",
              description: "Let's see what you'll read each week to inform your decisions. Click 'Next' to continue to the Briefing page.",
              side: "top",
              align: "center",
            },
          },
        ];
      
      case "briefing":
        return [
          {
            element: '[data-testid="briefing-page"]',
            popover: {
              title: "Weekly Intelligence Briefing",
              description: "Each week, you receive a detailed briefing with critical information about what's happening at Apex Manufacturing. This is your foundation for making informed decisions.",
              side: "top",
              align: "center",
            },
          },
          {
            element: '[data-testid="card-situation-report"]',
            popover: {
              title: "Situation Report (SITREP)",
              description: "The SITREP provides context: What happened this week? What's the current state of operations? What external pressures are you facing? Read this carefully—the details matter.",
              side: "right",
              align: "start",
            },
          },
          {
            element: '[data-testid="card-stakeholder-pressures"]',
            popover: {
              title: "Stakeholder Pressures",
              description: "Different stakeholders have competing interests: the board wants profits, employees want job security, unions demand transparency, customers expect quality. Understanding these tensions is key to effective leadership.",
              side: "right",
              align: "start",
            },
          },
          {
            popover: {
              title: "Next: Decision Center →",
              description: "Now let's see where you'll make your strategic choices—and preview a real simulation question. Click 'Next' to continue.",
              side: "top",
              align: "center",
            },
          },
        ];
      
      case "decisions":
        return [
          {
            element: '[data-testid="decisions-page"]',
            popover: {
              title: "Strategic Decision Center",
              description: "This is where the real work happens. Each week presents multiple decisions requiring careful analysis and clear reasoning.",
              side: "top",
              align: "center",
            },
          },
          {
            popover: {
              title: "Sample Question Preview",
              description: `<div style="text-align:left; font-size:13px; line-height:1.5;">
                <strong>Here's a real example of what students will answer:</strong><br><br>
                <div style="background:#f5f5f5; padding:12px; border-radius:6px; margin-bottom:12px; border-left:3px solid #1e3a5f;">
                  <em>"Given workforce anxiety levels (7.2/10) and potential 15% efficiency gains from AI automation, should Apex proceed with Phase 1 AI implementation on the assembly line?<br><br>
                  Consider: financial impact, employee morale risks, union relations, and competitive pressure.<br><br>
                  Explain your reasoning in 2-3 paragraphs."</em>
                </div>
                Questions require strategic thinking, not just picking an option. The AI evaluates reasoning quality and executive judgment.
              </div>`,
              side: "bottom",
              align: "center",
            },
          },
          {
            popover: {
              title: "Model Answer Example",
              description: `<div style="text-align:left; font-size:12px; line-height:1.5; max-height:280px; overflow-y:auto;">
                <strong>A high-scoring response demonstrates:</strong><br><br>
                <div style="background:#e8f5e9; padding:12px; border-radius:6px; border-left:3px solid #22c55e;">
                  <em>"I recommend proceeding with Phase 1, but with a carefully phased approach prioritizing transparent communication and workforce development.<br><br>
                  The 15% efficiency gain is compelling financially and necessary to remain competitive. However, the high anxiety score signals that rushing could trigger talent flight and union pushback. I would allocate 20% of projected savings toward retraining programs.<br><br>
                  My plan: (1) Hold town halls with union leadership; (2) Identify employees for AI oversight training; (3) Pilot in one production line while monitoring efficiency and sentiment weekly."</em>
                </div>
                <br>
                <strong>Key elements:</strong> Balanced reasoning, concrete action steps, stakeholder awareness, risk mitigation.
              </div>`,
              side: "bottom",
              align: "center",
            },
          },
          {
            popover: {
              title: "Next: People Analytics →",
              description: "Let's see the analytics dashboard where students can understand workforce data.",
              side: "top",
              align: "center",
            },
          },
        ];
      
      case "analytics":
        return [
          {
            element: '[data-testid="nav-people-analytics"]',
            popover: {
              title: "People Analytics",
              description: "This dashboard shows workforce data—department headcounts, tenure distribution, and AI exposure risk by role. Students use this data to inform their transformation decisions.",
              side: "right",
              align: "center",
            },
          },
          {
            popover: {
              title: "Data-Driven Decisions",
              description: "Effective leaders use data to anticipate how changes will affect different parts of the organization. This builds analytical skills essential for modern executives.",
              side: "top",
              align: "center",
            },
          },
          {
            popover: {
              title: "Next: Leaderboard →",
              description: "Finally, let's see how teams compete on the leaderboard.",
              side: "top",
              align: "center",
            },
          },
        ];
      
      case "leaderboard":
        return [
          {
            element: '[data-testid="nav-leaderboard"]',
            popover: {
              title: "Competitive Leaderboard",
              description: "Teams compete for the top spot based on both financial performance and cultural health. This dual-scoring system prevents 'win at all costs' thinking.",
              side: "right",
              align: "center",
            },
          },
          {
            popover: {
              title: "Healthy Competition",
              description: "The leaderboard fosters engagement while teaching that sustainable success requires balancing multiple stakeholder interests—just like real business.",
              side: "top",
              align: "center",
            },
          },
          {
            popover: {
              title: "Tour Complete",
              description: `<div style="text-align:left; line-height:1.6;">
                <strong>You've seen the student experience:</strong><br><br>
                • Dashboard with dual financial/cultural scoring<br>
                • Weekly intelligence briefings<br>
                • Strategic decision-making with AI evaluation<br>
                • Workforce analytics for informed choices<br>
                • Competitive leaderboard for engagement<br><br>
                <strong>Ready to try the Instructor Tour?</strong> Click the "Instructor Tour" button to see admin controls and classroom management features.
              </div>`,
              side: "top",
              align: "center",
            },
          },
        ];
      
      default:
        return [];
    }
  };

  const runPageTour = async (page: string): Promise<boolean> => {
    await navigateToPage(page);
    
    // Extra wait for page elements to render
    try {
      const waitSelector = page === "dashboard" 
        ? '[data-testid="financial-score-card"]'
        : page === "briefing"
        ? '[data-testid="briefing-page"]'
        : page === "decisions"
        ? '[data-testid="decisions-page"]'
        : page === "analytics"
        ? '[data-testid="nav-people-analytics"]'
        : '[data-testid="nav-leaderboard"]';
      
      await waitForElement(waitSelector, 3000);
    } catch (e) {
      // Continue anyway
    }

    return new Promise((resolve) => {
      const steps = getStepsForPage(page);
      const isLastPage = page === "leaderboard";
      
      const driverObj = driver({
        showProgress: true,
        showButtons: ["next", "previous", "close"],
        steps: steps,
        nextBtnText: isLastPage ? "Finish →" : "Next →",
        prevBtnText: "← Back",
        doneBtnText: "Got it!",
        progressText: `${page.charAt(0).toUpperCase() + page.slice(1).replace("-", " ")} • {{current}} of {{total}}`,
        popoverClass: "fwa-tour-popover",
        allowClose: true,
        onDestroyStarted: () => {
          driverObj.destroy();
          if (isLastPage) {
            markStudentTourCompleted();
            onComplete?.();
          }
          resolve(true);
        },
        onCloseClick: () => {
          driverObj.destroy();
          markStudentTourCompleted();
          onSkip?.();
          resolve(false);
        },
      });
      
      driverObj.drive();
    });
  };

  // Run through each page
  for (const page of pages) {
    const shouldContinue = await runPageTour(page);
    if (!shouldContinue) break;
  }
}
