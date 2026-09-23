import "server-only";
import { addFeatures, backtest, SimilarityPredictor, type Bar } from "./model";
import type { StockData, TickerResult } from "./types";

// The tickers the project README reports results for.
export const TICKERS = ["AAPL", "NVDA", "AMD", "GOOGL"] as const;
const REVALIDATE = 21600; // 6 hours
const UA = "Mozilla/5.0 (compatible; coltenhargett.com portfolio)";

async function fromYahoo(ticker: string): Promise<Bar[]> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?range=5y&interval=1d&includePrePost=false`;
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/json" },
    signal: AbortSignal.timeout(10000),
    next: { revalidate: REVALIDATE },
  });
  if (!res.ok) throw new Error(`Yahoo ${ticker}: HTTP ${res.status}`);
  const json = await res.json();
  const r = json?.chart?.result?.[0];
  const q = r?.indicators?.quote?.[0];
  const ts: number[] | undefined = r?.timestamp;
  if (!r || !q || !ts?.length) throw new Error(`Yahoo ${ticker}: empty response`);

  const offset: number = r.meta?.gmtoffset ?? 0;
  const bars: Bar[] = [];
  ts.forEach((t, i) => {
    const bar = {
      date: new Date((t + offset) * 1000).toISOString().slice(0, 10),
      open: q.open?.[i],
      high: q.high?.[i],
      low: q.low?.[i],
      close: q.close?.[i],
      volume: q.volume?.[i],
    };
    if ([bar.open, bar.high, bar.low, bar.close, bar.volume].every((v) => typeof v === "number" && v > 0)) bars.push(bar as Bar);
  });

  // While the market is open, the last bar is an unfinished day. Leave it out.
  const sessionEnd: number | undefined = r.meta?.currentTradingPeriod?.regular?.end;
  const sessionStart: number | undefined = r.meta?.currentTradingPeriod?.regular?.start;
  const now = Date.now() / 1000;
  if (sessionStart && sessionEnd && now >= sessionStart && now < sessionEnd) {
    const today = new Date((sessionStart + offset) * 1000).toISOString().slice(0, 10);
    if (bars.at(-1)?.date === today) bars.pop();
  }
  return bars;
}

async function fromStooq(ticker: string): Promise<Bar[]> {
  const url = `https://stooq.com/q/d/l/?s=${ticker.toLowerCase()}.us&i=d`;
  const res = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(10000), next: { revalidate: REVALIDATE } });
  if (!res.ok) throw new Error(`Stooq ${ticker}: HTTP ${res.status}`);
  const lines = (await res.text()).trim().split(/\r?\n/);
  if (!/^Date,Open,High,Low,Close,Volume/i.test(lines[0] ?? "")) throw new Error(`Stooq ${ticker}: unexpected format`);
  return lines
    .slice(1)
    .map((l) => {
      const [date, open, high, low, close, volume] = l.split(",");
      return { date, open: +open, high: +high, low: +low, close: +close, volume: +volume };
    })
    .filter((b) => [b.open, b.high, b.low, b.close, b.volume].every((v) => Number.isFinite(v) && v > 0))
    .slice(-1260); // ~5 years, to match the Yahoo range
}

function downsample(dates: string[], closes: number[], target = 320) {
  const step = Math.max(1, Math.ceil(dates.length / target));
  const d: string[] = [];
  const c: number[] = [];
  for (let i = 0; i < dates.length; i += step) {
    d.push(dates[i]);
    c.push(closes[i]);
  }
  // always keep the most recent session
  if (d.at(-1) !== dates.at(-1)) {
    d.push(dates.at(-1)!);
    c.push(closes.at(-1)!);
  }
  return { dates: d, closes: c.map((v) => +v.toFixed(2)) };
}

async function analyze(ticker: string): Promise<TickerResult> {
  let bars: Bar[];
  let source: TickerResult["source"] = "Yahoo Finance";
  try {
    bars = await fromYahoo(ticker);
  } catch {
    bars = await fromStooq(ticker);
    source = "Stooq";
  }
  if (bars.length < 200) throw new Error(`${ticker}: not enough history`);

  const rows = addFeatures(bars);
  const latest = rows.at(-1)!;
  const train = rows.filter((r) => r.target !== null);

  const model = new SimilarityPredictor(5).fit(train);
  const pred = model.predict(latest);
  const bt = backtest(rows, 5, 100);

  return {
    ticker,
    source,
    asOf: latest.date,
    history: downsample(
      bars.map((b) => b.date),
      bars.map((b) => b.close),
    ),
    lastClose: latest.close,
    forecast: { pct: pred.pct, high: pred.high },
    neighbors: pred.neighbors.map((n) => ({
      date: n.row.date,
      close: n.row.close,
      distance: n.distance,
      weight: n.weight,
      nextHighPct: n.row.target as number,
    })),
    backtest: {
      predictions: bt.results.length,
      modelMape: bt.modelMape,
      closeMape: bt.closeMape,
      highMape: bt.highMape,
      recent: bt.results.slice(-40).map((r) => ({ date: r.date, predicted: +r.predicted.toFixed(2), actual: +r.actual.toFixed(2) })),
    },
  };
}

/** Fetches real prices and runs the predictor for each ticker. Returns null if nothing could be loaded. */
export async function getStockData(): Promise<StockData | null> {
  const settled = await Promise.allSettled(TICKERS.map(analyze));
  const tickers = settled.flatMap((s) => (s.status === "fulfilled" ? [s.value] : []));
  settled.forEach((s, i) => s.status === "rejected" && console.error(`[stocks] ${TICKERS[i]}:`, s.reason));
  return tickers.length ? { generatedAt: new Date().toISOString(), tickers } : null;
}
