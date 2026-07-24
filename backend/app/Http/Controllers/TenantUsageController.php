<?php

namespace App\Http\Controllers;

use App\Services\LimitEnforcer;
use Illuminate\Http\Request;

class TenantUsageController extends Controller
{
    protected LimitEnforcer $limitEnforcer;

    public function __construct(LimitEnforcer $limitEnforcer)
    {
        $this->limitEnforcer = $limitEnforcer;
    }

    public function checkLimit(Request $request, string $limitKey)
    {
        $tenantId = $request->user()->tenant_id ?? 'default-tenant-id';
        $planId = $request->query('plan_id', 'default-plan-id');

        $result = $this->limitEnforcer->checkLimit($tenantId, $planId, $limitKey);

        return response()->json($result);
    }
}
