<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Project extends Model
{
    protected $fillable = [
        'code',
        'name',
        'description',
        'status',
    ];

    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'project_user');
    }
}

