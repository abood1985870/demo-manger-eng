<?php

namespace App\Services;

use Exception;

class ModuleManifestParserService
{
    /**
     * Parses and validates a JSON string representing a module manifest.
     */
    public function parse(string $jsonPayload): array
    {
        $data = json_decode($jsonPayload, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception("Invalid JSON format.");
        }

        $this->validateSchema($data);

        return $data;
    }

    protected function validateSchema(array $data)
    {
        $requiredFields = ['machine_key', 'name', 'version'];
        
        foreach ($requiredFields as $field) {
            if (empty($data[$field])) {
                throw new Exception("Manifest is missing required field: {$field}");
            }
        }
        
        // Semantic version validation (very basic Regex)
        if (!preg_match('/^(\d+\.)?(\d+\.)?(\*|\d+)$/', $data['version'])) {
            throw new Exception("Invalid semantic version format.");
        }
    }

    /**
     * Detects circular dependencies in an array of module definitions.
     * Expects format: ['module_key' => ['dep1', 'dep2']]
     */
    public function detectCircularDependencies(array $moduleDependencyGraph): void
    {
        $visited = [];
        $recursionStack = [];

        foreach (array_keys($moduleDependencyGraph) as $node) {
            if ($this->hasCycle($node, $moduleDependencyGraph, $visited, $recursionStack)) {
                throw new Exception("Circular dependency detected involving module: {$node}");
            }
        }
    }

    protected function hasCycle($node, $graph, &$visited, &$recursionStack): bool
    {
        if (isset($recursionStack[$node]) && $recursionStack[$node]) {
            return true;
        }

        if (isset($visited[$node]) && $visited[$node]) {
            return false;
        }

        $visited[$node] = true;
        $recursionStack[$node] = true;

        $neighbors = $graph[$node] ?? [];
        foreach ($neighbors as $neighbor) {
            if ($this->hasCycle($neighbor, $graph, $visited, $recursionStack)) {
                return true;
            }
        }

        $recursionStack[$node] = false;
        return false;
    }
}
