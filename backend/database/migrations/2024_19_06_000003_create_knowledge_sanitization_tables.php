<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Sanitization Records
        // Tracks the removal of client names/identifiable data before publication.
        Schema::create('knowledge_sanitization_records', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('knowledge_item_id')->constrained('knowledge_items')->onDelete('cascade');
            
            $table->uuid('source_document_version_id'); // Original unredacted document
            $table->uuid('sanitized_document_version_id')->nullable(); // Clean document
            
            $table->json('redacted_fields')->nullable(); // Which types of data were removed
            
            $table->string('status'); // pending, in_progress, completed, rejected
            
            $table->uuid('reviewer_id')->nullable()->constrained('users');
            $table->timestamp('approved_at')->nullable();
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('knowledge_sanitization_records');
    }
};
