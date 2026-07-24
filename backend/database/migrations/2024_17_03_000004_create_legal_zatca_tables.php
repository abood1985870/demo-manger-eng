<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Tax Treatments (Configurable rules avoiding hardcoded ZATCA rates)
        Schema::create('legal_tax_treatments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            
            $table->string('code')->unique(); // STANDARD_15, ZERO_EXPORT, OUT_OF_SCOPE
            $table->string('name_en');
            $table->string('name_ar')->nullable();
            
            $table->decimal('tax_rate_percent', 5, 2);
            $table->boolean('is_exemption')->default(false);
            $table->string('exemption_reason_code')->nullable(); // ZATCA specific codes
            
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 2. E-Invoice Documents (ZATCA Foundation - stores Provider outputs)
        Schema::create('legal_einvoice_documents', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            $table->uuid('legal_invoice_id')->constrained('legal_invoices')->onDelete('cascade');
            
            $table->string('provider_name')->default('ZATCA_MOCK'); // Defines which adapter signed it
            
            $table->json('structured_payload'); // The generated JSON/XML payload
            
            $table->string('canonical_hash_foundation')->nullable(); // Placeholder for cryptographic hash
            $table->text('qr_payload_foundation')->nullable(); // Placeholder for base64 TLV QR code
            
            $table->string('submission_status'); // pending, cleared, reported, rejected
            
            $table->string('provider_request_id')->nullable();
            $table->string('provider_response_id')->nullable();
            $table->timestamp('response_timestamp')->nullable();
            
            $table->json('errors')->nullable();
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('legal_einvoice_documents');
        Schema::dropIfExists('legal_tax_treatments');
    }
};
