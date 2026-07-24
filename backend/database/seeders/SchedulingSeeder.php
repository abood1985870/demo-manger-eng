<?php

namespace Database\Seeders;

use App\Models\Scheduling\ProjectSchedule;
use App\Models\Scheduling\ScheduleItem;
use App\Models\Scheduling\ScheduleItemDependency;
use App\Models\Tenant;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class SchedulingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Find or create a default tenant for seeding
        $tenantId = Tenant::first()->id ?? Str::uuid()->toString();
        if (!Tenant::find($tenantId)) {
            Tenant::create(['id' => $tenantId, 'name' => 'Default Seeder Tenant', 'domain' => 'default.local']);
        }

        // Idempotent Schedule Creation
        $schedule = ProjectSchedule::firstOrCreate(
            ['machine_key' => 'demo-project-schedule'],
            [
                'tenant_id' => $tenantId,
                'schedulable_type' => 'Project',
                'schedulable_id' => Str::uuid()->toString(), // Fake project ID for demo
                'name_en' => 'Software Release v1.0 Schedule',
                'type' => 'Project',
                'status' => 'Active',
                'planned_start' => Carbon::now()->addDays(1)->toDateString(),
                'planned_finish' => Carbon::now()->addDays(30)->toDateString(),
                'critical_float_threshold_days' => 0,
            ]
        );

        if ($schedule->items()->count() === 0) {
            // Create items (A, B, C, D)
            $itemA = ScheduleItem::create([
                'schedule_id' => $schedule->id,
                'title_en' => 'Requirement Gathering',
                'item_type' => 'task',
                'duration_days' => 5,
                'sequence' => 1,
                'wbs_code' => '1',
                'scheduling_mode' => 'auto',
            ]);

            $itemB = ScheduleItem::create([
                'schedule_id' => $schedule->id,
                'title_en' => 'Design',
                'item_type' => 'task',
                'duration_days' => 4,
                'sequence' => 2,
                'wbs_code' => '2',
                'scheduling_mode' => 'auto',
            ]);

            $itemC = ScheduleItem::create([
                'schedule_id' => $schedule->id,
                'title_en' => 'Implementation',
                'item_type' => 'task',
                'duration_days' => 10,
                'sequence' => 3,
                'wbs_code' => '3',
                'scheduling_mode' => 'auto',
            ]);
            
            $itemD = ScheduleItem::create([
                'schedule_id' => $schedule->id,
                'title_en' => 'Testing & QA',
                'item_type' => 'task',
                'duration_days' => 5,
                'sequence' => 4,
                'wbs_code' => '4',
                'scheduling_mode' => 'auto',
            ]);

            // Create Dependencies (A -> B -> C -> D)
            ScheduleItemDependency::create([
                'predecessor_id' => $itemA->id,
                'successor_id' => $itemB->id,
                'dependency_type' => 'FS',
                'lag_value' => 0,
            ]);

            ScheduleItemDependency::create([
                'predecessor_id' => $itemB->id,
                'successor_id' => $itemC->id,
                'dependency_type' => 'FS',
                'lag_value' => 0,
            ]);
            
             ScheduleItemDependency::create([
                'predecessor_id' => $itemC->id,
                'successor_id' => $itemD->id,
                'dependency_type' => 'FS',
                'lag_value' => 0,
            ]);
        }
    }
}
