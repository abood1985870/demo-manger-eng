<?php

namespace App\Http\Controllers;

use App\Services\ApprovalEngineService;
use App\DTOs\Workflow\CreateApprovalDecisionDTO;
use Illuminate\Http\Request;

class ApprovalController extends Controller
{
    protected ApprovalEngineService $approvalService;

    public function __construct(ApprovalEngineService $approvalService)
    {
        $this->approvalService = $approvalService;
    }

    public function decide(Request $request, string $approvalStepId)
    {
        $validated = $request->validate([
            'decision' => 'required|in:approved,rejected',
            'comments' => 'nullable|string'
        ]);

        $dto = new CreateApprovalDecisionDTO(
            approvalStepId: $approvalStepId,
            decision: $validated['decision'],
            comments: $validated['comments'] ?? null
        );

        $userId = $request->user()->id ?? 1;
        $decision = $this->approvalService->makeDecision($dto, $userId);

        return response()->json($decision);
    }
}
