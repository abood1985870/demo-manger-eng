<?php

namespace App\Http\Controllers\Agile;

use App\Guards\EntitlementGuard;
use App\Http\Controllers\Controller;
use App\Models\Agile\AgileSprint;
use App\Services\Agile\SprintLifecycleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AgileSprintController extends Controller
{
    public function __construct(
        protected EntitlementGuard $entitlementGuard,
        protected SprintLifecycleService $sprintService
    ) {}

    public function start(Request $request, string $sprintId): JsonResponse
    {
        $tenantId = $request->user()->tenant_id ?? 'default';
        $this->entitlementGuard->enforce($tenantId, 'agile.manage');

        $sprint = AgileSprint::where('id', $sprintId)->where('tenant_id', $tenantId)->firstOrFail();
        
        $this->sprintService->startSprint($sprint, $request->user()->id ?? 1);

        return response()->json(['message' => 'Sprint started and scope snapshotted.', 'sprint' => $sprint->fresh()]);
    }

    public function complete(Request $request, string $sprintId): JsonResponse
    {
        $tenantId = $request->user()->tenant_id ?? 'default';
        $this->entitlementGuard->enforce($tenantId, 'agile.manage');

        $validated = $request->validate([
            'rollover_action' => 'required|in:move_to_backlog,move_to_next_sprint'
        ]);

        $sprint = AgileSprint::where('id', $sprintId)->where('tenant_id', $tenantId)->firstOrFail();
        
        $this->sprintService->completeSprint($sprint, $validated['rollover_action'], $request->user()->id ?? 1);

        return response()->json(['message' => 'Sprint completed.', 'sprint' => $sprint->fresh()]);
    }
    
    public function recordScopeChange(Request $request, string $sprintId, string $taskId): JsonResponse
    {
        $tenantId = $request->user()->tenant_id ?? 'default';
        $this->entitlementGuard->enforce($tenantId, 'agile.manage');

        $validated = $request->validate([
            'change_type' => 'required|string',
            'old_value'   => 'nullable|string',
            'new_value'   => 'nullable|string',
        ]);
        
        $sprint = AgileSprint::where('id', $sprintId)->where('tenant_id', $tenantId)->firstOrFail();
        
        $this->sprintService->recordScopeChange(
            $sprint, 
            $taskId, 
            $validated['change_type'], 
            $validated['old_value'], 
            $validated['new_value'], 
            $request->user()->id ?? 1
        );
        
        return response()->json(['message' => 'Scope change logged successfully.']);
    }
}
