<?php

namespace App\Http\Controllers;

use App\Services\WorkflowEngineService;
use App\DTOs\Workflow\ExecuteWorkflowDTO;
use Illuminate\Http\Request;

class WorkflowExecutionController extends Controller
{
    protected WorkflowEngineService $engine;

    public function __construct(WorkflowEngineService $engine)
    {
        $this->engine = $engine;
    }

    /**
     * Manually trigger a workflow (e.g. from a UI button or API).
     */
    public function execute(Request $request, string $workflowVersionId)
    {
        $dto = new ExecuteWorkflowDTO(
            workflowVersionId: $workflowVersionId,
            triggerType: 'api',
            initialPayload: $request->all()
        );

        $run = $this->engine->startWorkflow($dto);

        return response()->json($run, 202); // 202 Accepted because execution happens async in Queue
    }
}
