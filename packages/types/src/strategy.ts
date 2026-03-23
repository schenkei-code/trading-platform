// ─── Strategy Types ───────────────────────────────────────────────

export type StrategyType = "TECHNICAL" | "GRID" | "DCA" | "ARBITRAGE" | "MARKET_MAKING" | "CUSTOM";

export interface StrategyParameter {
  name: string;
  type: "number" | "string" | "boolean" | "select";
  label: string;
  description: string;
  default: number | string | boolean;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
  required: boolean;
}

export interface StrategyDefinition {
  id: string;
  name: string;
  description: string;
  type: StrategyType;
  version: string;
  author: string;
  parameters: StrategyParameter[];
  supportedExchanges: string[];
  supportedIntervals: string[];
  minCandles: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface BacktestConfig {
  strategyId: string;
  symbol: string;
  exchange: string;
  interval: string;
  startDate: Date;
  endDate: Date;
  initialCapital: number;
  leverage: number;
  makerFee: number;
  takerFee: number;
  slippage: number;
  parameters: Record<string, number | string | boolean>;
}

export interface BacktestTrade {
  entryTime: Date;
  exitTime: Date;
  side: "LONG" | "SHORT";
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  pnl: number;
  pnlPercent: number;
  fees: number;
  reason: string;
  duration: number; // seconds
}

export interface BacktestResult {
  id: string;
  config: BacktestConfig;
  trades: BacktestTrade[];

  // Summary
  totalReturn: number;
  totalReturnPercent: number;
  annualizedReturn: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  profitFactor: number;
  avgWin: number;
  avgLoss: number;
  largestWin: number;
  largestLoss: number;
  avgHoldTime: number; // seconds
  maxConsecutiveWins: number;
  maxConsecutiveLosses: number;

  // Risk metrics
  maxDrawdown: number;
  maxDrawdownPercent: number;
  sharpeRatio: number;
  sortinoRatio: number;
  calmarRatio: number;

  // Equity curve
  equityCurve: { timestamp: Date; equity: number }[];

  completedAt: Date;
  durationMs: number;
}
