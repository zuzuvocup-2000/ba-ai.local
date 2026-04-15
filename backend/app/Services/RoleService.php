<?php

namespace App\Services;

use App\Models\Role;
use App\Repositories\RoleRepository;

class RoleService
{
    public function __construct(private readonly RoleRepository $roleRepository)
    {
    }

    public function list(): array
    {
        return $this->roleRepository->listWithPermissions()
            ->map(fn (Role $role) => [
                'id' => $role->id,
                'name' => $role->name,
                'slug' => $role->slug,
                'permissions' => $role->permissions->pluck('slug')->values(),
            ])
            ->values()
            ->all();
    }
}

