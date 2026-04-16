<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('document_templates', function (Blueprint $table) {
            $table->id();
            $table->string('type', 50);
            $table->string('name', 200);
            $table->text('description')->nullable();
            $table->longText('content');
            $table->json('placeholders')->nullable();
            $table->boolean('is_default')->default(false);
            $table->boolean('is_global')->default(true);
            $table->foreignId('project_id')->nullable()->constrained()->nullOnDelete();
            $table->integer('version')->default(1);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_templates');
    }
};
