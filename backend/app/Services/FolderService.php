<?php

namespace App\Services;

use App\Models\DocumentFolder;
use Exception;

class FolderService
{
    public function createFolder(array $data, int $userId)
    {
        // Validation for unique name in the same parent directory for this user is handled by DB unique constraint
        return DocumentFolder::create(array_merge($data, [
            'owner_id' => $userId,
            'created_by' => $userId,
        ]));
    }

    public function getFolderTree(?string $parentId = null)
    {
        // Recursively load subfolders
        $query = DocumentFolder::with(['subfolders', 'documents']);
        
        if ($parentId) {
            $query->where('parent_id', $parentId);
        } else {
            $query->whereNull('parent_id');
        }

        return $query->get();
    }
}
