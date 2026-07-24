<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            
            $table->string('subject');
            $table->text('body');
            
            $table->string('action_url')->nullable();
            
            // Source Context
            $table->string('related_type')->nullable(); // Project, Task
            $table->string('related_id')->nullable();
            
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('notification_deliveries', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('notification_id')->constrained('notifications')->onDelete('cascade');
            $table->string('channel'); // email, push, slack
            $table->string('status'); // queued, processing, delivered, failed
            $table->string('external_id')->nullable(); // e.g. Mailgun message ID
            $table->text('error_message')->nullable();
            
            $table->timestamp('delivered_at')->nullable();
            $table->timestamps();
        });

        Schema::create('notification_batches', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('status'); // pending, processing, sent
            $table->timestamp('scheduled_for');
            $table->timestamps();
        });

        Schema::create('notification_queue', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->uuid('batch_id')->nullable()->constrained('notification_batches')->onDelete('set null'); // Used for Digest mode
            
            $table->string('event_name');
            $table->json('payload');
            $table->string('status'); // queued, held_for_digest, failed
            $table->integer('attempts')->default(0);
            
            $table->timestamps();
        });

        Schema::create('notification_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('event_name');
            $table->string('status');
            $table->json('metadata')->nullable(); // Truncated payload or specific IDs to prevent bloat
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_logs');
        Schema::dropIfExists('notification_queue');
        Schema::dropIfExists('notification_batches');
        Schema::dropIfExists('notification_deliveries');
        Schema::dropIfExists('notifications');
    }
};
