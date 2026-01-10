import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  Settings,
  RefreshCw
} from "lucide-react";
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

interface Organization {
  id: string;
  code: string;
  name: string;
  description?: string;
  ownerId: string;
  maxMembers: number;
  isActive: boolean;
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

interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isAdmin: string;
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

  const { data: roleInfo, isLoading: roleLoading } = useQuery<RoleInfo>({
    queryKey: ["/api/my-role"],
  });

  const { data: organizations = [], isLoading: orgsLoading, refetch: refetchOrgs } = useQuery<Organization[]>({
    queryKey: ["/api/super-admin/organizations"],
    enabled: roleInfo?.isSuperAdmin === true,
  });

  const { data: allUsers = [] } = useQuery<UserData[]>({
    queryKey: ["/api/admin/users"],
    enabled: roleInfo?.isSuperAdmin === true,
  });

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

  const generateInviteMutation = useMutation({
    mutationFn: async (data: { organizationId: string; maxUses?: number; expiresAt?: string }) => {
      return apiRequest("POST", "/api/super-admin/invites", data);
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/super-admin/organizations"] });
      toast({ 
        title: "Invite code generated", 
        description: `Code: ${data.code}` 
      });
    },
    onError: (error: any) => {
      toast({ title: "Error generating invite", description: error.message, variant: "destructive" });
    },
  });

  const promoteToClassAdminMutation = useMutation({
    mutationFn: async (data: { userId: string; organizationId: string }) => {
      return apiRequest("POST", "/api/super-admin/promote-class-admin", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/super-admin/organizations"] });
      setPromoteEmail("");
      setSelectedOrgId("");
      toast({ title: "User promoted to Class Admin" });
    },
    onError: (error: any) => {
      toast({ title: "Error promoting user", description: error.message, variant: "destructive" });
    },
  });

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
            <Button variant="outline" onClick={() => refetchOrgs()} data-testid="button-refresh">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Link href="/">
              <Button variant="outline" data-testid="button-back">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        </div>

        <Tabs defaultValue="organizations" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="organizations" data-testid="tab-organizations">
              <Building2 className="mr-2 h-4 w-4" />
              Organizations
            </TabsTrigger>
            <TabsTrigger value="promote" data-testid="tab-promote">
              <UserPlus className="mr-2 h-4 w-4" />
              Promote Admins
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
                      <Label htmlFor="org-phone">SMS Notification Phone (optional)</Label>
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
                          <Badge variant={org.isActive ? "default" : "secondary"}>
                            {org.isActive ? "Active" : "Inactive"}
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
                            onClick={() => generateInviteMutation.mutate({ organizationId: org.id })}
                            disabled={generateInviteMutation.isPending}
                            data-testid={`button-new-invite-${org.id}`}
                          >
                            <Key className="mr-2 h-3 w-3" />
                            New Invite Code
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

            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
                <CardDescription>View all registered users on the platform</CardDescription>
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
                          <Badge variant={user.isAdmin === "true" ? "default" : "secondary"}>
                            {user.isAdmin === "true" ? "Admin" : "User"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Platform Settings</CardTitle>
                <CardDescription>Global configuration for the simulation platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">Require .edu Email</p>
                      <p className="text-sm text-muted-foreground">Only allow students with verified .edu emails</p>
                    </div>
                    <Badge variant="default">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">Team Code Required</p>
                      <p className="text-sm text-muted-foreground">Students must have a valid team code to join</p>
                    </div>
                    <Badge variant="default">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">Competition Mode</p>
                      <p className="text-sm text-muted-foreground">Current simulation competition setting</p>
                    </div>
                    <Badge variant="secondary">Team-based</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
