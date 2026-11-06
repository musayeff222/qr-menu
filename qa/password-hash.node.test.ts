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
  hashPassword,
  isBcryptHash,
  isPasswordHashingEnabled,
  storePassword,
  upgradePlaintextIfNeeded,
  verifyPassword,
} from "../passwordHash.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("helper: hashing flag defaults off", () => {
  const prev = process.env.PASSWORD_HASHING;
  delete process.env.PASSWORD_HASHING;
  assert.equal(isPasswordHashingEnabled(), false);
  process.env.PASSWORD_HASHING = "on";
  assert.equal(isPasswordHashingEnabled(), true);
  process.env.PASSWORD_HASHING = "off";
  assert.equal(isPasswordHashingEnabled(), false);
  if (prev == null) delete process.env.PASSWORD_HASHING;
  else process.env.PASSWORD_HASHING = prev;
});

test("helper: bcrypt round-trip and reject wrong secret", async () => {
  const h = await hashPassword("CorrectHorse1!");
  assert.equal(isBcryptHash(h), true);
  assert.equal(h.length >= 59, true);
  assert.equal(await verifyPassword("CorrectHorse1!", h), true);
  assert.equal(await verifyPassword("wrong", h), false);
});

test("helper: plaintext dual-read", async () => {
  assert.equal(await verifyPassword("demo123", "demo123"), true);
  assert.equal(await verifyPassword("demo123", "other"), false);
  assert.equal(await verifyPassword("", "demo123"), false);
});

test("helper: storePassword respects flag", async () => {
  const prev = process.env.PASSWORD_HASHING;
  process.env.PASSWORD_HASHING = "off";
  const plain = await storePassword("plain-secret");
  assert.equal(plain, "plain-secret");
  process.env.PASSWORD_HASHING = "on";
  const hashed = await storePassword("plain-secret");
  assert.equal(isBcryptHash(hashed), true);
  assert.equal(hashed.includes("plain-secret"), false);
  if (prev == null) delete process.env.PASSWORD_HASHING;
  else process.env.PASSWORD_HASHING = prev;
});

test("helper: upgrade CAS only when flag on and stored is plaintext", async () => {
  const prev = process.env.PASSWORD_HASHING;
  process.env.PASSWORD_HASHING = "off";
  let wrote = "";
  await upgradePlaintextIfNeeded("demo123", "demo123", async (h) => {
    wrote = h;
  });
  assert.equal(wrote, "");

  process.env.PASSWORD_HASHING = "on";
  await upgradePlaintextIfNeeded("demo123", "demo123", async (h) => {
    wrote = h;
  });
  assert.equal(isBcryptHash(wrote), true);

  const before = wrote;
  await upgradePlaintextIfNeeded(wrote, "demo123", async (h) => {
    wrote = h;
  });
  assert.equal(wrote, before);
  if (prev == null) delete process.env.PASSWORD_HASHING;
  else process.env.PASSWORD_HASHING = prev;
});

type Proc = { child: ChildProcess; port: number; sqlite: string };

const live: Proc[] = [];

function stopProc(p: Proc) {
  try {
    if (process.platform === "win32" && p.child.pid) {
      spawn("taskkill", ["/pid", String(p.child.pid), "/T", "/F"], { stdio: "ignore" });
    } else {
      p.child.kill("SIGTERM");
    }
  } catch {
    /* already gone */
  }
}

after(() => {
  for (const p of live) stopProc(p);
});

function startIsolatedServer(hashing: "on" | "off"): Promise<Proc> {
  const sqlite = path.join(os.tmpdir(), `menugo-pw-${hashing}-${Date.now()}.sqlite`);
  const port = 3100 + Math.floor(Math.random() * 400);
  const child = spawn("npx", ["tsx", "server.ts"], {
    cwd: ROOT,
    env: isolatedServerEnv({
      PORT: String(port),
      SQLITE_PATH: sqlite,
      PASSWORD_HASHING: hashing,
      NODE_ENV: fs.existsSync(path.join(ROOT, "dist", "index.html")) ? "production" : process.env.NODE_ENV,
      ALLOW_SQLITE: "on",
      ALLOW_DEMO_SEED: "on",
    }),
    shell: true,
    stdio: ["ignore", "pipe", "pipe"],
  });
  const proc: Proc = { child, port, sqlite };
  live.push(proc);
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`server ${hashing} timeout on ${port}`)), 90000);
    const onData = (buf: Buffer) => {
      const s = buf.toString();
      if (s.includes("Server ready")) {
        clearTimeout(t);
        resolve(proc);
      }
    };
    child.stdout?.on("data", onData);
    child.stderr?.on("data", onData);
    child.on("exit", (code) => {
      clearTimeout(t);
      reject(new Error(`server ${hashing} exited ${code}`));
    });
  });
}

async function storedPassword(
  sqlite: string,
  table: "restaurant_users" | "admin_users",
  username: string
): Promise<string> {
  let last = "";
  for (let i = 0; i < 10; i++) {
    try {
      const db = new Database(sqlite, { readonly: true, fileMustExist: true });
      try {
        const row = db.prepare(`SELECT password FROM ${table} WHERE username = ?`).get(username) as
          | { password?: string }
          | undefined;
        last = String(row?.password || "");
        return last;
      } finally {
        db.close();
      }
    } catch {
      await new Promise((r) => setTimeout(r, 100));
    }
  }
  return last;
}

async function jsonPost(port: number, urlPath: string, body: unknown, token?: string) {
  const res = await fetch(`http://127.0.0.1:${port}${urlPath}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
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

test("isolated sqlite: hashing on writes bcrypt; off keeps plaintext; hashed login survives flag off", { timeout: 180000 }, async () => {
  const on = await startIsolatedServer("on");
  const stamp = Date.now();
  const user = `pwon${stamp}`;
  const pass = "OnFlag123!";

  const reg = await jsonPost(on.port, "/api/public/register", {
    full_name: "PW On User",
    username: user,
    password: pass,
    phone: "+994501110044",
  });
  assert.equal(reg.status, 200, reg.text);
  const storedNew = await storedPassword(on.sqlite, "restaurant_users", user);
  assert.equal(isBcryptHash(storedNew), true);
  assert.equal(storedNew.includes(pass), false);

  const loginNew = await jsonPost(on.port, "/api/restaurant/login", { username: user, password: pass });
  assert.equal(loginNew.status, 200, loginNew.text);

  const demo1 = await jsonPost(on.port, "/api/restaurant/login", { username: "demo", password: "demo123" });
  assert.equal(demo1.status, 200, demo1.text);
  const demoStored = await storedPassword(on.sqlite, "restaurant_users", "demo");
  assert.equal(isBcryptHash(demoStored), true);

  const admin1 = await jsonPost(on.port, "/api/admin/login", { username: "admin", password: "admin123" });
  assert.equal(admin1.status, 200, admin1.text);
  const adminStored = await storedPassword(on.sqlite, "admin_users", "admin");
  assert.equal(isBcryptHash(adminStored), true);

  const bad = await jsonPost(on.port, "/api/restaurant/login", { username: user, password: "nope" });
  assert.equal(bad.status, 401);
  assert.equal(JSON.stringify(bad.data).includes(pass), false);
  assert.equal(await storedPassword(on.sqlite, "restaurant_users", user), storedNew);

  const token = String(admin1.data.token || "");
  const slug = `pwoff${stamp}`;
  const staffUser = `pwstaff${stamp}`;
  const staffPass = "StaffOn123!";
  const created = await jsonPost(
    on.port,
    "/api/restaurants",
    { name: "PW Isolated", slug, admin_username: staffUser, admin_password: staffPass, seed_demo: false },
    token
  );
  assert.equal(created.status, 200, created.text);
  const restId = Number((created.data as { id?: number }).id);
  const resetUser = `pwreset${stamp}`;
  const resetPass = "ResetOn123!";
  const reset = await jsonPost(
    on.port,
    `/api/admin/restaurants/${restId}/staff`,
    { username: resetUser, password: resetPass },
    token
  );
  assert.equal(reset.status, 200, reset.text);
  assert.equal(isBcryptHash(await storedPassword(on.sqlite, "restaurant_users", resetUser)), true);
  const resetLogin = await jsonPost(on.port, "/api/restaurant/login", {
    username: resetUser,
    password: resetPass,
  });
  assert.equal(resetLogin.status, 200, resetLogin.text);

  const [c1, c2] = await Promise.all([
    jsonPost(on.port, "/api/restaurant/login", { username: user, password: pass }),
    jsonPost(on.port, "/api/restaurant/login", { username: user, password: pass }),
  ]);
  assert.equal(c1.status, 200);
  assert.equal(c2.status, 200);
  assert.notEqual(c1.data.token, c2.data.token);

  stopProc(on);
  await new Promise((r) => setTimeout(r, 2000));

  const offReuse = await startIsolatedOnFile("off", on.sqlite);

  const hashedStillWorks = await jsonPost(offReuse.port, "/api/restaurant/login", {
    username: user,
    password: pass,
  });
  assert.equal(hashedStillWorks.status, 200, hashedStillWorks.text);

  const demoOff = await jsonPost(offReuse.port, "/api/restaurant/login", {
    username: "demo",
    password: "demo123",
  });
  assert.equal(demoOff.status, 200, demoOff.text);

  const offUser = `pwoffu${stamp}`;
  const offPass = "OffFlag123!";
  const regOff = await jsonPost(offReuse.port, "/api/public/register", {
    full_name: "PW Off User",
    username: offUser,
    password: offPass,
    phone: "+994501110055",
  });
  assert.equal(regOff.status, 200, regOff.text);
  const storedOff = await storedPassword(on.sqlite, "restaurant_users", offUser);
  assert.equal(isBcryptHash(storedOff), false);
  assert.equal(storedOff, offPass);

  const loginOff = await jsonPost(offReuse.port, "/api/restaurant/login", {
    username: offUser,
    password: offPass,
  });
  assert.equal(loginOff.status, 200, loginOff.text);
  assert.equal(await storedPassword(on.sqlite, "restaurant_users", offUser), offPass);
});

function startIsolatedOnFile(hashing: "on" | "off", sqlite: string): Promise<Proc> {
  const port = 3100 + Math.floor(Math.random() * 400);
  const child = spawn("npx", ["tsx", "server.ts"], {
    cwd: ROOT,
    env: isolatedServerEnv({
      PORT: String(port),
      SQLITE_PATH: sqlite,
      PASSWORD_HASHING: hashing,
      NODE_ENV: fs.existsSync(path.join(ROOT, "dist", "index.html")) ? "production" : process.env.NODE_ENV,
      ALLOW_SQLITE: "on",
      ALLOW_DEMO_SEED: "on",
    }),
    shell: true,
    stdio: ["ignore", "pipe", "pipe"],
  });
  const proc: Proc = { child, port, sqlite };
  live.push(proc);
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`server ${hashing} timeout on ${port}`)), 90000);
    const onData = (buf: Buffer) => {
      if (buf.toString().includes("Server ready")) {
        clearTimeout(t);
        resolve(proc);
      }
    };
    child.stdout?.on("data", onData);
    child.stderr?.on("data", onData);
    child.on("exit", (code) => {
      clearTimeout(t);
      reject(new Error(`server ${hashing} exited ${code}`));
    });
  });
}
