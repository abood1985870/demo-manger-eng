<?php

namespace App\Http\Controllers\GRC;

use App\Guards\EntitlementGuard;
use App\Http\Controllers\Controller;
use App\Services\GRC\ComplianceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ComplianceController extends Controller
{
    public function __construct(
        protected EntitlementGuard $entitlementGuard,
        protected ComplianceService $complianceService
    ) {}

    public function approveControlTest(Request $request, string $testId): JsonResponse
    {
        $tenantId = $request->user()->tenant_id ?? 'default';
        $this->entitlementGuard->enforce($tenantId, 'controls.approve_results');

        $test = $this->complianceService->approveControlTest($testId, $request->user()->id);

        return response()->json([
            'message' => 'Control test approved and effectiveness synced.',
            'test' => $test
        ]);
    }
}
