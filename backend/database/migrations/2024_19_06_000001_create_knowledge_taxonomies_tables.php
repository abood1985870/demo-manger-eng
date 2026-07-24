<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Knowledge Taxonomies (e.g., Practice Area, Industry)
        Schema::create('knowledge_taxonomies', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            $table->uuid('parent_id')->nullable()->constrained('knowledge_taxonomies');
            
            $table->string('type'); // 'practice_area', 'industry', 'document_type'
            $table->string('name_en');
            $table->string('name_ar')->nullable();
            
            $table->string('status')->default('active'); // active, deprecated
            
            $table->timestamps();
        });

        // 2. Knowledge Tags (Controlled and User-proposed)
        Schema::create('knowledge_tags', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            
            $table->string('name');
            $table->boolean('is_controlled')->default(false);
            $table->string('status')->default('pending'); // pending, approved, deprecated
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('knowledge_tags');
        Schema::dropIfExists('knowledge_taxonomies');
    }
};
