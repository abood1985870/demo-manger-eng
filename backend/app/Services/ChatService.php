<?php

namespace App\Services;

use App\Models\Message;
use App\DTOs\SendMessageDTO;
use App\Events\MessageSent;
use Illuminate\Support\Facades\DB;

class ChatService
{
    public function sendMessage(SendMessageDTO $dto, int $userId)
    {
        return DB::transaction(function () use ($dto, $userId) {
            
            // Check permissions here if channel or conversation exists and user is member...

            $message = Message::create([
                'sender_id' => $userId,
                'channel_id' => $dto->channelId,
                'conversation_id' => $dto->conversationId,
                'parent_id' => $dto->parentId,
                'message_type' => $dto->messageType,
                'content' => $dto->content,
            ]);

            // Handle Thread Reply Count Increment
            if ($dto->parentId) {
                $parentMessage = Message::find($dto->parentId);
                if ($parentMessage) {
                    $parentMessage->increment('reply_count');
                }
            }

            // Handle Mentions mapping
            if (!empty($dto->mentions)) {
                // Parse mentions and create message_mentions records
            }

            // Fire queueable event
            event(new MessageSent($message));

            return $message;
        });
    }

    public function editMessage(string $messageId, string $newContent, int $userId)
    {
        $message = Message::findOrFail($messageId);
        if ($message->sender_id !== $userId) {
            throw new \Exception("Unauthorized");
        }

        $message->content = $newContent;
        $message->is_edited = true;
        $message->save();

        return $message;
    }

    // Other methods: markAsRead, addReaction...
}
