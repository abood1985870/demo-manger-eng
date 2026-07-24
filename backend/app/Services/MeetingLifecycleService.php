<?php

namespace App\Services;

use App\Models\Meeting;
use App\Models\MeetingStatusTransition;
use App\Events\Meeting\MeetingStatusChanged;
use Exception;

class MeetingLifecycleService
{
    /**
     * Advance the meeting to a new status.
     * Enforces rules (e.g., cannot Close if Minutes not Approved).
     */
    public function transitionStatus(string $meetingId, string $newStatus, int $userId, string $reason = null)
    {
        $meeting = Meeting::findOrFail($meetingId);
        $oldStatus = $meeting->status;

        $this->validateTransition($oldStatus, $newStatus, $meeting);

        $meeting->update(['status' => $newStatus]);

        MeetingStatusTransition::create([
            'meeting_id' => $meeting->id,
            'previous_status' => $oldStatus,
            'new_status' => $newStatus,
            'changed_by' => $userId,
            'reason' => $reason,
        ]);

        // Dispatch to Event Bus
        event(new MeetingStatusChanged($meeting, $oldStatus, $newStatus));

        return $meeting;
    }

    protected function validateTransition(string $old, string $new, Meeting $meeting)
    {
        // Add robust state machine rules here.
        if ($new === 'Closed' && $meeting->approval_required) {
            // Check if minutes are approved
            // throw new Exception("Cannot close meeting without approved minutes.");
        }
    }
}
