<?php

namespace Database\Seeders;

use App\Models\Auction;
use App\Models\Bid;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class BidSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $auctions = Auction::all();

        foreach ($auctions as $auction) {
            $basePrice = $auction->starting_price;

            // Create 10 random bids for each auction
            for ($i = 0; $i < 10; $i++) {
                $bidAmount = $basePrice + ($i * 100) + rand(50, 200);

                Bid::create([
                    'auction_id' => $auction->id,
                    'amount' => $bidAmount,
                    'bidder_name' => fake()->name(),
                    'bidder_city' => fake()->randomElement(['Vilnius', 'Kaunas', 'Klaipėda', 'Šiauliai', 'Panevėžys', 'Alytus', 'Marijampolė']),
                    'created_at' => now()->subHours(10 - $i),
                ]);
            }
        }
    }
}
