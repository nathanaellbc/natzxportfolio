import { useState, useEffect } from "react";

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      // Check for typical mobile breakpoint and coarse pointer capability
      const match = window.matchMedia("(max-width: 768px) and (pointer: coarse)").matches;
      // We also check just max-width 768px for the layout fallback, though the user spec 
      // heavily tied mobile optimization to (max-width: 768px) AND touch.
      // E.g. resizing desktop browsers won't get touch constraints unless DEV tools emulate it.
      setIsMobile(match);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
}
