// Kategorijų medis (parent → children), kaip skelbiu.lt / alio.lt.
// Plečiama laisvai: pridėk parent objektą arba child į `children` masyvą.

export type SubCategory = { slug: string; label: string };
export type Category = {
  slug: string;
  label: string;
  icon: string;
  children: SubCategory[];
};

export const categories: Category[] = [
  {
    slug: "transportas",
    label: "Transportas",
    icon: "🚗",
    children: [
      { slug: "automobiliai", label: "Automobiliai" },
      { slug: "motociklai", label: "Motociklai" },
      { slug: "sunkvezimiai", label: "Sunkvežimiai" },
      { slug: "priekabos", label: "Priekabos" },
      { slug: "vandens-transportas", label: "Vandens transportas" },
      { slug: "auto-dalys", label: "Auto dalys" },
      { slug: "padangos-ratlankiai", label: "Padangos ir ratlankiai" },
    ],
  },
  {
    slug: "nekilnojamasis-turtas",
    label: "Nekilnojamasis turtas",
    icon: "🏠",
    children: [
      { slug: "butai", label: "Butai" },
      { slug: "namai", label: "Namai" },
      { slug: "sklypai", label: "Sklypai" },
      { slug: "sodybos", label: "Sodai ir sodybos" },
      { slug: "garazai", label: "Garažai" },
      { slug: "komercines-patalpos", label: "Komercinės patalpos" },
    ],
  },
  {
    slug: "elektronika",
    label: "Elektronika",
    icon: "💻",
    children: [
      { slug: "telefonai", label: "Telefonai" },
      { slug: "kompiuteriai", label: "Kompiuteriai" },
      { slug: "plansetes", label: "Planšetės" },
      { slug: "tv-vaizdo", label: "TV ir vaizdo technika" },
      { slug: "garso-technika", label: "Garso technika" },
      { slug: "foto-video", label: "Foto ir video" },
      { slug: "zaidimu-konsoles", label: "Žaidimų konsolės" },
      { slug: "ismanieji-laikrodziai", label: "Išmanieji laikrodžiai" },
    ],
  },
  {
    slug: "namams-sodui",
    label: "Namams ir sodui",
    icon: "🛋️",
    children: [
      { slug: "baldai", label: "Baldai" },
      { slug: "buitine-technika", label: "Buitinė technika" },
      { slug: "apsvietimas", label: "Apšvietimas" },
      { slug: "virtuves-reikmenys", label: "Virtuvės reikmenys" },
      { slug: "tekstile", label: "Tekstilė" },
      { slug: "irankiai", label: "Įrankiai" },
      { slug: "sodo-technika", label: "Sodo technika" },
    ],
  },
  {
    slug: "mada-stilius",
    label: "Mada ir stilius",
    icon: "👗",
    children: [
      { slug: "moteriski-drabuziai", label: "Moteriški drabužiai" },
      { slug: "vyriski-drabuziai", label: "Vyriški drabužiai" },
      { slug: "avalyne", label: "Avalynė" },
      { slug: "rankines", label: "Rankinės" },
      { slug: "aksesuarai", label: "Aksesuarai" },
      { slug: "papuosalai", label: "Papuošalai" },
      { slug: "laikrodziai", label: "Laikrodžiai" },
    ],
  },
  {
    slug: "vaikams",
    label: "Vaikams",
    icon: "🧸",
    children: [
      { slug: "zaislai", label: "Žaislai" },
      { slug: "vaikiski-drabuziai", label: "Vaikiški drabužiai" },
      { slug: "vezimeliai", label: "Vežimėliai" },
      { slug: "auto-kedutes", label: "Automobilinės kėdutės" },
      { slug: "lovytes", label: "Lovytės" },
      { slug: "knygos-vaikams", label: "Knygos vaikams" },
    ],
  },
  {
    slug: "laisvalaikis-sportas",
    label: "Laisvalaikis ir sportas",
    icon: "⚽",
    children: [
      { slug: "sporto-inventorius", label: "Sporto inventorius" },
      { slug: "dviraciai", label: "Dviračiai" },
      { slug: "turizmas", label: "Turizmas ir stovyklavimas" },
      { slug: "zvejyba", label: "Žvejyba ir medžioklė" },
      { slug: "muzikos-instrumentai", label: "Muzikos instrumentai" },
      { slug: "knygos", label: "Knygos" },
    ],
  },
  {
    slug: "grozis-sveikata",
    label: "Grožis ir sveikata",
    icon: "💄",
    children: [
      { slug: "kosmetika", label: "Kosmetika" },
      { slug: "kvepalai", label: "Kvepalai" },
      { slug: "prieziuros-priemones", label: "Priežiūros priemonės" },
      { slug: "sveikatos-prekes", label: "Sveikatos prekės" },
    ],
  },
  {
    slug: "kolekcionavimas-menas",
    label: "Kolekcionavimas ir menas",
    icon: "🖼️",
    children: [
      { slug: "antikvariatas", label: "Antikvariatas" },
      { slug: "monetos-banknotai", label: "Monetos ir banknotai" },
      { slug: "pasto-zenklai", label: "Pašto ženklai" },
      { slug: "paveikslai", label: "Paveikslai" },
      { slug: "vinilo-ploksteles", label: "Vinilo plokštelės" },
      { slug: "senienos", label: "Senienos" },
    ],
  },
  {
    slug: "gyvunai",
    label: "Gyvūnai",
    icon: "🐾",
    children: [
      { slug: "sunys", label: "Šunys" },
      { slug: "kates", label: "Katės" },
      { slug: "pauksciai", label: "Paukščiai" },
      { slug: "akvariumai", label: "Žuvys ir akvariumai" },
      { slug: "gyvunu-prekes", label: "Gyvūnų prekės" },
    ],
  },
  {
    slug: "verslui",
    label: "Verslui",
    icon: "🏢",
    children: [
      { slug: "iranga", label: "Įranga" },
      { slug: "prekybos-inventorius", label: "Prekybos inventorius" },
      { slug: "reklama", label: "Reklama" },
      { slug: "zemes-ukis", label: "Žemės ūkis" },
    ],
  },
  {
    slug: "paslaugos",
    label: "Paslaugos",
    icon: "🛠️",
    children: [
      { slug: "remontas", label: "Remonto darbai" },
      { slug: "transporto-paslaugos", label: "Transporto paslaugos" },
      { slug: "renginiai", label: "Renginiai" },
      { slug: "mokymai", label: "Mokymai ir kursai" },
    ],
  },
];
