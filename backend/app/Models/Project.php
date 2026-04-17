<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Project extends Model
{
    protected $fillable = [
        'code',
        'name',
        'description',
        'status',
        'roles',
        'common_info',
    ];

    protected function casts(): array
    {
        return [
            'roles'       => 'array',
            'common_info' => 'array',
        ];
    }

    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'project_user')
            ->withPivot('project_role');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(Document::class);
    }
}

