<?php

namespace App\Services\Analytics\Providers;

use App\Contracts\Analytics\WidgetDataProviderInterface;
use App\DTOs\Analytics\WidgetResponseDTO;
use App\Models\Analytics\Widget;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class KpiCardProvider implements WidgetDataProviderInterface
{
    public function getSupportedType(): string
    {
        return 'kpi_card';
    }

    public function validateConfig(array $config): void
    {
        if (empty($config['metric_key'])) {
            throw new InvalidArgumentException("KPI Card requires a 'metric_key'.");
        }
    }

    public function getData(Widget $widget, string $tenantId, array $filters = []): WidgetResponseDTO
    {
        $this->validateConfig($widget->configuration);
        $metricKey = $widget->configuration['metric_key'];

        $dto = new WidgetResponseDTO();
        $dto->widget_id = $widget->id;
        $dto->widget_type = $this->getSupportedType();
        $dto->title = $widget->title ?? 'KPI';
        $dto->calculated_at = now()->toIso8601String();

        // Hardcoding the "Real Analytics Data" queries for demonstration
        if ($metricKey === 'tasks.open') {
            $value = DB::table('tasks')
                ->where('tenant_id', $tenantId)
                ->where('status', 'open')
                ->count();
        } elseif ($metricKey === 'projects.active') {
            $value = DB::table('projects')
                ->where('tenant_id', $tenantId)
                ->where('status', 'active')
                ->count();
        } else {
            // Fallback to read-model snapshots if it's an aggregated metric
            $value = DB::table('metric_snapshots')
                ->join('metric_definitions', 'metric_definitions.id', '=', 'metric_snapshots.metric_id')
                ->where('metric_snapshots.tenant_id', $tenantId)
                ->where('metric_definitions.machine_key', $metricKey)
                ->sum('metric_snapshots.value');
        }

        $dto->value = (float) $value;
        return $dto;
    }
}
