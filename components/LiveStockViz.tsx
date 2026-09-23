"use client";

import { AnimatePresence, motion, useInView } from "motion/react";
import { useMemo, useRef, useState, type PointerEvent } from "react";
import type { StockData, TickerResult } from "@/lib/live/types";
import { easeOutExpo } from "./ui";

// Two geometries: phones get a narrower canvas so labels stay ~11px instead of shrinking to 5px.
type Geo = { id: string; VW: number; VH: number; PAD: { l: number; r: number; t: number; b: number }; fx: number };
const WIDE: Geo = { id: "w", VW: 800, VH: 340, PAD: { l: 14, r: 120, t: 64, b: 40 }, fx: 34 };
const NARROW: Geo = { id: "n", VW: 380, VH: 290, PAD: { l: 8, r: 92, t: 50, b: 34 }, fx: 22 };
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Dates arrive as YYYY-MM-DD; format by hand so server and client render identically.
const fmtDate = (d: string, withYear = true) => {
  const [y, m, day] = d.split("-").map(Number);
  return `${MONTHS[m - 1]} ${day}${withYear ? `, ${y}` : ""}`;
};
const usd = (v: number) => `$${v.toFixed(2)}`;
const pct = (v: number, digits = 2) => `${v >= 0 ? "+" : ""}${(v * 100).toFixed(digits)}%`;

function PriceChart({ t, inView, fast, geo }: { t: TickerResult; inView: boolean; fast: boolean; geo: Geo }) {
  const { VW, VH, PAD } = geo;
  // The first reveal is choreographed; switching tickers afterwards should feel instant.
  const d = fast ? 0.25 : 1;
  const [hover, setHover] = useState<number | null>(null);
  const { dates, closes } = t.history;
  const n = dates.length;
  const values = [...closes, t.forecast.high];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const x = (i: number) => PAD.l + (i / (n - 1)) * (VW - PAD.l - PAD.r);
  const y = (v: number) => PAD.t + (1 - (v - min) / (max - min || 1)) * (VH - PAD.t - PAD.b);

  const line = closes.map((c, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(c).toFixed(1)}`).join("");
  const area = `${line}L${x(n - 1)},${VH - PAD.b}L${x(0)},${VH - PAD.b}Z`;
  const indexOf = (d: string) => {
    let lo = 0;
    while (lo < n - 1 && dates[lo + 1] <= d) lo++;
    return lo;
  };
  const lx = x(n - 1);
  // Year ticks, skipping any that would collide with the "today" label.
  const years = dates.flatMap((d, i) =>
    i > 0 && d.slice(0, 4) !== dates[i - 1].slice(0, 4) && lx - x(i) > 44 ? [{ i, y: d.slice(0, 4) }] : [],
  );
  const ly = y(t.lastClose);
  const px = lx + geo.fx;
  const py = y(t.forecast.high);

  const onMove = (e: PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const vx = ((e.clientX - r.left) / r.width) * VW;
    const i = Math.round(((vx - PAD.l) / (VW - PAD.l - PAD.r)) * (n - 1));
    setHover(i >= 0 && i < n ? i : null);
  };

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      className="block h-auto w-full touch-pan-y"
      role="img"
      aria-label={`${t.ticker} daily closes over the last five years. The model's five most similar historical days are marked, and it forecasts a next-session high of ${usd(t.forecast.high)}.`}
      onPointerMove={onMove}
      onPointerDown={onMove}
      onPointerLeave={() => setHover(null)}
    >
      <defs>
        <linearGradient id={`ls-area-${geo.id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#8b7bff" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#8b7bff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`ls-line-${geo.id}`} x1="0" x2="1">
          <stop offset="0%" stopColor="#8b7bff" />
          <stop offset="80%" stopColor="#b3a6ff" />
          <stop offset="100%" stopColor="#ffb38a" />
        </linearGradient>
      </defs>

      {years.map(({ i, y: yr }) => (
        <g key={yr}>
          <line x1={x(i)} x2={x(i)} y1={PAD.t - 6} y2={VH - PAD.b} stroke="rgba(255,255,255,0.05)" />
          <text x={x(i) + 4} y={VH - PAD.b + 18} className="fill-dim font-mono text-[11px]">
            {yr}
          </text>
        </g>
      ))}

      <motion.path d={area} fill={`url(#ls-area-${geo.id})`} initial={{ opacity: 0 }} animate={{ opacity: inView ? 1 : 0 }} transition={{ duration: 1 * d, delay: 0.3 * d }} />
      <motion.path
        d={line}
        fill="none"
        stroke={`url(#ls-line-${geo.id})`}
        strokeWidth="1.6"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: inView ? 1 : 0 }}
        transition={{ duration: fast ? 0.7 : 1.6, ease: easeOutExpo }}
      />

      {/* nearest historical days, linked to today */}
      {t.neighbors.map((nb, k) => {
        const i = indexOf(nb.date);
        const nx = x(i);
        const ny = y(nb.close);
        const h = Math.min(20 + (lx - nx) * 0.1, PAD.t - 18);
        return (
          <motion.g key={nb.date} initial={{ opacity: 0 }} animate={{ opacity: inView ? 1 : 0 }} transition={{ delay: (1.1 + k * 0.15) * d, duration: 0.7 }}>
            <line x1={nx} x2={nx} y1={PAD.t - 6} y2={VH - PAD.b} stroke="rgba(179,166,255,0.28)" strokeDasharray="2 4" />
            <path
              d={`M${nx},${PAD.t - 6} C${nx},${PAD.t - 6 - h} ${lx},${PAD.t - 6 - h} ${lx},${PAD.t - 6}`}
              fill="none"
              stroke="rgba(179,166,255,0.4)"
            />
            <circle cx={nx} cy={ny} r="4" fill="#07070a" stroke="#b3a6ff" strokeWidth="1.5" />
            <text x={nx} y={PAD.t - 12} textAnchor="middle" className="fill-iris font-mono text-[10px] max-sm:hidden">
              k{k + 1}
            </text>
          </motion.g>
        );
      })}

      <line x1={lx} x2={lx} y1={PAD.t - 6} y2={VH - PAD.b} stroke="rgba(255,179,138,0.4)" />
      <text x={lx} y={VH - PAD.b + 18} textAnchor="middle" className="fill-peach font-mono text-[11px]">
        today
      </text>

      <motion.g initial={{ opacity: 0, x: -8 }} animate={{ opacity: inView ? 1 : 0, x: 0 }} transition={{ delay: 1.8 * d, duration: 0.8, ease: easeOutExpo }}>
        <line x1={lx} y1={ly} x2={px} y2={py} stroke="#ffb38a" strokeWidth="1.5" strokeDasharray="3 4" />
        <circle cx={px} cy={py} r="12" fill="rgba(255,179,138,0.15)">
          <animate attributeName="r" values="7;16;7" dur="2.4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="1;0.2;1" dur="2.4s" repeatCount="indefinite" />
        </circle>
        <circle cx={px} cy={py} r="4.5" fill="#ffb38a" />
        <text x={px + 12} y={py - 6} className="fill-fg text-[13px] font-medium">
          {usd(t.forecast.high)}
        </text>
        <text x={px + 12} y={py + 11} className="fill-peach font-mono text-[10px]">
          {pct(t.forecast.pct)}
        </text>
      </motion.g>

      {hover !== null && (
        <g pointerEvents="none">
          <line x1={x(hover)} x2={x(hover)} y1={PAD.t - 6} y2={VH - PAD.b} stroke="rgba(255,255,255,0.25)" />
          <circle cx={x(hover)} cy={y(closes[hover])} r="3.5" fill="#f2efe9" />
          <g transform={`translate(${Math.min(x(hover) + 10, VW - 132)}, ${PAD.t})`}>
            <rect width="118" height="40" rx="8" fill="rgba(12,12,17,0.94)" stroke="rgba(255,255,255,0.12)" />
            <text x="10" y="16" className="fill-muted font-mono text-[10px]">
              {fmtDate(dates[hover]).toUpperCase()}
            </text>
            <text x="10" y="32" className="fill-fg text-[12px] font-medium">
              {usd(closes[hover])} close
            </text>
          </g>
        </g>
      )}
    </svg>
  );
}

function BacktestBars({ t }: { t: TickerResult }) {
  const rows = [
    { label: "k-NN model", v: t.backtest.modelMape, main: true },
    { label: "Baseline: today's close", v: t.backtest.closeMape },
    { label: "Baseline: today's high", v: t.backtest.highMape },
  ];
  const max = Math.max(...rows.map((r) => r.v));
  const beats = t.backtest.modelMape < Math.min(t.backtest.closeMape, t.backtest.highMape);
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-dim">Walk-forward backtest</p>
        <p className="font-mono text-[10px] text-dim">{t.backtest.predictions.toLocaleString("en-US")} predictions</p>
      </div>
      <div className="mt-3 space-y-2.5">
        {rows.map((r) => (
          <div key={r.label}>
            <div className="flex justify-between text-[12px]">
              <span className={r.main ? "text-fg" : "text-muted"}>{r.label}</span>
              <span className={`tabular-nums ${r.main ? "text-fg" : "text-muted"}`}>{(r.v * 100).toFixed(2)}%</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
              <motion.div
                className={`h-full rounded-full ${r.main ? "bg-gradient-to-r from-iris to-peach" : "bg-white/25"}`}
                initial={{ width: 0 }}
                whileInView={{ width: `${(r.v / max) * 100}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1.1, ease: easeOutExpo }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11px] leading-snug text-muted">
        Mean absolute % error on next-day highs.{" "}
        {beats ? <span className="text-mint">Lower than both baselines.</span> : <span>Lower is better.</span>}
      </p>
    </div>
  );
}

function RecentChart({ t }: { t: TickerResult }) {
  const pts = t.backtest.recent;
  const w = 300;
  const h = 110;
  const all = pts.flatMap((p) => [p.predicted, p.actual]);
  const lo = Math.min(...all);
  const hi = Math.max(...all);
  const x = (i: number) => 4 + (i / (pts.length - 1)) * (w - 8);
  const y = (v: number) => 6 + (1 - (v - lo) / (hi - lo || 1)) * (h - 12);
  const pred = pts.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.predicted).toFixed(1)}`).join("");
  const act = pts.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.actual).toFixed(1)}`).join("");
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-dim">Predicted vs actual high · last {pts.length} sessions</p>
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="mt-3 h-[110px] w-full" aria-hidden>
        <path d={act} fill="none" stroke="#ffb38a" strokeWidth="1.6" vectorEffect="non-scaling-stroke" strokeOpacity="0.9" />
        <path d={pred} fill="none" stroke="#b3a6ff" strokeWidth="1.6" strokeDasharray="4 3" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="mt-2 flex gap-4 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-3 bg-peach" /> Actual
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-3 border-t border-dashed border-iris" /> Predicted
        </span>
        <span className="ml-auto text-dim">
          {fmtDate(pts[0].date, false)} – {fmtDate(pts[pts.length - 1].date, false)}
        </span>
      </div>
    </div>
  );
}

function Neighbors({ t }: { t: TickerResult }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-dim">Most similar days in history</p>
      <ul className="mt-3 divide-y divide-line">
        {t.neighbors.map((nb, k) => (
          <li key={nb.date} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 py-2 text-[13px]">
            <span className="font-mono text-[10px] text-iris">k{k + 1}</span>
            <span>
              {fmtDate(nb.date)}
              <span className="ml-2 inline-block h-1 rounded-full bg-iris/60 align-middle" style={{ width: `${Math.max(6, nb.weight * 80)}px` }} />
              <span className="ml-1.5 font-mono text-[10px] text-dim">{Math.round(nb.weight * 100)}%</span>
            </span>
            <span className={`tabular-nums ${nb.nextHighPct >= 0 ? "text-fg/85" : "text-muted"}`}>{pct(nb.nextHighPct)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[11px] text-muted">Weight · how high the stock went the next day</p>
    </div>
  );
}

export default function LiveStockViz({ data }: { data: StockData }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });
  const [active, setActive] = useState(data.tickers[0].ticker);
  const [switched, setSwitched] = useState(false);
  const t = useMemo(() => data.tickers.find((x) => x.ticker === active) ?? data.tickers[0], [data, active]);

  return (
    <div ref={ref} className="relative">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5 sm:px-7 sm:pt-6">
        <div role="group" aria-label="Choose a stock" className="flex rounded-full border border-line bg-white/[0.02] p-0.5">
          {data.tickers.map((x) => (
            <button
              key={x.ticker}
              type="button"
              aria-pressed={x.ticker === active}
              onClick={() => {
                setActive(x.ticker);
                setSwitched(true);
              }}
              className={`relative min-h-10 rounded-full px-3.5 font-mono text-[11px] tracking-[0.08em] transition-colors sm:min-h-0 sm:px-3 sm:py-1.5 ${
                x.ticker === active ? "text-ink" : "text-muted hover:text-fg"
              }`}
            >
              {x.ticker === active && (
                <motion.span layoutId="ticker-pill" className="absolute inset-0 rounded-full bg-fg" transition={{ type: "spring", stiffness: 400, damping: 34 }} />
              )}
              <span className="relative">{x.ticker}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
          <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-mint" />
          Live · close of {fmtDate(t.asOf)}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={t.ticker} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
          <div className="hidden sm:block">
            <PriceChart t={t} inView={inView} fast={switched} geo={WIDE} />
          </div>
          <div className="sm:hidden">
            <PriceChart t={t} inView={inView} fast={switched} geo={NARROW} />
          </div>

          <div className="grid gap-px border-t border-line bg-line sm:grid-cols-2">
            <div className="bg-ink-2 px-5 py-5 sm:px-7">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-dim">Next-session high forecast</p>
              <p className="mt-2 text-4xl font-medium tracking-[-0.04em] tabular-nums">{usd(t.forecast.high)}</p>
              <p className="mt-1 text-sm text-muted">
                <span className="text-peach">{pct(t.forecast.pct)}</span> vs. {usd(t.lastClose)} close, weighted from 5 similar days
              </p>
            </div>
            <div className="bg-ink-2 px-5 py-5 sm:px-7">
              <BacktestBars t={t} />
            </div>
            <div className="bg-ink-2 px-5 py-5 sm:px-7">
              <RecentChart t={t} />
            </div>
            <div className="bg-ink-2 px-5 py-5 sm:px-7">
              <Neighbors t={t} />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <p className="border-t border-line px-5 py-4 font-mono text-[10px] uppercase leading-relaxed tracking-[0.12em] text-dim sm:px-7">
        Real daily prices from {t.source} · model re-run every 6 hours · for demonstration, not investment advice
      </p>
    </div>
  );
}
