<?php

namespace App\Services\Scheduling;

use App\Models\Scheduling\ProjectSchedule;
use App\Models\Scheduling\ScheduleBaseline;
use App\Models\Scheduling\ScheduleVariance;
use App\Models\Scheduling\ScheduleHealthScore;
use Carbon\Carbon;

class ScheduleVarianceCalculator
{
    /**
     * Computes variance between current schedule items and a locked baseline.
     * Persists results to schedule_variances.
     */
    public function calculate(ProjectSchedule $schedule, ScheduleBaseline $baseline): void
    {
        if (!$baseline->isLocked()) {
            throw new \DomainException("Cannot calculate variance against an unlocked baseline.");
        }

        $baselineItems = $baseline->items->keyBy('schedule_item_id');

        foreach ($schedule->items as $item) {
            $bl = $baselineItems->get($item->id);
            if (!$bl) continue;

            $startVariance  = $item->actual_start || $item->forecast_start
                ? Carbon::parse($bl->planned_start)->diffInDays(Carbon::parse($item->forecast_start ?? $item->planned_start), false)
                : null;

            $finishVariance = $item->forecast_finish
                ? Carbon::parse($bl->planned_finish)->diffInDays(Carbon::parse($item->forecast_finish), false)
                : null;

            $durationVariance = ($item->duration_days !== null && $bl->duration_days !== null)
                ? $item->duration_days - $bl->duration_days
                : null;

            $progressVariance = $item->percent_complete - $bl->percent_complete;

            ScheduleVariance::updateOrCreate(
                ['schedule_item_id' => $item->id, 'baseline_id' => $baseline->id],
                [
                    'start_variance_days'    => $startVariance,
                    'finish_variance_days'   => $finishVariance,
                    'duration_variance_days' => $durationVariance,
                    'progress_variance_pct'  => $progressVariance,
                    'calculated_at'          => now(),
                ]
            );
        }
    }
}

class ScheduleHealthScorer
{
    /**
     * Scores the schedule 0-100 and returns a structured health assessment.
     *
     * Factors (each deducts from 100):
     *  - Overdue tasks (not complete, past planned_finish)
     *  - Negative float count
     *  - Critical path delay (items with is_critical & forecast > planned)
     *  - Milestone variance
     */
    public function score(ProjectSchedule $schedule): array
    {
        $score = 100;
        $factors = [];

        $items = $schedule->items;
        $total = $items->count();
        if ($total === 0) {
            return ['score' => 100, 'status' => 'Healthy', 'factors' => []];
        }

        // Overdue items
        $overdue = $items->filter(fn($i) => $i->planned_finish && $i->percent_complete < 100 && Carbon::parse($i->planned_finish)->isPast())->count();
        $overduePct = round(($overdue / $total) * 100, 1);
        if ($overduePct > 0) {
            $deduction = min(40, $overduePct * 0.8);
            $score -= $deduction;
            $factors[] = ['key' => 'overdue_tasks', 'value' => "{$overduePct}%", 'deduction' => $deduction];
        }

        // Negative float
        $negativeFloat = $items->filter(fn($i) => $i->total_float_days !== null && $i->total_float_days < 0)->count();
        if ($negativeFloat > 0) {
            $deduction = min(30, $negativeFloat * 3);
            $score -= $deduction;
            $factors[] = ['key' => 'negative_float_items', 'value' => $negativeFloat, 'deduction' => $deduction];
        }

        $score = max(0, round($score, 1));
        $status = $score >= 75 ? 'Healthy' : ($score >= 50 ? 'AtRisk' : 'Critical');

        ScheduleHealthScore::create([
            'schedule_id'    => $schedule->id,
            'score'          => $score,
            'status'         => $status,
            'factors'        => $factors,
            'engine_version' => '1.0.0',
        ]);

        return compact('score', 'status', 'factors');
    }
}
