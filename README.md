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
