import { driver, DriveStep, Driver } from "driver.js";
import "driver.js/dist/driver.css";

export interface TourConfig {
  steps: DriveStep[];
  onComplete?: () => void;
  onSkip?: () => void;
  storageKey?: string;
}

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
      title: "Welcome, Instructor!",
      description: "This is your Instructor Console where you'll manage your simulation. Let's walk through the key features you'll use to run a successful course.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: '[data-testid="tab-students"]',
    popover: {
      title: "Student Management",
      description: "View and manage all enrolled students. You can add students individually, import via CSV, or have them self-enroll using your class code.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: '[data-testid="tab-teams"]',
    popover: {
      title: "Team Organization",
      description: "Organize students into teams. Teams compete against each other, fostering collaboration and healthy competition.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: '[data-testid="tab-simulation"]',
    popover: {
      title: "Simulation Control",
      description: "Start, pause, and advance the simulation week by week. You control the pace to align with your course schedule.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: '[data-testid="tab-submissions"]',
    popover: {
      title: "Review Submissions",
      description: "View student decisions and AI-graded responses. Each submission shows reasoning quality scores and detailed feedback.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: '[data-testid="tab-analytics"]',
    popover: {
      title: "Performance Analytics",
      description: "Track class-wide performance with charts and metrics. Identify trends and areas where students may need guidance.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: '[data-testid="button-student-preview"]',
    popover: {
      title: "Student Preview Mode",
      description: "Experience the simulation exactly as your students see it. This creates a test student account so you can walk through briefings and decisions.",
      side: "left",
      align: "center",
    },
  },
  {
    popover: {
      title: "Ready to Run Your Simulation!",
      description: "You now have the tools to manage a successful simulation. Add students, organize teams, and when ready, start the simulation. Students will receive their first intelligence briefing immediately.",
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
