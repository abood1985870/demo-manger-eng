<?php

namespace App\Services;

use App\Models\UsageCounter;
use App\Models\SubscriptionPlanLimit;

class LimitEnforcer
{
    /**
     * Reconciles the current usage against the plan limits.
     */
    public function checkLimit(string $tenantId, string $planId, string $limitKey): array
    {
        $limit = SubscriptionPlanLimit::where('plan_id', $planId)->where('limit_key', $limitKey)->first();
        if (!$limit || $limit->hard_limit_value === -1) {
            return ['allowed' => true, 'is_warning' => false];
        }

        // Fix: Concurrency-safe lock for usage counting to prevent race conditions
        $usage = UsageCounter::where('tenant_id', $tenantId)
            ->where('limit_key', $limitKey)
            ->lockForUpdate()
            ->first();

        if (!$usage) {
            $usage = UsageCounter::create([
                'tenant_id' => $tenantId, 
                'limit_key' => $limitKey, 
                'current_value' => 0
            ]);
        }

        $isAllowed = $usage->current_value < $limit->hard_limit_value;
        
        $warningThreshold = ($limit->hard_limit_value * $limit->warning_threshold_percent) / 100;
        $isWarning = $usage->current_value >= $warningThreshold;

        return [
            'allowed' => $isAllowed,
            'is_warning' => $isWarning,
            'current_value' => $usage->current_value,
            'limit' => $limit->hard_limit_value
        ];
    }
}
