<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('workflow_templates', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->text('description')->nullable();
            $table->json('dag_definition'); // The blueprint of the graph
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('workflows', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->text('description')->nullable();
            $table->uuid('template_id')->nullable()->constrained('workflow_templates')->onDelete('set null');
            
            // Scope linking (e.g. Workflow attached to a specific Project or Department)
            $table->string('context_type')->nullable(); // e.g. App\Models\Project
            $table->string('context_id')->nullable();
            
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['context_type', 'context_id']);
        });

        Schema::create('workflow_versions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('workflow_id')->constrained('workflows')->onDelete('cascade');
            $table->integer('version_number');
            $table->json('dag_definition'); // The serialized Directed Acyclic Graph
            $table->boolean('is_published')->default(false); // Only one published version per workflow
            $table->foreignId('published_by')->nullable()->constrained('users')->onDelete('set null');
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->unique(['workflow_id', 'version_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workflow_versions');
        Schema::dropIfExists('workflows');
        Schema::dropIfExists('workflow_templates');
    }
};
