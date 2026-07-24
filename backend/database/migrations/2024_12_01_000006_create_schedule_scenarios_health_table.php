<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('schedule_scenarios', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('schedule_id')->constrained('project_schedules')->onDelete('cascade');
            $table->uuid('tenant_id')->constrained('tenants')->onDelete('cascade');

            $table->string('name');
            $table->text('description')->nullable();
            $table->string('type')->default('WhatIf'); // WhatIf, Recovery, FastTrack, Crash

            $table->string('status')->default('Draft'); // Draft, Calculating, Calculated, Submitted, Approved, Applied, Rejected, Archived

            // Snapshot of original schedule at clone time
            $table->integer('cloned_from_schedule_version');

            // When approved and applied, record it
            $table->uuid('applied_calculation_id')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('applied_at')->nullable();

            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['schedule_id', 'status']);
        });

        // Isolated copies of schedule items within a scenario
        Schema::create('schedule_scenario_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('scenario_id')->constrained('schedule_scenarios')->onDelete('cascade');
            $table->uuid('source_item_id')->constrained('schedule_items')->onDelete('cascade');

            // Override values (null = same as live schedule)
            $table->date('planned_start')->nullable();
            $table->date('planned_finish')->nullable();
            $table->decimal('duration_days', 10, 2)->nullable();
            $table->decimal('percent_complete', 5, 2)->nullable();
            $table->text('change_reason')->nullable();

            // CPM results for the scenario
            $table->decimal('total_float_days', 10, 2)->nullable();
            $table->boolean('is_critical')->default(false);

            $table->timestamps();

            $table->unique(['scenario_id', 'source_item_id']);
        });

        Schema::create('schedule_recovery_plans', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('schedule_id')->constrained('project_schedules')->onDelete('cascade');

            $table->string('name');
            $table->text('description')->nullable();
            $table->string('status')->default('Draft'); // Draft, Submitted, Approved, Applied, Rejected

            $table->text('impact_assessment')->nullable();
            $table->json('adjustments')->nullable(); // Structured list of proposed adjustments

            $table->uuid('workflow_run_id')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('applied_at')->nullable();

            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });

        Schema::create('schedule_health_scores', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('schedule_id')->constrained('project_schedules')->onDelete('cascade');

            $table->decimal('score', 5, 2); // 0-100
            $table->string('status'); // Healthy, AtRisk, Critical
            $table->json('factors'); // Contributing factors: overdue_pct, negative_float_count, etc.
            $table->string('engine_version')->default('1.0.0');

            $table->timestamps();

            $table->index(['schedule_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('schedule_health_scores');
        Schema::dropIfExists('schedule_recovery_plans');
        Schema::dropIfExists('schedule_scenario_items');
        Schema::dropIfExists('schedule_scenarios');
    }
};
