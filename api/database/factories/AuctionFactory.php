<?php

namespace Database\Factories;

use App\Models\Auction;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class AuctionFactory extends Factory
{
    protected $model = Auction::class;

    public function definition(): array
    {
        $title = $this->faker->unique()->words(mt_rand(2, 4), true);
        $startingPrice = $this->faker->randomFloat(2, 1800, 45000);
        $currentPrice = $startingPrice + $this->faker->randomFloat(2, 200, 15000);
        $statusOptions = ['Live', 'For sale', 'For rent', 'Featured'];
        $categories = ['Laikrodžiai', 'Automobiliai', 'Elektronika', 'Menas', 'Kolekcijos'];
        $locations = ['Vilnius', 'Kaunas', 'Klaipėda', 'Šiauliai', 'Panevėžys'];
        $galleryImages = [
            'Laikrodžiai' => [
                'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1508385082359-f8a2869641b5?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1518546305926-6d92256ff59b?auto=format&fit=crop&w=1200&q=80',
            ],
            'Automobiliai' => [
                'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1495147466023-ac5c588e2e94?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
            ],
            'Elektronika' => [
                'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1517059224940-d4af9eec41e9?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
            ],
            'Menas' => [
                'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1481349518771-20055b2a7b24?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1496318447583-f524534e9ce1?auto=format&fit=crop&w=1200&q=80',
            ],
            'Kolekcijos' => [
                'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80',
            ],
        ];
        $category = $this->faker->randomElement($categories);
        $gallery = $this->faker->randomElements($galleryImages[$category], 4);

        return [
            'title' => ucfirst($title),
            'slug' => Str::slug($title) . '-' . $this->faker->unique()->numberBetween(1, 99),
            'description' => $this->faker->paragraphs(3, true),
            'category' => $category,
            'location' => $this->faker->randomElement($locations),
            'seller_name' => $this->faker->name(),
            // Assign a real owning user (seeded before auctions) so private
            // buyer↔seller chats have an author. Null if no users exist yet.
            'seller_id' => \App\Models\User::inRandomOrder()->value('id'),
            'starting_price' => $startingPrice,
            'current_price' => $currentPrice,
            'commission_percent' => 5,
            'status' => $this->faker->randomElement($statusOptions),
            'ends_at' => now()->addDays($this->faker->numberBetween(1, 9))->addHours($this->faker->numberBetween(1, 23)),
            'image_url' => $gallery[0],
            'gallery' => $gallery,
            'is_featured' => $this->faker->boolean(35),
            'bids_count' => $this->faker->numberBetween(2, 50),
        ];
    }
}
