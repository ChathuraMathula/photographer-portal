import { useState, useEffect } from "react";

export function useDrawerAnimation(isOpen: boolean, delayMs = 300) {
  const [mounted, setMounted] = useState(isOpen);
  const [animating, setAnimating] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimating(true));
      });
      return () => cancelAnimationFrame(id);
    } else {
      setAnimating(false);
      const timer = setTimeout(() => setMounted(false), delayMs);
      return () => clearTimeout(timer);
    }
  }, [isOpen, delayMs]);

  return { mounted, animating };
}
