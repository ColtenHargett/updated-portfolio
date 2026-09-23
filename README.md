# coltenhargett.com

Personal portfolio for **Colten Hargett**: Computer Science & Data Science at Loyola University Maryland.

Built with Next.js (App Router), TypeScript, Tailwind CSS v4, Motion and Lenis. The hero background is a custom WebGL shader, and both featured projects have live, interactive visualizations (the stock chart runs a real k-nearest-neighbors search in the browser).

## Develop

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run lint     # type-check
```

## Live project demos

The homepage is static, but Vercel regenerates it in the background every 6 hours (`revalidate` in `app/page.tsx`), so both featured projects run on real data:

- **Stock Market Predictor**: pulls 5 years of daily prices for AAPL, NVDA, AMD and GOOGL (Yahoo Finance, with Stooq as a fallback) and runs a TypeScript port of the project's model (`lib/live/model.ts`): the same 11 features, the same standardized 5-nearest-neighbor predictor, and the same walk-forward backtest against both baselines. The port was checked against the original Python and matches it to floating-point precision.
- **News Summary Agent**: reads the same five RSS feeds over the last 24 hours, groups articles into stories by TF-IDF similarity, and has Gemini write the briefing with the project's prompt (`lib/live/news.ts`).

If a source is down during a refresh, the last good version of the page keeps being served. If data is unavailable at build time, the offline demos are shown instead.

| Variable | Required | Purpose |
| --- | --- | --- |
| `GEMINI_API_KEY` | No | Enables the AI-written news briefing. Without it, the demo lists the most-covered stories instead. |
| `GEMINI_MODEL` | No | Pin a specific Gemini model. By default the site uses `gemini-flash-latest` and, if that fails, the newest Flash model the key has access to. Overload errors are retried. |

Add these in Vercel under **Settings → Environment Variables**, then redeploy.

## Editing content

All copy (projects, journey, principles, stats, links) lives in [`lib/data.ts`](lib/data.ts).
Replace `public/resume.pdf` to update the résumé.

## Deploy to Vercel

1. In Vercel, **Add New → Project** and import `ColtenHargett/updated-portfolio`. The framework is detected as Next.js automatically, so no settings need changing.
2. After the first deploy, open **Settings → Domains** and add your domain (and `www.` if you want it). Vercel shows the DNS records to add at your registrar.
3. Optional: in the project's **Analytics** and **Speed Insights** tabs, click Enable to see visitor counts and real-world load times (the code is already wired in).
4. If the domain is not `coltenhargett.com`, update `site.url` in `lib/data.ts` so canonical URLs, the sitemap and social previews point to the right place.

## Structure

```
app/            layout, page, metadata, OG image, sitemap, robots, 404
components/     Hero, ShaderBackground, About, Work, StockViz, PipelineViz,
                Archive, Journey, Contact, Nav, Cursor, SmoothScroll, ui
lib/data.ts     all site content
```
