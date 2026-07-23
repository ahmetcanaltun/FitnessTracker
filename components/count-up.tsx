"use client";

import { useEffect, useRef, useState } from "react";
import { formatNum } from "@/lib/design";

/** Değer değiştiğinde sayarak artan rakam (plan.md §12 — hareket). */
export function CountUp({ value, duration = 900 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);

  useEffect(() => {
    const start = prevRef.current;
    const startTime = performance.now();
    let raf = 0;

    function tick(now: number) {
      const p = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(start + (value - start) * eased);
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        prevRef.current = value;
      }
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <>{formatNum(display)}</>;
}
