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
  Phone,
  PhoneMissed,
  Volume2,
  VolumeX,
  FileText,
  AlertTriangle,
} from "lucide-react";

interface VoicemailData {
  id: string;
  weekNumber: number;
  title: string;
  transcript: string;
  audioUrl: string | null;
  urgency: "low" | "medium" | "high" | "critical";
  duration: number | null;
  character: {
    name: string;
    role: string;
    title?: string;
    headshotUrl: string | null;
  };
}

interface VoicemailPlayerProps {
  weekNumber: number;
  onClose?: () => void;
  autoShow?: boolean;
}

function getUrgencyColor(urgency: string) {
  switch (urgency) {
    case "critical":
      return "bg-red-500/10 text-red-500 border-red-500/20";
    case "high":
      return "bg-orange-500/10 text-orange-500 border-orange-500/20";
    case "medium":
      return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    default:
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
  }
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function VoicemailPlayer({ weekNumber, onClose, autoShow = true }: VoicemailPlayerProps) {
  const [isOpen, setIsOpen] = useState(autoShow);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showTranscript, setShowTranscript] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { data: voicemail, isLoading, error } = useQuery<VoicemailData>({
    queryKey: ["/api/voicemails", weekNumber],
    enabled: weekNumber > 0,
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
    if (voicemail?.audioUrl) {
      setCurrentTime(0);
      setDuration(voicemail.duration || 0);
      setIsPlaying(false);

      const audio = new Audio(voicemail.audioUrl);
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
  }, [voicemail?.audioUrl, voicemail?.duration, handleLoadedMetadata, handleTimeUpdate, handleEnded]);

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
    setIsOpen(false);
    onClose?.();
  };

  useEffect(() => {
    if (!isLoading && !voicemail && isOpen) {
      handleClose();
    }
  }, [isLoading, voicemail, isOpen]);

  if (!voicemail && !isLoading) return null;
  if (error) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden" data-testid="dialog-voicemail">
        <div className="bg-gradient-to-b from-primary/10 to-background p-6">
          <DialogHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PhoneMissed className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">
                  New Voicemail
                </span>
              </div>
              {voicemail && (
                <Badge 
                  variant="outline" 
                  className={getUrgencyColor(voicemail.urgency)}
                >
                  {voicemail.urgency === "critical" && <AlertTriangle className="w-3 h-3 mr-1" />}
                  {voicemail.urgency.charAt(0).toUpperCase() + voicemail.urgency.slice(1)}
                </Badge>
              )}
            </div>
            
            {isLoading ? (
              <div className="flex items-center gap-4 animate-pulse">
                <div className="w-16 h-16 rounded-full bg-muted" />
                <div className="space-y-2 flex-1">
                  <div className="h-5 bg-muted rounded w-32" />
                  <div className="h-4 bg-muted rounded w-48" />
                </div>
              </div>
            ) : voicemail && (
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16 border-2 border-primary/20">
                  <AvatarImage src={voicemail.character.headshotUrl || undefined} />
                  <AvatarFallback className="text-lg bg-primary/10">
                    {voicemail.character.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <DialogTitle className="text-lg font-semibold">
                    {voicemail.character.name}
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground">
                    {voicemail.character.title || voicemail.character.role}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Week {voicemail.weekNumber} • {voicemail.title}
                  </p>
                </div>
              </div>
            )}
          </DialogHeader>
        </div>

        {voicemail && (
          <CardContent className="p-6 space-y-4">
            <div 
              className="relative h-2 bg-muted rounded-full cursor-pointer overflow-hidden"
              onClick={handleSeek}
              role="slider"
              aria-label="Audio progress"
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
              tabIndex={0}
              data-testid="progress-voicemail"
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
                  disabled={!voicemail.audioUrl}
                  aria-label={isPlaying ? "Pause" : "Play"}
                  data-testid="button-play-voicemail"
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

            {showTranscript && (
              <Card className="mt-4">
                <CardContent className="p-4">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Transcript</p>
                  <ScrollArea className="h-32">
                    <p className="text-sm leading-relaxed">
                      {voicemail.transcript}
                    </p>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end pt-2">
              <Button 
                variant="outline" 
                onClick={handleClose}
                data-testid="button-close-voicemail"
              >
                Close
              </Button>
            </div>
          </CardContent>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function VoicemailNotification({ weekNumber, onClick }: { weekNumber: number; onClick: () => void }) {
  const { data: voicemail } = useQuery<VoicemailData>({
    queryKey: ["/api/voicemails", weekNumber],
    enabled: weekNumber > 0,
  });

  if (!voicemail) return null;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className="gap-2"
      data-testid="button-voicemail-notification"
    >
      <Phone className="w-4 h-4" />
      <span>New Voicemail</span>
      <Badge 
        variant="outline" 
        className={`${getUrgencyColor(voicemail.urgency)} text-xs`}
      >
        {voicemail.urgency}
      </Badge>
    </Button>
  );
}
