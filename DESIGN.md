# Trading Platform -- UI/UX Design System

## Designphilosophie

Dark. Aggressiv. Premium. Die Plattform soll sich anfuehlen wie ein High-End-Terminal fuer professionelle Trader -- nicht wie eine bunte Consumer-App. Inspiration: anti-crm.com Aesthetik kombiniert mit Bloomberg-Terminal-Praezision und Crypto-Neon-Vibes.

---

## 1. Design System

### 1.1 Farbpalette

#### Primary Colors
| Name | Hex | Verwendung |
|---|---|---|
| `--bg-primary` | `#0A0A0F` | Haupt-Hintergrund, tiefes Schwarz mit Blau-Unterton |
| `--bg-secondary` | `#12121A` | Cards, Panels, Seitenleisten |
| `--bg-tertiary` | `#1A1A26` | Hover-States, aktive Bereiche |
| `--bg-elevated` | `#22222E` | Modals, Dropdowns, Tooltips |

#### Accent Colors
| Name | Hex | Verwendung |
|---|---|---|
| `--accent-primary` | `#00FF88` | Neon-Gruen -- Profit, CTAs, aktive States |
| `--accent-secondary` | `#00D4FF` | Cyan -- Links, sekundaere Aktionen |
| `--accent-warning` | `#FFB800` | Gold/Amber -- Warnungen, Premium-Badge |
| `--accent-danger` | `#FF3366` | Rot-Pink -- Verluste, Fehler, Sell-Signale |
| `--accent-purple` | `#8B5CF6` | Lila -- Bot/AI-Indikator, Strategie-Tags |

#### Text Colors
| Name | Hex | Verwendung |
|---|---|---|
| `--text-primary` | `#F0F0F5` | Haupttext, Ueberschriften |
| `--text-secondary` | `#8888A0` | Labels, Beschreibungen |
| `--text-muted` | `#555566` | Disabled States, Platzhalter |

#### Glassmorphism & Effects
```css
--glass-bg: rgba(18, 18, 26, 0.7);
--glass-border: rgba(255, 255, 255, 0.06);
--glass-blur: blur(20px);
--glow-green: 0 0 20px rgba(0, 255, 136, 0.3);
--glow-cyan: 0 0 20px rgba(0, 212, 255, 0.3);
--glow-danger: 0 0 20px rgba(255, 51, 102, 0.3);
--gradient-premium: linear-gradient(135deg, #00FF88 0%, #00D4FF 100%);
--gradient-card: linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%);
```

### 1.2 Typographie

| Element | Font | Weight | Size | Line-Height |
|---|---|---|---|---|
| H1 | Inter | 700 | 36px / 2.25rem | 1.2 |
| H2 | Inter | 600 | 28px / 1.75rem | 1.3 |
| H3 | Inter | 600 | 22px / 1.375rem | 1.3 |
| H4 | Inter | 500 | 18px / 1.125rem | 1.4 |
| Body | Inter | 400 | 15px / 0.9375rem | 1.6 |
| Small | Inter | 400 | 13px / 0.8125rem | 1.5 |
| Caption | Inter | 500 | 11px / 0.6875rem | 1.4 |
| Mono/Data | JetBrains Mono | 500 | 14px / 0.875rem | 1.5 |

Zahlen und Preise IMMER in `JetBrains Mono` -- das gibt den Terminal-Look.

### 1.3 Spacing System (8px Grid)

```
--space-1:  4px
--space-2:  8px
--space-3:  12px
--space-4:  16px
--space-5:  20px
--space-6:  24px
--space-8:  32px
--space-10: 40px
--space-12: 48px
--space-16: 64px
--space-20: 80px
```

### 1.4 Border Radius

```
--radius-sm: 6px    /* Buttons, Inputs */
--radius-md: 10px   /* Cards */
--radius-lg: 16px   /* Modals, grosse Panels */
--radius-xl: 24px   /* Feature-Cards */
--radius-full: 9999px /* Pills, Avatare */
```

### 1.5 Schatten & Tiefe

```css
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.4);
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.5);
--shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.6);
--shadow-glow: 0 0 40px rgba(0, 255, 136, 0.15);
```

---

## 2. Seitenstruktur

### 2.1 Oeffentliche Seiten (Pre-Auth)

| Seite | Route | Zweck |
|---|---|---|
| Landing Page | `/` | Hero, Features, Social Proof, CTA |
| Login | `/login` | E-Mail + Passwort, OAuth, 2FA |
| Register | `/register` | Onboarding mit Risiko-Profil |
| Pricing | `/pricing` | Free / Pro / Enterprise Tiers |

### 2.2 Dashboard & Core (Post-Auth)

| Seite | Route | Zweck |
|---|---|---|
| Dashboard | `/dashboard` | Uebersicht: PnL, offene Positionen, Bot-Status |
| Portfolio | `/portfolio` | Asset-Verteilung, Performance-History |
| Trading Terminal | `/trade` | Live-Charts, Order-Buch, Trade-Ausfuehrung |
| Bots | `/bots` | Bot-Liste, Status, Quick-Actions |
| Bot erstellen | `/bots/create` | Step-by-Step Bot-Konfigurator |
| Bot Detail | `/bots/:id` | Performance, Logs, Einstellungen |
| Marktplatz | `/marketplace` | Strategie-Browsing, Filter, Kauf |
| Strategie Detail | `/marketplace/:id` | Backtest-Ergebnisse, Reviews, Copy-Button |
| Copy Trading | `/copy` | Top-Trader-Rankings, aktive Kopien |
| Trader Profil | `/copy/:id` | Trader-Stats, Equity-Curve, Follow |
| Einstellungen | `/settings` | Profil, API-Keys, Benachrichtigungen |
| API Keys | `/settings/api-keys` | Exchange-Anbindung |

### 2.3 Navigation

**Desktop Sidebar (links, 72px collapsed / 260px expanded)**
```
[Logo]
----
Dashboard        (Grid-Icon)
Trading          (Chart-Icon)
Bots             (CPU-Icon)
Copy Trading     (Users-Icon)
Marktplatz       (Store-Icon)
Portfolio         (Pie-Icon)
----
Einstellungen    (Gear-Icon)
```

**Mobile: Bottom Tab Bar (5 Tabs)**
```
Dashboard | Trade | Bots | Copy | More
```

---

## 3. Wireframes (Seiten-Beschreibungen)

### 3.1 Landing Page `/`

```
[NAVBAR: Logo links | Nav-Links mitte | "Launch App" Button rechts (gruen glow)]

[HERO SECTION]
  Grosser Headline-Text: "Trade Smarter. Automate Everything."
  Subline: "KI-gestuetzte Trading Bots. Copy Top-Trader. 24/7 Profit."
  [CTA Button: "Jetzt starten" -- gruen, gross, glow-effekt]
  [Sekundaer: "Demo ansehen"]
  Darunter: Animierter Mock-Dashboard mit Live-Zahlen (fake ticker)
  Trust-Bar: "500+ aktive Trader | 12M+ Volumen | 3 Exchanges"

[FEATURES GRID -- 3 Spalten]
  Card 1: Bot Trading -- Icon + kurzer Text + Mini-Animation
  Card 2: Copy Trading -- Icon + kurzer Text
  Card 3: Strategie-Marktplatz -- Icon + kurzer Text

[PERFORMANCE SHOWCASE]
  Grosser Chart (animiert) zeigt exemplarische Bot-Performance
  Daneben: Key-Metriken als grosse Zahlen mit Neon-Glow
    "+847% ROI" | "2.3 Sharpe" | "12% Max DD"

[PRICING SECTION]
  3 Pricing-Cards nebeneinander (Glassmorphism)
  Mittlere Card hervorgehoben (Premium Gradient Border)

[FOOTER]
  Links, Social, Legal
```

### 3.2 Dashboard `/dashboard`

```
[SIDEBAR links -- collapsed oder expanded]

[MAIN CONTENT]

  [TOP BAR]
    Breadcrumb links | Suchfeld mitte | Notifications + Avatar rechts

  [STATS ROW -- 4 Cards horizontal]
    Card 1: "Portfolio Wert"     $12,847.32   +5.2% (gruen)
    Card 2: "Heute PnL"          +$342.18     (gruen pfeil)
    Card 3: "Aktive Bots"        3/5          (cyan)
    Card 4: "Win Rate"           68.4%        (gruen)
    --> Jede Card: Glassmorphism, grosse Mono-Zahl, kleiner Sparkline-Chart

  [MAIN GRID -- 2 Spalten]

    [LINKE SPALTE -- 60%]
      [PORTFOLIO CHART]
        Grosser Area-Chart (Equity Curve)
        Zeitraum-Toggle: 1H | 1D | 1W | 1M | 3M | 1Y | ALL
        Gruen-Gradient wenn positiv, Rot-Gradient wenn negativ

      [OFFENE POSITIONEN -- Tabelle]
        Spalten: Asset | Seite | Groesse | Entry | Aktuell | PnL | Aktion
        Jede Zeile mit farbigem PnL-Indikator
        Hover: Zeile hebt sich leicht an

    [RECHTE SPALTE -- 40%]
      [BOT STATUS PANEL]
        Liste der aktiven Bots
        Je Bot: Name, Status-Dot (gruen/gelb/rot), letzter Trade, PnL
        Quick-Toggle: Bot an/aus

      [LETZTE TRADES]
        Kompakte Trade-Liste
        Icon + Paar + Betrag + PnL + Zeitstempel
        Gruen/Rot Hintergrund-Tint je nach Ergebnis

      [MARKT-UEBERSICHT]
        Top 5 Coins mit Preis + 24h Veraenderung
        Mini-Sparklines neben jedem Preis
```

### 3.3 Trading Terminal `/trade`

```
[VOLLBILD-LAYOUT -- Sidebar minimiert]

  [TOP BAR]
    Pair-Selector (Dropdown): BTC/USDT ▼
    Preis gross in Mono: $67,432.18
    24h Change: +2.4% | 24h Vol: $1.2B
    Timeframe-Buttons: 1m 5m 15m 1H 4H 1D

  [MAIN GRID -- 3 Spalten]

    [CHART BEREICH -- 65%]
      TradingView Chart (Candlestick)
      Overlay: Indikatoren (MA, RSI, MACD)
      Drawing Tools links als Toolbar
      Darunter: Volume-Bars

    [ORDER BUCH -- 15%]
      Asks (rot) oben, absteigend
      Spread-Anzeige in der Mitte
      Bids (gruen) unten, aufsteigend
      Depth-Visualization als Balken

    [ORDER PANEL -- 20%]
      Tab-Toggle: Market | Limit | Stop
      [Buy/Sell Toggle -- Gruen/Rot]
      Input: Preis (bei Limit)
      Input: Menge
      Slider: 25% | 50% | 75% | 100%
      Gebuehren-Anzeige
      [GROSSER BUTTON: "Buy BTC" oder "Sell BTC"]
      Farbe wechselt je nach Richtung

  [UNTERER BEREICH -- Tabs]
    Tab: Offene Orders | Order-History | Trades | Assets
    Tabelle mit entsprechenden Daten
```

### 3.4 Bot Konfiguration `/bots/create`

```
[STEP-WIZARD -- 4 Steps oben als Progress Bar]
  Step 1: Strategie ● ─── Step 2: Parameter ○ ─── Step 3: Risiko ○ ─── Step 4: Review ○

[STEP 1: STRATEGIE WAEHLEN]
  Grid mit Strategie-Cards:
    - Grid Trading
    - DCA (Dollar Cost Averaging)
    - Momentum
    - Mean Reversion
    - Custom (Code-Editor)
  Jede Card: Icon, Name, kurze Beschreibung, Schwierigkeits-Badge
  Hover: Card hebt sich, Glow-Border erscheint

[STEP 2: PARAMETER]
  Dynamisches Formular je nach gewaehlter Strategie
  Beispiel Grid Bot:
    Exchange:       [Dropdown: Binance ▼]
    Pair:           [Dropdown: BTC/USDT ▼]
    Grid Range:     [Slider: $60,000 - $75,000]
    Grid Lines:     [Number Input: 20]
    Investment:     [Input: $1,000]
    Daneben: Live-Preview als Mini-Chart mit Grid-Lines eingezeichnet

[STEP 3: RISIKO-MANAGEMENT]
    Stop Loss:      [Toggle + Input: -10%]
    Take Profit:    [Toggle + Input: +50%]
    Max Drawdown:   [Slider: 15%]
    Position Size:  [Slider: 2% of Portfolio]
    Visueller Risk-Score: Meter von "Konservativ" bis "Aggressiv"

[STEP 4: REVIEW & START]
    Zusammenfassung aller Einstellungen
    Geschaetzte Performance (Backtest-Ergebnis)
    [Button: "Bot Starten" -- gross, gruen, glow]
    [Button: "Erst Backtest ausfuehren" -- sekundaer]
```

### 3.5 Strategie-Marktplatz `/marketplace`

```
[HEADER]
  Titel: "Strategie-Marktplatz"
  Suchfeld gross mittig
  Filter-Row: Kategorie | Zeitraum | Min. ROI | Risiko-Level | Sortierung

[FEATURED SECTION]
  3 grosse Hero-Cards horizontal (Glassmorphism, Gradient-Border)
  "Top Performer der Woche"
  Jede Card: Strategie-Name, Creator-Avatar, ROI-Chart, Key-Metriken

[STRATEGIE-GRID -- 3 Spalten, infinite scroll]
  Pro Card:
    [Header: Strategie-Name + Creator]
    [Mini Equity-Curve Chart]
    [Metriken-Row:]
      ROI: +234%  |  Sharpe: 1.8  |  Trades: 1,240
      Win Rate: 64%  |  Max DD: -12%
    [Tags: #momentum #btc #medium-risk]
    [Footer: Preis "49 USDT/Monat" | Button "Details"]
    Hover: Leichter Scale + Glow

[SIDEBAR FILTER (Desktop)]
  Kategorie-Checkboxen
  Preis-Range Slider
  Performance-Filter
  Exchange-Kompatibilitaet
```

### 3.6 Copy Trading `/copy`

```
[HEADER]
  Titel: "Copy Trading"
  Subtitle: "Folge den besten Tradern. Automatisch."

[TOP TRADER PODIUM -- Featured]
  3 Trader-Cards gross dargestellt (1. Platz in der Mitte, groesser)
  Gold/Silber/Bronze Akzent
  Jede Card: Avatar, Name, Flagge, ROI, Follower-Count, Copy-Button

[FILTER BAR]
  Zeitraum: 7D | 30D | 90D | 1Y
  Sortierung: ROI | Sharpe | Follower | Win Rate
  Min. Trade-History: 30 Tage+
  Risiko-Level Filter

[TRADER RANKING TABELLE]
  Spalten:
    Rang | Trader (Avatar+Name) | 30d ROI | Sharpe | Win Rate |
    Max DD | Follower | AUM | [Copy Button]

  Jede Zeile:
    - ROI in gruen/rot mit Mono-Font
    - Mini-Sparkline neben ROI
    - Copy-Button: "Kopieren" -> oeffnet Konfigurations-Modal

[AKTIVE KOPIEN PANEL (unten)]
  Titel: "Deine aktiven Copy-Trades"
  Tabelle: Trader | Seit | Investiert | PnL | Status | [Stop Button]
```

### 3.7 Trader Profil `/copy/:id`

```
[PROFIL HEADER]
  Grosser Banner (dunkel, Gradient)
  Avatar (gross, rund, Glow-Border)
  Name + Verifiziert-Badge
  Bio-Text
  Metriken-Row: Follower | AUM | Trades | Seit
  [Button: "Trader kopieren" -- gross, gruen]
  [Button: "Folgen" -- sekundaer]

[PERFORMANCE SECTION]
  [Equity Curve -- grosser Chart]
    Zeitraum-Toggle
    Vergleich mit BTC-Performance als zweite Linie

  [STATS GRID -- 6 Cards]
    Gesamt-ROI | Monats-Avg | Best Month | Worst Month |
    Sharpe Ratio | Max Drawdown

[TRADE HISTORY]
  Tabelle der letzten 50 Trades
  Pair | Richtung | Entry | Exit | PnL | Dauer
  Filterbar nach Gewinn/Verlust

[REVIEWS]
  Sterne-Rating + Kommentare von Followern
```

### 3.8 Einstellungen `/settings`

```
[TABS: Profil | API Keys | Benachrichtigungen | Sicherheit | Billing]

[PROFIL TAB]
  Avatar-Upload
  Name, E-Mail, Timezone
  Waehrungs-Praeferenz

[API KEYS TAB]
  Exchange-Verbindungen
  Pro Exchange: Logo + Name + Status (verbunden/nicht verbunden)
  "API Key hinzufuegen" Button -> Modal mit Eingabefeldern
  Sicherheitshinweis: "Nur Trading-Permissions, kein Withdrawal"

[BENACHRICHTIGUNGEN]
  Toggle-Liste:
    Trade ausgefuehrt | Bot gestoppt | Grosser Verlust |
    Copy-Trader Aktion | Neue Strategie (Watchlist)
  Kanaele: E-Mail | Push | Telegram

[SICHERHEIT]
  2FA aktivieren/deaktivieren
  Session-Management
  Login-History
```

---

## 4. Component Library Plan

### 4.1 Atoms (Basis-Elemente)

| Component | Varianten |
|---|---|
| `Button` | primary, secondary, danger, ghost, icon-only; Sizes: sm, md, lg |
| `Input` | text, number, password, search; mit Label, Error, Prefix/Suffix |
| `Badge` | success, warning, danger, info, premium; solid, outline |
| `Avatar` | Sizes: xs, sm, md, lg, xl; mit Online-Dot |
| `Icon` | Lucide Icons, 16/20/24px |
| `Spinner` | sm, md, lg; overlay Variante |
| `Toggle` | Default, mit Label |
| `Slider` | Single, Range, mit Value-Tooltip |
| `Tooltip` | Top, Right, Bottom, Left |
| `Tag` | Farbig, entfernbar, klickbar |

### 4.2 Molecules (Zusammengesetzte Elemente)

| Component | Beschreibung |
|---|---|
| `StatCard` | Label + grosse Zahl + Sparkline + Veraenderung (%) |
| `TradeRow` | Asset-Icon + Pair + Richtung + PnL (farbig) + Zeitstempel |
| `BotStatusCard` | Name + Status-Dot + Strategie + PnL + Toggle |
| `PairSelector` | Dropdown mit Suche, Favoriten, letzte Paare |
| `OrderForm` | Buy/Sell Toggle + Inputs + Slider + Submit |
| `PriceDisplay` | Grosser Preis in Mono + Change-Badge |
| `TraderCard` | Avatar + Name + ROI + Sparkline + Copy-Button |
| `StrategyCard` | Name + Creator + Mini-Chart + Metriken + Preis |
| `NotificationItem` | Icon + Titel + Text + Zeitstempel + unread-Dot |
| `SearchBar` | Icon + Input + Keyboard-Shortcut Badge (Cmd+K) |

### 4.3 Organisms (Komplexe Bloecke)

| Component | Beschreibung |
|---|---|
| `Sidebar` | Navigation, collapsible, mit Active-State |
| `TopBar` | Breadcrumb + Search + Notifications + User-Menu |
| `ChartWidget` | TradingView Integration + Timeframe + Indikatoren |
| `OrderBook` | Asks/Bids Tabelle mit Depth-Bars |
| `PositionsTable` | Sortierbare Tabelle mit Live-PnL Updates |
| `BotWizard` | Multi-Step Formular mit Validierung |
| `TraderRanking` | Sortierbare Tabelle mit Filtern und Pagination |
| `MarketplaceGrid` | Responsive Grid mit Filtern und Infinite Scroll |
| `EquityCurve` | Area-Chart mit Gradient, Zeitraum-Toggle |
| `PortfolioPie` | Donut-Chart mit Asset-Verteilung |
| `CommandPalette` | Cmd+K Modal, globale Suche ueber alle Features |

### 4.4 Templates (Seiten-Layouts)

| Template | Beschreibung |
|---|---|
| `DashboardLayout` | Sidebar + TopBar + Content Area |
| `FullscreenLayout` | Minimale Sidebar + maximaler Content (fuer Trading) |
| `AuthLayout` | Zentriertes Card auf dunklem Hintergrund |
| `MarketingLayout` | Full-Width, kein Sidebar, eigene Navbar |

---

## 5. Mobile-First Responsive Strategie

### 5.1 Breakpoints

```css
--mobile:  0 - 639px
--tablet:  640px - 1023px
--desktop: 1024px - 1439px
--wide:    1440px+
```

### 5.2 Mobile Anpassungen

**Navigation:**
- Sidebar wird zu Bottom Tab Bar (5 Tabs)
- Sekundaere Navigation ueber Hamburger-Menu

**Dashboard:**
- Stats-Row: 2x2 Grid statt 4 Spalten
- Chart: Full-Width, Touch-optimiert
- Positionen: Horizontaler Scroll oder Card-View statt Tabelle

**Trading Terminal:**
- Chart: Full-Width, 60% der Hoehe
- Order-Panel: Unten als Slide-Up Sheet
- Order-Buch: Hinter Tab versteckt
- Pair-Selector: Full-Screen Modal

**Tabellen:**
- Unter 640px: Tabellen werden zu gestapelten Cards
- Jede Zeile wird zu einer Mini-Card mit Key-Value Paaren
- Wichtigste Info (Pair, PnL) prominent oben

**Marketplace:**
- Grid: 1 Spalte statt 3
- Filter: Slide-Out Drawer statt Sidebar

### 5.3 Touch-Optimierung

- Minimum Touch-Target: 44x44px
- Swipe-Gesten: Links/Rechts auf Trade-Cards fuer Quick Actions
- Pull-to-Refresh auf allen Listen
- Haptic Feedback bei Trade-Ausfuehrung (wenn unterstuetzt)

---

## 6. Animation & Interaction Konzept

### 6.1 Micro-Interactions

| Element | Animation | Dauer | Easing |
|---|---|---|---|
| Button Hover | Scale 1.02 + Glow intensiviert | 200ms | ease-out |
| Button Click | Scale 0.97 -> 1.0 | 150ms | ease-in-out |
| Card Hover | translateY(-2px) + Shadow erhoehen | 250ms | ease-out |
| Toggle | Slide + Farbwechsel | 200ms | spring |
| Tab Switch | Underline-Bar slides | 300ms | ease-in-out |
| Notification | Slide-in von rechts + Fade | 400ms | ease-out |
| Modal Open | Scale 0.95 -> 1.0 + Fade | 250ms | ease-out |
| Modal Close | Scale 1.0 -> 0.95 + Fade | 200ms | ease-in |
| Sidebar Toggle | Width-Transition | 300ms | ease-in-out |

### 6.2 Data Animations

| Element | Animation |
|---|---|
| Preis-Update | Kurzer gruen/rot Flash auf der Zahl |
| PnL-Change | Zaehlt hoch/runter (CountUp) |
| Chart Load | Line zeichnet sich von links nach rechts |
| Sparkline | Fade-in mit leichter Verzoegerung |
| Trade ausgefuehrt | Konfetti-artige Partikel (dezent) bei Gewinn |
| Bot gestartet | Pulsierende Glow-Animation auf Status-Dot |

### 6.3 Page Transitions

```
Seitenwechsel: Fade + leichter Slide (200ms)
Content Load:  Skeleton-Screens mit Shimmer-Effekt
Infinite Scroll: Items faden einzeln ein (staggered, 50ms delay)
```

### 6.4 Skeleton Screens

Jede Seite hat ein eigenes Skeleton-Layout:
- Graue Bloecke in `--bg-tertiary` mit Shimmer-Animation
- Exakt gleiche Dimensionen wie der echte Content
- Verhindert Layout-Shifts beim Laden

### 6.5 Sound Design (Optional)

- Trade ausgefuehrt: Subtiler "Cha-ching" Sound
- Bot-Alert: Dezenter Notification-Ton
- Alle Sounds defaultmaessig aus, aktivierbar in Settings

---

## 7. Besondere Design-Elemente

### 7.1 Glassmorphism Cards

```css
.glass-card {
  background: rgba(18, 18, 26, 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}
```

### 7.2 Neon Glow Effekte

```css
.glow-green {
  box-shadow: 0 0 20px rgba(0, 255, 136, 0.3),
              0 0 60px rgba(0, 255, 136, 0.1);
}

.glow-text {
  text-shadow: 0 0 10px rgba(0, 255, 136, 0.5),
               0 0 40px rgba(0, 255, 136, 0.2);
}
```

### 7.3 Gradient Borders (Premium Feel)

```css
.premium-border {
  position: relative;
  background: var(--bg-secondary);
  border-radius: 10px;
}
.premium-border::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: 11px;
  background: linear-gradient(135deg, #00FF88, #00D4FF);
  z-index: -1;
  opacity: 0.5;
}
```

### 7.4 Animated Background (Landing Page)

```
Subtiles Particle-Grid im Hintergrund
Langsam pulsierende Punkte mit Verbindungslinien
Reagiert leicht auf Mausbewegung (Parallax)
Farbe: sehr gedaempftes Gruen/Cyan
```

---

## 8. Technische Umsetzung

### 8.1 Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS + CSS Custom Properties
- **Charts:** Lightweight Charts (TradingView) + Recharts fuer einfache Charts
- **Animationen:** Framer Motion
- **Icons:** Lucide React
- **State:** Zustand
- **Echtzeit:** WebSockets fuer Live-Preise und Order-Updates

### 8.2 Performance-Ziele

- First Contentful Paint: < 1.2s
- Time to Interactive: < 2.5s
- Cumulative Layout Shift: < 0.1
- Chart-Rendering: < 500ms
- WebSocket-Latenz: < 100ms

### 8.3 Accessibility

- WCAG 2.1 AA Konformitaet (soweit bei Dark Mode moeglich)
- Kontrastratio minimum 4.5:1 fuer Text
- Keyboard-Navigation vollstaendig
- Screen-Reader Labels fuer alle interaktiven Elemente
- Focus-Visible Styles mit gruener Outline

---

## 9. Design Tokens (Zusammenfassung)

Alle Werte als CSS Custom Properties auf `:root` definiert. Ermoeglicht spaeter leicht Theming oder einen Light-Mode (falls gewuenscht, aber Default = Dark).

```css
:root {
  /* Colors */
  --bg-primary: #0A0A0F;
  --bg-secondary: #12121A;
  --bg-tertiary: #1A1A26;
  --bg-elevated: #22222E;
  --accent-primary: #00FF88;
  --accent-secondary: #00D4FF;
  --accent-warning: #FFB800;
  --accent-danger: #FF3366;
  --accent-purple: #8B5CF6;
  --text-primary: #F0F0F5;
  --text-secondary: #8888A0;
  --text-muted: #555566;

  /* Typography */
  --font-sans: 'Inter', -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

  /* Spacing */
  --space-unit: 8px;

  /* Radius */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;

  /* Transitions */
  --transition-fast: 150ms ease-out;
  --transition-base: 250ms ease-out;
  --transition-slow: 400ms ease-out;

  /* Z-Index Scale */
  --z-sidebar: 100;
  --z-topbar: 200;
  --z-dropdown: 300;
  --z-modal-backdrop: 400;
  --z-modal: 500;
  --z-toast: 600;
  --z-command-palette: 700;
}
```
