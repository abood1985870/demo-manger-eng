<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Timesheet Periods
        Schema::create('timesheet_periods', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            $table->date('start_date');
            $table->date('end_date');
            $table->string('type'); // weekly, biweekly, monthly
            $table->string('status'); // open, closed, locked
            $table->timestamp('submission_deadline')->nullable();
            $table->timestamp('approval_deadline')->nullable();
            $table->timestamp('locked_at')->nullable();
            $table->timestamps();
        });

        // Timesheets (The header record for a user's period)
        Schema::create('timesheets', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->uuid('period_id')->constrained('timesheet_periods')->onDelete('cascade');
            
            $table->string('status'); // draft, submitted, under_review, approved, rejected, corrected
            
            $table->integer('total_minutes')->default(0);
            $table->integer('billable_minutes')->default(0);
            $table->integer('overtime_minutes')->default(0);
            $table->integer('leave_minutes')->default(0);
            
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->uuid('workflow_instance_id')->nullable(); // Integration with Step 8 Workflow engine
            
            $table->integer('version')->default(1);
            $table->timestamps();
            
            $table->unique(['user_id', 'period_id']);
        });

        // Timesheet Submissions (Immutable Snapshots)
        Schema::create('timesheet_submissions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('timesheet_id')->constrained('timesheets')->onDelete('cascade');
            $table->json('snapshot_data'); // Stores the exact state of all time_entries at submission moment
            $table->text('submission_notes')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });

        // Mapping entries to a timesheet
        Schema::create('timesheet_entries', function (Blueprint $table) {
            $table->uuid('timesheet_id')->constrained('timesheets')->onDelete('cascade');
            $table->uuid('time_entry_id')->constrained('time_entries')->onDelete('cascade');
            $table->primary(['timesheet_id', 'time_entry_id']);
        });

        // Time Adjustments (Corrections to already approved/invoiced time)
        Schema::create('time_adjustments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('original_entry_id')->constrained('time_entries')->onDelete('cascade');
            $table->uuid('new_entry_id')->nullable()->constrained('time_entries')->onDelete('cascade');
            
            $table->string('adjustment_type'); // time_correction, rate_correction, write_off
            $table->text('reason');
            $table->foreignId('adjusted_by')->constrained('users')->onDelete('cascade');
            $table->timestamp('approved_at')->nullable(); // Might require workflow
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('time_adjustments');
        Schema::dropIfExists('timesheet_entries');
        Schema::dropIfExists('timesheet_submissions');
        Schema::dropIfExists('timesheets');
        Schema::dropIfExists('timesheet_periods');
    }
};
