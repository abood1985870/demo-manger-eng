<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('calendars', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('type'); // personal, team, department, company, project, resource
            $table->text('description')->nullable();
            
            // Polymorphic link to Project, Team, Department, etc.
            $table->string('calendarable_type')->nullable();
            $table->string('calendarable_id')->nullable();
            
            $table->string('color')->nullable();
            $table->string('timezone')->default('UTC');
            $table->foreignId('owner_id')->constrained('users')->onDelete('cascade');
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['calendarable_type', 'calendarable_id']);
        });

        Schema::create('recurring_rules', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('frequency'); // daily, weekly, monthly, yearly
            $table->integer('interval')->default(1);
            $table->string('by_day')->nullable(); // MO,TU,WE
            $table->integer('by_month_day')->nullable();
            $table->integer('by_month')->nullable();
            $table->integer('count')->nullable(); // Max occurrences
            $table->timestamp('until')->nullable(); // End date of recurrence
            $table->string('rrule_string')->nullable(); // Full standard RRULE format
            
            $table->timestamps();
        });

        Schema::create('calendar_events', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('calendar_id')->constrained('calendars')->onDelete('cascade');
            
            // For expanded recurring events
            $table->uuid('parent_id')->nullable()->constrained('calendar_events')->onDelete('cascade'); 
            $table->uuid('recurring_rule_id')->nullable()->constrained('recurring_rules')->onDelete('set null');
            
            $table->string('event_type'); // meeting, deadline, milestone, holiday, etc.
            $table->string('title');
            $table->text('description')->nullable();
            
            // Absolute UTC constraints for backend math
            $table->timestamp('start_datetime')->index();
            $table->timestamp('end_datetime')->index();
            $table->string('timezone'); // Original localized timezone e.g. Asia/Riyadh
            $table->boolean('is_all_day')->default(false);
            
            $table->string('location')->nullable();
            $table->string('online_meeting_link')->nullable();
            
            $table->string('status'); // scheduled, cancelled, completed
            $table->string('priority')->default('normal');
            $table->string('visibility')->default('public'); // public, private, restricted
            $table->string('color')->nullable();
            
            $table->foreignId('organizer_id')->constrained('users')->onDelete('cascade');
            
            $table->timestamps();
            $table->softDeletes();
            
            // Optimize for conflict detection boundaries
            $table->index(['start_datetime', 'end_datetime']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('calendar_events');
        Schema::dropIfExists('recurring_rules');
        Schema::dropIfExists('calendars');
    }
};
