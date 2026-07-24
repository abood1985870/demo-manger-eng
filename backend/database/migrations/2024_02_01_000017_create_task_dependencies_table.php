<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('task_dependencies', function (Blueprint $table) {
            $table->id();
            $table->uuid('task_id')->constrained('tasks')->onDelete('cascade');
            $table->uuid('depends_on_task_id')->constrained('tasks')->onDelete('cascade');
            $table->string('type')->default('finish_to_start'); // finish_to_start, start_to_start, etc.
            $table->timestamps();
            
            $table->unique(['task_id', 'depends_on_task_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('task_dependencies');
    }
};
