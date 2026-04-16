<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_generation_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('requirement_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('analysis_id')->nullable()->constrained('requirement_analyses')->nullOnDelete();
            $table->string('log_type', 30);
            $table->string('model_used', 100)->nullable();
            $table->integer('tokens_input')->nullable();
            $table->integer('tokens_output')->nullable();
            $table->integer('duration_ms')->nullable();
            $table->string('status', 20)->nullable();
            $table->string('error_message', 500)->nullable();
            $table->string('mongo_detail_id', 24)->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_generation_logs');
    }
};
