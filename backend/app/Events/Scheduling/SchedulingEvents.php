<?php

namespace App\Events\Scheduling;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

// Published when a schedule is first created
class ScheduleCreated
{
    use Dispatchable, SerializesModels;
    public function __construct(
        public readonly string $scheduleId,
        public readonly string $tenantId,
        public readonly int    $createdBy,
    ) {}
}

class ScheduleUpdated
{
    use Dispatchable, SerializesModels;
    public function __construct(
        public readonly string $scheduleId,
        public readonly string $tenantId,
        public readonly array  $changedFields,
    ) {}
}

// Dispatched by controller; picked up by ScheduleCalculationJob
class ScheduleCalculationRequested
{
    use Dispatchable, SerializesModels;
    public function __construct(
        public readonly string $calculationId,
        public readonly string $scheduleId,
        public readonly string $tenantId,
    ) {}
}

class ScheduleCalculated
{
    use Dispatchable, SerializesModels;
    public function __construct(
        public readonly string $scheduleId,
        public readonly string $calculationId,
        public readonly int    $itemsProcessed,
    ) {}
}

class ScheduleCalculationFailed
{
    use Dispatchable, SerializesModels;
    public function __construct(
        public readonly string $scheduleId,
        public readonly string $calculationId,
        public readonly string $reason,
    ) {}
}

class DependencyCycleDetected
{
    use Dispatchable, SerializesModels;
    public function __construct(
        public readonly string $scheduleId,
        public readonly string $cyclePath,
    ) {}
}

class CriticalPathChanged
{
    use Dispatchable, SerializesModels;
    public function __construct(
        public readonly string $scheduleId,
        public readonly string $calculationId,
    ) {}
}

class BaselineCreated
{
    use Dispatchable, SerializesModels;
    public function __construct(
        public readonly string $baselineId,
        public readonly string $scheduleId,
        public readonly string $tenantId,
    ) {}
}

class BaselineApproved
{
    use Dispatchable, SerializesModels;
    public function __construct(
        public readonly string $baselineId,
        public readonly string $scheduleId,
        public readonly int    $approvedBy,
    ) {}
}

class BaselineRejected
{
    use Dispatchable, SerializesModels;
    public function __construct(
        public readonly string $baselineId,
        public readonly string $reason,
    ) {}
}

class SnapshotCreated
{
    use Dispatchable, SerializesModels;
    public function __construct(
        public readonly string $snapshotId,
        public readonly string $scheduleId,
    ) {}
}

class ScenarioCreated
{
    use Dispatchable, SerializesModels;
    public function __construct(
        public readonly string $scenarioId,
        public readonly string $scheduleId,
    ) {}
}

class ScenarioApplied
{
    use Dispatchable, SerializesModels;
    public function __construct(
        public readonly string $scenarioId,
        public readonly string $scheduleId,
        public readonly int    $appliedBy,
    ) {}
}

class MilestoneForecastChanged
{
    use Dispatchable, SerializesModels;
    public function __construct(
        public readonly string $scheduleItemId,
        public readonly string $oldForecastDate,
        public readonly string $newForecastDate,
    ) {}
}

class ResourceOverallocationDetected
{
    use Dispatchable, SerializesModels;
    public function __construct(
        public readonly string $scheduleId,
        public readonly array  $overallocatedResources,
    ) {}
}

class ScheduleHealthChanged
{
    use Dispatchable, SerializesModels;
    public function __construct(
        public readonly string $scheduleId,
        public readonly float  $score,
        public readonly string $status,
    ) {}
}

class RecoveryPlanCreated
{
    use Dispatchable, SerializesModels;
    public function __construct(
        public readonly string $recoveryPlanId,
        public readonly string $scheduleId,
    ) {}
}
