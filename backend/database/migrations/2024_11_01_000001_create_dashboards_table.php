<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dashboards', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('machine_key')->unique()->nullable();
            
            $table->string('name_en');
            $table->string('name_ar')->nullable();
            $table->text('description_en')->nullable();
            $table->text('description_ar')->nullable();
            
            $table->string('type')->default('Custom'); // Personal, Executive, PMO, Custom
            $table->string('visibility')->default('Private'); // Private, Team, Tenant
            
            $table->uuid('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->foreignId('owner_id')->nullable()->constrained('users')->onDelete('set null');
            
            // Polymorphic relation to specific scopes (e.g. Project Dashboard)
            $table->uuidMorphs('scope'); // scope_type, scope_id
            
            $table->json('layout_configuration')->nullable(); // Grid layout coordinates X, Y, W, H
            $table->json('default_filters')->nullable();
            
            $table->boolean('is_template')->default(false);
            $table->boolean('is_system')->default(false);
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['tenant_id', 'type']);
        });

        Schema::create('widget_types', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('machine_key')->unique(); // e.g. kpi_card, line_chart
            $table->string('name');
            $table->text('supported_configurations')->nullable(); // JSON schema
            
            $table->timestamps();
        });

        Schema::create('widgets', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            $table->uuid('dashboard_id')->constrained('dashboards')->onDelete('cascade');
            $table->uuid('widget_type_id')->constrained('widget_types')->onDelete('restrict');
            
            $table->string('title')->nullable();
            
            $table->json('configuration'); // Data source, Metric ID, Filters, Grouping
            $table->integer('refresh_interval_seconds')->default(0); // 0 = manual/load
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('widgets');
        Schema::dropIfExists('widget_types');
        Schema::dropIfExists('dashboards');
    }
};
