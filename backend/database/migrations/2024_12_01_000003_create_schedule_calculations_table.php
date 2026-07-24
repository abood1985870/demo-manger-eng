<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Tracks each CPM calculation run
        Schema::create('schedule_calculations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('schedule_id')->constrained('project_schedules')->onDelete('cascade');

            $table->string('status')->default('Pending'); // Pending, Queued, Running, Completed, CompletedWithWarnings, Failed, Cancelled

            // Versioning: only apply results if schedule.version matches input_version
            $table->integer('input_schedule_version');
            $table->string('engine_version')->default('1.0.0');

            $table->integer('items_processed')->default(0);
            $table->integer('warning_count')->default(0);
            $table->json('errors')->nullable(); // Structured errors, no stack traces
            $table->json('cycle_info')->nullable(); // Cycle path if detected

            $table->string('correlation_id')->nullable();

            $table->foreignId('requested_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index(['schedule_id', 'status']);
            $table->index(['schedule_id', 'created_at']);
        });

        // The CPM result items — per schedule_item, per calculation run
        Schema::create('critical_path_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('calculation_id')->constrained('schedule_calculations')->onDelete('cascade');
            $table->uuid('schedule_item_id')->constrained('schedule_items')->onDelete('cascade');

            $table->date('early_start')->nullable();
            $table->date('early_finish')->nullable();
            $table->date('late_start')->nullable();
            $table->date('late_finish')->nullable();

            $table->decimal('total_float_days', 10, 2)->nullable();
            $table->decimal('free_float_days', 10, 2)->nullable();
            $table->boolean('is_critical')->default(false);
            $table->boolean('is_near_critical')->default(false); // TF <= 1 working day

            $table->timestamps();

            $table->unique(['calculation_id', 'schedule_item_id']);
            $table->index(['calculation_id', 'is_critical']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('critical_path_items');
        Schema::dropIfExists('schedule_calculations');
    }
};
