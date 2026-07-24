<?php

namespace App\Http\Controllers\Time;

use App\Guards\EntitlementGuard;
use App\Http\Controllers\Controller;
use App\Services\Time\TimeEntryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TimeEntryController extends Controller
{
    public function __construct(
        protected EntitlementGuard $entitlementGuard,
        protected TimeEntryService $timeEntryService
    ) {}

    public function startTimer(Request $request): JsonResponse
    {
        $tenantId = $request->user()->tenant_id ?? 'default';
        $this->entitlementGuard->enforce($tenantId, 'time.manage');

        $validated = $request->validate([
            'project_id'  => 'nullable|uuid',
            'task_id'     => 'nullable|uuid',
            'description' => 'nullable|string',
        ]);

        $timer = $this->timeEntryService->startTimer($request->user()->id, $tenantId, $validated);

        return response()->json(['message' => 'Timer started successfully.', 'timer' => $timer]);
    }

    public function stopTimer(Request $request, string $timerId): JsonResponse
    {
        $tenantId = $request->user()->tenant_id ?? 'default';
        $this->entitlementGuard->enforce($tenantId, 'time.manage');

        $idempotencyKey = $request->header('Idempotency-Key');

        $entry = $this->timeEntryService->stopTimer($timerId, $idempotencyKey);

        return response()->json(['message' => 'Timer stopped and entry created.', 'entry' => $entry]);
    }
}
