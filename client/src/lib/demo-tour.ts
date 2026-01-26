import { driver, DriveStep, Driver } from "driver.js";
import "driver.js/dist/driver.css";

export interface TourConfig {
  steps: DriveStep[];
  onComplete?: () => void;
  onSkip?: () => void;
}

const TOUR_STORAGE_KEY = "fwa_demo_tour_completed";

export function hasTourBeenCompleted(): boolean {
  return localStorage.getItem(TOUR_STORAGE_KEY) === "true";
}

export function markTourCompleted(): void {
  localStorage.setItem(TOUR_STORAGE_KEY, "true");
}

export function resetTourProgress(): void {
  localStorage.removeItem(TOUR_STORAGE_KEY);
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

export function createTourDriver(config: TourConfig): Driver {
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
      markTourCompleted();
      if (config.onComplete) {
        config.onComplete();
      }
      driverObj.destroy();
    },
    onCloseClick: () => {
      markTourCompleted();
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
  });
  
  driverObj.drive();
  return driverObj;
}
