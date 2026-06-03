@AGENTS.md

# Dekaukciona — projekto kontekstas

Lietuviška aukcionų platforma. Veikia kaip skelbiu.lt, bet pardavimas vyksta
**aukciono principu**: žmonės stato už prekę, daugiausiai pasiūlęs laimi ir toliau
tariasi su pardavėju dėl atsiskaitymo bei pristatymo. **Mokėjimai per platformą
kol kas nevykdomi.** Skelbimai **nemokami, be komisinių** — augam per SEO ir
bendruomenės dalijimąsi.

**Esmė:** puslapis turi jaustis kaip **žaidimas** — azartas, žaismė, dopaminas
statant. Tai mūsų skirtumas nuo nuobodaus skelbiu.lt.

## Stack
- **Front:** Next.js 16 (App Router) + React 19 + Tailwind v4 (CSS-first `@theme`).
  **Static export** (`output: 'export'`) — jokio SSR; duomenys imami kliente iš
  Laravel API (`NEXT_PUBLIC_API_URL`). Realtime statymai per Laravel Echo/Reverb.
- **Back:** Laravel (`/api`), deploy į Hostinger per FTPS (žr. repo šaknies `DEPLOYMENT.md`).
- **Animacijos:** `motion` (Framer Motion), `canvas-confetti`.
- Next.js 16 yra kitokia nei mokymų duomenys — skaityk `node_modules/next/dist/docs/`
  prieš rašydamas (žr. AGENTS.md).

## ⭐ Auksinės dizaino taisyklės (PRIVALOMA — nelaužyti)

Dizaino kryptis: **„Chunky / žaismingas"** (neo-brutalist). Pilnas aprašas —
[brandbook](./brandbook.md) ir [dizaino sistema](./docs/design-system.md).

1. **Naudok `.chunky`, ne soft shadow.** Storas juodas rėmelis + kietas offset
   šešėlis (`shadow-chunky`). NIEKADA blur/soft `shadow-xl`, NIEKADA kortelės
   plūduriuojančios pilkam fone.
2. **Tik sistemos spalvos.** `cream / ink / green / red / gold`. JOKIOS sky-blue,
   JOKIO slate-pilko ant pilko, JOKIŲ violetinių-mėlynų gradientų.
3. **Spalva turi reikšmę (semantinė).** žalia = veiksmas/laimėjimas,
   raudona = skuba/countdown/aplenkė, geltona = vertė/rekomenduojama. Badge'ai
   NIEKADA visi vienodi pilki — naudok `statusTone()`.
4. **Kaina dominuoja.** Aukcione kaina = emocinis centras: `font-display`,
   didelė, drąsi. Niekada plona/pilka, niekada tokia pat kaip miestas.
5. **Gyvas countdown, ne statinė data.** Naudok `<CountdownTimer />`. Paskutinės
   sekundės pulsuoja raudonai — skuba kuria azartą.
6. **Du šriftai.** Antraštės/kaina = `font-display` (Bricolage Grotesque).
   UI tekstas = `font-ui` (Hanken Grotesk). Niekada vienas šriftas visam.
   Šriftą keisti TIK `layout.tsx` + `--font-display` (vienoje vietoje).
7. **„Juice" yra produktas.** Statymas = squash + skaičius pašoka + „+5 €" +
   confetti. Hover = kortelė pakyla į šešėlį. Perėjimai slide/scale, ne baltas flash.
   Visada gerbk `prefers-reduced-motion` (jau yra globals.css).
8. **Edge-to-edge struktūra.** Sekcijos su `border-y` skiriamos viena nuo kitos,
   ne kiekviena savo plūduriuojančioj kortelėj. Asimetrija > simetriškas centras.

**Anti-pattern (ko NEDARYTI):** centruotas hero su pill-badge → gradientinis
žodis → 2 pill CTA → 3 vienodos varnelės. Tai „AI look", kurį MES paliekam.

## Komponentai-etalonai (atspirties taškas naujiems)
- `app/components/LotCard.tsx` — prekės kortelė (chunky, badge, countdown, hover juice).
- `app/components/CountdownTimer.tsx` — gyvas laikmatis su skubos būsenom.
- `app/components/LiveTicker.tsx` — bėganti statymų juosta.
- `app/page.tsx` — pradinis puslapis (header, hero, filtrai, tinklelis, CTA, footer).

## Konvencijos
- Spalvos/tarpai/šešėliai TIK per tokens (`app/globals.css` `@theme`). Jokių hex
  inline, jokių vienkartinių spalvų.
- Kaina visada per `formatEur()` (`app/lib/format.ts`) — lietuviškas formatas „3 450 €".
- Statusų LT vertimai + spalvos — `app/lib/labels.ts` (`statusLabel`, `statusTone`).
- Tekstai lietuviškai, „tu" forma, žaismingas bet aiškus tonas.

## Definition of done
- [ ] Atitinka 8 auksines taisykles (chunky, sistemos spalvos, semantika).
- [ ] `npm run build` praeina (static export).
- [ ] Veikia mobile (kortelės grid'as kolapsuoja, nieko neišlenda).
- [ ] Animacijos turi `prefers-reduced-motion` atsarginį variantą.
