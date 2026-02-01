import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { hasTourBeenCompleted, resetTourProgress, startMultiPageStudentTour } from "@/lib/demo-tour";

interface DemoTourContextType {
  isDemoUser: boolean;
  isTourActive: boolean;
  hasCompletedTour: boolean;
  startTour: () => void;
  resetTour: () => void;
}

const DemoTourContext = createContext<DemoTourContextType>({
  isDemoUser: false,
  isTourActive: false,
  hasCompletedTour: false,
  startTour: () => {},
  resetTour: () => {},
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
}

export function DemoTourProvider({ children }: DemoTourProviderProps) {
  const [isTourActive, setIsTourActive] = useState(false);
  const [hasCompletedTour, setHasCompletedTour] = useState(hasTourBeenCompleted());
  const [, setLocation] = useLocation();

  const { data: user } = useQuery<UserData>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  const isDemoUser = user?.demoAccess === "evaluator";

  useEffect(() => {
    if (isDemoUser && !hasCompletedTour && !isTourActive) {
      const timer = setTimeout(() => {
        startTour();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isDemoUser, hasCompletedTour, isTourActive]);

  const startTour = async () => {
    setIsTourActive(true);
    await startMultiPageStudentTour(
      setLocation,
      () => {
        setIsTourActive(false);
        setHasCompletedTour(true);
      },
      () => {
        setIsTourActive(false);
        setHasCompletedTour(true);
      }
    );
  };

  const resetTour = () => {
    resetTourProgress();
    setHasCompletedTour(false);
  };

  return (
    <DemoTourContext.Provider
      value={{
        isDemoUser,
        isTourActive,
        hasCompletedTour,
        startTour,
        resetTour,
      }}
    >
      {children}
    </DemoTourContext.Provider>
  );
}
