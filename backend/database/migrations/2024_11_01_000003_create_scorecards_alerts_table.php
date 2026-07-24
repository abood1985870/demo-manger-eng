<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('scorecards', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->constrained('tenants')->onDelete('cascade');
            
            $table->string('name');
            $table->string('type'); // Executive, Department, Personal
            
            $table->uuidMorphs('owner_scope'); // Who owns the scorecard
            
            $table->string('period_type'); // Monthly, Quarterly, Annual
            
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('scorecard_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('scorecard_id')->constrained('scorecards')->onDelete('cascade');
            $table->uuid('kpi_id')->constrained('kpi_definitions')->onDelete('cascade');
            
            $table->decimal('weight', 5, 2)->default(1.0); // Multiplier for overall score
            
            $table->timestamps();
        });

        Schema::create('analytics_alerts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->constrained('tenants')->onDelete('cascade');
            
            $table->uuid('kpi_id')->nullable()->constrained('kpi_definitions')->onDelete('cascade');
            
            $table->string('condition'); // goes_critical, exceeds_threshold
            $table->integer('cooldown_minutes')->default(60);
            
            $table->timestamp('last_triggered_at')->nullable();
            
            $table->json('recipients'); // Array of User IDs
            $table->boolean('trigger_workflow')->default(false);
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('analytics_alerts');
        Schema::dropIfExists('scorecard_items');
        Schema::dropIfExists('scorecards');
    }
};
