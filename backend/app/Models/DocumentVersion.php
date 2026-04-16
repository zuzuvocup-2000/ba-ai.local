<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['document_id', 'version_number', 'mongo_content_id', 'change_summary', 'change_type', 'proposal_id', 'created_by'])]
class DocumentVersion extends Model
{
    const UPDATED_AT = null;

    public function document(): BelongsTo
    {
        return $this->belongsTo(Document::class);
    }

    public function proposal(): BelongsTo
    {
        return $this->belongsTo(DocumentChangeProposal::class, 'proposal_id');
    }
}
