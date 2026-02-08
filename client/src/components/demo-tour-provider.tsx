import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { hasTourBeenCompleted, resetTourProgress, startMultiPageStudentTour } from "@/lib/demo-tour";
import { EducatorCtaModal } from "./educator-cta-modal";

interface DemoTourContextType {
  isDemoUser: boolean;
  isTourActive: boolean;
  hasCompletedTour: boolean;
  startTour: () => void;
  resetTour: () => void;
  showCtaModal: () => void;
}

const DemoTourContext = createContext<DemoTourContextType>({
  isDemoUser: false,
  isTourActive: false,
  hasCompletedTour: false,
  startTour: () => {},
  resetTour: () => {},
  showCtaModal: () => {},
});

export function useDemoTour() {
  return useContext(DemoTourContext);
}

interface DemoTourProviderProps {
  children: ReactNode;
}

interface UserData {
  id: string;
  email?: string;
  organizationCode?: string;
  role?: string;
  demoAccess?: string;
  isTestStudent?: boolean;
  inDemoPreview?: boolean;
}

export function DemoTourProvider({ children }: DemoTourProviderProps) {
  const [isTourActive, setIsTourActive] = useState(false);
  const [hasCompletedTour, setHasCompletedTour] = useState(hasTourBeenCompleted());
  const [ctaModalOpen, setCtaModalOpen] = useState(false);
  const [location, setLocation] = useLocation();

  const { data: user } = useQuery<UserData>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  // Show tour for evaluators, student trial users, OR users in demo preview mode (super admins testing)
  const isDemoUser = user?.demoAccess === "evaluator" || user?.demoAccess === "student_trial" || user?.inDemoPreview === true;

  useEffect(() => {
    if (isDemoUser && !hasCompletedTour && !isTourActive) {
      const timer = setTimeout(() => {
        startTour();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isDemoUser, hasCompletedTour, isTourActive]);

  const handleTourComplete = () => {
    setIsTourActive(false);
    setHasCompletedTour(true);
    if (isDemoUser) {
      setCtaModalOpen(true);
    }
  };

  const startTour = async () => {
    setIsTourActive(true);
    await startMultiPageStudentTour(
      setLocation,
      handleTourComplete,
      handleTourComplete
    );
  };

  const resetTour = () => {
    resetTourProgress();
    setHasCompletedTour(false);
  };

  const showCtaModal = () => {
    setCtaModalOpen(true);
  };

  const handleContactUs = () => {
    setLocation("/for-educators");
  };

  const ctaUserType: "evaluator" | "student_trial" | "preview" = 
    user?.demoAccess === "student_trial" ? "student_trial" :
    user?.inDemoPreview ? "preview" : "evaluator";

  return (
    <DemoTourContext.Provider
      value={{
        isDemoUser,
        isTourActive,
        hasCompletedTour,
        startTour,
        resetTour,
        showCtaModal,
      }}
    >
      {children}
      <EducatorCtaModal
        open={ctaModalOpen}
        onOpenChange={setCtaModalOpen}
        userType={ctaUserType}
        onContactUs={handleContactUs}
      />
    </DemoTourContext.Provider>
  );
}
