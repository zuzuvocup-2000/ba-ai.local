<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            // Drop existing FK + make requirement_id nullable (để hỗ trợ tài liệu cấp dự án)
            $table->dropForeign(['requirement_id']);
            $table->unsignedBigInteger('requirement_id')->nullable()->change();
            $table->foreign('requirement_id')->references('id')->on('requirements')->cascadeOnDelete();

            // Thêm project_id cho tài liệu cấp dự án (common doc)
            $table->foreignId('project_id')->nullable()->after('id')->constrained()->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->dropForeign(['project_id']);
            $table->dropColumn('project_id');

            $table->dropForeign(['requirement_id']);
            $table->unsignedBigInteger('requirement_id')->nullable(false)->change();
            $table->foreign('requirement_id')->references('id')->on('requirements')->cascadeOnDelete();
        });
    }
};
