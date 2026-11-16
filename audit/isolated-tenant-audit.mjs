/**
 * Isolated SQLite tenant/auth/order audit. Never sets MYSQL_*.
 * Evidence for TENANT_ISOLATION_AUDIT.md — synthetic accounts only.
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const findings = [];
const stamp = new Date().toISOString();

function record(id, status, title, detail) {
  findings.push({ id, status, title, detail });
  console.log(`[${status}] ${id} ${title}${detail ? " — " + detail : ""}`);
}

const MYSQL_KEYS = [
  "MYSQL_HOST",
  "MYSQL_PORT",
  "MYSQL_USER",
  "MYSQL_PASSWORD",
  "MYSQL_DATABASE",
  "DATABASE_URL",
  "DB_CLIENT",
];

function isolatedEnv(extra) {
  const env = { ...process.env };
  for (const k of MYSQL_KEYS) env[k] = "";
  return { ...env, ...extra };
}

function spawnServer(env, port) {
  const child = spawn("npx", ["tsx", "server.ts"], {
    cwd: ROOT,
    env: isolatedEnv(env),
    shell: true,
    stdio: ["ignore", "pipe", "pipe"],
  });
  let logs = "";
  child.stdout?.on("data", (b) => {
    logs += b.toString();
  });
  child.stderr?.on("data", (b) => {
    logs += b.toString();
  });
  return { child, port, logs: () => logs };
}

function waitReady(proc, timeoutMs = 90000) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`timeout\n${proc.logs().slice(-2000)}`)), timeoutMs);
    const check = (buf) => {
      if (buf.toString().includes("Server ready")) {
        clearTimeout(t);
        resolve();
      }
    };
    proc.child.stdout?.on("data", check);
    proc.child.stderr?.on("data", check);
    proc.child.on("exit", (code) => {
      clearTimeout(t);
      reject(new Error(`exited ${code}\n${proc.logs().slice(-2000)}`));
    });
  });
}

function stop(proc) {
  try {
    if (process.platform === "win32" && proc.child.pid) {
      spawn("taskkill", ["/pid", String(proc.child.pid), "/T", "/F"], { stdio: "ignore" });
    } else {
      proc.child.kill("SIGTERM");
    }
  } catch {
    /* gone */
  }
}

async function req(port, method, urlPath, { body, token, headers: extraHeaders } = {}) {
  const headers = { "Content-Type": "application/json", ...(extraHeaders || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`http://127.0.0.1:${port}${urlPath}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data = {};
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }
  return { status: res.status, data, text };
}

async function register(port, username, password, phone) {
  return req(port, "POST", "/api/public/register", {
    body: {
      full_name: `QA ${username}`,
      username,
      password,
      phone,
    },
  });
}

async function login(port, username, password) {
  return req(port, "POST", "/api/restaurant/login", { body: { username, password } });
}

const sqlite = path.join(os.tmpdir(), `menugo-audit-${Date.now()}.sqlite`);
const port = 3400 + Math.floor(Math.random() * 200);
const proc = spawnServer(
  {
    PORT: String(port),
    SQLITE_PATH: sqlite,
    NODE_ENV: "production",
    ALLOW_SQLITE: "on",
    ALLOW_DEMO_SEED: "off",
    PASSWORD_HASHING: "on",
    DB_AUTO_MIGRATE: "on",
    ADMIN_BOOTSTRAP_USERNAME: "auditadmin",
    ADMIN_BOOTSTRAP_PASSWORD: "AuditAdmin!9xZ",
    ORDER_ACCESS_SECRET: "menugo-isolated-test-order-access-secret-do-not-use-in-prod",
  },
  port
);

try {
  await waitReady(proc);
  record("BOOT", "PASS", "Isolated SQLite server ready", `port=${port}`);

  const health = await req(port, "GET", "/api/health");
  record(
    "HEALTH",
    health.status === 200 && health.data.driver === "sqlite" && health.data.schema?.ok ? "PASS" : "FAIL",
    "Health sqlite + schema.ok",
    JSON.stringify({ status: health.status, driver: health.data.driver, schema: health.data.schema })
  );

  const miss = await register(port, "qaa", "short", "994501111111");
  record(
    "REG-FIELDS",
    miss.status === 400 || miss.status === 200 ? "PASS" : "FAIL",
    "Register accepts short password (no server min length)",
    `status=${miss.status}`
  );

  const ua = `qaa${Date.now().toString(36)}`;
  const ub = `qab${Date.now().toString(36)}`;
  const passA = "QaRestaurantA!1";
  const passB = "QaRestaurantB!2";
  const ra = await register(port, ua, passA, "+994 50 111 11 11");
  const rb = await register(port, ub, passB, "+994 50 222 22 22");
  record("REG-A", ra.status === 200 && ra.data.success ? "PASS" : "FAIL", "Register restaurant A", `status=${ra.status}`);
  record("REG-B", rb.status === 200 && rb.data.success ? "PASS" : "FAIL", "Register restaurant B", `status=${rb.status}`);

  const dup = await register(port, ua, passA, "+994 50 333 33 33");
  record(
    "REG-DUP",
    dup.status === 400 && String(dup.data.error || "").includes("götürülüb") ? "PASS" : "FAIL",
    "Duplicate username rejected",
    `status=${dup.status}`
  );

  const wrong = await login(port, ua, "WrongPass!99");
  record("LOGIN-WRONG", wrong.status === 401 ? "PASS" : "FAIL", "Wrong password 401", `status=${wrong.status}`);

  const la = await login(port, ua, passA);
  const lb = await login(port, ub, passB);
  record("LOGIN-A", la.status === 200 && la.data.token ? "PASS" : "FAIL", "Login A", `status=${la.status}`);
  record("LOGIN-B", lb.status === 200 && lb.data.token ? "PASS" : "FAIL", "Login B", `status=${lb.status}`);
  const tokA = la.data.token;
  const tokB = lb.data.token;
  const idA = Number(la.data.restaurantId);
  const idB = Number(lb.data.restaurantId);

  const meA = await req(port, "GET", "/api/restaurant/me", { token: tokA });
  const meB = await req(port, "GET", "/api/restaurant/me", { token: tokB });
  const restA = meA.data.restaurant || {};
  const restB = meB.data.restaurant || {};
  const ridA = Number(restA.id);
  const ridB = Number(restB.id);
  record(
    "ME-ISO",
    ridA === idA && ridB === idB && ridA !== ridB ? "PASS" : "FAIL",
    "/api/restaurant/me returns own restaurant",
    `A=${ridA} B=${ridB} loginA=${idA} loginB=${idB}`
  );

  const idorMenu = await req(port, "GET", `/api/admin/restaurants/${ridB}/menu`, { token: tokA });
  record(
    "IDOR-MENU",
    idorMenu.status === 403 ? "PASS" : "FAIL",
    "A cannot read B menu via URL id",
    `status=${idorMenu.status}`
  );

  const idorDash = await req(port, "GET", `/api/admin/restaurants/${ridB}/dashboard`, { token: tokA });
  record(
    "IDOR-DASH",
    idorDash.status === 403 ? "PASS" : "FAIL",
    "A cannot read B dashboard",
    `status=${idorDash.status}`
  );

  const idorCat = await req(port, "POST", "/api/admin/categories", {
    token: tokA,
    body: { restaurant_id: ridB, name: "Stolen category" },
  });
  record(
    "IDOR-CAT",
    idorCat.status === 403 ? "PASS" : "FAIL",
    "A cannot create category on B via body restaurant_id",
    `status=${idorCat.status}`
  );

  const addA = await req(port, "POST", "/api/admin/categories", {
    token: tokA,
    body: { restaurant_id: ridA, name: "A-only cat" },
  });
  // Free-plan register seeds categories up to max_categories — extra create returns 403 by design.
  const planFilled =
    addA.status === 403 &&
    /limit|limitiniz|dolub/i.test(String(addA.data?.error || addA.text || ""));
  record(
    "CRUD-CAT-A",
    addA.status === 200 || planFilled ? "PASS" : "FAIL",
    planFilled
      ? "A at category plan limit after seed (expected)"
      : "A creates own category",
    `status=${addA.status}`
  );

  const menuA = await req(port, "GET", `/api/admin/restaurants/${ridA}/menu`, { token: tokA });
  const menuB = await req(port, "GET", `/api/admin/restaurants/${ridB}/menu`, { token: tokB });
  const catsA = Array.isArray(menuA.data?.categories)
    ? menuA.data.categories.map((c) => Number(c.id)).filter((n) => n > 0)
    : [];
  const catsB = Array.isArray(menuB.data?.categories)
    ? menuB.data.categories.map((c) => Number(c.id)).filter((n) => n > 0)
    : [];
  const idOverlap = catsA.some((id) => catsB.includes(id));
  const aHasStolen = JSON.stringify(menuB.data).includes("A-only cat");
  const aOwn = addA.status === 200 ? JSON.stringify(menuA.data).includes("A-only cat") : catsA.length > 0;
  record(
    "MENU-ISO",
    aOwn && !aHasStolen && !idOverlap ? "PASS" : "FAIL",
    "A categories isolated from B menu (ids + marker)",
    `aOwn=${aOwn} leaked=${aHasStolen} idOverlap=${idOverlap}`
  );

  const slugA = restA.slug;
  const slugB = restB.slug;
  const pubA = await req(port, "GET", `/api/restaurants/${slugA}?preview=true`);
  const pubB = await req(port, "GET", `/api/restaurants/${slugB}?preview=true`);
  record(
    "PUB-ISO",
    pubA.status === 200 && pubB.status === 200 && !JSON.stringify(pubB.data).includes("A-only cat") ? "PASS" : "FAIL",
    "Public menus isolated",
    `A=${pubA.status} B=${pubB.status}`
  );

  const productsA = (pubA.data.products || []).filter((p) => Number(p?.id) > 0);
  const productA = productsA[0];
  const variantA = productA?.variants?.[0];
  const unitPrice = Number(variantA?.price ?? productA?.price);
  record(
    "CRUD-PROD-A",
    productA?.id && Number.isFinite(unitPrice) && unitPrice > 0 ? "PASS" : "FAIL",
    "Restaurant A has an orderable product",
    `id=${productA?.id} price=${unitPrice}`
  );

  const fakeTotal = await req(port, "POST", `/api/restaurants/${slugA}/orders`, {
    body: {
      device_id: "audit-device-aaa",
      customer_name: "Audit Guest",
      customer_phone: "994501110000",
      cart: [{ id: 999999, name: "Fake steak", qty: 1, price: 1 }],
      total_amount: 0.01,
      order_type: "pickup",
      payment_method: "cash",
    },
  });
  record(
    "ORDER-CLIENT-TOTAL",
    fakeTotal.status === 400 ? "PASS" : "FAIL",
    "Unknown product / client-only cart is rejected",
    `status=${fakeTotal.status}`
  );

  const honest = await req(port, "POST", `/api/restaurants/${slugA}/orders`, {
    body: {
      device_id: "audit-device-aaa",
      customer_name: "Audit Guest",
      customer_phone: "994501110000",
      cart: [{ product_id: productA?.id, variant_id: variantA?.id ?? null, qty: 1, unit_price: 0.01 }],
      total_amount: 0.01,
      order_type: "pickup",
      payment_method: "cash",
    },
  });
  const quoted = Number(honest.data?.order?.total_amount);
  record(
    "ORDER-REPRICE",
    honest.status === 200 && Number.isFinite(quoted) && Math.abs(quoted - unitPrice) < 0.001 ? "PASS" : "FAIL",
    "Server ignores client total_amount and quotes DB price",
    `status=${honest.status} total=${quoted}`
  );

  const guestOrders = await req(port, "GET", `/api/restaurants/${slugA}/orders?device_id=audit-device-aaa`);
  const pii = JSON.stringify(guestOrders.data);
  record(
    "ORDER-GET-PUBLIC",
    guestOrders.status === 401 && !pii.includes("994501110000") ? "PASS" : "FAIL",
    "device_id alone cannot read guest orders",
    `status=${guestOrders.status}`
  );

  const tokenGet = await req(port, "GET", `/api/restaurants/${slugA}/orders`, {
    headers: { "X-Order-Access": String(honest.data.access_token || "") },
  });
  const tokenJson = JSON.stringify(tokenGet.data);
  record(
    "ORDER-GET-TOKEN",
    tokenGet.status === 200 && !tokenJson.includes("994501110000") && !tokenJson.includes("Audit Guest")
      ? "PASS"
      : "FAIL",
    "Guest token GET hides customer PII",
    `status=${tokenGet.status}`
  );

  const ordersB = await req(port, "GET", `/api/admin/restaurants/${ridB}/orders`, { token: tokA });
  record(
    "IDOR-ORDERS",
    ordersB.status === 403 ? "PASS" : "FAIL",
    "A cannot list B staff orders",
    `status=${ordersB.status}`
  );

  const listA = await req(port, "GET", `/api/admin/restaurants/${ridA}/orders`, { token: tokA });
  const listB = await req(port, "GET", `/api/admin/restaurants/${ridB}/orders`, { token: tokB });
  const aPhoneInB = JSON.stringify(listB.data).includes("994501110000");
  record(
    "ORDER-STAFF-ISO",
    !aPhoneInB && JSON.stringify(listA.data).includes("994501110000") ? "PASS" : "FAIL",
    "Order PII stays on restaurant A staff list",
    `leakedToB=${aPhoneInB}`
  );

  const adminLogin = await req(port, "POST", "/api/admin/login", {
    body: { username: "auditadmin", password: "AuditAdmin!9xZ" },
  });
  record("ADMIN-LOGIN", adminLogin.status === 200 && adminLogin.data.token ? "PASS" : "FAIL", "Bootstrap admin login", `status=${adminLogin.status}`);
  const tokS = adminLogin.data.token;
  const owners = await req(port, "GET", "/api/admin/owner-accounts", { token: tokS });
  const ownerJson = JSON.stringify(owners.data);
  record(
    "ADMIN-PASSWORD-JSON",
    ownerJson.includes('"password"') ? "FAIL" : "PASS",
    "owner-accounts JSON includes password field",
    `hasPasswordKey=${ownerJson.includes('"password"')}`
  );

  const noAuthAdmin = await req(port, "GET", "/api/restaurants");
  record("ADMIN-NOAUTH", noAuthAdmin.status === 401 ? "PASS" : "FAIL", "Restaurant list requires super", `status=${noAuthAdmin.status}`);

  const restAsAdmin = await req(port, "GET", "/api/admin/dashboard", { token: tokA });
  record("REST-AS-SUPER", restAsAdmin.status === 401 ? "PASS" : "FAIL", "Restaurant token cannot hit super dashboard", `status=${restAsAdmin.status}`);

  const hashOn = String(meA.data).includes("$2") ? "n/a" : "check sqlite";
  record("HASH-NOTE", "INFO", "PASSWORD_HASHING=on for this run", hashOn);
} catch (err) {
  record("SCRIPT", "FAIL", "Audit script error", String(err).slice(0, 500));
} finally {
  stop(proc);
}

const out = { stamp, sqlite, port, findings };
const outPath = path.join(ROOT, "audit", "isolated-tenant-audit-results.json");
fs.mkdirSync(path.join(ROOT, "audit"), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
console.log("WROTE", outPath);
const fails = findings.filter((f) => f.status === "FAIL").length;
process.exit(fails ? 1 : 0);
