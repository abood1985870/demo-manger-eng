<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('re_properties', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('type'); // e.g., Master Plan, Building, Villa
            $table->string('location')->nullable();
            $table->decimal('total_area', 10, 2)->nullable();
            $table->string('status')->default('planning'); // planning, under_construction, completed
            $table->foreignId('manager_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('wafi_license_number')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('re_properties');
    }
};
