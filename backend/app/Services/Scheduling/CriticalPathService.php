<?php

namespace App\Services\Scheduling;

use App\Models\Scheduling\ScheduleItem;
use App\Models\Scheduling\CriticalPathItem;
use Carbon\Carbon;
use Illuminate\Support\Collection;

/**
 * Implements the Critical Path Method (CPM) two-pass algorithm.
 *
 * Forward Pass (Early dates):
 *   ES(item) = max(EF(predecessor) + lag) for all predecessors
 *   EF(item) = ES(item) + Duration
 *
 * Backward Pass (Late dates):
 *   LF(item) = min(LS(successor) - lag) for all successors
 *   LS(item) = LF(item) - Duration
 *
 * Float:
 *   TotalFloat = LS - ES  (or LF - EF)
 *   FreeFloat  = min(ES_successor) - EF_item  for each link
 *
 * Critical = TF <= threshold (default 0)
 */
class CriticalPathService
{
    protected CalendarAwareDurationService $calendar;

    public function __construct(CalendarAwareDurationService $calendar)
    {
        $this->calendar = $calendar;
    }

    /**
     * Run the full CPM algorithm on a collection of schedule items.
     *
     * @param Collection $items   Collection of ScheduleItem models (all from one schedule)
     * @param array      $deps    Dependency edges: [['pred'=>id, 'succ'=>id, 'type'=>'FS', 'lag'=>0, 'unit'=>'days'], ...]
     * @param Carbon     $projectStart
     * @param int        $criticalThresholdDays
     * @return array     Keyed by item ID => ['ES', 'EF', 'LS', 'LF', 'TF', 'FF', 'is_critical']
     */
    public function calculate(
        Collection $items,
        array $deps,
        Carbon $projectStart,
        int $criticalThresholdDays = 0,
        ?string $calendarId = null
    ): array {
        $itemMap = $items->keyBy('id');
        $results = [];

        // Initialize all items
        foreach ($items as $item) {
            $results[$item->id] = [
                'ES' => null, 'EF' => null,
                'LS' => null, 'LF' => null,
                'TF' => null, 'FF' => null,
                'is_critical' => false,
            ];
        }

        // Build adjacency lists
        $successors   = []; // pred_id => [succ_id, ...]
        $predecessors = []; // succ_id => [{pred_id, type, lag}, ...]

        foreach ($deps as $dep) {
            $successors[$dep['pred']][]   = $dep['succ'];
            $predecessors[$dep['succ']][] = $dep;
        }

        // === FORWARD PASS ===
        $this->forwardPass($items, $predecessors, $projectStart, $calendarId, $results);

        // === BACKWARD PASS ===
        $projectEnd = collect($results)->max(fn($r) => $r['EF']);
        $this->backwardPass($items, $successors, $predecessors, $projectEnd, $calendarId, $results);

        // === FLOAT & CRITICAL PATH ===
        foreach ($items as $item) {
            if ($results[$item->id]['ES'] && $results[$item->id]['LS']) {
                $tf = Carbon::parse($results[$item->id]['LS'])
                            ->diffInDays(Carbon::parse($results[$item->id]['ES']), false);
                $results[$item->id]['TF'] = $tf;
                $results[$item->id]['is_critical'] = ($tf <= $criticalThresholdDays);
            }

            // Free Float: min(ES of all successors) - EF of this item
            $minSuccessorES = null;
            foreach (($successors[$item->id] ?? []) as $succId) {
                if ($results[$succId]['ES'] ?? null) {
                    $es = Carbon::parse($results[$succId]['ES']);
                    if ($minSuccessorES === null || $es->lt($minSuccessorES)) {
                        $minSuccessorES = $es;
                    }
                }
            }
            if ($minSuccessorES && $results[$item->id]['EF']) {
                $results[$item->id]['FF'] = Carbon::parse($results[$item->id]['EF'])->diffInDays($minSuccessorES, false);
            }
        }

        return $results;
    }

    protected function forwardPass(Collection $items, array &$predecessors, Carbon $projectStart, ?string $calendarId, array &$results): void
    {
        // Topological order (items with no predecessors first)
        $sorted = $this->topologicalSort($items->pluck('id')->toArray(), $predecessors);

        foreach ($sorted as $id) {
            $item = $items->firstWhere('id', $id);
            if (!$item) continue;

            $duration = (float)($item->duration_days ?? 0);

            if (empty($predecessors[$id])) {
                // No predecessors: start at project start
                $es = $projectStart->copy();
            } else {
                // ES = max EF of predecessors (adjusted for dependency type and lag)
                $maxEF = null;
                foreach ($predecessors[$id] as $dep) {
                    $predEF = $results[$dep['pred']]['EF'] ?? null;
                    if (!$predEF) continue;

                    $ef = $this->applyLag(Carbon::parse($predEF), $dep['lag'] ?? 0, $dep['unit'] ?? 'days', $calendarId);

                    if ($dep['type'] === 'SS') {
                        // Start-to-Start: ES of succ = ES of pred + lag
                        $ef = $this->applyLag(Carbon::parse($results[$dep['pred']]['ES']), $dep['lag'] ?? 0, $dep['unit'] ?? 'days', $calendarId);
                    }

                    if ($maxEF === null || $ef->gt($maxEF)) {
                        $maxEF = $ef;
                    }
                }
                $es = $maxEF ?? $projectStart->copy();
            }

            $ef = $this->calendar->addWorkingDays($es->copy(), $duration, $calendarId);

            $results[$id]['ES'] = $es->toDateString();
            $results[$id]['EF'] = $ef->toDateString();
        }
    }

    protected function backwardPass(Collection $items, array &$successors, array &$predecessors, ?string $projectEnd, ?string $calendarId, array &$results): void
    {
        $sorted = array_reverse($this->topologicalSort($items->pluck('id')->toArray(), $predecessors));
        $deadline = $projectEnd ? Carbon::parse($projectEnd) : Carbon::today()->addYear();

        foreach ($sorted as $id) {
            $item = $items->firstWhere('id', $id);
            if (!$item) continue;

            $duration = (float)($item->duration_days ?? 0);

            if (empty($successors[$id])) {
                $lf = $deadline->copy();
            } else {
                $minLS = null;
                foreach ($successors[$id] as $succId) {
                    $succLS = $results[$succId]['LS'] ?? null;
                    if (!$succLS) continue;
                    $ls = Carbon::parse($succLS);
                    if ($minLS === null || $ls->lt($minLS)) {
                        $minLS = $ls;
                    }
                }
                $lf = $minLS ?? $deadline->copy();
            }

            $ls = $this->calendar->addWorkingDays($lf->copy(), -$duration, $calendarId);

            $results[$id]['LF'] = $lf->toDateString();
            $results[$id]['LS'] = $ls->toDateString();
        }
    }

    protected function applyLag(Carbon $date, float $lag, string $unit, ?string $calendarId): Carbon
    {
        if ($lag == 0) return $date;

        return match ($unit) {
            'days', 'working_days' => $this->calendar->addWorkingDays($date, $lag, $calendarId),
            'calendar_days'        => $date->copy()->addDays((int)$lag),
            'hours'                => $date->copy()->addHours((int)$lag),
            'weeks'                => $date->copy()->addWeeks((int)$lag),
            default                => $date,
        };
    }

    protected function topologicalSort(array $ids, array &$predecessors): array
    {
        $inDegree = array_fill_keys($ids, 0);
        $adjList  = array_fill_keys($ids, []);

        foreach ($predecessors as $succId => $preds) {
            foreach ($preds as $dep) {
                $adjList[$dep['pred']][] = $succId;
                $inDegree[$succId]++;
            }
        }

        $queue = [];
        foreach ($inDegree as $id => $deg) {
            if ($deg === 0) $queue[] = $id;
        }

        $sorted = [];
        while (!empty($queue)) {
            $current = array_shift($queue);
            $sorted[] = $current;
            foreach ($adjList[$current] ?? [] as $neighbor) {
                $inDegree[$neighbor]--;
                if ($inDegree[$neighbor] === 0) {
                    $queue[] = $neighbor;
                }
            }
        }

        return $sorted;
    }
}
