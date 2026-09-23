import { marquee } from "@/lib/data";

function Row({ items, reverse = false }: { items: string[]; reverse?: boolean }) {
  const content = [...items, ...items];
  return (
    <div className="mask-fade-x flex overflow-hidden">
      <div
        className="flex shrink-0 animate-marquee items-center gap-10 pr-10 hover:[animation-play-state:paused]"
        style={reverse ? { animationDirection: "reverse", animationDuration: "55s" } : undefined}
      >
        {content.map((t, i) => (
          <span key={i} className="flex items-center gap-10 whitespace-nowrap">
            <span className={i % 2 ? "serif text-4xl italic text-fg/60 sm:text-6xl" : "text-4xl font-medium tracking-tight text-fg/90 sm:text-6xl"}>{t}</span>
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-iris/70" aria-hidden>
              <path fill="currentColor" d="M12 0c.5 6.6 5.4 11.5 12 12-6.6.5-11.5 5.4-12 12-.5-6.6-5.4-11.5-12-12C6.6 11.5 11.5 6.6 12 0z" />
            </svg>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Marquee() {
  const half = Math.ceil(marquee.length / 2);
  return (
    <section aria-label="Skills and tools" className="relative space-y-6 border-y border-line bg-ink-2/60 py-10">
      <Row items={marquee.slice(0, half)} />
      <Row items={marquee.slice(half)} reverse />
    </section>
  );
}
