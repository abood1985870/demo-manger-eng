<?php

namespace App\Http\Controllers;

use App\Services\ChatService;
use App\DTOs\SendMessageDTO;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    protected ChatService $chatService;

    public function __construct(ChatService $chatService)
    {
        $this->chatService = $chatService;
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'content' => 'required|string',
            'channel_id' => 'nullable|uuid',
            'conversation_id' => 'nullable|uuid',
            'parent_id' => 'nullable|uuid',
            'message_type' => 'nullable|string'
        ]);

        $dto = new SendMessageDTO(
            content: $validated['content'],
            messageType: $validated['message_type'] ?? 'text',
            channelId: $validated['channel_id'] ?? null,
            conversationId: $validated['conversation_id'] ?? null,
            parentId: $validated['parent_id'] ?? null
        );

        $userId = $request->user()->id ?? 1;

        $message = $this->chatService->sendMessage($dto, $userId);
        return response()->json($message, 201);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'content' => 'required|string',
        ]);
        
        $userId = $request->user()->id ?? 1;

        $message = $this->chatService->editMessage($id, $validated['content'], $userId);
        return response()->json($message);
    }
}
