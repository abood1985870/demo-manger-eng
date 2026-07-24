<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Rich dependency table (extends the basic task_dependencies concept)
        Schema::create('schedule_item_dependencies', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->uuid('predecessor_id')->constrained('schedule_items')->onDelete('cascade');
            $table->uuid('successor_id')->constrained('schedule_items')->onDelete('cascade');

            // Dependency type: FS, SS, FF, SF
            $table->string('dependency_type')->default('FS'); // FS, SS, FF, SF

            // Lag (positive) / Lead (negative)
            $table->decimal('lag_value', 8, 2)->default(0);
            $table->string('lag_unit')->default('days'); // minutes, hours, working_days, calendar_days, weeks

            $table->boolean('is_hard')->default(true); // hard = must respect; soft = advisory
            $table->boolean('is_cross_project')->default(false);

            $table->string('status')->default('Active'); // Active, Suspended
            $table->text('reason')->nullable();

            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();

            // Prevent self-dependency and duplicates
            $table->unique(['predecessor_id', 'successor_id', 'dependency_type']);
            $table->check('predecessor_id != successor_id'); // self-dependency guard
            $table->index(['successor_id']); // needed for forward pass lookups
        });

        // Scheduling constraints per item
        Schema::create('schedule_constraints', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('schedule_item_id')->constrained('schedule_items')->onDelete('cascade');

            $table->string('constraint_type'); // ASAP, ALAP, SNET, SNLT, FNET, FNLT, MSO, MFO
            $table->date('constraint_date')->nullable();

            $table->text('reason')->nullable();
            $table->foreignId('authorized_by')->nullable()->constrained('users')->onDelete('set null');
            $table->boolean('requires_override_permission')->default(false);

            // Track conflicts detected by the engine
            $table->boolean('has_conflict')->default(false);
            $table->text('conflict_description')->nullable();

            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('schedule_constraints');
        Schema::dropIfExists('schedule_item_dependencies');
    }
};
