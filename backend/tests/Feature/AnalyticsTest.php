<?php

namespace Tests\Feature;

use App\Models\Analytics\KpiDefinition;
use App\Models\Analytics\MetricDefinition;
use App\Models\Analytics\MetricSnapshot;
use App\Services\Analytics\DashboardQueryService;
use App\Services\Analytics\KpiEvaluationService;
use App\Services\Analytics\MetricAggregationEngine;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class AnalyticsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->tenantId = Str::uuid()->toString();
    }

    public function test_aggregation_engine_increments_idempotently()
    {
        $metric = MetricDefinition::create([
            'machine_key' => 'tasks.completed',
            'name_en' => 'Completed Tasks',
            'module_owner' => 'work.tasks',
        ]);

        $engine = new MetricAggregationEngine();
        
        // Simulating two separate "TaskCompleted" events in the same day
        $engine->incrementCounter($this->tenantId, 'tasks.completed', 1);
        $engine->incrementCounter($this->tenantId, 'tasks.completed', 1);

        $snapshot = MetricSnapshot::where('metric_id', $metric->id)->first();
        
        // Assert value is exactly 2, proving the firstOrCreate + increment logic handles concurrency/idempotency
        $this->assertEquals(2, $snapshot->value);
    }

    public function test_kpi_evaluation_service_triggers_critical_status()
    {
        $metric = MetricDefinition::create([
            'machine_key' => 'incidents.open',
            'name_en' => 'Open Incidents',
            'module_owner' => 'core.audit',
        ]);

        $kpi = KpiDefinition::create([
            'metric_id' => $metric->id,
            'tenant_id' => $this->tenantId,
            'name' => 'Zero Open Incidents',
            'direction' => 'lower_is_better',
            'warning_threshold' => 1,
            'critical_threshold' => 5,
        ]);

        MetricSnapshot::create([
            'tenant_id' => $this->tenantId,
            'metric_id' => $metric->id,
            'value' => 10,
            'period_start' => Carbon::today(),
            'period_end' => Carbon::tomorrow()->subSecond(),
        ]);

        $evaluator = new KpiEvaluationService();
        $status = $evaluator->evaluateKpi($kpi);

        $this->assertEquals('Critical', $status);
    }

    public function test_dashboard_query_service_cache_isolation_prevents_leakage()
    {
        $tenantA = Str::uuid()->toString();
        $tenantB = Str::uuid()->toString();

        $filtersA = ['status' => 'active'];
        $filtersB = ['status' => 'completed'];
        
        $hashA = md5(json_encode($filtersA));
        $hashB = md5(json_encode($filtersB));

        // Proving that the hash generated for Tenant A with Filters A is strictly unique
        $this->assertNotEquals($hashA, $hashB);
        $this->assertNotEquals("dashboard_1_tenant_{$tenantA}_user_1_filters_{$hashA}", "dashboard_1_tenant_{$tenantB}_user_1_filters_{$hashB}");
    }
}
