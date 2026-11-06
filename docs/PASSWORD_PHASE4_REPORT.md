# MenuGo — Faz 4: parola güvenliği (uygulama raporu)

**Tarih:** 4 Kasım 2026  
**Ortam:** yerel SQLite (`./qrmenu.sqlite` ve izole temp DB). Canlı MySQL’e dokunulmadı.  
**Yapılmayanlar:** git commit, production deploy, canlı migration, müşteri satırı silme/güncelleme.

Kanıt kuralı: PASS yalnız gerçek koşu ile.

---

## Ne değişti

Giriş artık `WHERE username = ? AND password = ?` kullanmıyor. Kullanıcı ada göre bulunur, parola `verifyPassword` ile doğrulanır.

- **Yazma bayrağı:** `PASSWORD_HASHING` (`on` / `off`, varsayılan **off**).
- **Doğrulama her zaman çift okuma:** `$2a$` / `$2b$` / `$2y$` → bcrypt.compare; aksi halde düz metin eşitliği (dummy bcrypt ile zaman hizası).
- **Bayrak açıkken:** yeni kayıt / staff reset / restoran oluşturma / seed yazımı bcrypt cost **12**; başarılı düz metin girişinde aynı istekte tembel yükseltme (compare-and-swap `UPDATE … WHERE password = eski`).
- **Bayrak kapalıyken:** yeni yazımlar düz metin kalır; **hash’lenmiş satırlar hâlâ giriş yapar.** Bu, bayrağı kapatmanın güvenli geri dönüşüdür.

Oturum modeli değişmedi: bellek içi Bearer, `localStorage.restaurantSession` / `adminSession`. QR menü, sipariş, ürün ve 30 şablon yollarına dokunulmadı.

---

## Değişen dosyalar

| Dosya | Ne |
|-------|----|
| `passwordHash.ts` | **yeni** — hash / verify / store / upgrade |
| `server.ts` | register, restaurant login, admin login, staff reset, admin user patch, restoran oluşturma |
| `database.ts` | demo/admin seed `storePassword`; **her boot’ta `admin123` yazma kaldırıldı**; kolon uzunluğu uyarısı (ALTER yok) |
| `demaeSeedRunner.ts` | yeni staff hash’ler; mevcut staff parolası seed’de ezilmez |
| `seedDemaeRestaurant.ts` | parola artık loglanmaz |
| `qa/password-hash.node.test.ts` | izole SQLite + bayrak on/off |
| `qa/playwright/password-hash.spec.ts` | paylaşılan yerel DB API testleri |
| `playwright.config.ts` | password-hash spec |
| `package.json` | `bcryptjs`, `test:password` |
| `.env.example` | `PASSWORD_HASHING` |
| `tsconfig.server.json` | `passwordHash.ts` |

Bağımlılık: `bcryptjs@3` (native bcrypt yok; Hostinger/Windows için).

---

## Test sonuçları

| Koşu | Sonuç | Kanıt |
|------|--------|--------|
| `npm run lint` (`tsc --noEmit`) | **PASS** | 0 hata |
| `tsc -p tsconfig.server.json --noEmit` | **PASS** | 0 hata |
| `npm run build` | **PASS** | vite + server tsc |
| `npm run test:password` | **PASS 6/6** (18.4s) | helper + izole SQLite on/off/rollback |
| `npm run test:skins` | **PASS 382/382** (6.8 dk) | önceki 378 + 4 password-hash spec; galeri 390/390 |

İzole SQLite (`qa/password-hash.node.test.ts`, temp dosya, canlı DB değil):

- `PASSWORD_HASHING=on`: yeni kayıt bcrypt; `demo` ve `admin` ilk girişte yükselir; yanlış parola 401 ve satır değişmez; staff reset hash yazar; eşzamanlı iki giriş iki token.
- Aynı dosyayı `PASSWORD_HASHING=off` ile yeniden açınca: hash’li kullanıcı ve yükseltilmiş demo **hâlâ 200**; yeni kayıt düz metin kalır.

Paylaşılan yerel SQLite Playwright: demo girişi, admin girişi, izole restoran + staff reset, kayıt + eşzamanlı giriş. Demo/admin satırları production müşterisi değildir.

---

## Rollback riski ve uygulanan çözüm

| Senaryo | Sonuç |
|---------|--------|
| `PASSWORD_HASHING=on` → `off` | **Güvenli.** Doğrulama hash’i okumaya devam eder. Yeni yazımlar düz metin. |
| Kodu eski `where({ username, password })` haline almak | **Kırılır.** Hash satırları SQL eşitliği ile asla eşleşmez. Bayrak açıldıktan sonra bu kod geri alınmamalı. |
| Concurrent yükseltme | CAS: yalnız `password` hâlâ düz metinken UPDATE. İki oturum geçerli. |
| MySQL `VARCHAR < 60` | Boot’ta uyarı. ALTER bu turda **yok**. Bayrağı açmadan önce `DESCRIBE`. |

Güvenli geri dönüş: **yalnızca bayrağı kapat** veya dual-read’li bu kodda kal. Eski login SQL’ine dönme.

---

## Demo / varsayılan admin — production riski

| Hesap | Yerel seed | Production |
|-------|------------|------------|
| `demo` / `demo123` | Boş SQLite’ta oluşturulur | Bilinen test parolası. Production’da bu hesap varsa **hemen değiştir veya kapat**. QR demo slug’ı ayrı; staff girişi demo olmamalı. |
| `admin` / `admin123` | Yalnız hesap yoksa oluşturulur | **Önceden her server boot `admin` parolasını `admin123` yapıyordu.** Bu turda o overwrite **kaldırıldı**. Production’da hâlâ `admin123` ise bu kritik; unique güçlü parola ver. Test parolasını production’da kullanma. |
| `demae` / `demae123` | Seed script | Yalnız bilinçli seed. Script artık mevcut parolayı ezmez. |

Boş production DB ilk boot’ta hâlâ `admin` + `admin123` yaratır (hesap yoksa). Deploy checklist: ilk girişten sonra parolayı değiştir, mümkünse seed admin’i kapat.

---

## Güvenli yayına alma

1. Staging SQLite/MySQL kopyası (canlı klon, yazma yok production’da). `DESCRIBE restaurant_users` / `admin_users` — password ≥ 60.
2. Kodu **bayrak kapalı** deploy et (`PASSWORD_HASHING=off` veya unset). Dual-read; yeni hash yazılmaz. Smoke: mevcut müşteri girişi, demo (varsa), admin.
3. Staging’de `PASSWORD_HASHING=on`. Yeni kayıt hash; eski hesap bir girişte yükselir. `npm run test:password` benzeri senaryolar.
4. Production bayrağını onayla ve aç. İzleme: hash öneki olmayan satır sayısı (değerleri loglama).
5. Bilinen test hesaplarını (`demo123`, `admin123`) production’da iptal/değiştir.

Kolon kısa ise 2. adımdan önce (ayrı onaylı migration):

```sql
ALTER TABLE restaurant_users MODIFY password VARCHAR(255) NOT NULL;
ALTER TABLE admin_users MODIFY password VARCHAR(255) NOT NULL;
```

Bu turda çalıştırılmadı.

---

## Geri dönüş adımları

1. **Bayrak:** `PASSWORD_HASHING=off` (hash’li hesaplar çalışır).
2. **Kod:** dual-read helper’ı tut. Eski SQL eşitliğine dönme.
3. **Tam paket geri alma:** yalnız henüz hiç hash yazılmadıysa (bayrak hiç açılmadıysa) güvenli.
4. Müşteri parolalarını toplu plaintext’e çevirme — imkânsız ve istenmez.

---

## Kalan riskler

1. Production’da hâlâ düz metin parolalar (bayrak kapalıyken yeni kayıtlar dahil).
2. Varsayılan `admin` / `demo` test sırları.
3. Timing: dummy bcrypt yaklaşık cost 12; birebir eşit değil.
4. In-memory session — restart tüm token’ları düşürür (önceki davranış).
5. Super-admin staff reset o restoranın **tüm** staff satırlarını siler (önceki API). Demo restoranda çağrılmamalı.
6. Playwright 382, önceki 378 + 4 güvenlik spec.

---

## Production’a geçiş gereksinimleri (checklist)

- [ ] MySQL password kolonları ≥ 60 karakter (ALTER ancak onayla)
- [ ] `PASSWORD_HASHING=off` ile kod deploy + giriş smoke
- [ ] Staging’de `on` + yeni kayıt / tembel yükseltme
- [ ] Production `admin` / `demo` test parolaları kapatıldı
- [ ] `PASSWORD_HASHING=on` onaylandı
- [ ] Log’larda parola/hash yok (bu turda API 401 gövdesi sır sızdırmıyor — test edildi)
- [ ] Git commit / deploy / canlı ALTER bu ajan oturumunda **yapılmadı** — sizin onayınız
