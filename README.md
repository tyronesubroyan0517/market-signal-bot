# Pulsewatch — Forex Signal Terminal

A signal-generation and paper-trading dashboard for forex pairs, built as a
single-page Vite + React app. **No live trading, no broker connection, no real
money** — it runs entirely on simulated mock market data so it deploys cleanly
to Vercel with zero backend and zero API keys.

## What it does

- Generates deterministic mock OHLCV candles for 9 major pairs across 4 timeframes
- Runs three independent technical strategies, each requiring 3+ confirmations
  before producing a BUY/SELL signal (otherwise it shows WAIT):
  - **Trend Pullback** — EMA 50/200 trend filter + EMA 9/21 pullback + RSI
  - **Breakout Confirmation** — swing high/low breaks + ATR + candle close confirmation
  - **Range Reversal** — Bollinger Bands + RSI extremes in low-volatility regimes
- Every signal includes entry, stop loss, take-profit levels, risk/reward,
  plain-language reasons, and invalidation conditions
- A simulated paper-trading account (starts at $10,000) with 1%-of-balance
  position sizing
- A trade journal logging closed paper trades and win rate

## Run locally

```bash
npm install
npm run dev
```

## Deploy to Vercel

Push to GitHub and import the repo in Vercel. No environment variables or
backend services are required — `vercel.json` is already configured for a
static Vite build (`npm run build`, output directory `dist`).

## Connecting a real data provider later

`src/lib/marketData.js` is the only file that knows about candle data. Replace
`generateCandles()` with a fetch to a real provider (OANDA, Twelve Data,
Polygon, etc.), keeping the same return shape:
`{ index, open, high, low, close, volume }[]`. Everything downstream
(indicators, signal engine, charts) will keep working unchanged.

## Known limitations

- Data is simulated, not live — this is a demo/prototype, not a trading system
- No authentication, persistence, or multi-user support (state lives in memory
  and resets on refresh)
- No live order execution exists anywhere in this codebase by design
- Position sizing uses a simplified flat pip-value assumption, not real
  per-pair pip values or account currency conversion

## Risk disclosure

This tool does not provide financial advice and does not guarantee any
trading outcome. Retail forex trading carries a high level of risk, and most
retail accounts lose money. Always treat any signal here as a starting point
for your own research, not a recommendation.
