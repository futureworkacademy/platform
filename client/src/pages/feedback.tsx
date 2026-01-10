import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/use-auth";
import { ArrowLeft, Send, CheckCircle } from "lucide-react";
import logoLight from "@assets/fwalogo-2_1768083577051.png";
import logoDark from "@assets/fwa_white_logo_on_transparent_1768086937618.png";
import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Feedback() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState(user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '');
  const [email, setEmail] = useState(user?.email || user?.schoolEmail || '');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const submitMutation = useMutation({
    mutationFn: async (data: { name: string; email: string; subject: string; message: string }) => {
      return apiRequest('POST', '/api/feedback', data);
    },
    onSuccess: () => {
      setSubmitted(true);
    },
    onError: () => {
      toast({
        title: "Failed to send feedback",
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
    submitMutation.mutate({ name, email, subject, message });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center">
              <img 
                src={logoLight} 
                alt="Future Work Academy" 
                className="h-12 w-auto dark:hidden"
                data-testid="img-header-logo-light"
              />
              <img 
                src={logoDark} 
                alt="Future Work Academy" 
                className="h-12 w-auto hidden dark:block"
                data-testid="img-header-logo-dark"
              />
            </div>
            <ThemeToggle />
          </div>
        </header>

        <main className="container mx-auto px-4 py-16 max-w-2xl">
          <Card className="bg-card">
            <CardContent className="pt-8 pb-8 text-center space-y-4">
              <div className="mx-auto h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <h2 className="text-2xl font-semibold">Thank You!</h2>
              <p className="text-muted-foreground">
                Your feedback has been submitted. We appreciate you taking the time to share your thoughts.
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
          <div className="flex items-center">
            <img 
              src={logoLight} 
              alt="Future Work Academy" 
              className="h-12 w-auto dark:hidden"
              data-testid="img-header-logo-light"
            />
            <img 
              src={logoDark} 
              alt="Future Work Academy" 
              className="h-12 w-auto hidden dark:block"
              data-testid="img-header-logo-dark"
            />
          </div>
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

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="bg-card">
          <CardHeader>
            <CardTitle>Contact / Feedback</CardTitle>
            <CardDescription>
              Have questions, issues, or suggestions? Fill out the form below or email{" "}
              <a 
                href="mailto:dmitchell@grandview.edu" 
                className="text-primary hover:underline"
                data-testid="link-email-direct"
              >
                dmitchell@grandview.edu
              </a>
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
                    data-testid="input-feedback-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    required
                    data-testid="input-feedback-email"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="What is this about?"
                  data-testid="input-feedback-subject"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what's on your mind..."
                  className="min-h-32"
                  required
                  data-testid="input-feedback-message"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full"
                disabled={submitMutation.isPending}
                data-testid="button-submit-feedback"
              >
                {submitMutation.isPending ? (
                  "Sending..."
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Feedback
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
