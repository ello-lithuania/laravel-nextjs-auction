# Dekaukciona — dizaino sistema

Techninė brandbook'o pusė: žetonai, utility'ai, komponentai, motion katalogas.
Spalvų/balso pagrindas — [brandbook.md](../brandbook.md). Privalomos taisyklės —
[CLAUDE.md](../CLAUDE.md).

## Žetonai (`app/globals.css` → `@theme`)

Viskas Tailwind v4 CSS-first. Žetonai automatiškai tampa utility'ais:

| Žetonas | Utility pavyzdžiai |
|---|---|
| `--color-cream/paper/sand/ink/muted` | `bg-cream`, `text-ink`, `bg-paper` |
| `--color-green/green-deep/red/gold` | `bg-green`, `text-green-deep`, `bg-gold` |
| `--font-display / --font-ui` | `font-display`, `font-ui` |
| `--shadow-chunky-sm/chunky/chunky-lg` | `shadow-chunky`, `shadow-chunky-lg` |
| `--radius-chunk` | `rounded-chunk` |

### Pagalbinės klasės (globals.css)
- `.chunky` / `.chunky-sm` / `.chunky-lg` — rėmelis + offset šešėlis vienu ypu.
- `.press` — paspaudus „nukrenta" į šešėlį (squash feel). Dėk ant mygtukų.
- `.animate-urgent` — pulsavimas (countd. paskutinės sekundės).
- `.animate-marquee` — bėganti juosta (LiveTicker).

## Komponentai

### `<LotCard lot={...} />` — ETALONAS
Prekės kortelė. `motion.div` su hover (pakyla į šešėlį). Viduje: media + semantinis
badge (`statusTone`) + `<CountdownTimer>`; body su dominuojančia kaina
(`font-display 26px`), statymų skaičium ir žaliu „STATYTI" CTA. Tipas `Lot`.

### `<CountdownTimer endsAt={iso} className={...} />`
Gyvas laikmatis. Mount-gated (static export saugu). Būsenos:
- įprastas → juodas; ≤ 5 min → raudonas; ≤ 60 s → raudonas + `animate-urgent`;
  pasibaigęs → „Baigėsi".

### `<LiveTicker lots={...} />`
Juoda bėganti juosta su statymais (social proof). Kol nėra realaus feed'o —
generuoja iš prekių. Vėliau pakeisti realiu srautu (Echo).

### Statusų sistema (`app/lib/labels.ts`)
- `statusLabel(status)` — EN→LT vertimas.
- `statusTone(status)` — semantinė badge spalva (`{ bg, text }`):
  Live→žalia, Featured→geltona, Verified→ink, For sale→paper, For rent→raudona.

## Motion katalogas (`motion` / Framer Motion)

Visi su `prefers-reduced-motion` (globalus guard jau yra globals.css).

| Mechanika | Kaip | Kur |
|---|---|---|
| **Hover lift** | `whileHover={{ x:-3, y:-3, boxShadow:'8px 8px 0 var(--color-ink)' }}` spring | LotCard ✅ |
| **Press squash** | `.press` klasė arba `whileTap={{ x:1, y:1 }}` | mygtukai ✅ |
| **Grid filtravimas** | `AnimatePresence mode="popLayout"` + `layout` + scale fade | page.tsx ✅ |
| **Scroll reveal** | `whileInView={{opacity:1,y:0}}` `viewport={{once:true}}` | „Kaip veikia" ✅ |
| **Bid count-up** | skaičiaus interpoliacija (rAF / `react-countup`) | detalės psl. (TODO) |
| **„+5 €" pop** | absoliutus elementas, `animate` y↑ + fade, pašalint | detalės psl. (TODO) |
| **Confetti** | `canvas-confetti` burst | statymas / laimėjimas (TODO) |
| **Outbid shake** | `animate={{ x:[0,-6,6,-4,4,0] }}` + raudonas toast | realtime „aplenkė" (TODO) |
| **Anti-snipe „+15 s"** | laiko prailginimas + flash badge | detalės psl. (TODO) |
| **Puslapių perėjimai** | View Transitions API / Framer slide-scale | navigacija (TODO) |

### Laikai ir easing
- Trukmės: micro 80–120ms, įprastas 150–260ms.
- Spyruoklė: `type:'spring', stiffness: 300–600, damping: 25–30`.
- Vengti > 350ms — atrodo lėta, ne „juicy".

## TODO (kitos juice mechanikos detalės puslapiui)
Statymo mygtukas: squash + kainos count-up + „+5 €" pop + confetti burst.
Realtime: „tave aplenkė" shake + raudonas toast. Anti-snipe „+15 s" pratęsimas.
Laimėjimo ekranas „🏆 TU LAIMĖJAI". Garsas (cha-ching) su mute toggle.
