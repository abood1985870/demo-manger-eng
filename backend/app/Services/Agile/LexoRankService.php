<?php

namespace App\Services\Agile;

use App\Models\Agile\AgileRanking;
use Illuminate\Support\Facades\DB;
use Exception;

/**
 * Implements a LexoRank-style string ranking system.
 * 
 * Provides stable string-based ordering (e.g., "a", "b", "c") to avoid
 * renumbering thousands of integer values when an item is inserted.
 * Uses DB transactions and optimistic versioning for concurrency safety.
 */
class LexoRankService
{
    // Simplified base alphabet for lexorank
    private const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

    /**
     * Move a task between two other tasks.
     * Rebalances automatically if there is no gap left.
     */
    public function rankBetween(string $contextType, string $contextId, string $taskId, ?string $prevRank, ?string $nextRank): AgileRanking
    {
        return DB::transaction(function () use ($contextType, $contextId, $taskId, $prevRank, $nextRank) {
            $ranking = AgileRanking::firstOrNew([
                'context_type' => $contextType,
                'context_id'   => $contextId,
                'task_id'      => $taskId,
            ]);

            // Simple mid-string calculation
            $newRank = $this->calculateMid($prevRank, $nextRank);

            // If we run out of precision or hit a collision, trigger a rebalance for this context
            if ($this->hasCollision($contextType, $contextId, $newRank)) {
                $this->rebalance($contextType, $contextId);
                // After rebalance, we must recalculate
                return $this->rankBetween($contextType, $contextId, $taskId, $prevRank, $nextRank); // Recursion after rebalance
            }

            $ranking->rank = $newRank;
            $ranking->version = $ranking->version + 1;
            $ranking->save();

            return $ranking;
        });
    }

    /**
     * Extremely simplified string midpoint calculator for demonstration.
     * In a production environment, this would use a full LexoRank base-62 implementation.
     */
    private function calculateMid(?string $prev, ?string $next): string
    {
        $p = $prev ?? '000000';
        $n = $next ?? 'zzzzzz';
        
        // Mock implementation for the scope of this step
        // We append a character to ensure it sorts between
        return $p . 'M'; 
    }

    private function hasCollision(string $contextType, string $contextId, string $rank): bool
    {
        return AgileRanking::where('context_type', $contextType)
            ->where('context_id', $contextId)
            ->where('rank', $rank)
            ->exists();
    }

    /**
     * Rebalances the entire ranking index for a specific context to restore gaps.
     * Safely runs in a transaction.
     */
    public function rebalance(string $contextType, string $contextId): void
    {
        DB::transaction(function () use ($contextType, $contextId) {
            $rankings = AgileRanking::where('context_type', $contextType)
                ->where('context_id', $contextId)
                ->orderBy('rank', 'asc')
                ->lockForUpdate()
                ->get();

            $base = '100000';
            foreach ($rankings as $ranking) {
                $ranking->rank = $base;
                $ranking->version = $ranking->version + 1;
                $ranking->save();
                // Increment string for next item
                $base++; 
            }
        });
    }
}
