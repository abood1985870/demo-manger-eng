<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('meeting_agendas', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('meeting_id')->constrained('meetings')->onDelete('cascade');
            
            $table->string('version')->default('1.0');
            $table->string('status')->default('Draft'); // Published, Approved
            
            $table->timestamps();
        });

        Schema::create('meeting_agenda_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('agenda_id')->constrained('meeting_agendas')->onDelete('cascade');
            
            $table->integer('sequence_number'); // For drag-and-drop
            
            $table->string('title_en');
            $table->string('title_ar')->nullable();
            $table->text('description')->nullable();
            
            $table->foreignId('presenter_id')->nullable()->constrained('users');
            
            $table->integer('planned_duration_minutes')->default(0);
            $table->integer('actual_duration_minutes')->default(0);
            
            $table->string('purpose'); // Information, Discussion, Decision, Voting
            $table->string('status')->default('Pending'); // In Progress, Completed, Deferred
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('meeting_agenda_items');
        Schema::dropIfExists('meeting_agendas');
    }
};
