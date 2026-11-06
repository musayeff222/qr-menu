import { timingSafeEqual } from "node:crypto";
import { compare, hash } from "bcryptjs";

/** bcrypt cost — 12 is the planned production default. */
export const BCRYPT_ROUNDS = 12;

const BCRYPT_PREFIX = /^\$2[aby]\$\d{2}\$/;

/**
 * Precomputed bcrypt of an unrelated dummy string (cost 12).
 * Used on the plaintext / missing-user path so compare cost is similar to a real hash.
 */
const TIMING_DUMMY_HASH =
  "$2b$12$bZOzNu7CAn3Ow7ivL4PR8elAAoVz89w8qs.63lwQ3DK0KukogFJCu";

function envFlag(raw: string | undefined): boolean {
  const v = String(raw ?? "off").trim().toLowerCase();
  return v === "on" || v === "1" || v === "true" || v === "yes";
}

/** When false, new writes stay plaintext; verification still accepts hashes. */
export function isPasswordHashingEnabled(): boolean {
  return envFlag(process.env.PASSWORD_HASHING);
}

export function isBcryptHash(value: unknown): boolean {
  return typeof value === "string" && BCRYPT_PREFIX.test(value) && value.length >= 59;
}

export async function hashPassword(plain: string): Promise<string> {
  return hash(plain, BCRYPT_ROUNDS);
}

/** Persist form: hash when the write flag is on, otherwise store as given. */
export async function storePassword(plain: string): Promise<string> {
  const p = String(plain);
  if (!p) return p;
  if (isPasswordHashingEnabled()) return hashPassword(p);
  return p;
}

function timingSafeUtf8Equal(a: string, b: string): boolean {
  const ba = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ba.length !== bb.length) {
    const pad = Buffer.alloc(ba.length);
    timingSafeEqual(ba, pad);
    return false;
  }
  return timingSafeEqual(ba, bb);
}

/**
 * Dual-read: bcrypt hashes always verify with compare.
 * Legacy plaintext rows use equality after a dummy compare (timing).
 * Missing / empty stored values never match a non-empty password.
 */
export async function verifyPassword(plain: string, stored: string): Promise<boolean> {
  const p = String(plain ?? "");
  const s = String(stored ?? "");
  if (!p || !s) {
    await compare(p || "x", TIMING_DUMMY_HASH).catch(() => false);
    return false;
  }
  if (isBcryptHash(s)) {
    return compare(p, s);
  }
  await compare(p, TIMING_DUMMY_HASH).catch(() => false);
  return timingSafeUtf8Equal(s, p);
}

/**
 * After a successful plaintext login, upgrade the row in place when the write flag is on.
 * `persist` should be a compare-and-swap UPDATE so concurrent logins write at most one hash.
 */
export async function upgradePlaintextIfNeeded(
  stored: string,
  plain: string,
  persist: (hash: string) => Promise<unknown>
): Promise<void> {
  if (!isPasswordHashingEnabled()) return;
  if (!stored || isBcryptHash(stored)) return;
  const next = await hashPassword(plain);
  await persist(next);
}
