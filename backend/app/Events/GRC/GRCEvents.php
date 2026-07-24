<?php

namespace App\Events\GRC;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class RiskAssessed
{
    use Dispatchable, SerializesModels;
    public function __construct(public readonly string $riskId, public readonly string $assessmentId) {}
}

class RiskMaterialized
{
    use Dispatchable, SerializesModels;
    public function __construct(public readonly string $riskId, public readonly string $issueId) {}
}

class ControlTestFailed
{
    use Dispatchable, SerializesModels;
    public function __construct(public readonly string $controlTestId) {}
}

class ChangeRequestApproved
{
    use Dispatchable, SerializesModels;
    public function __construct(public readonly string $changeRequestId) {}
}

class PolicyAcknowledged
{
    use Dispatchable, SerializesModels;
    public function __construct(public readonly string $policyId, public readonly string $userId) {}
}
