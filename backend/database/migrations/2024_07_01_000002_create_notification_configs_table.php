<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notification_templates', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name')->unique();
            $table->string('event_name')->nullable(); // Can be linked to a specific event
            
            // Multi-language support
            $table->json('subject'); // {"en": "Task {{TaskName}} Created", "ar": "تم إنشاء المهمة"}
            $table->json('body'); // Markdown/Rich Text support
            
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('notification_rules', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('event_name'); // e.g. TaskStatusChanged
            
            $table->json('conditions')->nullable(); // IF Task Status = Completed
            $table->json('actions'); // THEN Notify Project Manager, etc.
            
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_rules');
        Schema::dropIfExists('notification_templates');
    }
};
