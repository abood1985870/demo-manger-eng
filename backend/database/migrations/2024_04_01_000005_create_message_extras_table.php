<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('message_pins', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('message_id')->constrained('messages')->onDelete('cascade');
            $table->foreignId('pinned_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            
            $table->unique(['message_id']); // A message is pinned once per channel
        });

        Schema::create('message_bookmarks', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('message_id')->constrained('messages')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            
            $table->unique(['message_id', 'user_id']);
        });

        Schema::create('message_attachments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('message_id')->constrained('messages')->onDelete('cascade');
            $table->string('file_name');
            $table->string('file_path');
            $table->string('mime_type')->nullable();
            $table->integer('file_size')->default(0);
            $table->timestamps();
        });

        Schema::create('message_drafts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->uuid('channel_id')->nullable()->constrained('channels')->onDelete('cascade');
            $table->uuid('conversation_id')->nullable()->constrained('conversations')->onDelete('cascade');
            $table->longText('content');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('message_drafts');
        Schema::dropIfExists('message_attachments');
        Schema::dropIfExists('message_bookmarks');
        Schema::dropIfExists('message_pins');
    }
};
