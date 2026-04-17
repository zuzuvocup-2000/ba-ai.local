<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ai_generation_logs', function (Blueprint $table) {
            // uniqid('ai_', true) sinh chuỗi ~26 ký tự, varchar(24) bị tràn
            $table->string('mongo_detail_id', 64)->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('ai_generation_logs', function (Blueprint $table) {
            $table->string('mongo_detail_id', 24)->nullable()->change();
        });
    }
};
