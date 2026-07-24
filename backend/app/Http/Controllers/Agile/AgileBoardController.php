<?php

namespace App\Http\Controllers\Agile;

use App\Guards\EntitlementGuard;
use App\Http\Controllers\Controller;
use App\Models\Agile\AgileBoard;
use App\Services\Agile\BoardService;
use App\Services\Agile\LexoRankService;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AgileBoardController extends Controller
{
    public function __construct(
        protected EntitlementGuard $entitlementGuard,
        protected BoardService $boardService,
        protected LexoRankService $lexoRankService
    ) {}

    /**
     * Get CQRS-ready normalized board data (Columns, Swimlanes, Cards, Ranks).
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->user()->tenant_id ?? 'default';
        $this->entitlementGuard->enforce($tenantId, 'agile.basic');

        $board = AgileBoard::where('id', $id)
            ->where('tenant_id', $tenantId)
            ->with(['columns', 'sprints' => function($q) {
                $q->where('status', 'Active');
            }])
            ->firstOrFail();

        // Load cards mapped to this board
        $cards = DB::table('agile_work_item_extensions')
            ->join('tasks', 'tasks.id', '=', 'agile_work_item_extensions.task_id')
            ->leftJoin('agile_rankings', function ($join) use ($board) {
                $join->on('agile_rankings.task_id', '=', 'tasks.id')
                     ->where('agile_rankings.context_type', '=', 'Board')
                     ->where('agile_rankings.context_id', '=', $board->id);
            })
            ->where('agile_work_item_extensions.board_id', $board->id)
            ->select(
                'tasks.id', 'tasks.title', 'tasks.status_id', 
                'agile_work_item_extensions.story_points',
                'agile_work_item_extensions.is_blocked',
                'agile_rankings.rank'
            )
            ->orderBy('agile_rankings.rank')
            ->get();

        return response()->json([
            'board' => $board,
            'cards' => $cards
        ]);
    }

    /**
     * Move a card between columns (enforces WIP limits).
     */
    public function moveCard(Request $request, string $boardId, string $taskId): JsonResponse
    {
        $tenantId = $request->user()->tenant_id ?? 'default';
        $this->entitlementGuard->enforce($tenantId, 'agile.manage');

        $validated = $request->validate([
            'target_column_id' => 'required|uuid',
            'prev_rank'        => 'nullable|string',
            'next_rank'        => 'nullable|string',
        ]);

        $task = Task::findOrFail($taskId);
        
        // 1. Enforce board column WIP and DoD
        $this->boardService->moveTask($task, $validated['target_column_id']);

        // 2. Rank safely
        $ranking = $this->lexoRankService->rankBetween(
            'Board', 
            $boardId, 
            $taskId, 
            $validated['prev_rank'], 
            $validated['next_rank']
        );

        return response()->json([
            'message' => 'Card moved successfully',
            'new_rank' => $ranking->rank,
            'new_status' => $task->fresh()->status_id
        ]);
    }
}
