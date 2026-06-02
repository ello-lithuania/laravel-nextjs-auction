<?php

namespace Database\Seeders;

use App\Models\Auction;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AuctionSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        Auction::factory()->count(16)->create();
        Auction::factory()->count(2)->state([
            'is_featured' => true,
            'status' => 'Live',
        ])->create();
    }
}
