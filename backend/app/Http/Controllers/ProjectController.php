<?php

namespace App\Http\Controllers;

use App\Services\ProjectService;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    protected ProjectService $projectService;

    public function __construct(ProjectService $projectService)
    {
        $this->projectService = $projectService;
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50|unique:projects',
            'description' => 'nullable|string',
            'planned_budget' => 'nullable|numeric',
        ]);

        $project = $this->projectService->createProject($validated);
        
        return response()->json($project, 201);
    }

    public function show($id)
    {
        // Normally handled by a repository method like findWithRelations
        // Returning placeholder logic
        return response()->json(['message' => 'Project details fetched', 'id' => $id]);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'planned_budget' => 'nullable|numeric',
        ]);

        $project = $this->projectService->updateProject($id, $validated);
        
        return response()->json($project);
    }

    public function destroy($id)
    {
        try {
            $this->projectService->deleteProject($id);
            return response()->json(['message' => 'Project deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    public function archive($id)
    {
        $this->projectService->archiveProject($id);
        return response()->json(['message' => 'Project archived successfully']);
    }

    public function restore($id)
    {
        $this->projectService->restoreProject($id);
        return response()->json(['message' => 'Project restored successfully']);
    }

    public function addMember(Request $request, $id)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'role_id' => 'nullable|uuid|exists:project_roles,id',
        ]);

        $member = $this->projectService->addMember($id, $validated);
        return response()->json($member, 201);
    }

    public function removeMember($id, $userId)
    {
        $this->projectService->removeMember($id, $userId);
        return response()->json(['message' => 'Member removed successfully']);
    }

    public function changeStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status_id' => 'required|uuid|exists:project_statuses,id',
        ]);

        $this->projectService->changeStatus($id, $validated['status_id']);
        return response()->json(['message' => 'Status updated successfully']);
    }
}
