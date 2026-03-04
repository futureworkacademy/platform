import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Phone,
  Users,
  Building2,
  Lightbulb,
  Briefcase,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { AdvisorPlayer } from "./advisor-player";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface Advisor {
  id: string;
  name: string;
  category: string;
  title: string;
  organization: string;
  specialty: string;
  bio: string;
  keyInsights: string[];
  headshotUrl: string | null;
  hasAudio: string | null;
}

interface AdvisorsResponse {
  advisors: Advisor[];
  byCategory: {
    consultant: Advisor[];
    industry_expert: Advisor[];
    thought_leader: Advisor[];
  };
}

interface AdvisorCallsResponse {
  calls: { advisorId: string; weekNumber: number; calledAt: string }[];
}

interface AdvisorPickerProps {
  isOpen: boolean;
  onClose: () => void;
  creditsRemaining: number;
}

const categoryConfig = {
  consultant: {
    label: "Strategy Consultants",
    icon: Briefcase,
    description: "Expert guidance on AI transformation strategy and implementation",
  },
  industry_expert: {
    label: "Industry Experts",
    icon: Building2,
    description: "Real-world manufacturing and business leadership experience",
  },
  thought_leader: {
    label: "Thought Leaders",
    icon: Lightbulb,
    description: "Forward-thinking perspectives on AI ethics and the future of work",
  },
};

function AdvisorCard({ 
  advisor, 
  isCalled, 
  canCall, 
  isExpanded, 
  onToggleBio, 
  onCall, 
  isCallPending 
}: { 
  advisor: Advisor; 
  isCalled: boolean; 
  canCall: boolean; 
  isExpanded: boolean; 
  onToggleBio: () => void; 
  onCall: () => void; 
  isCallPending: boolean; 
}) {
  return (
    <Card 
      className={`hover-elevate transition-colors ${!canCall ? 'opacity-60' : ''}`}
      data-testid={`card-advisor-${advisor.id}`}
    >
      <CardContent className="p-4">
        <div className="flex gap-4">
          <Avatar className="w-16 h-16 border-2 border-primary/20 shrink-0">
            <AvatarImage src={advisor.headshotUrl || undefined} />
            <AvatarFallback className="text-lg bg-primary/10">
              {advisor.name.split(" ").map(n => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  {advisor.name}
                  {isCalled && (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  )}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {advisor.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {advisor.organization}
                </p>
              </div>
              <Badge variant="secondary" className="shrink-0">
                {advisor.specialty}
              </Badge>
            </div>
            
            <div className="mt-2">
              <p className={`text-sm text-muted-foreground ${isExpanded ? '' : 'line-clamp-2'}`}>
                {advisor.bio}
              </p>
              <button
                onClick={onToggleBio}
                className="text-xs text-primary mt-1 flex items-center gap-0.5"
                data-testid={`button-expand-bio-${advisor.id}`}
              >
                {isExpanded ? (
                  <>Show less <ChevronUp className="w-3 h-3" /></>
                ) : (
                  <>Read more <ChevronDown className="w-3 h-3" /></>
                )}
              </button>
            </div>
            
            <div className="flex flex-wrap gap-1.5 mt-2">
              {advisor.keyInsights?.slice(0, 3).map((insight, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {insight}
                </Badge>
              ))}
            </div>

            <div className="flex justify-end mt-3">
              <Button
                size="sm"
                onClick={onCall}
                disabled={!canCall || isCallPending}
                data-testid={`button-call-advisor-${advisor.id}`}
              >
                <Phone className="w-4 h-4 mr-1" />
                {isCalled ? "Listen Again" : "Call Advisor"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AdvisorPicker({ isOpen, onClose, creditsRemaining }: AdvisorPickerProps) {
  const [selectedAdvisor, setSelectedAdvisor] = useState<string | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [expandedBios, setExpandedBios] = useState<Set<string>>(new Set());

  const { data: advisorsData, isLoading: advisorsLoading, isError: advisorsError, refetch: refetchAdvisors } = useQuery<AdvisorsResponse>({
    queryKey: ["/api/advisors"],
    enabled: isOpen,
    staleTime: 0,
    retry: 2,
  });

  const { data: callsData } = useQuery<AdvisorCallsResponse>({
    queryKey: ["/api/advisor-calls"],
    enabled: isOpen,
  });

  const callMutation = useMutation({
    mutationFn: async (advisorId: string) => {
      const res = await apiRequest("POST", "/api/advisor-calls", { advisorId });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/advisor-calls"] });
      queryClient.invalidateQueries({ queryKey: ["/api/team"] });
    },
  });

  const calledAdvisorIds = new Set(callsData?.calls?.map(c => c.advisorId) || []);

  const handleCallAdvisor = async (advisorId: string) => {
    setSelectedAdvisor(advisorId);
    
    if (calledAdvisorIds.has(advisorId)) {
      setShowPlayer(true);
      return;
    }

    try {
      await callMutation.mutateAsync(advisorId);
      setShowPlayer(true);
    } catch (error) {
      console.error("Failed to call advisor:", error);
    }
  };

  const handleClosePlayer = () => {
    setShowPlayer(false);
    setSelectedAdvisor(null);
  };

  const toggleBio = (advisorId: string) => {
    setExpandedBios(prev => {
      const next = new Set(prev);
      if (next.has(advisorId)) next.delete(advisorId);
      else next.add(advisorId);
      return next;
    });
  };

  if (showPlayer && selectedAdvisor) {
    return (
      <AdvisorPlayer
        advisorId={selectedAdvisor}
        onClose={handleClosePlayer}
        onBack={() => setShowPlayer(false)}
      />
    );
  }

  const totalAdvisors = advisorsData?.advisors?.length ?? 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[85vh] p-0 gap-0 flex flex-col overflow-hidden" data-testid="dialog-advisor-picker">
        <div className="bg-gradient-to-b from-primary/10 to-background p-6 pb-4 shrink-0">
          <DialogHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-primary" />
                <DialogTitle className="text-xl">Phone an Advisor</DialogTitle>
              </div>
              <Badge variant="outline" className="gap-1.5">
                <Users className="w-3 h-3" />
                {creditsRemaining} credit{creditsRemaining !== 1 ? 's' : ''} remaining
              </Badge>
            </div>
            <DialogDescription className="text-muted-foreground">
              Get expert guidance from industry professionals. Each call uses 1 credit. 
              Advisors you've already called can be replayed at no cost.
            </DialogDescription>
          </DialogHeader>
        </div>

        {advisorsLoading ? (
          <div className="flex-1 p-6 space-y-4" data-testid="advisor-loading">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 rounded-full bg-muted shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-muted rounded w-32" />
                      <div className="h-4 bg-muted rounded w-48" />
                      <div className="h-4 bg-muted rounded w-full" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : advisorsError ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center" data-testid="advisor-error">
            <AlertCircle className="w-12 h-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">Unable to Load Advisors</h3>
            <p className="text-muted-foreground mb-4 max-w-sm">
              There was a problem loading the advisor directory. Please try again.
            </p>
            <Button variant="outline" onClick={() => refetchAdvisors()} data-testid="button-retry-advisors">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        ) : totalAdvisors === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center" data-testid="advisor-empty">
            <Users className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Advisors Available</h3>
            <p className="text-muted-foreground max-w-sm">
              The advisor directory is currently empty. Please check back later.
            </p>
          </div>
        ) : (
          <Tabs defaultValue="consultant" className="flex-1 flex flex-col min-h-0">
            <div className="px-6 border-b shrink-0">
              <TabsList className="w-full justify-start h-auto p-0 bg-transparent gap-6">
                {Object.entries(categoryConfig).map(([key, config]) => {
                  const count = advisorsData?.byCategory[key as keyof typeof advisorsData.byCategory]?.length ?? 0;
                  return (
                    <TabsTrigger
                      key={key}
                      value={key}
                      className="gap-2 py-3 px-0 border-b-2 border-transparent data-[state=active]:border-primary rounded-none bg-transparent"
                      data-testid={`tab-${key}`}
                    >
                      <config.icon className="w-4 h-4" />
                      {config.label}
                      <Badge variant="secondary" className="ml-1 text-xs">{count}</Badge>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto">
              <div className="p-6">
                {Object.entries(categoryConfig).map(([key, config]) => {
                  const categoryAdvisors = advisorsData?.byCategory[key as keyof typeof advisorsData.byCategory] ?? [];
                  return (
                    <TabsContent key={key} value={key} className="mt-0 space-y-4 data-[state=inactive]:hidden" forceMount>
                      <p className="text-sm text-muted-foreground mb-4">
                        {config.description}
                      </p>
                      {categoryAdvisors.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic py-4 text-center">
                          No advisors in this category yet.
                        </p>
                      ) : (
                        categoryAdvisors.map((advisor) => (
                          <AdvisorCard
                            key={advisor.id}
                            advisor={advisor}
                            isCalled={calledAdvisorIds.has(advisor.id)}
                            canCall={creditsRemaining > 0 || calledAdvisorIds.has(advisor.id)}
                            isExpanded={expandedBios.has(advisor.id)}
                            onToggleBio={() => toggleBio(advisor.id)}
                            onCall={() => handleCallAdvisor(advisor.id)}
                            isCallPending={callMutation.isPending}
                          />
                        ))
                      )}
                    </TabsContent>
                  );
                })}
              </div>
            </div>
          </Tabs>
        )}

        <div className="p-4 border-t bg-muted/30 flex justify-end shrink-0">
          <Button variant="outline" onClick={onClose} data-testid="button-close-picker">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
