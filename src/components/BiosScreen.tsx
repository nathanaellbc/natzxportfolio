import { useState, useEffect, useCallback, useRef } from "react"
import jumpscareVid from "@/assets/jumpscare.mp4"

type LineType = "normal" | "green" | "yellow"

interface BiosLine {
  text: string
  type?: LineType
  delay: number  // ms before this line starts
}

const BIOS_LINES: BiosLine[] = [
  { text: "AWARD CBS PORTFOLIO BIOS v2.6.26",          delay: 60,  type: "yellow" },
  { text: "",                                           delay: 0   },
  { text: "BIOS Date 12/03/26  19:11:00  Ver: 2.6.26", delay: 30  },
  { text: "CPU: Neural Creative Processor @ 420GHz",   delay: 40  },
  { text: "Speed: 100% | Turbo: ON",                   delay: 30  },
  { text: "Checking RAM...",                            delay: 80  },
  { text: "  Memory Test: 65536KB OK",                 delay: 220, type: "green" },
  { text: "Detecting Primary Master ... NBC-NVME-2TB",  delay: 100 },
  { text: "Detecting Primary Slave  ... NBC-AI-CORE",  delay: 60  },
  { text: "Initializing Creative Kernel...",            delay: 80  },
  { text: "Loading Visual & Neural Weights...",         delay: 120 },
  { text: "Optimizing Tensor Cores... OK",              delay: 160 },
  { text: "System Configuration:",                     delay: 80  },
  { text: "  > React: v19.2.0",                        delay: 40  },
  { text: "  > Vite: v7.3.1",                          delay: 30  },
  { text: "  > Tailwind: v4.2.1",                      delay: 30  },
  { text: "  > TypeScript: STRICT",                    delay: 30  },
  { text: "Power State: HIGH_PERFORMANCE",             delay: 80  },
  { text: "Events: NONE",                              delay: 60  },
  { text: "Booting from Primary Master...",             delay: 120 },
  { text: "Success.",                                  delay: 200 },
  { text: "Starting OS...",                            delay: 120 },
]

const CHAR_SPEED = 8    // ms per character (fast)
const DONE_WAIT  = 300  // ms after last line before exiting

interface Props { onDone: () => void }

export function BiosScreen({ onDone }: Props) {
  const [doneLines, setDoneLines]     = useState<BiosLine[]>([])
  const [lineIdx, setLineIdx]         = useState(0)
  const [charIdx, setCharIdx]         = useState(0)
  const [blink, setBlink]             = useState(true)
  const [exiting, setExiting]         = useState(false)

  // Modal + Jumpscare state
  const [showModal, setShowModal]       = useState(false)
  const [modalClosing, setModalClosing] = useState(false)
  const [paused, setPaused]             = useState(false)
  const [jumpscareActive, setJumpscareActive] = useState(false)
  const [systemCrashed, setSystemCrashed]     = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Show modal 2s after mount
  useEffect(() => {
    const t = setTimeout(() => {
      setShowModal(true)
      setPaused(true)
    }, 2000)
    return () => clearTimeout(t)
  }, [])

  // Blinking cursor
  useEffect(() => {
    const id = setInterval(() => setBlink(v => !v), 500)
    return () => clearInterval(id)
  }, [])

  const finish = useCallback(() => {
    setExiting(true)
    setTimeout(onDone, 700)
  }, [onDone])

  // Typewriter engine — paused when modal/jumpscare is active
  useEffect(() => {
    if (paused || jumpscareActive || systemCrashed) return

    if (lineIdx >= BIOS_LINES.length) {
      const t = setTimeout(finish, DONE_WAIT)
      return () => clearTimeout(t)
    }

    const line = BIOS_LINES[lineIdx]

    if (charIdx === 0) {
      const t = setTimeout(() => setCharIdx(1), line.delay)
      return () => clearTimeout(t)
    }

    if (line.text === "") {
      setDoneLines(prev => [...prev, line])
      setLineIdx(i => i + 1)
      setCharIdx(0)
      return
    }

    if (charIdx <= line.text.length) {
      const t = setTimeout(() => setCharIdx(c => c + 1), CHAR_SPEED)
      return () => clearTimeout(t)
    }

    setDoneLines(prev => [...prev, line])
    setLineIdx(i => i + 1)
    setCharIdx(0)
  }, [lineIdx, charIdx, finish, paused, jumpscareActive, systemCrashed])

  // ─── Handlers ───────────────────────────────────────────
  const handleYes = () => {
    setModalClosing(true)
    setTimeout(() => {
      setShowModal(false)
      setModalClosing(false)
      setPaused(false)
    }, 300)
  }

  const handleNo = () => {
    setShowModal(false)
    setJumpscareActive(true)
  }

  const handleVideoEnded = () => {
    setJumpscareActive(false)
    setSystemCrashed(true)
    setTimeout(() => {
      window.location.reload()
    }, 2000)
  }

  // Auto-play the video when jumpscare activates
  useEffect(() => {
    if (jumpscareActive && videoRef.current) {
      videoRef.current.play().catch(() => {})
    }
  }, [jumpscareActive])

  // ─── Render helpers ─────────────────────────────────────
  const activeLine  = lineIdx < BIOS_LINES.length ? BIOS_LINES[lineIdx] : null
  const typedText   = activeLine ? activeLine.text.slice(0, charIdx) : ""

  const col = (type?: LineType) =>
    type === "green"  ? "#00FF00" :
    type === "yellow" ? "#FFFF00" : "#C8C8C8"

  const now = new Date()
  const dateStr = `${String(now.getDate()).padStart(2,"0")}/${String(now.getMonth()+1).padStart(2,"0")}/${now.getFullYear()}`

  return (
    <>
      {/* ── BIOS Screen ──────────────────────────────────── */}
      <div className="crt" style={{
        position:     "fixed",
        inset:        0,
        background:   "#0000AA",
        fontFamily:   '"Courier New", Courier, monospace',
        fontSize:     "clamp(12px, 1.4vw, 15px)",
        padding:      "28px 40px",
        display:      "flex",
        flexDirection:"column",
        zIndex:       99999,
        opacity:      exiting ? 0 : 1,
        transition:   "opacity 0.7s ease",
        userSelect:   "none",
      }}>
        {/* Title bar */}
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"6px" }}>
          <span style={{ color:"#FFFF00", fontWeight:"bold", letterSpacing:"0.05em" }}>
            AWARD MODULAR BIOS v6.00PG
          </span>
          <span style={{ color:"#C8C8C8" }}>Energy Star Ally</span>
        </div>
        <hr style={{ borderColor:"#C8C8C8", margin:"0 0 20px" }} />

        {/* Lines */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", gap:"1px", overflow:"hidden" }}>
          {doneLines.map((l, i) => (
            <div key={i} style={{ color: col(l.type), whiteSpace:"pre" }}>
              {l.text}
            </div>
          ))}

          {activeLine && charIdx > 0 && (
            <div style={{ color: col(activeLine.type), whiteSpace:"pre" }}>
              {typedText}
              {charIdx <= activeLine.text.length && (
                <span style={{ opacity: blink ? 1 : 0 }}>█</span>
              )}
            </div>
          )}

          {activeLine && charIdx === 0 && (
            <span style={{ color:"#C8C8C8", opacity: blink ? 1 : 0 }}>█</span>
          )}
        </div>

        {/* Footer */}
        <hr style={{ borderColor:"#C8C8C8", margin:"20px 0 8px" }} />
        <div style={{ display:"flex", justifyContent:"space-between", color:"#C8C8C8" }}>
          <span>Press DEL to enter SETUP</span>
          <span>{dateStr}</span>
        </div>
      </div>

      {/* ── System Notice Modal ──────────────────────────── */}
      {showModal && (
        <div className={`bios-overlay ${modalClosing ? 'closing' : ''}`}>
          <div className="bios-modal">
            <h2>SYSTEM NOTICE</h2>
            <p>This system is optimized for PC / Desktop users.<br />Proceed?</p>
            <div className="bios-modal-btns">
              <button className="bios-btn-yes" onClick={handleYes}>[ YES ]</button>
              <button className="bios-btn-no" onClick={handleNo}>[ NO ]</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Jumpscare Fullscreen Video ───────────────────── */}
      {jumpscareActive && (
        <div className="jumpscare-container">
          <video
            ref={videoRef}
            src={jumpscareVid}
            autoPlay
            playsInline
            onEnded={handleVideoEnded}
            style={{ pointerEvents: "none" }}
          />
        </div>
      )}

      {/* ── System Crash Overlay ─────────────────────────── */}
      {systemCrashed && (
        <div className="system-crash-overlay">
          <span>SYSTEM HALTED. REBOOTING...</span>
        </div>
      )}
    </>
  )
}

