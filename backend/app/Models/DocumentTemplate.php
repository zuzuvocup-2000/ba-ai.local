<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['type', 'name', 'description', 'content', 'placeholders', 'is_default', 'is_global', 'project_id', 'version', 'created_by', 'updated_by'])]
class DocumentTemplate extends Model
{
    protected function casts(): array
    {
        return [
            'placeholders' => 'array',
            'is_default'   => 'boolean',
            'is_global'    => 'boolean',
        ];
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }
}
