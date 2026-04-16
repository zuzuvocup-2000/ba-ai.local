<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['item_id', 'comment', 'type', 'created_by', 'author_id', 'author_role', 'comment_type', 'content', 'is_resolved', 'resolved_by', 'resolved_at', 'updated_by'])]
class ChecklistItemComment extends Model
{
    protected function casts(): array
    {
        return [
            'is_resolved' => 'boolean',
            'resolved_at' => 'datetime',
        ];
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(ChecklistItem::class, 'item_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function resolvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }
}
