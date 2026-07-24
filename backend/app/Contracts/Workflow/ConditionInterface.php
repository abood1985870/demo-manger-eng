<?php

namespace App\Contracts\Workflow;

interface ConditionInterface
{
    /**
     * Evaluate the condition based on workflow variables.
     */
    public function evaluate(array $configuration, array $variables): bool;
}
