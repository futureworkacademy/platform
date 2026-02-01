import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, MessageSquare, ArrowRight } from "lucide-react";

interface EducatorCtaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScheduleCall?: () => void;
  onContactUs?: () => void;
  onContinue?: () => void;
}

const BOOKING_URL = "https://calendar.google.com/calendar/appointments";

export function EducatorCtaModal({ 
  open, 
  onOpenChange, 
  onScheduleCall,
  onContactUs,
  onContinue 
}: EducatorCtaModalProps) {
  
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
