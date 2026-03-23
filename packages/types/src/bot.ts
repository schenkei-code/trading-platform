// ─── Bot Types ────────────────────────────────────────────────────

import { OrderSide, OrderType } from "./exchange";

export type BotStatus = "IDLE" | "RUNNING" | "PAUSED" | "STOPPED" | "ERROR";
export type BotMode = "LIVE" | "PAPER" | "BACKTEST";

export interface BotConfig {
  id: string;
  name: string;
  exchange: string;
  symbol: string;
  strategyId: string;
  mode: BotMode;

  // Risk management
  maxPositionSize: number;
  maxDrawdownPercent: number;
  stopLossPercent: number | null;
  takeProfitPercent: number | null;
  trailingStopPercent: number | null;

  // Execution
  leverage: number;
  marginType: "CROSS" | "ISOLATED";
  orderType: OrderType;

  // Limits
  maxDailyTrades: number;
  maxOpenPositions: number;
  cooldownSeconds: number;

  // Strategy parameters (flexible key-value)
  parameters: Record<string, number | string | boolean>;
}

export interface BotState {
  botId: string;
  status: BotStatus;
  mode: BotMode;
  currentPnl: number;
  currentPnlPercent: number;
  totalTrades: number;
  winRate: number;
  openPositions: number;
  lastSignalAt: Date | null;
  lastTradeAt: Date | null;
  uptimeSeconds: number;
  errors: BotError[];
  startedAt: Date | null;
  stoppedAt: Date | null;
}

export interface BotError {
  code: string;
  message: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface Signal {
  id: string;
  botId: string;
  strategyId: string;
  symbol: string;
  side: OrderSide;
  type: "ENTRY" | "EXIT" | "SCALE_IN" | "SCALE_OUT";
  price: number;
  quantity: number;
  confidence: number; // 0-1
  reason: string;
  indicators: Record<string, number>;
  timestamp: Date;
}

export interface BotPerformance {
  botId: string;
  period: "1h" | "24h" | "7d" | "30d" | "all";
  totalPnl: number;
  totalPnlPercent: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
  maxDrawdown: number;
  sharpeRatio: number;
  sortino: number;
}
