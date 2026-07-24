<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('meeting_minutes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('meeting_id')->constrained('meetings')->onDelete('cascade');
            
            $table->string('status')->default('Draft'); // Under Review, Approved, Published
            
            // Relies on Document management table for actual file attachments
            // But we store the rich text content versions here
            $table->longText('content_en')->nullable(); // Rich Text / Markdown
            $table->longText('content_ar')->nullable();
            
            $table->timestamps();
        });

        Schema::create('meeting_minute_versions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('minute_id')->constrained('meeting_minutes')->onDelete('cascade');
            
            $table->string('version_number');
            $table->longText('content_en')->nullable();
            $table->longText('content_ar')->nullable();
            
            $table->string('amendment_reason')->nullable();
            $table->foreignId('created_by')->constrained('users');
            
            $table->timestamps();
        });

        Schema::create('meeting_decisions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('decision_number')->unique(); // e.g. DEC-2026-000001
            
            $table->uuid('meeting_id')->constrained('meetings')->onDelete('cascade');
            $table->uuid('agenda_item_id')->nullable()->constrained('meeting_agenda_items')->onDelete('set null');
            
            $table->string('title_en');
            $table->string('title_ar')->nullable();
            $table->text('decision_text');
            
            $table->string('status')->default('Approved'); // Pending, Approved, Superseded, Implemented
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('meeting_decisions');
        Schema::dropIfExists('meeting_minute_versions');
        Schema::dropIfExists('meeting_minutes');
    }
};
