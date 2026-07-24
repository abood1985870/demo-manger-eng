<?php

namespace App\Services\Analytics;

use App\Models\Analytics\MetricDefinition;
use App\Models\Analytics\MetricSnapshot;
use Carbon\Carbon;

class MetricAggregationEngine
{
    /**
     * Idempotent method to incrementally update a metric counter.
     * e.g. Event "TaskCompleted" triggers this for metric "tasks.completed"
     */
    public function incrementCounter(string $tenantId, string $metricKey, float $value = 1.0, ?array $dimensions = []): void
    {
        $metric = MetricDefinition::where('machine_key', $metricKey)->firstOrFail();

        // Standardize periods to daily snapshots for incremental events
        $periodStart = Carbon::today();
        $periodEnd = Carbon::tomorrow()->subSecond();

        $snapshot = MetricSnapshot::firstOrCreate(
            [
                'tenant_id' => $tenantId,
                'metric_id' => $metric->id,
                'period_start' => $periodStart,
                'period_end' => $periodEnd,
                'project_id' => $dimensions['project_id'] ?? null,
                'user_id' => $dimensions['user_id'] ?? null,
                'status_dimension' => $dimensions['status'] ?? null,
            ],
            ['value' => 0]
        );

        // Concurrency-safe atomic increment
        $snapshot->increment('value', $value);
    }
}
