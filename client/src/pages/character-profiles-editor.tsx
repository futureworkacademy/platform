import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  ArrowLeft, Plus, Pencil, Trash2, Loader2, Save, UserCircle, 
  Wand2, Building, Briefcase, MessageSquare, Heart, AlertCircle,
  Users, Mic, Sparkles, Image, RefreshCw, Gauge, Zap, Target
} from "lucide-react";

interface SimulationModule {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  isDefault: boolean;
  isActive: boolean;
}

interface CharacterProfile {
  id: string;
  moduleId: string | null;
  name: string;
  role: string;
  title: string | null;
  company: string | null;
  headshotUrl: string | null;
  headshotPrompt: string | null;
  bio: string | null;
  personality: string | null;
  communicationStyle: string | null;
  motivations: string | null;
  fears: string | null;
  relationships: { characterId: string; relationshipType: string; description: string | null }[] | null;
  voiceDescription: string | null;
  voiceId: string | null;
  speakingStyleExamples: string[] | null;
  influence: number;
  hostility: number;
  flexibility: number;
  riskTolerance: number;
  impactCategories: string[] | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

const IMPACT_CATEGORIES = [
  { id: "labor", label: "Labor & Workforce" },
  { id: "finance", label: "Finance & Budget" },
  { id: "technology", label: "Technology & AI" },
  { id: "culture", label: "Culture & Values" },
  { id: "operations", label: "Operations" },
  { id: "strategy", label: "Strategy" },
  { id: "legal", label: "Legal & Compliance" },
  { id: "marketing", label: "Marketing" },
  { id: "executive", label: "Executive Decisions" },
  { id: "external", label: "External Relations" },
];

const CHARACTER_ROLES = [
  "CEO",
  "CFO",
  "COO",
  "CHRO",
  "CTO",
  "Union Leader",
  "HR Director",
  "Operations Manager",
  "Board Member",
  "Investor",
  "Employee Representative",
  "External Consultant",
  "Government Official",
  "Industry Analyst",
  "Ethics Advisor",
  "Technology Expert",
  "Other",
];

export default function CharacterProfilesEditor() {
  const { toast } = useToast();
  
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [editingProfile, setEditingProfile] = useState<CharacterProfile | null>(null);
  const [generatingHeadshot, setGeneratingHeadshot] = useState<string | null>(null);
  
  const [profileForm, setProfileForm] = useState({
    name: "",
    role: "",
    title: "",
    company: "",
    bio: "",
    personality: "",
    communicationStyle: "",
    motivations: "",
    fears: "",
    voiceDescription: "",
    influence: 5,
    hostility: 5,
    flexibility: 5,
    riskTolerance: 5,
    impactCategories: [] as string[],
    isActive: true,
    sortOrder: 0,
  });
  
  const { data: modules = [] } = useQuery<SimulationModule[]>({
    queryKey: ["/api/admin/simulation-modules"],
  });
  
  const { data: profiles = [], isLoading: loadingProfiles } = useQuery<CharacterProfile[]>({
    queryKey: ["/api/admin/character-profiles", selectedModule],
    queryFn: async () => {
      const url = selectedModule 
        ? `/api/admin/character-profiles?moduleId=${selectedModule}`
        : "/api/admin/character-profiles";
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch profiles");
      return res.json();
    },
  });
  
  const createMutation = useMutation({
    mutationFn: async (data: typeof profileForm & { moduleId?: string }) => {
      return apiRequest("POST", "/api/admin/character-profiles", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/character-profiles"] });
      setShowDialog(false);
      resetForm();
      toast({ title: "Character profile created" });
    },
    onError: () => {
      toast({ title: "Failed to create character profile", variant: "destructive" });
    },
  });
  
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof profileForm> }) => {
      return apiRequest("PUT", `/api/admin/character-profiles/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/character-profiles"] });
      setShowDialog(false);
      setEditingProfile(null);
      resetForm();
      toast({ title: "Character profile updated" });
    },
    onError: () => {
      toast({ title: "Failed to update character profile", variant: "destructive" });
    },
  });
  
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/character-profiles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/character-profiles"] });
      toast({ title: "Character profile deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete character profile", variant: "destructive" });
    },
  });
  
  const generateHeadshotMutation = useMutation({
    mutationFn: async ({ id, prompt }: { id: string; prompt?: string }) => {
      return apiRequest("POST", `/api/admin/character-profiles/${id}/generate-headshot`, { prompt });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/character-profiles"] });
      setGeneratingHeadshot(null);
      toast({ title: "Headshot generated successfully" });
    },
    onError: (error: any) => {
      setGeneratingHeadshot(null);
      toast({ title: error.message || "Failed to generate headshot", variant: "destructive" });
    },
  });
  
  const resetForm = () => {
    setProfileForm({
      name: "",
      role: "",
      title: "",
      company: "",
      bio: "",
      personality: "",
      communicationStyle: "",
      motivations: "",
      fears: "",
      voiceDescription: "",
      influence: 5,
      hostility: 5,
      flexibility: 5,
      riskTolerance: 5,
      impactCategories: [],
      isActive: true,
      sortOrder: 0,
    });
  };
  
  const openEditDialog = (profile: CharacterProfile) => {
    setEditingProfile(profile);
    setProfileForm({
      name: profile.name,
      role: profile.role,
      title: profile.title || "",
      company: profile.company || "",
      bio: profile.bio || "",
      personality: profile.personality || "",
      communicationStyle: profile.communicationStyle || "",
      motivations: profile.motivations || "",
      fears: profile.fears || "",
      voiceDescription: profile.voiceDescription || "",
      influence: profile.influence ?? 5,
      hostility: profile.hostility ?? 5,
      flexibility: profile.flexibility ?? 5,
      riskTolerance: profile.riskTolerance ?? 5,
      impactCategories: profile.impactCategories ?? [],
      isActive: profile.isActive,
      sortOrder: profile.sortOrder,
    });
    setShowDialog(true);
  };
  
  const handleSubmit = () => {
    if (!profileForm.name || !profileForm.role) {
      toast({ title: "Name and role are required", variant: "destructive" });
      return;
    }
    
    if (editingProfile) {
      updateMutation.mutate({ id: editingProfile.id, data: profileForm });
    } else {
      createMutation.mutate({
        ...profileForm,
        moduleId: selectedModule || undefined,
      });
    }
  };
  
  const handleGenerateHeadshot = (profile: CharacterProfile) => {
    setGeneratingHeadshot(profile.id);
    generateHeadshotMutation.mutate({ id: profile.id });
  };
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 px-4 max-w-7xl">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Character Profiles</h1>
            <p className="text-muted-foreground">
              Create and manage simulation characters with AI-generated headshots
            </p>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Label>Filter by Module</Label>
            <Select value={selectedModule || "all"} onValueChange={(v) => setSelectedModule(v === "all" ? null : v)}>
              <SelectTrigger data-testid="select-module-filter">
                <SelectValue placeholder="All modules" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All modules (including global)</SelectItem>
                {modules.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button 
              onClick={() => {
                setEditingProfile(null);
                resetForm();
                setShowDialog(true);
              }}
              data-testid="button-create-character"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Character
            </Button>
          </div>
        </div>
        
        {loadingProfiles ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : profiles.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <UserCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No Character Profiles</h3>
              <p className="text-muted-foreground mb-4">
                Create your first character to populate the simulation with immersive personas.
              </p>
              <Button onClick={() => setShowDialog(true)} data-testid="button-create-first-character">
                <Plus className="h-4 w-4 mr-2" />
                Create Character
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profiles.map((profile) => (
              <Card key={profile.id} className={!profile.isActive ? "opacity-60" : ""}>
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={profile.headshotUrl || undefined} alt={profile.name} />
                      <AvatarFallback className="text-lg">
                        {profile.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{profile.name}</CardTitle>
                      <CardDescription className="truncate">
                        {profile.title || profile.role}
                      </CardDescription>
                      {profile.company && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <Building className="h-3 w-3" />
                          <span className="truncate">{profile.company}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-1 mb-3">
                    <Badge variant="outline">{profile.role}</Badge>
                    {!profile.isActive && <Badge variant="secondary">Inactive</Badge>}
                    {profile.moduleId === null && (
                      <Badge variant="secondary">Global</Badge>
                    )}
                  </div>
                  
                  {profile.personality && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {profile.personality}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap gap-1 mb-3 text-xs">
                    <Badge variant="outline" className="text-[10px] px-1.5">
                      Inf: {profile.influence ?? 5}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] px-1.5">
                      Hos: {profile.hostility ?? 5}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] px-1.5">
                      Flex: {profile.flexibility ?? 5}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] px-1.5">
                      Risk: {profile.riskTolerance ?? 5}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openEditDialog(profile)}
                      data-testid={`button-edit-${profile.id}`}
                    >
                      <Pencil className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleGenerateHeadshot(profile)}
                      disabled={generatingHeadshot === profile.id}
                      data-testid={`button-generate-headshot-${profile.id}`}
                    >
                      {generatingHeadshot === profile.id ? (
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <Image className="h-3 w-3 mr-1" />
                      )}
                      {profile.headshotUrl ? "Regenerate" : "Generate"} Headshot
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-destructive"
                      onClick={() => {
                        if (confirm("Delete this character profile?")) {
                          deleteMutation.mutate(profile.id);
                        }
                      }}
                      data-testid={`button-delete-${profile.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProfile ? "Edit Character Profile" : "Create Character Profile"}
              </DialogTitle>
              <DialogDescription>
                {editingProfile 
                  ? "Update the character's details and personality traits."
                  : "Create a new character for your simulation. All characters get AI-generated headshots."}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g., Margaret Chen"
                    data-testid="input-name"
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role *</Label>
                  <Select 
                    value={profileForm.role} 
                    onValueChange={(v) => setProfileForm(f => ({ ...f, role: v }))}
                  >
                    <SelectTrigger data-testid="select-role">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {CHARACTER_ROLES.map((role) => (
                        <SelectItem key={role} value={role}>{role}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={profileForm.title}
                    onChange={(e) => setProfileForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="e.g., Chief Executive Officer"
                    data-testid="input-title"
                  />
                </div>
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={profileForm.company}
                    onChange={(e) => setProfileForm(f => ({ ...f, company: e.target.value }))}
                    placeholder="e.g., Apex Manufacturing"
                    data-testid="input-company"
                  />
                </div>
              </div>
              
              <Separator />
              
              <div>
                <Label htmlFor="bio" className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Bio & Background
                </Label>
                <Textarea
                  id="bio"
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm(f => ({ ...f, bio: e.target.value }))}
                  placeholder="Full backstory and career history..."
                  className="min-h-[80px]"
                  data-testid="input-bio"
                />
              </div>
              
              <div>
                <Label htmlFor="personality" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Personality Traits
                </Label>
                <Textarea
                  id="personality"
                  value={profileForm.personality}
                  onChange={(e) => setProfileForm(f => ({ ...f, personality: e.target.value }))}
                  placeholder="e.g., Analytical, risk-averse, data-driven decision maker..."
                  className="min-h-[60px]"
                  data-testid="input-personality"
                />
              </div>
              
              <div>
                <Label htmlFor="communicationStyle" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Communication Style
                </Label>
                <Textarea
                  id="communicationStyle"
                  value={profileForm.communicationStyle}
                  onChange={(e) => setProfileForm(f => ({ ...f, communicationStyle: e.target.value }))}
                  placeholder="How they speak and write: formal, casual, technical jargon..."
                  className="min-h-[60px]"
                  data-testid="input-communication-style"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="motivations" className="flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Motivations
                  </Label>
                  <Textarea
                    id="motivations"
                    value={profileForm.motivations}
                    onChange={(e) => setProfileForm(f => ({ ...f, motivations: e.target.value }))}
                    placeholder="What drives them..."
                    className="min-h-[60px]"
                    data-testid="input-motivations"
                  />
                </div>
                <div>
                  <Label htmlFor="fears" className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Fears & Concerns
                  </Label>
                  <Textarea
                    id="fears"
                    value={profileForm.fears}
                    onChange={(e) => setProfileForm(f => ({ ...f, fears: e.target.value }))}
                    placeholder="What worries them..."
                    className="min-h-[60px]"
                    data-testid="input-fears"
                  />
                </div>
              </div>
              
              <Separator />
              
              <div>
                <Label htmlFor="voiceDescription" className="flex items-center gap-2">
                  <Mic className="h-4 w-4" />
                  Voice Description (for AI voice synthesis)
                </Label>
                <Textarea
                  id="voiceDescription"
                  value={profileForm.voiceDescription}
                  onChange={(e) => setProfileForm(f => ({ ...f, voiceDescription: e.target.value }))}
                  placeholder="e.g., Deep, authoritative voice with a slight southern accent..."
                  className="min-h-[60px]"
                  data-testid="input-voice-description"
                />
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-primary" />
                  <h4 className="font-semibold">Simulation Mechanics</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  These traits determine how this character impacts decision difficulty, AI grading, and advisor recommendations.
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="influence">Influence</Label>
                      <span className="text-sm font-medium">{profileForm.influence}/10</span>
                    </div>
                    <Slider
                      id="influence"
                      value={[profileForm.influence]}
                      onValueChange={(v) => setProfileForm(f => ({ ...f, influence: v[0] }))}
                      min={1}
                      max={10}
                      step={1}
                      data-testid="slider-influence"
                    />
                    <p className="text-xs text-muted-foreground">How much sway over decisions</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="hostility">Hostility</Label>
                      <span className="text-sm font-medium">{profileForm.hostility}/10</span>
                    </div>
                    <Slider
                      id="hostility"
                      value={[profileForm.hostility]}
                      onValueChange={(v) => setProfileForm(f => ({ ...f, hostility: v[0] }))}
                      min={1}
                      max={10}
                      step={1}
                      data-testid="slider-hostility"
                    />
                    <p className="text-xs text-muted-foreground">How antagonistic to changes</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="flexibility">Flexibility</Label>
                      <span className="text-sm font-medium">{profileForm.flexibility}/10</span>
                    </div>
                    <Slider
                      id="flexibility"
                      value={[profileForm.flexibility]}
                      onValueChange={(v) => setProfileForm(f => ({ ...f, flexibility: v[0] }))}
                      min={1}
                      max={10}
                      step={1}
                      data-testid="slider-flexibility"
                    />
                    <p className="text-xs text-muted-foreground">How open to new approaches</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="riskTolerance">Risk Tolerance</Label>
                      <span className="text-sm font-medium">{profileForm.riskTolerance}/10</span>
                    </div>
                    <Slider
                      id="riskTolerance"
                      value={[profileForm.riskTolerance]}
                      onValueChange={(v) => setProfileForm(f => ({ ...f, riskTolerance: v[0] }))}
                      min={1}
                      max={10}
                      step={1}
                      data-testid="slider-risk-tolerance"
                    />
                    <p className="text-xs text-muted-foreground">Comfort with uncertainty</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Impact Categories
                  </Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Select which decision categories this character affects
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {IMPACT_CATEGORIES.map((cat) => (
                      <div key={cat.id} className="flex items-center gap-2">
                        <Checkbox
                          id={`cat-${cat.id}`}
                          checked={profileForm.impactCategories.includes(cat.id)}
                          onCheckedChange={(checked) => {
                            setProfileForm(f => ({
                              ...f,
                              impactCategories: checked
                                ? [...f.impactCategories, cat.id]
                                : f.impactCategories.filter(c => c !== cat.id)
                            }));
                          }}
                          data-testid={`checkbox-category-${cat.id}`}
                        />
                        <Label htmlFor={`cat-${cat.id}`} className="text-sm cursor-pointer">
                          {cat.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    id="isActive"
                    checked={profileForm.isActive}
                    onCheckedChange={(c) => setProfileForm(f => ({ ...f, isActive: c }))}
                    data-testid="switch-is-active"
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="sortOrder">Sort Order</Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    value={profileForm.sortOrder}
                    onChange={(e) => setProfileForm(f => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))}
                    className="w-20"
                    data-testid="input-sort-order"
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
                data-testid="button-submit"
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                <Save className="h-4 w-4 mr-2" />
                {editingProfile ? "Update" : "Create"} Character
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
