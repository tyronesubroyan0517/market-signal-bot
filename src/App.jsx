import React, { useMemo, useState, useEffect } from "react";
import { PAIRS, TIMEFRAMES, buildAnalysis } from "./lib/marketData.js";
import { generateAllSignals } from "./lib/signalEngine.js";
import { createAccount, openPaperTrade, closePaperTrade, dailyLossUsedPct } from "./lib/risk.js";
import PriceChart from "./components/PriceChart.jsx";
import SignalCard from "./components/SignalCard.jsx";
import RiskBanner from "./components/RiskBanner.jsx";
import { Activity, BookOpen, Wallet } from "lucide-react";

export default function App() {
  const [pair, setPair] = useState(PAIRS[0]);
  const [timeframe, setTimeframe] = useState("H1");
  const [tab, setTab] = useState("signals");
  const [account, setAccount] = useState(() => createAccount(10000));
  const [activeSignal, setActiveSignal] = useState(null);

  const analysis = useMemo(() => buildAnalysis(pair, timeframe), [pair, timeframe]);
  const signals = useMemo(() => generateAllSignals(analysis), [analysis]);

  useEffect(() => {
    const actionable = signals.find((s) => s.direction !== "WAIT");
    setActiveSignal(actionable || null);
  }, [signals]);

  function handleOpenTrade(signal) {
    const { account: next, error } = openPaperTrade(account, signal);
    if (error) {
      alert(error);
      return;
    }
    setAccount(next);
  }

  function handleCloseTrade(tradeId, exitPrice) {
    const { account: next, error } = closePaperTrade(account, tradeId, exitPrice);
    if (error) {
      alert(error);
      return;
    }
    setAccount(next);
  }

  const lossUsed = dailyLossUsedPct(account);
  const lastPrice = analysis.candles[analysis.candles.length - 1].close;

  return (
    <div className="min-h-screen bg-ink text-white/90">
      <header className="border-b border-line px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity size={20} className="text-cyan" />
          <h1 className="text-lg font-semibold tracking-tight">Pulsewatch</h1>
          <span className="text-xs text-white/30 font-mono ml-1">forex signal terminal</span>
        </div>
        <div className="text-xs text-white/40 font-mono hidden sm:block">paper trading · mock data</div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <RiskBanner />

        <div className="flex gap-2 overflow-x-auto pb-1">
          {PAIRS.map((p) => (
            <button
              key={p}
              onClick={() => setPair(p)}
              className={`shrink-0 text-xs font-mono px-3 py-1.5 rounded-md border transition-colors ${
                p === pair
                  ? "bg-cyan/15 border-cyan/40 text-cyan"
                  : "border-line text-white/50 hover:text-white/80 hover:border-white/20"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="border border-line rounded-lg bg-panel/40 p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm font-medium">{pair}</div>
                  <div className="text-xs text-white/40 font-mono">{lastPrice.toFixed(5)}</div>
                </div>
                <div className="flex gap-1">
                  {TIMEFRAMES.map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setTimeframe(tf)}
                      className={`text-xs font-mono px-2.5 py-1 rounded border transition-colors ${
                        tf === timeframe
                          ? "bg-amber/15 border-amber/40 text-amber"
                          : "border-line text-white/40 hover:text-white/70"
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>
              <PriceChart candles={analysis.candles} signal={activeSignal} />
            </div>

            <div className="flex gap-1 border-b border-line">
              {[
                { key: "signals", label: "Signals", icon: Activity },
                { key: "account", label: "Paper Account", icon: Wallet },
                { key: "journal", label: "Trade Journal", icon: BookOpen },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 border-b-2 -mb-px transition-colors ${
                    tab === t.key
                      ? "border-cyan text-cyan"
                      : "border-transparent text-white/40 hover:text-white/70"
                  }`}
                >
                  <t.icon size={14} />
                  {t.label}
                </button>
              ))}
            </div>

            {tab === "signals" && (
              <div className="space-y-3">
                {signals.map((s) => (
                  <SignalCard key={s.id} signal={s} onOpenTrade={handleOpenTrade} />
                ))}
              </div>
            )}

            {tab === "account" && (
              <div className="space-y-3">
                {account.openTrades.length === 0 && (
                  <p className="text-xs text-white/40">No open paper trades.</p>
                )}
                {account.openTrades.map((t) => (
                  <div key={t.id} className="border border-line rounded-lg bg-panel/60 p-3 flex items-center justify-between">
                    <div>
                      <div className="text-sm">
                        {t.pair} · <span className={t.direction === "BUY" ? "text-gain" : "text-loss"}>{t.direction}</span>
                      </div>
                      <div className="text-xs text-white/40 font-mono">
                        Entry {t.entry.toFixed(5)} · {t.units} units
                      </div>
                    </div>
                    <button
                      onClick={() => handleCloseTrade(t.id, lastPrice)}
                      className="text-xs px-3 py-1.5 rounded border border-line text-white/60 hover:text-white hover:border-white/30"
                    >
                      Close @ Market
                    </button>
                  </div>
                ))}
              </div>
            )}

            {tab === "journal" && (
              <div className="space-y-2">
                {account.closedTrades.length === 0 && (
                  <p className="text-xs text-white/40">No closed trades yet.</p>
                )}
                {[...account.closedTrades].reverse().map((t) => (
                  <div key={t.id} className="border border-line rounded-lg bg-panel/40 px-3 py-2 flex items-center justify-between text-xs">
                    <span>
                      {t.pair} · {t.direction} · {t.strategy}
                    </span>
                    <span className={t.pnl >= 0 ? "text-gain font-mono" : "text-loss font-mono"}>
                      {t.pnl >= 0 ? "+" : ""}
                      {t.pnl.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="border border-line rounded-lg bg-panel/40 p-4 space-y-3">
              <div className="text-xs text-white/40 uppercase tracking-wide">Paper Account</div>
              <div>
                <div className="text-2xl font-mono">${account.balance.toFixed(2)}</div>
                <div className="text-xs text-white/40">
                  {account.balance >= account.startingBalance ? (
                    <span className="text-gain">
                      +{(account.balance - account.startingBalance).toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-loss">
                      {(account.balance - account.startingBalance).toFixed(2)}
                    </span>
                  )}{" "}
                  since start
                </div>
              </div>
              <div className="text-xs text-white/40 space-y-1 pt-2 border-t border-line">
                <div className="flex justify-between">
                  <span>Open trades</span>
                  <span className="text-white/70">{account.openTrades.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Closed trades</span>
                  <span className="text-white/70">{account.closedTrades.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Risk / trade</span>
                  <span className="text-white/70">{account.riskPerTradePct}%</span>
                </div>
              </div>
            </div>

            <div className="border border-line rounded-lg bg-panel/40 p-4 space-y-2">
              <div className="text-xs text-white/40 uppercase tracking-wide">Session Limits</div>
              <div className="text-xs text-white/60">
                Daily loss used: <span className="font-mono">{lossUsed.toFixed(1)}%</span> / {account.dailyLossLimitPct}%
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full ${lossUsed >= account.dailyLossLimitPct ? "bg-loss" : "bg-amber"}`}
                  style={{ width: `${Math.min(100, (lossUsed / account.dailyLossLimitPct) * 100)}%` }}
                />
              </div>
              {lossUsed >= account.dailyLossLimitPct && (
                <p className="text-xs text-loss">Daily loss limit reached — new trades blocked.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
