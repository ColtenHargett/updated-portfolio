import "server-only";
import { unstable_cache } from "next/cache";
import type { NewsData, NewsStory } from "./types";

// A lightweight, serverless re-run of the News Summary Agent
// (portfolio-projects/AI and Machine Learning/News Summary Agent):
//   Scraper.py  -> same five RSS feeds, 24-hour window, same link filters
//   retrieval   -> TF-IDF similarity groups articles into stories; the stories
//                  covered by the most outlets become the model's context
//   Agent.py    -> Gemini writes the briefing with the project's prompt

const FEEDS: Record<string, string> = {
  NPR: "https://feeds.npr.org/1001/rss.xml",
  BBC: "https://feeds.bbci.co.uk/news/rss.xml",
  "ABC News": "https://abcnews.go.com/abcnews/topstories",
  "CBS News": "https://www.cbsnews.com/latest/rss/main",
  "NBC News": "https://feeds.nbcnews.com/nbcnews/public/news",
};
const REVALIDATE = 21600;
const SKIP = ["video", "watch", "live", "gallery"];

type Article = { source: string; title: string; description: string; link: string; published: number };

const NAMED: Record<string, string> = { ndash: "–", mdash: "—", lsquo: "‘", rsquo: "’", ldquo: "“", rdquo: "”", hellip: "…" };

function decode(s: string) {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
    .replace(/&quot;/g, '"')
    .replace(/&apos;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&(ndash|mdash|lsquo|rsquo|ldquo|rdquo|hellip);/g, (_, n: string) => NAMED[n])
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function tag(item: string, name: string) {
  const m = item.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "i"));
  return m ? decode(m[1]) : "";
}

export function parseRss(xml: string, source: string): Article[] {
  const items = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) ?? [];
  return items.flatMap((item) => {
    const title = tag(item, "title");
    const link = tag(item, "link") || tag(item, "guid");
    const published = Date.parse(tag(item, "pubDate") || tag(item, "dc:date"));
    if (!title || !/^https?:\/\//i.test(link)) return [];
    return [{ source, title, description: tag(item, "description"), link, published }];
  });
}

async function fetchFeed(source: string, url: string): Promise<Article[]> {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; coltenhargett.com portfolio)" },
    signal: AbortSignal.timeout(8000),
    next: { revalidate: REVALIDATE },
  });
  if (!res.ok) throw new Error(`${source}: HTTP ${res.status}`);
  return parseRss(await res.text(), source);
}

// ── retrieval ───────────────────────────────────────────────────────────────
const STOP = new Set(
  "a an and are as at be been but by for from has have he her his how in into is it its of on or over says said she than that the their them they this to up was were what when which who will with would after about more new not no you your we our us one two out over amid".split(
    " ",
  ),
);
const tokens = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w));

export function groupStories(articles: Article[], limit = 6): NewsStory[] {
  const docs = articles.map((a) => tokens(`${a.title} ${a.title} ${a.description}`));
  const df = new Map<string, number>();
  docs.forEach((d) => new Set(d).forEach((w) => df.set(w, (df.get(w) ?? 0) + 1)));
  const vecs = docs.map((d) => {
    const tf = new Map<string, number>();
    d.forEach((w) => tf.set(w, (tf.get(w) ?? 0) + 1));
    const v = new Map<string, number>();
    tf.forEach((n, w) => v.set(w, n * Math.log(1 + docs.length / (df.get(w) ?? 1))));
    const norm = Math.sqrt([...v.values()].reduce((s, x) => s + x * x, 0)) || 1;
    v.forEach((x, w) => v.set(w, x / norm));
    return v;
  });
  const cos = (a: Map<string, number>, b: Map<string, number>) => {
    let s = 0;
    a.forEach((x, w) => (s += x * (b.get(w) ?? 0)));
    return s;
  };

  // Greedy clustering: an article joins the first story it is similar enough to.
  const clusters: number[][] = [];
  articles.forEach((_, i) => {
    const home = clusters.find((c) => cos(vecs[c[0]], vecs[i]) > 0.28);
    if (home) home.push(i);
    else clusters.push([i]);
  });

  return clusters
    .map((c) => ({ c, outlets: new Set(c.map((i) => articles[i].source)).size, newest: Math.max(...c.map((i) => articles[i].published || 0)) }))
    .sort((a, b) => b.outlets - a.outlets || b.c.length - a.c.length || b.newest - a.newest)
    .slice(0, limit)
    .map(({ c }) => {
      const seen = new Set<string>();
      const sources = c
        .map((i) => articles[i])
        .filter((a) => !seen.has(a.source) && seen.add(a.source))
        .map((a) => ({ name: a.source, title: a.title, link: a.link }));
      return { title: sources[0].title, sources };
    });
}

// ── generation ──────────────────────────────────────────────────────────────
function prompt(date: string, context: string) {
  // Adapted from Agent.py, shortened for the web.
  return `You are a helpful assistant. Your task is to write a professional news-style summary of major global and U.S. events from the last 24 hours, using only the information provided in the context.

Your response should:
- Be written like a short, well-edited newspaper article of about 200 words
- Avoid Markdown, bold text, bullet points, or special formatting
- Use three or four short section titles followed by a dash (like "Medicaid Cuts - "), each section on its own line
- Focus only on stories with clear political, economic, or social impact and avoid stories that don't have a clear impact
- Only include quotes if they are relevant and credible
- End the article cleanly, without a "Sources" section, sign-off or resolution

Start with the line: "Today is ${date}. Here is the news from the last 24 hours:"

Context:
${context}`;
}

type Briefing = NonNullable<NewsData["briefing"]>;

export function parseBriefing(text: string): Omit<Briefing, "generatedAt"> | null {
  const lines = text
    .replace(/\*\*|__|#+\s?/g, "")
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (!lines.length) return null;
  const intro = lines[0];
  const sections: { title: string; body: string }[] = [];
  for (const line of lines.slice(1)) {
    const m = line.match(/^(.{2,70}?)\s[-–—]\s+(.+)$/);
    if (m) sections.push({ title: m[1].trim(), body: m[2].trim() });
    else if (/^.{2,70}\s?[-–—]$/.test(line)) sections.push({ title: line.replace(/\s?[-–—]$/, ""), body: "" });
    else if (sections.length) {
      const last = sections[sections.length - 1];
      last.body = `${last.body} ${line}`.trim();
    }
  }
  const complete = sections.filter((s) => s.body);
  if (complete.length) return { intro, sections: complete };
  // Model ignored the section format: keep its paragraphs rather than dropping the briefing.
  const paragraphs = lines.slice(1).filter((l) => l.length > 40);
  return paragraphs.length ? { intro, sections: paragraphs.map((body) => ({ title: "", body })) } : null;
}

const GEMINI = "https://generativelanguage.googleapis.com/v1beta";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Ask the API which Flash models this key can use, newest stable version first. */
export async function discoverFlashModels(key: string): Promise<string[]> {
  const res = await fetch(`${GEMINI}/models?pageSize=200`, { headers: { "x-goog-api-key": key }, signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`list models: HTTP ${res.status}`);
  const json = await res.json();
  const models: { name?: string; supportedGenerationMethods?: string[] }[] = json?.models ?? [];
  return models
    .filter((m) => m.name && m.supportedGenerationMethods?.includes("generateContent"))
    .map((m) => m.name!.replace(/^models\//, ""))
    .filter((n) => /^gemini-[\d.]+-flash/.test(n) && !/image|tts|audio|live|embed|exp|thinking|robotics|computer/.test(n))
    .map((n) => ({ n, v: parseFloat(n.match(/^gemini-([\d.]+)/)![1]), preview: /preview/.test(n), lite: /lite/.test(n) }))
    .sort((a, b) => Number(a.lite) - Number(b.lite) || b.v - a.v || Number(a.preview) - Number(b.preview) || a.n.length - b.n.length)
    .map((m) => m.n);
}

type Attempt = { ok: true; briefing: Omit<Briefing, "generatedAt"> } | { ok: false; status: number; error: string };

async function generate(model: string, key: string, text: string, deadline: number): Promise<Attempt> {
  const res = await fetch(`${GEMINI}/models/${model}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({
      contents: [{ parts: [{ text }] }],
      // Thinking models spend part of this budget reasoning before they answer,
      // so leave plenty of room for the ~200-word briefing itself.
      generationConfig: { temperature: 0.4, maxOutputTokens: 8192 },
    }),
    signal: AbortSignal.timeout(Math.max(1000, Math.min(25000, deadline - Date.now()))),
  });
  if (!res.ok) return { ok: false, status: res.status, error: `HTTP ${res.status} ${(await res.text()).slice(0, 200)}` };
  const json = await res.json();
  const candidate = json?.candidates?.[0];
  const out: string = (candidate?.content?.parts ?? [])
    .filter((p: { thought?: boolean }) => !p.thought)
    .map((p: { text?: string }) => p.text ?? "")
    .join("");
  const briefing = parseBriefing(out);
  return briefing
    ? { ok: true, briefing }
    : { ok: false, status: 200, error: `unusable response (finishReason ${candidate?.finishReason ?? "none"}, ${out.length} chars)` };
}

async function summarize(stories: NewsStory[], articles: Article[]) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  const date = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "America/New_York",
  }).format(new Date());

  const byTitle = new Map(articles.map((a) => [a.title, a]));
  const context = stories
    .map((s) =>
      s.sources
        .map((src) => {
          const a = byTitle.get(src.title);
          return `Source: ${src.name}\nTitle: ${src.title}\n${a?.description ?? ""}`;
        })
        .join("\n\n"),
    )
    .join("\n\n---\n\n");
  const text = prompt(date, context);

  // Model names get retired, so: an explicit GEMINI_MODEL if set, then Google's rolling
  // "latest Flash" alias, then whatever Flash models the API says this key can use.
  // Overload / rate-limit errors (429, 5xx) are retried with a short backoff.
  const deadline = Date.now() + 45000; // stay well inside Next's 60s page-generation limit
  // Flash first for quality; Flash-Lite as backup, since it sees less demand and has its own free-tier quota.
  const queue = [process.env.GEMINI_MODEL, "gemini-flash-latest", "gemini-flash-lite-latest"].filter(Boolean) as string[];
  const tried = new Set<string>();
  const errors: string[] = [];
  let discovered = false;

  while (Date.now() < deadline) {
    let model = queue.find((m) => !tried.has(m));
    if (!model && !discovered) {
      discovered = true;
      try {
        const found = await discoverFlashModels(key);
        queue.push(...found.filter((m) => !m.includes("lite")).slice(0, 2), ...found.filter((m) => m.includes("lite")).slice(0, 1));
      } catch (e) {
        errors.push(e instanceof Error ? e.message : String(e));
      }
      model = queue.find((m) => !tried.has(m));
    }
    if (!model) break;
    tried.add(model);

    for (let attempt = 0; attempt < 2 && Date.now() < deadline; attempt++) {
      try {
        const r = await generate(model, key, text, deadline);
        if (r.ok) {
          console.log(`[news] briefing from ${model}: ${r.briefing.sections.length} sections`);
          return { ...r.briefing, generatedAt: new Date().toISOString() };
        }
        errors.push(`${model}: ${r.error}`);
        // 404 (retired) or 429 (quota used up for this model): retrying won't help, try the next model.
        if (r.status < 500) break;
        if (attempt === 0) await sleep(2500); // brief overload (503): one retry after a pause
      } catch (e) {
        errors.push(`${model}: ${e instanceof Error ? e.message : String(e)}`);
        if (attempt === 0) await sleep(2000);
      }
    }
  }
  throw new Error(`Gemini failed. ${errors.join(" | ")}`);
}

/**
 * The briefing is a morning edition, like the project's daily email. An edition
 * starts at 6am Eastern; a Vercel cron job (vercel.json) calls /api/cron/briefing
 * around 7am to write it. The first successful summary of an edition is
 * cached and reused by every build and refresh until the next morning, so the site makes
 * about one Gemini call a day. Failures throw and aren't cached, so they get retried.
 * (unstable_cache is the documented cache for apps not using Cache Components.)
 */
export const EDITION_START_HOUR_ET = 6;

export function editionId(now = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      hourCycle: "h23",
    })
      .formatToParts(now)
      .map((p) => [p.type, p.value]),
  );
  const day = new Date(Date.UTC(+parts.year, +parts.month - 1, +parts.day));
  if (+parts.hour % 24 < EDITION_START_HOUR_ET) day.setUTCDate(day.getUTCDate() - 1);
  return day.toISOString().slice(0, 10);
}

async function morningBriefing(stories: NewsStory[], articles: Article[]) {
  if (!process.env.GEMINI_API_KEY) return null;
  return unstable_cache(() => summarize(stories, articles), ["news-briefing", editionId()], { revalidate: 172800 })();
}

// A build can render the page more than once; share one run (and one set of
// Gemini calls) per process for a few minutes instead of repeating it.
let recent: { at: number; run: Promise<NewsData | null> } | null = null;

/** Pulls the live feeds and builds the briefing. Returns null if no feed could be read. */
export function getNewsData(): Promise<NewsData | null> {
  if (recent && Date.now() - recent.at < 10 * 60 * 1000) return recent.run;
  const run = collectNews();
  recent = { at: Date.now(), run };
  run.catch(() => (recent = null));
  return run;
}

async function collectNews(): Promise<NewsData | null> {
  const names = Object.keys(FEEDS);
  const settled = await Promise.allSettled(names.map((n) => fetchFeed(n, FEEDS[n])));
  settled.forEach((s, i) => s.status === "rejected" && console.error(`[news] ${names[i]}:`, s.reason));

  const cutoff = Date.now() - 24 * 3600 * 1000;
  const perSource = settled.map((s) =>
    s.status === "fulfilled"
      ? s.value.filter((a) => a.published >= cutoff && !SKIP.some((k) => a.link.toLowerCase().includes(k)))
      : [],
  );
  const articles = perSource.flat();
  if (!articles.length) return null;

  const stories = groupStories(articles);
  let briefing: NewsData["briefing"] = null;
  try {
    briefing = await morningBriefing(stories, articles);
  } catch (e) {
    console.error("[news] summary failed:", e);
  }

  return {
    generatedAt: new Date().toISOString(),
    counts: names.map((name, i) => ({ name, count: perSource[i].length })),
    total: articles.length,
    stories,
    briefing,
  };
}
