// Shapes shared between the server-side data jobs and the client visualizations.

export type Neighbor = {
  date: string;
  close: number;
  distance: number;
  weight: number;
  nextHighPct: number;
};

export type BacktestPoint = { date: string; predicted: number; actual: number };

export type TickerResult = {
  ticker: string;
  source: "Yahoo Finance" | "Stooq";
  asOf: string; // date of the latest completed session, YYYY-MM-DD
  history: { dates: string[]; closes: number[] }; // downsampled for charting
  lastClose: number;
  forecast: { pct: number; high: number };
  neighbors: Neighbor[];
  backtest: {
    predictions: number;
    modelMape: number;
    closeMape: number;
    highMape: number;
    recent: BacktestPoint[];
  };
};

export type StockData = { generatedAt: string; tickers: TickerResult[] };

export type NewsStory = {
  title: string;
  sources: { name: string; title: string; link: string }[];
};

export type NewsData = {
  generatedAt: string;
  counts: { name: string; count: number }[];
  total: number;
  stories: NewsStory[];
  briefing: { intro: string; sections: { title: string; body: string }[] } | null;
};
