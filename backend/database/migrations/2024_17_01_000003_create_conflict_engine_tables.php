<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Conflict Search Requests
        Schema::create('conflict_searches', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            $table->string('request_number')->unique();
            
            $table->foreignId('requester_id')->constrained('users');
            $table->uuid('legal_intake_id')->nullable()->constrained('legal_intakes'); // Optional link to intake
            
            $table->string('search_reason'); // new_matter, new_party
            $table->json('search_parameters'); // Storing exactly what terms/aliases were searched
            
            $table->string('status'); // searching, results_ready, cleared, conflict_confirmed
            $table->timestamps();
        });

        // 2. Conflict Search Matches
        Schema::create('conflict_matches', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('conflict_search_id')->constrained('conflict_searches')->onDelete('cascade');
            
            $table->string('match_type'); // exact, fuzzy, alias, relationship
            $table->decimal('match_score', 5, 2);
            
            $table->string('matched_party_type');
            $table->uuid('matched_party_id');
            
            $table->uuid('related_matter_id')->nullable()->constrained('legal_matters');
            
            $table->string('classification')->default('manual_review_required'); // potential_conflict, false_positive
            
            $table->timestamps();
        });

        // 3. Conflict Decisions (Immutable Resolution)
        Schema::create('conflict_decisions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('conflict_search_id')->constrained('conflict_searches')->onDelete('cascade');
            
            $table->foreignId('reviewer_id')->constrained('users');
            $table->string('decision'); // cleared, cleared_with_conditions, ethical_wall_required, waiver_required, rejected
            $table->text('reason');
            
            $table->integer('version')->default(1);
            $table->timestamps();
        });

        // 4. Conflict Waivers
        Schema::create('conflict_waivers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('conflict_decision_id')->constrained('conflict_decisions')->onDelete('cascade');
            
            $table->uuid('document_id')->nullable()->constrained('documents'); // Core document linkage for signed PDF
            $table->string('status'); // draft, requested, signed, approved, expired
            
            $table->timestamp('expiration_date')->nullable();
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('conflict_waivers');
        Schema::dropIfExists('conflict_decisions');
        Schema::dropIfExists('conflict_matches');
        Schema::dropIfExists('conflict_searches');
    }
};
