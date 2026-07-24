<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('message_reactions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('message_id')->constrained('messages')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('emoji'); // e.g. 👍, 🎉
            $table->timestamps();
            
            $table->unique(['message_id', 'user_id', 'emoji']);
        });

        Schema::create('message_mentions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('message_id')->constrained('messages')->onDelete('cascade');
            // Can mention a user, team, department, or project. Only user_id is foreign key for now, others can be morphs or specific columns
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('cascade');
            $table->string('mention_type')->default('user'); // user, team, department, project, everyone
            $table->string('mention_id')->nullable(); // UUID for team/project if not a user
            $table->timestamps();
        });

        Schema::create('message_reads', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('message_id')->constrained('messages')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->timestamp('read_at')->useCurrent();
            $table->timestamps();
            
            $table->unique(['message_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('message_reads');
        Schema::dropIfExists('message_mentions');
        Schema::dropIfExists('message_reactions');
    }
};
