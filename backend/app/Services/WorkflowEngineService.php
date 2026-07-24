<?php

namespace App\Services;

use App\Models\WorkflowVersion;
use App\Models\WorkflowRun;
use App\DTOs\Workflow\ExecuteWorkflowDTO;
use Illuminate\Support\Facades\DB;
use Exception;

class WorkflowEngineService
{
    /**
     * Start a new workflow execution.
     */
    public function startWorkflow(ExecuteWorkflowDTO $dto)
    {
        return DB::transaction(function () use ($dto) {
            $version = WorkflowVersion::findOrFail($dto->workflowVersionId);

            $run = WorkflowRun::create([
                'workflow_version_id' => $version->id,
                'status' => 'running',
                'trigger_type' => $dto->triggerType,
                'initial_payload' => $dto->initialPayload,
                'state' => [
                    'variables' => [],
                    'current_node' => 'start_node' // Assuming 'start_node' is the root of the DAG
                ],
            ]);

            // Dispatch to Queue:
            // ProcessWorkflowStepJob::dispatch($run->id, 'start_node');

            return $run;
        });
    }

    /**
     * Evaluates a node (Action, Condition, Trigger).
     * In reality, this would be inside a Queued Job.
     */
    public function processNode(string $runId, string $nodeId)
    {
        $run = WorkflowRun::findOrFail($runId);
        $dag = $run->version->dag_definition;

        // Traverse DAG JSON, resolve ActionInterface/ConditionInterface from Service Container,
        // execute it, update $run->state, and push the next step to the queue.
        
        // Pseudo logic:
        // $node = $dag['nodes'][$nodeId];
        // if ($node['type'] === 'action') {
        //     $action = app()->make($node['class']);
        //     $result = $action->execute($run->initial_payload, $run->state);
        //     ProcessWorkflowStepJob::dispatch($run->id, $node['next']);
        // }
    }
}
