const getEnv = (key: string, fallback?: string) => {
  const value = process.env[key] ?? fallback;
  if (!value) throw new Error(`Missing env var: ${key}`);
  return value;
};

const parseCsvNumbers = (value?: string) =>
  (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map(Number)
    .filter((item) => Number.isFinite(item));

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  appTimezone: process.env.APP_TIMEZONE ?? "Europe/Bratislava",
  locale: process.env.APP_LOCALE ?? "sk-SK",
  currency: process.env.APP_CURRENCY ?? "EUR",
  dataProvider: process.env.DATA_PROVIDER ?? "mock",
  jwtSecret: process.env.JWT_SECRET ?? "dev_secret_only",
  boltClientId: process.env.BOLT_CLIENT_ID,
  boltClientSecret: process.env.BOLT_CLIENT_SECRET,
  boltTokenUrl: process.env.BOLT_TOKEN_URL ?? "https://oidc.bolt.eu/token",
  boltFleetApiBaseUrl: process.env.BOLT_FLEET_API_BASE_URL ?? "https://node.bolt.eu/fleet-integration-gateway",
  boltCompanyIds: parseCsvNumbers(process.env.BOLT_COMPANY_IDS),
  redisUrl: process.env.REDIS_URL,
  liveStaleSec: Number(process.env.LIVE_STALE_SEC ?? 120),
  revenueStaleSec: Number(process.env.REVENUE_STALE_SEC ?? 300)
};

export const requireEnv = getEnv;
