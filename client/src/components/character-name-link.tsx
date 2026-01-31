import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { IdCard } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CharacterProfileModal } from "./character-profile-modal";

interface CharacterNameLinkProps {
  name: string;
  showIcon?: boolean;
  className?: string;
}

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

interface CharacterData {
  id: string;
  name: string;
  role: string;
  title?: string;
  company?: string;
  headshotUrl?: string;
  bio?: string;
  socialProfile?: SocialProfile;
  influence?: number;
  hostility?: number;
}

export function CharacterNameLink({ name, showIcon = true, className = "" }: CharacterNameLinkProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: character, isLoading } = useQuery<CharacterData>({
    queryKey: ['/api/characters/by-name', name],
    queryFn: async () => {
      const res = await fetch(`/api/characters/by-name?name=${encodeURIComponent(name)}`);
      if (!res.ok) throw new Error('Failed to fetch character');
      return res.json();
    },
    enabled: isModalOpen,
  });

  return (
    <>
      <span className={`inline-flex items-center gap-1 ${className}`}>
        <span className="font-medium">{name}</span>
        {showIcon && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center justify-center h-5 w-5 rounded hover-elevate text-muted-foreground"
                data-testid={`button-view-profile-${name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <IdCard className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>View Profile</p>
            </TooltipContent>
          </Tooltip>
        )}
      </span>

      <CharacterProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        character={character || null}
        isLoading={isLoading}
      />
    </>
  );
}

interface CharacterAvatarLinkProps {
  name: string;
  headshotUrl?: string;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
  className?: string;
}

export function CharacterAvatarLink({ 
  name, 
  headshotUrl, 
  size = "md",
  showName = false,
  className = "" 
}: CharacterAvatarLinkProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: character, isLoading } = useQuery<CharacterData>({
    queryKey: ['/api/characters/by-name', name],
    queryFn: async () => {
      const res = await fetch(`/api/characters/by-name?name=${encodeURIComponent(name)}`);
      if (!res.ok) throw new Error('Failed to fetch character');
      return res.json();
    },
    enabled: isModalOpen,
  });

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-14 w-14"
  };

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => setIsModalOpen(true)}
            className={`inline-flex items-center gap-2 hover-elevate rounded-full ${className}`}
            data-testid={`button-avatar-profile-${name.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <div className={`${sizeClasses[size]} rounded-full overflow-hidden border-2 border-muted`}>
              {headshotUrl ? (
                <img 
                  src={headshotUrl} 
                  alt={name} 
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-muted flex items-center justify-center text-muted-foreground text-sm font-medium">
                  {name.split(' ').map(n => n[0]).join('')}
                </div>
              )}
            </div>
            {showName && (
              <span className="font-medium text-sm">{name}</span>
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>View {name}'s Profile</p>
        </TooltipContent>
      </Tooltip>

      <CharacterProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        character={character || null}
        isLoading={isLoading}
      />
    </>
  );
}
