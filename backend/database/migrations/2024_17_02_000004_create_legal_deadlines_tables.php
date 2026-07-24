<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Legal Deadline Rules (Configurable rules to avoid hardcoded assumptions)
        Schema::create('legal_deadline_types', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            
            $table->string('code')->unique(); // e.g., APPEAL_30_DAYS
            $table->string('name_en');
            $table->string('name_ar')->nullable();
            
            $table->integer('duration'); // e.g., 30
            $table->string('unit'); // days, weeks, months, business_days
            
            $table->string('jurisdiction_provider')->nullable(); // Allows attaching specific local logic (e.g. Saudi weekends)
            
            $table->boolean('is_active')->default(true);
            $table->integer('version')->default(1);
            $table->timestamps();
        });

        // 2. Legal Deadlines (Calculated instances attached to Cases/Matters)
        Schema::create('legal_deadlines', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            $table->uuid('legal_case_id')->nullable()->constrained('legal_cases')->onDelete('cascade');
            
            $table->uuid('deadline_type_id')->nullable()->constrained('legal_deadline_types');
            
            $table->string('title_en');
            $table->string('title_ar')->nullable();
            
            $table->timestamp('trigger_date'); // The event that caused the clock to start
            $table->timestamp('calculated_due_date'); // Authoritative UTC Gregorian date
            
            $table->string('hijri_representation_foundation')->nullable(); // E.g. "1447-02-15" (For display/tracking only)
            
            $table->timestamp('adjusted_due_date')->nullable(); // If extended or suspended
            
            $table->string('status'); // active, due_soon, overdue, completed, cancelled
            
            $table->text('override_reason')->nullable();
            $table->foreignId('overridden_by')->nullable()->constrained('users');
            
            $table->uuid('task_id')->nullable()->constrained('tasks'); // Link to Core task for execution/assignment
            
            $table->integer('version')->default(1);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('legal_deadlines');
        Schema::dropIfExists('legal_deadline_types');
    }
};
