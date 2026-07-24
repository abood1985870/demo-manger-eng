<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('document_locks', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('document_id')->constrained('documents')->onDelete('cascade');
            $table->foreignId('locked_by')->constrained('users')->onDelete('cascade');
            $table->timestamp('locked_at')->useCurrent();
            $table->string('reason')->nullable();
            $table->timestamps();
            
            $table->unique('document_id'); // A document can only be locked once
        });

        Schema::create('document_permissions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('document_id')->constrained('documents')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            // Permissions: view, download, upload, replace, delete, share, lock, unlock, version_restore, comment
            $table->json('permissions'); 
            $table->timestamps();
            
            $table->unique(['document_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_permissions');
        Schema::dropIfExists('document_locks');
    }
};
