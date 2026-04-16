<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['document_id', 'generated_by', 'status', 'total_items', 'verified_items', 'created_by'])]
class DocumentChecklist extends Model
{
    protected function casts(): array
    {
        return [
            'total_items'    => 'integer',
            'verified_items' => 'integer',
        ];
    }

    public function document(): BelongsTo
    {
        return $this->belongsTo(Document::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(ChecklistItem::class, 'checklist_id');
    }
}
