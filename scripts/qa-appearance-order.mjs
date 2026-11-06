const BASE = "http://127.0.0.1:3010";

const login = await fetch(`${BASE}/api/restaurant/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ username: "demo", password: "demo123" }),
});
const session = await login.json();
if (!session.token) {
  console.error("login failed", session);
  process.exit(1);
}
const rid = session.restaurantId;
const auth = { Authorization: `Bearer ${session.token}`, "Content-Type": "application/json" };

const colors = {
  primary: "#c41e3a",
  secondary: "#ffd7dc",
  accent: "#8b1e3f",
  background: "#fff7f8",
  surface: "#ffffff",
  text: "#1a0a0d",
  muted: "#7a5560",
};
const doc = {
  version: 1,
  activeTemplateId: "bistro-rail",
  overridesByTemplate: {
    "bistro-rail": { preset: "custom", colors },
  },
};

const put = await fetch(`${BASE}/api/admin/restaurants/${rid}/profile`, {
  method: "PUT",
  headers: auth,
  body: JSON.stringify({ menu_appearance_json: JSON.stringify(doc) }),
});
const putBody = await put.json().catch(() => ({}));
console.log("save appearance", put.status, putBody.error || "ok");

const pub = await fetch(`${BASE}/api/restaurants/demo-az-menu?preview=true`);
const menu = await pub.json();
const saved = JSON.parse(menu.menu_appearance_json || "{}");
console.log("public primary", saved.overridesByTemplate?.["bistro-rail"]?.colors?.primary);

const order = await fetch(`${BASE}/api/restaurants/demo-az-menu/orders`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    device_id: "qa-skin-test-device",
    order_type: "pickup",
    payment_method: "cash",
    order_source: "web",
    customer_name: "QA Test Musteri",
    customer_phone: "+994501119911",
    address_text: "",
    geo_url: "",
    note: "QA isolated skin test",
    total_amount: 9.5,
    cart: [
      {
        line_id: "qa-1",
        product_id: 4,
        label: "QA Düşbərə",
        variant_id: null,
        qty: 1,
        unit_price: 9.5,
        note: "QA test qeydi",
      },
    ],
  }),
});
const orderBody = await order.json().catch(() => ({}));
console.log("isolated order", order.status, orderBody.id || orderBody.error || orderBody);

const resetDoc = { version: 1, overridesByTemplate: {} };
const reset = await fetch(`${BASE}/api/admin/restaurants/${rid}/profile`, {
  method: "PUT",
  headers: auth,
  body: JSON.stringify({ menu_appearance_json: JSON.stringify(resetDoc) }),
});
console.log("reset appearance", reset.status);
const pub2 = await fetch(`${BASE}/api/restaurants/demo-az-menu?preview=true`);
const menu2 = await pub2.json();
const saved2 = JSON.parse(menu2.menu_appearance_json || "{}");
console.log("after reset keys", Object.keys(saved2.overridesByTemplate || {}));
