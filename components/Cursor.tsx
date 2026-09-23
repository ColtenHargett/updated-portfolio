"use client";

import { useEffect, useRef, useState } from "react";

// A soft dot + trailing ring cursor. Grows over links and shows a label
// over any element with data-cursor="Label". Desktop pointers only.
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState("");
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;
    setEnabled(true);
    document.documentElement.classList.add("has-cursor");

    let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y;
    let hover = false, visible = false, raf = 0;

    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!visible) {
        visible = true;
        rx = x; ry = y;
        dot.current?.style.setProperty("opacity", "1");
        ring.current?.style.setProperty("opacity", "1");
      }
      const t = e.target as HTMLElement;
      const labelled = t.closest<HTMLElement>("[data-cursor]");
      setLabel(labelled?.dataset.cursor ?? "");
      hover = !!t.closest("a, button, [role=button], input, label, [data-cursor]");
    };
    const leave = () => {
      visible = false;
      dot.current?.style.setProperty("opacity", "0");
      ring.current?.style.setProperty("opacity", "0");
    };

    const tick = () => {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      if (dot.current) dot.current.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      if (ring.current) {
        ring.current.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
        ring.current.dataset.hover = String(hover);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
      document.documentElement.classList.remove("has-cursor");
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={dot}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[80] h-1.5 w-1.5 rounded-full bg-fg opacity-0 mix-blend-difference transition-opacity duration-300"
      />
      <div
        ref={ring}
        aria-hidden
        data-hover="false"
        className={`pointer-events-none fixed left-0 top-0 z-[79] flex items-center justify-center rounded-full opacity-0 transition-[width,height,background-color,border-color,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          label
            ? "h-24 w-24 border border-transparent bg-fg text-ink"
            : "h-9 w-9 border border-fg/40 data-[hover=true]:h-14 data-[hover=true]:w-14 data-[hover=true]:border-iris/70 data-[hover=true]:bg-iris/10"
        }`}
      >
        {label && <span className="text-[11px] font-medium uppercase tracking-[0.14em]">{label}</span>}
      </div>
    </>
  );
}
