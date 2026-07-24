<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Simple automation rules without complex DAGs (If X then Y)
        Schema::create('automation_rules', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->text('description')->nullable();
            
            // Scope
            $table->string('context_type')->nullable(); // Project, Task, etc.
            $table->string('context_id')->nullable();
            
            // IF
            $table->string('trigger_event'); // e.g. task_priority_changed
            $table->json('conditions'); // array of simple conditions
            
            // THEN
            $table->json('actions'); // array of simple actions
            
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('automation_rules');
    }
};
