import { useEffect, useRef } from 'react';

// Eagerly import all frames from the ascii directory
const frameModules = import.meta.glob<{ default: string }>('../assets/ascii/*.png', { eager: true });

// Extract the URLs, ensure they are sorted correctly, and sample every 3rd frame
const framePaths = Object.entries(frameModules)
  .sort(([pathA], [pathB]) => pathA.localeCompare(pathB))
  .map(([, module]) => module.default);

const sampledFrames = framePaths.filter((_, i) => i % 3 === 0);

export function useAnimatedFavicon() {
  const currentFrame = useRef(0);
  const isPreloaded = useRef(false);
  const preloadedImages = useRef<HTMLImageElement[]>([]);

  useEffect(() => {
    // 1. Preload images to prevent flickering when swapping hrefs
    if (!isPreloaded.current && sampledFrames.length > 0) {
      sampledFrames.forEach((src) => {
        const img = new Image();
        img.src = src;
        preloadedImages.current.push(img);
      });
      isPreloaded.current = true;
    }

    let intervalId: ReturnType<typeof setInterval>;
    
    // 2. Find or create the favicon link element
    let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    
    const originalHref = link.href;

    // 3. Animation cycle logic
    const startAnimation = () => {
      // Pause if the document is not visible
      if (document.visibilityState !== 'visible' || sampledFrames.length === 0) return;
      
      intervalId = setInterval(() => {
        if (!link) return;
        currentFrame.current = (currentFrame.current + 1) % sampledFrames.length;
        link.href = sampledFrames[currentFrame.current];
      }, 100); // ~100ms per frame
    };

    const stopAnimation = () => {
      if (intervalId) clearInterval(intervalId);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        startAnimation();
      } else {
        stopAnimation();
      }
    };

    // Start listening to tab visibility
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Initial start
    startAnimation();

    return () => {
      stopAnimation();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      // Attempt to gracefully restore the original favicon on unmount
      if (link && originalHref) {
        link.href = originalHref;
      }
    };
  }, []);
}
