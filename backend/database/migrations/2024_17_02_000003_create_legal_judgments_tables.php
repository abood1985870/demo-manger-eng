<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Legal Judgments
        Schema::create('legal_judgments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            $table->uuid('legal_case_id')->constrained('legal_cases')->onDelete('cascade');
            
            $table->string('judgment_number')->unique();
            $table->date('judgment_date');
            
            $table->string('title_en');
            $table->string('title_ar')->nullable();
            
            $table->text('operative_outcome'); // the actual ruling decision
            
            $table->decimal('amount_awarded', 15, 2)->nullable();
            $table->string('currency')->default('SAR');
            
            $table->string('status'); // draft, recorded, appealed, final, under_enforcement
            
            $table->boolean('is_appealable')->default(true);
            $table->date('appeal_deadline_date')->nullable();
            
            $table->uuid('document_id')->nullable()->constrained('documents'); // link to official scan
            
            $table->integer('version')->default(1);
            $table->timestamps();
        });

        // 2. Legal Appeals (Hierarchical linkage between Cases)
        Schema::create('legal_appeals', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            
            $table->uuid('parent_case_id')->constrained('legal_cases')->onDelete('cascade'); // The case that was appealed
            $table->uuid('appeal_case_id')->constrained('legal_cases')->onDelete('cascade'); // The new proceeding created for the appeal
            
            $table->uuid('parent_judgment_id')->nullable()->constrained('legal_judgments');
            
            $table->string('appeal_type'); // standard_appeal, supreme_court_objection, reconsideration
            $table->string('status'); // filed, active, decided
            
            $table->timestamps();
        });

        // 3. Enforcement Files
        Schema::create('legal_enforcement_files', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            $table->uuid('legal_case_id')->nullable()->constrained('legal_cases'); // May link to a specific case
            $table->uuid('source_judgment_id')->nullable()->constrained('legal_judgments'); // The judgment being enforced
            
            $table->string('enforcement_number')->unique();
            
            $table->decimal('target_amount', 15, 2)->nullable();
            $table->decimal('recovered_amount', 15, 2)->default(0);
            $table->string('currency')->default('SAR');
            
            $table->string('status'); // filed, active, partially_satisfied, satisfied, closed
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('legal_enforcement_files');
        Schema::dropIfExists('legal_appeals');
        Schema::dropIfExists('legal_judgments');
    }
};
