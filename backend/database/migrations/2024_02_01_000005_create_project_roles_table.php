<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('project_roles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name'); // Project Manager, Developer, Designer, Viewer
            $table->text('permissions')->nullable(); // JSON permissions for specific project roles
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_roles');
    }
};
