<?php

namespace App\Services;

use App\Models\Task;
use App\Models\Project;
use App\DTOs\CreateTaskDTO;
use App\Events\TaskCreated;
use Illuminate\Support\Facades\DB;
use Exception;

class TaskService
{
    public function createTask(CreateTaskDTO $dto, int $userId)
    {
        return DB::transaction(function () use ($dto, $userId) {
            $project = Project::findOrFail($dto->projectId);
            
            // Auto-generate Task Number scoped globally or by project
            // Assuming globally for simplicity, with prefix PRJ
            $taskCount = Task::count() + 1;
            $taskNumber = $project->code . '-' . str_pad($taskCount, 6, '0', STR_PAD_LEFT);

            $task = Task::create([
                'project_id' => $dto->projectId,
                'task_number' => $taskNumber,
                'title' => $dto->title,
                'parent_id' => $dto->parentId,
                'description' => $dto->description,
                'type_id' => $dto->typeId,
                'priority_id' => $dto->priorityId,
                'status_id' => $dto->statusId,
                'start_date' => $dto->startDate,
                'due_date' => $dto->dueDate,
                'estimated_hours' => $dto->estimatedHours,
                'created_by' => $userId,
            ]);

            if (!empty($dto->assignees)) {
                $task->assignments()->createMany($dto->assignees);
            }
            if (!empty($dto->watchers)) {
                $task->watchers()->attach($dto->watchers);
            }

            event(new TaskCreated($task, $userId));

            return $task;
        });
    }

    public function canCloseTask(Task $task): bool
    {
        // Check dependencies (Finish to Start)
        $incompleteDependencies = $task->dependencies()
            ->where('type', 'finish_to_start')
            ->whereHas('dependentTask', function ($query) {
                // Assuming status logic where 'completed' is a known state
                // This would actually join project_statuses table
                // $query->where('is_closed', false); 
            })->exists();

        if ($incompleteDependencies) {
            return false;
        }

        // Check checklist items
        $incompleteChecklists = $task->checklists()
            ->whereHas('items', function ($query) {
                $query->where('is_completed', false);
            })->exists();

        if ($incompleteChecklists) {
            return false; // Assuming project settings enforce this
        }

        return true;
    }

    public function cloneTask(string $taskId, int $userId)
    {
        return DB::transaction(function () use ($taskId, $userId) {
            $original = Task::with(['assignments', 'checklists.items', 'watchers'])->findOrFail($taskId);
            
            $clone = $original->replicate();
            $clone->title = "Copy of " . $clone->title;
            $taskCount = Task::count() + 1;
            $clone->task_number = explode('-', $original->task_number)[0] . '-' . str_pad($taskCount, 6, '0', STR_PAD_LEFT);
            $clone->created_by = $userId;
            $clone->save();

            // Duplicate logic for relations (skipped detailed logic for brevity, but Foundation built)
            
            event(new TaskCreated($clone, $userId));
            return $clone;
        });
    }
    
    // Add methods for merge, split, duplicate, convertToMainTask...
}
