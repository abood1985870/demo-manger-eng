<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('schedule_baselines', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('schedule_id')->constrained('project_schedules')->onDelete('cascade');

            $table->string('name');
            $table->string('type')->default('Approved'); // Original, Approved, Revised, Contract, Recovery, Custom
            $table->integer('baseline_number')->default(0);
            $table->text('description')->nullable();

            $table->string('status')->default('Draft'); // Draft, Submitted, Approved, Rejected, Superseded

            $table->date('effective_date')->nullable();
            $table->timestamp('locked_at')->nullable(); // Approved baselines are immutable after this

            // Approval workflow integration
            $table->uuid('workflow_run_id')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('approved_at')->nullable();
            $table->text('approval_notes')->nullable();

            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['schedule_id', 'status']);
            $table->index(['schedule_id', 'baseline_number']);
        });

        // Immutable copy of each schedule item at baseline time
        Schema::create('schedule_baseline_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('baseline_id')->constrained('schedule_baselines')->onDelete('cascade');
            $table->uuid('schedule_item_id')->constrained('schedule_items')->onDelete('cascade');

            // Captured values at baseline time
            $table->date('planned_start');
            $table->date('planned_finish');
            $table->decimal('duration_days', 10, 2)->nullable();
            $table->decimal('work_hours', 12, 2)->nullable();
            $table->decimal('percent_complete', 5, 2)->default(0);
            $table->boolean('is_critical')->default(false);
            $table->decimal('total_float_days', 10, 2)->nullable();

            $table->timestamps();

            $table->unique(['baseline_id', 'schedule_item_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('schedule_baseline_items');
        Schema::dropIfExists('schedule_baselines');
    }
};
