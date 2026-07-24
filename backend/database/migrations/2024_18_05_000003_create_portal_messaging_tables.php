<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Conversations linked to Resources
        Schema::create('portal_conversations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            
            $table->string('title');
            
            $table->string('resource_type')->nullable(); // e.g. 'legal_matter', 'legal_contract'
            $table->uuid('resource_id')->nullable();
            
            $table->string('status')->default('open');
            
            $table->timestamps();
        });

        // 2. Participants mapping
        Schema::create('portal_conversation_participants', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('portal_conversation_id')->constrained('portal_conversations')->onDelete('cascade');
            
            $table->string('participant_type'); // 'internal_user' or 'portal_account'
            $table->uuid('participant_id');
            
            $table->timestamp('last_read_at')->nullable();
            
            $table->timestamps();
        });

        // 3. Messages (With Internal-Only flag)
        Schema::create('portal_messages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('portal_conversation_id')->constrained('portal_conversations')->onDelete('cascade');
            
            $table->string('sender_type'); // 'internal_user' or 'portal_account'
            $table->uuid('sender_id');
            
            $table->text('body');
            
            // CRITICAL: Internal comments must never leak externally.
            $table->boolean('is_internal_only')->default(false); 
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('portal_messages');
        Schema::dropIfExists('portal_conversation_participants');
        Schema::dropIfExists('portal_conversations');
    }
};
