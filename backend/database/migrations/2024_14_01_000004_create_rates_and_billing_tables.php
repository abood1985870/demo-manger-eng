<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Rate Cards
        Schema::create('rate_cards', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            $table->string('name');
            $table->string('currency');
            $table->string('type'); // billing, cost
            $table->string('status'); // draft, active, archived
            $table->date('effective_from');
            $table->date('effective_until')->nullable();
            
            $table->integer('version')->default(1);
            $table->timestamps();
        });

        // Specific Rules inside a Rate Card
        Schema::create('rate_rules', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('rate_card_id')->constrained('rate_cards')->onDelete('cascade');
            
            // The precedence triggers
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('cascade');
            $table->string('role_name')->nullable();
            $table->uuid('project_id')->nullable()->constrained('projects')->onDelete('cascade');
            $table->uuid('category_id')->nullable()->constrained('time_categories')->onDelete('cascade');
            
            $table->decimal('hourly_rate', 10, 2);
            $table->timestamps();
        });

        // Professional Services Engagements (Client / Billing link)
        Schema::create('service_engagements', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            $table->uuid('project_id')->nullable()->constrained('projects')->onDelete('cascade');
            
            $table->string('name');
            $table->string('billing_model'); // time_and_materials, fixed_fee, non_billable
            
            $table->uuid('billing_rate_card_id')->nullable()->constrained('rate_cards')->onDelete('set null');
            $table->uuid('cost_rate_card_id')->nullable()->constrained('rate_cards')->onDelete('set null');
            
            $table->string('currency');
            $table->string('status'); // active, closed
            
            $table->timestamps();
        });

        // Time Budgets (Limits)
        Schema::create('time_budgets', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            $table->uuid('engagement_id')->nullable()->constrained('service_engagements')->onDelete('cascade');
            $table->uuid('project_id')->nullable()->constrained('projects')->onDelete('cascade');
            
            $table->string('budget_type'); // hours, billable_amount, cost_amount
            $table->decimal('total_budget', 12, 2);
            
            $table->decimal('consumed_value', 12, 2)->default(0);
            $table->decimal('warning_threshold_percent', 5, 2)->default(80.00); // Trigger alert at 80%
            
            $table->timestamps();
        });

        // Billing Drafts (Pre-invoicing)
        Schema::create('billing_drafts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            $table->uuid('engagement_id')->constrained('service_engagements')->onDelete('cascade');
            
            $table->string('draft_number');
            $table->string('status'); // draft, under_review, approved, exported
            $table->date('period_start');
            $table->date('period_end');
            
            $table->string('currency');
            $table->decimal('gross_amount', 12, 2)->default(0);
            $table->decimal('adjustments_amount', 12, 2)->default(0);
            $table->decimal('net_amount', 12, 2)->default(0);
            
            $table->timestamps();
        });
        
        // Link time entries to a billing draft
        Schema::create('billing_draft_lines', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('billing_draft_id')->constrained('billing_drafts')->onDelete('cascade');
            $table->uuid('time_entry_id')->constrained('time_entries')->onDelete('cascade');
            
            $table->decimal('quantity_minutes', 10, 2);
            $table->decimal('applied_rate', 10, 2);
            $table->decimal('line_amount', 12, 2);
            
            $table->timestamps();
            
            $table->unique(['billing_draft_id', 'time_entry_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('billing_draft_lines');
        Schema::dropIfExists('billing_drafts');
        Schema::dropIfExists('time_budgets');
        Schema::dropIfExists('service_engagements');
        Schema::dropIfExists('rate_rules');
        Schema::dropIfExists('rate_cards');
    }
};
