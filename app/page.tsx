import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import About from "@/components/About";
import Work from "@/components/Work";
import Archive from "@/components/Archive";
import Journey from "@/components/Journey";
import Contact from "@/components/Contact";
import { getStockData } from "@/lib/live/stocks";
import { getNewsData } from "@/lib/live/news";
import { PHASE_PRODUCTION_BUILD } from "next/constants";

// The page is static, but Vercel regenerates it in the background every 6 hours
// so the project demos run on fresh market data and the latest news.
export const revalidate = 21600;

async function safe<T>(job: () => Promise<T>): Promise<T | null> {
  try {
    return await job();
  } catch (e) {
    console.error(e);
    return null;
  }
}

export default async function Home() {
  const [stocks, news] = await Promise.all([safe(getStockData), safe(getNewsData)]);

  // During a background refresh, a failed data source throws so Vercel keeps serving
  // the last good page. At build time we fall back to the offline demos instead.
  if (process.env.NEXT_PHASE !== PHASE_PRODUCTION_BUILD && (!stocks || !news)) {
    throw new Error(`Live data unavailable (stocks: ${!!stocks}, news: ${!!news}); keeping the previous page`);
  }

  return (
    <>
      <Nav />
      <main id="main">
        <Hero />
        <Marquee />
        <About />
        <Work stocks={stocks} news={news} />
        <Archive />
        <Journey />
        <Contact />
      </main>
    </>
  );
}
