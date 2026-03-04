import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Search,
  Briefcase,
  GraduationCap,
  Users,
  MapPin,
  Award,
  ChevronDown,
  ChevronUp,
  Zap,
  Shield,
  RefreshCw,
  Target,
  Phone,
  MessageSquare,
  ArrowLeft,
  AlertTriangle,
  Download,
  FileText,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Lightbulb,
  Headphones,
  CheckCircle2,
} from "lucide-react";
import { generateWeeklyOfflineGuidePDF } from "@/lib/offline-guide-pdf-export";

interface SocialProfile {
  headline: string;
  about: string;
  currentPosition: {
    title: string;
    company: string;
    duration: string;
    description: string;
  };
  previousPositions: Array<{
    title: string;
    company: string;
    duration: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    year: string;
  }>;
  skills: string[];
  endorsements: number;
  connections: string;
}

interface CharacterProfile {
  id: string;
  name: string;
  role: string;
  title?: string;
  company?: string;
  headshotUrl?: string;
  bio?: string;
  personality?: string;
  motivations?: string;
  fears?: string;
  socialProfile?: SocialProfile;
  influence?: number;
  hostility?: number;
  flexibility?: number;
  riskTolerance?: number;
  impactCategories?: string[];
  sortOrder?: number;
}

function TraitBar({ label, value, icon: Icon, barColor }: { label: string; value: number; icon: typeof Zap; barColor: string }) {
  return (
    <div className="flex items-center gap-2" data-testid={`trait-${label.toLowerCase().replace(/\s+/g, '-')}`}>
      <Icon className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
      <span className="text-xs text-muted-foreground w-24 flex-shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${(value / 10) * 100}%`, backgroundColor: barColor }}
        />
      </div>
      <span className="text-xs font-mono text-muted-foreground w-6 text-right">{value}</span>
    </div>
  );
}

function CharacterCard({ character }: { character: CharacterProfile }) {
  const [expanded, setExpanded] = useState(false);
  const socialProfile = character.socialProfile as SocialProfile | undefined;
  const initials = character.name.split(' ').map(n => n[0]).join('');

  return (
    <Card
      className="overflow-visible cursor-pointer hover-elevate"
      onClick={() => setExpanded(!expanded)}
      data-testid={`card-character-${character.id}`}
    >
      <div className="relative">
        <div className="bg-gradient-to-r from-primary/80 to-primary/40 rounded-t-md px-4 pt-4 pb-3">
          <div className="flex items-start gap-3">
            <Avatar className="h-16 w-16 border-4 border-background shadow-md flex-shrink-0">
              <AvatarImage src={character.headshotUrl} alt={character.name} />
              <AvatarFallback className="text-lg bg-muted">{initials}</AvatarFallback>
            </Avatar>
            <div className="pt-1 min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-bold text-sm truncate text-white" data-testid={`text-character-name-${character.id}`}>{character.name}</h3>
                  <p className="text-xs text-white/80 line-clamp-2">
                    {socialProfile?.headline || character.title || character.role}
                  </p>
                  {character.company && (
                    <p className="text-xs text-white/60 truncate">{character.company}</p>
                  )}
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="flex-shrink-0 text-white/80 hover:text-white"
                  data-testid={`button-expand-${character.id}`}
                  aria-label={expanded ? "Collapse" : "Expand"}
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpanded(!expanded);
                  }}
                >
                  {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className="px-4 pb-3">
          <div className="mt-3 space-y-1.5">
            <TraitBar label="Influence" value={character.influence ?? 5} icon={Zap} barColor="hsl(var(--accent))" />
            <TraitBar label="Hostility" value={character.hostility ?? 5} icon={Shield} barColor="hsl(var(--destructive))" />
            <TraitBar label="Flexibility" value={character.flexibility ?? 5} icon={RefreshCw} barColor="hsl(var(--primary))" />
            <TraitBar label="Risk Tolerance" value={character.riskTolerance ?? 5} icon={Target} barColor="hsl(var(--chart-4))" />
          </div>

          {character.impactCategories && (character.impactCategories as string[]).length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {(character.impactCategories as string[]).map((cat) => (
                <Badge key={cat} variant="secondary" className="text-[10px] capitalize">
                  {cat}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {expanded && (
        <CardContent className="pt-0 space-y-4">
          <Separator />

          {socialProfile?.about && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">About</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{socialProfile.about}</p>
            </div>
          )}

          {character.bio && !socialProfile?.about && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Bio</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{character.bio}</p>
            </div>
          )}

          {character.personality && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Personality</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{character.personality}</p>
            </div>
          )}

          {character.motivations && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Motivations</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{character.motivations}</p>
            </div>
          )}

          {character.fears && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Concerns</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{character.fears}</p>
            </div>
          )}

          {socialProfile?.currentPosition && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                <Briefcase className="h-3 w-3" />
                Experience
              </h4>
              <div className="space-y-3">
                <div className="pl-3 border-l-2 border-accent">
                  <p className="text-sm font-medium">{socialProfile.currentPosition.title}</p>
                  <p className="text-xs text-muted-foreground">{socialProfile.currentPosition.company}</p>
                  <p className="text-xs text-muted-foreground/70">{socialProfile.currentPosition.duration}</p>
                  {socialProfile.currentPosition.description && (
                    <p className="text-xs text-muted-foreground mt-1">{socialProfile.currentPosition.description}</p>
                  )}
                </div>
                {socialProfile.previousPositions?.map((pos, i) => (
                  <div key={i} className="pl-3 border-l-2 border-muted">
                    <p className="text-sm font-medium">{pos.title}</p>
                    <p className="text-xs text-muted-foreground">{pos.company}</p>
                    <p className="text-xs text-muted-foreground/70">{pos.duration}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {socialProfile?.education && socialProfile.education.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                <GraduationCap className="h-3 w-3" />
                Education
              </h4>
              <div className="space-y-2">
                {socialProfile.education.map((edu, i) => (
                  <div key={i} className="pl-3 border-l-2 border-muted">
                    <p className="text-sm font-medium">{edu.institution}</p>
                    <p className="text-xs text-muted-foreground">{edu.degree}</p>
                    <p className="text-xs text-muted-foreground/70">{edu.year}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {socialProfile?.skills && socialProfile.skills.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                <Award className="h-3 w-3" />
                Skills
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {socialProfile.skills.map((skill, i) => (
                  <Badge key={i} variant="outline" className="text-[10px]">{skill}</Badge>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2 border-t">
            <div className="flex items-center gap-3 text-xs text-muted-foreground/60">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Midwest, United States
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {socialProfile?.connections || "500+"} connections
              </span>
            </div>
          </div>

          <p className="text-[10px] text-center text-muted-foreground/50 uppercase tracking-wider pt-1">
            Simulated Content — For Educational Use Only
          </p>
        </CardContent>
      )}
    </Card>
  );
}

interface PublicVoicemail {
  title: string;
  transcript: string;
  urgency: string;
  audioUrl: string | null;
  duration: number | null;
  character: { name: string; role: string; title?: string; headshotUrl?: string | null };
}

interface PublicAdvisor {
  id: string;
  name: string;
  category: string;
  title: string;
  specialty: string;
  bio: string;
  transcript: string | null;
  audioUrl: string | null;
  keyInsights: string[] | null;
  headshotUrl: string | null;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function InlineAudioPlayer({ audioUrl, label }: { audioUrl: string; label: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleLoadedMetadata = useCallback(() => {
    setDuration(audioRef.current?.duration || 0);
  }, []);

  const handleTimeUpdate = useCallback(() => {
    setCurrentTime(audioRef.current?.currentTime || 0);
  }, []);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    setCurrentTime(0);
  }, []);

  useEffect(() => {
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.pause();
      audioRef.current = null;
    };
  }, [audioUrl, handleLoadedMetadata, handleTimeUpdate, handleEnded]);

  const togglePlay = async () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (err) {
        console.error("Audio playback failed:", err);
        setIsPlaying(false);
      }
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = percent * duration;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="space-y-2" data-testid={`audio-player-${label}`}>
      <div
        className="relative h-2 bg-muted rounded-full cursor-pointer overflow-hidden"
        onClick={handleSeek}
        role="slider"
        aria-label={`${label} audio progress`}
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        tabIndex={0}
        data-testid={`progress-${label}`}
      >
        <div
          className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause" : "Play"}
            data-testid={`button-play-${label}`}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            aria-label={isMuted ? "Unmute" : "Mute"}
            data-testid={`button-mute-${label}`}
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
          <span className="text-xs text-muted-foreground font-mono">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
        <Badge variant="outline" className="text-xs gap-1">
          <Headphones className="h-3 w-3" />
          Audio
        </Badge>
      </div>
    </div>
  );
}

function VoicemailSection({ voicemail }: { voicemail: PublicVoicemail }) {
  const initials = voicemail.character.name.split(' ').map(n => n[0]).join('');
  const [showTranscript, setShowTranscript] = useState(false);
  return (
    <Card data-testid="card-public-voicemail">
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-destructive/10">
            <Phone className="h-5 w-5 text-destructive" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-lg" data-testid="text-voicemail-title">Incoming Voicemail</h3>
            <p className="text-sm text-muted-foreground">{voicemail.title}</p>
          </div>
          <Badge variant="destructive" className="flex-shrink-0">
            <AlertTriangle className="h-3 w-3 mr-1" />
            {voicemail.urgency} priority
          </Badge>
        </div>

        <div className="bg-accent/5 rounded-md p-3 border border-accent/20">
          <p className="text-sm font-medium flex items-center gap-2">
            <Headphones className="h-4 w-4 text-accent flex-shrink-0" />
            Listen to this voicemail before making your decision
          </p>
        </div>

        <Separator />

        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12 flex-shrink-0">
            <AvatarImage src={voicemail.character.headshotUrl || undefined} alt={voicemail.character.name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="space-y-1 min-w-0">
            <p className="font-semibold text-sm">{voicemail.character.name}</p>
            <p className="text-xs text-muted-foreground">{voicemail.character.title || voicemail.character.role}</p>
          </div>
        </div>

        {voicemail.audioUrl && (
          <InlineAudioPlayer audioUrl={voicemail.audioUrl} label="voicemail" />
        )}

        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTranscript(!showTranscript)}
            className="gap-2 text-xs"
            data-testid="button-toggle-voicemail-transcript"
          >
            <FileText className="h-3.5 w-3.5" />
            {showTranscript ? "Hide Transcript" : "Show Transcript"}
          </Button>
          {showTranscript && (
            <div className="bg-muted/50 rounded-lg p-4 border mt-2">
              <p className="text-sm leading-relaxed italic" data-testid="text-voicemail-transcript">
                "{voicemail.transcript}"
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function AdvisorSection({ advisor }: { advisor: PublicAdvisor }) {
  const initials = advisor.name.split(' ').map(n => n[0]).join('');
  const [showTranscript, setShowTranscript] = useState(false);
  return (
    <Card data-testid="card-public-advisor">
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/10">
            <MessageSquare className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-lg" data-testid="text-advisor-title">This Week's Expert Consultant</h3>
            <p className="text-sm text-muted-foreground">Listen for special insights to inform your decision</p>
          </div>
        </div>

        <div className="bg-accent/5 rounded-md p-3 border border-accent/20">
          <p className="text-sm font-medium flex items-center gap-2">
            <Headphones className="h-4 w-4 text-accent flex-shrink-0" />
            Listen to this consultant's guidance before submitting
          </p>
        </div>

        <Separator />

        <div className="flex items-start gap-4">
          <Avatar className="h-14 w-14 flex-shrink-0">
            <AvatarImage src={advisor.headshotUrl || undefined} alt={advisor.name} />
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <div className="space-y-2 min-w-0">
            <div>
              <p className="font-semibold">{advisor.name}</p>
              <p className="text-sm text-muted-foreground">{advisor.title}</p>
            </div>
            <Badge variant="secondary" className="capitalize">{advisor.category.replace('_', ' ')}</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Specialty</h4>
            <p className="text-sm">{advisor.specialty}</p>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Background</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{advisor.bio}</p>
          </div>
        </div>

        {advisor.audioUrl && (
          <InlineAudioPlayer audioUrl={advisor.audioUrl} label="advisor" />
        )}

        {advisor.keyInsights && advisor.keyInsights.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
              <Lightbulb className="h-3 w-3" />
              Key Insights
            </h4>
            <ul className="space-y-1.5">
              {advisor.keyInsights.map((insight, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5 text-accent flex-shrink-0 mt-0.5" />
                  {insight}
                </li>
              ))}
            </ul>
          </div>
        )}

        {advisor.transcript && (
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTranscript(!showTranscript)}
              className="gap-2 text-xs"
              data-testid="button-toggle-advisor-transcript"
            >
              <FileText className="h-3.5 w-3.5" />
              {showTranscript ? "Hide Transcript" : "Show Transcript"}
            </Button>
            {showTranscript && (
              <div className="bg-muted/50 rounded-lg p-4 border mt-2">
                <p className="text-sm leading-relaxed" data-testid="text-advisor-transcript">
                  {advisor.transcript}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const WEEK_TITLES: Record<number, string> = {
  1: "The Automation Imperative",
  2: "The Talent Pipeline Crisis",
  3: "Union Storm Brewing",
  4: "The First Displacement",
  5: "The Manager Exodus",
  6: "Debt Day of Reckoning",
  7: "The Competitive Response",
  8: "Strategic Direction",
};

export function WeeklySimulationPage({ weekNumber }: { weekNumber: number }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const weekTitle = WEEK_TITLES[weekNumber] || `Week ${weekNumber}`;

  const { data: characters, isLoading } = useQuery<CharacterProfile[]>({
    queryKey: ["/api/characters"],
  });

  const { data: voicemail } = useQuery<PublicVoicemail>({
    queryKey: ["/api/public/voicemail", weekNumber],
    queryFn: () => fetch(`/api/public/voicemail?week=${weekNumber}`).then(r => r.json()),
  });

  const { data: advisor } = useQuery<PublicAdvisor>({
    queryKey: ["/api/public/advisor", weekNumber],
    queryFn: () => fetch(`/api/public/advisor?week=${weekNumber}`).then(r => r.json()),
  });

  const filtered = characters?.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.role.toLowerCase().includes(q) ||
      (c.title?.toLowerCase().includes(q) ?? false) ||
      (c.company?.toLowerCase().includes(q) ?? false)
    );
  }) ?? [];

  const sorted = [...filtered].sort((a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99));

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      const res = await fetch(`/api/public/week-content?week=${weekNumber}`);
      if (!res.ok) {
        throw new Error(`Failed to load week content (${res.status})`);
      }
      const weekContent = await res.json();
      generateWeeklyOfflineGuidePDF(weekNumber, weekTitle, weekContent);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Could not generate the PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between gap-4 p-4 border-b sticky top-0 z-50 bg-card/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="icon" data-testid="button-back-home">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <p className="font-semibold text-sm">Future Work Academy</p>
            <p className="text-xs text-muted-foreground">Apex Manufacturing Simulation</p>
          </div>
        </div>
        <ThemeToggle />
      </header>

      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6" data-testid="weekly-simulation-page">
        <div className="space-y-1">
          <Badge variant="outline" className="mb-2">Week {weekNumber} of 8</Badge>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">{weekTitle}</h1>
          <p className="text-sm text-muted-foreground">
            Apex Manufacturing Simulation — Week {weekNumber} Assignment
          </p>
        </div>

        <Separator />

        <div className="space-y-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <h2 className="text-xl font-bold" data-testid="text-week-resources">Week {weekNumber} Resources</h2>
              <p className="text-sm text-muted-foreground">
                Everything you need for "{weekTitle}"
              </p>
            </div>
            <Button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              data-testid="button-download-offline-guide"
            >
              <Download className="h-4 w-4 mr-2" />
              {isDownloading ? "Generating..." : `Download Week ${weekNumber} PDF`}
            </Button>
          </div>

          <Card className="border-dashed" data-testid="card-offline-guide-info">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-full bg-accent/10 flex-shrink-0">
                  <FileText className="h-5 w-5 text-accent" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">How to Complete Week {weekNumber}</h3>
                  <ol className="text-sm text-muted-foreground leading-relaxed space-y-2 list-decimal list-inside">
                    <li><span className="font-medium text-foreground">Download the PDF</span> — contains the full briefing, Intel Articles, decision options with financial data, and the scoring rubric.</li>
                    <li><span className="font-medium text-foreground">Listen to the voicemail</span> below — an urgent message from a key stakeholder that sets the stage for your decision.</li>
                    <li><span className="font-medium text-foreground">Listen to this week's expert consultant</span> below — their special guidance provides critical context you won't find in the written materials.</li>
                    <li><span className="font-medium text-foreground">Submit your response</span> through your LMS using the template in the PDF.</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>

          {voicemail && <VoicemailSection voicemail={voicemail} />}
          {advisor && <AdvisorSection advisor={advisor} />}
        </div>

        <Separator className="my-8" />

        <div className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-xl font-bold" data-testid="text-stakeholder-title">Stakeholder Directory</h2>
            <p className="text-sm text-muted-foreground">
              Meet the 17 key stakeholders at Apex Manufacturing. Understanding their backgrounds,
              motivations, and influence is critical to navigating your decisions successfully.
            </p>
          </div>

          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, role, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search-characters"
            />
          </div>

          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-16 w-16 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                    </div>
                    <Skeleton className="h-2 w-full" />
                    <Skeleton className="h-2 w-full" />
                    <Skeleton className="h-2 w-3/4" />
                  </div>
                </Card>
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground" data-testid="text-no-results">
                  No characters match your search.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="grid-characters">
              {sorted.map((character) => (
                <CharacterCard key={character.id} character={character} />
              ))}
            </div>
          )}
        </div>

        <p className="text-[10px] text-center text-muted-foreground/50 uppercase tracking-wider">
          All characters, organizations, and scenarios are fictional — created for educational simulation purposes only
        </p>
      </div>
    </div>
  );
}

export default function CharacterProfilesPage() {
  const { user } = useAuth();
  const isPublicView = !user;
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    document.title = "Stakeholder Directory | Future Work Academy";
  }, []);

  const { data: characters, isLoading } = useQuery<CharacterProfile[]>({
    queryKey: ["/api/characters"],
  });

  const filtered = characters?.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.role.toLowerCase().includes(q) ||
      (c.title?.toLowerCase().includes(q) ?? false) ||
      (c.company?.toLowerCase().includes(q) ?? false)
    );
  }) ?? [];

  const sorted = [...filtered].sort((a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99));

  return (
    <div className={`${isPublicView ? 'min-h-screen bg-background' : ''}`}>
      {isPublicView && (
        <header className="flex items-center justify-between gap-4 p-4 border-b sticky top-0 z-50 bg-card/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="icon" data-testid="button-back-home">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <p className="font-semibold text-sm">Future Work Academy</p>
              <p className="text-xs text-muted-foreground">Apex Manufacturing Simulation</p>
            </div>
          </div>
          <ThemeToggle />
        </header>
      )}
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6" data-testid="character-profiles-page">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Stakeholder Directory</h1>
          <p className="text-sm text-muted-foreground">
            Meet the 17 key stakeholders at Apex Manufacturing. Understanding their backgrounds,
            motivations, and influence is critical to navigating your decisions successfully.
          </p>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, role, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-characters"
          />
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                  <Skeleton className="h-2 w-full" />
                  <Skeleton className="h-2 w-full" />
                  <Skeleton className="h-2 w-3/4" />
                </div>
              </Card>
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground" data-testid="text-no-results">
                No characters match your search.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="grid-characters">
            {sorted.map((character) => (
              <CharacterCard key={character.id} character={character} />
            ))}
          </div>
        )}

        <p className="text-[10px] text-center text-muted-foreground/50 uppercase tracking-wider">
          All characters, organizations, and scenarios are fictional — created for educational simulation purposes only
        </p>
      </div>
    </div>
  );
}
