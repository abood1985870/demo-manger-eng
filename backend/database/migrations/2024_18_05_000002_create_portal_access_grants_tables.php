<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Portal Roles (e.g. Admin, Reviewer, Read-Only)
        Schema::create('portal_roles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            
            $table->string('name');
            $table->json('permissions'); // Granular external permissions
            
            $table->timestamps();
        });

        // 2. Portal Access Grants (Explicit Sharing Engine - Deny By Default)
        Schema::create('portal_access_grants', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('portal_account_id')->constrained('portal_accounts')->onDelete('cascade');
            
            $table->string('resource_type'); // e.g. 'legal_matter', 'legal_contract', 'legal_invoice'
            $table->uuid('resource_id');
            
            $table->uuid('portal_role_id')->nullable()->constrained('portal_roles');
            
            // Precise control over what can be done with this specific resource
            $table->boolean('can_view')->default(true);
            $table->boolean('can_upload')->default(false);
            $table->boolean('can_download')->default(false);
            $table->boolean('can_comment')->default(false);
            
            $table->timestamp('expires_at')->nullable();
            
            $table->foreignId('granted_by')->constrained('users'); // Internal user who explicitly shared this
            
            $table->timestamps();
            
            $table->unique(['portal_account_id', 'resource_type', 'resource_id'], 'portal_grant_unique_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('portal_access_grants');
        Schema::dropIfExists('portal_roles');
    }
};
