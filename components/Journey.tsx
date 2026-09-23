"use client";

import { motion, useScroll, useSpring } from "motion/react";
import { useRef } from "react";
import { journey } from "@/lib/data";
import { Reveal, SectionLabel, SplitReveal, easeOutExpo } from "./ui";

const kindStyle = {
  education: { label: "Education", dot: "bg-iris", text: "text-iris" },
  leadership: { label: "Leadership", dot: "bg-peach", text: "text-peach" },
  community: { label: "Community", dot: "bg-mint", text: "text-mint" },
} as const;

export default function Journey() {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.7", "end 0.6"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  return (
    <section id="journey" className="relative py-28 sm:py-36">
      <div className="wrap grid gap-16 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-32">
            <SectionLabel index="04">Journey</SectionLabel>
            <h2 className="mt-8 text-[clamp(2.8rem,6vw,5.2rem)] font-medium leading-[0.92] tracking-[-0.05em]">
              <SplitReveal text="Learning," className="block" />
              <SplitReveal text="leading," className="block" delay={0.08} />
              <SplitReveal text="building." className="serif block italic tracking-[-0.02em]" wordClassName="text-gradient pr-[0.05em]" delay={0.16} />
            </h2>
            <Reveal delay={0.2}>
              <p className="mt-8 max-w-sm leading-relaxed text-muted">
                Before I was writing models, I was running pool operations and leading teams of 30+. That experience taught me how to stay calm, take ownership and ship under pressure, and it shows up in how I work on software.
              </p>
            </Reveal>
          </div>
        </div>

        <ol ref={ref} className="relative lg:col-span-8">
          <span className="absolute bottom-0 left-[7px] top-2 w-px bg-line" aria-hidden />
          <motion.span style={{ scaleY }} className="absolute bottom-0 left-[7px] top-2 w-px origin-top bg-gradient-to-b from-iris via-peach to-mint" aria-hidden />

          {journey.map((j, i) => {
            const k = kindStyle[j.kind];
            return (
              <motion.li
                key={j.title + j.org}
                className="relative pb-14 pl-12 last:pb-0"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10% 0px" }}
                transition={{ duration: 1, ease: easeOutExpo, delay: 0.05 }}
              >
                <span className="absolute left-0 top-1.5 grid h-[15px] w-[15px] place-items-center rounded-full border border-line-strong bg-ink">
                  <span className={`h-[7px] w-[7px] rounded-full ${k.dot}`} />
                </span>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] uppercase tracking-[0.14em]">
                  <span className="text-fg/70">{j.period}</span>
                  <span className={k.text}>{k.label}</span>
                </div>
                <h3 className="mt-3 text-2xl font-medium tracking-tight sm:text-3xl">{j.title}</h3>
                <p className="mt-1 text-fg/60">
                  <span className="serif text-lg italic text-fg/85">{j.org}</span> · {j.place}
                </p>
                <p className="mt-4 max-w-2xl text-pretty leading-relaxed text-muted">{j.body}</p>
                {j.points && (
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {j.points.map((p) => (
                      <li key={p} className="rounded-full border border-line bg-white/[0.02] px-3 py-1 text-sm text-fg/75">
                        {p}
                      </li>
                    ))}
                  </ul>
                )}
                {i < journey.length - 1 && <span className="sr-only">,</span>}
              </motion.li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
