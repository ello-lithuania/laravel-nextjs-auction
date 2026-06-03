<?php

namespace Database\Factories;

use App\Models\Auction;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class AuctionFactory extends Factory
{
    protected $model = Auction::class;

    private function img(string $id): string
    {
        return "https://images.unsplash.com/photo-{$id}?auto=format&fit=crop&w=1200&q=80";
    }

    public function definition(): array
    {
        // Realūs lietuviški daiktai, suderinti su kategorijų medžiu (parent +
        // subcategory iš web/app/data/categories.ts). Kiekvienas turi savo
        // nuotrauką, kad kortelė atitiktų prekę.
        // Formatas: [parent, subcategory, title, description, min, max, photoId].
        $items = [
            ['Mada ir stilius', 'Laikrodžiai', 'Šveicariškas mechaninis laikrodis Tissot', 'Klasikinis vyriškas mechaninis laikrodis su odine apyranke. Veikia tvarkingai, prižiūrėtas, su originalia dėžute.', 250, 1200, '1524805444758-089113d48a6d'],
            ['Mada ir stilius', 'Laikrodžiai', 'Seiko automatinis laikrodis', 'Japoniškas automatinis laikrodis, nerūdijančio plieno korpusas, vandeniui atsparus iki 50 m.', 150, 600, '1523275335684-37898b6baf30'],
            ['Mada ir stilius', 'Laikrodžiai', 'Vintažinis Poljot rankinis laikrodis', 'Sovietinės gamybos kolekcinis laikrodis, mechaninis užvedimas. Puiki kolekcijos detalė.', 60, 350, '1547996160-81dfa63595aa'],
            ['Mada ir stilius', 'Laikrodžiai', 'Casio sportinis laikrodis', 'Atsparus smūgiams ir vandeniui, su apšvietimu ir chronografu. Idealus aktyviam laisvalaikiui.', 60, 220, '1434056886845-dac89ffe9b56'],

            ['Transportas', 'Automobiliai', 'Volkswagen Golf 1.6 TDI, 2014 m.', 'Ekonomiškas dyzelinas, 105 AG, 198 000 km. Aptarnautas, nauja TA, žieminės padangos komplekte.', 5200, 8500, '1503376780353-7e6692767b70'],
            ['Transportas', 'Automobiliai', 'BMW 320d, 2012 m.', 'Sedanas, 2.0 dyzelinas, automatinė pavarų dėžė, odinis salonas, navigacija. Techniškai tvarkingas.', 6000, 11000, '1555215695-3004980ad54e'],
            ['Transportas', 'Automobiliai', 'Audi A4 2.0 TDI universalas, 2013 m.', 'Erdvus universalas, 150 AG, kablys, šildomos sėdynės. Servisuotas pas oficialų atstovą.', 6500, 12000, '1606664515524-ed2f786a0bd6'],
            ['Transportas', 'Automobiliai', 'Toyota Corolla 1.4, 2011 m.', 'Patikimas ir ekonomiškas miesto automobilis, benzinas, 156 000 km. Be rūdžių, vienas savininkas.', 3200, 6500, '1559416523-140ddc3d238c'],
            ['Transportas', 'Automobiliai', 'Mercedes-Benz E klasė 220 CDI, 2011 m.', 'Verslo klasės sedanas, pilna komplektacija, LED žibintai, oda. Reguliariai aptarnautas.', 7500, 14000, '1618843479313-40f8afb4b4d8'],

            ['Elektronika', 'Telefonai', 'Apple iPhone 13, 128 GB', 'Puikios būklės, baterijos talpa 89 %. Su dėžute ir krovikliu, be įbrėžimų, atrakintas visiems operatoriams.', 380, 650, '1632661674596-df8be070a5c5'],
            ['Elektronika', 'Kompiuteriai', 'MacBook Air M1, 256 GB', 'Nešiojamas kompiuteris su M1 procesoriumi, 8 GB RAM. Greitas, tylus, ilgaamžė baterija. Kaip naujas.', 650, 1100, '1517336714731-489689fd1ca8'],
            ['Elektronika', 'Žaidimų konsolės', 'Sony PlayStation 5 konsolė', 'Žaidimų konsolė su pulteliu ir dviem žaidimais. Veikia nepriekaištingai, pilnas komplektas.', 350, 550, '1606813907291-d86efa9b94db'],
            ['Elektronika', 'Telefonai', 'Samsung Galaxy S22, 128 GB', 'Išmanusis telefonas su AMOLED ekranu ir trigubu fotoaparatu. Komplekte dėklas ir apsauginis stiklas.', 300, 520, '1610945265064-0e34e5519bbf'],
            ['Elektronika', 'Foto ir video', 'Canon EOS R fotoaparatas', 'Beveidrodinis fotoaparatas su 24-105 mm objektyvu. Mažai naudotas, idealus mėgėjams ir profesionalams.', 850, 1600, '1502920917128-1aa500764cbd'],

            ['Kolekcionavimas ir menas', 'Paveikslai', 'Aliejinė tapyba „Lietuvos peizažas“', 'Originali aliejinė tapyba ant drobės, 60×80 cm, signuota autoriaus. Su mediniu rėmu, paruošta kabinti.', 180, 1200, '1577083552431-6e5fd01aa342'],
            ['Kolekcionavimas ir menas', 'Paveikslai', 'Originali akvarelė, signuota', 'Subtili akvarelė ant popieriaus, įrėminta po stiklu. Unikalus kūrinys interjerui.', 80, 550, '1481349518771-20055b2a7b24'],
            ['Kolekcionavimas ir menas', 'Senienos', 'Bronzinė skulptūra', 'Rankų darbo bronzinė skulptūra ant marmuro pagrindo. Solidus akcentas namams ar biurui.', 300, 2400, '1554907984-15263bfd63bd'],
            ['Kolekcionavimas ir menas', 'Paveikslai', 'Riboto leidimo grafikos darbas', 'Numeruota litografija (47/100), signuota dailininko. Su autentiškumo sertifikatu.', 120, 700, '1504196606672-aef5c9cefc92'],
            ['Kolekcionavimas ir menas', 'Antikvariatas', 'Senovinė tapyta ikona', 'XIX a. medinė ikona, tapyta temperomis. Kolekcinė vertė, prižiūrėta būklė.', 200, 1500, '1578926375605-eaf7559b1458'],
            ['Kolekcionavimas ir menas', 'Monetos ir banknotai', 'Sovietinių monetų rinkinys', 'Įvairių metų monetų kolekcija albume, daugiau nei 120 vienetų. Puikus startas numizmatui.', 60, 450, '1621155346337-1d19476ba7d6'],
            ['Kolekcionavimas ir menas', 'Vinilo plokštelės', 'Vinilo plokštelių kolekcija (50 vnt.)', 'Įvairaus žanro vinilo plokštelės, geros ir labai geros būklės. Tarp jų – retų leidimų.', 120, 600, '1603048588665-791ca8aea617'],
            ['Kolekcionavimas ir menas', 'Antikvariatas', 'Antikvarinė porceliano vaza', 'Rankomis tapyta porceliano vaza, XX a. vidurys. Be įskilimų, su gamintojo žyma.', 130, 900, '1578500494198-246f612d3b3d'],
            ['Kolekcionavimas ir menas', 'Pašto ženklai', 'Pašto ženklų albumas', 'Lietuvos ir užsienio pašto ženklų rinkinys teminiame albume. Filatelisto svajonė.', 70, 500, '1607344645866-009c320b63e0'],
        ];

        $locations = ['Vilnius', 'Kaunas', 'Klaipėda', 'Šiauliai', 'Panevėžys'];
        $statusOptions = ['Live', 'For sale', 'Featured'];

        [$category, $subcategory, $title, $description, $minPrice, $maxPrice, $photoId] = $this->faker->randomElement($items);

        $startingPrice = $this->faker->numberBetween($minPrice, (int) ($maxPrice * 0.85));
        $currentPrice = (int) round($startingPrice * (1 + $this->faker->randomFloat(2, 0.05, 0.35)));
        $image = $this->img($photoId);

        return [
            'title' => $title,
            'slug' => Str::slug($title) . '-' . $this->faker->unique()->numberBetween(1, 9999),
            'description' => $description,
            'category' => $category,
            'subcategory' => $subcategory,
            'location' => $this->faker->randomElement($locations),
            'seller_name' => $this->faker->randomElement([
                'Tomas K.', 'Eglė M.', 'Mantas V.', 'Rūta B.', 'Dovydas P.',
                'Aistė L.', 'Lukas Ž.', 'Greta S.', 'Andrius J.', 'Ieva N.',
            ]),
            'seller_id' => \App\Models\User::inRandomOrder()->value('id'),
            'starting_price' => $startingPrice,
            'current_price' => $currentPrice,
            'commission_percent' => 0,
            'status' => $this->faker->randomElement($statusOptions),
            'ends_at' => now()->addDays($this->faker->numberBetween(1, 9))->addHours($this->faker->numberBetween(1, 23)),
            'image_url' => $image,
            'gallery' => [$image],
            'is_featured' => $this->faker->boolean(35),
            'bids_count' => $this->faker->numberBetween(2, 50),
        ];
    }
}
