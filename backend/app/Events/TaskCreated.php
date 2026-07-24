<?php

namespace App\Events;

use App\Models\Task;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TaskCreated
{
    use Dispatchable, SerializesModels;

    public Task $task;
    public int $userId;

    public function __construct(Task $task, int $userId)
    {
        $this->task = $task;
        $this->userId = $userId;
    }
}
