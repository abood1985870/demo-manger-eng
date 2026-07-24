<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Work Item Extensions (Links 1:1 to existing `tasks` table)
        Schema::create('agile_work_item_extensions', function (Blueprint $table) {
            $table->uuid('task_id')->primary()->constrained('tasks')->onDelete('cascade');
            $table->string('agile_type'); // Epic, Feature, User Story, Task, Bug
            $table->uuid('board_id')->nullable()->constrained('agile_boards')->onDelete('set null');
            
            // Estimation
            $table->decimal('story_points', 8, 2)->nullable();
            $table->string('estimation_confidence')->nullable();
            
            // Business metrics
            $table->decimal('business_value', 8, 2)->nullable();
            $table->decimal('risk_value', 8, 2)->nullable();
            $table->string('complexity')->nullable();
            
            // Kanban specifics
            $table->uuid('service_class_id')->nullable()->constrained('agile_service_classes')->onDelete('set null');
            $table->boolean('is_blocked')->default(false);
            $table->uuid('blocked_by_user')->nullable(); // Could link to users, omitted constraint for soft deletes
            $table->string('block_category')->nullable();
            $table->text('block_reason')->nullable();
            $table->timestamp('blocked_at')->nullable();
            $table->timestamp('unblocked_at')->nullable();
            
            // Rules
            $table->boolean('is_ready')->default(false);
            $table->boolean('is_done')->default(false);
            
            $table->timestamps();
        });

        // LexoRank-style Ordering Table
        // Isolates ranking logic from the main task extension to avoid mass table locks during rebalancing
        Schema::create('agile_rankings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('task_id')->constrained('tasks')->onDelete('cascade');
            $table->uuid('context_id'); // e.g., board_id, sprint_id, or backlog_id
            $table->string('context_type'); // Board, Sprint, Backlog
            $table->string('rank', 255); // Lexographical rank string (e.g. 0|hzzzzz:)
            
            // Versioning for optimistic locking during concurrent moves
            $table->integer('version')->default(1);
            
            $table->timestamps();
            
            // Important indexes for sorting and lookup
            $table->unique(['context_type', 'context_id', 'task_id']);
            $table->index(['context_type', 'context_id', 'rank']);
        });

        // Agile Definition of Ready / Done Checks
        Schema::create('agile_checklist_rules', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('board_id')->constrained('agile_boards')->onDelete('cascade');
            $table->string('type'); // Ready, Done
            $table->string('rule');
            $table->boolean('is_required')->default(true);
            $table->timestamps();
        });
        
        Schema::create('agile_work_item_readiness', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('task_id')->constrained('tasks')->onDelete('cascade');
            $table->uuid('rule_id')->constrained('agile_checklist_rules')->onDelete('cascade');
            $table->boolean('is_verified')->default(false);
            $table->foreignId('verified_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();
            
            $table->unique(['task_id', 'rule_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agile_work_item_readiness');
        Schema::dropIfExists('agile_checklist_rules');
        Schema::dropIfExists('agile_rankings');
        Schema::dropIfExists('agile_work_item_extensions');
    }
};
