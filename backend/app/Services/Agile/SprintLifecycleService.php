<?php

namespace App\Services\Agile;

use App\Models\Agile\AgileSprint;
use App\Models\Agile\AgileSprintSnapshot;
use App\Models\Agile\AgileWorkItemExtension;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class SprintLifecycleService
{
    /**
     * Starts a sprint, validating readiness and creating a freezing snapshot of the initial scope.
     */
    public function startSprint(AgileSprint $sprint, int $userId): void
    {
        DB::transaction(function () use ($sprint, $userId) {
            if ($sprint->status !== 'Planned') {
                throw new \DomainException("Only Planned sprints can be started.");
            }

            // Optional: Validate capacity vs planned points here

            $sprint->status = 'Active';
            $sprint->start_date = now();
            $sprint->started_by = $userId;
            $sprint->save();

            $this->createSnapshot($sprint, 'start_snapshot', $userId);
            
            // event(new SprintStarted($sprint->id));
        });
    }

    /**
     * Completes a sprint, freezing the final state, calculating completion metrics,
     * and rolling over incomplete items.
     */
    public function completeSprint(AgileSprint $sprint, string $rolloverAction, int $userId): void
    {
        DB::transaction(function () use ($sprint, $rolloverAction, $userId) {
            if ($sprint->status !== 'Active') {
                throw new \DomainException("Only Active sprints can be completed.");
            }

            $sprint->status = 'Completed';
            $sprint->end_date = now();
            $sprint->completed_by = $userId;
            
            // Capture final state
            $this->createSnapshot($sprint, 'complete_snapshot', $userId);

            // Calculate completed points
            $completedPoints = 0;
            $items = $sprint->items()->with('task')->get();
            
            foreach ($items as $sprintItem) {
                $ext = AgileWorkItemExtension::where('task_id', $sprintItem->task_id)->first();
                if ($ext && $ext->is_done) {
                    $completedPoints += $ext->story_points ?? 0;
                } else {
                    // Carryover logic
                    if ($rolloverAction === 'move_to_backlog') {
                        $ext->update(['sprint_id' => null]);
                    }
                }
            }

            $sprint->completed_points = $completedPoints;
            $sprint->save();
            
            // Generate Velocity Snapshot
            app(AgileMetricsService::class)->recordVelocitySnapshot($sprint);

            // event(new SprintCompleted($sprint->id));
        });
    }

    /**
     * Records any scope changes (items added, removed, estimates changed) after sprint starts.
     */
    public function recordScopeChange(AgileSprint $sprint, string $taskId, string $changeType, $oldValue, $newValue, int $userId): void
    {
        if ($sprint->status !== 'Active') return;

        DB::table('agile_sprint_scope_changes')->insert([
            'id'          => \Str::uuid(),
            'sprint_id'   => $sprint->id,
            'task_id'     => $taskId,
            'change_type' => $changeType,
            'old_value'   => $oldValue,
            'new_value'   => $newValue,
            'changed_by'  => $userId,
            'created_at'  => now(),
        ]);
    }

    private function createSnapshot(AgileSprint $sprint, string $type, int $userId): void
    {
        $itemData = [];
        foreach ($sprint->items as $sprintItem) {
            $ext = AgileWorkItemExtension::where('task_id', $sprintItem->task_id)->first();
            $itemData[] = [
                'task_id'      => $sprintItem->task_id,
                'story_points' => $ext->story_points ?? 0,
                'is_done'      => $ext->is_done ?? false,
            ];
        }

        AgileSprintSnapshot::create([
            'sprint_id' => $sprint->id,
            'type'      => $type,
            'data'      => $itemData,
            'taken_at'  => now(),
            'taken_by'  => $userId,
        ]);
    }
}
