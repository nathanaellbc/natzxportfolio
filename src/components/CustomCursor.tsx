import { useEffect, useRef } from "react"

export function CustomCursor() {
  const dotRef  = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const trail1Ref = useRef<HTMLDivElement>(null)
  const trail2Ref = useRef<HTMLDivElement>(null)
  const trail3Ref = useRef<HTMLDivElement>(null)
  const ghostsRef = useRef<HTMLDivElement[]>([])
  const historyRef = useRef<{x: number, y: number}[]>([])

  useEffect(() => {
    const dot  = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    // Start off-screen so they don't flash at (0,0)
    let mouseX = -200, mouseY = -200
    let ringX  = -200, ringY  = -200
    let t1X = -200, t1Y = -200
    let t2X = -200, t2Y = -200
    let t3X = -200, t3Y = -200
    let frameCount = 0
    
    let rafId: number
    const RING_R  = 18   // half of ring width (36px)
    const LERP    = 0.1  // follower speed — lower = more lag

    // ── Mouse tracking ────────────────────────────────────────────────
    const onMove = (e: MouseEvent) => { mouseX = e.clientX; mouseY = e.clientY }

    // ── Hover detection ───────────────────────────────────────────────
    const SELECTORS = "a, button, [role='button'], input, textarea, select, label"

    const onOver = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest(SELECTORS)) ring.classList.add("ring-hovered")
    }
    const onOut = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest(SELECTORS)) ring.classList.remove("ring-hovered")
    }
    const onClick = () => {
      // Re-evaluate hover immediately on click in case element removes itself
      setTimeout(() => {
        const hoveredElements = document.querySelectorAll(':hover');
        let stillHovered = false;
        hoveredElements.forEach(el => {
          if (el.closest(SELECTORS)) stillHovered = true;
        })
        if (!stillHovered) ring.classList.remove("ring-hovered")
      }, 50)
    }

    const onMouseDown = () => ring.classList.add("ring-clicking")
    const onMouseUp = () => ring.classList.remove("ring-clicking")

    // ── rAF loop ──────────────────────────────────────────────────────
    const tick = () => {
      // Black dot: exact position (centred via top/left offset)
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`

      // White ring: lerp toward mouse for the smooth "trailing" feel
      ringX += (mouseX - ringX) * LERP
      ringY += (mouseY - ringY) * LERP
      ring.style.left = `${ringX - RING_R}px`
      ring.style.top  = `${ringY - RING_R}px`

      if (trail1Ref.current && trail2Ref.current && trail3Ref.current) {
        // Trailing glitch cursors
        t1X += (ringX - t1X) * 0.25 + (Math.random() - 0.5) * 5
        t1Y += (ringY - t1Y) * 0.25 + (Math.random() - 0.5) * 5
        
        t2X += (t1X - t2X) * 0.2 + (Math.random() - 0.5) * 8
        t2Y += (t1Y - t2Y) * 0.2 + (Math.random() - 0.5) * 8
        
        t3X += (t2X - t3X) * 0.15 + (Math.random() - 0.5) * 12
        t3Y += (t2Y - t3Y) * 0.15 + (Math.random() - 0.5) * 12

        trail1Ref.current.style.left = `${t1X - RING_R}px`
        trail1Ref.current.style.top  = `${t1Y - RING_R}px`
        trail2Ref.current.style.left = `${t2X - RING_R}px`
        trail2Ref.current.style.top  = `${t2Y - RING_R}px`
        trail3Ref.current.style.left = `${t3X - RING_R}px`
        trail3Ref.current.style.top  = `${t3Y - RING_R}px`

        // Error ghost trail - Update every 4 frames for low-fps look
        if (document.body.classList.contains('hacked-cursor')) {
          frameCount++
          if (frameCount % 4 === 0) {
            historyRef.current.unshift({ x: mouseX, y: mouseY })
            if (historyRef.current.length > 30) historyRef.current.pop()

            ghostsRef.current.forEach((g, i) => {
              if (!g) return
              // Pick a position from history with increasing lag
              const pos = historyRef.current[Math.min(i * 2, historyRef.current.length - 1)]
              if (pos) {
                // Add slight jitter
                const jX = (Math.random() - 0.5) * 4
                const jY = (Math.random() - 0.5) * 4
                g.style.transform = `translate(${pos.x + jX}px, ${pos.y + jY}px)`
                g.classList.add('active')
              }
            })
          }
        }
      }

      rafId = requestAnimationFrame(tick)
    }

    document.addEventListener("mousemove", onMove)
    document.addEventListener("mouseover", onOver)
    document.addEventListener("mouseout",  onOut)
    document.addEventListener("mousedown", onMouseDown)
    document.addEventListener("mouseup",   onMouseUp)
    document.addEventListener("click",     onClick)
    rafId = requestAnimationFrame(tick)

    return () => {
      document.removeEventListener("mousemove", onMove)
      document.removeEventListener("mouseover", onOver)
      document.removeEventListener("mouseout",  onOut)
      document.removeEventListener("mousedown", onMouseDown)
      document.removeEventListener("mouseup",   onMouseUp)
      document.removeEventListener("click",     onClick)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <>
      {/* ── Black dot – instant ─────────────────────────────────────── */}
      <div
        ref={dotRef}
        className="cursor-dot"
        style={{
          position:      "fixed",
          top:           "-5px",   // offset so (0,0) of element = centre
          left:          "-5px",
          width:         "10px",
          height:        "10px",
          background:    "white",
          borderRadius:  "50%",
          pointerEvents: "none",
          zIndex:        9999999,
          willChange:    "transform",
          mixBlendMode:  "difference",
        }}
      />

      {/* ── White ring – lagged follower ────────────────────────────── */}
      <div
        ref={ringRef}
        className="ring-hovered-base"
        style={{
          position:      "fixed",
          width:         "36px",
          height:        "36px",
          border:        "none",
          background:    "rgba(255,255,255,0.85)",
          borderRadius:  "50%",
          pointerEvents: "none",
          zIndex:        9999998,
          willChange:    "transform, top, left",
          transition:    "transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          mixBlendMode:  "difference",
        }}
      />

      {/* ── Trailing Glitch Rings ────────────────────────────── */}
      <div
        ref={trail1Ref}
        className="ring-hovered-base cursor-trail"
        style={{
          position: "fixed", width: "36px", height: "36px", borderRadius: "50%",
          background: "rgba(255, 0, 0, 0.4)", pointerEvents: "none", zIndex: 9999997,
          willChange: "transform, top, left", mixBlendMode: "difference"
        }}
      />
      <div
        ref={trail2Ref}
        className="ring-hovered-base cursor-trail"
        style={{
          position: "fixed", width: "36px", height: "36px", borderRadius: "50%",
          background: "rgba(0, 255, 0, 0.3)", pointerEvents: "none", zIndex: 9999996,
          willChange: "transform, top, left", mixBlendMode: "difference"
        }}
      />
      <div
        ref={trail3Ref}
        className="ring-hovered-base cursor-trail"
        style={{
          position: "fixed", width: "36px", height: "36px", borderRadius: "50%",
          background: "rgba(0, 0, 255, 0.2)", pointerEvents: "none", zIndex: 9999995,
          willChange: "transform, top, left", mixBlendMode: "difference"
        }}
      />

      {/* ── Error Ghost Trail (Hacked Mode) ─────────────────── */}
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          ref={el => { if (el) ghostsRef.current[i] = el }}
          className="error-ghost"
          style={{
            zIndex: 100000 - i,
            opacity: 0.8 - (i * 0.05),
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M7 2l12 11.2-5.8.1 3.3 7.1-2.9 1.4-3.4-7.2-5.2 4.9V2z" stroke="black" strokeWidth="1"/>
          </svg>
        </div>
      ))}

      <style>{`
        /* Hide system cursor everywhere */
        *, *::before, *::after { cursor: none !important; }

        /* Support for hiding the component entirely */
        body.hide-dot-cursor .ring-hovered-base,
        body.hide-dot-cursor .cursor-dot {
          opacity: 0 !important;
          visibility: hidden !important;
          transition: opacity 0.2s ease-out, visibility 0.2s;
        }

        /* Default ring state */
        .ring-hovered-base { transform: scale(1); }

        /* Enlarge smoothly on hover */
        .ring-hovered-base.ring-hovered { transform: scale(2.4); background: rgba(255,255,255,0.2) !important; }

        /* Shrink on click */
        .ring-hovered-base.ring-clicking { transform: scale(0.8) !important; background: rgba(255,255,255,0.95) !important; }
      `}</style>
    </>
  )
}
