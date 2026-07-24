<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Fiscal Calendars & Periods
        Schema::create('fiscal_calendars', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            $table->string('name');
            $table->string('calendar_type'); // calendar_year, custom, 4-4-5
            $table->timestamps();
        });

        Schema::create('fiscal_periods', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('calendar_id')->constrained('fiscal_calendars')->onDelete('cascade');
            $table->string('period_name');
            $table->date('start_date');
            $table->date('end_date');
            
            // Period Locks
            $table->string('status')->default('open'); // open, soft_closed, procurement_closed, hard_closed
            $table->timestamps();
            
            $table->unique(['calendar_id', 'period_name']);
        });

        // 2. Cost Centers
        Schema::create('cost_centers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            $table->string('code')->unique();
            $table->string('name_en');
            $table->string('name_ar')->nullable();
            
            $table->uuid('parent_id')->nullable()->constrained('cost_centers')->onDelete('set null');
            $table->foreignId('manager_id')->nullable()->constrained('users');
            
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 3. Funding Sources
        Schema::create('funding_sources', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            $table->string('code')->unique();
            $table->string('name');
            $table->decimal('total_authorized_amount', 15, 2);
            $table->string('currency', 3);
            
            $table->foreignId('owner_id')->nullable()->constrained('users');
            $table->timestamp('expiration_date')->nullable();
            $table->string('status')->default('active'); // active, expired, exhausted
            $table->timestamps();
        });

        // 4. Budgets and Versions
        Schema::create('budgets', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            $table->string('name');
            $table->string('model_type'); // operating, capital, project
            
            $table->uuid('project_id')->nullable()->constrained('projects')->onDelete('set null');
            $table->uuid('cost_center_id')->nullable()->constrained('cost_centers')->onDelete('set null');
            
            $table->string('control_mode')->default('informational'); // hard, soft, informational
            $table->timestamps();
        });

        Schema::create('budget_versions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('budget_id')->constrained('budgets')->onDelete('cascade');
            
            $table->integer('version_number');
            $table->string('version_type'); // original, revised, supplemental
            $table->string('status'); // draft, pending_approval, approved, superseded
            
            $table->foreignId('approved_by')->nullable()->constrained('users');
            $table->timestamp('approved_at')->nullable();
            
            $table->timestamps();
            
            $table->unique(['budget_id', 'version_number']);
        });

        // 5. Budget Lines
        Schema::create('budget_lines', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('budget_version_id')->constrained('budget_versions')->onDelete('cascade');
            
            $table->uuid('period_id')->nullable()->constrained('fiscal_periods')->onDelete('set null');
            $table->uuid('funding_source_id')->nullable()->constrained('funding_sources')->onDelete('set null');
            
            $table->string('cost_category')->nullable(); // OPEX, CAPEX, specific GL code ref
            
            $table->decimal('original_amount', 15, 2);
            $table->decimal('current_budget', 15, 2);
            
            // Availability Tracking (Calculated / Roll-ups)
            $table->decimal('reserved_amount', 15, 2)->default(0);
            $table->decimal('committed_amount', 15, 2)->default(0);
            $table->decimal('actual_amount', 15, 2)->default(0);
            
            $table->string('currency', 3);
            
            $table->integer('version')->default(1); // Optimistic lock for concurrent availability checks
            $table->timestamps();
        });

        // 6. Budget Reservations (Soft locks before Commitments)
        Schema::create('budget_reservations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('budget_line_id')->constrained('budget_lines')->onDelete('cascade');
            
            $table->string('source_type'); // requisition, manual
            $table->uuid('source_id');
            
            $table->decimal('amount', 15, 2);
            $table->string('status'); // pending, consumed, released, expired
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('budget_reservations');
        Schema::dropIfExists('budget_lines');
        Schema::dropIfExists('budget_versions');
        Schema::dropIfExists('budgets');
        Schema::dropIfExists('funding_sources');
        Schema::dropIfExists('cost_centers');
        Schema::dropIfExists('fiscal_periods');
        Schema::dropIfExists('fiscal_calendars');
    }
};
