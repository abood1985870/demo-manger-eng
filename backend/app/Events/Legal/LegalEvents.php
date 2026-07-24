<?php

namespace App\Events\Legal;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ConflictConfirmed
{
    use Dispatchable, SerializesModels;
    public function __construct(public readonly string $conflictDecisionId) {}
}

class EthicalWallActivated
{
    use Dispatchable, SerializesModels;
    public function __construct(public readonly string $ethicalWallId) {}
}

class MatterAccessRevoked
{
    use Dispatchable, SerializesModels;
    public function __construct(public readonly string $matterId, public readonly string $userId) {}
}

class LegalClientApproved
{
    use Dispatchable, SerializesModels;
    public function __construct(public readonly string $legalClientId) {}
}
