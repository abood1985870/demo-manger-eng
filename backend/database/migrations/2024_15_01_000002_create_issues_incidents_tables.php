<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Issues (Problems that have materialized)
        Schema::create('issues', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            $table->string('issue_number')->unique();
            
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('type'); // bug, defect, process_failure
            $table->string('severity'); // low, medium, high, critical
            
            $table->uuid('project_id')->nullable()->constrained('projects')->onDelete('set null');
            $table->uuid('related_risk_id')->nullable()->constrained('risks')->onDelete('set null');
            
            $table->string('status'); // open, in_progress, resolved, closed
            $table->text('resolution_notes')->nullable();
            
            $table->foreignId('owner_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('reporter_id')->nullable()->constrained('users')->onDelete('set null');
            
            $table->integer('version')->default(1);
            $table->timestamps();
            $table->softDeletes();
        });

        // Incidents (Immediate operational disruptions)
        Schema::create('incidents', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            $table->string('incident_number')->unique();
            
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('category'); // IT, Security, Safety, Operations
            $table->string('severity'); 
            
            $table->string('status'); // identified, containment, recovery, resolved, post_incident_review
            
            $table->uuid('related_risk_id')->nullable()->constrained('risks')->onDelete('set null');
            
            $table->timestamp('occurred_at')->nullable();
            $table->timestamp('resolved_at')->nullable();
            
            $table->foreignId('owner_id')->nullable()->constrained('users')->onDelete('set null');
            
            $table->integer('version')->default(1);
            $table->timestamps();
            $table->softDeletes();
        });

        // Shared Root Cause Analysis
        Schema::create('root_causes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('issue_id')->nullable()->constrained('issues')->onDelete('cascade');
            $table->uuid('incident_id')->nullable()->constrained('incidents')->onDelete('cascade');
            
            $table->string('methodology'); // 5_whys, fishbone
            $table->text('problem_statement');
            $table->text('analysis_data'); // JSON holding the 5 whys or Ishikawa branches
            
            $table->foreignId('analyst_id')->constrained('users');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('root_causes');
        Schema::dropIfExists('incidents');
        Schema::dropIfExists('issues');
    }
};
