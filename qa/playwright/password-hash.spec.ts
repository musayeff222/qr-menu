import { test, expect } from "@playwright/test";

function unique(prefix: string) {
  return `${prefix}${Date.now().toString(36)}${Math.floor(Math.random() * 1e4)}`;
}

test.describe("password hashing API (shared local sqlite)", () => {
  test("wrong restaurant password is 401 and does not leak secrets", async ({ request }) => {
    const res = await request.post("/api/restaurant/login", {
      data: { username: "demo", password: "wrong-password-not-used" },
    });
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(JSON.stringify(body)).not.toMatch(/demo123|wrong-password|\$2[aby]\$/i);
    expect(body.success).toBeFalsy();
  });

  test("existing demo plaintext (or upgraded hash) still logs in", async ({ request }) => {
    const res = await request.post("/api/restaurant/login", {
      data: { username: "demo", password: "demo123" },
    });
    expect(res.ok(), await res.text()).toBeTruthy();
    const body = await res.json();
    expect(body.token).toBeTruthy();
    expect(body.restaurantId).toBeTruthy();
    expect(JSON.stringify(body)).not.toMatch(/demo123/);
  });

  test("admin login and isolated restaurant create + staff login", async ({ request }) => {
    const admin = await request.post("/api/admin/login", {
      data: { username: "admin", password: "admin123" },
    });
    expect(admin.ok(), await admin.text()).toBeTruthy();
    const adminBody = await admin.json();
    expect(adminBody.token).toBeTruthy();
    expect(JSON.stringify(adminBody)).not.toMatch(/admin123/);
    const headers = { Authorization: `Bearer ${adminBody.token}` };

    const slug = unique("pwrest");
    const username = unique("pwstaff");
    const password = "PwStaff123!";
    const created = await request.post("/api/restaurants", {
      headers,
      data: {
        name: `PW Rest ${slug}`,
        slug,
        admin_username: username,
        admin_password: password,
        seed_demo: false,
      },
    });
    expect(created.ok(), await created.text()).toBeTruthy();
    const rest = await created.json();
    expect(rest.id).toBeTruthy();

    const login = await request.post("/api/restaurant/login", {
      data: { username, password },
    });
    expect(login.ok(), await login.text()).toBeTruthy();
    const loginBody = await login.json();
    expect(loginBody.restaurantId).toBe(rest.id);

    const resetUser = unique("pwreset");
    const resetPass = "PwReset123!";
    const staff = await request.post(`/api/admin/restaurants/${rest.id}/staff`, {
      headers,
      data: { username: resetUser, password: resetPass },
    });
    expect(staff.ok(), await staff.text()).toBeTruthy();
    const staffBody = await staff.json();
    expect(JSON.stringify(staffBody)).not.toMatch(/PwReset123/);

    const afterReset = await request.post("/api/restaurant/login", {
      data: { username: resetUser, password: resetPass },
    });
    expect(afterReset.ok(), await afterReset.text()).toBeTruthy();

    const oldStaff = await request.post("/api/restaurant/login", {
      data: { username, password },
    });
    expect(oldStaff.status()).toBe(401);
  });

  test("register then login; concurrent logins both succeed", async ({ request }) => {
    const username = unique("pwreg");
    const password = "PwReg123!";
    const reg = await request.post("/api/public/register", {
      data: {
        full_name: "PW Register User",
        username,
        password,
        phone: "+994501110033",
      },
    });
    expect(reg.ok(), await reg.text()).toBeTruthy();
    const [a, b] = await Promise.all([
      request.post("/api/restaurant/login", { data: { username, password } }),
      request.post("/api/restaurant/login", { data: { username, password } }),
    ]);
    expect(a.ok(), await a.text()).toBeTruthy();
    expect(b.ok(), await b.text()).toBeTruthy();
    const ja = await a.json();
    const jb = await b.json();
    expect(ja.token).toBeTruthy();
    expect(jb.token).toBeTruthy();
    expect(ja.token).not.toBe(jb.token);
  });
});
