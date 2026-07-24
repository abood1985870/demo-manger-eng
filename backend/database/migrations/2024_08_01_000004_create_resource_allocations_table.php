<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Centralized table for all bookings/allocations for unified conflict detection
        Schema::create('resource_allocations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('resource_id')->constrained('resources')->onDelete('cascade');
            
            // Link to the reason for allocation (Event, Project, Task)
            $table->string('allocatable_type'); 
            $table->string('allocatable_id');
            
            $table->timestamp('start_datetime')->index();
            $table->timestamp('end_datetime')->index();
            
            $table->decimal('allocation_percentage', 5, 2)->default(100.00); // For workload balancing
            $table->string('status'); // confirmed, tentative, cancelled
            
            $table->foreignId('booked_by')->constrained('users')->onDelete('cascade');
            
            $table->timestamps();
            
            // Optimize overlap checks
            $table->index(['resource_id', 'start_datetime', 'end_datetime']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('resource_allocations');
    }
};
