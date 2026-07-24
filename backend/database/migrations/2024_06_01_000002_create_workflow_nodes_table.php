<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Even though DAG is stored as JSON for fast execution, we store steps queryably for indexing/reporting
        Schema::create('workflow_steps', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('workflow_version_id')->constrained('workflow_versions')->onDelete('cascade');
            $table->string('step_id'); // Unique ID within the DAG (e.g. node_1)
            $table->string('type'); // trigger, condition, action, approval, delay
            $table->string('name');
            $table->json('configuration')->nullable(); // Action payloads or Trigger configs
            $table->timestamps();
            
            $table->unique(['workflow_version_id', 'step_id']);
        });

        Schema::create('workflow_conditions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('step_id')->constrained('workflow_steps')->onDelete('cascade');
            $table->string('field');
            $table->string('operator'); // equal, contains, greater_than, etc.
            $table->string('value')->nullable();
            $table->string('next_step_true')->nullable(); // Node ID to jump to
            $table->string('next_step_false')->nullable();
            $table->timestamps();
        });

        Schema::create('workflow_actions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('step_id')->constrained('workflow_steps')->onDelete('cascade');
            $table->string('action_type'); // create_task, send_email, execute_api
            $table->json('payload'); // Templated payload
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workflow_actions');
        Schema::dropIfExists('workflow_conditions');
        Schema::dropIfExists('workflow_steps');
    }
};
