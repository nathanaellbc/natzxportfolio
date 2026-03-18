import { useState, useEffect } from "react";

interface FeedCardProps {
  proj: {
    id: number;
    title: string;
    desc: string;
    tags: string[];
    revealed: boolean;
    imageSrc?: string;
    liveLink?: string;
  };
}

type FeedPhase = "no_signal" | "glitching" | "active";

export function FeedCard({ proj }: FeedCardProps) {
  const [phase, setPhase] = useState<FeedPhase>("no_signal");

  useEffect(() => {
    // Only start the internal boot sequence once the card is actually revealed by scroll
    if (proj.revealed) {
      // 1. Initial wait on NO SIGNAL
      const t1 = setTimeout(() => {
        setPhase("glitching");
        
        // 2. Short burst of glitch effect
        const t2 = setTimeout(() => {
          setPhase("active");
        }, 500); // 500ms of glitching
        
        return () => clearTimeout(t2);
      }, 800); // Wait 800ms before glitching begins
      
      return () => clearTimeout(t1);
    } else {
      // Reset if scrolled completely away
      setPhase("no_signal");
    }
  }, [proj.revealed]);

  return (
    <div className={`relative group transition-all duration-700 ease-out h-full ${proj.revealed ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}>
      <div className="ctos-panel w-full h-full flex flex-col transition-all duration-500 hover:scale-[1.02] hover:bg-secondary/5 
        before:transition-transform before:duration-500 group-hover:before:-translate-x-2 group-hover:before:-translate-y-2 
        after:transition-transform after:duration-500 group-hover:after:translate-x-2 group-hover:after:translate-y-2">
        
        {/* Image Frame Container */}
        <div className="aspect-video bg-muted border-b border-primary/50 relative overflow-hidden transition-all duration-500 filter grayscale group-hover:grayscale-0">
          
          {/* Permanent Scanline Overlay for Image Frame */}
          <div className="absolute inset-0 bg-[repeating-linear-gradient(transparent,transparent_2px,rgba(0,0,0,0.5)_2px,rgba(0,0,0,0.5)_4px)] z-20 pointer-events-none opacity-30"></div>
          
          {/* Phase 1: NO SIGNAL */}
          {(phase === "no_signal" || !proj.imageSrc) && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
              <span className="text-secondary/40 font-bold text-4xl tracking-widest animate-pulse">NO_SIGNAL</span>
            </div>
          )}

          {/* Phase 2: GLITCHING */}
          {phase === "glitching" && proj.imageSrc && (
            <div className="absolute inset-0 flex items-center justify-center bg-black z-10 overflow-hidden">
               {/* Extremely raw CSS glitch effect using multiple translated stacked texts */}
               <div className="relative font-bold text-5xl tracking-widest italic">
                  <span className="absolute top-0 left-0 -ml-1 text-red-500 mix-blend-screen animate-pulse opacity-80" style={{ transform: 'skew(-15deg) translate(-5px, 2px)' }}>CONNECTING...</span>
                  <span className="absolute top-0 left-0 ml-1 text-blue-500 mix-blend-screen animate-pulse opacity-80" style={{ transform: 'skew(15deg) translate(5px, -2px)' }}>CONNECTING...</span>
                  <span className="relative text-white mix-blend-screen" style={{ transform: 'skew(5deg)' }}>CONNECTING...</span>
               </div>
               
               {/* Horizontal glitch lines */}
               <div className="absolute inset-0 bg-white/10 mix-blend-overlay animate-pulse-slow object-cover" style={{ clipPath: 'polygon(0 20%, 100% 20%, 100% 30%, 0 30%)' }}></div>
               <div className="absolute inset-0 bg-primary/20 mix-blend-overlay animate-pulse object-cover" style={{ clipPath: 'polygon(0 60%, 100% 60%, 100% 70%, 0 70%)' }}></div>
            </div>
          )}

          {/* Phase 3: ACTIVE STREAM (Load the GIF/Image) */}
          {phase === "active" && proj.imageSrc && (
             <img 
              src={proj.imageSrc} 
              alt={proj.title}
              className="absolute inset-0 w-full h-full object-cover z-0"
            />
          )}

          {/* Overlay text - REC Badge */}
          <div className="absolute top-2 left-2 z-30 text-xs font-bold text-primary bg-black/80 px-2 py-1 border border-primary/50">
            REC_ [0{proj.id}]
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-4 flex-1">
          <h3 className="text-xl font-bold text-white tracking-widest">{proj.title}</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">{proj.desc}</p>
          <div className="flex flex-wrap gap-2 mt-auto pt-2">
            {proj.tags.map(t => (
              <span key={t} className="text-xs uppercase px-2 py-1 border border-secondary text-secondary tracking-widest font-bold bg-secondary/10">
                {t}
              </span>
            ))}
          </div>
          {proj.liveLink && (
            <a 
              href={proj.liveLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 bg-transparent border border-muted-foreground text-muted-foreground px-6 py-2 text-sm font-bold tracking-widest hover:border-primary hover:text-primary transition-all w-max hover:bg-primary/10 no-underline inline-block"
            >
              [ LIVE_LINK ]
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
