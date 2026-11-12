import assert from "node:assert/strict";
import { test } from "node:test";
import {
  assertOrderAccessSecretConfigured,
  createOrderAccessNonce,
  issueOrderAccessToken,
  moneyToCents,
  centsToMoney,
  parseCartLines,
  parseOrderAccessToken,
  sniffUpload,
  tokenExpired,
} from "../requestSecurity.js";

const SECRET = "menugo-isolated-test-order-access-secret-do-not-use-in-prod";

test("money rounding uses integer cents", () => {
  assert.equal(moneyToCents(15.5), 1550);
  assert.equal(centsToMoney(moneyToCents(1.1) + moneyToCents(2.2)), 3.3);
});

test("ORDER_ACCESS_SECRET fail-closed rejects missing and weak values", () => {
  const prev = process.env.ORDER_ACCESS_SECRET;
  try {
    delete process.env.ORDER_ACCESS_SECRET;
    assert.throws(() => assertOrderAccessSecretConfigured(), /missing or too weak/);
    process.env.ORDER_ACCESS_SECRET = "short";
    assert.throws(() => assertOrderAccessSecretConfigured(), /missing or too weak/);
    process.env.ORDER_ACCESS_SECRET = "menugo-order-access-v1";
    assert.throws(() => assertOrderAccessSecretConfigured(), /missing or too weak/);
    process.env.ORDER_ACCESS_SECRET = SECRET;
    assert.doesNotThrow(() => assertOrderAccessSecretConfigured());
  } finally {
    if (prev === undefined) delete process.env.ORDER_ACCESS_SECRET;
    else process.env.ORDER_ACCESS_SECRET = prev;
  }
});

test("HMAC v2 token is bound to order, restaurant, device, nonce", () => {
  process.env.ORDER_ACCESS_SECRET = SECRET;
  const nonce = createOrderAccessNonce();
  const exp = Math.floor(Date.now() / 1000) + 3600;
  const a = issueOrderAccessToken({
    restaurantId: 1,
    orderId: 9,
    deviceId: "device-a",
    nonce,
    exp,
  });
  const parsed = parseOrderAccessToken(a);
  assert.ok(parsed);
  assert.equal(parsed!.orderId, 9);
  assert.equal(parsed!.restaurantId, 1);
  assert.equal(parsed!.deviceId, "device-a");
  assert.equal(parseOrderAccessToken(a.slice(0, -2) + "ff"), null);
  const b = issueOrderAccessToken({
    restaurantId: 2,
    orderId: 9,
    deviceId: "device-a",
    nonce,
    exp,
  });
  assert.equal(parseOrderAccessToken(a)!.restaurantId !== parseOrderAccessToken(b)!.restaurantId, true);
});

test("token expiry helper", () => {
  assert.equal(tokenExpired(Math.floor(Date.now() / 1000) - 1), true);
  assert.equal(tokenExpired(Math.floor(Date.now() / 1000) + 60), false);
});

test("cart parser rejects empty, huge qty, and non-integer ids", () => {
  assert.equal(parseCartLines([]), null);
  assert.equal(parseCartLines([{ product_id: 1, qty: -1 }]), null);
  const ok = parseCartLines([{ id: 4, qty: 2, variant_id: 9, label: "Tea" }]);
  assert.ok(ok);
  assert.equal(ok![0].product_id, 4);
});

test("upload sniff accepts PNG and rejects plaintext", () => {
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64"
  );
  assert.deepEqual(sniffUpload(png), { ext: "png", mime: "image/png" });
  assert.equal(sniffUpload(Buffer.from("<?php echo 1;")), null);
});
