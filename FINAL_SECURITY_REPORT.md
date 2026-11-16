# MenuGo.az — Final Security Report

**Tarih:** 2026-11-16  
**Kapsam:** Yerel kod + izole SQLite. Production MySQL yazılmadı. Secret değerleri yok.

---

## Özet

Bu stabilizasyon turunda **7 doğrulanmış güvenlik/izolasyon açığı kapatıldı** ve test edildi. Phase 1/2 kontrolleri yeniden geçti. Doğrulanmış açık **P0 yok**.

---

## Bu turda kapatılanlar

| ID | Açık | Düzeltme | Doğrulama |
| --- | --- | --- | --- |
| STAB-01 | Guest order spam | `guestOrderRateLimit` (TCP peer + slug) | Stabilization test → 429 |
| STAB-02 | Logout token Map’te kalıyordu | `POST /api/auth/logout` + panel/admin çağrısı | Logout sonrası `/me` → 401 |
| STAB-03 | QR URL açık proxy | Origin/hostname allowlist | `evil.example` → 400 |
| STAB-04 | Public menü iç alanlar | `publicRestaurantDto` allowlist | `subscription_plan_id` / `total_page_views` yok |
| STAB-05 | HTTP başlıkları yok | nosniff, SAMEORIGIN, Referrer-Policy, Permissions-Policy | Header assert |
| STAB-06 | Impersonate 7 gün | 1 saat TTL + `[audit] impersonate` log | Kod |
| STAB-08 | Çapraz kategori / silme | Kategori `restaurant_id` eşlemesi; silmede restaurant filtresi | Cross create → 400 |

**Dosyalar:** `requestSecurity.ts`, `server.ts`, `src/App.tsx`, `src/admin/AdminApp.tsx`, `qa/security-stabilization.node.test.ts`

---

## Önceden kapatılan (yeniden doğrulandı)

- Server-side sipariş fiyatı (`quoteGuestCart`)
- HMAC v2 `X-Order-Access` + revoke
- Owner account password DTO
- Login/register rate limit (peer, XFF bypass yok)
- Upload auth-first + magic-byte
- `ORDER_ACCESS_SECRET` fail-closed
- Studio preview ticket sipariş engeli

`npm run test:security` → **12/12 PASS** (bu oturum).

---

## Tenant izolasyonu

`node audit/isolated-tenant-audit.mjs` (bu oturum): IDOR menü/dashboard/kategori/sipariş, public menü ayrımı, reprice, guest token PII, admin password JSON — **PASS**.

---

## Oturum modeli (kalan risk)

| Konu | Durum |
| --- | --- |
| In-memory `sessions` Map | Tek süreç varsayımı |
| Restart | Tüm oturumlar düşer (zorunlu yeniden giriş) |
| Multi-instance | Token paylaşılmaz — **ACCEPTED RISK (STAB-07)** |
| Bearer `localStorage` | XSS ile çalınabilir — HttpOnly cookie ayrı onay |
| Logout | Artık sunucuda revoke edilir |

**Kullanıcı etkisi (ileride Redis/cookie):** mevcut Bearer token’lar geçersiz olabilir → toplu yeniden giriş. Bu sürümde yapılmadı.

---

## Preview güvenlik sınırı

- Geçerli imzalı preview ticket → sipariş **oluşmaz**.
- Ticket’sız public menüden normal sipariş → **mevcut ürün davranışı** (bilinçli).
- Soft header/`preview_mode` tek başına güven kaynağı değildir.

---

## CSP

Strict CSP bu sürümde yok (**STAB-05b ACCEPTED RISK**). Temel header’lar var. Geniş `*` CSP kalıcı çözüm sayılmadı.

---

## Production env (değer yazılmaz)

Doğrulanması gereken isimler:

- `NODE_ENV=production`
- `DB_CLIENT=mysql` + `MYSQL_*` (veya eşdeğeri)
- `DB_AUTO_MIGRATE=off`
- `PASSWORD_HASHING=on`
- `ORDER_ACCESS_SECRET` (≥32 rastgele bayt)
- `ALLOW_SQLITE` **kullanılmamalı**
- Demo seed production’da kapalı
- İsteğe bağlı: `APP_URL` / `PUBLIC_URL` (QR allowlist için önerilir)
- `UPLOADS_DIR` deploy dışında kalıcı yol

---

## Sonuç

Kod tarafı güvenlik temeli **release için yeterli**. Canlıya çıkış Hostinger env doğrulaması + deploy onayı ister.
