import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { LeaderboardTable } from "@/components/leaderboard-table";
import { AlertCircle, Trophy, TrendingUp, Users, Medal } from "lucide-react";
import type { LeaderboardEntry, Team } from "@shared/schema";

export default function Leaderboard() {
  const { data: team } = useQuery<Team>({
    queryKey: ["/api/team"],
  });

  const { data: entries, isLoading, error } = useQuery<LeaderboardEntry[]>({
    queryKey: ["/api/leaderboard"],
  });

  if (isLoading) {
    return <LeaderboardSkeleton />;
  }

  if (error || !entries) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Unable to load leaderboard</h2>
        <p className="text-muted-foreground text-center max-w-md">
          There was an error loading the leaderboard data. Please try refreshing the page.
        </p>
      </div>
    );
  }

  const currentTeamEntry = entries.find((e) => e.teamId === team?.id);
  const topPerformer = entries[0];
  const avgFinancial = entries.reduce((sum, e) => sum + e.financialScore, 0) / entries.length;
  const avgCultural = entries.reduce((sum, e) => sum + e.culturalScore, 0) / entries.length;

  return (
    <div className="p-6 space-y-6" data-testid="leaderboard-page">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="outline" className="font-mono">
            {entries.length} Teams
          </Badge>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Competition Leaderboard</h1>
        <p className="text-muted-foreground">
          Compare your team's performance across financial and cultural dimensions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-yellow-500/10 to-amber-500/5 border-yellow-500/20">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/20 text-yellow-600">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Leading Team</div>
              <div className="text-lg font-semibold truncate" data-testid="leading-team">
                {topPerformer?.teamName ?? "N/A"}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent">
              <Medal className="h-6 w-6" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Your Rank</div>
              <div className="text-xl font-mono font-bold" data-testid="your-rank">
                #{currentTeamEntry?.rank ?? "-"}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Avg. Financial</div>
              <div className="text-xl font-mono font-bold" data-testid="avg-financial">
                {avgFinancial.toFixed(2)}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Avg. Cultural</div>
              <div className="text-xl font-mono font-bold" data-testid="avg-cultural">
                {avgCultural.toFixed(2)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {currentTeamEntry && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Your Team Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1">Rank</div>
                <div className="text-3xl font-mono font-bold text-primary">
                  #{currentTeamEntry.rank}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1">Financial Score</div>
                <div className="text-3xl font-mono font-bold">
                  {currentTeamEntry.financialScore.toFixed(2)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1">Cultural Score</div>
                <div className="text-3xl font-mono font-bold text-success">
                  {currentTeamEntry.culturalScore.toFixed(2)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1">Combined Score</div>
                <div className="text-3xl font-mono font-bold text-accent">
                  {currentTeamEntry.combinedScore.toFixed(2)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <LeaderboardTable entries={entries} currentTeamId={team?.id} />
    </div>
  );
}

function LeaderboardSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <Skeleton className="h-5 w-24 mb-2" />
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-32" />
      <Skeleton className="h-96" />
    </div>
  );
}
