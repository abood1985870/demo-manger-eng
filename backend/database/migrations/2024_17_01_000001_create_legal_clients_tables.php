<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Legal Clients (Extends Core Organization or Contact polymorphically)
        Schema::create('legal_clients', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            $table->string('client_number')->unique();
            
            $table->string('party_type'); // e.g. App\Models\Company or App\Models\User
            $table->uuid('party_id');
            
            $table->string('client_type'); // individual, local_company, foreign_company, government
            $table->string('status'); // prospect, intake, active, restricted, suspended, closed
            $table->string('confidentiality_level')->default('standard'); // standard, highly_confidential, ethical_wall
            
            $table->foreignId('responsible_lawyer_id')->nullable()->constrained('users');
            $table->foreignId('originating_lawyer_id')->nullable()->constrained('users');
            
            $table->timestamp('onboarded_at')->nullable();
            
            $table->timestamps();
            
            $table->index(['party_type', 'party_id']);
        });

        // 2. Party Aliases (Crucial for Arabic/English Conflict Search)
        Schema::create('party_aliases', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('party_type'); 
            $table->uuid('party_id');
            
            $table->string('alias_type'); // trade_name, former_name, short_name
            $table->string('display_name'); // e.g. "شركه التقنيه الحديثه"
            $table->string('normalized_name')->index(); // e.g. "شركه التقنيه الحديثه" -> "شركة التقنية الحديثة" (or reversed depending on strategy, but stripped of diacritics)
            
            $table->timestamps();
            
            $table->index(['party_type', 'party_id']);
        });

        // 3. Party Relationships (Corporate graphs for deep conflict checking)
        Schema::create('party_relationships', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            
            $table->string('source_party_type');
            $table->uuid('source_party_id');
            
            $table->string('target_party_type');
            $table->uuid('target_party_id');
            
            $table->string('relationship_type'); // parent, subsidiary, beneficial_owner, director
            $table->date('effective_date')->nullable();
            
            $table->timestamps();
            
            $table->index(['source_party_type', 'source_party_id']);
            $table->index(['target_party_type', 'target_party_id']);
        });
        
        // 4. Client Intake
        Schema::create('legal_intakes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            $table->string('intake_number')->unique();
            
            $table->string('prospective_client_name');
            $table->text('matter_summary');
            $table->string('jurisdiction')->nullable();
            
            $table->string('status'); // submitted, conflict_search, under_review, converted, rejected
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('legal_intakes');
        Schema::dropIfExists('party_relationships');
        Schema::dropIfExists('party_aliases');
        Schema::dropIfExists('legal_clients');
    }
};
