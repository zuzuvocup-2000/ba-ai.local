<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('document_checklists', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_id')->constrained()->cascadeOnDelete();
            $table->string('generated_by', 20)->default('ai');
            $table->string('status', 20)->default('active');
            $table->integer('total_items')->default(0);
            $table->integer('verified_items')->default(0);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['document_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_checklists');
    }
};
