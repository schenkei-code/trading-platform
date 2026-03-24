/**
 * BaseAdapter — Abstract interface for all exchange adapters.
 *
 * Every exchange (Binance, Coinbase, etc.) must implement this interface
 * to provide a unified API across the trading platform.
 */

// ─── Types ───────────────────────────────────────────────────────────

export interface Balance {
  asset: string;
  free: number;
  locked: number;
  total: number;
}

export interface OrderRequest {
  symbol: string;
  side: "BUY" | "SELL";
  type: "MARKET" | "LIMIT" | "STOP_LIMIT" | "STOP_MARKET";
  quantity: number;
  price?: number;
  stopPrice?: number;
  timeInForce?: "GTC" | "IOC" | "FOK";
  clientOrderId?: string;
}

export interface Order {
  orderId: string;
  clientOrderId?: string;
  symbol: string;
  side: "BUY" | "SELL";
  type: string;
  status: "NEW" | "PARTIALLY_FILLED" | "FILLED" | "CANCELED" | "REJECTED" | "EXPIRED";
  quantity: number;
  filledQuantity: number;
  price: number;
  avgFillPrice?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Candle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Ticker {
  symbol: string;
  lastPrice: number;
  bidPrice: number;
  askPrice: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  change24h: number;
  changePercent24h: number;
  timestamp: number;
}

export type CandleInterval =
  | "1m" | "3m" | "5m" | "15m" | "30m"
  | "1h" | "2h" | "4h" | "6h" | "8h" | "12h"
  | "1d" | "3d" | "1w" | "1M";

export type SubscriptionEvent = "ticker" | "candle" | "order" | "balance";

export interface SubscriptionOptions {
  symbol: string;
  event: SubscriptionEvent;
  interval?: CandleInterval;
}

// ─── Abstract Base ───────────────────────────────────────────────────

export abstract class BaseAdapter {
  /** Human-readable exchange name (e.g. "Binance", "Coinbase") */
  abstract readonly exchangeName: string;

  /** Initialize the adapter (authenticate, open WS connections, etc.) */
  abstract connect(): Promise<void>;

  /** Gracefully shut down connections */
  abstract disconnect(): Promise<void>;

  // ── Account ──────────────────────────────────────────────────────

  /** Get all asset balances for the connected account */
  abstract getBalance(): Promise<Balance[]>;

  // ── Orders ───────────────────────────────────────────────────────

  /** Place a new order and return the created order */
  abstract placeOrder(request: OrderRequest): Promise<Order>;

  /** Cancel an existing order by its exchange-side order ID */
  abstract cancelOrder(symbol: string, orderId: string): Promise<void>;

  /** Get the current status of an order */
  abstract getOrder(symbol: string, orderId: string): Promise<Order>;

  /** List open (unfilled) orders, optionally filtered by symbol */
  abstract getOpenOrders(symbol?: string): Promise<Order[]>;

  // ── Market Data ──────────────────────────────────────────────────

  /** Fetch historical candlestick/kline data */
  abstract getCandles(
    symbol: string,
    interval: CandleInterval,
    limit?: number,
    startTime?: number,
    endTime?: number,
  ): Promise<Candle[]>;

  /** Get the latest ticker for a symbol */
  abstract getTicker(symbol: string): Promise<Ticker>;

  // ── Streaming ────────────────────────────────────────────────────

  /** Subscribe to real-time updates via WebSocket */
  abstract subscribe(
    options: SubscriptionOptions,
    callback: (data: unknown) => void,
  ): Promise<string>; // returns subscription ID

  /** Unsubscribe from a previously created subscription */
  abstract unsubscribe(subscriptionId: string): Promise<void>;
}
