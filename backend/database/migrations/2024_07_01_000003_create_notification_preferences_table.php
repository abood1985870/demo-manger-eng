<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notification_preferences', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            
            $table->boolean('enable_notifications')->default(true);
            $table->json('preferred_channels'); // ['in_app', 'email']
            
            $table->boolean('digest_mode')->default(false);
            $table->string('language')->default('en');
            
            // Quiet Hours
            $table->time('quiet_hours_start')->nullable();
            $table->time('quiet_hours_end')->nullable();
            $table->string('timezone')->default('UTC');

            // Muted contexts
            $table->json('muted_projects')->nullable();
            $table->json('muted_users')->nullable();
            
            $table->timestamps();
            
            $table->unique('user_id');
        });

        Schema::create('subscriptions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('subscribable_type'); // Project, Task
            $table->string('subscribable_id');
            $table->timestamps();
            
            $table->unique(['user_id', 'subscribable_id', 'subscribable_type'], 'sub_unique_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
        Schema::dropIfExists('notification_preferences');
    }
};
