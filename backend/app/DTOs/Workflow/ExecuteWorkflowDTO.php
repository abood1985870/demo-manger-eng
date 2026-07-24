<?php

namespace App\DTOs\Workflow;

class ExecuteWorkflowDTO
{
    public function __construct(
        public readonly string $workflowVersionId,
        public readonly string $triggerType,
        public readonly array $initialPayload = []
    ) {}
}
