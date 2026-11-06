/**
 * Read-only schema inspect. Never ALTER. Never init/seed.
 * Defaults to local SQLite. Refuses MySQL unless SCHEMA_CHECK_ALLOW_MYSQL=on
 * on an isolated staging database (not production).
 */
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const allowMysql = String(process.env.SCHEMA_CHECK_ALLOW_MYSQL || "").toLowerCase() === "on";

process.env.ALLOW_SQLITE = process.env.ALLOW_SQLITE || "on";

if (!allowMysql) {
  process.env.MYSQL_HOST = "";
  process.env.MYSQL_PORT = "";
  process.env.MYSQL_USER = "";
  process.env.MYSQL_PASSWORD = "";
  process.env.MYSQL_DATABASE = "";
  process.env.DATABASE_URL = "";
  process.env.DB_CLIENT = "";
  process.env.SQLITE_PATH = process.env.SQLITE_PATH || path.join(ROOT, "qrmenu.sqlite");
} else if (String(process.env.NODE_ENV || "").toLowerCase() === "production") {
  console.error("Refusing MySQL schema check while NODE_ENV=production.");
  process.exit(2);
}

const { db, getDbDriver } = await import("../database.js");
const { inspectRequiredSchema } = await import("../schemaAudit.js");

try {
  const driver = getDbDriver();
  if (driver === "mysql" && !allowMysql) {
    console.error("Refusing to inspect MySQL without SCHEMA_CHECK_ALLOW_MYSQL=on.");
    process.exit(2);
  }
  const report = await inspectRequiredSchema(db);
  console.log(
    JSON.stringify(
      {
        driver,
        sqlitePath: driver === "sqlite" ? process.env.SQLITE_PATH : undefined,
        ok: report.ok,
        hasMenuAppearanceJson: report.hasMenuAppearanceJson,
        missingTableCount: report.missingTables.length,
        missingColumnCount: report.missingColumns.length,
        missingTables: report.missingTables,
        missingColumns: report.missingColumns,
      },
      null,
      2
    )
  );
  process.exit(report.ok ? 0 : 1);
} finally {
  await db.destroy();
}
