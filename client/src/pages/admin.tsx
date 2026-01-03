import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Users, Plus, Shield, ArrowLeft, LayoutDashboard, User as UserIcon, FileText, BarChart3, Trophy } from "lucide-react";
import { Link } from "wouter";

interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  teamId: string | null;
  isAdmin: string;
}

interface Team {
  id: string;
  name: string;
  members: string[];
  currentWeek: number;
}

export default function AdminPage() {
  const { toast } = useToast();
  const [newTeamName, setNewTeamName] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");

  const { data: currentUser, isLoading: userLoading } = useQuery<UserData>({
    queryKey: ["/api/auth/user"],
  });

  const { data: users = [], isLoading: usersLoading } = useQuery<UserData[]>({
    queryKey: ["/api/admin/users"],
    enabled: currentUser?.isAdmin === "true",
  });

  const { data: teams = [], isLoading: teamsLoading } = useQuery<Team[]>({
    queryKey: ["/api/admin/teams"],
    enabled: currentUser?.isAdmin === "true",
  });

  const createTeamMutation = useMutation({
    mutationFn: async (name: string) => {
      return apiRequest("POST", "/api/admin/teams", { name, members: ["admin"] });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/teams"] });
      setNewTeamName("");
      toast({ title: "Team created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error creating team", description: error.message, variant: "destructive" });
    },
  });

  const assignTeamMutation = useMutation({
    mutationFn: async ({ userId, teamId }: { userId: string; teamId: string }) => {
      return apiRequest("POST", "/api/admin/assign-team", { userId, teamId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/teams"] });
      setSelectedUserId("");
      setSelectedTeamId("");
      toast({ title: "User assigned to team" });
    },
    onError: (error: any) => {
      toast({ title: "Error assigning team", description: error.message, variant: "destructive" });
    },
  });

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (currentUser?.isAdmin !== "true") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Shield className="h-16 w-16 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground">You do not have admin privileges.</p>
        <Link href="/">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Admin Console</h1>
            <p className="text-muted-foreground">Manage teams and user assignments</p>
          </div>
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Quick Navigation</CardTitle>
            <CardDescription>Jump to game areas or your profile</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" asChild data-testid="nav-dashboard">
                <Link href="/">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild data-testid="nav-briefing">
                <Link href="/briefing">
                  <FileText className="mr-2 h-4 w-4" />
                  Briefing
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild data-testid="nav-analytics">
                <Link href="/analytics">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Analytics
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild data-testid="nav-leaderboard">
                <Link href="/leaderboard">
                  <Trophy className="mr-2 h-4 w-4" />
                  Leaderboard
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild data-testid="nav-profile">
                <Link href="/profile">
                  <UserIcon className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create Team
              </CardTitle>
              <CardDescription>Create a new team for the simulation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="teamName">Team Name</Label>
                <Input
                  id="teamName"
                  placeholder="e.g., Team Alpha"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  data-testid="input-team-name"
                />
              </div>
              <Button
                onClick={() => createTeamMutation.mutate(newTeamName)}
                disabled={!newTeamName.trim() || createTeamMutation.isPending}
                data-testid="button-create-team"
              >
                {createTeamMutation.isPending ? "Creating..." : "Create Team"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Assign User to Team
              </CardTitle>
              <CardDescription>Add a user to an existing team</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Select User</Label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger data-testid="select-user">
                    <SelectValue placeholder="Choose a user..." />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.firstName} {user.lastName} ({user.email})
                        {user.teamId && " - Already assigned"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Select Team</Label>
                <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                  <SelectTrigger data-testid="select-team">
                    <SelectValue placeholder="Choose a team..." />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name} ({team.members.length} members)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={() => assignTeamMutation.mutate({ userId: selectedUserId, teamId: selectedTeamId })}
                disabled={!selectedUserId || !selectedTeamId || assignTeamMutation.isPending}
                data-testid="button-assign-team"
              >
                {assignTeamMutation.isPending ? "Assigning..." : "Assign to Team"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Teams</CardTitle>
            <CardDescription>All teams in the simulation</CardDescription>
          </CardHeader>
          <CardContent>
            {teamsLoading ? (
              <p className="text-muted-foreground">Loading teams...</p>
            ) : teams.length === 0 ? (
              <p className="text-muted-foreground">No teams created yet.</p>
            ) : (
              <div className="space-y-3">
                {teams.map((team) => (
                  <div key={team.id} className="flex items-center justify-between gap-4 p-3 rounded-md bg-muted/50">
                    <div>
                      <p className="font-medium">{team.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Week {team.currentWeek} | {team.members.length} members
                      </p>
                    </div>
                    <Badge variant="outline">ID: {team.id}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>All registered users</CardDescription>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <p className="text-muted-foreground">Loading users...</p>
            ) : users.length === 0 ? (
              <p className="text-muted-foreground">No users registered yet.</p>
            ) : (
              <div className="space-y-3">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between gap-4 p-3 rounded-md bg-muted/50">
                    <div className="space-y-1">
                      <p className="font-medium">
                        {user.firstName} {user.lastName}
                        {user.isAdmin === "true" && (
                          <Badge variant="secondary" className="ml-2">Admin</Badge>
                        )}
                        {user.schoolEmailVerified === "true" && (
                          <Badge variant="outline" className="ml-2 bg-green-500/10 text-green-600 border-green-500/20">Verified</Badge>
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      {user.schoolEmail && (
                        <p className="text-xs text-muted-foreground">
                          School: {user.schoolEmail}
                          {user.schoolEmailVerified !== "true" && user.verificationCode && (
                            <span className="ml-2 font-mono text-primary">Code: {user.verificationCode}</span>
                          )}
                        </p>
                      )}
                      {user.institution && (
                        <p className="text-xs text-muted-foreground">Institution: {user.institution}</p>
                      )}
                    </div>
                    <div>
                      {user.teamId ? (
                        <Badge>Team Assigned</Badge>
                      ) : (
                        <Badge variant="outline">No Team</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
