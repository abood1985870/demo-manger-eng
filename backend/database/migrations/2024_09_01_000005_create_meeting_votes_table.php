<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('meeting_votes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('meeting_id')->constrained('meetings')->onDelete('cascade');
            $table->uuid('agenda_item_id')->nullable()->constrained('meeting_agenda_items')->onDelete('set null');
            
            $table->string('title');
            $table->text('description')->nullable();
            
            $table->string('type'); // yes_no_abstain, single_choice, multiple_choice
            $table->boolean('is_secret_ballot')->default(false);
            
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            
            $table->string('status')->default('Draft'); // Open, Closed
            
            $table->timestamps();
        });

        Schema::create('meeting_vote_options', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('vote_id')->constrained('meeting_votes')->onDelete('cascade');
            
            $table->string('option_text');
            $table->integer('order')->default(1);
            
            $table->timestamps();
        });

        Schema::create('meeting_vote_responses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('vote_id')->constrained('meeting_votes')->onDelete('cascade');
            $table->uuid('vote_option_id')->nullable()->constrained('meeting_vote_options')->onDelete('cascade'); // Null if abstain
            
            // For Secret Ballot, we only store user_id to prevent double voting.
            // In extremely high-compliance scenarios, the link between user_id and option_id is hashed or split.
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            
            $table->boolean('is_abstain')->default(false);
            
            $table->timestamps();
            
            $table->unique(['vote_id', 'user_id']); // Prevent double voting
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('meeting_vote_responses');
        Schema::dropIfExists('meeting_vote_options');
        Schema::dropIfExists('meeting_votes');
    }
};
