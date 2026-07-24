<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Change Requests
        Schema::create('change_requests', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            $table->string('change_number')->unique();
            
            $table->string('title');
            $table->text('description');
            
            $table->string('type'); // scope, schedule, system, emergency
            $table->string('priority');
            $table->string('status'); // draft, under_review, pending_approval, approved, implemented, closed
            
            $table->text('business_justification');
            
            $table->uuid('project_id')->nullable()->constrained('projects')->onDelete('set null');
            $table->foreignId('requester_id')->constrained('users');
            
            // CCB Integration (reuses Meetings for the actual board session)
            $table->uuid('ccb_meeting_id')->nullable()->constrained('meetings')->onDelete('set null');
            
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('implemented_at')->nullable();
            $table->integer('version')->default(1);
            $table->timestamps();
        });

        // Change Impacts
        Schema::create('change_impacts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('change_request_id')->constrained('change_requests')->onDelete('cascade');
            
            $table->string('domain'); // schedule, budget, security, operations
            $table->string('severity');
            $table->text('description');
            $table->text('mitigation_plan')->nullable();
            
            $table->foreignId('assessor_id')->constrained('users');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('change_impacts');
        Schema::dropIfExists('change_requests');
    }
};
