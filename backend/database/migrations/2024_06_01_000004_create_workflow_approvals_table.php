<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('workflow_approvals', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('workflow_run_id')->constrained('workflow_runs')->onDelete('cascade');
            $table->string('step_id'); // Link to DAG node
            $table->string('type'); // single, parallel, sequential
            $table->string('status'); // pending, approved, rejected, escalated, cancelled
            $table->timestamps();
        });

        Schema::create('approval_steps', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('workflow_approval_id')->constrained('workflow_approvals')->onDelete('cascade');
            $table->integer('sequence_order')->default(1);
            
            // Assignee definition (User, Role, Department, Manager)
            $table->string('assignee_type'); // user, role, department, manager
            $table->string('assignee_id'); // UUID or ID
            
            $table->string('status'); // pending, approved, rejected
            $table->timestamps();
        });

        Schema::create('approval_decisions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('approval_step_id')->constrained('approval_steps')->onDelete('cascade');
            $table->foreignId('decided_by')->constrained('users')->onDelete('cascade');
            $table->string('decision'); // approved, rejected
            $table->text('comments')->nullable();
            $table->timestamp('decided_at')->useCurrent();
            $table->timestamps();
            
            $table->unique(['approval_step_id', 'decided_by']);
        });

        Schema::create('escalation_rules', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('workflow_approval_id')->constrained('workflow_approvals')->onDelete('cascade');
            $table->integer('timeout_minutes');
            $table->string('action'); // auto_reassign, auto_notify, auto_close, auto_reject
            $table->json('action_payload')->nullable(); // Who to reassign to, etc.
            $table->boolean('is_triggered')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('escalation_rules');
        Schema::dropIfExists('approval_decisions');
        Schema::dropIfExists('approval_steps');
        Schema::dropIfExists('workflow_approvals');
    }
};
