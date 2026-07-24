<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('custom_fields', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('project_id')->nullable()->constrained('projects')->onDelete('cascade'); // Global if null
            $table->string('name');
            $table->string('type'); // text, number, date, dropdown, boolean
            $table->json('options')->nullable(); // For dropdowns
            $table->boolean('is_required')->default(false);
            $table->timestamps();
        });

        Schema::create('task_custom_fields', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('task_id')->constrained('tasks')->onDelete('cascade');
            $table->uuid('custom_field_id')->constrained('custom_fields')->onDelete('cascade');
            $table->text('value')->nullable();
            $table->timestamps();
            
            $table->unique(['task_id', 'custom_field_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('task_custom_fields');
        Schema::dropIfExists('custom_fields');
    }
};
