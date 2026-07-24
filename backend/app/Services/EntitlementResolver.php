<?php

namespace App\Services;

use App\Models\TenantEntitlement;
use Illuminate\Support\Facades\Cache;

class EntitlementResolver
{
    protected LicenseManagementService $licenseService;
    protected ModuleRegistryService $moduleService;

    public function __construct(
        LicenseManagementService $licenseService, 
        ModuleRegistryService $moduleService
    ) {
        $this->licenseService = $licenseService;
        $this->moduleService = $moduleService;
    }

    /**
     * The Master Gatekeeper Function.
     * Evaluates License -> Module State -> Tenant Specific Entitlements.
     */
    public function evaluateEntitlement(string $tenantId, string $moduleKey): array
    {
        // Fail-safe closed design
        $deny = function ($reason, $code) {
            return ['allowed' => false, 'message' => $reason, 'reason_code' => $code];
        };

        // 1. Check Platform Module Status
        if (!$this->moduleService->isModuleEnabled($moduleKey)) {
            return $deny("Module {$moduleKey} is not installed or globally disabled.", 'MODULE_DISABLED');
        }

        // 2. Check License Validity
        if (!$this->licenseService->validateTenantLicense($tenantId)) {
            return $deny("Tenant license is expired, suspended, or invalid.", 'LICENSE_INVALID');
        }

        // 3. Check Specific Entitlement Rules (Cached for performance)
        $cacheKey = "entitlement_{$tenantId}_{$moduleKey}";
        $isEntitled = Cache::remember($cacheKey, 300, function () use ($tenantId, $moduleKey) {
            // In a real scenario, this joins product_editions, subscription_plans, and tenant_entitlements
            // Here we do a simplified check against direct tenant_entitlements
            return TenantEntitlement::where('tenant_id', $tenantId)
                ->whereHas('module', function ($q) use ($moduleKey) {
                    $q->where('machine_key', $moduleKey);
                })
                ->where('status', 'Active')
                ->where(function ($q) {
                    $q->whereNull('effective_until')->orWhere('effective_until', '>', now());
                })
                ->exists();
        });

        if ($isEntitled) {
            return ['allowed' => true, 'message' => 'Granted by Edition/Plan', 'reason_code' => 'OK'];
        }

        // 4. Check Add-Ons if standard entitlement fails
        $isAddOnEntitled = Cache::remember("addon_{$tenantId}_{$moduleKey}", 300, function () use ($tenantId, $moduleKey) {
            return \App\Models\TenantAddOn::where('tenant_id', $tenantId)
                ->whereHas('addOn.modules', function ($q) use ($moduleKey) {
                    $q->where('machine_key', $moduleKey);
                })
                ->where('status', 'Active')
                ->where(function ($q) {
                    $q->whereNull('effective_until')->orWhere('effective_until', '>', now());
                })
                ->exists();
        });

        if ($isAddOnEntitled) {
            return ['allowed' => true, 'message' => 'Granted by Add-On', 'reason_code' => 'OK'];
        }

        return $deny("Tenant plan or edition does not include this module, and no active Add-On grants it.", 'ENTITLEMENT_MISSING');
    }
}
