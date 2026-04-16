<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['project_id', 'parent_id', 'name', 'description', 'prefix', 'color', 'icon', 'sort_order', 'created_by', 'updated_by'])]
class RequirementGroup extends Model
{
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(RequirementGroup::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(RequirementGroup::class, 'parent_id');
    }

    public function requirements(): HasMany
    {
        return $this->hasMany(Requirement::class, 'group_id');
    }
}
