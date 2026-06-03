<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// SEO tinklaraščio įrašai (naujienos). Turinys rašomas Markdown'u ir saugomas
// DB. Šaltinis seed'inimui — Markdown failai database/data/posts/*.md.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('title');
            $table->string('description'); // SEO meta
            $table->json('keywords')->nullable(); // SEO raktažodžiai
            $table->string('cover')->nullable();
            $table->text('excerpt')->nullable();
            $table->unsignedSmallInteger('read_minutes')->default(5);
            $table->longText('body'); // Markdown
            $table->date('published_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};
