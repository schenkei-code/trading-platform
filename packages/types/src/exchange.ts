// ─── Exchange Types ───────────────────────────────────────────────

export type OrderSide = "BUY" | "SELL";
export type OrderType = "MARKET" | "LIMIT" | "STOP_LOSS" | "STOP_LIMIT" | "TAKE_PROFIT";
export type OrderStatus = "NEW" | "PARTIALLY_FILLED" | "FILLED" | "CANCELED" | "REJECTED" | "EXPIRED";
export type TimeInForce = "GTC" | "IOC" | "FOK" | "GTD";

export interface Order {
  id: string;
  exchangeOrderId: string;
  exchange: string;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  status: OrderStatus;
  price: number | null;
  stopPrice: number | null;
  quantity: number;
  filledQuantity: number;
  averagePrice: number | null;
  timeInForce: TimeInForce;
  reduceOnly: boolean;
  postOnly: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Ticker {
  exchange: string;
  symbol: string;
  bid: number;
  ask: number;
  last: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  change24h: number;
  changePercent24h: number;
  timestamp: Date;
}

export interface Candle {
  exchange: string;
  symbol: string;
  interval: string;
  openTime: Date;
  closeTime: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  quoteVolume: number;
  trades: number;
  isClosed: boolean;
}

export interface Balance {
  asset: string;
  free: number;
  locked: number;
  total: number;
  usdValue: number | null;
}

export interface ExchangeCredentials {
  exchange: string;
  apiKey: string;
  apiSecret: string;
  passphrase?: string;
  isTestnet: boolean;
}

export interface OrderRequest {
  symbol: string;
  side: OrderSide;
  type: OrderType;
  quantity: number;
  price?: number;
  stopPrice?: number;
  timeInForce?: TimeInForce;
  reduceOnly?: boolean;
  postOnly?: boolean;
  clientOrderId?: string;
}
