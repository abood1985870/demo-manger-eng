<?php

namespace App\DTOs\Notification;

class NotificationPayloadDTO
{
    public function __construct(
        public readonly int $userId,
        public readonly string $subject,
        public readonly string $body,
        public readonly ?string $actionUrl = null,
        public readonly ?string $relatedType = null,
        public readonly ?string $relatedId = null
    ) {}
}
