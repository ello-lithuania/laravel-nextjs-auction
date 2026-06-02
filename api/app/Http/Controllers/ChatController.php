<?php

namespace App\Http\Controllers;

use App\Events\NewChatMessage;
use App\Models\Auction;
use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    /**
     * Buyer opens (or resumes) a private chat with the auction's seller.
     * POST /auctions/{auction}/conversation
     */
    public function start(Request $request, Auction $auction): JsonResponse
    {
        $user = $request->user();

        if (! $auction->seller_id) {
            return response()->json(['message' => 'Šis aukcionas neturi pardavėjo, su kuriuo galima rašytis.'], 422);
        }

        if ($user->id === $auction->seller_id) {
            return response()->json(['message' => 'Negalite rašyti patys sau – tai jūsų aukcionas.'], 422);
        }

        $conversation = Conversation::firstOrCreate(
            ['auction_id' => $auction->id, 'buyer_id' => $user->id],
            ['seller_id' => $auction->seller_id],
        );

        return response()->json($this->formatConversation($conversation, $user->id));
    }

    /**
     * Seller lists all chat threads opened on one of their auctions.
     * GET /auctions/{auction}/conversations
     */
    public function auctionConversations(Request $request, Auction $auction): JsonResponse
    {
        $user = $request->user();

        if ($user->id !== $auction->seller_id) {
            return response()->json(['message' => 'Neturite teisės matyti šių pokalbių.'], 403);
        }

        $threads = Conversation::where('auction_id', $auction->id)
            ->with(['buyer:id,name', 'seller:id,name'])
            ->withCount('messages')
            ->latest('updated_at')
            ->get()
            ->map(fn (Conversation $c) => [
                'id' => $c->id,
                'counterpart' => ['id' => $c->buyer_id, 'name' => $c->buyer?->name],
                'messages_count' => $c->messages_count,
                'updated_at' => $c->updated_at?->toISOString(),
            ]);

        return response()->json($threads);
    }

    /**
     * A participant loads a conversation with its messages.
     * GET /conversations/{conversation}
     */
    public function show(Request $request, Conversation $conversation): JsonResponse
    {
        $user = $request->user();

        if (! $conversation->hasParticipant($user->id)) {
            return response()->json(['message' => 'Neturite teisės matyti šio pokalbio.'], 403);
        }

        return response()->json($this->formatConversation($conversation, $user->id));
    }

    /**
     * A participant sends a message; it is broadcast to the other party.
     * POST /conversations/{conversation}/messages
     */
    public function send(Request $request, Conversation $conversation): JsonResponse
    {
        $user = $request->user();

        if (! $conversation->hasParticipant($user->id)) {
            return response()->json(['message' => 'Neturite teisės rašyti šiame pokalbyje.'], 403);
        }

        $validated = $request->validate([
            'body' => 'required|string|max:2000',
        ]);

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $user->id,
            'body' => $validated['body'],
        ]);

        // Bump the conversation so it sorts to the top of inboxes.
        $conversation->touch();

        $message->load('sender:id,name');

        // Best-effort realtime delivery; a down websocket must not break sending.
        try {
            NewChatMessage::dispatch($message);
        } catch (\Throwable $e) {
            report($e);
        }

        return response()->json([
            'message' => $this->formatMessage($message, $user->id),
        ], 201);
    }

    /**
     * @return array<string, mixed>
     */
    private function formatConversation(Conversation $conversation, int $userId): array
    {
        $conversation->load(['buyer:id,name', 'seller:id,name', 'messages.sender:id,name']);

        $isSeller = $conversation->seller_id === $userId;
        $counterpart = $isSeller ? $conversation->buyer : $conversation->seller;

        return [
            'id' => $conversation->id,
            'auction_id' => $conversation->auction_id,
            'role' => $isSeller ? 'seller' : 'buyer',
            'counterpart' => [
                'id' => $counterpart?->id,
                'name' => $counterpart?->name,
            ],
            'messages' => $conversation->messages
                ->map(fn (Message $m) => $this->formatMessage($m, $userId))
                ->values(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function formatMessage(Message $message, int $userId): array
    {
        return [
            'id' => $message->id,
            'conversation_id' => $message->conversation_id,
            'sender_id' => $message->sender_id,
            'sender_name' => $message->sender?->name,
            'body' => $message->body,
            'created_at' => $message->created_at?->toISOString(),
            'mine' => $message->sender_id === $userId,
        ];
    }
}
