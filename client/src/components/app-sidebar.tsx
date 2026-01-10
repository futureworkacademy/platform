import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard,
  FileText,
  Settings,
  Trophy,
  BarChart3,
  Building2,
  Info,
  Medal,
  User,
  Shield,
} from "lucide-react";
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
    title: "Leaderboard",
    url: "/leaderboard",
    icon: Trophy,
  },
  {
    title: "About",
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
  
  const { data: leaderboard, isLoading: leaderboardLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ["/api/leaderboard"],
  });

  const topThree = leaderboard?.slice(0, 3) || [];

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-sidebar-foreground">
              The Future of Work
            </span>
            <span className="text-xs text-muted-foreground">
              Business Simulation
            </span>
          </div>
        </div>
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
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Team</span>
            <span className="text-sm font-medium text-sidebar-foreground" data-testid="text-team-name">{teamName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Progress</span>
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
