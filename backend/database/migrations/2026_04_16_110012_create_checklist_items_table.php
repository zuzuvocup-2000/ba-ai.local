<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('checklist_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('checklist_id')->constrained('document_checklists')->cascadeOnDelete();
            $table->foreignId('document_id')->constrained()->cascadeOnDelete();
            $table->string('code', 30);
            $table->string('category', 20);
            $table->string('title', 500);
            $table->text('description')->nullable();
            $table->string('doc_section_ref', 200)->nullable();
            $table->string('dev_status', 20)->default('not_started');
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->json('dev_proof')->nullable();
            $table->timestamp('dev_submitted_at')->nullable();
            $table->string('review_status', 20)->default('pending');
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->integer('sort_order')->default(0);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('checklist_items');
    }
};
