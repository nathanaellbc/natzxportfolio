import { useState, useEffect, useRef } from "react";

interface Props {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
  onComplete?: () => void;
  start?: boolean;
}

export function TypewriterText({ text, speed = 20, delay = 0, className = "", onComplete, start = true }: Props) {
  const [displayedText, setDisplayedText] = useState("");
  const [isStarted, setIsStarted] = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    if (!start) return;

    let timeout: ReturnType<typeof setTimeout>;

    if (delay > 0 && !isStarted) {
      timeout = setTimeout(() => {
        setIsStarted(true);
      }, delay);
    } else {
      setIsStarted(true);
    }

    return () => clearTimeout(timeout);
  }, [delay, start, isStarted]);

  useEffect(() => {
    if (!isStarted) return;

    if (indexRef.current < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text.charAt(indexRef.current));
        indexRef.current += 1;
      }, speed);

      return () => clearTimeout(timeout);
    } else if (onComplete && indexRef.current === text.length) {
      // Trigger onComplete only once when finished
      indexRef.current += 1;
      onComplete();
    }
  }, [displayedText, isStarted, text, speed, onComplete]);

  return (
    <span className={className}>
      {displayedText}
      {isStarted && indexRef.current <= text.length && (
        <span className="inline-block w-2 bg-secondary animate-pulse h-[1em] ml-1 align-middle"></span>
      )}
    </span>
  );
}
