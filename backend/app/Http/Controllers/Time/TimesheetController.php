<?php

namespace App\Http\Controllers\Time;

use App\Guards\EntitlementGuard;
use App\Http\Controllers\Controller;
use App\Models\Time\Timesheet;
use App\Services\Time\TimesheetLifecycleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TimesheetController extends Controller
{
    public function __construct(
        protected EntitlementGuard $entitlementGuard,
        protected TimesheetLifecycleService $timesheetService
    ) {}

    public function submit(Request $request, string $timesheetId): JsonResponse
    {
        $tenantId = $request->user()->tenant_id ?? 'default';
        $this->entitlementGuard->enforce($tenantId, 'timesheets.submit');

        $validated = $request->validate([
            'notes' => 'nullable|string'
        ]);

        $timesheet = Timesheet::where('id', $timesheetId)->where('tenant_id', $tenantId)->firstOrFail();
        
        $this->timesheetService->submitTimesheet($timesheet, $validated['notes'] ?? null);

        return response()->json(['message' => 'Timesheet submitted and snapshot created.']);
    }

    public function approve(Request $request, string $timesheetId): JsonResponse
    {
        $tenantId = $request->user()->tenant_id ?? 'default';
        $this->entitlementGuard->enforce($tenantId, 'timesheets.approve');

        $timesheet = Timesheet::where('id', $timesheetId)->where('tenant_id', $tenantId)->firstOrFail();
        
        $this->timesheetService->approveTimesheet($timesheet, $request->user()->id ?? 1);

        return response()->json(['message' => 'Timesheet approved. Historical rates locked.']);
    }
}
