import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { 
  CheckCircle, 
  AlertCircle, 
  KeyRound, 
  Phone, 
  User, 
  GraduationCap,
  ChevronsUpDown,
  Check,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Loader2,
  PartyPopper,
  Clock,
  BookOpen,
  Rocket,
  PlayCircle,
  FileText,
  Lightbulb,
  Info
} from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface EnrollmentWizardProps {
  user: any;
  onComplete: () => void;
}

type WizardStep = 1 | 2 | 3;

interface StepIndicatorProps {
  currentStep: WizardStep;
  isPrivacyMode: boolean;
}

function StepIndicator({ currentStep, isPrivacyMode }: StepIndicatorProps) {
  const steps = [
    { num: 1, label: "Enter Code", icon: KeyRound },
    { num: 2, label: isPrivacyMode ? "Confirm Info" : "Verify Identity", icon: isPrivacyMode ? User : GraduationCap },
    { num: 3, label: "Join Class", icon: PartyPopper },
  ];

  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between relative">
        {/* Progress line background */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-muted rounded-full" />
        {/* Progress line filled */}
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full transition-all duration-500"
          style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
        />
        
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.num;
          const isCompleted = currentStep > step.num;
          
          return (
            <div key={step.num} className="relative flex flex-col items-center z-10">
              <div 
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 border-2",
                  isCompleted && "bg-primary border-primary text-primary-foreground",
                  isActive && "bg-primary border-primary text-primary-foreground scale-110 shadow-lg",
                  !isActive && !isCompleted && "bg-background border-muted-foreground/30 text-muted-foreground"
                )}
                data-testid={`step-indicator-${step.num}`}
              >
                {isCompleted ? (
                  <CheckCircle className="h-6 w-6" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </div>
              <span 
                className={cn(
                  "mt-2 text-xs font-medium transition-colors",
                  (isActive || isCompleted) ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function EnrollmentWizard({ user, onComplete }: EnrollmentWizardProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  
  // Welcome modal state
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  // Step 1 state
  const [teamCode, setTeamCode] = useState('');
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);
  const [validatedOrgName, setValidatedOrgName] = useState('');
  const [instructorName, setInstructorName] = useState('');
  const [isCodeValid, setIsCodeValid] = useState(false);
  
  // Step 2 state (Identity)
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [institution, setInstitution] = useState(user?.institution || '');
  const [institutionOpen, setInstitutionOpen] = useState(false);
  const [schoolEmail, setSchoolEmail] = useState(user?.schoolEmail || '');
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerificationInput, setShowVerificationInput] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [smsConsent, setSmsConsent] = useState(false);
  
  const isSchoolEmailVerified = user?.schoolEmailVerified === "true";
  
  const { data: institutions = [] } = useQuery<string[]>({
    queryKey: ['/api/institutions'],
  });

  // Mutations
  const validateTeamCodeMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await apiRequest('POST', '/api/validate-team-code', { code });
      return response.json() as Promise<{ valid: boolean; organizationName: string; instructorName?: string; privacyMode: boolean }>;
    },
    onSuccess: (data) => {
      setIsPrivacyMode(data.privacyMode || false);
      setValidatedOrgName(data.organizationName || '');
      setInstructorName(data.instructorName || '');
      setIsCodeValid(data.valid);
    },
    onError: () => {
      setIsPrivacyMode(false);
      setValidatedOrgName('');
      setInstructorName('');
      setIsCodeValid(false);
    }
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { firstName: string; lastName: string; institution: string }) => {
      return apiRequest('PATCH', '/api/auth/profile', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
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
      return apiRequest('POST', '/api/auth/request-verification', { schoolEmail: email });
    },
    onSuccess: () => {
      setShowVerificationInput(true);
      toast({
        title: "Verification code sent",
        description: "Check your school email for the verification code.",
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
      return apiRequest('POST', '/api/auth/verify-email', { code });
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

  const joinOrganizationMutation = useMutation({
    mutationFn: async (data: { teamCode: string; phoneNumber?: string; smsConsent: boolean }) => {
      return apiRequest('POST', '/api/join-organization', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/role'] });
      setShowWelcomeModal(true);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to join",
        description: error.message || "Invalid team code or organization not found.",
        variant: "destructive",
      });
    }
  });

  // Validate team code when it changes
  useEffect(() => {
    if (teamCode.trim().length >= 6) {
      validateTeamCodeMutation.mutate(teamCode.trim().toUpperCase());
    } else {
      setIsPrivacyMode(false);
      setValidatedOrgName('');
      setInstructorName('');
      setIsCodeValid(false);
    }
  }, [teamCode]);

  const canProceedToStep2 = isCodeValid && validatedOrgName;
  const canProceedToStep3 = isPrivacyMode || isSchoolEmailVerified;

  const handleNextFromStep1 = () => {
    if (!canProceedToStep2) {
      toast({
        title: "Valid code required",
        description: "Please enter a valid team code from your instructor.",
        variant: "destructive",
      });
      return;
    }
    // Save profile on step transition
    if (firstName || lastName || institution) {
      updateProfileMutation.mutate({ firstName, lastName, institution });
    }
    setCurrentStep(2);
  };

  const handleNextFromStep2 = () => {
    if (!canProceedToStep3) {
      toast({
        title: "Verification required",
        description: "Please verify your .edu email to continue.",
        variant: "destructive",
      });
      return;
    }
    // Save profile
    updateProfileMutation.mutate({ firstName, lastName, institution });
    setCurrentStep(3);
  };

  const handleJoin = () => {
    joinOrganizationMutation.mutate({
      teamCode: teamCode.trim().toUpperCase(),
      phoneNumber: isPrivacyMode ? undefined : (phoneNumber.trim() || undefined),
      smsConsent: isPrivacyMode ? false : smsConsent,
    });
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

  return (
    <div className="w-full max-w-lg mx-auto">
      <StepIndicator currentStep={currentStep} isPrivacyMode={isPrivacyMode} />
      
      {/* Step 1: Enter Team Code */}
      {currentStep === 1 && (
        <Card className="bg-card" data-testid="step-1-card">
          <CardHeader className="text-center">
            <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <KeyRound className="h-7 w-7 text-primary" />
            </div>
            <CardTitle className="text-xl">Enter Your Class Code</CardTitle>
            <CardDescription>
              Your instructor gave you a code to join the simulation. Enter it below.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="teamCode">Class Code</Label>
              <Input
                id="teamCode"
                value={teamCode}
                onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
                placeholder="e.g., GVU2025"
                className="font-mono tracking-wider uppercase text-center text-lg h-12"
                data-testid="input-teamCode"
                autoFocus
              />
              <p className="text-xs text-muted-foreground text-center">
                Don't have a code? Contact your instructor.
              </p>
            </div>
            
            {validateTeamCodeMutation.isPending && (
              <div className="flex items-center justify-center gap-2 p-3 bg-muted/50 rounded-md">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Checking code...</span>
              </div>
            )}
            
            {isCodeValid && validatedOrgName && (
              <div className="p-4 bg-green-500/10 rounded-md border border-green-500/20 space-y-3" data-testid="code-valid-indicator">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                  <span className="font-medium text-sm text-green-700 dark:text-green-400">Code accepted!</span>
                </div>
                <div className="space-y-1.5 pl-7">
                  <p className="text-sm">
                    <span className="text-muted-foreground">Class: </span>
                    <span className="font-semibold" data-testid="text-class-name">{validatedOrgName}</span>
                  </p>
                  {instructorName && (
                    <p className="text-sm">
                      <span className="text-muted-foreground">Instructor: </span>
                      <span className="font-semibold" data-testid="text-instructor-name">{instructorName}</span>
                    </p>
                  )}
                </div>
                {isPrivacyMode && (
                  <div className="flex items-center gap-1.5 pl-7 text-green-600">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="text-xs font-medium">Privacy Mode - No email verification needed</span>
                  </div>
                )}
              </div>
            )}
            
            {teamCode.length >= 6 && !validateTeamCodeMutation.isPending && !isCodeValid && (
              <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-md border border-destructive/20">
                <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-destructive">Code not recognized</p>
                  <p className="text-muted-foreground">Double-check with your instructor.</p>
                </div>
              </div>
            )}
            
            <Button
              onClick={handleNextFromStep1}
              disabled={!canProceedToStep2}
              className="w-full h-11"
              data-testid="button-next-step-1"
            >
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Identity Verification */}
      {currentStep === 2 && (
        <Card className="bg-card" data-testid="step-2-card">
          <CardHeader className="text-center">
            <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              {isPrivacyMode ? (
                <User className="h-7 w-7 text-primary" />
              ) : (
                <GraduationCap className="h-7 w-7 text-primary" />
              )}
            </div>
            <CardTitle className="text-xl">
              {isPrivacyMode ? "Confirm Your Information" : "Verify Your Identity"}
            </CardTitle>
            <CardDescription>
              {isPrivacyMode 
                ? "Your class uses anonymous enrollment. Just confirm your name below."
                : "Verify your school email so your instructor can match you to their roster."
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Name fields - always shown */}
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

            {/* Institution selector */}
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

            {/* Privacy Mode: No email verification needed */}
            {isPrivacyMode && (
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 bg-green-500/10 rounded-md border border-green-500/20">
                  <ShieldCheck className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-green-700 dark:text-green-400">Privacy Mode Active</p>
                    <p className="text-muted-foreground">
                      {validatedOrgName} uses anonymous enrollment. Your identity remains private.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-md" data-testid="privacy-email-nudge">
                  <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    For maximum privacy, consider using a personal email for your Replit account. Your instructor will match your participation using an offline roster.
                  </p>
                </div>
              </div>
            )}

            {/* Non-privacy mode: Email verification */}
            {!isPrivacyMode && (
              <>
                {isSchoolEmailVerified ? (
                  <div className="flex items-center gap-3 p-4 bg-green-500/10 rounded-md border border-green-500/20">
                    <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                    <div>
                      <p className="font-medium text-sm text-green-700 dark:text-green-400">{user?.schoolEmail}</p>
                      <p className="text-xs text-muted-foreground">Verified school email</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 p-4 bg-muted/50 rounded-md border">
                    <div className="flex items-start gap-2">
                      <GraduationCap className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">School Email Verification</p>
                        <p className="text-xs text-muted-foreground">Required to match you with your class roster.</p>
                      </div>
                    </div>
                    
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
                          {requestVerificationMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : "Send"}
                        </Button>
                      </div>
                    </div>

                    {showVerificationInput && (
                      <div className="space-y-2 pt-2 border-t">
                        <Label htmlFor="verificationCode">Enter the 6-digit code sent to your email</Label>
                        <div className="flex gap-2">
                          <Input
                            id="verificationCode"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            placeholder="123456"
                            className="font-mono tracking-widest text-center"
                            maxLength={6}
                            data-testid="input-verificationCode"
                          />
                          <Button 
                            onClick={handleVerifyCode}
                            disabled={verifyCodeMutation.isPending}
                            data-testid="button-verify-code"
                          >
                            {verifyCodeMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : "Verify"}
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setShowVerificationInput(false);
                            setVerificationCode('');
                          }}
                          className="text-xs"
                        >
                          Use a different email
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Phone/SMS - only in non-privacy mode */}
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone Number (Optional)
                    </Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      data-testid="input-phoneNumber"
                    />
                  </div>
                  
                  <div className="flex items-start space-x-3 p-3 bg-muted/30 rounded-md">
                    <Checkbox
                      id="smsConsent"
                      checked={smsConsent}
                      onCheckedChange={(checked) => setSmsConsent(checked === true)}
                      data-testid="checkbox-smsConsent"
                    />
                    <div className="grid gap-1 leading-none">
                      <label
                        htmlFor="smsConsent"
                        className="text-sm font-medium leading-none"
                      >
                        Receive SMS reminders
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Get alerts about deadlines and updates.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(1)}
                className="flex-1"
                data-testid="button-back-step-2"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={handleNextFromStep2}
                disabled={!canProceedToStep3}
                className="flex-1"
                data-testid="button-next-step-2"
              >
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Confirmation & Join */}
      {currentStep === 3 && (
        <Card className="bg-card" data-testid="step-3-card">
          <CardHeader className="text-center">
            <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <PartyPopper className="h-7 w-7 text-primary" />
            </div>
            <CardTitle className="text-xl">Ready to Join!</CardTitle>
            <CardDescription>
              Review your information and join the simulation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Summary */}
            <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Organization</span>
                <span className="font-medium">{validatedOrgName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Your Name</span>
                <span className="font-medium">
                  {firstName && lastName ? `${firstName} ${lastName}` : user?.email}
                </span>
              </div>
              {!isPrivacyMode && isSchoolEmailVerified && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Verified Email</span>
                  <span className="font-medium text-sm">{user?.schoolEmail}</span>
                </div>
              )}
              {isPrivacyMode && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Mode</span>
                  <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                    <ShieldCheck className="mr-1 h-3 w-3" />
                    Privacy Mode
                  </Badge>
                </div>
              )}
            </div>

            {/* What happens next */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">What happens next?</h4>
              <div className="space-y-2">
                <div className="flex items-start gap-3 text-sm">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <p className="text-muted-foreground">
                    Your instructor will assign you to a team before the simulation begins.
                  </p>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <BookOpen className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <p className="text-muted-foreground">
                    You'll start with a research briefing to learn about Apex Manufacturing.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(2)}
                className="flex-1"
                data-testid="button-back-step-3"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={handleJoin}
                disabled={joinOrganizationMutation.isPending}
                className="flex-1"
                data-testid="button-join-organization"
              >
                {joinOrganizationMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Joining...
                  </>
                ) : (
                  <>
                    Join Simulation
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Welcome Modal */}
      <Dialog open={showWelcomeModal} onOpenChange={setShowWelcomeModal}>
        <DialogContent className="sm:max-w-lg" data-testid="welcome-modal">
          <DialogHeader className="text-center space-y-4 pt-4">
            <div className="mx-auto h-20 w-20 rounded-full bg-accent/10 flex items-center justify-center">
              <Rocket className="h-10 w-10 text-accent" />
            </div>
            <DialogTitle className="text-2xl">
              Welcome to {validatedOrgName}!
            </DialogTitle>
            <DialogDescription className="text-base">
              You've successfully enrolled in the simulation. You're about to step into the role of CEO at Apex Manufacturing.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="aspect-video rounded-lg bg-muted/50 border border-dashed flex flex-col items-center justify-center gap-3" data-testid="welcome-video-placeholder">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                <PlayCircle className="h-8 w-8 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Intro Walkthrough</p>
                <p className="text-xs text-muted-foreground">Coming soon — a guided tour of the simulation</p>
              </div>
            </div>

            <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold text-sm">What happens next:</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3 text-sm">
                  <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Team Assignment</p>
                    <p className="text-muted-foreground text-xs">Your instructor will assign you to a team before the simulation begins.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <BookOpen className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Intelligence Briefing</p>
                    <p className="text-muted-foreground text-xs">Each week starts with scenario narratives, stakeholder voicemails, and industry intel.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Strategic Decisions</p>
                    <p className="text-muted-foreground text-xs">Make choices and write essays that shape Apex Manufacturing's future over 8 weeks.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-accent/10 rounded-lg border border-accent/20">
              <Lightbulb className="h-4 w-4 text-accent shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                <strong className="text-foreground">Pro tip:</strong> Read the Student Guide before your first week to understand scoring, advisors, and how to write strong essays.
              </p>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setShowWelcomeModal(false);
                window.open("/guides/student", "_blank");
                onComplete();
              }}
              data-testid="button-view-student-guide"
            >
              <BookOpen className="mr-2 h-4 w-4" />
              View Student Guide
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                setShowWelcomeModal(false);
                onComplete();
              }}
              data-testid="button-get-started"
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
