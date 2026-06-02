<?php

use App\Http\Controllers\AuctionController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ChatController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Route;

// Public (read-only) endpoints — generous shared limit to absorb browsing.
Route::middleware('throttle:public')->group(function () {
    Route::get('/auctions', [AuctionController::class, 'index']);
    Route::get('/auctions/{auction}/bids', [AuctionController::class, 'bids']);
    Route::get('/auctions/{auction}', [AuctionController::class, 'show']);
});

// Auth endpoints — tight limit to slow brute-force / credential stuffing and
// throttled by email+IP (see AppServiceProvider) so one attacker can't lock
// out a victim by guessing their address.
Route::middleware('throttle:auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

// Authenticated (Sanctum token)
Route::middleware(['auth:sanctum', 'throttle:authenticated'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/auctions/{auction}/bid', [AuctionController::class, 'bid']);
    Route::get('/user', fn (Request $request) => $request->user());

    // Private 1:1 chat between a buyer and the auction's seller.
    Route::post('/auctions/{auction}/conversation', [ChatController::class, 'start']);
    Route::get('/auctions/{auction}/conversations', [ChatController::class, 'auctionConversations']);
    Route::get('/conversations/{conversation}', [ChatController::class, 'show']);
    Route::post('/conversations/{conversation}/messages', [ChatController::class, 'send']);

    // Broadcasting auth for private channels, authenticated via the Sanctum
    // bearer token (the default web-session endpoint won't work for the SPA).
    Route::post('/broadcasting/auth', fn (Request $request) => Broadcast::auth($request));
});
