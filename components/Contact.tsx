"use client";

import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import { useRef, useState } from "react";
import { site } from "@/lib/data";
import Clock from "./Clock";
import { ArrowUpRight, Magnetic, Reveal, SectionLabel, SplitReveal, easeOutExpo, trackGlow } from "./ui";

const channels = [
  { label: "LinkedIn", value: "in/colten-hargett", href: site.linkedin },
  { label: "GitHub", value: "@ColtenHargett", href: site.github },
  { label: "Résumé", value: "resume.pdf", href: site.resume },
];

export default function Contact() {
  const [copied, setCopied] = useState(false);
  const footerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: footerRef, offset: ["start end", "end end"] });
  const nameY = useTransform(scrollYProgress, [0, 1], ["40%", "0%"]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(site.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      window.location.href = `mailto:${site.email}`;
    }
  };

  return (
    <section id="contact" className="relative overflow-hidden pt-28 sm:pt-40">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[80%] bg-[radial-gradient(60%_60%_at_50%_100%,rgba(139,123,255,0.22),rgba(255,122,77,0.06)_50%,transparent)]" />
      <div className="wrap relative">
        <SectionLabel index="05">Contact</SectionLabel>

        <h2 className="mt-10 text-[clamp(3.2rem,11vw,10.5rem)] font-medium leading-[0.88] tracking-[-0.055em]">
          <SplitReveal text="Let's build" className="block" />
          <SplitReveal text="something great." className="serif block italic tracking-[-0.025em]" wordClassName="text-gradient pr-[0.05em]" delay={0.15} />
        </h2>

        <div className="mt-14 grid gap-10 lg:grid-cols-12 lg:items-end">
          <Reveal className="lg:col-span-5">
            <p className="max-w-md text-lg leading-relaxed text-fg/75">
              I&apos;m looking for internships, research and project collaborations in software engineering, data science and machine learning. The fastest way to reach me is email. I usually reply within a day.
            </p>
          </Reveal>

          <Reveal delay={0.1} className="lg:col-span-7">
            <div className="flex flex-wrap items-center gap-3 lg:justify-end">
              <Magnetic strength={0.25}>
                <a
                  href={`mailto:${site.email}`}
                  data-cursor="Say hi"
                  className="group inline-flex items-center gap-4 rounded-full bg-fg py-3 pl-7 pr-3 text-base font-medium text-ink transition-shadow duration-500 hover:shadow-[0_0_80px_-10px_rgba(179,166,255,0.9)] sm:text-lg"
                >
                  {site.email}
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-ink text-fg transition-transform duration-500 group-hover:rotate-45">
                    <ArrowUpRight className="h-5 w-5" />
                  </span>
                </a>
              </Magnetic>
              <button
                type="button"
                onClick={copy}
                className="glass relative inline-flex h-16 items-center gap-2 overflow-hidden rounded-full px-6 text-sm text-fg/85 transition-colors hover:bg-white/10"
                aria-live="polite"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={copied ? "c" : "n"}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.35, ease: easeOutExpo }}
                    className="flex items-center gap-2"
                  >
                    {copied ? (
                      <>
                        <svg viewBox="0 0 24 24" className="h-4 w-4 text-mint" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden><path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        Copied
                      </>
                    ) : (
                      <>
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h8" /></svg>
                        Copy email
                      </>
                    )}
                  </motion.span>
                </AnimatePresence>
              </button>
            </div>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-3 sm:grid-cols-3">
          {channels.map((c, i) => (
            <Reveal key={c.label} delay={i * 0.08}>
              <a
                href={c.href}
                target="_blank"
                rel="noreferrer"
                onPointerMove={trackGlow}
                className="glow-card group flex items-center justify-between rounded-2xl p-6"
              >
                <span>
                  <span className="eyebrow block">{c.label}</span>
                  <span className="mt-2 block text-lg font-medium tracking-tight">{c.value}</span>
                </span>
                <span className="grid h-10 w-10 place-items-center rounded-full border border-line transition-all duration-500 group-hover:rotate-45 group-hover:border-fg group-hover:bg-fg group-hover:text-ink">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </a>
            </Reveal>
          ))}
        </div>
      </div>

      <footer ref={footerRef} className="relative mt-28 border-t border-line">
        <div className="wrap flex flex-col gap-4 py-8 font-mono text-[11px] uppercase tracking-[0.14em] text-muted sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Colten Hargett</span>
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-emerald-400" />
            {site.location} · <Clock />
          </span>
          <a href="#top" className="group flex items-center gap-2 transition-colors hover:text-fg">
            Back to top
            <span className="inline-block transition-transform duration-500 group-hover:-translate-y-1">↑</span>
          </a>
        </div>
        <div className="overflow-hidden" aria-hidden>
          <motion.p
            style={{ y: nameY }}
            className="select-none whitespace-nowrap bg-gradient-to-b from-fg/[0.14] to-fg/0 bg-clip-text pb-[1vw] text-center text-[clamp(3rem,13.4vw,15rem)] font-semibold leading-[0.9] tracking-[-0.06em] text-transparent"
          >
            Colten Hargett
          </motion.p>
        </div>
      </footer>
    </section>
  );
}
