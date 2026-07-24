<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Compliance Decisions (Approval/Rejection logic)
        Schema::create('legal_compliance_decisions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('compliance_case_id')->constrained('legal_compliance_cases')->onDelete('cascade');
            
            $table->uuid('approver_id')->constrained('users');
            
            $table->string('decision'); // approve, reject, require_edd
            $table->text('reason')->nullable(); // Highly sensitive internal notes
            
            $table->date('expiration_date')->nullable(); // When must refresh occur
            
            $table->timestamps();
        });

        // 2. Compliance Restrictions (Enforced Application Blocks)
        Schema::create('legal_compliance_restrictions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('compliance_case_id')->constrained('legal_compliance_cases')->onDelete('cascade');
            
            $table->string('restriction_type'); // block_matter_activation, block_invoicing, enhanced_monitoring
            
            $table->string('status'); // active, lifted
            
            $table->timestamps();
        });
        
        // 3. Provider Configurations
        Schema::create('legal_compliance_provider_configs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            
            $table->string('provider_type'); // identity, sanctions
            $table->string('provider_name');
            $table->string('environment'); // test, production
            
            $table->boolean('is_active')->default(false);
            
            // Note: In real prod, secrets belong in Vault. This stores identifiers or encrypted refs.
            $table->string('secret_reference')->nullable(); 
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('legal_compliance_provider_configs');
        Schema::dropIfExists('legal_compliance_restrictions');
        Schema::dropIfExists('legal_compliance_decisions');
    }
};
