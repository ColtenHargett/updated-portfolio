"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { featured, repoLink, type Featured } from "@/lib/data";
import StockViz from "./StockViz";
import LiveStockViz from "./LiveStockViz";
import type { NewsData, StockData } from "@/lib/live/types";
import PipelineViz from "./PipelineViz";
import { ArrowUpRight, Magnetic, Reveal, SectionLabel, SplitReveal, easeOutExpo, trackGlow } from "./ui";

type Live = { stocks: StockData | null; news: NewsData | null };

// When live data loaded, swap the static headline numbers for real ones.
function liveStats(p: Featured, { stocks, news }: Live): Featured["stats"] {
  if (p.visual === "stock" && stocks) {
    const t = stocks.tickers;
    const avg = t.reduce((s, x) => s + x.backtest.modelMape, 0) / t.length;
    const beat = t.filter((x) => x.backtest.modelMape < Math.min(x.backtest.closeMape, x.backtest.highMape)).length;
    const preds = t.reduce((s, x) => s + x.backtest.predictions, 0);
    return [
      { value: `${(avg * 100).toFixed(2)}%`, label: "Avg. error, live backtest" },
      { value: `${beat} / ${t.length}`, label: "Tickers beating both baselines" },
      { value: preds.toLocaleString("en-US"), label: "Walk-forward predictions" },
    ];
  }
  if (p.visual === "pipeline" && news) {
    return [
      { value: String(news.total), label: "Articles read, last 24h" },
      { value: String(news.counts.filter((c) => c.count > 0).length), label: "News sources" },
      { value: "0", label: "Manual steps" },
    ];
  }
  return p.stats;
}

function CaseStudy({ p, flip, live }: { p: Featured; flip: boolean; live: Live }) {
  const stats = liveStats(p, live);
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const numY = useTransform(scrollYProgress, [0, 1], ["30%", "-30%"]);

  return (
    <article ref={ref} id={p.id} className="relative scroll-mt-24 border-t border-line pt-12 sm:pt-16">
      <motion.span
        aria-hidden
        style={{ y: numY }}
        className={`serif pointer-events-none absolute -top-8 select-none text-[clamp(8rem,22vw,20rem)] italic leading-none text-white/[0.035] ${flip ? "left-0" : "right-0"}`}
      >
        {p.index}
      </motion.span>

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow flex items-center gap-3">
            <span className="text-iris">{p.index}</span>
            {p.kicker}
          </p>
          <SplitReveal as="h3" text={p.title} className="mt-4 text-[clamp(2.4rem,6.5vw,5.6rem)] font-medium leading-[0.95] tracking-[-0.045em]" />
        </div>
        <Reveal delay={0.2}>
          <Magnetic>
            <a
              href={repoLink(p.path)}
              target="_blank"
              rel="noreferrer"
              data-cursor="Code"
              className="group inline-flex items-center gap-2 rounded-full border border-line-strong px-5 py-2.5 text-sm transition-colors hover:border-fg hover:bg-fg hover:text-ink"
            >
              View source
              <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:rotate-45" />
            </a>
          </Magnetic>
        </Reveal>
      </div>

      <div className={`relative mt-10 grid gap-10 lg:grid-cols-12 lg:gap-14 ${flip ? "lg:[&>*:first-child]:order-2" : ""}`}>
        <Reveal className="lg:col-span-7">
          <div className="lg:sticky lg:top-28">
            <div onPointerMove={trackGlow} className="glow-card overflow-hidden rounded-[28px] bg-gradient-to-b from-[#101018] to-ink-2">
              {p.visual === "stock" ? (
                live.stocks ? <LiveStockViz data={live.stocks} /> : <StockViz />
              ) : (
                <PipelineViz news={live.news} />
              )}
            </div>
          </div>
        </Reveal>

        <div className="lg:col-span-5">
          <Reveal>
            <p className="text-pretty text-xl leading-relaxed text-fg/90 sm:text-2xl sm:leading-snug">{p.summary}</p>
          </Reveal>

          <Reveal delay={0.05} className="mt-10">
            <p className="eyebrow">The problem</p>
            <p className="mt-3 text-pretty leading-relaxed text-muted">{p.problem}</p>
          </Reveal>

          <div className="mt-10">
            <Reveal>
              <p className="eyebrow">How it works</p>
            </Reveal>
            <ol className="mt-4 space-y-px overflow-hidden rounded-2xl border border-line">
              {p.approach.map((a, i) => (
                <motion.li
                  key={a}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-5% 0px" }}
                  transition={{ duration: 0.8, delay: i * 0.08, ease: easeOutExpo }}
                  className="flex gap-4 bg-white/[0.02] p-4 text-[15px] leading-relaxed text-fg/80 transition-colors hover:bg-white/[0.05]"
                >
                  <span className="mt-0.5 font-mono text-xs text-iris">0{i + 1}</span>
                  {a}
                </motion.li>
              ))}
            </ol>
          </div>

          <Reveal className="mt-10 grid grid-cols-3 gap-4">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="text-3xl font-medium tracking-[-0.04em] sm:text-4xl">{s.value}</p>
                <p className="mt-1.5 text-xs leading-snug text-muted">{s.label}</p>
              </div>
            ))}
          </Reveal>

          <Reveal className="mt-10 flex flex-wrap gap-2">
            {p.stack.map((s) => (
              <span key={s} className="rounded-full border border-line px-3 py-1 font-mono text-[11px] uppercase tracking-[0.1em] text-fg/70">
                {s}
              </span>
            ))}
          </Reveal>
        </div>
      </div>
    </article>
  );
}

export default function Work({ stocks = null, news = null }: Partial<Live>) {
  return (
    <section id="work" className="relative py-28 sm:py-36">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[60vh] bg-[radial-gradient(50%_60%_at_50%_0%,rgba(139,123,255,0.12),transparent)]" />
      <div className="wrap relative">
        <SectionLabel index="02">Selected work</SectionLabel>
        <div className="mt-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <h2 className="text-[clamp(2.8rem,8vw,7rem)] font-medium leading-[0.92] tracking-[-0.05em]">
            <SplitReveal text="Systems that" className="block" />
            <SplitReveal text="think with data." className="serif block italic tracking-[-0.02em]" wordClassName="text-gradient pr-[0.05em]" delay={0.15} />
          </h2>
          <Reveal className="max-w-sm text-muted">
            <p>Two projects I&apos;m proudest of, each with a live, interactive look at how it works under the hood.</p>
          </Reveal>
        </div>

        <div className="mt-20 space-y-32 sm:space-y-40">
          {featured.map((p, i) => (
            <CaseStudy key={p.id} p={p} flip={i % 2 === 1} live={{ stocks, news }} />
          ))}
        </div>
      </div>
    </section>
  );
}
