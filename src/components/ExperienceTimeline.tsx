import { useEffect, useRef, useState } from "react";
import { PaperModal } from "./PaperModal";
import { VideoModal } from "./VideoModal";
import { DecryptText } from "@/components/DecryptText";
import cvVideo from "@/assets/neurasynth.mp4";
import mlVideo from "@/assets/diagnosifyit!.mp4";


const experiences = [
  { id: 1, title: 'PROBABILISTIC FRAMEWORK ARCHITECT', date: 'TIMESTAMP: 20250915', desc: '> Developed a Bayesian Logistic Regression and MCMC simulation framework (Gibbs Sampling via rjags in R) to stratify Type 2 Diabetes risk.\n> Evaluated performance on a 1,000-patient clinical dataset, reaching 96.30% accuracy and 0.9754 AUC.' },
  { id: 2, title: 'COMPUTER VISION PROGRAM', date: 'TIMESTAMP: 20250210', desc: '> Improved YOLOv11 architecture to classify Glioma, Meningioma, and Pituitary tumors from multi-view MRI scans. \n> Achieved 0.92 Precision and 0.98 AUC through validation on a dataset of 2,176 expert-labeled images.' },
  { id: 3, title: 'ML SYSTEMS ENGINEER', date: 'TIMESTAMP: 20240901', desc: '> Engineered a Random Forest machine learning pipeline featuring comprehensive data preprocessing and rigorous model evaluation.\n> Deployed an interactive Streamlit web application to facilitate real-time, user-driven disease prediction based on symptom inputs.' },
];

export function ExperienceTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const dotRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [dotPos, setDotPos] = useState<number[]>([15, 50, 85]);

  const [isRevealed, setIsRevealed] = useState(false);
  const [lineVisible, setLineVisible] = useState(false);
  const [isPaperModalOpen, setIsPaperModalOpen] = useState(false);
  const [activeVideo, setActiveVideo] = useState<{src: string, title: string} | null>(null);



  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsRevealed(true);
          setTimeout(() => setLineVisible(true), 300);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let resizeRaf: number | null = null;
    const updatePositions = () => {
      if (timelineRef.current) {
        const parentRect = timelineRef.current.getBoundingClientRect();
        const positions = experiences.map((_, i) => {
          const dot = dotRefs.current[i];
          if (!dot) return 0;
          const dotRect = dot.getBoundingClientRect();
          return ((dotRect.top - parentRect.top + dotRect.height / 2) / parentRect.height) * 100;
        });
        setDotPos(positions);
      }
    };

    const throttledResize = () => {
      if (resizeRaf) return;
      resizeRaf = requestAnimationFrame(() => {
        updatePositions();
        resizeRaf = null;
      });
    };

    setTimeout(updatePositions, 100);
    window.addEventListener("resize", throttledResize);
    return () => {
      window.removeEventListener("resize", throttledResize);
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
    };
  }, []);

  // Smooth lerping for the line
  const [smoothProgress, setSmoothProgress] = useState(0);
  const targetProgress = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const scrollableDistance = rect.height - windowHeight;
      if (scrollableDistance <= 0) return;
      let p = -rect.top / scrollableDistance;
      p = Math.max(0, Math.min(1, p));
      targetProgress.current = p;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Run once initially
    handleScroll();
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const tick = () => {
      setSmoothProgress(prev => {
        const diff = targetProgress.current - prev;
        // The lerp factor controls the smoothness (lower = smoother)
        if (Math.abs(diff) < 0.001) {
          // Snap strictly to target and don't change state to avoid infinite re-renders
          return targetProgress.current; 
        }
        return prev + diff * 0.1;
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const startHeight = 0;
  const endHeight = 100;

  // lineProgress represents the absolute vertical percentage of the fill
  const lineProgress = smoothProgress;
  const currentHeight = startHeight + lineProgress * (endHeight - startHeight);


  return (
    <>
    <section ref={containerRef} className="relative w-full h-[300vh] bg-transparent border-t border-muted">


      {/* Sticky container stays in viewport */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-center py-12 px-8 md:px-16 max-w-7xl mx-auto">

        {/* Title */}
        <div
          className={`absolute top-12 md:top-24 left-8 md:left-16 z-20 transition-opacity duration-500 ${isRevealed ? 'opacity-100' : 'opacity-0'}`}
        >
          <h2 className="text-3xl font-bold tracking-widest text-white flex items-center gap-4">
            <span className="text-primary animate-pulse">{'//'}</span>
            <DecryptText text="OPERATION_TIMELINE" delay={300} speed={25} maxIterations={2} once />
          </h2>
        </div>

        {/* Timeline Content Wrapper */}
        <div
          ref={timelineRef}
          className={`relative pl-8 md:pl-0 w-full mt-24 h-[65vh] flex flex-col justify-between transition-opacity duration-500 ${lineVisible ? 'opacity-100' : 'opacity-0'}`}
        >

          {/* Vertical glowing background line */}
          <div className="absolute left-[27px] md:left-1/2 top-0 bottom-0 w-[2px] bg-primary opacity-30 transform md:-translate-x-1/2"></div>

          {/* Animated Fill line (White) */}
          <div
            className="absolute left-[27px] md:left-1/2 w-[2px] bg-white transform md:-translate-x-1/2 origin-top z-0 rounded-full"
            style={{
              top: `${startHeight}%`,
              height: `${lineVisible ? Math.max(0, currentHeight - startHeight) : 0}%`,
              transition: 'height 0.2s ease-out'
            }}
          ></div>

          {experiences.map((exp, i) => {
            // Check if the white line has reached this dot's vertical position
            // Add a tiny buffer (0.5%) so floating point inaccuracies don't cause flicker
            const isActive = currentHeight >= (dotPos[i] - 0.5);

            return (
              <div key={exp.id} className={`flex flex-col md:flex-row gap-8 items-center md:justify-between w-full relative ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>

                {/* Node Diamond Dot */}
                <div
                  ref={el => { dotRefs.current[i] = el; }}
                  className={`absolute left-[-10px] md:left-1/2 md:-translate-x-1/2 w-4 h-4 border-2 z-10 rotate-45 transition-all duration-300
                    ${isActive ? ([1, 2, 3].includes(exp.id) ? 'bg-primary border-primary shadow-[0_0_20px_rgba(255,255,255,0.9)] animate-pulse scale-150' : 'bg-white border-white shadow-[0_0_15px_rgba(255,255,255,0.8)] scale-125') : 'bg-black border-primary scale-100'}
                  `}
                ></div>

                {/* Panel Content */}
                <div className={`w-full md:w-[45%] group transition-all duration-700 ease-out ${isActive ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' : 'opacity-0 translate-y-8 scale-95 pointer-events-none'}`}>
                  <div

                    onClick={() => {
                      if (exp.id === 1) setIsPaperModalOpen(true);
                      if (exp.id === 2) setActiveVideo({ src: cvVideo, title: "neurasynth.mp4" });
                      if (exp.id === 3) setActiveVideo({ src: mlVideo, title: "diagnosifyit!.mp4" });
                    }}
                    className={`ctos-panel p-6 w-full relative transition-all duration-500
                      ${[1, 2, 3].includes(exp.id) ? 'liquid-glass border-primary/50 hover:border-primary cursor-pointer hover:bg-white/5 animate-pulse-slow' : 'cursor-crosshair'}
                      ${![1, 2, 3].includes(exp.id) && isActive ? 'hover:bg-primary/5 hover:scale-[1.02] hover:-translate-y-1' : ''}
                      ${[1, 2, 3].includes(exp.id) && isActive ? 'hover:scale-[1.03] hover:-translate-y-1' : ''}
                      before:transition-transform before:duration-500 group-hover:before:-translate-x-2 group-hover:before:-translate-y-2 
                      after:transition-transform after:duration-500 group-hover:after:translate-x-2 group-hover:after:translate-y-2
                    `}
                  >


                      {/* Hover Tooltip - Animated Line + Text pointing OUTWARDS */}
                      {[1, 2, 3].includes(exp.id) && (
                        <div className={`absolute -top-12 z-50 pointer-events-none flex items-start ${i % 2 === 0 ? '-right-4 md:-right-24 flex-row' : '-left-4 md:-left-24 flex-row-reverse'}`}>
                          {/* Diagonal section (32x32px) */}
                          <div className="relative w-8 h-8 mt-[15px] shrink-0">
                            {/* Small Box */}
                            <div className={`absolute bottom-[-3px] w-1.5 h-1.5 bg-white shadow-[0_0_5px_white] scale-0 group-hover:scale-100 transition-transform duration-100 ease-out delay-[500ms] group-hover:delay-[200ms] ${i % 2 === 0 ? 'left-[-3px]' : 'right-[-3px]'}`}></div>
                            
                            {/* 45 degree line extending up and outwards */}
                            <div className={`absolute bottom-0 w-[45px] h-[1px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-200 ease-out delay-[300ms] group-hover:delay-[300ms] ${i % 2 === 0 ? 'left-0 origin-bottom-left -rotate-45' : 'right-0 origin-bottom-right rotate-45'}`}></div>
                          </div>
                      
                          {/* Horizontal line & Text aligned to the top of the diagonal section */}
                          <div className={`flex items-center mt-[4px] ${i % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                            {/* Horizontal line */}
                            <div className={`h-[1px] bg-primary w-8 md:w-16 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 ease-out delay-[100ms] group-hover:delay-[500ms] ${i % 2 === 0 ? 'origin-left' : 'origin-right'}`}></div>
                      
                            {/* Text block */}
                            <div className={`text-[10px] text-primary font-bold tracking-widest bg-black/80 px-2 py-1 border border-primary/30 opacity-0 group-hover:opacity-100 transition-opacity duration-100 delay-0 group-hover:delay-[700ms] whitespace-nowrap flex items-center gap-1 ${i % 2 === 0 ? 'ml-2' : 'mr-2'}`}>
                              CLICK TO KNOW MORE <span className="w-1.5 h-2.5 bg-primary animate-pulse"></span>
                            </div>
                          </div>
                        </div>
                      )}


                    <p className="text-secondary text-xs mb-3 tracking-widest font-bold transition-colors group-hover:text-white">{exp.date}</p>
                    <h3 className="text-xl font-bold text-white mb-4 border-b border-primary/30 pb-2 group-hover:border-primary/60 transition-colors">{exp.title}</h3>
                    <div className="text-muted-foreground whitespace-pre-line text-sm leading-relaxed group-hover:text-muted-foreground/90 transition-colors">
                      {exp.desc}
                    </div>
                  </div>
                </div>
                {/* Empty spacer for flex alternating side layout */}
                <div className="hidden md:block w-[45%]"></div>
              </div>
            );
          })}
        </div>
      </div>
      </section>

      <PaperModal 
        isOpen={isPaperModalOpen} 
        onClose={() => setIsPaperModalOpen(false)} 
      />
      <VideoModal 
        isOpen={activeVideo !== null} 
        onClose={() => setActiveVideo(null)} 
        videoSrc={activeVideo?.src || ""}
        videoTitle={activeVideo?.title || ""}
      />
    </>

  );
}
