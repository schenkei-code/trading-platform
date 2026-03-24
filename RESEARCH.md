# Trading Platform — Exchange API Research

> Erstellt: 2026-03-23 | Researcher Agent
> Umfang: Exchange APIs, Copy Trading, Bot-Strategien, Regulierung, Payments, WebSocket

---

## Inhaltsverzeichnis

1. [Coinbase Advanced Trade API](#1-coinbase-advanced-trade-api)
2. [Binance API](#2-binance-api)
3. [CCXT Library](#3-ccxt-library-unified-crypto-exchange-api)
4. [Copy Trading Implementation](#4-copy-trading-implementation)
5. [Bot-Strategien](#5-bot-strategien)
6. [Regulatorische Aspekte EU/Oesterreich](#6-regulatorische-aspekte-euoesterreich)
7. [Stripe Payment Integration](#7-stripe-payment-integration)
8. [WebSocket Best Practices](#8-websocket-best-practices)

---

## 1. Coinbase Advanced Trade API

### 1.1 Uebersicht

Die Coinbase Advanced Trade API (v3) ersetzt die alte Coinbase Pro API. Sie bietet REST- und WebSocket-Schnittstellen fuer Order Management, Portfolio-Verwaltung, Produkt-Abfragen und Gebuehrenstrukturen.

- **Base URL:** `https://api.coinbase.com/api/v3/brokerage/`
- **WebSocket URL:** `wss://advanced-trade-ws.coinbase.com`
- **SDKs:** Python, TypeScript, Go, Java (offiziell)

### 1.2 Authentication (JWT / ES256)

Coinbase verwendet **JWT (JSON Web Token)** mit dem **ES256** Algorithmus (ECDSA mit P-256 Kurve). Jeder API-Call braucht einen frisch generierten JWT im `Authorization: Bearer` Header.

```javascript
// Node.js — JWT Generation fuer Coinbase Advanced Trade API
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

function generateCoinbaseJWT(keyName, keySecret, method, path) {
  const uri = `${method} api.coinbase.com${path}`;

  const token = jwt.sign(
    {
      iss: 'coinbase-cloud',
      nbf: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 120, // 2 Minuten gueltig
      sub: keyName,
      uri,
    },
    keySecret, // EC Private Key im PEM-Format
    {
      algorithm: 'ES256',
      header: {
        kid: keyName,
        nonce: crypto.randomBytes(16).toString('hex'),
      },
    }
  );

  return token;
}

// Verwendung:
const keyName = 'organizations/{org_id}/apiKeys/{key_id}';
const keySecret = `-----BEGIN EC PRIVATE KEY-----
YOUR_PRIVATE_KEY_HERE
-----END EC PRIVATE KEY-----`;

const token = generateCoinbaseJWT(keyName, keySecret, 'GET', '/api/v3/brokerage/accounts');

// Request ausfuehren
const response = await fetch('https://api.coinbase.com/api/v3/brokerage/accounts', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

**Wichtig:**
- JWT laeuft nach **2 Minuten** ab
- Fuer jeden WebSocket-Message muss ein **neuer JWT** generiert werden
- Key Secret ist ein mehrzeiliger PEM-Key — Newlines muessen erhalten bleiben

### 1.3 REST API Endpoints

| Endpoint | Methode | Beschreibung |
|---|---|---|
| `/api/v3/brokerage/accounts` | GET | Alle Accounts auflisten |
| `/api/v3/brokerage/accounts/{id}` | GET | Account-Details |
| `/api/v3/brokerage/orders` | POST | Order erstellen |
| `/api/v3/brokerage/orders/{id}` | GET | Order-Status |
| `/api/v3/brokerage/orders/batch_cancel` | POST | Batch Order Cancel |
| `/api/v3/brokerage/products` | GET | Alle Trading-Paare |
| `/api/v3/brokerage/products/{id}` | GET | Produkt-Details |
| `/api/v3/brokerage/products/{id}/candles` | GET | OHLCV Candlestick Daten |
| `/api/v3/brokerage/products/{id}/ticker` | GET | Ticker (Best Bid/Ask) |
| `/api/v3/brokerage/orders/historical/fills` | GET | Trade History / Fills |
| `/api/v3/brokerage/transaction_summary` | GET | Gebuehren-Zusammenfassung |

**Order erstellen — Beispiel:**

```javascript
async function createOrder(side, productId, size, price) {
  const path = '/api/v3/brokerage/orders';
  const token = generateCoinbaseJWT(keyName, keySecret, 'POST', path);

  const orderBody = {
    client_order_id: crypto.randomUUID(),
    product_id: productId,       // z.B. "BTC-USD"
    side: side,                  // "BUY" oder "SELL"
    order_configuration: {
      limit_limit_gtc: {
        base_size: size,         // z.B. "0.001"
        limit_price: price,      // z.B. "50000.00"
      }
    }
  };

  const response = await fetch(`https://api.coinbase.com${path}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderBody),
  });

  return response.json();
}
```

### 1.4 Rate Limits

| Typ | Limit | Details |
|---|---|---|
| Public Endpoints | Throttled by IP | Pro IP-Adresse |
| Private Endpoints | Throttled by Profile ID | Pro authentifiziertem User |
| Ueberschreitung | HTTP 429 | `Too Many Requests` |
| Fills Endpoint | Custom (niedrigerer) Rate Limit | Speziell limitiert |

**Best Practice:** Rate Limiting mit Exponential Backoff implementieren. Bei 429 Response den `Retry-After` Header auswerten.

### 1.5 WebSocket Feeds

**Verfuegbare Channels:**

| Channel | Beschreibung | Auth erforderlich |
|---|---|---|
| `level2` | Orderbook Updates (L2) | Nein |
| `ticker` | Echtzeit Preis-Updates bei jedem Match | Nein |
| `ticker_batch` | Gebatchte Ticker-Updates (weniger Bandbreite) | Nein |
| `market_trades` | Ausgefuehrte Trades | Nein |
| `candles` | OHLCV Candlestick Updates | Nein |
| `status` | Produkt-Status (online/offline) | Nein |
| `user` | Eigene Orders und Fills | Ja (JWT) |
| `heartbeats` | Connection Keep-Alive | Nein |

```javascript
// WebSocket Subscription Beispiel
const WebSocket = require('ws');

const ws = new WebSocket('wss://advanced-trade-ws.coinbase.com');

ws.on('open', () => {
  // MUSS innerhalb 5 Sekunden subscriben, sonst Disconnect!
  const subscribeMsg = {
    type: 'subscribe',
    product_ids: ['BTC-USD', 'ETH-USD'],
    channel: 'ticker',
    jwt: generateCoinbaseJWT(keyName, keySecret, 'GET', '/ws'),
  };
  ws.send(JSON.stringify(subscribeMsg));

  // Heartbeat Channel subscriben (verhindert Timeout)
  const heartbeatMsg = {
    type: 'subscribe',
    product_ids: ['BTC-USD'],
    channel: 'heartbeats',
    jwt: generateCoinbaseJWT(keyName, keySecret, 'GET', '/ws'),
  };
  ws.send(JSON.stringify(heartbeatMsg));
});

ws.on('message', (data) => {
  const msg = JSON.parse(data);
  if (msg.channel === 'ticker') {
    console.log(`${msg.events[0].tickers[0].product_id}: ${msg.events[0].tickers[0].price}`);
  }
});
```

**Wichtige Regeln:**
- Subscribe innerhalb **5 Sekunden** nach Verbindung, sonst Disconnect
- **Jeder Subscribe-Message braucht einen eigenen JWT** (da JWT nach 2 Min ablaeuft)
- Separate Subscribe-Message **pro Channel**
- `heartbeats` Channel subscriben um Connection offen zu halten

---

## 2. Binance API

### 2.1 Uebersicht

Binance bietet separate APIs fuer Spot, USDM-Futures, COIN-M Futures, und Options.

| API | Base URL | WebSocket |
|---|---|---|
| Spot | `https://api.binance.com` | `wss://stream.binance.com:9443/ws` |
| USDM Futures | `https://fapi.binance.com` | `wss://fstream.binance.com/ws` |
| COIN-M Futures | `https://dapi.binance.com` | `wss://dstream.binance.com/ws` |

### 2.2 Authentication (HMAC-SHA256)

Binance verwendet **HMAC-SHA256** Signaturen. Der `totalParams` (Query String + Request Body) wird mit dem Secret Key signiert.

```javascript
const crypto = require('crypto');

class BinanceAPI {
  constructor(apiKey, secretKey) {
    this.apiKey = apiKey;
    this.secretKey = secretKey;
    this.baseUrl = 'https://api.binance.com';
  }

  sign(queryString) {
    return crypto
      .createHmac('sha256', this.secretKey)
      .update(queryString)
      .digest('hex');
  }

  async signedRequest(method, endpoint, params = {}) {
    params.timestamp = Date.now();
    params.recvWindow = 5000; // Max Zeitabweichung in ms

    const queryString = new URLSearchParams(params).toString();
    const signature = this.sign(queryString);
    const url = `${this.baseUrl}${endpoint}?${queryString}&signature=${signature}`;

    const response = await fetch(url, {
      method,
      headers: {
        'X-MBX-APIKEY': this.apiKey,
      },
    });

    return response.json();
  }

  // Account-Info abrufen
  async getAccount() {
    return this.signedRequest('GET', '/api/v3/account');
  }

  // Limit Order erstellen
  async createLimitOrder(symbol, side, quantity, price) {
    return this.signedRequest('POST', '/api/v3/order', {
      symbol,          // z.B. "BTCUSDT"
      side,            // "BUY" oder "SELL"
      type: 'LIMIT',
      timeInForce: 'GTC',
      quantity,        // z.B. "0.001"
      price,           // z.B. "50000.00"
    });
  }

  // Market Order erstellen
  async createMarketOrder(symbol, side, quantity) {
    return this.signedRequest('POST', '/api/v3/order', {
      symbol,
      side,
      type: 'MARKET',
      quantity,
    });
  }

  // Offene Orders abrufen
  async getOpenOrders(symbol) {
    return this.signedRequest('GET', '/api/v3/openOrders', { symbol });
  }

  // Order stornieren
  async cancelOrder(symbol, orderId) {
    return this.signedRequest('DELETE', '/api/v3/order', { symbol, orderId });
  }
}
```

### 2.3 REST API Endpoints (Spot)

| Endpoint | Methode | Gewicht | Beschreibung |
|---|---|---|---|
| `/api/v3/exchangeInfo` | GET | 20 | Exchange-Infos + Rate Limits |
| `/api/v3/depth` | GET | 1-50 | Orderbook (je nach Limit) |
| `/api/v3/trades` | GET | 25 | Letzte Trades |
| `/api/v3/klines` | GET | 2 | Candlestick/Kline Daten |
| `/api/v3/ticker/24hr` | GET | 1-80 | 24h Ticker |
| `/api/v3/ticker/price` | GET | 1-4 | Aktueller Preis |
| `/api/v3/order` | POST | 1 | Order erstellen |
| `/api/v3/order` | DELETE | 1 | Order stornieren |
| `/api/v3/openOrders` | GET | 6-80 | Offene Orders |
| `/api/v3/account` | GET | 20 | Account-Informationen |
| `/api/v3/myTrades` | GET | 20 | Eigene Trades |
| `/api/v3/allOrders` | GET | 20 | Alle Orders (History) |

**Futures-spezifische Endpoints:**

| Endpoint | Methode | Beschreibung |
|---|---|---|
| `/fapi/v1/order` | POST | Futures Order erstellen |
| `/fapi/v1/positionRisk` | GET | Offene Positionen |
| `/fapi/v1/leverage` | POST | Hebel aendern |
| `/fapi/v1/marginType` | POST | Margin-Typ aendern (CROSS/ISOLATED) |
| `/fapi/v2/account` | GET | Futures Account-Info |
| `/fapi/v1/fundingRate` | GET | Funding Rate History |

### 2.4 Rate Limits

| Typ | Limit | Scope |
|---|---|---|
| REQUEST_WEIGHT | ~1200/Minute | Pro IP |
| RAW_REQUESTS | ~6100/5 Min | Pro IP |
| ORDERS | ~100/10 Sekunden | Pro Account |
| ORDERS | ~200000/24 Stunden | Pro Account |

**Response Headers zur Ueberwachung:**
- `X-MBX-USED-WEIGHT-1m` — Verbrauchtes Gewicht in aktueller Minute
- `X-MBX-ORDER-COUNT-10s` — Order-Count in 10 Sekunden
- `X-MBX-ORDER-COUNT-1d` — Order-Count in 24 Stunden

**Strafen bei Ueberschreitung:**
- **HTTP 429:** Rate Limit erreicht, `Retry-After` Header beachten
- **HTTP 418:** IP gebannt (2 Minuten bis 3 Tage, skaliert bei Wiederholung)
- Wiederholte Verstoesse fuehren zu eskalierenden Bans

### 2.5 WebSocket Streams

```javascript
const WebSocket = require('ws');

// --- Einzelner Stream ---
const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@trade');

// --- Kombinierte Streams (bis zu 1024 gleichzeitig) ---
const combined = new WebSocket(
  'wss://stream.binance.com:9443/stream?streams=btcusdt@trade/ethusdt@trade/btcusdt@kline_1m'
);

// --- Verfuegbare Stream-Typen ---
// <symbol>@trade          — Echtzeit Trades
// <symbol>@kline_<interval> — Candlestick (1m, 5m, 15m, 1h, 4h, 1d, etc.)
// <symbol>@depth<levels>  — Partial Orderbook (5, 10, 20 Level)
// <symbol>@depth           — Diff. Orderbook Updates
// <symbol>@miniTicker     — Mini Ticker
// <symbol>@ticker         — 24h Ticker
// <symbol>@bookTicker     — Best Bid/Ask
// !miniTicker@arr         — Alle Mini Tickers
// !ticker@arr             — Alle Tickers

ws.on('message', (data) => {
  const msg = JSON.parse(data);
  console.log(`Trade: ${msg.s} @ ${msg.p} | Qty: ${msg.q}`);
});

// --- User Data Stream (privat, braucht Listen Key) ---
async function startUserDataStream(apiKey) {
  // Listen Key erstellen
  const response = await fetch('https://api.binance.com/api/v3/userDataStream', {
    method: 'POST',
    headers: { 'X-MBX-APIKEY': apiKey },
  });
  const { listenKey } = await response.json();

  // WebSocket verbinden
  const userWs = new WebSocket(`wss://stream.binance.com:9443/ws/${listenKey}`);

  userWs.on('message', (data) => {
    const event = JSON.parse(data);
    switch (event.e) {
      case 'executionReport':
        console.log(`Order Update: ${event.s} ${event.S} ${event.X}`);
        break;
      case 'outboundAccountPosition':
        console.log('Balance Update:', event.B);
        break;
    }
  });

  // Listen Key alle 30 Minuten verlaengern (laeuft nach 60 Min ab)
  setInterval(async () => {
    await fetch(`https://api.binance.com/api/v3/userDataStream?listenKey=${listenKey}`, {
      method: 'PUT',
      headers: { 'X-MBX-APIKEY': apiKey },
    });
  }, 30 * 60 * 1000);

  return userWs;
}
```

**WebSocket Limits:**
- Max **5 Messages/Sekunde** pro Verbindung
- Max **1024 Streams** pro Verbindung
- **Ping alle 20 Sekunden** vom Server (Pong innerhalb 1 Minute)
- Verbindung wird nach **24 Stunden** automatisch getrennt

---

## 3. CCXT Library (Unified Crypto Exchange API)

### 3.1 Uebersicht

CCXT (CryptoCurrency eXchange Trading Library) ist eine unified API fuer 100+ Crypto-Exchanges. Verfuegbar in JavaScript/TypeScript, Python, PHP, C#, Go.

```bash
npm install ccxt
```

### 3.2 Supported Exchanges (Certified / Tier-1)

| Exchange | Spot | Futures | Margin | Status |
|---|---|---|---|---|
| Binance | Ja | USDM + COINM | Ja | Certified |
| Coinbase | Ja | Nein | Nein | Certified |
| Bybit | Ja | Ja | Ja | Certified |
| OKX | Ja | Ja | Ja | Certified |
| KuCoin | Ja | Ja | Ja | Certified |
| Bitget | Ja | Ja | Ja | Certified |
| Gate.io | Ja | Ja | Ja | Certified |
| Kraken | Ja | Ja | Ja | Certified |
| BitMEX | Nein | Ja | Nein | Certified |
| MEXC | Ja | Ja | Nein | Certified |
| HTX (Huobi) | Ja | Ja | Ja | Certified |
| Crypto.com | Ja | Nein | Nein | Certified |

+ **90+ weitere Exchanges** mit variierender Integration.

### 3.3 Unified API — Codebeispiele

```typescript
import ccxt from 'ccxt';

// --- Exchange initialisieren ---
const exchange = new ccxt.binance({
  apiKey: 'YOUR_API_KEY',
  secret: 'YOUR_SECRET',
  sandbox: true,  // Testnet verwenden
  options: {
    defaultType: 'spot', // 'spot', 'future', 'margin'
  },
});

// --- Maerkte laden ---
await exchange.loadMarkets();

// --- Ticker abrufen ---
const ticker = await exchange.fetchTicker('BTC/USDT');
console.log(`BTC/USDT: ${ticker.last} | Bid: ${ticker.bid} | Ask: ${ticker.ask}`);

// --- OHLCV Candles ---
const candles = await exchange.fetchOHLCV('BTC/USDT', '1h', undefined, 100);
// Format: [[timestamp, open, high, low, close, volume], ...]

// --- Orderbook ---
const orderbook = await exchange.fetchOrderBook('BTC/USDT', 20);
console.log('Best Bid:', orderbook.bids[0]); // [price, amount]
console.log('Best Ask:', orderbook.asks[0]);

// --- Balance abrufen ---
const balance = await exchange.fetchBalance();
console.log('USDT:', balance.USDT);

// --- Limit Order ---
const order = await exchange.createLimitBuyOrder('BTC/USDT', 0.001, 50000);

// --- Market Order ---
const marketOrder = await exchange.createMarketSellOrder('BTC/USDT', 0.001);

// --- Order stornieren ---
await exchange.cancelOrder(order.id, 'BTC/USDT');

// --- Offene Orders ---
const openOrders = await exchange.fetchOpenOrders('BTC/USDT');

// --- Trade History ---
const trades = await exchange.fetchMyTrades('BTC/USDT', undefined, 50);
```

### 3.4 CCXT Pro — WebSocket Support

```typescript
import ccxt from 'ccxt';

// CCXT Pro fuer WebSocket (gleiche Library, Pro-Features inkludiert)
const exchange = new ccxt.pro.binance({
  apiKey: 'YOUR_API_KEY',
  secret: 'YOUR_SECRET',
});

// --- Real-time Ticker ---
while (true) {
  const ticker = await exchange.watchTicker('BTC/USDT');
  console.log(`${ticker.symbol}: ${ticker.last}`);
}

// --- Real-time Orderbook ---
while (true) {
  const orderbook = await exchange.watchOrderBook('BTC/USDT');
  console.log('Spread:', orderbook.asks[0][0] - orderbook.bids[0][0]);
}

// --- Real-time Trades ---
while (true) {
  const trades = await exchange.watchTrades('BTC/USDT');
  trades.forEach(t => console.log(`${t.side} ${t.amount} @ ${t.price}`));
}

// --- Real-time Balance Updates ---
while (true) {
  const balance = await exchange.watchBalance();
  console.log('USDT Free:', balance.USDT.free);
}

// --- Real-time Order Updates ---
while (true) {
  const orders = await exchange.watchOrders('BTC/USDT');
  orders.forEach(o => console.log(`Order ${o.id}: ${o.status}`));
}
```

### 3.5 Multi-Exchange Support (Kernvorteil)

```typescript
// Gleichzeitig auf mehreren Exchanges handeln
const exchanges = {
  binance: new ccxt.binance({ apiKey: '...', secret: '...' }),
  coinbase: new ccxt.coinbase({ apiKey: '...', secret: '...' }),
  bybit: new ccxt.bybit({ apiKey: '...', secret: '...' }),
};

// Preis-Vergleich ueber alle Exchanges
async function comparePrice(symbol: string) {
  const prices = await Promise.all(
    Object.entries(exchanges).map(async ([name, ex]) => {
      const ticker = await ex.fetchTicker(symbol);
      return { exchange: name, price: ticker.last, bid: ticker.bid, ask: ticker.ask };
    })
  );

  prices.sort((a, b) => a.price - b.price);
  console.log(`Guenstigster Kauf: ${prices[0].exchange} @ ${prices[0].ask}`);
  console.log(`Bester Verkauf:    ${prices[prices.length - 1].exchange} @ ${prices[prices.length - 1].bid}`);
  return prices;
}
```

### 3.6 Limitationen

| Limitation | Details |
|---|---|
| **Latenz** | Nicht fuer HFT geeignet — CCXT fuegt Overhead hinzu |
| **Historical Data** | `fetchTrades()` liefert nur die letzten ~1000 Trades oder 24h |
| **OHLCV Resolution** | Zeigt nur OHLCV, nicht intra-candle Preisbewegungen |
| **Rate Limiting** | Default `rateLimit` ist konservativ — muss pro Anwendung getunt werden |
| **Exchange-spezifische Features** | Nicht alle Exchange-Features sind unified verfuegbar |
| **Python Performance** | Pure Python ECDSA-Implementierung kann langsam sein |

---

## 4. Copy Trading Implementation

### 4.1 Architektur-Ueberblick

```
+-------------------+     +---------------------+     +-------------------+
|   Master Trader   | --> |   Copy Trade Engine  | --> |  Follower Account |
|   (Signal Source) |     |   (Central Service)  |     |  (Auto-Executor)  |
+-------------------+     +---------------------+     +-------------------+
        |                          |                           |
    WebSocket/API            Position Sizing              API Order
    Order Events            Risk Management              Execution
                            Allocation Logic
```

### 4.2 Kernkomponenten

1. **Signal Detection Service**
   - WebSocket-Verbindung zum Master Account
   - Ueberwacht alle Order-Events (New, Fill, Cancel, Modify)
   - Erkennt Position-Aenderungen in Echtzeit

2. **Allocation Engine**
   - Berechnet proportionale Trade-Groessen
   - Unterstuetzt verschiedene Modi: Proportional, Fixed, Percentage

3. **Order Execution Service**
   - Repliziert Orders auf Follower-Accounts
   - Handhabt Rate Limits pro Exchange
   - Queue-System fuer Batch-Ausfuehrung

4. **Reconciliation Service**
   - Periodischer Abgleich Master vs. Follower Positionen
   - Erkennt Divergenz und korrigiert

### 4.3 Implementierung

```typescript
// Copy Trading Engine — Vereinfachte Implementierung
import ccxt from 'ccxt';
import { EventEmitter } from 'events';

interface CopyConfig {
  mode: 'proportional' | 'fixed' | 'percentage';
  maxPositionSize: number;     // Max Position pro Trade
  maxTotalExposure: number;    // Max Gesamt-Exposure
  slippageTolerance: number;   // Max akzeptable Slippage in %
  allowedPairs: string[];      // Erlaubte Trading-Paare
}

interface MasterTrade {
  symbol: string;
  side: 'buy' | 'sell';
  amount: number;
  price: number;
  type: 'market' | 'limit';
  timestamp: number;
}

class CopyTradingEngine extends EventEmitter {
  private masterExchange: ccxt.Exchange;
  private followerExchanges: Map<string, { exchange: ccxt.Exchange; config: CopyConfig }>;

  constructor(masterExchange: ccxt.Exchange) {
    super();
    this.masterExchange = masterExchange;
    this.followerExchanges = new Map();
  }

  addFollower(id: string, exchange: ccxt.Exchange, config: CopyConfig) {
    this.followerExchanges.set(id, { exchange, config });
  }

  // Trade-Groesse fuer Follower berechnen
  private calculateFollowerSize(
    masterTrade: MasterTrade,
    masterBalance: number,
    followerBalance: number,
    config: CopyConfig
  ): number {
    switch (config.mode) {
      case 'proportional':
        // Proportional zum Balance-Verhaeltnis
        const ratio = followerBalance / masterBalance;
        return Math.min(masterTrade.amount * ratio, config.maxPositionSize);

      case 'fixed':
        // Fester Betrag
        return Math.min(config.maxPositionSize, followerBalance * 0.1);

      case 'percentage':
        // Prozentualer Anteil des Follower-Balances
        const pctAmount = (followerBalance * config.maxPositionSize) / 100;
        return pctAmount / masterTrade.price;

      default:
        return 0;
    }
  }

  // Master-Trade auf alle Follower replizieren
  async replicateTrade(masterTrade: MasterTrade) {
    const masterBalance = await this.getMasterBalance();
    const results = [];

    for (const [followerId, { exchange, config }] of this.followerExchanges) {
      try {
        // Pair erlaubt?
        if (!config.allowedPairs.includes(masterTrade.symbol)) continue;

        const followerBalance = await this.getFollowerBalance(exchange);
        const size = this.calculateFollowerSize(
          masterTrade, masterBalance, followerBalance, config
        );

        if (size <= 0) continue;

        // Order ausfuehren
        let order;
        if (masterTrade.type === 'market') {
          order = await exchange.createOrder(
            masterTrade.symbol,
            'market',
            masterTrade.side,
            size
          );
        } else {
          // Limit Order mit Slippage-Toleranz
          const adjustedPrice = masterTrade.side === 'buy'
            ? masterTrade.price * (1 + config.slippageTolerance / 100)
            : masterTrade.price * (1 - config.slippageTolerance / 100);

          order = await exchange.createOrder(
            masterTrade.symbol,
            'limit',
            masterTrade.side,
            size,
            adjustedPrice
          );
        }

        results.push({ followerId, order, status: 'success' });
        this.emit('trade_copied', { followerId, order });

      } catch (error) {
        results.push({ followerId, error: error.message, status: 'failed' });
        this.emit('copy_error', { followerId, error });
      }
    }

    return results;
  }

  // WebSocket-basierte Echtzeit-Ueberwachung des Masters
  async watchMasterOrders() {
    const exchange = this.masterExchange as any; // ccxt.pro

    while (true) {
      try {
        const orders = await exchange.watchOrders();

        for (const order of orders) {
          if (order.status === 'closed' && order.filled > 0) {
            // Gefuellter Trade — replizieren
            await this.replicateTrade({
              symbol: order.symbol,
              side: order.side,
              amount: order.filled,
              price: order.average || order.price,
              type: order.type,
              timestamp: order.timestamp,
            });
          }
        }
      } catch (error) {
        console.error('Master watch error:', error);
        await new Promise(r => setTimeout(r, 5000)); // Reconnect delay
      }
    }
  }

  private async getMasterBalance(): Promise<number> {
    const balance = await this.masterExchange.fetchBalance();
    return balance.total.USDT || 0;
  }

  private async getFollowerBalance(exchange: ccxt.Exchange): Promise<number> {
    const balance = await exchange.fetchBalance();
    return balance.free.USDT || 0;
  }
}
```

### 4.4 Synchronisations-Modi

| Modus | Beschreibung | Latenz | Anwendung |
|---|---|---|---|
| **Synchron** | Master + Follower gleichzeitig | Minimal | Day Trading, Scalping |
| **Asynchron** | Follower mit Verzoegerung | 100ms-5s | Swing Trading |
| **Batch** | Mehrere Follower gebatcht | 1-10s | Viele Follower, Rate Limit Schonung |

### 4.5 Kritische Herausforderungen

- **Slippage:** Bei vielen Followern kann der Preis sich zwischen Master und Follower bewegen
- **Rate Limits:** Bei 100+ Followern muessen Orders gequeuet werden
- **Partial Fills:** Master hat Partial Fill — Follower muss anteilig handeln
- **Position Divergenz:** Regelmaessiger Reconciliation-Loop noetig
- **Stop-Loss/Take-Profit:** Muessen ebenfalls repliziert und bei Preis-Aenderungen aktualisiert werden

---

## 5. Bot-Strategien

### 5.1 Grid Trading

Platziert Kauf- und Verkaufsorders in einem festen Preisraster. Profitiert von Seitwaertsbewegungen.

```typescript
interface GridConfig {
  symbol: string;
  upperPrice: number;      // Obere Grenze
  lowerPrice: number;      // Untere Grenze
  gridCount: number;       // Anzahl Grid-Levels
  totalInvestment: number; // Gesamtinvestition in USDT
}

class GridBot {
  private exchange: ccxt.Exchange;
  private config: GridConfig;
  private gridLevels: number[] = [];
  private activeOrders: Map<number, string> = new Map(); // level -> orderId

  constructor(exchange: ccxt.Exchange, config: GridConfig) {
    this.exchange = exchange;
    this.config = config;
    this.calculateGridLevels();
  }

  private calculateGridLevels() {
    const step = (this.config.upperPrice - this.config.lowerPrice) / this.config.gridCount;
    for (let i = 0; i <= this.config.gridCount; i++) {
      this.gridLevels.push(
        Number((this.config.lowerPrice + step * i).toFixed(2))
      );
    }
  }

  async initialize() {
    const ticker = await this.exchange.fetchTicker(this.config.symbol);
    const currentPrice = ticker.last;
    const amountPerGrid = this.config.totalInvestment / this.config.gridCount;

    for (const level of this.gridLevels) {
      if (level < currentPrice) {
        // Kauforder unter aktuellem Preis
        const amount = amountPerGrid / level;
        const order = await this.exchange.createLimitBuyOrder(
          this.config.symbol, amount, level
        );
        this.activeOrders.set(level, order.id);
      } else if (level > currentPrice) {
        // Verkaufsorder ueber aktuellem Preis
        const amount = amountPerGrid / level;
        const order = await this.exchange.createLimitSellOrder(
          this.config.symbol, amount, level
        );
        this.activeOrders.set(level, order.id);
      }
    }
  }

  // Wenn eine Order gefuellt wird, Gegenorder platzieren
  async onOrderFilled(filledLevel: number, side: 'buy' | 'sell') {
    const step = this.gridLevels[1] - this.gridLevels[0];
    const amountPerGrid = this.config.totalInvestment / this.config.gridCount;

    if (side === 'buy') {
      // Kauforder gefuellt -> Verkaufsorder ein Level hoeher
      const sellLevel = filledLevel + step;
      const amount = amountPerGrid / sellLevel;
      const order = await this.exchange.createLimitSellOrder(
        this.config.symbol, amount, sellLevel
      );
      this.activeOrders.set(sellLevel, order.id);
    } else {
      // Verkaufsorder gefuellt -> Kauforder ein Level niedriger
      const buyLevel = filledLevel - step;
      const amount = amountPerGrid / buyLevel;
      const order = await this.exchange.createLimitBuyOrder(
        this.config.symbol, amount, buyLevel
      );
      this.activeOrders.set(buyLevel, order.id);
    }
  }
}

// Verwendung:
const gridBot = new GridBot(exchange, {
  symbol: 'BTC/USDT',
  upperPrice: 72000,
  lowerPrice: 58000,
  gridCount: 20,
  totalInvestment: 1000,
});
```

**Best Case:** Seitwaertsmarkt mit klarer Range
**Risiko:** Breakout ueber/unter die Grid-Grenzen

### 5.2 DCA (Dollar Cost Averaging)

Regelmaessige Kaeufe + Safety Orders bei Preisrueckgaengen.

```typescript
interface DCAConfig {
  symbol: string;
  baseOrderSize: number;       // Erste Order in USDT
  safetyOrderSize: number;     // Safety Order Groesse
  safetyOrderStep: number;     // % Preisrueckgang fuer naechste Safety Order
  safetyOrderStepScale: number; // Multiplikator fuer Step-Vergroesserung
  safetyOrderVolumeScale: number; // Multiplikator fuer Order-Groesse
  maxSafetyOrders: number;     // Max Anzahl Safety Orders
  takeProfit: number;          // Take Profit in %
  maxActiveTrades: number;     // Max parallele Trades
}

class DCABot {
  private exchange: ccxt.Exchange;
  private config: DCAConfig;

  async startDeal() {
    // 1. Base Order (Market Buy)
    const baseOrder = await this.exchange.createMarketBuyOrder(
      this.config.symbol,
      this.config.baseOrderSize
    );

    const entryPrice = baseOrder.average;
    let totalCost = this.config.baseOrderSize;
    let totalAmount = baseOrder.filled;
    let avgPrice = entryPrice;

    // 2. Safety Orders platzieren
    let currentStep = this.config.safetyOrderStep;
    let currentSize = this.config.safetyOrderSize;

    for (let i = 0; i < this.config.maxSafetyOrders; i++) {
      const safetyPrice = entryPrice * (1 - currentStep / 100);
      const safetyAmount = currentSize / safetyPrice;

      await this.exchange.createLimitBuyOrder(
        this.config.symbol,
        safetyAmount,
        safetyPrice
      );

      // Step und Size skalieren
      currentStep *= this.config.safetyOrderStepScale;
      currentSize *= this.config.safetyOrderVolumeScale;
    }

    // 3. Take Profit wird dynamisch basierend auf avgPrice berechnet
    // Bei jeder Safety Order die gefuellt wird:
    // avgPrice = totalCost / totalAmount
    // TP Price = avgPrice * (1 + takeProfit / 100)
  }
}

// Typische Konfiguration:
const dcaConfig: DCAConfig = {
  symbol: 'BTC/USDT',
  baseOrderSize: 50,         // 50 USDT erste Order
  safetyOrderSize: 100,      // 100 USDT Safety Orders
  safetyOrderStep: 2,        // Alle 2% Rueckgang
  safetyOrderStepScale: 1.5, // Step wird 1.5x groesser
  safetyOrderVolumeScale: 2, // Volume wird 2x groesser
  maxSafetyOrders: 8,
  takeProfit: 1.5,           // 1.5% Take Profit
  maxActiveTrades: 5,
};
```

### 5.3 RSI-Strategie

Relative Strength Index — kauft bei Oversold, verkauft bei Overbought.

```typescript
function calculateRSI(closes: number[], period: number = 14): number {
  if (closes.length < period + 1) return 50; // nicht genug Daten

  let gains = 0;
  let losses = 0;

  // Erste Periode
  for (let i = 1; i <= period; i++) {
    const change = closes[i] - closes[i - 1];
    if (change > 0) gains += change;
    else losses += Math.abs(change);
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  // Smoothed RSI fuer restliche Perioden
  for (let i = period + 1; i < closes.length; i++) {
    const change = closes[i] - closes[i - 1];
    if (change > 0) {
      avgGain = (avgGain * (period - 1) + change) / period;
      avgLoss = (avgLoss * (period - 1)) / period;
    } else {
      avgGain = (avgGain * (period - 1)) / period;
      avgLoss = (avgLoss * (period - 1) + Math.abs(change)) / period;
    }
  }

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

// RSI Trading Bot
class RSIBot {
  private exchange: ccxt.Exchange;
  private symbol: string;
  private oversold: number = 30;    // Kaufsignal
  private overbought: number = 70;  // Verkaufssignal
  private rsiPeriod: number = 14;

  async checkSignal() {
    const candles = await this.exchange.fetchOHLCV(this.symbol, '1h', undefined, 100);
    const closes = candles.map(c => c[4]); // Close-Preise

    const rsi = calculateRSI(closes, this.rsiPeriod);

    if (rsi < this.oversold) {
      return { signal: 'BUY', rsi };
    } else if (rsi > this.overbought) {
      return { signal: 'SELL', rsi };
    }

    return { signal: 'HOLD', rsi };
  }
}
```

### 5.4 MACD-Strategie

Moving Average Convergence Divergence — erkennt Trendwechsel.

```typescript
function calculateEMA(data: number[], period: number): number[] {
  const multiplier = 2 / (period + 1);
  const ema: number[] = [data[0]]; // Erster Wert = SMA-Startwert

  for (let i = 1; i < data.length; i++) {
    ema.push((data[i] - ema[i - 1]) * multiplier + ema[i - 1]);
  }

  return ema;
}

function calculateMACD(closes: number[]) {
  const ema12 = calculateEMA(closes, 12);
  const ema26 = calculateEMA(closes, 26);

  // MACD Line = EMA12 - EMA26
  const macdLine = ema12.map((val, i) => val - ema26[i]);

  // Signal Line = 9-Perioden EMA des MACD
  const signalLine = calculateEMA(macdLine.slice(26), 9);

  // Histogram = MACD - Signal
  const histogram = macdLine.slice(26).map((val, i) =>
    i < signalLine.length ? val - signalLine[i] : 0
  );

  return {
    macd: macdLine[macdLine.length - 1],
    signal: signalLine[signalLine.length - 1],
    histogram: histogram[histogram.length - 1],
  };
}

// MACD + RSI Kombinations-Strategie
class MACDRSIBot {
  async evaluate(symbol: string) {
    const candles = await this.exchange.fetchOHLCV(symbol, '4h', undefined, 200);
    const closes = candles.map(c => c[4]);

    const rsi = calculateRSI(closes);
    const macd = calculateMACD(closes);

    // Starkes Kaufsignal: RSI oversold + MACD bullish crossover
    if (rsi < 35 && macd.histogram > 0 && macd.macd > macd.signal) {
      return { signal: 'STRONG_BUY', confidence: 0.85 };
    }

    // Starkes Verkaufssignal: RSI overbought + MACD bearish crossover
    if (rsi > 65 && macd.histogram < 0 && macd.macd < macd.signal) {
      return { signal: 'STRONG_SELL', confidence: 0.85 };
    }

    // Einzelne Signale
    if (macd.macd > macd.signal && macd.histogram > 0) {
      return { signal: 'BUY', confidence: 0.6 };
    }
    if (macd.macd < macd.signal && macd.histogram < 0) {
      return { signal: 'SELL', confidence: 0.6 };
    }

    return { signal: 'HOLD', confidence: 0 };
  }
}
```

### 5.5 Strategie-Vergleich

| Strategie | Marktbedingung | Risiko | Komplexitaet | Empfohlener Timeframe |
|---|---|---|---|---|
| **Grid** | Seitwaerts/Range | Mittel | Niedrig | 15m - 4h |
| **DCA** | Alle (bes. bearish) | Niedrig | Niedrig | 1h - 1d |
| **RSI** | Trending/Reversals | Mittel | Mittel | 1h - 4h |
| **MACD** | Trending | Mittel-Hoch | Mittel | 4h - 1d |
| **MACD+RSI** | Alle | Mittel | Hoch | 4h - 1d |
| **Arbitrage** | Alle | Niedrig | Hoch | Echtzeit |

---

## 6. Regulatorische Aspekte EU/Oesterreich

### 6.1 MiCA (Markets in Crypto-Assets Regulation)

MiCA ist die EU-weite Verordnung fuer Krypto-Assets, in Kraft seit 30. Dezember 2024.

**Oesterreich-spezifische Deadline:** 31. Dezember 2025 (12-Monate Uebergangsperiode, kuerzer als die maximal moeglichen 18 Monate).

### 6.2 Lizenzanforderungen fuer CASPs

| Service-Typ | Mindestkapital | Beschreibung |
|---|---|---|
| Advisory Services | EUR 50.000 | Krypto-Beratung |
| Custody & Exchange | EUR 125.000 | Verwahrung und Umtausch |
| Trading Platform | EUR 150.000 | Handelsplattform betreiben |

### 6.3 Was unsere Trading-Plattform braucht

Da wir eine Plattform mit Copy Trading und Bot-Funktionalitaet bauen:

1. **CASP-Lizenz als Trading Platform** — EUR 150.000 Mindestkapital
2. **KYC/AML Compliance:**
   - Identity Verification fuer alle User
   - Transaction Monitoring
   - Suspicious Activity Reporting (SAR)
   - PEP (Politically Exposed Persons) Screening
3. **Governance:**
   - Geschaeftsfuehrer mit nachgewiesener Eignung
   - Compliance Officer
   - Internes Kontrollsystem
4. **Cybersecurity (DORA):**
   - Digital Operational Resilience Act (seit 17. Januar 2025)
   - ICT Risk Management Framework
   - Incident Reporting
   - Digital Operational Resilience Testing
5. **Transparenz:**
   - Whitepaper fuer eigene Token (falls relevant)
   - Klare Gebuehrenstruktur
   - Risiko-Warnungen fuer User

### 6.4 DAC8 (Steuerliche Meldepflicht)

Ab 2026 muessen Crypto-Plattformen in der EU Transaktionsdaten an Steuerbehoerden melden. Betrifft:
- Alle Krypto-zu-Fiat Transaktionen
- Krypto-zu-Krypto Transaktionen ueber bestimmten Schwellenwerten
- User-Identifikationsdaten

### 6.5 Alternativen zur vollen Lizenz

| Option | Vorteil | Nachteil |
|---|---|---|
| **Reiner Signal-Service** | Keine CASP-Lizenz noetig | Keine direkte Ausfuehrung |
| **API-Key basiert** | User handelt auf eigener Exchange | Weniger Kontrolle |
| **Whitelabel ueber lizenzierten Partner** | Schneller Markteintritt | Revenue Share |
| **Lizenz in anderem EU-Land** | Ggf. einfacher (z.B. Litauen) | EU-Passporting moeglich |

**Empfehlung fuer MVP:** API-Key basiertes Modell (User verbindet eigene Exchange-Accounts). Damit agiert die Plattform als Software-Tool, nicht als CASP. Spaeter Lizenz beantragen wenn Skalierung ansteht.

---

## 7. Stripe Payment Integration

### 7.1 Subscription-Modell fuer die Trading Platform

```typescript
// Stripe Setup fuer Subscription-basierte Trading Platform
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// --- Produkte & Preise erstellen ---
async function createSubscriptionPlans() {
  // Free Tier (Referenz)
  const freePlan = await stripe.products.create({
    name: 'Trading Bot — Free',
    description: '1 Bot, Basic Strategien, 5 Trades/Tag',
  });

  // Pro Tier
  const proPlan = await stripe.products.create({
    name: 'Trading Bot — Pro',
    description: '5 Bots, Alle Strategien, Unlimited Trades, Copy Trading',
  });
  const proPrice = await stripe.prices.create({
    product: proPlan.id,
    unit_amount: 2900, // EUR 29.00
    currency: 'eur',
    recurring: { interval: 'month' },
  });

  // Enterprise Tier
  const enterprisePlan = await stripe.products.create({
    name: 'Trading Bot — Enterprise',
    description: 'Unlimited Bots, API Access, Priority Support, White-Label',
  });
  const enterprisePrice = await stripe.prices.create({
    product: enterprisePlan.id,
    unit_amount: 9900, // EUR 99.00
    currency: 'eur',
    recurring: { interval: 'month' },
  });

  return { proPrice, enterprisePrice };
}

// --- Checkout Session erstellen ---
async function createCheckoutSession(priceId: string, userId: string) {
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card', 'sepa_debit'], // Karte + SEPA fuer EU
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: 'https://app.example.com/success?session_id={CHECKOUT_SESSION_ID}',
    cancel_url: 'https://app.example.com/pricing',
    client_reference_id: userId,
    metadata: { userId },
    subscription_data: {
      trial_period_days: 7, // 7 Tage Trial
      metadata: { userId },
    },
  });

  return session.url; // Redirect URL fuer den User
}

// --- Webhook Handler (Express) ---
import express from 'express';

const app = express();

app.post('/webhooks/stripe',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        // User Subscription in DB aktivieren
        await activateSubscription(
          session.client_reference_id!,
          session.subscription as string
        );
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        // Subscription verlaengern
        await extendSubscription(invoice.subscription as string);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        // User benachrichtigen, Bots pausieren
        await pauseUserBots(invoice.subscription as string);
        await notifyPaymentFailed(invoice.subscription as string);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        // Subscription beenden, Bots stoppen
        await deactivateSubscription(subscription.id);
        await stopAllBots(subscription.metadata.userId);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        // Plan-Aenderung verarbeiten (Upgrade/Downgrade)
        await updateSubscriptionPlan(
          subscription.id,
          subscription.items.data[0].price.id
        );
        break;
      }
    }

    res.json({ received: true });
  }
);
```

### 7.2 Subscription Tiers

| Feature | Free | Pro (EUR 29/mo) | Enterprise (EUR 99/mo) |
|---|---|---|---|
| Aktive Bots | 1 | 5 | Unlimited |
| Trades/Tag | 5 | Unlimited | Unlimited |
| Strategien | Grid, DCA | Alle | Alle + Custom |
| Copy Trading | Nein | Ja (3 Master) | Ja (Unlimited) |
| Exchanges | 1 | 3 | Unlimited |
| Backtesting | Nein | 30 Tage | Unbegrenzt |
| API Access | Nein | Nein | Ja |
| Support | Community | E-Mail | Priority |

### 7.3 Wichtige Stripe-Konzepte

- **Checkout Sessions:** Hosted Payment Page (PCI-Compliant, kein eigenes Payment-Form noetig)
- **Customer Portal:** Self-Service fuer Plan-Aenderungen, Kuendigungen, Zahlungsmethoden
- **Webhooks:** Asynchrone Events (Payment Success/Fail, Subscription Changes)
- **Metered Billing:** Optional fuer Pay-per-Trade Modell
- **SEPA Direct Debit:** Wichtig fuer EU-Kunden (niedrigere Gebuehren als Kreditkarte)

---

## 8. WebSocket Best Practices

### 8.1 Connection Management

```typescript
class RobustWebSocket {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 50;
  private baseDelay: number = 1000; // 1 Sekunde
  private maxDelay: number = 30000; // 30 Sekunden
  private heartbeatInterval: NodeJS.Timer | null = null;
  private heartbeatTimeout: NodeJS.Timer | null = null;
  private subscriptions: Map<string, any> = new Map();

  constructor(url: string) {
    this.url = url;
  }

  connect() {
    this.ws = new WebSocket(this.url);

    this.ws.on('open', () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.startHeartbeat();
      this.resubscribeAll(); // Alle Subscriptions wiederherstellen
    });

    this.ws.on('message', (data: string) => {
      this.resetHeartbeatTimeout(); // Server ist aktiv
      this.handleMessage(JSON.parse(data));
    });

    this.ws.on('close', (code: number, reason: string) => {
      console.log(`WebSocket closed: ${code} - ${reason}`);
      this.stopHeartbeat();
      this.reconnect();
    });

    this.ws.on('error', (error: Error) => {
      console.error('WebSocket error:', error.message);
      // 'close' Event wird automatisch danach gefeuert
    });

    this.ws.on('pong', () => {
      this.resetHeartbeatTimeout();
    });
  }

  // --- Exponential Backoff Reconnection ---
  private reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    const delay = Math.min(
      this.baseDelay * Math.pow(2, this.reconnectAttempts) + Math.random() * 1000,
      this.maxDelay
    );

    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1})`);
    this.reconnectAttempts++;

    setTimeout(() => this.connect(), delay);
  }

  // --- Heartbeat (Ping/Pong) ---
  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.ping();

        // Timeout: wenn kein Pong innerhalb 10s -> reconnect
        this.heartbeatTimeout = setTimeout(() => {
          console.warn('Heartbeat timeout — closing connection');
          this.ws?.terminate();
        }, 10000);
      }
    }, 30000); // Alle 30 Sekunden
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    if (this.heartbeatTimeout) clearTimeout(this.heartbeatTimeout);
  }

  private resetHeartbeatTimeout() {
    if (this.heartbeatTimeout) clearTimeout(this.heartbeatTimeout);
  }

  // --- Subscription Management ---
  subscribe(channel: string, params: any) {
    this.subscriptions.set(channel, params);
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'subscribe', channel, ...params }));
    }
  }

  private resubscribeAll() {
    for (const [channel, params] of this.subscriptions) {
      this.ws?.send(JSON.stringify({ type: 'subscribe', channel, ...params }));
    }
  }

  // --- Message Queue (Outgoing) ---
  private messageQueue: string[] = [];
  private sendRateLimit: number = 5; // Max 5 msg/sec

  safeSend(data: any) {
    const msg = JSON.stringify(data);
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.messageQueue.push(msg);
      this.processQueue();
    }
  }

  private processing: boolean = false;
  private async processQueue() {
    if (this.processing) return;
    this.processing = true;

    while (this.messageQueue.length > 0) {
      const batch = this.messageQueue.splice(0, this.sendRateLimit);
      for (const msg of batch) {
        this.ws?.send(msg);
      }
      if (this.messageQueue.length > 0) {
        await new Promise(r => setTimeout(r, 1000)); // 1 Sekunde warten
      }
    }

    this.processing = false;
  }

  private handleMessage(msg: any) {
    // Override in Subklasse
  }
}
```

### 8.2 Data Integrity & Orderbook Management

```typescript
class OrderBookManager {
  private bids: Map<number, number> = new Map(); // price -> amount
  private asks: Map<number, number> = new Map();
  private lastUpdateId: number = 0;
  private snapshotLoaded: boolean = false;
  private bufferedUpdates: any[] = [];

  // 1. REST Snapshot laden
  async loadSnapshot(exchange: ccxt.Exchange, symbol: string) {
    const orderbook = await exchange.fetchOrderBook(symbol, 1000);

    this.bids.clear();
    this.asks.clear();

    for (const [price, amount] of orderbook.bids) {
      this.bids.set(price, amount);
    }
    for (const [price, amount] of orderbook.asks) {
      this.asks.set(price, amount);
    }

    this.lastUpdateId = orderbook.nonce || 0;
    this.snapshotLoaded = true;

    // Gebufferte Updates anwenden
    for (const update of this.bufferedUpdates) {
      if (update.updateId > this.lastUpdateId) {
        this.applyUpdate(update);
      }
    }
    this.bufferedUpdates = [];
  }

  // 2. WebSocket Updates anwenden
  applyUpdate(update: any) {
    if (!this.snapshotLoaded) {
      this.bufferedUpdates.push(update);
      return;
    }

    // Sequence Check
    if (update.updateId <= this.lastUpdateId) return; // Bereits verarbeitet

    for (const [price, amount] of update.bids) {
      if (amount === 0) {
        this.bids.delete(price);
      } else {
        this.bids.set(price, amount);
      }
    }

    for (const [price, amount] of update.asks) {
      if (amount === 0) {
        this.asks.delete(price);
      } else {
        this.asks.set(price, amount);
      }
    }

    this.lastUpdateId = update.updateId;
  }

  // 3. Sortiertes Orderbook abrufen
  getOrderBook(depth: number = 20) {
    const sortedBids = [...this.bids.entries()]
      .sort((a, b) => b[0] - a[0])
      .slice(0, depth);

    const sortedAsks = [...this.asks.entries()]
      .sort((a, b) => a[0] - b[0])
      .slice(0, depth);

    return {
      bids: sortedBids,
      asks: sortedAsks,
      spread: sortedAsks[0]?.[0] - sortedBids[0]?.[0] || 0,
      midPrice: ((sortedAsks[0]?.[0] || 0) + (sortedBids[0]?.[0] || 0)) / 2,
    };
  }

  // 4. Periodische Resync (alle 5 Minuten)
  startPeriodicResync(exchange: ccxt.Exchange, symbol: string) {
    setInterval(async () => {
      try {
        await this.loadSnapshot(exchange, symbol);
        console.log('Orderbook resynced successfully');
      } catch (error) {
        console.error('Resync failed:', error);
      }
    }, 5 * 60 * 1000);
  }
}
```

### 8.3 Best Practices Zusammenfassung

| Thema | Best Practice |
|---|---|
| **Protokoll** | Immer `wss://` (TLS/SSL verschluesselt) |
| **Heartbeat** | Ping alle 30s, Pong-Timeout 10s |
| **Reconnection** | Exponential Backoff mit Jitter (1s bis 30s) |
| **Subscriptions** | Nach Reconnect alle Channels re-subscriben |
| **Data Integrity** | REST Snapshot + WebSocket Updates + periodischer Resync |
| **Sequence Check** | Update-IDs pruefen, keine alten Updates anwenden |
| **Rate Limiting** | Outgoing Messages queuen (max 5/s bei Binance) |
| **JWT Refresh** | Token vor Ablauf erneuern (Coinbase: alle 90s) |
| **Connection Limit** | Max 1 Verbindung pro Stream (nicht mehrfach subscriben) |
| **Error Handling** | Alle WS Events (open, close, error, message) behandeln |
| **Monitoring** | Latenz, Disconnect-Count, Message-Rate loggen |
| **Backpressure** | Message-Buffer begrenzen, bei Ueberlauf alte Messages droppen |

---

## Quellen

- [Coinbase Advanced Trade API Docs](https://docs.cdp.coinbase.com/advanced-trade/docs/rest-api-overview)
- [Coinbase API Authentication](https://docs.cdp.coinbase.com/advanced-trade/docs/rest-api-auth)
- [Coinbase WebSocket Overview](https://docs.cdp.coinbase.com/advanced-trade/docs/ws-overview)
- [Binance Spot API Docs](https://developers.binance.com/docs/binance-spot-api-docs)
- [Binance Rate Limits](https://developers.binance.com/docs/binance-spot-api-docs/rest-api/limits)
- [Binance WebSocket API](https://github.com/binance/binance-spot-api-docs/blob/master/web-socket-api.md)
- [Binance Signature Examples](https://github.com/binance/binance-signature-examples)
- [CCXT GitHub Repository](https://github.com/ccxt/ccxt)
- [CCXT Documentation](https://docs.ccxt.com/)
- [MiCA Regulation — ESMA](https://www.esma.europa.eu/esmas-activities/digital-finance-and-innovation/markets-crypto-assets-regulation-mica)
- [MiCA Regulation 2026 Guide](https://sumsub.com/blog/crypto-regulations-in-the-european-union-markets-in-crypto-assets-mica/)
- [MiCA Licensing Guide](https://adamsmith.lt/en/mica-license-2025/)
- [Stripe Subscription Docs](https://docs.stripe.com/api/subscriptions)
- [Stripe Node.js SDK](https://docs.stripe.com/get-started/development-environment?lang=node)
- [WebSocket Best Practices — Ably](https://ably.com/topic/websocket-architecture-best-practices)
- [Coinbase Advanced Python SDK](https://github.com/coinbase/coinbase-advanced-py)
