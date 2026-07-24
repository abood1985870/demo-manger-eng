<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Agile Workspaces (Optional container above projects for scaled agile)
        Schema::create('agile_workspaces', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            $table->string('name');
            $table->text('description')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            $table->softDeletes();
        });

        // Estimation Schemes
        Schema::create('agile_estimation_schemes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            $table->string('name'); // e.g., Fibonacci, T-Shirt, Ideal Hours
            $table->string('type'); // story_points, hours, categorical
            $table->json('values'); // array of allowed values
            $table->boolean('is_default')->default(false);
            $table->timestamps();
        });

        // Boards
        Schema::create('agile_boards', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            $table->uuid('workspace_id')->nullable()->constrained('agile_workspaces')->onDelete('cascade');
            $table->string('name');
            $table->string('type'); // scrum, kanban, scrumban
            $table->uuid('estimation_scheme_id')->nullable()->constrained('agile_estimation_schemes');
            $table->json('quick_filters')->nullable();
            $table->json('card_fields')->nullable();
            $table->integer('version')->default(1); // Optimistic locking
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            $table->softDeletes();
        });

        // Board Columns
        Schema::create('agile_board_columns', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('board_id')->constrained('agile_boards')->onDelete('cascade');
            $table->string('name_en');
            $table->string('name_ar')->nullable();
            $table->integer('sequence');
            $table->string('category'); // backlog, todo, in_progress, done
            $table->integer('wip_limit')->nullable();
            $table->integer('min_wip_limit')->nullable();
            $table->boolean('is_done')->default(false);
            $table->boolean('is_commitment_point')->default(false);
            $table->boolean('is_delivery_point')->default(false);
            $table->timestamps();

            $table->unique(['board_id', 'sequence']);
        });

        // Status Mappings (Maps existing task_statuses to Board Columns)
        Schema::create('agile_board_status_mappings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('board_id')->constrained('agile_boards')->onDelete('cascade');
            $table->uuid('column_id')->constrained('agile_board_columns')->onDelete('cascade');
            $table->uuid('status_id')->constrained('project_statuses')->onDelete('cascade'); // Assuming existing status table
            $table->timestamps();

            $table->unique(['board_id', 'status_id']);
        });

        // Swimlanes
        Schema::create('agile_board_swimlanes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('board_id')->constrained('agile_boards')->onDelete('cascade');
            $table->string('name');
            $table->string('type'); // epic, assignee, jql, priority, expedite
            $table->json('config')->nullable(); // Query rules or IDs
            $table->integer('sequence');
            $table->timestamps();
        });

        // Service Classes (For Kanban)
        Schema::create('agile_service_classes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            $table->string('name'); // Standard, Expedite, Fixed Date, Intangible
            $table->string('color')->nullable();
            $table->integer('wip_limit')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agile_service_classes');
        Schema::dropIfExists('agile_board_swimlanes');
        Schema::dropIfExists('agile_board_status_mappings');
        Schema::dropIfExists('agile_board_columns');
        Schema::dropIfExists('agile_boards');
        Schema::dropIfExists('agile_estimation_schemes');
        Schema::dropIfExists('agile_workspaces');
    }
};
