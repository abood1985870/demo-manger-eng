<?php

namespace App\Services;

use App\Models\Resource;
use App\Models\MeetingRoom;
use App\Models\Equipment;

class ResourceManagementService
{
    /**
     * Create a Meeting Room and link it to the central Resource registry.
     */
    public function createMeetingRoom(array $data)
    {
        $room = MeetingRoom::create($data);

        $resource = Resource::create([
            'name' => $room->name,
            'resourceable_type' => MeetingRoom::class,
            'resourceable_id' => $room->id,
            'capacity' => $room->capacity,
        ]);

        return ['room' => $room, 'resource' => $resource];
    }

    /**
     * Create Equipment and link it to the central Resource registry.
     */
    public function createEquipment(array $data)
    {
        $equipment = Equipment::create($data);

        $resource = Resource::create([
            'name' => $equipment->name,
            'resourceable_type' => Equipment::class,
            'resourceable_id' => $equipment->id,
            'capacity' => 1,
        ]);

        return ['equipment' => $equipment, 'resource' => $resource];
    }
}
