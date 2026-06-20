import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid } from "recharts";

function formatTime(ts) {
  const d = new Date(ts);
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

function OhlcTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-panel border border-line rounded-md px-3 py-2 text-xs text-white/90 shadow-lg">
      <div className="text-white/50 mb-1">{formatTime(d.time)}</div>
      <div>O: {d.open?.toFixed(5)}</div>
      <div>H: {d.high?.toFixed(5)}</div>
      <div>L: {d.low?.toFixed(5)}</div>
      <div>C: {d.close?.toFixed(5)}</div>
    </div>
  );
}

export default function PriceChart({ candles, signal }) {
  const data = candles.map((c) => ({ ...c, label: formatTime(c.time) }));

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2733" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: "#6b7686", fontSize: 11 }} minTickGap={40} axisLine={{ stroke: "#1f2733" }} tickLine={false} />
          <YAxis domain={["auto", "auto"]} tick={{ fill: "#6b7686", fontSize: 11 }} axisLine={false} tickLine={false} width={70} />
          <Tooltip content={<OhlcTooltip />} />
          <Line type="monotone" dataKey="close" stroke="#22d3ee" strokeWidth={1.5} dot={false} isAnimationActive={false} />
          {signal && signal.entry && (
            <ReferenceLine y={signal.entry} stroke="#f5c451" strokeDasharray="4 4" label={{ value: "Entry", fill: "#f5c451", fontSize: 10, position: "right" }} />
          )}
          {signal && signal.stop && (
            <ReferenceLine y={signal.stop} stroke="#f87171" strokeDasharray="4 4" label={{ value: "Stop", fill: "#f87171", fontSize: 10, position: "right" }} />
          )}
          {signal && signal.tp1 && (
            <ReferenceLine y={signal.tp1} stroke="#4ade80" strokeDasharray="4 4" label={{ value: "TP1", fill: "#4ade80", fontSize: 10, position: "right" }} />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
