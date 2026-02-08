import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, MessageSquare, ArrowRight, Copy, Mail, CheckCircle, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EducatorCtaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userType?: "evaluator" | "student_trial" | "preview";
  onScheduleCall?: () => void;
  onContactUs?: () => void;
  onContinue?: () => void;
}

const BOOKING_URL = "https://calendar.app.google/hhb4P8TqnpryG9M38";

export function EducatorCtaModal({ 
  open, 
  onOpenChange, 
  userType = "evaluator",
  onScheduleCall,
  onContactUs,
  onContinue 
}: EducatorCtaModalProps) {
  const { toast } = useToast();
  const [referralCopied, setReferralCopied] = useState(false);

  const referralUrl = `${window.location.origin}/for-educators?ref=student`;
  const referralEmailSubject = encodeURIComponent("Check out this AI business simulation for your class");
  const referralEmailBody = encodeURIComponent(
    `Hi Professor,\n\nI just completed a guided tour of Future Work Academy, an AI business simulation where students lead a company through workforce transformation. It covers automation strategy, stakeholder management, cultural health, and more.\n\nI think it would be a great fit for our class. Here's the link for educators:\n${referralUrl}\n\nThey offer a free 30-day demo for faculty.\n\nBest regards`
  );

  const handleScheduleCall = () => {
    window.open(BOOKING_URL, "_blank");
    if (onScheduleCall) {
      onScheduleCall();
    }
    onOpenChange(false);
  };

  const handleContactUs = () => {
    if (onContactUs) {
      onContactUs();
    }
    onOpenChange(false);
  };

  const handleContinue = () => {
    if (onContinue) {
      onContinue();
    }
    onOpenChange(false);
  };

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(referralUrl);
    setReferralCopied(true);
    toast({ title: "Link copied", description: "Share it with your professor" });
    setTimeout(() => setReferralCopied(false), 2000);
  };

  if (userType === "student_trial") {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md" data-testid="student-cta-modal">
          <DialogHeader className="text-center">
            <div className="flex justify-center mb-2">
              <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                <Share2 className="h-6 w-6 text-accent" />
              </div>
            </div>
            <DialogTitle className="text-2xl font-bold text-center">
              Think Your Class Should Use This?
            </DialogTitle>
            <DialogDescription className="text-center text-base mt-2">
              You just experienced strategic decision-making with AI evaluation, workforce analytics, and competitive scoring. Share the platform with your instructor so your whole class can play.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col gap-3 mt-4">
            <div className="flex gap-2">
              <Button 
                size="lg" 
                className="flex-1 justify-center gap-2"
                onClick={handleCopyReferral}
                data-testid="button-copy-referral-cta"
              >
                {referralCopied ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy Link for Professor
                  </>
                )}
              </Button>
              <a
                href={`mailto:?subject=${referralEmailSubject}&body=${referralEmailBody}`}
              >
                <Button 
                  size="lg" 
                  variant="outline"
                  className="gap-2"
                  data-testid="button-email-professor-cta"
                >
                  <Mail className="h-4 w-4" />
                  Email
                </Button>
              </a>
            </div>
            
            <Button 
              size="lg" 
              variant="ghost"
              className="w-full justify-center gap-2 mt-2"
              onClick={handleContinue}
              data-testid="button-continue-exploring"
            >
              Continue Exploring
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          
          <p className="text-xs text-center text-muted-foreground mt-4">
            Your professor gets a free 30-day demo with full access to all features.
          </p>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="educator-cta-modal">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold text-center">
            Ready to Transform Your Classroom?
          </DialogTitle>
          <DialogDescription className="text-center text-base mt-2">
            You've experienced how Future Work Academy prepares students for AI-driven leadership decisions. Take the next step to bring this to your curriculum.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-3 mt-4">
          <Button 
            size="lg" 
            className="w-full justify-start gap-3"
            onClick={handleScheduleCall}
            data-testid="button-schedule-call"
          >
            <Calendar className="h-5 w-5" />
            <div className="flex flex-col items-start">
              <span className="font-semibold">Schedule a Call</span>
              <span className="text-xs opacity-80">15-minute intro call to discuss your program</span>
            </div>
          </Button>
          
          <Button 
            size="lg" 
            variant="outline"
            className="w-full justify-start gap-3"
            onClick={handleContactUs}
            data-testid="button-contact-us"
          >
            <MessageSquare className="h-5 w-5" />
            <div className="flex flex-col items-start">
              <span className="font-semibold">Request More Info</span>
              <span className="text-xs opacity-60">Get pricing, syllabus integration, and more</span>
            </div>
          </Button>
          
          <Button 
            size="lg" 
            variant="ghost"
            className="w-full justify-center gap-2 mt-2"
            onClick={handleContinue}
            data-testid="button-continue-exploring"
          >
            Continue Exploring
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        
        <p className="text-xs text-center text-muted-foreground mt-4">
          Your 30-day evaluator access lets you explore everything. No credit card required.
        </p>
      </DialogContent>
    </Dialog>
  );
}
