"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useState } from "react";
import { site } from "@/lib/data";
import { easeOutExpo } from "./ui";

const links = [
  { href: "#about", label: "About" },
  { href: "#work", label: "Work" },
  { href: "#archive", label: "Archive" },
  { href: "#journey", label: "Journey" },
];

export default function Nav() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(y > prev && y > 400 && !open);
    setScrolled(y > 40);
  });

  useEffect(() => {
    const ids = [...links.map((l) => l.href.slice(1)), "contact"];
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(`#${e.target.id}`)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    document.documentElement.dataset.menuOpen = String(open);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4"
        animate={{ y: hidden ? -110 : 0 }}
        transition={{ duration: 0.6, ease: easeOutExpo }}
        initial={false}
      >
        <motion.nav
          aria-label="Primary"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: easeOutExpo, delay: 0.9 }}
          className={`flex w-full max-w-5xl items-center justify-between rounded-full py-2 pl-5 pr-2 transition-[background-color,border-color,box-shadow] duration-500 ${
            scrolled ? "glass shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)]" : "border border-transparent"
          }`}
        >
          <a href="#top" className="group flex min-h-11 min-w-11 items-center gap-2.5">
            <span aria-hidden className="relative grid h-7 w-7 place-items-center rounded-full bg-fg text-[11px] font-semibold tracking-tight text-ink transition-transform duration-500 group-hover:rotate-[360deg]">
              CH
            </span>
            <span className="sr-only text-sm font-medium tracking-tight sm:not-sr-only">Colten Hargett</span>
          </a>

          <ul className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="relative block rounded-full px-4 py-2 text-sm text-muted transition-colors hover:text-fg">
                  {active === l.href && (
                    <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-white/[0.07]" transition={{ type: "spring", stiffness: 380, damping: 32 }} />
                  )}
                  <span className={`relative ${active === l.href ? "text-fg" : ""}`}>{l.label}</span>
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <a
              href={site.resume}
              target="_blank"
              rel="noreferrer"
              className="hidden rounded-full px-4 py-2 text-sm text-muted transition-colors hover:text-fg sm:block"
            >
              Résumé
            </a>
            <a
              href="#contact"
              className="group relative hidden overflow-hidden rounded-full bg-fg px-5 py-2 text-sm font-medium text-ink sm:block"
            >
              <span className="relative z-10 flex items-center gap-2">
                <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-emerald-500" />
                Let&apos;s talk
              </span>
              <span className="absolute inset-0 translate-y-full bg-gradient-to-r from-iris to-peach transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0" />
            </a>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className="glass grid h-11 w-11 place-items-center rounded-full md:hidden"
            >
              <span className="relative block h-3 w-4">
                <span className={`absolute left-0 h-px w-4 bg-fg transition-all duration-500 ${open ? "top-1.5 rotate-45" : "top-0.5"}`} />
                <span className={`absolute left-0 h-px w-4 bg-fg transition-all duration-500 ${open ? "top-1.5 -rotate-45" : "top-2.5"}`} />
              </span>
            </button>
          </div>
        </motion.nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="fixed inset-0 z-40 flex flex-col justify-between bg-ink/95 px-6 pb-10 pt-28 backdrop-blur-xl md:hidden"
            initial={{ clipPath: "circle(0% at calc(100% - 44px) 40px)" }}
            animate={{ clipPath: "circle(150% at calc(100% - 44px) 40px)" }}
            exit={{ clipPath: "circle(0% at calc(100% - 44px) 40px)" }}
            transition={{ duration: 0.8, ease: easeOutExpo }}
          >
            <ul className="space-y-2">
              {[...links, { href: "#contact", label: "Contact" }].map((l, i) => (
                <motion.li
                  key={l.href}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.06, duration: 0.8, ease: easeOutExpo }}
                >
                  <a href={l.href} onClick={() => setOpen(false)} className="flex items-baseline gap-4 text-5xl font-medium tracking-tight">
                    <span className="font-mono text-xs text-dim">0{i + 1}</span>
                    {l.label}
                  </a>
                </motion.li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-3 text-sm text-muted">
              <a href={site.resume} target="_blank" rel="noreferrer" className="glass rounded-full px-4 py-2">Résumé</a>
              <a href={site.linkedin} target="_blank" rel="noreferrer" className="glass rounded-full px-4 py-2">LinkedIn</a>
              <a href={site.github} target="_blank" rel="noreferrer" className="glass rounded-full px-4 py-2">GitHub</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
