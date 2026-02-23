const getEnv = (key: string, fallback?: string) => {
  const value = process.env[key] ?? fallback;
  if (!value) throw new Error(`Missing env var: ${key}`);
  return value;
};

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
  redisUrl: process.env.REDIS_URL,
  liveStaleSec: Number(process.env.LIVE_STALE_SEC ?? 120),
  revenueStaleSec: Number(process.env.REVENUE_STALE_SEC ?? 300)
};

export const requireEnv = getEnv;
