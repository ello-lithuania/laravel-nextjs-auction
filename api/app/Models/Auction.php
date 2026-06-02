<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Auction extends Model
{
    use HasFactory;

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    protected $fillable = [
        'title',
        'slug',
        'description',
        'category',
        'location',
        'seller_name',
        'seller_id',
        'starting_price',
        'current_price',
        'commission_percent',
        'status',
        'ends_at',
        'image_url',
        'gallery',
        'is_featured',
        'bids_count',
    ];

    protected $casts = [
        'ends_at' => 'datetime',
        'is_featured' => 'boolean',
        'gallery' => 'array',
        'starting_price' => 'decimal:2',
        'current_price' => 'decimal:2',
        'commission_percent' => 'integer',
        'bids_count' => 'integer',
    ];

    public function bids()
    {
        return $this->hasMany(Bid::class)->latest();
    }

    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }
}
