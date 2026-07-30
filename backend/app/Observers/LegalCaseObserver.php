<?php

namespace App\Observers;

use App\Models\Legal\LegalCase;
use App\Models\Knowledge\KnowledgeItem;
use Illuminate\Support\Str;

class LegalCaseObserver
{
    /**
     * Handle the LegalCase "updated" event.
     */
    public function updated(LegalCase $legalCase): void
    {
        // Check if status changed to CLOSED or ARCHIVED
        if ($legalCase->isDirty('status') && in_array($legalCase->status, ['CLOSED', 'ARCHIVED'])) {
            $this->createKnowledgeDraft($legalCase);
        }
    }

    private function createKnowledgeDraft(LegalCase $legalCase): void
    {
        // Prevent duplicate knowledge items for the same case
        $exists = KnowledgeItem::where('source_case_id', $legalCase->id)->exists();
        if ($exists) {
            return;
        }

        KnowledgeItem::create([
            'tenant_id' => $legalCase->tenant_id,
            'knowledge_number' => 'KB-' . strtoupper(Str::random(6)),
            'source_case_id' => $legalCase->id,
            'title_en' => 'Knowledge Base from Case: ' . $legalCase->case_number,
            'title_ar' => 'قاعدة معرفة من قضية: ' . $legalCase->case_number,
            'summary' => $legalCase->summary ?? 'تم إغلاق القضية وتحويلها إلى مسودة معرفة. ' . $legalCase->description,
            'knowledge_type' => 'LESSON_LEARNED',
            'status' => 'PRIVATE_DRAFT',
            'confidentiality_level' => 'INTERNAL',
            'effective_date' => now(),
            'author_id' => $legalCase->lawyer_id ?? null, // Default author
        ]);
    }
}
