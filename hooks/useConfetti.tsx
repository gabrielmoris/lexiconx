/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useMemo } from "react";
import confetti from "canvas-confetti";
import type { Options } from "canvas-confetti";

/**
 * A custom hook that provides confetti animation functions,
 * specifically using a diamond (🔶) shape.
 */
export function useConfetti(shape?: string) {
  const customConfettiShape = useMemo(() => {
    if (typeof window !== "undefined") {
      return confetti.shapeFromText({
        text: shape || "🔶",
        scalar: 2,
      });
    }
    return null;
  }, [shape]);

  const shapeOptions = useMemo(() => {
    return customConfettiShape
      ? {
          shapes: [customConfettiShape],
          scalar: 2,
        }
      : {};
  }, [customConfettiShape]);

  /**
   * Trigger a school pride style confetti animation with diamond shapes.
   */
  const triggerSchoolPride = useCallback((duration = 3000, colors = ["#5D3FD3", "#FFFFFF"], options?: Partial<Options>) => {
    if (typeof window === "undefined") return;
    const animationEnd = Date.now() + duration;
    const defaults = {
      particleCount: 40,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors,
    };

    const interval = setInterval(() => {
      if (Date.now() > animationEnd) {
        return clearInterval(interval);
      }

      confetti({
        ...defaults,
        ...shapeOptions,
        angle: 60,
        origin: { x: 0 },
        ...options,
      });

      confetti({
        ...defaults,
        ...shapeOptions,
        angle: 120,
        origin: { x: 1 },
        ...options,
      });
    }, 150);

    return () => clearInterval(interval);
  }, []);

  /**
   * Trigger a celebratory fireworks-style confetti animation with diamond shapes.
   */
  const triggerFireworks = useCallback((duration = 3000, options?: Partial<Options>) => {
    if (typeof window === "undefined") return;
    const animationEnd = Date.now() + duration;

    const interval = setInterval(() => {
      if (Date.now() > animationEnd) {
        return clearInterval(interval);
      }

      confetti({
        particleCount: 100,
        spread: 120,
        origin: {
          x: Math.random(),
          y: Math.random() * 0.5,
        },
        ...shapeOptions,
        ...options,
      });
    }, 400);

    return () => clearInterval(interval);
  }, []);

  /**
   * Reset and clear all confetti.
   */
  const resetConfetti = useCallback(() => {
    confetti.reset();
  }, []);

  /**
   * Trigger a spiral confetti animation with diamond shapes.
   */

  return {
    triggerSchoolPride,
    triggerFireworks,
    resetConfetti,
  };
}
