<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['requirement_id', 'document_type', 'actors', 'preconditions', 'main_flow', 'alternative_flows', 'exception_flows', 'business_rules', 'data_fields', 'non_functional', 'notes', 'extended_data', 'prefilled_by_ai', 'prefilled_at', 'created_by', 'updated_by'])]
class RequirementAnalysis extends Model
{
    protected function casts(): array
    {
        return [
            'actors'            => 'array',
            'main_flow'         => 'array',
            'alternative_flows' => 'array',
            'exception_flows'   => 'array',
            'business_rules'    => 'array',
            'data_fields'       => 'array',
            'extended_data'     => 'array',
            'prefilled_by_ai'   => 'boolean',
            'prefilled_at'      => 'datetime',
        ];
    }

    public function requirement(): BelongsTo
    {
        return $this->belongsTo(Requirement::class);
    }
}
