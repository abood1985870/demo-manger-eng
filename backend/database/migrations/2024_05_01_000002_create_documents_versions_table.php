<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('documents', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('folder_id')->nullable()->constrained('document_folders')->onDelete('cascade');
            $table->uuid('category_id')->nullable()->constrained('document_categories')->onDelete('set null');
            
            $table->string('file_name');
            $table->string('original_name');
            $table->string('extension');
            $table->string('mime_type');
            $table->bigInteger('file_size');
            
            // Duplicate detection
            $table->string('checksum')->index(); 
            
            $table->integer('current_version')->default(1);
            $table->string('status')->default('active'); // active, archived, deleted
            
            $table->foreignId('uploaded_by')->constrained('users')->onDelete('cascade');
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['folder_id', 'file_name']);
        });

        Schema::create('document_versions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('document_id')->constrained('documents')->onDelete('cascade');
            
            $table->integer('version_number');
            $table->string('file_path');
            $table->string('file_name');
            $table->bigInteger('file_size');
            $table->string('checksum');
            $table->string('changelog')->nullable();
            
            $table->foreignId('uploaded_by')->constrained('users')->onDelete('cascade');
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->unique(['document_id', 'version_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_versions');
        Schema::dropIfExists('documents');
    }
};
