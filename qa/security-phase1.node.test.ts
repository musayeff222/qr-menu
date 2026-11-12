import assert from "node:assert/strict";
import { spawn, type ChildProcess } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { after, test } from "node:test";
import { fileURLToPath } from "node:url";
import { isolatedServerEnv } from "./isolatedEnv.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PNG_1x1 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhKmMIQAAAABJRU5ErkJggg==",
  "base64"
);

type Proc = { child: ChildProcess; port: number; sqlite: string; uploads: string; logs: string };
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

function spawnServer(): Proc {
  const sqlite = path.join(os.tmpdir(), `menugo-sec1-${Date.now()}.sqlite`);
  const uploads = path.join(os.tmpdir(), `menugo-sec1-up-${Date.now()}`);
  fs.mkdirSync(uploads, { recursive: true });
  const port = 3500 + Math.floor(Math.random() * 400);
  const child = spawn("npx", ["tsx", "server.ts"], {
    cwd: ROOT,
    env: isolatedServerEnv({
      PORT: String(port),
      SQLITE_PATH: sqlite,
      UPLOADS_DIR: uploads,
      NODE_ENV: "production",
      ALLOW_SQLITE: "on",
      ALLOW_DEMO_SEED: "off",
      PASSWORD_HASHING: "on",
      DB_AUTO_MIGRATE: "on",
      ORDER_ACCESS_SECRET: "phase1-isolated-order-access-secret!!",
      ADMIN_BOOTSTRAP_USERNAME: "secadmin",
      ADMIN_BOOTSTRAP_PASSWORD: "SecAdmin!9xZ",
    }),
    shell: true,
    stdio: ["ignore", "pipe", "pipe"],
  });
  const proc: Proc = { child, port, sqlite, uploads, logs: "" };
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

async function req(
  port: number,
  method: string,
  urlPath: string,
  opts: { body?: unknown; token?: string; headers?: Record<string, string> } = {}
) {
  const headers: Record<string, string> = { ...(opts.headers || {}) };
  const isForm = typeof FormData !== "undefined" && opts.body instanceof FormData;
  if (opts.body !== undefined && !isForm && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  if (opts.token) headers.Authorization = `Bearer ${opts.token}`;
  const res = await fetch(`http://127.0.0.1:${port}${urlPath}`, {
    method,
    headers,
    body: isForm
      ? (opts.body as FormData)
      : opts.body !== undefined
        ? JSON.stringify(opts.body)
        : undefined,
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

test("phase1 isolated: order reprice, guest GET, password DTO, rate limit, upload", { timeout: 180000 }, async () => {
  const proc = spawnServer();
  await waitReady(proc);
  const { port, uploads } = proc;
  const stamp = Date.now().toString(36);
  const ua = `seca${stamp}`;
  const ub = `secb${stamp}`;
  const passA = "SecRestaurantA!1";
  const passB = "SecRestaurantB!2";

  const ra = await req(port, "POST", "/api/public/register", {
    body: { full_name: "Sec A", username: ua, password: passA, phone: "994501111111" },
  });
  const rb = await req(port, "POST", "/api/public/register", {
    body: { full_name: "Sec B", username: ub, password: passB, phone: "994502222222" },
  });
  assert.equal(ra.status, 200, ra.text);
  assert.equal(rb.status, 200, rb.text);

  const la = await req(port, "POST", "/api/restaurant/login", { body: { username: ua, password: passA } });
  const lb = await req(port, "POST", "/api/restaurant/login", { body: { username: ub, password: passB } });
  assert.equal(la.status, 200, la.text);
  assert.equal(lb.status, 200, lb.text);
  const tokA = String(la.data.token);
  const tokB = String(lb.data.token);
  const ridA = Number(la.data.restaurantId);
  const ridB = Number(lb.data.restaurantId);
  assert.ok(ridA && ridB && ridA !== ridB);

  const meA = await req(port, "GET", "/api/restaurant/me", { token: tokA });
  const meB = await req(port, "GET", "/api/restaurant/me", { token: tokB });
  const slugA = String((meA.data.restaurant as { slug: string }).slug);
  const slugB = String((meB.data.restaurant as { slug: string }).slug);

  const pubA = await req(port, "GET", `/api/restaurants/${slugA}?preview=true`);
  assert.equal(pubA.status, 200, pubA.text);
  type MenuProduct = {
    id: number;
    price?: number;
    name?: string;
    variants?: Array<{ id: number; price?: number }>;
  };
  const productsA = ((pubA.data as { products?: MenuProduct[] }).products || []).filter((p) => Number(p.id) > 0);
  const productA = productsA[0];
  assert.ok(productA?.id, "restaurant A has no orderable product");
  const variantA = productA.variants?.[0];
  const unitCents = Math.round(Number(variantA?.price ?? productA.price) * 100);
  assert.ok(unitCents > 0);
  const pidA = Number(productA.id);
  const qty = 2;
  const expectedTotal = (unitCents * qty) / 100;

  const fake = await req(port, "POST", `/api/restaurants/${slugA}/orders`, {
    body: {
      device_id: "sec-device-a",
      customer_name: "Guest A",
      customer_phone: "994509990001",
      total_amount: 0.01,
      cart: [{ product_id: 999999, qty: 1, unit_price: 0.01 }],
    },
  });
  assert.equal(fake.status, 400, fake.text);

  const honest = await req(port, "POST", `/api/restaurants/${slugA}/orders`, {
    body: {
      device_id: "sec-device-a",
      customer_name: "Guest A",
      customer_phone: "994509990001",
      order_type: "pickup",
      payment_method: "cash",
      total_amount: 0.01,
      cart: [
        {
          product_id: pidA,
          variant_id: variantA?.id ?? null,
          qty,
          unit_price: 0.01,
          label: "hacked price",
        },
      ],
    },
  });
  assert.equal(honest.status, 200, honest.text);
  const order = honest.data.order as { id: number; total_amount: number };
  assert.equal(Number(order.total_amount), expectedTotal);
  const access = String(honest.data.access_token);
  assert.match(access, /^v2\./);

  const stolenProduct = await req(port, "POST", `/api/restaurants/${slugB}/orders`, {
    body: {
      device_id: "sec-device-b",
      customer_name: "Guest B",
      customer_phone: "994509990002",
      cart: [{ product_id: pidA, variant_id: variantA?.id ?? null, qty: 1 }],
    },
  });
  assert.equal(stolenProduct.status, 400, stolenProduct.text);

  const noTok = await req(port, "GET", `/api/restaurants/${slugA}/orders?device_id=sec-device-a`);
  assert.equal(noTok.status, 401);
  assert.equal(noTok.text.includes("994509990001"), false);

  const queryTok = await req(
    port,
    "GET",
    `/api/restaurants/${slugA}/orders?device_id=sec-device-a&access_token=${encodeURIComponent(access)}`
  );
  assert.equal(queryTok.status, 401);

  const badTok = await req(port, "GET", `/api/restaurants/${slugA}/orders`, {
    headers: { "X-Order-Access": "v2.not-a-token.aaaaaaaa" },
  });
  assert.equal(badTok.status, 403);

  const cross = await req(port, "GET", `/api/restaurants/${slugB}/orders`, {
    headers: { "X-Order-Access": access },
  });
  assert.equal(cross.status, 403);

  const own = await req(port, "GET", `/api/restaurants/${slugA}/orders`, {
    headers: { "X-Order-Access": access },
  });
  assert.equal(own.status, 200, own.text);
  const ownJson = JSON.stringify(own.data);
  assert.equal(ownJson.includes("994509990001"), false);
  assert.equal(ownJson.includes("Guest A"), false);
  assert.equal(ownJson.includes("customer_phone"), false);
  assert.equal(ownJson.includes(String(expectedTotal)), true);

  const staffB = await req(port, "GET", `/api/admin/restaurants/${ridA}/orders`, { token: tokB });
  assert.equal(staffB.status, 403);
  const staffA = await req(port, "GET", `/api/admin/restaurants/${ridA}/orders`, { token: tokA });
  assert.equal(staffA.status, 200);
  assert.equal(JSON.stringify(staffA.data).includes("994509990001"), true);

  const adminLogin = await req(port, "POST", "/api/admin/login", {
    body: { username: "secadmin", password: "SecAdmin!9xZ" },
  });
  assert.equal(adminLogin.status, 200, adminLogin.text);
  const owners = await req(port, "GET", "/api/admin/owner-accounts", {
    token: String(adminLogin.data.token),
  });
  assert.equal(owners.status, 200, owners.text);
  const ownersJson = JSON.stringify(owners.data);
  assert.equal(ownersJson.includes('"password"'), false);
  assert.equal(ownersJson.includes("$2"), false);

  const unauthUp = await req(port, "POST", "/api/upload");
  assert.equal(unauthUp.status, 401);
  const before = fs.existsSync(uploads) ? fs.readdirSync(uploads, { recursive: true }) : [];

  const formBad = new FormData();
  formBad.append("file", new Blob(["not-an-image"], { type: "image/png" }), "x.png");
  const badUp = await fetch(`http://127.0.0.1:${port}/api/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${tokA}` },
    body: formBad,
  });
  assert.equal(badUp.status, 400);

  const formOk = new FormData();
  formOk.append("file", new Blob([PNG_1x1], { type: "image/png" }), "ok.png");
  const okUp = await fetch(`http://127.0.0.1:${port}/api/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${tokA}` },
    body: formOk,
  });
  const okBody = (await okUp.json()) as { path?: string };
  assert.equal(okUp.status, 200, JSON.stringify(okBody));
  assert.equal(String(okBody.path || "").includes(`/uploads/${ridA}/`), true);
  const destFile = path.join(uploads, String(okBody.path || "").replace(/^\/uploads\//, ""));
  assert.equal(fs.existsSync(destFile), true);

  const after = fs.readdirSync(uploads, { recursive: true }).map(String);
  assert.equal(
    after.filter((n) => n.endsWith(".png") || n.includes("php")).length >= 1,
    true
  );
  assert.equal(
    after.some((n) => n.includes("x.png") || n.endsWith(".txt")),
    false,
    `leftover=${after.join(",")} before=${before.join(",")}`
  );

  let saw429 = false;
  for (let i = 0; i < 10; i++) {
    const r = await req(port, "POST", "/api/restaurant/login", {
      body: { username: ua, password: "WrongPass!!" },
      headers: { "X-Forwarded-For": "203.0.113.50" },
    });
    if (r.status === 429) {
      saw429 = true;
      assert.equal(String(r.data.error || "").includes(ua), false);
      break;
    }
  }
  assert.equal(saw429, true, "login rate limit never fired");

  let reg429 = false;
  const floodUser = `flood${stamp}`;
  for (let i = 0; i < 12; i++) {
    const r = await req(port, "POST", "/api/public/register", {
      body: { full_name: "Flood", username: floodUser, password: "FloodPass!1", phone: "994501110000" },
      headers: { "X-Forwarded-For": `203.0.113.${10 + i}` },
    });
    if (r.status === 429) {
      reg429 = true;
      break;
    }
  }
  assert.equal(reg429, true, "register rate limit never fired");

  const health = await req(port, "GET", "/api/health");
  assert.equal(health.status, 200);
  assert.equal((health.data as { driver?: string }).driver, "sqlite");
});
