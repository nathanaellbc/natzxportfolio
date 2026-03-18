import { useState, useEffect } from "react"
import { DecryptText } from "@/components/DecryptText"
import skullGif from "@/assets/skull.gif"
import bgloginGif from "@/assets/bglogin.gif"

const NAME = "NATHANAEL BILLY CHRISTIANO"
const SUBTEXT = "System Administrator"
const BTN_TXT = "Login"
const CHAR_MS = 48  // ms per character — slow & dramatic

interface Props { onLogin: () => void }

export function LoginScreen({ onLogin }: Props) {
  const [visible, setVisible] = useState(false)
  const [time, setTime] = useState(new Date())
  const [hovered, setHovered] = useState(false)
  const [exiting, setExiting] = useState(false)
  const [blink, setBlink] = useState(true)
  const [hackPhase, setHackPhase] = useState<'normal' | 'breaching' | 'breakpoint' | 'hacked'>('normal')
  const [glitchTime, setGlitchTime] = useState("")
  const [glitchDate, setGlitchDate] = useState("")
  const [jitterOffset, setJitterOffset] = useState({ x: 0, y: 0 })
  const [isFrozen, setIsFrozen] = useState(false)

  useEffect(() => {
    if (hackPhase === 'hacked') {
      const id = setInterval(() => {
        // Subtle jitter instead of huge shakes
        setJitterOffset({
          x: (Math.random() - 0.5) * 4,
          y: (Math.random() - 0.5) * 4
        })

        // Random Freeze (approx 5% chance per 100ms)
        if (Math.random() < 0.05) {
          setIsFrozen(true)
          setTimeout(() => setIsFrozen(false), 200)
        }
      }, 100)
      return () => clearInterval(id)
    }
  }, [hackPhase])

  useEffect(() => {
    if (hackPhase !== 'normal') {
      const id = setInterval(() => {
        const h = String(Math.floor(Math.random() * 100)).padStart(2, '0')
        const m = String(Math.floor(Math.random() * 100)).padStart(2, '0')
        const ms = String(Math.floor(Math.random() * 1000)).padStart(3, '0')
        setGlitchTime(`${h}:${m}:${ms}`)

        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
        let gd = ""
        for (let i = 0; i < 10; i++) gd += chars[Math.floor(Math.random() * chars.length)]
        setGlitchDate(gd)
      }, 100)
      return () => clearInterval(id)
    }
  }, [hackPhase])

  // typewriter progress counts
  const [nameChars, setNameChars] = useState(0)
  const [subChars, setSubChars] = useState(0)
  const [btnChars, setBtnChars] = useState(0)
  // 0=idle  1=typing name  2=typing sub  3=typing btn  4=done
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    if (phase === 3 && hackPhase === 'normal') {
      // 1. Brief pause after 'System Administrator' finishes (phase 3 starts right after phase 2 ends)
      const tStart = setTimeout(() => {
        setHackPhase('breaching')

        // 2. Escalation period
        const tBreakpoint = setTimeout(() => setHackPhase('breakpoint'), 2200)

        // 3. Glitch break into final UI
        const tFinal = setTimeout(() => setHackPhase('hacked'), 2500)

        return () => { clearTimeout(tStart); clearTimeout(tBreakpoint); clearTimeout(tFinal); }
      }, 100)

      return () => clearTimeout(tStart)
    }
  }, [phase, hackPhase])

  useEffect(() => { const t = requestAnimationFrame(() => setVisible(true)); return () => cancelAnimationFrame(t) }, [])
  useEffect(() => { const id = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(id) }, [])
  useEffect(() => { const id = setInterval(() => setBlink(v => !v), 480); return () => clearInterval(id) }, [])

  // Kick off after fade-in
  useEffect(() => { const t = setTimeout(() => setPhase(1), 700); return () => clearTimeout(t) }, [])

  // Typewriter engine
  useEffect(() => {
    if (phase === 1) {
      if (nameChars < NAME.length) {
        const t = setTimeout(() => setNameChars(c => c + 1), CHAR_MS)
        return () => clearTimeout(t)
      }
      const t = setTimeout(() => setPhase(2), 350)
      return () => clearTimeout(t)
    }
    if (phase === 2) {
      if (subChars < SUBTEXT.length) {
        const t = setTimeout(() => setSubChars(c => c + 1), CHAR_MS)
        return () => clearTimeout(t)
      }
      const t = setTimeout(() => setPhase(3), 350)
      return () => clearTimeout(t)
    }
    if (phase === 3) {
      if (btnChars < BTN_TXT.length) {
        const t = setTimeout(() => setBtnChars(c => c + 1), CHAR_MS)
        return () => clearTimeout(t)
      }
      setPhase(4)
    }
  }, [phase, nameChars, subChars, btnChars])

  const handleClick = () => {
    if (phase < 3) return   // don't allow before button starts
    setExiting(true)
    setTimeout(onLogin, 700)
  }

  const timeStr = time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })
  const dateStr = time.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })

  const cur = (show: boolean) =>
    show ? <span style={{ opacity: blink ? 1 : 0, fontWeight: 400 }}>█</span> : null

  return (
    <div
      className={`crt ${hackPhase === 'breaching' ? 'animate-heavy-glitch' : hackPhase === 'breakpoint' ? 'animate-breakpoint' : hackPhase === 'hacked' ? 'animate-subtle-glitch' : ''} ${isFrozen ? 'frame-freeze' : ''}`}
      style={{
        position: "fixed", inset: 0,
        background: hackPhase === 'hacked' ? `url(${bgloginGif}) 50% 65%/cover` : "hsl(0 0% 13%)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        zIndex: 99998,
        opacity: (!visible || exiting) ? 0 : 1,
        transition: "opacity 0.7s ease",
        fontFamily: "'Geist Sans','Inter',system-ui,sans-serif",
      }}
    >
      {/* ── Clock ─────────────────────────────────────────────────── */}
      <div style={{
        position: "absolute", top: "24px", left: "50%",
        transform: "translateX(-50%)", textAlign: "center",
        color: "rgba(255,255,255,0.5)", fontSize: "13px",
        letterSpacing: "0.04em", lineHeight: 1.6,
      }}>
        <div style={{ fontSize: "22px", fontWeight: 300, color: "rgba(255,255,255,0.72)" }}>
          {hackPhase === 'normal' ? timeStr : glitchTime}
        </div>
        <div>{hackPhase === 'normal' ? dateStr : glitchDate}</div>
      </div>

      {/* ── Main card ─────────────────────────────────────────────── */}
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: "10px",
        position: "relative",
        transform: hackPhase === 'hacked' ? `translate(${jitterOffset.x}px, ${jitterOffset.y}px)` : 'none'
      }}>

        {/* Ghost Echoes */}
        {hackPhase === 'hacked' && !isFrozen && [1, 2].map(i => (
          <div key={i} className="glitch-ghost" style={{
            transform: `translate(${jitterOffset.x * (i + 1) * 0.5}px, ${jitterOffset.y * (i + 1) * 0.5}px)`,
            opacity: 0.3 / i,
            filter: i === 1 ? 'hue-rotate(90deg)' : 'hue-rotate(-90deg)'
          }}>
            {/* Simple reproduction of layout for ghosting */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "92px", height: "92px", borderRadius: "50%", background: "rgba(255,255,255,0.2)", marginBottom: "16px" }} />
              <div style={{ width: "200px", height: "20px", background: "white", opacity: 0.5 }} />
              <div style={{ width: "150px", height: "10px", background: "white", opacity: 0.3 }} />
            </div>
          </div>
        ))}

        {/* Avatar */}
        <div style={{
          width: "92px", height: "92px", borderRadius: "50%",
          background: "rgba(255,255,255,0.07)",
          border: "2px solid rgba(255,255,255,0.12)",
          display: "flex", alignItems: "center", justifyContent: "center",
          overflow: "hidden", marginBottom: "16px",
          transition: "transform 0.25s ease, box-shadow 0.25s ease",
          transform: hovered ? "scale(1.07)" : "scale(1)",
          boxShadow: hovered
            ? "0 0 0 5px rgba(255,255,255,0.10), 0 10px 36px rgba(0,0,0,0.5)"
            : "0 0 0 2px rgba(255,255,255,0.05)",
        }}>
          <img src={hackPhase === 'hacked' ? skullGif : "/user.png"} alt="avatar"
            style={{ width: "70%", height: "70%", objectFit: "contain", opacity: 0.75 }} />
        </div>

        {/* Name — typewriter / decrypt */}
        <div style={{
          fontSize: "17px", fontWeight: 700,
          letterSpacing: "0.16em", color: "white",
          minHeight: "26px", textAlign: "center",
        }}>
          {hackPhase === 'hacked' ? (
            <DecryptText text="natzx." speed={40} maxIterations={4} once />
          ) : (
            <>
              {NAME.slice(0, nameChars)}
              {cur(phase === 1)}
            </>
          )}
        </div>

        {/* Subtext — typewriter / decrypt */}
        <div style={{
          fontSize: "11px", letterSpacing: "0.14em",
          color: "rgba(255,255,255,0.38)",
          minHeight: "16px", textAlign: "center",
          textTransform: "uppercase",
        }}>
          {hackPhase === 'hacked' ? (
            <DecryptText text="god's eye" speed={40} maxIterations={4} delay={400} once />
          ) : (
            <>
              {SUBTEXT.slice(0, subChars)}
              {cur(phase === 2)}
            </>
          )}
        </div>

        {/* Login button — typewriter, fades in when phase ≥ 3 */}
        <button
          onClick={handleClick}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            marginTop: "20px",
            minWidth: "160px", padding: "13px 52px",
            background: hovered ? "rgba(255,255,255,0.13)" : "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.14)",
            borderRadius: "6px",
            color: "white",
            fontSize: "13px", fontWeight: 500,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            cursor: "none",
            transition: "background 0.2s, transform 0.2s, opacity 0.3s",
            transform: hovered ? "translateY(-2px)" : "translateY(0)",
            opacity: phase >= 3 ? 1 : 0,
          }}
        >
          {BTN_TXT.slice(0, btnChars)}
          {cur(phase === 3)}
        </button>

      </div>

      {/* ── Brand ─────────────────────────────────────────────────── */}
      <div style={{
        position: "absolute", bottom: "32px",
        left: "50%", transform: "translateX(-50%)",
        color: "rgba(255,255,255,0.28)", fontSize: "12px",
        letterSpacing: "0.08em", fontStyle: "italic",
      }}>
        nathanael.os v1.0.0
      </div>
      {/* Breach Terminal Popups */}
      {(hackPhase === 'breaching' || hackPhase === 'breakpoint') && <TerminalPopups />}
    </div>
  )
}

function TerminalPopups() {
  const [windows, setWindows] = useState<any[]>([])
  const [startTime] = useState(Date.now())

  useEffect(() => {
    const commands = [
      "INITIALIZING CTOS_OVERRIDE_V2...",
      "BYPASSING SECURITY LAYER [0/3]...",
      "UPLOADING PRE-COMPILED BINARY (DEDSEC.ROOT)...",
      "BUFFER OVERFLOW: INJECTION SUCCESSFUL",
      "DECRYPTING ADMIN_RSA_KEYS...",
      "ACCESS GRANTED BY [god's eye].",
      "OVERRIDING AUTHENTICATION LOGS...",
      "ESTABLISHING REMOTE BACKDOOR...",
      "SYSTEM ROOT PRIVILEGES ACQUIRED.",
      "EXTRACTING HIDDEN DATABASE [ENCRYPTED]...",
      "DISABLING UAC POLICIES & FIREWALL...",
      "CONNECTION SECURED. SHELL ACTIVE."
    ]

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const count = windows.length
      const spawnChance = count < 5 ? 1 : 0.4 + (elapsed / 2000) * 0.6

      if (Math.random() < spawnChance && count < 20) {
        setWindows(prev => [
          ...prev,
          {
            id: Math.random(),
            top: Math.random() * 60 + 5 + "%",
            left: Math.random() * 60 + 5 + "%",
            width: Math.random() * 400 + 350 + "px",
            height: Math.random() * 250 + 150 + "px",
            text: commands[Math.floor(Math.random() * commands.length)],
            isCrashing: Math.random() < 0.15,
            speed: 50 + (elapsed / 2500) * 200
          }
        ])
      }
    }, 150)

    return () => clearInterval(interval)
  }, [windows.length, startTime])

  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", zIndex: 200000 }}>
      {windows.map(win => (
        <TerminalWindow key={win.id} {...win} />
      ))}
    </div>
  )
}

function TerminalWindow({ top, left, width, height, text, isCrashing, speed }: any) {
  const [lines, setLines] = useState<string[]>([text])

  useEffect(() => {
    if (isCrashing) return

    const logs = [
      "0x" + Math.random().toString(16).slice(2, 6).toUpperCase() + " READ: OK",
      "CONNECTING PORT 443 -> 192.168.0." + Math.floor(Math.random() * 255),
      "MEM_DUMP [CHUNK_" + Math.floor(Math.random() * 999) + "]",
      "CMD: /bin/sh -c 'rm -rf /var/log/*'",
      "STATUS: OK [200]",
      "PKT_RECV: " + Math.floor(Math.random() * 1024) + "kb",
      "HASH DECRYPT: " + (Math.random().toString(36).slice(2, 10)).toUpperCase(),
      "WARNING: UNAUTHORIZED USER IN SYSTEM SPACE."
    ]

    const interval = setInterval(() => {
      setLines(prev => [...prev.slice(-12), logs[Math.floor(Math.random() * logs.length)]])
    }, Math.max(30, 800 / speed))

    return () => clearInterval(interval)
  }, [isCrashing, speed])

  return (
    <div className={`console-window ${isCrashing ? 'console-flicker' : ''}`}
      style={{ top, left, width, height }}>
      <div className="console-header">
        <span>ctOS ACCESS_NODE // DEDSEC</span>
        <span style={{ color: '#fff' }}>{isCrashing ? '[SYSTEM ERR]' : '[RUNNING]'}</span>
      </div>
      <div className="console-content" style={{ opacity: isCrashing ? 0.7 : 1 }}>
        <div style={{ color: "rgba(255, 255, 255, 0.6)", marginBottom: "8px", borderBottom: "1px solid rgba(255,255,255,0.2)", paddingBottom: "4px" }}>
          ctOS_KERNEL_V4.2.1 | ROOT SHELL ACTIVE
        </div>
        {lines.map((l, i) => (
          <div key={i} style={{ whiteSpace: "nowrap", overflow: "hidden", color: l.includes("WARNING") || l.includes("ERR") ? "#ccc" : "#fff" }}>
            <span style={{ opacity: 0.5, marginRight: "8px" }}>{">"}</span>{l}
          </div>
        ))}
        {!isCrashing && <div className="animate-pulse mt-2" style={{ color: "#fff" }}>█</div>}
      </div>
    </div>
  )
}
