<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Practice Areas
        Schema::create('practice_areas', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            $table->string('name_en');
            $table->string('name_ar')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 2. Legal Matters (Extends Core Project)
        Schema::create('legal_matters', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            $table->string('matter_number')->unique();
            
            $table->uuid('project_id')->constrained('projects')->onDelete('cascade');
            $table->uuid('legal_client_id')->constrained('legal_clients');
            
            $table->uuid('practice_area_id')->nullable()->constrained('practice_areas');
            $table->string('matter_type'); // litigation, advisory, corporate
            
            $table->string('jurisdiction')->nullable();
            $table->string('status'); // intake, open, active, suspended, closed
            
            $table->string('confidentiality_level')->default('standard'); // standard, highly_confidential, ethical_wall
            
            $table->foreignId('responsible_lawyer_id')->nullable()->constrained('users');
            
            $table->timestamp('opened_at')->nullable();
            $table->timestamp('closed_at')->nullable();
            
            $table->timestamps();
        });

        // 3. Matter Parties (Links Core Parties to a Matter with a role, e.g. Opposing Counsel)
        Schema::create('matter_parties', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('legal_matter_id')->constrained('legal_matters')->onDelete('cascade');
            
            $table->string('party_type'); 
            $table->uuid('party_id');
            
            $table->string('role'); // opposing_party, co_defendant, expert_witness, judge
            
            $table->timestamps();
            
            $table->index(['party_type', 'party_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('matter_parties');
        Schema::dropIfExists('legal_matters');
        Schema::dropIfExists('practice_areas');
    }
};
