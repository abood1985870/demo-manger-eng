<?php

namespace App\Http\Controllers\Finance;

use App\Guards\EntitlementGuard;
use App\Http\Controllers\Controller;
use App\Services\Finance\BudgetControlService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BudgetController extends Controller
{
    public function __construct(
        protected EntitlementGuard $entitlementGuard,
        protected BudgetControlService $budgetService
    ) {}

    public function reserveFunds(Request $request): JsonResponse
    {
        $tenantId = $request->user()->tenant_id ?? 'default';
        $this->entitlementGuard->enforce($tenantId, 'finance.manage');

        $validated = $request->validate([
            'budget_line_id' => 'required|uuid',
            'amount' => 'required|numeric|min:0.01',
            'source_type' => 'required|string',
            'source_id' => 'required|uuid',
        ]);

        $reservation = $this->budgetService->reserveFunds(
            $validated['budget_line_id'],
            $validated['amount'],
            $validated['source_type'],
            $validated['source_id']
        );

        return response()->json([
            'message' => 'Funds reserved successfully.',
            'reservation' => $reservation
        ]);
    }
}
