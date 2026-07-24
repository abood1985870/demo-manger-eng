<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Legal Invoices (Immutable Final Document)
        Schema::create('legal_invoices', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            $table->uuid('legal_matter_id')->constrained('legal_matters')->onDelete('cascade');
            
            $table->string('invoice_number')->unique(); // Dedicated legal sequence
            $table->date('invoice_date');
            $table->date('supply_date_foundation')->nullable();
            
            $table->string('currency')->default('SAR');
            
            $table->decimal('total_fees', 15, 2)->default(0);
            $table->decimal('total_expenses', 15, 2)->default(0);
            $table->decimal('total_tax', 15, 2)->default(0);
            $table->decimal('grand_total', 15, 2)->default(0);
            $table->decimal('amount_due', 15, 2)->default(0);
            
            $table->string('status'); // draft, issued, paid, cancelled, credited
            
            $table->uuid('tax_profile_id')->nullable(); 
            $table->uuid('document_id')->nullable()->constrained('documents');
            
            $table->integer('version')->default(1);
            $table->timestamps();
        });

        // 2. Invoice Lines
        Schema::create('legal_invoice_lines', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('legal_invoice_id')->constrained('legal_invoices')->onDelete('cascade');
            
            $table->string('description_en');
            $table->string('description_ar')->nullable();
            
            $table->decimal('quantity', 10, 2)->default(1);
            $table->decimal('unit_price', 15, 2);
            $table->decimal('net_amount', 15, 2);
            
            $table->decimal('tax_rate', 5, 2)->default(15.00);
            $table->decimal('tax_amount', 15, 2)->default(0);
            
            $table->string('source_type')->nullable(); // time, expense, retainer
            $table->uuid('source_id')->nullable();
            
            $table->timestamps();
        });

        // 3. Credit Notes
        Schema::create('legal_credit_notes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            $table->uuid('legal_invoice_id')->constrained('legal_invoices');
            
            $table->string('credit_note_number')->unique();
            $table->date('issue_date');
            
            $table->decimal('total_amount', 15, 2);
            $table->string('reason');
            
            $table->string('status'); // draft, approved, issued
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('legal_credit_notes');
        Schema::dropIfExists('legal_invoice_lines');
        Schema::dropIfExists('legal_invoices');
    }
};
