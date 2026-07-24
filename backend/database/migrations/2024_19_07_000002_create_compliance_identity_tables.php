<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Identity Records (Securely masked KYC)
        Schema::create('legal_identity_records', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('compliance_case_id')->constrained('legal_compliance_cases')->onDelete('cascade');
            
            // Links to Core Contact/Party
            $table->uuid('party_id');
            
            $table->string('identification_type'); // national_id, passport, iqama
            
            // Masked presentation in UI, encrypted at rest.
            $table->string('identification_number_masked');
            $table->text('identification_number_encrypted'); 
            
            $table->string('issuer_country')->nullable();
            
            $table->date('issue_date')->nullable();
            $table->date('expiration_date')->nullable();
            
            $table->string('verification_status')->default('unverified');
            $table->uuid('evidence_document_version_id')->nullable(); // Link to core doc
            
            $table->timestamps();
        });

        // 2. Beneficial Owners (UBO Chain)
        Schema::create('legal_beneficial_owners', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('compliance_case_id')->constrained('legal_compliance_cases')->onDelete('cascade');
            
            $table->uuid('owner_party_id'); // The person
            $table->uuid('owned_entity_party_id'); // The company
            
            $table->decimal('ownership_percentage', 5, 2)->nullable();
            $table->string('control_type'); // direct_shares, voting_rights, executive_control
            
            $table->string('verification_status')->default('unverified');
            
            $table->timestamps();
        });
        
        // 3. Authorized Representatives (POA)
        Schema::create('legal_authorized_representatives', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('compliance_case_id')->constrained('legal_compliance_cases')->onDelete('cascade');
            
            $table->uuid('representative_party_id');
            $table->string('authority_type'); // power_of_attorney, board_resolution
            
            $table->uuid('authority_document_version_id')->nullable();
            
            $table->date('expiration_date')->nullable();
            $table->string('verification_status')->default('unverified');
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('legal_authorized_representatives');
        Schema::dropIfExists('legal_beneficial_owners');
        Schema::dropIfExists('legal_identity_records');
    }
};
