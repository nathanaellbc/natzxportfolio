import { useEffect, useRef } from "react";

export function MobileCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    let targetX = -100;
    let targetY = -100;

    const onTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) {
        targetX = touch.clientX;
        targetY = touch.clientY;
        // Fast instant update to position without transition delay
        cursor.style.transitionDuration = "0ms";
        cursor.style.transform = `translate(${targetX}px, ${targetY}px) scale(0.8)`;
        
        // Force reflow
        void cursor.offsetWidth;

        // Apply scaling and fading in with transition
        cursor.style.transitionDuration = "250ms";
        cursor.style.transform = `translate(${targetX}px, ${targetY}px) scale(1.5)`;
        cursor.style.opacity = "1";
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) {
        targetX = touch.clientX;
        targetY = touch.clientY;
        // Follow smoothly but with 0ms translation for fast response
        cursor.style.transitionDuration = "50ms";
        cursor.style.transform = `translate(${targetX}px, ${targetY}px) scale(1.5)`;
      }
    };

    const onTouchEnd = () => {
      cursor.style.transitionDuration = "300ms";
      cursor.style.transform = `translate(${targetX}px, ${targetY}px) scale(0.5)`;
      cursor.style.opacity = "0";
    };

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove", onTouchMove, { passive: true });
    document.addEventListener("touchend", onTouchEnd, { passive: true });
    document.addEventListener("touchcancel", onTouchEnd, { passive: true });

    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
      document.removeEventListener("touchcancel", onTouchEnd);
    };
  }, []);

  return (
    <>
      <div
        ref={cursorRef}
        className="fixed top-[-24px] left-[-24px] w-[48px] h-[48px] border-[1.5px] border-primary bg-primary/10 rounded-full pointer-events-none z-[999999] transition-all ease-out"
        style={{
          opacity: 0,
          transform: "scale(0.5)",
          willChange: "transform, opacity",
          mixBlendMode: "difference"
        }}
      >
        <div className="absolute inset-0 m-auto w-[6px] h-[6px] bg-primary rounded-full shadow-[0_0_8px_white]"></div>
      </div>
      <style>{`
        /* Reset cursor to auto on touch devices to avoid ghost hidden cursor issues */
        *, *::before, *::after { cursor: auto !important; }
      `}</style>
    </>
  );
}
