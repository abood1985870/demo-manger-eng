<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('workflow_variables', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('workflow_id')->constrained('workflows')->onDelete('cascade');
            $table->string('name'); // e.g. CurrentUser, ProjectManager
            $table->string('type'); // string, number, json, array
            $table->text('default_value')->nullable();
            $table->timestamps();
            
            $table->unique(['workflow_id', 'name']);
        });

        Schema::create('workflow_runs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('workflow_version_id')->constrained('workflow_versions')->onDelete('cascade');
            $table->string('status'); // running, paused, completed, failed, cancelled
            $table->string('trigger_type'); // api, manual, schedule, event
            $table->json('initial_payload')->nullable(); // Data passed into the start node
            $table->json('state')->nullable(); // Live snapshot of variables and current step
            $table->timestamp('started_at')->useCurrent();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });

        Schema::create('workflow_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('workflow_run_id')->constrained('workflow_runs')->onDelete('cascade');
            $table->string('step_id'); // Reference to node_id in the DAG
            $table->string('status'); // success, error, pending
            $table->text('message')->nullable();
            $table->json('input_data')->nullable();
            $table->json('output_data')->nullable();
            $table->timestamp('executed_at')->useCurrent();
            $table->timestamps();
        });

        Schema::create('workflow_schedules', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('workflow_id')->constrained('workflows')->onDelete('cascade');
            $table->string('cron_expression');
            $table->string('timezone')->default('UTC');
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_run_at')->nullable();
            $table->timestamp('next_run_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workflow_schedules');
        Schema::dropIfExists('workflow_logs');
        Schema::dropIfExists('workflow_runs');
        Schema::dropIfExists('workflow_variables');
    }
};
