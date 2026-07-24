<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('report_schedules', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->constrained('tenants')->onDelete('cascade');
            
            $table->string('name');
            $table->uuid('dashboard_id')->nullable()->constrained('dashboards')->onDelete('set null');
            
            $table->string('frequency'); // daily, weekly, monthly
            $table->json('recipients'); // Array of user IDs or emails
            
            $table->string('format')->default('pdf'); // pdf, csv, xlsx
            
            $table->timestamp('last_run_at')->nullable();
            $table->timestamp('next_run_at')->nullable();
            
            $table->boolean('is_active')->default(true);
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('report_schedules');
    }
};
