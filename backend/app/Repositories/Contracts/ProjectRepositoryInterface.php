<?php

namespace App\Repositories\Contracts;

use Illuminate\Database\Eloquent\Collection;

interface ProjectRepositoryInterface extends BaseRepositoryInterface
{
    public function findByCode(string $code);
    public function archive(string $id): bool;
    public function restore(string $id): bool;
    public function addMember(string $projectId, array $memberData);
    public function removeMember(string $projectId, int $userId);
}
