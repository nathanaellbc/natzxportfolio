import { useEffect, useState } from "react";

interface Props {
  message: string;
  isOpen: boolean;
  onClose: () => void;
  duration?: number;
}

type Phase = "closed" | "expanding" | "pulsing" | "done" | "closing";

export function NotificationToast({ message, isOpen, onClose, duration = 5000 }: Props) {
  const [phase, setPhase] = useState<Phase>("closed");
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (isOpen) {
      setPhase("expanding");
      setProgress(100);
      
      const t1 = setTimeout(() => {
        setPhase("pulsing");
        
        setTimeout(() => {
          setPhase("done");
        }, 150);
        
      }, 300);

      // Simple progress bar depletion
      const interval = setInterval(() => {
        setProgress(prev => Math.max(0, prev - (100 / (duration / 100))));
      }, 100);

      const tAutoClose = setTimeout(() => {
        handleClose();
      }, duration);
      
      return () => {
        clearTimeout(t1);
        clearTimeout(tAutoClose);
        clearInterval(interval);
      };
    } else {
      setPhase("closed");
    }
  }, [isOpen, duration]);

  const handleClose = () => {
    setPhase("closing");
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!isOpen && phase === "closed") return null;

  return (
    <div className="fixed bottom-8 right-8 z-[200] pointer-events-none flex flex-col items-end">
      <div 
        className={`ctos-panel relative w-80 bg-black/95 pointer-events-auto border-primary/50 shadow-2xl shadow-primary/20
          transition-all duration-300 ease-out origin-bottom
          ${phase === 'closed' || phase === 'closing' ? 'opacity-0 scale-y-0 translate-y-4' : 'opacity-100 scale-y-100 translate-y-0'}
          before:transition-transform before:duration-200 after:transition-transform after:duration-200
          ${phase === 'pulsing' ? 'before:-translate-x-2 before:-translate-y-2 after:translate-x-2 after:translate-y-2' : ''}
        `}
      >
        <div className={`p-4 flex flex-col gap-3 transition-opacity duration-200 ${phase === 'done' ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex justify-between items-center border-b border-primary/30 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-primary animate-pulse"></span>
              <span className="text-[10px] text-secondary font-bold tracking-[0.2em] uppercase">UPLINK_NOTIFICATION</span>
            </div>
            <button onClick={handleClose} className="text-white/50 hover:text-primary transition-colors text-[10px] font-bold">[ X ]</button>
          </div>
          
          <div className="relative">
            <p className="text-sm text-white font-mono leading-relaxed tracking-wide">
              {message}
            </p>
          </div>

          <div className="h-0.5 w-full bg-white/10 mt-1 relative overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-primary transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <div className="flex justify-between text-[8px] text-muted-foreground font-bold tracking-widest uppercase mt-1">
            <span>STATUS: REGISTERED</span>
            <span>ID: {Math.random().toString(36).substring(7).toUpperCase()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
