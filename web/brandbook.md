# Dekaukciona — brandbook

> Kryptis: **„Chunky / žaismingas"**. Ne rimta aukciono namų prabanga, ne pigus
> „1 € azartas" — o **žaidimas, kuriame laimi tikrus daiktus**.

## 1. Pozicionavimas

Skelbiu.lt principas (nemokami skelbimai, bendruomenė), bet pardavimas vyksta
**aukciono principu** ir patirtis sukurta būti **smagi**. Statyk realiu laiku,
jausk azartą, laimėk. Mokėjimai per platformą kol kas nevykdomi — laimėjęs
tariasi su pardavėju.

**Vienas sakinys:** *Dekaukciona — vieta, kur pirkimas virsta žaidimu.*

### Trys ramsčiai
1. **Azartas** — gyvas countdown, kylančios kainos, „tave aplenkė", anti-snipe pratęsimas.
2. **Žaismė** — sodrios spalvos, chunky forma, „juicy" animacijos, garsas.
3. **Bendruomenė** — nemokama, dalijamasi, draugiškas „tu" tonas.

## 2. Balsas ir tonas

Draugiškas, energingas, „tu" forma. Trumpi, drąsūs sakiniai. Be korporatyvinio
žargono („komisinis procentas", „pardavėjo matomumas" — NE).

| Kontekstas | ✅ Taip | ❌ Ne |
|---|---|---|
| CTA mygtukas | „STATYTI", „Paskelbti nemokamai" | „Pateikti pasiūlymą", „Sukurti skelbimą" |
| Laimėjimas | „🏆 TU LAIMĖJAI!" | „Jūsų pasiūlymas priimtas" |
| Aplenkė | „Tave aplenkė! Statyk dar 💪" | „Jūsų pasiūlymas nebėra didžiausias" |
| Skuba | „Liko 45 s — paskubėk!" | „Aukcionas netrukus baigsis" |
| Tuščia | „Nieko neradom 🙈" | „Rezultatų nerasta" |

## 3. Spalvos (su vaidmenimis)

Spalva = reikšmė, ne dekoracija. Visos gyvena `globals.css` `@theme`.

| Žetonas | Hex | Vaidmuo |
|---|---|---|
| `cream` | `#FBF5EA` | Puslapio fonas (NIEKADA balta visur). |
| `paper` | `#FFFFFF` | Kortelės. |
| `sand` | `#F2E9D8` | Alt paviršius, hover, media fonas. |
| `ink` | `#171615` | Rėmeliai, šešėliai, pagrindinis tekstas. |
| `muted` | `#6B6862` | Antrinis tekstas. |
| `green` | `#15C46A` | Veiksmas, statyti, laimėjimas. |
| `green-deep` | `#0E9B53` | Žalia tekstui ant šviesaus. |
| `red` | `#FF4A2E` | Skuba, countdown, „aplenkė". |
| `gold` | `#FFC53D` | Vertė, „rekomenduojama", šventė, CTA akcentas. |

**Draudžiama:** sky-blue, violetiniai-mėlyni gradientai, pilka ant pilkos,
blur-gradientai ant kortelių.

## 4. Tipografija

- **Display** (`--font-display`): **Bricolage Grotesque** — antraštės, kaina,
  badge, mygtukai. Bold/extrabold, `tracking-tight`.
- **UI** (`--font-ui`): **Hanken Grotesk** — pastraipos, etiketės, smulkmenos.
- Abu su `latin-ext` (ąčęėįšųūž). Šriftą keisti — tik `layout.tsx`.

Skalė (display): hero 44–60px / sekcijų antraštės 30–40px / kaina kortelėj 26px /
kaina hero 34px. UI tekstas 14–18px.

## 5. Forma ir „chunky"

- **Rėmelis:** 2–3px `ink`, NIEKADA pilkas/permatomas.
- **Šešėlis:** kietas offset `shadow-chunky` (`5px 5px 0 ink`), NIEKADA blur.
- **Radius:** `rounded-chunk` (~8px). Švelniai apvalu — ne pill, ne soft-2xl.
- **Hover:** pakyla į šešėlį (`x/y -3`, šešėlis didėja). **Active:** krenta (squash).
- Mygtukai/badge/inputai — visi tos pačios chunky logikos.

## 6. Imagery

- Tikros, kontrastingos daiktų nuotraukos `aspect-[4/3]`, `object-cover`, ink rėmelis.
- Be stock-iliustracijų, be 3D-blob'ų, be AI-gradientinių fonų.
- Fonas gali turėti subtilų **taškelių tinklelį** (hero) — bet ne gradientą.

## 7. Motion principai

Žr. detaliai [docs/design-system.md](./docs/design-system.md). Trumpai: judesys
turi tikslą (azartas / grįžtamasis ryšys), greitas (150–260ms), „spyruoklinis",
visada su `prefers-reduced-motion` atsargine versija.
