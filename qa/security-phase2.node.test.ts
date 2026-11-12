import assert from "node:assert/strict";
import { spawn, type ChildProcess } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { after, test } from "node:test";
import { fileURLToPath } from "node:url";
import { isolatedServerEnv, ISOLATED_ORDER_ACCESS_SECRET } from "./isolatedEnv.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

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

function spawnServer(extra: Record<string, string | undefined>): Proc {
  const sqlite = path.join(os.tmpdir(), `menugo-sec2-${Date.now()}-${Math.random().toString(36).slice(2)}.sqlite`);
  const port = 3700 + Math.floor(Math.random() * 300);
  const child = spawn("npx", ["tsx", "server.ts"], {
    cwd: ROOT,
    env: isolatedServerEnv({
      PORT: String(port),
      SQLITE_PATH: sqlite,
      NODE_ENV: "production",
      ALLOW_SQLITE: "on",
      ALLOW_DEMO_SEED: "off",
      PASSWORD_HASHING: "on",
      DB_AUTO_MIGRATE: "on",
      ADMIN_BOOTSTRAP_USERNAME: "sec2admin",
      ADMIN_BOOTSTRAP_PASSWORD: "Sec2Admin!9xZ",
      ORDER_ACCESS_SECRET: ISOLATED_ORDER_ACCESS_SECRET,
      ...extra,
    }),
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

async function req(
  port: number,
  method: string,
  urlPath: string,
  opts: { body?: unknown; token?: string; headers?: Record<string, string> } = {}
) {
  const headers: Record<string, string> = { ...(opts.headers || {}) };
  if (opts.body !== undefined && !headers["Content-Type"]) headers["Content-Type"] = "application/json";
  if (opts.token) headers.Authorization = `Bearer ${opts.token}`;
  const res = await fetch(`http://127.0.0.1:${port}${urlPath}`, {
    method,
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
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

async function bootRestaurant(port: number, username: string, password: string) {
  const reg = await req(port, "POST", "/api/public/register", {
    body: { full_name: username, username, password, phone: "994501111111" },
  });
  assert.equal(reg.status, 200, reg.text);
  const login = await req(port, "POST", "/api/restaurant/login", { body: { username, password } });
  assert.equal(login.status, 200, login.text);
  const me = await req(port, "GET", "/api/restaurant/me", { token: String(login.data.token) });
  const restaurant = me.data.restaurant as { id: number; slug: string };
  const pub = await req(port, "GET", `/api/restaurants/${restaurant.slug}?preview=true`);
  const products = ((pub.data as { products?: Array<{ id: number; price?: number; variants?: Array<{ id: number }> }> }).products || []).filter(
    (p) => Number(p.id) > 0
  );
  const product = products[0];
  assert.ok(product?.id);
  return { token: String(login.data.token), restaurant, product };
}

test("production refuses to start without ORDER_ACCESS_SECRET", { timeout: 90000 }, async () => {
  const proc = spawnServer({ ORDER_ACCESS_SECRET: "" });
  const code = await waitExit(proc);
  assert.notEqual(code, 0);
  assert.equal(proc.logs.includes("Server ready"), false);
  assert.match(proc.logs, /ORDER_ACCESS_SECRET is missing or too weak/);
  assert.equal(proc.logs.includes("menugo-order-access-v1"), false);
  assert.equal(proc.logs.includes(ISOLATED_ORDER_ACCESS_SECRET), false);
});

test("production refuses a short ORDER_ACCESS_SECRET", { timeout: 90000 }, async () => {
  const proc = spawnServer({ ORDER_ACCESS_SECRET: "tooshort" });
  const code = await waitExit(proc);
  assert.notEqual(code, 0);
  assert.match(proc.logs, /ORDER_ACCESS_SECRET is missing or too weak/);
});

test("phase2 isolated: per-order token, expiry, revoke, XFF cannot bypass", { timeout: 180000 }, async () => {
  const proc = spawnServer({});
  await waitReady(proc);
  const { port } = proc;
  const stamp = Date.now().toString(36);
  const a = await bootRestaurant(port, `p2a${stamp}`, "Phase2RestA!1");
  const b = await bootRestaurant(port, `p2b${stamp}`, "Phase2RestB!2");

  const order = await req(port, "POST", `/api/restaurants/${a.restaurant.slug}/orders`, {
    body: {
      device_id: "p2-device-a",
      customer_name: "Phase2 Guest",
      customer_phone: "994509991111",
      cart: [{ product_id: a.product.id, variant_id: a.product.variants?.[0]?.id ?? null, qty: 1, unit_price: 0.01 }],
      total_amount: 0.01,
    },
  });
  assert.equal(order.status, 200, order.text);
  const access = String(order.data.access_token);
  const orderId = Number((order.data.order as { id: number }).id);
  assert.match(access, /^v2\./);
  assert.equal(JSON.stringify(order.data).includes("994509991111"), false);

  const queryOnly = await req(
    port,
    "GET",
    `/api/restaurants/${a.restaurant.slug}/orders?access_token=${encodeURIComponent(access)}`
  );
  assert.equal(queryOnly.status, 401);
  assert.equal(queryOnly.text.includes("994509991111"), false);

  const ok = await req(port, "GET", `/api/restaurants/${a.restaurant.slug}/orders`, {
    headers: { "X-Order-Access": access },
  });
  assert.equal(ok.status, 200, ok.text);
  assert.equal(JSON.stringify(ok.data).includes("994509991111"), false);
  assert.equal(JSON.stringify(ok.data).includes("Phase2 Guest"), false);

  const otherRest = await req(port, "GET", `/api/restaurants/${b.restaurant.slug}/orders`, {
    headers: { "X-Order-Access": access },
  });
  assert.equal(otherRest.status, 403);

  const order2 = await req(port, "POST", `/api/restaurants/${a.restaurant.slug}/orders`, {
    body: {
      device_id: "p2-device-a",
      customer_name: "Phase2 Guest 2",
      customer_phone: "994509991112",
      cart: [{ product_id: a.product.id, qty: 1 }],
    },
  });
  const access2 = String(order2.data.access_token);
  const onlyFirst = await req(port, "GET", `/api/restaurants/${a.restaurant.slug}/orders`, {
    headers: { "X-Order-Access": access },
  });
  const ids = (onlyFirst.data as unknown as Array<{ id: number }>).map((r) => r.id);
  assert.equal(ids.includes(orderId), true);
  assert.equal(ids.includes(Number((order2.data.order as { id: number }).id)), false);

  const forged = access.replace(/[0-9a-f]{4}$/i, "ffff");
  const forgedGet = await req(port, "GET", `/api/restaurants/${a.restaurant.slug}/orders`, {
    headers: { "X-Order-Access": forged },
  });
  assert.equal(forgedGet.status, 403);

  const stolenProduct = await req(port, "POST", `/api/restaurants/${b.restaurant.slug}/orders`, {
    body: {
      device_id: "p2-device-b",
      customer_name: "Phase2 Guest B",
      customer_phone: "994509991113",
      cart: [{ product_id: a.product.id, qty: 1 }],
    },
  });
  assert.equal(stolenProduct.status, 400);

  const liveTok = access2;
  const liveId = Number((order2.data.order as { id: number }).id);
  const rev = await req(port, "POST", `/api/restaurants/${a.restaurant.slug}/orders/${liveId}/revoke`, {
    headers: { "X-Order-Access": liveTok },
  });
  assert.equal(rev.status, 200, rev.text);
  const afterRev = await req(port, "GET", `/api/restaurants/${a.restaurant.slug}/orders`, {
    headers: { "X-Order-Access": liveTok },
  });
  assert.equal(afterRev.status, 403);

  const stillFirst = await req(port, "GET", `/api/restaurants/${a.restaurant.slug}/orders`, {
    headers: { "X-Order-Access": access },
  });
  assert.equal(stillFirst.status, 200, stillFirst.text);

  let spoofBypass = true;
  for (let i = 0; i < 12; i++) {
    const r = await req(port, "POST", "/api/restaurant/login", {
      body: { username: `p2a${stamp}`, password: "WrongPass!!" },
      headers: { "X-Forwarded-For": `198.51.100.${i + 1}` },
    });
    if (r.status === 429) {
      spoofBypass = false;
      assert.equal(String(r.data.error || "").includes(`p2a${stamp}`), false);
      break;
    }
  }
  assert.equal(spoofBypass, false, "rotating untrusted X-Forwarded-For bypassed login limit");

  const goodLogin = await req(port, "POST", "/api/restaurant/login", {
    body: { username: `p2b${stamp}`, password: "Phase2RestB!2" },
    headers: { "X-Forwarded-For": "203.0.113.9" },
  });
  assert.equal(goodLogin.status, 200, goodLogin.text);

  const expProc = spawnServer({ ORDER_ACCESS_TTL_SEC: "1" });
  await waitReady(expProc);
  const e = await bootRestaurant(expProc.port, `p2e${stamp}`, "Phase2RestE!1");
  const short = await req(expProc.port, "POST", `/api/restaurants/${e.restaurant.slug}/orders`, {
    body: {
      device_id: "p2-device-e",
      customer_name: "Phase2 Guest E",
      customer_phone: "994509991115",
      cart: [{ product_id: e.product.id, qty: 1 }],
    },
  });
  assert.equal(short.status, 200, short.text);
  const shortTok = String(short.data.access_token);
  await new Promise((r) => setTimeout(r, 2200));
  const expired = await req(expProc.port, "GET", `/api/restaurants/${e.restaurant.slug}/orders`, {
    headers: { "X-Order-Access": shortTok },
  });
  assert.equal(expired.status, 403);
  assert.equal(expired.text.includes("994509991115"), false);
});
