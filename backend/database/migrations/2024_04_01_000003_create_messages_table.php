<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('messages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            // Sender
            $table->foreignId('sender_id')->nullable()->constrained('users')->onDelete('set null');
            
            // Destination (Either Channel OR Conversation)
            $table->uuid('channel_id')->nullable()->constrained('channels')->onDelete('cascade');
            $table->uuid('conversation_id')->nullable()->constrained('conversations')->onDelete('cascade');
            
            // Threading (Self-referencing instead of message_threads table for massive scale)
            $table->uuid('parent_id')->nullable()->constrained('messages')->onDelete('cascade');
            $table->integer('reply_count')->default(0);
            
            // Content
            $table->string('message_type')->default('text'); // text, markdown, file, image, video, audio, link, system
            $table->longText('content')->nullable();
            
            // Status
            $table->boolean('is_edited')->default(false);
            $table->boolean('is_system_message')->default(false);
            
            $table->timestamps();
            $table->softDeletes();
            
            // Composite Indexes for rapid chronological retrieval (Critical for 100k+ users)
            $table->index(['channel_id', 'created_at']);
            $table->index(['conversation_id', 'created_at']);
            $table->index(['parent_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};
