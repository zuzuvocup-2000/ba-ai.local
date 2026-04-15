<?php

namespace App\Repositories;

use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class UserRepository
{
    public function findByEmail(string $email): ?User
    {
        return User::query()
            ->with('roles.permissions')
            ->where('email', $email)
            ->first();
    }

    public function listWithRelations(): Collection
    {
        return User::query()
            ->with('roles.permissions')
            ->orderBy('id')
            ->get();
    }

    public function create(array $payload): User
    {
        return User::query()->create($payload);
    }

    public function update(User $user, array $payload): bool
    {
        return $user->update($payload);
    }

    public function delete(User $user): bool
    {
        return (bool) $user->delete();
    }
}

