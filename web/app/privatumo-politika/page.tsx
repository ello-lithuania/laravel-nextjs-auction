import type { Metadata } from "next";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import Reveal from "../components/Reveal";

export const metadata: Metadata = {
  title: "Privatumo politika",
  description:
    "Dekaukciona privatumo politika — kokius asmens duomenis renkame, kaip juos naudojame, saugome ir kokios yra tavo teisės pagal BDAR.",
  alternates: { canonical: "/privatumo-politika" },
};

const sections: { title: string; body: string[] }[] = [
  {
    title: "1. Bendra informacija",
    body: [
      "Ši privatumo politika paaiškina, kaip „Dekaukciona“ (toliau – Platforma, „mes“) renka, naudoja ir saugo tavo asmens duomenis, kai naudojiesi svetaine dekaukciona.lt.",
      "Naudodamasis Platforma tu sutinki su šioje politikoje aprašyta duomenų tvarkymo praktika. Jei nesutinki – prašome nesinaudoti Platforma.",
    ],
  },
  {
    title: "2. Kokius duomenis renkame",
    body: [
      "Registracijos duomenys: vardas, el. pašto adresas, miestas ir slaptažodis (saugomas užšifruotas).",
      "Skelbimų ir aukcionų duomenys: tavo sukurti skelbimai, įkeltos nuotraukos, aprašymai ir pateikti statymai.",
      "Techniniai duomenys: IP adresas, naršyklės tipas, įrenginio informacija ir veiksmai Platformoje – kad svetainė veiktų saugiai ir sklandžiai.",
    ],
  },
  {
    title: "3. Kaip naudojame duomenis",
    body: [
      "Kad galėtum susikurti paskyrą, skelbti daiktus ir dalyvauti aukcionuose.",
      "Kad parodytume statymus realiu laiku ir praneštume, kai tave aplenkia arba laimi aukcioną.",
      "Kad laimėjus aukcioną pirkėjas ir pardavėjas galėtų susisiekti dėl atsiskaitymo ir pristatymo.",
      "Kad užtikrintume saugumą, užkirstume kelią sukčiavimui ir tobulintume Platformą.",
    ],
  },
  {
    title: "4. Teisinis pagrindas (BDAR)",
    body: [
      "Tvarkome tavo duomenis remdamiesi: sutarties vykdymu (paslaugų teikimu), tavo sutikimu, mūsų teisėtu interesu (saugumas, paslaugos gerinimas) ir teisinėmis prievolėmis.",
    ],
  },
  {
    title: "5. Dalijimasis duomenimis",
    body: [
      "Mes neparduodame tavo asmens duomenų. Laimėjus arba užbaigus aukcioną, kita sandorio šalis (pirkėjas ar pardavėjas) gali matyti tavo vardą, miestą ir kontaktinius duomenis, reikalingus sandoriui užbaigti.",
      "Duomenimis galime dalintis su patikimais paslaugų teikėjais (pvz., serverių prieglobos), kurie veikia mūsų vardu ir laikosi konfidencialumo.",
    ],
  },
  {
    title: "6. Slapukai",
    body: [
      "Naudojame būtinuosius slapukus, kad išlaikytume tavo prisijungimo sesiją ir nustatymus. Be jų Platforma negalėtų veikti tinkamai.",
      "Naršyklės nustatymuose gali bet kada ištrinti ar blokuoti slapukus, tačiau tada kai kurios funkcijos gali neveikti.",
    ],
  },
  {
    title: "7. Duomenų saugojimas",
    body: [
      "Tavo duomenis saugome tol, kol turi aktyvią paskyrą, ir tiek, kiek reikia paslaugoms teikti ar teisinėms prievolėms vykdyti. Ištrynus paskyrą, duomenys pašalinami arba nuasmeninami.",
    ],
  },
  {
    title: "8. Tavo teisės",
    body: [
      "Pagal BDAR turi teisę: susipažinti su savo duomenimis, juos ištaisyti, ištrinti („teisė būti pamirštam“), apriboti ar nesutikti su tvarkymu, taip pat gauti savo duomenų kopiją (perkeliamumas).",
      "Norėdamas pasinaudoti šiomis teisėmis, susisiek su mumis per kontaktų formą (dekaukciona.lt/kontaktai). Taip pat turi teisę pateikti skundą Valstybinei duomenų apsaugos inspekcijai.",
    ],
  },
  {
    title: "9. Saugumas",
    body: [
      "Taikome technines ir organizacines priemones tavo duomenims apsaugoti: slaptažodžiai saugomi užšifruoti, ryšys vyksta per saugų HTTPS protokolą. Vis dėlto joks perdavimas internetu nėra 100 % saugus.",
    ],
  },
  {
    title: "10. Pakeitimai",
    body: [
      "Šią politiką galime kartkartėmis atnaujinti. Apie reikšmingus pakeitimus informuosime Platformoje. Naujausią versiją visada rasi šiame puslapyje.",
    ],
  },
  {
    title: "11. Kontaktai",
    body: [
      "Kilus klausimų dėl privatumo ar asmens duomenų, parašyk mums per kontaktų formą: dekaukciona.lt/kontaktai.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="flex min-h-screen flex-col bg-cream text-ink">
      <SiteHeader />

      <div className="mx-auto w-full max-w-3xl flex-1 px-5 py-12 lg:px-8 lg:py-16">
        {/* Antraštė */}
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-md border-2 border-ink bg-gold px-3 py-1.5 text-[13px] font-bold shadow-chunky-sm">
            🔒 Privatumas
          </span>
          <h1 className="mt-5 font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            Privatumo politika
          </h1>
          <p className="mt-3 text-muted">Atnaujinta: 2026 m. birželio 3 d.</p>
        </Reveal>

        {/* Sekcijos */}
        <div className="mt-10 space-y-5">
          {sections.map((s) => (
            <Reveal key={s.title} className="rounded-chunk border-[2.5px] border-ink bg-paper p-6 shadow-chunky">
              <h2 className="font-display text-xl font-bold tracking-tight">{s.title}</h2>
              <div className="mt-3 space-y-2.5 text-[15px] leading-relaxed text-muted">
                {s.body.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}
