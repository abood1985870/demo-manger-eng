<?php

namespace Tests\Unit\Scheduling;

use App\Services\Scheduling\CalendarAwareDurationService;
use App\Services\Scheduling\CriticalPathService;
use App\Services\Scheduling\DependencyCycleDetector;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Collection;
use Tests\TestCase;

class CriticalPathTest extends TestCase
{
    protected CriticalPathService $cpm;
    protected DependencyCycleDetector $cycleDetector;
    protected CalendarAwareDurationService $calendar;

    protected function setUp(): void
    {
        parent::setUp();
        $this->calendar      = new CalendarAwareDurationService();
        $this->cpm           = new CriticalPathService($this->calendar);
        $this->cycleDetector = new DependencyCycleDetector();
    }

    /** Simple 3-task linear schedule: A → B → C */
    public function test_forward_pass_linear_chain()
    {
        $items = $this->makeItems([
            ['id' => 'A', 'duration_days' => 5],
            ['id' => 'B', 'duration_days' => 3],
            ['id' => 'C', 'duration_days' => 4],
        ]);

        $deps = [
            ['pred' => 'A', 'succ' => 'B', 'type' => 'FS', 'lag' => 0, 'unit' => 'days'],
            ['pred' => 'B', 'succ' => 'C', 'type' => 'FS', 'lag' => 0, 'unit' => 'days'],
        ];

        $results = $this->cpm->calculate($items, $deps, Carbon::parse('2025-01-06'), 0);

        // All items are on critical path (no parallel branches)
        $this->assertTrue($results['A']['is_critical'], 'A should be critical');
        $this->assertTrue($results['B']['is_critical'], 'B should be critical');
        $this->assertTrue($results['C']['is_critical'], 'C should be critical');

        // Total float for all items should be 0
        $this->assertEquals(0, $results['A']['TF']);
        $this->assertEquals(0, $results['B']['TF']);
        $this->assertEquals(0, $results['C']['TF']);
    }

    /** Schedule with parallel path — non-critical branch has positive float */
    public function test_parallel_branch_has_positive_float()
    {
        // A → B (5 days) critical
        // A → C (2 days) non-critical; both B and C merge into D
        $items = $this->makeItems([
            ['id' => 'A', 'duration_days' => 2],
            ['id' => 'B', 'duration_days' => 5], // longer path
            ['id' => 'C', 'duration_days' => 2], // shorter, parallel
            ['id' => 'D', 'duration_days' => 3],
        ]);

        $deps = [
            ['pred' => 'A', 'succ' => 'B', 'type' => 'FS', 'lag' => 0, 'unit' => 'days'],
            ['pred' => 'A', 'succ' => 'C', 'type' => 'FS', 'lag' => 0, 'unit' => 'days'],
            ['pred' => 'B', 'succ' => 'D', 'type' => 'FS', 'lag' => 0, 'unit' => 'days'],
            ['pred' => 'C', 'succ' => 'D', 'type' => 'FS', 'lag' => 0, 'unit' => 'days'],
        ];

        $results = $this->cpm->calculate($items, $deps, Carbon::parse('2025-01-06'), 0);

        $this->assertTrue($results['B']['is_critical'],  'B (longer path) should be critical');
        $this->assertFalse($results['C']['is_critical'], 'C (shorter path) should NOT be critical');
        $this->assertGreaterThan(0, $results['C']['TF'], 'C should have positive float');
    }

    /** Cycle detection: A → B → C → A */
    public function test_cycle_detection_throws_exception()
    {
        $this->expectException(Exception::class);
        $this->expectExceptionMessage('Circular dependency detected');

        $this->cycleDetector->detect(
            ['A', 'B', 'C'],
            [
                ['from' => 'A', 'to' => 'B'],
                ['from' => 'B', 'to' => 'C'],
                ['from' => 'C', 'to' => 'A'], // ← cycle
            ]
        );
    }

    /** Self-dependency is detected */
    public function test_self_dependency_is_detected()
    {
        $this->assertTrue($this->cycleDetector->hasSelfDependency('X', 'X'));
        $this->assertFalse($this->cycleDetector->hasSelfDependency('X', 'Y'));
    }

    /** Lag test: 2-day lag in FS dependency pushes successor start */
    public function test_lag_pushes_successor_start()
    {
        $items = $this->makeItems([
            ['id' => 'A', 'duration_days' => 3],
            ['id' => 'B', 'duration_days' => 3],
        ]);

        $deps = [
            ['pred' => 'A', 'succ' => 'B', 'type' => 'FS', 'lag' => 2, 'unit' => 'days'],
        ];

        $start   = Carbon::parse('2025-01-06'); // Monday
        $results = $this->cpm->calculate($items, $deps, $start, 0);

        $aEF = Carbon::parse($results['A']['EF']);
        $bES = Carbon::parse($results['B']['ES']);

        // B's ES should be 2 working days after A's EF
        $this->assertGreaterThan($aEF->toDateString(), $bES->toDateString());
    }

    /** Negative float: if constraint forces finish earlier than ES allows */
    public function test_no_float_means_critical()
    {
        $items = $this->makeItems([
            ['id' => 'A', 'duration_days' => 10],
        ]);

        $results = $this->cpm->calculate($items, [], Carbon::parse('2025-01-06'), 0);

        $this->assertEquals(0, $results['A']['TF']);
        $this->assertTrue($results['A']['is_critical']);
    }

    // ─── Helpers ────────────────────────────────────────────────────────────────

    protected function makeItems(array $defs): Collection
    {
        return collect($defs)->map(function ($def) {
            $obj = new \stdClass();
            $obj->id              = $def['id'];
            $obj->duration_days   = $def['duration_days'];
            $obj->planned_start   = null;
            $obj->is_milestone    = false;
            $obj->scheduling_mode = 'auto';
            $obj->calendar_id     = null;
            return $obj;
        });
    }
}
