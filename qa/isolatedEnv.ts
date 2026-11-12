/** Strip remote DB env so isolated tests never touch live MySQL. */

const MYSQL_KEYS = [
  "MYSQL_HOST",
  "MYSQL_PORT",
  "MYSQL_USER",
  "MYSQL_PASSWORD",
  "MYSQL_DATABASE",
  "DATABASE_URL",
  "DB_CLIENT",
] as const;

/** Isolated tests only. Never used as a runtime fallback in the app. */
export const ISOLATED_ORDER_ACCESS_SECRET = "menugo-isolated-test-order-access-secret-do-not-use-in-prod";

export function isolatedServerEnv(extra: Record<string, string | undefined> = {}): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = { ...process.env };
  for (const key of MYSQL_KEYS) env[key] = "";
  if (extra.ORDER_ACCESS_SECRET === undefined && !String(env.ORDER_ACCESS_SECRET || "").trim()) {
    env.ORDER_ACCESS_SECRET = ISOLATED_ORDER_ACCESS_SECRET;
  }
  return { ...env, ...extra };
}
