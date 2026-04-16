<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['checklist_id', 'document_id', 'code', 'category', 'title', 'description', 'doc_section_ref', 'dev_status', 'assigned_to', 'dev_proof', 'dev_submitted_at', 'review_status', 'reviewed_by', 'reviewed_at', 'sort_order', 'created_by'])]
class ChecklistItem extends Model
{
    protected function casts(): array
    {
        return [
            'dev_proof'       => 'array',
            'dev_submitted_at' => 'datetime',
            'reviewed_at'     => 'datetime',
        ];
    }

    public function checklist(): BelongsTo
    {
        return $this->belongsTo(DocumentChecklist::class, 'checklist_id');
    }

    public function document(): BelongsTo
    {
        return $this->belongsTo(Document::class);
    }

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function reviewedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(ChecklistItemComment::class, 'item_id');
    }
}
