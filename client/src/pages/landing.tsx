import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { 
  Factory, 
  TrendingUp, 
  Users, 
  Bot, 
  Shield, 
  Target,
  ArrowRight,
  BarChart3,
  Zap
} from "lucide-react";

export default function Landing() {
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
            <a href="/api/login">
              <Button data-testid="button-login">
                Sign In
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </header>

      <main>
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Zap className="h-3 w-3" />
              Business Simulation Game
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              Navigate the AI Revolution
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Lead Apex Manufacturing through 8 weeks of strategic decisions balancing 
              automation, workforce displacement, union dynamics, and Gen Z management challenges.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <a href="/api/login">
                <Button size="lg" data-testid="button-get-started">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
            </div>
          </div>
        </section>

        <section className="py-16 px-4 bg-card/30">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-2xl font-bold text-center mb-12">Key Challenges You'll Face</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-card">
                <CardHeader>
                  <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center mb-2">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Automation Financing</CardTitle>
                  <CardDescription>
                    Secure bank debt at 6.5% interest to fund robotics and AI deployment
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-card">
                <CardHeader>
                  <div className="h-10 w-10 rounded-md bg-destructive/10 flex items-center justify-center mb-2">
                    <Users className="h-5 w-5 text-destructive" />
                  </div>
                  <CardTitle className="text-lg">Workforce Displacement</CardTitle>
                  <CardDescription>
                    Manage layoffs, reskilling programs, and employee anxiety about job security
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-card">
                <CardHeader>
                  <div className="h-10 w-10 rounded-md bg-warning/10 flex items-center justify-center mb-2">
                    <Shield className="h-5 w-5 text-warning" />
                  </div>
                  <CardTitle className="text-lg">Union Relations</CardTitle>
                  <CardDescription>
                    Prevent unionization or manage collective bargaining if sentiment reaches 75%
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-card">
                <CardHeader>
                  <div className="h-10 w-10 rounded-md bg-accent/10 flex items-center justify-center mb-2">
                    <Target className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <CardTitle className="text-lg">Gen Z Management</CardTitle>
                  <CardDescription>
                    Address leadership pipeline crisis as young workers refuse management roles
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-card">
                <CardHeader>
                  <div className="h-10 w-10 rounded-md bg-chart-2/10 flex items-center justify-center mb-2">
                    <TrendingUp className="h-5 w-5 text-chart-2" />
                  </div>
                  <CardTitle className="text-lg">Financial Performance</CardTitle>
                  <CardDescription>
                    Balance debt service, automation ROI, and revenue while managing costs
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-card">
                <CardHeader>
                  <div className="h-10 w-10 rounded-md bg-chart-3/10 flex items-center justify-center mb-2">
                    <BarChart3 className="h-5 w-5 text-chart-3" />
                  </div>
                  <CardTitle className="text-lg">Cultural Health</CardTitle>
                  <CardDescription>
                    Maintain employee morale and adaptability through rapid organizational change
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-16 px-4">
          <div className="container mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground mb-8">
              Teams compete over 8 weeks, making strategic decisions each round. 
              Your score combines financial performance (revenue x workforce efficiency) 
              with cultural health (morale + union stability + adaptability).
            </p>
            <div className="grid md:grid-cols-4 gap-4 text-center">
              <div className="p-4">
                <div className="text-3xl font-bold text-primary">1</div>
                <div className="text-sm font-medium mt-2">Pre-Game Research</div>
                <div className="text-xs text-muted-foreground">Analyze industry reports</div>
              </div>
              <div className="p-4">
                <div className="text-3xl font-bold text-primary">2</div>
                <div className="text-sm font-medium mt-2">Weekly Briefings</div>
                <div className="text-xs text-muted-foreground">Receive scenario updates</div>
              </div>
              <div className="p-4">
                <div className="text-3xl font-bold text-primary">3</div>
                <div className="text-sm font-medium mt-2">Strategic Decisions</div>
                <div className="text-xs text-muted-foreground">Choose your approach</div>
              </div>
              <div className="p-4">
                <div className="text-3xl font-bold text-primary">4</div>
                <div className="text-sm font-medium mt-2">Track Results</div>
                <div className="text-xs text-muted-foreground">Monitor leaderboard</div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 px-4 bg-primary text-primary-foreground">
          <div className="container mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Lead?</h2>
            <p className="opacity-90 mb-6">
              Sign in with your school email to access your team's simulation.
            </p>
            <a href="/api/login">
              <Button variant="secondary" size="lg" data-testid="button-login-cta">
                Sign In to Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 px-4">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          The Future of Work - Business Simulation for Graduate Students
        </div>
      </footer>
    </div>
  );
}
