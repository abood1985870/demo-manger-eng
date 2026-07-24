<?php

namespace App\Http\Controllers\Legal;

use App\Guards\EntitlementGuard;
use App\Http\Controllers\Controller;
use App\Models\Legal\LegalMatter;
use App\Services\Legal\EthicalWallGuard;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LegalMatterController extends Controller
{
    public function __construct(
        protected EntitlementGuard $entitlementGuard,
        protected EthicalWallGuard $ethicalWallGuard
    ) {}

    public function show(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->user()->tenant_id ?? 'default';
        
        // 1. Check Module Entitlement (Is the Legal Edition purchased/active?)
        $this->entitlementGuard->enforce($tenantId, 'legal.matters.view');

        // 2. Fetch the Matter
        $matter = LegalMatter::with(['client', 'project'])->where('id', $id)->firstOrFail();

        // 3. ENFORCE ETHICAL WALL (Crucial security step)
        // This explicitly prevents restricted users from discovering or viewing the matter
        $this->ethicalWallGuard->enforce($request->user(), $matter->id, $matter->legal_client_id);

        return response()->json([
            'matter' => $matter
        ]);
    }
}
