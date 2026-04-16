<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('requirement_analyses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('requirement_id')->constrained()->cascadeOnDelete();
            $table->string('document_type', 50);
            $table->json('actors')->nullable();
            $table->text('preconditions')->nullable();
            $table->json('main_flow')->nullable();
            $table->json('alternative_flows')->nullable();
            $table->json('exception_flows')->nullable();
            $table->json('business_rules')->nullable();
            $table->json('data_fields')->nullable();
            $table->text('non_functional')->nullable();
            $table->text('notes')->nullable();
            $table->json('extended_data')->nullable();
            $table->boolean('prefilled_by_ai')->default(false);
            $table->timestamp('prefilled_at')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['requirement_id', 'document_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('requirement_analyses');
    }
};
