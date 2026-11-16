# MenuGo.az — Final Functional Test Report

**Tarih:** 2026-11-16  
**Ortam:** Yerel SQLite, port 3010 (Playwright `reuseExistingServer`), izole child process testleri.

---

## Özet

Temel kullanıcı akışları bu oturumda **yeniden** çalıştırıldı. Eski PASS sonuçları kullanılmadı.

| Paket | Sonuç |
| --- | --- |
| Playwright full (`playwright.config.ts`) | **75 passed / 0 failed (2.6m)** |
| Security (unit + izole) | **12/12** |
| Password | **6/6** |
| Staging safety | **11/11** |
| Legacy remap | **PASS** |
| Tenant isolation audit | **PASS** |
| `tsc --noEmit` | **PASS** |
| Production build (`vite` + `tsc` server) | **PASS** |

Kanıt log: `qa/playwright/stabilization-last-run.log`

---

## Korunan özellikler (regresyon)

| Özellik | Kanıt |
| --- | --- |
| FastFood Pro / Ocean Modern / Bella Classic | visual + distinct + flow/checkout/preview |
| Legacy → 3 skin remap | `qa/legacy-remap.node.test.ts` |
| Tam ekran CheckoutScreen | `checkout.spec.ts` |
| StudioMenuPreview + imzalı ticket | `preview.spec.ts` |
| Server-side fiyat | order + security + tenant audit |
| HMAC v2 / X-Order-Access | security-phase2 + order.spec |
| WhatsApp siparişi sunucuya yazılmaz | mevcut davranış korundu (değiştirilmedi) |
| AZ/TR/RU/EN | langs + i18n specs |

---

## Playwright kapsam (75)

- Visual 3 skin × viewport’lar
- Distinct / overflow
- Flow, checkout, order, preview, theme
- i18n, langs, onboarding, password-hash, perf, contrast

---

## Test edilemeyen / sınırlı alanlar

| Alan | Neden |
| --- | --- |
| Canlı Hostinger MySQL | Yazma yasağı; canlı müşteri verisi yok |
| Admin panel her buton manuel | Playwright admin yüzeyini kısmen kapsar; tam tıklama matrisi yok |
| Çoklu Node instance oturum | STAB-07 — mimari kabul |
| Strict CSP uyumluluğu | STAB-05b ertelendi |
| Sipariş idempotency (çift tık) | STAB-09 kabul |
| `npm run build` + `prebuild npm ci` clean worktree | Bu oturumda `vite`+`tsc` doğrulandı; Windows kilidi riski notu aynı |

---

## Mock vs entegrasyon

| Tür | Ne |
| --- | --- |
| Unit | `request-security`, password helpers |
| İzole entegrasyon | security-phase1/2/stabilization, staging, tenant audit (geçici SQLite + child server) |
| UI entegrasyon | Playwright → gerçek local server 3010 |

---

## İşlevsel hata (bu tur)

Tenant audit’te görülen “kategori create 403” **ürün bug’ı değil**: free plan register seed’i `max_categories` dolduruyor. Harness buna göre güncellendi; izolasyon PASS.
