# Trading Platform

Automated crypto trading platform with bots, strategies, backtesting, and copy trading.

## Tech Stack

- **Monorepo:** Turborepo + pnpm workspaces
- **Frontend:** Next.js 14 (App Router), Tailwind CSS, shadcn/ui, TanStack Query
- **Database:** PostgreSQL 16 + TimescaleDB, Prisma ORM
- **Cache/PubSub:** Redis 7
- **Language:** TypeScript

## Structure

```
trading-platform/
├── apps/
│   └── web/              # Next.js frontend
├── packages/
│   ├── types/            # Shared TypeScript interfaces
│   ├── config/           # Shared tsconfig & eslint
│   └── db/               # Prisma schema & client
├── docker-compose.yml    # PostgreSQL + Redis
└── turbo.json            # Turborepo config
```

## Getting Started

```bash
# Install dependencies
pnpm install

# Start databases
docker compose up -d

# Generate Prisma client
pnpm db:generate

# Push schema to database
pnpm db:push

# Start development
pnpm dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in development mode |
| `pnpm build` | Build all packages and apps |
| `pnpm lint` | Lint all packages |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:push` | Push schema to database |
| `pnpm db:studio` | Open Prisma Studio |
