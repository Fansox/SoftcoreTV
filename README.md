# SoftcoreTV — Bolt Fleet TV Dashboard

## 1) High-level architecture summary
- **Next.js App Router (TypeScript + Tailwind + Framer Motion + Recharts)** for TV mode and operator mode UI.
- **Adapter-based integration layer** (`lib/integrations/bolt`) with:
  - `MockBoltProvider` (default)
  - `RealBoltProvider` placeholder with TODO endpoint mapping
- **Bolt OAuth2 client_credentials** via `BoltTokenManager` with proactive refresh + single-flight lock + 401 retry.
- **Realtime updates** via SSE (`/api/stream`) and backend poller (30s default) that refreshes normalized snapshots.
- **Persistence model** prepared in Prisma schema (PostgreSQL), Redis-ready config for cache/realtime evolution.
- **Observability** endpoints: `/api/health`, `/api/health/integrations`, `/api/metrics`.

## 2) File tree
```text
app/
  page.tsx
  city/[cityId]/page.tsx
  driver/[cityId]/[driverId]/page.tsx
  admin/page.tsx
  api/
    dashboard/route.ts
    stream/route.ts
    city/[cityId]/route.ts
    driver/[cityId]/[driverId]/route.ts
    health/route.ts
    health/integrations/route.ts
    metrics/route.ts
    auth/login/route.ts
components/
  dashboard/{kpiCard,revenueChart,cityGrid}.tsx
  ui/trendBadge.tsx
lib/
  integrations/bolt/{adapter.ts,index.ts,providers/*}
  services/boltTokenManager.ts
  utils/{comparison,mapping,stale,aggregation,format}.ts
  mock/{fixtures,generator}.ts
  types/domain.ts
prisma/{schema.prisma,seed.ts}
server/{jobs/sync.ts,store/state.ts,observability/logger.ts}
tests/*.test.ts
docker/{Dockerfile,nginx.conf}
docker-compose.yml
```

## 3) Step-by-step implementation
1. Install dependencies and run app in mock mode.
2. Start API + dashboard (SSE updates every 30s).
3. Use `/admin` to prepare connector/mapping workflows (TODO UI placeholders).
4. Add Bolt endpoints inside `RealBoltProvider` methods and mapping config.
5. Enable `DATA_PROVIDER=bolt` after setting OAuth credentials.

## 4) Environment variables
Copy `.env.example`.

Required for real Bolt provider:
- `BOLT_CLIENT_ID`
- `BOLT_CLIENT_SECRET`
- `BOLT_TOKEN_URL` (default `https://oidc.bolt.eu/token`)

## 5) Local development
```bash
npm install
npm run dev
```
Open `http://localhost:3000`.

## 6) Docker local deployment
```bash
docker compose up --build
```

## 7) Bolt field mapping and endpoint TODOs
- File: `lib/integrations/bolt/providers/realProvider.ts`
- Implement these methods by mapping Bolt responses into normalized domain interfaces:
  - `fetchCities`
  - `fetchCitySummary`
  - `fetchCityDrivers`
  - `fetchDriverDetail`
  - `fetchLiveStatuses`
  - `fetchRevenueSeries`

## 8) TV kiosk mode
- Keep `/` page on fullscreen (keyboard shortcut `F`).
- Auto refresh comes from SSE.
- Manual refresh shortcut: `R`.
- Escape fullscreen: `Esc`.

## 9) Production notes
- Put Next.js behind Nginx (example config in `docker/nginx.conf`).
- Enforce HTTPS termination at reverse proxy.
- Store secrets in secret manager/env (never client-side).
- Add Redis + BullMQ workers for production-grade polling fanout.

## 10) Tests
```bash
npm run test
```
Covers comparison fairness, mapping normalization, stale detection, aggregation, and trend indicator logic.
