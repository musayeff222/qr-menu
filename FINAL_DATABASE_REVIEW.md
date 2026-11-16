# MenuGo.az — Final Database Review

**Tarih:** 2026-11-16  
**Kapsam:** Kaynak kod (`database.ts`, `server.ts`). Production MySQL’e yazılmadı / ALTER uygulanmadı.

---

## Özet

Bu stabilizasyon için **yeni migration gerekmez**. Sipariş access nonce ve revoke bayrakları mevcut `menu_orders.payload` JSON içinde.

---

## Şema gözlemleri

- Knex ile SQLite (lokal) / MySQL (prod) sürücü seçimi.
- `menu_orders`, `product_variants`, `restaurant_users`, `restaurant_media_assets` vb. FK + çoğu `onDelete("CASCADE")`.
- `device_id`, `demo_slug` gibi alanlarda index var.
- `menu_appearance_json` kolon sağlık kontrolü staging testlerinde doğrulanıyor.
- Register + demo seed: free plan `max_categories` / `max_products` kadar seed; ek kategori create limitte 403 (tasarım).

---

## Transaction / bütünlük

| Konu | Durum |
| --- | --- |
| Register (restoran + user) | `db.transaction` kullanılıyor |
| Sipariş create | Tek insert; istemci fiyatı yok sayılıyor |
| Kategori silme | Aynı `restaurant_id` ürünleri (STAB-08 sonrası) |
| Ürün create kategori | Aynı restoran zorunlu (STAB-08) |
| N+1 | Public menüde varyant attach; kabul edilebilir ölçek |
| Pagination | Staff sipariş listesi `limit(100)` |

---

## SQLite / MySQL

- Production: `ALLOW_SQLITE` kapalı olmalı; staging testleri bunu doğrular.
- `DB_AUTO_MIGRATE=off` production’da zorunlu öneri.
- Auto-migrate yalnızca bilinçli staging/lokal.

---

## Migration ihtiyacı

| Değişiklik | Gerekli mi? |
| --- | --- |
| STAB-01..08 güvenlik | **Hayır** (uygulama kodu) |
| HMAC v2 / preview ticket | **Hayır** |
| Idempotency-Key (STAB-09) | İleride istenirse şema/kolon — **onay sonrası** |
| Redis session (STAB-07) | Uygulama mimarisi; DB ALTER şart değil |

Mevcut restoran / müşteri kayıtlarına dokunulmadı.

---

## Backup ve rollback

**Deploy öncesi (Hostinger):**

1. MySQL tam dump (phpMyAdmin / `mysqldump`) — dosyayı uygulama dizinine koymayın.
2. `private_uploads` / `UPLOADS_DIR` yedeği.
3. Mevcut `dist` + `dist-server` (veya Hostinger release) kopyası.

**Rollback:**

1. Önceki uygulama artefaktına dön (git tag / önceki deploy paketi).
2. Gerekirse dump’tan MySQL restore (**yalnızca bu stabilizasyon şema değiştirmediği için çoğu zaman uygulama rollback yeterli**).
3. Env değişkenlerini önceki bilinen iyi değere çekin; `ORDER_ACCESS_SECRET` değiştirildiyse eski guest token’lar düşer.

**Bu PR/oturum şema ALTER içermediği için DB rollback çoğu senaryoda gereksizdir.**
