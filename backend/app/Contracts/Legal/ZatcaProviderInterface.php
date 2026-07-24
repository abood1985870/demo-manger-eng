<?php

namespace App\Contracts\Legal;

use App\Models\Legal\LegalInvoice;
use App\Models\Legal\LegalEInvoiceDocument;

interface ZatcaProviderInterface
{
    /**
     * Generate the structured payload (XML) based on ZATCA Phase 2 specifications.
     * This does not sign or submit the payload.
     */
    public function generateStructuredPayload(LegalInvoice $invoice): array;

    /**
     * Apply cryptographic signature and generate canonical hash.
     * NEVER store the private key in source code. The provider handles KMS/HSM integration.
     */
    public function signDocument(array $structuredPayload): string;

    /**
     * Generate the Base64 TLV encoded QR Code string as per ZATCA rules.
     */
    public function generateQrPayload(LegalInvoice $invoice, string $signature): string;

    /**
     * Submit (Clearance for B2B, Reporting for B2C) to ZATCA API.
     * Returns a response array that updates the LegalEInvoiceDocument.
     */
    public function submitInvoice(LegalEInvoiceDocument $document): array;
}
