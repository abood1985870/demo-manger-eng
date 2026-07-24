<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('task_number')->unique(); // e.g. PROJ-1
            $table->uuid('parent_id')->nullable()->constrained('tasks')->onDelete('cascade'); // For Subtasks
            
            $table->uuid('project_id')->constrained('projects')->onDelete('cascade');
            $table->uuid('phase_id')->nullable()->constrained('phases')->onDelete('set null');
            $table->uuid('milestone_id')->nullable()->constrained('milestones')->onDelete('set null');
            $table->uuid('epic_id')->nullable()->constrained('epics')->onDelete('set null');
            
            $table->string('title'); // Renamed from name to title for tasks
            $table->text('description')->nullable();
            
            $table->uuid('type_id')->nullable()->constrained('task_types')->onDelete('set null');
            $table->uuid('status_id')->nullable()->constrained('project_statuses')->onDelete('set null');
            $table->uuid('priority_id')->nullable()->constrained('priorities')->onDelete('set null');
            
            $table->integer('progress')->default(0); // 0 to 100
            
            $table->decimal('estimated_hours', 10, 2)->default(0);
            $table->decimal('actual_hours', 10, 2)->default(0);
            
            $table->date('start_date')->nullable();
            $table->date('due_date')->nullable();
            $table->date('completion_date')->nullable();
            
            $table->string('color')->nullable();
            $table->json('tags')->nullable();
            
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
            
            $table->boolean('is_archived')->default(false);
            
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
