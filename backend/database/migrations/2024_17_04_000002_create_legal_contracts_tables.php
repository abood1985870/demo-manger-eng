<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Contract Requests (Intake)
        Schema::create('legal_contract_requests', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            $table->uuid('legal_client_id')->nullable(); 
            
            $table->string('request_number')->unique();
            $table->string('title_en');
            $table->string('contract_type');
            
            $table->string('status'); // submitted, under_review, approved, converted, rejected
            
            $table->foreignId('requester_id')->constrained('users');
            
            $table->timestamps();
        });

        // 2. Contracts (Core CLM Entity)
        Schema::create('legal_contracts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            
            // Link to Legal Matters for strict Ethical Wall enforcement
            $table->uuid('legal_matter_id')->constrained('legal_matters')->onDelete('cascade');
            $table->uuid('legal_contract_request_id')->nullable()->constrained('legal_contract_requests');
            $table->uuid('legal_contract_template_id')->nullable()->constrained('legal_contract_templates');
            
            $table->string('contract_number')->unique();
            $table->string('title_en');
            $table->string('title_ar')->nullable();
            
            $table->string('contract_type');
            $table->string('contract_category')->nullable();
            
            $table->decimal('original_value', 15, 2)->nullable();
            $table->string('currency')->default('SAR');
            
            $table->date('effective_date')->nullable();
            $table->date('expiration_date')->nullable();
            
            $table->string('status'); // draft, review, negotiation, signature, active, expired, terminated
            $table->string('risk_level')->default('low');
            
            $table->foreignId('responsible_lawyer_id')->constrained('users');
            
            $table->timestamps();
        });

        // 3. Contract Parties
        Schema::create('legal_contract_parties', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('legal_contract_id')->constrained('legal_contracts')->onDelete('cascade');
            
            $table->string('party_name');
            $table->string('party_role'); // e.g. supplier, client, guarantor
            $table->boolean('is_internal')->default(false);
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('legal_contract_parties');
        Schema::dropIfExists('legal_contracts');
        Schema::dropIfExists('legal_contract_requests');
    }
};
