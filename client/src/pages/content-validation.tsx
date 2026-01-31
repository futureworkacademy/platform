import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Info, 
  RefreshCw, 
  FileText, 
  Users, 
  Calendar,
  Building2,
  ArrowLeft,
  ShieldAlert,
  Phone,
  MessageSquare,
  Newspaper,
  ClipboardCheck,
  Mic
} from "lucide-react";
import { Link } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

interface ValidationResult {
  type: 'error' | 'warning' | 'info';
  source: string;
  message: string;
  category: 'character' | 'company' | 'week' | 'competitor' | 'content' | 'voicemail' | 'advisor' | 'briefing' | 'decision' | 'intel' | 'system';
  line?: number;
}

interface ValidationReport {
  timestamp: string;
  canonical: {
    company: string;
    characterCount: number;
    weekCount: number;
    competitorCount: number;
  };
  results: ValidationResult[];
  summary: {
    errors: number;
    warnings: number;
    info: number;
    passed: boolean;
  };
}

function ResultIcon({ type }: { type: ValidationResult['type'] }) {
  switch (type) {
    case 'error':
      return <XCircle className="h-4 w-4 text-destructive" />;
    case 'warning':
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case 'info':
      return <Info className="h-4 w-4 text-blue-500" />;
  }
}

function CategoryIcon({ category }: { category: ValidationResult['category'] }) {
  switch (category) {
    case 'character':
      return <Users className="h-4 w-4" />;
    case 'company':
      return <Building2 className="h-4 w-4" />;
    case 'week':
      return <Calendar className="h-4 w-4" />;
    case 'content':
      return <FileText className="h-4 w-4" />;
    case 'voicemail':
      return <Mic className="h-4 w-4" />;
    case 'advisor':
      return <Phone className="h-4 w-4" />;
    case 'briefing':
      return <MessageSquare className="h-4 w-4" />;
    case 'decision':
      return <ClipboardCheck className="h-4 w-4" />;
    case 'intel':
      return <Newspaper className="h-4 w-4" />;
    default:
      return <Info className="h-4 w-4" />;
  }
}

function CategoryBadge({ category }: { category: ValidationResult['category'] }) {
  const variants: Record<string, string> = {
    character: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    company: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    week: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    competitor: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    content: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
    voicemail: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
    advisor: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
    briefing: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
    decision: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
    intel: "bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200",
    system: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  };
  
  return (
    <Badge variant="outline" className={`${variants[category] || ''} border-0 text-xs`}>
      <CategoryIcon category={category} />
      <span className="ml-1 capitalize">{category}</span>
    </Badge>
  );
}

export default function ContentValidation() {
  const { user, isLoading: authLoading } = useAuth();
  
  const adminValue = user?.isAdmin as unknown;
  const isAdminUser = adminValue === true || adminValue === 'true' || adminValue === 'super_admin';
  
  const { data: report, isLoading, isFetching, refetch } = useQuery<ValidationReport>({
    queryKey: ["/api/admin/content-validation"],
    staleTime: 0,
    refetchOnWindowFocus: false,
    enabled: isAdminUser,
  });

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["/api/admin/content-validation"] });
    refetch();
  };

  if (authLoading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }
  
  if (!isAdminUser) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ShieldAlert className="h-12 w-12 text-destructive mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-4">You need admin privileges to access this page.</p>
            <Link href="/">
              <Button data-testid="button-go-home">Go Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  const errors = report?.results.filter(r => r.type === 'error') || [];
  const warnings = report?.results.filter(r => r.type === 'warning') || [];
  const infos = report?.results.filter(r => r.type === 'info') || [];

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/super-admin">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Content Validation Dashboard</h1>
          <p className="text-muted-foreground">
            Validate all content against canonical.json source of truth
          </p>
        </div>
        <Button 
          onClick={handleRefresh} 
          disabled={isFetching}
          data-testid="button-refresh"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
          {isFetching ? 'Validating...' : 'Run Validation'}
        </Button>
      </div>

      {report && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card data-testid="card-canonical-source">
              <CardHeader className="pb-2">
                <CardDescription>Canonical Source</CardDescription>
                <CardTitle className="text-lg">{report.canonical.company}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div className="flex items-center gap-2">
                    <Users className="h-3 w-3" />
                    <span>{report.canonical.characterCount} Characters</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    <span>{report.canonical.weekCount} Weeks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-3 w-3" />
                    <span>{report.canonical.competitorCount} Competitors</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-errors">
              <CardHeader className="pb-2">
                <CardDescription>Errors</CardDescription>
                <CardTitle className={`text-2xl ${report.summary.errors > 0 ? 'text-destructive' : 'text-green-600'}`}>
                  {report.summary.errors}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {report.summary.errors === 0 ? 'No critical issues' : 'Must be fixed'}
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-warnings">
              <CardHeader className="pb-2">
                <CardDescription>Warnings</CardDescription>
                <CardTitle className={`text-2xl ${report.summary.warnings > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {report.summary.warnings}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {report.summary.warnings === 0 ? 'No warnings' : 'Review recommended'}
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-status">
              <CardHeader className="pb-2">
                <CardDescription>Status</CardDescription>
                <CardTitle className="text-lg flex items-center gap-2">
                  {report.summary.passed ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span className="text-green-600">Passed</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-destructive" />
                      <span className="text-destructive">Failed</span>
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Last run: {new Date(report.timestamp).toLocaleTimeString()}
                </p>
              </CardContent>
            </Card>
          </div>

          {errors.length > 0 && (
            <Card className="mb-4 border-destructive/50" data-testid="card-error-list">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <XCircle className="h-5 w-5" />
                  Errors ({errors.length})
                </CardTitle>
                <CardDescription>Critical issues that must be resolved</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {errors.map((result, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-start gap-3 p-3 rounded-md bg-destructive/5 border border-destructive/20"
                      data-testid={`row-error-${idx}`}
                    >
                      <ResultIcon type={result.type} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                            {result.source}
                          </code>
                          <CategoryBadge category={result.category} />
                        </div>
                        <p className="text-sm mt-1 text-foreground">{result.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {warnings.length > 0 && (
            <Card className="mb-4 border-yellow-500/50" data-testid="card-warning-list">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-600">
                  <AlertTriangle className="h-5 w-5" />
                  Warnings ({warnings.length})
                </CardTitle>
                <CardDescription>Potential issues to review</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {warnings.map((result, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-start gap-3 p-3 rounded-md bg-yellow-500/5 border border-yellow-500/20"
                      data-testid={`row-warning-${idx}`}
                    >
                      <ResultIcon type={result.type} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                            {result.source}
                          </code>
                          <CategoryBadge category={result.category} />
                        </div>
                        <p className="text-sm mt-1 text-foreground">{result.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {infos.length > 0 && (
            <Card data-testid="card-info-list">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-600">
                  <Info className="h-5 w-5" />
                  Information ({infos.length})
                </CardTitle>
                <CardDescription>Validation checks completed</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {infos.map((result, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-start gap-3 p-3 rounded-md bg-blue-500/5 border border-blue-500/20"
                      data-testid={`row-info-${idx}`}
                    >
                      <ResultIcon type={result.type} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                            {result.source}
                          </code>
                          <CategoryBadge category={result.category} />
                        </div>
                        <p className="text-sm mt-1 text-foreground">{result.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
