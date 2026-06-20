// Position sizing + paper trading account simulation.
// No real money, no broker connection — purely local state.

export function createAccount(startingBalance = 10000) {
  return {
    balance: startingBalance,
    equity: startingBalance,
    startingBalance,
    openTrades: [],
    closedTrades: [],
    riskPerTradePct: 1,
    dailyLossLimitPct: 5,
    sessionStart: Date.now(),
  };
}

export function positionSize(account, entry, stop, riskPct = account.riskPerTradePct) {
  const riskAmount = account.balance * (riskPct / 100);
  const perUnitRisk = Math.abs(entry - stop);
  if (perUnitRisk <= 0) return 0;
  const units = riskAmount / perUnitRisk;
  return Number(units.toFixed(2));
}

export function dailyLossUsedPct(account) {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const lossToday = account.closedTrades
    .filter((t) => t.closedAt >= todayStart.getTime() && t.pnl < 0)
    .reduce((s, t) => s + Math.abs(t.pnl), 0);
  return (lossToday / account.startingBalance) * 100;
}

export function canOpenTrade(account) {
  return dailyLossUsedPct(account) < account.dailyLossLimitPct;
}

export function openPaperTrade(account, signal) {
  if (!canOpenTrade(account)) {
    return { account, error: "Daily loss limit reached — new trades blocked for today." };
  }
  const units = positionSize(account, signal.entry, signal.stop);
  const trade = {
    id: `${signal.id}-${Date.now()}`,
    pair: signal.pair,
    direction: signal.direction,
    entry: signal.entry,
    stop: signal.stop,
    tp1: signal.tp1,
    tp2: signal.tp2,
    units,
    openedAt: Date.now(),
    strategy: signal.strategy,
  };
  const newAccount = { ...account, openTrades: [...account.openTrades, trade] };
  return { account: newAccount, error: null };
}

export function closePaperTrade(account, tradeId, exitPrice) {
  const trade = account.openTrades.find((t) => t.id === tradeId);
  if (!trade) return { account, error: "Trade not found." };

  const direction = trade.direction === "BUY" ? 1 : -1;
  const pnl = (exitPrice - trade.entry) * direction * trade.units;

  const closedTrade = { ...trade, exitPrice, closedAt: Date.now(), pnl };
  const newAccount = {
    ...account,
    balance: account.balance + pnl,
    equity: account.balance + pnl,
    openTrades: account.openTrades.filter((t) => t.id !== tradeId),
    closedTrades: [...account.closedTrades, closedTrade],
  };
  return { account: newAccount, error: null };
}
