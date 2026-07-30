<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('re_brokers', function (Blueprint $table) {
            $table->id();
            $table->string('agency_name');
            $table->string('license_number')->nullable();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->decimal('commission_rate', 5, 2)->default(2.50);
            $table->timestamps();
        });

        Schema::create('re_broker_leads', function (Blueprint $table) {
            $table->id();
            $table->foreignId('broker_id')->constrained('re_brokers')->cascadeOnDelete();
            $table->string('client_name');
            $table->string('client_phone');
            $table->string('status')->default('registered'); // registered, contacted, qualified, converted, lost
            $table->timestamp('valid_until')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('re_broker_leads');
        Schema::dropIfExists('re_brokers');
    }
};
