<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('feature_flags', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('key')->unique(); // e.g. enable_ai_summaries
            $table->string('name');
            $table->text('description')->nullable();
            
            $table->string('type')->default('boolean'); // boolean, string, json
            $table->text('default_value')->nullable(); // Can store 'true', 'false', or JSON string
            
            $table->boolean('is_active')->default(true); // Emergency kill switch
            
            $table->uuid('module_id')->nullable()->constrained('modules')->onDelete('cascade');
            
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('feature_flag_rules', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('feature_flag_id')->constrained('feature_flags')->onDelete('cascade');
            
            $table->string('scope'); // Global, Tenant, Edition, Plan, Percentage
            $table->string('scope_id')->nullable(); // The specific UUID of the tenant/edition etc.
            
            $table->text('value'); // The overridden value for this scope
            $table->integer('priority')->default(1);
            
            $table->timestamps();
            
            $table->index(['feature_flag_id', 'scope', 'scope_id']);
        });

        Schema::create('usage_counters', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            $table->uuid('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->string('limit_key'); // e.g. max_users, max_storage_gb
            
            $table->integer('current_value')->default(0);
            
            // To support Monthly/Annual resetting limits
            $table->timestamp('period_starts_at')->nullable();
            $table->timestamp('period_ends_at')->nullable();
            
            $table->timestamps();
            
            $table->unique(['tenant_id', 'limit_key']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('usage_counters');
        Schema::dropIfExists('feature_flag_rules');
        Schema::dropIfExists('feature_flags');
    }
};
