"use client";

import { AnimatePresence, motion, useInView } from "motion/react";
import { useMemo, useRef, useState, type PointerEvent } from "react";
import { easeOutExpo } from "./ui";

// A miniature, live version of the Stock Market Predictor:
// generate a market, find the k most similar historical windows to "today",
// and forecast tomorrow's high from what happened after each match.

const N = 132; // trading days
const W = 8; // window length compared
const K = 3; // neighbors
// Phones get a narrower canvas so SVG labels stay legible instead of scaling down to ~5px.
type Geo = { id: string; VW: number; VH: number; PAD: { l: number; r: number; t: number; b: number } };
const WIDE: Geo = { id: "w", VW: 800, VH: 400, PAD: { l: 16, r: 110, t: 70, b: 44 } };
const NARROW: Geo = { id: "n", VW: 380, VH: 300, PAD: { l: 8, r: 80, t: 56, b: 36 } };

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function simulate(seed: number) {
  const rnd = mulberry32(seed);
  const gauss = () => Math.sqrt(-2 * Math.log(rnd() + 1e-9)) * Math.cos(2 * Math.PI * rnd());
  const close: number[] = [];
  const high: number[] = [];
  let p = 140 + rnd() * 60;
  let drift = 0;
  for (let i = 0; i < N; i++) {
    if (i % 22 === 0) drift = (rnd() - 0.45) * 0.006;
    // a gentle cycle gives the series repeating shapes worth matching
    const cycle = Math.sin(i / 7.5) * 0.006;
    p *= 1 + drift + cycle + gauss() * 0.011;
    close.push(p);
    high.push(p * (1 + Math.abs(gauss()) * 0.007 + 0.002));
  }
  const ret = close.map((c, i) => (i === 0 ? 0 : c / close[i - 1] - 1));

  const vec = (s: number) => ret.slice(s + 1, s + W + 1);
  const qStart = N - W - 1;
  const query = vec(qStart);
  const sd = Math.sqrt(ret.reduce((a, r) => a + r * r, 0) / ret.length) || 1;

  const cands: { start: number; d: number }[] = [];
  for (let s = 0; s + W + 2 < qStart; s++) {
    const v = vec(s);
    const d = Math.sqrt(v.reduce((a, r, j) => a + ((r - query[j]) / sd) ** 2, 0) / W);
    cands.push({ start: s, d });
  }
  cands.sort((a, b) => a.d - b.d);
  const matches: { start: number; d: number; nextHighPct: number }[] = [];
  for (const c of cands) {
    if (matches.every((m) => Math.abs(m.start - c.start) > W + 2)) {
      const end = c.start + W;
      matches.push({ ...c, nextHighPct: high[end + 1] / close[end] - 1 });
    }
    if (matches.length === K) break;
  }

  const weights = matches.map((m) => 1 / (m.d + 1e-6));
  const wsum = weights.reduce((a, b) => a + b, 0);
  const predPct = matches.reduce((a, m, i) => a + m.nextHighPct * weights[i], 0) / wsum;
  const last = close[N - 1];

  // Cumulative price path of a window, indexed to 1.0 at its start, so shapes are comparable.
  const shape = (s: number) => close.slice(s, s + W + 1).map((c) => c / close[s]);
  const shapes = { query: shape(qStart), matches: matches.map((m) => shape(m.start)) };

  return { close, high, matches, qStart, predPct, predHigh: last * (1 + predPct), last, shapes, weights: weights.map((w) => w / wsum) };
}

export default function StockViz() {
  const [seed, setSeed] = useState(7);
  const [hover, setHover] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });
  const sim = useMemo(() => simulate(seed), [seed]);

  const all = [...sim.close, ...sim.high, sim.predHigh];
  const min = Math.min(...all);
  const max = Math.max(...all);
  const chart = (g: Geo) => {
    const { VW, VH, PAD } = g;
    const x = (i: number) => PAD.l + (i / N) * (VW - PAD.l - PAD.r);
    const y = (v: number) => PAD.t + (1 - (v - min) / (max - min)) * (VH - PAD.t - PAD.b);

    const line = sim.close.map((c, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(c).toFixed(1)}`).join("");
    const area = `${line}L${x(N - 1)},${VH - PAD.b}L${x(0)},${VH - PAD.b}Z`;
    const qx0 = x(sim.qStart);
    const qx1 = x(N - 1);
    const px = x(N + 3);
    const py = y(sim.predHigh);

    const onMove = (e: PointerEvent<SVGSVGElement>) => {
      const r = e.currentTarget.getBoundingClientRect();
      const vx = ((e.clientX - r.left) / r.width) * VW;
      const i = Math.round(((vx - PAD.l) / (VW - PAD.l - PAD.r)) * N);
      setHover(i >= 0 && i < N ? i : null);
    };

    return (
          <svg
            viewBox={`0 0 ${VW} ${VH}`}
            className="block h-auto w-full touch-pan-y"
            role="img"
            aria-label={`Simulated price chart. The model found ${K} historical windows similar to the most recent ${W} days and predicts a next-day high of ${sim.predHigh.toFixed(2)}, ${(sim.predPct * 100).toFixed(2)}% above the last close.`}
            onPointerMove={onMove}
            onPointerDown={onMove}
            onPointerLeave={() => setHover(null)}
          >
            <defs>
              <linearGradient id={`sv-area-${g.id}`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#8b7bff" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#8b7bff" stopOpacity="0" />
              </linearGradient>
              <linearGradient id={`sv-line-${g.id}`} x1="0" x2="1">
                <stop offset="0%" stopColor="#8b7bff" />
                <stop offset="75%" stopColor="#b3a6ff" />
                <stop offset="100%" stopColor="#ffb38a" />
              </linearGradient>
            </defs>

            {[0.25, 0.5, 0.75].map((f) => (
              <line key={f} x1={PAD.l} x2={VW - PAD.r + 60} y1={PAD.t + f * (VH - PAD.t - PAD.b)} y2={PAD.t + f * (VH - PAD.t - PAD.b)} stroke="rgba(255,255,255,0.05)" strokeDasharray="2 6" />
            ))}

            <AnimatePresence mode="wait">
              <motion.g key={seed} initial={{ opacity: 0 }} animate={{ opacity: inView ? 1 : 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
                {/* matched historical windows + arcs linking them to today */}
                {sim.matches.map((m, i) => {
                  const x0 = x(m.start);
                  const x1 = x(m.start + W);
                  const mid = (x0 + x1) / 2;
                  const qmid = (qx0 + qx1) / 2;
                  const h = Math.min(18 + (qmid - mid) * 0.12, PAD.t - 22);
                  return (
                    <motion.g key={m.start} initial={{ opacity: 0 }} animate={{ opacity: inView ? 1 : 0 }} transition={{ delay: 1.2 + i * 0.25, duration: 0.8 }}>
                      <rect x={x0} y={PAD.t - 8} width={x1 - x0} height={VH - PAD.t - PAD.b + 8} fill="rgba(179,166,255,0.08)" stroke="rgba(179,166,255,0.35)" strokeDasharray="3 4" rx="6" />
                      <motion.path
                        d={`M${mid},${PAD.t - 8} C${mid},${PAD.t - 8 - h} ${qmid},${PAD.t - 8 - h} ${qmid},${PAD.t - 8}`}
                        fill="none"
                        stroke="rgba(179,166,255,0.45)"
                        strokeWidth="1"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: inView ? 1 : 0 }}
                        transition={{ delay: 1.4 + i * 0.25, duration: 1.1, ease: easeOutExpo }}
                      />
                      <text x={mid} y={VH - PAD.b + 22} textAnchor="middle" className="fill-iris font-mono text-[11px] max-sm:hidden">
                        k{i + 1} · d={m.d.toFixed(2)}
                      </text>
                    </motion.g>
                  );
                })}

                {/* today's window */}
                <motion.g initial={{ opacity: 0 }} animate={{ opacity: inView ? 1 : 0 }} transition={{ delay: 1, duration: 0.8 }}>
                  <rect x={qx0} y={PAD.t - 8} width={qx1 - qx0} height={VH - PAD.t - PAD.b + 8} fill="rgba(255,179,138,0.08)" stroke="rgba(255,179,138,0.5)" rx="6" />
                  <text x={(qx0 + qx1) / 2} y={VH - PAD.b + 22} textAnchor="middle" className="fill-peach font-mono text-[11px]">
                    today
                  </text>
                </motion.g>

                <motion.path d={area} fill={`url(#sv-area-${g.id})`} initial={{ opacity: 0 }} animate={{ opacity: inView ? 1 : 0 }} transition={{ duration: 1.2, delay: 0.4 }} />
                <motion.path
                  d={line}
                  fill="none"
                  stroke={`url(#sv-line-${g.id})`}
                  strokeWidth="2"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: inView ? 1 : 0 }}
                  transition={{ duration: 1.8, ease: easeOutExpo }}
                />

                {/* forecast */}
                <motion.g initial={{ opacity: 0, x: -10 }} animate={{ opacity: inView ? 1 : 0, x: 0 }} transition={{ delay: 2.1, duration: 0.9, ease: easeOutExpo }}>
                  <line x1={x(N - 1)} y1={y(sim.last)} x2={px} y2={py} stroke="#ffb38a" strokeWidth="1.5" strokeDasharray="4 4" />
                  <circle cx={px} cy={py} r="14" fill="rgba(255,179,138,0.15)">
                    <animate attributeName="r" values="8;18;8" dur="2.4s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="1;0.2;1" dur="2.4s" repeatCount="indefinite" />
                  </circle>
                  <circle cx={px} cy={py} r="4.5" fill="#ffb38a" />
                  <text x={px + 12} y={py - 12} className="fill-fg text-[13px] font-medium">
                    ${sim.predHigh.toFixed(2)}
                  </text>
                  <text x={px + 12} y={py + 6} className="fill-peach font-mono text-[11px]">
                    {sim.predPct >= 0 ? "+" : ""}
                    {(sim.predPct * 100).toFixed(2)}% high
                  </text>
                </motion.g>
              </motion.g>
            </AnimatePresence>

            {hover !== null && (
              <g pointerEvents="none">
                <line x1={x(hover)} x2={x(hover)} y1={PAD.t - 8} y2={VH - PAD.b} stroke="rgba(255,255,255,0.25)" />
                <circle cx={x(hover)} cy={y(sim.close[hover])} r="4" fill="#f2efe9" />
                <g transform={`translate(${Math.min(x(hover) + 10, VW - 120)}, ${PAD.t + 4})`}>
                  <rect width="100" height="40" rx="8" fill="rgba(12,12,17,0.92)" stroke="rgba(255,255,255,0.12)" />
                  <text x="10" y="16" className="fill-muted font-mono text-[10px]">DAY {hover + 1}</text>
                  <text x="10" y="32" className="fill-fg text-[12px] font-medium">${sim.close[hover].toFixed(2)}</text>
                </g>
              </g>
            )}
          </svg>
    );
  };

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center justify-between gap-4 px-5 pt-5 sm:px-7 sm:pt-6">
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
          <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-mint" />
          Live k-NN demo
        </div>
        <button
          type="button"
          onClick={() => setSeed((s) => s + 1)}
          className="group flex min-h-10 items-center gap-2 rounded-full border border-line-strong px-3.5 py-1.5 font-mono sm:min-h-0 text-[11px] uppercase tracking-[0.14em] text-fg/80 transition-colors hover:border-iris hover:text-fg"
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 transition-transform duration-700 group-hover:rotate-180" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          New market
        </button>
      </div>

      <div className="hidden sm:block">{chart(WIDE)}</div>
      <div className="sm:hidden">{chart(NARROW)}</div>

      <PatternPanel sim={sim} seed={seed} />

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line px-5 py-4 font-mono text-[11px] uppercase tracking-[0.12em] text-muted sm:px-7">
        <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-sm bg-peach/70" /> Current window</span>
        <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-sm bg-iris/70" /> Nearest neighbors</span>
        <span className="text-dim sm:ml-auto">k={K} · inverse-distance weighted</span>
      </div>
    </div>
  );
}

function PatternPanel({ sim, seed }: { sim: ReturnType<typeof simulate>; seed: number }) {
  const w = 220;
  const h = 84;
  const all = [...sim.shapes.query, ...sim.shapes.matches.flat()];
  const lo = Math.min(...all);
  const hi = Math.max(...all);
  const path = (pts: number[]) =>
    pts.map((v, i) => `${i ? "L" : "M"}${((i / W) * (w - 8) + 4).toFixed(1)},${(h - 6 - ((v - lo) / (hi - lo || 1)) * (h - 12)).toFixed(1)}`).join("");

  return (
    <div className="grid gap-5 border-t border-line px-5 py-5 sm:grid-cols-[auto_1fr] sm:items-center sm:gap-8 sm:px-7">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-dim">Pattern match · last {W} days</p>
        <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="mt-2 h-[84px] w-full sm:w-[220px]" aria-hidden>
          <line x1="4" x2={w - 4} y1={h - 6 - ((1 - lo) / (hi - lo || 1)) * (h - 12)} y2={h - 6 - ((1 - lo) / (hi - lo || 1)) * (h - 12)} stroke="rgba(255,255,255,0.08)" strokeDasharray="2 4" vectorEffect="non-scaling-stroke" />
          {sim.shapes.matches.map((m, i) => (
            <motion.path
              key={`${seed}-${i}`}
              d={path(m)}
              fill="none"
              stroke="#b3a6ff"
              strokeOpacity={0.35 + sim.weights[i] * 0.6}
              strokeWidth="1.4"
              vectorEffect="non-scaling-stroke"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: false }}
              transition={{ duration: 1, delay: 0.2 + i * 0.15, ease: easeOutExpo }}
            />
          ))}
          <motion.path
            key={`${seed}-q`}
            d={path(sim.shapes.query)}
            fill="none"
            stroke="#ffb38a"
            strokeWidth="2.2"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: false }}
            transition={{ duration: 1, ease: easeOutExpo }}
          />
        </svg>
      </div>

      <div className="grid grid-cols-3 gap-3 text-sm">
        {sim.matches.map((m, i) => (
          <div key={`${seed}-${m.start}`} className="rounded-xl border border-line bg-white/[0.02] p-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-iris">
              k{i + 1}
              <span className="max-sm:hidden"> · day {m.start + W + 1}</span>
            </p>
            <p className="mt-1.5 font-medium tabular-nums">
              {m.nextHighPct >= 0 ? "+" : ""}
              {(m.nextHighPct * 100).toFixed(2)}%
            </p>
            <p className="mt-0.5 text-[11px] text-muted">
              next-day high<span className="max-sm:hidden"> · </span><br className="sm:hidden" />
              <span className="tabular-nums">{Math.round(sim.weights[i] * 100)}%</span> weight
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
