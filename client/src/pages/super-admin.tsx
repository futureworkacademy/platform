import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Building2, 
  Users, 
  Plus, 
  Shield, 
  ArrowLeft, 
  Key, 
  Copy, 
  UserPlus,
  UserCheck,
  Settings,
  RefreshCw,
  Pencil,
  MessageSquare,
  Save,
  Loader2,
  Mail,
  MoreHorizontal,
  UserX,
  UserMinus,
  UsersRound,
  Trash2
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "wouter";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Organization {
  id: string;
  code: string;
  name: string;
  description?: string;
  ownerId: string;
  maxMembers: number;
  status: string;
  notifyPhone?: string;
  notifyOnSignup?: boolean;
  createdAt: string;
}

interface OrganizationMember {
  id: string;
  userId: string;
  organizationId: string;
  role: string;
  status: string;
  joinedAt: string;
  user?: {
    email: string;
    firstName: string;
    lastName: string;
  };
}

interface RoleInfo {
  role: string;
  isSuperAdmin: boolean;
  isClassAdmin: boolean;
  membershipCount: number;
  memberships: OrganizationMember[];
}

interface PlatformSettings {
  id: string;
  requireEduEmail: boolean;
  requireTeamCode: boolean;
  competitionMode: "individual" | "team";
  totalWeeks: number;
  scoringWeightFinancial: number;
  scoringWeightCultural: number;
  easterEggBonusEnabled: boolean;
  easterEggBonusPercentage: number;
  updatedAt: string;
  updatedBy?: string;
}

interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isAdmin: string;
}

interface AllMemberData {
  id: string;
  organizationId: string;
  userId: string;
  role: string;
  status: string;
  joinedAt: string;
  orgName: string;
  email: string;
  firstName: string;
  lastName: string;
  hasAccount: boolean;
}

// Unified person data from the new people API
interface UnifiedPerson {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string | null;
  role: 'super_admin' | 'class_admin' | 'student';
  status: 'active' | 'pending' | 'invited' | 'never_invited' | 'deactivated';
  hasAccount: boolean;
  organizationId: string | null;
  organizationName: string | null;
  organizationCode: string | null;
  teamId: string | null;
  teamName: string | null;
  memberId: string | null;
  joinedAt: string | null;
  allMemberships: Array<{
    organizationId: string;
    organizationName: string;
    role: string;
    status: string;
  }>;
}

interface TeamData {
  id: string;
  name: string;
  organizationId: string;
  orgName: string;
}

export default function SuperAdminPage() {
  const { toast } = useToast();
  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgDescription, setNewOrgDescription] = useState("");
  const [newOrgMaxMembers, setNewOrgMaxMembers] = useState(100);
  const [newOrgNotifyPhone, setNewOrgNotifyPhone] = useState("");
  const [promoteEmail, setPromoteEmail] = useState("");
  const [selectedOrgId, setSelectedOrgId] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editMaxMembers, setEditMaxMembers] = useState(100);
  const [editNotifyPhone, setEditNotifyPhone] = useState("");
  const [editNotifyOnSignup, setEditNotifyOnSignup] = useState(true);
  const [editStatus, setEditStatus] = useState("active");
  const [activeTab, setActiveTab] = useState("organizations");

  const { data: roleInfo, isLoading: roleLoading } = useQuery<RoleInfo>({
    queryKey: ["/api/my-role"],
  });

  const { data: organizations = [], isLoading: orgsLoading, refetch: refetchOrgs } = useQuery<Organization[]>({
    queryKey: ["/api/super-admin/organizations"],
    enabled: roleInfo?.isSuperAdmin === true,
  });

  const { data: allUsers = [], refetch: refetchUsers } = useQuery<UserData[]>({
    queryKey: ["/api/admin/users"],
    enabled: roleInfo?.isSuperAdmin === true,
  });

  // All organization members (including bulk imported students) - legacy
  const { data: allMembers = [], refetch: refetchMembers } = useQuery<AllMemberData[]>({
    queryKey: ["/api/super-admin/all-members"],
    enabled: roleInfo?.isSuperAdmin === true,
  });

  // Unified people data - new combined view
  const { data: allPeople = [], isLoading: peopleLoading, refetch: refetchPeople } = useQuery<UnifiedPerson[]>({
    queryKey: ["/api/super-admin/people"],
    enabled: roleInfo?.isSuperAdmin === true,
  });

  // People tab state
  const [peopleSearch, setPeopleSearch] = useState("");
  const [peopleStatusFilter, setPeopleStatusFilter] = useState<string>("all");
  const [peopleRoleFilter, setPeopleRoleFilter] = useState<string>("all");
  const [peopleOrgFilter, setPeopleOrgFilter] = useState<string>("all");
  const [resendingFor, setResendingFor] = useState<string | null>(null);
  const [resendChannel, setResendChannel] = useState<"email" | "sms" | "both">("email");
  
  // Promote dialog state
  const [promoteDialogOpen, setPromoteDialogOpen] = useState(false);
  const [promotingPerson, setPromotingPerson] = useState<UnifiedPerson | null>(null);
  const [promoteTargetOrgId, setPromoteTargetOrgId] = useState<string>("");

  // Edit user dialog state
  const [editUserDialogOpen, setEditUserDialogOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<UnifiedPerson | null>(null);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editProfileImageUrl, setEditProfileImageUrl] = useState("");

  // Change team dialog state
  const [teamDialogOpen, setTeamDialogOpen] = useState(false);
  const [teamChangePerson, setTeamChangePerson] = useState<UnifiedPerson | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");

  // All teams for team assignment
  const { data: allTeams = [] } = useQuery<TeamData[]>({
    queryKey: ["/api/super-admin/teams"],
    enabled: roleInfo?.isSuperAdmin === true,
  });

  // Platform Settings
  const { data: platformSettings, isLoading: settingsLoading, refetch: refetchSettings } = useQuery<PlatformSettings>({
    queryKey: ["/api/platform-settings"],
    enabled: roleInfo?.isSuperAdmin === true,
  });

  // Email Templates
  const { data: emailTemplates, isLoading: emailTemplatesLoading, refetch: refetchEmailTemplates } = useQuery<any[]>({
    queryKey: ["/api/email-templates"],
    enabled: roleInfo?.isSuperAdmin === true,
  });

  const [showEmailTemplateDialog, setShowEmailTemplateDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [editTemplateForm, setEditTemplateForm] = useState({
    name: "",
    subject: "",
    htmlContent: "",
    textContent: "",
  });

  const updateEmailTemplateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return apiRequest("PUT", `/api/email-templates/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/email-templates"] });
      setShowEmailTemplateDialog(false);
      setEditingTemplate(null);
      toast({ title: "Email template updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error updating template", description: error.message, variant: "destructive" });
    },
  });

  const resetEmailTemplatesMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/email-templates/reset", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/email-templates"] });
      toast({ title: "Email templates reset to defaults" });
    },
    onError: (error: any) => {
      toast({ title: "Error resetting templates", description: error.message, variant: "destructive" });
    },
  });

  const [localSettings, setLocalSettings] = useState<Partial<PlatformSettings>>({});
  const [settingsChanged, setSettingsChanged] = useState(false);

  // Sync local settings when platform settings load
  const currentSettings = {
    requireEduEmail: localSettings.requireEduEmail ?? platformSettings?.requireEduEmail ?? true,
    requireTeamCode: localSettings.requireTeamCode ?? platformSettings?.requireTeamCode ?? true,
    competitionMode: localSettings.competitionMode ?? platformSettings?.competitionMode ?? "individual",
    totalWeeks: localSettings.totalWeeks ?? platformSettings?.totalWeeks ?? 8,
    scoringWeightFinancial: localSettings.scoringWeightFinancial ?? platformSettings?.scoringWeightFinancial ?? 50,
    scoringWeightCultural: localSettings.scoringWeightCultural ?? platformSettings?.scoringWeightCultural ?? 50,
    easterEggBonusEnabled: localSettings.easterEggBonusEnabled ?? platformSettings?.easterEggBonusEnabled ?? true,
    easterEggBonusPercentage: localSettings.easterEggBonusPercentage ?? platformSettings?.easterEggBonusPercentage ?? 5,
  };

  const updateLocalSetting = <K extends keyof PlatformSettings>(key: K, value: PlatformSettings[K]) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
    setSettingsChanged(true);
  };

  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: Partial<PlatformSettings>) => {
      return apiRequest("PUT", "/api/admin/platform-settings", settings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/platform-settings"] });
      setLocalSettings({});
      setSettingsChanged(false);
      toast({ title: "Settings saved successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error saving settings", description: error.message, variant: "destructive" });
    },
  });

  const handleSaveSettings = () => {
    updateSettingsMutation.mutate(currentSettings);
  };

  const handleRefresh = () => {
    switch (activeTab) {
      case "organizations":
        refetchOrgs();
        toast({ title: "Organizations refreshed" });
        break;
      case "people":
        refetchPeople();
        toast({ title: "People data refreshed" });
        break;
      case "content":
        // Future: refresh content data when implemented
        toast({ title: "Content refreshed" });
        break;
      case "simulation":
        // Future: refresh simulation data when implemented
        toast({ title: "Simulation data refreshed" });
        break;
      case "activity":
        // Future: refresh activity logs when implemented
        toast({ title: "Activity logs refreshed" });
        break;
      case "settings":
        refetchSettings();
        setLocalSettings({});
        setSettingsChanged(false);
        toast({ title: "Settings refreshed" });
        break;
      default:
        refetchOrgs();
    }
  };

  const createOrgMutation = useMutation({
    mutationFn: async (data: { name: string; description: string; maxMembers: number; notifyPhone?: string }) => {
      return apiRequest("POST", "/api/super-admin/organizations", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/super-admin/organizations"] });
      setNewOrgName("");
      setNewOrgDescription("");
      setNewOrgMaxMembers(100);
      setNewOrgNotifyPhone("");
      setCreateDialogOpen(false);
      toast({ title: "Organization created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error creating organization", description: error.message, variant: "destructive" });
    },
  });


  const promoteToClassAdminMutation = useMutation({
    mutationFn: async (data: { userId: string; organizationId: string }) => {
      return apiRequest("POST", "/api/super-admin/promote-class-admin", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/super-admin/organizations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/super-admin/people"] });
      setPromoteEmail("");
      setSelectedOrgId("");
      setPromoteDialogOpen(false);
      setPromotingPerson(null);
      setPromoteTargetOrgId("");
      toast({ title: "User promoted to Class Admin" });
    },
    onError: (error: any) => {
      toast({ title: "Error promoting user", description: error.message, variant: "destructive" });
    },
  });

  const updateOrgMutation = useMutation({
    mutationFn: async (data: { id: string; name: string; description: string; maxMembers: number; notifyPhone?: string; notifyOnSignup: boolean; status: string }) => {
      const response = await apiRequest("PUT", `/api/super-admin/organizations/${data.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/super-admin/organizations"] });
      setEditDialogOpen(false);
      setEditingOrg(null);
      toast({ title: "Organization updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error updating organization", description: error.message, variant: "destructive" });
    },
  });

  // Resend invitation email to organization member
  const [sendingInviteFor, setSendingInviteFor] = useState<string | null>(null);
  const resendInviteMutation = useMutation({
    mutationFn: async ({ organizationId, memberId, personId }: { organizationId: string; memberId: string; personId: string }) => {
      setSendingInviteFor(memberId);
      setResendingFor(personId); // Use person.id for People tab loading state
      const response = await apiRequest("POST", `/api/class-admin/organizations/${organizationId}/members/${memberId}/send-invite`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/super-admin/all-members"] });
      queryClient.invalidateQueries({ queryKey: ["/api/super-admin/people"] });
      toast({ title: "Invitation email sent successfully" });
      setSendingInviteFor(null);
      setResendingFor(null);
    },
    onError: (error: any) => {
      toast({ title: "Failed to send invite", description: error.message, variant: "destructive" });
      setSendingInviteFor(null);
      setResendingFor(null);
    },
  });

  // Edit user mutation
  const editUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { firstName?: string; lastName?: string; email?: string; profileImageUrl?: string } }) => {
      const response = await apiRequest("PATCH", `/api/super-admin/people/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/super-admin/people"] });
      setEditUserDialogOpen(false);
      setEditingPerson(null);
      toast({ title: "User updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to update user", description: error.message, variant: "destructive" });
    },
  });

  // Change team mutation
  const changeTeamMutation = useMutation({
    mutationFn: async ({ userId, teamId }: { userId: string; teamId: string | null }) => {
      const response = await apiRequest("PATCH", `/api/super-admin/people/${userId}/team`, { teamId });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/super-admin/people"] });
      setTeamDialogOpen(false);
      setTeamChangePerson(null);
      toast({ title: "Team assignment updated" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to update team", description: error.message, variant: "destructive" });
    },
  });

  // Deactivate member mutation
  const deactivateMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const response = await apiRequest("POST", `/api/super-admin/people/${memberId}/deactivate`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/super-admin/people"] });
      toast({ title: "Member deactivated" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to deactivate member", description: error.message, variant: "destructive" });
    },
  });

  // Reactivate member mutation
  const reactivateMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const response = await apiRequest("POST", `/api/super-admin/people/${memberId}/reactivate`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/super-admin/people"] });
      toast({ title: "Member reactivated" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to reactivate member", description: error.message, variant: "destructive" });
    },
  });

  // Remove member from organization mutation
  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const response = await apiRequest("DELETE", `/api/super-admin/people/member/${memberId}`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/super-admin/people"] });
      toast({ title: "Member removed from organization" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to remove member", description: error.message, variant: "destructive" });
    },
  });

  // Helper to open edit user dialog
  const openEditUserDialog = (person: UnifiedPerson) => {
    setEditingPerson(person);
    setEditFirstName(person.firstName);
    setEditLastName(person.lastName);
    setEditEmail(person.email);
    setEditProfileImageUrl(person.profileImageUrl || "");
    setEditUserDialogOpen(true);
  };

  // Helper to open change team dialog
  const openTeamDialog = (person: UnifiedPerson) => {
    setTeamChangePerson(person);
    setSelectedTeamId(person.teamId || "");
    setTeamDialogOpen(true);
  };

  const openEditDialog = (org: Organization) => {
    setEditingOrg(org);
    setEditName(org.name);
    setEditDescription(org.description || "");
    setEditMaxMembers(org.maxMembers);
    setEditNotifyPhone(org.notifyPhone || "");
    setEditNotifyOnSignup(org.notifyOnSignup ?? true);
    setEditStatus(org.status);
    setEditDialogOpen(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  if (roleLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" data-testid="loading-state">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!roleInfo?.isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4" data-testid="access-denied">
        <Shield className="h-16 w-16 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground">Super Admin access is required.</p>
        <Link href="/">
          <Button variant="outline" data-testid="button-back-home">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              Super Admin Console
            </h1>
            <p className="text-muted-foreground">Platform-wide management and organization control</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRefresh} data-testid="button-refresh">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold" data-testid="text-org-count">{organizations.length}</p>
                  <p className="text-sm text-muted-foreground">Organizations</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <Users className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold" data-testid="text-user-count">{allUsers.length}</p>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <Key className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold" data-testid="text-membership-count">{roleInfo.membershipCount}</p>
                  <p className="text-sm text-muted-foreground">Your Memberships</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Link href="/educator-inquiries">
            <Card className="cursor-pointer hover-elevate transition-all h-full" data-testid="card-educator-inquiries">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-500/10 rounded-lg">
                    <MessageSquare className="h-6 w-6 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-lg font-bold">Educator Inquiries</p>
                    <p className="text-sm text-muted-foreground">View & manage leads</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="organizations" data-testid="tab-organizations">
              <Building2 className="mr-2 h-4 w-4" />
              Organizations
            </TabsTrigger>
            <TabsTrigger value="people" data-testid="tab-people">
              <Users className="mr-2 h-4 w-4" />
              People
            </TabsTrigger>
            <TabsTrigger value="content" data-testid="tab-content">
              <Pencil className="mr-2 h-4 w-4" />
              Content
            </TabsTrigger>
            <TabsTrigger value="simulation" data-testid="tab-simulation">
              <RefreshCw className="mr-2 h-4 w-4" />
              Simulation
            </TabsTrigger>
            <TabsTrigger value="activity" data-testid="tab-activity">
              <MessageSquare className="mr-2 h-4 w-4" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="settings" data-testid="tab-settings">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="organizations" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">All Organizations</h2>
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-create-org">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Organization
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Organization</DialogTitle>
                    <DialogDescription>
                      Create a new organization for a class or institution. A unique team code will be generated automatically.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="org-name">Organization Name</Label>
                      <Input
                        id="org-name"
                        placeholder="e.g., MBA 2026 Spring Cohort"
                        value={newOrgName}
                        onChange={(e) => setNewOrgName(e.target.value)}
                        data-testid="input-org-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="org-description">Description (optional)</Label>
                      <Textarea
                        id="org-description"
                        placeholder="Brief description of this organization..."
                        value={newOrgDescription}
                        onChange={(e) => setNewOrgDescription(e.target.value)}
                        data-testid="input-org-description"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="org-max">Max Members</Label>
                      <Input
                        id="org-max"
                        type="number"
                        value={newOrgMaxMembers}
                        onChange={(e) => setNewOrgMaxMembers(parseInt(e.target.value) || 100)}
                        data-testid="input-org-max-members"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="org-phone">Admin Phone for Signup Alerts (optional)</Label>
                      <Input
                        id="org-phone"
                        type="tel"
                        placeholder="+1234567890"
                        value={newOrgNotifyPhone}
                        onChange={(e) => setNewOrgNotifyPhone(e.target.value)}
                        data-testid="input-org-phone"
                      />
                      <p className="text-xs text-muted-foreground">
                        Receive SMS alerts when students sign up. Include country code.
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={() => createOrgMutation.mutate({
                        name: newOrgName,
                        description: newOrgDescription,
                        maxMembers: newOrgMaxMembers,
                        notifyPhone: newOrgNotifyPhone || undefined,
                      })}
                      disabled={!newOrgName || createOrgMutation.isPending}
                      data-testid="button-submit-org"
                    >
                      {createOrgMutation.isPending ? "Creating..." : "Create Organization"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Organization</DialogTitle>
                    <DialogDescription>
                      Update organization details. Changes will apply immediately.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-name">Organization Name</Label>
                      <Input
                        id="edit-name"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        data-testid="input-edit-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-description">Description</Label>
                      <Textarea
                        id="edit-description"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        data-testid="input-edit-description"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-max">Max Members</Label>
                      <Input
                        id="edit-max"
                        type="number"
                        value={editMaxMembers}
                        onChange={(e) => setEditMaxMembers(parseInt(e.target.value) || 100)}
                        data-testid="input-edit-max-members"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-phone">Admin Phone for Signup Alerts</Label>
                      <Input
                        id="edit-phone"
                        type="tel"
                        placeholder="+1234567890"
                        value={editNotifyPhone}
                        onChange={(e) => setEditNotifyPhone(e.target.value)}
                        data-testid="input-edit-phone"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="edit-notify">SMS Notifications</Label>
                        <p className="text-xs text-muted-foreground">Receive SMS alerts on student signup</p>
                      </div>
                      <Switch
                        id="edit-notify"
                        checked={editNotifyOnSignup}
                        onCheckedChange={setEditNotifyOnSignup}
                        data-testid="switch-edit-notify"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-status">Status</Label>
                      <select
                        id="edit-status"
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                        data-testid="select-edit-status"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setEditDialogOpen(false)}
                      data-testid="button-cancel-edit"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        if (editingOrg) {
                          updateOrgMutation.mutate({
                            id: editingOrg.id,
                            name: editName,
                            description: editDescription,
                            maxMembers: editMaxMembers,
                            notifyPhone: editNotifyPhone || undefined,
                            notifyOnSignup: editNotifyOnSignup,
                            status: editStatus,
                          });
                        }
                      }}
                      disabled={!editName || updateOrgMutation.isPending}
                      data-testid="button-submit-edit"
                    >
                      {updateOrgMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {orgsLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading organizations...</div>
            ) : organizations.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No organizations yet. Create your first one to get started.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {organizations.map((org) => (
                  <Card key={org.id} data-testid={`card-org-${org.id}`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <CardTitle className="text-lg">{org.name}</CardTitle>
                          <CardDescription>{org.description || "No description"}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={org.status === "active" ? "default" : "secondary"}>
                            {org.status === "active" ? "Active" : org.status === "inactive" ? "Inactive" : org.status}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-6 text-sm">
                          <div>
                            <span className="text-muted-foreground">Team Code: </span>
                            <code className="bg-muted px-2 py-1 rounded font-mono" data-testid={`text-code-${org.id}`}>
                              {org.code}
                            </code>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 ml-1"
                              onClick={() => copyToClipboard(org.code)}
                              data-testid={`button-copy-code-${org.id}`}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Max Members: </span>
                            <span>{org.maxMembers}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Created: </span>
                            <span>{new Date(org.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(org)}
                            data-testid={`button-edit-${org.id}`}
                          >
                            <Pencil className="mr-2 h-3 w-3" />
                            Edit
                          </Button>
                          <Link href={`/class-admin?org=${org.id}`}>
                            <Button variant="outline" size="sm" data-testid={`button-manage-${org.id}`}>
                              <Users className="mr-2 h-3 w-3" />
                              Manage
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* New unified People tab */}
          <TabsContent value="people" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">People Management</h2>
              <Button variant="outline" onClick={() => refetchPeople()} data-testid="button-refresh-people">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>

            {/* Filters and Search */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="people-search">Search</Label>
                    <Input
                      id="people-search"
                      placeholder="Search by name or email..."
                      value={peopleSearch}
                      onChange={(e) => setPeopleSearch(e.target.value)}
                      data-testid="input-people-search"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={peopleStatusFilter} onValueChange={setPeopleStatusFilter}>
                      <SelectTrigger data-testid="select-people-status">
                        <SelectValue placeholder="All Statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="invited">Invited</SelectItem>
                        <SelectItem value="deactivated">Deactivated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Select value={peopleRoleFilter} onValueChange={setPeopleRoleFilter}>
                      <SelectTrigger data-testid="select-people-role">
                        <SelectValue placeholder="All Roles" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                        <SelectItem value="class_admin">Class Admin</SelectItem>
                        <SelectItem value="student">Student</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Organization</Label>
                    <Select value={peopleOrgFilter} onValueChange={setPeopleOrgFilter}>
                      <SelectTrigger data-testid="select-people-org">
                        <SelectValue placeholder="All Organizations" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Organizations</SelectItem>
                        <SelectItem value="none">No Organization</SelectItem>
                        {organizations.map((org) => (
                          <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* People Table */}
            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
                <CardDescription>
                  Unified view of all platform users showing account status, role, organization, and team assignment.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {peopleLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-2 font-medium text-muted-foreground">Name</th>
                          <th className="text-left py-3 px-2 font-medium text-muted-foreground">Email</th>
                          <th className="text-left py-3 px-2 font-medium text-muted-foreground">Status</th>
                          <th className="text-left py-3 px-2 font-medium text-muted-foreground">Role</th>
                          <th className="text-left py-3 px-2 font-medium text-muted-foreground">Organization</th>
                          <th className="text-left py-3 px-2 font-medium text-muted-foreground">Team</th>
                          <th className="text-right py-3 px-2 font-medium text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allPeople
                          .filter((person) => {
                            // Search filter
                            if (peopleSearch) {
                              const searchLower = peopleSearch.toLowerCase();
                              const nameMatch = `${person.firstName} ${person.lastName}`.toLowerCase().includes(searchLower);
                              const emailMatch = person.email.toLowerCase().includes(searchLower);
                              if (!nameMatch && !emailMatch) return false;
                            }
                            // Status filter
                            if (peopleStatusFilter !== "all" && person.status !== peopleStatusFilter) return false;
                            // Role filter
                            if (peopleRoleFilter !== "all" && person.role !== peopleRoleFilter) return false;
                            // Org filter
                            if (peopleOrgFilter === "none" && person.organizationId) return false;
                            if (peopleOrgFilter !== "all" && peopleOrgFilter !== "none" && person.organizationId !== peopleOrgFilter) return false;
                            return true;
                          })
                          .map((person) => (
                            <tr key={person.id} className="border-b hover:bg-muted/50" data-testid={`row-person-${person.id}`}>
                              <td className="py-3 px-2">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-8 w-8">
                                    {person.profileImageUrl && (
                                      <AvatarImage src={person.profileImageUrl} alt={`${person.firstName} ${person.lastName}`} />
                                    )}
                                    <AvatarFallback className="text-xs">
                                      {(person.firstName?.[0] || "").toUpperCase()}{(person.lastName?.[0] || "").toUpperCase() || "?"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <p className="font-medium">
                                    {person.firstName || person.lastName 
                                      ? `${person.firstName} ${person.lastName}`.trim() 
                                      : "—"}
                                  </p>
                                </div>
                              </td>
                              <td className="py-3 px-2">
                                <p className="text-sm text-muted-foreground">{person.email || "No email"}</p>
                              </td>
                              <td className="py-3 px-2">
                                <Badge 
                                  variant={person.status === "active" ? "default" : "secondary"}
                                  className={`min-w-[5.5rem] justify-center ${
                                    person.status === "active" ? "bg-green-500/10 text-green-600 border-green-500/20" :
                                    person.status === "pending" ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
                                    person.status === "invited" ? "bg-blue-500/10 text-blue-600 border-blue-500/20" :
                                    person.status === "deactivated" ? "bg-red-500/10 text-red-600 border-red-500/20" :
                                    ""
                                  }`}
                                  data-testid={`badge-status-${person.id}`}
                                >
                                  {person.status === "active" && "Active"}
                                  {person.status === "pending" && "Pending"}
                                  {person.status === "invited" && "Invited"}
                                  {person.status === "never_invited" && "Not Invited"}
                                  {person.status === "deactivated" && "Deactivated"}
                                </Badge>
                              </td>
                              <td className="py-3 px-2">
                                <Badge 
                                  variant="outline"
                                  className={`min-w-[5.5rem] justify-center ${
                                    person.role === "super_admin" ? "border-purple-500/50 text-purple-600" :
                                    person.role === "class_admin" ? "border-blue-500/50 text-blue-600" :
                                    ""
                                  }`}
                                  data-testid={`badge-role-${person.id}`}
                                >
                                  {person.role === "super_admin" && "Super Admin"}
                                  {person.role === "class_admin" && "Class Admin"}
                                  {person.role === "student" && "Student"}
                                </Badge>
                              </td>
                              <td className="py-3 px-2">
                                <p className="text-sm">{person.organizationName || "—"}</p>
                              </td>
                              <td className="py-3 px-2">
                                <p className="text-sm">{person.teamName || "—"}</p>
                              </td>
                              <td className="py-3 px-2 text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" data-testid={`button-actions-${person.id}`}>
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    {person.memberId && (
                                      <DropdownMenuItem 
                                        onClick={() => {
                                          resendInviteMutation.mutate({ 
                                            organizationId: person.organizationId!, 
                                            memberId: person.memberId!,
                                            personId: person.id
                                          });
                                        }}
                                        disabled={resendingFor === person.id}
                                        data-testid={`button-resend-${person.id}`}
                                      >
                                        {resendingFor === person.id ? (
                                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        ) : (
                                          <Mail className="h-4 w-4 mr-2" />
                                        )}
                                        {resendingFor === person.id ? "Sending..." : "Resend Invite"}
                                      </DropdownMenuItem>
                                    )}
                                    {/* Edit User - only for users with accounts */}
                                    {person.hasAccount && (
                                      <DropdownMenuItem 
                                        onClick={() => openEditUserDialog(person)}
                                        data-testid={`button-edit-${person.id}`}
                                      >
                                        <Pencil className="h-4 w-4 mr-2" />
                                        Edit Details
                                      </DropdownMenuItem>
                                    )}
                                    {/* Change Team - only for users with accounts and org membership */}
                                    {person.hasAccount && person.organizationId && (
                                      <DropdownMenuItem 
                                        onClick={() => openTeamDialog(person)}
                                        data-testid={`button-change-team-${person.id}`}
                                      >
                                        <UsersRound className="h-4 w-4 mr-2" />
                                        Change Team
                                      </DropdownMenuItem>
                                    )}
                                    {/* Promote to Admin - only for students with accounts */}
                                    {person.role === "student" && person.hasAccount && (
                                      <DropdownMenuItem 
                                        onClick={() => {
                                          setPromotingPerson(person);
                                          setPromoteTargetOrgId(person.organizationId || "");
                                          setPromoteDialogOpen(true);
                                        }}
                                        data-testid={`button-promote-${person.id}`}
                                      >
                                        <UserPlus className="h-4 w-4 mr-2" />
                                        Promote to Admin
                                      </DropdownMenuItem>
                                    )}
                                    {/* Deactivate - for active org members */}
                                    {person.memberId && person.status === "active" && (
                                      <DropdownMenuItem 
                                        onClick={() => {
                                          if (confirm(`Are you sure you want to deactivate ${person.firstName} ${person.lastName}? They will be removed from their team but can be reactivated later.`)) {
                                            deactivateMemberMutation.mutate(person.memberId!);
                                          }
                                        }}
                                        className="text-amber-600"
                                        data-testid={`button-deactivate-${person.id}`}
                                      >
                                        <UserX className="h-4 w-4 mr-2" />
                                        Deactivate
                                      </DropdownMenuItem>
                                    )}
                                    {/* Reactivate - for deactivated org members */}
                                    {person.memberId && person.status === "deactivated" && (
                                      <DropdownMenuItem 
                                        onClick={() => {
                                          reactivateMemberMutation.mutate(person.memberId!);
                                        }}
                                        className="text-green-600"
                                        data-testid={`button-reactivate-${person.id}`}
                                      >
                                        <UserCheck className="h-4 w-4 mr-2" />
                                        Reactivate
                                      </DropdownMenuItem>
                                    )}
                                    {/* Remove from Org - for org members */}
                                    {person.memberId && (
                                      <DropdownMenuItem 
                                        onClick={() => {
                                          if (confirm(`Are you sure you want to remove ${person.firstName || person.email || "this user"} from ${person.organizationName}? This action cannot be undone.`)) {
                                            removeMemberMutation.mutate(person.memberId!);
                                          }
                                        }}
                                        className="text-destructive"
                                        data-testid={`button-remove-${person.id}`}
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Remove from Org
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                    {allPeople.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">No users found.</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Placeholder Content tab - will be expanded later */}
          <TabsContent value="content" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Content Management</CardTitle>
                <CardDescription>Manage About page, email templates, and simulation content.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">About Page</Label>
                    <p className="text-sm text-muted-foreground">Edit your profile photo and bio</p>
                  </div>
                  <Link href="/about">
                    <Button variant="outline" data-testid="button-edit-about-content">
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit About Page
                    </Button>
                  </Link>
                </div>
                <Separator />
                <div className="space-y-0.5">
                  <Label className="text-base">Simulation Content</Label>
                  <p className="text-sm text-muted-foreground">Weekly briefings, videos, and resources - coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Placeholder Simulation tab - will be expanded later */}
          <TabsContent value="simulation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Simulation Control</CardTitle>
                <CardDescription>Manage simulation lifecycle and game mechanics.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Simulation controls will be migrated here from the old settings.</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Placeholder Activity tab - will be expanded later */}
          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Activity Log</CardTitle>
                <CardDescription>Track user actions and system events.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Activity logs will be migrated here from the old settings.</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Legacy users tab - keeping for now but hidden */}
          <TabsContent value="users" className="space-y-4 hidden">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">User Management</h2>
              <Button variant="outline" onClick={() => { refetchUsers(); refetchMembers(); }} data-testid="button-refresh-users">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Registered Platform Users</CardTitle>
                <CardDescription>
                  Users who have created accounts via Replit Auth. Note: Replit sends its own verification emails to new users - those are separate from our SendGrid invitation emails.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {allUsers.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No users registered yet.</p>
                  ) : (
                    <div className="divide-y">
                      {allUsers.map((user) => (
                        <div key={user.id} className="flex items-center justify-between py-2" data-testid={`row-user-${user.id}`}>
                          <div>
                            <p className="font-medium">{user.firstName} {user.lastName}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                          <Badge variant={user.isAdmin === "true" || user.isAdmin === "super_admin" ? "default" : "secondary"}>
                            {user.isAdmin === "super_admin" ? "Super Admin" : user.isAdmin === "true" ? "Admin" : "User"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Organization Members</CardTitle>
                <CardDescription>
                  All students added to organizations (via enrollment or bulk import). Shows account status and organization assignment.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {allMembers.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No organization members yet.</p>
                  ) : (
                    <div className="divide-y">
                      {allMembers.map((member) => (
                        <div key={member.id} className="flex items-center justify-between py-3 gap-4" data-testid={`row-member-${member.id}`}>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium">{member.firstName} {member.lastName}</p>
                            <p className="text-sm text-muted-foreground truncate">{member.email}</p>
                            <p className="text-xs text-muted-foreground">
                              {member.orgName} • Joined {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                          <div className="flex gap-2 items-center flex-shrink-0">
                            <Badge variant={member.hasAccount ? "default" : "outline"}>
                              {member.hasAccount ? "Has Account" : "Invited Only"}
                            </Badge>
                            <Badge variant={member.status === "active" ? "default" : "secondary"}>
                              {member.role}
                            </Badge>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" data-testid={`button-member-actions-${member.id}`}>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem 
                                  onClick={() => resendInviteMutation.mutate({ 
                                    organizationId: member.organizationId, 
                                    memberId: member.id,
                                    personId: member.userId || member.id
                                  })}
                                  disabled={sendingInviteFor === member.id}
                                  data-testid={`button-resend-invite-${member.id}`}
                                >
                                  {sendingInviteFor === member.id ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  ) : (
                                    <Mail className="h-4 w-4 mr-2" />
                                  )}
                                  {sendingInviteFor === member.id ? "Sending..." : "Resend Invite Email"}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="promote" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Promote User to Class Admin</CardTitle>
                <CardDescription>
                  Give a user Class Admin privileges for a specific organization. They will be able to manage teams and students.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="promote-email">User Email</Label>
                    <Input
                      id="promote-email"
                      type="email"
                      placeholder="professor@university.edu"
                      value={promoteEmail}
                      onChange={(e) => setPromoteEmail(e.target.value)}
                      data-testid="input-promote-email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="promote-org">Organization</Label>
                    <select
                      id="promote-org"
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                      value={selectedOrgId}
                      onChange={(e) => setSelectedOrgId(e.target.value)}
                      data-testid="select-promote-org"
                    >
                      <option value="">Select organization...</option>
                      {organizations.map((org) => (
                        <option key={org.id} value={org.id}>{org.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    const user = allUsers.find(u => u.email === promoteEmail);
                    if (user && selectedOrgId) {
                      promoteToClassAdminMutation.mutate({ userId: user.id, organizationId: selectedOrgId });
                    } else {
                      toast({ title: "User not found", description: "Please enter a valid email", variant: "destructive" });
                    }
                  }}
                  disabled={!promoteEmail || !selectedOrgId || promoteToClassAdminMutation.isPending}
                  data-testid="button-promote"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  {promoteToClassAdminMutation.isPending ? "Promoting..." : "Promote to Class Admin"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            {settingsLoading ? (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </CardContent>
              </Card>
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Enrollment Settings</CardTitle>
                    <CardDescription>Control how students can join the platform</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between" data-testid="setting-require-edu-email">
                      <div className="space-y-0.5">
                        <Label className="text-base">Require .edu Email</Label>
                        <p className="text-sm text-muted-foreground">Only allow students with verified .edu emails</p>
                      </div>
                      <Switch
                        checked={currentSettings.requireEduEmail}
                        onCheckedChange={(checked) => updateLocalSetting("requireEduEmail", checked)}
                        data-testid="switch-require-edu-email"
                      />
                    </div>
                    <div className="flex items-center justify-between" data-testid="setting-require-team-code">
                      <div className="space-y-0.5">
                        <Label className="text-base">Team Code Required</Label>
                        <p className="text-sm text-muted-foreground">Students must have a valid team code to join</p>
                      </div>
                      <Switch
                        checked={currentSettings.requireTeamCode}
                        onCheckedChange={(checked) => updateLocalSetting("requireTeamCode", checked)}
                        data-testid="switch-require-team-code"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Competition Settings</CardTitle>
                    <CardDescription>Configure how teams compete and are scored</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3" data-testid="setting-competition-mode">
                      <Label className="text-base">Competition Mode</Label>
                      <p className="text-sm text-muted-foreground mb-2">
                        Individual: Students scored separately. Team: Team score is average of member scores.
                      </p>
                      <Select
                        value={currentSettings.competitionMode}
                        onValueChange={(value: "individual" | "team") => updateLocalSetting("competitionMode", value)}
                      >
                        <SelectTrigger className="w-[200px]" data-testid="select-competition-mode">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="individual">Individual</SelectItem>
                          <SelectItem value="team">Team-based</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3" data-testid="setting-total-weeks">
                      <Label className="text-base">Simulation Duration</Label>
                      <p className="text-sm text-muted-foreground">Number of weeks in the simulation: {currentSettings.totalWeeks}</p>
                      <Slider
                        value={[currentSettings.totalWeeks]}
                        onValueChange={([value]) => updateLocalSetting("totalWeeks", value)}
                        min={4}
                        max={8}
                        step={1}
                        className="w-full max-w-md"
                        data-testid="slider-total-weeks"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground max-w-md">
                        <span>4 weeks</span>
                        <span>8 weeks</span>
                      </div>
                      <p className="text-xs text-muted-foreground italic">Additional weeks (9-12) coming soon</p>
                    </div>

                    <div className="space-y-3" data-testid="setting-scoring-weights">
                      <Label className="text-base">Scoring Weights</Label>
                      <p className="text-sm text-muted-foreground">
                        Financial: {currentSettings.scoringWeightFinancial}% | Cultural: {currentSettings.scoringWeightCultural}%
                      </p>
                      <Slider
                        value={[currentSettings.scoringWeightFinancial]}
                        onValueChange={([value]) => {
                          updateLocalSetting("scoringWeightFinancial", value);
                          updateLocalSetting("scoringWeightCultural", 100 - value);
                        }}
                        min={0}
                        max={100}
                        step={5}
                        className="w-full max-w-md"
                        data-testid="slider-scoring-weights"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground max-w-md">
                        <span>100% Cultural</span>
                        <span>Balanced</span>
                        <span>100% Financial</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Content Management</CardTitle>
                    <CardDescription>Manage public-facing content and email templates</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">About Page</Label>
                        <p className="text-sm text-muted-foreground">Edit your profile photo and bio on the About page</p>
                      </div>
                      <Link href="/about">
                        <Button variant="outline" data-testid="button-edit-about-page">
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit About Page
                        </Button>
                      </Link>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Email Templates</Label>
                          <p className="text-sm text-muted-foreground">Customize email content sent to students</p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => resetEmailTemplatesMutation.mutate()}
                          disabled={resetEmailTemplatesMutation.isPending}
                          data-testid="button-reset-email-templates"
                        >
                          <RefreshCw className={`h-4 w-4 mr-2 ${resetEmailTemplatesMutation.isPending ? 'animate-spin' : ''}`} />
                          Reset to Defaults
                        </Button>
                      </div>
                      
                      {emailTemplatesLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                      ) : emailTemplates && emailTemplates.length > 0 ? (
                        <div className="space-y-3">
                          {emailTemplates.map((template: any) => (
                            <div 
                              key={template.id} 
                              className="flex items-center justify-between p-3 border rounded-md hover-elevate"
                              data-testid={`email-template-${template.templateType}`}
                            >
                              <div className="space-y-0.5">
                                <p className="font-medium">{template.name}</p>
                                <p className="text-sm text-muted-foreground">{template.subject}</p>
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setEditingTemplate(template);
                                  setEditTemplateForm({
                                    name: template.name,
                                    subject: template.subject,
                                    htmlContent: template.htmlContent,
                                    textContent: template.textContent,
                                  });
                                  setShowEmailTemplateDialog(true);
                                }}
                                data-testid={`button-edit-template-${template.templateType}`}
                              >
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground py-4 text-center">No email templates found</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Easter Egg Bonus</CardTitle>
                    <CardDescription>Reward students who reference research in their decisions</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between" data-testid="setting-easter-egg-enabled">
                      <div className="space-y-0.5">
                        <Label className="text-base">Enable Easter Egg Bonus</Label>
                        <p className="text-sm text-muted-foreground">Award bonus points for citing research materials</p>
                      </div>
                      <Switch
                        checked={currentSettings.easterEggBonusEnabled}
                        onCheckedChange={(checked) => updateLocalSetting("easterEggBonusEnabled", checked)}
                        data-testid="switch-easter-egg-enabled"
                      />
                    </div>

                    {currentSettings.easterEggBonusEnabled && (
                      <div className="space-y-3" data-testid="setting-easter-egg-percentage">
                        <Label className="text-base">Bonus Percentage</Label>
                        <p className="text-sm text-muted-foreground">
                          Maximum bonus: {currentSettings.easterEggBonusPercentage}% of total score
                        </p>
                        <Slider
                          value={[currentSettings.easterEggBonusPercentage]}
                          onValueChange={([value]) => updateLocalSetting("easterEggBonusPercentage", value)}
                          min={0}
                          max={20}
                          step={1}
                          className="w-full max-w-md"
                          data-testid="slider-easter-egg-percentage"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground max-w-md">
                          <span>0%</span>
                          <span>20%</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="border-t pt-4">
                    <div className="flex items-center justify-between w-full">
                      <div className="text-sm text-muted-foreground">
                        {settingsChanged ? (
                          <span className="text-amber-600">You have unsaved changes</span>
                        ) : (
                          platformSettings?.updatedAt && (
                            <span>Last updated: {new Date(platformSettings.updatedAt).toLocaleDateString()}</span>
                          )
                        )}
                      </div>
                      <Button 
                        onClick={handleSaveSettings}
                        disabled={!settingsChanged || updateSettingsMutation.isPending}
                        data-testid="button-save-settings"
                      >
                        {updateSettingsMutation.isPending ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        Save Settings
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Email Template Edit Dialog */}
      <Dialog open={showEmailTemplateDialog} onOpenChange={setShowEmailTemplateDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Email Template</DialogTitle>
            <DialogDescription>
              Customize the email content. Use placeholders like {"{{studentName}}"}, {"{{className}}"}, {"{{instructorName}}"}, {"{{loginUrl}}"}, {"{{toEmail}}"}, {"{{subject}}"}, {"{{message}}"} which will be replaced with actual values when sending.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Template Name</Label>
              <Input
                value={editTemplateForm.name}
                onChange={(e) => setEditTemplateForm({ ...editTemplateForm, name: e.target.value })}
                placeholder="Template name"
                data-testid="input-template-name"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Subject Line</Label>
              <Input
                value={editTemplateForm.subject}
                onChange={(e) => setEditTemplateForm({ ...editTemplateForm, subject: e.target.value })}
                placeholder="Email subject"
                data-testid="input-template-subject"
              />
            </div>
            
            <div className="space-y-2">
              <Label>HTML Content</Label>
              <Textarea
                value={editTemplateForm.htmlContent}
                onChange={(e) => setEditTemplateForm({ ...editTemplateForm, htmlContent: e.target.value })}
                placeholder="HTML email body"
                className="min-h-[200px] font-mono text-sm"
                data-testid="textarea-template-html"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Plain Text Content</Label>
              <Textarea
                value={editTemplateForm.textContent}
                onChange={(e) => setEditTemplateForm({ ...editTemplateForm, textContent: e.target.value })}
                placeholder="Plain text email body"
                className="min-h-[100px]"
                data-testid="textarea-template-text"
              />
            </div>
          </div>
          
          <DialogFooter className="gap-2 flex-wrap">
            <Button 
              variant="outline" 
              onClick={() => setShowEmailTemplateDialog(false)}
              data-testid="button-cancel-template"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (editingTemplate) {
                  updateEmailTemplateMutation.mutate({
                    id: editingTemplate.id,
                    data: editTemplateForm,
                  });
                }
              }}
              disabled={updateEmailTemplateMutation.isPending}
              data-testid="button-save-template"
            >
              {updateEmailTemplateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Template
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Promote User Dialog for People Tab */}
      <Dialog open={promoteDialogOpen} onOpenChange={(open) => {
        setPromoteDialogOpen(open);
        if (!open) {
          setPromotingPerson(null);
          setPromoteTargetOrgId("");
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Promote to Class Admin</DialogTitle>
            <DialogDescription>
              Promote {promotingPerson?.firstName} {promotingPerson?.lastName} ({promotingPerson?.email}) to Class Admin for an organization.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Organization</Label>
              <Select value={promoteTargetOrgId} onValueChange={setPromoteTargetOrgId}>
                <SelectTrigger data-testid="select-promote-org">
                  <SelectValue placeholder="Select an organization" />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPromoteDialogOpen(false)} data-testid="button-cancel-promote">
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (promotingPerson && promoteTargetOrgId) {
                  promoteToClassAdminMutation.mutate({ 
                    userId: promotingPerson.id, 
                    organizationId: promoteTargetOrgId 
                  });
                }
              }}
              disabled={!promoteTargetOrgId || promoteToClassAdminMutation.isPending}
              data-testid="button-confirm-promote"
            >
              {promoteToClassAdminMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Promoting...
                </>
              ) : (
                "Promote to Class Admin"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editUserDialogOpen} onOpenChange={(open) => {
        setEditUserDialogOpen(open);
        if (!open) {
          setEditingPerson(null);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Details</DialogTitle>
            <DialogDescription>
              Update information for {editingPerson?.firstName} {editingPerson?.lastName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                {editProfileImageUrl && (
                  <AvatarImage src={editProfileImageUrl} alt="Profile" />
                )}
                <AvatarFallback className="text-lg">
                  {(editFirstName?.[0] || "").toUpperCase()}{(editLastName?.[0] || "").toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Label htmlFor="edit-profile-url">Profile Image URL</Label>
                <Input
                  id="edit-profile-url"
                  value={editProfileImageUrl}
                  onChange={(e) => setEditProfileImageUrl(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  data-testid="input-edit-profile-url"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-first-name">First Name</Label>
                <Input
                  id="edit-first-name"
                  value={editFirstName}
                  onChange={(e) => setEditFirstName(e.target.value)}
                  data-testid="input-edit-first-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-last-name">Last Name</Label>
                <Input
                  id="edit-last-name"
                  value={editLastName}
                  onChange={(e) => setEditLastName(e.target.value)}
                  data-testid="input-edit-last-name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                data-testid="input-edit-email"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUserDialogOpen(false)} data-testid="button-cancel-edit">
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (editingPerson) {
                  editUserMutation.mutate({ 
                    id: editingPerson.id, 
                    data: {
                      firstName: editFirstName,
                      lastName: editLastName,
                      email: editEmail,
                      profileImageUrl: editProfileImageUrl || undefined
                    }
                  });
                }
              }}
              disabled={editUserMutation.isPending}
              data-testid="button-save-edit"
            >
              {editUserMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Team Dialog */}
      <Dialog open={teamDialogOpen} onOpenChange={(open) => {
        setTeamDialogOpen(open);
        if (!open) {
          setTeamChangePerson(null);
          setSelectedTeamId("");
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Team Assignment</DialogTitle>
            <DialogDescription>
              Update team for {teamChangePerson?.firstName} {teamChangePerson?.lastName}
              {teamChangePerson?.organizationName && ` (${teamChangePerson.organizationName})`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Team</Label>
              <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                <SelectTrigger data-testid="select-team">
                  <SelectValue placeholder="Select a team (or leave empty to remove)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Team</SelectItem>
                  {allTeams
                    .filter(team => !teamChangePerson?.organizationId || team.organizationId === teamChangePerson.organizationId)
                    .map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name} {team.orgName && team.orgName !== teamChangePerson?.organizationName ? `(${team.orgName})` : ""}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Only teams from the user's organization are shown.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTeamDialogOpen(false)} data-testid="button-cancel-team">
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (teamChangePerson) {
                  changeTeamMutation.mutate({ 
                    userId: teamChangePerson.id, 
                    teamId: selectedTeamId === "none" ? null : selectedTeamId 
                  });
                }
              }}
              disabled={changeTeamMutation.isPending}
              data-testid="button-save-team"
            >
              {changeTeamMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Team"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
