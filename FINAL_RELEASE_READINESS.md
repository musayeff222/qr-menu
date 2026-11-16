# MenuGo.az — Final Release Readiness

**Tarih:** 2026-11-16  
**Karar: RELEASE READY**

Commit, GitHub push ve Hostinger deploy **bu dosyada onaylanmaz** — ayrıca isteyin.

---

## Release kriterleri

| # | Kriter | Durum |
| --- | --- | --- |
| 1 | Doğrulanmış açık P0 yok | **PASS** |
| 2 | P1 kapalı veya kabul edilmiş | **PASS** (STAB-07 ACCEPTED RISK belgelendi) |
| 3 | Temel akışlar test | **PASS** (Playwright 75) |
| 4 | Tenant izolasyonu | **PASS** (isolated-tenant-audit) |
| 5 | Temiz production build | **PASS** (`vite build` + `tsc` server) |
| 6 | Tam regresyon | **PASS** (security/password/staging/Playwright) |
| 7 | Prod ayar + migration belgesi | **PASS** (aşağıda + DB review) |
| 8 | Backup / rollback planı | **PASS** (`FINAL_DATABASE_REVIEW.md`) |
| 9 | Test edilmeyenler açık | **PASS** (functional report) |
| 10 | Kalan riskler şeffaf | **PASS** |

---

## Sayılar

| Metrik | Değer |
| --- | --- |
| Bu turda bulunan / kapatılan doğrulanmış açık | **7** (STAB-01..06, 08) |
| Test edilen (yeni + regresyon paketleri) | Security 12, password 6, staging 11, Playwright 75, tenant audit, legacy remap |
| Açık P0 | **0** |
| Açık P1 (düzeltme bekleyen) | **0** |
| Kabul edilen risk | STAB-07, STAB-05b, STAB-09, STAB-15 |
| Migration gerekli mi? | **Hayır** |
| Tam build | **PASS** |
| Playwright | **75 passed** |
| Tenant izolasyonu | **Doğrulandı** |

---

## Production yapılandırma kontrol listesi

Değerleri rapora yazmayın; Hostinger panelinde doğrulayın:

1. `NODE_ENV=production`
2. MySQL bağlantısı (`DB_CLIENT` / `MYSQL_*`) — SQLite yok
3. `DB_AUTO_MIGRATE=off`
4. `PASSWORD_HASHING=on`
5. `ORDER_ACCESS_SECRET` güçlü ve set
6. `ALLOW_SQLITE` yok / off
7. Demo seed kapalı
8. `APP_URL` veya `PUBLIC_URL` = canlı origin (QR allowlist)
9. `UPLOADS_DIR` kalıcı (deploy dışı)

Şüphede: yalnızca değişken **adı** ve panelden doğrulama adımı — secret okunmaz.

---

## Deploy sırası (onay sonrası)

1. MySQL + uploads yedeği  
2. Bu oturum değişikliklerini commit (ayrı onay)  
3. Push / Hostinger deploy (ayrı onay)  
4. Zararsız canlı smoke: login, bir public menü GET, bir panel sayfa  
5. Sorun olursa uygulama artefakt rollback (şema ALTER yok)

---

## Kalan riskler (kısa)

- Bellek oturum / tek instance varsayımı  
- Bearer localStorage XSS yüzeyi  
- Strict CSP yok  
- Sipariş idempotency yok  
- Admin panel her kontrolün manuel matrisi yok  
- Windows’ta `npm ci` kilitlenmesi → clean worktree gerekebilir  

---

## Yerel değişiklikler (henüz commit yok)

- `requestSecurity.ts`, `server.ts`, `package.json`
- `src/App.tsx`, `src/admin/AdminApp.tsx`
- `qa/security-stabilization.node.test.ts`
- `audit/isolated-tenant-audit.mjs` (plan-limit harness)
- Final raporlar + tracker

**Sonraki adım sizden:** git commit / push / Hostinger onayı.
