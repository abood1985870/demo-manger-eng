<?php

namespace App\Services\Scheduling;

use App\Models\Scheduling\ScheduleItemDependency;
use Exception;

/**
 * Detects cycles in a directed dependency graph using Depth-First Search (DFS).
 * A cycle (e.g., A→B→C→A) makes a schedule impossible to calculate.
 */
class DependencyCycleDetector
{
    /**
     * @param array $items      Array of item IDs in the schedule
     * @param array $edges      Array of ['from' => predecessor_id, 'to' => successor_id]
     * @throws Exception        If a cycle is detected, with cycle path detail
     */
    public function detect(array $items, array $edges): void
    {
        $graph = [];
        foreach ($items as $id) {
            $graph[$id] = [];
        }
        foreach ($edges as $edge) {
            $graph[$edge['from']][] = $edge['to'];
        }

        $visited = [];
        $recursionStack = [];
        $cyclePath = [];

        foreach ($items as $id) {
            if (!isset($visited[$id])) {
                if ($this->dfs($id, $graph, $visited, $recursionStack, $cyclePath)) {
                    throw new Exception(
                        "Circular dependency detected. Cycle path: " . implode(' → ', $cyclePath)
                    );
                }
            }
        }
    }

    private function dfs(string $node, array &$graph, array &$visited, array &$stack, array &$path): bool
    {
        $visited[$node] = true;
        $stack[$node] = true;

        foreach ($graph[$node] ?? [] as $neighbor) {
            if (!isset($visited[$neighbor])) {
                $path[] = $neighbor;
                if ($this->dfs($neighbor, $graph, $visited, $stack, $path)) {
                    return true;
                }
                array_pop($path);
            } elseif (isset($stack[$neighbor]) && $stack[$neighbor]) {
                $path[] = $neighbor; // close the cycle in the path
                return true;
            }
        }

        $stack[$node] = false;
        return false;
    }

    /**
     * Check for a self-dependency (item depends on itself).
     */
    public function hasSelfDependency(string $predecessorId, string $successorId): bool
    {
        return $predecessorId === $successorId;
    }
}
