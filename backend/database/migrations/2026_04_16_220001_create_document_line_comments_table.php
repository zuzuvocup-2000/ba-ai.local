<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('document_line_comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_id')->constrained('documents')->cascadeOnDelete();
            $table->unsignedSmallInteger('line_number'); // line in the markdown source (1-indexed)
            $table->string('line_snippet', 300)->nullable(); // first ~200 chars of the block for reference
            $table->text('content');
            $table->string('comment_type', 20)->default('issue'); // issue | note | question
            $table->foreignId('author_id')->constrained('users')->cascadeOnDelete();
            $table->boolean('is_resolved')->default(false);
            $table->foreignId('resolved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();

            $table->index(['document_id', 'is_resolved']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_line_comments');
    }
};
