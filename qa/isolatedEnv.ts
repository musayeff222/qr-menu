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

export function isolatedServerEnv(extra: Record<string, string | undefined>): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = { ...process.env };
  for (const key of MYSQL_KEYS) env[key] = "";
  return { ...env, ...extra };
}
