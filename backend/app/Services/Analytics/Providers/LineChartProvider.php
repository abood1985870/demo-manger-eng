<?php

namespace App\Services\Analytics\Providers;

use App\Contracts\Analytics\WidgetDataProviderInterface;
use App\DTOs\Analytics\WidgetResponseDTO;
use App\Models\Analytics\Widget;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class LineChartProvider implements WidgetDataProviderInterface
{
    public function getSupportedType(): string
    {
        return 'line_chart';
    }

    public function validateConfig(array $config): void
    {
        if (empty($config['metric_key']) || empty($config['time_bucket'])) {
            throw new InvalidArgumentException("Line Chart requires 'metric_key' and 'time_bucket'.");
        }
    }

    public function getData(Widget $widget, string $tenantId, array $filters = []): WidgetResponseDTO
    {
        $this->validateConfig($widget->configuration);
        $metricKey = $widget->configuration['metric_key'];

        $dto = new WidgetResponseDTO();
        $dto->widget_id = $widget->id;
        $dto->widget_type = $this->getSupportedType();
        $dto->title = $widget->title ?? 'Trend';
        $dto->calculated_at = now()->toIso8601String();

        // Using PostgreSQL date_trunc for time bucketing
        $results = DB::table('metric_snapshots')
            ->join('metric_definitions', 'metric_definitions.id', '=', 'metric_snapshots.metric_id')
            ->select(
                DB::raw("date_trunc('day', period_end) as bucket"),
                DB::raw("SUM(value) as total")
            )
            ->where('metric_snapshots.tenant_id', $tenantId)
            ->where('metric_definitions.machine_key', $metricKey)
            ->groupBy('bucket')
            ->orderBy('bucket')
            ->get();

        foreach ($results as $row) {
            $dto->labels[] = $row->bucket;
            $dto->series[] = (float) $row->total;
        }

        return $dto;
    }
}
