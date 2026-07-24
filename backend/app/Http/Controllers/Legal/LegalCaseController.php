<?php

namespace App\Http\Controllers\Legal;

use App\Guards\EntitlementGuard;
use App\Http\Controllers\Controller;
use App\Models\Legal\LegalCase;
use App\Services\Legal\EthicalWallGuard;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LegalCaseController extends Controller
{
    public function __construct(
        protected EntitlementGuard $entitlementGuard,
        protected EthicalWallGuard $ethicalWallGuard
    ) {}

    public function show(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->user()->tenant_id ?? 'default';
        
        // 1. Check Module Entitlement for Litigation Add-on
        $this->entitlementGuard->enforce($tenantId, 'legal.litigation.view');

        // 2. Fetch the Case and linked Matter
        $case = LegalCase::with(['matter.client', 'court', 'hearings'])->where('id', $id)->firstOrFail();

        // 3. ENFORCE ETHICAL WALL via the Parent Matter
        // Any restriction on the Matter trickles down strictly to the Case.
        $this->ethicalWallGuard->enforce($request->user(), $case->legal_matter_id, $case->matter->legal_client_id);

        return response()->json([
            'case' => $case
        ]);
    }
}
