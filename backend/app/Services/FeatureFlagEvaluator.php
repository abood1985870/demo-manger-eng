<?php

namespace App\Services;

use App\Models\FeatureFlag;
use Illuminate\Support\Facades\Cache;

class FeatureFlagEvaluator
{
    /**
     * Evaluates a feature flag considering Global and Tenant overrides.
     */
    public function evaluate(string $flagKey, ?string $tenantId = null)
    {
        $cacheKey = "ff_{$flagKey}_tenant_{$tenantId}";
        
        return Cache::remember($cacheKey, 60, function () use ($flagKey, $tenantId) {
            $flag = FeatureFlag::where('key', $flagKey)->with('rules')->first();
            
            if (!$flag || !$flag->is_active) {
                return false; // Fail-closed default or Kill switch active
            }

            // If a tenant context is provided, look for a specific override rule first
            if ($tenantId) {
                $tenantRule = $flag->rules->where('scope', 'Tenant')->where('scope_id', $tenantId)->first();
                if ($tenantRule) {
                    return $this->castValue($tenantRule->value, $flag->type);
                }
            }

            // Fallback to default
            return $this->castValue($flag->default_value, $flag->type);
        });
    }

    protected function castValue($value, $type)
    {
        if ($type === 'boolean') {
            return filter_var($value, FILTER_VALIDATE_BOOLEAN);
        }
        if ($type === 'json') {
            return json_decode($value, true);
        }
        return $value;
    }
}
