import { useState, useEffect } from "react";

interface Props {
  end: number;
  label: string;
  duration?: number;
  start?: boolean;
  suffix?: string;
}

export function CountUpBox({ end, label, duration = 1500, start = false, suffix = "" }: Props) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Easing function: easeOutQuart
      const easeOut = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOut * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end); // Ensure we hit exact end
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, start]);

  return (
    <div className={`relative group transition-all duration-500
      ${start ? 'opacity-100 translate-y-0 scale-100 hover:scale-105 hover:z-20' : 'opacity-0 translate-y-8 scale-95'}`}
    >
      {/* Main Panel with expanding inner corners */}
      <div 
        className={`ctos-panel p-6 flex flex-col justify-center items-center text-center gap-2 hover:bg-secondary/10 cursor-crosshair relative h-full w-full transition-colors
          before:transition-transform before:duration-500 group-hover:before:-translate-x-2 group-hover:before:-translate-y-2
          after:transition-transform after:duration-500 group-hover:after:translate-x-2 group-hover:after:translate-y-2`}
      >
        <div className="text-4xl text-secondary font-bold">{count}{suffix}</div>
        <div className="text-xs text-primary font-bold tracking-widest">{label}</div>
      </div>
    </div>
  );
}
