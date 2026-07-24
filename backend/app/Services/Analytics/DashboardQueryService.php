<?php

namespace App\Services\Analytics;

use App\Guards\EntitlementGuard;
use App\Models\Analytics\Dashboard;
use Illuminate\Support\Facades\Cache;

class DashboardQueryService
{
    protected EntitlementGuard $entitlementGuard;

    public function __construct(EntitlementGuard $entitlementGuard)
    {
        $this->entitlementGuard = $entitlementGuard;
    }

    /**
     * Fetches a dashboard strictly isolating by Tenant and checking RBAC/Visibility.
     */
    public function getDashboard(string $dashboardId, string $tenantId, int $userId, array $filters = []): Dashboard
    {
        // Ensure tenant is authorized for Advanced Analytics module
        $this->entitlementGuard->enforce($tenantId, 'analytics.advanced');

        // Cache key must include filters and user scope to prevent leakage
        $filterHash = md5(json_encode($filters));
        $cacheKey = "dashboard_{$dashboardId}_tenant_{$tenantId}_user_{$userId}_filters_{$filterHash}";

        return Cache::remember($cacheKey, 300, function () use ($dashboardId, $tenantId, $userId) {
            $dashboard = Dashboard::with('widgets')->where('id', $dashboardId)->where('tenant_id', $tenantId)->firstOrFail();

            if ($dashboard->visibility === 'Private' && $dashboard->owner_id !== $userId) {
                throw new \DomainException("Unauthorized: This is a private dashboard.");
            }

            return $dashboard;
        });
    }
}
