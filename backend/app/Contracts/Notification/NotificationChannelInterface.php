<?php

namespace App\Contracts\Notification;

use App\DTOs\Notification\NotificationPayloadDTO;

interface NotificationChannelInterface
{
    /**
     * Send a notification via this specific channel.
     * 
     * @param NotificationPayloadDTO $payload The constructed message data
     * @return string|null External reference ID (e.g., Mailgun ID) if applicable
     */
    public function send(NotificationPayloadDTO $payload): ?string;
}
