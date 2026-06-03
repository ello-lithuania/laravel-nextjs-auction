<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    protected $fillable = [
        'slug',
        'title',
        'description',
        'keywords',
        'cover',
        'excerpt',
        'read_minutes',
        'body',
        'published_at',
    ];

    protected function casts(): array
    {
        return [
            'keywords' => 'array',
            'published_at' => 'date',
        ];
    }
}
