# Production MySQL — `restaurants.menu_appearance_json`

**Durum:** Bu turda migration **çalıştırılmadı**. `database.ts` MySQL boot’ta ALTER etmez.

## Amaç

Renk paleti JSON’unu (`{ version, activeTemplateId, overridesByTemplate }`) production `restaurants` tablosunda saklamak.

## 0. Önkoşul

- Bakım penceresi veya düşük trafikli an.
- `mysqldump` veya yönetilen yedek (Hostinger) başarılı ve geri yüklenebilir.
- Staging MySQL kopyasında aynı komutun önce uygulandığı.

## 1. Yedek

```bash
mysqldump --single-transaction --routines --triggers \
  -u USER -p DBNAME restaurants > restaurants_pre_appearance_$(date +%Y%m%d).sql
```

Doğrula: dosya boyutu > 0; `HEAD` içinde `CREATE TABLE \`restaurants\``.

## 2. Mevcut şema

```sql
SHOW COLUMNS FROM restaurants LIKE 'menu_appearance_json';
```

Kolon varsa **dur**: ikinci kez ekleme.

## 3. İleri migration (yalnız onay sonrası)

```sql
ALTER TABLE restaurants
  ADD COLUMN menu_appearance_json MEDIUMTEXT NULL
  COMMENT 'MenuGo appearance JSON v1'
  AFTER menu_template;
```

SQLite yerel ortamda kolon zaten vardır; bu komut yalnız MySQL içindir.

## 4. Veri doğrulama

```sql
SELECT COUNT(*) AS total,
       SUM(menu_appearance_json IS NOT NULL) AS with_json
FROM restaurants;

SELECT id, slug, LEFT(menu_appearance_json, 80)
FROM restaurants
WHERE menu_appearance_json IS NOT NULL
LIMIT 20;
```

Uygulama: panelden bir restoranda palet kaydet → satır JSON `version` ve `overridesByTemplate` içerir → guest `?preview=true` aynı rengi gösterir.

## 5. Geri dönüş

Kolon boşsa:

```sql
ALTER TABLE restaurants DROP COLUMN menu_appearance_json;
```

Kolonda müşteri JSON’u varsa: DROP etme. Yedeği geri yükle:

```bash
mysql -u USER -p DBNAME < restaurants_pre_appearance_YYYYMMDD.sql
```

Uygulama kodu kolon yokken renk kaydını atlar ve boot’ta uyarı basar (`database.ts`); menü şablonları varsayılan paletle çalışır.

## 6. Yapılmayanlar

- Otomatik ALTER on boot (production).
- Toplu JSON rewrite.
- Git commit / canlı çalıştırma bu turda yok.
