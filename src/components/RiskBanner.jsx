import React from "react";
import { ShieldAlert } from "lucide-react";

export default function RiskBanner() {
  return (
    <div className="flex items-start gap-3 bg-amber/5 border border-amber/25 rounded-lg px-4 py-3">
      <ShieldAlert size={18} className="text-amber shrink-0 mt-0.5" />
      <p className="text-xs leading-relaxed text-white/70">
        <span className="text-amber font-medium">Pulsewatch is a signal &amp; analysis assistant, not a guaranteed-profit bot.</span>{" "}
        All trades on this dashboard are simulated paper trades using mock market data — no real money, no broker
        connection, no live execution. Forex trading carries substantial risk of loss. Nothing here is financial
        advice. Past or simulated performance does not guarantee future results.
      </p>
    </div>
  );
}
