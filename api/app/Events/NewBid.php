<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewBid implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public int $auctionId;
    public float $currentPrice;
    public int $bidsCount;

    /**
     * @var array<string, mixed> The bid that was just placed.
     */
    public array $bid;

    public ?string $endsAt;
    public bool $extended;

    /**
     * Create a new event instance.
     *
     * @param array<string, mixed> $bid
     */
    public function __construct(int $auctionId, float $currentPrice, int $bidsCount, array $bid, ?string $endsAt = null, bool $extended = false)
    {
        $this->auctionId = $auctionId;
        $this->currentPrice = $currentPrice;
        $this->bidsCount = $bidsCount;
        $this->bid = $bid;
        $this->endsAt = $endsAt;
        $this->extended = $extended;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('auction.' . $this->auctionId),
        ];
    }

    /**
     * The event name the frontend listens for (Echo: `.listen('.new-bid')`).
     */
    public function broadcastAs(): string
    {
        return 'new-bid';
    }

    /**
     * Get the data to broadcast.
     *
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'auctionId' => $this->auctionId,
            'currentPrice' => $this->currentPrice,
            'bidsCount' => $this->bidsCount,
            'bid' => $this->bid,
            'endsAt' => $this->endsAt,
            'extended' => $this->extended,
        ];
    }
}
