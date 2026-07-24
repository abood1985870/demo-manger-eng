<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class UserTyping implements ShouldQueue
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public int $userId;
    public ?string $channelId;
    public ?string $conversationId;

    public function __construct(int $userId, ?string $channelId, ?string $conversationId)
    {
        $this->userId = $userId;
        $this->channelId = $channelId;
        $this->conversationId = $conversationId;
    }
}
