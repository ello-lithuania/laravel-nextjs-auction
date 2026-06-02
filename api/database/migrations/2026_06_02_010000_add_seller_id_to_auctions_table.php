<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('auctions', function (Blueprint $table) {
            $table->foreignId('seller_id')->nullable()->after('seller_name')
                ->constrained('users')->nullOnDelete();
        });

        // Backfill: existing auctions have no owner. Distribute them across the
        // existing users so private buyer↔seller chats have a real author.
        $userIds = DB::table('users')->orderBy('id')->pluck('id')->all();
        if (! empty($userIds)) {
            $auctions = DB::table('auctions')->orderBy('id')->pluck('id')->all();
            foreach ($auctions as $i => $auctionId) {
                DB::table('auctions')->where('id', $auctionId)
                    ->update(['seller_id' => $userIds[$i % count($userIds)]]);
            }
        }
    }

    public function down(): void
    {
        Schema::table('auctions', function (Blueprint $table) {
            $table->dropForeign(['seller_id']);
            $table->dropColumn('seller_id');
        });
    }
};
