# MenuGo.az — Final Stabilization Tracker

**Güncelleme:** 2026-11-16 (FAZ F)  
**Kod tabanı:** `f22bf91` + bu oturumdaki yerel güvenlik düzeltmeleri (commit yok)  
**Karar:** **RELEASE READY** (commit / push / Hostinger için ayrı onay)

---

## Kaynak raporlar

| Dosya | Durum |
| --- | --- |
| `audit/FULL_SYSTEM_AUDIT.md` | Var |
| `audit/BUG_REPORT.md` | Var |
| `audit/FIX_PRIORITY_PLAN.md` | Var |
| `audit/SECURITY_AUDIT.md` | Var |
| `audit/TENANT_ISOLATION_AUDIT.md` | Var |
| `audit/SECURITY_FIX_PHASE1_REPORT.md` | Var |
| `audit/PRODUCTION_SECURITY_RELEASE_CHECK.md` | Var |
| `audit/PRODUCTION_SECURITY_RELEASE_PHASE2.md` | Var |
| `DESIGN_REPLACEMENT_REPORT.md` | Var |
| `qa/playwright/REPORT.md` | Var — tarihsel; güncel sonuç: `qa/playwright/stabilization-last-run.log` |

---

## Bu oturumda kapatılanlar

| ID | Başlık | Öncelik | Durum | Test |
| --- | --- | --- | --- | --- |
| STAB-01 | Guest order POST rate limit | P1 | **VERIFIED** | `qa/security-stabilization.node.test.ts` |
| STAB-02 | Logout sunucu revoke | P1 | **VERIFIED** | aynı + panel/admin istemci |
| STAB-03 | `/api/qrcode` allowlist | P2 | **VERIFIED** | aynı |
| STAB-04 | Public menü DTO | P2 | **VERIFIED** | aynı |
| STAB-05 | Temel güvenlik başlıkları | P2 | **VERIFIED** | aynı |
| STAB-06 | Impersonate 1h TTL + audit log | P2 | **FIXED** | kod incelemesi |
| STAB-08 | Ürün kategori sahipliği + silme filtresi | P1 | **VERIFIED** | aynı |

## Önceki sürümde FIXED (bu oturumda yeniden doğrulandı)

| ID | Konu | Test (güncel) |
| --- | --- | --- |
| STAB-11 | Reprice, HMAC v2, upload, owner DTO, login/register RL | `npm run test:security` **12/12** |
| STAB-10 | Preview ticket sipariş engeli | Playwright `preview.spec` + phase1 |

## Kabul edilen riskler

| ID | Konu | Öncelik | Durum | Not |
| --- | --- | --- | --- | --- |
| STAB-07 | Bellek session / multi-instance / Bearer localStorage | P1 mimari | **ACCEPTED RISK** | Logout revoke kısmi iyileştirme; Redis/HttpOnly ayrı onay |
| STAB-05b | Strict CSP | P2 | **ACCEPTED RISK** | Harita/görsel kırılmasın diye ertelendi |
| STAB-09 | Sipariş idempotency | P2 | **ACCEPTED RISK** | Retry çift kayıt mümkün |
| STAB-15 | P3 bakım (god files, sitemap, 404) | P3 | **ACCEPTED RISK** | Release blocker değil |

## FAZ durumu

| Faz | Durum |
| --- | --- |
| A | DONE |
| B | DONE |
| C | DONE — kritik işlev regresyonları Playwright + tenant audit |
| D | DONE — şema incelemesi; production ALTER yok |
| E | DONE — güvenlik/password/staging/Playwright/build |
| F | DONE — final raporlar |

---

## Güncel test özeti (bu oturum)

| Komut | Sonuç |
| --- | --- |
| `npm run test:security` | **12/12 PASS** |
| `npm run test:password` | **6/6 PASS** |
| `npm run test:staging` | **11/11 PASS** |
| `npm run lint` | **PASS** |
| `node audit/isolated-tenant-audit.mjs` | **tüm senaryolar PASS** |
| `npx tsx --test qa/legacy-remap.node.test.ts` | **PASS** |
| Playwright (`playwright.config.ts`) | **75 passed (2.6m)** |
| `npx vite build` + `tsc -p tsconfig.server.json` | **PASS** |

---

## Açık P0

Yok (doğrulanmış).

## Açık P1 (düzeltme bekleyen)

Yok. STAB-07 mimari risk olarak kabul edildi.
