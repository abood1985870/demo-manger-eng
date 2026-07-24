<?php

namespace App\Events\Legal;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class LegalCaseFiled
{
    use Dispatchable, SerializesModels;
    public function __construct(public readonly string $legalCaseId) {}
}

class LegalHearingScheduled
{
    use Dispatchable, SerializesModels;
    public function __construct(public readonly string $legalHearingId) {}
}

class LegalDeadlineCreated
{
    use Dispatchable, SerializesModels;
    public function __construct(public readonly string $legalDeadlineId) {}
}

class LegalJudgmentRecorded
{
    use Dispatchable, SerializesModels;
    public function __construct(public readonly string $legalJudgmentId) {}
}
