<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['document_id', 'requirement_id', 'analysis_id', 'log_type', 'model_used', 'tokens_input', 'tokens_output', 'duration_ms', 'status', 'error_message', 'mongo_detail_id', 'created_by'])]
class AiGenerationLog extends Model
{
    const UPDATED_AT = null;

    public function document(): BelongsTo
    {
        return $this->belongsTo(Document::class);
    }

    public function requirement(): BelongsTo
    {
        return $this->belongsTo(Requirement::class);
    }

    public function analysis(): BelongsTo
    {
        return $this->belongsTo(RequirementAnalysis::class, 'analysis_id');
    }
}
