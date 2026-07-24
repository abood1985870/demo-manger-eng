<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Legal Pre-Bills (Draft Review Stage)
        Schema::create('legal_prebills', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            $table->uuid('legal_matter_id')->constrained('legal_matters')->onDelete('cascade');
            $table->uuid('legal_fee_agreement_id')->constrained('legal_fee_agreements');
            
            $table->string('prebill_number')->unique();
            $table->string('billing_period'); // e.g., 2026-07
            $table->string('currency')->default('SAR');
            
            $table->decimal('gross_fees', 15, 2)->default(0);
            $table->decimal('total_expenses', 15, 2)->default(0);
            $table->decimal('total_discounts', 15, 2)->default(0);
            $table->decimal('net_amount', 15, 2)->default(0);
            
            $table->string('status'); // draft, partner_review, finance_review, approved, converted
            
            $table->foreignId('reviewer_id')->nullable()->constrained('users');
            
            $table->integer('version')->default(1);
            $table->timestamps();
        });

        // 2. Pre-Bill Lines (Time/Expense Snapshots during review)
        Schema::create('legal_prebill_lines', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('legal_prebill_id')->constrained('legal_prebills')->onDelete('cascade');
            
            $table->string('line_type'); // time, expense, fixed_fee
            $table->uuid('source_id'); // e.g. time_entry_id
            
            $table->text('client_narrative')->nullable(); // Can be edited here without ruining the original time entry
            $table->decimal('billable_hours', 8, 2)->nullable();
            $table->decimal('rate', 15, 2)->nullable();
            $table->decimal('line_total', 15, 2)->default(0);
            
            $table->string('status'); // active, written_down, written_off, held
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('legal_prebill_lines');
        Schema::dropIfExists('legal_prebills');
    }
};
