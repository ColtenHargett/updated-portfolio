"use client";

import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";
import { Reveal, SectionLabel, trackGlow } from "./ui";
import Bio from "./Bio";

const statement =
  "I'm a sophomore studying computer science and data science. I like building things that work with real data, and I'm happiest when a project goes from an idea to something I actually use.";

const emphasis = new Set(["real", "data,", "actually", "use."]);

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
    <section id="about" className="relative py-28 sm:py-40">
      <div className="wrap">
        <SectionLabel index="01">About</SectionLabel>

        <p ref={ref} className="mt-10 max-w-6xl text-balance text-[clamp(1.75rem,4.2vw,3.6rem)] font-medium leading-[1.12] tracking-[-0.03em]">
          {words.map((w, i) => (
            <Word key={i} word={w} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} />
          ))}
        </p>

        <Bio />

        <div className="mt-24">
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
