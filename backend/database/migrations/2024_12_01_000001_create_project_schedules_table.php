<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // The master schedule record for a project/program/portfolio
        Schema::create('project_schedules', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('machine_key')->nullable()->unique();
            $table->uuid('tenant_id')->constrained('tenants')->onDelete('cascade');

            // Polymorphic scope: can belong to a Project, Program, or Portfolio
            $table->string('schedulable_type');
            $table->uuid('schedulable_id');

            $table->string('name_en');
            $table->string('name_ar')->nullable();
            $table->text('description')->nullable();

            $table->string('type')->default('Project'); // Project, Program, Portfolio, Phase, Release
            $table->string('status')->default('Draft'); // Draft, Active, Baselined, Closed

            // Schedule dates
            $table->date('planned_start')->nullable();
            $table->date('planned_finish')->nullable();
            $table->date('actual_start')->nullable();
            $table->date('actual_finish')->nullable();

            // Scheduling configuration
            $table->string('scheduling_mode')->default('auto'); // auto, manual, hybrid
            $table->string('default_calendar_id')->nullable(); // references calendars.id
            $table->integer('critical_float_threshold_days')->default(0); // TF <= this = critical
            $table->boolean('allow_cross_project_dependencies')->default(false);

            // Optimistic locking
            $table->integer('version')->default(1);

            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');

            $table->timestamps();
            $table->softDeletes();

            $table->index(['tenant_id', 'schedulable_type', 'schedulable_id']);
            $table->index(['tenant_id', 'status']);
        });

        // Individual items on the Gantt chart (tasks, milestones, summary tasks, phases, etc.)
        Schema::create('schedule_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('schedule_id')->constrained('project_schedules')->onDelete('cascade');

            // Hierarchical WBS support (adjacency list)
            $table->uuid('parent_id')->nullable();
            $table->foreign('parent_id')->references('id')->on('schedule_items')->onDelete('cascade');

            // Link to existing transactional entities (optional)
            $table->string('linkable_type')->nullable(); // Task, Milestone, Phase, Epic
            $table->uuid('linkable_id')->nullable();

            // WBS
            $table->string('wbs_code')->nullable(); // e.g. "1.2.3"
            $table->integer('sequence')->default(0); // ordering within parent

            $table->string('title_en');
            $table->string('title_ar')->nullable();
            $table->text('description')->nullable();

            $table->string('item_type')->default('task'); // task, milestone, summary, phase, deliverable, approval_gate, placeholder

            // Planned dates (engine-calculated in auto mode)
            $table->date('planned_start')->nullable();
            $table->date('planned_finish')->nullable();
            // Actual dates (user-entered)
            $table->date('actual_start')->nullable();
            $table->date('actual_finish')->nullable();
            // Forecast dates (engine-calculated)
            $table->date('forecast_start')->nullable();
            $table->date('forecast_finish')->nullable();

            // Duration & work
            $table->decimal('duration_days', 10, 2)->nullable();
            $table->decimal('remaining_duration_days', 10, 2)->nullable();
            $table->decimal('work_hours', 12, 2)->nullable();
            $table->decimal('remaining_work_hours', 12, 2)->nullable();
            $table->decimal('actual_work_hours', 12, 2)->default(0);

            // Progress
            $table->decimal('percent_complete', 5, 2)->default(0);

            // Scheduling
            $table->string('scheduling_mode')->nullable(); // null = inherit from schedule
            $table->string('duration_type')->default('fixed_duration'); // fixed_duration, fixed_work, fixed_units
            $table->string('calendar_id')->nullable();

            // CPM results (populated by the engine)
            $table->date('early_start')->nullable();
            $table->date('early_finish')->nullable();
            $table->date('late_start')->nullable();
            $table->date('late_finish')->nullable();
            $table->decimal('total_float_days', 10, 2)->nullable();
            $table->decimal('free_float_days', 10, 2)->nullable();
            $table->boolean('is_critical')->default(false);

            // Flags
            $table->boolean('is_milestone')->default(false);
            $table->boolean('is_summary')->default(false);
            $table->boolean('is_manually_scheduled')->default(false);

            $table->string('priority')->default('Medium');
            $table->string('status')->default('Not Started');

            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            $table->softDeletes();

            // Indexes for Gantt queries
            $table->index(['schedule_id', 'parent_id', 'sequence']);
            $table->index(['schedule_id', 'is_critical']);
            $table->index(['schedule_id', 'is_milestone']);
            $table->index(['linkable_type', 'linkable_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('schedule_items');
        Schema::dropIfExists('project_schedules');
    }
};
