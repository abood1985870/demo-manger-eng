<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('document_comments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('document_id')->constrained('documents')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->text('content');
            $table->uuid('parent_id')->nullable()->constrained('document_comments')->onDelete('cascade');
            $table->boolean('is_resolved')->default(false);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('tags', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name')->unique();
            $table->timestamps();
        });

        Schema::create('document_tags', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('document_id')->constrained('documents')->onDelete('cascade');
            $table->uuid('tag_id')->constrained('tags')->onDelete('cascade');
            $table->timestamps();
            
            $table->unique(['document_id', 'tag_id']);
        });

        Schema::create('document_favorites', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('document_id')->constrained('documents')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            
            $table->unique(['document_id', 'user_id']);
        });

        Schema::create('document_shares', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('document_id')->constrained('documents')->onDelete('cascade');
            $table->foreignId('shared_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('shared_with')->nullable()->constrained('users')->onDelete('cascade');
            $table->string('share_link')->nullable()->unique();
            $table->timestamp('expires_at')->nullable();
            $table->string('password')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_shares');
        Schema::dropIfExists('document_favorites');
        Schema::dropIfExists('document_tags');
        Schema::dropIfExists('tags');
        Schema::dropIfExists('document_comments');
    }
};
