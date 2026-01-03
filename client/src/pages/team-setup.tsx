import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { 
  Building2, 
  Users, 
  Plus, 
  X, 
  ArrowRight,
  Briefcase,
  Target,
  TrendingUp
} from "lucide-react";
import { insertTeamSchema, type InsertTeam } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function TeamSetup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [memberInput, setMemberInput] = useState("");

  const form = useForm<InsertTeam>({
    resolver: zodResolver(insertTeamSchema),
    defaultValues: {
      name: "",
      members: [],
      totalWeeks: 8,
    },
  });

  const members = form.watch("members");

  const createTeamMutation = useMutation({
    mutationFn: async (data: InsertTeam) => {
      const response = await apiRequest("POST", "/api/team", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team"] });
      toast({
        title: "Team Created",
        description: "Your team has been registered. Proceed to the Research Center.",
      });
      setLocation("/research");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create team",
        variant: "destructive",
      });
    },
  });

  const addMember = () => {
    const trimmed = memberInput.trim();
    if (trimmed && members.length < 6 && !members.includes(trimmed)) {
      form.setValue("members", [...members, trimmed]);
      setMemberInput("");
    }
  };

  const removeMember = (index: number) => {
    form.setValue("members", members.filter((_, i) => i !== index));
  };

  const onSubmit = (data: InsertTeam) => {
    createTeamMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Building2 className="h-8 w-8" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">
            The Future of Work
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A strategic business simulation where you navigate AI adoption challenges 
            while managing employee sentiment and company performance.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Card className="bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Target className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">8 Week Challenge</p>
                  <p className="text-sm text-muted-foreground">Strategic decisions each week</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-success/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-success" />
                <div>
                  <p className="font-medium">Dual Scoring</p>
                  <p className="text-sm text-muted-foreground">Financial + Cultural metrics</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-accent/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Briefcase className="h-5 w-5 text-accent" />
                <div>
                  <p className="font-medium">Real Decisions</p>
                  <p className="text-sm text-muted-foreground">AI, lobbying, reskilling</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Register Your Team
            </CardTitle>
            <CardDescription>
              Enter your team details to begin the simulation. You'll need to review 
              the company research materials before starting Week 1.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Team Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Strategic Innovators" 
                          {...field}
                          data-testid="input-team-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-3">
                  <FormLabel>Team Members</FormLabel>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter member name"
                      value={memberInput}
                      onChange={(e) => setMemberInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addMember();
                        }
                      }}
                      data-testid="input-member-name"
                    />
                    <Button 
                      type="button" 
                      variant="secondary" 
                      onClick={addMember}
                      disabled={members.length >= 6}
                      data-testid="button-add-member"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {form.formState.errors.members && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.members.message}
                    </p>
                  )}
                  
                  {members.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {members.map((member, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary"
                          className="pl-3 pr-1 py-1.5 gap-1"
                          data-testid={`badge-member-${index}`}
                        >
                          {member}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 ml-1"
                            onClick={() => removeMember(index)}
                            data-testid={`button-remove-member-${index}`}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {members.length}/6 team members added
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={createTeamMutation.isPending}
                  data-testid="button-create-team"
                >
                  {createTeamMutation.isPending ? (
                    "Creating Team..."
                  ) : (
                    <>
                      Continue to Research Center
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          After registration, you'll access company intelligence reports, historical data, 
          and industry analysis to inform your strategic decisions.
        </p>
      </div>
    </div>
  );
}
