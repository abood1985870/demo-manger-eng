<?php

namespace App\DTOs;

class CreateTaskDTO
{
    public function __construct(
        public readonly string $projectId,
        public readonly string $title,
        public readonly ?string $parentId = null,
        public readonly ?string $description = null,
        public readonly ?string $typeId = null,
        public readonly ?string $priorityId = null,
        public readonly ?string $statusId = null,
        public readonly ?string $startDate = null,
        public readonly ?string $dueDate = null,
        public readonly float $estimatedHours = 0,
        public readonly array $assignees = [],
        public readonly array $watchers = [],
        public readonly array $customFields = []
    ) {}
}
