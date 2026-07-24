<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('add_ons', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('machine_key')->unique(); // e.g. extra-storage-1tb, legal-practice-pack
            $table->string('name_en');
            $table->string('name_ar')->nullable();
            $table->text('description')->nullable();
            
            $table->string('status')->default('Active'); // Active, Deprecated
            
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('add_on_modules', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('add_on_id')->constrained('add_ons')->onDelete('cascade');
            $table->uuid('module_id')->constrained('modules')->onDelete('cascade');
            
            $table->timestamps();
            $table->unique(['add_on_id', 'module_id']);
        });

        Schema::create('add_on_features', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('add_on_id')->constrained('add_ons')->onDelete('cascade');
            
            $table->string('feature_key');
            $table->string('value')->nullable(); // e.g. limit overrides like "100" or feature toggles
            
            $table->timestamps();
            $table->unique(['add_on_id', 'feature_key']);
        });

        Schema::create('tenant_add_ons', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->uuid('add_on_id')->constrained('add_ons')->onDelete('cascade');
            
            $table->string('status')->default('Active'); // Active, Expired, Revoked
            
            $table->timestamp('effective_from')->nullable();
            $table->timestamp('effective_until')->nullable();
            
            $table->timestamps();
            $table->index(['tenant_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenant_add_ons');
        Schema::dropIfExists('add_on_features');
        Schema::dropIfExists('add_on_modules');
        Schema::dropIfExists('add_ons');
    }
};
