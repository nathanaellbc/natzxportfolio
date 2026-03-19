import { useState, useEffect } from "react"
import { BiosScreen } from "@/components/BiosScreen"
import { LoginScreen } from "@/components/LoginScreen"
import { CustomCursor } from "@/components/CustomCursor"
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { DecryptText } from "@/components/DecryptText";
import { CountUpBox } from "@/components/CountUpBox";
import { ResumeModal } from "@/components/ResumeModal";
import { ExperienceTimeline } from "@/components/ExperienceTimeline";
import { VideoBackground } from "@/components/VideoBackground";
import { FeedCard } from "@/components/FeedCard";
import { NotificationToast } from "@/components/NotificationToast";
import { ContactModal } from "@/components/ContactModal";
import { useAnimatedFavicon } from './hooks/useAnimatedFavicon';
import { useIsMobile } from "@/hooks/useIsMobile";
import { MobileCursor } from "@/components/MobileCursor";

import previewGif from "@/assets/preview.gif";
import preview2Gif from "@/assets/preview2.gif";

type Phase = "bios" | "login" | "main"

export default function App() {
  useAnimatedFavicon();
  const isMobile = useIsMobile();

  const [phase, setPhase] = useState<Phase>("bios")
  const [mainVisible, setMainVisible] = useState(false)
  const [toggle, setToggle] = useState<"AI_OP" | "CRT_OP">("AI_OP")
  const [isResumeOpen, setIsResumeOpen] = useState(false)
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)

  // Animation sequences for About Section
  const [aboutSeq, setAboutSeq] = useState({
    titleDone: false,
    p1Done: false,
    p2Done: false,
    box1Done: false,
    box2Done: false,
    box3Done: false,
  });

  // Animation sequences for Projects Section
  const [projectsSeq, setProjectsSeq] = useState({
    titleDone: false,
    proj1Done: false,
    proj2Done: false,
  });

  const [toast, setToast] = useState<{ isOpen: boolean; message: string }>({
    isOpen: false,
    message: ""
  });

  const [isGlobalGlitch, setIsGlobalGlitch] = useState(false);

  const [transmissionStatus, setTransmissionStatus] = useState<'idle' | 'transmitting' | 'sent' | 'error'>('idle');

  const handleTransmission = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const btn = form.querySelector('button');
    if (btn) btn.disabled = true;

    setTransmissionStatus('transmitting');

    const scriptURL = 'https://script.google.com/macros/s/AKfycbxrw1Kkb0EfeOJ2TckT1s1eMM5s6mhyvrM1cjP7G6n9_nx8JWBnAEJwbDJ_-2lWBpPBLg/exec';

    try {
      const response = await fetch(scriptURL, {
        method: 'POST',
        body: new FormData(form)
      });

      if (response.ok) {
        setToast({
          isOpen: true,
          message: 'Transmission Received. Data stored in central database.'
        });
        setTransmissionStatus('sent');
        form.reset();
      } else {
        throw new Error('Network response was not ok.');
      }
    } catch (error: any) {
      console.error('Error!', error.message);
      setTransmissionStatus('error');
      if (btn) btn.disabled = false;
    }
  };

  // Animation sequences for Contact Section
  const [contactSeq, setContactSeq] = useState({
    titleDone: false,
    leftDone: false,
    rightDone: false,
  });

  const [lastScrollY, setLastScrollY] = useState(0);
  const [showNavbar, setShowNavbar] = useState(true);

  // Auto-hide navbar logic
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 10) {
        setShowNavbar(true);
      } else if (currentScrollY > lastScrollY) {
        setShowNavbar(false);
      } else {
        setShowNavbar(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Fade main in
  useEffect(() => {
    if (phase === "main") {
      const id = requestAnimationFrame(() => setMainVisible(true))
      return () => cancelAnimationFrame(id)
    }
  }, [phase])

  return (
    <>
      {isMobile ? <MobileCursor /> : <CustomCursor />}

      {phase === "bios" && <BiosScreen onDone={() => setPhase("login")} />}
      {phase === "login" && <LoginScreen onLogin={() => setPhase("main")} />}

      {phase === "main" && (
        <div
          className={`crt min-h-screen text-foreground relative bg-background selection:bg-primary selection:text-black uppercase ${isGlobalGlitch ? 'animate-heavy-glitch' : ''}`}
          style={{ opacity: mainVisible ? 1 : 0, transition: "opacity 0.9s ease" }}
        >
          <VideoBackground />
          <div className="scanlines pointer-events-none"></div>

          {/* ── Navbar ─────────────────────────────────────────── */}
          <nav className={`fixed top-0 left-0 right-0 p-4 md:p-6 flex justify-between items-center z-40 bg-black/80 border-b border-primary/30 backdrop-blur-sm transition-transform duration-500 ${showNavbar ? 'translate-y-0' : '-translate-y-full'}`}>
            <div className="text-primary font-bold tracking-widest text-xs md:text-xl truncate mr-2">
              natzx.
            </div>

            <div className="flex items-center gap-4 md:gap-6">
              <div className="hidden md:flex gap-4">
                <button
                  onClick={() => setToggle("AI_OP")}
                  className={`px-5 py-2 border border-primary tracking-widest font-bold transition-all ${toggle === "AI_OP"
                    ? "bg-primary text-black"
                    : "bg-transparent text-primary hover:bg-primary/20"
                    }`}>
                  [ AI_OP ]
                </button>
                <button
                  onClick={() => {
                    setToggle("CRT_OP");
                    setIsGlobalGlitch(true);
                    setToast({
                      isOpen: true,
                      message: "CRITICAL_ERROR: This module is currently under construction. Access to [ CRT_OP ] is restricted."
                    });
                    setTimeout(() => {
                      setIsGlobalGlitch(false);
                      setToggle("AI_OP");
                    }, 1000);
                  }}
                  className={`px-5 py-2 border border-primary tracking-widest font-bold transition-all ${toggle === "CRT_OP"
                    ? "bg-primary text-black"
                    : "bg-transparent text-primary hover:bg-primary/20"
                    }`}>
                  [ CRT_OP ]
                </button>
              </div>

              <div>
                <button
                  onClick={() => setIsContactModalOpen(true)}
                  className="bg-transparent border border-secondary text-secondary hover:bg-secondary hover:text-black px-3 py-2 md:px-6 md:py-2 text-xs md:text-base tracking-widest font-bold transition-all whitespace-nowrap"
                >
                  [ {isMobile ? "CONTACT" : "INITIATE_CONTACT"} ]
                </button>
              </div>
            </div>
          </nav>

          {/* ── Hero Section ──────────────────────────────────────── */}
          {/* === HERO SECTION === */}
          <div className="relative min-h-[70vh] md:min-h-screen flex flex-col justify-center items-center overflow-hidden">
            <RevealOnScroll>
              <section className="flex flex-col md:flex-row items-center pt-24 pb-12 px-8 md:px-16 gap-12 z-10 relative max-w-7xl mx-auto">

                {/* Left Col */}
                <div className="flex-1 flex flex-col gap-6">
                  <p className="text-secondary tracking-widest font-bold flex items-center gap-2 min-h-[1.5rem] text-sm md:text-base">
                    <span className="w-2 h-2 bg-secondary rounded-none animate-pulse shrink-0"></span>
                    <span>&gt; <DecryptText text="SYSTEM_BOOT_SEQUENCE... OK." delay={300} maxIterations={2} speed={25} /></span>
                  </p>

                  <h1 className="text-4xl md:text-7xl font-bold tracking-tighter leading-[1.05] text-white">
                    EXECUTING:<br />
                    <span className="text-primary">DATA</span>.<br />
                    <span className="text-secondary">MODELS</span>.<br />
                    <span className="text-white/80">SYSTEMS</span>.
                  </h1>

                  <p className="text-muted-foreground text-sm md:text-lg leading-relaxed max-w-xl border-l-[3px] border-primary pl-4">
                    USER: <span className="text-white font-bold">NATHANAEL B.C.</span> // DIRECTIVE: Bridging analytical depth of AI with visual intuition.
                  </p>

                  <div className="flex flex-col sm:flex-row flex-wrap gap-4 mt-6">
                    <button
                      onClick={() => {
                        setIsGlobalGlitch(true);
                        setTimeout(() => {
                          document.getElementById('surveillance-feeds')?.scrollIntoView({ behavior: 'auto' });
                        }, 400);
                        setTimeout(() => {
                          setIsGlobalGlitch(false);
                        }, 1000);
                      }}
                      className="bg-primary text-black border border-primary font-bold px-4 md:px-8 py-2 md:py-3 text-xs md:text-base tracking-widest hover:bg-primary/80 transition-all w-full sm:w-auto"
                    >
                      [ EXPLORE_DATA ]
                    </button>
                    <button
                      onClick={() => setIsResumeOpen(true)}
                      className="bg-transparent text-secondary border border-secondary font-bold px-4 md:px-8 py-2 md:py-3 text-xs md:text-base tracking-widest hover:bg-secondary hover:text-black transition-all w-full sm:w-auto"
                    >
                      [ UPLINK_RESUME ]
                    </button>
                  </div>
                </div>

                {/* Right Col */}
                <div className="hidden md:block flex-[0.8] w-full lg:ml-12 xl:ml-20">
                  <div className={`relative group transition-all duration-500
      ${mainVisible ? 'opacity-100 translate-y-0 scale-100 hover:scale-[1.03] hover:z-20 delay-300' : 'opacity-0 translate-y-12 scale-95'}`}
                  >
                    {/* Main Panel with expanding inner corners on hover */}
                    <div className={`ctos-panel w-full flex flex-col relative group-hover:bg-secondary/10 transition-colors duration-500
                    before:transition-transform before:duration-500 group-hover:before:-translate-x-2 group-hover:before:-translate-y-2
                    after:transition-transform after:duration-500 group-hover:after:translate-x-2 group-hover:after:translate-y-2`}
                    >
                      <div className="bg-muted px-4 py-2 flex items-center gap-2 border-b border-border/50">
                        <div className="w-3 h-3 bg-red-500/80 border border-border"></div>
                        <div className="w-3 h-3 bg-yellow-500/80 border border-border"></div>
                        <div className="w-3 h-3 bg-green-500/80 border border-border"></div>
                        <span className="ml-2 text-xs text-muted-foreground tracking-widest font-bold">admin@sys: ~/profile.ts</span>
                      </div>
                      <div className="p-4 md:p-6 text-secondary text-xs sm:text-sm md:text-base leading-relaxed overflow-x-auto whitespace-pre normal-case">
                        <span className="text-primary">const</span> professional = {"{"}<br />
                        &nbsp;&nbsp;name: <span className="text-white">'Nathanael Billy Christiano'</span>,<br />
                        &nbsp;&nbsp;focus: <span className="text-white">'AI &amp; Data Science Specialist'</span>,<br />
                        &nbsp;&nbsp;roles: [<span className="text-white">'Machine Learning Engineer', 'Computer Vision Researcher', 'Data Scientist'</span>],<br />
                        &nbsp;&nbsp;major: <span className="text-white">'Computer Science'</span>,<br />
                        &nbsp;&nbsp;motto: <span className="text-primary">"Decrypting Complexity, Engineering Intelligence."</span><br />
                        {"}"};<br />
                        <br />
                        professional.<span className="text-white">execute</span>();<span className="animate-pulse bg-secondary text-secondary">_</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </RevealOnScroll>
          </div>

          <RevealOnScroll>
            <section className="border-t border-muted bg-[linear-gradient(rgba(15,100%,50%,0.02)_1px,transparent_1px)] bg-[size:100%_4px] relative z-10 w-full overflow-hidden">
              <div className="py-24 px-6 md:px-16 max-w-7xl mx-auto flex flex-col gap-8 md:gap-12">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold tracking-widest text-white flex items-center gap-2 md:gap-4 overflow-hidden">
                    <span className="text-primary animate-pulse shrink-0">{'//'}</span>
                    <DecryptText text="ENCRYPTED_PROFILE_DATA" delay={300} speed={25} maxIterations={2} once onComplete={() => setAboutSeq(s => ({ ...s, titleDone: true }))} />
                  </h2>
                </div>

                <div className="flex flex-col xl:flex-row gap-12 xl:gap-16 items-start xl:items-center min-h-[300px]">
                  <div className="flex-1 text-muted-foreground leading-relaxed space-y-6 text-base md:text-lg border-l border-muted pl-4 md:pl-6">
                    <p className="text-secondary font-bold text-xs md:text-sm tracking-widest min-h-[1.5rem]">
                      {aboutSeq.titleDone && (
                        <DecryptText
                          text="> INITIALIZING BACKGROUND SCAN... COMPLETE."
                          delay={0}
                          speed={20}
                          maxIterations={2}
                          once
                          onComplete={() => {
                            setAboutSeq(s => ({ ...s, p1Done: true }))
                            setTimeout(() => setAboutSeq(s => ({ ...s, p2Done: true })), 600)
                            setTimeout(() => setAboutSeq(s => ({ ...s, box1Done: true })), 1200)
                            setTimeout(() => setAboutSeq(s => ({ ...s, box2Done: true })), 1500)
                            setTimeout(() => setAboutSeq(s => ({ ...s, box3Done: true })), 1800)
                          }}
                        />
                      )}
                    </p>
                    <p className={`text-foreground min-h-[6rem] transition-all duration-1000 ${aboutSeq.p1Done ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                      I am a Computer Science student and AI researcher whose work focuses on the intersection of deep learning and predictive healthcare. My journey is defined by engineering intelligent systems—from developing fine-tuned YOLOv11 models for multi-view MRI brain tumor detection to building probabilistic frameworks for diabetes risk classification.
                    </p>
                    <p className={`text-foreground min-h-[4rem] transition-all duration-1000 ${aboutSeq.p2Done ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                      I specialize in the end-to-end deployment of machine learning pipelines, leveraging analytical rigor to transform complex clinical datasets into actionable insights.
                    </p>
                  </div>

                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full">
                    <CountUpBox end={4} label="DEV_LANGUAGES" suffix="+" start={aboutSeq.box1Done} />
                    <CountUpBox end={10} label="AI_FRAMEWORKS" suffix="+" start={aboutSeq.box2Done} duration={2000} />
                    <CountUpBox end={3.83} label="SYSTEM_GPA" start={aboutSeq.box3Done} />
                  </div>
                </div>
              </div>
            </section>
          </RevealOnScroll>

          {/* ── Experience Timeline ─────────────────────────────────── */}
          <ExperienceTimeline />

          {/* ── Marquee ────────────────────────────────────────────── */}
          <RevealOnScroll>
            <section className="py-8 border-y border-primary/50 relative z-10 overflow-hidden bg-black/50 backdrop-blur-sm">
              <div className="flex w-[200%] animate-marquee">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex flex-1 justify-around text-muted-foreground font-bold tracking-widest items-center whitespace-nowrap text-lg">
                    <span className="mx-8 hover:text-white transition-colors cursor-crosshair">sys.python</span>
                    <span className="mx-8 hover:text-white transition-colors cursor-crosshair">sys.pytorch</span>
                    <span className="mx-8 hover:text-secondary transition-colors cursor-crosshair">exe.react</span>
                    <span className="mx-8 hover:text-primary transition-colors cursor-crosshair">exe.premiere</span>
                    <span className="mx-8 hover:text-primary transition-colors cursor-crosshair">sys.after_effects</span>
                    <span className="mx-8 hover:text-white transition-colors cursor-crosshair">db.figma</span>
                  </div>
                ))}
              </div>
            </section>
          </RevealOnScroll>

          {/* ── Projects Grid ──────────────────────────────────────── */}
          <RevealOnScroll>
            <section id="surveillance-feeds" className="py-16 md:py-24 px-6 md:px-16 max-w-7xl mx-auto relative z-10 flex flex-col gap-8 md:gap-12 overflow-hidden">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-widest text-white flex items-center gap-2 md:gap-4 overflow-hidden">
                  <span className="text-primary animate-pulse shrink-0">{'//'}</span>
                  <DecryptText
                    text="SURVEILLANCE_FEEDS"
                    delay={300} speed={25} maxIterations={2} once
                    onComplete={() => {
                      setProjectsSeq(s => ({ ...s, titleDone: true }));
                      setTimeout(() => setProjectsSeq(s => ({ ...s, proj1Done: true })), 400);
                      setTimeout(() => setProjectsSeq(s => ({ ...s, proj2Done: true })), 800);
                    }}
                  />
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  {
                    id: 1,
                    title: 'NEURASYNTH',
                    desc: 'AI-powered generative system for neural-based content synthesis and pattern creation.',
                    tags: ['AI', 'PYTHON', 'ML'],
                    revealed: projectsSeq.proj1Done,
                    imageSrc: previewGif, // Only the first one gets the GIF
                    liveLink: 'https://github.com/nathanaellbc/Neurasynth'
                  },
                  {
                    id: 2,
                    title: 'DIAGNOSIFYIT!',
                    desc: 'Intelligent diagnostic platform leveraging machine learning to analyze symptoms and predict potential conditions.',
                    tags: ['REACT', 'PYTHON', 'ML'],
                    revealed: projectsSeq.proj2Done,
                    imageSrc: preview2Gif,
                    liveLink: 'https://github.com/nathanaellbc/diagnosifyit'
                  }
                ].map(proj => (
                  <FeedCard key={proj.id} proj={proj} />
                ))}
              </div>
            </section>
          </RevealOnScroll>

          {/* ── Contact Section ────────────────────────────────────── */}
          <RevealOnScroll>
            <section className="border-t border-muted relative z-10 w-full overflow-hidden">
              <div className="py-16 md:py-24 px-6 md:px-16 max-w-7xl mx-auto flex flex-col gap-8 md:gap-12">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold tracking-widest text-white flex items-center gap-2 md:gap-4 overflow-hidden">
                    <span className="text-primary animate-pulse shrink-0">{'//'}</span>
                    <DecryptText
                      text="SECURE_CHANNEL"
                      delay={300} speed={25} maxIterations={2} once
                      onComplete={() => {
                        setContactSeq(s => ({ ...s, titleDone: true }));
                        setTimeout(() => setContactSeq(s => ({ ...s, leftDone: true })), 400);
                        setTimeout(() => setContactSeq(s => ({ ...s, rightDone: true })), 800);
                      }}
                    />
                  </h2>
                </div>

                <div className="flex flex-col md:flex-row gap-12 md:gap-16">
                  <div className={`flex-1 flex flex-col gap-6 md:gap-8 text-muted-foreground leading-relaxed transition-all duration-1000 ease-out ${contactSeq.leftDone ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <p className="text-white font-bold text-lg md:text-xl tracking-widest border-l-4 border-primary pl-4 py-1">
                      UPLINK AVAILABLE FOR FREELANCE &amp; CONTRACT DEPLOYMENTS.
                    </p>
                    <div className="space-y-3 md:space-y-2 text-sm md:text-base">
                      <p>&gt; Working on AI, automation, or anything data-heavy?</p>
                      <p>&gt; Trying to make your systems faster, smarter, or actually usable?</p>
                      <p>&gt; I’m down to build, just hit me up.</p>
                    </div>
                    <div className="mt-2 md:mt-4 flex flex-col gap-3 font-mono text-xs md:text-sm bg-black/50 p-4 md:p-6 border border-border/50 overflow-x-auto">
                      <div className="flex items-center gap-2 md:gap-4 min-w-max">
                        <span className="text-secondary w-16 md:w-20 font-bold">EMAIL_</span>
                        <span className="text-white tracking-widest">nathanaelbilly.c@gmail.com</span>
                      </div>
                      <div className="flex items-center gap-2 md:gap-4 min-w-max">
                        <span className="text-secondary w-16 md:w-20 font-bold">LOC_</span>
                        <span className="text-white tracking-widest">JAKARTA, ID // REMOTE</span>
                      </div>
                      <div className="flex items-center gap-2 md:gap-4 min-w-max">
                        <span className="text-secondary w-16 md:w-20 font-bold">STATUS_</span>
                        <span className="text-primary tracking-widest animate-pulse">ONLINE</span>
                      </div>
                    </div>
                  </div>

                  <div className={`flex-1 transition-all duration-1000 ease-out delay-200 ${contactSeq.rightDone ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <form className="ctos-panel p-8 flex flex-col gap-8" onSubmit={handleTransmission}>

                      {/* Input Wrapper 1 */}
                      <div className="relative group p-1">
                        <div className="ctos-panel w-full flex flex-col gap-2 p-3 transition-colors duration-300 before:transition-transform before:duration-300 after:transition-transform after:duration-300 group-hover:before:-translate-x-1 group-hover:before:-translate-y-1 group-hover:after:translate-x-1 group-hover:after:translate-y-1 group-focus-within:before:-translate-x-1 group-focus-within:before:-translate-y-1 group-focus-within:after:translate-x-1 group-focus-within:after:translate-y-1 group-focus-within:bg-secondary/5">
                          <label className="text-xs uppercase tracking-widest text-secondary font-bold">IDENTIFICATION [NAME]</label>
                          <input name="name" type="text" className="bg-transparent border-b-2 border-primary/30 focus:border-secondary outline-none text-white py-2 font-mono transition-colors" placeholder="GUEST_USER" required />
                        </div>
                      </div>

                      {/* Input Wrapper 2 */}
                      <div className="relative group p-1">
                        <div className="ctos-panel w-full flex flex-col gap-2 p-3 transition-colors duration-300 before:transition-transform before:duration-300 after:transition-transform after:duration-300 group-hover:before:-translate-x-1 group-hover:before:-translate-y-1 group-hover:after:translate-x-1 group-hover:after:translate-y-1 group-focus-within:before:-translate-x-1 group-focus-within:before:-translate-y-1 group-focus-within:after:translate-x-1 group-focus-within:after:translate-y-1 group-focus-within:bg-secondary/5">
                          <label className="text-xs uppercase tracking-widest text-secondary font-bold">NETWORK_ADDR [EMAIL]</label>
                          <input name="email" type="email" className="bg-transparent border-b-2 border-primary/30 focus:border-secondary outline-none text-white py-2 font-mono transition-colors" placeholder="guest@network.local" required />
                        </div>
                      </div>

                      {/* Input Wrapper 3 */}
                      <div className="relative group p-1">
                        <div className="ctos-panel w-full flex flex-col gap-2 p-3 transition-colors duration-300 before:transition-transform before:duration-300 after:transition-transform after:duration-300 group-hover:before:-translate-x-1 group-hover:before:-translate-y-1 group-hover:after:translate-x-1 group-hover:after:translate-y-1 group-focus-within:before:-translate-x-1 group-focus-within:before:-translate-y-1 group-focus-within:after:translate-x-1 group-focus-within:after:translate-y-1 group-focus-within:bg-secondary/5">
                          <label className="text-xs uppercase tracking-widest text-secondary font-bold">DATA_PAYLOAD [MESSAGE]</label>
                          <textarea name="message" className="bg-transparent border-b-2 border-primary/30 focus:border-secondary outline-none text-white py-2 font-mono transition-colors min-h-[120px] resize-none" placeholder="Enter transmission..." required spellCheck="false" />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={transmissionStatus === 'transmitting'}
                        className={`bg-primary hover:bg-white text-black font-bold tracking-widest py-4 mt-2 transition-colors disabled:bg-primary/50 disabled:cursor-not-allowed`}
                      >
                        {transmissionStatus === 'idle' && '[ TRANSMIT_DATA ]'}
                        {transmissionStatus === 'transmitting' && '[ TRANSMITTING... ]'}
                        {transmissionStatus === 'sent' && '[ DATA_SENT ]'}
                        {transmissionStatus === 'error' && '[ RETRY_TRANSMISSION ]'}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </section>
          </RevealOnScroll>

          {/* ── Footer ─────────────────────────────────────────────── */}
          <footer className="border-t border-primary/30 py-6 md:py-8 px-6 md:px-16 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0 z-10 relative bg-black/80">
            <div className="text-primary font-bold tracking-widest text-sm md:text-base">
              natzx.
            </div>
            <div className="text-muted-foreground text-[10px] sm:text-xs tracking-widest uppercase">
              © 2026. ALL RIGHTS RESERVED. // END_OF_FILE.
            </div>
          </footer>
        </div>
      )}

      {/* OS Window Modal */}
      <ResumeModal isOpen={isResumeOpen} onClose={() => setIsResumeOpen(false)} />

      {/* Global Notifications */}
      <NotificationToast
        isOpen={toast.isOpen}
        message={toast.message}
        onClose={() => setToast(t => ({ ...t, isOpen: false }))}
      />

      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </>
  );
}
