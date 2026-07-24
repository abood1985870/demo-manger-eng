<?php

namespace App\Http\Controllers;

use App\Services\ChannelService;
use App\DTOs\CreateChannelDTO;
use Illuminate\Http\Request;

class ChannelController extends Controller
{
    protected ChannelService $channelService;

    public function __construct(ChannelService $channelService)
    {
        $this->channelService = $channelService;
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string',
            'visibility' => 'required|string',
            'description' => 'nullable|string',
        ]);

        $dto = new CreateChannelDTO(
            name: $validated['name'],
            type: $validated['type'],
            visibility: $validated['visibility'],
            description: $validated['description'] ?? null
        );

        $userId = $request->user()->id ?? 1;

        $channel = $this->channelService->createChannel($dto, $userId);
        return response()->json($channel, 201);
    }

    public function archive(Request $request, $id)
    {
        $userId = $request->user()->id ?? 1;
        $channel = $this->channelService->archiveChannel($id, $userId);
        return response()->json($channel);
    }
}
