# Deployment (Hostinger shared hosting + GitHub Actions)

Du atskiri appsai, du workflow'ai:

- **Next.js** → statinis eksportas (`web/out/`) į `public_html/` (`.github/workflows/deploy-web.yml`)
- **Laravel API** → atskiras folderis (pvz. `~/laravel-api`), subdomeno docroot → `~/laravel-api/public` (`.github/workflows/deploy-api.yml`)

Workflow'ai paleidžiami automatiškai push'inus į `main` (pagal pakeistus `web/**` arba `api/**`), arba rankiniu būdu (Actions → Run workflow).

---

## 1. SSH raktas

Susikurk **atskirą** deploy raktą (be slaptažodžio):

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f deploy_key -N ""
```

- **Viešą** raktą (`deploy_key.pub`) įdėk į Hostinger: hPanel → Advanced → SSH Access → Manage SSH keys → įklijuok turinį.
- **Privatų** raktą (`deploy_key`) įdėsi į GitHub secret `SSH_PRIVATE_KEY` (žr. žemiau).

SSH duomenis (host, port, username) rasi hPanel → Advanced → SSH Access.

## 2. GitHub Secrets (Settings → Secrets and variables → Actions → **Secrets**)

| Secret | Pavyzdys / paaiškinimas |
|---|---|
| `SSH_HOST` | pvz. `82.x.x.x` arba `plum-mouse-764078.hostingersite.com` |
| `SSH_USER` | pvz. `u123456789` |
| `SSH_PORT` | dažnai `65002` (Hostinger), ne 22 |
| `SSH_PRIVATE_KEY` | viso `deploy_key` failo turinys |
| `WEB_TARGET` | pvz. `/home/u123456789/domains/plum-mouse-764078.hostingersite.com/public_html` |
| `API_TARGET` | pvz. `/home/u123456789/laravel-api` (NE po public_html) |

## 3. GitHub Variables (ten pat → **Variables**) — viešos, patenka į naršyklę

| Variable | Pavyzdys |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://dekaukciona.lt/backend` (API tame pačiame domene, `backend` symlink į Laravel `public`) |
| `NEXT_PUBLIC_REVERB_APP_KEY` | `auction-key` |
| `NEXT_PUBLIC_REVERB_HOST` | `dekaukciona.lt` |
| `NEXT_PUBLIC_REVERB_PORT` | `443` |
| `NEXT_PUBLIC_REVERB_SCHEME` | `https` |

> Pastaba: realaus laiko (Reverb websocket) shared hostinge dažnai neveiks (reikia ilgai gyvenančio proceso ir atviro porto). Bidding HTTP veiks; live atnaujinimai gali neveikti, kol nebus atskiro websocket sprendimo.

## 4. Hostinger vienkartinis paruošimas (per SSH)

```bash
# Laravel folderis (ne public_html)
mkdir -p ~/laravel-api

# Subdomenas: hPanel → Domains → Subdomains → sukurk pvz. api.plum-mouse-764078.hostingersite.com
# ir jo "Document Root" nustatyk į  ~/laravel-api/public
```

Pirmą kartą (arba leisk pirmam deploy'ui įkelti failus, tada):

```bash
cd ~/laravel-api
cp .env.example .env          # arba įkelk paruoštą .env
php artisan key:generate
# Suredaguok .env: APP_ENV=production, APP_DEBUG=false, APP_URL=https://api...,
#   FRONTEND_URL=https://dekaukciona.lt,
#   DB_* (Hostinger MySQL), MAIL_*  ir kt.
php artisan migrate --force
php artisan storage:link
```

- **PHP versija:** hPanel → PHP Configuration → pasirink **8.2+** (Laravel 12).
- **DB:** sukurk MySQL DB hPanel'yje ir įrašyk duomenis į `.env` (`DB_CONNECTION=mysql`).
- **CORS:** `.env` `FRONTEND_URL` turi būti `https://dekaukciona.lt`. (Front'as ir API yra tame pačiame origin'e, tad CORS net nesuveiks; bet `FRONTEND_URL` vis tiek naudojamas el. laiškų nuorodoms — pvz. slaptažodžio atstatymo — todėl turi būti teisingas.)

## 5. Saugumo pastabos (statinis variantas)

- Šiame (statiniame) variante Sanctum token saugomas **localStorage**, o CSP priverstas leisti `script-src 'unsafe-inline'` (Next statinis eksportas naudoja inline skriptus). Tai **silpnesnė** XSS apsauga nei BFF/httpOnly cookie variante.
- Visa kita serverio pusės apsauga lieka: rate limiting, CORS, bid integrity, slaptažodžių politika, reset/change, enumeration apsauga, API security headers.
- **Rekomendacija ateičiai:** kai turėsi tikrą domeną + `api.` subdomeną, pereiti prie **Laravel Sanctum SPA cookie auth** — taip atgausi httpOnly cookie saugumą be Node serverio. Tada `connect-src` CSP'e susiaurink iki tikslaus API origin.

## 6. CSP susiaurinimas

`web/deploy/public_html.htaccess` `connect-src` dabar `'self' https: wss:`. Kai API adresas fiksuotas, pakeisk į tikslų, pvz.:
`connect-src 'self' https://api.plum-mouse-764078.hostingersite.com wss://api.plum-mouse-764078.hostingersite.com`.
