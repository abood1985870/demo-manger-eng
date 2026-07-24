<?php

namespace Database\Seeders;

use App\Models\Module;
use App\Models\ProductEdition;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class PlatformArchitectureSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Seed Modules from Steps 1-10
        $modules = [
            ['key' => 'core.identity', 'name' => 'Identity & Access'],
            ['key' => 'core.organizations', 'name' => 'Organizations & Tenants'],
            ['key' => 'core.rbac', 'name' => 'Role-Based Access Control'],
            ['key' => 'core.audit', 'name' => 'Audit Logging'],
            ['key' => 'core.workflow', 'name' => 'Workflow Engine'],
            ['key' => 'core.notifications', 'name' => 'Notification Engine'],
            ['key' => 'work.projects', 'name' => 'Project Management'],
            ['key' => 'work.tasks', 'name' => 'Task Management'],
            ['key' => 'work.documents', 'name' => 'Document Management'],
            ['key' => 'work.calendar', 'name' => 'Calendar & Scheduling'],
            ['key' => 'work.meetings', 'name' => 'Meeting Management'],
            ['key' => 'legal.cases', 'name' => 'Legal Case Management'], // Placeholder
        ];

        foreach ($modules as $mod) {
            Module::firstOrCreate(
                ['machine_key' => $mod['key']],
                [
                    'name_en' => $mod['name'],
                    'is_core' => str_starts_with($mod['key'], 'core.'),
                    'is_installed' => true,
                    'is_enabled' => true,
                    'health_status' => 'healthy'
                ]
            );
        }

        // 2. Seed EWOS Enterprise Edition
        ProductEdition::firstOrCreate(
            ['machine_key' => 'ewos-enterprise'],
            ['name_en' => 'EWOS Enterprise', 'description' => 'General Business Edition']
        );

        // 3. Seed EWOS Legal Saudi Edition (Placeholder)
        ProductEdition::firstOrCreate(
            ['machine_key' => 'ewos-legal-saudi'],
            ['name_en' => 'EWOS Legal Saudi', 'description' => 'Saudi Legal Practice Edition']
        );
    }
}
