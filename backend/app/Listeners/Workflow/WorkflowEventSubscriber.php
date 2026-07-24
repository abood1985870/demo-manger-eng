<?php

namespace App\Listeners\Workflow;

use Illuminate\Events\Dispatcher;
use App\Models\Workflow;
use App\Services\WorkflowEngineService;

class WorkflowEventSubscriber
{
    /**
     * Handle global application events and route them to the Workflow Engine.
     */
    public function handleApplicationEvent(object $event)
    {
        $eventName = get_class($event);
        
        // Find all active workflows that trigger on this specific event.
        // In a real implementation, we would query the active DAGs for Triggers matching $eventName.
        $activeWorkflows = Workflow::where('is_active', true)->get();

        $engine = app(WorkflowEngineService::class);

        foreach ($activeWorkflows as $workflow) {
            // Simplified check: if workflow has a trigger for this event
            // $engine->evaluateTrigger($workflow, $eventName, (array) $event);
        }
    }

    /**
     * Register the listeners for the subscriber.
     */
    public function subscribe(Dispatcher $events): array
    {
        return [
            // Subscribe to wildcard events or specific EDMS/EPM events
            'App\Events\*' => 'handleApplicationEvent',
        ];
    }
}
