<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Lookup Tables for Risk Taxonomy
        Schema::create('risk_categories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            $table->string('name_en');
            $table->string('name_ar')->nullable();
            $table->timestamps();
        });

        // Configurable Scoring Models (e.g. 5x5 Matrix)
        Schema::create('risk_scoring_models', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            $table->string('name');
            $table->string('type'); // matrix, numeric, custom
            $table->json('matrix_configuration')->nullable(); // defines axes and score bounds
            $table->boolean('is_active')->default(true);
            $table->integer('version')->default(1);
            $table->timestamps();
        });

        // The Risk Register
        Schema::create('risks', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            $table->string('risk_number')->unique(); // e.g. RSK-2026-0001
            
            $table->string('title_en');
            $table->string('title_ar')->nullable();
            $table->text('description_en')->nullable();
            $table->text('description_ar')->nullable();
            
            // Taxonomy & Context
            $table->uuid('category_id')->nullable()->constrained('risk_categories')->onDelete('set null');
            $table->string('type'); // strategic, operational, etc.
            
            // Link to other domains
            $table->uuid('project_id')->nullable()->constrained('projects')->onDelete('set null');
            $table->uuid('task_id')->nullable()->constrained('tasks')->onDelete('set null');
            
            // Stakeholders
            $table->foreignId('owner_id')->nullable()->constrained('users')->onDelete('set null');
            
            // Status and Lifecycle
            $table->string('status')->default('identified');
            $table->string('treatment_strategy')->nullable(); // avoid, reduce, accept, transfer
            
            // Current Scores (Mirrored from the latest approved assessment for fast querying)
            $table->decimal('inherent_score', 8, 2)->nullable();
            $table->decimal('residual_score', 8, 2)->nullable();
            $table->decimal('target_score', 8, 2)->nullable();
            
            $table->timestamp('next_review_date')->nullable();
            $table->timestamp('closed_at')->nullable();
            
            $table->integer('version')->default(1); // Optimistic locking
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['tenant_id', 'status']);
            $table->index(['tenant_id', 'project_id']);
        });

        // Immutable Risk Assessments
        Schema::create('risk_assessments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('risk_id')->constrained('risks')->onDelete('cascade');
            $table->uuid('scoring_model_id')->constrained('risk_scoring_models');
            
            $table->integer('assessment_version');
            $table->string('status'); // draft, submitted, approved
            
            // The assessed values
            $table->decimal('inherent_likelihood', 8, 2)->nullable();
            $table->decimal('inherent_impact', 8, 2)->nullable();
            $table->decimal('inherent_score', 8, 2)->nullable();
            
            $table->decimal('residual_likelihood', 8, 2)->nullable();
            $table->decimal('residual_impact', 8, 2)->nullable();
            $table->decimal('residual_score', 8, 2)->nullable();
            
            $table->text('assumptions')->nullable();
            
            $table->foreignId('assessor_id')->constrained('users')->onDelete('cascade');
            $table->timestamp('approved_at')->nullable();
            $table->foreignId('approver_id')->nullable()->constrained('users')->onDelete('set null');
            
            $table->timestamps(); // We keep updated_at for draft edits, but once approved, it locks.
            
            $table->unique(['risk_id', 'assessment_version']);
        });

        // Risk Treatments (Mitigation Plans linking back to Tasks)
        Schema::create('risk_treatments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('risk_id')->constrained('risks')->onDelete('cascade');
            
            $table->string('strategy'); // reduce, transfer, etc.
            $table->text('description');
            
            // Crucial integration: Treating risks happens via the unified Tasks engine
            $table->uuid('linked_task_id')->nullable()->constrained('tasks')->onDelete('cascade');
            
            $table->string('status'); // planned, in_progress, completed
            $table->timestamps();
        });
        
        // Risk Acceptances
        Schema::create('risk_acceptances', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('risk_id')->constrained('risks')->onDelete('cascade');
            $table->text('business_justification');
            $table->text('compensating_controls')->nullable();
            
            $table->string('status'); // submitted, approved, rejected, expired
            $table->timestamp('expiration_date')->nullable();
            
            $table->foreignId('requested_by')->constrained('users');
            $table->foreignId('approved_by')->nullable()->constrained('users');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('risk_acceptances');
        Schema::dropIfExists('risk_treatments');
        Schema::dropIfExists('risk_assessments');
        Schema::dropIfExists('risks');
        Schema::dropIfExists('risk_scoring_models');
        Schema::dropIfExists('risk_categories');
    }
};
