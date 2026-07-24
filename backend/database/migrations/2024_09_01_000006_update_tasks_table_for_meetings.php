<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Extending the existing 'tasks' table to support Meeting Action Items seamlessly
        Schema::table('tasks', function (Blueprint $table) {
            $table->uuid('meeting_id')->nullable()->constrained('meetings')->onDelete('set null');
            $table->uuid('agenda_item_id')->nullable()->constrained('meeting_agenda_items')->onDelete('set null');
            $table->uuid('decision_id')->nullable()->constrained('meeting_decisions')->onDelete('set null');
            
            $table->index('meeting_id');
        });
    }

    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropForeign(['meeting_id']);
            $table->dropForeign(['agenda_item_id']);
            $table->dropForeign(['decision_id']);
            $table->dropColumn(['meeting_id', 'agenda_item_id', 'decision_id']);
        });
    }
};
