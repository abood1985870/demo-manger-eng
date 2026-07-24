<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Cost Forecasts (EAC / ETC snapshots)
        Schema::create('cost_forecasts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            
            $table->uuid('budget_id')->constrained('budgets')->onDelete('cascade');
            $table->integer('forecast_version');
            
            $table->string('forecast_method'); // manual, eac_trend, commitment_based
            
            // Forecast totals at time of snapshot
            $table->decimal('budget_at_completion', 15, 2); // BAC
            $table->decimal('actual_cost', 15, 2);           // AC
            $table->decimal('estimate_to_complete', 15, 2);  // ETC
            $table->decimal('estimate_at_completion', 15, 2);// EAC
            $table->decimal('variance_at_completion', 15, 2);// VAC
            
            $table->string('status'); // draft, approved
            
            $table->foreignId('approved_by')->nullable()->constrained('users');
            $table->timestamp('approved_at')->nullable();
            
            $table->timestamps();
            
            $table->unique(['budget_id', 'forecast_version']);
        });

        // 2. EVM Calculation Runs (Relies on Step 12 Baselines and Step 14 Actual Time)
        Schema::create('evm_calculation_runs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            
            $table->uuid('project_id')->constrained('projects')->onDelete('cascade');
            $table->uuid('schedule_baseline_id')->constrained('schedule_baselines'); // From Step 12A
            
            $table->timestamp('cutoff_date'); // The "As Of" date for the calculation
            
            $table->decimal('planned_value', 15, 2); // PV
            $table->decimal('earned_value', 15, 2);  // EV
            $table->decimal('actual_cost', 15, 2);   // AC
            
            $table->decimal('schedule_variance', 15, 2); // SV
            $table->decimal('cost_variance', 15, 2);     // CV
            
            $table->decimal('schedule_performance_index', 8, 4); // SPI
            $table->decimal('cost_performance_index', 8, 4);     // CPI
            
            $table->string('status'); // completed, partial_data_warning
            $table->text('warnings')->nullable(); // JSON warnings if baseline/progress data was missing
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evm_calculation_runs');
        Schema::dropIfExists('cost_forecasts');
    }
};
