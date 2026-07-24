<?php

namespace App\Contracts\Legal;

use App\Models\Legal\LegalContractSignaturePacket;

interface ESignatureProviderInterface
{
    /**
     * Create an envelope containing the document version and signatories.
     * Does not send it yet.
     */
    public function createEnvelope(LegalContractSignaturePacket $packet): array;

    /**
     * Send the signature request to signatories in the defined order.
     */
    public function sendRequest(LegalContractSignaturePacket $packet): bool;

    /**
     * Webhook processor: Validates incoming payload from provider (e.g., DocuSign, Adobe)
     * and updates the packet status.
     */
    public function handleWebhook(array $payload): void;

    /**
     * Retrieves and stores the final cryptographic audit certificate.
     */
    public function fetchAuditCertificate(LegalContractSignaturePacket $packet): string;
}
