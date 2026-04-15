<?php

namespace App\Services;

use App\Helpers\UserDataHelper;
use App\Repositories\ApiTokenRepository;
use App\Repositories\UserRepository;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthService
{
    public function __construct(
        private readonly UserRepository $userRepository,
        private readonly ApiTokenRepository $apiTokenRepository,
    ) {
    }

    public function login(string $email, string $password): ?array
    {
        $user = $this->userRepository->findByEmail($email);

        if (! $user || ! Hash::check($password, $user->password)) {
            return null;
        }

        $plainToken = Str::random(60);
        $this->apiTokenRepository->createForUser($user, $plainToken, $user->permissionSlugs());

        return [
            'token' => $plainToken,
            'user' => UserDataHelper::toArray($user),
        ];
    }

    public function me(object $user): array
    {
        $user->load('roles.permissions');

        return UserDataHelper::toArray($user);
    }

    public function logout(?string $plainToken): void
    {
        if (! $plainToken) {
            return;
        }

        $this->apiTokenRepository->deleteByPlainToken($plainToken);
    }
}

