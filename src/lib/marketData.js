// Deterministic mock OHLCV market data generator + technical indicators.
// No external API keys required.

export const PAIRS = [
  "EUR/USD", "GBP/USD", "USD/JPY", "USD/CHF", "AUD/USD",
  "USD/CAD", "NZD/USD", "EUR/GBP", "EUR/JPY",
];

export const TIMEFRAMES = ["M15", "H1", "H4", "D1"];

const TF_MINUTES = { M15: 15, H1: 60, H4: 240, D1: 1440 };

const BASE_PRICE = {
  "EUR/USD": 1.085, "GBP/USD": 1.265, "USD/JPY": 151.2, "USD/CHF": 0.885,
  "AUD/USD": 0.655, "USD/CAD": 1.365, "NZD/USD": 0.605, "EUR/GBP": 0.858,
  "EUR/JPY": 164.0,
};

function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFromString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return h;
}

export function generateCandles(pair, timeframe, count = 200) {
  const seed = seedFromString(`${pair}-${timeframe}`);
  const rand = mulberry32(seed);
  const minutes = TF_MINUTES[timeframe] || 60;
  const base = BASE_PRICE[pair] || 1.0;
  const pip = pair.includes("JPY") ? 0.01 : 0.0001;
  const vol = base * 0.0009;

  let price = base;
  const now = Date.now();
  const candles = [];

  for (let i = count - 1; i >= 0; i--) {
    const drift = (rand() - 0.5) * vol;
    const open = price;
    const close = Math.max(0.0001, open + drift);
    const high = Math.max(open, close) + rand() * vol * 0.6;
    const low = Math.min(open, close) - rand() * vol * 0.6;
    const volume = Math.round(500 + rand() * 4500);
    const time = now - i * minutes * 60 * 1000;

    candles.push({ time, open, high, low, close, volume });
    price = close;
  }

  return { candles, pip };
}

export function ema(values, period) {
  const k = 2 / (period + 1);
  const out = [];
  let prev;
  values.forEach((v, i) => {
    if (i === 0) {
      prev = v;
    } else {
      prev = v * k + prev * (1 - k);
    }
    out.push(prev);
  });
  return out;
}

export function rsi(values, period = 14) {
  const out = new Array(values.length).fill(50);
  let gains = 0;
  let losses = 0;
  for (let i = 1; i < values.length; i++) {
    const diff = values[i] - values[i - 1];
    const gain = Math.max(diff, 0);
    const loss = Math.max(-diff, 0);
    if (i <= period) {
      gains += gain;
      losses += loss;
      if (i === period) {
        const avgGain = gains / period;
        const avgLoss = losses / period;
        out[i] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
      }
    } else {
      const prevAvgGain = out._avgGain ?? gains / period;
      const prevAvgLoss = out._avgLoss ?? losses / period;
      const avgGain = (prevAvgGain * (period - 1) + gain) / period;
      const avgLoss = (prevAvgLoss * (period - 1) + loss) / period;
      out._avgGain = avgGain;
      out._avgLoss = avgLoss;
      out[i] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
    }
  }
  return out;
}

export function atr(candles, period = 14) {
  const trs = candles.map((c, i) => {
    if (i === 0) return c.high - c.low;
    const prevClose = candles[i - 1].close;
    return Math.max(
      c.high - c.low,
      Math.abs(c.high - prevClose),
      Math.abs(c.low - prevClose)
    );
  });
  const out = [];
  let prev;
  trs.forEach((tr, i) => {
    if (i === 0) {
      prev = tr;
    } else if (i < period) {
      prev = (prev * i + tr) / (i + 1);
    } else {
      prev = (prev * (period - 1) + tr) / period;
    }
    out.push(prev);
  });
  return out;
}

export function bollinger(values, period = 20, mult = 2) {
  const upper = [];
  const lower = [];
  const mid = [];
  for (let i = 0; i < values.length; i++) {
    if (i < period - 1) {
      upper.push(values[i]);
      lower.push(values[i]);
      mid.push(values[i]);
      continue;
    }
    const slice = values.slice(i - period + 1, i + 1);
    const mean = slice.reduce((a, b) => a + b, 0) / period;
    const variance = slice.reduce((a, b) => a + (b - mean) ** 2, 0) / period;
    const sd = Math.sqrt(variance);
    mid.push(mean);
    upper.push(mean + mult * sd);
    lower.push(mean - mult * sd);
  }
  return { upper, mid, lower };
}

export function swingPoints(candles, lookback = 5) {
  const highs = [];
  const lows = [];
  for (let i = lookback; i < candles.length - lookback; i++) {
    const window = candles.slice(i - lookback, i + lookback + 1);
    const isHigh = window.every((c) => c.high <= candles[i].high);
    const isLow = window.every((c) => c.low >= candles[i].low);
    if (isHigh) highs.push({ index: i, price: candles[i].high, time: candles[i].time });
    if (isLow) lows.push({ index: i, price: candles[i].low, time: candles[i].time });
  }
  return { highs, lows };
}

export function buildAnalysis(pair, timeframe) {
  const { candles, pip } = generateCandles(pair, timeframe);
  const closes = candles.map((c) => c.close);
  const ema20 = ema(closes, 20);
  const ema50 = ema(closes, 50);
  const rsi14 = rsi(closes, 14);
  const atr14 = atr(candles, 14);
  const bb = bollinger(closes, 20, 2);
  const { highs, lows } = swingPoints(candles, 5);

  return { pair, timeframe, candles, pip, ema20, ema50, rsi14, atr14, bb, highs, lows };
}
