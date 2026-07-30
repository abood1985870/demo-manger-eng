<?php

namespace App\Http\Controllers\Knowledge;

use App\Http\Controllers\Controller;
use App\Models\Knowledge\KnowledgeItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class KnowledgeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $tenantId = $request->user()->tenant_id ?? 'default';
        $role = strtoupper($request->user()->role);

        $query = KnowledgeItem::with(['author:id,name,role'])->where('tenant_id', $tenantId);

        // Office managers / System admins can see PRIVATE_DRAFT items
        if (in_array($role, ['ADMIN', 'SYSTEM_ADMIN', 'OWNER', 'OFFICE_MANAGER', 'SUPER_ADMIN'])) {
            // Show everything, maybe we filter on frontend or return both.
        } else {
            // Only published items for regular users
            $query->where('status', 'PUBLISHED');
        }

        return response()->json($query->orderBy('created_at', 'desc')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $tenantId = $request->user()->tenant_id ?? 'default';
        
        $validated = $request->validate([
            'title' => 'required|string',
            'category' => 'required|string',
            'content' => 'required|string',
        ]);

        $item = KnowledgeItem::create([
            'tenant_id' => $tenantId,
            'knowledge_number' => 'KB-' . strtoupper(\Illuminate\Support\Str::random(6)),
            'title_ar' => $validated['title'],
            'title_en' => $validated['title'],
            'summary' => substr($validated['content'], 0, 100),
            'knowledge_type' => $validated['category'],
            'status' => 'PUBLISHED', // Direct publish from UI for now
            'confidentiality_level' => 'INTERNAL',
            'author_id' => $request->user()->id,
        ]);

        return response()->json($item, 201);
    }

    public function approve(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->user()->tenant_id ?? 'default';
        $role = strtoupper($request->user()->role);

        if (!in_array($role, ['ADMIN', 'SYSTEM_ADMIN', 'OWNER', 'OFFICE_MANAGER', 'SUPER_ADMIN'])) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $item = KnowledgeItem::where('tenant_id', $tenantId)->findOrFail($id);
        $item->status = 'PUBLISHED';
        $item->save();

        return response()->json(['success' => true]);
    }
}
