<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Legal Courts (Configurable physical/virtual jurisdictions)
        Schema::create('legal_courts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            $table->string('name_en');
            $table->string('name_ar')->nullable();
            $table->string('court_type'); // commercial, labor, administrative, general, arbitration, enforcement
            $table->string('region')->nullable();
            $table->string('city')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 2. Legal Cases (Explicitly extends Legal Matters from Step L1)
        Schema::create('legal_cases', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            $table->uuid('legal_matter_id')->constrained('legal_matters')->onDelete('cascade');
            
            $table->string('case_number')->unique(); // Internal tracking number
            $table->string('external_court_reference')->nullable()->index(); // e.g., Najiz reference
            
            $table->string('title_en');
            $table->string('title_ar')->nullable();
            
            $table->string('case_type'); // commercial, labor, criminal_defense, etc.
            $table->uuid('legal_court_id')->nullable()->constrained('legal_courts');
            
            $table->string('case_stage'); // filing, registration, hearings, deliberation, judgment, appeal
            $table->string('case_status'); // draft, active, judgment_issued, closed
            
            $table->date('filing_date')->nullable();
            $table->date('registration_date')->nullable();
            $table->date('judgment_date')->nullable();
            $table->date('closure_date')->nullable();
            
            $table->decimal('claim_value', 15, 2)->nullable();
            $table->string('currency')->default('SAR');
            
            $table->foreignId('responsible_lawyer_id')->nullable()->constrained('users');
            
            $table->integer('version')->default(1);
            $table->timestamps();
        });

        // 3. Legal Case Parties (Extends procedural roles)
        Schema::create('legal_case_parties', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('legal_case_id')->constrained('legal_cases')->onDelete('cascade');
            
            $table->string('party_type'); 
            $table->uuid('party_id');
            
            $table->string('procedural_role'); // claimant, defendant, appellant, expert, witness
            
            $table->date('effective_start_date')->nullable();
            $table->date('effective_end_date')->nullable();
            
            $table->timestamps();
            
            $table->index(['party_type', 'party_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('legal_case_parties');
        Schema::dropIfExists('legal_cases');
        Schema::dropIfExists('legal_courts');
    }
};
