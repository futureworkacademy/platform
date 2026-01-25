import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { 
  ArrowLeft, Plus, Pencil, Trash2, FileText, Video, ExternalLink, 
  Loader2, Sparkles, RefreshCw, Save, ChevronDown, ChevronUp,
  Wand2, BookOpen, Target, BarChart3
} from "lucide-react";

interface SimulationModule {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SimulationContent {
  id: string;
  moduleId: string;
  weekNumber: number;
  title: string;
  contentType: string;
  content: string | null;
  embedUrl: string | null;
  resourceUrl: string | null;
  thumbnailUrl: string | null;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const CONTENT_TYPES = [
  { value: "text", label: "Text/Rich Content", icon: FileText },
  { value: "video", label: "Video Embed", icon: Video },
  { value: "google_doc", label: "Google Doc Embed", icon: BookOpen },
  { value: "link", label: "External Link", icon: ExternalLink },
];

const ENHANCEMENT_TYPES = [
  { value: "improve_clarity", label: "Improve Clarity", description: "Make content clearer and more professional" },
  { value: "expand_detail", label: "Expand Details", description: "Add more context and examples" },
  { value: "simplify", label: "Simplify", description: "Make content more accessible" },
  { value: "add_data", label: "Add Data Points", description: "Include relevant statistics and research" },
  { value: "generate_scenario", label: "Generate Scenario", description: "Create a decision scenario from context" },
];

export default function SimulationContentEditor() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [showModuleDialog, setShowModuleDialog] = useState(false);
  const [showContentDialog, setShowContentDialog] = useState(false);
  const [showEnhanceDialog, setShowEnhanceDialog] = useState(false);
  const [editingModule, setEditingModule] = useState<SimulationModule | null>(null);
  const [editingContent, setEditingContent] = useState<SimulationContent | null>(null);
  const [enhancingContent, setEnhancingContent] = useState<string>("");
  const [enhancementType, setEnhancementType] = useState<string>("improve_clarity");
  const [enhancedResult, setEnhancedResult] = useState<string>("");
  
  const [moduleForm, setModuleForm] = useState({
    name: "",
    description: "",
    slug: "",
    isDefault: false,
    isActive: true,
  });
  
  const [contentForm, setContentForm] = useState({
    title: "",
    contentType: "text",
    content: "",
    embedUrl: "",
    resourceUrl: "",
    thumbnailUrl: "",
    order: 0,
    isActive: true,
  });

  const { data: modules = [], isLoading: modulesLoading } = useQuery<SimulationModule[]>({
    queryKey: ["/api/admin/simulation-modules"],
  });

  const { data: contentItems = [], isLoading: contentLoading } = useQuery<SimulationContent[]>({
    queryKey: ["/api/admin/simulation-content", selectedModule],
    enabled: !!selectedModule,
  });

  const createModuleMutation = useMutation({
    mutationFn: async (data: typeof moduleForm) => {
      const res = await apiRequest("POST", "/api/admin/simulation-modules", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/simulation-modules"] });
      setShowModuleDialog(false);
      resetModuleForm();
      toast({ title: "Module created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create module", variant: "destructive" });
    },
  });

  const updateModuleMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof moduleForm }) => {
      const res = await apiRequest("PUT", `/api/admin/simulation-modules/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/simulation-modules"] });
      setShowModuleDialog(false);
      setEditingModule(null);
      resetModuleForm();
      toast({ title: "Module updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update module", variant: "destructive" });
    },
  });

  const deleteModuleMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/admin/simulation-modules/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/simulation-modules"] });
      setSelectedModule(null);
      toast({ title: "Module deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete module", variant: "destructive" });
    },
  });

  const createContentMutation = useMutation({
    mutationFn: async (data: typeof contentForm & { moduleId: string; weekNumber: number }) => {
      const res = await apiRequest("POST", "/api/admin/simulation-content", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/simulation-content", selectedModule] });
      setShowContentDialog(false);
      resetContentForm();
      toast({ title: "Content created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create content", variant: "destructive" });
    },
  });

  const updateContentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof contentForm }) => {
      const res = await apiRequest("PUT", `/api/admin/simulation-content/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/simulation-content", selectedModule] });
      setShowContentDialog(false);
      setEditingContent(null);
      resetContentForm();
      toast({ title: "Content updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update content", variant: "destructive" });
    },
  });

  const deleteContentMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/admin/simulation-content/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/simulation-content", selectedModule] });
      toast({ title: "Content deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete content", variant: "destructive" });
    },
  });

  const enhanceContentMutation = useMutation({
    mutationFn: async ({ content, enhancementType, context }: { content: string; enhancementType: string; context?: string }) => {
      const res = await apiRequest("POST", "/api/admin/simulation-content/enhance", { content, enhancementType, context });
      return res.json();
    },
    onSuccess: (data: { enhancedContent: string }) => {
      setEnhancedResult(data.enhancedContent);
      toast({ title: "Content enhanced successfully" });
    },
    onError: () => {
      toast({ title: "Failed to enhance content", variant: "destructive" });
    },
  });

  const resetModuleForm = () => {
    setModuleForm({ name: "", description: "", slug: "", isDefault: false, isActive: true });
  };

  const resetContentForm = () => {
    setContentForm({ title: "", contentType: "text", content: "", embedUrl: "", resourceUrl: "", thumbnailUrl: "", order: 0, isActive: true });
  };

  const handleEditModule = (module: SimulationModule) => {
    setEditingModule(module);
    setModuleForm({
      name: module.name,
      description: module.description || "",
      slug: module.slug,
      isDefault: module.isDefault,
      isActive: module.isActive,
    });
    setShowModuleDialog(true);
  };

  const handleEditContent = (content: SimulationContent) => {
    setEditingContent(content);
    setContentForm({
      title: content.title,
      contentType: content.contentType,
      content: content.content || "",
      embedUrl: content.embedUrl || "",
      resourceUrl: content.resourceUrl || "",
      thumbnailUrl: content.thumbnailUrl || "",
      order: content.order,
      isActive: content.isActive,
    });
    setShowContentDialog(true);
  };

  const handleSaveModule = () => {
    if (editingModule) {
      updateModuleMutation.mutate({ id: editingModule.id, data: moduleForm });
    } else {
      createModuleMutation.mutate(moduleForm);
    }
  };

  const handleSaveContent = () => {
    if (!selectedModule) return;
    if (editingContent) {
      updateContentMutation.mutate({ id: editingContent.id, data: contentForm });
    } else {
      createContentMutation.mutate({ ...contentForm, moduleId: selectedModule, weekNumber: selectedWeek });
    }
  };

  const handleEnhance = () => {
    if (!enhancingContent) return;
    enhanceContentMutation.mutate({ content: enhancingContent, enhancementType });
  };

  const applyEnhancement = () => {
    setContentForm((prev) => ({ ...prev, content: enhancedResult }));
    setShowEnhanceDialog(false);
    setEnhancedResult("");
    setEnhancingContent("");
  };

  const openEnhanceDialog = () => {
    setEnhancingContent(contentForm.content);
    setEnhancedResult("");
    setShowEnhanceDialog(true);
  };

  const weekContentItems = contentItems.filter((item) => item.weekNumber === selectedWeek);

  if (modulesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 px-4 max-w-7xl">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/super-admin">
            <Button variant="outline" size="icon" data-testid="button-back">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Simulation Content Editor</h1>
            <p className="text-muted-foreground">Manage weekly briefings, research reports, and decision scenarios</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <CardTitle className="text-lg">Modules</CardTitle>
                <Button 
                  size="sm" 
                  onClick={() => { resetModuleForm(); setEditingModule(null); setShowModuleDialog(true); }}
                  data-testid="button-add-module"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-2">
                {modules.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No modules yet. Create one to get started.</p>
                ) : (
                  modules.map((module) => (
                    <div
                      key={module.id}
                      className={`p-3 rounded-md border cursor-pointer transition-colors ${
                        selectedModule === module.id ? "bg-primary/10 border-primary" : "hover-elevate"
                      }`}
                      onClick={() => setSelectedModule(module.id)}
                      data-testid={`module-${module.slug}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm truncate">{module.name}</span>
                        <div className="flex gap-1">
                          {module.isDefault && <Badge variant="secondary">Default</Badge>}
                          {!module.isActive && <Badge variant="outline">Inactive</Badge>}
                        </div>
                      </div>
                      {module.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{module.description}</p>
                      )}
                      <div className="flex gap-1 mt-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => { e.stopPropagation(); handleEditModule(module); }}
                          data-testid={`button-edit-module-${module.slug}`}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm("Delete this module and all its content?")) {
                              deleteModuleMutation.mutate(module.id);
                            }
                          }}
                          data-testid={`button-delete-module-${module.slug}`}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            {!selectedModule ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Select a Module</h3>
                  <p className="text-muted-foreground text-center">
                    Choose a simulation module from the left to manage its weekly content
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{modules.find((m) => m.id === selectedModule)?.name}</CardTitle>
                      <CardDescription>
                        {modules.find((m) => m.id === selectedModule)?.description || "Manage content for each week"}
                      </CardDescription>
                    </div>
                    <Select value={String(selectedWeek)} onValueChange={(v) => setSelectedWeek(Number(v))}>
                      <SelectTrigger className="w-32" data-testid="select-week">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((week) => (
                          <SelectItem key={week} value={String(week)}>
                            Week {week}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">Week {selectedWeek} Content</h3>
                    <Button
                      size="sm"
                      onClick={() => { resetContentForm(); setEditingContent(null); setShowContentDialog(true); }}
                      data-testid="button-add-content"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Content
                    </Button>
                  </div>

                  {contentLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : weekContentItems.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No content for Week {selectedWeek} yet</p>
                      <p className="text-sm">Click "Add Content" to create briefings, research reports, or scenarios</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {weekContentItems.sort((a, b) => a.order - b.order).map((item) => {
                        const TypeIcon = CONTENT_TYPES.find((t) => t.value === item.contentType)?.icon || FileText;
                        return (
                          <div
                            key={item.id}
                            className="flex items-start gap-3 p-4 border rounded-md hover-elevate"
                            data-testid={`content-item-${item.id}`}
                          >
                            <div className="p-2 bg-muted rounded">
                              <TypeIcon className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium truncate">{item.title}</h4>
                                {!item.isActive && <Badge variant="outline">Draft</Badge>}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {CONTENT_TYPES.find((t) => t.value === item.contentType)?.label} · Order: {item.order}
                              </p>
                              {item.content && (
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.content}</p>
                              )}
                            </div>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditContent(item)}
                                data-testid={`button-edit-content-${item.id}`}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  if (confirm("Delete this content?")) {
                                    deleteContentMutation.mutate(item.id);
                                  }
                                }}
                                data-testid={`button-delete-content-${item.id}`}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <Dialog open={showModuleDialog} onOpenChange={setShowModuleDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingModule ? "Edit Module" : "Create Module"}</DialogTitle>
              <DialogDescription>
                {editingModule ? "Update the simulation module settings" : "Create a new simulation scenario module"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={moduleForm.name}
                  onChange={(e) => setModuleForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="AI Workplace Transformation"
                  data-testid="input-module-name"
                />
              </div>
              <div>
                <Label>Slug</Label>
                <Input
                  value={moduleForm.slug}
                  onChange={(e) => setModuleForm((prev) => ({ ...prev, slug: e.target.value }))}
                  placeholder="ai-workplace"
                  data-testid="input-module-slug"
                />
                <p className="text-xs text-muted-foreground mt-1">URL-friendly identifier (lowercase, no spaces)</p>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={moduleForm.description}
                  onChange={(e) => setModuleForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="A simulation focused on navigating AI adoption challenges..."
                  data-testid="input-module-description"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Default Module</Label>
                  <p className="text-xs text-muted-foreground">Use for new simulations</p>
                </div>
                <Switch
                  checked={moduleForm.isDefault}
                  onCheckedChange={(checked) => setModuleForm((prev) => ({ ...prev, isDefault: checked }))}
                  data-testid="switch-module-default"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Active</Label>
                  <p className="text-xs text-muted-foreground">Make available for use</p>
                </div>
                <Switch
                  checked={moduleForm.isActive}
                  onCheckedChange={(checked) => setModuleForm((prev) => ({ ...prev, isActive: checked }))}
                  data-testid="switch-module-active"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowModuleDialog(false)}>Cancel</Button>
              <Button
                onClick={handleSaveModule}
                disabled={!moduleForm.name || !moduleForm.slug || createModuleMutation.isPending || updateModuleMutation.isPending}
                data-testid="button-save-module"
              >
                {(createModuleMutation.isPending || updateModuleMutation.isPending) && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {editingModule ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showContentDialog} onOpenChange={setShowContentDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingContent ? "Edit Content" : "Add Content"}</DialogTitle>
              <DialogDescription>
                {editingContent ? "Update this content item" : `Add content for Week ${selectedWeek}`}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={contentForm.title}
                  onChange={(e) => setContentForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Week 1 Briefing: The AI Revolution"
                  data-testid="input-content-title"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Content Type</Label>
                  <Select
                    value={contentForm.contentType}
                    onValueChange={(v) => setContentForm((prev) => ({ ...prev, contentType: v }))}
                  >
                    <SelectTrigger data-testid="select-content-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTENT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Order</Label>
                  <Input
                    type="number"
                    value={contentForm.order}
                    onChange={(e) => setContentForm((prev) => ({ ...prev, order: Number(e.target.value) }))}
                    min={0}
                    data-testid="input-content-order"
                  />
                </div>
              </div>

              {contentForm.contentType === "text" && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Content</Label>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={openEnhanceDialog}
                      disabled={!contentForm.content}
                      data-testid="button-ai-enhance"
                    >
                      <Sparkles className="h-4 w-4 mr-2 text-amber-500" />
                      AI Enhance
                    </Button>
                  </div>
                  <Textarea
                    value={contentForm.content}
                    onChange={(e) => setContentForm((prev) => ({ ...prev, content: e.target.value }))}
                    placeholder="Enter the briefing content, research report, or scenario description..."
                    className="min-h-[200px]"
                    data-testid="input-content-text"
                  />
                </div>
              )}

              {(contentForm.contentType === "video" || contentForm.contentType === "google_doc") && (
                <div>
                  <Label>Embed URL</Label>
                  <Input
                    value={contentForm.embedUrl}
                    onChange={(e) => setContentForm((prev) => ({ ...prev, embedUrl: e.target.value }))}
                    placeholder="https://www.youtube.com/embed/..."
                    data-testid="input-embed-url"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {contentForm.contentType === "video" 
                      ? "Use the embed URL from YouTube or Vimeo" 
                      : "Use the publish/embed URL from Google Docs"}
                  </p>
                </div>
              )}

              {contentForm.contentType === "link" && (
                <div>
                  <Label>Resource URL</Label>
                  <Input
                    value={contentForm.resourceUrl}
                    onChange={(e) => setContentForm((prev) => ({ ...prev, resourceUrl: e.target.value }))}
                    placeholder="https://example.com/resource"
                    data-testid="input-resource-url"
                  />
                </div>
              )}

              <div>
                <Label>Thumbnail URL (Optional)</Label>
                <Input
                  value={contentForm.thumbnailUrl}
                  onChange={(e) => setContentForm((prev) => ({ ...prev, thumbnailUrl: e.target.value }))}
                  placeholder="https://example.com/thumbnail.jpg"
                  data-testid="input-thumbnail-url"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Active</Label>
                  <p className="text-xs text-muted-foreground">Show to students</p>
                </div>
                <Switch
                  checked={contentForm.isActive}
                  onCheckedChange={(checked) => setContentForm((prev) => ({ ...prev, isActive: checked }))}
                  data-testid="switch-content-active"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowContentDialog(false)}>Cancel</Button>
              <Button
                onClick={handleSaveContent}
                disabled={!contentForm.title || createContentMutation.isPending || updateContentMutation.isPending}
                data-testid="button-save-content"
              >
                {(createContentMutation.isPending || updateContentMutation.isPending) && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {editingContent ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showEnhanceDialog} onOpenChange={setShowEnhanceDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                AI Content Enhancement
              </DialogTitle>
              <DialogDescription>
                Use AI to improve, expand, or transform your content
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Enhancement Type</Label>
                <Select value={enhancementType} onValueChange={setEnhancementType}>
                  <SelectTrigger data-testid="select-enhancement-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ENHANCEMENT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-muted-foreground">{type.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Original Content</Label>
                <Textarea
                  value={enhancingContent}
                  onChange={(e) => setEnhancingContent(e.target.value)}
                  className="min-h-[120px]"
                  data-testid="input-original-content"
                />
              </div>

              <Button
                onClick={handleEnhance}
                disabled={!enhancingContent || enhanceContentMutation.isPending}
                className="w-full"
                data-testid="button-run-enhance"
              >
                {enhanceContentMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enhancing...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Enhance Content
                  </>
                )}
              </Button>

              {enhancedResult && (
                <div>
                  <Label>Enhanced Result</Label>
                  <div className="p-4 bg-muted rounded-md">
                    <p className="whitespace-pre-wrap text-sm">{enhancedResult}</p>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEnhanceDialog(false)}>Cancel</Button>
              {enhancedResult && (
                <Button onClick={applyEnhancement} data-testid="button-apply-enhancement">
                  Apply Enhancement
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
