<?php

namespace App\Jobs\Agile;

use App\Models\Agile\AgileBoardColumn;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;

class CaptureDailyFlowSnapshotJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(): void
    {
        // For each active column, capture the count of items in it.
        // This powers the Cumulative Flow Diagram (CFD).
        
        $today = now()->toDateString();
        
        // Batch query for performance in a real enterprise setup.
        // For the scope of this step, we'll demonstrate the query logic.
        $columns = AgileBoardColumn::all();
        
        foreach ($columns as $col) {
            $count = DB::table('agile_board_status_mappings')
                ->join('tasks', 'tasks.status_id', '=', 'agile_board_status_mappings.status_id')
                ->where('agile_board_status_mappings.column_id', $col->id)
                ->count();
                
            $points = DB::table('agile_board_status_mappings')
                ->join('tasks', 'tasks.status_id', '=', 'agile_board_status_mappings.status_id')
                ->join('agile_work_item_extensions', 'agile_work_item_extensions.task_id', '=', 'tasks.id')
                ->where('agile_board_status_mappings.column_id', $col->id)
                ->sum('agile_work_item_extensions.story_points');

            DB::table('agile_flow_snapshots')->updateOrInsert(
                ['column_id' => $col->id, 'snapshot_date' => $today],
                [
                    'board_id' => $col->board_id,
                    'item_count' => $count,
                    'total_story_points' => $points,
                    'updated_at' => now(),
                ]
            );
        }
    }
}
