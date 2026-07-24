<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Screening Requests (Outbound provider trace)
        Schema::create('legal_screening_requests', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('compliance_case_id')->constrained('legal_compliance_cases')->onDelete('cascade');
            
            $table->uuid('subject_party_id');
            $table->string('provider'); // 'dow_jones', 'refinitiv', 'manual_foundation'
            
            $table->string('screening_types'); // json array: ['sanctions', 'pep', 'adverse_media']
            
            $table->string('status'); // submitted, processing, completed, failed
            $table->string('idempotency_key')->unique();
            
            $table->timestamps();
        });

        // 2. Screening Matches (Hits returned by provider)
        Schema::create('legal_screening_matches', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('screening_request_id')->constrained('legal_screening_requests')->onDelete('cascade');
            
            $table->string('provider_match_reference')->nullable();
            
            $table->string('match_type'); // sanctions, pep, watchlist
            $table->string('matched_name');
            $table->decimal('match_score', 5, 2)->nullable();
            
            $table->string('status'); // pending_review, resolved
            
            $table->timestamps();
        });

        // 3. Match Reviews (Manual resolution)
        Schema::create('legal_screening_match_reviews', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('screening_match_id')->constrained('legal_screening_matches')->onDelete('cascade');
            
            $table->uuid('reviewer_id')->constrained('users');
            
            $table->string('decision'); // false_positive, confirmed_match, escalated
            $table->text('reason');
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('legal_screening_match_reviews');
        Schema::dropIfExists('legal_screening_matches');
        Schema::dropIfExists('legal_screening_requests');
    }
};
