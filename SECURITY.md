# Security Konzept — Crypto Trading Platform

**Version:** 1.0
**Datum:** 2026-03-23
**Standort:** EU / Österreich
**Klassifikation:** Vertraulich

---

## Inhaltsverzeichnis

1. [Threat Model](#1-threat-model)
2. [API Key Encryption](#2-api-key-encryption)
3. [Authentication & Authorization](#3-authentication--authorization)
4. [Data Protection / DSGVO](#4-data-protection--dsgvo-compliance)
5. [Rate Limiting & DDoS Protection](#5-rate-limiting--ddos-protection)
6. [Audit Logging](#6-audit-logging)
7. [Secrets Management](#7-secrets-management)
8. [Incident Response Plan](#8-incident-response-plan)
9. [SSL/TLS, CORS, CSP Headers](#9-ssltls-cors-csp-headers)
10. [Third-Party Risk](#10-third-party-risk)

---

## 1. Threat Model

### 1.1 Assets (Was schützen wir?)

| Asset | Kritikalität | Beschreibung |
|-------|-------------|--------------|
| Exchange API Keys | **KRITISCH** | Ermöglichen Zugriff auf echtes Geld der User |
| User-Kontodaten | HOCH | E-Mail, Name, Zahlungsdaten |
| Trading Bot Konfigurationen | HOCH | Strategien, Parameter, Positionen |
| Stripe Payment Data | HOCH | Abo-Daten, Zahlungshistorie |
| Copy Trading Signale | MITTEL | Trader-Strategien, Performance-Daten |
| Session Tokens | HOCH | Zugang zu authentifizierten Sessions |

### 1.2 Angriffsvektoren

#### A — Externe Angriffe

| # | Vektor | Risiko | Beschreibung |
|---|--------|--------|--------------|
| A1 | **API Key Theft** | KRITISCH | Angreifer exfiltriert gespeicherte Exchange API Keys und leert Wallets |
| A2 | **Account Takeover** | KRITISCH | Credential Stuffing, Phishing, Session Hijacking |
| A3 | **SQL Injection / NoSQL Injection** | HOCH | Zugriff auf Datenbank mit allen Keys |
| A4 | **XSS (Cross-Site Scripting)** | HOCH | Session-Token stehlen, Phishing im UI |
| A5 | **CSRF** | HOCH | Ungewollte Trades oder Bot-Konfigurationsänderungen |
| A6 | **DDoS** | HOCH | Plattform offline = Bots können nicht reagieren = Geldverlust |
| A7 | **Man-in-the-Middle** | MITTEL | Abfangen von API-Kommunikation |
| A8 | **Brute Force auf Login** | MITTEL | Zugang zu Accounts |
| A9 | **Supply Chain Attack** | MITTEL | Kompromittierte npm/pip Packages |

#### B — Interne Angriffe

| # | Vektor | Risiko | Beschreibung |
|---|--------|--------|--------------|
| B1 | **Insider Threat** | KRITISCH | Mitarbeiter mit DB-Zugang liest API Keys |
| B2 | **Privilege Escalation** | HOCH | User wird Admin, greift auf fremde Keys zu |
| B3 | **Rogue Trading Bot** | HOCH | Manipulierter Bot führt unauthorisierte Trades aus |

#### C — Business Logic Angriffe

| # | Vektor | Risiko | Beschreibung |
|---|--------|--------|--------------|
| C1 | **Copy Trading Manipulation** | HOCH | Trader manipuliert Signale zum eigenen Vorteil (Front-Running) |
| C2 | **Abo-Bypass** | MITTEL | User umgeht Stripe-Zahlungen, nutzt Premium-Features gratis |
| C3 | **Bot Parameter Tampering** | HOCH | Manipulation von Trade-Größen, Stop-Losses über API |
| C4 | **Race Conditions** | HOCH | Gleichzeitige Trades erzeugen inkonsistente Zustände |

#### D — Infrastruktur

| # | Vektor | Risiko | Beschreibung |
|---|--------|--------|--------------|
| D1 | **Datenbank-Leak** | KRITISCH | Kompletter Dump mit verschlüsselten Keys |
| D2 | **Server Compromise** | KRITISCH | Zugang zu Encryption Keys im Memory |
| D3 | **Log Leakage** | HOCH | API Keys oder Tokens landen in Logfiles |

---

## 2. API Key Encryption

### 2.1 Architektur — Envelope Encryption

Exchange API Keys sind das kritischste Asset. Wir verwenden **Envelope Encryption** mit einem HSM/KMS.

```
┌─────────────────────────────────────────────────┐
│                    User gibt API Key ein         │
│                         │                        │
│                         ▼                        │
│              ┌─────────────────────┐             │
│              │  Frontend (Browser) │             │
│              │  Key wird NICHT     │             │
│              │  im Frontend        │             │
│              │  gespeichert        │             │
│              └────────┬────────────┘             │
│                       │ TLS 1.3                  │
│                       ▼                          │
│              ┌─────────────────────┐             │
│              │  Backend API        │             │
│              │  (API Key Service)  │             │
│              └────────┬────────────┘             │
│                       │                          │
│                       ▼                          │
│    ┌──────────────────────────────────────┐      │
│    │  1. Generiere Data Encryption Key   │      │
│    │     (DEK) — AES-256-GCM            │      │
│    │  2. Verschlüssle API Key mit DEK    │      │
│    │  3. Sende DEK an KMS zur            │      │
│    │     Verschlüsselung mit KEK         │      │
│    │  4. Speichere:                       │      │
│    │     - Encrypted API Key (DB)        │      │
│    │     - Encrypted DEK (DB)            │      │
│    │     - KEK bleibt im KMS             │      │
│    └──────────────────────────────────────┘      │
└─────────────────────────────────────────────────┘
```

### 2.2 Verschlüsselungs-Implementierung

```
Algorithmus:         AES-256-GCM (authenticated encryption)
Key Derivation:      HKDF-SHA256 für DEKs
KMS:                 AWS KMS oder HashiCorp Vault Transit
IV/Nonce:            96-bit, zufällig pro Verschlüsselung
Key Rotation:        KEK alle 90 Tage, automatisch
DEK pro User:        Jeder User hat eigenen DEK
```

### 2.3 Datenbank-Schema für API Keys

```sql
CREATE TABLE exchange_api_keys (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID NOT NULL REFERENCES users(id),
    exchange          VARCHAR(20) NOT NULL,  -- 'coinbase' | 'binance'
    encrypted_api_key BYTEA NOT NULL,        -- AES-256-GCM verschlüsselt
    encrypted_secret  BYTEA NOT NULL,        -- AES-256-GCM verschlüsselt
    encrypted_dek     BYTEA NOT NULL,        -- DEK verschlüsselt mit KEK
    kms_key_version   INTEGER NOT NULL,      -- KEK Version für Rotation
    iv                BYTEA NOT NULL,        -- Initialisierungsvektor
    auth_tag          BYTEA NOT NULL,        -- GCM Authentication Tag
    permissions       JSONB NOT NULL,        -- {'trade': true, 'withdraw': false}
    ip_whitelist      INET[],                -- Exchange-seitige IP-Whitelist
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    rotated_at        TIMESTAMPTZ,
    is_active         BOOLEAN DEFAULT true
);

-- KEIN Klartext-Key wird jemals gespeichert
-- KEIN Key landet in Logs (siehe Audit Logging)
```

### 2.4 Wichtige Regeln

1. **Withdraw-Permission NIEMALS aktivieren** — API Keys dürfen nur `trade` und `read` Permissions haben
2. **IP-Whitelisting auf Exchange-Seite** — Keys nur von unseren Server-IPs nutzbar
3. **Key wird nach Eingabe nie wieder angezeigt** — User kann nur "letzten 4 Zeichen" sehen
4. **Decryption nur im isolierten Trading-Service** — kein anderer Service hat Zugriff auf den KMS Key
5. **Memory Wiping** — Entschlüsselte Keys werden nach Verwendung aus dem RAM gelöscht (zeroize)

---

## 3. Authentication & Authorization

### 3.1 Authentication Stack

```
┌─────────────────────────────────────────┐
│            Authentication Flow          │
│                                         │
│  1. Login: E-Mail + Passwort            │
│     → bcrypt (cost factor 12)           │
│     → Rate Limited (5 Versuche/15 Min)  │
│                                         │
│  2. MFA: TOTP (Pflicht für alle User)   │
│     → Google Authenticator / Authy      │
│     → Backup Codes (10 Stück, hashed)   │
│                                         │
│  3. Session: JWT (Access + Refresh)     │
│     → Access Token: 15 Min Lifetime     │
│     → Refresh Token: 7 Tage, rotierend  │
│     → Stored in HttpOnly Secure Cookie  │
│                                         │
│  4. Kritische Aktionen: Re-Auth         │
│     → API Key hinzufügen → MFA erneut   │
│     → Bot starten → MFA erneut          │
│     → Passwort ändern → MFA erneut      │
│     → Abo kündigen → Passwort erneut    │
└─────────────────────────────────────────┘
```

### 3.2 Authorization — RBAC (Role-Based Access Control)

| Rolle | Rechte |
|-------|--------|
| `user` | Eigene Bots verwalten, eigene Trades sehen, Copy Trading nutzen |
| `trader` | Alles von `user` + Signale veröffentlichen, Follower sehen, Provision einsehen |
| `admin` | User-Management, Plattform-Statistiken, Support-Zugang (KEIN Zugriff auf API Keys) |
| `super_admin` | Alles von `admin` + KMS-Zugang, Infrastruktur, Incident Response |
| `trading_service` | Service Account — darf API Keys entschlüsseln und Trades ausführen |

### 3.3 Authorization Policies

```
Policy: API Key Access
  - ONLY trading_service kann Keys entschlüsseln
  - Admins sehen NUR Metadaten (Exchange, letzte 4 Zeichen, Erstelldatum)
  - User sehen NUR ihre eigenen Keys

Policy: Bot Management
  - User kann NUR eigene Bots starten/stoppen
  - Bot-Parameter-Änderungen erfordern MFA Re-Auth
  - Max Trade Size wird server-seitig validiert

Policy: Copy Trading
  - Trader kann eigene Signale NUR veröffentlichen, NICHT anderer Trader Signale sehen
  - Follower-Liste ist für Trader pseudonymisiert
  - Provision wird server-seitig berechnet, nicht client-seitig
```

### 3.4 Session Security

- **HttpOnly + Secure + SameSite=Strict** Cookies
- **Fingerprinting:** User-Agent + IP-Range zur Session gebunden
- **Concurrent Session Limit:** Max 3 aktive Sessions
- **Force Logout:** Bei Passwortänderung werden alle Sessions invalidiert
- **Idle Timeout:** 30 Minuten Inaktivität = automatischer Logout

---

## 4. Data Protection / DSGVO Compliance

### 4.1 Rechtsgrundlage (Art. 6 DSGVO)

| Daten | Rechtsgrundlage | Zweck |
|-------|----------------|-------|
| E-Mail, Name | Art. 6(1)(b) Vertragserfüllung | Account-Verwaltung |
| Exchange API Keys | Art. 6(1)(b) Vertragserfüllung | Trading-Service Bereitstellung |
| Zahlungsdaten | Art. 6(1)(b) Vertragserfüllung | Abo-Abrechnung via Stripe |
| IP-Adressen, Logs | Art. 6(1)(f) Berechtigtes Interesse | Sicherheit, Missbrauchserkennung |
| Trading-Historie | Art. 6(1)(b) Vertragserfüllung | Service-Erbringung, Audit |

### 4.2 Datenkategorien & Speicherfristen

| Kategorie | Speicherfrist | Löschung |
|-----------|--------------|----------|
| Account-Daten | Bis Konto-Löschung + 30 Tage | Automatisiert |
| Exchange API Keys | Bis User löscht oder Konto-Löschung | Sofortige Löschung aus DB + KMS |
| Trading-Logs | 7 Jahre (steuerliche Aufbewahrung AT) | Automatisiert nach Frist |
| Audit Logs | 3 Jahre | Automatisiert |
| Session Daten | Max 7 Tage | Automatisiert |
| Stripe Zahlungsdaten | Bei Stripe gespeichert, wir halten nur Referenz-IDs | N/A |

### 4.3 DSGVO-Rechte Implementierung

| Recht | Umsetzung |
|-------|-----------|
| **Auskunft (Art. 15)** | Self-Service Export im Dashboard (JSON/CSV) |
| **Löschung (Art. 17)** | Account-Löschung löscht alle Daten, API Keys werden sofort aus KMS gelöscht |
| **Berichtigung (Art. 16)** | Profil-Bearbeitung im Dashboard |
| **Datenportabilität (Art. 20)** | Export aller Daten im maschinenlesbaren Format |
| **Widerspruch (Art. 21)** | Opt-out für nicht-essenzielle Verarbeitung |

### 4.4 Datenschutz-Technische Maßnahmen

- **Encryption at Rest:** AES-256 für alle Datenbanken
- **Encryption in Transit:** TLS 1.3 überall
- **Pseudonymisierung:** User-IDs statt Namen in Logs
- **Datensparsamkeit:** Nur absolut notwendige Daten erheben
- **Auftragsverarbeitung:** AVV mit Stripe, AWS/Cloud-Provider, Exchange-APIs
- **DPO (Datenschutzbeauftragter):** Bei >250 Mitarbeitern oder hohem Risiko Pflicht — bei Finanz-Daten empfohlen
- **DPIA (Datenschutz-Folgenabschätzung):** Erforderlich wegen automatisierter Verarbeitung von Finanzdaten

### 4.5 Hosting & Datenresidenz

- **Hosting:** EU-Region (AWS eu-central-1 Frankfurt oder eu-west-1 Irland)
- **Kein Datentransfer in Drittländer** ohne Angemessenheitsbeschluss
- **Stripe:** EU-Datenverarbeitung aktiviert
- **Backups:** Verschlüsselt, ebenfalls in EU-Region

---

## 5. Rate Limiting & DDoS Protection

### 5.1 Rate Limiting Strategie

```
┌─────────────────────────────────────────────────────┐
│                Rate Limiting Layers                 │
│                                                     │
│  Layer 1: CDN/Edge (Cloudflare)                     │
│  ├── Global: 1000 req/min pro IP                    │
│  ├── Login: 5 req/min pro IP                        │
│  └── API: 100 req/min pro IP                        │
│                                                     │
│  Layer 2: API Gateway (nginx/Kong)                  │
│  ├── Authenticated: 200 req/min pro User            │
│  ├── Trading API: 30 req/min pro User               │
│  └── Webhook Endpoints: IP-Whitelist                │
│                                                     │
│  Layer 3: Application Level                         │
│  ├── Bot Start/Stop: 10 req/h pro User              │
│  ├── API Key CRUD: 5 req/h pro User                 │
│  ├── Password Reset: 3 req/h pro E-Mail             │
│  └── Copy Trading Subscribe: 20 req/h pro User      │
│                                                     │
│  Layer 4: Exchange API Rate Limits                  │
│  ├── Coinbase: Respektiere 10 req/s Limit           │
│  ├── Binance: Respektiere 1200 req/min Weight       │
│  └── Queue-basiertes Throttling pro User             │
└─────────────────────────────────────────────────────┘
```

### 5.2 DDoS Mitigation

- **Cloudflare Pro/Business** als Reverse Proxy
- **Bot Management** für automatisierte Angriffe
- **Challenge Pages** bei verdächtigem Traffic
- **Origin IP geheim halten** — nur Cloudflare-IPs erlaubt
- **Auto-Scaling** der Trading-Services bei Lastspitzen
- **Circuit Breaker** für Exchange-API-Aufrufe — wenn Exchange down, nicht endlos retrien

### 5.3 Brute Force Protection

```
Login:          5 Fehlversuche → 15 Min Lockout → CAPTCHA → Account Lock nach 20 Versuchen
MFA:            3 Fehlversuche → 5 Min Cooldown → Account Lock nach 10 Versuchen
API Key Entry:  3 Fehlversuche → Account Lock + Admin Notification
Password Reset: 3 Requests/Stunde → dann 24h Cooldown
```

---

## 6. Audit Logging

### 6.1 Was wird geloggt?

#### Trading Events (KRITISCH — jeder Trade muss nachvollziehbar sein)

```json
{
    "event_type": "TRADE_EXECUTED",
    "timestamp": "2026-03-23T14:30:00.123Z",
    "user_id": "uuid-pseudonymized",
    "bot_id": "uuid",
    "exchange": "binance",
    "trade": {
        "pair": "BTC/USDT",
        "side": "BUY",
        "amount": "0.01",
        "price": "67543.21",
        "order_type": "LIMIT",
        "exchange_order_id": "abc123"
    },
    "trigger": "bot_signal | copy_trade | manual",
    "copy_source_trader_id": "uuid | null",
    "ip_address": "hashed",
    "request_id": "correlation-uuid"
}
```

#### Security Events

| Event | Logged Fields |
|-------|--------------|
| `USER_LOGIN` | user_id, ip, user_agent, mfa_used, success/fail |
| `USER_LOGOUT` | user_id, session_duration |
| `MFA_ENABLED/DISABLED` | user_id, ip, timestamp |
| `API_KEY_ADDED` | user_id, exchange, key_last4, permissions |
| `API_KEY_DELETED` | user_id, exchange, key_last4 |
| `API_KEY_DECRYPTED` | service_id, user_id, purpose (trade execution) |
| `BOT_STARTED/STOPPED` | user_id, bot_id, config_hash |
| `BOT_CONFIG_CHANGED` | user_id, bot_id, changed_fields (NICHT die Werte) |
| `SUBSCRIPTION_CHANGED` | user_id, old_plan, new_plan |
| `COPY_TRADE_SUBSCRIBED` | follower_id, trader_id |
| `ADMIN_ACTION` | admin_id, target_user_id, action |
| `PERMISSION_DENIED` | user_id, resource, attempted_action |

### 6.2 Was wird NIEMALS geloggt?

- Klartext API Keys oder Secrets
- Passwörter (auch nicht gehashte)
- Vollständige IP-Adressen (nur gehashte oder /24 Subnets)
- Vollständige Request/Response Bodies mit sensitiven Daten
- Exchange API Responses mit Balance-Informationen

### 6.3 Log-Infrastruktur

```
Application → Structured JSON Logs → Fluentd/Vector
    → Elasticsearch (Hot: 30 Tage, Warm: 1 Jahr, Cold/S3: 7 Jahre)
    → Alerting via Grafana/PagerDuty bei Security Events
    → Tamper-evident: Logs sind append-only, signiert mit HMAC
```

### 6.4 Audit Trail für Compliance

- Alle Trading-Logs 7 Jahre aufbewahren (AT Steuerrecht)
- Logs sind **unveränderbar** (append-only Storage)
- Export-Funktion für Steuerberater (CSV/PDF)
- Jeder Log-Eintrag hat eine `correlation_id` für End-to-End Tracing

---

## 7. Secrets Management

### 7.1 Architektur

```
┌──────────────────────────────────────────┐
│         Secrets Management               │
│                                          │
│  ┌──────────────────────────────┐        │
│  │  HashiCorp Vault             │        │
│  │  oder AWS Secrets Manager    │        │
│  │                              │        │
│  │  Secrets:                    │        │
│  │  ├── DB Credentials          │        │
│  │  ├── Stripe API Keys         │        │
│  │  ├── KMS Master Key Ref      │        │
│  │  ├── JWT Signing Key         │        │
│  │  ├── Coinbase OAuth Secret   │        │
│  │  ├── Binance API Credentials │        │
│  │  ├── SMTP Credentials        │        │
│  │  └── Internal Service Tokens │        │
│  └──────────────────────────────┘        │
│                                          │
│  Regeln:                                 │
│  ✓ Secrets NIEMALS in Code/Repo          │
│  ✓ Secrets NIEMALS in Env Vars im       │
│    Klartext (Vault Agent injiziert)      │
│  ✓ Automatische Rotation alle 30 Tage   │
│  ✓ Least-Privilege Access Policies       │
│  ✓ Audit Log für jeden Secret-Zugriff    │
│  ✓ .env Dateien in .gitignore            │
└──────────────────────────────────────────┘
```

### 7.2 Secret Rotation Schedule

| Secret | Rotation | Methode |
|--------|----------|---------|
| DB Passwords | 30 Tage | Vault Dynamic Secrets |
| JWT Signing Key | 90 Tage | Key Pair Rotation mit Grace Period |
| KMS KEK | 90 Tage | AWS KMS Auto-Rotation |
| Stripe API Key | Bei Kompromittierung | Manuell + Vault Update |
| Service-to-Service Tokens | 24 Stunden | Vault Short-lived Tokens |
| TLS Certificates | 90 Tage | Let's Encrypt Auto-Renewal |

### 7.3 Entwickler-Regeln

1. **Pre-commit Hook:** `gitleaks` oder `trufflehog` scannt jeden Commit auf Secrets
2. **CI/CD Pipeline:** Secret-Scan als Pflicht-Step
3. **Kein Copy-Paste** von Secrets in Slack/Teams/Chat
4. **Kein Secret in Docker Images** — zur Laufzeit via Vault injiziert
5. **.env.example** mit Platzhaltern im Repo, **.env** in .gitignore

---

## 8. Incident Response Plan

### 8.1 Severity Levels

| Level | Beschreibung | Response Time | Beispiel |
|-------|-------------|---------------|----------|
| **SEV-1** | Aktiver Breach, Geldverlust möglich | **15 Minuten** | API Keys kompromittiert, unauthorized Trades |
| **SEV-2** | Sicherheitslücke entdeckt, kein aktiver Exploit | **1 Stunde** | SQL Injection gefunden, aber nicht ausgenutzt |
| **SEV-3** | Potentielles Risiko, keine unmittelbare Gefahr | **4 Stunden** | Verdächtige Login-Versuche, Dependency Vulnerability |
| **SEV-4** | Geringes Risiko, Best Practice Verletzung | **24 Stunden** | Fehlende Rate Limits auf internem Endpoint |

### 8.2 Incident Response Prozess

```
┌─────────────────────────────────────────────────────┐
│              Incident Response Flow                 │
│                                                     │
│  1. ERKENNUNG                                       │
│     ├── Automatisch: Alerting (Grafana/PagerDuty)   │
│     ├── Manuell: Security Review, Bug Bounty        │
│     └── Extern: User-Report, Exchange-Notification  │
│                                                     │
│  2. EINDÄMMUNG (sofort bei SEV-1)                   │
│     ├── Trading-Bots pausieren (Kill Switch)        │
│     ├── Betroffene API Keys invalidieren            │
│     ├── Sessions der betroffenen User terminieren   │
│     ├── Verdächtige IPs blockieren                  │
│     └── Exchange-APIs benachrichtigen               │
│                                                     │
│  3. ANALYSE                                         │
│     ├── Audit Logs auswerten                        │
│     ├── Angriffsvektor identifizieren               │
│     ├── Umfang des Schadens bestimmen               │
│     └── Betroffene User identifizieren              │
│                                                     │
│  4. BEHEBUNG                                        │
│     ├── Vulnerability patchen                       │
│     ├── Kompromittierte Secrets rotieren             │
│     ├── Betroffene User benachrichtigen              │
│     └── KEK Rotation wenn nötig                     │
│                                                     │
│  5. NACHBEREITUNG                                   │
│     ├── Post-Mortem schreiben                       │
│     ├── DSGVO: Meldung an Datenschutzbehörde        │
│     │   (innerhalb 72 Stunden bei Datenleck)        │
│     ├── Betroffene User informieren (Art. 34 DSGVO) │
│     └── Maßnahmen für Prävention implementieren     │
└─────────────────────────────────────────────────────┘
```

### 8.3 Kill Switch

Ein **globaler Kill Switch** muss implementiert werden:

```
/api/admin/emergency/stop-all-bots     → Stoppt ALLE Trading Bots sofort
/api/admin/emergency/revoke-sessions   → Invalidiert ALLE User Sessions
/api/admin/emergency/lock-platform     → Maintenance Mode, kein Trading möglich
```

- Auslösbar durch `super_admin` mit MFA
- Automatisch auslösbar bei bestimmten Anomalien (z.B. >50 fehlgeschlagene Key-Decryptions in 1 Minute)
- SMS/Telegram Alert an alle Admins bei Auslösung

### 8.4 DSGVO Incident Reporting

- **72-Stunden-Frist** für Meldung an Österreichische Datenschutzbehörde (dsb.gv.at)
- Melde-Template vorbereitet halten
- Betroffene User "ohne unangemessene Verzögerung" informieren
- Dokumentation aller Vorfälle auch wenn NICHT meldepflichtig

---

## 9. SSL/TLS, CORS, CSP Headers

### 9.1 TLS Konfiguration

```
Minimum Version:     TLS 1.2 (TLS 1.3 bevorzugt)
Cipher Suites:       Nur AEAD (AES-GCM, ChaCha20-Poly1305)
Key Exchange:        ECDHE (kein RSA Key Exchange)
Certificate:         Let's Encrypt oder DigiCert
HSTS:                max-age=31536000; includeSubDomains; preload
Certificate Pinning: NICHT empfohlen (zu fragil), stattdessen CAA DNS Records
OCSP Stapling:       Aktiviert
```

### 9.2 Security Headers

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Content-Security-Policy:   default-src 'self';
                           script-src 'self';
                           style-src 'self' 'unsafe-inline';
                           img-src 'self' data: https:;
                           connect-src 'self' https://api.stripe.com wss://stream.binance.com;
                           frame-src https://js.stripe.com;
                           object-src 'none';
                           base-uri 'self';
                           form-action 'self';
                           frame-ancestors 'none';
X-Content-Type-Options:    nosniff
X-Frame-Options:           DENY
X-XSS-Protection:          0  (deprecated, CSP übernimmt)
Referrer-Policy:           strict-origin-when-cross-origin
Permissions-Policy:        camera=(), microphone=(), geolocation=(),
                           payment=(self "https://js.stripe.com")
```

### 9.3 CORS Policy

```
Access-Control-Allow-Origin:      https://app.trading-platform.com (KEIN Wildcard *)
Access-Control-Allow-Methods:     GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers:     Content-Type, Authorization, X-CSRF-Token
Access-Control-Allow-Credentials: true
Access-Control-Max-Age:           3600

Webhooks (Stripe, Exchange):
  → Eigene Subdomain (webhooks.trading-platform.com)
  → CORS deaktiviert (Server-to-Server)
  → Signature Verification (Stripe-Signature Header, HMAC)
```

### 9.4 API-spezifische Sicherheit

- **CSRF Protection:** Double Submit Cookie Pattern oder Synchronizer Token
- **Content-Type Validation:** Nur `application/json` akzeptieren
- **Request Size Limit:** 1 MB max für API Requests
- **No JSONP:** Kein JSONP Support, nur JSON
- **API Versioning:** `/api/v1/` — alte Versionen nach Deprecation Period abschalten

---

## 10. Third-Party Risk

### 10.1 Exchange API Ausfälle

| Szenario | Risiko | Mitigation |
|----------|--------|------------|
| **Binance API Down** | Offene Positionen können nicht geschlossen werden | Circuit Breaker, lokaler Stop-Loss-Fallback, User-Benachrichtigung |
| **Coinbase API Down** | Trades werden nicht ausgeführt | Queue-System, Retry mit Backoff, User-Notification |
| **Rate Limit Hit** | Trades verzögert | Pro-User Queuing, Exchange Rate Limit Tracking |
| **API Breaking Change** | Bots funktionieren nicht mehr | API Version Pinning, automatisierte Integration Tests, Canary Deployments |
| **Exchange Hack/Insolvenz** | User verlieren Geld auf Exchange | Keine Funds auf Exchange halten, klare Haftungsausschlüsse in AGB |
| **Falsche Preisdaten** | Bot tradet zu falschem Preis | Price Sanity Checks (>5% Abweichung = Pause), Multi-Source Price Feeds |

### 10.2 Stripe Ausfälle

| Szenario | Mitigation |
|----------|------------|
| Stripe API Down | Webhook Retry Queue, Grace Period für Abos (48h) |
| Payment Failure | Dunning E-Mails, Bot-Pause nach 3 fehlgeschlagenen Zahlungen |
| Stripe Account Suspension | Backup Payment Processor evaluieren |

### 10.3 Dependency Security

```
Maßnahmen:
├── Dependabot / Renovate für automatische Updates
├── npm audit / pip audit in CI Pipeline
├── Lockfile (package-lock.json / poetry.lock) committen
├── Keine Wildcard-Versionen (^, ~) für kritische Packages
├── Supply Chain: Nur Packages mit >1000 weekly downloads
└── SBOM (Software Bill of Materials) generieren
```

### 10.4 Vendor Risk Assessment

Für jeden Third-Party Service muss dokumentiert sein:

| Vendor | Zweck | Daten | AVV | Fallback |
|--------|-------|-------|-----|----------|
| Binance | Exchange API | Trades, Balances | Nein (ToS) | Redundanter Exchange |
| Coinbase | Exchange API | Trades, Balances | Ja (EU) | Redundanter Exchange |
| Stripe | Payments | Zahlungsdaten | Ja (EU) | Backup Processor |
| AWS/Cloud | Hosting | Alles | Ja (EU) | Multi-Cloud Ready |
| Cloudflare | CDN/DDoS | Traffic Metadata | Ja (EU) | AWS CloudFront |
| Vault/KMS | Key Management | Encryption Keys | Ja (self-hosted möglich) | Local HSM |

---

## Zusammenfassung: Security Checkliste

### Vor Go-Live (Pflicht)

- [ ] Envelope Encryption für API Keys implementiert
- [ ] MFA für alle User erzwungen
- [ ] RBAC mit Least Privilege implementiert
- [ ] Rate Limiting auf allen Layers aktiv
- [ ] Audit Logging für alle Trades und Security Events
- [ ] DSGVO: Datenschutzerklärung, AVVs, Verarbeitungsverzeichnis
- [ ] TLS 1.2+ überall, Security Headers gesetzt
- [ ] Secrets in Vault, nicht in Code/Env
- [ ] Pre-commit Hooks für Secret Scanning
- [ ] Kill Switch implementiert und getestet
- [ ] Penetration Test durch externes Unternehmen
- [ ] DPIA durchgeführt
- [ ] Incident Response Plan dokumentiert und geübt
- [ ] Exchange API Failover getestet
- [ ] Backup & Recovery getestet

### Laufend

- [ ] Dependency Updates wöchentlich prüfen
- [ ] Security Audit quartalsweise
- [ ] Penetration Test jährlich
- [ ] Key Rotation läuft automatisch
- [ ] Audit Logs werden ausgewertet
- [ ] Incident Response Übungen halbjährlich
- [ ] DSGVO Verarbeitungsverzeichnis aktuell halten
