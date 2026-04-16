<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable(['requirement_id', 'template_id', 'type', 'title', 'content', 'generation_log_id', 'status', 'current_version', 'approved_by', 'approved_at', 'created_by', 'updated_by'])]
class Document extends Model
{
    protected function casts(): array
    {
        return [
            'current_version' => 'integer',
            'approved_at'     => 'datetime',
        ];
    }

    public function requirement(): BelongsTo
    {
        return $this->belongsTo(Requirement::class);
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(DocumentTemplate::class, 'template_id');
    }

    public function versions(): HasMany
    {
        return $this->hasMany(DocumentVersion::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(DocumentReview::class);
    }

    public function checklist(): HasOne
    {
        return $this->hasOne(DocumentChecklist::class);
    }

    public function generationLog(): BelongsTo
    {
        return $this->belongsTo(AiGenerationLog::class, 'generation_log_id');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
