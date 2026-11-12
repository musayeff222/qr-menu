# Order access tokens — no production ALTER

Guest order access v2 stores `access_nonce`, `access_exp`, and `access_revoked` inside existing `menu_orders.payload` JSON.

- Production MySQL: **do not run** ALTER. `DB_AUTO_MIGRATE` stays off.
- Local SQLite tests use the existing payload column.
- Secret rotation: change `ORDER_ACCESS_SECRET` and restart; all HMAC v2 tokens fail closed until guests place a new order.

This file is documentation only. It is not applied automatically.
