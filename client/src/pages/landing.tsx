import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { AppFooter } from "@/components/app-footer";
import { useState, useEffect } from "react";
import { 
  TrendingUp, 
  Users, 
  Bot, 
  Shield, 
  Target,
  ArrowRight,
  BarChart3,
  Zap,
  Scale,
  Globe,
  Lightbulb,
  HeartHandshake,
  Landmark,
  Brain
} from "lucide-react";
import logo from "@assets/logo-icon-dark.png";

const challengeSets = [
  [
    { icon: Bot, title: "Automation Financing", description: "Secure bank debt to fund robotics and AI development", colorClass: "primary" },
    { icon: Users, title: "Workforce Displacement", description: "Manage layoffs, reskilling programs, and employee anxiety about job security", colorClass: "destructive" },
    { icon: Shield, title: "Union Relations", description: "Prevent unionization or manage collective bargaining if sentiment reaches 75%", colorClass: "warning" },
    { icon: Target, title: "Gen Z Management", description: "Address leadership pipeline crisis as young workers refuse management roles", colorClass: "accent" },
    { icon: TrendingUp, title: "Financial Performance", description: "Balance debt service, automation ROI, and revenue while managing costs", colorClass: "chart-2" },
    { icon: BarChart3, title: "Cultural Health", description: "Maintain employee morale and adaptability through rapid organizational change", colorClass: "chart-3" },
  ],
  [
    { icon: Scale, title: "Ethical AI Decisions", description: "Navigate the moral implications of replacing human workers with intelligent systems", colorClass: "primary" },
    { icon: Globe, title: "Global Competition", description: "Respond to overseas competitors who have already embraced full automation", colorClass: "destructive" },
    { icon: Lightbulb, title: "Innovation vs. Stability", description: "Balance disruptive technology adoption with operational continuity", colorClass: "warning" },
    { icon: HeartHandshake, title: "Stakeholder Trust", description: "Maintain credibility with employees, investors, and community partners", colorClass: "accent" },
    { icon: Landmark, title: "Regulatory Compliance", description: "Anticipate and adapt to evolving labor laws and AI governance policies", colorClass: "chart-2" },
    { icon: Brain, title: "Knowledge Transfer", description: "Preserve institutional knowledge as experienced workers exit the organization", colorClass: "chart-3" },
  ],
];

export default function Landing() {
  const [currentSet, setCurrentSet] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSet((prev) => (prev + 1) % challengeSets.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-md px-3 py-2">
            <img 
              src={logo} 
              alt="Future Work Academy" 
              className="h-14 w-auto"
              data-testid="img-header-logo"
            />
          </div>
          <div className="flex items-center gap-5">
            <a 
              href="/about"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:inline"
              data-testid="link-about"
            >
              About FWA
            </a>
            <a 
              href="/academia"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:inline"
              data-testid="link-educator-inquiry"
            >
              Educator?
            </a>
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
              Advanced AI Business Simulation
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground whitespace-nowrap">
              Are you Ready to Navigate the AI Revolution?
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Lead Apex Manufacturing through 8 weeks of strategic decisions balancing 
              automation, robotics, workforce displacement, union dynamics, generational, and cultural challenges.
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
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold mb-2">Key Challenges You'll Face</h2>
              <p className="text-sm text-muted-foreground">Explore the strategic dilemmas awaiting your leadership</p>
            </div>
            <div className="relative min-h-[400px]">
              {challengeSets.map((challenges, setIndex) => (
                <div
                  key={setIndex}
                  className={`grid md:grid-cols-3 gap-6 transition-all duration-700 ease-in-out ${
                    setIndex === currentSet
                      ? "opacity-100"
                      : "opacity-0 absolute inset-0 pointer-events-none"
                  }`}
                >
                  {challenges.map((challenge, index) => {
                    const IconComponent = challenge.icon;
                    return (
                      <Card key={index} className="bg-card">
                        <CardHeader>
                          <div className={`h-10 w-10 rounded-md bg-${challenge.colorClass}/10 flex items-center justify-center mb-2`}>
                            <IconComponent className={`h-5 w-5 text-${challenge.colorClass}`} />
                          </div>
                          <CardTitle className="text-lg">{challenge.title}</CardTitle>
                          <CardDescription>{challenge.description}</CardDescription>
                        </CardHeader>
                      </Card>
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-2 mt-6">
              {challengeSets.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSet(index)}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    index === currentSet ? "bg-primary" : "bg-muted-foreground/30"
                  }`}
                  data-testid={`button-challenge-set-${index}`}
                />
              ))}
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
            <div className="flex flex-wrap justify-center gap-4">
              <a href="/api/login">
                <Button variant="secondary" size="lg" data-testid="button-login-cta">
                  Sign In to Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
            </div>
            <div className="mt-8 pt-6 border-t border-primary-foreground/20">
              <p className="text-sm opacity-80 mb-3">
                Interested in bringing this simulation to your classroom?
              </p>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <a 
                  href="/for-educators" 
                  className="text-sm underline underline-offset-4 opacity-90 hover:opacity-100 transition-opacity"
                  data-testid="link-professor-inquiry"
                >
                  Contact us about academic licensing
                </a>
                <span className="opacity-50">|</span>
                <a 
                  href="/privacy" 
                  className="text-sm underline underline-offset-4 opacity-90 hover:opacity-100 transition-opacity"
                  data-testid="link-privacy-policy"
                >
                  Privacy Policy
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <AppFooter />
    </div>
  );
}
