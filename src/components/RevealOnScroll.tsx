import { useEffect, useRef, useState, createContext, type ReactNode } from "react";

export const RevealContext = createContext(true);

interface Props {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function RevealOnScroll({ children, delay = 0, className = "" }: Props) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentRef = ref.current;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(30px)",
        transition: `opacity 0.8s ease-out ${delay + 300}ms, transform 0.8s ease-out ${delay + 300}ms`,
      }}
    >
      <RevealContext.Provider value={isVisible}>
        {children}
      </RevealContext.Provider>
    </div>
  );
}
