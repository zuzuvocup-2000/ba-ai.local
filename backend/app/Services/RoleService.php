<?php

namespace App\Services;

use App\Models\Permission;
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

    public function permissionCatalog(): array
    {
        return Permission::query()
            ->orderBy('slug')
            ->get()
            ->map(fn (Permission $permission) => [
                'id' => $permission->id,
                'name' => $permission->name,
                'slug' => $permission->slug,
            ])
            ->values()
            ->all();
    }

    public function updatePermissions(Role $role, array $permissionSlugs): array
    {
        $permissionIds = Permission::query()
            ->whereIn('slug', $permissionSlugs)
            ->pluck('id')
            ->all();

        $role->permissions()->sync($permissionIds);
        $role->load('permissions');

        return [
            'id' => $role->id,
            'name' => $role->name,
            'slug' => $role->slug,
            'permissions' => $role->permissions->pluck('slug')->values(),
        ];
    }
}

