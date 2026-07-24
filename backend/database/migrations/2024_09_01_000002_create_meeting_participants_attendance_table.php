<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('meeting_participants', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('meeting_id')->constrained('meetings')->onDelete('cascade');
            
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            
            $table->string('role'); // Required Attendee, Optional, Presenter, Observer, Guest
            $table->string('rsvp_status')->default('Pending'); // Accepted, Declined, Tentative
            
            $table->boolean('can_vote')->default(false);
            
            $table->timestamp('invitation_sent_at')->nullable();
            $table->timestamp('responded_at')->nullable();
            
            $table->timestamps();
            
            $table->unique(['meeting_id', 'user_id']);
        });

        Schema::create('meeting_attendance', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('participant_id')->constrained('meeting_participants')->onDelete('cascade');
            
            $table->timestamp('joined_at')->nullable();
            $table->timestamp('left_at')->nullable();
            
            $table->string('attendance_status'); // Present, Absent, Excused, Late
            $table->text('notes')->nullable(); // e.g. Absence reason
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('meeting_attendance');
        Schema::dropIfExists('meeting_participants');
    }
};
