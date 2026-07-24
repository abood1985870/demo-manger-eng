<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Polymorphic linking table for tasks, projects, meetings, risks, etc.
        Schema::create('document_links', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('document_id')->constrained('documents')->onDelete('cascade');
            
            // linkable_id can be UUID (e.g. project_id, task_id) or foreignId depending on entity. Let's use string to support both safely in Postgres.
            $table->string('linkable_id');
            $table->string('linkable_type');
            
            $table->timestamps();
            
            $table->index(['linkable_id', 'linkable_type']);
            $table->unique(['document_id', 'linkable_id', 'linkable_type'], 'doc_link_unique');
        });

        // Audit Tables
        Schema::create('document_views', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('document_id')->constrained('documents')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->timestamp('viewed_at')->useCurrent();
            $table->timestamps();
        });

        Schema::create('document_downloads', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('document_id')->constrained('documents')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->uuid('version_id')->nullable()->constrained('document_versions')->onDelete('cascade'); // To track exactly which version was downloaded
            $table->timestamp('downloaded_at')->useCurrent();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_downloads');
        Schema::dropIfExists('document_views');
        Schema::dropIfExists('document_links');
    }
};
