<?php

namespace App\Guards;

use App\Services\EntitlementResolver;
use DomainException;

class EntitlementGuard
{
    protected EntitlementResolver $resolver;

    public function __construct(EntitlementResolver $resolver)
    {
        $this->resolver = $resolver;
    }

    /**
     * Call this inside Queue Jobs, Event Handlers, and Domain Services 
     * to strictly enforce entitlements outside HTTP contexts.
     */
    public function enforce(string $tenantId, string $moduleKey): void
    {
        $decision = $this->resolver->evaluateEntitlement($tenantId, $moduleKey);

        if (!$decision['allowed']) {
            throw new DomainException("Domain Guard: Entitlement Denied. Reason: " . $decision['message']);
        }
    }
}
