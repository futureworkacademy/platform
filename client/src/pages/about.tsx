import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { ThemeToggle } from "@/components/theme-toggle";
import { ArrowLeft, Edit2, Save, X, Phone, Mail } from "lucide-react";
import { Link } from "wouter";
import { SiLinkedin } from "react-icons/si";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import logoForLight from "@assets/logo-horizontal.png";
import logoForDark from "@assets/logo-white.png";

interface AboutContent {
  id?: string;
  photoUrl: string | null;
  content: string | null;
}

interface UserRole {
  isSuperAdmin?: boolean;
}

export default function About() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [photoUrl, setPhotoUrl] = useState("");
  const [content, setContent] = useState("");

  const { data: aboutContent, isLoading, isError } = useQuery<AboutContent>({
    queryKey: ["/api/about"],
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 2,
  });

  const { data: userRole } = useQuery<UserRole>({
    queryKey: ["/api/my-role"],
    retry: false, // Don't retry auth check - it's optional
  });

  const isSuperAdmin = userRole?.isSuperAdmin === true;

  const updateMutation = useMutation({
    mutationFn: async (data: { photoUrl: string; content: string }) => {
      return apiRequest("PUT", "/api/about", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/about"] });
      toast({ title: "About page updated" });
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast({ title: "Error updating about page", description: error.message, variant: "destructive" });
    },
  });

  const startEditing = () => {
    setPhotoUrl(aboutContent?.photoUrl || "");
    setContent(aboutContent?.content || "");
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setPhotoUrl("");
    setContent("");
  };

  const saveChanges = () => {
    updateMutation.mutate({ photoUrl, content });
  };

  const renderContent = (htmlContent: string | null) => {
    if (!htmlContent) return null;
    return <div className="prose prose-neutral dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: htmlContent }} />;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Link href="/">
            <img 
              src={logoForLight} 
              alt="Future Work Academy" 
              className="h-16 w-auto cursor-pointer block dark:hidden"
              data-testid="img-header-logo-light"
            />
            <img 
              src={logoForDark} 
              alt="Future Work Academy" 
              className="h-16 w-auto cursor-pointer hidden dark:block"
              data-testid="img-header-logo-dark"
            />
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" data-testid="button-back-home">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-4 py-12">
        {isLoading ? (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <Skeleton className="w-48 h-48 rounded-full shrink-0" />
              <div className="flex-1 space-y-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </div>
        ) : isError ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground" data-testid="text-about-error">
                Unable to load content. Please try refreshing the page.
              </p>
            </CardContent>
          </Card>
        ) : isEditing ? (
          <Card>
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Edit About Page</h2>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={cancelEditing}
                    data-testid="button-cancel-edit"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button 
                    onClick={saveChanges}
                    disabled={updateMutation.isPending}
                    data-testid="button-save-about"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {updateMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="photoUrl">Profile Photo URL</Label>
                <Input
                  id="photoUrl"
                  placeholder="https://example.com/your-photo.jpg"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  data-testid="input-photo-url"
                />
                <p className="text-sm text-muted-foreground">
                  Enter a URL to your profile photo. For best results, use a square image.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">About Content (HTML)</Label>
                <Textarea
                  id="content"
                  placeholder="<h2>About Me</h2>
<p>Write your bio here...</p>
<p>You can use HTML tags like &lt;h2&gt;, &lt;p&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;ul&gt;, &lt;li&gt;, etc.</p>"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[300px] font-mono text-sm"
                  data-testid="textarea-about-content"
                />
                <p className="text-sm text-muted-foreground">
                  Use HTML to format your content. Common tags: &lt;h2&gt;, &lt;h3&gt;, &lt;p&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;ul&gt;, &lt;ol&gt;, &lt;li&gt;
                </p>
              </div>

              {content && (
                <div className="space-y-2">
                  <Label>Preview</Label>
                  <div className="border rounded-md p-4 bg-card">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                      {photoUrl && (
                        <Avatar className="w-32 h-32 shrink-0">
                          <AvatarImage src={photoUrl} alt="Profile" />
                          <AvatarFallback className="text-2xl">?</AvatarFallback>
                        </Avatar>
                      )}
                      <div className="flex-1">
                        {renderContent(content)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {isSuperAdmin && (
              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  onClick={startEditing}
                  data-testid="button-edit-about"
                >
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit Page
                </Button>
              </div>
            )}

            {aboutContent?.photoUrl || aboutContent?.content ? (
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="shrink-0 w-64 md:w-72 space-y-6">
                  {aboutContent.photoUrl && (
                    <img 
                      src={aboutContent.photoUrl} 
                      alt="Profile" 
                      className="w-full h-auto rounded-lg border-4 border-primary/10 object-cover"
                      data-testid="img-about-photo"
                    />
                  )}
                  <div className="space-y-3">
                    <h3 className="text-base font-semibold text-foreground">Get in Touch</h3>
                    <div className="space-y-2">
                      <a 
                        href="mailto:doug@futureworkacademy.com" 
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                        data-testid="link-contact-email"
                      >
                        <Mail className="h-4 w-4" />
                        <span>doug@futureworkacademy.com</span>
                      </a>
                      <a 
                        href="tel:+15156191640" 
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                        data-testid="link-contact-phone"
                      >
                        <Phone className="h-4 w-4" />
                        <span>515.619.1640</span>
                      </a>
                      <a 
                        href="https://linkedin.com/in/dougmitchell" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                        data-testid="link-contact-linkedin"
                      >
                        <SiLinkedin className="h-4 w-4" />
                        <span>LinkedIn</span>
                      </a>
                    </div>
                  </div>
                </div>
                <div className="flex-1" data-testid="text-about-content">
                  {renderContent(aboutContent.content)}
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground" data-testid="text-about-empty">
                    No content has been added to this page yet.
                  </p>
                  {isSuperAdmin && (
                    <Button 
                      className="mt-4" 
                      onClick={startEditing}
                      data-testid="button-add-content"
                    >
                      Add Content
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
