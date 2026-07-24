<?php

namespace App\Services;

use App\Models\Document;
use App\Models\DocumentVersion;
use App\Events\EDMS\DocumentUploaded;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Exception;

class DocumentService
{
    /**
     * The storage disk to use. This abstracts Local vs S3 vs Azure.
     */
    protected string $disk = 'local'; // Can be configured via config('filesystems.default')

    public function uploadDocument(UploadedFile $file, array $data, int $userId)
    {
        return DB::transaction(function () use ($file, $data, $userId) {
            $checksum = md5_file($file->getRealPath());

            // Optional: Block duplicates
            $duplicate = Document::where('checksum', $checksum)->first();
            if ($duplicate) {
                // throw new Exception("This file already exists in the system.");
                // For now, we allow it but it's flagged by checksum
            }

            $path = $file->store('documents/' . date('Y/m'), $this->disk);

            $document = Document::create([
                'folder_id' => $data['folder_id'] ?? null,
                'category_id' => $data['category_id'] ?? null,
                'file_name' => $data['file_name'] ?? $file->getClientOriginalName(),
                'original_name' => $file->getClientOriginalName(),
                'extension' => $file->getClientOriginalExtension(),
                'mime_type' => $file->getClientMimeType(),
                'file_size' => $file->getSize(),
                'checksum' => $checksum,
                'current_version' => 1,
                'uploaded_by' => $userId,
            ]);

            DocumentVersion::create([
                'document_id' => $document->id,
                'version_number' => 1,
                'file_path' => $path,
                'file_name' => $document->file_name,
                'file_size' => $document->file_size,
                'checksum' => $checksum,
                'uploaded_by' => $userId,
            ]);

            // Dispatch event for OCR / AI / DLP listeners
            event(new DocumentUploaded($document, $path));

            return $document;
        });
    }

    public function replaceDocument(string $documentId, UploadedFile $file, int $userId, string $changelog = null)
    {
        return DB::transaction(function () use ($documentId, $file, $userId, $changelog) {
            $document = Document::findOrFail($documentId);
            
            // Check if locked
            if ($document->activeLock && $document->activeLock->locked_by !== $userId) {
                throw new Exception("Document is locked by another user.");
            }

            $checksum = md5_file($file->getRealPath());
            $path = $file->store('documents/' . date('Y/m'), $this->disk);
            $newVersion = $document->current_version + 1;

            DocumentVersion::create([
                'document_id' => $document->id,
                'version_number' => $newVersion,
                'file_path' => $path,
                'file_name' => $file->getClientOriginalName(),
                'file_size' => $file->getSize(),
                'checksum' => $checksum,
                'changelog' => $changelog,
                'uploaded_by' => $userId,
            ]);

            $document->update([
                'file_name' => $file->getClientOriginalName(),
                'extension' => $file->getClientOriginalExtension(),
                'mime_type' => $file->getClientMimeType(),
                'file_size' => $file->getSize(),
                'checksum' => $checksum,
                'current_version' => $newVersion,
            ]);

            event(new DocumentUploaded($document, $path));

            return $document;
        });
    }
}
