import { useState, useEffect, useRef } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+-=\\|[];',./{}:\"<>?";

interface Props {
  text: string;
  speed?: number;
  maxIterations?: number;
  className?: string;
  delay?: number;
  onComplete?: () => void;
  once?: boolean;
}

export function DecryptText({ 
  text, 
  speed = 30, 
  maxIterations = 10, 
  className = "", 
  delay = 0,
  onComplete,
  once = false
}: Props) {
  const [displayText, setDisplayText] = useState("");
  const [started, setStarted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLSpanElement>(null);
  const hasRun = useRef(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Track visibility independently
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -20px 0px" }
    );
    if (elementRef.current) observer.observe(elementRef.current);
    
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (once && hasRun.current) return;
    if (!isVisible) return; // Wait until revealed by scroll
    
    if (delay > 0) {
      const startTimeout = setTimeout(() => {
        setStarted(true);
      }, delay);
      return () => clearTimeout(startTimeout);
    } else {
      setStarted(true);
    }
  }, [delay, once, isVisible]);

  useEffect(() => {
    if (!started) {
      // Show empty or spaces matching length before starting (to maintain layout if needed, though here we just leave it blank or show random)
      setDisplayText(text.replace(/./g, " "));
      return;
    }

    if (once && hasRun.current) {
      setDisplayText(text);
      if (onCompleteRef.current) onCompleteRef.current();
      return;
    }
    
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(() => {
        return text
          .split("")
          .map((letter, index) => {
            if (index < iteration) {
              return text[index];
            }
            // Keep spaces as spaces
            if (letter === " ") return " ";
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join("");
      });

      if (iteration >= text.length) {
        clearInterval(interval);
        if (once) hasRun.current = true;
        setDisplayText(text);
        if (onCompleteRef.current) onCompleteRef.current();
      }

      iteration += 1 / maxIterations;
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, maxIterations, started, once]);

  return <span ref={elementRef} className={className}>{displayText}</span>;
}
