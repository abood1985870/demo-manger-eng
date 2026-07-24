<?php

namespace App\Contracts\Workflow;

interface ActionInterface
{
    /**
     * Execute the action.
     * Must return an array of outputs or throw an exception on failure.
     */
    public function execute(array $payload, array $context): array;
}
