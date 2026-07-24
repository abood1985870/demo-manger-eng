<?php

namespace App\Services;

use App\Models\Document;
use App\Models\DocumentLock;
use Exception;

class DocumentLockService
{
    public function checkOut(string $documentId, int $userId, string $reason = null)
    {
        $document = Document::findOrFail($documentId);

        if ($document->activeLock) {
            throw new Exception("Document is already locked by user: " . $document->activeLock->locked_by);
        }

        return DocumentLock::create([
            'document_id' => $documentId,
            'locked_by' => $userId,
            'reason' => $reason,
        ]);
    }

    public function checkIn(string $documentId, int $userId)
    {
        $lock = DocumentLock::where('document_id', $documentId)->first();

        if (!$lock) {
            throw new Exception("Document is not locked.");
        }

        // Only the locker or a system admin can unlock it
        if ($lock->locked_by !== $userId) {
            throw new Exception("You do not have permission to unlock this document.");
        }

        $lock->delete(); // Or physically delete based on audit requirements

        return true;
    }
}
