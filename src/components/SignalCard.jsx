import React, { useState } from "react";
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus } from "lucide-react";

function DirIcon({ direction }) {
  if (direction === "BUY") return <TrendingUp size={16} className="text-gain" />;
  if (direction === "SELL") return <TrendingDown size={16} className="text-loss" />;
  return <Minus size={16} className="text-white/40" />;
}

export default function SignalCard({ signal, onOpenTrade }) {
  const [open, setOpen] = useState(false);
  const isActionable = signal.direction === "BUY" || signal.direction === "SELL";

  const dirColor =
    signal.direction === "BUY"
      ? "text-gain border-gain/30 bg-gain/10"
      : signal.direction === "SELL"
      ? "text-loss border-loss/30 bg-loss/10"
      : "text-white/50 border-line bg-white/5";

  return (
    <div className="border border-line rounded-lg bg-panel/60 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <DirIcon direction={signal.direction} />
          <div>
            <div className="text-sm font-medium text-white/90">{signal.strategy}</div>
            <div className="text-xs text-white/40">
              {signal.pair} · {signal.timeframe}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-mono px-2 py-1 rounded border ${dirColor}`}>
            {signal.direction}
          </span>
          <span className="text-xs text-white/40 font-mono">
            {signal.confidence}/{signal.maxConfidence}
          </span>
          {open ? <ChevronUp size={16} className="text-white/40" /> : <ChevronDown size={16} className="text-white/40" />}
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 pt-1 border-t border-line/60 space-y-3">
          {isActionable && (
            <div className="grid grid-cols-4 gap-2 text-xs font-mono">
              <div>
                <div className="text-white/40">Entry</div>
                <div className="text-white/90">{signal.entry.toFixed(5)}</div>
              </div>
              <div>
                <div className="text-white/40">Stop</div>
                <div className="text-loss">{signal.stop.toFixed(5)}</div>
              </div>
              <div>
                <div className="text-white/40">TP1</div>
                <div className="text-gain">{signal.tp1.toFixed(5)}</div>
              </div>
              <div>
                <div className="text-white/40">TP2</div>
                <div className="text-gain">{signal.tp2.toFixed(5)}</div>
              </div>
            </div>
          )}
          {isActionable && (
            <div className="text-xs text-white/50">Risk:Reward ≈ 1:{signal.rr}</div>
          )}

          <div>
            <div className="text-xs text-white/40 mb-1">Confirmations</div>
            <ul className="space-y-1">
              {signal.reasons.map((r, idx) => (
                <li key={idx} className="text-xs text-white/70 flex gap-2">
                  <span className="text-cyan">•</span>
                  {r}
                </li>
              ))}
            </ul>
          </div>

          <div className="text-xs text-amber/80 bg-amber/5 border border-amber/20 rounded px-2 py-1.5">
            {signal.invalidation}
          </div>

          {isActionable && (
            <button
              onClick={() => onOpenTrade(signal)}
              className="w-full text-xs font-medium bg-cyan/10 hover:bg-cyan/20 text-cyan border border-cyan/30 rounded py-2 transition-colors"
            >
              Open Paper Trade
            </button>
          )}
        </div>
      )}
    </div>
  );
}
