<?php

namespace App\Services;

use App\Models\Task;

class MeetingActionItemService
{
    /**
     * Converts a Meeting Action Item concept into a tangible system Task.
     * Reuses the Task architecture (Step 4).
     */
    public function createActionItemTask(string $meetingId, array $taskData)
    {
        // In a real application, this would call TaskService->createTask()
        // Here we just emulate creating a Task linked to the meeting.
        
        $taskData['meeting_id'] = $meetingId;
        
        // This relies on the 'tasks' table updated in the migrations
        return Task::create($taskData);
    }
}
