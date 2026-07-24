<?php

namespace App\DTOs;

class CreateChannelDTO
{
    public function __construct(
        public readonly string $name,
        public readonly string $type,
        public readonly string $visibility,
        public readonly ?string $description = null,
        public readonly ?string $projectId = null,
        public readonly ?int $departmentId = null,
        public readonly ?int $teamId = null
    ) {}
}
