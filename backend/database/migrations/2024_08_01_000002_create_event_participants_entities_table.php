<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Polymorphic participants (Users, Teams, Departments)
        Schema::create('event_participants', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('event_id')->constrained('calendar_events')->onDelete('cascade');
            
            $table->string('participant_type'); // User, Team, Department
            $table->string('participant_id');
            
            $table->string('status')->default('pending'); // accepted, declined, tentative, pending
            $table->boolean('is_required')->default(true);
            
            $table->timestamps();
            
            $table->index(['participant_type', 'participant_id']);
            $table->unique(['event_id', 'participant_type', 'participant_id'], 'event_participant_unique');
        });

        // Polymorphic links to Projects, Tasks, Workflows, Documents
        Schema::create('event_entities', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('event_id')->constrained('calendar_events')->onDelete('cascade');
            
            $table->string('entity_type'); // Project, Task, Workflow, Document
            $table->string('entity_id');
            
            $table->timestamps();
            
            $table->index(['entity_type', 'entity_id']);
            $table->unique(['event_id', 'entity_type', 'entity_id'], 'event_entity_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_entities');
        Schema::dropIfExists('event_participants');
    }
};
