/**
 * BinanceAdapter — Skeleton implementation for Binance exchange.
 *
 * Phase 2: All methods contain TODO stubs. Wire up the Binance REST API
 * (https://binance-docs.github.io/apidocs/) and WebSocket streams.
 */

import {
  BaseAdapter,
  Balance,
  OrderRequest,
  Order,
  Candle,
  CandleInterval,
  Ticker,
  SubscriptionOptions,
} from "./BaseAdapter";

export class BinanceAdapter extends BaseAdapter {
  readonly exchangeName = "Binance";

  private apiKey: string;
  private apiSecret: string;
  private baseUrl: string;
  private wsUrl: string;

  constructor(apiKey: string, apiSecret: string, testnet = false) {
    super();
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.baseUrl = testnet
      ? "https://testnet.binance.vision/api/v3"
      : "https://api.binance.com/api/v3";
    this.wsUrl = testnet
      ? "wss://testnet.binance.vision/ws"
      : "wss://stream.binance.com:9443/ws";
  }

  async connect(): Promise<void> {
    // TODO: Validate API key permissions
    // TODO: Open WebSocket connection for user data stream (POST /api/v3/userDataStream)
    // TODO: Start keep-alive interval (PUT every 30 min)
    throw new Error("BinanceAdapter.connect() not implemented");
  }

  async disconnect(): Promise<void> {
    // TODO: Close WebSocket connections
    // TODO: Delete user data stream listen key
    throw new Error("BinanceAdapter.disconnect() not implemented");
  }

  async getBalance(): Promise<Balance[]> {
    // TODO: GET /api/v3/account — parse balances array
    // TODO: Map { asset, free, locked } to Balance type
    throw new Error("BinanceAdapter.getBalance() not implemented");
  }

  async placeOrder(request: OrderRequest): Promise<Order> {
    // TODO: POST /api/v3/order with HMAC SHA256 signature
    // TODO: Map request fields to Binance params (symbol, side, type, quantity, price, timeInForce, newClientOrderId)
    // TODO: Parse response into Order type
    throw new Error("BinanceAdapter.placeOrder() not implemented");
  }

  async cancelOrder(symbol: string, orderId: string): Promise<void> {
    // TODO: DELETE /api/v3/order with symbol + orderId + signature
    throw new Error("BinanceAdapter.cancelOrder() not implemented");
  }

  async getOrder(symbol: string, orderId: string): Promise<Order> {
    // TODO: GET /api/v3/order with symbol + orderId + signature
    throw new Error("BinanceAdapter.getOrder() not implemented");
  }

  async getOpenOrders(symbol?: string): Promise<Order[]> {
    // TODO: GET /api/v3/openOrders (optionally with symbol filter)
    throw new Error("BinanceAdapter.getOpenOrders() not implemented");
  }

  async getCandles(
    symbol: string,
    interval: CandleInterval,
    limit = 500,
    startTime?: number,
    endTime?: number,
  ): Promise<Candle[]> {
    // TODO: GET /api/v3/klines with symbol, interval, limit, startTime, endTime
    // TODO: Parse array response [openTime, open, high, low, close, volume, ...]
    throw new Error("BinanceAdapter.getCandles() not implemented");
  }

  async getTicker(symbol: string): Promise<Ticker> {
    // TODO: GET /api/v3/ticker/24hr with symbol
    // TODO: Map to Ticker type
    throw new Error("BinanceAdapter.getTicker() not implemented");
  }

  async subscribe(
    options: SubscriptionOptions,
    callback: (data: unknown) => void,
  ): Promise<string> {
    // TODO: Open WS stream based on event type:
    //   ticker  -> <symbol>@ticker
    //   candle  -> <symbol>@kline_<interval>
    //   order   -> user data stream
    //   balance -> user data stream
    // TODO: Parse incoming messages and invoke callback
    // TODO: Return unique subscription ID
    throw new Error("BinanceAdapter.subscribe() not implemented");
  }

  async unsubscribe(subscriptionId: string): Promise<void> {
    // TODO: Close the specific WebSocket stream / remove listener
    throw new Error("BinanceAdapter.unsubscribe() not implemented");
  }

  // ── Private Helpers ──────────────────────────────────────────────

  // TODO: private signRequest(params: Record<string, string>): string
  //   - Create HMAC SHA256 signature from query string + apiSecret

  // TODO: private async request<T>(method: string, endpoint: string, params?: Record<string, string>, signed?: boolean): Promise<T>
  //   - Generic HTTP request helper with auth headers
}
