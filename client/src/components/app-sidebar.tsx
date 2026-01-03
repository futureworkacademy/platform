import { useLocation, Link } from "wouter";
import {
  LayoutDashboard,
  FileText,
  Settings,
  Trophy,
  BarChart3,
  Building2,
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
];

interface AppSidebarProps {
  currentWeek: number;
  totalWeeks: number;
  teamName: string;
}

export function AppSidebar({ currentWeek, totalWeeks, teamName }: AppSidebarProps) {
  const [location] = useLocation();

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
            </SidebarMenu>
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
