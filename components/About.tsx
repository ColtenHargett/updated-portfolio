"use client";

import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";
import { principles, stats } from "@/lib/data";
import { Counter, Reveal, SectionLabel, SplitReveal, trackGlow } from "./ui";

const statement =
  "I'm a Computer Science and Data Science student who loves building things that take messy, real-world data and turn it into something genuinely useful: forecasting models that explain themselves, AI agents that do the reading for you, and software that feels considered down to the details.";

const emphasis = new Set(["messy,", "real-world", "genuinely", "useful:", "explain", "themselves,", "considered"]);

function Word({ word, progress, range }: { word: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  const accent = emphasis.has(word);
  return (
    <motion.span style={{ opacity }} className={accent ? "serif italic text-gradient" : undefined}>
      {word}{" "}
    </motion.span>
  );
}

const toolbox = [
  { group: "Languages", items: ["Python", "Java", "HTML / CSS", "Unix shell"] },
  { group: "Data & ML", items: ["pandas", "NumPy", "scikit-learn", "yfinance"] },
  { group: "AI systems", items: ["Gemini API", "LangChain", "ChromaDB", "RAG"] },
  { group: "Workflow", items: ["Git & GitHub", "PyCharm", "Automation", "Backtesting"] },
];

export default function About() {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const words = statement.split(" ");

  return (
    <section id="about" className="relative py-28 sm:py-40">
      <div className="wrap">
        <SectionLabel index="01">About</SectionLabel>

        <p ref={ref} className="mt-10 max-w-6xl text-balance text-[clamp(1.75rem,4.2vw,3.6rem)] font-medium leading-[1.12] tracking-[-0.03em]">
          {words.map((w, i) => (
            <Word key={i} word={w} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} />
          ))}
        </p>

        <div className="mt-20 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-line bg-line md:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08} className="bg-ink p-6 sm:p-8">
              <p className="text-5xl font-medium tracking-[-0.04em] sm:text-6xl">
                <Counter to={s.value} decimals={s.decimals ?? 0} suffix={s.suffix} />
              </p>
              <p className="eyebrow mt-3">{s.label}</p>
            </Reveal>
          ))}
        </div>

        <div className="mt-32 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SplitReveal as="h2" text="How I build" className="text-[clamp(2.5rem,6vw,5rem)] font-medium leading-none tracking-[-0.04em]" />
          <Reveal className="max-w-sm text-muted">
            <p>Four principles that show up in every project, from a Java console app to a machine-learning pipeline.</p>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-6">
          {principles.map((p, i) => (
            <Reveal key={p.title} delay={(i % 2) * 0.1} className={i === 0 || i === 3 ? "md:col-span-4" : "md:col-span-2"}>
              <article onPointerMove={trackGlow} className="glow-card group flex h-full min-h-60 flex-col justify-between rounded-3xl p-7 sm:p-9">
                <span className="font-mono text-xs text-dim">0{i + 1}</span>
                <div>
                  <h3 className="text-2xl font-medium tracking-tight sm:text-3xl">
                    {p.title.split(" ").map((w, j, arr) =>
                      j === arr.length - 1 ? (
                        <span key={j} className="serif italic text-iris transition-colors duration-500 group-hover:text-peach">
                          {w}
                        </span>
                      ) : (
                        <span key={j}>{w} </span>
                      ),
                    )}
                  </h3>
                  <p className="mt-3 max-w-md text-pretty leading-relaxed text-muted">{p.body}</p>
                </div>
              </article>
            </Reveal>
          ))}

          <Reveal className="md:col-span-6">
            <div onPointerMove={trackGlow} className="glow-card grid gap-8 rounded-3xl p-7 sm:p-9 md:grid-cols-[1fr_3fr]">
              <div>
                <p className="eyebrow">Toolbox</p>
                <p className="mt-3 text-2xl font-medium tracking-tight">
                  What I reach for <span className="serif italic text-iris">day to day</span>
                </p>
              </div>
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                {toolbox.map((g) => (
                  <div key={g.group}>
                    <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-dim">{g.group}</p>
                    <ul className="mt-3 space-y-2 text-fg/85">
                      {g.items.map((it) => (
                        <li key={it} className="flex items-center gap-2">
                          <span className="h-1 w-1 rounded-full bg-iris/70" />
                          {it}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
