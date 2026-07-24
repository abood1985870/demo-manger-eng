<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Work Schedules & Shifts
        Schema::create('shifts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            $table->string('name');
            $table->time('start_time');
            $table->time('end_time');
            $table->integer('break_minutes')->default(0);
            $table->integer('grace_period_minutes')->default(0);
            $table->timestamps();
        });

        Schema::create('shift_assignments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('shift_id')->constrained('shifts')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->date('effective_from');
            $table->date('effective_until')->nullable();
            $table->timestamps();
            
            $table->index(['user_id', 'effective_from', 'effective_until']);
        });

        // Attendance Events (Immutable log)
        Schema::create('attendance_events', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('event_type'); // check_in, check_out, break_start, break_end, correction
            $table->timestamp('occurred_at');
            $table->string('source'); // web, mobile, kiosk, manual
            $table->text('location_data')->nullable(); // GPS/IP Data
            $table->foreignId('recorded_by')->nullable()->constrained('users')->onDelete('set null'); // In case of manual admin correction
            $table->timestamps();
        });

        // Attendance Records (Aggregated Daily view for fast queries)
        Schema::create('attendance_records', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->date('record_date');
            
            $table->timestamp('first_check_in')->nullable();
            $table->timestamp('last_check_out')->nullable();
            
            $table->integer('worked_minutes')->default(0);
            $table->integer('break_minutes')->default(0);
            $table->integer('late_arrival_minutes')->default(0);
            $table->integer('early_departure_minutes')->default(0);
            
            $table->boolean('is_absent')->default(false);
            $table->string('exception_status')->nullable(); // Missing punch, etc.
            
            $table->timestamps();
            
            $table->unique(['user_id', 'record_date']);
        });

        // Overtime Requests (Pre-authorization)
        Schema::create('overtime_requests', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            
            $table->date('request_date');
            $table->integer('requested_minutes');
            $table->integer('approved_minutes')->nullable();
            $table->text('reason');
            
            $table->string('status'); // pending, approved, rejected
            $table->foreignId('approver_id')->nullable()->constrained('users')->onDelete('set null');
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('overtime_requests');
        Schema::dropIfExists('attendance_records');
        Schema::dropIfExists('attendance_events');
        Schema::dropIfExists('shift_assignments');
        Schema::dropIfExists('shifts');
    }
};
