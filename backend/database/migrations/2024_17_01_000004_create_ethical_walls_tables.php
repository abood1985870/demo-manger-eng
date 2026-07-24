<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Ethical Walls (Information Barriers)
        Schema::create('ethical_walls', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            $table->string('wall_number')->unique();
            $table->string('name');
            
            $table->uuid('legal_matter_id')->nullable()->constrained('legal_matters')->onDelete('cascade');
            $table->uuid('legal_client_id')->nullable()->constrained('legal_clients')->onDelete('cascade');
            
            $table->text('reason');
            $table->string('status'); // active, suspended, closed
            
            $table->timestamp('effective_date')->nullable();
            $table->timestamp('expiration_date')->nullable();
            
            $table->timestamps();
        });

        // 2. Ethical Wall Members (Explicit Access Control)
        Schema::create('ethical_wall_members', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('ethical_wall_id')->constrained('ethical_walls')->onDelete('cascade');
            
            $table->foreignId('user_id')->constrained('users');
            
            $table->string('access_type'); // included (allowed to see), excluded (strictly blocked)
            
            $table->timestamps();
            
            $table->unique(['ethical_wall_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ethical_wall_members');
        Schema::dropIfExists('ethical_walls');
    }
};
