<?php

namespace App\Http\Controllers;

use App\Services\FolderService;
use Illuminate\Http\Request;

class FolderController extends Controller
{
    protected FolderService $folderService;

    public function __construct(FolderService $folderService)
    {
        $this->folderService = $folderService;
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|uuid|exists:document_folders,id',
            'description' => 'nullable|string',
            'visibility' => 'nullable|string',
        ]);

        $userId = $request->user()->id ?? 1;
        $folder = $this->folderService->createFolder($validated, $userId);

        return response()->json($folder, 201);
    }

    public function index(Request $request)
    {
        $parentId = $request->query('parent_id');
        $folders = $this->folderService->getFolderTree($parentId);
        
        return response()->json($folders);
    }
}
