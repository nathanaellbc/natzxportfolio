import { useEffect, useRef } from "react";
import bgVideo from "@/assets/bg.mp4";

export function VideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Attempt play to ensure it auto-plays on all browsers
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.warn("Video auto-play failed", error);
      });
    }

    let rafId: number | null = null;
    const handleScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        if (containerRef.current) {
          const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
          const scrollY = window.scrollY;
          // Progress from 0 to 1
          const progress = Math.max(0, Math.min(1, scrollY / maxScroll));
          
          // Container is 130vh high. It starts at top: 0, and translates up to -30vh over the full scroll.
          containerRef.current.style.transform = `translate3d(0, -${progress * 30}vh, 0)`;
        }
        rafId = null;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Run once initially
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0 bg-black">
      {/* 
        Container is 130vh tall to allow for 30vh of parallax translateY.
      */}
      <div 
        ref={containerRef}
        className="absolute top-0 left-0 w-full h-[130vh] will-change-transform"
      >
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-30"
        >
          <source src={bgVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/60 mix-blend-multiply"></div>
      </div>
    </div>
  );
}
