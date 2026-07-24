<?php

namespace App\Services\Agile;

use App\Models\Agile\AgileSprint;
use App\Models\Agile\AgileSprintSnapshot;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AgileMetricsService
{
    /**
     * Records a sprint's final velocity snapshot.
     */
    public function recordVelocitySnapshot(AgileSprint $sprint): void
    {
        $plannedPoints = 0;
        
        // Retrieve the start snapshot to determine what was planned
        $startSnapshot = AgileSprintSnapshot::where('sprint_id', $sprint->id)
            ->where('type', 'start_snapshot')
            ->first();
            
        if ($startSnapshot && is_array($startSnapshot->data)) {
            foreach ($startSnapshot->data as $item) {
                $plannedPoints += (float) ($item['story_points'] ?? 0);
            }
        }

        // Calculate a rolling average (e.g. last 3 sprints for this board)
        $pastSprints = DB::table('agile_velocity_snapshots')
            ->where('board_id', $sprint->board_id)
            ->latest()
            ->take(3)
            ->get();
            
        $sum = $sprint->completed_points;
        foreach ($pastSprints as $ps) {
            $sum += $ps->completed_points;
        }
        $rollingAverage = $sum / ($pastSprints->count() + 1);

        DB::table('agile_velocity_snapshots')->insert([
            'id' => \Str::uuid(),
            'board_id' => $sprint->board_id,
            'sprint_id' => $sprint->id,
            'planned_points' => $plannedPoints,
            'completed_points' => $sprint->completed_points ?? 0,
            'rolling_average_points' => $rollingAverage,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Generates a burndown chart dataset based on historical scope changes, NOT current state.
     */
    public function generateBurndown(AgileSprint $sprint): array
    {
        $startSnapshot = AgileSprintSnapshot::where('sprint_id', $sprint->id)
            ->where('type', 'start_snapshot')
            ->first();

        if (!$startSnapshot) {
            return [];
        }

        $totalScope = 0;
        foreach ($startSnapshot->data as $item) {
            $totalScope += (float) ($item['story_points'] ?? 0);
        }

        // Fetch scope changes
        $changes = DB::table('agile_sprint_scope_changes')
            ->where('sprint_id', $sprint->id)
            ->orderBy('created_at')
            ->get();

        $dailyData = [];
        $currentScope = $totalScope;
        $currentRemaining = $totalScope; // Simplified: requires task completion events to decrement accurately

        // In a full implementation, we'd iterate through each day of the sprint,
        // applying scope additions/removals and task completions on that specific day
        // to plot the exact remaining line.

        return [
            'initial_scope' => $totalScope,
            'data' => $dailyData
        ];
    }
}
