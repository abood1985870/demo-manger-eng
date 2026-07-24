<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Supplier Profiles (Extends core Companies/Organizations without duplicating the party model)
        Schema::create('supplier_profiles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            $table->uuid('company_id')->constrained('companies')->onDelete('cascade'); // Core org link
            
            $table->string('supplier_code')->unique();
            $table->string('payment_terms_ref')->nullable(); // e.g. Net 30
            $table->string('approval_status')->default('pending'); // pending, approved, suspended
            
            $table->timestamps();
        });

        // 2. Procurement Requests (PR)
        Schema::create('procurement_requests', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            $table->string('request_number')->unique();
            
            $table->foreignId('requester_id')->constrained('users');
            $table->uuid('project_id')->nullable()->constrained('projects');
            $table->uuid('cost_center_id')->nullable()->constrained('cost_centers');
            
            $table->text('business_justification');
            $table->string('status'); // draft, submitted, pending_approval, approved, rejected, converted
            
            $table->timestamps();
        });

        Schema::create('procurement_request_lines', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('procurement_request_id')->constrained('procurement_requests')->onDelete('cascade');
            
            $table->string('description');
            $table->decimal('quantity', 10, 2);
            $table->decimal('estimated_unit_price', 15, 2);
            $table->decimal('estimated_amount', 15, 2); // Calculated
            $table->string('currency', 3);
            
            $table->uuid('budget_line_id')->nullable()->constrained('budget_lines')->onDelete('set null');
            
            $table->timestamps();
        });

        // 3. Purchase Orders (PO) - Hard Commitments
        Schema::create('purchase_orders', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            $table->string('po_number')->unique();
            
            $table->uuid('supplier_id')->constrained('supplier_profiles');
            $table->uuid('project_id')->nullable()->constrained('projects');
            
            $table->string('currency', 3);
            $table->decimal('original_amount', 15, 2);
            $table->decimal('revised_amount', 15, 2); // Handles PO changes
            
            $table->string('status'); // draft, approved, issued, partially_received, closed
            
            $table->timestamp('approved_at')->nullable();
            
            $table->integer('version')->default(1);
            $table->timestamps();
        });

        Schema::create('purchase_order_lines', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('purchase_order_id')->constrained('purchase_orders')->onDelete('cascade');
            
            $table->string('description');
            $table->decimal('quantity', 10, 2);
            $table->decimal('unit_price', 15, 2);
            $table->decimal('total_amount', 15, 2);
            
            // Commitment tracking
            $table->uuid('budget_line_id')->nullable()->constrained('budget_lines')->onDelete('set null');
            $table->decimal('received_quantity', 10, 2)->default(0);
            
            $table->timestamps();
        });
        
        // 4. Commitments Ledger (Bridging POs to Budgets)
        Schema::create('commitments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('budget_line_id')->constrained('budget_lines')->onDelete('cascade');
            
            $table->string('source_type'); // purchase_order
            $table->uuid('source_id');
            
            $table->decimal('original_commitment', 15, 2);
            $table->decimal('consumed_commitment', 15, 2)->default(0); // Updates as Receipts/Bills come in
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('commitments');
        Schema::dropIfExists('purchase_order_lines');
        Schema::dropIfExists('purchase_orders');
        Schema::dropIfExists('procurement_request_lines');
        Schema::dropIfExists('procurement_requests');
        Schema::dropIfExists('supplier_profiles');
    }
};
