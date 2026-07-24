<?php

namespace App\Contracts\EDMS;

interface OcrEngineInterface
{
    /**
     * Extract text from the given document.
     */
    public function extractText(string $filePath): string;

    /**
     * Detect the primary language of the document.
     */
    public function detectLanguage(string $filePath): string;
}
