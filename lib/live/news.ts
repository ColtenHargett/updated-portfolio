import "server-only";
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

export function parseBriefing(text: string): NonNullable<NewsData["briefing"]> | null {
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

async function summarize(stories: NewsStory[], articles: Article[]) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  // Try the configured model first, then Google's rolling "latest Flash" alias,
  // so a retired model name doesn't silently drop the briefing.
  const models = [...new Set([process.env.GEMINI_MODEL || "gemini-2.5-flash", "gemini-flash-latest"])];
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

  const errors: string[] = [];
  for (const model of models) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt(date, context) }] }],
          // Thinking models spend part of this budget reasoning before they answer,
          // so leave plenty of room for the ~200-word briefing itself.
          generationConfig: { temperature: 0.4, maxOutputTokens: 8192 },
        }),
        signal: AbortSignal.timeout(30000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} ${(await res.text()).slice(0, 300)}`);
      const json = await res.json();
      const candidate = json?.candidates?.[0];
      const text: string = (candidate?.content?.parts ?? [])
        .filter((p: { thought?: boolean }) => !p.thought)
        .map((p: { text?: string }) => p.text ?? "")
        .join("");
      const briefing = parseBriefing(text);
      if (briefing) {
        console.log(`[news] briefing from ${model}: ${briefing.sections.length} sections`);
        return briefing;
      }
      throw new Error(`unusable response (finishReason ${candidate?.finishReason ?? "none"}, ${text.length} chars)`);
    } catch (e) {
      errors.push(`${model}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  throw new Error(`Gemini failed. ${errors.join(" | ")}`);
}

/** Pulls the live feeds and builds the briefing. Returns null if no feed could be read. */
export async function getNewsData(): Promise<NewsData | null> {
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
    briefing = await summarize(stories, articles);
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
