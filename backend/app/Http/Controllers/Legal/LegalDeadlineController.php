<?php

namespace App\Http\Controllers\Legal;

use App\Guards\EntitlementGuard;
use App\Http\Controllers\Controller;
use App\Models\Legal\LegalDeadline;
use App\Services\Legal\EthicalWallGuard;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LegalDeadlineController extends Controller
{
    public function __construct(
        protected EntitlementGuard $entitlementGuard,
        protected EthicalWallGuard $ethicalWallGuard
    ) {}

    public function index(Request $request, string $caseId): JsonResponse
    {
        $tenantId = $request->user()->tenant_id ?? 'default';
        $this->entitlementGuard->enforce($tenantId, 'legal.litigation.view');

        // Fetch deadlines for a specific case
        $deadlines = LegalDeadline::with(['deadlineType'])->where('legal_case_id', $caseId)->get();

        if ($deadlines->isEmpty()) {
            return response()->json(['deadlines' => []]);
        }
        
        // Enforce Ethical Wall based on the first deadline's case->matter
        // (In a real scenario, we'd query the matter ID directly)
        $matterId = $deadlines->first()->case->legal_matter_id;
        $this->ethicalWallGuard->enforce($request->user(), $matterId, null);

        return response()->json([
            'deadlines' => $deadlines
        ]);
    }
}
