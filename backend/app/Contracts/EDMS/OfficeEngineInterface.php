<?php

namespace App\Contracts\EDMS;

interface OfficeEngineInterface
{
    /**
     * Open an editing session for the document.
     */
    public function openSession(string $documentId, int $userId): array;

    /**
     * Callback method used by the external office server (e.g. OnlyOffice) to save changes.
     */
    public function saveCallback(array $payload): bool;

    /**
     * Generates a preview URL/buffer for the document.
     */
    public function generatePreview(string $documentId): string;
}
