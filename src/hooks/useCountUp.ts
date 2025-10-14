import { useEffect, useState } from "react";

/**
 * Hook para animar números desde 0 hasta el valor final
 * @param end Valor final del contador
 * @param duration Duración de la animación en ms (default: 2000)
 * @param start Valor inicial (default: 0)
 */
export const useCountUp = (end: number, duration: number = 2000, start: number = 0) => {
  const [count, setCount] = useState(start);

  useEffect(() => {
    if (end === start) return;

    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Easing function (easeOutCubic) para suavidad
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      setCount(Math.floor(easeProgress * (end - start) + start));

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }, [end, duration, start]);

  return count;
};
