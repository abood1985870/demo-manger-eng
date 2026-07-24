<?php

namespace App\Jobs\Scheduling;

use App\Guards\EntitlementGuard;
use App\Models\Scheduling\CriticalPathItem;
use App\Models\Scheduling\ProjectSchedule;
use App\Models\Scheduling\ScheduleCalculation;
use App\Models\Scheduling\ScheduleItemDependency;
use App\Services\Scheduling\CalendarAwareDurationService;
use App\Services\Scheduling\CriticalPathService;
use App\Services\Scheduling\DependencyCycleDetector;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ScheduleCalculationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $timeout = 120;

    public function __construct(
        public readonly string $calculationId,
        public readonly string $scheduleId,
        public readonly string $tenantId,
        public readonly int    $inputScheduleVersion,
    ) {}

    public function handle(
        CriticalPathService       $cpmService,
        DependencyCycleDetector   $cycleDetector,
        CalendarAwareDurationService $calendarService,
        EntitlementGuard          $entitlementGuard,
    ): void {
        $calc = ScheduleCalculation::findOrFail($this->calculationId);
        $calc->update(['status' => 'Running', 'started_at' => now()]);

        try {
            // 1. Enforce entitlement in background job (cannot bypass via queue)
            $entitlementGuard->enforce($this->tenantId, 'scheduling.critical_path');

            // 2. Load schedule with optimistic version check
            $schedule = ProjectSchedule::where('id', $this->scheduleId)
                ->where('tenant_id', $this->tenantId)
                ->lockForUpdate()
                ->firstOrFail();

            if ($schedule->version !== $this->inputScheduleVersion) {
                $calc->update([
                    'status' => 'Failed',
                    'errors' => ['message' => 'Schedule was modified after calculation was queued. Stale result prevented.'],
                    'completed_at' => now(),
                ]);
                return;
            }

            // 3. Load items and dependencies
            $items = $schedule->items()->withTrashed(false)->get();
            $deps  = ScheduleItemDependency::whereIn('predecessor_id', $items->pluck('id'))
                ->get()
                ->map(fn($d) => [
                    'pred' => $d->predecessor_id,
                    'succ' => $d->successor_id,
                    'type' => $d->dependency_type,
                    'lag'  => (float) $d->lag_value,
                    'unit' => $d->lag_unit,
                ])
                ->toArray();

            // 4. Cycle detection (blocks calculation on hard cycle)
            $cycleDetector->detect($items->pluck('id')->toArray(), $deps);

            // 5. Run CPM algorithm
            $projectStart = Carbon::parse($schedule->planned_start ?? now());
            $cpmResults = $cpmService->calculate(
                $items,
                $deps,
                $projectStart,
                $schedule->critical_float_threshold_days,
                $schedule->default_calendar_id,
            );

            // 6. Persist results to critical_path_items and update schedule_items
            DB::transaction(function () use ($calc, $items, $cpmResults) {
                foreach ($items as $item) {
                    $r = $cpmResults[$item->id] ?? null;
                    if (!$r) continue;

                    $item->update([
                        'early_start'      => $r['ES'],
                        'early_finish'     => $r['EF'],
                        'late_start'       => $r['LS'],
                        'late_finish'      => $r['LF'],
                        'total_float_days' => $r['TF'],
                        'free_float_days'  => $r['FF'],
                        'is_critical'      => $r['is_critical'],
                    ]);

                    CriticalPathItem::create([
                        'calculation_id'   => $calc->id,
                        'schedule_item_id' => $item->id,
                        'early_start'      => $r['ES'],
                        'early_finish'     => $r['EF'],
                        'late_start'       => $r['LS'],
                        'late_finish'      => $r['LF'],
                        'total_float_days' => $r['TF'],
                        'free_float_days'  => $r['FF'],
                        'is_critical'      => $r['is_critical'],
                        'is_near_critical' => ($r['TF'] !== null && $r['TF'] <= 1),
                    ]);
                }
            });

            // 7. Update calculation record
            $calc->update([
                'status'          => 'Completed',
                'items_processed' => $items->count(),
                'completed_at'    => now(),
            ]);

            // 8. Publish domain event (Event Bus integration)
            // event(new ScheduleCalculated($this->scheduleId, $calc->id));

            Log::info("Schedule calculation completed", [
                'schedule_id'    => $this->scheduleId,
                'calculation_id' => $this->calculationId,
                'items'          => $items->count(),
            ]);

        } catch (\Exception $e) {
            $isCycleError = str_contains($e->getMessage(), 'Circular dependency');
            $calc->update([
                'status'       => 'Failed',
                'errors'       => ['message' => $isCycleError ? $e->getMessage() : 'Calculation failed. See logs.'],
                'cycle_info'   => $isCycleError ? ['detected' => true, 'path' => $e->getMessage()] : null,
                'completed_at' => now(),
            ]);

            // Do not expose internal stack traces through the API
            Log::error("Schedule calculation failed", [
                'schedule_id'    => $this->scheduleId,
                'calculation_id' => $this->calculationId,
                'error'          => $e->getMessage(),
            ]);

            throw $e; // Allow queue retry
        }
    }
}
