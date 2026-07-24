<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Contract Draft Versions (Links to Core Document Management)
        Schema::create('legal_contract_draft_versions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('legal_contract_id')->constrained('legal_contracts')->onDelete('cascade');
            
            $table->uuid('document_version_id'); // Links to Core generic Document Versions
            $table->uuid('legal_contract_template_id')->nullable(); // Snapshot of template used
            
            $table->integer('version_number');
            $table->string('status'); // draft, internal_review, external_review, approved
            
            $table->timestamps();
        });

        // 2. Contract Clause Instances (Records EXACT clause version used in a draft)
        Schema::create('legal_contract_clause_instances', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('legal_contract_draft_version_id')->constrained('legal_contract_draft_versions')->onDelete('cascade');
            
            $table->uuid('legal_clause_version_id')->constrained('legal_clause_versions');
            
            $table->string('deviation_status')->default('standard'); // standard, modified, high_risk
            
            $table->timestamps();
        });

        // 3. Contract Reviews
        Schema::create('legal_contract_reviews', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('legal_contract_draft_version_id')->constrained('legal_contract_draft_versions')->onDelete('cascade');
            
            $table->string('review_type'); // legal, business, finance, risk
            $table->foreignId('reviewer_id')->constrained('users');
            
            $table->string('decision')->nullable(); // approved, conditional, rejected
            $table->text('comments')->nullable();
            
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('legal_contract_reviews');
        Schema::dropIfExists('legal_contract_clause_instances');
        Schema::dropIfExists('legal_contract_draft_versions');
    }
};
