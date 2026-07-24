<?php

namespace App\Events;

use App\Models\Task;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TaskStatusChanged
{
    use Dispatchable, SerializesModels;

    public Task $task;
    public string $oldStatusId;
    public string $newStatusId;
    public int $userId;

    public function __construct(Task $task, string $oldStatusId, string $newStatusId, int $userId)
    {
        $this->task = $task;
        $this->oldStatusId = $oldStatusId;
        $this->newStatusId = $newStatusId;
        $this->userId = $userId;
    }
}
