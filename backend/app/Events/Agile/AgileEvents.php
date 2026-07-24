<?php

namespace App\Events\Agile;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AgileBoardCreated
{
    use Dispatchable, SerializesModels;
    public function __construct(public readonly string $boardId) {}
}

class WorkItemMoved
{
    use Dispatchable, SerializesModels;
    public function __construct(
        public readonly string $taskId,
        public readonly string $targetColumnId
    ) {}
}

class WorkItemRankChanged
{
    use Dispatchable, SerializesModels;
    public function __construct(
        public readonly string $taskId,
        public readonly string $newRank
    ) {}
}

class SprintStarted
{
    use Dispatchable, SerializesModels;
    public function __construct(public readonly string $sprintId) {}
}

class SprintCompleted
{
    use Dispatchable, SerializesModels;
    public function __construct(
        public readonly string $sprintId,
        public readonly float  $completedPoints
    ) {}
}

class SprintScopeChanged
{
    use Dispatchable, SerializesModels;
    public function __construct(
        public readonly string $sprintId,
        public readonly string $taskId,
        public readonly string $changeType
    ) {}
}

class WipLimitExceeded
{
    use Dispatchable, SerializesModels;
    public function __construct(
        public readonly string $columnId,
        public readonly int    $limit,
        public readonly int    $current
    ) {}
}

class WorkItemBlocked
{
    use Dispatchable, SerializesModels;
    public function __construct(
        public readonly string $taskId,
        public readonly string $reason
    ) {}
}

class VelocityCalculated
{
    use Dispatchable, SerializesModels;
    public function __construct(
        public readonly string $boardId,
        public readonly float  $rollingVelocity
    ) {}
}

class ReleaseForecastChanged
{
    use Dispatchable, SerializesModels;
    public function __construct(
        public readonly string $releaseId,
        public readonly string $newForecastDate
    ) {}
}
