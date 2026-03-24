/**
 * CoinbaseAdapter — Skeleton implementation for Coinbase Advanced Trade API.
 *
 * Phase 2: All methods contain TODO stubs. Wire up the Coinbase Advanced Trade
 * REST API (https://docs.cdp.coinbase.com/advanced-trade/docs/welcome)
 * and WebSocket feed.
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

export class CoinbaseAdapter extends BaseAdapter {
  readonly exchangeName = "Coinbase";

  private apiKey: string;
  private apiSecret: string;
  private baseUrl = "https://api.coinbase.com/api/v3/brokerage";
  private wsUrl = "wss://advanced-trade-ws.coinbase.com";

  constructor(apiKey: string, apiSecret: string) {
    super();
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
  }

  async connect(): Promise<void> {
    // TODO: Validate API credentials with a test request
    // TODO: Open WebSocket connection to wsUrl
    // TODO: Send subscribe message for user channel
    throw new Error("CoinbaseAdapter.connect() not implemented");
  }

  async disconnect(): Promise<void> {
    // TODO: Send unsubscribe message
    // TODO: Close WebSocket connection
    throw new Error("CoinbaseAdapter.disconnect() not implemented");
  }

  async getBalance(): Promise<Balance[]> {
    // TODO: GET /accounts — list all accounts
    // TODO: Map available_balance and hold to Balance type
    throw new Error("CoinbaseAdapter.getBalance() not implemented");
  }

  async placeOrder(request: OrderRequest): Promise<Order> {
    // TODO: POST /orders with JWT/API key auth
    // TODO: Map OrderRequest to Coinbase order config (market_market_ioc, limit_limit_gtc, etc.)
    // TODO: Parse response into Order type
    throw new Error("CoinbaseAdapter.placeOrder() not implemented");
  }

  async cancelOrder(_symbol: string, orderId: string): Promise<void> {
    // TODO: POST /orders/batch_cancel with order_ids: [orderId]
    throw new Error("CoinbaseAdapter.cancelOrder() not implemented");
  }

  async getOrder(_symbol: string, orderId: string): Promise<Order> {
    // TODO: GET /orders/historical/{orderId}
    throw new Error("CoinbaseAdapter.getOrder() not implemented");
  }

  async getOpenOrders(symbol?: string): Promise<Order[]> {
    // TODO: GET /orders/historical/batch with status=OPEN, optionally product_id filter
    throw new Error("CoinbaseAdapter.getOpenOrders() not implemented");
  }

  async getCandles(
    symbol: string,
    interval: CandleInterval,
    limit = 300,
    startTime?: number,
    endTime?: number,
  ): Promise<Candle[]> {
    // TODO: GET /products/{product_id}/candles with granularity mapping
    // TODO: Map CandleInterval to Coinbase granularity (ONE_MINUTE, FIVE_MINUTE, etc.)
    // TODO: Parse response candles array
    throw new Error("CoinbaseAdapter.getCandles() not implemented");
  }

  async getTicker(symbol: string): Promise<Ticker> {
    // TODO: GET /products/{product_id}/ticker
    // TODO: Combine with GET /products/{product_id} for 24h stats
    throw new Error("CoinbaseAdapter.getTicker() not implemented");
  }

  async subscribe(
    options: SubscriptionOptions,
    callback: (data: unknown) => void,
  ): Promise<string> {
    // TODO: Send WS subscribe message with appropriate channel:
    //   ticker  -> "ticker" channel
    //   candle  -> "candles" channel
    //   order   -> "user" channel
    //   balance -> "user" channel
    // TODO: Parse incoming messages and invoke callback
    // TODO: Return unique subscription ID
    throw new Error("CoinbaseAdapter.subscribe() not implemented");
  }

  async unsubscribe(subscriptionId: string): Promise<void> {
    // TODO: Send WS unsubscribe message / remove listener
    throw new Error("CoinbaseAdapter.unsubscribe() not implemented");
  }

  // ── Private Helpers ──────────────────────────────────────────────

  // TODO: private generateJWT(): string
  //   - Create JWT token for API authentication (ES256 or HMAC based on key type)

  // TODO: private async request<T>(method: string, endpoint: string, body?: unknown): Promise<T>
  //   - Generic HTTP request helper with JWT auth headers
}
