<?php

namespace App\Services;

use App\Repositories\Contracts\ProjectRepositoryInterface;
use Exception;
use Illuminate\Support\Str;

class ProjectService
{
    protected ProjectRepositoryInterface $projectRepository;
    protected AuditService $auditService;

    public function __construct(ProjectRepositoryInterface $projectRepository, AuditService $auditService)
    {
        $this->projectRepository = $projectRepository;
        $this->auditService = $auditService;
    }

    public function createProject(array $data)
    {
        // Business Rule: Generate unique Project Code if not provided
        if (empty($data['code'])) {
            $data['code'] = 'PRJ-' . strtoupper(Str::random(6));
        }

        $project = $this->projectRepository->create($data);

        $this->auditService->log('project_created', $project, [], $project->toArray());

        return $project;
    }

    public function updateProject(string $id, array $data)
    {
        $project = $this->projectRepository->find($id);
        if (!$project) {
            throw new Exception("Project not found.");
        }

        $oldData = $project->toArray();
        $this->projectRepository->update($id, $data);
        
        $project->refresh();
        $this->auditService->log('project_updated', $project, $oldData, $project->toArray());

        return $project;
    }

    public function deleteProject(string $id)
    {
        $project = $this->projectRepository->find($id);
        if (!$project) {
            throw new Exception("Project not found.");
        }

        // Business Rule: Cannot delete a project containing data unless it is archived first
        if (!$project->is_archived) {
            throw new Exception("Cannot delete an active project. Archive it first.");
        }

        $oldData = $project->toArray();
        $this->projectRepository->delete($id);

        $this->auditService->log('project_deleted', $project, $oldData, []);

        return true;
    }

    public function archiveProject(string $id)
    {
        $project = $this->projectRepository->find($id);
        if (!$project) {
            throw new Exception("Project not found.");
        }
        
        $this->projectRepository->archive($id);
        $this->auditService->log('project_archived', $project, ['is_archived' => false], ['is_archived' => true]);
        
        return true;
    }

    public function restoreProject(string $id)
    {
        $project = $this->projectRepository->find($id);
        if (!$project) {
            throw new Exception("Project not found.");
        }
        
        $this->projectRepository->restore($id);
        $this->auditService->log('project_restored', $project, ['is_archived' => true], ['is_archived' => false]);
        
        return true;
    }

    public function addMember(string $projectId, array $memberData)
    {
        $member = $this->projectRepository->addMember($projectId, $memberData);
        $project = $this->projectRepository->find($projectId);
        
        $this->auditService->log('project_member_added', $project, [], $member->toArray());
        
        return $member;
    }

    public function removeMember(string $projectId, int $userId)
    {
        $project = $this->projectRepository->find($projectId);
        $this->projectRepository->removeMember($projectId, $userId);
        
        $this->auditService->log('project_member_removed', $project, ['user_id' => $userId], []);
        
        return true;
    }

    public function changeStatus(string $projectId, string $statusId)
    {
        return $this->updateProject($projectId, ['status_id' => $statusId]);
    }
}
