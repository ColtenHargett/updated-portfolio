"use client";

import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import { useState, type PointerEvent } from "react";
import { archive, repoLink, site, type ArchiveItem } from "@/lib/data";
import { ArrowUpRight, Reveal, SectionLabel, SplitReveal, easeOutExpo } from "./ui";

const filters = ["All", "AI / ML", "Python", "Java"] as const;
type Filter = (typeof filters)[number];

const langColor: Record<ArchiveItem["category"], string> = {
  "AI / ML": "bg-iris",
  Python: "bg-peach",
  Java: "bg-mint",
};

export default function Archive() {
  const [filter, setFilter] = useState<Filter>("All");
  const [hovered, setHovered] = useState<ArchiveItem | null>(null);
  const items = filter === "All" ? archive : archive.filter((a) => a.category === filter);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 300, damping: 30, mass: 0.5 });
  const y = useSpring(my, { stiffness: 300, damping: 30, mass: 0.5 });
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(e.clientX - r.left);
    my.set(e.clientY - r.top);
  };

  return (
    <section id="archive" className="relative pb-28 pt-12 sm:pb-36 sm:pt-16">
      <div className="wrap">
        <SectionLabel index="03">Archive</SectionLabel>
        <div className="mt-8 flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <h2 className="text-[clamp(2.8rem,8vw,7rem)] font-medium leading-[0.92] tracking-[-0.05em]">
            <SplitReveal text="Everything" className="block" />
            <SplitReveal text="I've built." className="serif block italic tracking-[-0.02em] text-fg/70" delay={0.12} />
          </h2>

          <Reveal>
            <div role="group" aria-label="Filter projects" className="glass inline-flex rounded-full p-1">
              {filters.map((f) => {
                const count = f === "All" ? archive.length : archive.filter((a) => a.category === f).length;
                return (
                  <button
                    key={f}
                    type="button"
                    aria-pressed={filter === f}
                    onClick={() => setFilter(f)}
                    className={`relative rounded-full px-3.5 py-2.5 text-sm transition-colors sm:px-4 sm:py-2 ${filter === f ? "text-ink" : "text-muted hover:text-fg"}`}
                  >
                    {filter === f && <motion.span layoutId="archive-pill" className="absolute inset-0 rounded-full bg-fg" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
                    <span className="relative">
                      {f} <sup className="font-mono text-[9px] opacity-60">{count}</sup>
                    </span>
                  </button>
                );
              })}
            </div>
          </Reveal>
        </div>

        <div className="relative mt-14" onPointerMove={onMove} onPointerLeave={() => setHovered(null)}>
          <div className="hidden grid-cols-12 gap-4 border-b border-line pb-3 font-mono text-[11px] uppercase tracking-[0.14em] text-dim md:grid">
            <span className="col-span-1">No.</span>
            <span className="col-span-4">Project</span>
            <span className="col-span-4">Description</span>
            <span className="col-span-2">Stack</span>
            <span className="col-span-1 text-right">Code</span>
          </div>

          <motion.ul layout className="relative">
            <AnimatePresence mode="popLayout" initial={false}>
              {items.map((a) => {
                const n = archive.indexOf(a) + 1;
                return (
                  <motion.li
                    key={a.title}
                    layout
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
                    transition={{ duration: 0.6, ease: easeOutExpo }}
                  >
                    <a
                      href={repoLink(a.path)}
                      target="_blank"
                      rel="noreferrer"
                      onPointerEnter={() => setHovered(a)}
                      className="group relative grid grid-cols-12 items-center gap-x-4 gap-y-1 overflow-hidden border-b border-line py-5 md:py-6"
                    >
                      <span className="absolute inset-0 origin-bottom scale-y-0 bg-white/[0.03] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-y-100" />
                      <span className="relative col-span-2 font-mono text-xs text-dim md:col-span-1">{String(n).padStart(2, "0")}</span>
                      <span className="relative col-span-9 flex items-center gap-3 text-xl font-medium tracking-tight transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-2 sm:text-2xl md:col-span-4">
                        <span className={`h-2 w-2 shrink-0 rounded-full ${langColor[a.category]}`} />
                        {a.title}
                      </span>
                      <span className="relative col-span-1 flex justify-end md:hidden">
                        <ArrowUpRight className="h-5 w-5 text-muted" />
                      </span>
                      <span className="relative col-span-10 col-start-3 text-sm leading-relaxed text-muted md:col-span-4 md:col-start-auto">{a.description}</span>
                      <span className="relative hidden flex-wrap gap-1.5 md:col-span-2 md:flex">
                        {a.tags.map((t) => (
                          <span key={t} className="rounded-full border border-line px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-fg/60">
                            {t}
                          </span>
                        ))}
                      </span>
                      <span className="relative hidden justify-end md:col-span-1 md:flex">
                        <span className="grid h-9 w-9 place-items-center rounded-full border border-line transition-all duration-500 group-hover:rotate-45 group-hover:border-fg group-hover:bg-fg group-hover:text-ink">
                          <ArrowUpRight className="h-4 w-4" />
                        </span>
                      </span>
                    </a>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </motion.ul>

          {/* cursor-following terminal preview (desktop) */}
          <motion.div
            aria-hidden
            style={{ x, y }}
            className="pointer-events-none absolute left-0 top-0 z-10 hidden lg:block"
            animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.85 }}
            transition={{ duration: 0.3, ease: easeOutExpo }}
          >
            <div className="ml-6 mt-6 w-72 overflow-hidden rounded-xl border border-line-strong bg-[#0d0d13]/95 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] backdrop-blur">
              <div className="flex items-center gap-1.5 border-b border-line px-3 py-2">
                <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
                <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
                <span className="h-2 w-2 rounded-full bg-[#28c840]" />
                <span className="ml-2 font-mono text-[10px] text-dim">portfolio-projects</span>
              </div>
              <div className="space-y-1 p-3 font-mono text-[11px] leading-relaxed">
                <p className="text-dim">
                  <span className="text-mint">~</span> $ open
                </p>
                <p className="break-all text-fg/85">{hovered?.path}</p>
                <p className="text-iris">
                  → {hovered?.category} · {hovered?.tags.join(", ")}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        <Reveal className="mt-10 flex justify-center">
          <a
            href={site.projectsRepo}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex min-h-11 items-center gap-2 text-sm text-muted transition-colors hover:text-fg"
          >
            Browse the full repository on GitHub
            <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:rotate-45" />
          </a>
        </Reveal>
      </div>
    </section>
  );
}
