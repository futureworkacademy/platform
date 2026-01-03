import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/use-auth";
import { Factory, Clock, LogOut, User, CheckCircle, AlertCircle, GraduationCap, MessageSquare, ChevronsUpDown, Check } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";

export default function WaitingAssignment() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [institution, setInstitution] = useState(user?.institution || '');
  const [institutionOpen, setInstitutionOpen] = useState(false);
  const [schoolEmail, setSchoolEmail] = useState(user?.schoolEmail || '');
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerificationInput, setShowVerificationInput] = useState(false);
  
  const { data: institutions = [] } = useQuery<string[]>({
    queryKey: ['/api/institutions'],
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { firstName: string; lastName: string; institution: string }) => {
      return apiRequest('PATCH', '/api/auth/profile', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({
        title: "Profile updated",
        description: "Your profile has been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to update profile",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  });

  const requestVerificationMutation = useMutation({
    mutationFn: async (email: string) => {
      return apiRequest('POST', '/api/profile/request-verification', { schoolEmail: email });
    },
    onSuccess: () => {
      setShowVerificationInput(true);
      toast({
        title: "Verification code sent",
        description: "Check your school email for the verification code. If you don't see it, check your spam folder or contact your instructor.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send verification",
        description: error.message || "Please enter a valid .edu email address.",
        variant: "destructive",
      });
    }
  });

  const verifyCodeMutation = useMutation({
    mutationFn: async (code: string) => {
      return apiRequest('POST', '/api/profile/verify-email', { code });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      setShowVerificationInput(false);
      toast({
        title: "Email verified!",
        description: "Your school email has been verified successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Invalid code",
        description: "Please check the code and try again.",
        variant: "destructive",
      });
    }
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({ firstName, lastName, institution });
  };

  const handleRequestVerification = () => {
    if (!schoolEmail) {
      toast({
        title: "Email required",
        description: "Please enter your school email address.",
        variant: "destructive",
      });
      return;
    }
    if (!schoolEmail.endsWith('.edu')) {
      toast({
        title: "Invalid email",
        description: "Please enter a .edu email address.",
        variant: "destructive",
      });
      return;
    }
    requestVerificationMutation.mutate(schoolEmail);
  };

  const handleVerifyCode = () => {
    if (!verificationCode) {
      toast({
        title: "Code required",
        description: "Please enter the verification code.",
        variant: "destructive",
      });
      return;
    }
    verifyCodeMutation.mutate(verificationCode);
  };

  const isSchoolEmailVerified = user?.schoolEmailVerified === "true";

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
              <Factory className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg tracking-tight">Future of Work</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="outline" onClick={() => logout()} data-testid="button-logout">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
        <Card className="bg-card">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Clock className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Waiting for Team Assignment</CardTitle>
            <CardDescription className="text-base mt-2">
              Welcome, {user?.firstName || user?.email}! Your account has been created successfully.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 rounded-md p-4">
              <p className="text-sm text-muted-foreground">
                Your instructor will assign you to a team before the simulation begins. 
                While you wait, please complete your profile below so your instructor can identify you.
              </p>
            </div>
            
            <div className="text-center text-sm text-muted-foreground pt-2">
              <p>
                Questions or issues?{" "}
                <Link href="/feedback">
                  <Button variant="ghost" className="p-0 h-auto text-primary" data-testid="link-feedback">
                    <MessageSquare className="mr-1 h-3 w-3" />
                    Contact us
                  </Button>
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5" />
              Your Profile
            </CardTitle>
            <CardDescription>
              Update your information so your instructor can identify you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Your first name"
                    data-testid="input-firstName"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Your last name"
                    data-testid="input-lastName"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Institution</Label>
                <Popover open={institutionOpen} onOpenChange={setInstitutionOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={institutionOpen}
                      className="w-full justify-between font-normal"
                      data-testid="select-institution"
                    >
                      {institution || "Select your institution..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search institutions..." />
                      <CommandList>
                        <CommandEmpty>No institution found.</CommandEmpty>
                        <CommandGroup>
                          {institutions.map((inst) => (
                            <CommandItem
                              key={inst}
                              value={inst}
                              onSelect={(currentValue) => {
                                setInstitution(currentValue === institution ? "" : currentValue);
                                setInstitutionOpen(false);
                              }}
                              data-testid={`option-institution-${inst.replace(/\s+/g, '-').toLowerCase()}`}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  institution === inst ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {inst}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Login Email</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={user?.email || ''}
                    disabled
                    className="bg-muted"
                    data-testid="text-login-email"
                  />
                  <Badge variant="outline" className="shrink-0">Login</Badge>
                </div>
                <p className="text-xs text-muted-foreground">This is the email you used to sign in.</p>
              </div>
              <Button 
                type="submit" 
                disabled={updateProfileMutation.isPending}
                data-testid="button-save-profile"
              >
                {updateProfileMutation.isPending ? "Saving..." : "Save Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <GraduationCap className="h-5 w-5" />
              School Email Verification
              {isSchoolEmailVerified && (
                <Badge className="ml-2 bg-green-500/10 text-green-600 border-green-500/20">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Verified
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {isSchoolEmailVerified 
                ? "Your school email has been verified."
                : "Verify your .edu email address so your instructor can match you to their class roster."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isSchoolEmailVerified ? (
              <div className="flex items-center gap-2 p-3 bg-green-500/10 rounded-md border border-green-500/20">
                <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                <div>
                  <p className="font-medium text-sm">{user?.schoolEmail}</p>
                  <p className="text-xs text-muted-foreground">Verified school email</p>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="schoolEmail">School Email (.edu required)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="schoolEmail"
                      type="email"
                      value={schoolEmail}
                      onChange={(e) => setSchoolEmail(e.target.value)}
                      placeholder="yourname@university.edu"
                      disabled={showVerificationInput}
                      data-testid="input-schoolEmail"
                    />
                    <Button 
                      type="button"
                      onClick={handleRequestVerification}
                      disabled={requestVerificationMutation.isPending || showVerificationInput}
                      data-testid="button-request-verification"
                    >
                      {requestVerificationMutation.isPending ? "Sending..." : "Verify"}
                    </Button>
                  </div>
                </div>

                {showVerificationInput && (
                  <div className="space-y-3 p-4 bg-muted/50 rounded-md border">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium">Check your email</p>
                        <p className="text-muted-foreground">
                          We sent a verification code to <span className="font-mono">{schoolEmail}</span>. 
                          Enter it below to verify your school email.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                        className="font-mono tracking-widest"
                        data-testid="input-verificationCode"
                      />
                      <Button 
                        type="button"
                        onClick={handleVerifyCode}
                        disabled={verifyCodeMutation.isPending}
                        data-testid="button-verify-code"
                      >
                        {verifyCodeMutation.isPending ? "Verifying..." : "Submit"}
                      </Button>
                    </div>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowVerificationInput(false)}
                      data-testid="button-change-email"
                    >
                      Use different email
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
