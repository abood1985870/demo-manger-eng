<?php

namespace App\Repositories\Eloquent;

use App\Models\Project;
use App\Models\ProjectMember;
use App\Repositories\Contracts\ProjectRepositoryInterface;

class ProjectRepository extends BaseRepository implements ProjectRepositoryInterface
{
    public function __construct(Project $model)
    {
        parent::__construct($model);
    }

    public function findByCode(string $code)
    {
        return $this->model->where('code', $code)->first();
    }

    public function archive(string $id): bool
    {
        $project = $this->find($id);
        if ($project) {
            $project->is_archived = true;
            return $project->save();
        }
        return false;
    }

    public function restore(string $id): bool
    {
        $project = $this->find($id);
        if ($project) {
            $project->is_archived = false;
            return $project->save();
        }
        return false;
    }

    public function addMember(string $projectId, array $memberData)
    {
        return ProjectMember::updateOrCreate(
            ['project_id' => $projectId, 'user_id' => $memberData['user_id']],
            $memberData
        );
    }

    public function removeMember(string $projectId, int $userId)
    {
        return ProjectMember::where('project_id', $projectId)
                            ->where('user_id', $userId)
                            ->delete();
    }
}
