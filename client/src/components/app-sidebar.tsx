import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard,
  FileText,
  Settings,
  Trophy,
  BarChart3,
  Info,
  Medal,
  User,
  Shield,
  ClipboardCheck,
  PlayCircle,
} from "lucide-react";
import { useDemoTour } from "@/components/demo-tour-provider";
import { Button } from "@/components/ui/button";
import logo from "@assets/logo-icon-light.png";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface LeaderboardEntry {
  rank: number;
  teamId: string;
  teamName: string;
  financialScore: number;
  culturalScore: number;
  combinedScore: number;
  week: number;
}

const navigationItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Intelligence Briefing",
    url: "/briefing",
    icon: FileText,
  },
  {
    title: "Decisions",
    url: "/decisions",
    icon: Settings,
  },
  {
    title: "People Analytics",
    url: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Week Results",
    url: "/week-results",
    icon: ClipboardCheck,
  },
  {
    title: "Leaderboard",
    url: "/leaderboard",
    icon: Trophy,
  },
  {
    title: "About FWA",
    url: "/about",
    icon: Info,
  },
  {
    title: "Profile",
    url: "/profile",
    icon: User,
  },
];

interface AppSidebarProps {
  currentWeek: number;
  totalWeeks: number;
  teamName: string;
  isAdmin?: boolean;
}

export function AppSidebar({ currentWeek, totalWeeks, teamName, isAdmin = false }: AppSidebarProps) {
  const [location] = useLocation();
  const { isDemoUser, startTour, resetTour } = useDemoTour();
  
  const { data: leaderboard, isLoading: leaderboardLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ["/api/leaderboard"],
  });

  const topThree = leaderboard?.slice(0, 3) || [];

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <Link href="/">
          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-md px-3 py-2">
            <img 
              src={logo} 
              alt="Future Work Academy" 
              className="h-10 w-auto cursor-pointer"
              data-testid="img-sidebar-logo"
            />
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground px-4">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location === "/admin"}
                    data-testid="nav-admin"
                  >
                    <Link href="/admin">
                      <Shield className="h-4 w-4" />
                      <span>Admin Panel</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground px-4 flex items-center gap-2">
            <Trophy className="h-3 w-3" />
            Leaderboard
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-4">
            {leaderboardLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : topThree.length > 0 ? (
              <div className="space-y-2">
                {topThree.map((entry, idx) => (
                  <div
                    key={entry.teamId}
                    className={`flex items-center justify-between p-2 rounded-md text-xs ${
                      entry.teamName === teamName
                        ? "bg-sidebar-accent border border-sidebar-border"
                        : "bg-sidebar-accent/50"
                    }`}
                    data-testid={`sidebar-leaderboard-${idx}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${
                        idx === 0 ? "text-accent" :
                        idx === 1 ? "text-muted-foreground" :
                        "text-muted-foreground"
                      }`}>
                        {idx === 0 ? <Medal className="h-3.5 w-3.5" /> : `#${entry.rank}`}
                      </span>
                      <span className={`truncate max-w-[80px] ${entry.teamName === teamName ? 'font-medium' : ''}`}>
                        {entry.teamName}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-sidebar-foreground">
                      {entry.combinedScore}
                    </span>
                  </div>
                ))}
                <Link href="/leaderboard" className="text-xs text-primary hover:underline block text-center mt-2">
                  View Full Leaderboard
                </Link>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-2">
                No teams yet
              </p>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="flex flex-col gap-3">
          {isDemoUser && (
            <Button
              variant="outline"
              size="sm"
              className="w-full bg-sidebar-accent/50 border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={() => {
                resetTour();
                setTimeout(() => startTour(), 100);
              }}
              data-testid="button-restart-tour"
            >
              <PlayCircle className="h-4 w-4 mr-2" />
              Restart Tour
            </Button>
          )}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Team</span>
            <span className="text-sm font-medium text-sidebar-foreground" data-testid="text-team-name">{teamName}</span>
          </div>
          <div className="flex items-center justify-between">
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-xs text-muted-foreground cursor-help underline decoration-dotted">
                  Simulation Week
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[200px]">
                <p className="text-xs">
                  This shows which week of the {totalWeeks}-week simulation you're currently in. 
                  Each week brings new scenarios and decisions.
                </p>
              </TooltipContent>
            </Tooltip>
            <Badge variant="secondary" className="text-xs" data-testid="badge-week-progress">
              Week {currentWeek} of {totalWeeks}
            </Badge>
          </div>
          <div className="h-2 bg-sidebar-accent rounded-full overflow-hidden" data-testid="progress-week">
            <div
              className="h-full bg-sidebar-primary transition-all duration-500"
              style={{ width: `${(currentWeek / totalWeeks) * 100}%` }}
            />
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
