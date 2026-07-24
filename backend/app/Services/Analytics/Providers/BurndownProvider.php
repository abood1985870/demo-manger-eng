<?php

namespace App\Services\Analytics\Providers;

use App\Contracts\Analytics\WidgetDataProviderInterface;
use App\DTOs\Analytics\WidgetResponseDTO;
use App\Models\Analytics\Widget;
use Illuminate\Support\Facades\DB;

class BurndownProvider implements WidgetDataProviderInterface
{
    public function getSupportedType(): string
    {
        return 'burndown';
    }

    public function validateConfig(array $config): void
    {
        if (empty($config['project_id'])) {
            throw new \InvalidArgumentException("Burndown requires 'project_id'.");
        }
    }

    public function getData(Widget $widget, string $tenantId, array $filters = []): WidgetResponseDTO
    {
        $this->validateConfig($widget->configuration);
        $projectId = $widget->configuration['project_id'];

        $dto = new WidgetResponseDTO();
        $dto->widget_id = $widget->id;
        $dto->widget_type = $this->getSupportedType();
        $dto->title = $widget->title ?? 'Burndown';
        $dto->calculated_at = now()->toIso8601String();

        // NOTE: Since historical task_activity_logs are not populated in the current dataset,
        // we rely on metric_snapshots created incrementally by MetricAggregationEngine.
        $snapshots = DB::table('metric_snapshots')
            ->join('metric_definitions', 'metric_definitions.id', '=', 'metric_snapshots.metric_id')
            ->select(DB::raw("date_trunc('day', period_end) as day"), DB::raw("SUM(value) as tasks_remaining"))
            ->where('metric_snapshots.tenant_id', $tenantId)
            ->where('metric_snapshots.project_id', $projectId)
            ->where('metric_definitions.machine_key', 'tasks.remaining')
            ->groupBy('day')
            ->orderBy('day')
            ->get();

        if ($snapshots->isEmpty()) {
            $dto->warnings = "No historical snapshots available for this project.";
        } else {
            foreach ($snapshots as $row) {
                $dto->labels[] = $row->day;
                $dto->series['actual'][] = (float) $row->tasks_remaining;
            }
        }

        return $dto;
    }
}
