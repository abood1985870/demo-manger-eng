<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('modules', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('machine_key')->unique(); // e.g. core.identity, work.meetings, legal.cases
            $table->string('name_en');
            $table->string('name_ar')->nullable();
            $table->text('description')->nullable();
            
            $table->string('version')->default('1.0.0');
            $table->string('category')->default('core'); // core, work, legal, integration
            $table->string('vendor')->default('EWOS');
            
            $table->boolean('is_core')->default(false); // Core modules cannot be disabled
            $table->boolean('is_installed')->default(false);
            $table->boolean('is_enabled')->default(false);
            
            $table->string('health_status')->default('healthy'); // healthy, degraded, failed
            
            $table->timestamp('installed_at')->nullable();
            $table->timestamp('enabled_at')->nullable();
            $table->timestamp('disabled_at')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('module_dependencies', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('module_id')->constrained('modules')->onDelete('cascade');
            $table->uuid('depends_on_module_id')->constrained('modules')->onDelete('cascade');
            
            $table->boolean('is_required')->default(true);
            
            $table->timestamps();
            
            $table->unique(['module_id', 'depends_on_module_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('module_dependencies');
        Schema::dropIfExists('modules');
    }
};
