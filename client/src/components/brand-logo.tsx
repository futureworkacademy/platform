import logoIcon from "@assets/favicon.png";

interface BrandLogoProps {
  height?: string;
  className?: string;
  iconOnly?: boolean;
  "data-testid"?: string;
}

export function BrandLogo({ 
  height = "h-10", 
  className = "", 
  iconOnly = false,
  "data-testid": testId = "img-brand-logo"
}: BrandLogoProps) {
  const heightNum = parseInt(height.replace("h-", "")) || 10;
  const textSize = heightNum >= 16 ? "text-xl" : heightNum >= 12 ? "text-lg" : heightNum >= 10 ? "text-base" : "text-sm";
  const subTextSize = heightNum >= 16 ? "text-sm" : heightNum >= 12 ? "text-xs" : "text-[10px]";

  if (iconOnly) {
    return (
      <img 
        src={logoIcon} 
        alt="Future Work Academy" 
        className={`${height} w-auto ${className}`}
        data-testid={testId}
      />
    );
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`} data-testid={testId}>
      <img 
        src={logoIcon} 
        alt="FWA" 
        className={`${height} w-auto flex-shrink-0`}
      />
      <div className="flex flex-col leading-tight">
        <span className={`${textSize} font-bold tracking-tight text-[#1e3a5f] dark:text-white`} style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
          Future Work
        </span>
        <span className={`${subTextSize} font-semibold tracking-[0.15em] uppercase text-[#1e3a5f]/80 dark:text-white/80`} style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
          Academy
        </span>
      </div>
    </div>
  );
}
