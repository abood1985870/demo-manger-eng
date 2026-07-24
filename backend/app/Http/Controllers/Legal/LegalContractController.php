<?php

namespace App\Http\Controllers\Legal;

use App\Guards\EntitlementGuard;
use App\Http\Controllers\Controller;
use App\Models\Legal\LegalContract;
use App\Services\Legal\EthicalWallGuard;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LegalContractController extends Controller
{
    public function __construct(
        protected EntitlementGuard $entitlementGuard,
        protected EthicalWallGuard $ethicalWallGuard
    ) {}

    public function show(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->user()->tenant_id ?? 'default';
        
        // 1. Check Module Entitlement for Legal CLM
        $this->entitlementGuard->enforce($tenantId, 'legal.contracts.view');

        // 2. Fetch the Contract and linked Matter
        $contract = LegalContract::with(['matter.client', 'drafts', 'parties'])->where('id', $id)->firstOrFail();

        // 3. STRICT ETHICAL WALL ENFORCEMENT
        // If the user is walled off from the Matter, they cannot see the Contract.
        $this->ethicalWallGuard->enforce($request->user(), $contract->legal_matter_id, $contract->matter->legal_client_id);

        return response()->json([
            'contract' => $contract
        ]);
    }
}
