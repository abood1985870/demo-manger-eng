<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Lookup tables for time categories (e.g., Client Work, Internal, Meeting)
        Schema::create('time_categories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            $table->string('name_en');
            $table->string('name_ar')->nullable();
            $table->boolean('is_billable_default')->default(false);
            $table->boolean('is_costable_default')->default(true);
            $table->timestamps();
        });

        // The core Time Entries table
        Schema::create('time_entries', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            
            // Context (What are we tracking time against?)
            $table->uuid('project_id')->nullable()->constrained('projects')->onDelete('set null');
            $table->uuid('task_id')->nullable()->constrained('tasks')->onDelete('set null');
            $table->uuid('category_id')->nullable()->constrained('time_categories')->onDelete('set null');
            
            // Timing
            $table->date('entry_date');
            $table->timestamp('start_time')->nullable();
            $table->timestamp('end_time')->nullable();
            $table->integer('duration_minutes'); // The ultimate source of truth for time spent
            $table->integer('rounded_duration_minutes')->nullable(); // Original duration is never destroyed
            $table->string('timezone')->default('UTC');
            
            // Metadata
            $table->string('source'); // manual, timer, calendar, import
            $table->text('description')->nullable();
            $table->text('internal_note')->nullable();
            
            // Classifications
            $table->string('billable_classification')->default('billable'); // billable, non_billable, pending
            $table->boolean('is_overtime')->default(false);
            
            // Lifecycle and Locks
            $table->string('approval_status')->default('draft'); // draft, submitted, approved, rejected
            $table->boolean('is_locked')->default(false);
            $table->string('invoicing_status')->default('unbilled'); // unbilled, drafted, invoiced, written_off
            
            // Historical Rate Protection (stamped upon approval or invoice draft)
            $table->decimal('applied_billing_rate', 10, 2)->nullable();
            $table->uuid('billing_rate_version_id')->nullable();
            $table->string('currency')->nullable();
            $table->decimal('net_billable_amount', 12, 2)->nullable();
            
            // Optimistic Concurrency and Audit
            $table->integer('version')->default(1);
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
            
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes for fast timesheet and reporting queries
            $table->index(['tenant_id', 'user_id', 'entry_date']);
            $table->index(['tenant_id', 'project_id', 'entry_date']);
        });

        // Active Timers (Only one running per user typically)
        Schema::create('active_timers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            
            // Same context as time entry
            $table->uuid('project_id')->nullable()->constrained('projects')->onDelete('set null');
            $table->uuid('task_id')->nullable()->constrained('tasks')->onDelete('set null');
            $table->text('description')->nullable();
            
            $table->string('status'); // running, paused
            $table->timestamp('started_at');
            $table->timestamp('last_resumed_at')->nullable();
            $table->integer('accumulated_seconds')->default(0); // Time spent before the current running segment
            
            $table->integer('version')->default(1); // Optimistic lock for start/pause/stop race conditions
            $table->timestamps();
            
            // Uniqueness constraint to prevent multiple timers for a user unless we scope it
            $table->unique(['user_id', 'status']); // PostgreSQL partial indexes are better, but this enforces 1 of each state max
        });

        // Immutable Timer Events (Auditing every click)
        Schema::create('timer_events', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('timer_id'); // No strict constraint because active_timers might be deleted on stop
            $table->string('event_type'); // start, pause, resume, stop, cancel, context_change
            $table->timestamp('occurred_at');
            $table->text('event_metadata')->nullable(); // JSON payload of what changed
            $table->string('device_context')->nullable();
            $table->timestamps();
            
            $table->index(['timer_id', 'occurred_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('timer_events');
        Schema::dropIfExists('active_timers');
        Schema::dropIfExists('time_entries');
        Schema::dropIfExists('time_categories');
    }
};
