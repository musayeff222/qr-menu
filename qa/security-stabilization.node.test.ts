import assert from "node:assert/strict";
import { spawn, type ChildProcess } from "node:child_process";
import os from "node:os";
import path from "node:path";
import { after, test } from "node:test";
import { fileURLToPath } from "node:url";
import { isolatedServerEnv, ISOLATED_ORDER_ACCESS_SECRET } from "./isolatedEnv.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

type Proc = { child: ChildProcess; port: number; logs: string };
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
  const sqlite = path.join(os.tmpdir(), `menugo-stab-${Date.now()}-${Math.random().toString(36).slice(2)}.sqlite`);
  const port = 3800 + Math.floor(Math.random() * 300);
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
      ADMIN_BOOTSTRAP_USERNAME: "stabadmin",
      ADMIN_BOOTSTRAP_PASSWORD: "StabAdmin!9xZ",
      ORDER_ACCESS_SECRET: ISOLATED_ORDER_ACCESS_SECRET,
      APP_URL: `http://127.0.0.1:${port}`,
    }),
    shell: true,
    stdio: ["ignore", "pipe", "pipe"],
  });
  const proc: Proc = { child, port, logs: "" };
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
  if (opts.body !== undefined && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
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
  return { status: res.status, data, text, headers: res.headers };
}

test(
  "stabilization: logout revoke, public DTO, QR allowlist, category ownership, headers",
  { timeout: 180000 },
  async () => {
    const proc = spawnServer();
    await waitReady(proc);
    const { port } = proc;
    const stamp = Date.now().toString(36);

    const anyRes = await fetch(`http://127.0.0.1:${port}/api/restaurants/does-not-exist-stab`);
    assert.equal(anyRes.headers.get("x-content-type-options"), "nosniff");
    assert.equal(anyRes.headers.get("x-frame-options"), "SAMEORIGIN");
    assert.ok(anyRes.headers.get("referrer-policy"));

    const ua = `staba${stamp}`;
    const ub = `stabb${stamp}`;
    const passA = "StabRestaurantA!1";
    const passB = "StabRestaurantB!2";

    const ra = await req(port, "POST", "/api/public/register", {
      body: { full_name: "Stab A", username: ua, password: passA, phone: "994501111211" },
    });
    const rb = await req(port, "POST", "/api/public/register", {
      body: { full_name: "Stab B", username: ub, password: passB, phone: "994502222212" },
    });
    assert.equal(ra.status, 200, ra.text);
    assert.equal(rb.status, 200, rb.text);

    const la = await req(port, "POST", "/api/restaurant/login", {
      body: { username: ua, password: passA },
    });
    const lb = await req(port, "POST", "/api/restaurant/login", {
      body: { username: ub, password: passB },
    });
    assert.equal(la.status, 200, la.text);
    assert.equal(lb.status, 200, lb.text);
    const tokA = String(la.data.token);
    const tokB = String(lb.data.token);
    const ridA = Number(la.data.restaurantId);
    const ridB = Number(lb.data.restaurantId);

    const meA = await req(port, "GET", "/api/restaurant/me", { token: tokA });
    assert.equal(meA.status, 200, meA.text);
    const slugA = String((meA.data.restaurant as { slug: string }).slug);

    const logout = await req(port, "POST", "/api/auth/logout", { token: tokA });
    assert.equal(logout.status, 200, logout.text);
    const meAfter = await req(port, "GET", "/api/restaurant/me", { token: tokA });
    assert.equal(meAfter.status, 401, meAfter.text);

    const la2 = await req(port, "POST", "/api/restaurant/login", {
      body: { username: ua, password: passA },
    });
    assert.equal(la2.status, 200, la2.text);
    const tokA2 = String(la2.data.token);

    const pub = await req(port, "GET", `/api/restaurants/${slugA}?preview=true`);
    assert.equal(pub.status, 200, pub.text);
    assert.equal(pub.data.subscription_plan_id, undefined);
    assert.equal(pub.data.total_page_views, undefined);
    assert.ok(pub.data.name);
    assert.ok(pub.data.slug);

    const badQr = await req(
      port,
      "GET",
      `/api/qrcode?url=${encodeURIComponent("https://evil.example/phishing")}`
    );
    assert.equal(badQr.status, 400, badQr.text);

    const goodQr = await req(
      port,
      "GET",
      `/api/qrcode?url=${encodeURIComponent(`http://127.0.0.1:${port}/r/${slugA}`)}`
    );
    assert.equal(goodQr.status, 200, goodQr.text);
    assert.ok(String(goodQr.data.qrDataUrl || "").startsWith("data:image"));

    const meB = await req(port, "GET", "/api/restaurant/me", { token: tokB });
    assert.equal(meB.status, 200, meB.text);
    const slugB = String((meB.data.restaurant as { slug: string }).slug);
    const pubB = await req(port, "GET", `/api/restaurants/${slugB}?preview=true`);
    assert.equal(pubB.status, 200, pubB.text);
    const catsB = (pubB.data.categories as Array<{ id: number }>) || [];
    let catIdB = Number(catsB[0]?.id || 0);
    if (!catIdB) {
      const catB = await req(port, "POST", "/api/admin/categories", {
        token: tokB,
        body: { restaurant_id: ridB, name: "B Cat" },
      });
      assert.equal(catB.status, 200, catB.text);
      catIdB = Number(catB.data.id);
    }
    assert.ok(catIdB > 0, "restaurant B needs a category");

    const cross = await req(port, "POST", "/api/admin/products", {
      token: tokA2,
      body: {
        restaurant_id: ridA,
        category_id: catIdB,
        name: "Cross tenant plant",
        description: "should fail",
        price: 1,
      },
    });
    assert.equal(cross.status, 400, cross.text);

    // order rate limit: burn peer+slug quota quickly with invalid carts
    let saw429 = false;
    for (let i = 0; i < 35; i++) {
      const r = await req(port, "POST", `/api/restaurants/${slugA}/orders`, {
        body: {
          device_id: `stab-flood-${i}`,
          customer_name: "Flood",
          customer_phone: "994509990000",
          cart: [{ product_id: 1, qty: 1 }],
        },
      });
      if (r.status === 429) {
        saw429 = true;
        break;
      }
    }
    assert.equal(saw429, true, "guest order rate limit should trip");
  }
);
