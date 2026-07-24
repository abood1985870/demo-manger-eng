<?php

namespace App\DTOs;

class SendMessageDTO
{
    public function __construct(
        public readonly string $content,
        public readonly string $messageType = 'text',
        public readonly ?string $channelId = null,
        public readonly ?string $conversationId = null,
        public readonly ?string $parentId = null,
        public readonly array $mentions = [],
        public readonly array $attachments = []
    ) {}
}
