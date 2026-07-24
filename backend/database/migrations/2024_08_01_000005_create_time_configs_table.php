<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('working_hours', function (Blueprint $table) {
            $table->uuid('id')->primary();
            // Polymorphic scope (Company, Department, Team, User)
            $table->string('scope_type')->default('Company'); 
            $table->string('scope_id')->nullable(); 
            
            $table->integer('day_of_week'); // 0=Sunday, 6=Saturday
            $table->time('start_time');
            $table->time('end_time');
            
            $table->string('timezone')->default('UTC');
            $table->timestamps();
        });

        Schema::create('holidays', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('type'); // public, company
            $table->date('start_date');
            $table->date('end_date');
            $table->string('country_code')->nullable(); // For multi-national setups
            $table->timestamps();
        });

        Schema::create('leave_periods', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            
            $table->string('leave_type'); // annual, sick, emergency
            $table->timestamp('start_datetime');
            $table->timestamp('end_datetime');
            $table->string('status'); // approved, pending, rejected
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('leave_periods');
        Schema::dropIfExists('holidays');
        Schema::dropIfExists('working_hours');
    }
};
