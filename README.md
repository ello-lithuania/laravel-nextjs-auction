# dekaukcionas — projekto pamatas

Šis paketas paruošia dizaino pagrindą, kad VS Code'e su Claude Code galėtum iškart vystyti projektą nenuklysdamas atgal į „AI" stilių.

## Kas viduje

```
CLAUDE.md              # Claude Code automatiškai skaito — kontekstas + dizaino taisyklės
app/globals.css        # design tokens (Tailwind v4 @theme) + base + utilities
docs/brandbook.md      # prekės ženklas: pozicionavimas, balsas, spalvos, tipografija
docs/design-system.md  # komponentų specai + Framer Motion katalogas
```

## Kaip naudoti

1. Įmesk failus į savo Next.js repo šaknį (`CLAUDE.md` — į šaknį; `globals.css` — į esamą `app/`; `docs/` — kaip yra).
2. Įsidiek priklausomybes:
   ```bash
   npm i motion canvas-confetti @tabler/icons-react
   ```
3. Sutvarkyk šriftus per `next/font` (žr. komentarą `app/globals.css` apačioje) — svarbu `latin-ext` subset dėl lietuviškų raidžių.
4. VS Code'e paleisk Claude Code. Jis pamatys `CLAUDE.md`. Pradėk pvz.:
   > „Perskaityk CLAUDE.md ir docs/. Perdaryk LotCard komponentą pagal dizaino sistemą."

## Pirmi žingsniai (siūloma seka)

1. `ui/Button` + `lot/StatusBadge` (maži, nustato „chunky" kalbą).
2. `lot/CountdownTimer` + `lib/motion.ts`.
3. `lot/BidButton` (statymo „juice").
4. `lot/LotCard` (viską suriša).
5. Sąrašo puslapis su staggered reveal + `lot/LiveFeed`.
6. `lot/WinModal` + confetti.
7. Puslapių perėjimai.

Visada laikykis „Auksinių dizaino taisyklių" iš `CLAUDE.md`.
