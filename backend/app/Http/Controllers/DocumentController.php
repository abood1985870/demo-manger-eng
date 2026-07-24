<?php

namespace App\Http\Controllers;

use App\Services\DocumentService;
use App\Services\DocumentLockService;
use Illuminate\Http\Request;

class DocumentController extends Controller
{
    protected DocumentService $documentService;
    protected DocumentLockService $lockService;

    public function __construct(DocumentService $documentService, DocumentLockService $lockService)
    {
        $this->documentService = $documentService;
        $this->lockService = $lockService;
    }

    public function upload(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:102400', // max 100MB
            'folder_id' => 'nullable|uuid|exists:document_folders,id',
            'category_id' => 'nullable|uuid|exists:document_categories,id',
        ]);

        $userId = $request->user()->id ?? 1;
        $document = $this->documentService->uploadDocument($request->file('file'), $request->all(), $userId);

        return response()->json($document, 201);
    }

    public function replace(Request $request, $id)
    {
        $request->validate([
            'file' => 'required|file|max:102400',
            'changelog' => 'nullable|string'
        ]);

        $userId = $request->user()->id ?? 1;
        
        try {
            $document = $this->documentService->replaceDocument($id, $request->file('file'), $userId, $request->changelog);
            return response()->json($document);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 403);
        }
    }

    public function lock(Request $request, $id)
    {
        $userId = $request->user()->id ?? 1;
        try {
            $lock = $this->lockService->checkOut($id, $userId, $request->reason);
            return response()->json($lock, 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    public function unlock(Request $request, $id)
    {
        $userId = $request->user()->id ?? 1;
        try {
            $this->lockService->checkIn($id, $userId);
            return response()->json(['message' => 'Document unlocked successfully.']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }
}
