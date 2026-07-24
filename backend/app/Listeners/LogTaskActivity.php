<?php

namespace App\Listeners;

use App\Events\TaskCreated;
use App\Events\TaskStatusChanged;
use Illuminate\Support\Facades\DB;

class LogTaskActivity
{
    public function handleTaskCreated(TaskCreated $event)
    {
        DB::table('task_activity_logs')->insert([
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'task_id' => $event->task->id,
            'user_id' => $event->userId,
            'action' => 'created',
            'old_value' => null,
            'new_value' => json_encode(['title' => $event->task->title]),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function handleTaskStatusChanged(TaskStatusChanged $event)
    {
        DB::table('task_activity_logs')->insert([
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'task_id' => $event->task->id,
            'user_id' => $event->userId,
            'action' => 'status_changed',
            'old_value' => json_encode(['status_id' => $event->oldStatusId]),
            'new_value' => json_encode(['status_id' => $event->newStatusId]),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Register the listeners for the subscriber.
     */
    public function subscribe($events)
    {
        return [
            TaskCreated::class => 'handleTaskCreated',
            TaskStatusChanged::class => 'handleTaskStatusChanged',
        ];
    }
}
