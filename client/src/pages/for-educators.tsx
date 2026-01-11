import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ThemeToggle } from "@/components/theme-toggle";
import { ArrowLeft, Send, CheckCircle, Linkedin, Mail, Phone, BookOpen, Users, TrendingUp, Award } from "lucide-react";
import danMitchellPhoto from "@assets/image_1768085802226.png";
import logo from "@assets/fwalogo-2_1768083577051.png";
import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const INSTITUTIONS = [
  "4-Year University",
  "Community College", 
  "Business School / MBA Program",
  "Corporate Training",
  "Government / Public Sector",
  "Non-Profit Organization",
  "Other"
];

const INQUIRY_TYPES = [
  { value: "general", label: "General Inquiry" },
  { value: "demo_request", label: "Request a Demo" },
  { value: "pricing", label: "Pricing Information" },
  { value: "partnership", label: "Partnership Opportunity" },
  { value: "curriculum", label: "Curriculum Integration" },
];

export default function ForEducators() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [institution, setInstitution] = useState('');
  const [inquiryType, setInquiryType] = useState('general');
  const [message, setMessage] = useState('');

  const submitMutation = useMutation({
    mutationFn: async (data: { 
      name: string; 
      email: string; 
      phone?: string;
      institution?: string;
      inquiryType: string;
      message: string 
    }) => {
      return apiRequest('POST', '/api/educator-inquiry', data);
    },
    onSuccess: () => {
      setSubmitted(true);
    },
    onError: () => {
      toast({
        title: "Failed to send inquiry",
        description: "Please try again or email dmitchell@grandview.edu directly.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    submitMutation.mutate({ 
      name, 
      email, 
      phone: phone || undefined,
      institution: institution || undefined,
      inquiryType,
      message 
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
            <Link href="/">
              <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-md px-3 py-2">
                <img 
                  src={logo} 
                  alt="Future Work Academy" 
                  className="h-14 w-auto cursor-pointer"
                  data-testid="img-header-logo"
                />
              </div>
            </Link>
            <ThemeToggle />
          </div>
        </header>

        <main className="container mx-auto px-4 py-16 max-w-2xl">
          <Card className="bg-card">
            <CardContent className="pt-8 pb-8 text-center space-y-4">
              <div className="mx-auto h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <h2 className="text-2xl font-semibold">Thank You for Your Interest!</h2>
              <p className="text-muted-foreground">
                Your inquiry has been submitted. I'll review your message and get back to you within 1-2 business days.
              </p>
              <Link href="/">
                <Button variant="outline" className="mt-4" data-testid="button-back-home">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Link href="/">
            <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-md px-3 py-2">
              <img 
                src={logo} 
                alt="Future Work Academy" 
                className="h-14 w-auto cursor-pointer"
                data-testid="img-header-logo"
              />
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm" data-testid="button-back">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-3">For Educators</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Bring the future of work into your classroom. This simulation helps students understand 
            AI adoption challenges, workforce management, and strategic decision-making.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <Card className="bg-card">
              <CardContent className="pt-6">
                <div className="float-left mr-5 mb-3">
                  <div className="w-36 h-36 rounded-lg overflow-hidden">
                    <img 
                      src={danMitchellPhoto} 
                      alt="Douglas E. Mitchell" 
                      className="w-full h-full object-cover"
                      data-testid="img-educator-photo"
                    />
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Douglas E. Mitchell</h2>
                  <p className="text-sm text-muted-foreground mb-3">Creator & Lead Developer</p>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor 
                  incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud 
                  exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute 
                  irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla 
                  pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia 
                  deserunt mollit anim id est laborum.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque 
                  laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi 
                  architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas 
                  sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione 
                  voluptatem sequi nesciunt.
                </p>
                <div className="clear-both flex items-center gap-3 pt-2">
                  <a 
                    href="mailto:dmitchell@grandview.edu" 
                    className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                    data-testid="link-email"
                  >
                    <Mail className="h-4 w-4" />
                    dmitchell@grandview.edu
                  </a>
                  <a 
                    href="https://linkedin.com/in/dougmitchell" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                    data-testid="link-linkedin"
                  >
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Why Use This Simulation?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2 p-3 rounded-lg bg-muted/50">
                    <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                      <BookOpen className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="font-medium text-sm">Experiential Learning</h3>
                    <p className="text-xs text-muted-foreground">Students make real strategic decisions and see immediate consequences over 8 simulated weeks.</p>
                  </div>
                  <div className="flex flex-col gap-2 p-3 rounded-lg bg-muted/50">
                    <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="font-medium text-sm">Team Collaboration</h3>
                    <p className="text-xs text-muted-foreground">Groups work together to balance financial performance with cultural health.</p>
                  </div>
                  <div className="flex flex-col gap-2 p-3 rounded-lg bg-muted/50">
                    <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="font-medium text-sm">Real-World Relevance</h3>
                    <p className="text-xs text-muted-foreground">Weekly briefings feature current AI adoption trends and workforce challenges.</p>
                  </div>
                  <div className="flex flex-col gap-2 p-3 rounded-lg bg-muted/50">
                    <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                      <Award className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="font-medium text-sm">Competitive Element</h3>
                    <p className="text-xs text-muted-foreground">Leaderboard rankings drive engagement and reflection on strategy choices.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="bg-card">
              <CardHeader>
                <CardTitle>Get in Touch</CardTitle>
                <CardDescription>
                  Interested in using this simulation in your course? Fill out the form below and I'll reach out to discuss how it can fit your curriculum.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        required
                        data-testid="input-educator-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your.email@institution.edu"
                        required
                        data-testid="input-educator-email"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone (Optional)</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 123-4567"
                        data-testid="input-educator-phone"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="institution">Institution Type</Label>
                      <Select value={institution} onValueChange={setInstitution}>
                        <SelectTrigger data-testid="select-institution">
                          <SelectValue placeholder="Select type..." />
                        </SelectTrigger>
                        <SelectContent>
                          {INSTITUTIONS.map((inst) => (
                            <SelectItem key={inst} value={inst} data-testid={`option-institution-${inst.toLowerCase().replace(/\s+/g, '-')}`}>
                              {inst}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="inquiryType">What can I help you with?</Label>
                    <Select value={inquiryType} onValueChange={setInquiryType}>
                      <SelectTrigger data-testid="select-inquiry-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {INQUIRY_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value} data-testid={`option-inquiry-${type.value}`}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell me about your course, class size, and how you'd like to use the simulation..."
                      className="min-h-32"
                      required
                      data-testid="input-educator-message"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={submitMutation.isPending}
                    data-testid="button-submit-inquiry"
                  >
                    {submitMutation.isPending ? (
                      "Sending..."
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Inquiry
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    Or reach out directly at{" "}
                    <a href="mailto:dmitchell@grandview.edu" className="text-primary hover:underline">
                      dmitchell@grandview.edu
                    </a>
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="border-t py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} The Mitchell Group, LLC - Iowa. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
