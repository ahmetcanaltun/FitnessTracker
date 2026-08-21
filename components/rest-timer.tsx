"use client";

import { useEffect, useState } from "react";
import { Pause, Play, X } from "lucide-react";
import { upper } from "@/lib/design";

/**
 * Set arası geri sayım. Salonda tek eliyle kullanılıyor: büyük rakam,
 * büyük dokunma hedefleri, tek dokunuşla +30 sn.
 */
export function RestTimer({
  seconds,
  onDone,
  onDismiss,
}: {
  seconds: number;
  onDone: () => void;
  onDismiss: () => void;
}) {
  const [left, setLeft] = useState(seconds);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    if (!running) return;
    if (left <= 0) {
      onDone();
      return;
    }
    const id = setTimeout(() => setLeft((v) => v - 1), 1000);
    return () => clearTimeout(id);
  }, [left, running, onDone]);

  const mm = Math.floor(Math.max(left, 0) / 60);
  const ss = Math.max(left, 0) % 60;

  return (
    <div className="fit-card p-4 flex items-center gap-3">
      <div className="flex-1">
        <p className="field-label">{upper("Dinlenme")}</p>
        <p className="font-display" style={{ fontSize: "40px", lineHeight: 1 }}>
          {mm}:{String(ss).padStart(2, "0")}
        </p>
      </div>
      <button type="button" className="mini-btn" onClick={() => setLeft((v) => v + 30)}>
        +30
      </button>
      <button
        type="button"
        className="mini-btn"
        aria-label={running ? "Duraklat" : "Devam et"}
        onClick={() => setRunning((v) => !v)}
      >
        {running ? <Pause size={16} /> : <Play size={16} />}
      </button>
      <button type="button" className="mini-btn" aria-label="Sayacı kapat" onClick={onDismiss}>
        <X size={16} />
      </button>
    </div>
  );
}
