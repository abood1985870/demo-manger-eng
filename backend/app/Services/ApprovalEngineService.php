<?php

namespace App\Services;

use App\Models\WorkflowApproval;
use App\Models\ApprovalDecision;
use App\DTOs\Workflow\CreateApprovalDecisionDTO;
use Illuminate\Support\Facades\DB;
use Exception;

class ApprovalEngineService
{
    /**
     * Submit an approval decision (Approve/Reject).
     */
    public function makeDecision(CreateApprovalDecisionDTO $dto, int $userId)
    {
        return DB::transaction(function () use ($dto, $userId) {
            
            $decision = ApprovalDecision::create([
                'approval_step_id' => $dto->approvalStepId,
                'decided_by' => $userId,
                'decision' => $dto->decision, // approved, rejected
                'comments' => $dto->comments,
            ]);

            $this->evaluateApprovalState($decision->approval_step_id);

            return $decision;
        });
    }

    /**
     * Evaluate if the parallel or sequential block is complete.
     */
    protected function evaluateApprovalState(string $approvalStepId)
    {
        // 1. Fetch step and related workflow_approval.
        // 2. If it's a Parallel Approval, check if all assignees have decided.
        // 3. If someone rejected, and policy is "Fast Fail", immediately fail the block.
        // 4. If the block passes, push the next DAG node into the WorkflowEngine Queue.
    }
}
