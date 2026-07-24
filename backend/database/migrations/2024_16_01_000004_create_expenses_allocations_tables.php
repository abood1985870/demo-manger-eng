<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Employee Expenses
        Schema::create('expense_claims', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            $table->string('claim_number')->unique();
            
            $table->foreignId('claimant_id')->constrained('users');
            $table->uuid('project_id')->nullable()->constrained('projects');
            $table->uuid('cost_center_id')->nullable()->constrained('cost_centers');
            
            $table->text('business_purpose');
            
            $table->string('status'); // draft, submitted, pending_approval, approved, rejected, reimbursed
            $table->decimal('total_amount', 15, 2)->default(0);
            $table->decimal('approved_amount', 15, 2)->default(0);
            $table->string('currency', 3);
            
            $table->timestamp('approved_at')->nullable();
            
            $table->timestamps();
        });

        Schema::create('expense_claim_lines', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('expense_claim_id')->constrained('expense_claims')->onDelete('cascade');
            
            $table->date('expense_date');
            $table->string('category'); // travel, meals, training
            $table->decimal('amount', 15, 2);
            $table->string('currency', 3);
            
            // Link to Documents module for the receipt image
            $table->uuid('receipt_document_id')->nullable()->constrained('documents')->onDelete('set null');
            
            $table->timestamps();
        });

        // 2. Cost Allocations (Distributing shared service costs)
        Schema::create('cost_allocation_runs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            
            $table->uuid('source_cost_center_id')->constrained('cost_centers');
            $table->uuid('fiscal_period_id')->constrained('fiscal_periods');
            
            $table->string('allocation_method'); // headcount, direct_hours
            $table->decimal('total_amount_allocated', 15, 2);
            
            $table->string('status'); // draft, validated, completed, failed
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cost_allocation_runs');
        Schema::dropIfExists('expense_claim_lines');
        Schema::dropIfExists('expense_claims');
    }
};
