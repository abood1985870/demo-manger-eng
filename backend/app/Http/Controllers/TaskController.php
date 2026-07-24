<?php

namespace App\Http\Controllers;

use App\Services\TaskService;
use App\DTOs\CreateTaskDTO;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    protected TaskService $taskService;

    public function __construct(TaskService $taskService)
    {
        $this->taskService = $taskService;
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'project_id' => 'required|uuid|exists:projects,id',
            'title' => 'required|string|max:255',
            'parent_id' => 'nullable|uuid|exists:tasks,id',
            'description' => 'nullable|string',
            'type_id' => 'nullable|uuid',
            'status_id' => 'nullable|uuid',
            'priority_id' => 'nullable|uuid',
        ]);

        $dto = new CreateTaskDTO(
            projectId: $validated['project_id'],
            title: $validated['title'],
            parentId: $validated['parent_id'] ?? null,
            description: $validated['description'] ?? null,
            typeId: $validated['type_id'] ?? null,
            statusId: $validated['status_id'] ?? null,
            priorityId: $validated['priority_id'] ?? null
        );

        $userId = $request->user()->id ?? 1; // Assuming auth user

        $task = $this->taskService->createTask($dto, $userId);
        
        return response()->json($task, 201);
    }

    public function clone(Request $request, $id)
    {
        $userId = $request->user()->id ?? 1;
        $task = $this->taskService->cloneTask($id, $userId);
        return response()->json($task, 201);
    }

    public function assignUsers(Request $request, $id)
    {
        // Implementation for assigning users
        return response()->json(['message' => 'Users assigned successfully']);
    }

    public function changeStatus(Request $request, $id)
    {
        // Check if task can be closed using service
        // $canClose = $this->taskService->canCloseTask($task);
        return response()->json(['message' => 'Status updated']);
    }
}
