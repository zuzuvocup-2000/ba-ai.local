<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('document_change_proposals', function (Blueprint $table) {
            $table->longText('proposed_content')->nullable()->after('mongo_content_id');
            $table->index('conversation_id');
        });
    }

    public function down(): void
    {
        Schema::table('document_change_proposals', function (Blueprint $table) {
            $table->dropIndex(['conversation_id']);
            $table->dropColumn('proposed_content');
        });
    }
};
