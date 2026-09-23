"use client";

import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";
import { strengths } from "@/lib/data";
import { Reveal, SectionLabel, SplitReveal, trackGlow } from "./ui";
import Bio from "./Bio";

const statement =
  "I'm a sophomore double-majoring in computer science and data science. I like projects that end with a real answer: a model I can backtest, a pipeline that runs on its own, a number that tells me whether it worked.";

const emphasis = new Set(["real", "answer:", "backtest,", "runs", "own,", "worked."]);

function Word({ word, progress, range }: { word: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.2, 1]);
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
  { group: "Tools", items: ["Git & GitHub", "PyCharm", "Vercel"] },
];

export default function About() {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const words = statement.split(" ");

  return (
    <section id="about" className="relative pb-12 pt-28 sm:pb-16 sm:pt-40">
      <div className="wrap">
        <SectionLabel index="01">About</SectionLabel>

        <p ref={ref} className="mt-10 max-w-6xl text-balance text-[clamp(1.75rem,4.2vw,3.6rem)] font-medium leading-[1.12] tracking-[-0.03em]">
          {words.map((w, i) => (
            <Word key={i} word={w} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} />
          ))}
        </p>

        <Bio />

        <div className="mt-32 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SplitReveal as="h2" text="What I bring" className="text-[clamp(2.5rem,6vw,5rem)] font-medium leading-none tracking-[-0.04em]" />
          <Reveal className="max-w-sm text-muted">
            <p>The short version of what I&apos;d bring to a team.</p>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {strengths.map((st, i) => (
            <Reveal key={st.title} delay={i * 0.08}>
              <article onPointerMove={trackGlow} className="glow-card group h-full rounded-3xl p-7 sm:p-8">
                <span className="font-mono text-xs text-dim">0{i + 1}</span>
                <div className="mt-10">
                  <h3 className="text-2xl font-medium tracking-tight">
                    {st.title.split(" ").slice(0, -1).join(" ")}{" "}
                    <span className="serif italic text-iris transition-colors duration-500 group-hover:text-peach">{st.title.split(" ").slice(-1)}</span>
                  </h3>
                  <p className="mt-3 text-pretty leading-relaxed text-muted">{st.body}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <div className="mt-4">
          <Reveal>
            <div onPointerMove={trackGlow} className="glow-card grid gap-8 rounded-3xl p-7 sm:p-9 md:grid-cols-[1fr_3fr]">
              <div>
                <p className="eyebrow">Toolbox</p>
                <p className="mt-3 text-2xl font-medium tracking-tight">
                  What I <span className="serif italic text-iris">use</span>
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
