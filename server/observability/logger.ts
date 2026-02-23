export type LogLevel = "info" | "warn" | "error";

export const log = (level: LogLevel, message: string, context?: Record<string, unknown>) => {
  const payload = {
    ts: new Date().toISOString(),
    level,
    message,
    ...context
  };
  console[level](JSON.stringify(payload));
};
