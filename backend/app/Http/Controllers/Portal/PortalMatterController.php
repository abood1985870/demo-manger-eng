<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Models\Legal\LegalMatter;
use App\Services\Portal\PortalAccessResolver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PortalMatterController extends Controller
{
    public function __construct(
        protected PortalAccessResolver $accessResolver
    ) {}

    public function show(Request $request, string $id): JsonResponse
    {
        // 1. Authenticate the Portal Account (Assuming 'portal-web' guard)
        $portalAccount = $request->user('portal-web');
        
        if (!$portalAccount) {
            abort(401, 'Unauthenticated portal user.');
        }

        // 2. Strict Deny-By-Default Check
        if (!$this->accessResolver->canAccess($portalAccount, 'legal_matter', $id, 'view')) {
            // Do not leak existence of the matter if they don't have access.
            abort(404, 'Matter not found or access denied.');
        }

        // 3. Fetch the Matter
        // Crucially, we do NOT load internal notes, risks, or financial rates here.
        // We only load explicitly safe relationships.
        $matter = LegalMatter::with(['client', 'cases', 'contracts'])
            ->select(['id', 'matter_number', 'title_en', 'title_ar', 'status', 'description_en', 'created_at'])
            ->where('id', $id)
            ->firstOrFail();

        return response()->json([
            'matter' => $matter
        ]);
    }
}
