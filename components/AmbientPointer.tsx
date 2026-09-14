"use client";

import { useEffect } from "react";

export function AmbientPointer() {
  useEffect(() => {
    const root = document.documentElement;
    const onMove = (event: PointerEvent) => {
      root.style.setProperty("--pointer-x", `${event.clientX}px`);
      root.style.setProperty("--pointer-y", `${event.clientY}px`);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);
  return <div className="ambient-pointer" aria-hidden="true" />;
}
