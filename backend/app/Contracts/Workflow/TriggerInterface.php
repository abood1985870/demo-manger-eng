<?php

namespace App\Contracts\Workflow;

interface TriggerInterface
{
    /**
     * Determine if this trigger should fire based on the event payload.
     */
    public function shouldFire(array $eventPayload, array $triggerConfiguration): bool;

    /**
     * Map the event payload to workflow variables.
     */
    public function extractVariables(array $eventPayload): array;
}
