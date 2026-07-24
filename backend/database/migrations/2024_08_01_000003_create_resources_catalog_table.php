<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('resource_groups', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('type'); // human, room, equipment, vehicle
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // The Central Resource Registry (Polymorphic)
        Schema::create('resources', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('group_id')->nullable()->constrained('resource_groups')->onDelete('set null');
            
            $table->string('name');
            $table->string('resourceable_type'); // User, MeetingRoom, Equipment
            $table->string('resourceable_id');
            
            $table->integer('capacity')->default(1);
            $table->decimal('cost_rate', 10, 2)->default(0);
            $table->string('status')->default('active'); // active, maintenance, retired
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->unique(['resourceable_type', 'resourceable_id']);
        });

        Schema::create('meeting_rooms', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->integer('capacity');
            $table->string('floor')->nullable();
            $table->string('building')->nullable();
            $table->json('equipment_included')->nullable(); // e.g. ["Projector", "Whiteboard"]
            $table->timestamps();
        });

        Schema::create('equipment', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('type'); // laptop, camera, projector, vehicle
            $table->string('serial_number')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('equipment');
        Schema::dropIfExists('meeting_rooms');
        Schema::dropIfExists('resources');
        Schema::dropIfExists('resource_groups');
    }
};
