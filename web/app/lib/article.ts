// Straipsnio turinio apdorojimas (server-safe, be fs):
//  - headingų ištraukimas + ID'ai (TOC ir scroll-spy)
//  - FAQ ištraukimas (FAQPage struktūruoti duomenys)
//  - automatinės vidinės nuorodos tekste (SEO susiejimas)

const LT_MAP: Record<string, string> = {
  ą: "a", č: "c", ę: "e", ė: "e", į: "i", š: "s", ų: "u", ū: "u", ž: "z",
};

// Lietuviškas slug headingams (be diakritikos).
export function slugifyHeading(text: string): string {
  return text
    .replace(/<[^>]+>/g, "")
    .replace(/&[a-z]+;/gi, "")
    .toLowerCase()
    .replace(/[ąčęėįšųūž]/g, (c) => LT_MAP[c] ?? c)
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export type Heading = { id: string; text: string };

// Tik H2 — jų pakanka TOC'ui ir jie atitinka sekcijų struktūrą.
export function extractHeadings(body: string): Heading[] {
  const out: Heading[] = [];
  for (const line of body.split("\n")) {
    const m = /^##\s+(.+?)\s*$/.exec(line);
    if (m) out.push({ text: m[1].trim(), id: slugifyHeading(m[1]) });
  }
  return out;
}

// Įterpia id atributus į <h2>, kad atitiktų TOC nuorodas.
export function addHeadingIds(html: string): string {
  return html.replace(/<h2>([\s\S]*?)<\/h2>/g, (_full, inner) => {
    const text = inner.replace(/<[^>]+>/g, "");
    return `<h2 id="${slugifyHeading(text)}">${inner}</h2>`;
  });
}

export type Faq = { q: string; a: string };

function stripMd(s: string): string {
  return s
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\[(.+?)\]\([^)]*\)/g, "$1")
    .replace(/[*_`]/g, "")
    .trim();
}

// Ištraukia „Dažni klausimai" sekcijos klausimus/atsakymus FAQPage schemai.
// Formatas postuose: paragrafas „**Klausimas?** Atsakymas."
export function extractFaq(body: string): Faq[] {
  const lines = body.split("\n");
  let inFaq = false;
  const buf: string[] = [];
  for (const line of lines) {
    if (/^##\s+Dažni klausimai/i.test(line)) {
      inFaq = true;
      continue;
    }
    if (inFaq && /^##\s+/.test(line)) break;
    if (inFaq) buf.push(line);
  }
  if (!inFaq) return [];

  const paras = buf
    .join("\n")
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  const faqs: Faq[] = [];
  for (const p of paras) {
    const m = /^\*\*(.+?)\*\*\s*([\s\S]+)$/.exec(p);
    if (m) faqs.push({ q: stripMd(m[1]), a: stripMd(m[2]) });
  }
  return faqs;
}

// Kuruotas žodžių-formų → slug žemėlapis vidinėms nuorodoms.
// Pilnos žodžių formos (ne kamienai), kad nesusidarytų klaidingų atitikmenų.
const LINK_MAP: { slug: string; forms: string[] }[] = [
  { slug: "kaip-nustatyti-pradine-kaina-aukcione", forms: ["pradinę kainą", "pradinės kainos", "pradinė kaina"] },
  { slug: "kaip-nustatyti-daikto-rinkos-kaina", forms: ["rinkos kainą", "rinkos vertę", "rinkos kaina", "rinkos vertė"] },
  { slug: "kaip-issiusti-daikta-pastomatu", forms: ["paštomatu", "paštomatą", "paštomate", "paštomatas"] },
  { slug: "kaip-atpazinti-sukci-internete", forms: ["sukčiavimo", "sukčių", "sukčiai", "sukčius"] },
  { slug: "kaip-fotografuoti-daikta-aukcionui", forms: ["kokybiškos nuotraukos", "geros nuotraukos", "nuotraukos"] },
  { slug: "kaip-parasyti-skelbimo-aprasyma", forms: ["gerą aprašymą", "aprašymą", "aprašymas", "aprašyme"] },
  { slug: "statymo-strategijos-kaip-laimeti-aukciona", forms: ["statymo strategijos", "statymo strategija", "statymo strategiją"] },
  { slug: "kaip-kelti-pardavejo-reputacija", forms: ["teigiamų įvertinimų", "reputaciją", "reputacija", "reputacijos"] },
  { slug: "kaip-supakuoti-daikta-siuntimui", forms: ["tinkamai supakuoti", "kruopštus pakavimas", "supakuoti", "pakavimas"] },
  { slug: "atsiskaitymas-po-aukciono", forms: ["atsiskaitymo būdą", "atsiskaitymo būdai", "atsiskaitymas"] },
  { slug: "grazinimai-ir-gincai-aukcione", forms: ["grąžinimą", "ginčas", "ginčų", "ginčai"] },
  { slug: "saugus-pirkimas-ir-pardavimas-internetu", forms: ["saugus pirkimas", "saugiai pirkti"] },
  { slug: "kaip-nustatyti-daikto-rinkos-kaina", forms: ["kiek daiktas vertas"] },
  { slug: "kolekcionavimas-ir-aukcionai-nuo-ko-pradeti", forms: ["kolekcionavimas", "kolekcininkų", "kolekciją"] },
];

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Ar pozicija line viduje jau egzistuojančios markdown nuorodos [..](..).
function insideLink(line: string, idx: number): boolean {
  const re = /\[[^\]]*\]\([^)]*\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line))) {
    if (idx >= m.index && idx < m.index + m[0].length) return true;
  }
  return false;
}

// Automatiškai sujungia straipsnius vidinėmis nuorodomis: kiekvienam slug'ui
// įterpia po vieną nuorodą ant pirmo tinkamo žodžio (ne heading'e, ne jau
// esamoje nuorodoje). Daugiausiai `max` nuorodų viename straipsnyje.
export function autoLinkBody(body: string, currentSlug: string, max = 4): string {
  const lines = body.split("\n");
  const usedSlug = new Set<string>([currentSlug]);
  let count = 0;
  let inFaq = false;

  for (let i = 0; i < lines.length && count < max; i++) {
    const line = lines[i];
    if (/^##\s+Dažni klausimai/i.test(line)) inFaq = true;
    else if (/^##\s+/.test(line)) inFaq = false;

    // Praleidžiam headingus, FAQ sekciją ir tuščias eilutes.
    if (inFaq || /^#{1,6}\s/.test(line) || line.trim() === "") continue;

    for (const entry of LINK_MAP) {
      if (usedSlug.has(entry.slug) || count >= max) continue;
      let linked = false;
      for (const form of entry.forms) {
        const re = new RegExp(`(?<![\\p{L}])(${escapeRe(form)})(?![\\p{L}])`, "iu");
        const m = re.exec(line);
        if (m && m.index !== undefined && !insideLink(line, m.index)) {
          lines[i] =
            line.slice(0, m.index) +
            `[${m[1]}](/naujienos/${entry.slug})` +
            line.slice(m.index + m[1].length);
          usedSlug.add(entry.slug);
          count++;
          linked = true;
          break;
        }
      }
      if (linked) break; // viena nuoroda vienoje eilutėje
    }
  }

  return lines.join("\n");
}
