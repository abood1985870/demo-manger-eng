<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('legal_invoices', function (Blueprint $table) {
            $table->uuid('client_id')->nullable()->after('legal_matter_id');
            $table->uuid('legal_case_id')->nullable()->after('client_id'); // Optional if matters cover cases, but adding as requested

            $table->string('recipient_type')->default('REGISTERED')->after('legal_case_id'); // REGISTERED, EXTERNAL
            
            // External Client inputs (if not registered)
            $table->string('external_client_name')->nullable();
            $table->string('external_client_email')->nullable();
            $table->string('external_client_phone')->nullable();
            $table->text('external_client_address')->nullable();
            $table->string('external_client_tax_number')->nullable();

            // Snapshot data for the invoice recipient (frozen at time of invoice creation)
            $table->string('recipient_name')->nullable();
            $table->string('recipient_email')->nullable();
            $table->string('recipient_phone')->nullable();
            $table->text('recipient_address')->nullable();
            $table->string('recipient_tax_number')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('legal_invoices', function (Blueprint $table) {
            $table->dropColumn([
                'client_id',
                'legal_case_id',
                'recipient_type',
                'external_client_name',
                'external_client_email',
                'external_client_phone',
                'external_client_address',
                'external_client_tax_number',
                'recipient_name',
                'recipient_email',
                'recipient_phone',
                'recipient_address',
                'recipient_tax_number'
            ]);
        });
    }
};
