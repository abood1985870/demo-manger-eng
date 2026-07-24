<?php

namespace App\Services\Legal;

class NameNormalizationService
{
    /**
     * Normalizes an Arabic or English name to a standard searchable token.
     * Prevents false negatives in Conflict Checking caused by spelling variants.
     */
    public function normalize(string $name): string
    {
        $normalized = mb_strtolower(trim($name));

        // 1. Remove Arabic Diacritics (Tashkeel)
        $normalized = preg_replace('/[\x{064B}-\x{065F}]/u', '', $normalized);

        // 2. Remove Tatweel (Kashida)
        $normalized = preg_replace('/\x{0640}/u', '', $normalized);

        // 3. Normalize Alef forms (أ إ آ -> ا)
        $normalized = preg_replace('/[\x{0622}\x{0623}\x{0625}]/u', 'ا', $normalized);

        // 4. Normalize Ta Marbuta and Haa (ة -> ه)
        $normalized = preg_replace('/\x{0629}/u', 'ه', $normalized);

        // 5. Normalize Ya and Alif Maqsura (ى -> ي)
        $normalized = preg_replace('/\x{0649}/u', 'ي', $normalized);
        
        // 6. English corporate suffix normalization
        $normalized = preg_replace('/\b(llc|ltd|inc|co|corp|plc)\b/', '', $normalized);
        
        // 7. Strip punctuation and excessive whitespace
        $normalized = preg_replace('/[^\p{L}\p{N}\s]/u', '', $normalized);
        $normalized = preg_replace('/\s+/', ' ', $normalized);

        return trim($normalized);
    }
}
