<?php

namespace App\Http\Controllers\Knowledge;

use App\Http\Controllers\Controller;
use App\Models\Knowledge\KnowledgeItem;
use App\Services\Knowledge\LegalKnowledgeAccessResolver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class KnowledgeItemController extends Controller
{
    public function __construct(
        protected LegalKnowledgeAccessResolver $accessResolver
    ) {}

    public function show(Request $request, string $id): JsonResponse
    {
        $user = $request->user();

        // 1. Fetch Item with related Context
        $item = KnowledgeItem::with(['sourceMatters', 'author'])
            ->where('id', $id)
            ->firstOrFail();

        // 2. Strict Centralized Resolver Check
        if (!$this->accessResolver->canAccess($user, $item, 'view')) {
            abort(403, 'You do not have permission to view this knowledge item or its source matter is restricted.');
        }

        // 3. Serialize safe response
        return response()->json([
            'knowledge_item' => [
                'id' => $item->id,
                'knowledge_number' => $item->knowledge_number,
                'title_en' => $item->title_en,
                'status' => $item->status,
                'type' => $item->knowledge_type,
                'author' => $item->author->name ?? 'Unknown',
            ]
        ]);
    }
}
