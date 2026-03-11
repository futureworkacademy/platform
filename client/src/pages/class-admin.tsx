import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Users, 
  Plus, 
  Shield, 
  ArrowLeft, 
  UserCheck,
  UserMinus,
  RefreshCw,
  GraduationCap,
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  FileCheck,
  Mail,
  Send,
  Calendar,
  Play,
  Pause,
  Clock,
  Bell,
  RotateCw,
  Eye,
  X,
  Trash2,
  Copy,
  ChevronDown,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/use-auth";
import { Link, useSearch, useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Organization {
  id: string;
  code: string;
  name: string;
  description?: string;
  maxMembers: number;
  isActive: boolean;
  simulationLocked?: boolean | null;
}

interface OrganizationMember {
  id: string;
  userId: string;
  organizationId: string;
  role: string;
  status: string;
  joinedAt: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    teamId?: string;
    institution?: string;
    schoolEmail?: string;
  };
}

interface Team {
  id: string;
  name: string;
  members: string[];
  currentWeek: number;
  organizationId?: string;
}

interface RoleInfo {
  role: string;
  isSuperAdmin: boolean;
  isClassAdmin: boolean;
  inInstructorPreview?: boolean;
  instructorPreviewOrgId?: string | null;
  previewRole?: string | null;
  previewOrgId?: string | null;
  membershipCount: number;
  memberships: OrganizationMember[];
}

interface Simulation {
  id?: string;
  organizationId: string;
  status: string;
  totalWeeks: number;
  currentWeek: number;
  startDate: string | null;
  endDate: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  feedbackFormUrl?: string | null;
}

interface ScheduledReminder {
  id: string;
  organizationId: string;
  title: string;
  message: string;
  audience: string;
  teamId?: string | null;
  scheduledFor: string;
  relativeToWeek?: number | null;
  templateType?: string;
  sendSms?: boolean;
  status: string;
  sentAt?: string | null;
  sendCount?: number;
  failCount?: number;
}

const REMINDER_TEMPLATE_PRESETS = {
  welcome: {
    title: "Welcome to the Simulation!",
    message: `Welcome to The Future of Work Simulation!

You've been enrolled in an exciting business simulation where you'll make strategic decisions about AI adoption, workforce management, and organizational culture.

Here's what to expect:
- Weekly decision rounds with your team
- Real-time metrics and performance tracking  
- Competition with other teams in your class

Log in now to explore your company dashboard and meet your team!`,
    audience: "all_students",
  },
  no_submission_warning: {
    title: "Reminder: Decisions Due Soon",
    message: `This is a friendly reminder that you haven't submitted your decisions for the current week yet.

Please log in and submit your team's decisions before the deadline to avoid missing this round.

Your participation matters for your team's success!`,
    audience: "no_submission",
  },
  score_update: {
    title: "Weekly Score Update",
    message: `The results are in! 

Check your dashboard to see how your team performed this week:
- Review your financial metrics
- Check your cultural health scores
- See how you rank on the leaderboard

Great work so far - keep making strategic decisions!`,
    audience: "all_students",
  },
  thank_you: {
    title: "Thank You for Participating!",
    message: `Congratulations on completing The Future of Work Simulation!

Over the past weeks, you've navigated complex decisions about:
- AI and automation adoption
- Workforce reskilling and development
- Organizational culture and employee morale
- Competitive strategy

We hope you've gained valuable insights into the challenges leaders face in the modern workplace. Your final results are available on your dashboard.

Thank you for your engagement and participation!`,
    audience: "all_students",
  },
};

export default function ClassAdminPage() {
  const { logout, isLoggingOut } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const selectedOrgId = searchParams.get("org") || "";
  
  const [newTeamName, setNewTeamName] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [createTeamDialogOpen, setCreateTeamDialogOpen] = useState(false);
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("STUDENT");
  
  // CSV Bulk Import state
  const [bulkImportDialogOpen, setBulkImportDialogOpen] = useState(false);
  const [csvData, setCsvData] = useState<Array<{name: string; studentId: string; classLevel: string; email: string}>>([]);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<{success: number; failed: number; errors: string[]; emailsSent?: number; emailsFailed?: number} | null>(null);
  const [sendInvites, setSendInvites] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Sandbox mode state
  const [sandboxDialogOpen, setSandboxDialogOpen] = useState(false);
  const [sandboxStartWeek, setSandboxStartWeek] = useState(1);
  
  // Expanded team cards state
  const [expandedTeamIds, setExpandedTeamIds] = useState<Set<string>>(new Set());

  const { data: roleInfo, isLoading: roleLoading } = useQuery<RoleInfo>({
    queryKey: ["/api/my-role"],
  });

  const { data: myOrganizations = [], isLoading: orgsLoading } = useQuery<Organization[]>({
    queryKey: ["/api/class-admin/my-organizations"],
    enabled: roleInfo?.isClassAdmin === true || roleInfo?.isSuperAdmin === true,
  });

  const { data: members = [], isLoading: membersLoading, isFetching: membersFetching, refetch: refetchMembers } = useQuery<OrganizationMember[]>({
    queryKey: ["/api/class-admin/organizations", selectedOrgId, "members"],
    enabled: !!selectedOrgId && (roleInfo?.isClassAdmin === true || roleInfo?.isSuperAdmin === true),
  });

  const { data: teams = [], isLoading: teamsLoading, isFetching: teamsFetching, refetch: refetchTeams } = useQuery<Team[]>({
    queryKey: ["/api/class-admin/organizations", selectedOrgId, "teams"],
    enabled: !!selectedOrgId && (roleInfo?.isClassAdmin === true || roleInfo?.isSuperAdmin === true),
  });

  const { data: simulation, refetch: refetchSimulation } = useQuery<Simulation>({
    queryKey: ["/api/class-admin/organizations", selectedOrgId, "simulation"],
    enabled: !!selectedOrgId && (roleInfo?.isClassAdmin === true || roleInfo?.isSuperAdmin === true),
  });

  const { data: reminders = [], refetch: refetchReminders } = useQuery<ScheduledReminder[]>({
    queryKey: ["/api/class-admin/organizations", selectedOrgId, "reminders"],
    enabled: !!selectedOrgId && (roleInfo?.isClassAdmin === true || roleInfo?.isSuperAdmin === true),
  });

  // Preview mode (Blackboard-style student preview)
  const { data: previewModeStatus, refetch: refetchPreviewMode } = useQuery<{
    inPreviewMode: boolean;
    testStudent: { id: string; email: string; firstName: string; lastName: string; teamId: string } | null;
    testTeam: { id: string; name: string; currentWeek: number } | null;
  }>({
    queryKey: ["/api/class-admin/organizations", selectedOrgId, "preview-mode"],
    enabled: !!selectedOrgId && (roleInfo?.isClassAdmin === true || roleInfo?.isSuperAdmin === true),
  });

  const enterPreviewModeMutation = useMutation({
    mutationFn: async (startWeek: number = 1) => {
      return apiRequest("POST", `/api/class-admin/organizations/${selectedOrgId}/preview-mode/enter`, { startWeek });
    },
    onSuccess: () => {
      setSandboxDialogOpen(false);
      // Invalidate user data so the app knows we're in sandbox mode
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/class-admin/organizations", selectedOrgId, "preview-mode"] });
      toast({ title: "Sandbox mode activated", description: `Starting simulation at Week ${sandboxStartWeek}` });
      // Navigate to student dashboard after a brief delay to allow user data to refresh
      setTimeout(() => setLocation("/dashboard"), 100);
    },
    onError: (error: any) => {
      toast({ title: "Error entering sandbox mode", description: error.message, variant: "destructive" });
    },
  });

  const setWeekMutation = useMutation({
    mutationFn: async (week: number) => {
      return apiRequest("POST", `/api/class-admin/organizations/${selectedOrgId}/preview-mode/set-week`, { week });
    },
    onSuccess: (_, week) => {
      queryClient.invalidateQueries({ queryKey: ["/api/class-admin/organizations", selectedOrgId, "preview-mode"] });
      toast({ title: "Week changed", description: `Now viewing Week ${week}` });
    },
    onError: (error: any) => {
      toast({ title: "Error changing week", description: error.message, variant: "destructive" });
    },
  });

  const exitPreviewModeMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/class-admin/organizations/${selectedOrgId}/preview-mode/exit`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/class-admin/organizations", selectedOrgId, "preview-mode"] });
      toast({ title: "Exited preview mode", description: "You are back to admin view" });
    },
    onError: (error: any) => {
      toast({ title: "Error exiting preview mode", description: error.message, variant: "destructive" });
    },
  });

  const resetTestDataMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/class-admin/organizations/${selectedOrgId}/preview-mode/reset`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/class-admin/organizations", selectedOrgId, "preview-mode"] });
      toast({ title: "Test data reset", description: "The test student's simulation has been reset to week 1" });
    },
    onError: (error: any) => {
      toast({ title: "Error resetting test data", description: error.message, variant: "destructive" });
    },
  });

  const exitPreviewMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/preview/exit", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-role"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({ title: "Preview ended", description: "You are back to your normal view" });
      setLocation("/super-admin");
    },
    onError: (error: any) => {
      toast({ title: "Error exiting preview", description: error.message, variant: "destructive" });
    },
  });

  const createTeamMutation = useMutation({
    mutationFn: async (data: { name: string }) => {
      return apiRequest("POST", `/api/class-admin/organizations/${selectedOrgId}/teams`, {
        name: data.name,
        members: [],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/class-admin/organizations", selectedOrgId, "teams"] });
      setNewTeamName("");
      setCreateTeamDialogOpen(false);
      toast({ title: "Team created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error creating team", description: error.message, variant: "destructive" });
    },
  });

  const assignTeamMutation = useMutation({
    mutationFn: async (data: { memberId: string; teamId: string }) => {
      return apiRequest("POST", `/api/class-admin/organizations/${selectedOrgId}/assign-team`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/class-admin/organizations", selectedOrgId, "members"] });
      setSelectedMemberId("");
      setSelectedTeamId("");
      toast({ title: "Student assigned to team" });
    },
    onError: (error: any) => {
      toast({ title: "Error assigning team", description: error.message, variant: "destructive" });
    },
  });

  const removeFromTeamMutation = useMutation({
    mutationFn: async (data: { memberId: string }) => {
      return apiRequest("POST", `/api/class-admin/organizations/${selectedOrgId}/assign-team`, { memberId: data.memberId, teamId: null });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/class-admin/organizations", selectedOrgId, "members"] });
      toast({ title: "Student removed from team" });
    },
    onError: (error: any) => {
      toast({ title: "Error removing from team", description: error.message, variant: "destructive" });
    },
  });

  const toggleTeamExpanded = (teamId: string) => {
    setExpandedTeamIds(prev => {
      const next = new Set(prev);
      if (next.has(teamId)) {
        next.delete(teamId);
      } else {
        next.add(teamId);
      }
      return next;
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  const approveMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      return apiRequest("POST", `/api/class-admin/organizations/${selectedOrgId}/approve-member`, { memberId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/class-admin/organizations", selectedOrgId, "members"] });
      toast({ title: "Member approved" });
    },
    onError: (error: any) => {
      toast({ title: "Error approving member", description: error.message, variant: "destructive" });
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      return apiRequest("DELETE", `/api/class-admin/organizations/${selectedOrgId}/members/${memberId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/class-admin/organizations", selectedOrgId, "members"] });
      toast({ title: "Member removed" });
    },
    onError: (error: any) => {
      toast({ title: "Error removing member", description: error.message, variant: "destructive" });
    },
  });

  const sendInviteMutation = useMutation({
    mutationFn: async (memberId: string) => {
      return apiRequest("POST", `/api/class-admin/organizations/${selectedOrgId}/members/${memberId}/send-invite`, {});
    },
    onSuccess: () => {
      toast({ title: "Invitation sent", description: "Email invitation sent successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to send invitation", description: error.message, variant: "destructive" });
    },
  });

  const reactivateMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      return apiRequest("POST", `/api/class-admin/organizations/${selectedOrgId}/members/${memberId}/reactivate`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/class-admin/organizations", selectedOrgId, "members"] });
      toast({ title: "Member reactivated" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to reactivate member", description: error.message, variant: "destructive" });
    },
  });

  const updateSimulationMutation = useMutation({
    mutationFn: async (data: { totalWeeks?: number; startDate?: string; endDate?: string; feedbackFormUrl?: string }) => {
      return apiRequest("POST", `/api/class-admin/organizations/${selectedOrgId}/simulation`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/class-admin/organizations", selectedOrgId, "simulation"] });
      toast({ title: "Simulation settings saved" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to save simulation settings", description: error.message, variant: "destructive" });
    },
  });

  const toggleLockMutation = useMutation({
    mutationFn: async (locked: boolean) => {
      return apiRequest("POST", `/api/class-admin/organizations/${selectedOrgId}/toggle-lock`, { locked });
    },
    onSuccess: (_: any, locked: boolean) => {
      queryClient.invalidateQueries({ queryKey: ["/api/class-admin/my-organizations"] });
      toast({ title: locked ? "Decisions locked" : "Decisions unlocked", description: locked ? "Students can browse content but cannot submit decisions." : "Students can now submit their decisions." });
    },
    onError: (error: any) => {
      toast({ title: "Failed to toggle lock", description: error.message, variant: "destructive" });
    },
  });

  const startSimulationMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/class-admin/organizations/${selectedOrgId}/simulation/start`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/class-admin/organizations", selectedOrgId, "simulation"] });
      toast({ title: "Simulation started!", description: "Week 1 has begun" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to start simulation", description: error.message, variant: "destructive" });
    },
  });

  const advanceWeekMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/class-admin/organizations/${selectedOrgId}/simulation/advance-week`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/class-admin/organizations", selectedOrgId, "simulation"] });
      toast({ title: "Week advanced" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to advance week", description: error.message, variant: "destructive" });
    },
  });

  const completeSimulationMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/class-admin/organizations/${selectedOrgId}/simulation/complete`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/class-admin/organizations", selectedOrgId, "simulation"] });
      toast({ title: "Simulation completed" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to complete simulation", description: error.message, variant: "destructive" });
    },
  });

  const createReminderMutation = useMutation({
    mutationFn: async (data: { 
      title: string; 
      message: string; 
      scheduledFor: string; 
      audience?: string;
      templateType?: string;
      sendSms?: boolean;
    }) => {
      return apiRequest("POST", `/api/class-admin/organizations/${selectedOrgId}/reminders`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/class-admin/organizations", selectedOrgId, "reminders"] });
      toast({ title: "Reminder scheduled" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to schedule reminder", description: error.message, variant: "destructive" });
    },
  });

  const cancelReminderMutation = useMutation({
    mutationFn: async (reminderId: string) => {
      return apiRequest("DELETE", `/api/class-admin/organizations/${selectedOrgId}/reminders/${reminderId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/class-admin/organizations", selectedOrgId, "reminders"] });
      toast({ title: "Reminder cancelled" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to cancel reminder", description: error.message, variant: "destructive" });
    },
  });

  const addMemberMutation = useMutation({
    mutationFn: async (data: { email: string; role: string }) => {
      return apiRequest("POST", `/api/class-admin/organizations/${selectedOrgId}/add-member`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/class-admin/organizations", selectedOrgId, "members"] });
      setNewMemberEmail("");
      setNewMemberRole("STUDENT");
      setAddMemberDialogOpen(false);
      toast({ title: "Member added successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error adding member", description: error.message, variant: "destructive" });
    },
  });

  const bulkImportMutation = useMutation({
    mutationFn: async (payload: { students: Array<{name: string; studentId: string; classLevel: string; email: string}>; sendInvites: boolean }) => {
      const response = await apiRequest("POST", `/api/class-admin/organizations/${selectedOrgId}/bulk-import`, payload);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/class-admin/organizations", selectedOrgId, "members"] });
      setImportResult(data);
      if (data.success > 0) {
        const emailMsg = data.emailsSent > 0 ? ` and sent ${data.emailsSent} invitation emails` : '';
        toast({ title: `Successfully imported ${data.success} students${emailMsg}` });
      }
    },
    onError: (error: any) => {
      toast({ title: "Error importing students", description: error.message, variant: "destructive" });
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setCsvError(null);
    setImportResult(null);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        let text = e.target?.result as string;
        
        // Remove BOM (Byte Order Mark) that Excel/some systems add to UTF-8 files
        if (text.charCodeAt(0) === 0xFEFF) {
          text = text.slice(1);
        }
        // Also handle the common UTF-8 BOM sequence
        text = text.replace(/^\uFEFF/, '');
        
        // Parse CSV line respecting quoted fields (handles commas inside quotes)
        const parseCSVLine = (line: string): string[] => {
          const result: string[] = [];
          let current = '';
          let inQuotes = false;
          
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
              // Handle escaped quotes (double quotes inside quoted field)
              if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++; // Skip next quote
              } else {
                inQuotes = !inQuotes;
              }
            } else if (char === ',' && !inQuotes) {
              result.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          result.push(current.trim()); // Push last field
          return result;
        };
        
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          setCsvError("CSV file must have a header row and at least one data row");
          return;
        }

        // Parse header - support various column names, strip any remaining special chars
        const headerFields = parseCSVLine(lines[0]);
        const header = headerFields.map(h => h.toLowerCase().replace(/[^\x20-\x7E]/g, ''));
        
        // Find column indices (flexible matching - order matters for specificity)
        // Email - most specific, find first
        const emailIdx = header.findIndex(h => h.includes('email') || h.includes('e-mail'));
        
        // Student ID - look for "id" but not in "email"
        const idIdx = header.findIndex(h => 
          (h.includes('student id') || h.includes('studentid') || 
           (h.includes('id') && !h.includes('email')))
        );
        
        // Class Level - look for level/class/year but not in other matches
        const levelIdx = header.findIndex(h => 
          (h.includes('level') || h.includes('class level') || 
           (h.includes('class') && !h.includes('id')))
        );
        
        // Name - look for "name" but exclude email and id columns
        const nameIdx = header.findIndex((h, idx) => 
          h.includes('name') && idx !== emailIdx && idx !== idIdx
        );

        if (emailIdx === -1) {
          setCsvError("CSV must contain an 'email' column");
          return;
        }

        const parsed = lines.slice(1).map((line) => {
          const values = parseCSVLine(line);
          return {
            name: nameIdx >= 0 ? values[nameIdx] || '' : '',
            studentId: idIdx >= 0 ? values[idIdx] || '' : '',
            classLevel: levelIdx >= 0 ? values[levelIdx] || '' : '',
            email: values[emailIdx] || '',
          };
        }).filter(row => row.email); // Filter out rows without email

        if (parsed.length === 0) {
          setCsvError("No valid student records found in CSV");
          return;
        }

        setCsvData(parsed);
      } catch (err) {
        setCsvError("Failed to parse CSV file. Please check the format.");
      }
    };
    reader.readAsText(file);
  };

  const handleBulkImport = () => {
    if (csvData.length > 0) {
      bulkImportMutation.mutate({ students: csvData, sendInvites });
    }
  };

  const resetBulkImport = () => {
    setCsvData([]);
    setCsvError(null);
    setImportResult(null);
    setSendInvites(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const currentOrg = myOrganizations.find(org => org.id === selectedOrgId);
  const pendingMembers = members.filter(m => m.status === "pending");
  const activeMembers = members.filter(m => m.status === "active");
  const deactivatedMembers = members.filter(m => m.status === "deactivated");
  const studentMembers = activeMembers.filter(m => m.role?.toUpperCase() === "STUDENT");

  if (roleLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" data-testid="loading-state">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!roleInfo?.isClassAdmin && !roleInfo?.isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4" data-testid="access-denied">
        <Shield className="h-16 w-16 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground">Class Admin or Super Admin access is required.</p>
        <Link href="/">
          <Button variant="outline" data-testid="button-back-home">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>
    );
  }

  if (!selectedOrgId && myOrganizations.length > 0) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <GraduationCap className="h-8 w-8 text-primary" />
                Class Admin Console
              </h1>
              <p className="text-muted-foreground">Select an organization to manage</p>
            </div>
            <div className="flex gap-2">
              <Link href="/profile">
                <Button variant="outline" data-testid="button-profile">
                  <UserCheck className="mr-2 h-4 w-4" />
                  Profile
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" data-testid="button-back">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            {myOrganizations.map((org) => (
              <Card 
                key={org.id} 
                className="cursor-pointer hover-elevate"
                onClick={() => setLocation(`/class-admin?org=${org.id}`)}
                data-testid={`card-org-select-${org.id}`}
              >
                <CardHeader>
                  <CardTitle>{org.name}</CardTitle>
                  <CardDescription>{org.description || "No description"}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Badge variant={org.isActive ? "default" : "secondary"}>
                      {org.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Code: <code className="font-mono bg-muted px-1 rounded">{org.code}</code>
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!selectedOrgId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4" data-testid="no-orgs">
        <GraduationCap className="h-16 w-16 text-muted-foreground" />
        <h1 className="text-2xl font-bold">No Organizations</h1>
        <p className="text-muted-foreground">You are not assigned to any organizations yet.</p>
        <Link href="/">
          <Button variant="outline" data-testid="button-back-home">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>
    );
  }

  const isInPreviewMode = roleInfo?.previewRole === "educator" || roleInfo?.inInstructorPreview === true;

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <GraduationCap className="h-8 w-8 text-primary" />
              {currentOrg?.name || "Class Admin Console"}
              <Badge 
                variant={isInPreviewMode ? "secondary" : "default"} 
                className="text-xs ml-2" 
                data-testid="badge-role"
              >
                {isInPreviewMode ? "Educator Preview" : roleInfo?.isSuperAdmin ? "Super Admin" : "Instructor"}
              </Badge>
            </h1>
            <p className="text-muted-foreground">
              Manage students and teams for this class
            </p>
            {currentOrg?.code && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-muted-foreground">Enrollment Code:</span>
                <code className="bg-muted px-3 py-1 rounded-md font-mono text-sm font-semibold" data-testid="text-enrollment-code">
                  {currentOrg.code}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(currentOrg.code)}
                  aria-label="Copy enrollment code"
                  data-testid="button-copy-enrollment-code"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            )}
            {currentOrg?.code && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-muted-foreground">Magic Invite Link:</span>
                <code className="bg-muted px-3 py-1 rounded-md font-mono text-xs truncate max-w-xs" data-testid="text-magic-link">
                  {`https://futureworkacademy.com/join/${currentOrg.code}`}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    navigator.clipboard.writeText(`https://futureworkacademy.com/join/${currentOrg.code}`);
                    toast({ title: "Magic link copied!", description: "Share this link with your students." });
                  }}
                  aria-label="Copy magic invite link"
                  data-testid="button-copy-magic-link"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            )}
            <div className="flex items-center gap-3 mt-2">
              <Badge variant={currentOrg?.simulationLocked === true ? "secondary" : "default"} data-testid="badge-lock-status">
                {currentOrg?.simulationLocked === true ? "Decisions Locked" : "Decisions Open"}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleLockMutation.mutate(!(currentOrg?.simulationLocked === true))}
                disabled={toggleLockMutation.isPending}
                data-testid="button-toggle-lock"
              >
                {currentOrg?.simulationLocked === true ? "Unlock Decisions" : "Lock Decisions"}
              </Button>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Dialog open={sandboxDialogOpen} onOpenChange={setSandboxDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-sandbox-mode">
                  <Eye className="mr-2 h-4 w-4" />
                  Sandbox Mode
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Enter Sandbox Mode</DialogTitle>
                  <DialogDescription>
                    Test the simulation as a student. Select which week to start from and experience the full student workflow.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Label htmlFor="sandbox-week">Start at Week</Label>
                  <Select
                    value={sandboxStartWeek.toString()}
                    onValueChange={(v) => setSandboxStartWeek(parseInt(v))}
                  >
                    <SelectTrigger id="sandbox-week" className="mt-2" data-testid="select-sandbox-week">
                      <SelectValue placeholder="Select week" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Week 1 - The Precision Imperative</SelectItem>
                      <SelectItem value="2">Week 2 - The Talent Equation</SelectItem>
                      <SelectItem value="3">Week 3 - The Innovation Paradox</SelectItem>
                      <SelectItem value="4">Week 4 - The Global Chessboard</SelectItem>
                      <SelectItem value="5">Week 5 - The Trust Imperative</SelectItem>
                      <SelectItem value="6">Week 6 - The Cultural Crossroads</SelectItem>
                      <SelectItem value="7">Week 7 - The Regulatory Reckoning</SelectItem>
                      <SelectItem value="8">Week 8 - The Future Unfolds</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-3">
                    You'll see the briefing, make decisions, and get AI-graded feedback just like a real student. Use the sandbox controls to jump between weeks.
                  </p>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setSandboxDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => enterPreviewModeMutation.mutate(sandboxStartWeek)}
                    disabled={enterPreviewModeMutation.isPending}
                    data-testid="button-enter-sandbox"
                  >
                    {enterPreviewModeMutation.isPending ? 'Entering...' : 'Enter Sandbox'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={() => { refetchMembers(); refetchTeams(); }} disabled={membersFetching || teamsFetching} data-testid="button-refresh">
              <RefreshCw className={`mr-2 h-4 w-4 ${membersFetching || teamsFetching ? 'animate-spin' : ''}`} />
              {membersFetching || teamsFetching ? 'Refreshing...' : 'Refresh'}
            </Button>
            {!isInPreviewMode && myOrganizations.length > 1 && (
              <Button variant="outline" onClick={() => setLocation("/class-admin")} data-testid="button-switch-org">
                Switch Org
              </Button>
            )}
            <Link href="/profile">
              <Button variant="outline" data-testid="button-profile">
                <UserCheck className="mr-2 h-4 w-4" />
                Profile
              </Button>
            </Link>
            {!isInPreviewMode && (
              <Link href="/">
                <Button variant="outline" data-testid="button-back">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              </Link>
            )}
            <Button variant="outline" onClick={() => logout()} disabled={isLoggingOut} data-testid="button-logout">
              <LogOut className="mr-2 h-4 w-4" />
              {isLoggingOut ? "Logging out..." : "Log Out"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold" data-testid="text-total-members">{members.length}</p>
                <p className="text-sm text-muted-foreground">Total Members</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold" data-testid="text-students">{studentMembers.length}</p>
                <p className="text-sm text-muted-foreground">Students</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold" data-testid="text-pending">{pendingMembers.length}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold" data-testid="text-teams">{teams.length}</p>
                <p className="text-sm text-muted-foreground">Teams</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="members" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="members" data-testid="tab-members">
              <Users className="mr-2 h-4 w-4" />
              Members ({members.length})
            </TabsTrigger>
            <TabsTrigger value="teams" data-testid="tab-teams">
              <GraduationCap className="mr-2 h-4 w-4" />
              Teams ({teams.length})
            </TabsTrigger>
            <TabsTrigger value="pending" data-testid="tab-pending">
              <UserCheck className="mr-2 h-4 w-4" />
              Pending ({pendingMembers.length})
            </TabsTrigger>
            <TabsTrigger value="simulation" data-testid="tab-simulation">
              <Calendar className="mr-2 h-4 w-4" />
              Simulation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <CardTitle>Class Members</CardTitle>
                    <CardDescription>All active members in this class</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Dialog open={bulkImportDialogOpen} onOpenChange={(open) => {
                      setBulkImportDialogOpen(open);
                      if (!open) resetBulkImport();
                    }}>
                      <DialogTrigger asChild>
                        <Button variant="outline" data-testid="button-bulk-import">
                          <Upload className="mr-2 h-4 w-4" />
                          Bulk Import
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Bulk Import Students</DialogTitle>
                          <DialogDescription>
                            Upload a CSV file exported from your student registration system.
                            Required: email column. Optional: name, student ID, class level.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>CSV File</Label>
                            <div className="flex items-center gap-2">
                              <Input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv"
                                onChange={handleFileUpload}
                                data-testid="input-csv-file"
                              />
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Supported columns: Student Name, Student ID, Class Level, Preferred Email
                            </p>
                          </div>

                          {csvError && (
                            <Alert variant="destructive">
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription>{csvError}</AlertDescription>
                            </Alert>
                          )}

                          {csvData.length > 0 && !importResult && (
                            <div className="space-y-2">
                              <Label>Preview ({csvData.length} students)</Label>
                              <div className="max-h-48 overflow-auto border rounded-md">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Name</TableHead>
                                      <TableHead>Email</TableHead>
                                      <TableHead>Student ID</TableHead>
                                      <TableHead>Level</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {csvData.slice(0, 10).map((row, idx) => (
                                      <TableRow key={idx}>
                                        <TableCell>{row.name || '-'}</TableCell>
                                        <TableCell>{row.email}</TableCell>
                                        <TableCell>{row.studentId || '-'}</TableCell>
                                        <TableCell>{row.classLevel || '-'}</TableCell>
                                      </TableRow>
                                    ))}
                                    {csvData.length > 10 && (
                                      <TableRow>
                                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                                          ... and {csvData.length - 10} more
                                        </TableCell>
                                      </TableRow>
                                    )}
                                  </TableBody>
                                </Table>
                              </div>
                            </div>
                          )}

                          {csvData.length > 0 && !importResult && (
                            <div className="flex items-center space-x-2 pt-2 border-t">
                              <Checkbox 
                                id="send-invites" 
                                checked={sendInvites}
                                onCheckedChange={(checked) => setSendInvites(checked === true)}
                                data-testid="checkbox-send-invites"
                              />
                              <Label htmlFor="send-invites" className="text-sm flex items-center gap-2 cursor-pointer">
                                <Mail className="h-4 w-4" />
                                Send invitation emails to students
                              </Label>
                            </div>
                          )}

                          {importResult && (
                            <div className="space-y-2">
                              <Alert variant={importResult.failed > 0 ? "destructive" : "default"}>
                                <CheckCircle className="h-4 w-4" />
                                <AlertDescription>
                                  Import complete: {importResult.success} successful, {importResult.failed} failed
                                  {(importResult.emailsSent !== undefined && importResult.emailsSent > 0) && (
                                    <span className="block mt-1">
                                      <Mail className="h-3 w-3 inline mr-1" />
                                      {importResult.emailsSent} invitation emails sent
                                      {importResult.emailsFailed !== undefined && importResult.emailsFailed > 0 && 
                                        `, ${importResult.emailsFailed} failed`
                                      }
                                    </span>
                                  )}
                                </AlertDescription>
                              </Alert>
                              {importResult.errors.length > 0 && (
                                <div className="text-sm text-destructive space-y-1">
                                  {importResult.errors.slice(0, 5).map((err, idx) => (
                                    <p key={idx}>{err}</p>
                                  ))}
                                  {importResult.errors.length > 5 && (
                                    <p>... and {importResult.errors.length - 5} more errors</p>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setBulkImportDialogOpen(false);
                              resetBulkImport();
                            }}
                            data-testid="button-cancel-bulk-import"
                          >
                            {importResult ? 'Close' : 'Cancel'}
                          </Button>
                          {!importResult && (
                            <Button
                              onClick={handleBulkImport}
                              disabled={csvData.length === 0 || bulkImportMutation.isPending}
                              data-testid="button-submit-bulk-import"
                            >
                              {bulkImportMutation.isPending ? "Importing..." : `Import ${csvData.length} Students`}
                            </Button>
                          )}
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Dialog open={addMemberDialogOpen} onOpenChange={setAddMemberDialogOpen}>
                      <DialogTrigger asChild>
                        <Button data-testid="button-add-member">
                          <Plus className="mr-2 h-4 w-4" />
                          Add Member
                        </Button>
                      </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Member</DialogTitle>
                        <DialogDescription>
                          Add an existing user to this organization by their email address.
                          The user must have already signed up to the platform.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="member-email">Email Address</Label>
                          <Input
                            id="member-email"
                            type="email"
                            placeholder="student@university.edu"
                            value={newMemberEmail}
                            onChange={(e) => setNewMemberEmail(e.target.value)}
                            data-testid="input-member-email"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="member-role">Role</Label>
                          <Select value={newMemberRole} onValueChange={setNewMemberRole}>
                            <SelectTrigger data-testid="select-member-role">
                              <SelectValue placeholder="Select role..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="STUDENT">Student</SelectItem>
                              {roleInfo?.isSuperAdmin && (
                                <SelectItem value="CLASS_ADMIN">Instructor</SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setAddMemberDialogOpen(false)}
                          data-testid="button-cancel-add-member"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => addMemberMutation.mutate({ email: newMemberEmail, role: newMemberRole })}
                          disabled={!newMemberEmail || addMemberMutation.isPending}
                          data-testid="button-submit-add-member"
                        >
                          {addMemberMutation.isPending ? "Adding..." : "Add Member"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {membersLoading ? (
                  <p className="text-muted-foreground text-center py-4">Loading members...</p>
                ) : activeMembers.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No active members yet.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Team</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeMembers.map((member) => (
                        <TableRow key={member.id} data-testid={`row-member-${member.id}`}>
                          <TableCell>
                            {member.user?.firstName} {member.user?.lastName}
                          </TableCell>
                          <TableCell>{member.user?.email || member.user?.schoolEmail}</TableCell>
                          <TableCell>
                            <Badge variant={member.role?.toUpperCase() === "CLASS_ADMIN" ? "default" : "secondary"}>
                              {member.role?.toUpperCase() === "CLASS_ADMIN" ? "Instructor" : "Student"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {member.user?.teamId ? (
                              <Badge variant="outline">
                                {teams.find(t => t.id === member.user?.teamId)?.name || "Assigned"}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">Unassigned</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {member.role?.toUpperCase() === "STUDENT" && (
                                <Select
                                  value={member.user?.teamId || ""}
                                  onValueChange={(value) => {
                                    assignTeamMutation.mutate({ memberId: member.id, teamId: value });
                                  }}
                                >
                                  <SelectTrigger className="w-32" data-testid={`select-team-${member.id}`}>
                                    <SelectValue placeholder="Assign..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {teams.map((team) => (
                                      <SelectItem key={team.id} value={team.id}>
                                        {team.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => sendInviteMutation.mutate(member.id)}
                                disabled={sendInviteMutation.isPending}
                                title="Send invitation email"
                                aria-label="Send invitation email"
                                data-testid={`button-send-invite-${member.id}`}
                              >
                                <Send className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeMemberMutation.mutate(member.id)}
                                disabled={removeMemberMutation.isPending}
                                aria-label="Remove member"
                                data-testid={`button-remove-member-${member.id}`}
                              >
                                <UserMinus className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}

                {deactivatedMembers.length > 0 && (
                  <div className="mt-6 pt-4 border-t">
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                      Deactivated Members ({deactivatedMembers.length})
                    </h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {deactivatedMembers.map((member) => (
                          <TableRow key={member.id} className="opacity-60" data-testid={`row-deactivated-${member.id}`}>
                            <TableCell>
                              {member.user?.firstName} {member.user?.lastName}
                            </TableCell>
                            <TableCell>{member.user?.email || member.user?.schoolEmail}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {member.role?.toUpperCase() === "CLASS_ADMIN" ? "Instructor" : "Student"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => reactivateMemberMutation.mutate(member.id)}
                                disabled={reactivateMemberMutation.isPending}
                                data-testid={`button-reactivate-${member.id}`}
                              >
                                <RotateCw className="mr-1 h-3 w-3" />
                                Reactivate
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teams" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Teams</h2>
              <Dialog open={createTeamDialogOpen} onOpenChange={setCreateTeamDialogOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-create-team">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Team
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Team</DialogTitle>
                    <DialogDescription>
                      Create a new team for this class. Students can then be assigned to it.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="team-name">Team Name</Label>
                      <Input
                        id="team-name"
                        placeholder="e.g., Team Alpha"
                        value={newTeamName}
                        onChange={(e) => setNewTeamName(e.target.value)}
                        data-testid="input-team-name"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={() => createTeamMutation.mutate({ name: newTeamName })}
                      disabled={!newTeamName || createTeamMutation.isPending}
                      data-testid="button-submit-team"
                    >
                      {createTeamMutation.isPending ? "Creating..." : "Create Team"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {teamsLoading ? (
              <p className="text-muted-foreground text-center py-4">Loading teams...</p>
            ) : teams.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No teams yet. Create your first team to get started.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {teams.map((team) => {
                  const teamMembers = activeMembers.filter(m => m.user?.teamId === team.id);
                  const isExpanded = expandedTeamIds.has(team.id);
                  return (
                    <Card key={team.id} data-testid={`card-team-${team.id}`}>
                      <CardHeader
                        className="pb-2 cursor-pointer select-none"
                        onClick={() => toggleTeamExpanded(team.id)}
                        data-testid={`button-toggle-team-${team.id}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-3">
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            )}
                            <div>
                              <CardTitle className="text-lg">{team.name}</CardTitle>
                              <CardDescription>Week {team.currentWeek}</CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary" className="text-xs">
                              {teamMembers.length} {teamMembers.length === 1 ? "member" : "members"}
                            </Badge>
                            {!isExpanded && teamMembers.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {teamMembers.slice(0, 3).map((m) => (
                                  <Badge key={m.id} variant="outline" className="text-xs">
                                    {m.user?.firstName}
                                  </Badge>
                                ))}
                                {teamMembers.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{teamMembers.length - 3}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      {isExpanded && (
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex items-center gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Team ID: </span>
                                <code className="bg-muted px-2 py-0.5 rounded font-mono text-xs">{team.id}</code>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Current Week: </span>
                                <span className="font-medium">{team.currentWeek}</span>
                              </div>
                            </div>
                            {teamMembers.length === 0 ? (
                              <p className="text-sm text-muted-foreground py-2">No members assigned to this team yet.</p>
                            ) : (
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Actions</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {teamMembers.map((member) => (
                                    <TableRow key={member.id} data-testid={`row-team-member-${member.id}`}>
                                      <TableCell className="font-medium">
                                        {member.user?.firstName} {member.user?.lastName}
                                      </TableCell>
                                      <TableCell className="text-muted-foreground">
                                        {member.user?.schoolEmail || member.user?.email}
                                      </TableCell>
                                      <TableCell>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            removeFromTeamMutation.mutate({ memberId: member.id });
                                          }}
                                          disabled={removeFromTeamMutation.isPending}
                                          data-testid={`button-remove-member-${member.id}`}
                                        >
                                          <UserMinus className="mr-1 h-3 w-3" />
                                          Remove
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            )}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Approvals</CardTitle>
                <CardDescription>Students waiting for approval to join this class</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingMembers.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No pending requests.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Institution</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingMembers.map((member) => (
                        <TableRow key={member.id} data-testid={`row-pending-${member.id}`}>
                          <TableCell>
                            {member.user?.firstName} {member.user?.lastName}
                          </TableCell>
                          <TableCell>{member.user?.schoolEmail || member.user?.email}</TableCell>
                          <TableCell>{member.user?.institution || "-"}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => approveMemberMutation.mutate(member.id)}
                                disabled={approveMemberMutation.isPending}
                                data-testid={`button-approve-${member.id}`}
                              >
                                <UserCheck className="mr-1 h-3 w-3" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => removeMemberMutation.mutate(member.id)}
                                disabled={removeMemberMutation.isPending}
                                data-testid={`button-reject-${member.id}`}
                              >
                                <UserMinus className="mr-1 h-3 w-3" />
                                Reject
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="simulation" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Simulation Status
                  </CardTitle>
                  <CardDescription>
                    Configure and control your simulation lifecycle
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status:</span>
                    <Badge variant={
                      simulation?.status === "active" ? "default" :
                      simulation?.status === "completed" ? "secondary" :
                      "outline"
                    }>
                      {simulation?.status === "setup" ? "Setting Up" :
                       simulation?.status === "active" ? "Active" :
                       simulation?.status === "paused" ? "Paused" :
                       simulation?.status === "completed" ? "Completed" :
                       "Not Started"}
                    </Badge>
                  </div>
                  
                  {simulation?.status === "active" && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Current Week:</span>
                      <span className="text-lg font-bold">
                        Week {simulation.currentWeek} of {simulation.totalWeeks}
                      </span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="totalWeeks">Total Weeks</Label>
                    <Select 
                      value={simulation?.totalWeeks?.toString() || "8"}
                      onValueChange={(value) => updateSimulationMutation.mutate({ totalWeeks: parseInt(value) })}
                      disabled={simulation?.status === "active" || simulation?.status === "completed"}
                    >
                      <SelectTrigger id="totalWeeks" data-testid="select-total-weeks">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[4, 5, 6, 7, 8, 9, 10, 11, 12].map((weeks) => (
                          <SelectItem key={weeks} value={weeks.toString()}>
                            {weeks} weeks
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={simulation?.startDate ? String(simulation.startDate).slice(0, 10) : ""}
                      onChange={(e) => updateSimulationMutation.mutate({ startDate: e.target.value })}
                      disabled={simulation?.status === "active" || simulation?.status === "completed"}
                      data-testid="input-start-date"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={simulation?.endDate ? String(simulation.endDate).slice(0, 10) : ""}
                      onChange={(e) => updateSimulationMutation.mutate({ endDate: e.target.value })}
                      disabled={simulation?.status === "active" || simulation?.status === "completed"}
                      data-testid="input-end-date"
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    {(!simulation?.status || simulation?.status === "setup") && (
                      <Button 
                        onClick={() => startSimulationMutation.mutate()}
                        disabled={startSimulationMutation.isPending || !simulation?.startDate}
                        className="flex-1"
                        data-testid="button-start-simulation"
                      >
                        <Play className="mr-2 h-4 w-4" />
                        Start Simulation
                      </Button>
                    )}
                    
                    {simulation?.status === "active" && (
                      <>
                        <Button 
                          onClick={() => advanceWeekMutation.mutate()}
                          disabled={advanceWeekMutation.isPending}
                          variant="outline"
                          data-testid="button-advance-week"
                        >
                          <RotateCw className="mr-2 h-4 w-4" />
                          Advance Week
                        </Button>
                        <Button 
                          onClick={() => completeSimulationMutation.mutate()}
                          disabled={completeSimulationMutation.isPending}
                          variant="secondary"
                          data-testid="button-complete-simulation"
                        >
                          Complete
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Scheduled Reminders
                  </CardTitle>
                  <CardDescription>
                    Queue up email and SMS reminders for your students
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide">Quick Add Templates</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="justify-start" data-testid="button-template-welcome">
                            <Play className="mr-2 h-3 w-3" />
                            Welcome
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Welcome Reminder</DialogTitle>
                            <DialogDescription>Send when the simulation starts</DialogDescription>
                          </DialogHeader>
                          <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            createReminderMutation.mutate({
                              title: REMINDER_TEMPLATE_PRESETS.welcome.title,
                              message: REMINDER_TEMPLATE_PRESETS.welcome.message,
                              scheduledFor: formData.get("scheduledFor") as string,
                              audience: "all_students",
                              templateType: "welcome",
                              sendSms: formData.get("sendSms") === "on",
                            });
                          }} className="space-y-4">
                            <div className="p-3 bg-muted rounded-md">
                              <p className="font-medium text-sm">{REMINDER_TEMPLATE_PRESETS.welcome.title}</p>
                              <p className="text-xs text-muted-foreground mt-1 whitespace-pre-line line-clamp-4">{REMINDER_TEMPLATE_PRESETS.welcome.message}</p>
                            </div>
                            <div className="space-y-2">
                              <Label>Send Date & Time</Label>
                              <Input name="scheduledFor" type="datetime-local" required data-testid="input-welcome-date" />
                            </div>
                            <div className="flex items-center gap-2">
                              <Checkbox id="welcome-sms" name="sendSms" data-testid="checkbox-welcome-sms" />
                              <Label htmlFor="welcome-sms" className="text-sm">Also send SMS to students who opted in</Label>
                            </div>
                            <DialogFooter>
                              <Button type="submit" disabled={createReminderMutation.isPending} data-testid="button-submit-welcome">Schedule</Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="justify-start" data-testid="button-template-warning">
                            <AlertCircle className="mr-2 h-3 w-3" />
                            48hr Warning
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>No Submission Warning</DialogTitle>
                            <DialogDescription>Send 48 hours before deadline to students who haven't submitted</DialogDescription>
                          </DialogHeader>
                          <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            createReminderMutation.mutate({
                              title: REMINDER_TEMPLATE_PRESETS.no_submission_warning.title,
                              message: REMINDER_TEMPLATE_PRESETS.no_submission_warning.message,
                              scheduledFor: formData.get("scheduledFor") as string,
                              audience: "no_submission",
                              templateType: "no_submission_warning",
                              sendSms: formData.get("sendSms") === "on",
                            });
                          }} className="space-y-4">
                            <div className="p-3 bg-muted rounded-md">
                              <p className="font-medium text-sm">{REMINDER_TEMPLATE_PRESETS.no_submission_warning.title}</p>
                              <p className="text-xs text-muted-foreground mt-1 whitespace-pre-line">{REMINDER_TEMPLATE_PRESETS.no_submission_warning.message}</p>
                            </div>
                            <Alert>
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription className="text-xs">
                                This will only send to students who haven't submitted decisions for the current week.
                              </AlertDescription>
                            </Alert>
                            <div className="space-y-2">
                              <Label>Send Date & Time (48 hours before deadline)</Label>
                              <Input name="scheduledFor" type="datetime-local" required data-testid="input-warning-date" />
                            </div>
                            <div className="flex items-center gap-2">
                              <Checkbox id="warning-sms" name="sendSms" data-testid="checkbox-warning-sms" />
                              <Label htmlFor="warning-sms" className="text-sm">Also send SMS to students who opted in</Label>
                            </div>
                            <DialogFooter>
                              <Button type="submit" disabled={createReminderMutation.isPending} data-testid="button-submit-warning">Schedule</Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="justify-start" data-testid="button-template-score">
                            <CheckCircle className="mr-2 h-3 w-3" />
                            Score Update
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Score Update</DialogTitle>
                            <DialogDescription>Send 24 hours after submission deadline</DialogDescription>
                          </DialogHeader>
                          <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            createReminderMutation.mutate({
                              title: REMINDER_TEMPLATE_PRESETS.score_update.title,
                              message: REMINDER_TEMPLATE_PRESETS.score_update.message,
                              scheduledFor: formData.get("scheduledFor") as string,
                              audience: "all_students",
                              templateType: "score_update",
                              sendSms: formData.get("sendSms") === "on",
                            });
                          }} className="space-y-4">
                            <div className="p-3 bg-muted rounded-md">
                              <p className="font-medium text-sm">{REMINDER_TEMPLATE_PRESETS.score_update.title}</p>
                              <p className="text-xs text-muted-foreground mt-1 whitespace-pre-line">{REMINDER_TEMPLATE_PRESETS.score_update.message}</p>
                            </div>
                            <div className="space-y-2">
                              <Label>Send Date & Time (24 hours after deadline)</Label>
                              <Input name="scheduledFor" type="datetime-local" required data-testid="input-score-date" />
                            </div>
                            <div className="flex items-center gap-2">
                              <Checkbox id="score-sms" name="sendSms" data-testid="checkbox-score-sms" />
                              <Label htmlFor="score-sms" className="text-sm">Also send SMS to students who opted in</Label>
                            </div>
                            <DialogFooter>
                              <Button type="submit" disabled={createReminderMutation.isPending} data-testid="button-submit-score">Schedule</Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="justify-start" data-testid="button-template-thankyou">
                            <Mail className="mr-2 h-3 w-3" />
                            Thank You
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Thank You Message</DialogTitle>
                            <DialogDescription>Send 24 hours after simulation ends</DialogDescription>
                          </DialogHeader>
                          <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            createReminderMutation.mutate({
                              title: REMINDER_TEMPLATE_PRESETS.thank_you.title,
                              message: REMINDER_TEMPLATE_PRESETS.thank_you.message,
                              scheduledFor: formData.get("scheduledFor") as string,
                              audience: "all_students",
                              templateType: "thank_you",
                              sendSms: formData.get("sendSms") === "on",
                            });
                          }} className="space-y-4">
                            <div className="p-3 bg-muted rounded-md">
                              <p className="font-medium text-sm">{REMINDER_TEMPLATE_PRESETS.thank_you.title}</p>
                              <p className="text-xs text-muted-foreground mt-1 whitespace-pre-line line-clamp-4">{REMINDER_TEMPLATE_PRESETS.thank_you.message}</p>
                            </div>
                            <div className="space-y-2">
                              <Label>Send Date & Time (24 hours after completion)</Label>
                              <Input name="scheduledFor" type="datetime-local" required data-testid="input-thankyou-date" />
                            </div>
                            <div className="flex items-center gap-2">
                              <Checkbox id="thankyou-sms" name="sendSms" data-testid="checkbox-thankyou-sms" />
                              <Label htmlFor="thankyou-sms" className="text-sm">Also send SMS to students who opted in</Label>
                            </div>
                            <DialogFooter>
                              <Button type="submit" disabled={createReminderMutation.isPending} data-testid="button-submit-thankyou">Schedule</Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full" data-testid="button-add-reminder">
                          <Plus className="mr-2 h-4 w-4" />
                          Custom Reminder
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Schedule a Custom Reminder</DialogTitle>
                          <DialogDescription>
                            Create a custom email reminder for your students
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          const formData = new FormData(e.currentTarget);
                          createReminderMutation.mutate({
                            title: formData.get("title") as string,
                            message: formData.get("message") as string,
                            scheduledFor: formData.get("scheduledFor") as string,
                            audience: "all_students",
                            templateType: "custom",
                            sendSms: formData.get("sendSms") === "on",
                          });
                          (e.target as HTMLFormElement).reset();
                        }} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="reminder-title">Title</Label>
                            <Input
                              id="reminder-title"
                              name="title"
                              placeholder="e.g., Weekly Submission Reminder"
                              required
                              data-testid="input-reminder-title"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="reminder-message">Message</Label>
                            <textarea
                              id="reminder-message"
                              name="message"
                              placeholder="e.g., Simulation inputs are due by 11:59PM tonight..."
                              required
                              className="w-full min-h-[100px] px-3 py-2 text-sm rounded-md border border-input bg-background"
                              data-testid="input-reminder-message"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="reminder-date">Send Date & Time</Label>
                            <Input
                              id="reminder-date"
                              name="scheduledFor"
                              type="datetime-local"
                              required
                              data-testid="input-reminder-date"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Checkbox id="custom-sms" name="sendSms" data-testid="checkbox-custom-sms" />
                            <Label htmlFor="custom-sms" className="text-sm">Also send SMS to students who opted in</Label>
                          </div>
                          <DialogFooter>
                            <Button 
                              type="submit" 
                              disabled={createReminderMutation.isPending}
                              data-testid="button-submit-reminder"
                            >
                              Schedule Reminder
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {reminders.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No reminders scheduled yet
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {reminders.map((reminder) => (
                        <div 
                          key={reminder.id} 
                          className="flex items-center justify-between p-3 border rounded-md"
                          data-testid={`reminder-${reminder.id}`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm">{reminder.title}</p>
                              {reminder.sendSms && (
                                <Badge variant="outline" className="text-xs">+SMS</Badge>
                              )}
                              {reminder.audience === "no_submission" && (
                                <Badge variant="secondary" className="text-xs">Conditional</Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {new Date(reminder.scheduledFor).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={
                              reminder.status === "sent" ? "default" :
                              reminder.status === "pending" ? "secondary" :
                              reminder.status === "failed" ? "destructive" :
                              "outline"
                            }>
                              {reminder.status}
                            </Badge>
                            {reminder.status === "pending" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => cancelReminderMutation.mutate(reminder.id)}
                                disabled={cancelReminderMutation.isPending}
                                aria-label="Cancel reminder"
                                data-testid={`button-cancel-reminder-${reminder.id}`}
                              >
                                <UserMinus className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5" />
                  External Grading Module
                </CardTitle>
                <CardDescription>
                  Grade student responses submitted through Blackboard or other LMS platforms with AI-powered rubric feedback
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground max-w-md">
                    Paste essay text, upload student visualizations, and receive detailed rubric scores powered by AI. Supports single responses and bulk CSV grading.
                  </p>
                  <a href="/grade">
                    <Button variant="outline" data-testid="button-external-grading">
                      <FileCheck className="h-4 w-4 mr-2" />
                      Open Grading Module
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Post-Simulation Feedback Survey
                </CardTitle>
                <CardDescription>
                  Embed a Google Form to collect student feedback after the simulation ends
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Create your Google Form, then copy the embed URL. For best results, set your form width to <strong>max 640px</strong>. Height can be 600-800px for typical surveys.
                  </AlertDescription>
                </Alert>
                <div className="space-y-2">
                  <Label htmlFor="feedbackFormUrl">Google Form Embed URL</Label>
                  <Input
                    id="feedbackFormUrl"
                    type="url"
                    placeholder="https://docs.google.com/forms/d/e/.../viewform?embedded=true"
                    defaultValue={simulation?.feedbackFormUrl || ""}
                    onBlur={(e) => {
                      if (e.target.value !== simulation?.feedbackFormUrl) {
                        updateSimulationMutation.mutate({ feedbackFormUrl: e.target.value });
                      }
                    }}
                    data-testid="input-feedback-form-url"
                  />
                  <p className="text-xs text-muted-foreground">
                    In Google Forms: Click "Send" → Embed icon (&lt;/&gt;) → Copy the src URL from the iframe code
                  </p>
                </div>
                {simulation?.feedbackFormUrl && (
                  <div className="border rounded-md overflow-hidden">
                    <iframe
                      src={simulation.feedbackFormUrl}
                      width="100%"
                      height="400"
                      frameBorder="0"
                      marginHeight={0}
                      marginWidth={0}
                      className="bg-background"
                      title="Feedback Survey Preview"
                      data-testid="iframe-feedback-preview"
                    >
                      Loading...
                    </iframe>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      </div>
    </div>
  );
}
