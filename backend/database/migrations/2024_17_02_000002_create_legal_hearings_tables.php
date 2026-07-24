<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Legal Hearings (Standalone optimized tracking synced to Calendar Events)
        Schema::create('legal_hearings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            $table->uuid('legal_case_id')->constrained('legal_cases')->onDelete('cascade');
            
            $table->string('hearing_number')->unique();
            $table->string('title_en');
            $table->string('title_ar')->nullable();
            
            $table->string('hearing_type'); // preliminary, pleading, evidence, judgment
            
            $table->timestamp('scheduled_at');
            $table->string('time_zone')->default('Asia/Riyadh');
            
            $table->string('location')->nullable();
            $table->string('remote_link')->nullable();
            
            $table->string('status'); // scheduled, rescheduled, postponed, completed, cancelled
            $table->string('outcome')->nullable(); // adjourned, judgment_reserved
            
            $table->uuid('next_hearing_id')->nullable(); // self-referencing to chain hearings
            
            $table->integer('version')->default(1);
            $table->timestamps();
        });

        // 2. Legal Pleadings (Links to Documents)
        Schema::create('legal_pleadings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            $table->uuid('legal_case_id')->constrained('legal_cases')->onDelete('cascade');
            
            $table->string('pleading_type'); // statement_of_claim, defense_memo, appeal_memo
            $table->string('title_en');
            $table->string('title_ar')->nullable();
            
            $table->string('filing_party_type')->nullable(); // polymorphic party link
            $table->uuid('filing_party_id')->nullable();
            
            $table->timestamp('filed_at')->nullable();
            $table->string('status'); // draft, under_review, approved, filed, rejected
            
            $table->uuid('document_id')->nullable()->constrained('documents'); // core document integration
            
            $table->integer('version')->default(1);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('legal_pleadings');
        Schema::dropIfExists('legal_hearings');
    }
};
