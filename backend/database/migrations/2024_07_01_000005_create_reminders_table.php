<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reminders', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            
            $table->string('title');
            $table->string('remindable_type')->nullable(); // Task, Document (Expiration)
            $table->string('remindable_id')->nullable();
            
            $table->timestamp('remind_at');
            $table->boolean('is_recurring')->default(false);
            $table->string('cron_expression')->nullable(); // If recurring
            
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('reminder_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('reminder_id')->constrained('reminders')->onDelete('cascade');
            $table->timestamp('triggered_at');
            $table->string('status'); // success, failed
            $table->text('error')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reminder_logs');
        Schema::dropIfExists('reminders');
    }
};
