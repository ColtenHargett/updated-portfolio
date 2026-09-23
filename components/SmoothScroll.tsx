"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    let raf = requestAnimationFrame(function loop(time) {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    });

    // Route in-page anchor clicks through Lenis so they glide instead of jumping.
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute("href")!;
      if (id === "#main" || id === "#") return;
      const target = id === "#top" ? 0 : document.querySelector<HTMLElement>(id);
      if (target === null) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: 0 });
      history.replaceState(null, "", id);
    };
    document.addEventListener("click", onClick);

    // Nav toggles data-menu-open on <html>; stop smooth scrolling underneath the overlay.
    const mo = new MutationObserver(() => {
      if (document.documentElement.dataset.menuOpen === "true") lenis.stop();
      else lenis.start();
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-menu-open"] });

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("click", onClick);
      mo.disconnect();
      lenis.destroy();
    };
  }, []);

  return null;
}
