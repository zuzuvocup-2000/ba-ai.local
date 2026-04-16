<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('requirements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->foreignId('group_id')->nullable()->constrained('requirement_groups')->nullOnDelete();
            $table->string('code', 50)->nullable();
            $table->string('title', 500);
            $table->text('raw_content');
            $table->json('tags')->nullable();
            $table->string('status', 30)->default('draft');
            $table->string('priority', 20)->default('medium');
            $table->integer('sort_order')->default(0);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('requirements');
    }
};
