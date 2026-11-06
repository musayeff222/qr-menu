# MenuGo — Faz 8: GitHub staging hazırlığı

**Tarih:** 7 Kasım 2026  
**Remote:** `https://github.com/musayeff222/qr-menu.git`  
**Bu turda yapılmayanlar:** git commit, git push, production dalı değişikliği, Hostinger deploy. Gizli değer yok.

Kanıt: yerel `git status` / `git branch` / `git check-ignore`. Tahminle “GitHub’a gitti” denmez.

---

## Özet

| # | Kontrol | Durum |
|---|---------|--------|
| 1 | Branch | **PASS** — `main`, `origin/main` ile **0/0** (ahead/behind yok) |
| 2 | Commitlenmemiş iş | **FAIL** (henüz commit yok) — 39 modified/deleted + 1000+ untracked |
| 3 | `.gitignore` | **PASS** temel sırlar / **GAP** `.env.staging`, QA kareleri, zip |
| 4 | Hassas içerik GitHub’a gitmez (mevcut ignore) | **PASS** `.env`, sqlite, `node_modules`, `uploads/`, `dist/` |
| 5 | `staging` dalı | **YOK** (yerel ve `origin/staging`) |
| 6 | Staging oluşturma | Aşağı §6 — `main` üzerine yeni dal |
| 7 | Komutlar | Hazır; **çalıştırılmadı** |
| 8 | Production auto-deploy | Aşağı §8 — `main`’e push riski |
| 9 | lint / build | **PASS** bu tur. Testler: son yeşil koşu 4 Kasım (382) |
| 10 | Gönderilecek liste | §10; kit/zip/shot **göndermeyin** |

**GitHub’a henüz hiçbir şey gönderilmedi.**

---

## 1. `git status` ve dal

```text
## main...origin/main
HEAD 8993431 Merge GitHub main with MenuGo landing redesign
origin/HEAD -> origin/main
```

- Çalışma kopyası: `main`
- Remote `main` ile eşit (commit yok, push bekleyen commit yok)
- Değişiklikler yalnız working tree’de

---

## 2. Commit edilmemiş değişiklikler (özet)

**Modified / deleted (39 dosya, ~1912 ek / 7075 silme):** uygulama kodu.

| Grup | Örnek |
|------|--------|
| Sunucu / güvenlik | `database.ts`, `server.ts`, `package.json`, `tsconfig.server.json`, `.env.example`, `.gitignore` |
| 30 şablon geçişi | `src/menu-templates/*` (eski SmartWeb/MenuTemplateView silindi) |
| Panel / i18n / landing | `src/App.tsx`, `LandingPage.tsx`, `uiBuiltIn.ts`, admin, onboarding |
| Seed | `demaeSeedRunner.ts`, `seedDemaeRestaurant.ts` (parola logu kaldırıldı) |

**Untracked (önemli):**

- Uygulama: `passwordHash.ts`, `dbRuntime.ts`, `schemaAudit.ts`, `menuAppearance.ts`, `playwright.config.ts`, `src/menu-templates/skins/`, `theme/`, `RegisterPage.tsx`, `src/ui/`
- Test kaynak: `qa/*.ts`, `qa/playwright/*.spec.ts`
- Docs: `docs/`, `HOSTINGER_*.md`, `PRODUCTION_READINESS_REPORT.md`, `GITHUB_STAGING_READINESS.md` (bu dosya)
- `public/` ikon/og
- `scripts/check-schema.ts` ve diğer scriptler

**Untracked ama GitHub’a uygun değil / dikkat:**

| Yol | Neden |
|----|--------|
| `qa/playwright/shots/` (~yüzlerce PNG) | Test artefaktı, repo şişer |
| `qa/playwright/overflows/`, `fingerprints/`, `perf/` | Üretilen JSON |
| `MenuGo_QA_Results.zip` | Arşiv; sır içermese de binary |
| `MenuGo_30_QR_Menu_Cursor_Implementation_Kit/` | Prompt kiti, uygulama runtime değil |
| `MenuGo_Cursor_Premium_Redesign_Kiti/` | Aynı |
| `MenuGo_QA_Review_for_Cursor.md` | İç süreç notu (isteğe bağlı) |

---

## 3–4. `.gitignore` ve hassas içerik

Şu an ignore (doğrulandı `git check-ignore`):

| Örüntü | Sonuç |
|--------|--------|
| `.env`, `.env.local` | ignore |
| `*.sqlite`, `qrmenu.sqlite` | ignore (`qrmenu.sqlite` diskte var, **tracked değil**) |
| `node_modules/` | ignore |
| `uploads/`, `private_uploads/` | ignore |
| `dist/`, `dist-server/` | ignore |
| `qa/playwright/results.json`, `playwright-report/` | ignore |
| `*.log` | ignore |

`git ls-files` içinde `.env`, sqlite, uploads, `node_modules` **yok**. Tracked env yalnızca `.env.example` (placeholder: `MY_GEMINI_API_KEY`, yorum satırında örnek `MYSQL_PASSWORD=secret` — gerçek sır değil).

**Boşluklar (commit öncesi ignore önerisi; bu turda dosya değiştirilmedi):**

```text
.env.staging
.env.production
.env.*
!.env.example
*.zip
qa/playwright/shots/
qa/playwright/overflows/
qa/playwright/fingerprints/
qa/playwright/perf/
qa/playwright/*.json
```

`.env.staging` şu an **ignore edilmiyor**. Böyle bir dosya oluşturulup `git add .` yapılırsa GitHub’a gidebilir.

`.env` yok (önceki kontrol). `qrmenu.sqlite` yerel QA; push edilmez.

---

## 5–6. `main` / `staging`

| Dal | Yerel | `origin` |
|-----|-------|----------|
| `main` | var, `origin/main` ile eşit | var |
| `staging` | **yok** | **yok** |

Oluşturma: `origin/main` (`8993431`) üzerine yeni dal. Production `main`’i yeniden yazmayın, force-push yok.

---

## 7. Komutlar (çalıştırılmadı)

Hostinger production Git’i `main` dinliyorsa **`git push origin main` yapmayın.**

```text
git checkout main
git status -sb

git checkout -b staging

# Ignore boşluklarını siz ekledikten sonra (önerilir):
# .env.staging, shots, zip, kit klasörleri add etmeyin

git add .env.example .gitignore package.json package-lock.json
git add database.ts dbRuntime.ts passwordHash.ts schemaAudit.ts menuAppearance.ts server.ts
git add tsconfig.server.json playwright.config.ts planTemplatePolicy.ts
git add demaeSeedRunner.ts seedDemaeRestaurant.ts
git add index.html metadata.json public/
git add src/
git add qa/*.ts qa/playwright/*.spec.ts qa/playwright/helpers.ts qa/isolatedEnv.ts
git add scripts/
git add docs/
git add HOSTINGER_*.md PRODUCTION_READINESS_REPORT.md GITHUB_STAGING_READINESS.md HOSTINGER_SETUP_GUIDE.md

git status
# .env, sqlite, node_modules, uploads, zip, shots, kit OLMAMALI

git commit -m "Prepare Hostinger staging: 30 skins, password hashing, schema safety."

git push -u origin staging
```

`helpers.ts` yolu `qa/playwright/` altında olabilir; `git status` ile kontrol edin.

**Yapmayın:**

```text
git push origin main
git push --force
git add .
git add MenuGo_QA_Results.zip MenuGo_30_QR_Menu_Cursor_Implementation_Kit MenuGo_Cursor_Premium_Redesign_Kiti
```

`git add .` shots + zip + kit + gelecekteki `.env.staging` riski taşır.

---

## 8. Production otomatik deploy riski

`origin/main` = GitHub’daki canlı aday dal. Bu ajan `main`’e push etmedi.

| Senaryo | Risk |
|---------|------|
| Hostinger production Node **Git = `main`, auto deploy** | `git push origin main` canlıyı günceller (MySQL, ALTER, hashing, admin seed davranışı). Staging doğrulanmadan **yapmayın**. |
| Hostinger “repo’nun her dalı” | `staging` push’u da production’a gidebilir. Panelde production uygulamasının dalını **yalnız `main`** yapın. |
| Yalnız `git push -u origin staging` | Production `main` uygulaması **tetiklenmez** (dal filtresi doğruysa). Staging uygulaması `staging` dinliyorsa o ortam güncellenir — bu istenen. |
| Aynı MySQL env’i staging panele kopyalamak | Git değil; veri riski. `HOSTINGER_SETUP_GUIDE.md` §7. |

Şu an `staging` remote’da yok; production muhtemelen `main`. Yine de push öncesi hPanel’de production uygulamasının **branch = main** ve staging uygulamasının **branch = staging** olduğunu kontrol edin.

---

## 9. lint / build / test

Bu tur (7 Kasım):

| Komut | Sonuç |
|-------|--------|
| `npm run lint` | **PASS** |
| `npm run build` | **PASS** (Vite 1.67s + server `tsc`) |
| `test:staging` / `test:password` / `test:skins` | Bu turda **yeniden koşulmadı** |

Son yeşil koşu (4 Kasım, yerel SQLite):

- `test:staging` 11/11
- `test:password` 6/6
- `test:skins` **382/382** (6.4 dk), galeri 390/390

Hostinger MySQL testleri **NOT TESTED**.

---

## 10. GitHub’a gitmesi gerekenler ve riskler

**Gönderin (staging dalı):** 30 skin kaynakları, parola/schema güvenliği, Express/Vite, Playwright **spec** dosyaları, `docs/` + Hostinger rehberleri, `scripts/check-schema.ts`, public ikonlar.

**Göndermeyin:** `.env`, sqlite, `node_modules`, `dist/`, uploads, QA PNG/JSON artefaktları, `MenuGo_QA_Results.zip`, tasarım kit klasörleri, gerçek MySQL dump.

**Riskler**

1. `git push origin main` → production auto-deploy.
2. `git add .` → shots/zip/kit/`.env.staging`.
3. `.gitignore` `.env.staging` kapsamıyor.
4. İlk staging deploy boş MySQL’de CREATE TABLE yapar; production şemasına dokunmaz **ancak** env yanlışsa canlı DB’ye bağlanır.
5. Remote’da `staging` yok; oluşturunca Hostinger staging uygulamasını bu dala bağlayın.
6. Yerel `main` kirli; commit `staging` dalında olmalı, `main` temiz kalabilir (dal açınca değişiklikler taşınır, `main` pointer `8993431`’de kalır).

---

## Sonuç

Yerel kod GitHub `main`’in önünde working tree olarak duruyor; **commit/push yok**. `staging` dalı yok. Hassas varsayılan ignore çalışıyor; `git add .` ve `main` push’u tehlikeli.

Siz onaylarsanız sonraki adım (bu turda yok): ignore boşluklarını kapat → `staging` dalı → seçmeli add → commit → `git push -u origin staging` → Hostinger’da **yalnız staging uygulaması** bu dalı çeksin.
