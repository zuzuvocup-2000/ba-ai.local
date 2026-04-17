<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            // Danh sách quyền/vai trò trong dự án: [{ name, description }]
            $table->json('roles')->nullable()->after('description');
            // Thông tin chung của dự án: tech_stack, database, naming, common_rules, ...
            $table->json('common_info')->nullable()->after('roles');
        });
    }

    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn(['roles', 'common_info']);
        });
    }
};
