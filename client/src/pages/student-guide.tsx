import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  BookOpen,
  LayoutDashboard,
  FileText,
  Settings,
  BarChart3,
  Trophy,
  ClipboardCheck,
  HelpCircle,
  CheckCircle,
  Clock,
  AlertCircle,
  Lightbulb,
  Users,
  ArrowRight,
  Headphones,
  MessageSquare,
  GraduationCap,
} from "lucide-react";

export default function StudentGuide() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8" data-testid="student-guide-page">
      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <BookOpen className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">Student Guide</h1>
        </div>
        <p className="text-lg text-muted-foreground" data-testid="text-page-subtitle">
          Everything you need to know to succeed in The Future of Work simulation
        </p>
      </div>

      <Card className="border-primary/20 bg-primary/5" data-testid="card-welcome">
        <CardContent className="p-6">
          <div className="flex items-start gap-4 flex-wrap">
            <div className="p-3 rounded-full bg-primary/10">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-2 flex-1 min-w-0">
              <h3 className="font-semibold text-lg" data-testid="text-welcome-title">Welcome to Apex Manufacturing</h3>
              <p className="text-muted-foreground" data-testid="text-welcome-description">
                You've been selected to lead a mid-sized manufacturing company through a critical AI transformation. 
                Over the next 8 weeks, you'll make strategic decisions that balance financial performance, 
                workforce morale, and technological progress. Your professor has enrolled you in this simulation 
                to experience the real challenges executives face when implementing AI.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card data-testid="card-getting-started">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 flex-wrap">
              <CheckCircle className="h-5 w-5 text-accent" />
              Getting Started Checklist
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-md bg-muted/50" data-testid="checklist-item-1">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm font-bold">1</span>
              <div>
                <p className="font-medium">Log in with your university email</p>
                <p className="text-sm text-muted-foreground">Use the same email address your professor registered you with</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-md bg-muted/50" data-testid="checklist-item-2">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm font-bold">2</span>
              <div>
                <p className="font-medium">Complete the Research Phase</p>
                <p className="text-sm text-muted-foreground">Review Apex Manufacturing's background before making decisions</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-md bg-muted/50" data-testid="checklist-item-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm font-bold">3</span>
              <div>
                <p className="font-medium">Read your Intelligence Briefing</p>
                <p className="text-sm text-muted-foreground">Each week starts with crucial context and voicemails from stakeholders</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-md bg-muted/50" data-testid="checklist-item-4">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm font-bold">4</span>
              <div>
                <p className="font-medium">Submit your decisions</p>
                <p className="text-sm text-muted-foreground">Make strategic choices and write essay responses explaining your reasoning</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-weekly-workflow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 flex-wrap">
              <Clock className="h-5 w-5 text-primary" />
              Weekly Workflow
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Each simulation week follows a consistent pattern:
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 flex-wrap" data-testid="workflow-step-briefing">
                <div className="p-2 rounded-md bg-primary/10">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">Intelligence Briefing</p>
                  <p className="text-xs text-muted-foreground">Context, voicemails, intel articles</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex items-center gap-3 flex-wrap" data-testid="workflow-step-decisions">
                <div className="p-2 rounded-md bg-primary/10">
                  <Settings className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">Decisions</p>
                  <p className="text-xs text-muted-foreground">Choose options, write rationale</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex items-center gap-3 flex-wrap" data-testid="workflow-step-results">
                <div className="p-2 rounded-md bg-primary/10">
                  <ClipboardCheck className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">Week Results</p>
                  <p className="text-xs text-muted-foreground">Scores, feedback, consequences</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-navigation">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 flex-wrap">
            <LayoutDashboard className="h-5 w-5" />
            Navigation Guide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/" data-testid="link-dashboard">
              <div className="p-4 rounded-lg border hover-elevate cursor-pointer">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <LayoutDashboard className="h-5 w-5 text-primary" />
                  <span className="font-medium">Dashboard</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your command center with company metrics, quick actions, and simulation status
                </p>
              </div>
            </Link>
            <Link href="/briefing" data-testid="link-briefing">
              <div className="p-4 rounded-lg border hover-elevate cursor-pointer">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="font-medium">Intelligence Briefing</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Weekly scenario context, stakeholder voicemails, and industry intel articles
                </p>
              </div>
            </Link>
            <Link href="/decisions" data-testid="link-decisions">
              <div className="p-4 rounded-lg border hover-elevate cursor-pointer">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <Settings className="h-5 w-5 text-primary" />
                  <span className="font-medium">Decisions</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Make strategic choices and write essay responses explaining your reasoning
                </p>
              </div>
            </Link>
            <Link href="/analytics" data-testid="link-analytics">
              <div className="p-4 rounded-lg border hover-elevate cursor-pointer">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <span className="font-medium">People Analytics</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Detailed workforce data, department breakdowns, and cultural health metrics
                </p>
              </div>
            </Link>
            <Link href="/week-results" data-testid="link-week-results">
              <div className="p-4 rounded-lg border hover-elevate cursor-pointer">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <ClipboardCheck className="h-5 w-5 text-primary" />
                  <span className="font-medium">Week Results</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  View AI-graded essay feedback, decision outcomes, and score breakdowns
                </p>
              </div>
            </Link>
            <Link href="/leaderboard" data-testid="link-leaderboard">
              <div className="p-4 rounded-lg border hover-elevate cursor-pointer">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <Trophy className="h-5 w-5 text-primary" />
                  <span className="font-medium">Leaderboard</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Compare performance with classmates on financial and cultural scores
                </p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card data-testid="card-voicemails">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 flex-wrap">
              <Headphones className="h-5 w-5" />
              Stakeholder Voicemails
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Each week, you'll receive voicemails from key stakeholders at Apex Manufacturing. 
              These provide crucial context and often foreshadow the decisions you'll need to make.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm flex-wrap" data-testid="urgency-critical">
                <Badge variant="destructive" className="text-xs">Critical</Badge>
                <span>Urgent issues requiring immediate attention</span>
              </div>
              <div className="flex items-center gap-2 text-sm flex-wrap" data-testid="urgency-high">
                <Badge variant="secondary" className="text-xs">High</Badge>
                <span>Important matters to address this week</span>
              </div>
              <div className="flex items-center gap-2 text-sm flex-wrap" data-testid="urgency-medium">
                <Badge variant="outline" className="text-xs">Medium</Badge>
                <span>Strategic guidance and updates</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground italic">
              Listen to voicemails carefully—stakeholders' concerns will influence how your decisions are received.
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-advisors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 flex-wrap">
              <MessageSquare className="h-5 w-5" />
              Phone-a-Friend Advisors
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Stuck on a tough decision? You have access to 9 specialized advisors who can provide 
              AI-generated strategic guidance.
            </p>
            <div className="p-3 rounded-md bg-primary/10" data-testid="advisor-credits-info">
              <p className="text-sm font-medium">3 Advisor Credits Per Semester</p>
              <p className="text-xs text-muted-foreground mt-1">
                Use them wisely on your most challenging decisions
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              Advisors include: CEO Coach, CFO Strategist, HR Expert, Union Relations Specialist, 
              Technology Advisor, Crisis Manager, and more.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-scoring">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 flex-wrap">
            <Trophy className="h-5 w-5" />
            How You're Scored
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3" data-testid="score-financial">
              <h4 className="font-medium flex items-center gap-2 flex-wrap">
                <span className="w-3 h-3 rounded-full bg-accent" />
                Financial Score
              </h4>
              <p className="text-sm text-muted-foreground">
                Based on revenue growth, cost management, and return on investment. 
                Strong financial decisions improve shareholder value and company sustainability.
              </p>
            </div>
            <div className="space-y-3" data-testid="score-cultural">
              <h4 className="font-medium flex items-center gap-2 flex-wrap">
                <span className="w-3 h-3 rounded-full bg-primary" />
                Cultural Score
              </h4>
              <p className="text-sm text-muted-foreground">
                Measures employee morale, union relations, and workforce adaptability. 
                People-focused decisions build a resilient organization.
              </p>
            </div>
          </div>
          
          <div className="p-4 rounded-lg bg-muted/50" data-testid="rubric-section">
            <h4 className="font-medium mb-3">Essay Evaluation Rubric</h4>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-start gap-2" data-testid="rubric-evidence">
                <CheckCircle className="h-4 w-4 text-accent mt-0.5" />
                <div>
                  <span className="font-medium">Evidence Quality</span>
                  <p className="text-muted-foreground text-xs">Use data and facts from briefings</p>
                </div>
              </div>
              <div className="flex items-start gap-2" data-testid="rubric-reasoning">
                <CheckCircle className="h-4 w-4 text-accent mt-0.5" />
                <div>
                  <span className="font-medium">Reasoning Coherence</span>
                  <p className="text-muted-foreground text-xs">Clear logical connections</p>
                </div>
              </div>
              <div className="flex items-start gap-2" data-testid="rubric-tradeoffs">
                <CheckCircle className="h-4 w-4 text-accent mt-0.5" />
                <div>
                  <span className="font-medium">Trade-off Analysis</span>
                  <p className="text-muted-foreground text-xs">Acknowledge pros and cons</p>
                </div>
              </div>
              <div className="flex items-start gap-2" data-testid="rubric-stakeholders">
                <CheckCircle className="h-4 w-4 text-accent mt-0.5" />
                <div>
                  <span className="font-medium">Stakeholder Consideration</span>
                  <p className="text-muted-foreground text-xs">Address multiple perspectives</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card data-testid="card-tips">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 flex-wrap">
            <Lightbulb className="h-5 w-5" />
            Tips for Success
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3" data-testid="tip-read">
              <div className="p-2 rounded-full bg-accent/10">
                <FileText className="h-4 w-4 text-accent" />
              </div>
              <div>
                <p className="font-medium">Read Everything</p>
                <p className="text-sm text-muted-foreground">
                  Intel articles and voicemails contain hints about upcoming challenges
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3" data-testid="tip-stakeholders">
              <div className="p-2 rounded-full bg-accent/10">
                <Users className="h-4 w-4 text-accent" />
              </div>
              <div>
                <p className="font-medium">Consider All Stakeholders</p>
                <p className="text-sm text-muted-foreground">
                  Employees, board, union, and customers all matter
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3" data-testid="tip-balance">
              <div className="p-2 rounded-full bg-accent/10">
                <BarChart3 className="h-4 w-4 text-accent" />
              </div>
              <div>
                <p className="font-medium">Balance Short & Long Term</p>
                <p className="text-sm text-muted-foreground">
                  Quick wins can backfire; sustainable strategies win
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3" data-testid="tip-essays">
              <div className="p-2 rounded-full bg-accent/10">
                <MessageSquare className="h-4 w-4 text-accent" />
              </div>
              <div>
                <p className="font-medium">Write Thoughtful Essays</p>
                <p className="text-sm text-muted-foreground">
                  Quality reasoning matters as much as the choice itself
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card data-testid="card-help">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 flex-wrap">
            <HelpCircle className="h-5 w-5" />
            Need Help?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border" data-testid="help-academic">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <GraduationCap className="h-5 w-5 text-primary" />
                <span className="font-medium">Academic Questions</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Contact your professor for questions about grading, deadlines, or course requirements.
              </p>
            </div>
            <div className="p-4 rounded-lg border" data-testid="help-technical">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <AlertCircle className="h-5 w-5 text-primary" />
                <span className="font-medium">Technical Issues</span>
              </div>
              <p className="text-sm text-muted-foreground">
                If you experience login problems or bugs, email support@futureworkacademy.com
              </p>
            </div>
          </div>
          <div className="flex items-center justify-center pt-4">
            <Link href="/feedback">
              <Button variant="outline" data-testid="button-submit-feedback">
                <MessageSquare className="h-4 w-4 mr-2" />
                Submit Feedback
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
