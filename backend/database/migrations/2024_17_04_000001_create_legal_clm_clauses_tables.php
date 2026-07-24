<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Clause Libraries
        Schema::create('legal_clause_libraries', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            $table->string('name_en');
            $table->string('name_ar')->nullable();
            $table->timestamps();
        });

        // 2. Clauses (Base Entity)
        Schema::create('legal_clauses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            $table->uuid('legal_clause_library_id')->constrained('legal_clause_libraries');
            
            $table->string('clause_number')->unique();
            $table->string('title_en');
            $table->string('title_ar')->nullable();
            $table->string('clause_type'); // e.g. Liability, Termination
            
            $table->string('risk_level')->default('low'); // low, medium, high, critical
            $table->string('status'); // draft, active, archived
            
            $table->timestamps();
        });

        // 3. Clause Versions (Immutable Text)
        Schema::create('legal_clause_versions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('legal_clause_id')->constrained('legal_clauses')->onDelete('cascade');
            
            $table->integer('version_number');
            $table->text('text_en');
            $table->text('text_ar')->nullable();
            
            $table->boolean('is_active')->default(true);
            $table->foreignId('author_id')->constrained('users');
            
            $table->timestamps();
            
            $table->unique(['legal_clause_id', 'version_number']);
        });

        // 4. Contract Templates
        Schema::create('legal_contract_templates', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            
            $table->string('template_number')->unique();
            $table->string('name_en');
            $table->string('name_ar')->nullable();
            $table->string('contract_type');
            
            $table->string('status'); // draft, active, superseded
            $table->integer('version')->default(1);
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('legal_contract_templates');
        Schema::dropIfExists('legal_clause_versions');
        Schema::dropIfExists('legal_clauses');
        Schema::dropIfExists('legal_clause_libraries');
    }
};
