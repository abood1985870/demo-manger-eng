<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_editions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('machine_key')->unique(); // e.g. ewos-enterprise, ewos-legal-saudi
            $table->string('name_en');
            $table->string('name_ar')->nullable();
            $table->text('description')->nullable();
            
            $table->string('version')->default('1.0');
            $table->string('status')->default('Active'); // Draft, Active, Deprecated
            
            $table->string('deployment_compatibility')->default('all'); // saas, private-cloud, on-premises, all
            
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('product_edition_modules', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('edition_id')->constrained('product_editions')->onDelete('cascade');
            $table->uuid('module_id')->constrained('modules')->onDelete('cascade');
            
            $table->boolean('is_default')->default(true); // Automatically granted
            
            $table->timestamps();
            
            $table->unique(['edition_id', 'module_id']);
        });

        Schema::create('subscription_plans', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('machine_key')->unique(); // e.g. pro-monthly, enterprise-annual
            $table->string('name_en');
            $table->string('name_ar')->nullable();
            
            $table->uuid('edition_id')->constrained('product_editions')->onDelete('cascade');
            
            $table->string('billing_cycle')->default('monthly'); // monthly, annual, perpetual
            $table->string('status')->default('Active');
            
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('subscription_plan_limits', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('plan_id')->constrained('subscription_plans')->onDelete('cascade');
            
            $table->string('limit_key'); // e.g. max_users, max_storage_gb, max_projects
            $table->integer('hard_limit_value')->default(-1); // -1 = Unlimited
            $table->integer('warning_threshold_percent')->default(90);
            
            $table->timestamps();
            
            $table->unique(['plan_id', 'limit_key']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscription_plan_limits');
        Schema::dropIfExists('subscription_plans');
        Schema::dropIfExists('product_edition_modules');
        Schema::dropIfExists('product_editions');
    }
};
