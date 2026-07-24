<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('channels', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->text('description')->nullable();
            
            // Types: public, private, department, team, project, announcement
            $table->string('type')->default('public'); 
            $table->string('visibility')->default('public');
            
            // Context mapping if it's tied to an entity
            $table->uuid('project_id')->nullable()->constrained('projects')->onDelete('cascade');
            $table->foreignId('department_id')->nullable()->constrained('departments')->onDelete('cascade');
            $table->foreignId('team_id')->nullable()->constrained('teams')->onDelete('cascade');
            
            $table->string('avatar')->nullable();
            
            $table->foreignId('owner_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            
            $table->boolean('is_archived')->default(false);
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['type', 'is_archived']);
        });

        Schema::create('channel_members', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('channel_id')->constrained('channels')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('role')->default('member'); // admin, member, guest
            $table->timestamp('joined_at')->useCurrent();
            
            // Notification preferences
            $table->boolean('is_muted')->default(false);
            
            $table->timestamps();
            $table->unique(['channel_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('channel_members');
        Schema::dropIfExists('channels');
    }
};
