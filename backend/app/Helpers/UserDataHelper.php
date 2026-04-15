<?php

namespace App\Helpers;

use App\Models\Role;
use App\Models\User;

class UserDataHelper
{
    public static function toArray(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'roles' => $user->roles
                ->map(fn (Role $role) => [
                    'id' => $role->id,
                    'name' => $role->name,
                    'slug' => $role->slug,
                ])
                ->values(),
            'permissions' => $user->permissionSlugs(),
            'created_at' => $user->created_at,
        ];
    }
}

