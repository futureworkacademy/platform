import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  FileText,
  ArrowLeft,
  Phone,
  Lightbulb,
} from "lucide-react";

interface AdvisorData {
  id: string;
  name: string;
  category: string;
  title: string;
  organization: string;
  specialty: string;
  bio: string;
  transcript: string;
  audioUrl: string | null;
  keyInsights: string[];
  headshotUrl: string | null;
}

interface AdvisorPlayerProps {
  advisorId: string;
  onClose: () => void;
  onBack?: () => void;
}

function getCategoryLabel(category: string): string {
  switch (category) {
    case "consultant":
      return "Strategy Consultant";
    case "industry_expert":
      return "Industry Expert";
    case "thought_leader":
      return "Thought Leader";
    default:
      return category;
  }
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function AdvisorPlayer({ advisorId, onClose, onBack }: AdvisorPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showTranscript, setShowTranscript] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { data: advisor, isLoading, error } = useQuery<AdvisorData>({
    queryKey: ["/api/advisors", advisorId],
    enabled: !!advisorId,
  });

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
    if (advisor?.audioUrl) {
      setCurrentTime(0);
      setDuration(0);
      setIsPlaying(false);

      const audio = new Audio(advisor.audioUrl);
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
    }
  }, [advisor?.audioUrl, handleLoadedMetadata, handleTimeUpdate, handleEnded]);

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

  const handleClose = () => {
    audioRef.current?.pause();
    setIsPlaying(false);
    onClose();
  };

  if (error) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <Dialog open={true} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden" data-testid="dialog-advisor-player">
        <div className="bg-gradient-to-b from-primary/10 to-background p-6">
          <DialogHeader className="space-y-4">
            {onBack && (
              <Button
                variant="ghost"
                size="sm"
                className="w-fit -ml-2 gap-1"
                onClick={onBack}
                data-testid="button-back"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Advisors
              </Button>
            )}
            
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">
                Advisor Call
              </span>
            </div>

            {isLoading ? (
              <div className="flex items-center gap-4 animate-pulse">
                <div className="w-20 h-20 rounded-full bg-muted" />
                <div className="space-y-2 flex-1">
                  <div className="h-6 bg-muted rounded w-40" />
                  <div className="h-4 bg-muted rounded w-56" />
                  <div className="h-4 bg-muted rounded w-32" />
                </div>
              </div>
            ) : advisor && (
              <div className="flex items-start gap-4">
                <Avatar className="w-20 h-20 border-2 border-primary/20">
                  <AvatarImage src={advisor.headshotUrl || undefined} />
                  <AvatarFallback className="text-xl bg-primary/10">
                    {advisor.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <DialogTitle className="text-xl font-semibold">
                    {advisor.name}
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground">
                    {advisor.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {advisor.organization}
                  </p>
                  <Badge variant="secondary" className="mt-2">
                    {getCategoryLabel(advisor.category)}
                  </Badge>
                </div>
              </div>
            )}
          </DialogHeader>
        </div>

        {advisor && (
          <CardContent className="p-6 space-y-6">
            {advisor.audioUrl ? (
              <>
                <div
                  className="relative h-2 bg-muted rounded-full cursor-pointer overflow-hidden"
                  onClick={handleSeek}
                  role="slider"
                  aria-label="Audio progress"
                  aria-valuenow={Math.round(progress)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  tabIndex={0}
                  data-testid="progress-advisor"
                >
                  <div
                    className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>

                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleMute}
                    aria-label={isMuted ? "Unmute" : "Mute"}
                    data-testid="button-mute"
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </Button>

                  <div className="w-16 h-16 flex items-center justify-center">
                    <Button
                      size="icon"
                      className="rounded-full scale-150"
                      onClick={togglePlay}
                      aria-label={isPlaying ? "Pause" : "Play"}
                      data-testid="button-play-advisor"
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5 ml-0.5" />
                      )}
                    </Button>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowTranscript(!showTranscript)}
                    aria-label={showTranscript ? "Hide transcript" : "Show transcript"}
                    data-testid="button-transcript"
                  >
                    <FileText className="w-5 h-5" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">
                  Audio not yet available. Read the transcript below.
                </p>
              </div>
            )}

            {(showTranscript || !advisor.audioUrl) && advisor.transcript && (
              <Card className="mt-4">
                <CardContent className="p-4">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Transcript</p>
                  <ScrollArea className="h-32">
                    <p className="text-sm leading-relaxed">
                      {advisor.transcript}
                    </p>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {advisor.keyInsights && advisor.keyInsights.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Lightbulb className="w-3 h-3" />
                  Key Insights
                </p>
                <ul className="space-y-1">
                  {advisor.keyInsights.map((insight, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex gap-2">
                      <span className="text-primary">•</span>
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end pt-2 gap-2">
              {onBack && (
                <Button variant="outline" onClick={onBack} data-testid="button-back-bottom">
                  Back to Advisors
                </Button>
              )}
              <Button variant="outline" onClick={handleClose} data-testid="button-close-advisor">
                Close
              </Button>
            </div>
          </CardContent>
        )}
      </DialogContent>
    </Dialog>
  );
}
