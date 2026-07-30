<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('re_contracts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('unit_id')->constrained('re_units')->restrictOnDelete();
            $table->foreignId('customer_id')->constrained('users')->restrictOnDelete();
            $table->decimal('total_amount', 12, 2);
            $table->decimal('deposit_amount', 12, 2)->default(0);
            $table->string('status')->default('draft'); // draft, signed, cancelled
            $table->date('contract_date');
            $table->string('wafi_escrow_account')->nullable(); // linked Wafi Escrow
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('re_contracts');
    }
};
