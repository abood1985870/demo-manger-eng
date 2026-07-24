<?php

namespace App\Services\Agile;

use App\Models\Agile\AgileBoard;
use App\Models\Agile\AgileBoardColumn;
use App\Models\Task;
use Illuminate\Support\Facades\DB;

class BoardService
{
    /**
     * Moves a task to a different board column, checking WIP limits and DoD.
     */
    public function moveTask(Task $task, string $targetColumnId): void
    {
        DB::transaction(function () use ($task, $targetColumnId) {
            $targetColumn = AgileBoardColumn::findOrFail($targetColumnId);
            $board = $targetColumn->board;

            // 1. Verify WIP Limit transactionally
            if ($targetColumn->wip_limit !== null) {
                // Lock the column rows to count current WIP
                $currentWip = DB::table('agile_board_status_mappings')
                    ->join('tasks', 'tasks.status_id', '=', 'agile_board_status_mappings.status_id')
                    ->where('agile_board_status_mappings.column_id', $targetColumnId)
                    ->lockForUpdate()
                    ->count();

                if ($currentWip >= $targetColumn->wip_limit) {
                    throw new \DomainException("WIP Limit ({$targetColumn->wip_limit}) exceeded for column '{$targetColumn->name_en}'.");
                }
            }

            // 2. Definition of Done Check (If moving to a "Done" column)
            if ($targetColumn->is_done) {
                $unverifiedRules = DB::table('agile_work_item_readiness')
                    ->join('agile_checklist_rules', 'agile_checklist_rules.id', '=', 'agile_work_item_readiness.rule_id')
                    ->where('agile_work_item_readiness.task_id', $task->id)
                    ->where('agile_checklist_rules.type', 'Done')
                    ->where('agile_checklist_rules.is_required', true)
                    ->where('agile_work_item_readiness.is_verified', false)
                    ->exists();

                if ($unverifiedRules) {
                    throw new \DomainException("Cannot move to Done. Mandatory Definition of Done checks are incomplete.");
                }
            }

            // 3. Find the first mapped status for the target column and update the task
            $mappedStatus = DB::table('agile_board_status_mappings')
                ->where('column_id', $targetColumnId)
                ->first();

            if (!$mappedStatus) {
                throw new \DomainException("Target column has no mapped status in the underlying system.");
            }

            $task->update(['status_id' => $mappedStatus->status_id]);
            
            // 4. Update extension done flag
            if ($targetColumn->is_done) {
                DB::table('agile_work_item_extensions')
                    ->where('task_id', $task->id)
                    ->update(['is_done' => true]);
            }

            // Publish Event
            // event(new WorkItemMoved($task->id, $targetColumnId));
        });
    }
}
