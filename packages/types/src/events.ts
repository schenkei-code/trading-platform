// ─── Redis Pub/Sub Event Types ────────────────────────────────────

export type EventChannel =
  | "bot:status"
  | "bot:signal"
  | "bot:trade"
  | "bot:error"
  | "market:ticker"
  | "market:candle"
  | "market:orderbook"
  | "user:notification"
  | "system:health";

export interface BaseEvent {
  id: string;
  channel: EventChannel;
  timestamp: Date;
  source: string;
}

export interface BotStatusEvent extends BaseEvent {
  channel: "bot:status";
  payload: {
    botId: string;
    userId: string;
    previousStatus: string;
    newStatus: string;
    reason?: string;
  };
}

export interface BotSignalEvent extends BaseEvent {
  channel: "bot:signal";
  payload: {
    botId: string;
    signalId: string;
    symbol: string;
    side: "BUY" | "SELL";
    type: "ENTRY" | "EXIT" | "SCALE_IN" | "SCALE_OUT";
    price: number;
    confidence: number;
  };
}

export interface BotTradeEvent extends BaseEvent {
  channel: "bot:trade";
  payload: {
    botId: string;
    userId: string;
    tradeId: string;
    symbol: string;
    side: "BUY" | "SELL";
    price: number;
    quantity: number;
    pnl: number | null;
    fee: number;
  };
}

export interface BotErrorEvent extends BaseEvent {
  channel: "bot:error";
  payload: {
    botId: string;
    userId: string;
    code: string;
    message: string;
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  };
}

export interface MarketTickerEvent extends BaseEvent {
  channel: "market:ticker";
  payload: {
    exchange: string;
    symbol: string;
    bid: number;
    ask: number;
    last: number;
    volume24h: number;
  };
}

export interface MarketCandleEvent extends BaseEvent {
  channel: "market:candle";
  payload: {
    exchange: string;
    symbol: string;
    interval: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    isClosed: boolean;
  };
}

export interface UserNotificationEvent extends BaseEvent {
  channel: "user:notification";
  payload: {
    userId: string;
    type: "INFO" | "WARNING" | "ERROR" | "SUCCESS";
    title: string;
    message: string;
    actionUrl?: string;
  };
}

export interface SystemHealthEvent extends BaseEvent {
  channel: "system:health";
  payload: {
    service: string;
    status: "UP" | "DOWN" | "DEGRADED";
    latencyMs: number;
    metadata?: Record<string, unknown>;
  };
}

export type TradingEvent =
  | BotStatusEvent
  | BotSignalEvent
  | BotTradeEvent
  | BotErrorEvent
  | MarketTickerEvent
  | MarketCandleEvent
  | UserNotificationEvent
  | SystemHealthEvent;
