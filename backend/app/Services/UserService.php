<?php

namespace App\Services;

use App\Helpers\UserDataHelper;
use App\Models\User;
use App\Repositories\UserRepository;
use Illuminate\Support\Facades\Hash;

class UserService
{
    public function __construct(private readonly UserRepository $userRepository)
    {
    }

    public function list(): array
    {
        return $this->userRepository->listWithRelations()
            ->map(fn (User $user) => UserDataHelper::toArray($user))
            ->values()
            ->all();
    }

    public function create(array $payload): User
    {
        $user = $this->userRepository->create([
            'name' => $payload['name'],
            'email' => $payload['email'],
            'password' => Hash::make($payload['password']),
        ]);

        $user->roles()->sync($payload['role_ids']);
        $user->load('roles.permissions');

        return $user;
    }

    public function update(User $user, array $payload): User
    {
        $data = [
            'name' => $payload['name'],
            'email' => $payload['email'],
        ];

        if (! empty($payload['password'])) {
            $data['password'] = Hash::make($payload['password']);
        }

        $this->userRepository->update($user, $data);
        $user->roles()->sync($payload['role_ids']);
        $user->load('roles.permissions');

        return $user;
    }

    public function delete(User $targetUser, User $actor): bool
    {
        if ($targetUser->id === $actor->id) {
            return false;
        }

        return $this->userRepository->delete($targetUser);
    }
}

