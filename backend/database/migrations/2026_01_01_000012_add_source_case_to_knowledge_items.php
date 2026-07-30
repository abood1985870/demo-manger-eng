<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('knowledge_items', function (Blueprint $table) {
            $table->uuid('source_case_id')->nullable()->after('knowledge_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('knowledge_items', function (Blueprint $table) {
            $table->dropColumn('source_case_id');
        });
    }
};
