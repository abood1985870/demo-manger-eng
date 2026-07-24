<?php

namespace App\DTOs\Workflow;

class CreateApprovalDecisionDTO
{
    public function __construct(
        public readonly string $approvalStepId,
        public readonly string $decision, // 'approved' or 'rejected'
        public readonly ?string $comments = null
    ) {}
}
