<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('re_units', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_id')->constrained('re_properties')->cascadeOnDelete();
            $table->string('unit_number');
            $table->string('type'); // apartment, office, land
            $table->decimal('area', 8, 2);
            $table->decimal('price', 12, 2);
            $table->string('status')->default('available'); // available, reserved, sold
            
            // Feature 1: Interactive Masterplan
            $table->text('svg_coordinates')->nullable(); // JSON or SVG Path Data
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('re_units');
    }
};
