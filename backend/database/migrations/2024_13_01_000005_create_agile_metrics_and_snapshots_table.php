<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Velocity Snapshots (Captured upon sprint completion)
        Schema::create('agile_velocity_snapshots', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('board_id')->constrained('agile_boards')->onDelete('cascade');
            $table->uuid('sprint_id')->constrained('agile_sprints')->onDelete('cascade');
            
            $table->decimal('planned_points', 8, 2)->default(0);
            $table->decimal('completed_points', 8, 2)->default(0);
            $table->integer('planned_count')->default(0);
            $table->integer('completed_count')->default(0);
            $table->decimal('rolling_average_points', 8, 2)->nullable();
            
            $table->timestamps();
        });

        // Cumulative Flow / Flow Snapshots (Daily cron job records counts per column for a board)
        Schema::create('agile_flow_snapshots', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('board_id')->constrained('agile_boards')->onDelete('cascade');
            $table->uuid('column_id')->constrained('agile_board_columns')->onDelete('cascade');
            $table->date('snapshot_date');
            
            $table->integer('item_count')->default(0);
            $table->decimal('total_story_points', 8, 2)->default(0);
            
            $table->timestamps();
            
            // Ensures only one snapshot per column per day
            $table->unique(['column_id', 'snapshot_date']);
        });

        // Cycle Time & Lead Time Snapshots (Recorded upon item reaching delivery point / Done)
        Schema::create('agile_lead_time_snapshots', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('board_id')->constrained('agile_boards')->onDelete('cascade');
            $table->uuid('task_id')->constrained('tasks')->onDelete('cascade');
            
            $table->timestamp('created_timestamp');
            $table->timestamp('committed_timestamp')->nullable(); // When it entered a "commitment point"
            $table->timestamp('delivered_timestamp'); // When it entered a "delivery point" / Done
            
            $table->decimal('lead_time_days', 8, 2); // delivered - created
            $table->decimal('cycle_time_days', 8, 2)->nullable(); // delivered - committed
            
            $table->timestamps();
            $table->unique(['board_id', 'task_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agile_lead_time_snapshots');
        Schema::dropIfExists('agile_flow_snapshots');
        Schema::dropIfExists('agile_velocity_snapshots');
    }
};
