<?php

namespace Tests\Feature\Agile;

use App\Models\Agile\AgileBoard;
use App\Models\Agile\AgileSprint;
use App\Models\Tenant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class AgileBoardFeatureTest extends TestCase
{
    use RefreshDatabase;

    protected string $tenantId;

    protected function setUp(): void
    {
        parent::setUp();
        $this->tenantId = Str::uuid()->toString();
    }

    public function test_sprint_start_requires_planned_status()
    {
        $board = AgileBoard::create([
            'id'        => Str::uuid(),
            'tenant_id' => $this->tenantId,
            'name'      => 'Test Scrum Board',
            'type'      => 'scrum'
        ]);

        $sprint = AgileSprint::create([
            'id'            => Str::uuid(),
            'tenant_id'     => $this->tenantId,
            'board_id'      => $board->id,
            'name_en'       => 'Sprint 1',
            'sprint_number' => 1,
            'status'        => 'Completed' // Already completed
        ]);

        $this->expectException(\DomainException::class);
        $this->expectExceptionMessage('Only Planned sprints can be started.');

        app(\App\Services\Agile\SprintLifecycleService::class)->startSprint($sprint, 1);
    }
}
