import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, BookOpen, Target, Users } from "lucide-react";

export default function About() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold" data-testid="text-about-title">About The Future of Work</h1>
        <p className="text-muted-foreground">
          Understanding the business simulation experience
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-lg">Simulation Objectives</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground" data-testid="text-about-objectives">
              Content coming soon. This section will detail the learning objectives and goals of the business simulation.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-lg">How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground" data-testid="text-about-how-it-works">
              Content coming soon. This section will explain the mechanics of the 8-week simulation experience.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-lg">Team Dynamics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground" data-testid="text-about-team">
              Content coming soon. This section will cover team roles, collaboration expectations, and scoring.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
              <Info className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-lg">Additional Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground" data-testid="text-about-resources">
              Content coming soon. This section will provide links to supplementary materials and references.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
