import React, { useEffect, useRef, useState } from 'react';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number; // Delay in milliseconds (e.g. 100, 200, 300)
  threshold?: number;
  direction?: 'up' | 'none';
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  className = '',
  delay = 0,
  threshold = 0.12,
  direction = 'up',
}) => {
  const domRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Graceful fallback: If window or IntersectionObserver is not available, show immediately
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    // Check for user's prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsVisible(true);
      return;
    }

    const element = domRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [threshold]);

  return (
    <div
      ref={domRef}
      style={{
        transitionDelay: isVisible && delay > 0 ? `${delay}ms` : '0ms',
      }}
      className={`scroll-reveal ${isVisible ? 'is-revealed' : ''} ${className}`}
    >
      {children}
    </div>
  );
};
