<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Legal Fee Agreements
        Schema::create('legal_fee_agreements', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            $table->uuid('legal_matter_id')->constrained('legal_matters')->onDelete('cascade');
            
            $table->string('agreement_number')->unique();
            $table->string('title_en');
            $table->string('title_ar')->nullable();
            
            $table->string('billing_model'); // hourly, fixed, retainer, capped, contingency_foundation
            $table->string('billing_frequency'); // monthly, milestone, completion
            
            $table->date('effective_date')->nullable();
            $table->date('expiration_date')->nullable();
            
            $table->decimal('fee_cap', 15, 2)->nullable();
            $table->string('currency')->default('SAR');
            
            $table->uuid('tax_treatment_id')->nullable(); // linked to future tax foundation
            
            $table->string('status'); // draft, pending_approval, active, expired, terminated
            $table->foreignId('responsible_partner_id')->nullable()->constrained('users');
            
            $table->integer('version')->default(1);
            $table->timestamps();
        });

        // 2. Retainer Accounts (Operating / Unearned Tracking, NOT full Trust Accounting yet)
        Schema::create('legal_retainer_accounts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            $table->uuid('legal_matter_id')->constrained('legal_matters')->onDelete('cascade');
            
            $table->decimal('agreed_amount', 15, 2);
            $table->decimal('current_balance', 15, 2)->default(0);
            $table->string('currency')->default('SAR');
            
            $table->boolean('is_evergreen')->default(false);
            $table->decimal('replenishment_threshold', 15, 2)->nullable();
            
            $table->string('status'); // active, depleted, closed
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('legal_retainer_accounts');
        Schema::dropIfExists('legal_fee_agreements');
    }
};
