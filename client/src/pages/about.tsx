import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { ThemeToggle } from "@/components/theme-toggle";
import { AppFooter } from "@/components/app-footer";
import { ArrowLeft, Edit2, Save, X, Phone, Mail, Calendar, BookOpen, GraduationCap, Lightbulb, Users, ChevronDown } from "lucide-react";
import { Link } from "wouter";
import { SiLinkedin } from "react-icons/si";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import logoForLight from "@assets/logo-horizontal.png";
import logoForDark from "@assets/logo-white.png";
import dougPhoto from "@assets/doug-mitchell-headshot-2026SMALL_1769306419960.png";

interface AboutContent {
  id?: string;
  photoUrl: string | null;
  content: string | null;
}

interface UserRole {
  isSuperAdmin?: boolean;
}

function useInView() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return { ref, isVisible };
}

function FadeInSection({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, isVisible } = useInView();
  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export default function About() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    document.title = "About | Future Work Academy";
  }, []);
  const [photoUrl, setPhotoUrl] = useState("");
  const [content, setContent] = useState("");

  const { data: aboutContent, isLoading, isError } = useQuery<AboutContent>({
    queryKey: ["/api/about"],
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  const { data: userRole } = useQuery<UserRole>({
    queryKey: ["/api/my-role"],
    retry: false,
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

  if (isEditing) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
            <Link href="/">
              <img src={logoForLight} alt="Future Work Academy" className="h-16 w-auto cursor-pointer block dark:hidden" data-testid="img-header-logo-light" />
              <img src={logoForDark} alt="Future Work Academy" className="h-16 w-auto cursor-pointer hidden dark:block" data-testid="img-header-logo-dark" />
            </Link>
            <ThemeToggle />
          </div>
        </header>
        <main className="container mx-auto max-w-4xl px-4 py-12">
          <Card>
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h2 className="text-xl font-semibold">Edit About Page</h2>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={cancelEditing} data-testid="button-cancel-edit">
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button onClick={saveChanges} disabled={updateMutation.isPending} data-testid="button-save-about">
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
<p>Write your bio here...</p>"
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
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background scroll-smooth">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Link href="/">
            <img src={logoForLight} alt="Future Work Academy" className="h-16 w-auto cursor-pointer block dark:hidden" data-testid="img-header-logo-light" />
            <img src={logoForDark} alt="Future Work Academy" className="h-16 w-auto cursor-pointer hidden dark:block" data-testid="img-header-logo-dark" />
          </Link>
          <div className="flex items-center gap-5">
            <Link href="/">
              <span className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:inline cursor-pointer" data-testid="link-home">Home</span>
            </Link>
            <Link href="/for-educators">
              <span className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:inline cursor-pointer" data-testid="link-educators">For Educators</span>
            </Link>
            <Link href="/for-students">
              <span className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:inline cursor-pointer" data-testid="link-students">For Students</span>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {isSuperAdmin && (
        <div className="container mx-auto max-w-6xl px-4 pt-6 flex justify-end">
          <Button variant="outline" onClick={startEditing} data-testid="button-edit-about">
            <Edit2 className="mr-2 h-4 w-4" />
            Edit Page
          </Button>
        </div>
      )}

      <main>
        {isLoading ? (
          <div className="container mx-auto max-w-5xl px-4 py-24 space-y-8">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <Skeleton className="w-64 h-64 rounded-2xl shrink-0" />
              <div className="flex-1 space-y-4 w-full">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </div>
        ) : isError ? (
          <div className="container mx-auto max-w-4xl px-4 py-24">
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground" data-testid="text-about-error">
                  Unable to load content. Please try refreshing the page.
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            <section className="relative min-h-[70vh] flex items-center justify-center px-4 overflow-hidden">
              <div className="relative z-10 container mx-auto max-w-5xl text-center space-y-8">
                <FadeInSection>
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                    <Users className="h-3.5 w-3.5" />
                    About Future Work Academy
                  </div>
                </FadeInSection>
                <FadeInSection delay={150}>
                  <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.1]" data-testid="text-hero-headline">
                    Bridging the gap between<br />
                    <span className="text-primary">theory and practice.</span>
                  </h1>
                </FadeInSection>
                <FadeInSection delay={300}>
                  <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    Future Work Academy is an immersive AI-powered simulation platform designed to
                    prepare tomorrow's leaders for the complex realities of organizational decision-making.
                  </p>
                </FadeInSection>
                <FadeInSection delay={450}>
                  <div className="pt-4 animate-bounce"><ChevronDown className="h-6 w-6 text-muted-foreground mx-auto" /></div>
                </FadeInSection>
              </div>
            </section>

            <section className="py-24 sm:py-32 px-4 bg-card/30">
              <div className="container mx-auto max-w-5xl">
                <FadeInSection>
                  <div className="text-center mb-16">
                    <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">Our Mission</p>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
                      Learning by doing,<br />not just reading.
                    </h2>
                    <p className="text-muted-foreground mt-6 max-w-2xl mx-auto text-lg leading-relaxed">
                      We believe the best way to develop leadership capability is through experiential, consequential
                      decision-making — where every choice ripples through a living organization.
                    </p>
                  </div>
                </FadeInSection>
                <div className="grid md:grid-cols-3 gap-8">
                  {[
                    { icon: BookOpen, title: "Research-Backed", desc: "Built on Kolb's experiential learning (1984), Kapur's productive failure (2016), Black & Wiliam's formative assessment (1998), and Wood, Bruner & Ross's scaffolding (1976).", accent: "text-blue-500", bg: "bg-blue-500/10" },
                    { icon: GraduationCap, title: "Academically Rigorous", desc: "Designed for AACSB-aligned programs with transparent rubrics, published evaluation criteria, and criterion-referenced AI assessment grounded in AES research (Shermis & Burstein, 2013).", accent: "text-green-500", bg: "bg-green-500/10" },
                    { icon: Lightbulb, title: "Industry-Relevant", desc: "Scenarios grounded in real workforce challenges — automation, AI adoption, talent management, and organizational change.", accent: "text-purple-500", bg: "bg-purple-500/10" },
                  ].map((item, i) => (
                    <FadeInSection key={item.title} delay={i * 150}>
                      <Card className="bg-card h-full">
                        <CardContent className="pt-8 pb-6 px-6">
                          <div className={`h-12 w-12 rounded-xl ${item.bg} flex items-center justify-center mb-5`}>
                            <item.icon className={`h-6 w-6 ${item.accent}`} />
                          </div>
                          <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                        </CardContent>
                      </Card>
                    </FadeInSection>
                  ))}
                </div>
              </div>
            </section>

            <section className="py-24 sm:py-32 px-4">
              <div className="container mx-auto max-w-6xl">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                  <FadeInSection>
                    <div className="flex flex-col items-center lg:items-start">
                      <img
                        src={aboutContent?.photoUrl || dougPhoto}
                        alt="Doug Mitchell"
                        className="w-64 h-64 sm:w-72 sm:h-72 rounded-2xl object-cover border-4 border-primary/10"
                        data-testid="img-about-photo"
                      />
                    </div>
                  </FadeInSection>
                  <FadeInSection delay={200}>
                    <div>
                      <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">Meet the Founder</p>
                      <h2 className="text-3xl sm:text-4xl font-bold tracking-tight leading-[1.1] mb-6" data-testid="text-founder-headline">
                        Doug Mitchell
                      </h2>
                      {aboutContent?.content ? (
                        <div data-testid="text-about-content">
                          {renderContent(aboutContent.content)}
                        </div>
                      ) : (
                        <div className="space-y-4 text-muted-foreground leading-relaxed" data-testid="text-about-content">
                          <p>
                            Doug Mitchell is the creator and lead developer of Future Work Academy, an immersive
                            AI-powered simulation platform built at the intersection of management education,
                            experiential learning, and emerging technology.
                          </p>
                          <p>
                            With deep roots in both industry and academia, Doug designed FWA to address the
                            persistent "relevance gap" between what business schools teach and what organizations
                            actually need from their leaders.
                          </p>
                          {isSuperAdmin && (
                            <Button variant="outline" className="mt-4" onClick={startEditing} data-testid="button-add-content">
                              <Edit2 className="mr-2 h-4 w-4" />
                              Customize Bio
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </FadeInSection>
                </div>
              </div>
            </section>

            <section className="py-24 sm:py-32 px-4 bg-card/30">
              <div className="container mx-auto max-w-3xl">
                <FadeInSection>
                  <div className="text-center mb-12">
                    <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">Get in Touch</p>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
                      Let's talk.
                    </h2>
                    <p className="text-muted-foreground mt-6 text-lg leading-relaxed max-w-xl mx-auto">
                      Whether you're interested in adopting FWA for your program, exploring partnership opportunities,
                      or simply want to learn more — we'd love to hear from you.
                    </p>
                  </div>
                </FadeInSection>
                <FadeInSection delay={200}>
                  <Card className="bg-card">
                    <CardContent className="p-8 sm:p-10">
                      <div className="flex flex-col sm:flex-row items-center gap-8">
                        <Avatar className="w-24 h-24 shrink-0">
                          <AvatarImage src={aboutContent?.photoUrl || dougPhoto} alt="Doug Mitchell" />
                          <AvatarFallback className="text-2xl">DM</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-center sm:text-left">
                          <h3 className="text-xl font-bold text-foreground mb-1">Doug Mitchell</h3>
                          <p className="text-sm text-muted-foreground mb-5">Founder & Lead Developer, Future Work Academy</p>
                          <div className="space-y-3">
                            <a
                              href="mailto:doug@futureworkacademy.com"
                              className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors justify-center sm:justify-start"
                              data-testid="link-contact-email"
                            >
                              <Mail className="h-4 w-4 shrink-0" />
                              <span>doug@futureworkacademy.com</span>
                            </a>
                            <a
                              href="tel:+15156191640"
                              className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors justify-center sm:justify-start"
                              data-testid="link-contact-phone"
                            >
                              <Phone className="h-4 w-4 shrink-0" />
                              <span>515.619.1640</span>
                            </a>
                            <a
                              href="https://linkedin.com/in/dougmitchell"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors justify-center sm:justify-start"
                              data-testid="link-contact-linkedin"
                            >
                              <SiLinkedin className="h-4 w-4 shrink-0" />
                              <span>LinkedIn</span>
                            </a>
                            <a
                              href="https://calendar.app.google/hhb4P8TqnpryG9M38"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors justify-center sm:justify-start"
                              data-testid="link-schedule-call"
                            >
                              <Calendar className="h-4 w-4 shrink-0" />
                              <span>Schedule a Call</span>
                            </a>
                          </div>
                        </div>
                      </div>
                      <div className="mt-8 pt-8 border-t flex flex-wrap justify-center gap-4">
                        <a href="https://calendar.app.google/hhb4P8TqnpryG9M38" target="_blank" rel="noopener noreferrer">
                          <Button size="lg" data-testid="button-schedule-call">
                            <Calendar className="mr-2 h-4 w-4" />
                            Schedule a Call
                          </Button>
                        </a>
                        <Link href="/for-educators#demo">
                          <Button size="lg" variant="outline" data-testid="button-learn-more">
                            <GraduationCap className="mr-2 h-4 w-4" />
                            Request a Demo
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </FadeInSection>
              </div>
            </section>
          </>
        )}
      </main>

      <AppFooter />
    </div>
  );
}
