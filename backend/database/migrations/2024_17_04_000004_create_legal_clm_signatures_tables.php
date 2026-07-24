<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Signature Packets (Provider Foundation)
        Schema::create('legal_contract_signature_packets', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            $table->uuid('legal_contract_id')->constrained('legal_contracts')->onDelete('cascade');
            $table->uuid('legal_contract_draft_version_id')->constrained('legal_contract_draft_versions');
            
            $table->string('provider_name')->default('MANUAL'); // DOCUSIGN, ADOBE, MANUAL
            $table->string('provider_envelope_id_foundation')->nullable();
            
            $table->string('status'); // prepared, sent, partially_signed, completed, failed
            
            $table->timestamps();
        });

        // 2. Contract Obligations (Integrated with Core Tasks)
        Schema::create('legal_contract_obligations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('legal_contract_id')->constrained('legal_contracts')->onDelete('cascade');
            
            $table->string('title');
            $table->text('description')->nullable();
            
            $table->string('obligation_type'); // payment, delivery, reporting, compliance
            $table->date('due_date')->nullable();
            
            $table->uuid('task_id')->nullable(); // Link to Core Task for unified calendar
            
            $table->string('status'); // active, due_soon, completed, overdue, waived
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('legal_contract_obligations');
        Schema::dropIfExists('legal_contract_signature_packets');
    }
};
