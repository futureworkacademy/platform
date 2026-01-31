import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Briefcase, GraduationCap, Award, Users, MapPin } from "lucide-react";

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

interface CharacterProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: {
    name: string;
    role: string;
    title?: string;
    company?: string;
    headshotUrl?: string;
    bio?: string;
    socialProfile?: SocialProfile;
    influence?: number;
    hostility?: number;
  } | null;
}

export function CharacterProfileModal({ isOpen, onClose, character }: CharacterProfileModalProps) {
  if (!character) return null;

  const socialProfile = character.socialProfile as SocialProfile | undefined;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">Character Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Section - LinkedIn Style */}
          <div className="relative">
            {/* Banner Background */}
            <div className="h-24 bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8f] rounded-t-lg" />
            
            {/* Profile Info */}
            <div className="px-6 pb-4">
              <div className="flex items-end gap-4 -mt-12">
                <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                  <AvatarImage src={character.headshotUrl} alt={character.name} />
                  <AvatarFallback className="text-2xl bg-muted">
                    {character.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="pb-2">
                  <h2 className="text-xl font-bold">{character.name}</h2>
                  <p className="text-muted-foreground">
                    {socialProfile?.headline || character.title || character.role}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Midwest, United States
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {socialProfile?.connections || "500+"} connections
                </span>
              </div>

              {/* Influence/Hostility indicators */}
              <div className="flex gap-2 mt-3">
                {character.influence !== undefined && (
                  <Badge variant="outline" className="text-xs">
                    Influence: {character.influence}/10
                  </Badge>
                )}
                {character.hostility !== undefined && (
                  <Badge variant="outline" className="text-xs">
                    Hostility: {character.hostility}/10
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* About Section */}
          {socialProfile?.about && (
            <div className="px-2">
              <h3 className="font-semibold mb-2">About</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {socialProfile.about}
              </p>
            </div>
          )}

          {/* Experience Section */}
          <div className="px-2">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Experience
            </h3>
            <div className="space-y-4">
              {/* Current Position */}
              {socialProfile?.currentPosition && (
                <Card className="border-l-4 border-l-[#22c55e]">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{socialProfile.currentPosition.title}</h4>
                        <p className="text-sm text-muted-foreground">{socialProfile.currentPosition.company}</p>
                        <p className="text-xs text-muted-foreground mt-1">{socialProfile.currentPosition.duration}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">Current</Badge>
                    </div>
                    {socialProfile.currentPosition.description && (
                      <p className="text-sm mt-2 text-muted-foreground">
                        {socialProfile.currentPosition.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Previous Positions */}
              {socialProfile?.previousPositions?.map((position, index) => (
                <div key={index} className="pl-4 border-l-2 border-muted">
                  <h4 className="font-medium text-sm">{position.title}</h4>
                  <p className="text-sm text-muted-foreground">{position.company}</p>
                  <p className="text-xs text-muted-foreground">{position.duration}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Education Section */}
          {socialProfile?.education && socialProfile.education.length > 0 && (
            <div className="px-2">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Education
              </h3>
              <div className="space-y-3">
                {socialProfile.education.map((edu, index) => (
                  <div key={index} className="pl-4 border-l-2 border-muted">
                    <h4 className="font-medium text-sm">{edu.institution}</h4>
                    <p className="text-sm text-muted-foreground">{edu.degree}</p>
                    <p className="text-xs text-muted-foreground">{edu.year}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills Section */}
          {socialProfile?.skills && socialProfile.skills.length > 0 && (
            <div className="px-2">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Award className="h-4 w-4" />
                Skills & Endorsements
                {socialProfile.endorsements && (
                  <span className="text-xs text-muted-foreground font-normal">
                    ({socialProfile.endorsements} endorsements)
                  </span>
                )}
              </h3>
              <div className="flex flex-wrap gap-2">
                {socialProfile.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Simulated Content Disclaimer */}
          <div className="pt-4 border-t">
            <p className="text-[10px] text-center text-muted-foreground/60 uppercase tracking-wider">
              Simulated Content — For Educational Use Only
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
