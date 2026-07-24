<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('meeting_types', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name_en');
            $table->string('name_ar')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('meetings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('meeting_number')->unique(); // e.g. MTG-2026-000001
            
            $table->uuid('type_id')->nullable()->constrained('meeting_types')->onDelete('set null');
            
            // Link to CalendarEvent wrapper for exact scheduling/conflict logic
            $table->uuid('calendar_event_id')->nullable()->constrained('calendar_events')->onDelete('set null');
            
            $table->string('title_en');
            $table->string('title_ar')->nullable();
            $table->text('description_en')->nullable();
            $table->text('description_ar')->nullable();
            
            $table->foreignId('organizer_id')->constrained('users');
            $table->foreignId('chairperson_id')->nullable()->constrained('users');
            $table->foreignId('secretary_id')->nullable()->constrained('users');
            
            $table->string('status')->default('Draft');
            $table->string('confidentiality_level')->default('Internal'); // Public, Internal, Confidential
            
            $table->boolean('quorum_required')->default(false);
            $table->boolean('approval_required')->default(false);
            
            // Context Links (Polymorphic references to projects, portfolios, etc.)
            $table->string('context_type')->nullable();
            $table->string('context_id')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['context_type', 'context_id']);
        });

        Schema::create('meeting_status_transitions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('meeting_id')->constrained('meetings')->onDelete('cascade');
            
            $table->string('previous_status');
            $table->string('new_status');
            $table->text('reason')->nullable();
            
            $table->foreignId('changed_by')->constrained('users');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('meeting_status_transitions');
        Schema::dropIfExists('meetings');
        Schema::dropIfExists('meeting_types');
    }
};
