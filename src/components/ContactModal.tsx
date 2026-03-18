import { useEffect, useState, useRef } from "react";
import dcmImg from "@/assets/DCM.png";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type Phase = "closed" | "expanding" | "pulsing" | "done" | "closing";

export function ContactModal({ isOpen, onClose }: Props) {
  const [phase, setPhase] = useState<Phase>("closed");
  const [isEnlarged, setIsEnlarged] = useState(false);
  const [docScale, setDocScale] = useState(1);
  const [docOffset, setDocOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // React state for low-frequency UI sync 
  const [isOverImage, setIsOverImage] = useState(false);
  const [isMagnifierEnabled, setIsMagnifierEnabled] = useState(false);

  const imgRef = useRef<HTMLImageElement>(null);

  // High-frequency mutable refs for rAF
  const mousePos = useRef({ x: 0, y: 0 });
  const dragStart = useRef({ x: 0, y: 0 });
  const currentOffset = useRef({ x: 0, y: 0 }); // Mirror docOffset for synchronous access in rAF

  // DOM element refs for direct manipulation
  const scanBoxRef = useRef<HTMLDivElement>(null);
  const connectorLineRef = useRef<SVGLineElement>(null);
  const magContentRef = useRef<HTMLDivElement>(null);
  const magPanelRef = useRef<HTMLDivElement>(null);
  const currentPanelPos = useRef({ x: -1000, y: -1000 }); // Store current lerp state
  const coordTextRef = useRef<HTMLSpanElement>(null);
  const latTextRef = useRef<HTMLSpanElement>(null);
  const lonTextRef = useRef<HTMLSpanElement>(null);

  const forensicZoom = 2; // Lens multiplier

  useEffect(() => {
    currentOffset.current = docOffset;
  }, [docOffset]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      setPhase("expanding");
      setDocScale(1);
      setDocOffset({ x: 0, y: 0 });
      currentOffset.current = { x: 0, y: 0 };

      const t1 = setTimeout(() => {
        setPhase("pulsing");
        setTimeout(() => setPhase("done"), 200);
      }, 400);

      return () => clearTimeout(t1);
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      setPhase("closed");
      setIsEnlarged(false);
      setIsOverImage(false);
    }
  }, [isOpen]);

  const clampOffset = (scale: number, offset: { x: number, y: number }) => {
    if (!imgRef.current) return offset;
    // Calculate unscaled container bounds vs scaled image
    const rect = imgRef.current.parentElement?.getBoundingClientRect();
    if (!rect) return offset;
    // Max offset allows edge of scaled image to reach edge of container
    const maxX = Math.max(0, (rect.width * scale - rect.width) / 2);
    const maxY = Math.max(0, (rect.height * scale - rect.height) / 2);
    return {
      x: Math.max(-maxX, Math.min(maxX, offset.x)),
      y: Math.max(-maxY, Math.min(maxY, offset.y))
    };
  };

  // ─── High Performance Loop ─────────────────────────────────────────────────────────────
  useEffect(() => {
    let rafId: number;

    const tick = () => {
      // 1. Update scanning box position
      if (scanBoxRef.current) {
        scanBoxRef.current.style.left = `${mousePos.current.x}px`;
        scanBoxRef.current.style.top = `${mousePos.current.y}px`;
      }

      // 2. Update panel positioning
      if (magPanelRef.current) {
        // True 45-deg geometry: symmetric dx/dy to panel center
        let dx = 240;
        let dy = -240;
        const panelHalf = 160; // 320 / 2

        // Smart screen-bounds flipping
        if (mousePos.current.x + Math.abs(dx) + panelHalf > window.innerWidth - 30) {
          dx = -240; // Flip left
        }

        if (mousePos.current.y - Math.abs(dy) - panelHalf < 30) {
          dy = 240; // Flip bottom
        } else if (mousePos.current.y + Math.abs(dy) + panelHalf > window.innerHeight - 30) {
          dy = -240; // Ensure it fits up top if at bottom edge
        }

        const cx = mousePos.current.x + dx;
        const cy = mousePos.current.y + dy;

        const targetLeft = cx - panelHalf;
        const targetTop = cy - panelHalf;

        // Initialize instantly if starting up or disabled
        if (currentPanelPos.current.x === -1000) {
          currentPanelPos.current.x = targetLeft;
          currentPanelPos.current.y = targetTop;
        }

        // Lerp position (0.06 factor for deliberate, heavy mechanical feel)
        currentPanelPos.current.x += (targetLeft - currentPanelPos.current.x) * 0.06;
        currentPanelPos.current.y += (targetTop - currentPanelPos.current.y) * 0.06;

        // Use transform for smooth high-performance tracking
        magPanelRef.current.style.transform = `translate3d(${currentPanelPos.current.x}px, ${currentPanelPos.current.y}px, 0)`;

        // 3. Update connecting line explicitly to true geometric centers relative to the lerped position
        if (connectorLineRef.current) {
          const lerpedCx = currentPanelPos.current.x + panelHalf;
          const lerpedCy = currentPanelPos.current.y + panelHalf;

          connectorLineRef.current.setAttribute("x1", String(mousePos.current.x));
          connectorLineRef.current.setAttribute("y1", String(mousePos.current.y));
          connectorLineRef.current.setAttribute("x2", String(lerpedCx));
          connectorLineRef.current.setAttribute("y2", String(lerpedCy));
        }
      }

      // 4. Update zoomed content sync
      if (magContentRef.current && imgRef.current && isMagnifierEnabled) {
        const imgRect = imgRef.current.getBoundingClientRect();

        // Calculate bounds of the actual image content (accounting for object-contain within the img element)
        // Note: For <img object-contain>, getBoundingClientRect returns the entire container, so we must calculate the exact image aspect ratio fit.
        const cRatio = imgRect.width / imgRect.height;
        const iRatio = imgRef.current.naturalWidth / imgRef.current.naturalHeight;

        let visualWidth = imgRect.width;
        let visualHeight = imgRect.height;
        let visualLeft = imgRect.left;
        let visualTop = imgRect.top;

        if (iRatio > cRatio) {
          visualHeight = imgRect.width / iRatio;
          visualTop = imgRect.top + (imgRect.height - visualHeight) / 2;
        } else {
          visualWidth = imgRect.height * iRatio;
          visualLeft = imgRect.left + (imgRect.width - visualWidth) / 2;
        }

        // Normalize cursor relative to the visible image (in screen pixels)
        const curX = mousePos.current.x - visualLeft;
        const curY = mousePos.current.y - visualTop;

        // Calculate ratio
        const ratioX = visualWidth ? curX / visualWidth : 0.5;
        const ratioY = visualHeight ? curY / visualHeight : 0.5;

        // Apply background size relative to exact current screen dimensions of image * zoom
        const targetSizeX = visualWidth * forensicZoom;
        const targetSizeY = visualHeight * forensicZoom;
        magContentRef.current.style.backgroundSize = `${targetSizeX}px ${targetSizeY}px`;

        // Calculate exact background offset to center under cursor
        const bgOffsetX = 160 - (curX * forensicZoom);
        const bgOffsetY = 160 - (curY * forensicZoom);
        magContentRef.current.style.backgroundPosition = `${bgOffsetX}px ${bgOffsetY}px`;

        // Update Text
        if (coordTextRef.current) coordTextRef.current.innerText = `COORD: ${Math.round(ratioX * 100)}% / ${Math.round(ratioY * 100)}%`;
        if (latTextRef.current) latTextRef.current.innerText = `LAT: ${((ratioY) * 180 - 90).toFixed(4)}°N`;
        if (lonTextRef.current) lonTextRef.current.innerText = `LON: ${((ratioX) * 360 - 180).toFixed(4)}°W`;
      }

      rafId = requestAnimationFrame(tick);
    };

    if (isOpen) {
      rafId = requestAnimationFrame(tick);
    }
    return () => cancelAnimationFrame(rafId);
  }, [isOpen, isMagnifierEnabled]);

  // Handle Drag logic synchronously using window events
  useEffect(() => {
    if (isEnlarged && isOverImage && isMagnifierEnabled) {
      document.body.classList.add("hide-dot-cursor");
    } else {
      document.body.classList.remove("hide-dot-cursor");
    }

    if (isDragging) {
      document.body.style.cursor = "grabbing";
      const handleGlobalMouseMove = (e: MouseEvent) => {
        const dx = e.clientX - dragStart.current.x;
        const dy = e.clientY - dragStart.current.y;
        setDocOffset(clampOffset(docScale, {
          x: currentOffset.current.x + dx,
          y: currentOffset.current.y + dy
        }));
        dragStart.current = { x: e.clientX, y: e.clientY };
        mousePos.current = { x: e.clientX, y: e.clientY };
      };

      const handleGlobalMouseUp = () => setIsDragging(false);

      window.addEventListener("mousemove", handleGlobalMouseMove);
      window.addEventListener("mouseup", handleGlobalMouseUp);

      return () => {
        window.removeEventListener("mousemove", handleGlobalMouseMove);
        window.removeEventListener("mouseup", handleGlobalMouseUp);
        document.body.style.cursor = "";
      };
    }

    return () => document.body.classList.remove("hide-dot-cursor");
  }, [isEnlarged, isOverImage, isMagnifierEnabled, isDragging, docScale]);

  const handleClose = () => {
    setPhase("closing");
    setTimeout(onClose, 400);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    mousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (docScale > 1) {
      setIsDragging(true);
      dragStart.current = { x: e.clientX, y: e.clientY };
    } else if (!isEnlarged) {
      setIsEnlarged(true);
    }
  };

  const handleMouseUp = () => { };

  const handleWheel = (e: React.WheelEvent) => {
    if (!isEnlarged) {
      setIsEnlarged(true);
      return;
    }
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setDocScale(prev => {
      const newScale = Math.max(1, Math.min(10, prev * delta));
      setDocOffset(curr => clampOffset(newScale, curr));
      return newScale;
    });
  };

  if (!isOpen && phase === "closed") return null;

  return (
    <div
      onMouseMove={handleMouseMove}
      className={`fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-8 transition-all duration-400
        ${phase === 'closed' || phase === 'closing' ? 'bg-transparent backdrop-blur-none' : 'bg-black/80 backdrop-blur-md'}
        ${isEnlarged && isOverImage && isMagnifierEnabled ? 'cursor-none' : ''}
      `}
    >
      <div className="absolute inset-0 cursor-crosshair" onClick={handleClose} />

      {/* ── Forensic Zoom Callout ─────────────────────────────── */}
      <div className={`fixed inset-0 z-[200] transition-all duration-250 ease-out origin-center pointer-events-none
        ${isEnlarged && isOverImage && isMagnifierEnabled ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
      `}>
        {/* Tactical Pointer Line */}
        <svg className="fixed inset-0 pointer-events-none z-[190] overflow-visible">
          <line
            ref={connectorLineRef}
            stroke="white"
            strokeWidth="0.5"
            strokeDasharray="4 4"
            className="opacity-40 animate-pulse"
            style={{ mixBlendMode: 'difference' }}
          />
        </svg>

        {/* Interactive Focus Square */}
        <div
          ref={scanBoxRef}
          className="fixed pointer-events-none z-[200] flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2"
        >
          {/* Negative Color Scan Box Core */}
          <div className="w-16 h-16 relative" style={{ backdropFilter: 'invert(100%)' }}>
            <div className="absolute inset-0 border-2 border-white/50 animate-pulse-slow"></div>
            <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-white"></div>
            <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-white"></div>
            <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-white"></div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-white"></div>

            <div className="absolute inset-x-0 top-1/2 h-[0.5px] bg-white/30"></div>
            <div className="absolute inset-y-0 left-1/2 w-[0.5px] bg-white/30"></div>

            <div className="absolute -top-8 left-0 text-[10px] font-bold text-white tracking-widest whitespace-nowrap bg-black/80 px-2 border border-white/30 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-white animate-ping"></span>
              SCANNING_REGION...
            </div>
          </div>
        </div>

        {/* Dynamic Forensic Zoom Panel */}
        <div
          ref={magPanelRef}
          className="fixed top-0 left-0 w-80 h-80 z-[200] border border-white/40 bg-black shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden origin-center pointer-events-auto"
        >
          <div className="absolute top-0 inset-x-0 bg-white/10 p-2 border-b border-white/20 flex justify-between items-center text-[8px] font-mono tracking-tighter text-white/80 z-20">
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 bg-red-500 rounded-full animate-pulse"></div>
              <span>LIVE_FORENSIC_FEED // ENHANCE_X{(docScale * forensicZoom).toFixed(1)}</span>
            </div>
            <span ref={coordTextRef}>COORD: 50% / 50%</span>
          </div>

          <div
            ref={magContentRef}
            className="w-full h-full opacity-100"
            style={{
              backgroundImage: `url(${dcmImg})`,
              backgroundRepeat: 'no-repeat',
              imageRendering: 'auto'
            }}
          />

          <div className="absolute inset-0 pointer-events-none z-10">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 0.5px, transparent 0.5px)', backgroundSize: '20px 20px' }} />

            <div className="absolute top-10 left-4 text-[8px] text-white/60 font-mono flex flex-col gap-0.5">
              <span ref={latTextRef}>LAT: 0.0000°N</span>
              <span ref={lonTextRef}>LON: 0.0000°W</span>
            </div>

            <div className="absolute inset-0 border-[10px] border-black/40"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-white/5 border-dashed rounded-full"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[0.5px] bg-white/10"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[0.5px] h-full bg-white/10"></div>

            <div className="absolute bottom-0 inset-x-0 bg-black/80 backdrop-blur-sm p-3 border-t border-white/10 flex flex-col gap-1">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-bold text-white tracking-widest uppercase">Sub-Region Analysis</span>
                <span className="text-[8px] text-white/50 font-mono italic">RES: 4096p // LOSSLESS</span>
              </div>
              <div className="w-full h-[2px] bg-white/10 overflow-hidden">
                <div className="h-full bg-white animate-[expandWidth_5s_ease-in-out_infinite]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`ctos-panel relative z-10 w-full flex flex-col bg-black/95 pointer-events-auto border-primary/30
          origin-center transition-all duration-400 ease-out h-[90vh]
          ${phase === 'closed' || phase === 'closing' ? 'opacity-0 scale-y-0' : 'opacity-100 scale-y-100'}
          ${isEnlarged ? 'max-w-7xl' : 'max-w-6xl'}
          before:transition-transform before:duration-200 after:transition-transform after:duration-200
          ${phase === 'pulsing' ? 'before:-translate-x-4 before:-translate-y-4 after:translate-x-4 after:translate-y-4' : ''}
        `}
      >
        <div className={`flex flex-col h-full transition-opacity duration-300 ${phase === 'done' ? 'opacity-100' : 'opacity-0'}`}>
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-primary/50 bg-primary/5 shrink-0">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 bg-primary animate-pulse"></span>
              <span className="text-secondary font-bold tracking-[0.3em] text-[10px] md:text-sm uppercase">CLASSIFIED_FILE // UPLINK_DETAIL</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsEnlarged(!isEnlarged)}
                className="text-primary hover:text-white hover:bg-primary/20 px-3 py-1 transition-all text-[10px] font-bold tracking-widest border border-primary/30"
              >
                [ {isEnlarged ? 'SHRINK_VIEW' : 'ENLARGE_DETAIL'} ]
              </button>
              <button
                onClick={handleClose}
                className="text-muted-foreground hover:text-white hover:bg-red-500/20 px-3 py-1 transition-colors text-[10px] font-bold tracking-widest border border-transparent hover:border-red-500/50"
              >
                [ X ] CLOSE
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Left: Classified Document Interactive Viewer */}
            <div
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onWheel={handleWheel}
              onMouseEnter={() => setIsOverImage(true)}
              onMouseLeave={() => setIsOverImage(false)}
              className={`transition-all duration-700 ease-in-out relative overflow-hidden group bg-black/50 p-4
                ${isEnlarged ? 'flex-[10]' : 'flex-[1.2] border-b md:border-b-0 md:border-r border-primary/20'}
                ${isEnlarged && docScale === 1 && isMagnifierEnabled ? 'cursor-none' : ''}
                ${isEnlarged && docScale > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : ''}
              `}
            >
              <div
                className="w-full h-full transition-transform duration-200 ease-out flex items-center justify-center translate-gpu"
                style={{
                  transform: `translate(${docOffset.x}px, ${docOffset.y}px) scale(${docScale})`
                }}
              >
                <img
                  ref={imgRef}
                  src={dcmImg}
                  className="max-w-full max-h-full object-contain transition-all duration-700 shadow-2xl"
                  style={{
                    filter: isEnlarged ? 'none' : 'grayscale(1) opacity(0.6)'
                  }}
                  alt="Classified Document"
                />
              </div>

              <div className="absolute top-4 left-4 bg-red-600 text-white text-[8px] font-bold px-2 py-1 rotate-[-5deg] z-20 border-2 border-white/50 pointer-events-none">
                TOP SECRET
              </div>

              {/* Scale Indicator & Magnifier Toggle */}
              <div className={`absolute bottom-4 right-4 flex items-center gap-2 z-30 transition-all duration-300
                ${isOverImage ? 'opacity-100' : 'opacity-0'}
              `}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMagnifierEnabled(!isMagnifierEnabled);
                  }}
                  className={`bg-black/80 border text-[10px] px-3 py-2 font-bold tracking-widest transition-all flex items-center gap-2 pointer-events-auto
                    ${isMagnifierEnabled ? 'border-primary bg-primary text-black' : 'border-primary/50 text-primary hover:bg-primary/20'}
                  `}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isMagnifierEnabled ? 'bg-black animate-pulse' : 'bg-primary/40'}`}></span>
                  MAGNIFIER: {isMagnifierEnabled ? '[ ON ]' : '[ OFF ]'}
                </button>

                <div className="bg-black/80 border border-primary/50 text-primary p-2 px-4 backdrop-blur-md font-mono text-[10px] font-bold tracking-[0.2em] pointer-events-none">
                  LENS_FACTOR: {docScale.toFixed(2)}x
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isEnlarged) {
                      setIsMagnifierEnabled(false);
                    }
                    setIsEnlarged(!isEnlarged);
                  }}
                  className="bg-black/80 border border-primary/50 text-primary text-[10px] px-3 py-2 font-bold tracking-widest hover:bg-primary hover:text-black pointer-events-auto"
                >
                  {isEnlarged ? '[ SHRINK ]' : '[ ENLARGE ]'}
                </button>
              </div>
            </div>

            {/* Right: Profile Summary */}
            <div className={`transition-all duration-700 ease-in-out bg-gradient-to-br from-black to-primary/5 overflow-hidden
              ${isEnlarged ? 'flex-[0.0001] opacity-0 pointer-events-none' : 'flex-1 p-6 md:p-8 opacity-100'}
            `}>
              <div className="min-w-[300px] h-full overflow-y-auto custom-scrollbar space-y-8">
                <section className="space-y-4">
                  <h3 className="text-primary font-bold tracking-[0.4em] text-xs border-b border-primary/30 pb-2">PROFILE_SUMMARY</h3>
                  <div className="grid gap-4 font-mono text-sm leading-relaxed">
                    <div className="flex flex-col">
                      <span className="text-secondary text-[10px] uppercase font-bold tracking-widest">Subject Name_</span>
                      <span className="text-white tracking-widest">NATHANAEL BILLY CHRISTIANO</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-secondary text-[10px] uppercase font-bold tracking-widest">Date of Birth_</span>
                      <span className="text-white tracking-widest">[ 29.11.2005 ]</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-secondary text-[10px] uppercase font-bold tracking-widest">Clearance_</span>
                      <span className="text-primary tracking-widest animate-pulse">LVL_4 // SYSTEM_ADMIN</span>
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="text-primary font-bold tracking-[0.4em] text-xs border-b border-primary/30 pb-2">NETWORK_UPLINKS</h3>
                  <div className="grid gap-4 font-mono text-sm leading-relaxed">
                    <div className="flex items-center gap-4 group">
                      <span className="text-secondary text-[10px] uppercase font-bold tracking-widest w-24">GITHUB_</span>
                      <a href="https://github.com/nathanaellbc" target="_blank" className="text-white hover:text-primary transition-colors underline decoration-primary/50 underline-offset-4">nathanaellbc</a>
                    </div>
                    <div className="flex items-center gap-4 group">
                      <span className="text-secondary text-[10px] uppercase font-bold tracking-widest w-24">LINKEDIN_</span>
                      <a href="https://www.linkedin.com/in/nathanaellbc/" target="_blank" className="text-white hover:text-primary transition-colors underline decoration-primary/50 underline-offset-4">Nathanael Billy Christiano</a>
                    </div>
                    <div className="flex items-center gap-4 group">
                      <span className="text-secondary text-[10px] uppercase font-bold tracking-widest w-24">EMAIL_</span>
                      <a href="mailto:nathanaelbilly.c@gmail.com" className="text-white hover:text-primary transition-colors underline decoration-primary/50 underline-offset-4 line-clamp-1">nathanaelbilly.c@gmail.com</a>
                    </div>
                    <div className="flex items-center gap-4 group">
                      <span className="text-secondary text-[10px] uppercase font-bold tracking-widest w-24">PHONE_</span>
                      <span className="text-white tracking-widest">+62 877-0537-555</span>
                    </div>
                  </div>
                </section>

                <div className="bg-primary/5 border border-primary/20 p-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-primary/10 rotate-45 translate-x-12 -translate-y-12"></div>
                  <p className="text-[9px] text-muted-foreground leading-tight italic uppercase">
                    All transmissions are recorded and trace-encrypted. Proceed with secure protocol only.
                    Digital footprint authenticated.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-2 border-t border-primary/30 flex justify-between text-[10px] text-muted-foreground font-bold tracking-[0.2em] uppercase shrink-0">
            <span>SYS.STATUS: AUTHENTICATED</span>
            <span>UPLINK_STRENGTH: 98%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

