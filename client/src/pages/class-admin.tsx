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
  Mail,
  Send
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  membershipCount: number;
  memberships: OrganizationMember[];
}

export default function ClassAdminPage() {
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

  const { data: roleInfo, isLoading: roleLoading } = useQuery<RoleInfo>({
    queryKey: ["/api/my-role"],
  });

  const { data: myOrganizations = [], isLoading: orgsLoading } = useQuery<Organization[]>({
    queryKey: ["/api/class-admin/my-organizations"],
    enabled: roleInfo?.isClassAdmin === true || roleInfo?.isSuperAdmin === true,
  });

  const { data: members = [], isLoading: membersLoading, refetch: refetchMembers } = useQuery<OrganizationMember[]>({
    queryKey: ["/api/class-admin/organizations", selectedOrgId, "members"],
    enabled: !!selectedOrgId && (roleInfo?.isClassAdmin === true || roleInfo?.isSuperAdmin === true),
  });

  const { data: teams = [], isLoading: teamsLoading, refetch: refetchTeams } = useQuery<Team[]>({
    queryKey: ["/api/class-admin/organizations", selectedOrgId, "teams"],
    enabled: !!selectedOrgId && (roleInfo?.isClassAdmin === true || roleInfo?.isSuperAdmin === true),
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
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          setCsvError("CSV file must have a header row and at least one data row");
          return;
        }

        // Parse header - support various column names
        const header = lines[0].toLowerCase().split(',').map(h => h.trim().replace(/"/g, ''));
        
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

        const parsed = lines.slice(1).map((line, idx) => {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
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
  const studentMembers = activeMembers.filter(m => m.role === "STUDENT");

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

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <GraduationCap className="h-8 w-8 text-primary" />
              {currentOrg?.name || "Class Admin Console"}
            </h1>
            <p className="text-muted-foreground">
              Manage students and teams for this class
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { refetchMembers(); refetchTeams(); }} data-testid="button-refresh">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            {myOrganizations.length > 1 && (
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
          <TabsList className="grid w-full grid-cols-3">
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
                            Upload a CSV file with student information. Required column: email.
                            Optional columns: student name, student ID, class level.
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
                              Expected columns: Student Name, Student ID, Class Level, Email
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
                            <Badge variant={member.role === "CLASS_ADMIN" ? "default" : "secondary"}>
                              {member.role === "CLASS_ADMIN" ? "Instructor" : "Student"}
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
                              {member.role === "STUDENT" && (
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
                                onClick={() => removeMemberMutation.mutate(member.id)}
                                disabled={removeMemberMutation.isPending}
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
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {teams.map((team) => {
                  const teamMembers = activeMembers.filter(m => m.user?.teamId === team.id);
                  return (
                    <Card key={team.id} data-testid={`card-team-${team.id}`}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{team.name}</CardTitle>
                        <CardDescription>Week {team.currentWeek}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p className="text-sm">
                            <span className="text-muted-foreground">Members: </span>
                            <span className="font-medium">{teamMembers.length}</span>
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {teamMembers.slice(0, 3).map((m) => (
                              <Badge key={m.id} variant="secondary" className="text-xs">
                                {m.user?.firstName}
                              </Badge>
                            ))}
                            {teamMembers.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{teamMembers.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
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
        </Tabs>
      </div>
    </div>
  );
}
