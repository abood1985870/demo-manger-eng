<?php

namespace App\Services;

use App\Models\Channel;
use App\DTOs\CreateChannelDTO;
use Illuminate\Support\Facades\DB;
use Exception;

class ChannelService
{
    public function createChannel(CreateChannelDTO $dto, int $userId)
    {
        return DB::transaction(function () use ($dto, $userId) {
            $channel = Channel::create([
                'name' => $dto->name,
                'description' => $dto->description,
                'type' => $dto->type,
                'visibility' => $dto->visibility,
                'project_id' => $dto->projectId,
                'department_id' => $dto->departmentId,
                'team_id' => $dto->teamId,
                'owner_id' => $userId,
                'created_by' => $userId,
            ]);

            // Add creator as admin
            $channel->members()->attach($userId, ['role' => 'admin']);

            return $channel;
        });
    }

    public function archiveChannel(string $channelId, int $userId)
    {
        $channel = Channel::findOrFail($channelId);
        
        // RBAC: Verify if user is owner or admin
        $member = $channel->members()->where('user_id', $userId)->first();
        if (!$member || ($member->pivot->role !== 'admin' && $channel->owner_id !== $userId)) {
            throw new Exception("Unauthorized to archive this channel");
        }

        $channel->is_archived = true;
        $channel->save();

        return $channel;
    }

    public function addMember(string $channelId, int $userId, int $adderId)
    {
        // Implementation for RBAC checking and adding a member
    }

    // Additional methods: deleteChannel, removeMember, muteMember...
}
