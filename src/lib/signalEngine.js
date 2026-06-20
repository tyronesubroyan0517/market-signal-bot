// Signal generation engine — three strategies, each requiring 3+ confirmations
// before firing BUY/SELL. Otherwise returns WAIT. Educational/paper-trading only.

function lastIdx(arr) {
  return arr.length - 1;
}

function buildLevels(entry, direction, atrVal, pip) {
  const stopDist = Math.max(atrVal * 1.2, pip * 8);
  const stop = direction === "BUY" ? entry - stopDist : entry + stopDist;
  const tp1 = direction === "BUY" ? entry + stopDist * 1.5 : entry - stopDist * 1.5;
  const tp2 = direction === "BUY" ? entry + stopDist * 2.5 : entry - stopDist * 2.5;
  const rr = Math.abs(tp1 - entry) / Math.abs(entry - stop);
  return { entry, stop, tp1, tp2, rr: Number(rr.toFixed(2)) };
}

function trendPullback(a) {
  const i = lastIdx(a.candles);
  const price = a.candles[i].close;
  const reasons = [];
  let score = 0;
  let direction = null;

  const trendUp = a.ema20[i] > a.ema50[i];
  const trendDown = a.ema20[i] < a.ema50[i];

  if (trendUp) {
    direction = "BUY";
    score++;
    reasons.push("EMA20 above EMA50 (uptrend)");
    if (price <= a.ema20[i] * 1.0015) {
      score++;
      reasons.push("Price pulled back near EMA20");
    }
    if (a.rsi14[i] > 40 && a.rsi14[i] < 60) {
      score++;
      reasons.push("RSI resetting in neutral zone (40-60)");
    }
    if (a.candles[i].close > a.candles[i].open) {
      score++;
      reasons.push("Bullish rejection candle off pullback");
    }
  } else if (trendDown) {
    direction = "SELL";
    score++;
    reasons.push("EMA20 below EMA50 (downtrend)");
    if (price >= a.ema20[i] * 0.9985) {
      score++;
      reasons.push("Price pulled back near EMA20");
    }
    if (a.rsi14[i] > 40 && a.rsi14[i] < 60) {
      score++;
      reasons.push("RSI resetting in neutral zone (40-60)");
    }
    if (a.candles[i].close < a.candles[i].open) {
      score++;
      reasons.push("Bearish rejection candle off pullback");
    }
  }

  return { name: "Trend Pullback", direction, score, reasons, price, i };
}

function breakoutConfirmation(a) {
  const i = lastIdx(a.candles);
  const price = a.candles[i].close;
  const reasons = [];
  let score = 0;
  let direction = null;

  const recentHighs = a.highs.filter((h) => h.index < i).slice(-3);
  const recentLows = a.lows.filter((l) => l.index < i).slice(-3);
  const lastHigh = recentHighs[recentHighs.length - 1];
  const lastLow = recentLows[recentLows.length - 1];

  const avgVol =
    a.candles.slice(Math.max(0, i - 20), i).reduce((s, c) => s + c.volume, 0) /
    Math.max(1, Math.min(20, i));

  if (lastHigh && price > lastHigh.price) {
    direction = "BUY";
    score++;
    reasons.push("Price broke above recent swing high");
    if (a.candles[i].volume > avgVol * 1.2) {
      score++;
      reasons.push("Breakout candle on above-average volume");
    }
    if (a.rsi14[i] > 55) {
      score++;
      reasons.push("RSI confirms bullish momentum (>55)");
    }
    if (a.candles[i].close > a.bb.mid[i]) {
      score++;
      reasons.push("Price trading above Bollinger midline");
    }
  } else if (lastLow && price < lastLow.price) {
    direction = "SELL";
    score++;
    reasons.push("Price broke below recent swing low");
    if (a.candles[i].volume > avgVol * 1.2) {
      score++;
      reasons.push("Breakout candle on above-average volume");
    }
    if (a.rsi14[i] < 45) {
      score++;
      reasons.push("RSI confirms bearish momentum (<45)");
    }
    if (a.candles[i].close < a.bb.mid[i]) {
      score++;
      reasons.push("Price trading below Bollinger midline");
    }
  }

  return { name: "Breakout Confirmation", direction, score, reasons, price, i };
}

function rangeReversal(a) {
  const i = lastIdx(a.candles);
  const price = a.candles[i].close;
  const reasons = [];
  let score = 0;
  let direction = null;

  const nearUpper = price >= a.bb.upper[i] * 0.999;
  const nearLower = price <= a.bb.lower[i] * 1.001;

  if (nearLower) {
    direction = "BUY";
    score++;
    reasons.push("Price testing lower Bollinger Band");
    if (a.rsi14[i] < 35) {
      score++;
      reasons.push("RSI oversold (<35)");
    }
    if (a.candles[i].close > a.candles[i].open) {
      score++;
      reasons.push("Bullish reversal candle at range edge");
    }
    if (Math.abs(a.ema20[i] - a.ema50[i]) / a.ema50[i] < 0.002) {
      score++;
      reasons.push("EMAs flat — ranging market confirmed");
    }
  } else if (nearUpper) {
    direction = "SELL";
    score++;
    reasons.push("Price testing upper Bollinger Band");
    if (a.rsi14[i] > 65) {
      score++;
      reasons.push("RSI overbought (>65)");
    }
    if (a.candles[i].close < a.candles[i].open) {
      score++;
      reasons.push("Bearish reversal candle at range edge");
    }
    if (Math.abs(a.ema20[i] - a.ema50[i]) / a.ema50[i] < 0.002) {
      score++;
      reasons.push("EMAs flat — ranging market confirmed");
    }
  }

  return { name: "Range Reversal", direction, score, reasons, price, i };
}

const MIN_CONFIRMATIONS = 3;

export function generateSignal(analysis, strategyFn) {
  const result = strategyFn(analysis);
  const { direction, score, reasons, price, i } = result;

  if (!direction || score < MIN_CONFIRMATIONS) {
    return {
      id: `${analysis.pair}-${analysis.timeframe}-${result.name}-${analysis.candles[i].time}`,
      strategy: result.name,
      pair: analysis.pair,
      timeframe: analysis.timeframe,
      direction: "WAIT",
      confidence: score,
      maxConfidence: 4,
      reasons,
      price,
      time: analysis.candles[i].time,
      invalidation: "Insufficient confirmations for entry — monitoring only.",
    };
  }

  const levels = buildLevels(price, direction, analysis.atr14[i], analysis.pip);
  const invalidation =
    direction === "BUY"
      ? `Invalidated if price closes below ${levels.stop.toFixed(5)}`
      : `Invalidated if price closes above ${levels.stop.toFixed(5)}`;

  return {
    id: `${analysis.pair}-${analysis.timeframe}-${result.name}-${analysis.candles[i].time}`,
    strategy: result.name,
    pair: analysis.pair,
    timeframe: analysis.timeframe,
    direction,
    confidence: score,
    maxConfidence: 4,
    reasons,
    price,
    time: analysis.candles[i].time,
    ...levels,
    invalidation,
  };
}

export const STRATEGIES = [
  { key: "trendPullback", label: "Trend Pullback", fn: trendPullback },
  { key: "breakoutConfirmation", label: "Breakout Confirmation", fn: breakoutConfirmation },
  { key: "rangeReversal", label: "Range Reversal", fn: rangeReversal },
];

export function generateAllSignals(analysis) {
  return STRATEGIES.map((s) => generateSignal(analysis, s.fn));
}
