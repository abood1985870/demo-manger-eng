<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Portal Organizations (External Client Companies)
        Schema::create('portal_organizations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            $table->uuid('organization_id'); // Links to Core shared Organization
            
            $table->string('status')->default('active'); // active, suspended
            $table->boolean('mfa_required')->default(false);
            
            $table->timestamps();
        });

        // 2. Portal Accounts (External Users)
        Schema::create('portal_accounts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            
            $table->uuid('contact_id'); // Links to Core shared Contact
            $table->uuid('portal_organization_id')->nullable()->constrained('portal_organizations');
            
            $table->string('email')->unique();
            $table->string('password_hash')->nullable();
            
            $table->string('status'); // invited, active, suspended, locked
            
            $table->timestamp('last_login_at')->nullable();
            $table->timestamps();
            
            // Note: In a real system, this table sits alongside the generic 'users' table, 
            // but is authenticated via a different auth guard (e.g. 'portal-web').
        });

        // 3. Portal Invitations (Secure onboarding)
        Schema::create('portal_invitations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            
            $table->string('email');
            $table->uuid('contact_id')->nullable(); // Target core contact
            $table->uuid('portal_organization_id')->nullable();
            
            $table->string('token_hash')->unique(); // Hashed token, never raw
            $table->timestamp('expires_at');
            
            $table->string('status'); // sent, accepted, expired, revoked
            $table->foreignId('inviter_id')->constrained('users'); // The internal lawyer who invited them
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('portal_invitations');
        Schema::dropIfExists('portal_accounts');
        Schema::dropIfExists('portal_organizations');
    }
};
