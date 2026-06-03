<?php

namespace App\Http\Controllers;

use App\Events\NewBid;
use App\Models\Auction;
use App\Models\Bid;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
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

    /**
     * Paskelbti naują skelbimą (aukcioną). Tik prisijungusiems.
     * POST /api/auctions
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'title' => 'required|string|max:160',
            'description' => 'required|string|max:5000',
            'category' => 'required|string|max:80',
            'subcategory' => 'nullable|string|max:80',
            'location' => 'required|string|max:80',
            'starting_price' => 'required|numeric|min:1|max:9999999.99',
            'duration_days' => 'required|integer|min:1|max:30',
            'images' => 'required|array|min:1|max:6',
            'images.*' => 'image|mimes:jpeg,jpg,png,webp|max:5120', // iki 5 MB
        ]);

        // Įkeliam nuotraukas į „uploads" diską (public/uploads — be symlink) ir
        // surenkam jų viešus URL.
        $gallery = [];
        foreach ($request->file('images', []) as $file) {
            $path = $file->store('auctions', 'uploads');
            $gallery[] = Storage::disk('uploads')->url($path);
        }

        $auction = Auction::create([
            'title' => $validated['title'],
            'slug' => Str::slug($validated['title']) . '-' . Str::lower(Str::random(6)),
            'description' => $validated['description'],
            'category' => $validated['category'],
            'subcategory' => $validated['subcategory'] ?? null,
            'location' => $validated['location'],
            'seller_name' => $user->name,
            'seller_id' => $user->id,
            'starting_price' => $validated['starting_price'],
            'current_price' => $validated['starting_price'],
            'commission_percent' => 0,
            'status' => 'Live',
            'ends_at' => now()->addDays((int) $validated['duration_days']),
            'image_url' => $gallery[0] ?? null,
            'gallery' => $gallery,
            'is_featured' => false,
            'bids_count' => 0,
        ]);

        return response()->json([
            'message' => 'Skelbimas paskelbtas!',
            'auction' => $auction,
        ], 201);
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
        // Anti-snipe: jei statoma paskutinėmis sekundėmis, laikas pratęsiamas.
        $extendWindow = 15; // sek.
        $extended = false;

        $bid = DB::transaction(function () use ($auction, $amount, $user, $extendWindow, &$extended) {
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

            // Anti-snipe: jei iki pabaigos liko <= $extendWindow sek., pratęsiam,
            // kad niekas nelaimėtų vien dėl greitesnio interneto paskutinę akimirką.
            if ($locked->ends_at !== null) {
                $remaining = $locked->ends_at->getTimestamp() - now()->getTimestamp();
                if ($remaining >= 0 && $remaining <= $extendWindow) {
                    $locked->ends_at = now()->addSeconds($extendWindow);
                    $extended = true;
                }
            }

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
            $auction->ends_at = $locked->ends_at;

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
            ], $auction->ends_at?->toISOString(), $extended);
        } catch (\Throwable $e) {
            report($e);
        }

        return response()->json([
            'message' => 'Bid placed successfully',
            'auction' => $auction,
            'bid' => $bid,
            'extended' => $extended,
        ]);
    }

    public function bids(Auction $auction): JsonResponse
    {
        // Last 10 bids, newest first.
        $bids = $auction->bids()->latest()->limit(10)->get();
        return response()->json($bids);
    }
}
