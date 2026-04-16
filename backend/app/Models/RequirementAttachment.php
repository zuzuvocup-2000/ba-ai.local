<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['requirement_id', 'original_name', 'stored_name', 'path', 'mime_type', 'size', 'created_by'])]
class RequirementAttachment extends Model
{
    protected function casts(): array
    {
        return [
            'size' => 'integer',
        ];
    }

    public function requirement(): BelongsTo
    {
        return $this->belongsTo(Requirement::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
