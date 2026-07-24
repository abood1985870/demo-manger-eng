<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Risk Assessments (Immutable Snapshots)
        Schema::create('legal_compliance_risk_assessments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('compliance_case_id')->constrained('legal_compliance_cases')->onDelete('cascade');
            
            $table->string('model_version'); // Track which risk model logic was used
            
            $table->json('input_snapshot'); // The exact data used to calculate risk
            $table->json('factor_scores'); // Scoring breakdown (Geographic, Service, etc.)
            
            $table->string('inherent_risk'); 
            $table->string('residual_risk'); // After mitigations/controls
            
            $table->uuid('reviewer_id')->nullable()->constrained('users');
            $table->timestamp('approved_at')->nullable();
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('legal_compliance_risk_assessments');
    }
};
