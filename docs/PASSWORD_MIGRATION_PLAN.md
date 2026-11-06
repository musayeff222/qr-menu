# MenuGo — düz metin paroladan hash’e geçiş planı

**Durum:** Kod ve izole testler Faz 4’te uygulandı (`passwordHash.ts`, dual-read, `PASSWORD_HASHING` bayrağı). Canlı MySQL’e migration **uygulanmadı**. Ayrıntı: `docs/PASSWORD_PHASE4_REPORT.md`.

## Mevcut gerçek

- `restaurant_users.password` ve `admin_users.password` düz metin saklanıyor (`database.ts` şema, `server.ts` kayıt/giriş).
- Giriş karşılaştırması: `db("restaurant_users").where({ username, password }).first()` ve admin için aynı kalıp.
- Yeni kayıt `POST /api/public/register` parolayı olduğu gibi yazar.
- Demo/seed hesaplar (`demo/demo123`, `admin/admin123`) düz metin.
- Oturum token’ları bellek içi Bearer’dır; parola hash’inden bağımsızdır. `localStorage.restaurantSession` / `adminSession` anahtarları değişmemelidir.

## Hedef

Eski müşterilerin girişini kırmadan bcrypt (veya argon2) hash’e geçmek. Geri alınabilir, test edilebilir, kademeli.

## Önerilen tasarım (çift okuma + tembel yükseltme)

1. **Yeni kayıtlar** (bayrak açıkken): `bcrypt.hash(password, 12)` yaz.
2. **Giriş:**
   - Satırdaki değer `$2a$` / `$2b$` / `$2y$` ile başlıyorsa `bcrypt.compare`.
   - Aksi halde mevcut düz metin eşitliği.
   - Düz metin eşleşmesi başarılıysa **aynı istekte** hash’e yükselt (`UPDATE password = hash`). Kullanıcı bir şey fark etmez.
3. **Yeni kolon yok.** Mevcut `password` VARCHAR 255 bcrypt için yeterlidir (60 karakter). Yine de uygulama öncesi staging’de kolon uzunluğunu doğrula.
4. **Bayrak:** `PASSWORD_HASHING=off` varsayılan. `on` olmadan hash yazma. Rollback: bayrağı kapat; hash’li satırlar hâlâ `bcrypt.compare` ile çalışır, düz metin satırlar eski yoldan çalışır.

## Yapılmayacaklar

- Toplu `UPDATE` ile tüm parolaları rastgele sıfırlamak.
- Kullanıcıları “şifreni unuttum” akışına zorlamak (akış yok).
- Token formatı, session key, login URL veya request body’sini değiştirmek.
- Production’da onay olmadan şema/migration çalıştırmak.

## Aşamalar

| Aşama | Nerede | Ne | Geri alma |
|---|---|---|---|
| 0 | Kod incelemesi | Bu plan | — |
| 1 | Staging SQLite kopyası | Dual-read helper + unit test (plaintext + hash) | Kodu geri al |
| 2 | Staging | `PASSWORD_HASHING=on`; demo hesapla giriş; satırın hash’e döndüğünü doğrula | Bayrağı kapat |
| 3 | Staging | Yeni kayıt hash yazar; eski plaintext hâlâ girer | Bayrağı kapat |
| 4 | Onay sonrası production | Önce bayrak kapalı deploy (kod hazır, yazma yok) | Rollback deploy |
| 5 | Onay | Bayrağı aç; tembel yükseltme başlar | Bayrağı kapat |
| 6 | İzleme | Hash’lenmemiş satır sayısı raporu (değerleri yazdırmadan) | — |

## Test senaryoları (staging)

- `demo / demo123` düz metin giriş → 200 + token; ikinci giriş hash üzerinden.
- Yanlış parola → 401, satır değişmez.
- Yeni kayıt + hemen `/api/restaurant/login`.
- Super admin `admin / admin123` aynı kural.
- Eşzamanlı çift giriş (race): tek hash yazımı, her iki oturum geçerli.
- `PASSWORD_HASHING=off` iken yeni kayıt düz metin kalır (geçiş öncesi davranış).

## Riskler

- 255 karakterden kısa kolon (MySQL); bcrypt sığmazsa giriş kırılır → önce `DESCRIBE`.
- Timing farkı (hash vs düz metin) kullanıcı enumerasyonuna yardımcı olabilir; staging’de sabit süre düşünülebilir.
- Log’lara parola veya hash yazılmamalı.

## Ayrı uygulama aşaması — kod tamam (canlı henüz değil)

Yerel/izole doğrulama yapıldı. Canlı veriye dokunulmadı. Production sırası:

1. ~~Helper~~ `passwordHash.ts` (bcryptjs cost 12, dual-read, CAS yükseltme).
2. ~~Register / restaurant login / admin login / staff reset / admin patch~~ bağlandı.
3. ~~`PASSWORD_HASHING`~~ varsayılan `off`. Hash doğrulama bayraktan bağımsız (güvenli rollback).
4. ~~İzole testler~~ `npm run test:password` + Playwright `password-hash.spec.ts`.
5. Production: önce bayraksız deploy, kolon ≥ 60, sonra onayla bayrak. Test parolalarını (`admin123`, `demo123`) production’da bırakma.

`docs/PASSWORD_PHASE4_REPORT.md` yayın ve geri dönüş adımlarını içerir.

## Onay bekleyen kararlar

1. Algoritma: bcrypt 12 (önerilen) mi argon2 mi?
2. Production bayrağını ne zaman açacağız?
3. Kalan düz metin satırlar için isteğe bağlı “zorunlu yenileme” kampanyası (ayrı iş; e-posta altyapısı yok).
