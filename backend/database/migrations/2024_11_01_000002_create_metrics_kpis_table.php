<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('metric_definitions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('machine_key')->unique(); // e.g. projects.total, tasks.overdue
            
            $table->string('name_en');
            $table->string('name_ar')->nullable();
            
            $table->string('module_owner'); // e.g. work.projects
            $table->string('measure_type')->default('numeric'); // numeric, percentage, duration
            $table->string('aggregation_type')->default('count'); // count, sum, average
            
            $table->string('data_freshness')->default('daily'); // real-time, daily
            
            $table->timestamps();
        });

        // The Read-Model / Materialized Data Table
        Schema::create('metric_snapshots', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            $table->uuid('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->uuid('metric_id')->constrained('metric_definitions')->onDelete('cascade');
            
            $table->decimal('value', 15, 4); // Stores the aggregated result
            
            // Dimensions for slicing/dicing
            $table->uuid('project_id')->nullable(); 
            $table->foreignId('user_id')->nullable();
            $table->string('status_dimension')->nullable();
            
            $table->timestamp('period_start');
            $table->timestamp('period_end');
            
            $table->string('calculation_version')->default('1.0');
            
            $table->timestamps();
            
            // Highly optimized composite index for fast dashboard querying
            $table->index(['tenant_id', 'metric_id', 'period_end']);
        });

        Schema::create('kpi_definitions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            $table->uuid('metric_id')->constrained('metric_definitions')->onDelete('cascade');
            $table->uuid('tenant_id')->constrained('tenants')->onDelete('cascade');
            
            $table->string('name');
            $table->string('direction'); // higher_is_better, lower_is_better, target_range
            
            $table->decimal('warning_threshold', 15, 4)->nullable();
            $table->decimal('critical_threshold', 15, 4)->nullable();
            
            $table->string('status')->default('Not Calculated');
            
            $table->timestamps();
        });

        Schema::create('kpi_targets', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('kpi_id')->constrained('kpi_definitions')->onDelete('cascade');
            
            $table->decimal('target_value', 15, 4);
            $table->timestamp('valid_from');
            $table->timestamp('valid_until')->nullable();
            
            $table->uuidMorphs('target_scope'); // E.g. assigned to a specific Department or User
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kpi_targets');
        Schema::dropIfExists('kpi_definitions');
        Schema::dropIfExists('metric_snapshots');
        Schema::dropIfExists('metric_definitions');
    }
};
