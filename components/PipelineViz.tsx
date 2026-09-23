"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { easeOutExpo } from "./ui";

const VW = 900;
const VH = 380;
const sources = ["NPR", "BBC", "ABC News", "CBS News", "NBC News"];
const srcY = (i: number) => 60 + i * 60;
const CY = 180;

const nodes = [
  { id: "scraper", x: 330, label: "Scraper", sub: "RSS · text", icon: "M4 6h16M4 12h10M4 18h7" },
  { id: "vector", x: 520, label: "ChromaDB", sub: "vector store", icon: "M12 3c4.4 0 8 1.3 8 3s-3.6 3-8 3-8-1.3-8-3 3.6-3 8-3zm-8 3v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" },
  { id: "llm", x: 710, label: "Gemini", sub: "LLM recap", icon: "M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z" },
];
const NW = 156;
const NH = 80;
const inbox = { x: 858, y: CY };

export default function PipelineViz() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });
  const reduce = useReducedMotion();
  const [date, setDate] = useState("");
  useEffect(() => {
    setDate(new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }));
  }, []);

  const srcPaths = sources.map((_, i) => `M150,${srcY(i)} C240,${srcY(i)} 220,${CY} ${nodes[0].x - NW / 2},${CY}`);
  const linkPaths = [
    `M${nodes[0].x + NW / 2},${CY} L${nodes[1].x - NW / 2},${CY}`,
    `M${nodes[1].x + NW / 2},${CY} L${nodes[2].x - NW / 2},${CY}`,
    `M${nodes[2].x + NW / 2},${CY} L${inbox.x - 30},${CY}`,
  ];

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center justify-between px-5 pt-5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted sm:px-7 sm:pt-6">
        <span className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-mint" />
          Nightly run · 11:57 PM
        </span>
        <span className="hidden text-dim sm:inline">scrape → store → summarize → send</span>
      </div>

      <svg viewBox={`0 0 ${VW} ${VH}`} className="block h-auto w-full" role="img" aria-label="Pipeline diagram: five news sources feed a scraper, which stores chunks in ChromaDB; Gemini writes a summary that is emailed out.">
        <defs>
          <linearGradient id="pv-link" x1="0" x2="1">
            <stop offset="0%" stopColor="#8b7bff" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#ffb38a" stopOpacity="0.6" />
          </linearGradient>
          <radialGradient id="pv-glow">
            <stop offset="0%" stopColor="#b3a6ff" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#b3a6ff" stopOpacity="0" />
          </radialGradient>
        </defs>

        {srcPaths.map((d, i) => (
          <motion.path key={d} id={`pv-s${i}`} d={d} fill="none" stroke="rgba(179,166,255,0.28)" strokeWidth="1.2"
            initial={{ pathLength: 0 }} animate={{ pathLength: inView ? 1 : 0 }} transition={{ duration: 1.2, delay: 0.3 + i * 0.08, ease: easeOutExpo }} />
        ))}
        {linkPaths.map((d, i) => (
          <motion.path key={d} id={`pv-l${i}`} d={d} fill="none" stroke="url(#pv-link)" strokeWidth="1.5"
            initial={{ pathLength: 0 }} animate={{ pathLength: inView ? 1 : 0 }} transition={{ duration: 0.9, delay: 0.9 + i * 0.25, ease: easeOutExpo }} />
        ))}

        {/* travelling packets */}
        {inView && !reduce && (
          <g>
            {sources.map((_, i) => (
              <circle key={`ps${i}`} r="3" fill="#b3a6ff">
                <animateMotion dur="2.6s" repeatCount="indefinite" begin={`${1.4 + i * 0.45}s`} keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines="0.4 0 0.2 1">
                  <mpath href={`#pv-s${i}`} />
                </animateMotion>
                <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.85;1" dur="2.6s" repeatCount="indefinite" begin={`${1.4 + i * 0.45}s`} />
              </circle>
            ))}
            {linkPaths.map((_, i) => (
              <circle key={`pl${i}`} r={i === 2 ? 4 : 3.2} fill={i === 2 ? "#ffb38a" : "#d8d0ff"}>
                <animateMotion dur="1.6s" repeatCount="indefinite" begin={`${2.2 + i * 0.55}s`}>
                  <mpath href={`#pv-l${i}`} />
                </animateMotion>
                <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.15;0.85;1" dur="1.6s" repeatCount="indefinite" begin={`${2.2 + i * 0.55}s`} />
              </circle>
            ))}
          </g>
        )}

        {sources.map((s, i) => (
          <motion.g key={s} initial={{ opacity: 0, x: -12 }} animate={{ opacity: inView ? 1 : 0, x: 0 }} transition={{ duration: 0.8, delay: i * 0.07, ease: easeOutExpo }}>
            <rect x="16" y={srcY(i) - 19} width="134" height="38" rx="19" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.12)" />
            <circle cx="38" cy={srcY(i)} r="4" fill="#7ef0c8" />
            <text x="54" y={srcY(i) + 5} className="fill-fg text-[15px]">{s}</text>
          </motion.g>
        ))}

        {nodes.map((n, i) => (
          <motion.g key={n.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: inView ? 1 : 0, y: 0 }} transition={{ duration: 0.9, delay: 0.7 + i * 0.25, ease: easeOutExpo }}>
            <circle cx={n.x} cy={CY} r="90" fill="url(#pv-glow)" />
            <rect x={n.x - NW / 2} y={CY - NH / 2} width={NW} height={NH} rx="16" fill="#0f0f16" stroke="rgba(255,255,255,0.14)" />
            <g transform={`translate(${n.x - NW / 2 + 14}, ${CY - 15})`}>
              <rect width="30" height="30" rx="9" fill="rgba(179,166,255,0.14)" />
              <g transform="translate(6 6) scale(0.75)">
                <path d={n.icon} fill="none" stroke="#b3a6ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </g>
            </g>
            <text x={n.x - NW / 2 + 56} y={CY - 2} className="fill-fg text-[16px] font-medium">{n.label}</text>
            <text x={n.x - NW / 2 + 56} y={CY + 17} className="fill-muted font-mono text-[11px]">{n.sub}</text>
            <text x={n.x} y={CY + NH / 2 + 26} textAnchor="middle" className="fill-dim font-mono text-[10px]">0{i + 1}</text>
          </motion.g>
        ))}

        <motion.g initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: inView ? 1 : 0, scale: 1 }} style={{ transformOrigin: `${inbox.x}px ${inbox.y}px` }} transition={{ duration: 0.9, delay: 1.6, ease: easeOutExpo }}>
          <circle cx={inbox.x} cy={inbox.y} r="28" fill="#ffb38a" />
          <path d={`M${inbox.x - 10},${inbox.y - 7} h20 v14 h-20z M${inbox.x - 10},${inbox.y - 7} l10,8 l10,-8`} fill="none" stroke="#07070a" strokeWidth="1.8" strokeLinejoin="round" />
          <text x={inbox.x} y={inbox.y + 50} textAnchor="middle" className="fill-dim font-mono text-[10px]">04</text>
        </motion.g>
      </svg>

      {/* email preview */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 24 }}
        transition={{ duration: 1, delay: 1.3, ease: easeOutExpo }}
        className="mx-5 -mt-10 mb-5 rounded-2xl border border-line bg-[#0e0e14]/95 p-4 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] backdrop-blur sm:mx-7 sm:ml-auto sm:mr-7 sm:max-w-md"
      >
        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.12em] text-dim">
          <span>Inbox · just now</span>
          <span className="rounded-full bg-peach/15 px-2 py-0.5 text-peach">New</span>
        </div>
        <p className="mt-2 text-sm font-medium">News Recap for {date || "today"}</p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
          Today is {date || "today"}. Here is the news from the last 24 hours:
        </p>
        <div className="mt-3 space-y-1.5">
          {[92, 78, 85].map((w, i) => (
            <motion.div
              key={i}
              className="h-1.5 rounded-full bg-white/10"
              initial={{ width: 0 }}
              animate={{ width: inView ? `${w}%` : 0 }}
              transition={{ duration: 1.2, delay: 1.7 + i * 0.2, ease: easeOutExpo }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
