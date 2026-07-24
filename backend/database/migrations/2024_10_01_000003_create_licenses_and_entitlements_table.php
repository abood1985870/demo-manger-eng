<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('licenses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('license_number')->unique();
            
            $table->uuid('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->uuid('edition_id')->constrained('product_editions')->onDelete('restrict');
            $table->uuid('plan_id')->constrained('subscription_plans')->onDelete('restrict');
            
            $table->string('status'); // Trial, Active, Grace Period, Suspended, Expired, Revoked
            $table->string('deployment_type'); // saas, private-cloud, on-premises
            
            $table->timestamp('valid_from')->nullable();
            $table->timestamp('valid_until')->nullable();
            $table->timestamp('grace_period_end')->nullable();
            
            $table->timestamp('activated_at')->nullable();
            $table->foreignId('activated_by')->nullable()->constrained('users')->onDelete('set null');
            
            $table->text('revocation_reason')->nullable();
            
            // Contains the offline cryptographically signed payload for On-Premises verifications
            $table->longText('offline_signature_payload')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['tenant_id', 'status']);
        });

        Schema::create('tenant_entitlements', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->uuid('module_id')->constrained('modules')->onDelete('cascade');
            
            $table->uuid('license_id')->nullable()->constrained('licenses')->onDelete('cascade');
            
            $table->string('source'); // Edition, Plan, AddOn, ManualGrant
            $table->string('status')->default('Active'); // Active, Suspended, Revoked
            
            $table->timestamp('effective_from')->nullable();
            $table->timestamp('effective_until')->nullable();
            
            $table->text('revocation_reason')->nullable();
            
            $table->timestamps();
            
            $table->index(['tenant_id', 'module_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenant_entitlements');
        Schema::dropIfExists('licenses');
    }
};
