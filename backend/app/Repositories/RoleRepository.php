<?php

namespace App\Repositories;

use App\Models\Role;
use Illuminate\Database\Eloquent\Collection;

class RoleRepository
{
    public function listWithPermissions(): Collection
    {
        return Role::query()
            ->with('permissions')
            ->orderBy('id')
            ->get();
    }

    public function findWithPermissions(int $roleId): ?Role
    {
        return Role::query()
            ->with('permissions')
            ->find($roleId);
    }
}

