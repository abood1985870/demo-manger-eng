<?php

namespace App\Http\Controllers\Legal;

use App\Guards\EntitlementGuard;
use App\Http\Controllers\Controller;
use App\Models\Legal\LegalInvoice;
use App\Models\Legal\LegalClient;
use App\Services\Legal\EthicalWallGuard;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class LegalInvoiceController extends Controller
{
    public function __construct(
        protected EntitlementGuard $entitlementGuard,
        protected EthicalWallGuard $ethicalWallGuard
    ) {}

    public function index(Request $request): JsonResponse
    {
        $tenantId = $request->user()->tenant_id ?? 'default';
        $this->entitlementGuard->enforce($tenantId, 'legal.billing.view');

        $invoices = LegalInvoice::with(['matter', 'case', 'client'])
            ->where('tenant_id', $tenantId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($invoices);
    }

    public function store(Request $request): JsonResponse
    {
        $tenantId = $request->user()->tenant_id ?? 'default';
        $this->entitlementGuard->enforce($tenantId, 'legal.billing.create');

        $validated = $request->validate([
            'recipient_type' => 'required|in:REGISTERED,EXTERNAL',
            'client_id' => 'required_if:recipient_type,REGISTERED|nullable|uuid',
            'legal_case_id' => 'nullable|uuid',
            'external_client_name' => 'required_if:recipient_type,EXTERNAL|nullable|string',
            'external_client_email' => 'nullable|email',
            'external_client_phone' => 'nullable|string',
            'external_client_address' => 'nullable|string',
            'external_client_tax_number' => 'nullable|string',
            'save_external_as_client' => 'boolean|nullable',
            // Invoice generic details
            'total_fees' => 'required|numeric',
            'total_expenses' => 'required|numeric',
            'total_tax' => 'required|numeric',
            'grand_total' => 'required|numeric',
            'currency' => 'required|string',
            'invoice_date' => 'required|date',
        ]);

        $invoiceData = [
            'tenant_id' => $tenantId,
            'recipient_type' => $validated['recipient_type'],
            'legal_case_id' => $validated['legal_case_id'] ?? null,
            'invoice_number' => 'INV-' . strtoupper(Str::random(6)),
            'invoice_date' => $validated['invoice_date'],
            'currency' => $validated['currency'],
            'total_fees' => $validated['total_fees'],
            'total_expenses' => $validated['total_expenses'],
            'total_tax' => $validated['total_tax'],
            'grand_total' => $validated['grand_total'],
            'amount_due' => $validated['grand_total'],
            'status' => 'DRAFT',
        ];

        if ($validated['recipient_type'] === 'REGISTERED') {
            $client = LegalClient::where('tenant_id', $tenantId)->findOrFail($validated['client_id']);
            $invoiceData['client_id'] = $client->id;
            
            // Assuming LegalClient has relationships or fields for these, we will take a snapshot. 
            // In a real system, the client might be linked to a Party model to get name/email.
            // For now, we will save the snapshot using request data or mock from client if not available.
            $invoiceData['recipient_name'] = $request->input('snapshot_name', 'Client Name');
            $invoiceData['recipient_email'] = $request->input('snapshot_email');
            $invoiceData['recipient_phone'] = $request->input('snapshot_phone');
            $invoiceData['recipient_address'] = $request->input('snapshot_address');
            $invoiceData['recipient_tax_number'] = $request->input('snapshot_tax_number');
        } else {
            $invoiceData['external_client_name'] = $validated['external_client_name'];
            $invoiceData['external_client_email'] = $validated['external_client_email'] ?? null;
            $invoiceData['external_client_phone'] = $validated['external_client_phone'] ?? null;
            $invoiceData['external_client_address'] = $validated['external_client_address'] ?? null;
            $invoiceData['external_client_tax_number'] = $validated['external_client_tax_number'] ?? null;
            
            $invoiceData['recipient_name'] = $validated['external_client_name'];
            $invoiceData['recipient_email'] = $validated['external_client_email'] ?? null;
            $invoiceData['recipient_phone'] = $validated['external_client_phone'] ?? null;
            $invoiceData['recipient_address'] = $validated['external_client_address'] ?? null;
            $invoiceData['recipient_tax_number'] = $validated['external_client_tax_number'] ?? null;

            if ($validated['save_external_as_client'] ?? false) {
                $newClient = LegalClient::create([
                    'tenant_id' => $tenantId,
                    'client_number' => 'CLI-' . strtoupper(Str::random(6)),
                    'party_type' => 'App\Models\Party', // Example
                    'party_id' => Str::uuid(), // In a full implementation, create a Party first
                    'client_type' => 'INDIVIDUAL',
                    'status' => 'ACTIVE'
                ]);
                $invoiceData['client_id'] = $newClient->id;
                // Don't change recipient_type to keep the history of how it was created
            }
        }

        $invoice = LegalInvoice::create($invoiceData);

        return response()->json(['invoice' => $invoice], 201);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->user()->tenant_id ?? 'default';
        $this->entitlementGuard->enforce($tenantId, 'legal.billing.view');

        $invoice = LegalInvoice::with(['matter.client', 'case', 'client'])->where('id', $id)->firstOrFail();

        // Optional: ETHICAL WALL ENFORCEMENT logic here.
        // $this->ethicalWallGuard->enforce($request->user(), $invoice->legal_matter_id, $invoice->client_id);

        return response()->json(['invoice' => $invoice]);
    }
}
