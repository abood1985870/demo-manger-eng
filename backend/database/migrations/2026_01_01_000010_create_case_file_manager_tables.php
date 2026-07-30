<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('case_file_folders', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            $table->uuid('case_id')->index();
            $table->uuid('parent_folder_id')->nullable()->index();
            $table->string('name');
            $table->uuid('created_by_id')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->unique(['case_id', 'parent_folder_id', 'name']);
        });

        Schema::create('case_files', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            $table->uuid('case_id')->index();
            $table->uuid('folder_id')->nullable()->index();
            $table->string('original_name');
            $table->string('display_name');
            $table->string('storage_key');
            $table->string('mime_type');
            $table->string('extension')->nullable();
            $table->unsignedBigInteger('size')->default(0);
            $table->uuid('uploaded_by_id')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->unique(['case_id', 'folder_id', 'display_name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('case_files');
        Schema::dropIfExists('case_file_folders');
    }
};
