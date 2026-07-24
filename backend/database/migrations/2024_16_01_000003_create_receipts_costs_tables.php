<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Receipts / GRN (Goods Receipt Note)
        Schema::create('receipts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            $table->string('receipt_number')->unique();
            
            $table->uuid('purchase_order_id')->constrained('purchase_orders');
            $table->foreignId('received_by')->constrained('users');
            $table->timestamp('receipt_date');
            
            $table->string('status'); // accepted, partially_rejected
            
            $table->timestamps();
        });

        Schema::create('receipt_lines', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('receipt_id')->constrained('receipts')->onDelete('cascade');
            $table->uuid('po_line_id')->constrained('purchase_order_lines');
            
            $table->decimal('received_quantity', 10, 2);
            $table->decimal('rejected_quantity', 10, 2)->default(0);
            
            $table->timestamps();
        });

        // 2. Vendor Bills Foundation (For 3-way matching)
        Schema::create('vendor_bills', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            $table->string('bill_number');
            $table->uuid('supplier_id')->constrained('supplier_profiles');
            
            $table->uuid('purchase_order_id')->nullable()->constrained('purchase_orders');
            
            $table->decimal('total_amount', 15, 2);
            $table->string('currency', 3);
            
            $table->string('status'); // received, matched, exception, approved_for_payment
            
            $table->timestamps();
        });

        // 3. Actual Costs Ledger
        // This is where approved Time Entries (Step 14), Expenses, and Matched Vendor Bills arrive to deplete the budget
        Schema::create('cost_entries', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            
            $table->string('source_type'); // timesheet, expense, vendor_bill
            $table->uuid('source_id');
            
            $table->uuid('budget_line_id')->nullable()->constrained('budget_lines');
            $table->uuid('project_id')->nullable()->constrained('projects');
            $table->uuid('cost_center_id')->nullable()->constrained('cost_centers');
            
            $table->decimal('amount', 15, 2);
            $table->string('currency', 3);
            $table->decimal('applied_exchange_rate', 10, 6)->default(1.000000); // Immutable preservation
            
            $table->timestamp('incurred_date');
            
            $table->integer('version')->default(1);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cost_entries');
        Schema::dropIfExists('vendor_bills');
        Schema::dropIfExists('receipt_lines');
        Schema::dropIfExists('receipts');
    }
};
