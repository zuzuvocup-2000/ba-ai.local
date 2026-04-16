<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['project_id', 'group_id', 'code', 'title', 'raw_content', 'tags', 'status', 'priority', 'sort_order', 'created_by', 'updated_by'])]
class Requirement extends Model
{
    protected function casts(): array
    {
        return [
            'tags' => 'array',
        ];
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function group(): BelongsTo
    {
        return $this->belongsTo(RequirementGroup::class, 'group_id');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(Document::class);
    }

    public function analyses(): HasMany
    {
        return $this->hasMany(RequirementAnalysis::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
