<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Releases
        Schema::create('agile_releases', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            $table->uuid('project_id')->nullable()->constrained('projects')->onDelete('cascade');
            $table->string('name_en');
            $table->string('name_ar')->nullable();
            $table->string('release_number');
            $table->text('description')->nullable();
            $table->string('status'); // Draft, Planned, In Development, Ready, Released, Cancelled
            $table->timestamp('planned_start')->nullable();
            $table->timestamp('planned_release_date')->nullable();
            $table->timestamp('forecast_release_date')->nullable();
            $table->timestamp('actual_release_date')->nullable();
            $table->foreignId('owner_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('released_by')->nullable()->constrained('users')->onDelete('set null');
            $table->boolean('is_scope_frozen')->default(false);
            $table->timestamps();
            
            $table->unique(['tenant_id', 'project_id', 'release_number']);
        });

        // Release Items mapping
        Schema::create('agile_release_items', function (Blueprint $table) {
            $table->uuid('release_id')->constrained('agile_releases')->onDelete('cascade');
            $table->uuid('task_id')->constrained('tasks')->onDelete('cascade');
            $table->timestamps();
            $table->primary(['release_id', 'task_id']);
        });

        // Retrospectives
        Schema::create('agile_retrospectives', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('sprint_id')->nullable()->constrained('agile_sprints')->onDelete('cascade');
            $table->uuid('team_id')->nullable()->constrained('teams')->onDelete('cascade');
            $table->string('template'); // start_stop_continue, mad_sad_glad, custom
            $table->string('status'); // Draft, Collecting, Discussing, Voting, Completed
            $table->foreignId('facilitator_id')->nullable()->constrained('users')->onDelete('set null');
            $table->boolean('is_anonymous')->default(true);
            $table->timestamps();
        });

        // Retrospective Items (The cards created during retro)
        Schema::create('agile_retrospective_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('retrospective_id')->constrained('agile_retrospectives')->onDelete('cascade');
            $table->string('section'); // e.g. "Went Well", "Needs Improvement"
            $table->text('content');
            $table->integer('votes_count')->default(0);
            $table->uuid('author_id')->nullable(); // Intentionally unconstrained to protect anonymity if deleted
            $table->timestamps();
        });

        // Actions mapping back to main Tasks table
        Schema::create('agile_retrospective_actions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('retrospective_id')->constrained('agile_retrospectives')->onDelete('cascade');
            $table->uuid('task_id')->constrained('tasks')->onDelete('cascade'); // The action item is an actual task
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agile_retrospective_actions');
        Schema::dropIfExists('agile_retrospective_items');
        Schema::dropIfExists('agile_retrospectives');
        Schema::dropIfExists('agile_release_items');
        Schema::dropIfExists('agile_releases');
    }
};
