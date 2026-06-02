<?php

namespace App\Http\Controllers;

use App\Events\NewBid;
use App\Models\Auction;
use App\Models\Bid;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuctionController extends Controller
{
    public function index(): JsonResponse
    {
        $auctions = Auction::orderByDesc('is_featured')
            ->orderBy('ends_at')
            ->limit(16)
            ->get();

        return response()->json($auctions);
    }

    public function show(Auction $auction): JsonResponse
    {
        return response()->json($auction);
    }

    public function bid(Request $request, Auction $auction): JsonResponse
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:' . ($auction->current_price + 0.01),
        ]);

        $auction->current_price = $validated['amount'];
        $auction->bids_count = $auction->bids_count + 1;
        $auction->save();

        // The route is protected by auth:sanctum, so the bidder is the
        // authenticated user — name and city are taken from the token, not the
        // request body, so they can't be spoofed.
        $user = $request->user();
        $bid = Bid::create([
            'auction_id' => $auction->id,
            'amount' => $validated['amount'],
            'bidder_name' => $user->name,
            'bidder_city' => $user->city,
        ]);

        // Broadcast the new bid to everyone watching this auction (Reverb).
        // Best-effort: a down websocket server must not break bidding.
        try {
            NewBid::dispatch($auction->id, $auction->current_price, $auction->bids_count, [
                'id' => $bid->id,
                'amount' => (float) $bid->amount,
                'bidder_name' => $bid->bidder_name,
                'bidder_city' => $bid->bidder_city,
                'created_at' => $bid->created_at?->toISOString(),
            ]);
        } catch (\Throwable $e) {
            report($e);
        }

        return response()->json([
            'message' => 'Bid placed successfully',
            'auction' => $auction,
            'bid' => $bid,
        ]);
    }

    public function bids(Auction $auction): JsonResponse
    {
        // Last 10 bids, newest first.
        $bids = $auction->bids()->latest()->limit(10)->get();
        return response()->json($bids);
    }
}
