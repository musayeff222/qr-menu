/** Production/staging safety flags. No secrets logged. */

export function envFlag(raw: string | undefined): boolean {
  const v = String(raw ?? "").trim().toLowerCase();
  return v === "on" || v === "1" || v === "true" || v === "yes";
}

export function envExplicitOff(raw: string | undefined): boolean {
  const v = String(raw ?? "").trim().toLowerCase();
  return v === "off" || v === "0" || v === "false" || v === "no";
}

export function isProductionRuntime(): boolean {
  return String(process.env.NODE_ENV || "").trim().toLowerCase() === "production";
}

/**
 * ALTER TABLE on boot.
 * Default: SQLite yes (local/dev), MySQL no.
 * Explicit DB_AUTO_MIGRATE=on|off overrides.
 */
export function isAutoMigrateEnabled(driver: "mysql" | "sqlite"): boolean {
  if (envFlag(process.env.DB_AUTO_MIGRATE)) return true;
  if (envExplicitOff(process.env.DB_AUTO_MIGRATE)) return false;
  return driver === "sqlite";
}

/**
 * Known demo/admin passwords (admin123 / demo123).
 * Production default: off. Local QA: on unless ALLOW_DEMO_SEED=off.
 */
export function isDemoSeedAllowed(): boolean {
  if (envFlag(process.env.ALLOW_DEMO_SEED)) return true;
  if (envExplicitOff(process.env.ALLOW_DEMO_SEED)) return false;
  if (isProductionRuntime()) return false;
  return true;
}

export function assertDatabaseDriverAllowed(driver: "mysql" | "sqlite"): void {
  if (driver === "mysql") return;
  if (!isProductionRuntime()) return;
  if (envFlag(process.env.ALLOW_SQLITE)) return;
  throw new Error(
    "Production refuses SQLite. Set MYSQL_HOST or DATABASE_URL. Local QA only: ALLOW_SQLITE=on."
  );
}

const FORBIDDEN_BOOTSTRAP = new Set(["admin123", "demo123", "demae123"]);

export function isForbiddenBootstrapPassword(plain: string): boolean {
  return FORBIDDEN_BOOTSTRAP.has(String(plain).trim().toLowerCase());
}

export function readAdminBootstrap(): { username: string; password: string } | null {
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD ?? "";
  if (!password) return null;
  if (isForbiddenBootstrapPassword(password)) {
    throw new Error("ADMIN_BOOTSTRAP_PASSWORD rejects known test passwords.");
  }
  const username = (process.env.ADMIN_BOOTSTRAP_USERNAME || "admin").trim() || "admin";
  return { username, password };
}
