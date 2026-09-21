"use client";

import { useEffect, useRef, useState } from "react";

export default function ScrollReveal({
  children,
  className = "",
  delay = 0,
  duration = 800,
  animation = "fade-up"
}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target); // Trigger animation only once
        }
      },
      {
        threshold: 0.05, // Trigger when 5% of element is visible
        rootMargin: "0px 0px -50px 0px" // Trigger slightly before it enters the viewport
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  // Animation CSS styles based on active state
  const getAnimationClass = () => {
    if (animation === "fade-up") {
      return isVisible
        ? "opacity-100 translate-y-0"
        : "opacity-0 translate-y-12 pointer-events-none";
    }
    if (animation === "fade-in") {
      return isVisible
        ? "opacity-100 scale-100"
        : "opacity-0 scale-95 pointer-events-none";
    }
    if (animation === "fade-left") {
      return isVisible
        ? "opacity-100 translate-x-0"
        : "opacity-0 -translate-x-12 pointer-events-none";
    }
    if (animation === "fade-right") {
      return isVisible
        ? "opacity-100 translate-x-0"
        : "opacity-0 translate-x-12 pointer-events-none";
    }
    return isVisible ? "opacity-100" : "opacity-0 pointer-events-none";
  };

  return (
    <div
      ref={ref}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
      }}
      className={`transition-all cubic-bezier(0.16, 1, 0.3, 1) ${getAnimationClass()} ${className}`}
    >
      {children}
    </div>
  );
}
