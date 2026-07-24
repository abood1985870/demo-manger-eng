<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Policies (Wrapping existing Documents module)
        Schema::create('policies', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            $table->string('title');
            
            // Link to the physical file in the Document module
            $table->uuid('document_id')->constrained('documents')->onDelete('cascade');
            
            $table->string('status'); // draft, published, archived
            $table->timestamp('effective_date')->nullable();
            $table->timestamp('next_review_date')->nullable();
            
            $table->foreignId('owner_id')->constrained('users');
            
            $table->integer('version')->default(1);
            $table->timestamps();
        });

        // Policy Acknowledgments
        Schema::create('policy_acknowledgments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('policy_id')->constrained('policies')->onDelete('cascade');
            $table->integer('policy_version');
            
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->timestamp('acknowledged_at')->nullable();
            $table->string('status'); // pending, acknowledged, declined
            
            $table->timestamps();
            
            $table->unique(['policy_id', 'policy_version', 'user_id'], 'policy_ack_unique');
        });

        // Findings & Corrective Actions
        Schema::create('findings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            $table->string('finding_number')->unique();
            
            $table->string('title');
            $table->text('description');
            $table->string('severity');
            
            $table->string('source'); // audit, incident, control_test
            $table->string('status'); // open, remediation_in_progress, pending_validation, closed
            
            $table->uuid('related_control_id')->nullable()->constrained('controls')->onDelete('set null');
            
            // Integration: Corrective Action Plan relies on Tasks
            $table->uuid('remediation_task_id')->nullable()->constrained('tasks')->onDelete('set null');
            
            $table->timestamps();
        });

        // Exceptions and Waivers (Against policies or controls)
        Schema::create('exceptions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            
            $table->uuid('policy_id')->nullable()->constrained('policies')->onDelete('cascade');
            $table->uuid('control_id')->nullable()->constrained('controls')->onDelete('cascade');
            
            $table->text('justification');
            $table->text('compensating_controls')->nullable();
            
            $table->string('status'); // approved, expired, revoked
            $table->timestamp('expiration_date')->nullable();
            
            $table->foreignId('requester_id')->constrained('users');
            $table->foreignId('approver_id')->nullable()->constrained('users');
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exceptions');
        Schema::dropIfExists('findings');
        Schema::dropIfExists('policy_acknowledgments');
        Schema::dropIfExists('policies');
    }
};
