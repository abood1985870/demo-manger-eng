<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Expertise Profiles (Lawyer Biographies)
        Schema::create('expertise_profiles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            $table->uuid('user_id')->constrained('users');
            
            $table->text('internal_biography')->nullable();
            $table->string('experience_level')->nullable();
            
            $table->string('status')->default('active');
            
            $table->timestamps();
        });

        // 2. Matter Experience (Sanitized Proof of Work)
        Schema::create('matter_experience', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('expertise_profile_id')->constrained('expertise_profiles')->onDelete('cascade');
            
            $table->uuid('legal_matter_id'); // Link to source
            
            $table->string('role'); // e.g. Lead Counsel
            $table->text('sanitized_description'); // Strictly vetted description, no client names
            
            $table->string('status'); // pending_review, approved, published
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('matter_experience');
        Schema::dropIfExists('expertise_profiles');
    }
};
