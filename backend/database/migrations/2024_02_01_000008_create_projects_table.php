<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('program_id')->nullable()->constrained('programs')->onDelete('set null');
            $table->string('name');
            $table->string('code')->unique();
            $table->text('description')->nullable();
            
            $table->string('client')->nullable();
            $table->foreignId('department_id')->nullable()->constrained('departments')->onDelete('set null');
            $table->foreignId('manager_id')->nullable()->constrained('users')->onDelete('set null');
            
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            
            $table->decimal('planned_budget', 15, 2)->default(0);
            $table->decimal('actual_budget', 15, 2)->default(0);
            $table->string('currency', 3)->default('USD');
            
            $table->uuid('status_id')->nullable()->constrained('project_statuses')->onDelete('set null');
            $table->uuid('priority_id')->nullable()->constrained('priorities')->onDelete('set null');
            
            $table->integer('progress')->default(0); // 0 to 100
            $table->string('color')->nullable();
            $table->string('icon')->nullable();
            $table->string('visibility')->default('private'); // public, private, team
            $table->boolean('is_archived')->default(false);
            
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
            
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
