<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_presence', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('status')->default('offline'); // online, offline, busy, away, invisible
            $table->timestamp('last_seen_at')->nullable();
            $table->timestamps();
            
            $table->unique('user_id');
        });

        // Typing indicators are highly ephemeral, usually handled via Redis or WebSockets, 
        // but we create a table representation for the architecture as requested (can act as fallback).
        Schema::create('typing_indicators', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->uuid('channel_id')->nullable()->constrained('channels')->onDelete('cascade');
            $table->uuid('conversation_id')->nullable()->constrained('conversations')->onDelete('cascade');
            $table->timestamp('started_typing_at')->useCurrent();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('typing_indicators');
        Schema::dropIfExists('user_presence');
    }
};
