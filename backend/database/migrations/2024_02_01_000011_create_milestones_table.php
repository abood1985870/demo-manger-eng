<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('milestones', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('phase_id')->constrained('phases')->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->date('due_date')->nullable();
            $table->uuid('status_id')->nullable()->constrained('project_statuses')->onDelete('set null');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('milestones');
    }
};
