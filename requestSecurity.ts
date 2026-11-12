import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { Request, Response, NextFunction } from "express";

const MAX_QTY = 50;
const MAX_LINES = 40;
const MIN_SECRET_BYTES = 32;
const DEFAULT_TTL_SEC = 90 * 24 * 60 * 60;
const WEAK_SECRETS = new Set(["menugo-order-access-v1", "secret", "changeme", "password"]);

export function moneyToCents(raw: unknown): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0 || n > 1_000_000) return -1;
  return Math.round(n * 100);
}

export function centsToMoney(cents: number): number {
  return Math.round(cents) / 100;
}

/** TCP peer only. Ignores X-Forwarded-For / X-Real-IP. */
export function peerAddress(req: Request): string {
  const raw = String(req.socket?.remoteAddress || "");
  const ip = raw.replace(/^::ffff:/i, "").trim() || "unknown";
  return ip.slice(0, 64);
}

type Bucket = { count: number; resetAt: number };
const rateBuckets = new Map<string, Bucket>();

setInterval(() => {
  const now = Date.now();
  for (const [k, b] of rateBuckets) {
    if (b.resetAt < now) rateBuckets.delete(k);
  }
}, 60_000).unref?.();

function hit(key: string, windowMs: number, max: number): boolean {
  const now = Date.now();
  let b = rateBuckets.get(key);
  if (!b || b.resetAt < now) {
    b = { count: 0, resetAt: now + windowMs };
    rateBuckets.set(key, b);
  }
  b.count += 1;
  return b.count > max;
}

const GENERIC_429 = { error: "Too many attempts. Try again later." };
const WINDOW_MS = 15 * 60 * 1000;

export function loginRateLimit(req: Request, res: Response, next: NextFunction) {
  const peer = peerAddress(req);
  const user = String(req.body?.username ?? "").trim().toLowerCase().slice(0, 64);
  if (user && hit(`login-account:${user}`, WINDOW_MS, 8)) {
    res.status(429).json(GENERIC_429);
    return;
  }
  if (hit(`login-peer:${peer}`, WINDOW_MS, 120)) {
    res.status(429).json(GENERIC_429);
    return;
  }
  next();
}

export function registerRateLimit(req: Request, res: Response, next: NextFunction) {
  const peer = peerAddress(req);
  const user = String(req.body?.username ?? "").trim().toLowerCase().slice(0, 64);
  if (user && hit(`register-account:${user}`, WINDOW_MS, 8)) {
    res.status(429).json(GENERIC_429);
    return;
  }
  if (hit(`register-peer:${peer}`, WINDOW_MS, 40)) {
    res.status(429).json(GENERIC_429);
    return;
  }
  next();
}

export function assertOrderAccessSecretConfigured(): void {
  const raw = String(process.env.ORDER_ACCESS_SECRET ?? "").trim();
  if (!raw || Buffer.byteLength(raw, "utf8") < MIN_SECRET_BYTES || WEAK_SECRETS.has(raw.toLowerCase())) {
    throw new Error(
      "ORDER_ACCESS_SECRET is missing or too weak (need >= 32 bytes of random secret). Refusing to start."
    );
  }
}

function orderAccessSecret(): Buffer {
  assertOrderAccessSecretConfigured();
  return Buffer.from(String(process.env.ORDER_ACCESS_SECRET).trim(), "utf8");
}

export function createOrderAccessNonce(): string {
  return randomBytes(16).toString("hex");
}

export function orderAccessExpiry(nowMs = Date.now()): number {
  const ttl = Number(process.env.ORDER_ACCESS_TTL_SEC);
  const sec = Number.isFinite(ttl) && ttl > 0 ? Math.floor(ttl) : DEFAULT_TTL_SEC;
  return Math.floor(nowMs / 1000) + sec;
}

function hmacHex(payload: string): string {
  return createHmac("sha256", orderAccessSecret()).update(payload).digest("hex");
}

function hexEqual(a: string, b: string): boolean {
  const left = Buffer.from(a, "hex");
  const right = Buffer.from(b, "hex");
  if (left.length === 0 || left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export type OrderAccessClaims = {
  v: 2;
  orderId: number;
  restaurantId: number;
  deviceId: string;
  exp: number;
  nonce: string;
};

export function issueOrderAccessToken(claims: Omit<OrderAccessClaims, "v">): string {
  const body = {
    v: 2 as const,
    o: Number(claims.orderId),
    r: Number(claims.restaurantId),
    d: String(claims.deviceId),
    e: Number(claims.exp),
    n: String(claims.nonce),
  };
  const payload = Buffer.from(JSON.stringify(body), "utf8").toString("base64url");
  const mac = hmacHex(payload);
  return `v2.${payload}.${mac}`;
}

export function parseOrderAccessToken(token: string): OrderAccessClaims | null {
  const raw = String(token || "").trim();
  const parts = raw.split(".");
  if (parts.length !== 3 || parts[0] !== "v2") return null;
  const payload = parts[1];
  const mac = parts[2];
  if (!/^[0-9a-f]{64}$/i.test(mac)) return null;
  const expect = hmacHex(payload);
  if (!hexEqual(mac, expect)) return null;
  try {
    const body = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Record<string, unknown>;
    const orderId = Number(body.o);
    const restaurantId = Number(body.r);
    const exp = Number(body.e);
    const nonce = String(body.n || "");
    const deviceId = String(body.d || "");
    if (!Number.isInteger(orderId) || orderId < 1) return null;
    if (!Number.isInteger(restaurantId) || restaurantId < 1) return null;
    if (!Number.isFinite(exp) || exp < 1) return null;
    if (!/^[0-9a-f]{32}$/i.test(nonce)) return null;
    if (!deviceId || deviceId.length > 120) return null;
    if (Number(body.v) !== 2) return null;
    return { v: 2, orderId, restaurantId, deviceId, exp, nonce };
  } catch {
    return null;
  }
}

export function tokenExpired(exp: number, nowMs = Date.now()): boolean {
  return exp * 1000 <= nowMs;
}

export function splitOrderAccessHeader(raw: unknown): string[] {
  const s = String(raw || "").trim();
  if (!s) return [];
  return s.split(/[,\s]+/).map((x) => x.trim()).filter(Boolean).slice(0, 50);
}

export type QuotedLine = {
  product_id: number;
  variant_id: number | null;
  qty: number;
  unit_price: number;
  label: string;
  note: string;
};

export function parseCartLines(cart: unknown): Array<{
  product_id: number;
  variant_id: number | null;
  qty: number;
  label: string;
  note: string;
}> | null {
  if (!Array.isArray(cart) || cart.length === 0 || cart.length > MAX_LINES) return null;
  const out: Array<{
    product_id: number;
    variant_id: number | null;
    qty: number;
    label: string;
    note: string;
  }> = [];
  for (const raw of cart) {
    const row = raw as Record<string, unknown>;
    const product_id = Number(row.product_id ?? row.id);
    const qty = Number(row.qty ?? row.quantity);
    if (!Number.isInteger(product_id) || product_id < 1) return null;
    if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) return null;
    let variant_id: number | null = null;
    if (row.variant_id != null && row.variant_id !== "") {
      const vid = Number(row.variant_id);
      if (!Number.isInteger(vid) || vid < 1) return null;
      variant_id = vid;
    }
    out.push({
      product_id,
      variant_id,
      qty,
      label: String(row.label || "").slice(0, 200),
      note: String(row.note || "").slice(0, 500),
    });
  }
  return out;
}

const JPEG = Buffer.from([0xff, 0xd8, 0xff]);
const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
const GIF = Buffer.from("GIF8", "ascii");

export function sniffUpload(buf: Buffer): { ext: string; mime: string } | null {
  if (!buf || buf.length < 12) return null;
  if (buf.subarray(0, 3).equals(JPEG)) return { ext: "jpg", mime: "image/jpeg" };
  if (buf.subarray(0, 4).equals(PNG)) return { ext: "png", mime: "image/png" };
  if (buf.subarray(0, 4).equals(GIF)) return { ext: "gif", mime: "image/gif" };
  if (
    buf.subarray(0, 4).toString("ascii") === "RIFF" &&
    buf.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return { ext: "webp", mime: "image/webp" };
  }
  if (buf.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3]))) {
    return { ext: "webm", mime: "video/webm" };
  }
  const ftyp = buf.subarray(4, 8).toString("ascii");
  if (ftyp === "ftyp") {
    const brand = buf.subarray(8, 12).toString("ascii");
    if (brand.startsWith("qt")) return { ext: "mov", mime: "video/quicktime" };
    return { ext: "mp4", mime: "video/mp4" };
  }
  return null;
}
