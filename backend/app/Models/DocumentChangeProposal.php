<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['document_id', 'conversation_id', 'message_index', 'mongo_content_id', 'change_summary', 'status', 'accepted_by', 'accepted_at', 'dismissed_at', 'created_by'])]
class DocumentChangeProposal extends Model
{
    const UPDATED_AT = null;

    protected function casts(): array
    {
        return [
            'accepted_at'  => 'datetime',
            'dismissed_at' => 'datetime',
        ];
    }

    public function document(): BelongsTo
    {
        return $this->belongsTo(Document::class);
    }

    public function acceptedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'accepted_by');
    }
}
