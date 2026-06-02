<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('auctions', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description');
            $table->string('category', 80);
            $table->string('location', 80);
            $table->string('seller_name', 100);
            $table->decimal('starting_price', 10, 2);
            $table->decimal('current_price', 10, 2);
            $table->unsignedTinyInteger('commission_percent')->default(5);
            $table->string('status', 30)->default('Live');
            $table->timestamp('ends_at');
            $table->string('image_url')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->unsignedInteger('bids_count')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('auctions');
    }
};
