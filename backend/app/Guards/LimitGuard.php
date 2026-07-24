<?php

namespace App\Guards;

use App\Services\LimitEnforcer;
use DomainException;

class LimitGuard
{
    protected LimitEnforcer $enforcer;

    public function __construct(LimitEnforcer $enforcer)
    {
        $this->enforcer = $enforcer;
    }

    /**
     * Enforces a hard limit check. Throws exception if exceeded.
     */
    public function enforce(string $tenantId, string $planId, string $limitKey): void
    {
        $result = $this->enforcer->checkLimit($tenantId, $planId, $limitKey);

        if (!$result['allowed']) {
            throw new DomainException("Domain Guard: Usage limit exceeded for key [{$limitKey}]. Current: {$result['current_value']}, Limit: {$result['limit']}");
        }
    }
}
