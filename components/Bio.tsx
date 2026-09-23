"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { bio, site } from "@/lib/data";
import { Reveal, easeOutExpo, trackGlow } from "./ui";

function Portrait() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);

  return (
    <div
      ref={ref}
      onPointerMove={trackGlow}
      className="glow-card group relative aspect-[4/5] w-full overflow-hidden rounded-[28px]"
    >
      {bio.photo ? (
        <motion.div style={{ y }} className="absolute -inset-[8%]">
          <Image
            src={bio.photo}
            alt={`Portrait of ${site.name}`}
            fill
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="object-cover grayscale-[35%] transition-[filter] duration-700 group-hover:grayscale-0"
            priority={false}
          />
        </motion.div>
      ) : (
        <motion.div style={{ y }} aria-hidden className="absolute -inset-[8%]">
          <div className="absolute inset-0 bg-[radial-gradient(55%_45%_at_30%_30%,rgba(139,123,255,0.55),transparent_70%),radial-gradient(50%_45%_at_75%_70%,rgba(255,154,110,0.4),transparent_70%),radial-gradient(40%_35%_at_60%_20%,rgba(126,240,200,0.12),transparent_70%)]" />
          <div className="hairline-grid absolute inset-0 opacity-60" />
          <span className="serif absolute inset-0 grid place-items-center text-[clamp(8rem,22vw,17rem)] italic leading-none text-fg/90 mix-blend-overlay">
            CH
          </span>
        </motion.div>
      )}

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/90 via-ink/40 to-transparent p-5 pt-16 sm:p-6 sm:pt-20">
        <div className="flex items-end justify-between gap-4 font-mono text-[11px] uppercase tracking-[0.14em]">
          <div>
            <p className="text-fg/60">Glen Allen, VA</p>
            <p className="mt-1 flex items-center gap-2 text-fg">
              <span className="text-iris">→</span> Baltimore, MD
            </p>
          </div>
          <p className="rounded-full border border-line-strong bg-ink/50 px-3 py-1 text-fg/80 backdrop-blur">Class of &apos;29</p>
        </div>
      </div>
    </div>
  );
}

export default function Bio() {
  return (
    <div className="mt-24 grid gap-12 lg:grid-cols-12 lg:gap-16">
      <Reveal className="lg:col-span-5">
        <div className="lg:sticky lg:top-28">
          <Portrait />
        </div>
      </Reveal>

      <div className="lg:col-span-7">
        <Reveal>
          <h3 className="text-[clamp(2rem,4.5vw,3.6rem)] font-medium leading-[1] tracking-[-0.04em]">
            Hi, I&apos;m <span className="serif italic text-gradient pr-[0.05em]">Colten.</span>
          </h3>
        </Reveal>

        <div className="mt-8 space-y-5">
          {bio.paragraphs.map((p, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-5% 0px" }}
              transition={{ duration: 1, ease: easeOutExpo, delay: 0.05 * i }}
              className={`text-pretty leading-relaxed ${i === 0 ? "text-xl text-fg/90 sm:text-2xl sm:leading-snug" : "text-lg text-muted"}`}
            >
              {p}
            </motion.p>
          ))}
        </div>

        <Reveal className="mt-12">
          <dl className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
            {bio.facts.map((f) => (
              <div key={f.label} className="flex flex-col gap-1.5 bg-ink-2 p-5 transition-colors hover:bg-surface">
                <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-dim">{f.label}</dt>
                <dd className="text-fg/90">{f.value}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </div>
  );
}
