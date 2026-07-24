<?php

namespace App\Http\Controllers\Scheduling;

use App\Guards\EntitlementGuard;
use App\Http\Controllers\Controller;
use App\Jobs\Scheduling\ScheduleCalculationJob;
use App\Models\Scheduling\ProjectSchedule;
use App\Models\Scheduling\ScheduleBaseline;
use App\Models\Scheduling\ScheduleCalculation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ScheduleController extends Controller
{
    public function __construct(protected EntitlementGuard $entitlementGuard) {}

    public function index(Request $request): JsonResponse
    {
        $tenantId = $request->user()->tenant_id ?? 'default';
        $this->entitlementGuard->enforce($tenantId, 'scheduling.basic');

        $schedules = ProjectSchedule::where('tenant_id', $tenantId)
            ->with('latestCalculation')
            ->paginate(20);

        return response()->json($schedules);
    }

    public function store(Request $request): JsonResponse
    {
        $tenantId = $request->user()->tenant_id ?? 'default';
        $this->entitlementGuard->enforce($tenantId, 'scheduling.basic');

        $validated = $request->validate([
            'name_en'           => 'required|string|max:255',
            'name_ar'           => 'nullable|string',
            'schedulable_type'  => 'required|string',
            'schedulable_id'    => 'required|uuid',
            'type'              => 'nullable|string',
            'planned_start'     => 'required|date',
            'planned_finish'    => 'required|date|after:planned_start',
        ]);

        $schedule = ProjectSchedule::create(array_merge($validated, [
            'tenant_id'  => $tenantId,
            'created_by' => $request->user()->id ?? null,
        ]));

        // Publish event
        // event(new ScheduleCreated($schedule->id, $tenantId, $request->user()->id));

        return response()->json($schedule, 201);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->user()->tenant_id ?? 'default';
        $this->entitlementGuard->enforce($tenantId, 'scheduling.basic');

        $schedule = ProjectSchedule::where('id', $id)->where('tenant_id', $tenantId)->with(['items', 'latestCalculation'])->firstOrFail();

        return response()->json($schedule);
    }

    /**
     * Dispatch the CPM calculation job for the given schedule.
     */
    public function calculate(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->user()->tenant_id ?? 'default';
        $this->entitlementGuard->enforce($tenantId, 'scheduling.critical_path');

        $schedule = ProjectSchedule::where('id', $id)->where('tenant_id', $tenantId)->firstOrFail();

        // Create a calculation record
        $calc = ScheduleCalculation::create([
            'schedule_id'            => $schedule->id,
            'status'                 => 'Queued',
            'input_schedule_version' => $schedule->version,
            'correlation_id'         => Str::uuid()->toString(),
            'requested_by'           => $request->user()->id ?? null,
        ]);

        // Dispatch to queue (async for large schedules)
        ScheduleCalculationJob::dispatch(
            $calc->id,
            $schedule->id,
            $tenantId,
            $schedule->version,
        );

        return response()->json([
            'calculation_id' => $calc->id,
            'status'         => 'Queued',
            'message'        => 'Schedule calculation has been queued.',
        ], 202);
    }

    /**
     * Returns the Gantt-formatted data for a schedule.
     * Enforces tenant isolation and permissions.
     */
    public function gantt(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->user()->tenant_id ?? 'default';
        $this->entitlementGuard->enforce($tenantId, 'scheduling.basic');

        $schedule = ProjectSchedule::where('id', $id)->where('tenant_id', $tenantId)->firstOrFail();

        $items = $schedule->items()
            ->with(['predecessors', 'constraint'])
            ->orderBy('sequence')
            ->get()
            ->map(fn($item) => [
                'id'             => $item->id,
                'parent_id'      => $item->parent_id,
                'wbs_code'       => $item->wbs_code,
                'sequence'       => $item->sequence,
                'type'           => $item->item_type,
                'title'          => $item->title_en,
                'title_ar'       => $item->title_ar,
                'planned_start'  => $item->planned_start,
                'planned_finish' => $item->planned_finish,
                'forecast_start' => $item->forecast_start,
                'forecast_finish'=> $item->forecast_finish,
                'actual_start'   => $item->actual_start,
                'actual_finish'  => $item->actual_finish,
                'duration_days'  => $item->duration_days,
                'percent_complete'=> $item->percent_complete,
                'is_critical'    => $item->is_critical,
                'is_milestone'   => $item->is_milestone,
                'is_summary'     => $item->is_summary,
                'total_float'    => $item->total_float_days,
                'dependencies'   => $item->predecessors->map(fn($d) => [
                    'predecessor_id'  => $d->predecessor_id,
                    'type'            => $d->dependency_type,
                    'lag'             => $d->lag_value,
                ]),
            ]);

        return response()->json([
            'schedule_id'   => $schedule->id,
            'version'       => $schedule->version,
            'planned_start' => $schedule->planned_start,
            'planned_finish'=> $schedule->planned_finish,
            'items'         => $items,
            'item_count'    => $items->count(),
        ]);
    }

    /**
     * Approve a baseline — locks it permanently.
     */
    public function approveBaseline(Request $request, string $scheduleId, string $baselineId): JsonResponse
    {
        $tenantId = $request->user()->tenant_id ?? 'default';
        $this->entitlementGuard->enforce($tenantId, 'scheduling.multi_baseline');

        $schedule = ProjectSchedule::where('id', $scheduleId)->where('tenant_id', $tenantId)->firstOrFail();
        $baseline = ScheduleBaseline::where('id', $baselineId)->where('schedule_id', $schedule->id)->firstOrFail();

        if ($baseline->isLocked()) {
            return response()->json(['error' => 'Baseline is already approved and immutable.'], 409);
        }

        $baseline->update([
            'status'      => 'Approved',
            'locked_at'   => now(),
            'approved_by' => $request->user()->id ?? null,
            'approved_at' => now(),
        ]);

        return response()->json(['message' => 'Baseline approved and locked.', 'baseline' => $baseline]);
    }
}
