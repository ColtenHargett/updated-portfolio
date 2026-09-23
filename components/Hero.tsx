"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import ShaderBackground from "./ShaderBackground";
import Clock from "./Clock";
import { Magnetic, SplitReveal, easeOutExpo, ArrowUpRight } from "./ui";
import { site } from "@/lib/data";

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.94]);

  return (
    <section ref={ref} id="top" className="relative flex min-h-[100svh] flex-col overflow-hidden">
      <ShaderBackground />
      <div className="hairline-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(70%_60%_at_50%_40%,#000,transparent)]" />

      <motion.div style={{ y, opacity, scale }} className="wrap relative z-10 flex flex-1 flex-col justify-end pb-10 pt-32 sm:pb-14">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: easeOutExpo, delay: 0.2 }}
          className="glass mb-8 inline-flex w-fit items-center gap-2.5 rounded-full py-1.5 pl-2 pr-4 text-xs text-fg/80 sm:text-sm"
        >
          <span className="relative flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400/15">
            <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-emerald-400" />
          </span>
          Open to internships &amp; research opportunities
        </motion.div>

        <h1 className="sr-only">Colten Hargett, Computer Science and Data Science student building intelligent software</h1>
        <div aria-hidden className="select-none">
          <SplitReveal
            immediate
            delay={0.25}
            text="Colten"
            className="block text-[clamp(5.2rem,22vw,15.5rem)] font-semibold leading-[0.82] tracking-[-0.055em]"
          />
          <div className="flex flex-wrap items-end gap-x-8 gap-y-4">
            <SplitReveal
              immediate
              delay={0.38}
              text="Hargett"
              className="serif block text-[clamp(5.4rem,22.5vw,16rem)] italic leading-[0.9] tracking-[-0.03em]"
              wordClassName="text-gradient pr-[0.06em]"
            />
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: easeOutExpo, delay: 0.9 }}
              className="mb-[1.2vw] max-w-sm text-balance text-base leading-relaxed text-fg/75 sm:text-lg"
            >
              I build <span className="serif text-[1.2em] italic text-fg">intelligent</span> software that turns messy, real-world data into
              something <span className="serif text-[1.2em] italic text-fg">genuinely useful</span>.
            </motion.p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.4, delay: 1.1 }}
          className="mt-12 flex flex-wrap items-center gap-3"
        >
          <Magnetic>
            <a
              href="#work"
              data-cursor="View"
              className="group inline-flex items-center gap-3 rounded-full bg-fg py-3 pl-6 pr-3 text-sm font-medium text-ink transition-shadow duration-500 hover:shadow-[0_0_60px_-10px_rgba(179,166,255,0.8)]"
            >
              See selected work
              <span className="grid h-8 w-8 place-items-center rounded-full bg-ink text-fg transition-transform duration-500 group-hover:rotate-45">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </a>
          </Magnetic>
          <Magnetic>
            <a
              href={site.resume}
              target="_blank"
              rel="noreferrer"
              className="glass inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-medium text-fg transition-colors hover:bg-white/10"
            >
              Download résumé
            </a>
          </Magnetic>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: easeOutExpo, delay: 1.3 }}
          className="mt-14 grid grid-cols-2 gap-6 border-t border-line pt-6 font-mono text-[11px] uppercase tracking-[0.14em] text-muted sm:grid-cols-4"
        >
          <div>
            <p className="text-dim">Studying</p>
            <p className="mt-1.5 text-fg/85">CS + Data Science</p>
          </div>
          <div>
            <p className="text-dim">At</p>
            <p className="mt-1.5 text-fg/85">Loyola Maryland</p>
          </div>
          <div>
            <p className="text-dim">Local time</p>
            <Clock className="mt-1.5 block text-fg/85" />
          </div>
          <a href="#about" className="group flex items-center gap-3 sm:justify-self-end">
            <span className="relative h-10 w-6 rounded-full border border-line-strong">
              <motion.span
                className="absolute left-1/2 top-2 h-1.5 w-1 -translate-x-1/2 rounded-full bg-fg"
                animate={{ y: [0, 12, 0], opacity: [1, 0.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </span>
            <span className="transition-colors group-hover:text-fg">Scroll</span>
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}
