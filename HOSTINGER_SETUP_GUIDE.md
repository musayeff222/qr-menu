# MenuGo — Hostinger staging kurulum rehberi

**Tarih:** 4 Kasım 2026  
**Kaynak:** bu repodaki `package.json`, `server.js`, `database.ts`, `dbRuntime.ts`, `scripts/check-schema.ts`, `.env.example`.  
**Bu belge:** yalnızca hPanel adımları. Kod değişmedi, bağlantı kurulmadı, migration/commit/deploy yok. Şifre, token, host veya veritabanı adı **yazılmaz**.

Git:

- Kök: `qr-menu-main` (üst klasör değil)
- Remote: `https://github.com/musayeff222/qr-menu.git`
- Yerel dal şu an `main`. Staging işi **ayrı dal + ayrı Node uygulaması + ayrı MySQL** ile gider.

---

## 0. Başlamadan

- Production Node uygulamasını, document root’unu ve MySQL’ini **açmayın, düzenlemeyin**.
- Staging alt alanı production `menugo.az` kökünden ayrı olsun (ör. `staging.` öneki).
- Staging MySQL adı ve kullanıcısı production’dakilerden **farklı** olsun.
- `ALLOW_SQLITE`, `DATABASE_URL` (production URL’si), production `MYSQL_*` değerlerini staging panele **kopyalamayın**.
- `admin123` / `demo123` / `demae123` kullanmayın.
- `GEMINI_API_KEY` koymayın (Vite build sırasında istemciye gömülebilir).

Yerel repoda henüz commitlenmemiş çok dosya var. Hostinger Git deploy **GitHub’daki dalı** çeker. Staging’e almak istediğiniz kodu siz commit/push etmeden panel eski `main`’i yayınlar.

---

## 1. GitHub: `staging` dalı

Bu ajan commit/push yapmaz. Siz, yayınlamak istediğiniz duruma geldiğinizde:

```text
git checkout -b staging
git push -u origin staging
```

Kurallar:

| Dal | Hostinger uygulaması | Amaç |
|-----|----------------------|------|
| `staging` | Staging Node app | Deneme, şema, hashing |
| `main` (veya sonra `production`) | Production Node app | Canlı site — şimdi dokunmayın |

Staging uygulamasında Git **Branch** alanına `main` yazmayın. Production ile aynı dalı paylaşmak yanlış DB env kopyalama riskini büyütür.

GitHub → Settings → Secrets: production sırlarını staging secret’ı sanmayın. Hostinger env paneli yeter; GitHub secret zorunlu değil.

---

## 2. Production’dan bağımsız staging Node uygulaması

hPanel’de **yeni** bir Node.js uygulaması açın. Mevcut canlı uygulamayı “staging’e çevirmeyin”.

1. **Domains / Subdomains** — yeni alt alan (staging). SSL’i bu alt alana alın. Production domain kaydını değiştirmeyin.
2. **Websites → Node.js** (veya Advanced → Node.js) → **Create application**.
3. Alanlar (Hostinger etiketleri sürüme göre biraz değişir):

| Alan | Değer |
|------|--------|
| Node.js version | **22.x** (22.12+) veya **20.x ancak 20.19+**. Vite 8: `^20.19.0 \|\| >=22.12.0`. 18.x ve eski 20.11 **kullanmayın**. |
| Application root | repo kökü (bu projede `qr-menu-main` zaten git kökü; alt klasör yazmayın) |
| Application startup file | `server.js` |
| Application mode / `NODE_ENV` | `production` |
| Git repository | `https://github.com/musayeff222/qr-menu.git` |
| Branch | **`staging`** |
| Build command | `npm install --include=dev && npm run build` |
| Start / run command | `npm start` (`package.json`: `node server.js`) |
| Application URL | staging alt alanınız |

`PORT` yazmayın; paneli doldurur.

Build notları:

- `vite` ve `typescript` **devDependencies**. `NODE_ENV=production` iken çıplak `npm install` bunları atlar; build kırılır. `--include=dev` şart.
- `better-sqlite3` bağımlılıkta (MySQL kullanılsa bile install native derleyebilir). Staging MySQL ile çalışılır; SQLite production/staging’de **yasak**.
- Çıktı: `dist/` (SPA) + `dist-server/` (`server.js` bunları yükler). `dist/index.html` yoksa süreç çıkar.

Uploads: uygulama klasörünün **dışı**. Örnek yol kalıbı (kullanıcı adınızı uydurmayın; hPanel File Manager’da domain üstüne bakın):

```text
/home/<hpanel-user>/domains/<staging-domain>/private_uploads
```

Klasörü oluşturun. Production `private_uploads` ile **aynı klasör olmasın**.

İlk **Start**’tan önce: MySQL env dolu olsun (§3–5). `NODE_ENV=production` + MySQL yok = süreç `Production refuses SQLite` ile ölür. Boş staging DB’de ilk start **CREATE TABLE** yapar (ALTER değil). Bunu istemiyorsanız start etmeden önce dump restore edin.

---

## 3. Staging MySQL

hPanel → **Databases → MySQL Databases** (veya Management → MySQL):

1. **Yeni veritabanı** — adı production DB’den farklı olsun (ör. sonek `_stg`).
2. **Yeni kullanıcı** — yalnız bu staging DB’ye yetki. Production DB yetkisi vermeyin.
3. Hostinger aynı hesapta Node için host genelde **localhost**. Uzak/production host kopyalamayın.
4. phpMyAdmin’de **staging** DB’yi açtığınızı üstteki DB adından doğrulayın.

İki yol:

**A — Boş staging (önerilen ilk deneme)**  
Tablosuz DB. İlk onaylı `npm start` tabloları oluşturur; `menu_appearance_json` yeni `restaurants` tanımında vardır. `DB_AUTO_MIGRATE=off` kalsın.

**B — Production şema kopyası (müşteri satırı istemezsiniz)**  
Production’dan dump alıp staging’e restore: bu, canlıyı değiştirmez ama **müşteri verisi kopyası**dır. Test için mümkünse şema-only veya anonimleştirilmiş kopya. Restore **staging** hedefine; production import etmeyin.

phpMyAdmin’de yanlışlıkla production seçiliyse hiçbir SQL çalıştırmayın.

---

## 4. Environment variable adları

hPanel Node.js uygulaması → **Environment variables**. Değerleri buraya yazmayın; yalnızca ad ve amaç.

### Zorunlu staging

| Ad | Amaç |
|----|------|
| `NODE_ENV` | `production` — static `dist/`, SQLite yasağı |
| `MYSQL_HOST` | Staging MySQL host (aynı hesapta genelde localhost) |
| `MYSQL_PORT` | Genelde `3306` |
| `MYSQL_USER` | Yalnız staging DB kullanıcısı |
| `MYSQL_PASSWORD` | O kullanıcının parolası |
| `MYSQL_DATABASE` | Staging DB adı — production adı **değil** |
| `APP_URL` | Staging sitenin `https://` kökü (QR ve görsel mutlak URL) |
| `UPLOADS_DIR` | Staging `private_uploads` mutlak yol |
| `DB_AUTO_MIGRATE` | `off` |
| `PASSWORD_HASHING` | `on` (bcrypt cost 12; dual-read düz metin eski satırı da doğrular) |
| `ADMIN_BOOTSTRAP_PASSWORD` | Boş DB’de ilk admin. `admin123`/`demo123`/`demae123` **red** |
| `ADMIN_BOOTSTRAP_USERNAME` | İsteğe bağlı; varsayılan `admin` |

`PORT` paneldan gelir.

### Koymayın (staging)

| Ad | Neden |
|----|--------|
| `ALLOW_SQLITE` | Production/staging SQLite yasağını deler |
| `ALLOW_DEMO_SEED` | `demo`/`demo123` ve `admin123` seed |
| `DATABASE_URL` | Tek string’de sıra; yanlışlıkla production URL yapıştırmak kolay. Staging’de `MYSQL_*` kullanın |
| `DB_CLIENT=mysql` | `MYSQL_HOST` yoksa süreç bilinçli hata verir; karışıklık |
| `SQLITE_PATH` | Staging’de gereksiz |
| `GEMINI_API_KEY` | Client bundle |
| `SCHEMA_CHECK_ALLOW_MYSQL` | Uygulama start env’ine koymayın; yalnız elle inspect (§8) |

Doğrulama (sır yok): restart sonrası log’da `Uploads directory:` uygulama klasörünün dışında; `GET /api/health` → `driver: "mysql"`. `schema.ok` false ise start bazı eksik kolonlarda **FAIL** eder — bu beklenen koruma.

---

## 5. Node sürümü, build, start

Kaynak gerçekleri:

```text
engines.node          >= 20.19.0
Vite 8                ^20.19.0 || >=22.12.0
build / deploy:build  vite build && tsc -p tsconfig.server.json
start                 node server.js
giriş dosyası         server.js → dist-server/server.js
```

hPanel özeti:

1. Node **22** (veya 20.19+).
2. Build: `npm install --include=dev && npm run build`
3. Start: `npm start`
4. Startup file: `server.js`
5. `npm run dev` / `tsx server.ts` kullanmayın.

---

## 6. `DB_AUTO_MIGRATE=off` ve `PASSWORD_HASHING=on`

| Bayrak | Staging değeri | Anlam |
|--------|----------------|--------|
| `DB_AUTO_MIGRATE` | `off` | MySQL boot’ta `ALTER TABLE` yok. Eksik zorunlu kolon → süreç açılmaz. |
| `PASSWORD_HASHING` | `on` | Yeni kayıt / reset / bootstrap bcrypt. Giriş her zaman dual-read. |

Boş staging + hashing `on`: yeni hesaplar düz metin yazılmaz.  
Kopya şemada düz metin varsa: giriş çalışır, başarılı girişte tembel hash (CAS).

Geri dönüş: bayrağı `off` yapmak hash’li girişi **kırmaz**. Eski `WHERE password =` koduna dönüş **kırar**.

`DB_AUTO_MIGRATE=on` bu rehberde **yok**. Eksik kolon → §9 onaylı SQL.

---

## 7. Production MySQL’e bağlanmayı önleme

Kayıt öncesi kontrol listesi:

1. Staging uygulamasının Git dalı `staging`; production uygulaması ayrı.
2. `MYSQL_DATABASE` ve `MYSQL_USER` production phpMyAdmin listesindeki canlı adlarla **aynı değil**.
3. Staging kullanıcısının Privileges listesinde yalnız staging DB var.
4. `APP_URL` staging host; production domain değil.
5. `UPLOADS_DIR` staging klasörü.
6. `DATABASE_URL` yok.
7. `ALLOW_SQLITE` yok.
8. Health: `driver` mysql. QR / tarayıcı adresi staging host.

Şüphede **Stop** staging uygulaması. Production process’e restart/env vermeyin.

---

## 8. Salt okunur `npm run check:schema`

Script `initDatabase` çağırmaz; ALTER/seed yok. Varsayılan MySQL’i **reddeder**.

`NODE_ENV=production` iken `SCHEMA_CHECK_ALLOW_MYSQL=on` olsa bile script **çıkar** (`scripts/check-schema.ts`). Inspect’i uygulama start env’i ile karıştırmayın.

SSH (staging uygulama dizininde), **geçici** env — kalıcı panel env’ine `SCHEMA_CHECK_ALLOW_MYSQL` eklemeyin:

```text
# NODE_ENV=production OLMADAN, yalnız STAGING MYSQL_* ile:
SCHEMA_CHECK_ALLOW_MYSQL=on npm run check:schema
```

Beklenen JSON alanları: `driver` (`mysql`), `ok`, `hasMenuAppearanceJson`, `missingTables`, `missingColumns`. Parola veya satır içeriği yok.

`driver: "sqlite"` görürseniz staging MySQL env bu komuta geçmemiş demektir — sonucu yok sayın, production’a bakmayın.

---

## 9. Yedek ve onaylı migration

Otomatik ALTER yok. phpMyAdmin’de üstteki DB adının **staging** olduğunu her seferinde kontrol edin.

### Yedek (staging)

```text
mysqldump --single-transaction --routines --triggers -u USER -p STAGING_DB > staging_pre_YYYYMMDD.sql
```

veya hPanel / phpMyAdmin Export. Dosya boyutu > 0; içinde `CREATE TABLE` var.

### Teşhis (yazma yok)

```sql
SHOW COLUMNS FROM restaurants LIKE 'menu_appearance_json';
SHOW COLUMNS FROM restaurant_users LIKE 'password';
SHOW COLUMNS FROM admin_users LIKE 'password';
```

- Appearance kolonu varsa **ADD etmeyin**.
- `password` `varchar(n)` ve `n < 60` ise `PASSWORD_HASHING=on` ile hash kesilir; önce genişletin.

### Onay sonrası (kolon yoksa / kısa ise)

```sql
ALTER TABLE restaurants
  ADD COLUMN menu_appearance_json MEDIUMTEXT NULL
  COMMENT 'MenuGo appearance JSON v1'
  AFTER menu_template;

ALTER TABLE restaurant_users MODIFY password VARCHAR(255) NOT NULL;
ALTER TABLE admin_users MODIFY password VARCHAR(255) NOT NULL;
```

Boş DB’de ilk start zaten appearance’ı `createTable` ile ekler; o zaman bu ADD gerekmez.

### Geri dönüş

- Appearance **boşsa:** `ALTER TABLE restaurants DROP COLUMN menu_appearance_json;`
- Appearance **doluysa:** DROP etme; dump restore
- Password MODIFY: dump restore

Ayrıntı: `docs/MYSQL_MENU_APPEARANCE_MIGRATION.md`, `docs/PASSWORD_PHASE4_REPORT.md`.

---

## 10. Staging ayağa kalktıktan sonra testler

Sıra (staging URL, gerçek müşteri hesabı yok):

1. `GET /api/health` — `ok`, `driver: "mysql"`, `schema.ok`, `hasMenuAppearanceJson`.
2. Log: uploads yolu deploy kökünün dışı; `refuses SQLite` yok.
3. `admin123` / `demo123` giriş → 401.
4. Bootstrap admin ile giriş; yanıtta parola yok.
5. Kayıt (`PASSWORD_HASHING=on`) → giriş / otomatik oturum. phpMyAdmin’de `password` `$2a$`/`$2b$`/`$2y$` ile başlar, düz metin değil.
6. Restoran → şablon → renk kaydet → `/r/{slug}?preview=true` → ürün → sipariş.
7. Birkaç şablon (hedef: 30’u staging’de; yerel SQLite kanıtı 382/382 ayrı).
8. Görsel yükle; `/uploads/...` 200.
9. Restart: oturum düşer (bellek içi token); yeniden giriş.
10. Yerelde (SQLite, MySQL env yok): `npm run test:staging`, `npm run test:password`, `npm run test:skins` (382).

Production’a geçiş bu listenin staging’de yeşil olmasından **sonra**. Bu rehber deploy etmez.

---

## Hızlı hPanel özeti

```text
Git dalı:            staging
Startup file:        server.js
Build:               npm install --include=dev && npm run build
Start:               npm start
Node:                22.x veya 20.19+
NODE_ENV:            production
DB_AUTO_MIGRATE:     off
PASSWORD_HASHING:    on
ALLOW_SQLITE:        (yok)
ALLOW_DEMO_SEED:     (yok)
DATABASE_URL:        (yok)
MYSQL_*:             yalnız staging DB
APP_URL / UPLOADS:   staging host ve klasör
```

Kurulum bitince bu sohbette **şifre yapıştırmadan** şunu yazmanız yeterli: staging URL ayakta, health `driver: mysql`, inspect `ok` true/false. ALTER için ayrıca onay isteyin.
