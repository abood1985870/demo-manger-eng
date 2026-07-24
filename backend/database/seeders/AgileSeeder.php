<?php

namespace Database\Seeders;

use App\Models\Agile\AgileBoard;
use App\Models\Agile\AgileBoardColumn;
use App\Models\Agile\AgileEstimationScheme;
use App\Models\Agile\AgileServiceClass;
use App\Models\Agile\AgileWorkspace;
use App\Models\Tenant;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class AgileSeeder extends Seeder
{
    public function run(): void
    {
        $tenantId = Tenant::first()->id ?? Str::uuid()->toString();
        if (!Tenant::find($tenantId)) {
            Tenant::create(['id' => $tenantId, 'name' => 'Default Seeder Tenant', 'domain' => 'default.local']);
        }

        // Service Classes
        AgileServiceClass::firstOrCreate(
            ['name' => 'Standard'],
            ['tenant_id' => $tenantId, 'color' => '#3b82f6', 'wip_limit' => null]
        );
        AgileServiceClass::firstOrCreate(
            ['name' => 'Expedite'],
            ['tenant_id' => $tenantId, 'color' => '#ef4444', 'wip_limit' => 1]
        );

        // Estimation Scheme
        $scheme = AgileEstimationScheme::firstOrCreate(
            ['name' => 'Fibonacci'],
            [
                'tenant_id' => $tenantId,
                'type' => 'story_points',
                'values' => [1, 2, 3, 5, 8, 13, 21],
                'is_default' => true,
            ]
        );

        // Workspace
        $workspace = AgileWorkspace::firstOrCreate(
            ['name' => 'Global Engineering Workspace'],
            ['tenant_id' => $tenantId, 'description' => 'Default workspace for development teams.']
        );

        // Scrum Board
        $scrumBoard = AgileBoard::firstOrCreate(
            ['name' => 'Alpha Team Scrum Board'],
            [
                'tenant_id' => $tenantId,
                'workspace_id' => $workspace->id,
                'type' => 'scrum',
                'estimation_scheme_id' => $scheme->id,
            ]
        );

        if ($scrumBoard->columns()->count() === 0) {
            AgileBoardColumn::create(['board_id' => $scrumBoard->id, 'name_en' => 'To Do', 'sequence' => 1, 'category' => 'todo']);
            AgileBoardColumn::create(['board_id' => $scrumBoard->id, 'name_en' => 'In Progress', 'sequence' => 2, 'category' => 'in_progress', 'is_commitment_point' => true]);
            AgileBoardColumn::create(['board_id' => $scrumBoard->id, 'name_en' => 'Review', 'sequence' => 3, 'category' => 'in_progress']);
            AgileBoardColumn::create(['board_id' => $scrumBoard->id, 'name_en' => 'Done', 'sequence' => 4, 'category' => 'done', 'is_done' => true, 'is_delivery_point' => true]);
        }

        // Kanban Board
        $kanbanBoard = AgileBoard::firstOrCreate(
            ['name' => 'Support Kanban Board'],
            [
                'tenant_id' => $tenantId,
                'workspace_id' => $workspace->id,
                'type' => 'kanban',
            ]
        );

        if ($kanbanBoard->columns()->count() === 0) {
            AgileBoardColumn::create(['board_id' => $kanbanBoard->id, 'name_en' => 'Backlog', 'sequence' => 1, 'category' => 'backlog']);
            AgileBoardColumn::create(['board_id' => $kanbanBoard->id, 'name_en' => 'Next', 'sequence' => 2, 'category' => 'todo', 'wip_limit' => 5]);
            AgileBoardColumn::create(['board_id' => $kanbanBoard->id, 'name_en' => 'In Progress', 'sequence' => 3, 'category' => 'in_progress', 'wip_limit' => 3, 'is_commitment_point' => true]);
            AgileBoardColumn::create(['board_id' => $kanbanBoard->id, 'name_en' => 'Done', 'sequence' => 4, 'category' => 'done', 'is_done' => true, 'is_delivery_point' => true]);
        }
    }
}
