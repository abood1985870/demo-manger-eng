<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('task_watchers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('task_id')->constrained('tasks')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            $table->unique(['task_id', 'user_id']);
        });

        Schema::create('task_followers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('task_id')->constrained('tasks')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            $table->unique(['task_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('task_followers');
        Schema::dropIfExists('task_watchers');
    }
};
