<?php

namespace App\Events\Time;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TimerStarted
{
    use Dispatchable, SerializesModels;
    public function __construct(public readonly string $timerId) {}
}

class TimerStopped
{
    use Dispatchable, SerializesModels;
    public function __construct(public readonly string $timerId, public readonly string $timeEntryId) {}
}

class TimeEntryCreated
{
    use Dispatchable, SerializesModels;
    public function __construct(public readonly string $timeEntryId) {}
}

class TimesheetSubmitted
{
    use Dispatchable, SerializesModels;
    public function __construct(public readonly string $timesheetId) {}
}

class TimesheetApproved
{
    use Dispatchable, SerializesModels;
    public function __construct(public readonly string $timesheetId) {}
}

class TimeBudgetThresholdReached
{
    use Dispatchable, SerializesModels;
    public function __construct(public readonly string $budgetId, public readonly float $consumedPercentage) {}
}

class MissingTimeDetected
{
    use Dispatchable, SerializesModels;
    public function __construct(public readonly string $userId, public readonly string $periodId) {}
}

class ComplianceViolationDetected
{
    use Dispatchable, SerializesModels;
    public function __construct(public readonly string $userId, public readonly string $rule) {}
}
