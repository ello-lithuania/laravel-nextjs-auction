<?php

namespace App\Http\Controllers;

use App\Events\NewBid;
use App\Models\Auction;
use App\Models\Bid;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

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
        $user = $request->user();

        // A seller bidding on their own listing (shill bidding) inflates the
        // price artificially — reject it outright.
        if ($auction->seller_id !== null && (int) $auction->seller_id === (int) $user->id) {
            return response()->json(['message' => 'Negalite statyti savo paties aukcione.'], 403);
        }

        // Only validate that an amount is present and numeric here; the real
        // "must beat current price" check happens below under a row lock, where
        // we read the authoritative price. Validating against the price read
        // before the lock would be a TOCTOU race.
        // Upper bound guards against absurd bids and decimal(10,2) overflow; the
        // real "must beat current price" check happens below under the row lock.
        $validated = $request->validate([
            'amount' => 'required|numeric|gt:0|max:99999999.99',
        ]);
        $amount = round((float) $validated['amount'], 2);

        // Serialize concurrent bids on the same auction: lock the row, re-read
        // the current state, re-check the rules, then write — all atomically.
        // Without the lock two requests can both pass the price check on stale
        // data and the higher bid can be silently overwritten by the lower one.
        $bid = DB::transaction(function () use ($auction, $amount, $user) {
            /** @var Auction $locked */
            $locked = Auction::whereKey($auction->getKey())->lockForUpdate()->firstOrFail();

            if ($locked->status !== 'Live') {
                throw ValidationException::withMessages([
                    'amount' => 'Šis aukcionas nebėra aktyvus.',
                ]);
            }

            if ($locked->ends_at !== null && $locked->ends_at->isPast()) {
                throw ValidationException::withMessages([
                    'amount' => 'Aukcionas jau pasibaigė.',
                ]);
            }

            $minimum = round((float) $locked->current_price + 0.01, 2);
            if ($amount < $minimum) {
                throw ValidationException::withMessages([
                    'amount' => 'Statymas turi viršyti dabartinę kainą (min. ' . number_format($minimum, 2) . ').',
                ]);
            }

            $locked->current_price = $amount;
            $locked->bids_count = $locked->bids_count + 1;
            $locked->save();

            // The route is protected by auth:sanctum, so the bidder is the
            // authenticated user — name and city are taken from the token, not
            // the request body, so they can't be spoofed.
            $bid = Bid::create([
                'auction_id' => $locked->id,
                'amount' => $amount,
                'bidder_name' => $user->name,
                'bidder_city' => $user->city,
            ]);

            // Reflect the committed state back onto the model the caller holds.
            $auction->current_price = $locked->current_price;
            $auction->bids_count = $locked->bids_count;

            return $bid;
        });

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
