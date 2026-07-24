<?php

namespace App\Http\Controllers\Legal;

use App\Guards\EntitlementGuard;
use App\Http\Controllers\Controller;
use App\Models\Legal\LegalInvoice;
use App\Services\Legal\EthicalWallGuard;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LegalInvoiceController extends Controller
{
    public function __construct(
        protected EntitlementGuard $entitlementGuard,
        protected EthicalWallGuard $ethicalWallGuard
    ) {}

    public function show(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->user()->tenant_id ?? 'default';
        
        // 1. Check Module Entitlement for Legal Billing
        $this->entitlementGuard->enforce($tenantId, 'legal.billing.view');

        // 2. Fetch the Invoice and linked Matter
        $invoice = LegalInvoice::with(['matter.client'])->where('id', $id)->firstOrFail();

        // 3. STRICT ETHICAL WALL ENFORCEMENT
        // If the user is walled off from the Matter, they cannot see the Invoice.
        $this->ethicalWallGuard->enforce($request->user(), $invoice->legal_matter_id, $invoice->matter->legal_client_id);

        return response()->json([
            'invoice' => $invoice
        ]);
    }
}
