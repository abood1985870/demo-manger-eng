<?php

namespace App\Http\Controllers\Legal;

use App\Http\Controllers\Controller;
use App\Models\Legal\CaseFile;
use App\Models\Legal\CaseFileFolder;
use App\Models\Legal\LegalCase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CaseFileManagerController extends Controller
{
    // Ensure the user has access to the case
    private function verifyCaseAccess(Request $request, $caseId)
    {
        $tenantId = $request->user()->tenant_id ?? 'default-tenant'; // Placeholder if tenant_id not on user
        
        $case = LegalCase::where('id', $caseId)
            ->where('tenant_id', $tenantId)
            ->firstOrFail();

        // Check if user has permission to view case files (placeholder for RBAC)
        // abort_unless($request->user()->hasPermission('CASE_FILE_VIEW'), 403, 'Unauthorized');

        return $case;
    }

    public function index(Request $request, $caseId)
    {
        $this->verifyCaseAccess($request, $caseId);
        $tenantId = $request->user()->tenant_id ?? 'default-tenant';
        
        $folderId = $request->query('folderId');

        $folders = CaseFileFolder::where('case_id', $caseId)
            ->where('tenant_id', $tenantId)
            ->where('parent_folder_id', $folderId)
            ->get();

        $files = CaseFile::where('case_id', $caseId)
            ->where('tenant_id', $tenantId)
            ->where('folder_id', $folderId)
            ->get();

        // Get breadcrumbs
        $breadcrumbs = [];
        $currentFolderId = $folderId;
        while ($currentFolderId) {
            $folder = CaseFileFolder::find($currentFolderId);
            if ($folder) {
                array_unshift($breadcrumbs, ['id' => $folder->id, 'name' => $folder->name]);
                $currentFolderId = $folder->parent_folder_id;
            } else {
                break;
            }
        }

        return response()->json([
            'folders' => $folders,
            'files' => $files,
            'breadcrumbs' => $breadcrumbs
        ]);
    }

    public function createFolder(Request $request, $caseId)
    {
        $this->verifyCaseAccess($request, $caseId);
        $tenantId = $request->user()->tenant_id ?? 'default-tenant';

        $request->validate([
            'name' => 'required|string|max:100|not_in:.,..|regex:/^[^\\\\\\/:\*\?"<>\|]+$/',
            'parent_folder_id' => 'nullable|exists:case_file_folders,id',
        ]);

        $parentFolderId = $request->input('parent_folder_id');
        
        // Depth check (limit to 10)
        if ($parentFolderId) {
            $depth = 1;
            $currentId = $parentFolderId;
            while ($currentId && $depth <= 10) {
                $parent = CaseFileFolder::find($currentId);
                if (!$parent || $parent->case_id != $caseId) {
                    return response()->json(['error' => 'Invalid parent folder'], 400);
                }
                $currentId = $parent->parent_folder_id;
                $depth++;
            }
            if ($depth > 10) {
                return response()->json(['error' => 'Maximum folder depth exceeded'], 400);
            }
        }

        // Check for duplicates
        if (CaseFileFolder::where('case_id', $caseId)
            ->where('tenant_id', $tenantId)
            ->where('parent_folder_id', $parentFolderId)
            ->whereRaw('LOWER(name) = ?', [strtolower(trim($request->input('name')))])
            ->exists()) {
            return response()->json(['error' => 'Folder with this name already exists'], 400);
        }

        $folder = CaseFileFolder::create([
            'tenant_id' => $tenantId,
            'case_id' => $caseId,
            'parent_folder_id' => $parentFolderId,
            'name' => trim($request->input('name')),
            'created_by_id' => $request->user()->id ?? null
        ]);

        return response()->json($folder, 201);
    }

    public function renameFolder(Request $request, $caseId, $folderId)
    {
        $this->verifyCaseAccess($request, $caseId);
        $tenantId = $request->user()->tenant_id ?? 'default-tenant';

        $request->validate([
            'name' => 'required|string|max:100|not_in:.,..|regex:/^[^\\\\\\/:\*\?"<>\|]+$/'
        ]);

        $folder = CaseFileFolder::where('id', $folderId)
            ->where('case_id', $caseId)
            ->where('tenant_id', $tenantId)
            ->firstOrFail();

        // Check for duplicates
        if (CaseFileFolder::where('case_id', $caseId)
            ->where('tenant_id', $tenantId)
            ->where('parent_folder_id', $folder->parent_folder_id)
            ->where('id', '!=', $folderId)
            ->whereRaw('LOWER(name) = ?', [strtolower(trim($request->input('name')))])
            ->exists()) {
            return response()->json(['error' => 'Folder with this name already exists'], 400);
        }

        $folder->update(['name' => trim($request->input('name'))]);
        return response()->json($folder);
    }

    public function moveFolder(Request $request, $caseId, $folderId)
    {
        $this->verifyCaseAccess($request, $caseId);
        $tenantId = $request->user()->tenant_id ?? 'default-tenant';

        $request->validate([
            'parent_folder_id' => 'nullable|exists:case_file_folders,id',
        ]);

        $targetFolderId = $request->input('parent_folder_id');

        if ($folderId == $targetFolderId) {
            return response()->json(['error' => 'Cannot move folder into itself'], 400);
        }

        $folder = CaseFileFolder::where('id', $folderId)
            ->where('case_id', $caseId)
            ->where('tenant_id', $tenantId)
            ->firstOrFail();

        // Check circular dependency
        $currentId = $targetFolderId;
        $depth = 1;
        while ($currentId) {
            if ($currentId == $folderId) {
                return response()->json(['error' => 'Cannot move folder into its own subfolder'], 400);
            }
            $parent = CaseFileFolder::find($currentId);
            if (!$parent || $parent->case_id != $caseId) break;
            $currentId = $parent->parent_folder_id;
            $depth++;
            if ($depth > 10) {
                 return response()->json(['error' => 'Maximum folder depth exceeded'], 400);
            }
        }

        // Check duplicates at target
        if (CaseFileFolder::where('case_id', $caseId)
            ->where('tenant_id', $tenantId)
            ->where('parent_folder_id', $targetFolderId)
            ->whereRaw('LOWER(name) = ?', [strtolower($folder->name)])
            ->exists()) {
            return response()->json(['error' => 'Folder with this name already exists at target'], 400);
        }

        $folder->update(['parent_folder_id' => $targetFolderId]);
        return response()->json($folder);
    }

    public function deleteFolder(Request $request, $caseId, $folderId)
    {
        $this->verifyCaseAccess($request, $caseId);
        $tenantId = $request->user()->tenant_id ?? 'default-tenant';

        $folder = CaseFileFolder::where('id', $folderId)
            ->where('case_id', $caseId)
            ->where('tenant_id', $tenantId)
            ->firstOrFail();

        if ($folder->childFolders()->exists() || $folder->files()->exists()) {
            return response()->json(['error' => 'لا يمكن حذف هذا المجلد لأنه يحتوي على ملفات أو مجلدات فرعية. انقل المحتويات أو احذفها أولًا.'], 400);
        }

        $folder->delete();
        return response()->json(['message' => 'Folder deleted']);
    }

    public function uploadFiles(Request $request, $caseId)
    {
        $this->verifyCaseAccess($request, $caseId);
        $tenantId = $request->user()->tenant_id ?? 'default-tenant';

        $request->validate([
            'folder_id' => 'nullable|exists:case_file_folders,id',
            'files' => 'required|array|max:20',
            'files.*' => 'required|file|max:25600|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,jpg,jpeg,png,webp,txt,csv,zip' // 25MB max
        ]);

        $folderId = $request->input('folder_id');
        $uploadedFiles = [];

        foreach ($request->file('files') as $file) {
            $originalName = $file->getClientOriginalName();
            $extension = $file->getClientOriginalExtension();
            $mimeType = $file->getMimeType();
            $size = $file->getSize();

            $storageKey = 'case-files/' . $tenantId . '/' . $caseId . '/' . Str::uuid() . '.' . $extension;
            Storage::disk('local')->put($storageKey, file_get_contents($file));

            $baseName = pathinfo($originalName, PATHINFO_FILENAME);
            $displayName = $baseName;
            
            // Handle duplicate display name in same folder
            $counter = 1;
            while(CaseFile::where('case_id', $caseId)
                ->where('tenant_id', $tenantId)
                ->where('folder_id', $folderId)
                ->whereRaw('LOWER(display_name) = ?', [strtolower($displayName)])
                ->exists()) {
                $displayName = $baseName . ' (' . $counter . ')';
                $counter++;
            }

            $caseFile = CaseFile::create([
                'tenant_id' => $tenantId,
                'case_id' => $caseId,
                'folder_id' => $folderId,
                'original_name' => $originalName,
                'display_name' => $displayName,
                'storage_key' => $storageKey,
                'mime_type' => $mimeType,
                'extension' => strtolower($extension),
                'size' => $size,
                'uploaded_by_id' => $request->user()->id ?? null
            ]);

            $uploadedFiles[] = $caseFile;
        }

        return response()->json($uploadedFiles, 201);
    }

    public function renameFile(Request $request, $caseId, $fileId)
    {
        $this->verifyCaseAccess($request, $caseId);
        $tenantId = $request->user()->tenant_id ?? 'default-tenant';

        $request->validate([
            'display_name' => 'required|string|max:100|not_in:.,..|regex:/^[^\\\\\\/:\*\?"<>\|]+$/'
        ]);

        $file = CaseFile::where('id', $fileId)
            ->where('case_id', $caseId)
            ->where('tenant_id', $tenantId)
            ->firstOrFail();

        $newName = trim($request->input('display_name'));

        // Check for duplicates
        if (CaseFile::where('case_id', $caseId)
            ->where('tenant_id', $tenantId)
            ->where('folder_id', $file->folder_id)
            ->where('id', '!=', $fileId)
            ->whereRaw('LOWER(display_name) = ?', [strtolower($newName)])
            ->exists()) {
            return response()->json(['error' => 'File with this name already exists in the folder'], 400);
        }

        $file->update(['display_name' => $newName]);
        return response()->json($file);
    }

    public function moveFile(Request $request, $caseId, $fileId)
    {
        $this->verifyCaseAccess($request, $caseId);
        $tenantId = $request->user()->tenant_id ?? 'default-tenant';

        $request->validate([
            'folder_id' => 'nullable|exists:case_file_folders,id',
        ]);

        $targetFolderId = $request->input('folder_id');

        $file = CaseFile::where('id', $fileId)
            ->where('case_id', $caseId)
            ->where('tenant_id', $tenantId)
            ->firstOrFail();

        if ($targetFolderId) {
            $folder = CaseFileFolder::find($targetFolderId);
            if (!$folder || $folder->case_id != $caseId) {
                return response()->json(['error' => 'Invalid target folder'], 400);
            }
        }

        // Check for duplicates
        if (CaseFile::where('case_id', $caseId)
            ->where('tenant_id', $tenantId)
            ->where('folder_id', $targetFolderId)
            ->where('id', '!=', $fileId)
            ->whereRaw('LOWER(display_name) = ?', [strtolower($file->display_name)])
            ->exists()) {
            return response()->json(['error' => 'File with this name already exists in target folder'], 400);
        }

        $file->update(['folder_id' => $targetFolderId]);
        return response()->json($file);
    }

    public function deleteFile(Request $request, $caseId, $fileId)
    {
        $this->verifyCaseAccess($request, $caseId);
        $tenantId = $request->user()->tenant_id ?? 'default-tenant';

        $file = CaseFile::where('id', $fileId)
            ->where('case_id', $caseId)
            ->where('tenant_id', $tenantId)
            ->firstOrFail();

        $file->delete();
        return response()->json(['message' => 'File deleted']);
    }

    public function downloadFile(Request $request, $caseId, $fileId)
    {
        $this->verifyCaseAccess($request, $caseId);
        $tenantId = $request->user()->tenant_id ?? 'default-tenant';

        $file = CaseFile::where('id', $fileId)
            ->where('case_id', $caseId)
            ->where('tenant_id', $tenantId)
            ->firstOrFail();

        if (!Storage::disk('local')->exists($file->storage_key)) {
            return response()->json(['error' => 'File not found on storage'], 404);
        }

        return Storage::disk('local')->download($file->storage_key, $file->display_name . '.' . $file->extension);
    }

    public function previewFile(Request $request, $caseId, $fileId)
    {
        $this->verifyCaseAccess($request, $caseId);
        $tenantId = $request->user()->tenant_id ?? 'default-tenant';

        $file = CaseFile::where('id', $fileId)
            ->where('case_id', $caseId)
            ->where('tenant_id', $tenantId)
            ->firstOrFail();

        if (!Storage::disk('local')->exists($file->storage_key)) {
            return response()->json(['error' => 'File not found on storage'], 404);
        }
        
        $mime = $file->mime_type;
        // Basic security check to prevent executing scripts
        if (in_array(strtolower($file->extension), ['html', 'htm', 'js', 'svg', 'php', 'exe', 'sh', 'bat'])) {
            return response()->json(['error' => 'Preview not allowed for this file type'], 400);
        }

        return response()->file(Storage::disk('local')->path($file->storage_key), [
            'Content-Type' => $mime,
            'Content-Disposition' => 'inline; filename="' . $file->display_name . '.' . $file->extension . '"'
        ]);
    }
}
