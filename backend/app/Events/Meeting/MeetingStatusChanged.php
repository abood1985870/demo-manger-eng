<?php

namespace App\Events\Meeting;

use App\Events\BaseSystemEvent;
use App\Models\Meeting;

class MeetingStatusChanged extends BaseSystemEvent
{
    public Meeting $meeting;
    public string $oldStatus;
    public string $newStatus;

    public function __construct(Meeting $meeting, string $oldStatus, string $newStatus)
    {
        $this->meeting = $meeting;
        $this->oldStatus = $oldStatus;
        $this->newStatus = $newStatus;
    }

    public function getEventName(): string
    {
        return 'MeetingStatusChanged';
    }

    public function getModule(): string
    {
        return 'Meetings';
    }

    public function getPayload(): array
    {
        return [
            'meeting_id' => $this->meeting->id,
            'meeting_number' => $this->meeting->meeting_number,
            'old_status' => $this->oldStatus,
            'new_status' => $this->newStatus,
            'organizer_id' => $this->meeting->organizer_id,
        ];
    }
}
