<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Due Diligence Profiles (Configurable Rulesets)
        Schema::create('legal_due_diligence_profiles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            
            $table->string('profile_type'); // individual, corporate, foreign_entity
            $table->string('name');
            $table->json('requirements'); // JSON schema of required documents/checks
            
            $table->string('status')->default('active');
            
            $table->timestamps();
        });

        // 2. Compliance Cases (Folder for a specific compliance review)
        Schema::create('legal_compliance_cases', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            
            $table->string('case_number')->unique();
            
            // Polymorphic relation to Subject (Client, Matter, Contract)
            $table->uuid('subject_id');
            $table->string('subject_type');
            
            $table->uuid('due_diligence_profile_id')->nullable()->constrained('legal_due_diligence_profiles');
            
            $table->string('compliance_type'); // onboarding, periodic_refresh, event_triggered
            $table->string('risk_level')->default('unassessed'); // low, medium, high, unacceptable
            
            $table->string('status'); // draft, in_progress, pending_approval, approved, rejected, restricted
            
            $table->uuid('compliance_officer_id')->nullable()->constrained('users');
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('legal_compliance_cases');
        Schema::dropIfExists('legal_due_diligence_profiles');
    }
};
