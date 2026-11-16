import assert from "node:assert/strict";
import { test } from "node:test";
import { MENU_TEMPLATE_IDS_ORDERED, templateIndex } from "../planTemplatePolicy.js";

function resolved(id: string) {
  const idx = templateIndex(id);
  assert.ok(idx >= 0, `expected remap for ${id}`);
  return MENU_TEMPLATE_IDS_ORDERED[idx];
}

test("legacy QR template ids remap to the 3 active skins", () => {
  assert.equal(resolved("fast-food-01"), "fastfood-pro");
  assert.equal(resolved("burger-stack"), "fastfood-pro");
  assert.equal(resolved("cafe-01"), "ocean-modern");
  assert.equal(resolved("cafe-polaroid"), "ocean-modern");
  assert.equal(resolved("luxury-03"), "bella-classic");
  assert.equal(resolved("bistro-rail"), "bella-classic");
  assert.equal(resolved("fastfood-pro"), "fastfood-pro");
  assert.equal(resolved("ocean-modern"), "ocean-modern");
  assert.equal(resolved("bella-classic"), "bella-classic");
  assert.equal(resolved(""), "bella-classic");
  assert.equal(resolved("unknown-skin-xyz"), "bella-classic");
});
