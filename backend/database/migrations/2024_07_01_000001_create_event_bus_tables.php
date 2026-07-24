<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name')->unique(); // e.g. TaskCreated, ProjectCompleted
            $table->string('module'); // Task, Project, Document, Auth
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('event_subscribers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('event_id')->constrained('events')->onDelete('cascade');
            $table->string('subscriber_type'); // User, Role, Department, Webhook
            $table->string('subscriber_id'); 
            $table->timestamps();
        });

        Schema::create('event_handlers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('event_id')->constrained('events')->onDelete('cascade');
            $table->string('handler_class'); // The class that processes the event (e.g. NotifyWatchersHandler)
            $table->integer('priority')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_handlers');
        Schema::dropIfExists('event_subscribers');
        Schema::dropIfExists('events');
    }
};
