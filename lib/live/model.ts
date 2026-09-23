// A faithful TypeScript port of the Stock Market Predictor
// (portfolio-projects/AI and Machine Learning/Stock Market Predictor):
//   features.py         -> addFeatures
//   similarity_model.py -> SimilarityPredictor (StandardScaler + NearestNeighbors, k=5)
//   backtest.py         -> backtest (walk-forward, min_train_size=100)

export type Bar = { date: string; open: number; high: number; low: number; close: number; volume: number };

export const FEATURE_COLUMNS = [
  "daily_return",
  "high_close_spread",
  "low_close_spread",
  "volume_change",
  "ma_gap_5",
  "ma_gap_10",
  "ma_gap_20",
  "volatility_5",
  "volatility_10",
  "return_5",
  "return_10",
] as const;

export type Row = {
  date: string;
  close: number;
  high: number;
  x: number[]; // FEATURE_COLUMNS order
  target: number | null; // (next high - close) / close; null for the latest day
};

const mean = (a: number[]) => a.reduce((s, v) => s + v, 0) / a.length;
// pandas .std() is the sample standard deviation (ddof=1)
const sampleStd = (a: number[]) => {
  const m = mean(a);
  return Math.sqrt(a.reduce((s, v) => s + (v - m) ** 2, 0) / (a.length - 1));
};

export function addFeatures(bars: Bar[]): Row[] {
  const c = bars.map((b) => b.close);
  const pct = c.map((v, i) => (i === 0 ? NaN : v / c[i - 1] - 1));
  const rows: Row[] = [];

  for (let t = 0; t < bars.length; t++) {
    const b = bars[t];
    if (t < 19) continue; // ma_20 needs 20 closes (index 19 is the first full window)
    const ma = (n: number) => mean(c.slice(t - n + 1, t + 1));
    const ma5 = ma(5);
    const ma10 = ma(10);
    const ma20 = ma(20);
    const x = [
      (b.close - b.open) / b.open,
      (b.high - b.close) / b.close,
      (b.close - b.low) / b.close,
      b.volume / bars[t - 1].volume - 1,
      (b.close - ma5) / ma5,
      (b.close - ma10) / ma10,
      (b.close - ma20) / ma20,
      sampleStd(pct.slice(t - 4, t + 1)),
      sampleStd(pct.slice(t - 9, t + 1)),
      c[t] / c[t - 5] - 1,
      c[t] / c[t - 10] - 1,
    ];
    if (!x.every(Number.isFinite)) continue;
    const next = bars[t + 1];
    rows.push({ date: b.date, close: b.close, high: b.high, x, target: next ? (next.high - b.close) / b.close : null });
  }
  return rows;
}

export class SimilarityPredictor {
  private mu: number[] = [];
  private sigma: number[] = [];
  private scaled: number[][] = [];
  private train: Row[] = [];

  constructor(private k = 5) {}

  fit(train: Row[]) {
    this.train = train;
    const d = FEATURE_COLUMNS.length;
    // StandardScaler: population std (ddof=0); zero-variance columns keep scale 1
    this.mu = Array.from({ length: d }, (_, j) => mean(train.map((r) => r.x[j])));
    this.sigma = Array.from({ length: d }, (_, j) => {
      const s = Math.sqrt(mean(train.map((r) => (r.x[j] - this.mu[j]) ** 2)));
      return s > 0 ? s : 1;
    });
    this.scaled = train.map((r) => this.scale(r.x));
    return this;
  }

  scale(x: number[]) {
    return x.map((v, j) => (v - this.mu[j]) / this.sigma[j]);
  }

  predict(row: Row) {
    const q = this.scale(row.x);
    // k smallest euclidean distances
    const best: { i: number; d: number }[] = [];
    for (let i = 0; i < this.scaled.length; i++) {
      const s = this.scaled[i];
      let d = 0;
      for (let j = 0; j < q.length; j++) d += (s[j] - q[j]) ** 2;
      d = Math.sqrt(d);
      if (best.length < this.k || d < best[best.length - 1].d) {
        best.push({ i, d });
        best.sort((a, b) => a.d - b.d);
        if (best.length > this.k) best.pop();
      }
    }
    const weights = best.map((b) => 1 / (b.d + 1e-6));
    const wsum = weights.reduce((s, w) => s + w, 0);
    const pct = best.reduce((s, b, n) => s + (this.train[b.i].target as number) * weights[n], 0) / wsum;
    return {
      pct,
      high: row.close * (1 + pct),
      query: q,
      neighbors: best.map((b, n) => ({
        row: this.train[b.i],
        scaled: this.scaled[b.i],
        distance: b.d,
        weight: weights[n] / wsum,
      })),
    };
  }
}

/** Walk-forward backtest, identical to backtest.py: each prediction only sees earlier days. */
export function backtest(rows: Row[], k = 5, minTrain = 100) {
  const featured = rows.filter((r) => r.target !== null); // dropna() removes the latest day
  const out: { date: string; predicted: number; actual: number; close: number; todayHigh: number }[] = [];
  for (let i = minTrain; i < featured.length - 1; i++) {
    const p = new SimilarityPredictor(k).fit(featured.slice(0, i)).predict(featured[i]);
    out.push({
      date: featured[i + 1].date,
      predicted: p.high,
      actual: featured[i + 1].high,
      close: featured[i].close,
      todayHigh: featured[i].high,
    });
  }
  const mape = (f: (r: (typeof out)[number]) => number) => mean(out.map((r) => Math.abs(f(r) - r.actual) / r.actual));
  return {
    results: out,
    modelMape: mape((r) => r.predicted),
    closeMape: mape((r) => r.close),
    highMape: mape((r) => r.todayHigh),
  };
}
