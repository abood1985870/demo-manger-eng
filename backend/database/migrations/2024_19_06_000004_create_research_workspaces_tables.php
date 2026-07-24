<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Research Workspaces
        Schema::create('research_workspaces', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            
            $table->string('research_number')->unique();
            $table->string('title');
            
            $table->uuid('legal_matter_id')->nullable(); // Linked matter Context
            
            $table->string('status'); // draft, assigned, researching, review, completed
            
            $table->uuid('owner_id')->constrained('users');
            $table->date('due_date')->nullable();
            
            $table->timestamps();
        });

        // 2. Research Questions
        Schema::create('research_questions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('research_workspace_id')->constrained('research_workspaces')->onDelete('cascade');
            
            $table->text('question');
            $table->string('type'); // factual, legal, procedural
            
            $table->text('conclusion')->nullable();
            $table->string('status');
            
            $table->timestamps();
        });

        // 3. Research Sources (Citations & Verification)
        Schema::create('research_sources', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('research_workspace_id')->constrained('research_workspaces')->onDelete('cascade');
            
            $table->string('title');
            $table->string('source_type'); // internal_knowledge, judgment, legislation, article
            
            $table->uuid('reference_id')->nullable(); // Polymorphic link to actual document/knowledge
            $table->string('external_reference')->nullable();
            
            $table->string('verification_status')->default('unverified');
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('research_sources');
        Schema::dropIfExists('research_questions');
        Schema::dropIfExists('research_workspaces');
    }
};
