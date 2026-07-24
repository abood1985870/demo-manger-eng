<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Document Deliveries (Exact Version Sharing)
        // Sharing a document with a client locks them to the EXACT version ID,
        // so internal drafts/updates don't automatically leak to the portal.
        Schema::create('portal_document_deliveries', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('portal_account_id')->constrained('portal_accounts')->onDelete('cascade');
            
            $table->string('resource_type'); // 'legal_matter', 'legal_contract'
            $table->uuid('resource_id');
            
            $table->uuid('document_version_id'); // Links to exact Core Document Version Snapshot
            
            $table->string('purpose'); // 'review', 'signature', 'reference'
            
            $table->boolean('acknowledged')->default(false);
            $table->timestamp('acknowledged_at')->nullable();
            
            $table->timestamps();
        });

        // 2. Document Requests (Asking Client for Docs)
        Schema::create('portal_document_requests', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('portal_account_id')->constrained('portal_accounts')->onDelete('cascade');
            
            $table->string('resource_type'); 
            $table->uuid('resource_id');
            
            $table->string('required_document_type'); // e.g. 'passport', 'financial_statement'
            $table->text('instructions')->nullable();
            
            $table->date('due_date')->nullable();
            $table->string('status'); // 'pending', 'submitted', 'accepted', 'rejected'
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('portal_document_requests');
        Schema::dropIfExists('portal_document_deliveries');
    }
};
