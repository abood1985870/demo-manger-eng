<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('schedule_snapshots', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('schedule_id')->constrained('project_schedules')->onDelete('cascade');

            $table->string('name');
            $table->string('trigger')->default('manual'); // manual, daily, weekly, before_calculation, before_baseline, event
            $table->text('notes')->nullable();

            // Snapshot captures the schedule version at this moment
            $table->integer('schedule_version_at_snapshot');
            $table->string('engine_version')->default('1.0.0');

            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();

            $table->index(['schedule_id', 'created_at']);
        });

        Schema::create('schedule_snapshot_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('snapshot_id')->constrained('schedule_snapshots')->onDelete('cascade');
            $table->uuid('schedule_item_id')->constrained('schedule_items')->onDelete('cascade');

            // Immutable point-in-time data
            $table->date('planned_start')->nullable();
            $table->date('planned_finish')->nullable();
            $table->date('forecast_start')->nullable();
            $table->date('forecast_finish')->nullable();
            $table->date('actual_start')->nullable();
            $table->date('actual_finish')->nullable();
            $table->decimal('percent_complete', 5, 2)->default(0);
            $table->decimal('total_float_days', 10, 2)->nullable();
            $table->boolean('is_critical')->default(false);

            $table->timestamps();

            $table->unique(['snapshot_id', 'schedule_item_id']);
        });

        // Schedule variances (computed vs. baseline)
        Schema::create('schedule_variances', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('schedule_item_id')->constrained('schedule_items')->onDelete('cascade');
            $table->uuid('baseline_id')->constrained('schedule_baselines')->onDelete('cascade');

            $table->integer('start_variance_days')->nullable();  // positive = delayed
            $table->integer('finish_variance_days')->nullable();
            $table->decimal('duration_variance_days', 10, 2)->nullable();
            $table->decimal('progress_variance_pct', 5, 2)->nullable();
            $table->decimal('work_variance_hours', 12, 2)->nullable();

            $table->timestamp('calculated_at');
            $table->timestamps();

            $table->index(['schedule_item_id', 'baseline_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('schedule_variances');
        Schema::dropIfExists('schedule_snapshot_items');
        Schema::dropIfExists('schedule_snapshots');
    }
};
