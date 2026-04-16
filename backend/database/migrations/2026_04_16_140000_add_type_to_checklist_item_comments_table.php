<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('checklist_item_comments', function (Blueprint $table) {
            // New simplified columns used by ChecklistService
            $table->text('comment')->nullable()->after('item_id');
            $table->string('type', 30)->nullable()->after('comment');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete()->after('type');
        });
    }

    public function down(): void
    {
        Schema::table('checklist_item_comments', function (Blueprint $table) {
            $table->dropConstrainedForeignId('created_by');
            $table->dropColumn(['comment', 'type']);
        });
    }
};
