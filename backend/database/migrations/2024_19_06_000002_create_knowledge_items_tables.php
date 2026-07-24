<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Knowledge Items (Precedents, Memos, Models)
        Schema::create('knowledge_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            
            $table->string('knowledge_number')->unique(); // Concurrency safe generation
            
            $table->string('title_en');
            $table->string('title_ar')->nullable();
            $table->text('summary')->nullable();
            
            $table->string('knowledge_type'); // 'precedent', 'model_contract', 'memo', 'debrief'
            
            // Reuse Core Documents (Exact version linkage)
            $table->uuid('document_version_id')->nullable();
            
            $table->string('status'); // draft, under_review, published, superseded, archived
            $table->string('confidentiality_level')->default('standard'); 
            
            $table->date('effective_date')->nullable();
            $table->date('expiration_date')->nullable();
            
            $table->uuid('author_id')->constrained('users');
            $table->uuid('reviewer_id')->nullable()->constrained('users');
            
            $table->uuid('superseded_by')->nullable()->constrained('knowledge_items');
            
            $table->timestamps();
        });

        // 2. Matter Links (Dynamic Ethical Wall Enforcement)
        Schema::create('knowledge_item_matter_links', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('knowledge_item_id')->constrained('knowledge_items')->onDelete('cascade');
            
            $table->uuid('legal_matter_id'); // Links to Core Matter
            
            // Defines if this item relies on the matter's ethical wall to be readable
            $table->boolean('enforces_ethical_wall')->default(true); 
            
            $table->timestamps();
        });
        
        // 3. Item Tags Pivot
        Schema::create('knowledge_item_tags', function (Blueprint $table) {
            $table->uuid('knowledge_item_id')->constrained('knowledge_items')->onDelete('cascade');
            $table->uuid('knowledge_tag_id')->constrained('knowledge_tags')->onDelete('cascade');
            $table->primary(['knowledge_item_id', 'knowledge_tag_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('knowledge_item_tags');
        Schema::dropIfExists('knowledge_item_matter_links');
        Schema::dropIfExists('knowledge_items');
    }
};
