<?php

namespace App\Contracts\EDMS;

interface DlpScannerInterface
{
    /**
     * Scan the document for sensitive data patterns.
     * Returns true if violations are found.
     */
    public function scanForSensitiveData(string $filePath): bool;

    /**
     * Blocks access or quarantines the file if violations exist.
     */
    public function quarantineFile(string $documentId): void;
}
