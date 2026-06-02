<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Bid extends Model
{
    protected $fillable = ['auction_id', 'amount', 'bidder_name', 'bidder_city'];

    public function auction()
    {
        return $this->belongsTo(Auction::class);
    }
}
