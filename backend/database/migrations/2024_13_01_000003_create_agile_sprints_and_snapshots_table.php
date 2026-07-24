<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Sprints
        Schema::create('agile_sprints', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            $table->uuid('board_id')->constrained('agile_boards')->onDelete('cascade');
            $table->string('name_en');
            $table->string('name_ar')->nullable();
            $table->integer('sprint_number');
            $table->text('goal')->nullable();
            
            $table->string('status'); // Draft, Planned, Active, Completed, Cancelled
            $table->timestamp('start_date')->nullable();
            $table->timestamp('end_date')->nullable();
            $table->string('timezone')->default('UTC');
            
            $table->decimal('capacity_hours', 8, 2)->nullable();
            $table->decimal('planned_points', 8, 2)->nullable();
            $table->decimal('completed_points', 8, 2)->nullable();
            
            // Completion data
            $table->text('cancellation_reason')->nullable();
            $table->text('completion_summary')->nullable();
            
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('started_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('completed_by')->nullable()->constrained('users')->onDelete('set null');
            
            $table->timestamps();
            
            // Concurrency-safe unique sprint number per board
            $table->unique(['board_id', 'sprint_number']);
        });

        // Sprint Items (M2M to support task moving across sprints, or tracking carryover)
        Schema::create('agile_sprint_items', function (Blueprint $table) {
            $table->uuid('sprint_id')->constrained('agile_sprints')->onDelete('cascade');
            $table->uuid('task_id')->constrained('tasks')->onDelete('cascade');
            
            $table->boolean('added_after_start')->default(false);
            $table->boolean('removed_before_completion')->default(false);
            $table->boolean('carried_over')->default(false);
            
            $table->timestamps();
            
            $table->primary(['sprint_id', 'task_id']);
        });

        // Sprint Snapshot (Taken EXACTLY at start, for burndown and scope variance)
        Schema::create('agile_sprint_snapshots', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('sprint_id')->constrained('agile_sprints')->onDelete('cascade');
            $table->string('type'); // start_snapshot, complete_snapshot
            $table->json('data'); // Stores full state of all items, estimates, assignees, and statuses
            $table->timestamp('taken_at');
            $table->foreignId('taken_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });

        // Scope Change Log (Every change after start)
        Schema::create('agile_sprint_scope_changes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('sprint_id')->constrained('agile_sprints')->onDelete('cascade');
            $table->uuid('task_id')->constrained('tasks')->onDelete('cascade');
            $table->string('change_type'); // item_added, item_removed, estimate_changed, status_changed
            $table->string('old_value')->nullable();
            $table->string('new_value')->nullable();
            $table->text('reason')->nullable();
            $table->foreignId('changed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agile_sprint_scope_changes');
        Schema::dropIfExists('agile_sprint_snapshots');
        Schema::dropIfExists('agile_sprint_items');
        Schema::dropIfExists('agile_sprints');
    }
};
