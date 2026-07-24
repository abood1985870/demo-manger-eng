<?php

namespace App\Services\Analytics;

use App\Models\Analytics\KpiDefinition;
use App\Models\Analytics\MetricSnapshot;
use Carbon\Carbon;

class KpiEvaluationService
{
    /**
     * Evaluates a KPI against its targets and thresholds.
     */
    public function evaluateKpi(KpiDefinition $kpi): string
    {
        // Get the latest snapshot value for this KPI's metric
        $latestSnapshot = MetricSnapshot::where('metric_id', $kpi->metric_id)
            ->where('tenant_id', $kpi->tenant_id)
            ->orderBy('period_end', 'desc')
            ->first();

        if (!$latestSnapshot) {
            $kpi->update(['status' => 'Not Calculated']);
            return 'Not Calculated';
        }

        $value = $latestSnapshot->value;
        $status = 'On Track';

        if ($kpi->direction === 'higher_is_better') {
            if ($kpi->critical_threshold && $value <= $kpi->critical_threshold) {
                $status = 'Critical';
            } elseif ($kpi->warning_threshold && $value <= $kpi->warning_threshold) {
                $status = 'Warning';
            }
        } elseif ($kpi->direction === 'lower_is_better') {
            if ($kpi->critical_threshold && $value >= $kpi->critical_threshold) {
                $status = 'Critical';
            } elseif ($kpi->warning_threshold && $value >= $kpi->warning_threshold) {
                $status = 'Warning';
            }
        }

        $kpi->update(['status' => $status]);

        return $status;
    }
}
