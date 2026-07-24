<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('project_members', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('project_id')->constrained('projects')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->uuid('role_id')->nullable()->constrained('project_roles')->onDelete('set null');
            
            $table->date('join_date')->nullable();
            $table->date('leave_date')->nullable();
            $table->string('status')->default('active'); // active, inactive, removed
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->unique(['project_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_members');
    }
};
