import assert from "node:assert/strict";
import { spawn, type ChildProcess } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { after, test } from "node:test";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";
import { isolatedServerEnv } from "./isolatedEnv.js";
import {
  assertDatabaseDriverAllowed,
  isAutoMigrateEnabled,
  isDemoSeedAllowed,
  isForbiddenBootstrapPassword,
  isProductionRuntime,
  readAdminBootstrap,
} from "../dbRuntime.js";
import { inspectRequiredSchema, REQUIRED_COLUMNS } from "../schemaAudit.js";
import { isBcryptHash } from "../passwordHash.js";
import knex from "knex";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function withEnv(vars: Record<string, string | undefined>, fn: () => void) {
  const prev: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(vars)) {
    prev[k] = process.env[k];
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
  try {
    fn();
  } finally {
    for (const [k, v] of Object.entries(prev)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  }
}

test("runtime: production refuses sqlite unless ALLOW_SQLITE", () => {
  withEnv({ NODE_ENV: "production", ALLOW_SQLITE: undefined }, () => {
    assert.equal(isProductionRuntime(), true);
    assert.throws(() => assertDatabaseDriverAllowed("sqlite"), /refuses SQLite/);
    assertDatabaseDriverAllowed("mysql");
  });
  withEnv({ NODE_ENV: "production", ALLOW_SQLITE: "on" }, () => {
    assertDatabaseDriverAllowed("sqlite");
  });
  withEnv({ NODE_ENV: "development", ALLOW_SQLITE: undefined }, () => {
    assertDatabaseDriverAllowed("sqlite");
  });
});

test("runtime: auto-migrate sqlite default on, mysql default off", () => {
  withEnv({ DB_AUTO_MIGRATE: undefined }, () => {
    assert.equal(isAutoMigrateEnabled("sqlite"), true);
    assert.equal(isAutoMigrateEnabled("mysql"), false);
  });
  withEnv({ DB_AUTO_MIGRATE: "on" }, () => {
    assert.equal(isAutoMigrateEnabled("mysql"), true);
  });
  withEnv({ DB_AUTO_MIGRATE: "off" }, () => {
    assert.equal(isAutoMigrateEnabled("sqlite"), false);
  });
});

test("runtime: demo seed off in production unless ALLOW_DEMO_SEED", () => {
  withEnv({ NODE_ENV: "production", ALLOW_DEMO_SEED: undefined }, () => {
    assert.equal(isDemoSeedAllowed(), false);
  });
  withEnv({ NODE_ENV: "production", ALLOW_DEMO_SEED: "on" }, () => {
    assert.equal(isDemoSeedAllowed(), true);
  });
  withEnv({ NODE_ENV: "development", ALLOW_DEMO_SEED: undefined }, () => {
    assert.equal(isDemoSeedAllowed(), true);
  });
});

test("runtime: bootstrap rejects known test passwords", () => {
  assert.equal(isForbiddenBootstrapPassword("admin123"), true);
  assert.equal(isForbiddenBootstrapPassword("demo123"), true);
  withEnv({ ADMIN_BOOTSTRAP_PASSWORD: "admin123" }, () => {
    assert.throws(() => readAdminBootstrap(), /known test passwords/);
  });
  withEnv({ ADMIN_BOOTSTRAP_PASSWORD: "UniqueStagingPass9!", ADMIN_BOOTSTRAP_USERNAME: "rootadmin" }, () => {
    const b = readAdminBootstrap();
    assert.equal(b?.username, "rootadmin");
    assert.equal(b?.password, "UniqueStagingPass9!");
  });
});

test("schema audit lists appearance and password columns", () => {
  assert.equal(REQUIRED_COLUMNS.restaurants.includes("menu_appearance_json"), true);
  assert.equal(REQUIRED_COLUMNS.restaurant_users.includes("password"), true);
  assert.equal(REQUIRED_COLUMNS.admin_users.includes("password"), true);
});

type Proc = { child: ChildProcess; port: number; sqlite: string; logs: string };

const live: Proc[] = [];

function stopProc(p: Proc) {
  try {
    if (process.platform === "win32" && p.child.pid) {
      spawn("taskkill", ["/pid", String(p.child.pid), "/T", "/F"], { stdio: "ignore" });
    } else {
      p.child.kill("SIGTERM");
    }
  } catch {
    /* gone */
  }
}

after(() => {
  for (const p of live) stopProc(p);
});

function spawnServer(env: Record<string, string>, sqlite: string, port: number): Proc {
  const child = spawn("npx", ["tsx", "server.ts"], {
    cwd: ROOT,
    env: isolatedServerEnv(env),
    shell: true,
    stdio: ["ignore", "pipe", "pipe"],
  });
  const proc: Proc = { child, port, sqlite, logs: "" };
  live.push(proc);
  child.stdout?.on("data", (buf: Buffer) => {
    proc.logs += buf.toString();
  });
  child.stderr?.on("data", (buf: Buffer) => {
    proc.logs += buf.toString();
  });
  return proc;
}

function waitReady(proc: Proc, timeoutMs = 90000): Promise<void> {
  if (proc.logs.includes("Server ready")) return Promise.resolve();
  return new Promise((resolve, reject) => {
    let done = false;
    const t = setTimeout(() => {
      if (done) return;
      done = true;
      reject(new Error(`timeout\n${proc.logs.slice(-2000)}`));
    }, timeoutMs);
    const finish = (err?: Error) => {
      if (done) return;
      done = true;
      clearTimeout(t);
      if (err) reject(err);
      else resolve();
    };
    const check = (buf: Buffer) => {
      if (buf.toString().includes("Server ready")) finish();
    };
    proc.child.stdout?.on("data", check);
    proc.child.stderr?.on("data", check);
    proc.child.on("exit", (code) => {
      finish(new Error(`exited ${code}\n${proc.logs.slice(-2000)}`));
    });
  });
}

function waitExit(proc: Proc, timeoutMs = 90000): Promise<number | null> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`did not exit\n${proc.logs.slice(-2000)}`)), timeoutMs);
    proc.child.on("exit", (code) => {
      clearTimeout(t);
      resolve(code);
    });
  });
}

async function jsonPost(port: number, urlPath: string, body: unknown) {
  const res = await fetch(`http://127.0.0.1:${port}${urlPath}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let data: Record<string, unknown> = {};
  try {
    data = JSON.parse(text) as Record<string, unknown>;
  } catch {
    data = { raw: text };
  }
  return { status: res.status, data, text };
}

test("isolated: NODE_ENV=production without MySQL and without ALLOW_SQLITE refuses to start", { timeout: 90000 }, async () => {
  const sqlite = path.join(os.tmpdir(), `menugo-deny-sqlite-${Date.now()}.sqlite`);
  const port = 3200 + Math.floor(Math.random() * 400);
  const proc = spawnServer(
    {
      PORT: String(port),
      SQLITE_PATH: sqlite,
      NODE_ENV: "production",
      ALLOW_SQLITE: "off",
      ALLOW_DEMO_SEED: "off",
    },
    sqlite,
    port
  );
  const code = await waitExit(proc);
  assert.notEqual(code, 0);
  assert.match(proc.logs, /refuses SQLite/);
});

test("isolated: unreachable local MySQL does not fall back to SQLite", { timeout: 90000 }, async () => {
  const sqlite = path.join(os.tmpdir(), `menugo-mysql-down-${Date.now()}.sqlite`);
  const port = 3200 + Math.floor(Math.random() * 400);
  const proc = spawnServer(
    {
      PORT: String(port),
      SQLITE_PATH: sqlite,
      NODE_ENV: "production",
      ALLOW_SQLITE: "off",
      ALLOW_DEMO_SEED: "off",
      DB_AUTO_MIGRATE: "off",
      MYSQL_HOST: "127.0.0.1",
      MYSQL_PORT: "1",
      MYSQL_USER: "menugo_staging_probe",
      MYSQL_PASSWORD: "unused",
      MYSQL_DATABASE: "menugo_staging_probe",
    },
    sqlite,
    port
  );
  const code = await waitExit(proc);
  assert.notEqual(code, 0);
  assert.equal(proc.logs.includes("Server ready"), false);
  assert.match(proc.logs, /Database initialization failed|ECONNREFUSED|connect/i);
  assert.equal(fs.existsSync(sqlite), false);
});

test("isolated: production sqlite + auto-migrate off on legacy table fails without ALTER", { timeout: 90000 }, async () => {
  const sqlite = path.join(os.tmpdir(), `menugo-legacy-${Date.now()}.sqlite`);
  const raw = new Database(sqlite);
  raw.exec(`CREATE TABLE restaurants (id INTEGER PRIMARY KEY, name TEXT, slug TEXT UNIQUE);`);
  raw.close();

  const port = 3200 + Math.floor(Math.random() * 400);
  const proc = spawnServer(
    {
      PORT: String(port),
      SQLITE_PATH: sqlite,
      NODE_ENV: "production",
      ALLOW_SQLITE: "on",
      DB_AUTO_MIGRATE: "off",
      ALLOW_DEMO_SEED: "off",
    },
    sqlite,
    port
  );
  const code = await waitExit(proc);
  assert.notEqual(code, 0);
  assert.match(proc.logs, /Schema missing \(auto-ALTER disabled\)/);
  const after = new Database(sqlite, { readonly: true });
  const cols = after.prepare("PRAGMA table_info(restaurants)").all() as { name: string }[];
  after.close();
  assert.equal(cols.some((c) => c.name === "menu_appearance_json"), false);
});

test("isolated: production does not seed demo/admin123; bootstrap creates unique admin", { timeout: 120000 }, async () => {
  const sqlite = path.join(os.tmpdir(), `menugo-noseed-${Date.now()}.sqlite`);
  const port = 3200 + Math.floor(Math.random() * 400);
  const bootPass = "StagingAdmin!9x";
  const proc = spawnServer(
    {
      PORT: String(port),
      SQLITE_PATH: sqlite,
      NODE_ENV: "production",
      ALLOW_SQLITE: "on",
      ALLOW_DEMO_SEED: "off",
      PASSWORD_HASHING: "on",
      ADMIN_BOOTSTRAP_USERNAME: "stageadmin",
      ADMIN_BOOTSTRAP_PASSWORD: bootPass,
    },
    sqlite,
    port
  );
  await waitReady(proc);

  const health = await fetch(`http://127.0.0.1:${port}/api/health`);
  const healthJson = (await health.json()) as {
    driver: string;
    schema?: { ok?: boolean; hasMenuAppearanceJson?: boolean };
  };
  assert.equal(healthJson.driver, "sqlite");
  assert.equal(healthJson.schema?.ok, true);
  assert.equal(healthJson.schema?.hasMenuAppearanceJson, true);

  const demoLogin = await jsonPost(port, "/api/restaurant/login", { username: "demo", password: "demo123" });
  assert.equal(demoLogin.status, 401);

  const defaultAdmin = await jsonPost(port, "/api/admin/login", { username: "admin", password: "admin123" });
  assert.equal(defaultAdmin.status, 401);

  const bootLogin = await jsonPost(port, "/api/admin/login", { username: "stageadmin", password: bootPass });
  assert.equal(bootLogin.status, 200, bootLogin.text);
  assert.equal(JSON.stringify(bootLogin.data).includes(bootPass), false);

  const raw = new Database(sqlite, { readonly: true });
  const adminRow = raw.prepare("SELECT username, password FROM admin_users").get() as {
    username: string;
    password: string;
  };
  const demoCount = raw.prepare("SELECT COUNT(*) AS c FROM restaurant_users WHERE username = ?").get("demo") as {
    c: number;
  };
  raw.close();
  assert.equal(adminRow.username, "stageadmin");
  assert.equal(isBcryptHash(adminRow.password), true);
  assert.equal(adminRow.password.includes(bootPass), false);
  assert.equal(Number(demoCount.c), 0);
});

test("isolated: PASSWORD_HASHING=on register stores bcrypt not plaintext", { timeout: 120000 }, async () => {
  const sqlite = path.join(os.tmpdir(), `menugo-hashon-${Date.now()}.sqlite`);
  const port = 3200 + Math.floor(Math.random() * 400);
  const proc = spawnServer(
    {
      PORT: String(port),
      SQLITE_PATH: sqlite,
      NODE_ENV: "production",
      ALLOW_SQLITE: "on",
      ALLOW_DEMO_SEED: "off",
      PASSWORD_HASHING: "on",
      ADMIN_BOOTSTRAP_PASSWORD: "AnotherStaging!1",
    },
    sqlite,
    port
  );
  await waitReady(proc);
  const user = `stg${Date.now()}`;
  const pass = "NewAccountHash9!";
  const reg = await jsonPost(port, "/api/public/register", {
    full_name: "Staging User",
    username: user,
    password: pass,
    phone: "+994501119900",
  });
  assert.equal(reg.status, 200, reg.text);
  const raw = new Database(sqlite, { readonly: true });
  const row = raw.prepare("SELECT password FROM restaurant_users WHERE username = ?").get(user) as {
    password: string;
  };
  raw.close();
  assert.equal(isBcryptHash(row.password), true);
  assert.equal(row.password.includes(pass), false);

  const login = await jsonPost(port, "/api/restaurant/login", { username: user, password: pass });
  assert.equal(login.status, 200, login.text);
});

test("isolated sqlite inspect: new DB has menu_appearance_json", { timeout: 30000 }, async () => {
  const sqlite = path.join(os.tmpdir(), `menugo-inspect-${Date.now()}.sqlite`);
  const k = knex({
    client: "better-sqlite3",
    connection: { filename: sqlite },
    useNullAsDefault: true,
  });
  await k.schema.createTable("restaurants", (table) => {
    table.increments("id");
    table.string("name");
    table.string("slug");
    table.text("menu_appearance_json");
  });
  const partial = await inspectRequiredSchema(k);
  assert.equal(partial.hasMenuAppearanceJson, true);
  assert.equal(partial.ok, false);
  await k.destroy();
});
