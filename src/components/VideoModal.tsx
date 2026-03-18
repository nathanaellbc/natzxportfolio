import { useEffect, useState } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  videoSrc: string;
  videoTitle: string;
}

type Phase = "closed" | "expanding" | "pulsing" | "done" | "closing";

export function VideoModal({ isOpen, onClose, videoSrc, videoTitle }: Props) {
  const [phase, setPhase] = useState<Phase>("closed");

  // Prevent body scroll and handle animation phases
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      setPhase("expanding");

      const t1 = setTimeout(() => {
        setPhase("pulsing");

        setTimeout(() => {
          setPhase("done");
        }, 200); // pulse outwards for 200ms

      }, 400); // 400ms for height expanding

      return () => {
        clearTimeout(t1);
      };
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      document.body.style.overflowX = "";
      document.documentElement.style.overflowX = "";
      setPhase("closed");
    }
  }, [isOpen]);

  const handleClose = () => {
    setPhase("closing");
    setTimeout(() => {
      onClose();
    }, 400); // Wait for the close animation to finish
  };

  if (!isOpen && phase === "closed") return null;

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 transition-all duration-400 overflow-hidden
      ${phase === 'closed' || phase === 'closing' ? 'bg-transparent backdrop-blur-none' : 'bg-black/50 backdrop-blur-sm'}
    `}>
      {/* Click outside to close */}
      <div className="absolute inset-0 cursor-crosshair" onClick={handleClose} />

      {/* Modal Window Container */}
      <div
        className={`ctos-panel relative z-10 w-full max-w-5xl flex flex-col bg-black/95 pointer-events-auto shadow-2xl shadow-primary/20
          origin-center transition-all duration-400 ease-out h-[auto] max-h-[90vh]
          ${phase === 'closed' || phase === 'closing' ? 'opacity-0 scale-y-0' : 'opacity-100 scale-y-100'}
          before:transition-transform before:duration-200 after:transition-transform after:duration-200
          ${phase === 'pulsing' ? 'before:-translate-x-4 before:-translate-y-4 after:translate-x-4 after:translate-y-4' : 'before:translate-x-0 before:translate-y-0 after:translate-x-0 after:translate-y-0'}
        `}
      >
        {/* Content Wrapper (Fades in after window is drawn) */}
        <div className={`flex flex-col h-full transition-opacity duration-300 ${phase === 'done' ? 'opacity-100' : 'opacity-0'}`}>
          {/* Window Header */}
          <div className="flex items-center justify-between p-3 border-b border-primary/50 bg-primary/10 shrink-0">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 bg-red-500 animate-pulse"></span>
              <span className="text-secondary font-bold tracking-widest text-sm uppercase">SYS.VIEWER - {videoTitle}</span>
            </div>
            <button
              onClick={handleClose}
              className="text-muted-foreground hover:text-white hover:bg-red-500/20 px-2 py-1 transition-colors text-xs font-bold tracking-widest border border-transparent hover:border-red-500/50"
            >
              [ X ] CLOSE
            </button>
          </div>

          {/* Window Content */}
          <div className="flex-1 bg-black flex items-center justify-center">
            {phase === 'done' && (
              <video
                src={videoSrc}
                controls
                autoPlay
                className="w-full max-h-[75vh] object-contain outline-none"
              >
                Your browser does not support the video tag.
              </video>
            )}
          </div>

          {/* Window Footer */}
          <div className="p-2 border-t border-primary/30 flex justify-between text-[10px] text-muted-foreground font-bold tracking-widest uppercase shrink-0">
            <span>STATUS: DECRYPTED</span>
            <span>FORMAT: MPEG-4</span>
          </div>
        </div>
      </div>
    </div>
  );
}
